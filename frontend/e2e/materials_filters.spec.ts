import { test, expect } from '@playwright/test';

test.describe('Filtros de Inventario de Materiales E2E', () => {
  const expectColumnToContain = async (rows, columnIndex: number, expectedText: string) => {
    await expect
      .poll(async () => {
        const rowCount = await rows.count();
        if (rowCount === 0) {
          return false;
        }

        for (let i = 0; i < rowCount; i++) {
          const cellText = await rows.nth(i).locator('td').nth(columnIndex).textContent();
          if (!cellText?.toUpperCase().includes(expectedText)) {
            return false;
          }
        }

        return true;
      })
      .toBe(true);
  };

  test.beforeEach(async ({ page }) => {
    // Iniciar sesión
    await page.goto('/login');
    await page.fill('#email', 'admin@tuempresa.com');
    await page.fill('#password', 'vd_admin_z2X4m7P1v9R8s3T5');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);

    // Ir a la página de materiales/inventario
    await page.goto('/materials');
    await expect(page.getByRole('heading', { name: 'Inventario de Materiales' })).toBeVisible();
  });

  test('debe filtrar materiales por tipo y oficina correctamente', async ({ page }) => {
    // 1. Filtrar por tipo "monitor"
    const typeInput = page.locator('input[placeholder="Ej: Router, Switch..."]');
    await typeInput.fill('monitor');

    // Verificar que todos los elementos en la tabla sean del tipo MONITOR
    const rows = page.locator('tbody tr');
    await expectColumnToContain(rows, 1, 'MONITOR');
    
    // Debería haber al menos un monitor (de los datos mock)
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    // 2. Filtrar por oficina "VILLALBA"
    const officeSelect = page.locator('select').first();
    await officeSelect.selectOption({ label: 'VILLALBA' });
    await expectColumnToContain(rows, 4, 'VILLALBA');

    const villalbaRowCount = await rows.count();
    expect(villalbaRowCount).toBeGreaterThan(0);

    // 3. Limpiar filtros
    const clearButton = page.locator('button:has-text("Limpiar Filtros")');
    await clearButton.click();

    // Los inputs y selects deberían estar limpios
    await expect(typeInput).toHaveValue('');
    await expect(officeSelect).toHaveValue('');
  });
});
