# DB_MIGRATION_GUIDE.md

    > Proyecto: StockFlow Inventory Management System  
    > Modo: Caveman Mode  
    > Fecha base: 2026-05-22

    ## Objetivo

Reglas Flyway para schema.

## Naming

```text
V1__init_schema.sql
V2__security_tables.sql
V3__users.sql
```

## Reglas

- Una intención por migración.
- No editar migraciones ya aplicadas.
- No usar ddl-auto create en producción.
- Añadir índices en la misma migración si aplica.
- Añadir constraints desde el principio.

## Validación

```bash
mvn clean verify
docker compose up -d mysql
```

    ---

    ## Regla final IA

    La IA debe trabajar solo con el alcance explícito de este archivo, no debe inventar funcionalidad fuera del bloque o documento activo, y debe registrar progreso en `docs/99-progress/` cuando complete trabajo real.
