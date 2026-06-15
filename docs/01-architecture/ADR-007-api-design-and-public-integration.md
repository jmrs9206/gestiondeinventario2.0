# ADR-007-api-design-and-public-integration.md

    > Proyecto: StockFlow Inventory Management System  
    > Modo: Caveman Mode  
    > Fecha base: 2026-05-22

    ## Estado

```text
ACEPTADO
```

## Contexto

El frontend y herramientas externas consumirán API.
Debe existir separación entre API interna y pública.

## Decisión

Usar REST versionada, `/api/v1` para interna y `/public-api/v1` para integraciones.
Documentar con OpenAPI.

## Reglas derivadas

- JSON obligatorio.
- DTOs obligatorios.
- No entidades JPA en responses.
- API pública con API Key + scopes.
- Paginación en listados.
- Errores consistentes.

## Consecuencias positivas

- Contratos claros.
- Integración sencilla.
- Menor acoplamiento.
- Mejor DX.

## Consecuencias negativas

- Más DTOs.
- Más documentación.

## Validación

Esta decisión se considera válida mientras el sistema sea un inventario corporativo pequeño/medio, con dos roles principales, un único dominio funcional y despliegue containerizado.

## Resultado esperado

API segura, versionada, documentada y estable.

    ---

    ## Regla final IA

    La IA debe trabajar solo con el alcance explícito de este archivo, no debe inventar funcionalidad fuera del bloque o documento activo, y debe registrar progreso en `docs/99-progress/` cuando complete trabajo real.
