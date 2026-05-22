# ADR-010-observability-strategy.md

    > Proyecto: VDEnergy Inventory Management System  
    > Modo: Caveman Mode  
    > Fecha base: 2026-05-22

    ## Estado

```text
ACEPTADO
```

## Contexto

El sistema necesita health checks iniciales y puede crecer hacia métricas avanzadas.

## Decisión

Implementar Actuator health inicialmente y dejar preparado para Prometheus/Grafana/Sentry/Loki.

## Reglas derivadas

- `/actuator/health` permitido.
- No exponer endpoints sensibles de actuator.
- Métricas avanzadas no obligatorias iniciales.

## Consecuencias positivas

- Despliegue verificable.
- Preparado para producción.
- Escalable operativamente.

## Consecuencias negativas

- Más configuración futura.

## Validación

Esta decisión se considera válida mientras el sistema sea un inventario corporativo pequeño/medio, con dos roles principales, un único dominio funcional y despliegue containerizado.

## Resultado esperado

Observabilidad básica ahora y expandible sin rediseñar.

    ---

    ## Regla final IA

    La IA debe trabajar solo con el alcance explícito de este archivo, no debe inventar funcionalidad fuera del bloque o documento activo, y debe registrar progreso en `docs/99-progress/` cuando complete trabajo real.
