# ADR-012-frontend-state-management.md

    > Proyecto: VDEnergy Inventory Management System  
    > Modo: Caveman Mode  
    > Fecha base: 2026-05-22

    ## Estado

```text
ACEPTADO
```

## Contexto

El frontend necesita auth, tablas, filtros y dashboard, pero no requiere estado global complejo inicialmente.

## Decisión

Usar React state y Context API. Zustand permitido si crece. No Redux inicialmente.

## Reglas derivadas

- Estado local por defecto.
- Auth en provider.
- Services centralizados.
- No duplicar estado servidor.

## Consecuencias positivas

- Simplicidad.
- Menor bundle.
- Menos boilerplate.

## Consecuencias negativas

- Puede requerir refactor si crece.

## Validación

Esta decisión se considera válida mientras el sistema sea un inventario corporativo pequeño/medio, con dos roles principales, un único dominio funcional y despliegue containerizado.

## Resultado esperado

Estado frontend simple, claro y mantenible.

    ---

    ## Regla final IA

    La IA debe trabajar solo con el alcance explícito de este archivo, no debe inventar funcionalidad fuera del bloque o documento activo, y debe registrar progreso en `docs/99-progress/` cuando complete trabajo real.
