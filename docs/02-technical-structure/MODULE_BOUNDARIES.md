# MODULE_BOUNDARIES.md

    > Proyecto: VDEnergy Inventory Management System  
    > Modo: Caveman Mode  
    > Fecha base: 2026-05-22

    ## Objetivo

Evitar acoplamiento entre módulos.

## Reglas

- Controller solo llama a su service.
- Service puede usar repositories propios.
- Service puede invocar services de otros módulos solo si hay caso real.
- AuditService puede ser usado por todos.
- Common no depende de módulos de dominio.
- PublicApi no debe reutilizar controllers internos.

## Dependencias permitidas

```text
auth -> users
materials -> offices
inventory -> materials
inventory -> audit
dashboard -> materials
dashboard -> offices
publicapi -> users/materials mediante services
```

## Dependencias prohibidas

```text
controller -> repository
frontend -> database
publicapi -> internal controllers
common -> domain modules
```

## Si aparece dependencia circular

Crear interfaz o mover lógica a módulo apropiado.

    ---

    ## Regla final IA

    La IA debe trabajar solo con el alcance explícito de este archivo, no debe inventar funcionalidad fuera del bloque o documento activo, y debe registrar progreso en `docs/99-progress/` cuando complete trabajo real.
