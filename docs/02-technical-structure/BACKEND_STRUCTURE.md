# BACKEND_STRUCTURE.md

    > Proyecto: StockFlow Inventory Management System  
    > Modo: Caveman Mode  
    > Fecha base: 2026-05-22

    ## Objetivo

Definir estructura oficial backend.

## Stack

```text
Java 21
Spring Boot 3
Maven
Spring Security
Spring Data JPA
Flyway
MySQL 8.04 ó 8.4
JUnit 5
Mockito
MockMvc
Testcontainers
```

## Package raíz

```text
com.stockflow.inventory
```

## Estructura

```text
backend/
├── pom.xml
├── Dockerfile
├── src/main/java/com/stockflow/inventory
│   ├── InventoryApplication.java
│   ├── common
│   ├── config
│   ├── auth
│   ├── users
│   ├── offices
│   ├── materials
│   ├── inventory
│   ├── audit
│   ├── dashboard
│   └── publicapi
├── src/main/resources
│   ├── application.yml
│   ├── application-dev.yml
│   ├── application-test.yml
│   ├── application-prod.yml
│   └── db/migration
└── src/test/java/com/stockflow/inventory
```

## Módulos

### common

Contiene:

- exceptions
- responses
- constants
- utilities
- validation helpers
- base entities

### config

Contiene:

- security
- jwt
- cors
- swagger
- jackson
- actuator

### auth

Responsable de:

- login
- refresh token
- logout
- JWT filter
- current user

### users

Responsable de:

- CRUD usuarios
- roles
- active/inactive
- password hash

### offices

Responsable de:

- CRUD oficinas
- soft delete
- relación con materiales

### materials

Responsable de:

- CRUD materiales
- estados
- public_code
- QR generation

### inventory

Responsable de:

- movimientos
- material_history
- cambios estado
- cambios oficina

### audit

Responsable de:

- audit_log
- eventos globales
- actor type

### dashboard

Responsable de:

- KPIs
- agregaciones
- estadísticas

### publicapi

Responsable de:

- API clients
- API keys
- scopes
- rate limiting
- endpoints públicos

## Reglas controllers

Controllers solo:

- reciben request
- validan DTO
- llaman service
- devuelven response

No pueden:

- contener negocio
- llamar repositories
- montar JSON manualmente

## Reglas services

Services contienen:

- negocio
- validaciones dominio
- coordinación auditoría
- transacciones

## Repositories

Repositories solo persistencia.

## DTOs

Obligatorios:

- request DTO
- response DTO

Nunca exponer entity.

## Tests

Estructura espejo del package principal.

## Validación

```bash
mvn clean verify
```

    ---

    ## Regla final IA

    La IA debe trabajar solo con el alcance explícito de este archivo, no debe inventar funcionalidad fuera del bloque o documento activo, y debe registrar progreso en `docs/99-progress/` cuando complete trabajo real.
