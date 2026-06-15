# DEPLOYMENT_GUIDE.md

    > Proyecto: StockFlow Inventory Management System  
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
https://inventario.tuempresa.com
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

## Configuración Nginx & HTTPS

En entornos de producción, Nginx actúa como proxy inverso y punto de terminación SSL/TLS:
- Redirección automática de HTTP (puerto 80) a HTTPS (puerto 443).
- Cifrado seguro utilizando protocolos TLSv1.2 y TLSv1.3.
- Cabeceras de seguridad inyectadas (`Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`).

### Automatización de Certificados Let's Encrypt (Certbot Sidecar)

Para producción, el proyecto incluye un contenedor sidecar de Certbot automatizado en `docker-compose.prod.yml` que interactúa con Nginx de manera nativa:

1. **Reto ACME:** Nginx redirige el tráfico HTTP al puerto 443 pero permite la validación de retos en la ruta `.well-known/acme-challenge/` mapeada a una carpeta compartida en `/var/www/certbot`.
2. **Renovación Automática:** El contenedor de Certbot se ejecuta de manera permanente en segundo plano, verificando la renovación de los certificados cada 12 horas:
   ```yaml
   certbot:
     image: certbot/certbot:v2.10.0
     volumes:
       - ./docs/nginx/certs:/etc/letsencrypt
       - ./docs/nginx/certbot-webroot:/var/www/certbot
     entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"
   ```

### Gestión de Secretos en Producción

Para evitar brechas de seguridad, **nunca** dejes archivos `.env` en claro en el servidor de producción. Docker Compose soporta la lectura de variables directamente desde el entorno del sistema operativo host:

1. **Inyección por Entorno:** Define las variables de entorno en el host (mediante configuraciones de systemd, perfiles de usuario o el orquestador en la nube):
   ```bash
   export DB_PASSWORD="vd_db_p8F9qK2wX5mN7vT3"
   export JWT_SECRET="un_secreto_largo_y_seguro"
   export ADMIN_PASSWORD="vd_admin_z2X4m7P1v9R8s3T5"
   ```
2. **Ejecución:** Al ejecutar `docker compose -f docker-compose.prod.yml up -d`, Docker Compose tomará automáticamente estas variables del sistema para inyectarlas de forma segura en los contenedores.

## Backups Automatizados

Para respaldar la base de datos de producción diariamente, se utiliza el script dinámico [backup.sh](file:///home/jmrs/gestionDeInventario2.0/docs/backup.sh) localizado en la carpeta `docs/`.

### Script de Backup (`backup.sh`)
El script carga las variables dinámicamente de tu `.env` (o variables inyectadas), determina el contenedor activo, evita errores de privilegios (`--no-tablespaces`) y comprime la salida:
* Ruta: `docs/backup.sh`

### Restauración (`restore.sh`)
Para restaurar una copia de seguridad en caliente en cualquiera de los entornos:
* Ruta: `docs/restore.sh`
* Comando: `bash docs/restore.sh <ruta_al_archivo_backup.sql.gz>`

### Configuración del Cron Job
Para ejecutar el respaldo automáticamente a las 02:00 AM todos los días:
```text
0 2 * * * /bin/bash /home/user/gestionDeInventario2.0/docs/backup.sh >> /var/log/stockflow-backup.log 2>&1
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
