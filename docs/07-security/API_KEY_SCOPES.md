# API_KEY_SCOPES.md

    > Proyecto: VDEnergy Inventory Management System  
    > Modo: Caveman Mode  
    > Fecha base: 2026-05-22

    ## Scopes permitidos

```text
users:create
users:read
materials:read
materials:update
offices:read
audit:write
```

## Reglas

- API clients tienen mínimo privilegio.
- Las API keys se guardan hasheadas.
- Mostrar key solo al crear.
- Permitir rotación futura.

    ---

    ## Regla final IA

    La IA debe trabajar solo con el alcance explícito de este archivo, no debe inventar funcionalidad fuera del bloque o documento activo, y debe registrar progreso en `docs/99-progress/` cuando complete trabajo real.
