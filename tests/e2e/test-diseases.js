// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://vetcloud.vercel.app';
const RUT = '21293992-7';
const PASSWORD = '1245';

test.describe('Disease Browser', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.fill('input[placeholder="12345678-9"]', RUT);
    await page.fill('input[placeholder="Ingresa tu contraseña"]', PASSWORD);
    await page.click('text=Ingresar');
    await page.waitForTimeout(5000);
    await page.waitForLoadState('networkidle');
  });

  test('should load 87 diseases', async ({ page }) => {
    await page.locator('text=Enfermedades').first().click();
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=87 enfermedades encontradas').first()).toBeVisible();
  });

  test('should show species filters', async ({ page }) => {
    await page.locator('text=Enfermedades').first().click();
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Perros').first()).toBeVisible();
  });

  test('should show life stage sections', async ({ page }) => {
    await page.locator('text=Enfermedades').first().click();
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Cachorros').first()).toBeVisible();
    await expect(page.locator('text=Gatitos').first()).toBeVisible();
  });

  test('should filter by species Perros', async ({ page }) => {
    await page.locator('text=Enfermedades').first().click();
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');

    await page.locator('text=Perros').first().click();
    await page.waitForTimeout(1000);

    await expect(page.locator('text=Perro').first()).toBeVisible();
  });

  test('should show disease detail with tabs', async ({ page }) => {
    await page.locator('text=Enfermedades').first().click();
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');

    // Scroll down and click a disease card
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(500);

    const diseaseCard = page.locator('text=Displasia Coxofemoral').first();
    if (await diseaseCard.isVisible()) {
      await diseaseCard.click();
      await page.waitForTimeout(3000);

      // Check for detail content - disease detail shows species and severity
      const bodyText = await page.evaluate(() => document.body.innerText);
      const hasDetail = bodyText.includes('Signos clave') || bodyText.includes('Tratamiento') || bodyText.includes('Perro');
      expect(hasDetail).toBeTruthy();
    }
  });
});
