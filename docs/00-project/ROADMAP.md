# ROADMAP.md

    > Proyecto: StockFlow Inventory Management System  
    > Modo: Caveman Mode  
    > Fecha base: 2026-05-22

    ## Objetivo

Definir el orden exacto de construcción.

La IA debe ejecutar un bloque cada vez.

No avanzar si:

- build falla
- tests fallan
- docker falla
- seguridad falla
- auditoría falta
- DONE.md falta

## FASE 00 - Preparación documental

### BLOCK-000 Project Setup

Crear estructura base del repositorio, carpetas, documentación inicial y convenciones.

## FASE 01 - Bootstrap backend

### BLOCK-001 Spring Bootstrap

Crear proyecto Spring Boot 3 con Java 21 y Maven.

### BLOCK-002 Docker Base

Crear Dockerfile backend, Dockerfile frontend inicial, docker-compose y MySQL.

### BLOCK-003 Application Config

Crear profiles `dev`, `test`, `prod`, variables entorno y health checks.

## FASE 02 - Base de datos

### BLOCK-004 Flyway Base

Integrar Flyway y primera migración.

### BLOCK-005 Base Entities

Crear `BaseEntity`, timestamps, soft delete y convenciones JPA.

## FASE 03 - Seguridad

### BLOCK-006 Spring Security Base

Configurar filtros, handlers y protección general.

### BLOCK-007 JWT Authentication

Implementar login, access token, refresh token y logout.

### BLOCK-008 Roles Authorization

Configurar roles ADMIN/TECNICO y permisos.

## FASE 04 - Usuarios

### BLOCK-009 Users Module

CRUD usuarios, BCrypt, validaciones, activación/desactivación.

## FASE 05 - Oficinas

### BLOCK-010 Offices Module

CRUD oficinas, soft delete y validaciones.

## FASE 06 - Materiales

### BLOCK-011 Materials Module

CRUD materiales, estados controlados, oficina, filtros.

### BLOCK-012 QR System

public_code seguro, generación QR, endpoint QR y etiquetas.

### BLOCK-013 Material History

Historial funcional de movimientos de materiales.

## FASE 07 - Auditoría

### BLOCK-014 Audit Log

Auditoría global para todo el sistema.

## FASE 08 - Dashboard

### BLOCK-015 Dashboard Backend KPIs

Agregaciones y métricas backend.

### BLOCK-016 Dashboard Frontend

Pantallas, KPIs, gráficas y filtros.

## FASE 09 - API Pública

### BLOCK-017 Public API

API Keys, scopes, rate limiting y endpoints externos.

## FASE 10 - Frontend

### BLOCK-018 Next.js Bootstrap

Crear frontend base.

### BLOCK-019 Auth UI

Login, guards y gestión sesión.

### BLOCK-020 Inventory UI

Materiales, oficinas, usuarios y auditoría.

### BLOCK-021 QR Mobile UI

Flujo móvil QR.

## FASE 11 - Testing

### BLOCK-022 Backend Testing

JUnit, Mockito, MockMvc, Testcontainers.

### BLOCK-023 Frontend Testing

Vitest, React Testing Library y validaciones UI.

## FASE 12 - DevOps

### BLOCK-024 CI/CD

GitHub Actions.

### BLOCK-025 Production Deployment

Hardening, backups, HTTPS, logs.

## FASE 13 - Contratos y cierre

### BLOCK-026 OpenAPI Final

Completar `openapi.yaml`.

### BLOCK-027 README Final

Documentar instalación, despliegue y uso.

## Regla de avance

Un bloque en estado `DONE` debe tener archivo en `docs/99-progress`.

## Orden recomendado

```text
000 -> 001 -> 002 -> 003 -> 004 -> 005 -> 006 -> 007 -> 008 -> 009 -> 010 -> 011 -> 012 -> 013 -> 014 -> 015 -> 016 -> 017 -> 018 -> 019 -> 020 -> 021 -> 022 -> 023 -> 024 -> 025 -> 026 -> 027
```

    ---

    ## Regla final IA

    La IA debe trabajar solo con el alcance explícito de este archivo, no debe inventar funcionalidad fuera del bloque o documento activo, y debe registrar progreso en `docs/99-progress/` cuando complete trabajo real.
