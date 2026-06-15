# SEEDING_STRATEGY.md

    > Proyecto: StockFlow Inventory Management System  
    > Modo: Caveman Mode  
    > Fecha base: 2026-05-22

    ## Objetivo

Crear datos mínimos seguros.

## Primer arranque

Crear:

- ADMIN inicial desde variables entorno.
- Roles base.
- Estados material si se modelan en tabla futura.

## Variables

```text
ADMIN_EMAIL
ADMIN_PASSWORD
```

## Reglas

- Password siempre BCrypt.
- No seedar datos productivos falsos.
- No sobrescribir admin existente.

    ---

    ## Regla final IA

    La IA debe trabajar solo con el alcance explícito de este archivo, no debe inventar funcionalidad fuera del bloque o documento activo, y debe registrar progreso en `docs/99-progress/` cuando complete trabajo real.
