# COMMIT_CONVENTION.md

    > Proyecto: VDEnergy Inventory Management System  
    > Modo: Caveman Mode  
    > Fecha base: 2026-05-22

    ## Formato

```text
type(scope): description
```

## Types

```text
feat
fix
refactor
test
docs
chore
build
ci
perf
security
```

## Ejemplos

```text
feat(materials): add qr generation service
security(auth): validate inactive users in jwt filter
test(materials): add status transition tests
docs(adr): add qr traceability strategy
```

## Reglas

- Inglés técnico.
- Presente.
- Commit pequeño.
- Una intención por commit.
- No commits ambiguos.

## Prohibido

```text
fix
changes
update
wip
stuff
final
```

    ---

    ## Regla final IA

    La IA debe trabajar solo con el alcance explícito de este archivo, no debe inventar funcionalidad fuera del bloque o documento activo, y debe registrar progreso en `docs/99-progress/` cuando complete trabajo real.
