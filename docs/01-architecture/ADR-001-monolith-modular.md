# ADR-001-monolith-modular.md

    > Proyecto: VDEnergy Inventory Management System  
    > Modo: Caveman Mode  
    > Fecha base: 2026-05-22

    ## Estado

```text
ACEPTADO
```

## Contexto

El sistema combina autenticación, usuarios, oficinas, materiales, auditoría, dashboard, QR y API pública.
Todo el dominio comparte base de datos, seguridad, auditoría y reglas de negocio.
Microservicios añadirían complejidad operativa sin aportar valor actual.

## Decisión

Usar arquitectura monolito modular. No usar microservicios.
El backend se divide en módulos lógicos: auth, users, offices, materials, inventory, audit, dashboard, publicapi y common.

## Reglas derivadas

- No crear servicios independientes.
- No crear comunicación HTTP interna entre módulos.
- No separar bases de datos.
- No introducir colas innecesarias.
- Mantener boundaries por package y service.

## Consecuencias positivas

- Menor complejidad.
- Mejor debugging.
- Mejor continuidad IA.
- Menor coste infraestructura.
- Desarrollo más rápido.

## Consecuencias negativas

- Escalado conjunto.
- Despliegue único.
- Requiere disciplina modular.

## Validación

Esta decisión se considera válida mientras el sistema sea un inventario corporativo pequeño/medio, con dos roles principales, un único dominio funcional y despliegue containerizado.

## Resultado esperado

Backend cohesivo, modular, mantenible y posible de separar en el futuro si el dominio crece.

    ---

    ## Regla final IA

    La IA debe trabajar solo con el alcance explícito de este archivo, no debe inventar funcionalidad fuera del bloque o documento activo, y debe registrar progreso en `docs/99-progress/` cuando complete trabajo real.
