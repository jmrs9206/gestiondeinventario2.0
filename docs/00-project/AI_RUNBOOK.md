# AI_RUNBOOK.md

    > Proyecto: StockFlow Inventory Management System  
    > Modo: Caveman Mode  
    > Fecha base: 2026-05-22

    ## Objetivo

Dar instrucciones operativas a cualquier IA que continúe el proyecto.

## Entrada mínima para una sesión IA

La IA debe leer en este orden:

1. `docs/00-project/MASTER_RULES.md`
2. `docs/00-project/ROADMAP.md`
3. ADRs relevantes de `docs/01-architecture/`
4. Estructuras relevantes de `docs/02-technical-structure/`
5. El `BLOCK-XXX.md` activo
6. Últimos archivos de `docs/99-progress/`

## Algoritmo de trabajo

```text
leer reglas
leer bloque activo
revisar dependencias
modificar solo archivos permitidos
crear tests
validar build
validar docker
crear DONE.md
parar
```

## Qué no hacer

- No saltar bloques.
- No inventar requisitos.
- No abrir módulos no relacionados.
- No reescribir arquitectura.
- No cambiar ADRs aceptados salvo que se cree un ADR nuevo.
- No cerrar bloque sin validación.
- No decir que algo está hecho si no se probó.

## Formato de respuesta recomendado

La IA debe responder corto:

```text
Hecho:
- X
- Y

Validado:
- mvn clean verify OK
- docker compose OK

Creado:
- docs/99-progress/YYYY-MM-DD-block-XXX.md
```

## Si falla algo

Registrar en DONE.md:

- fallo
- causa probable
- archivo afectado
- comando que falló
- siguiente acción recomendada

## Si falta contexto

La IA debe usar lo ya documentado y continuar con la opción más conservadora. No debe bloquearse preguntando salvo que la decisión afecte arquitectura, seguridad o datos productivos.

## Prioridades

1. Seguridad.
2. Trazabilidad.
3. Build estable.
4. Tests.
5. Simplicidad.
6. UX.
7. Optimización.

    ---

    ## Regla final IA

    La IA debe trabajar solo con el alcance explícito de este archivo, no debe inventar funcionalidad fuera del bloque o documento activo, y debe registrar progreso en `docs/99-progress/` cuando complete trabajo real.
