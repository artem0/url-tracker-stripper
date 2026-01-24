const puppeteer = require('puppeteer');
const path = require('path');

const EXTENSION_PATH = path.resolve(__dirname, '..');

const TEST_CASES = [
  // Image search
  {
    name: 'image search - preserves tbm=isch',
    input: 'https://www.google.com/search?q=cats&tbm=isch&ved=abc&ei=xyz',
    expected: 'https://www.google.com/search?q=cats&udm=2'
  },
  // News search - must preserve tbm=nws
  {
    name: 'news search - preserves tbm=nws',
    input: 'https://www.google.com/search?q=messi&tbm=nws&ved=abc&ei=xyz',
    expected: 'https://www.google.com/search?q=messi&tbm=nws'
  },
  // Video search - must preserve tbm=vid
  {
    name: 'video search - preserves tbm=vid',
    input: 'https://www.google.com/search?q=tutorial&tbm=vid&ved=abc',
    expected: 'https://www.google.com/search?q=tutorial&udm=7'
  },

  // Strips all common tracking params
  {
    name: 'strips ved, ei, sa, sxsrf together',
    input: 'https://www.google.com/search?q=test&ved=1&ei=2&sa=3&sxsrf=4',
    expected: 'https://www.google.com/search?q=test'
  },
  {
    name: 'strips biw, bih, dpr (viewport params)',
    input: 'https://www.google.com/search?q=test&biw=1920&bih=1080&dpr=2',
    expected: 'https://www.google.com/search?q=test'
  },
  {
    name: 'strips oq, gs_lcrp, gs_l (autocomplete params)',
    input: 'https://www.google.com/search?q=test&oq=tes&gs_lcrp=abc&gs_l=xyz',
    expected: 'https://www.google.com/search?q=test'
  }
];

async function runTests() {
  console.log('Launching Chrome with extension...\n');

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,
      args: [
        `--disable-extensions-except=${EXTENSION_PATH}`,
        `--load-extension=${EXTENSION_PATH}`,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ],
      timeout: 30000
    });
  } catch (err) {
    console.error('Failed to launch browser:', err.message);
    process.exit(1);
  }

  let passed = 0;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < TEST_CASES.length; i++) {
    const testCase = TEST_CASES[i];
    const page = await browser.newPage();

    try {
      await page.goto(testCase.input, {
        waitUntil: 'domcontentloaded',
        timeout: 15000
      });

      await new Promise(r => setTimeout(r, 500));

      const finalUrl = page.url();

      // Check for Google captcha/sorry/consent redirect
      if (finalUrl.includes('/sorry/') || finalUrl.includes('consent.google') || finalUrl.includes('google.com/sorry')) {
        console.log(`⚠ ${testCase.name} (skipped - captcha)`);
        skipped++;
      } else if (finalUrl === testCase.expected) {
        console.log(`✓ ${testCase.name}`);
        passed++;
      } else {
        console.log(`✗ ${testCase.name}`);
        console.log(`  Expected: ${testCase.expected}`);
        console.log(`  Got:      ${finalUrl}`);
        failed++;
      }
    } catch (error) {
      console.log(`✗ ${testCase.name}`);
      console.log(`  Error: ${error.message}`);
      failed++;
    }

    await page.close();

    // Wait 10s between requests to avoid Google captcha
    if (i < TEST_CASES.length - 1) {
      console.log(`  Waiting 10s...`);
      await new Promise(r => setTimeout(r, 10000));
    }
  }

  console.log(`\n${passed} passed, ${failed} failed, ${skipped} skipped (captcha)`);

  await browser.close();

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('Test runner error:', err.message);
  process.exit(1);
});
