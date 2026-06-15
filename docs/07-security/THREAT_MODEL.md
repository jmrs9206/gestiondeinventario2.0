# THREAT_MODEL.md

    > Proyecto: StockFlow Inventory Management System  
    > Modo: Caveman Mode  
    > Fecha base: 2026-05-22

    ## Amenazas principales

- Enumeración QR.
- Robo de token.
- API key filtrada.
- Usuario inactivo operando.
- Inyección SQL.
- XSS.
- Exposición de secrets.
- Scraping API pública.

## Mitigaciones

- public_code aleatorio.
- JWT expiración corta.
- refresh revocable.
- API key hash + scopes.
- JPA parameterized queries.
- React escaping.
- variables entorno.
- rate limiting.
- auditoría.

    ---

    ## Regla final IA

    La IA debe trabajar solo con el alcance explícito de este archivo, no debe inventar funcionalidad fuera del bloque o documento activo, y debe registrar progreso en `docs/99-progress/` cuando complete trabajo real.
