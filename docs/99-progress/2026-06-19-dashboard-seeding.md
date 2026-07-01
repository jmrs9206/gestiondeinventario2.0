# 2026-06-19-dashboard-seeding.md

    > Proyecto: StockFlow Inventory Management System  
    > Modo: Caveman Mode  
    > Fecha base: 2026-06-19

    ## Estado

```text
DONE
```

## Bloque

```text
Demo-Data-Seeding
```

## Tareas realizadas

- **Ajuste de Datos de Demostración para KPI de Puestos**:
  - Reescrito el archivo [seed_mock_data.sql](file:///home/jmrs/gestionDeInventario2.0/seed_mock_data.sql) para sembrar el inventario de modo que compute matemáticamente el total deseado de capacidad operativa en el Dashboard.
  - La distribución se diseñó de forma compatible con el algoritmo de cálculo distributivo por sedes de `DashboardService.java`:
    - **Oficina Especial (Madrid Especial)**: Se sembraron 4 monitores, 2 teclados, 2 ratones y 2 audífonos. Esto calcula exactamente **2 Puestos Especiales**.
    - **10 Oficinas Completas (Medellín a Murcia)**: Cada una sembrada con 1 monitor, 1 teclado, 1 ratón y 2 audífonos. Esto calcula exactamente **10 Puestos Completos** en total.
    - **5 Oficinas Parciales (Palma a Córdoba)**: Cada una sembrada con 1 monitor, 1 teclado, 1 ratón y 1 audífono. Esto calcula exactamente **5 Puestos Parciales** en total.
  - Poblado el historial de materiales (`material_history`) y logs de auditoría base para mantener la coherencia y trazabilidad de los materiales sembrados.

## Archivos modificados
- `seed_mock_data.sql`

## Validación

- **Sintaxis SQL**: Verificación de integridad referencial de claves foráneas entre `materials` y `offices` con 16 oficinas.
