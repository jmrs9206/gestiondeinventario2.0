#!/bin/bash
# Backup script for StockFlow database
# Must be executed on the host machine where the docker containers are running.

# Locate project directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Load environment variables
if [ -f "$PROJECT_DIR/.env" ]; then
  # Read variables from .env ignoring comments
  export $(grep -v '^#' "$PROJECT_DIR/.env" | xargs)
else
  echo "ERROR: .env file not found at $PROJECT_DIR/.env"
  exit 1
fi

# Configuration
BACKUP_DIR="$PROJECT_DIR/backups"
DB_CONTAINER="stockflow_mysql_db_prod" # Name in docker-compose.prod.yml

# In case it is running in development mode, check which container is up
if ! docker ps --format '{{.Names}}' | grep -q "$DB_CONTAINER"; then
  if docker ps --format '{{.Names}}' | grep -q "stockflow_mysql_db"; then
    DB_CONTAINER="stockflow_mysql_db"
  else
    echo "ERROR: MySQL container is not running."
    exit 1
  fi
fi

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"

# File name with timestamp
FILE_NAME="$BACKUP_DIR/backup-$(date +%F-%H%M%S).sql"

echo "Iniciando backup de la base de datos '$DB_NAME' desde el contenedor '$DB_CONTAINER'..."

# Run mysqldump inside the container using variables from .env
docker exec "$DB_CONTAINER" mysqldump --no-tablespaces -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" > "$FILE_NAME"

if [ $? -eq 0 ]; then
  echo "Backup completado exitosamente: $FILE_NAME"
  # Compress backup
  gzip -f "$FILE_NAME"
  echo "Backup comprimido: ${FILE_NAME}.gz"
else
  echo "ERROR: Falló el backup de la base de datos."
  exit 1
fi

# Clean up backups older than 7 days
find "$BACKUP_DIR" -type f -name "backup-*.sql.gz" -mtime +7 -exec rm {} \;
echo "Limpieza de backups antiguos completada."
