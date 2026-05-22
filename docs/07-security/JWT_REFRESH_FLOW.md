# JWT_REFRESH_FLOW.md

    > Proyecto: VDEnergy Inventory Management System  
    > Modo: Caveman Mode  
    > Fecha base: 2026-05-22

    ## Access token

- Duración corta.
- No revocable individualmente.
- Expira naturalmente.

## Refresh token

- Guardado hasheado.
- Revocable.
- Logout invalida.
- Rotación recomendada futura.

## Flujo

```text
login -> access + refresh
request -> access
expired -> refresh
logout -> revoke refresh
```

    ---

    ## Regla final IA

    La IA debe trabajar solo con el alcance explícito de este archivo, no debe inventar funcionalidad fuera del bloque o documento activo, y debe registrar progreso en `docs/99-progress/` cuando complete trabajo real.
