const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: 'new',
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1024, height: 768 });
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });

  // Click start
  const startBtn = await page.$('button[aria-label="Start Tracing"]');
  await startBtn.click();
  await new Promise((r) => setTimeout(r, 600));

  // Advance all 4 letters of BALL
  for (let i = 0; i < 4; i++) {
    const skip = await page.$('button[aria-label="Skip to Next Letter"]');
    if (skip) {
      await skip.click();
      await new Promise((r) => setTimeout(r, 450));
    }
  }

  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: 'screenshots/word_completed_actual.png' });
  await browser.close();
  console.log('Saved screenshots/word_completed_actual.png');
})();
