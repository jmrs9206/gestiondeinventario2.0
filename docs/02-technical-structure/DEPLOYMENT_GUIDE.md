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

## Configuración Nginx & HTTPS

En entornos de producción, Nginx actúa como proxy inverso y punto de terminación SSL/TLS:
- Redirección automática de HTTP (puerto 80) a HTTPS (puerto 443).
- Cifrado seguro utilizando protocolos TLSv1.2 y TLSv1.3.
- Cabeceras de seguridad inyectadas (`Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`).

### Generación de Certificados Let's Encrypt (Certbot)

Para obtener certificados SSL gratuitos y válidos, se recomienda utilizar Certbot en el servidor host:

1. Instalar Certbot:
   ```bash
   sudo apt update
   sudo apt install certbot
   ```
2. Obtener certificados usando el plugin `webroot` o de forma temporal deteniendo Nginx:
   ```bash
   sudo certbot certonly --standalone -d inventario.vdenergy.es
   ```
3. Mapear o copiar los certificados generados al directorio local configurado en los volúmenes del contenedor:
   - Certificado completo: `/etc/letsencrypt/live/inventario.vdenergy.es/fullchain.pem` -> `docs/nginx/certs/fullchain.pem`
   - Clave privada: `/etc/letsencrypt/live/inventario.vdenergy.es/privkey.pem` -> `docs/nginx/certs/privkey.pem`

Para pruebas locales, se puede utilizar el script de certificados autofirmados:
```bash
./docs/nginx/generate-certs.sh
```

## Rotación de Logs de Docker

Para evitar que los logs consuman todo el espacio en disco, configuramos el driver de logging de Docker en `docker-compose.prod.yml`:
```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```
Esto limita cada archivo de log a 10 Megabytes y conserva únicamente un histórico de las últimas 3 rotaciones por contenedor.

## Backups Automatizados

Para respaldar la base de datos de producción diariamente y mantener una retención de 7 días, se utiliza el siguiente script automatizado:

### Script de Backup (`backup.sh`)

Ubicado en `docs/backup.sh` en el servidor host:
```bash
#!/bin/bash
# Configuración del backup de base de datos
BACKUP_DIR="/var/backups/vdenergy"
DB_CONTAINER="vd_mysql_db_prod"
DB_NAME="vdenergy_db"
DB_USER="vd_admin"
# Cargar contraseña desde el entorno o archivo seguro .env
DB_PASSWORD=$(docker exec $DB_CONTAINER printenv MYSQL_PASSWORD)

# Crear directorio de backup si no existe
mkdir -p "$BACKUP_DIR"

# Nombre del archivo con timestamp
FILE_NAME="$BACKUP_DIR/backup-$(date +%F-%H%M%S).sql"

echo "Iniciando backup de la base de datos..."
docker exec $DB_CONTAINER mysqldump -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" > "$FILE_NAME"

if [ $? -eq 0 ]; then
  echo "Backup completado exitosamente: $FILE_NAME"
  # Comprimir el backup para ahorrar espacio
  gzip "$FILE_NAME"
else
  echo "ERROR: Falló el backup de base de datos."
  exit 1
fi

# Eliminar backups de más de 7 días de antigüedad
find "$BACKUP_DIR" -type f -name "backup-*.sql.gz" -mtime +7 -exec rm {} \;
echo "Limpieza de backups antiguos completada."
```

### Configuración del Cron Job

Para ejecutar este script diariamente a las 02:00 AM, agregar la siguiente regla al crontab del sistema:
```text
0 2 * * * /bin/bash /home/user/gestionDeInventario2.0/docs/backup.sh >> /var/log/vdenergy-backup.log 2>&1
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
