const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto('https://vetcloud.vercel.app');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  const allElements = await page.locator('input, button, a, [role=button]').all();
  console.log('Interactive elements:', allElements.length);
  for (const el of allElements) {
    const tag = await el.evaluate(e => e.tagName);
    const text = await el.evaluate(e => (e.textContent || '').trim().substring(0, 50));
    const type = await el.evaluate(e => e.type || '');
    const placeholder = await el.evaluate(e => e.placeholder || '');
    console.log(`  ${tag} [${type}] placeholder="${placeholder}" text="${text}"`);
  }

  await page.screenshot({ path: 'tests/e2e/login-page.png', fullPage: true });
  console.log('Screenshot saved');
  await browser.close();
})();
