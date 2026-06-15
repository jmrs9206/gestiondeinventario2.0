# DASHBOARD_QUERIES.md

    > Proyecto: StockFlow Inventory Management System  
    > Modo: Caveman Mode  
    > Fecha base: 2026-05-22

    ## Consultas objetivo

### Total por estado

Agrupar `materials.status`.

### Total por oficina

Join `materials.office_id` con `offices.id`.

### Incidencias

Contar estados:

```text
ROTO
EN_REPARACION
```

### Movimientos recientes

Ordenar `material_history.created_at desc`.

## Reglas

- Usar índices.
- Evitar queries N+1.
- Paginación donde aplique.

    ---

    ## Regla final IA

    La IA debe trabajar solo con el alcance explícito de este archivo, no debe inventar funcionalidad fuera del bloque o documento activo, y debe registrar progreso en `docs/99-progress/` cuando complete trabajo real.
