const puppeteer = require('puppeteer');
const path = require('path');

async function verifyLetterTransitions() {
  console.log('🚀 Running Comprehensive Letter Transition & Sequential Verification...');

  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 850 });

  const consoleLogs = [];
  page.on('console', (msg) => {
    consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
  });

  try {
    // Clear previous storage to test clean first-run experience
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });
    await page.evaluate(async () => {
      if (window.indexedDB) {
        // Clear all IDB databases
        const dbs = await window.indexedDB.databases?.() || [];
        for (let db of dbs) {
          if (db.name) window.indexedDB.deleteDatabase(db.name);
        }
      }
    });

    // Reload page fresh
    await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' });
    console.log('✓ Clean app loaded');

    // 1. Click START
    const startBtn = await page.$('button[aria-label="Start Tracing"]');
    await startBtn.click();
    await new Promise(r => setTimeout(r, 600));

    // Inspect first word and letter
    const initialView = await page.evaluate(() => {
      const banner = document.querySelector('main div.bg-white\\/95');
      const bannerText = banner ? banner.textContent.trim() : 'NONE';
      const pills = Array.from(document.querySelectorAll('header div.bg-white\\/90 button')).map(b => b.textContent.trim());
      const arrows = Array.from(document.querySelectorAll('header div.bg-white\\/90 span')).map(s => s.textContent.trim());
      const activePill = document.querySelector('header div.bg-white\\/90 button.bg-emerald-500');
      return {
        bannerText,
        pills,
        arrows,
        activePill: activePill ? activePill.textContent.trim() : null
      };
    });

    console.log('Initial Tracing View:');
    console.log('- Word banner:', initialView.bannerText);
    console.log('- Letters in word:', initialView.pills);
    console.log('- Progression arrows:', initialView.arrows);
    console.log('- Active letter:', initialView.activePill);

    await page.screenshot({ path: path.join(__dirname, 'fix_01_word1_letter1.png') });

    // Helper to trace whatever stroke is currently active
    async function traceActiveStroke() {
      const strokeData = await page.evaluate(() => {
        const svg = document.querySelector('svg.touch-none');
        if (!svg) return null;
        // The active track has strokeDasharray="10 10" and opacity="0.85"
        const track = svg.querySelector('path[stroke-dasharray="10 10"]');
        if (!track) return null;
        const len = track.getTotalLength();
        const pts = [];
        for (let i = 0; i <= 25; i++) {
          const pt = track.getPointAtLength((i / 25) * len);
          pts.push({ x: pt.x, y: pt.y });
        }
        return pts;
      });

      if (!strokeData || strokeData.length === 0) return false;

      const svgEl = await page.$('svg.touch-none');
      const box = await svgEl.boundingBox();
      const scaleX = box.width / 200;
      const scaleY = box.height / 240;

      await page.mouse.move(box.x + strokeData[0].x * scaleX, box.y + strokeData[0].y * scaleY);
      await page.mouse.down();
      for (let pt of strokeData) {
        await page.mouse.move(box.x + pt.x * scaleX, box.y + pt.y * scaleY);
        await new Promise(r => setTimeout(r, 20));
      }
      await page.mouse.up();
      await new Promise(r => setTimeout(r, 250));
      return true;
    }

    // Helper to trace full letter
    async function traceFullLetter(letterName, maxStrokes = 4) {
      console.log(`\nTracing Letter ${letterName}...`);
      for (let s = 0; s < maxStrokes; s++) {
        const traced = await traceActiveStroke();
        if (!traced) {
          console.log(`Finished strokes for ${letterName} at stroke ${s}`);
          break;
        }
        console.log(`  Stroke ${s} traced`);
      }
      // Wait for success animation and transition
      await new Promise(r => setTimeout(r, 1300));
    }

    // Trace Letter 1 (A in APPLE)
    await traceFullLetter('A', 3);
    await page.screenshot({ path: path.join(__dirname, 'fix_02_word1_letter2.png') });

    let viewAfterL1 = await page.evaluate(() => {
      const banner = document.querySelector('main div.bg-white\\/95');
      const activePill = document.querySelector('header div.bg-white\\/90 button.bg-emerald-500');
      return {
        bannerText: banner ? banner.textContent.trim() : null,
        activePill: activePill ? activePill.textContent.trim() : null
      };
    });
    console.log('After Letter 1:');
    console.log('- Active letter:', viewAfterL1.activePill);
    console.log('- Banner:', viewAfterL1.bannerText);

    if (viewAfterL1.activePill !== 'P') {
      throw new Error(`Expected active letter to be 'P', but got '${viewAfterL1.activePill}'`);
    }

    // Trace Letter 2 (First P in APPLE)
    await traceFullLetter('P (1)', 2);
    await page.screenshot({ path: path.join(__dirname, 'fix_03_word1_letter3.png') });

    let viewAfterL2 = await page.evaluate(() => {
      const banner = document.querySelector('main div.bg-white\\/95');
      const activePill = document.querySelector('header div.bg-white\\/90 button.bg-emerald-500');
      return {
        bannerText: banner ? banner.textContent.trim() : null,
        activePill: activePill ? activePill.textContent.trim() : null
      };
    });
    console.log('After Letter 2 (P):');
    console.log('- Active letter:', viewAfterL2.activePill);
    console.log('- Banner:', viewAfterL2.bannerText);

    // Trace Letter 3 (Second P in APPLE)
    await traceFullLetter('P (2)', 2);
    await page.screenshot({ path: path.join(__dirname, 'fix_04_word1_letter4.png') });

    let viewAfterL3 = await page.evaluate(() => {
      const banner = document.querySelector('main div.bg-white\\/95');
      const activePill = document.querySelector('header div.bg-white\\/90 button.bg-emerald-500');
      return {
        bannerText: banner ? banner.textContent.trim() : null,
        activePill: activePill ? activePill.textContent.trim() : null
      };
    });
    console.log('After Letter 3 (P):');
    console.log('- Active letter:', viewAfterL3.activePill);
    console.log('- Banner:', viewAfterL3.bannerText);

    if (viewAfterL3.activePill !== 'L') {
      throw new Error(`Expected active letter to be 'L', but got '${viewAfterL3.activePill}'`);
    }

    // 2. Test Free Practice Mode A -> B progression
    console.log('\n--- Testing Free Practice A-Z Auto Progression ---');
    const homeBtn = await page.$('button[aria-label="Back to Home"]');
    await homeBtn.click();
    await new Promise(r => setTimeout(r, 400));

    const practiceBtn = await page.$('button[aria-label="Practice Modes"]');
    await practiceBtn.click();
    await new Promise(r => setTimeout(r, 400));

    const btns = await page.$$('button');
    for (let b of btns) {
      const t = await page.evaluate(el => el.textContent, b);
      if (t && t.includes('Free Practice')) {
        await b.click();
        break;
      }
    }
    await new Promise(r => setTimeout(r, 500));

    // Trace 'A' in Free Practice
    await traceFullLetter('Free Practice A', 3);
    // Wait for auto advance
    await new Promise(r => setTimeout(r, 600));

    await page.screenshot({ path: path.join(__dirname, 'fix_05_free_practice_after_A.png') });

    const fpView = await page.evaluate(() => {
      const currentActive = document.querySelector('div.overflow-x-auto button.font-black');
      const nextBtn = document.querySelector('footer button[aria-label="Next Letter"]');
      return {
        activeLetter: currentActive ? currentActive.textContent.trim() : null,
        nextBtnText: nextBtn ? nextBtn.textContent.trim() : null
      };
    });

    console.log('Free Practice state after completing A:');
    console.log('- Active Letter:', fpView.activeLetter);
    console.log('- Next Button:', fpView.nextBtnText);

    if (fpView.activeLetter !== 'B') {
      throw new Error(`Expected Free Practice to advance to 'B', but was '${fpView.activeLetter}'`);
    }

    console.log('\n🎉 ALL CHECKS PASSED WITH ZERO ERRORS!');

  } catch (err) {
    console.error('❌ Verification failed:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

verifyLetterTransitions();
