// @ts-check
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'https://vetcloud.vercel.app';
const RUT = '21293992-7';
const PASSWORD = '1245';

const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const VIEWPORTS = {
  mobile:  { name: 'Mobile iPhone X', width: 375, height: 812 },
  tablet:  { name: 'Tablet iPad', width: 768, height: 1024 },
  desktop: { name: 'Desktop', width: 1024, height: 768 },
  wide:    { name: 'Wide Desktop', width: 1280, height: 800 },
};

let total = 0, passed = 0, failed = 0;
const results = [];

function check(viewport, test, ok) {
  total++;
  if (ok) passed++; else failed++;
  const status = ok ? 'PASS' : 'FAIL';
  const msg = `[${status}] ${viewport} - ${test}`;
  console.log(msg);
  results.push({ viewport, test, status });
}

async function login(page) {
  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');
  await page.fill('input[placeholder="12345678-9"]', RUT);
  await page.fill('input[placeholder="Ingresa tu contraseña"]', PASSWORD);
  await page.click('text=Ingresar');
  await page.waitForTimeout(5000);
  await page.waitForLoadState('networkidle');
}

async function hasHorizontalOverflow(page) {
  return await page.evaluate(() => {
    const body = document.body;
    const html = document.documentElement;
    return Math.max(body.scrollWidth, html.scrollWidth) > html.clientWidth;
  });
}

async function run() {
  const browser = await chromium.launch({ headless: true });

  for (const [key, vp] of Object.entries(VIEWPORTS)) {
    console.log(`\n--- ${vp.name} (${vp.width}x${vp.height}) ---`);
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await ctx.newPage();

    try {
      // Test 1: Login screen renders correctly
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
      const loginVisible = await page.locator('input[placeholder="12345678-9"]').isVisible();
      const passwordVisible = await page.locator('input[placeholder="Ingresa tu contraseña"]').isVisible();
      const submitVisible = await page.locator('text=Ingresar').isVisible();
      check(vp.name, 'Login form elements visible', loginVisible && passwordVisible && submitVisible);

      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `${key}-01-login.png`), fullPage: true });

      // Test 2: Dashboard loads without overflow
      await login(page);
      await page.waitForTimeout(1000);
      const overflow1 = await hasHorizontalOverflow(page);
      check(vp.name, 'No horizontal overflow on dashboard', !overflow1);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `${key}-02-dashboard.png`), fullPage: true });

      // Test 3: Navigation works
      const navLink = page.locator('a[href], button').filter({ hasText: /Pacientes|Agenda|Buscar/ }).first();
      if (await navLink.isVisible().catch(() => false)) {
        await navLink.click();
        await page.waitForTimeout(1000);
      }
      const noOverflow2 = !(await hasHorizontalOverflow(page));
      check(vp.name, 'Navigation works without overflow', noOverflow2);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `${key}-03-navigation.png`), fullPage: true });

      // Test 4: Body width respects viewport
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      check(vp.name, `Body width (${bodyWidth}px) <= viewport (${vp.width}px)`, bodyWidth <= vp.width);

      // Viewport-specific tests
      if (key === 'mobile') {
        // On mobile, check if sidebar nav items are visible or hamburger menu exists
        const navVisible = await page.locator('text=Pacientes').first().isVisible().catch(() => false);
        const hamburgerVisible = await page.locator('[aria-label*="menu"], [role="button"]').first().isVisible().catch(() => false);
        check(vp.name, 'Nav or hamburger present on mobile', navVisible || hamburgerVisible);
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `${key}-04-mobile-layout.png`), fullPage: true });
      }

      if (key === 'desktop' || key === 'wide') {
        // On desktop, sidebar nav items should be visible
        const navVisible = await page.locator('text=Pacientes').first().isVisible().catch(() => false);
        check(vp.name, 'Nav visible on desktop', navVisible);
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `${key}-04-desktop-layout.png`), fullPage: true });
      }

      if (key === 'tablet') {
        // On tablet, content should be visible
        const contentVisible = await page.locator('text=Pacientes').first().isVisible().catch(() => false);
        check(vp.name, 'Content visible on tablet', contentVisible);
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `${key}-04-tablet-layout.png`), fullPage: true });
      }

    } catch (err) {
      check(vp.name, `Unexpected error: ${err.message}`, false);
    }

    await ctx.close();
  }

  await browser.close();

  console.log('\n=== RESPONSIVE TEST RESULTS ===');
  console.log(`Total: ${total} | Passed: ${passed} | Failed: ${failed}`);
  console.log(`Rate: ${Math.round(passed / total * 100)}%`);
}

run().catch(console.error);
