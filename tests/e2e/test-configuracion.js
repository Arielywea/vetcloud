// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://vetcloud.vercel.app';
const RUT = '21293992-7';
const PASSWORD = '1245';

test.describe('Settings / Configuration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.fill('input[placeholder="12345678-9"]', RUT);
    await page.fill('input[placeholder="Ingresa tu contraseña"]', PASSWORD);
    await page.click('text=Ingresar');
    await page.waitForTimeout(5000);
    await page.waitForLoadState('networkidle');
  });

  test('should load profile form', async ({ page }) => {
    await page.locator('text=Configuración').last().click();
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Datos Personales').first()).toBeVisible();
  });

  test('should show theme toggle', async ({ page }) => {
    await page.locator('text=Configuración').last().click();
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Personalización').first()).toBeVisible();
    await expect(page.locator('text=MODO').first()).toBeVisible();
  });

  test('should show password change section', async ({ page }) => {
    await page.locator('text=Configuración').last().click();
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Cambiar Contraseña').first()).toBeVisible();
  });
});
