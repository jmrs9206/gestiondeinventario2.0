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
