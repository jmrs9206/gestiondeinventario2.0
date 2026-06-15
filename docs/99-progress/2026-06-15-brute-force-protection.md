# 2026-06-15-production-hardening.md

    > Proyecto: StockFlow Inventory Management System  
    > Modo: Caveman Mode  
    > Fecha base: 2026-06-15

    ## Estado

```text
DONE
```

## Bloque

```text
Production-Hardening-And-Security-Checklist
```

## Tareas realizadas

- **Implementación del Bloqueo por Fuerza Bruta (Backend):**
  * Modificada la entidad [User.java](file:///home/jmrs/gestionDeInventario2.0/backend/src/main/java/com/stockflow/inventory/users/entity/User.java) para incluir los campos `failedLoginAttempts` y `lockoutUntil`, y sobreescrito el método `isAccountNonLocked()` de Spring Security para evaluar el tiempo de bloqueo.
  * Modificado el servicio de inicio de sesión manual [AuthService.java](file:///home/jmrs/gestionDeInventario2.0/backend/src/main/java/com/stockflow/inventory/auth/service/AuthService.java) para verificar el estado de bloqueo de la cuenta, incrementar los intentos fallidos, bloquear tras 5 fallos durante 15 minutos, y reiniciar el contador al iniciar sesión con éxito. Incluye lógica de desbloqueo pasivo eficiente.
  * Actualizado el bean `UserDetailsService` en [SecurityConfig.java](file:///home/jmrs/gestionDeInventario2.0/backend/src/main/java/com/stockflow/inventory/config/security/SecurityConfig.java) para que valide y rechace llamadas JWT si la cuenta del usuario ha sido bloqueada.
- **Migración SQL (Flyway):**
  * Creada la migración [V4__add_brute_force_protection_columns.sql](file:///home/jmrs/gestionDeInventario2.0/backend/src/main/resources/db/migration/V4__add_brute_force_protection_columns.sql) para añadir las columnas correspondientes en MySQL 8.4.
- **Nuevas Pruebas Unitarias de Seguridad:**
  * Diseñado y ejecutado suite de pruebas en [AuthServiceTest.java](file:///home/jmrs/gestionDeInventario2.0/backend/src/test/java/com/stockflow/inventory/auth/service/AuthServiceTest.java) que validan el comportamiento ante intentos de contraseña incorrecta, bloqueo de cuenta tras 5 intentos, rechazo de inicio de sesión de cuenta bloqueada, y desbloqueo pasivo si la ventana temporal expiró.
- **Configuración de Rate Limiting (Nginx):**
  * Modificado [nginx.conf](file:///home/jmrs/gestionDeInventario2.0/docs/nginx/nginx.conf) para definir una zona `limit_req_zone` de límite de solicitudes IP y aplicarla específicamente a la ruta `POST /api/v1/auth/login` con un burst de 5 y nodelay.
- **Automatización de Copias de Seguridad (Backup & Restore):**
  * Corregido y reescrito el script [backup.sh](file:///home/jmrs/gestionDeInventario2.0/docs/backup.sh) para cargar las variables dinámicamente desde el archivo `.env`, detectar el contenedor activo de MySQL en entornos dev o prod, y suprimir las alertas de privilegios mediante el flag `--no-tablespaces`.
  * Creado el script de restauración automatizado [restore.sh](file:///home/jmrs/gestionDeInventario2.0/docs/restore.sh) para agilizar procesos de recuperación de datos ante desastres.
  * Actualizado el documento de operaciones [BACKUP_RESTORE.md](file:///home/jmrs/gestionDeInventario2.0/docs/06-database/BACKUP_RESTORE.md) para reflejar los nuevos procedimientos automatizados.
- **Certificados SSL Automáticos (Let's Encrypt + Certbot Container):**
  * Modificado [nginx.conf](file:///home/jmrs/gestionDeInventario2.0/docs/nginx/nginx.conf) para añadir soporte a retos HTTP-01 de Let's Encrypt mapeando la ruta `.well-known/acme-challenge/` al directorio compartido `/var/www/certbot` en los puertos 80 y 443.
  * Modificado [docker-compose.prod.yml](file:///home/jmrs/gestionDeInventario2.0/docker-compose.prod.yml) para montar el volumen compartido del reto ACME en el proxy Nginx y añadir el contenedor sidecar de `certbot` configurado para verificar y renovar automáticamente los certificados SSL cada 12 horas.
  * Actualizado el documento [DEPLOYMENT_GUIDE.md](file:///home/jmrs/gestionDeInventario2.0/docs/02-technical-structure/DEPLOYMENT_GUIDE.md) detallando el funcionamiento de Certbot, la inyección segura de variables de entorno de producción directo al host para desacoplar el archivo `.env`, y las guías actualizadas de backups.
- **Escaneo de Vulnerabilidades (Trivy en CI/CD):**
  * Integrado el escáner de seguridad **Trivy (aquasecurity/trivy-action)** en la pipeline de integración continua [.github/workflows/ci.yml](file:///home/jmrs/gestionDeInventario2.0/.github/workflows/ci.yml) para analizar de manera estática y dinámica las imágenes finales de backend y frontend compiladas en busca de vulnerabilidades de severidad CRITICAL o HIGH.
- **Infraestructura de Pruebas E2E (Playwright):**
  * Instalado y configurado Playwright en el proyecto de frontend con [playwright.config.ts](file:///home/jmrs/gestionDeInventario2.0/frontend/playwright.config.ts), limitando los navegadores por defecto a Chromium para ejecuciones optimizadas en el host de desarrollo y CI.
  * Desarrollado suite de pruebas en [auth.spec.ts](file:///home/jmrs/gestionDeInventario2.0/frontend/e2e/auth.spec.ts) evaluando el renderizado de la UI de login, validación de mensajes de error de la API (en inglés) ante credenciales incorrectas, y el Happy Path de login exitoso con el administrador por defecto y su posterior redirección al panel de control.

## Archivos creados
- `backend/src/main/resources/db/migration/V4__add_brute_force_protection_columns.sql`
- `docs/99-progress/2026-06-15-brute-force-protection.md` (renombrado internamente a `2026-06-15-production-hardening.md` por alcance del bloque)
- `docs/restore.sh`
- `frontend/playwright.config.ts`
- `frontend/e2e/auth.spec.ts`

## Archivos modificados
- `backend/src/main/java/com/stockflow/inventory/users/entity/User.java`
- `backend/src/main/java/com/stockflow/inventory/auth/service/AuthService.java`
- `backend/src/main/java/com/stockflow/inventory/config/security/SecurityConfig.java`
- `backend/src/test/java/com/stockflow/inventory/auth/service/AuthServiceTest.java`
- `docs/nginx/nginx.conf`
- `docs/backup.sh`
- `docs/06-database/BACKUP_RESTORE.md`
- `docs/02-technical-structure/DEPLOYMENT_GUIDE.md`
- `docker-compose.prod.yml`
- `.github/workflows/ci.yml`
- `frontend/package.json`

## Validación

- **JUnit / Mockito Tests (Backend):** Ejecutado `mvn clean test` en el backend, completando con éxito todas las pruebas: **102/102 pruebas pasadas** (0 fallos, 0 errores).
- **Vitest Tests (Frontend):** Ejecutado `npm run test` completando con éxito: **10/10 pruebas pasadas**.
- **Playwright E2E Tests:** Ejecutado `npm run test:e2e` en el frontend, validando los flujos de login en Chromium contra los contenedores Docker en caliente: **3/3 pruebas pasadas** con éxito.
- **Docker Compose Production Build:** Construcción de producción exitosa recreando los contenedores de backend, Nginx y Certbot sin advertencias de compilación.
- **Backup & Restore Test:** Verificado el flujo completo ejecutando `bash docs/backup.sh` y verificando la generación del archivo comprimido `.sql.gz`.
