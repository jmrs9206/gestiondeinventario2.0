# CAVEMAN_PROTOCOL.md

    > Proyecto: VDEnergy Inventory Management System  
    > Modo: Caveman Mode  
    > Fecha base: 2026-05-22

    ## Objetivo

Definir el modo de trabajo minimalista para ahorrar tokens y evitar desviaciones.

## Principios

- Un bloque.
- Un objetivo.
- Pocas palabras.
- Código necesario.
- Tests necesarios.
- Documentación mínima útil.
- Nada especulativo.

## Regla 1: Scope cerrado

Cada bloque tiene alcance. La IA no puede salir del alcance.

## Regla 2: Decisiones ya tomadas

Las decisiones viven en ADRs. No se renegocian en cada bloque.

## Regla 3: Memoria escrita

La memoria real está en `docs/99-progress`.

## Regla 4: No token waste

Evitar:

- explicaciones largas sin código
- alternativas no pedidas
- refactors no solicitados
- arquitectura nueva
- debates repetidos

## Regla 5: Done o no done

Un bloque está `DONE` solo si:

- compila
- tests OK
- docker OK si aplica
- seguridad OK si aplica
- auditoría OK si aplica
- DONE.md existe

## Plantilla de avance

```text
Bloque activo: BLOCK-XXX
Acción: implementar
Validación: comando exacto
Salida: DONE.md
```

## Qué hacer si hay error

- No ocultar.
- No inventar.
- Registrar.
- Dejar el proyecto compilable si es posible.
- Indicar siguiente paso.

    ---

    ## Regla final IA

    La IA debe trabajar solo con el alcance explícito de este archivo, no debe inventar funcionalidad fuera del bloque o documento activo, y debe registrar progreso en `docs/99-progress/` cuando complete trabajo real.
