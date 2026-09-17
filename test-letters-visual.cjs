const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, 'screenshots', 'letters');
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

async function runVisualTest() {
  console.log('📐 Testing wider and symmetrical letters visual quality...');

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
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });

    // Open Free Practice to view each letter individually
    const practiceBtn = await page.$('button[aria-label="Practice Modes"]');
    if (practiceBtn) {
      await practiceBtn.click();
      await new Promise((r) => setTimeout(r, 500));
      const freePracticeBtn = await findButtonByText(page, 'Free Practice');
      if (freePracticeBtn) await freePracticeBtn.click();
      await new Promise((r) => setTimeout(r, 600));
    }

    const testLetters = ['A', 'B', 'C', 'D', 'M', 'O', 'S', 'T', 'W', 'Z'];

    for (const char of testLetters) {
      // Click letter in ribbon
      const btn = await findButtonByText(page, char);
      if (btn) {
        await btn.click();
        await new Promise((r) => setTimeout(r, 300));
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, `letter_${char}.png`) });
        console.log(` Saved: letter_${char}.png`);
      }
    }

    // Now test Guided Tracing for BALL (Letters B, A, L, L)
    const homeBtn = await page.$('button[aria-label="Back to Home"]');
    if (homeBtn) await homeBtn.click();
    await new Promise((r) => setTimeout(r, 600));

    const startBtn = await page.$('button[aria-label="Start Tracing"]');
    if (startBtn) {
      await startBtn.click();
      await new Promise((r) => setTimeout(r, 600));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'guided_letter_B.png') });
      console.log(' Saved: guided_letter_B.png');
    }

    console.log(`\nCompleted with ${consoleErrors.length} console errors.`);
    if (consoleErrors.length > 0) {
      console.error('Errors found:', consoleErrors);
      process.exit(1);
    }
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runVisualTest();
