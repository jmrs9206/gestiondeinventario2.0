# BLOCK_TEMPLATE.md

    > Proyecto: VDEnergy Inventory Management System  
    > Modo: Caveman Mode  
    > Fecha base: 2026-05-22

    ## Estado

```text
PENDING
```

## Objetivo

Describir el resultado exacto del bloque.

## Contexto

Indicar:

- módulo afectado
- ADRs aplicables
- dependencias
- alcance

## Dependencias

```text
BLOCK-XXX
ADR-XXX
```

## Scope permitido

- Crear archivos necesarios.
- Modificar archivos listados.
- Crear tests.
- Actualizar documentación.

## Scope prohibido

- Cambiar arquitectura.
- Tocar módulos cerrados.
- Añadir features futuras.
- Saltarse auditoría.
- Saltarse tests.

## Tareas

1. Tarea concreta.
2. Tarea concreta.
3. Tarea concreta.

## Archivos a crear

```text
ruta/archivo
```

## Archivos permitidos modificar

```text
ruta/archivo
```

## Tests obligatorios

```text
unit
integration
security si aplica
```

## Validaciones

```bash
mvn clean verify
npm run build
docker compose up -d
```

## Criterios DONE

- build OK
- tests OK
- docker OK si aplica
- auditoría OK si aplica
- DONE.md creado

## DONE.md

Crear:

```text
docs/99-progress/YYYY-MM-DD-block-XXX.md
```

    ---

    ## Regla final IA

    La IA debe trabajar solo con el alcance explícito de este archivo, no debe inventar funcionalidad fuera del bloque o documento activo, y debe registrar progreso en `docs/99-progress/` cuando complete trabajo real.
