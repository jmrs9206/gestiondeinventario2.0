# FLYWAY_NAMING.md

    > Proyecto: VDEnergy Inventory Management System  
    > Modo: Caveman Mode  
    > Fecha base: 2026-05-22

    ## Formato

```text
V{numero}__{descripcion}.sql
```

## Ejemplos

```text
V1__init_schema.sql
V2__create_users.sql
V3__create_materials.sql
V4__create_audit_log.sql
```

## Prohibido

- espacios
- nombres ambiguos
- mezclar cambios no relacionados

    ---

    ## Regla final IA

    La IA debe trabajar solo con el alcance explícito de este archivo, no debe inventar funcionalidad fuera del bloque o documento activo, y debe registrar progreso en `docs/99-progress/` cuando complete trabajo real.
