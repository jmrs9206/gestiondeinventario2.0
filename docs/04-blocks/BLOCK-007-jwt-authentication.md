# BLOCK-007-jwt-authentication.md

    > Proyecto: VDEnergy Inventory Management System  
    > Modo: Caveman Mode  
    > Fecha base: 2026-05-22

    ## Estado

```text
DONE
```

## Objetivo

Implementar JWT.

## Contexto

Este bloque forma parte del roadmap oficial. Debe ejecutarse de forma aislada y sin modificar módulos no relacionados.

## Dependencias

```text
BLOCK-006
MASTER_RULES.md
ROADMAP.md
```

## ADRs aplicables

```text
ADR-001-monolith-modular
ADR-002-security-architecture
ADR-003-database-and-audit-strategy
ADR-006-testing-and-quality-strategy
```

## Scope permitido

- Crear login
- Crear refresh token
- Crear logout
- Crear JwtService
- Crear JwtFilter

## Scope prohibido

- No implementar features futuras.
- No modificar módulos cerrados.
- No cambiar decisiones ADR.
- No omitir tests si aplica.
- No omitir auditoría si aplica.
- No exponer IDs internos.
- No hardcodear secrets.

## Tareas

1. Crear login.
2. Crear refresh token.
3. Crear logout.
4. Crear JwtService.
5. Crear JwtFilter.

## Archivos/carpetas a crear o modificar

```text
auth/**
config/jwt/**
```

## Tests mínimos

- Tests unitarios si hay lógica de negocio.
- Tests de integración si hay endpoint o persistencia.
- Tests de seguridad si hay permisos.
- Tests frontend si hay UI.

## Validaciones obligatorias

```bash
mvn clean verify
```

## Auditoría

Si el bloque crea, modifica o elimina información funcional, debe registrar evento en `audit_log`.
Si afecta materiales, debe registrar evento en `material_history` cuando corresponda.

## Seguridad

Validar:

- usuario autenticado
- usuario activo
- rol correcto
- no exposición de secrets
- no exposición de IDs internos

## Criterios DONE

El bloque queda completo solo si:

```text
build OK
tests OK
validaciones OK
documentación OK
DONE.md creado
```

## DONE.md obligatorio

Crear:

```text
docs/99-progress/2026-05-22-block-007.md
```

## Resultado esperado

Al cerrar este bloque, `Implementar JWT` debe estar implementado, validado y documentado.

    ---

    ## Regla final IA

    La IA debe trabajar solo con el alcance explícito de este archivo, no debe inventar funcionalidad fuera del bloque o documento activo, y debe registrar progreso en `docs/99-progress/` cuando complete trabajo real.
