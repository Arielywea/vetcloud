// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.VETCLOUD_BASE_URL || 'http://localhost:8081';
const RUT = process.env.VETCLOUD_TEST_USER;
const PASSWORD = process.env.VETCLOUD_TEST_PASS;

test.describe('Pet Clinical File', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.fill('input[placeholder="12345678-9"]', RUT);
    await page.fill('input[placeholder="Ingresa tu contraseña"]', PASSWORD);
    await page.click('text=Ingresar');
    await page.waitForTimeout(5000);
    await page.waitForLoadState('networkidle');
  });

  test('should open patient list and see patients', async ({ page }) => {
    await page.locator('text=Pacientes').first().click();
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');

    // Use table header which is unique to content area
    await expect(page.locator('text=PACIENTE').first()).toBeVisible();
    await expect(page.locator('text=PROPIETARIO').first()).toBeVisible();
  });

  test('should show patient species in table', async ({ page }) => {
    await page.locator('text=Pacientes').first().click();
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');

    // Table shows "Canino" and "Felino" as species
    await expect(page.locator('text=Canino').last()).toBeVisible();
    await expect(page.locator('text=Felino').last()).toBeVisible();
  });

  test('should show patient owner info', async ({ page }) => {
    await page.locator('text=Pacientes').first().click();
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=PROPIETARIO').first()).toBeVisible();
    await expect(page.locator('text=ÚLTIMA VISITA').first()).toBeVisible();
  });
});
