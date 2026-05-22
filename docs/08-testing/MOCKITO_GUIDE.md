# MOCKITO_GUIDE.md

    > Proyecto: VDEnergy Inventory Management System  
    > Modo: Caveman Mode  
    > Fecha base: 2026-05-22

    ## Objetivo

Pruebas unitarias sin tocar DB.

## Usar en

- services
- validators
- helpers

## Ejemplo conceptual

```java
@Mock
private MaterialRepository materialRepository;
```

## No usar para

- validar queries reales
- validar migraciones
- validar JPA mappings

    ---

    ## Regla final IA

    La IA debe trabajar solo con el alcance explícito de este archivo, no debe inventar funcionalidad fuera del bloque o documento activo, y debe registrar progreso en `docs/99-progress/` cuando complete trabajo real.
