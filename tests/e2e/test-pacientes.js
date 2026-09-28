// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.VETCLOUD_BASE_URL || 'http://localhost:8081';
const RUT = process.env.VETCLOUD_TEST_USER;
const PASSWORD = process.env.VETCLOUD_TEST_PASS;

test.describe('Patient Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.fill('input[placeholder="12345678-9"]', RUT);
    await page.fill('input[placeholder="Ingresa tu contraseña"]', PASSWORD);
    await page.click('text=Ingresar');
    await page.waitForTimeout(5000);
    await page.waitForLoadState('networkidle');
  });

  test('should load patient list', async ({ page }) => {
    await page.locator('text=Pacientes').first().click();
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Nuevo Paciente').first()).toBeVisible();
    await expect(page.locator('text=PACIENTE').first()).toBeVisible();
  });

  test('should search for a patient', async ({ page }) => {
    await page.locator('text=Pacientes').first().click();
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('input[placeholder*="Buscar"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('Stan');
      await page.waitForTimeout(1500);
      // Check patient data appears in table (unique to table, not sidebar)
      await expect(page.locator('text=Inactivo').first()).toBeVisible();
    }
  });

  test('should display patient table with columns', async ({ page }) => {
    await page.locator('text=Pacientes').first().click();
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=PACIENTE').first()).toBeVisible();
    await expect(page.locator('text=ESPECIE').first()).toBeVisible();
    await expect(page.locator('text=RAZA').first()).toBeVisible();
  });
});
