# AUDIT_IMPLEMENTATION_RULES.md

    > Proyecto: VDEnergy Inventory Management System  
    > Modo: Caveman Mode  
    > Fecha base: 2026-05-22

    ## Reglas

- AuditService centralizado.
- No lanzar excepción si falla auditoría sin registrar error técnico.
- Capturar IP y user-agent.
- Guardar before/after como JSON.
- No guardar passwords, tokens ni API keys.
- performed_by_type puede ser USER o API_CLIENT.

## Diferencia

`audit_log` = técnico/global.  
`material_history` = negocio inventario.

    ---

    ## Regla final IA

    La IA debe trabajar solo con el alcance explícito de este archivo, no debe inventar funcionalidad fuera del bloque o documento activo, y debe registrar progreso en `docs/99-progress/` cuando complete trabajo real.
