# DEPLOYMENT_GUIDE.md

    > Proyecto: VDEnergy Inventory Management System  
    > Modo: Caveman Mode  
    > Fecha base: 2026-05-22

    ## Objetivo

Despliegue reproducible local y producción.

## Servicios

```text
backend
frontend
mysql
reverse-proxy opcional
```

## Docker compose

Comando base:

```bash
docker compose up -d
```

## Variables backend

```text
DB_HOST
DB_PORT
DB_NAME
DB_USER
DB_PASSWORD
JWT_SECRET
JWT_EXPIRATION
REFRESH_TOKEN_EXPIRATION
ADMIN_EMAIL
ADMIN_PASSWORD
QR_BASE_URL
```

## Variables frontend

```text
NEXT_PUBLIC_API_URL
```

## Producción

Dominio:

```text
https://inventario.vdenergy.es
```

Obligatorio:

- HTTPS
- MySQL no público
- secrets externos
- logs sin secretos
- backups
- health checks

## Health check

```text
/actuator/health
```

## Backups

Estrategia inicial:

```bash
mysqldump
```

Frecuencia recomendada:

```text
daily
```

Retención recomendada:

```text
7-30 días
```

## Validación post deploy

- frontend responde
- backend responde
- health OK
- DB conecta
- login admin funciona
- creación material funciona
- QR redirige correctamente

## Prohibiciones

- No exponer MySQL a internet.
- No subir `.env` a git.
- No hardcodear passwords.
- No desplegar con DEBUG permanente.

    ---

    ## Regla final IA

    La IA debe trabajar solo con el alcance explícito de este archivo, no debe inventar funcionalidad fuera del bloque o documento activo, y debe registrar progreso en `docs/99-progress/` cuando complete trabajo real.
