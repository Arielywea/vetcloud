// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.VETCLOUD_BASE_URL || 'http://localhost:8081';
const RUT = process.env.VETCLOUD_TEST_USER;
const PASSWORD = process.env.VETCLOUD_TEST_PASS;

test.describe('Inventory', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.fill('input[placeholder="12345678-9"]', RUT);
    await page.fill('input[placeholder="Ingresa tu contraseña"]', PASSWORD);
    await page.click('text=Ingresar');
    await page.waitForTimeout(5000);
    await page.waitForLoadState('networkidle');
  });

  test('should load inventory page', async ({ page }) => {
    await page.locator('text=Inventario').first().click();
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Inventario').first()).toBeVisible();
  });

  test('should show empty state', async ({ page }) => {
    await page.locator('text=Inventario').first().click();
    await page.waitForTimeout(2000);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Sin items en inventario').first()).toBeVisible();
    await expect(page.locator('text=Agrega medicamentos').first()).toBeVisible();
  });
});
