# TESTCONTAINERS_GUIDE.md

    > Proyecto: VDEnergy Inventory Management System  
    > Modo: Caveman Mode  
    > Fecha base: 2026-05-22

    ## Objetivo

Probar contra MySQL real temporal.

## Reglas

- No usar DB producción.
- No usar DB compartida.
- Container por suite o reutilizable según configuración.
- Flyway debe ejecutarse en tests.

## Casos

- repositories
- migrations
- controllers
- security integration

    ---

    ## Regla final IA

    La IA debe trabajar solo con el alcance explícito de este archivo, no debe inventar funcionalidad fuera del bloque o documento activo, y debe registrar progreso en `docs/99-progress/` cuando complete trabajo real.
