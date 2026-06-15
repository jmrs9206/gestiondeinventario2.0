import { test, expect } from '@playwright/test';

test.describe('Autenticación y Login E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Ir a la página de login antes de cada prueba
    await page.goto('/login');
  });

  test('debe mostrar la interfaz de login correctamente', async ({ page }) => {
    await expect(page.locator('h2')).toHaveText('Gestión De Inventario');
    await expect(page.locator('h3')).toHaveText('Iniciar sesión');
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });

  test('debe mostrar un mensaje de error con credenciales incorrectas', async ({ page }) => {
    await page.fill('#email', 'wrong@tuempresa.com');
    await page.fill('#password', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Debe mostrar la alerta de error devuelta por la API
    const errorAlert = page.locator('div.text-rose-700, div.text-rose-400');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText('credentials');
  });

  test('debe iniciar sesión exitosamente con el administrador por defecto', async ({ page }) => {
    // Usar credenciales del administrador por defecto inyectadas en bootstrap
    await page.fill('#email', 'admin@tuempresa.com');
    await page.fill('#password', 'jmvzsDX1fbK78OnpMMm6');
    await page.click('button[type="submit"]');

    // Debe redirigir exitosamente a la página de dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    
    // El dashboard debe estar visible
    await expect(page.locator('h1').last()).toContainText('Dashboard');
  });
});
