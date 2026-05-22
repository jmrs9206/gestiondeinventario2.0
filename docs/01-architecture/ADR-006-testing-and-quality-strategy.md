# ADR-006-testing-and-quality-strategy.md

    > Proyecto: VDEnergy Inventory Management System  
    > Modo: Caveman Mode  
    > Fecha base: 2026-05-22

    ## Estado

```text
ACEPTADO
```

## Contexto

El sistema gestionará autenticación, auditoría, inventario y API pública.
Los cambios deben ser seguros y verificables.

## Decisión

Usar JUnit 5, Mockito, MockMvc, Testcontainers para backend y Vitest/RTL para frontend.

## Reglas derivadas

- Unit tests no tocan DB.
- Integration tests usan Testcontainers MySQL.
- No usar DB producción.
- Validar seguridad y auditoría.
- CI ejecuta tests.

## Consecuencias positivas

- Menos regresiones.
- Refactors seguros.
- Mayor confianza.
- Calidad profesional.

## Consecuencias negativas

- Más tiempo inicial.
- Más mantenimiento.

## Validación

Esta decisión se considera válida mientras el sistema sea un inventario corporativo pequeño/medio, con dos roles principales, un único dominio funcional y despliegue containerizado.

## Resultado esperado

Sistema testeado en capas, con validaciones de negocio, seguridad e integración.

    ---

    ## Regla final IA

    La IA debe trabajar solo con el alcance explícito de este archivo, no debe inventar funcionalidad fuera del bloque o documento activo, y debe registrar progreso en `docs/99-progress/` cuando complete trabajo real.
