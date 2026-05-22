# ADR-011-backup-strategy.md

    > Proyecto: VDEnergy Inventory Management System  
    > Modo: Caveman Mode  
    > Fecha base: 2026-05-22

    ## Estado

```text
ACEPTADO
```

## Contexto

La información de inventario y auditoría no debe perderse.

## Decisión

Usar `mysqldump` inicial, backups diarios recomendados y guía restore.

## Reglas derivadas

- Backup fuera del contenedor.
- Restore documentado.
- MySQL volume persistente.
- Validar restore periódicamente.

## Consecuencias positivas

- Menor riesgo pérdida datos.
- Operación profesional.

## Consecuencias negativas

- Requiere storage.
- Requiere disciplina.

## Validación

Esta decisión se considera válida mientras el sistema sea un inventario corporativo pequeño/medio, con dos roles principales, un único dominio funcional y despliegue containerizado.

## Resultado esperado

Backups simples, restaurables y documentados.

    ---

    ## Regla final IA

    La IA debe trabajar solo con el alcance explícito de este archivo, no debe inventar funcionalidad fuera del bloque o documento activo, y debe registrar progreso en `docs/99-progress/` cuando complete trabajo real.
