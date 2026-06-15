# SECURITY_FLOW.md

    > Proyecto: StockFlow Inventory Management System  
    > Modo: Caveman Mode  
    > Fecha base: 2026-05-22

    ## Objetivo

Definir flujo de seguridad oficial.

## Login

```http
POST /api/v1/auth/login
```

Request:

```json
{
  "email": "admin@tuempresa.com",
  "password": "********"
}
```

Backend valida:

- email existe
- password BCrypt correcto
- usuario activo

Response:

```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "tokenType": "Bearer",
  "expiresIn": 900
}
```

## Access token

Duración recomendada:

```text
15 minutos
```

Payload:

```json
{
  "sub": "public_id",
  "email": "admin@tuempresa.com",
  "role": "ADMIN",
  "iat": 0,
  "exp": 0
}
```

## Refresh token

Duración recomendada:

```text
7 días
```

Se guarda hasheado en base de datos.

## Logout

```http
POST /api/v1/auth/logout
```

Debe revocar refresh token.

## Roles

ADMIN:

- usuarios
- dashboard
- auditoría
- API pública
- regeneración QR

TECNICO:

- oficinas
- materiales
- cambios estado
- historial

## API pública

Header:

```http
X-API-Key: value
```

Debe validar:

- key válida
- cliente activo
- scope suficiente
- rate limit

## QR

Endpoint:

```http
GET /i/{publicCode}
```

Si no hay sesión:

```text
redirect /login
```

Si hay sesión:

```text
mostrar material si usuario activo y autorizado
```

## Auditoría seguridad

Eventos:

```text
LOGIN_SUCCESS
LOGIN_FAILED
TOKEN_REFRESH
LOGOUT
ACCESS_DENIED
PUBLIC_API_ACCESS
QR_SCANNED
```

## Prohibiciones

- No passwords en logs.
- No tokens completos en logs.
- No API keys en logs.
- No secretos en frontend.

    ---

    ## Regla final IA

    La IA debe trabajar solo con el alcance explícito de este archivo, no debe inventar funcionalidad fuera del bloque o documento activo, y debe registrar progreso en `docs/99-progress/` cuando complete trabajo real.
