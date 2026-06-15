# ADR-004-frontend-and-ui-strategy.md

    > Proyecto: StockFlow Inventory Management System  
    > Modo: Caveman Mode  
    > Fecha base: 2026-05-22

    ## Estado

```text
ACEPTADO
```

## Contexto

El sistema será usado por técnicos en móvil y administradores en escritorio.
El QR debe ser rápido y usable desde smartphone.

## Decisión

Usar Next.js, React, TypeScript y TailwindCSS con enfoque mobile-first.

## Reglas derivadas

- App Router obligatorio.
- No pages router.
- No fetch disperso.
- Services centralizados.
- Componentes pequeños.
- Loading/error/empty states obligatorios.

## Consecuencias positivas

- UI rápida.
- Mantenibilidad.
- Tipado fuerte.
- Buen soporte móvil.

## Consecuencias negativas

- Más estructura inicial.
- Requiere disciplina de componentes.

## Validación

Esta decisión se considera válida mientras el sistema sea un inventario corporativo pequeño/medio, con dos roles principales, un único dominio funcional y despliegue containerizado.

## Resultado esperado

Frontend modular, responsive, seguro y fácil de continuar.

    ---

    ## Regla final IA

    La IA debe trabajar solo con el alcance explícito de este archivo, no debe inventar funcionalidad fuera del bloque o documento activo, y debe registrar progreso en `docs/99-progress/` cuando complete trabajo real.
