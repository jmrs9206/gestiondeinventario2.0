# ADR-002-security-architecture.md

    > Proyecto: StockFlow Inventory Management System  
    > Modo: Caveman Mode  
    > Fecha base: 2026-05-22

    ## Estado

```text
ACEPTADO
```

## Contexto

El sistema será accesible desde navegador, móvil vía QR e integraciones externas.
Debe proteger inventario, usuarios y auditoría.

## Decisión

Usar JWT + refresh tokens para humanos, BCrypt para contraseñas y API Keys + scopes para integraciones externas.

## Reglas derivadas

- ADMIN y TECNICO son los únicos roles humanos iniciales.
- Usuario inactivo no puede operar.
- API pública no usa JWT humano.
- Secrets solo en variables entorno.
- Auditoría obligatoria en eventos de seguridad.

## Consecuencias positivas

- Separación clara humano/sistema.
- Logout real con refresh token revocable.
- Integraciones más controladas.
- Seguridad profesional.

## Consecuencias negativas

- Más tablas.
- Más validaciones.
- Gestión de expiración y revocación.

## Validación

Esta decisión se considera válida mientras el sistema sea un inventario corporativo pequeño/medio, con dos roles principales, un único dominio funcional y despliegue containerizado.

## Resultado esperado

Autenticación robusta, autorización clara y trazabilidad de accesos.

    ---

    ## Regla final IA

    La IA debe trabajar solo con el alcance explícito de este archivo, no debe inventar funcionalidad fuera del bloque o documento activo, y debe registrar progreso en `docs/99-progress/` cuando complete trabajo real.
