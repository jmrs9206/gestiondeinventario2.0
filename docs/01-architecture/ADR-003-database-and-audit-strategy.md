# ADR-003-database-and-audit-strategy.md

    > Proyecto: VDEnergy Inventory Management System  
    > Modo: Caveman Mode  
    > Fecha base: 2026-05-22

    ## Estado

```text
ACEPTADO
```

## Contexto

La información de inventario es crítica y debe ser reconstruible históricamente.
No se debe perder información por borrados físicos.

## Decisión

Usar MySQL 8, Flyway, soft delete, audit_log global y material_history funcional.

## Reglas derivadas

- Toda tabla crítica tiene timestamps.
- Entidades críticas usan active/status.
- Flyway obligatorio.
- audit_log no sustituye material_history.
- JSON permitido solo para before/after en auditoría.

## Consecuencias positivas

- Trazabilidad total.
- Mejor debugging.
- Base consistente.
- Migraciones reproducibles.

## Consecuencias negativas

- Más storage.
- Más disciplina.
- Más tablas.

## Validación

Esta decisión se considera válida mientras el sistema sea un inventario corporativo pequeño/medio, con dos roles principales, un único dominio funcional y despliegue containerizado.

## Resultado esperado

Base de datos auditable, versionada y preparada para reporting.

    ---

    ## Regla final IA

    La IA debe trabajar solo con el alcance explícito de este archivo, no debe inventar funcionalidad fuera del bloque o documento activo, y debe registrar progreso en `docs/99-progress/` cuando complete trabajo real.
