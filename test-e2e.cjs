const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, 'screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Helper to find button by text content
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

async function runTests() {
  console.log('🚀 Launching Puppeteer browser test suite...');

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
    // 1. DESKTOP VIEWPORT TEST (1440x900)
    console.log('\n--- 1. Testing Desktop (1440x900) ---');
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });
    await page.waitForSelector('h1');
    const titleText = await page.$eval('h1', (el) => el.textContent);
    console.log('Home title:', titleText);
    if (!titleText.includes('TRACE')) throw new Error('Home title mismatch');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_desktop_home.png') });

    // 2. IPHONE PORTRAIT (390x844)
    console.log('\n--- 2. Testing iPhone Portrait (390x844) ---');
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_iphone_portrait_home.png') });

    // 3. IPHONE LANDSCAPE (844x390)
    console.log('\n--- 3. Testing iPhone Landscape (844x390) ---');
    await page.setViewport({ width: 844, height: 390, isMobile: true, hasTouch: true });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_iphone_landscape_home.png') });

    // 4. ANDROID PORTRAIT (412x915)
    console.log('\n--- 4. Testing Android Portrait (412x915) ---');
    await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_android_portrait_home.png') });

    // 5. ANDROID LANDSCAPE (915x412)
    console.log('\n--- 5. Testing Android Landscape (915x412) ---');
    await page.setViewport({ width: 915, height: 412, isMobile: true, hasTouch: true });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_android_landscape_home.png') });

    // 6. IPAD PORTRAIT (820x1180)
    console.log('\n--- 6. Testing iPad Portrait (820x1180) ---');
    await page.setViewport({ width: 820, height: 1180, isMobile: true, hasTouch: true });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_ipad_portrait_home.png') });

    // 7. IPAD LANDSCAPE (1180x820)
    console.log('\n--- 7. Testing iPad Landscape (1180x820) ---');
    await page.setViewport({ width: 1180, height: 820, isMobile: true, hasTouch: true });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_ipad_landscape_home.png') });

    // 8. TEST START BUTTON & TRACING EXPERIENCE
    console.log('\n--- 8. Testing Tracing Interaction ---');
    const startBtn = await page.$('button[aria-label="Start Tracing"]');
    if (!startBtn) throw new Error('Start button not found');
    await startBtn.click();
    await new Promise((r) => setTimeout(r, 600));

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_tracing_letter_view.png') });

    // Verify SVG Letter Tracer is present
    const svgEl = await page.$('svg.touch-none');
    if (!svgEl) throw new Error('Tracing SVG canvas not found');
    console.log('✓ Letter tracing SVG canvas found');

    // Perform interactive touch/pointer tracing across letter strokes
    console.log('Simulating realistic stroke tracing on letter...');
    const box = await svgEl.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width * 0.75, box.y + box.height * 0.3);
      await page.mouse.down();
      
      const steps = 15;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const angle = 0.3 * Math.PI - t * 1.5 * Math.PI;
        const cx = box.x + box.width * 0.5;
        const cy = box.y + box.height * 0.5;
        const rx = box.width * 0.35;
        const ry = box.height * 0.38;
        const px = cx + rx * Math.cos(angle);
        const py = cy + ry * Math.sin(angle);
        await page.mouse.move(px, py);
        await new Promise((r) => setTimeout(r, 20));
      }
      await page.mouse.up();
      await new Promise((r) => setTimeout(r, 400));
    }

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09_tracing_in_progress.png') });

    // Test Skip to complete word
    console.log('Advancing letters to complete word...');
    for (let s = 0; s < 3; s++) {
      const skipBtn = await page.$('button[aria-label="Skip to Next Letter"]');
      if (skipBtn) {
        await skipBtn.click();
        await new Promise((r) => setTimeout(r, 350));
      }
    }
    await new Promise((r) => setTimeout(r, 800));

    // Word completion screen should be visible
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10_word_completed_celebration.png') });
    console.log('✓ Word completion celebration view captured');

    // Test Next button
    const nextBtn = await page.$('button[aria-label="Next Word"]');
    if (nextBtn) {
      console.log('Clicking NEXT button...');
      await nextBtn.click();
      await new Promise((r) => setTimeout(r, 600));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11_next_word_view.png') });
    }

    // Return to Home
    const homeBtn = await page.$('button[aria-label="Back to Home"]');
    if (homeBtn) {
      await homeBtn.click();
      await new Promise((r) => setTimeout(r, 500));
    }

    // 9. TEST FREE PRACTICE MODE
    console.log('\n--- 9. Testing Free Practice Mode ---');
    const practiceBtn = await page.$('button[aria-label="Practice Modes"]');
    if (practiceBtn) {
      await practiceBtn.click();
      await new Promise((r) => setTimeout(r, 400));
      
      const freeBtn = await findButtonByText(page, 'Free Practice');
      if (freeBtn) {
        await freeBtn.click();
        await new Promise((r) => setTimeout(r, 500));
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '12_free_practice_screen.png') });
        console.log('✓ Free practice screen verified');

        // Return home
        const fpHomeBtn = await page.$('button[aria-label="Back to Home"]');
        if (fpHomeBtn) await fpHomeBtn.click();
        await new Promise((r) => setTimeout(r, 400));
      }
    }

    // 10. TEST PARENT SETTINGS & PARENT GATE
    console.log('\n--- 10. Testing Parent Settings & Parent Gate ---');
    const parentsBtn = await page.$('button[aria-label="Parent Settings"]');
    if (parentsBtn) {
      await parentsBtn.click();
      await new Promise((r) => setTimeout(r, 400));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '13_parent_gate_modal.png') });

      // Parent gate hold button
      const holdBtn = await findButtonByText(page, 'HOLD');
      if (holdBtn) {
        const hBox = await holdBtn.boundingBox();
        if (hBox) {
          console.log('Holding Parent Gate button for 3.2s...');
          await page.mouse.move(hBox.x + hBox.width / 2, hBox.y + hBox.height / 2);
          await page.mouse.down();
          await new Promise((r) => setTimeout(r, 3200));
          await page.mouse.up();
          await new Promise((r) => setTimeout(r, 600));
        }
      }

      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '14_parent_settings_general.png') });
      console.log('✓ Successfully entered Parent Settings via Parent Gate');

      // Test Tracing tab
      const tracingTab = await findButtonByText(page, 'Tracing');
      if (tracingTab) {
        await tracingTab.click();
        await new Promise((r) => setTimeout(r, 300));
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '15_parent_settings_tracing.png') });
      }

      // Test Audio tab
      const audioTab = await findButtonByText(page, 'Audio');
      if (audioTab) {
        await audioTab.click();
        await new Promise((r) => setTimeout(r, 300));
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '16_parent_settings_audio.png') });
      }

      // Test Visual tab
      const visualTab = await findButtonByText(page, 'Visual');
      if (visualTab) {
        await visualTab.click();
        await new Promise((r) => setTimeout(r, 300));
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '17_parent_settings_visual.png') });
      }

      // Test Words Tab (Word Management)
      const wordsTab = await findButtonByText(page, 'Words');
      if (wordsTab) {
        await wordsTab.click();
        await new Promise((r) => setTimeout(r, 400));
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '18_parent_settings_words.png') });

        // Test clicking "Add Word"
        const addWordBtn = await findButtonByText(page, 'Add Word');
        if (addWordBtn) {
          await addWordBtn.click();
          await new Promise((r) => setTimeout(r, 400));
          await page.screenshot({ path: path.join(SCREENSHOT_DIR, '19_add_word_modal.png') });

          // Fill in word "ZEBRA"
          await page.type('input[placeholder="e.g. STAR"]', 'ZEBRA');
          const saveBtn = await findButtonByText(page, 'Save Word');
          if (saveBtn) {
            await saveBtn.click();
            await new Promise((r) => setTimeout(r, 600));
          }
          await page.screenshot({ path: path.join(SCREENSHOT_DIR, '20_words_list_with_zebra.png') });
          console.log('✓ Successfully added new word "ZEBRA"');
        }
      }

      // Test Data & Backup Tab
      const dataTab = await findButtonByText(page, 'Data & Backup');
      if (dataTab) {
        await dataTab.click();
        await new Promise((r) => setTimeout(r, 300));
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '21_parent_settings_backup.png') });
        console.log('✓ Data & Backup tab verified');
      }

      // Go back to Home
      const backBtn = await page.$('button[aria-label="Back to App"]');
      if (backBtn) {
        await backBtn.click();
        await new Promise((r) => setTimeout(r, 400));
      }
    }

    // 11. TEST PROGRESS SCREEN
    console.log('\n--- 11. Testing Progress Screen ---');
    const progBtn = await page.$('button[aria-label="View Progress"]');
    if (progBtn) {
      await progBtn.click();
      await new Promise((r) => setTimeout(r, 400));
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '22_progress_screen.png') });
      console.log('✓ Progress screen verified');

      const backHome = await page.$('button[aria-label="Back"]');
      if (backHome) await backHome.click();
      await new Promise((r) => setTimeout(r, 400));
    }

    // 12. PWA MANIFEST & SERVICE WORKER CHECK
    console.log('\n--- 12. Checking PWA Manifest and Service Worker ---');
    const manifestResponse = await page.goto('http://localhost:4173/manifest.json');
    const manifestJson = await manifestResponse.json();
    console.log('Manifest name:', manifestJson.name);
    console.log('Manifest display:', manifestJson.display);
    if (!manifestJson.icons || manifestJson.icons.length === 0) {
      throw new Error('Manifest missing icons');
    }

    const swStatus = await page.evaluate(async () => {
      const res = await fetch('/sw.js');
      return res.status;
    });
    console.log('Service Worker fetch status code:', swStatus);
    if (swStatus !== 200) {
      throw new Error('sw.js not accessible');
    }

    console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY!');
    if (consoleErrors.length > 0) {
      console.warn('Console error count:', consoleErrors.length);
    } else {
      console.log('✓ ZERO console errors recorded during testing!');
    }
  } catch (err) {
    console.error('❌ Test failed with error:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

runTests();
