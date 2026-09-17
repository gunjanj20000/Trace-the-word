const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, 'screenshots', 'pwa');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function findButtonByText(page, text) {
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const content = await page.evaluate((el) => el.textContent, btn);
    if (content && content.includes(text)) {
      return btn;
    }
  }
  return null;
}

// Helper to unlock parent gate
async function unlockParentGate(page) {
  await new Promise((r) => setTimeout(r, 400));
  const gateCoords = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const holdBtn = buttons.find((b) => b.textContent && b.textContent.includes('HOLD'));
    if (holdBtn) {
      const rect = holdBtn.getBoundingClientRect();
      return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2, type: 'hold' };
    }
    return null;
  });

  if (gateCoords && gateCoords.type === 'hold') {
    await page.mouse.move(gateCoords.x, gateCoords.y);
    await page.mouse.down();
    await new Promise((r) => setTimeout(r, 3300));
    await page.mouse.up();
    await new Promise((r) => setTimeout(r, 600));
  }
}

async function runPwaTest() {
  console.log('📱 Verifying PWA assets and Data & Backup Update button...');

  // 1. Check local files
  const publicDir = path.join(__dirname, 'public');
  const requiredFiles = [
    'icon.svg',
    'icon-192.png',
    'icon-512.png',
    'icon-maskable-512.png',
    'apple-touch-icon.png',
    'favicon.svg',
    'favicon.ico',
    'manifest.json',
    'sw.js',
  ];

  for (const file of requiredFiles) {
    const filePath = path.join(publicDir, file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Missing PWA asset: ${file}`);
    }
    const stat = fs.statSync(filePath);
    console.log(`✓ Verified ${file} (${stat.size} bytes)`);
  }

  // 2. Validate manifest.json
  const manifest = JSON.parse(fs.readFileSync(path.join(publicDir, 'manifest.json'), 'utf8'));
  if (!manifest.icons || manifest.icons.length < 3) {
    throw new Error('Manifest missing icon declarations');
  }
  console.log(`✓ Manifest validated: theme_color=${manifest.theme_color}, icons=${manifest.icons.length}`);

  // 3. Launch browser and verify UI
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();
  const consoleErrors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.error('Browser Error:', msg.text());
    }
  });

  try {
    await page.setViewport({ width: 1280, height: 850 });
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });

    // Open Parent Settings
    const settingsBtn = await page.$('button[aria-label="Parent Settings"]');
    if (!settingsBtn) throw new Error('Parent Settings button not found');
    await settingsBtn.click();
    await unlockParentGate(page);

    // Switch to Data & Backup Tab
    const dataTabBtn = await findButtonByText(page, 'Data & Backup');
    if (!dataTabBtn) throw new Error('Data & Backup tab button not found');
    await dataTabBtn.click();
    await new Promise((r) => setTimeout(r, 600));

    // Capture screenshot of Data & Backup tab with update button
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'data_backup_update_tab.png') });
    console.log('✓ Saved: data_backup_update_tab.png');

    // Check that Update button is present
    const updateBtn = await findButtonByText(page, 'UPDATE APP TO RECENT CODE');
    if (!updateBtn) throw new Error('Update button not found in Data & Backup tab');
    console.log('✓ Update button found');

    // Click Update button to verify trigger
    await updateBtn.click();
    await new Promise((r) => setTimeout(r, 400));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'update_in_progress.png') });
    console.log('✓ Saved: update_in_progress.png');

    console.log('\n--- Results ---');
    console.log(`Console Errors count: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.error('Errors found:', consoleErrors);
      process.exit(1);
    }
    console.log('🎉 PWA assets & update button verified successfully!');
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runPwaTest();
