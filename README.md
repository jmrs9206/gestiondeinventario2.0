# Inventory Management System

Sistema profesional e integral para la gestión y trazabilidad de inventario (periféricos, dispositivos de red y mobiliario) de StockFlow.

---

## 🚀 Características Principales

- **Gestión de Inventario (CRUD):** Control de materiales, oficinas y estados controlados de equipos (`OPERATIVO`, `ROTO`, `EN_REPARACION`, `BAJA`).
- **Seguridad Robusta:** Autenticación por JWT, Refresh Token en cookie segura (httpOnly), encriptación BCrypt y autorización basada en roles (`ADMIN` / `TECNICO`).
- **Integración Externa:** API Pública asegurada mediante API Keys restrictivas y control de scopes (`READ_MATERIALS`, `WRITE_USERS`).
- **Trazabilidad Absoluta:** Historial detallado de movimientos de materiales con justificaciones y registro de auditoría global del sistema.
- **Códigos QR Inteligentes:** Identificación física mediante `public_code` alfanumérico seguro y no secuencial de 8 caracteres, con renderizado de imagen QR dinámica.
- **Arquitectura de Alta Calidad:** Backend monolítico modular en Spring Boot 3 y Frontend interactivo moderno en Next.js (App Router) estilizado con CSS personalizado premium.

---

## 📂 Estructura del Repositorio

```text
gestionDeInventario2.0/
├── backend/                    # Código fuente del Backend (Spring Boot 3)
│   ├── src/                    # Lógica de negocio (modular) y controladores REST
│   ├── pom.xml                 # Definición de dependencias Maven
│   └── Dockerfile              # Configuración de compilación en dos etapas de la imagen backend
├── frontend/                   # Código fuente del Frontend (Next.js 16)
│   ├── src/                    # Componentes UI, páginas, hooks y estilos CSS
│   ├── package.json            # Scripts npm y dependencias frontend
│   ├── vitest.config.ts        # Configuración de Vitest para pruebas
│   └── Dockerfile              # Configuración de empaquetado Docker
├── docs/                       # Documentación técnica, ADRs e histórico de progreso
│   ├── 00-project/             # AI Runbook, Master Rules, Roadmap de fases
│   ├── 01-architecture/        # Registro de Decisiones de Arquitectura (ADR)
│   ├── 02-technical-structure/ # Guía de despliegue, BD, seguridad y QR
│   ├── 05-api/                 # Contrato e interfaz API (openapi.yaml)
│   └── nginx/                  # Configuración de proxy inverso de producción y SSL
├── docker-compose.yml          # Orquestación de desarrollo local (Backend + Frontend + MySQL)
├── docker-compose.prod.yml     # Orquestación de producción (Nginx SSL + Backend + Frontend + MySQL)
├── .env.example                # Plantilla de variables de entorno configurables
└── README.md                   # Este archivo
```

---

## 🛠️ Requisitos del Sistema

- **Java Development Kit (JDK) 21**
- **Node.js v20.x o superior** (junto con npm)
- **Maven v3.8+**
- **Docker y Docker Compose v2.0+**

---

## 💻 Inicio Rápido Local (Sin Docker)

### 1. Configuración de Entorno
Copia el archivo de plantilla y rellena tus secrets y credenciales de base de datos:
```bash
cp .env.example .env
```

### 2. Configuración y Ejecución del Backend
1. Asegúrate de tener una base de datos MySQL local llamada igual que la variable `DB_NAME` en tu `.env`.
2. Compila y ejecuta el backend:
   ```bash
   cd backend
   mvn clean spring-boot:run
   ```
   *El backend iniciará en http://localhost:8080. Flyway aplicará automáticamente las migraciones en la base de datos.*

### 3. Configuración y Ejecución del Frontend
1. Instala las dependencias necesarias:
   ```bash
   cd frontend
   npm install
   ```
2. Ejecuta el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   *El frontend iniciará en http://localhost:3000.*

---

## 🐳 Despliegue con Docker

### Modo Desarrollo (Local)
Para levantar todo el entorno (Base de datos expuesta en el puerto `3306`, Backend en `8080` y Frontend en `3000`):
```bash
docker compose up --build -d
```

