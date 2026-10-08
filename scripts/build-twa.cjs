#!/usr/bin/env node

/**
 * build-twa.cjs
 * 
 * Automates the conversion of the Trace A Word PWA into an Android Trusted Web Activity (TWA)
 * project, APK, and AAB according to Google standard guidelines.
 * 
 * Powered by Google Chrome Labs' @bubblewrap/core.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { execSync } = require('child_process');
const { TwaGenerator, TwaManifest, ConsoleLog } = require('@bubblewrap/core');

// Parse CLI flags
const args = process.argv.slice(2);
function getArg(flag, defaultValue) {
  const index = args.indexOf(flag);
  if (index !== -1 && index + 1 < args.length) {
    return args[index + 1];
  }
  return defaultValue;
}
const shouldBuild = args.includes('--build');
const shouldOnlyGenerate = args.includes('--generate-only');

const ROOT_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const TWA_MANIFEST_PATH = path.join(ROOT_DIR, 'twa-manifest.json');

// Read twa-manifest.json if exists as base configuration
let baseConfig = {};
if (fs.existsSync(TWA_MANIFEST_PATH)) {
  try {
    baseConfig = JSON.parse(fs.readFileSync(TWA_MANIFEST_PATH, 'utf8'));
  } catch (err) {
    console.warn('⚠️ Could not parse twa-manifest.json, using defaults.');
  }
}

// Configuration with overrides
const packageId = getArg('--package-id', process.env.PACKAGE_ID || baseConfig.packageId || 'com.tracetheword.app');
const host = getArg('--host', process.env.HOST_DOMAIN || baseConfig.host || 'gunjanj20000.github.io');
const appName = getArg('--app-name', process.env.APP_NAME || baseConfig.name || 'Trace A Word - Word Tracing & Early Learning');
const launcherName = getArg('--launcher-name', process.env.LAUNCHER_NAME || baseConfig.launcherName || 'Trace Words');
const startUrl = getArg('--start-url', process.env.START_URL || baseConfig.startUrl || '/Trace-the-word/');
const themeColor = getArg('--theme-color', baseConfig.themeColor || '#059669');
const backgroundColor = getArg('--background-color', baseConfig.backgroundColor || '#064e3b');
const navigationColor = getArg('--navigation-color', baseConfig.navigationColor || '#064e3b');
const appVersionName = getArg('--version-name', process.env.VERSION_NAME || baseConfig.appVersionName || '1.0.0');
const appVersionCode = parseInt(getArg('--version-code', process.env.VERSION_CODE || baseConfig.appVersionCode || '1'), 10);
const outputDir = path.resolve(ROOT_DIR, getArg('--output-dir', 'android'));

const keystorePath = path.resolve(ROOT_DIR, getArg('--keystore', process.env.KEYSTORE_PATH || 'android.keystore'));
const keystorePass = process.env.BUBBLEWRAP_KEYSTORE_PASSWORD || process.env.KEYSTORE_PASSWORD || 'android';
const keyAlias = process.env.KEY_ALIAS || 'android';
const keyPass = process.env.BUBBLEWRAP_KEY_PASSWORD || process.env.KEY_PASSWORD || 'android';

console.log('🚀 Starting PWA to Android TWA conversion...');
console.log(`📦 Package ID: ${packageId}`);
console.log(`🌐 Host: ${host}`);
console.log(`🏷️  App Name: ${appName}`);
console.log(`🏷️  Launcher Name: ${launcherName}`);
console.log(`🔗 Start URL: ${startUrl}`);
console.log(`📂 Output Directory: ${outputDir}`);

// Step 1: Ensure signing keystore exists or create one
function ensureKeystore() {
  if (!fs.existsSync(keystorePath)) {
    console.log(`🔑 Generating release keystore at: ${keystorePath}...`);
    execSync(
      `keytool -genkeypair -v -keystore "${keystorePath}" -alias "${keyAlias}" -keyalg RSA -keysize 2048 -validity 10000 ` +
      `-storepass "${keystorePass}" -keypass "${keyPass}" ` +
      `-dname "CN=TraceTheWord, OU=PWA, O=TraceTheWord, L=Global, ST=State, C=US"`,
      { stdio: 'inherit' }
    );
    console.log('✓ Keystore created successfully.');
  } else {
    console.log(`✓ Using existing keystore at: ${keystorePath}`);
  }

  // Extract SHA-256 fingerprint for Digital Asset Links
  try {
    const certOutput = execSync(
      `keytool -list -v -keystore "${keystorePath}" -alias "${keyAlias}" -storepass "${keystorePass}"`,
      { encoding: 'utf8' }
    );
    const match = certOutput.match(/SHA256:\s*([A-Fa-f0-9:]+)/);
    if (match && match[1]) {
      const sha256 = match[1].trim();
      console.log(`\n======================================================`);
      console.log(`🔐 SHA-256 Certificate Fingerprint:`);
      console.log(`   ${sha256}`);
      console.log(`======================================================\n`);

      // Write fingerprint to file and update assetlinks.json
      fs.writeFileSync(path.join(ROOT_DIR, 'sha256-fingerprint.txt'), sha256 + '\n', 'utf8');
      
      const assetlinks = [
        {
          relation: ["delegate_permission/common.handle_all_urls"],
          target: {
            namespace: "android_app",
            package_name: packageId,
            sha256_cert_fingerprints: [sha256]
          }
        }
      ];
      const assetlinksDir = path.join(PUBLIC_DIR, '.well-known');
      if (!fs.existsSync(assetlinksDir)) {
        fs.mkdirSync(assetlinksDir, { recursive: true });
      }
      fs.writeFileSync(
        path.join(assetlinksDir, 'assetlinks.json'),
        JSON.stringify(assetlinks, null, 2) + '\n',
        'utf8'
      );
      console.log('✓ Updated public/.well-known/assetlinks.json with actual SHA-256 fingerprint.');
    }
  } catch (err) {
    console.warn('⚠️ Could not extract SHA-256 fingerprint automatically:', err.message);
  }
}

// Step 2: Spin up local static server to serve icons to Bubblewrap's generator
function serveLocalAssets() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const parsedUrl = new URL(req.url, 'http://127.0.0.1');
      let reqPath = parsedUrl.pathname;
      if (reqPath === '/') reqPath = '/index.html';
      const filePath = path.join(PUBLIC_DIR, reqPath);

      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes = {
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.svg': 'image/svg+xml',
          '.json': 'application/json',
          '.ico': 'image/x-icon',
          '.html': 'text/html'
        };
        res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
        fs.createReadStream(filePath).pipe(res);
      } else {
        res.statusCode = 404;
        res.end('Not Found');
      }
    });

    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      console.log(`📡 Local asset server listening on port ${port}`);
      resolve({ server, port });
    });

    server.on('error', reject);
  });
}

async function main() {
  ensureKeystore();

  const { server, port } = await serveLocalAssets();

  try {
    const iconUrl = `http://127.0.0.1:${port}/icon-512.png`;
    const maskableIconUrl = `http://127.0.0.1:${port}/icon-maskable-512.png`;

    console.log('⚙️  Creating TwaManifest according to Google standard guidelines...');
    const twaManifest = new TwaManifest({
      packageId,
      host,
      name: appName,
      launcherName,
      display: 'standalone',
      themeColor,
      navigationColor,
      backgroundColor,
      enableNotifications: true,
      startUrl,
      iconUrl,
      maskableIconUrl,
      appVersionName,
      appVersionCode,
      signingKey: {
        path: keystorePath,
        alias: keyAlias
      },
      splashScreenFadeOutDuration: 300,
      minSdkVersion: 21,
      orientation: 'any'
    });

    // Clean or prepare target directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log(`🛠️  Generating Android TWA project into: ${outputDir}...`);
    const generator = new TwaGenerator();
    const log = new ConsoleLog('TwaGenerator');
    await generator.createTwaProject(outputDir, twaManifest, log);
    console.log('✓ Android TWA project generated successfully!');

    // Ensure gradlew has execute permissions
    const gradlewPath = path.join(outputDir, 'gradlew');
    if (fs.existsSync(gradlewPath)) {
      fs.chmodSync(gradlewPath, '755');
    }

    // Configure signing in app/build.gradle if not already present
    const appGradlePath = path.join(outputDir, 'app', 'build.gradle');
    if (fs.existsSync(appGradlePath)) {
      let gradleContent = fs.readFileSync(appGradlePath, 'utf8');
      
      // Inject signingConfig into release buildType if missing
      if (!gradleContent.includes('signingConfigs {') && fs.existsSync(keystorePath)) {
        const signingBlock = `
    signingConfigs {
        release {
            storeFile file('${keystorePath.replace(/\\/g, '/')}')
            storePassword '${keystorePass}'
            keyAlias '${keyAlias}'
            keyPassword '${keyPass}'
        }
    }
`;
        gradleContent = gradleContent.replace('android {', `android {${signingBlock}`);
        gradleContent = gradleContent.replace(
          /buildTypes\s*\{\s*release\s*\{/g,
          `buildTypes {\n        release {\n            signingConfig signingConfigs.release`
        );
        fs.writeFileSync(appGradlePath, gradleContent, 'utf8');
        console.log('✓ Configured release signing in android/app/build.gradle');
      }
    }

    // If local ANDROID_HOME is present, create local.properties
    const androidHome = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
    if (androidHome && fs.existsSync(androidHome)) {
      fs.writeFileSync(
        path.join(outputDir, 'local.properties'),
        `sdk.dir=${androidHome.replace(/\\/g, '/')}\n`,
        'utf8'
      );
    }

    if (shouldBuild) {
      console.log('\n📦 Building Android APK & AAB with Gradle...');
      execSync('./gradlew assembleRelease bundleRelease', {
        cwd: outputDir,
        stdio: 'inherit',
        env: {
          ...process.env,
          ...(androidHome ? { ANDROID_HOME: androidHome } : {})
        }
      });
      console.log('✓ Android APK and AAB build complete!');
    } else {
      console.log('\n💡 Project generated. Run Gradle inside android/ directory to compile APK:');
      console.log('   cd android && ./gradlew assembleRelease');
    }

  } finally {
    if (typeof server.closeAllConnections === 'function') {
      server.closeAllConnections();
    }
    server.close();
  }
}

main().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('❌ Build failed:', err);
  process.exit(1);
});
