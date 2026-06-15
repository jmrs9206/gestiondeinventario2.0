# FRONTEND_STRUCTURE.md

    > Proyecto: StockFlow Inventory Management System  
    > Modo: Caveman Mode  
    > Fecha base: 2026-05-22

    ## Objetivo

Definir estructura oficial frontend.

## Stack

```text
Next.js latest
React latest
TypeScript
TailwindCSS
shadcn/ui
lucide-react
recharts
```

## Estructura

```text
frontend/
├── package.json
├── Dockerfile
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── public
└── src
    ├── app
    ├── components
    ├── modules
    ├── services
    ├── hooks
    ├── lib
    ├── types
    ├── providers
    └── constants
```

## App Router

Obligatorio usar `src/app`.

Rutas previstas:

```text
/login
/dashboard
/materials
/materials/[publicCode]
/offices
/users
/audit
/settings
/i/[publicCode]
```

## Modules

```text
modules/
├── auth
├── users
├── offices
├── materials
├── inventory
├── dashboard
├── audit
└── public-api
```

Cada módulo puede tener:

```text
components
hooks
services
types
validations
utils
```

## Services

No hacer fetch directo desde componentes.

Usar:

```text
services/api-client.ts
services/auth.service.ts
services/material.service.ts
services/office.service.ts
services/user.service.ts
```

## Estados UI obligatorios

Cada pantalla debe manejar:

- loading
- error
- empty
- success

## Mobile first

Prioritario en:

- QR
- detalle material
- cambio estado
- cambio oficina

## Seguridad frontend

Nunca guardar:

- passwords
- API keys
- secrets

El frontend no decide permisos finales. Backend valida siempre.

## Validación

```bash
npm run build
npm run test
```

    ---

    ## Regla final IA

    La IA debe trabajar solo con el alcance explícito de este archivo, no debe inventar funcionalidad fuera del bloque o documento activo, y debe registrar progreso en `docs/99-progress/` cuando complete trabajo real.
