# NAMING_CONVENTIONS.md

    > Proyecto: VDEnergy Inventory Management System  
    > Modo: Caveman Mode  
    > Fecha base: 2026-05-22

    ## Idiomas

Código: inglés técnico.  
Documentación: español.  
Commits: inglés técnico.

## Java

Clases:

```text
PascalCase
MaterialService
```

Variables:

```text
camelCase
publicCode
```

Paquetes:

```text
lowercase
materials
```

## TypeScript

Componentes:

```text
PascalCase
MaterialTable
```

Hooks:

```text
useAuth
useMaterials
```

Archivos:

```text
kebab-case
material-table.tsx
```

## Base de datos

Tablas y columnas:

```text
snake_case
material_history
public_code
```

## Endpoints

Usar plural y kebab-case:

```http
GET /api/v1/materials
PATCH /api/v1/materials/{publicCode}/status
```

## Eventos auditoría

Upper snake case:

```text
MATERIAL_CREATED
STATUS_CHANGED
LOGIN_FAILED
```

    ---

    ## Regla final IA

    La IA debe trabajar solo con el alcance explícito de este archivo, no debe inventar funcionalidad fuera del bloque o documento activo, y debe registrar progreso en `docs/99-progress/` cuando complete trabajo real.
