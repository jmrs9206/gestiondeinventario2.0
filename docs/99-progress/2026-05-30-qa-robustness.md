# 2026-05-30-qa-robustness.md

> Proyecto: StockFlow Inventory Management System  
> Modo: Caveman Mode  
> Fecha base: 2026-05-30

## Trabajo Realizado

Hemos implementado mejoras críticas para garantizar la trazabilidad de la API Pública, el manejo global de errores y la robustez de las pruebas automáticas.

### 1. Trazabilidad de la API Pública (Auditoría)
- **Resolución dinámica de ejecutor:** Se modificó `AuditService` para que detecte automáticamente el principal autenticado en el contexto de seguridad (`SecurityContextHolder`). Si se trata de un `ApiClient` (autenticación por API Key), el tipo de ejecutor se registra como `API_CLIENT` y su ID se toma de `client.getPublicId()`.
- **Acceso Denegado Auditable:** Actualizamos el `AccessDeniedHandler` en `SecurityConfig` para identificar si el principal denegado es un cliente API Key, en cuyo caso registra un evento `PUBLIC_API_DENIED` para la entidad `ApiClient`.
- **Alineación con Catálogo:** Se cambiaron los eventos de fallo de clave API en `PublicApiService` de `PUBLIC_API_ACCESS_FAILED` a `PUBLIC_API_DENIED`, alineándose 100% con `docs/09-audit/AUDIT_EVENTS_CATALOG.md`.
- **Resiliencia ante Fallos de Auditoría:** Implementamos propagación transaccional `REQUIRES_NEW` en `AuditService.logEvent` y capturamos cualquier excepción de base de datos. De esta forma, si la persistencia de auditoría falla, la transacción de negocio principal NO se revierte (cumpliendo la regla: *"No lanzar excepción si falla auditoría sin registrar error técnico"*).
- **Prevención de Errores de Base de Datos:** Agregamos truncamiento preventivo de campos según los límites de la base de datos (e.g. `userAgent` a 500, `entityType` a 80, etc.) para evitar fallos de integridad por datos demasiado largos.

### 2. Manejo Global de Errores
- **Cobertura de Excepciones Comunes de Spring (Backend):** Extendimos `GlobalExceptionHandler` para capturar y estructurar en respuestas JSON consistentes las siguientes excepciones:
  - `HttpMessageNotReadableException` (Cuerpo JSON malformado / vacío) -> HTTP 400 (`MALFORMED_JSON`)
  - `HttpRequestMethodNotSupportedException` (Método HTTP no soportado) -> HTTP 405 (`METHOD_NOT_ALLOWED`)
  - `MethodArgumentTypeMismatchException` (Tipo de parámetro incorrecto) -> HTTP 400 (`TYPE_MISMATCH`)
  - `MissingServletRequestParameterException` (Parámetro requerido faltante) -> HTTP 400 (`MISSING_PARAMETER`)
  - `ConstraintViolationException` (Validación de JPA/Parámetros) -> HTTP 400 (`VALIDATION_FAILED`)
  - `MissingRequestHeaderException` (Cabecera requerida faltante) -> HTTP 400 (`MISSING_HEADER`)
- **Trazabilidad Operacional:** Agregamos logging a nivel `warn` para errores de entrada del cliente y `error` (incluyendo stack trace completo) para errores genéricos del servidor (`Exception.class`).
- **Manejo de Errores en UI (Frontend):**
  - Creado [error.tsx](file:///home/jmrs/gestionDeInventario2.0/frontend/src/app/error.tsx) a nivel de la raíz del frontend para capturar cualquier fallo de renderizado en páginas y ofrecer controles de reinicio/reintento integrados en una interfaz oscura y pulida.
  - Creado [global-error.tsx](file:///home/jmrs/gestionDeInventario2.0/frontend/src/app/global-error.tsx) para capturar cualquier fallo crítico del sistema a nivel del layout raíz de Next.js.

### 3. Cobertura y Robustez de Testing
- **Mockito Unit Testing para Servicios Backend:**
  - Diseñado e implementado `MaterialServiceTest.java` utilizando JUnit 5 y Mockito para probar la lógica de creación de materiales, validación de oficinas activas y registro de historial operacional.
  - Diseñado e implementado `AuthServiceTest.java` para verificar de forma aislada las validaciones de acceso de usuarios (usuarios inactivos, contraseñas erróneas, generación exitosa de JWT y refresh tokens).
  - Diseñado e implementado `DashboardServiceTest.java` para evaluar de manera aislada el cómputo de KPIs e incidencias y la distribución de equipos por oficinas activas.
- **Nuevos Tests de Integración:** Añadimos `GlobalExceptionAndAuditIntegrationTest.java` para evaluar de manera automatizada:
  - Manejo de JSON malformado y métodos HTTP no soportados.
  - Resiliencia transaccional cuando la base de datos de auditoría falla.
- **Robustez en Tests Existentes:** Actualizamos `PublicApiControllerTest.java` para validar que los logs de auditoría contengan el tipo de ejecutor `API_CLIENT` y el ID del cliente correspondiente en los accesos de la API pública.

---

## Validación

- **Backend:** Se compilaron y ejecutaron con éxito todas las pruebas unitarias y de integración. **Total: 92/92 tests aprobados** (0 fallos, 0 errores, 100% de éxito).
- **Frontend:** Se compilaron todas las páginas estáticas de producción (`npm run build`) y se validó el suite de pruebas en Vitest. **Total: 10/10 tests de frontend aprobados** (100% de éxito).
