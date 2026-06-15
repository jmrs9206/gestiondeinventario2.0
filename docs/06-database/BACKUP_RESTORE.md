# BACKUP_RESTORE.md

    > Proyecto: StockFlow Inventory Management System  
    > Modo: Caveman Mode  
    > Fecha base: 2026-05-22

    ## Backup Automatizado

Para realizar copias de seguridad de la base de datos de manera automática en local, desarrollo o producción, utiliza el script [backup.sh](file:///home/jmrs/gestionDeInventario2.0/docs/backup.sh) localizado en la carpeta `docs/`.

Este script carga los secretos directamente del archivo `.env`, detecta el contenedor de base de datos MySQL activo y genera una copia de seguridad comprimida en la carpeta `/backups` con retención de 7 días.

Ejecución en el host:
```bash
bash docs/backup.sh
```

## Restauración Automatizada

Para restaurar una copia de seguridad comprimida, ejecuta el script [restore.sh](file:///home/jmrs/gestionDeInventario2.0/docs/restore.sh) pasando la ruta al archivo `.gz`:

Ejecución en el host:
```bash
bash docs/restore.sh backups/backup-YYYY-MM-DD-HHMMSS.sql.gz
```

## Reglas de Producción

- **Backups Diarios:** Configurar un `cron job` en el host para ejecutar `backup.sh` a diario.
- **Retención:** Retener al menos 30 días de backups en un entorno remoto (fuera del servidor).
- **Cifrado & Offsite:** Automatizar el copiado de los archivos `.sql.gz` resultantes a un almacenamiento en la nube externo (AWS S3, GCP Cloud Storage) de forma cifrada.
- **Monitoreo:** El script devuelve código de salida `1` en caso de error, lo cual permite integrarlo con herramientas de monitoreo (como cron alert) para alertar fallos de backup.

    ---

    ## Regla final IA

    La IA debe trabajar solo con el alcance explícito de este archivo, no debe inventar funcionalidad fuera del bloque o documento activo, y debe registrar progreso en `docs/99-progress/` cuando complete trabajo real.
