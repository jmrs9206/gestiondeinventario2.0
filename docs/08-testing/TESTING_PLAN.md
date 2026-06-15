# TESTING_PLAN.md

    > Proyecto: StockFlow Inventory Management System  
    > Modo: Caveman Mode  
    > Fecha base: 2026-05-22

    ## Backend

Capas:

- Unit tests con Mockito.
- Integration tests con Testcontainers.
- API tests con MockMvc.
- Security tests.

## Frontend

- Component tests.
- Form tests.
- Auth guards.
- QR flow.

## Comandos

```bash
mvn clean verify
npm run test
npm run build
```

    ---

    ## Regla final IA

    La IA debe trabajar solo con el alcance explícito de este archivo, no debe inventar funcionalidad fuera del bloque o documento activo, y debe registrar progreso en `docs/99-progress/` cuando complete trabajo real.
