# AUTHORIZATION_MATRIX.md

    > Proyecto: StockFlow Inventory Management System  
    > Modo: Caveman Mode  
    > Fecha base: 2026-05-22

    ## Matriz permisos

| Recurso | Acción | ADMIN | TECNICO |
|---|---:|---:|---:|
| Users | create | YES | NO |
| Users | read | YES | NO |
| Users | update | YES | NO |
| Offices | create | YES | YES |
| Offices | update | YES | YES |
| Materials | create | YES | YES |
| Materials | update | YES | YES |
| Materials | status | YES | YES |
| Dashboard | read | YES | NO |
| Audit | read global | YES | NO |
| Audit | read material | YES | YES |
| API Clients | manage | YES | NO |
| QR | regenerate | YES | NO |

    ---

    ## Regla final IA

    La IA debe trabajar solo con el alcance explícito de este archivo, no debe inventar funcionalidad fuera del bloque o documento activo, y debe registrar progreso en `docs/99-progress/` cuando complete trabajo real.
