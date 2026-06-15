# API_CONTRACT_GUIDE.md

    > Proyecto: StockFlow Inventory Management System  
    > Modo: Caveman Mode  
    > Fecha base: 2026-05-22

    ## Objetivo

Reglas para mantener contrato API.

## Prefijos

```text
/api/v1
/public-api/v1
```

## Seguridad

API interna:

```text
Authorization: Bearer <token>
```

API pública:

```text
X-API-Key: <key>
```

## Respuestas

Éxito:

```json
{
  "data": {},
  "timestamp": "2026-05-22T10:00:00Z"
}
```

Error:

```json
{
  "error": {
    "code": "MATERIAL_NOT_FOUND",
    "message": "Material not found"
  },
  "timestamp": "2026-05-22T10:00:00Z"
}
```

## Paginación

```http
?page=0&size=20&sort=createdAt,desc
```

## Reglas

- No entidades JPA en response.
- No endpoints sin versionar.
- No cambiar payload sin actualizar OpenAPI.
- No devolver 200 para errores.

    ---

    ## Regla final IA

    La IA debe trabajar solo con el alcance explícito de este archivo, no debe inventar funcionalidad fuera del bloque o documento activo, y debe registrar progreso en `docs/99-progress/` cuando complete trabajo real.
