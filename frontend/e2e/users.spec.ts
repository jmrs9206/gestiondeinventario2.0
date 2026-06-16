import { test, expect } from '@playwright/test';

test.describe('Administración de Usuarios E2E', () => {
  test('debe desactivar y activar un técnico de prueba correctamente', async ({ page }) => {
    // 1. Iniciar sesión como administrador
    await page.goto('/login');
    await page.fill('#email', 'admin@tuempresa.com');
    await page.fill('#password', 'jmvzsDX1fbK78OnpMMm6');
    await page.click('button[type="submit"]');

    // Debe estar en el dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // 2. Navegar a la sección de Usuarios
    await page.goto('/users');
    await expect(page.getByRole('heading', { name: 'Administración de Usuarios' })).toBeVisible();

    // 3. Registrar escuchador para confirmar diálogos del navegador (window.confirm)
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('¿Estás seguro de que deseas');
      await dialog.accept();
    });

    // 4. Ubicar la fila de Carlos García
    const row = page.locator('tr', { hasText: 'tecnico1@tuempresa.com' });
    await expect(row).toBeVisible();

    // 5. Hacer clic en Desactivar Cuenta
    const deactivateBtn = row.locator('button[title="Desactivar Cuenta"]');
    await expect(deactivateBtn).toBeVisible();
    await deactivateBtn.click();

    // 6. Verificar Toast de éxito de desactivación
    const toastDeactivated = page.locator('div.fixed.top-4.right-4');
    await expect(toastDeactivated).toBeVisible();
    await expect(toastDeactivated).toContainText('Usuario desactivado exitosamente.');

    // 7. Hacer clic en Activar Cuenta (el título cambia tras desactivar)
    const activateBtn = row.locator('button[title="Activar Cuenta"]');
    await expect(activateBtn).toBeVisible();
    await activateBtn.click();

    // 8. Verificar Toast de éxito de activación
    await expect(toastDeactivated).toBeVisible();
    await expect(toastDeactivated).toContainText('Usuario activado exitosamente.');
  });
});
