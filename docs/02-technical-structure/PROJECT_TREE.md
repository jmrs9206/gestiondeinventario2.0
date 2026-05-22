# PROJECT_TREE.md

    > Proyecto: VDEnergy Inventory Management System  
    > Modo: Caveman Mode  
    > Fecha base: 2026-05-22

    ## Estructura oficial raíz

```text
gestionDeInventario-Vdenergy/
├── backend/
├── frontend/
├── docs/
├── docker-compose.yml
├── .env.example
├── README.md
└── .github/workflows/
```

## docs

```text
docs/
├── 00-project/
├── 01-architecture/
├── 02-technical-structure/
├── 03-templates/
├── 04-blocks/
├── 05-api/
├── 06-database/
├── 07-security/
├── 08-testing/
├── 09-audit/
├── 10-dashboard/
└── 99-progress/
```

## backend

```text
backend/
├── pom.xml
├── Dockerfile
└── src/
```

## frontend

```text
frontend/
├── package.json
├── Dockerfile
└── src/
```

## Reglas

- No crear carpetas nuevas sin motivo.
- No mezclar frontend y backend.
- No duplicar docs.
- No mover archivos cerrados sin actualizar referencias.

    ---

    ## Regla final IA

    La IA debe trabajar solo con el alcance explícito de este archivo, no debe inventar funcionalidad fuera del bloque o documento activo, y debe registrar progreso en `docs/99-progress/` cuando complete trabajo real.
