const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const SVG_CONTENT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Background Gradient: Calming Emerald to Forest Teal -->
    <linearGradient id="iconBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="50%" stop-color="#059669"/>
      <stop offset="100%" stop-color="#047857"/>
    </linearGradient>

    <!-- Top Highlight Ray for subtle 3D glass gloss -->
    <linearGradient id="glossGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.32"/>
      <stop offset="60%" stop-color="#ffffff" stop-opacity="0.0"/>
    </linearGradient>

    <!-- Stylus / Pencil Body Gradient -->
    <linearGradient id="pencilWood" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24"/>
      <stop offset="50%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>

    <!-- Glowing Star Gradient -->
    <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#d97706"/>
    </radialGradient>

    <!-- Drop Shadow for Depth -->
    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="125%">
      <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#022c22" flood-opacity="0.35"/>
    </filter>

    <filter id="letterShadow" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#064e3b" flood-opacity="0.4"/>
    </filter>

    <filter id="sparkleGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- 1. Background Squircle with drop shadow -->
  <rect x="16" y="16" width="480" height="480" rx="116" fill="url(#iconBg)" filter="url(#cardShadow)"/>

  <!-- 2. Subtle Glass Highlight Dome -->
  <path d="M 16 132 C 16 68, 68 16, 132 16 L 380 16 C 444 16, 496 68, 496 132 L 496 240 C 350 210, 160 220, 16 260 Z" fill="url(#glossGrad)" />

  <!-- 3. Inner Border Accent -->
  <rect x="20" y="20" width="472" height="472" rx="112" fill="none" stroke="#ffffff" stroke-width="4" stroke-opacity="0.25"/>

  <!-- 4. Playful Dashed Tracing Ring (Guides child's eye to center) -->
  <circle cx="256" cy="256" r="185" fill="none" stroke="#ffffff" stroke-width="8" stroke-dasharray="16 18" stroke-linecap="round" opacity="0.3"/>

  <!-- 5. Floating Ambient Sparkles -->
  <g fill="#fde68a" opacity="0.85" filter="url(#sparkleGlow)">
    <path d="M 410 95 Q 410 115, 390 115 Q 410 115, 410 135 Q 410 115, 430 115 Q 410 115, 410 95 Z"/>
    <path d="M 95 385 Q 95 400, 80 400 Q 95 400, 95 415 Q 95 400, 110 400 Q 95 400, 95 385 Z"/>
  </g>

  <!-- 6. Big Beautiful Tracing Letter 'A' -->
  <g filter="url(#letterShadow)">
    <path d="M 256 120 L 140 375 M 256 120 L 372 375 M 180 290 L 332 290"
          fill="none"
          stroke="#ffffff"
          stroke-width="58"
          stroke-linecap="round"
          stroke-linejoin="round"/>

    <path d="M 256 120 L 140 375 M 256 120 L 372 375 M 180 290 L 332 290"
          fill="none"
          stroke="#a7f3d0"
          stroke-width="22"
          stroke-linecap="round"
          stroke-linejoin="round"/>

    <path d="M 256 120 L 140 375 M 256 120 L 372 375 M 180 290 L 332 290"
          fill="none"
          stroke="#059669"
          stroke-width="8"
          stroke-dasharray="10 14"
          stroke-linecap="round"
          stroke-linejoin="round"/>
  </g>

  <!-- 7. Active Tracing Apex Point (Glowing amber target) -->
  <g transform="translate(256, 120)">
    <circle cx="0" cy="0" r="38" fill="#f59e0b" opacity="0.3"/>
    <circle cx="0" cy="0" r="28" fill="#ffffff" stroke="#f59e0b" stroke-width="6"/>
    <circle cx="0" cy="0" r="16" fill="url(#starGlow)"/>
    <circle cx="0" cy="0" r="6" fill="#ffffff"/>
  </g>

  <!-- 8. Friendly Magic Tracing Pencil / Stylus -->
  <g transform="translate(345, 225) rotate(32)" filter="url(#letterShadow)">
    <rect x="-16" y="-80" width="32" height="90" rx="6" fill="url(#pencilWood)"/>
    <rect x="-6" y="-80" width="12" height="90" fill="#fef08a" opacity="0.4"/>
    <rect x="-16" y="-92" width="32" height="14" fill="#cbd5e1"/>
    <rect x="-16" y="-108" width="32" height="18" rx="8" fill="#f472b6"/>
    <polygon points="-16,10 16,10 0,42" fill="#fef3c7"/>
    <polygon points="-6,28 6,28 0,42" fill="#1e293b"/>
  </g>

  <!-- 9. Star Burst radiating from Pencil Tip -->
  <g transform="translate(325, 275)" filter="url(#sparkleGlow)">
    <path d="M 0,-24 Q 0,0 -24,0 Q 0,0 0,24 Q 0,0 24,0 Q 0,0 0,-24 Z" fill="#fbbf24"/>
    <circle cx="0" cy="0" r="5" fill="#ffffff"/>
  </g>
</svg>`;

// Maskable version with 15% inner safe zone padding
const SVG_MASKABLE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="maskBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981"/>
      <stop offset="50%" stop-color="#059669"/>
      <stop offset="100%" stop-color="#047857"/>
    </linearGradient>
  </defs>
  <!-- Full bleed background for any crop shape -->
  <rect width="512" height="512" fill="url(#maskBg)"/>
  
  <!-- Scaled content inside safe zone (80% scale centered) -->
  <g transform="translate(51.2, 51.2) scale(0.8)">
    ${SVG_CONTENT.replace(/<svg[^>]*>/, '').replace('</svg>', '')}
  </g>
</svg>`;

async function main() {
  console.log('✨ Generating PWA assets and icons...');

  const publicDir = path.join(__dirname, '..', 'public');
  
  // 1. Write SVG icons
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), SVG_CONTENT, 'utf8');
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), SVG_CONTENT, 'utf8');
  console.log('✓ Wrote icon.svg and favicon.svg');

  // 2. Launch Puppeteer to rasterize PNGs
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();

  // Helper to render SVG to PNG file
  async function renderPng(svg, width, height, outputPath) {
    await page.setViewport({ width, height, deviceScaleFactor: 2 });
    const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:transparent;overflow:hidden;">
      <div style="width:${width}px;height:${height}px;display:flex;align-items:center;justify-content:center;">
        ${svg.replace('width="512"', `width="${width}"`).replace('height="512"', `height="${height}"`)}
      </div>
    </body></html>`;
    await page.setContent(html);
    await page.screenshot({ path: outputPath, omitBackground: true });
    console.log(`✓ Generated ${path.basename(outputPath)} (${width}x${height})`);
  }

  await renderPng(SVG_CONTENT, 192, 192, path.join(publicDir, 'icon-192.png'));
  await renderPng(SVG_CONTENT, 512, 512, path.join(publicDir, 'icon-512.png'));
  await renderPng(SVG_MASKABLE, 512, 512, path.join(publicDir, 'icon-maskable-512.png'));
  await renderPng(SVG_CONTENT, 180, 180, path.join(publicDir, 'apple-touch-icon.png'));
  await renderPng(SVG_CONTENT, 32, 32, path.join(publicDir, 'favicon.ico'));

  await browser.close();
  console.log('🎉 All PWA icons generated successfully!');
}

main().catch(err => {
  console.error('Failed to generate icons:', err);
  process.exit(1);
});
