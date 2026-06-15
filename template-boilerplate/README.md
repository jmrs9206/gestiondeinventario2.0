# Plantilla Boilerplate Full-Stack Dockerizada (Marca)

Esta es una plantilla de desarrollo e inicio de proyecto full-stack completamente responsiva, limpia, moderna y orientada al usuario. Está lista para producción, estructurada en Docker y diseñada con altos estándares estéticos y de UI/UX.

---

## 1. Estructura de Directorios del Proyecto

```text
template-boilerplate/
├── docker-compose.yml
├── README.md
├── db/
│   └── init.sql                  # Inicialización y semillas de base de datos
├── backend/
│   ├── Dockerfile                # Construcción optimizada multi-etapa
│   ├── package.json              # Dependencias y scripts Node/Express
│   ├── tsconfig.json             # Configuración TypeScript del backend
│   └── src/
│       └── index.ts              # Servidor API REST con conexión a Postgres
└── frontend/
    ├── Dockerfile                # Compilación y servidor estático Nginx para producción
    ├── package.json              # Dependencias y scripts React/Vite
    ├── vite.config.ts            # Configuración del servidor y bundler Vite
    ├── tsconfig.json             # Configuración TypeScript del frontend
    ├── index.html                # Punto de entrada HTML
    ├── public/
    │   └── assets/
    │       └── brand/
    │           └── logo.svg      # Logo corporativo de "Marca"
    └── src/
        ├── main.tsx              # Script de montaje React
        ├── App.tsx               # Layout responsivo, cambio de temas y consumo de API
        ├── index.css             # Hoja de estilos con variables de color y temas contrastados
        └── vite-env.d.ts         # Declaraciones de tipos para variables de entorno de Vite
```

---

## 2. Arquitectura Tecnológica y UI/UX

### Frontend (Vite + React + TypeScript + Vanilla CSS)
* **Tema Claro:** Se implementó una base de Blanco Hueso (`#f6f5f0`) combinada con componentes y paneles de fondo blanco puro (`#ffffff`). El texto en tema claro utiliza un tono negro carbón/mate muy oscuro (`#17181c`) para un contraste de lectura perfecto.
* **Tema Oscuro:** Usa un fondo gris pizarra muy oscuro (`#0d0f12`) y paneles de fondo (`#181b21`). Se resolvieron estrictamente las colisiones de "oscuro sobre oscuro" garantizando que los textos secundarios y bordes utilicen tonos lo suficientemente claros y legibles (`#f8fafc`, `#cbd5e1`, `#313745`).
* **Visual Premium:** Se evitaron espaciados e inercias visuales exageradas. La densidad de información es compacta y optimizada con micro-animaciones en botones y transiciones suaves (`var(--transition-speed)`).

### Backend (Express + TypeScript + PostgreSQL)
* Servidor REST ultraligero que sirve de puente entre el almacenamiento de datos persistente de PostgreSQL y las interfaces del frontend.
* Expone servicios de salud de sistema (`/api/health`), listado y creación de ítems de inventario y listado de usuarios.

### Base de Datos (PostgreSQL 15)
* Inicializa automáticamente tablas de `users` y de `items` e inserta datos iniciales semillas para poder visualizar información en el primer arranque.

---

## 3. Guía de Ejecución en Local (Docker)

Para levantar todo el entorno de desarrollo y base de datos con un único comando:

```bash
# Desde la raíz del directorio template-boilerplate/
docker compose up --build -d
```

### Puertos expuestos localmente:
* **Frontend Dashboard:** [http://localhost:3000](http://localhost:3000)
* **Backend API server:** [http://localhost:8080](http://localhost:8080)
* **Base de Datos PostgreSQL:** `localhost:5432`

Para apagar el entorno limpiando los contenedores:
```bash
docker compose down -v
```
