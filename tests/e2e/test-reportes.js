// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://vetcloud.vercel.app';
const RUT = '21293992-7';
const PASSWORD = '1245';

test.describe('Reports', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.fill('input[placeholder="12345678-9"]', RUT);
    await page.fill('input[placeholder="Ingresa tu contraseña"]', PASSWORD);
    await page.click('text=Ingresar');
    await page.waitForTimeout(5000);
    await page.waitForLoadState('networkidle');
  });

  test('should load reports with stat cards', async ({ page }) => {
    await page.locator('text=Reportes').first().click();
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Reportes').first()).toBeVisible();
    await expect(page.locator('text=Pacientes').first()).toBeVisible();
    await expect(page.locator('text=Citas').first()).toBeVisible();
  });

  test('should show weekly activity section', async ({ page }) => {
    await page.locator('text=Reportes').first().click();
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Actividad de la Semana').first()).toBeVisible();
  });

  test('should show record type breakdown', async ({ page }) => {
    await page.locator('text=Reportes').first().click();
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Tipos de Fichas').first()).toBeVisible();
  });
});
