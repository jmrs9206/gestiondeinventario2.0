# Gestión De Inventario - StockFlow

Sistema profesional e integral para la gestión, control y trazabilidad de inventario corporativo (periféricos, dispositivos de red, workstations y mobiliario) de StockFlow.

**Autor:** JMRS

---

## 🚀 Características Principales

- **Gestión de Inventario (CRUD):** Control centralizado de materiales, oficinas y estados físicos de equipos (`OPERATIVO`, `ROTO`, `EN_REPARACION`, `BAJA`).
- **Normalización de Datos Estricta:** Motor de normalización backend que asegura que toda la información ingresada (nombres, marcas, modelos, números de serie y comentarios) se almacene automáticamente en **mayúsculas y libre de acentos o tildes** para homogeneidad e integridad en búsquedas.
- **Seguridad Robusta:** Autenticación por JWT, Refresh Token en cookie segura (httpOnly), encriptación BCrypt y autorización estricta basada en roles (`ADMIN` / `TECNICO`).
- **Integración Externa:** API Pública asegurada mediante API Keys restrictivas y control de ámbitos de acceso (`READ_MATERIALS`, `WRITE_USERS`).
- **Trazabilidad Absoluta:** Historial de movimientos de materiales con comentarios descriptivos obligatorios y registro de auditoría global del sistema.
- **Identificación Física y QR Dinámico:**
  - Generación de códigos QR mediante `public_code` alfanumérico seguro y no secuencial.
  - Enlaces de QR configurables dinámicamente según el entorno (`APP_FRONTEND_URL`) eliminando dominios fijos en el código.
- **Branding Centralizado desde Backend**: La identidad visual (logotipo, favicon, paleta de colores, nombre del sistema y empresa) se administra estrictamente desde las propiedades del servidor. La sección de configuración en el frontend funciona en modo lectura exclusiva.
- **Diseño Visual Premium**: Interfaz moderna basada en un sistema de diseño monochrome ("plomo/zinc") con bordes satinados, microanimaciones reactivas, charts dinámicos y adaptabilidad móvil nativa.

---

## 📂 Estructura del Repositorio

```text
gestionDeInventario2.0/
├── backend/                    # Lógica de negocio (Spring Boot 3) y servicios API
│   ├── src/                    # Controladores, servicios, entidades JPA y utilidades
│   ├── pom.xml                 # Dependencias Maven y configuración del build
│   └── Dockerfile              # Construcción optimizada en dos fases de la imagen de producción
├── frontend/                   # Interfaz interactiva de usuario (Next.js 16 - App Router)
│   ├── src/                    # Componentes UI (React), páginas, hooks de estado y estilos CSS
│   ├── package.json            # Scripts de ejecución y dependencias npm
│   ├── vitest.config.ts        # Configuración del entorno de pruebas unitarias
│   └── Dockerfile              # Empaquetado optimizado del cliente
├── docs/                       # Documentación técnica, ADRs y especificaciones
│   ├── 00-project/             # AI Runbook, Master Rules y Roadmap
│   ├── 01-architecture/        # Decisiones de Arquitectura (ADR)
│   ├── 02-technical-structure/ # Guías de base de datos, seguridad, despliegue y QR
│   ├── 05-api/                 # Contrato e interfaz API (openapi.yaml)
│   └── nginx/                  # Proxy inverso y certificados SSL para producción
├── docker-compose.yml          # Orquestación de desarrollo local (Base de datos expuesta)
├── docker-compose.prod.yml     # Orquestación endurecida de producción con SSL Nginx
├── .env.example                # Plantilla de variables de entorno configurables
└── README.md                   # Este archivo
```

---

## 🛠️ Requisitos del Sistema

- **Java Development Kit (JDK) 21**
- **Node.js v20.x o superior** (y gestor de paquetes npm)
- **Maven v3.8+**
- **Docker y Docker Compose v2.0+**

---

## 💻 Inicio Rápido Local (Desarrollo)

### 1. Configuración de Variables
Copia la plantilla de variables de entorno y define tus credenciales:
```bash
cp .env.example .env
```

