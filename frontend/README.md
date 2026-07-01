# StockFlow Inventory Management System - Frontend

Interfaz web profesional, reactiva y de alto impacto estético para la gestión de inventario y trazabilidad física de activos de StockFlow.

**Autor:** JMRS

---

## 🎨 Sistema de Diseño y Estética

El frontend implementa una estética de diseño premium personalizada:
- **Tema Monochrome Plomo/Zinc:** Configuración visual en tonos platinados, plomo y antracita (`zinc`) que transmiten profesionalismo y robustez técnica.
- **Glassmorphism:** Componentes con clases `.glass-card` que aprovechan efectos de traslúcidez, desenfoque de fondo y bordes satinados semi-transparentes.
- **Tipografía Moderna:** Carga dinámica optimizada de las fuentes *Outfit* e *Inter*.
- **Animaciones Suaves:** Microinteracciones de hover y transiciones animadas para botones, menús colapsables y charts para dinamizar la interacción.
- **Mobile First QR View:** La pantalla de escaneo móvil (`/i/[publicCode]`) simula una interfaz de aplicación móvil nativa con accesos directos táctiles de gran tamaño.

---

## 🚀 Tecnologías Principales

- **Core:** Next.js 16 (App Router con React Server Components)
- **Lenguaje:** TypeScript (Tipado estricto)
- **Librería de Iconos:** Lucide React
- **Estilos:** CSS Vanilla estructurado en variables globales de CSS (`index.css` / `globals.css`)
- **Visualización de Datos:** Recharts (para gráficos dinámicos de barras y pastel)
- **Pruebas:** Vitest junto con React Testing Library

---

## 📂 Estructura del Código

```text
frontend/
├── src/
│   ├── app/                # Rutas y páginas de Next.js (Dashboard, Login, Materiales, Auditoría, Configuración, Escaneo QR)
│   ├── components/         # Componentes transversales compartidos
│   ├── modules/            # Módulos encapsulados por dominio
│   │   ├── auth/           # Login, Proveedor de Autenticación (AuthProvider), Hooks y Formularios
│   │   ├── branding/       # Componentes y hooks de personalización visual dinámicos
│   │   ├── dashboard/      # Métricas KPI, Puestos de Trabajo y Gráficos estadísticos
│   │   └── materials/      # Tablas y modales para materiales, oficinas, usuarios e historiales de cambios
│   ├── services/           # Cliente HTTP centralizado (`api-client.ts`) para consultas al Backend
│   └── globals.css         # Estilos globales y tokens del sistema de diseño (colores, fondos, sombras)
├── Dockerfile              # Empaquetado de producción
├── package.json            # Scripts npm y dependencias
└── vitest.config.ts        # Configuración del motor de pruebas unitarias
```

---

## ⚙️ Desarrollo e Instalación

### 1. Instalar dependencias
```bash
npm install
```

### 2. Ejecutar servidor de desarrollo
Inicia el servidor local en http://localhost:3000:
```bash
npm run dev
```

### 3. Compilación de Producción
Genera la build optimizada del cliente:
```bash
npm run build
```

---

## 🧪 Pruebas Unitarias

El frontend incluye cobertura de pruebas para componentes interactivos y hooks de autenticación. Ejecuta la suite de pruebas mediante Vitest:
```bash
npm run test
```