### Modo Producción (Seguro)
Levanta la infraestructura endurecida con aislamiento de puertos de base de datos, límites de consumo de recursos de contenedores, rotación de logs dockerizada, y el servidor Nginx reverse proxy gestionando la redirección de puertos y SSL:
1. Genera certificados SSL de pruebas/desarrollo:
   ```bash
   ./docs/nginx/generate-certs.sh
   ```
2. Levanta la infraestructura de producción:
   ```bash
   docker compose -f docker-compose.prod.yml up --build -d
   ```
   *El sistema estará disponible de forma segura a través de HTTPS en https://localhost o el dominio asignado (e.g. https://inventario.tuempresa.com).*

---

## 🧪 Ejecución de Pruebas (Test Suites)

### Backend (Pruebas Unitarias, Integración y Contenedores)
El backend ejecuta pruebas unitarias (Mockito) y de integración real de base de datos mediante contenedores desechables MySQL con Testcontainers:
```bash
cd backend
mvn clean verify
```

### Frontend (Pruebas Unitarias y de Componentes UI)
El frontend ejecuta pruebas unitarias y de montaje de interfaz de usuario con Vitest y React Testing Library:
```bash
cd frontend
npm run test
```

---

## 📱 Flujo de Trazabilidad QR

1. **Generación:** Al crear un material, el sistema calcula un `public_code` criptográficamente seguro (ej: `mat_f8c2e9b1`) y genera un código QR que apunta a `/i/mat_f8c2e9b1`.
2. **Escaneo:** Al escanear físicamente la etiqueta QR, el usuario es redirigido a la vista optimizada para dispositivos móviles en `/i/[publicCode]`.
3. **Acciones Rápidas:**
   - Si no está autenticado, la UI captura el destino y redirige al flujo de login para asegurar la sesión.
   - El personal autorizado (`ADMIN` o `TECNICO`) puede realizar traslados de oficina o reportar estados físicos directamente en la pantalla móvil.
   - Si el equipo se reporta como `BAJA`, la interfaz solicita de manera obligatoria la justificación del desecho, registrando la baja en el histórico de movimientos.

---

## 🔍 Resolución de Problemas (Troubleshooting)

### 1. Error de Conexión de Base de Datos
- **Problema:** El backend falla al iniciar debido a un error `Connection refused`.
- **Solución:** Verifica que el servicio MySQL local esté corriendo, o que las credenciales e IP de base de datos definidas en el archivo `.env` coincidan exactamente con la base de datos MySQL activa. Si usas Docker Compose, comprueba que el contenedor `vd_mysql_db` esté saludable (`docker ps`).

### 2. Acceso Denegado por Docker / Socket Permission
- **Problema:** Las pruebas de Testcontainers en el backend fallan indicando `Can't connect to local MySQL/Docker daemon`.
- **Solución:** Verifica que el demonio de Docker esté activo en tu máquina de desarrollo. Si estás en Linux, asegúrate de que tu usuario tenga los permisos necesarios y pertenezca al grupo `docker`:
  ```bash
  sudo usermod -aG docker $USER
  newgrp docker
  ```

### 3. Error en Next.js por "searchParams"
- **Problema:** Fallo de static rendering durante `npm run build` en el frontend relacionado con páginas dinámicas que consumen parámetros de búsqueda.
- **Solución:** Asegúrate de que todos los componentes que leen parámetros del cliente (`searchParams`) estén envueltos en componentes de carga asíncrona `<Suspense>` para evitar advertencias de pre-renderizado estático.

### 4. Nginx falla al arrancar por certificados
- **Problema:** En el despliegue de producción, el contenedor de Nginx se detiene por la falta de certificados SSL.
- **Solución:** Asegúrate de ejecutar `./docs/nginx/generate-certs.sh` antes de levantar `docker-compose.prod.yml`, o asegúrate de que los archivos `fullchain.pem` y `privkey.pem` estén mapeados correctamente en el directorio `/etc/nginx/certs` dentro del contenedor.
