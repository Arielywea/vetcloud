// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://vetcloud.vercel.app';
const RUT = '21293992-7';
const PASSWORD = '1245';

test.describe('Laboratory Exams', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.fill('input[placeholder="12345678-9"]', RUT);
    await page.fill('input[placeholder="Ingresa tu contraseña"]', PASSWORD);
    await page.click('text=Ingresar');
    await page.waitForTimeout(5000);
    await page.waitForLoadState('networkidle');
  });

  test('should load lab page', async ({ page }) => {
    await page.locator('text=Laboratorio').first().click();
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Laboratorio').first()).toBeVisible();
    await expect(page.locator('text=Exámenes y resultados de laboratorio').first()).toBeVisible();
  });

  test('should show empty state', async ({ page }) => {
    await page.locator('text=Laboratorio').first().click();
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Sin exámenes').first()).toBeVisible();
  });

  test('should show exam status filters', async ({ page }) => {
    await page.locator('text=Laboratorio').first().click();
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Pendientes').first()).toBeVisible();
    await expect(page.locator('text=Completados').first()).toBeVisible();
  });
});
