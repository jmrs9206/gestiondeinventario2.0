# MATERIAL_HISTORY_EVENTS.md

    > Proyecto: VDEnergy Inventory Management System  
    > Modo: Caveman Mode  
    > Fecha base: 2026-05-22

    ## Eventos material_history

```text
MATERIAL_CREATED
STATUS_CHANGED
OFFICE_CHANGED
REPAIR_STARTED
REPAIR_FINISHED
MATERIAL_DECOMMISSIONED
QR_SCANNED
```

## Campos

- material
- action
- previous_status
- new_status
- previous_office_id
- new_office_id
- performed_by_user_id
- comment
- created_at

    ---

    ## Regla final IA

    La IA debe trabajar solo con el alcance explícito de este archivo, no debe inventar funcionalidad fuera del bloque o documento activo, y debe registrar progreso en `docs/99-progress/` cuando complete trabajo real.
