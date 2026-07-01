# StockFlow Inventory Management System - Backend

Motor de servicios REST monolítico modular, seguro e integral para la gestión y trazabilidad de inventarios corporativos de StockFlow.

**Autor:** JMRS

---

## 🚀 Tecnologías y Arquitectura

- **Framework Principal:** Spring Boot 3.2.x (Java 21)
- **Seguridad:** Spring Security con Tokens JWT y renovación por Cookies Seguras (`httpOnly`, `Secure`, `SameSite`)
- **Acceso a Datos:** Spring Data JPA con Hibernate
- **Base de Datos:** MySQL 8.0+
- **Migración de Esquema:** Flyway
- **Normalización de Texto:** Conversión estricta a mayúsculas y remoción de acentos/tildes en español mediante la utilidad `TextNormalizer` antes de persistir en base de datos.
- **Códigos QR:** Generación de payloads QR con URL dinámica configurable (`app.frontend-url`) y renderizado de imágenes dinámicas (SVG y PNG) mediante ZXing Core.

---

## 📂 Arquitectura de Módulos (Modular Monolith)

La lógica del servidor está estructurada en paquetes modulares cohesivos:
```text
backend/src/main/java/com/stockflow/inventory/
├── audit/          # Registro de auditoría global del sistema (servicios y entidad AuditLog)
├── auth/           # Controladores de acceso, JWT, generación y revocación de Refresh Tokens
├── common/         # Controladores comunes (branding, salud), excepciones globales y utilidades de normalización
├── config/         # Configuración del servidor (seguridad CORS, filtros JWT, configuración base)
├── dashboard/      # Lógica de recopilación de métricas e indicadores de capacidad de puestos de trabajo
├── inventory/      # Historial de operaciones, traslados e incidencias físicas (MaterialHistory)
├── mail/           # Envío de notificaciones de credenciales de usuario por correo electrónico
├── materials/      # Entidades, repositorios y servicios de gestión de materiales e impresión de códigos QR
├── offices/        # Administración de oficinas físicas corporativas
├── publicapi/      # Controladores públicos con validación selectiva por API Keys y control de ámbitos (scopes)
└── users/          # Administración de cuentas de usuario y asignación de roles
```

---

## ⚙️ Configuración y Ejecución

### 1. Variables de Entorno
El backend lee propiedades críticas definidas en el archivo `.env` raíz o del sistema:
- `DB_URL` / `DB_USER` / `DB_PASSWORD`: Parámetros de conexión a la base de datos.
- `JWT_SECRET`: Llave secreta para firmar los tokens JWT.
- `APP_FRONTEND_URL`: URL del cliente Next.js utilizada para armar los payloads QR.
- `BRANDING_APP_NAME`: Nombre principal de la marca (ej: `GESTION DE INVENTARIO`).

### 2. Comandos de Maven
Ejecuta el backend en modo de desarrollo local:
```bash
mvn clean spring-boot:run
```

---

## 🧪 Pruebas Unitarias y de Integración

### Pruebas Unitarias (Mockito)
Valida la lógica de negocio y los controladores mocking:
```bash
mvn test
```

### Pruebas de Integración (Testcontainers)
Inicia y ejecuta las pruebas de integración integrando un contenedor Docker MySQL real:
```bash
mvn clean verify
```
*Si deseas acelerar la ejecución local ignorando el test de migración de base de datos Flyway:*
```bash
mvn test -Dtest=!DatabaseMigrationIntegrationTest
```
