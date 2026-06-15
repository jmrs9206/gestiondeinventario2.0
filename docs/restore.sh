#!/bin/bash
# Restore script for StockFlow database
# Must be executed on the host machine.

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

if [ -z "$1" ]; then
  echo "Uso: $0 <ruta_al_archivo_backup.sql.gz>"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "ERROR: El archivo de backup no existe: $BACKUP_FILE"
  exit 1
fi

# Determine active database container
DB_CONTAINER="stockflow_mysql_db_prod"
if ! docker ps --format '{{.Names}}' | grep -q "$DB_CONTAINER"; then
  if docker ps --format '{{.Names}}' | grep -q "stockflow_mysql_db"; then
    DB_CONTAINER="stockflow_mysql_db"
  else
    echo "ERROR: MySQL container is not running."
    exit 1
  fi
fi

# If the file is compressed, we need to gunzip it first (temporarily)
TEMP_SQL=""
if [[ "$BACKUP_FILE" == *.gz ]]; then
  echo "Descomprimiendo archivo temporal..."
  TEMP_SQL="${BACKUP_FILE%.gz}.tmp.sql"
  gunzip -c "$BACKUP_FILE" > "$TEMP_SQL"
  SQL_TO_RESTORE="$TEMP_SQL"
else
  SQL_TO_RESTORE="$BACKUP_FILE"
fi

echo "Iniciando restauración de base de datos '$DB_NAME' en contenedor '$DB_CONTAINER'..."
# Restore SQL file into container
docker exec -i "$DB_CONTAINER" mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$SQL_TO_RESTORE"

RESULT=$?

# Clean up temp file
if [ -n "$TEMP_SQL" ] && [ -f "$TEMP_SQL" ]; then
  rm "$TEMP_SQL"
fi

if [ $RESULT -eq 0 ]; then
  echo "Restauración completada exitosamente!"
else
  echo "ERROR: Falló la restauración de la base de datos."
  exit 1
fi
