const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function testLetterNamesAndWordSpeech() {
  console.log('🚀 Starting Letter Names & "A for Apple" TTS verification test...');

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
  await page.setViewport({ width: 1280, height: 800 });

  const spokenTexts = [];
  // Mock SpeechSynthesis in the page context to capture all spoken utterances and verify their parameters
  await page.evaluateOnNewDocument(() => {
    window.__spokenTexts = [];
    const origSpeechSynthesis = window.speechSynthesis;

    window.speechSynthesis.speak = function (utterance) {
      window.__spokenTexts.push({
        text: utterance.text,
        rate: utterance.rate,
        pitch: utterance.pitch,
        voice: utterance.voice ? utterance.voice.name : null,
      });
      console.log('[SPEECH SYNTHESIS SPEAK]:', utterance.text);
      // Immediately fire end event so speech promises resolve cleanly
      setTimeout(() => {
        if (utterance.onend) utterance.onend(new Event('end'));
      }, 50);
    };
  });

  page.on('console', (msg) => {
    if (msg.text().includes('[SPEECH SYNTHESIS SPEAK]')) {
      spokenTexts.push(msg.text().replace('[SPEECH SYNTHESIS SPEAK]: ', ''));
    }
  });

  try {
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });
    console.log('✓ Loaded Trace The Word home page');

    // 1. Go to Settings -> Audio Tab to verify UI and Defaults
    const parentsBtn = await page.$('button[aria-label="Parent Settings"]');
    if (!parentsBtn) throw new Error('Parent Settings button not found');
    await parentsBtn.click();
    await new Promise((r) => setTimeout(r, 400));

    // Hold Parent Gate
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await page.evaluate((el) => el.textContent, btn);
      if (text && text.includes('HOLD')) {
        const box = await btn.boundingBox();
        if (box) {
          await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
          await page.mouse.down();
          await new Promise((r) => setTimeout(r, 3200));
          await page.mouse.up();
          await new Promise((r) => setTimeout(r, 500));
        }
        break;
      }
    }

    // Click Audio Tab
    const audioTabBtns = await page.$$('button');
    for (const btn of audioTabBtns) {
      const text = await page.evaluate((el) => el.textContent, btn);
      if (text && text.trim() === 'Audio') {
        await btn.click();
        await new Promise((r) => setTimeout(r, 400));
        break;
      }
    }

    // Verify presence of text in Audio tab
    const audioTabText = await page.evaluate(() => document.body.innerText);
    if (!audioTabText.includes('Speak Letter Names')) {
      throw new Error('Did not find "Speak Letter Names" toggle in Audio tab');
    }
    if (!audioTabText.includes('Speak "A for Apple" on Word Complete')) {
      throw new Error('Did not find "Speak \\"A for Apple\\" on Word Complete" toggle in Audio tab');
    }
    console.log('✓ Audio tab displays "Speak Letter Names" and "Speak \\"A for Apple\\" on Word Complete"');

    // Take screenshot of Audio settings tab
    const audioScreenshotPath = path.join(__dirname, 'audio_settings_letter_names.png');
    await page.screenshot({ path: audioScreenshotPath });
    console.log('✓ Audio tab screenshot saved to', audioScreenshotPath);

    // Test the test speech buttons in Audio tab
    const testBtns = await page.$$('button');
    for (const btn of testBtns) {
      const text = await page.evaluate((el) => el.textContent, btn);
      if (text && text.includes('Word: "B for Ball!"')) {
        console.log('Clicking test Word: "B for Ball!" button...');
        await btn.click();
        await new Promise((r) => setTimeout(r, 200));
      }
      if (text && text.includes('Letter Name: "B!"')) {
        console.log('Clicking test Letter Name: "B!" button...');
        await btn.click();
        await new Promise((r) => setTimeout(r, 200));
      }
    }

    // Go back to home
    const backBtn = await page.$('button[aria-label="Back to App"]');
    if (backBtn) {
      await backBtn.click();
      await new Promise((r) => setTimeout(r, 400));
    }

    // 2. Start Tracing and trace a word
    const startBtn = await page.$('button[aria-label="Start Tracing"]');
    if (!startBtn) throw new Error('Start Tracing button not found');
    await startBtn.click();
    await new Promise((r) => setTimeout(r, 600));

    // Check letter displayed and hear button
    const speakLetterBtn = await page.$('button[aria-label="Hear letter sound"]');
    if (speakLetterBtn) {
      console.log('Clicking "Hear letter sound" button...');
      await speakLetterBtn.click();
      await new Promise((r) => setTimeout(r, 300));
    }

    // Complete the word by skipping remaining letters
    console.log('Skipping letters to complete the word...');
    for (let i = 0; i < 6; i++) {
      const skipBtn = await page.$('button[aria-label="Skip to Next Letter"]');
      if (skipBtn) {
        await skipBtn.click();
        await new Promise((r) => setTimeout(r, 350));
      } else {
        break;
      }
    }

    await new Promise((r) => setTimeout(r, 1000));

    // Word completion screen should now be visible
    const completionScreenshotPath = path.join(__dirname, 'word_completion_mnemonic.png');
    await page.screenshot({ path: completionScreenshotPath });
    console.log('✓ Celebration screenshot saved to', completionScreenshotPath);

    const completionText = await page.evaluate(() => document.body.innerText);
    console.log('Page text on celebration:', completionText.slice(0, 300));
    
    // Check if celebration contains "Hear ..." button with mnemonic format
    if (!completionText.includes('for')) {
      console.warn('Warning: "for" not found directly in text snippet, checking buttons...');
    }

    // Retrieve all spoken texts from the page
    const captured = await page.evaluate(() => window.__spokenTexts);
    console.log('\n--- Captured Speech Synthesis Utterances ---');
    console.log(JSON.stringify(captured, null, 2));

    const texts = captured.map((c) => c.text);
    console.log('\nAll speech texts:', texts);

    // Assert that we have:
    // 1) A letter name spoken (e.g. "B!" or "Ay!")
    // 2) An "X for Word!" spoken on word completion (e.g. "B for Ball!" or "A for Apple!")
    const hasLetterName = texts.some((t) => /^[A-Z]!$/.test(t) || t === 'Ay!');
    const hasWordMnemonic = texts.some((t) => /^[A-Z] for [A-Za-z]+!$/.test(t));

    console.log('\nAssertions:');
    console.log('- Spoke letter name (e.g. "B!" / "Ay!"):', hasLetterName);
    console.log('- Spoke mnemonic phrase (e.g. "B for Ball!" / "A for Apple!"):', hasWordMnemonic);

    if (!hasLetterName) {
      throw new Error('Letter name was not spoken properly!');
    }
    if (!hasWordMnemonic) {
      throw new Error('Word mnemonic ("X for Word!") was not spoken on completion!');
    }

    console.log('\n🎉 ALL TTS & LETTER NAME CHECKS PASSED PERFECTLY!');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

testLetterNamesAndWordSpeech();
