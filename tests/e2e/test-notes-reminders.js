// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://vetcloud.vercel.app';
const RUT = '21293992-7';
const PASSWORD = '1245';

test.describe('Notes and Reminders', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.fill('input[placeholder="12345678-9"]', RUT);
    await page.fill('input[placeholder="Ingresa tu contraseña"]', PASSWORD);
    await page.click('text=Ingresar');
    await page.waitForTimeout(5000);
    await page.waitForLoadState('networkidle');
  });

  test('should load notes page with empty state', async ({ page }) => {
    await page.locator('text=Notas').first().click();
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=No tienes notas guardadas').first()).toBeVisible();
  });

  test('should load reminders page', async ({ page }) => {
    await page.locator('text=Recordatorios').first().click();
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=No hay recordatorios').first()).toBeVisible();
  });

  test('should show reminder status filters', async ({ page }) => {
    await page.locator('text=Recordatorios').first().click();
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Pendientes').first()).toBeVisible();
    await expect(page.locator('text=Enviados').first()).toBeVisible();
  });
});
