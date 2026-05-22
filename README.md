# VDEnergy Inventory Management System

Sistema profesional de gestión de inventario para periféricos y mobiliario de oficina de VDEnergy.

## Características principales

- **Gestión de Inventario:** Control de materiales, oficinas y estados de los equipos (`OPERATIVO`, `ROTO`, `EN_REPARACION`, `BAJA`).
- **Seguridad:** Autenticación por JWT, Refresh Token persistido y revocable, BCrypt para almacenamiento de contraseñas.
- **Acceso Externo:** API Pública con API Key + scopes.
- **Trazabilidad:** Historial de materiales y registro de auditoría técnica global.
- **QR:** Generación de códigos QR únicos usando `public_code` no secuencial.
- **Tecnologías:** Java 21, Spring Boot 3, Next.js, MySQL 8, Docker y Docker Compose.

## Estructura del repositorio

```text
gestionDeInventario-Vdenergy/
├── backend/                  # Código fuente del Backend (Spring Boot 3)
├── frontend/                 # Código fuente del Frontend (Next.js)
├── docs/                     # Documentación técnica y guía de progreso
├── docker-compose.yml        # Configuración de contenedores Docker
├── .env.example              # Plantilla de variables de entorno
└── README.md                 # Este archivo
```

## Requisitos de desarrollo

- Java 21 JDK
- Node.js (v18+)
- Docker y Docker Compose
- Maven 3.8+

## Inicio Rápido (Local)

1. Copia `.env.example` a `.env` y configura tus credenciales:
   ```bash
   cp .env.example .env
   ```
2. Revisa la documentación en `docs/` para ver las guías de cada fase del proyecto.
