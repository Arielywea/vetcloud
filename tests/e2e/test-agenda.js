// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://vetcloud.vercel.app';
const RUT = '21293992-7';
const PASSWORD = '1245';

test.describe('Agenda / Calendar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.fill('input[placeholder="12345678-9"]', RUT);
    await page.fill('input[placeholder="Ingresa tu contraseña"]', PASSWORD);
    await page.click('text=Ingresar');
    await page.waitForTimeout(5000);
    await page.waitForLoadState('networkidle');
  });

  test('should load calendar view', async ({ page }) => {
    await page.locator('text=Agenda').first().click();
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');

    // Check for calendar-specific elements
    await expect(page.locator('text=VETERINARIO').first()).toBeVisible();
  });

  test('should show appointment filters', async ({ page }) => {
    await page.locator('text=Agenda').first().click();
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=ESTADO').first()).toBeVisible();
  });

  test('should show day summary', async ({ page }) => {
    await page.locator('text=Agenda').first().click();
    await page.waitForTimeout(3000);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Resumen del día').first()).toBeVisible();
  });
});
