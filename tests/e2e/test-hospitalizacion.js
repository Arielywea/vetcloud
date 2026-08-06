// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://vetcloud.vercel.app';
const RUT = '21293992-7';
const PASSWORD = '1245';

test.describe('Hospitalization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.fill('input[placeholder="12345678-9"]', RUT);
    await page.fill('input[placeholder="Ingresa tu contraseña"]', PASSWORD);
    await page.click('text=Ingresar');
    await page.waitForTimeout(5000);
    await page.waitForLoadState('networkidle');
  });

  test('should load hospitalization page', async ({ page }) => {
    await page.locator('text=Hospitalización').first().click();
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Hospitalización').first()).toBeVisible();
    await expect(page.locator('text=0 pacientes').first()).toBeVisible();
  });

  test('should show empty state', async ({ page }) => {
    await page.locator('text=Hospitalización').first().click();
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Sin internamientos').first()).toBeVisible();
  });

  test('should show status filters', async ({ page }) => {
    await page.locator('text=Hospitalización').first().click();
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Internados').first()).toBeVisible();
    await expect(page.locator('text=Cirugía').first()).toBeVisible();
    await expect(page.locator('text=Recuperación').first()).toBeVisible();
  });
});
