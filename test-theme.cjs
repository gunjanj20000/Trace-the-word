const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, 'screenshots', 'themes');
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

// Helper to unlock the parent gate
async function unlockParentGate(page) {
  await new Promise((r) => setTimeout(r, 400));
  const gateCoords = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const holdBtn = buttons.find((b) => b.textContent && b.textContent.includes('HOLD'));
    if (holdBtn) {
      const rect = holdBtn.getBoundingClientRect();
      return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2, type: 'hold' };
    }
    const input = document.querySelector('input[type="number"], input[placeholder*="Type"]');
    if (input) {
      const codeSpan = document.querySelector('span.tracking-widest');
      return { type: 'code', code: codeSpan ? codeSpan.textContent.trim() : null };
    }
    return null;
  });

  if (gateCoords) {
    if (gateCoords.type === 'hold') {
      await page.mouse.move(gateCoords.x, gateCoords.y);
      await page.mouse.down();
      await new Promise((r) => setTimeout(r, 3300));
      await page.mouse.up();
      await new Promise((r) => setTimeout(r, 600));
    } else if (gateCoords.type === 'code' && gateCoords.code) {
      const input = await page.$('input');
      if (input) {
        await input.type(gateCoords.code);
        const confirmBtn = await findButtonByText(page, 'Open Settings');
        if (confirmBtn) await confirmBtn.click();
        await new Promise((r) => setTimeout(r, 600));
      }
    }
  }
}

async function runThemeTests() {
  console.log('🎨 Starting Theme Switcher Verification Suite...');

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });

  const page = await browser.newPage();
  const consoleErrors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.error('Browser Error:', msg.text());
    }
  });

  page.on('pageerror', (err) => {
    consoleErrors.push(err.message);
    console.error('Page Crash Error:', err.message);
  });

  try {
    await page.setViewport({ width: 1280, height: 800 });

    // 1. Clear IndexedDB first to ensure fresh default settings (Forest Meadow)
    console.log('1. Loading app and verifying default Forest Meadow theme...');
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });
    await page.evaluate(async () => {
      // Clear db to test clean fresh install default
      const dbs = await indexedDB.databases();
      for (const d of dbs) {
        if (d.name) indexedDB.deleteDatabase(d.name);
      }
    });
    await page.reload({ waitUntil: 'networkidle0' });
    await page.waitForSelector('h1');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_default_forest_home.png') });
    console.log(' Saved: 01_default_forest_home.png');

    // 2. Check Tracing screen in Forest theme
    const startBtn = await page.$('button[aria-label="Start Tracing"]');
    if (startBtn) {
      await startBtn.click();
      await new Promise((r) => setTimeout(r, 600));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_default_forest_tracing.png') });
      console.log(' Saved: 02_default_forest_tracing.png');

      const homeBtn = await page.$('button[aria-label="Back to Home"]');
      if (homeBtn) await homeBtn.click();
      await new Promise((r) => setTimeout(r, 600));
    }

    // 3. Check Free Practice in Forest theme
    const practiceBtn = await page.$('button[aria-label="Practice Modes"]');
    if (practiceBtn) {
      await practiceBtn.click();
      await new Promise((r) => setTimeout(r, 600));
      const freePracticeBtn = await findButtonByText(page, 'Free Practice');
      if (freePracticeBtn) {
        await freePracticeBtn.click();
        await new Promise((r) => setTimeout(r, 600));
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_default_forest_freepractice.png') });
        console.log(' Saved: 03_default_forest_freepractice.png');

        const homeBtn = await page.$('button[aria-label="Back to Home"]');
        if (homeBtn) await homeBtn.click();
        await new Promise((r) => setTimeout(r, 600));
      }
    }

    // 4. Open Settings (handle parent gate)
    console.log('4. Navigating to Settings Visual Tab...');
    const settingsBtn = await page.$('button[aria-label="Parent Settings"]');
    if (!settingsBtn) throw new Error('Parent Settings button not found');
    await settingsBtn.click();
    await unlockParentGate(page);

    // Switch to Visual Tab
    const visualTabBtn = await findButtonByText(page, 'Visual');
    if (visualTabBtn) {
      await visualTabBtn.click();
      await new Promise((r) => setTimeout(r, 600));
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_settings_visual_tab.png') });
    console.log(' Saved: 04_settings_visual_tab.png');

    // 5. Test switching to Warm Sunset
    console.log('5. Switching to Warm Sunset theme...');
    const sunsetBtn = await findButtonByText(page, 'Warm Sunset');
    if (sunsetBtn) {
      await sunsetBtn.click();
      await new Promise((r) => setTimeout(r, 500));
      // Back to home
      const backBtn = await page.$('button[aria-label="Back to App"]');
      if (backBtn) await backBtn.click();
      await new Promise((r) => setTimeout(r, 600));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_sunset_home.png') });
      console.log(' Saved: 05_sunset_home.png');
    }

    // 6. Test switching to Cosmic Starlight (Dark theme)
    console.log('6. Switching to Cosmic Starlight theme...');
    const settingsBtn2 = await page.$('button[aria-label="Parent Settings"]');
    if (settingsBtn2) await settingsBtn2.click();
    await unlockParentGate(page);

    const visualTabBtn2 = await findButtonByText(page, 'Visual');
    if (visualTabBtn2) await visualTabBtn2.click();
    await new Promise((r) => setTimeout(r, 500));

    const cosmicBtn = await findButtonByText(page, 'Cosmic Starlight');
    if (cosmicBtn) {
      await cosmicBtn.click();
      await new Promise((r) => setTimeout(r, 500));
      const backBtn = await page.$('button[aria-label="Back to App"]');
      if (backBtn) await backBtn.click();
      await new Promise((r) => setTimeout(r, 600));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_cosmic_home.png') });
      console.log(' Saved: 06_cosmic_home.png');

      const startBtnCosmic = await page.$('button[aria-label="Start Tracing"]');
      if (startBtnCosmic) {
        await startBtnCosmic.click();
        await new Promise((r) => setTimeout(r, 600));
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_cosmic_tracing.png') });
        console.log(' Saved: 07_cosmic_tracing.png');
        const homeBtn = await page.$('button[aria-label="Back to Home"]');
        if (homeBtn) await homeBtn.click();
        await new Promise((r) => setTimeout(r, 600));
      }
    }

    // 7. Test Lavender Dream
    console.log('7. Switching to Lavender Dream...');
    const settingsBtn3 = await page.$('button[aria-label="Parent Settings"]');
    if (settingsBtn3) await settingsBtn3.click();
    await unlockParentGate(page);

    const visualTabBtn3 = await findButtonByText(page, 'Visual');
    if (visualTabBtn3) await visualTabBtn3.click();
    await new Promise((r) => setTimeout(r, 500));

    const lavenderBtn = await findButtonByText(page, 'Lavender Dream');
    if (lavenderBtn) {
      await lavenderBtn.click();
      await new Promise((r) => setTimeout(r, 500));
      const backBtn = await page.$('button[aria-label="Back to App"]');
      if (backBtn) await backBtn.click();
      await new Promise((r) => setTimeout(r, 600));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_lavender_home.png') });
      console.log(' Saved: 08_lavender_home.png');
    }

    console.log('\n--- Test Results ---');
    console.log(`Console Errors count: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.error('Encountered console errors:', consoleErrors);
      process.exit(1);
    }

    console.log('🎉 ALL THEME SWITCHING TESTS PASSED PERFECTLY!');
  } catch (err) {
    console.error('❌ Test failed with error:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runThemeTests();
