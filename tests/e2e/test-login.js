// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.VETCLOUD_BASE_URL || 'http://localhost:8081';
const RUT = process.env.VETCLOUD_TEST_USER;
const PASSWORD = process.env.VETCLOUD_TEST_PASS;

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.fill('input[placeholder="12345678-9"]', RUT);
    await page.fill('input[placeholder="Ingresa tu contraseña"]', PASSWORD);
    await page.click('text=Ingresar');

    await page.waitForTimeout(5000);
    await page.waitForLoadState('networkidle');

    const url = page.url();
    console.log('Current URL after login:', url);
    await expect(page).not.toHaveURL(/login/i);
  });

  test('should show error with invalid password', async ({ page }) => {
    await page.fill('input[placeholder="12345678-9"]', RUT);
    await page.fill('input[placeholder="Ingresa tu contraseña"]', 'wrongpassword');
    await page.click('text=Ingresar');

    await page.waitForTimeout(3000);
    const errorVisible = await page.locator('text=/incorrecto|inválidas|error|credenciales/i').first().isVisible().catch(() => false);
    const stillOnLogin = await page.locator('text=Iniciar Sesión').isVisible().catch(() => false);
    console.log('Error visible:', errorVisible, 'Still on login:', stillOnLogin);
    expect(errorVisible || stillOnLogin).toBeTruthy();
  });
});
