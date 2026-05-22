# ADR-009-logging-strategy.md

    > Proyecto: VDEnergy Inventory Management System  
    > Modo: Caveman Mode  
    > Fecha base: 2026-05-22

    ## Estado

```text
ACEPTADO
```

## Contexto

Los logs técnicos son necesarios para operación, pero no sustituyen la auditoría funcional.

## Decisión

Usar logging estructurado con niveles ERROR, WARN, INFO y DEBUG solo en dev.

## Reglas derivadas

- No loggear tokens, passwords, API keys ni secrets.
- Logs técnicos no sustituyen audit_log.
- Producción sin DEBUG permanente.
- Errores con correlation id futuro.

## Consecuencias positivas

- Mejor debugging.
- Operación más clara.
- Menos exposición de datos.

## Consecuencias negativas

- Requiere disciplina.
- Puede generar ruido si no se controla.

## Validación

Esta decisión se considera válida mientras el sistema sea un inventario corporativo pequeño/medio, con dos roles principales, un único dominio funcional y despliegue containerizado.

## Resultado esperado

Logging útil, seguro y separado de auditoría.

    ---

    ## Regla final IA

    La IA debe trabajar solo con el alcance explícito de este archivo, no debe inventar funcionalidad fuera del bloque o documento activo, y debe registrar progreso en `docs/99-progress/` cuando complete trabajo real.
