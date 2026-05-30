# ADR-005-devops-and-deployment-strategy.md

    > Proyecto: VDEnergy Inventory Management System  
    > Modo: Caveman Mode  
    > Fecha base: 2026-05-22

    ## Estado

```text
ACEPTADO
```

## Contexto

El proyecto debe ejecutarse local y en nube de forma reproducible.
Debe incluir backend, frontend y MySQL.

## Decisión

Usar Docker, Docker Compose, profiles dev/test/prod y GitHub Actions.

## Reglas derivadas

- Docker obligatorio.
- No secrets hardcodeados.
- MySQL no expuesto públicamente.
- HTTPS en producción.
- Health check en backend.

## Consecuencias positivas

- Onboarding rápido.
- Reproducibilidad.
- Despliegue sencillo.
- Preparado para cloud.

## Consecuencias negativas

- Más configuración.
- Requiere gestión de variables entorno.

## Validación

Esta decisión se considera válida mientras el sistema sea un inventario corporativo pequeño/medio, con dos roles principales, un único dominio funcional y despliegue containerizado.

## Resultado esperado

Infraestructura portable, segura y lista para producción.

    ---

    ## Regla final IA

    La IA debe trabajar solo con el alcance explícito de este archivo, no debe inventar funcionalidad fuera del bloque o documento activo, y debe registrar progreso en `docs/99-progress/` cuando complete trabajo real.
