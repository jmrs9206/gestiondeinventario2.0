# AUDIT_EVENTS_CATALOG.md

    > Proyecto: StockFlow Inventory Management System  
    > Modo: Caveman Mode  
    > Fecha base: 2026-05-22

    ## Eventos auth

```text
LOGIN_SUCCESS
LOGIN_FAILED
TOKEN_REFRESH
LOGOUT
ACCESS_DENIED
```

## Eventos usuarios

```text
USER_CREATED
USER_UPDATED
USER_DISABLED
USER_ENABLED
PASSWORD_CHANGED
```

## Eventos oficinas

```text
OFFICE_CREATED
OFFICE_UPDATED
OFFICE_DISABLED
```

## Eventos materiales

```text
MATERIAL_CREATED
MATERIAL_UPDATED
STATUS_CHANGED
OFFICE_CHANGED
QR_GENERATED
QR_REGENERATED
QR_SCANNED
MATERIAL_DECOMMISSIONED
```

## API pública

```text
PUBLIC_API_ACCESS
PUBLIC_API_DENIED
API_CLIENT_CREATED
API_CLIENT_DISABLED
```

    ---

    ## Regla final IA

    La IA debe trabajar solo con el alcance explícito de este archivo, no debe inventar funcionalidad fuera del bloque o documento activo, y debe registrar progreso en `docs/99-progress/` cuando complete trabajo real.