### 2. Ejecutar el Backend (Spring Boot)
1. Asegúrate de tener una base de datos MySQL local configurada con los accesos definidos en tu archivo `.env`.
2. Ejecuta el backend:
   ```bash
   cd backend
   mvn clean spring-boot:run
   ```
   *El servidor de backend levantará en http://localhost:8080. Las migraciones de base de datos se aplicarán automáticamente a través de Flyway.*

### 3. Ejecutar el Frontend (Next.js)
1. Instala los paquetes requeridos:
   ```bash
   cd frontend
   npm install
   ```
2. Inicia el servidor local de desarrollo:
   ```bash
   npm run dev
   ```
   *La aplicación estará accesible en http://localhost:3000.*

---

## 🐳 Despliegue con Docker

### Modo Desarrollo (Local)
Para iniciar la infraestructura de desarrollo local completa (MySQL expuesto en `3306`, Backend en `8080`, Frontend en `3001` mapeado internamente al puerto `3000`):
```bash
docker-compose down && docker-compose up --build -d
```

### Modo Producción (Seguro)
Levanta la infraestructura endurecida, con aislamiento de puertos, límites de consumo de memoria, rotación de logs dockerizada, y el servidor Nginx proxy inverso gestionando la redirección de puertos y SSL:
1. Genera certificados de seguridad autofirmados para el entorno:
   ```bash
   ./docs/nginx/generate-certs.sh
   ```
2. Inicia los servicios de producción:
   ```bash
   docker-compose -f docker-compose.prod.yml down && docker-compose -f docker-compose.prod.yml up --build -d
   ```

---

## 🧪 Ejecución de Pruebas (Test Suites)

### Pruebas del Backend (JUnit / Testcontainers)
El backend ejecuta pruebas unitarias de lógica y pruebas de integración reales de base de datos levantando contenedores desechables MySQL mediante Testcontainers:
```bash
cd backend
mvn clean verify
```
*Para pruebas locales rápidas sin base de datos Docker Ryuk activa:*
```bash
mvn test -Dtest=!DatabaseMigrationIntegrationTest
```

### Pruebas del Frontend (Vitest / React Testing Library)
El frontend contiene cobertura de tests de componentes y hooks:
```bash
cd frontend
npm run test
```

---

## 📱 Flujo de Trazabilidad QR

1. **Creación:** Cuando un usuario registra un material, el sistema calcula un `public_code` no predecible (ej: `MAT_MONITOR_6A24AFC8`) y genera un código QR cuya URL apunta a `[APP_FRONTEND_URL]/i/[publicCode]`.
2. **Escaneo:** Al escanear físicamente el código QR con un dispositivo móvil, el usuario abre la vista optimizada de detalles.
3. **Acción de Operaciones**:
   * Si no está autenticado, la UI almacena la ubicación y le redirige a la pantalla de Login para proteger los accesos.
   * El personal técnico autorizado (`ADMIN` o `TECNICO`) puede actualizar de inmediato la ubicación física (oficina) o reportar incidencias.
   * Si un equipo se declara de `BAJA`, el sistema obliga a describir detalladamente la justificación de desecho para conservar el registro histórico de trazabilidad.

---

## 🔍 Resolución de Problemas (Troubleshooting)

### 1. Error de Conexión de Base de Datos
- **Problema:** El backend falla indicando `Connection refused` al arrancar.
- **Solución:** Verifica que el servicio de MySQL local esté activo o que las credenciales del archivo `.env` coincidan. Si usas Docker Compose, comprueba que el contenedor `vd_mysql_db` esté en estado saludable (`docker ps`).

### 2. Acceso Denegado por Docker / Permisos de Socket
- **Problema:** Las pruebas de Testcontainers en el backend fallan indicando problemas de conexión con el docker daemon.
- **Solución:** Asegúrate de que Docker esté iniciado. En entornos Linux, comprueba que tu usuario pertenezca al grupo `docker`:
  ```bash
  sudo usermod -aG docker $USER
  newgrp docker
  ```

### 3. Nginx falla al arrancar por certificados SSL
- **Problema:** En el despliegue de producción, el contenedor de Nginx se detiene por la falta de certificados SSL.
- **Solución:** Asegúrate de ejecutar `./docs/nginx/generate-certs.sh` antes de levantar `docker-compose.prod.yml`.
