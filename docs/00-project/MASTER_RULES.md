# MASTER_RULES.md

    > Proyecto: VDEnergy Inventory Management System  
    > Modo: Caveman Mode  
    > Fecha base: 2026-05-22

    ## Objetivo

Sistema profesional de gestión de inventario para periféricos y mobiliario de oficina.

Debe permitir:

- gestión de usuarios
- gestión de oficinas
- gestión de materiales
- trazabilidad completa
- auditoría global
- métricas y dashboards
- integración mediante API pública
- gestión mediante QR
- despliegue dockerizado

## Filosofía

Este proyecto se desarrolla por bloques pequeños, verificables y documentados.

La IA debe operar en modo Caveman:

- poco contexto
- tareas pequeñas
- sin improvisación
- sin sobreingeniería
- sin modificar módulos cerrados
- sin gastar tokens en explicación innecesaria

## Arquitectura obligatoria

- Monolito modular.
- No microservicios.
- Backend modular por dominio.
- No lógica de negocio en controllers.
- No acceso directo a base de datos desde controllers.
- Services contienen reglas de negocio.
- Repositories solo persistencia.
- DTOs obligatorios.
- Entidades JPA nunca se devuelven directamente.

## Stack obligatorio

### Backend

- Java 21.
- Spring Boot 3.
- Spring Security.
- Spring Data JPA.
- Maven.
- Flyway.
- MySQL 8.
- JUnit 5.
- Mockito.
- MockMvc.
- Testcontainers.

### Frontend

- Next.js latest.
- React latest.
- TypeScript.
- TailwindCSS.
- shadcn/ui permitido.
- lucide-react permitido.
- recharts permitido.

### Infraestructura

- Docker.
- Docker Compose.
- GitHub Actions.
- HTTPS en producción.
- Dominio objetivo: `https://inventario.vdenergy.es`.

## Roles

Roles únicos permitidos:

```text
ADMIN
TECNICO
```

### ADMIN

Puede:

- crear usuarios
- activar/desactivar usuarios
- ver dashboards
- ver auditoría global
- administrar API pública
- regenerar QR
- gestionar todo el inventario

### TECNICO

Puede:

- crear oficinas
- crear materiales
- actualizar materiales
- cambiar estados
- hacer soft delete lógico
- ver detalle de auditoría permitido
- gestionar inventario operativo

## Seguridad

Obligatorio:

- JWT para usuarios humanos.
- Refresh token.
- BCrypt para contraseñas.
- API Key para sistemas externos.
- Scopes para API pública.
- Usuario activo requerido para operar.
- No exponer IDs internos.
- No loggear secretos.
- No guardar contraseñas planas.
- No guardar API keys en claro.
- No devolver stack traces al usuario.

## QR

Cada material debe tener:

- `id` interno.
- `public_code` aleatorio seguro.
- QR generado desde `public_code`.

Formato URL:

```text
https://inventario.vdenergy.es/i/{publicCode}
```

Prohibido usar:

```text
VDE-MAT-000001
```

Motivo:

- es secuencial
- revela volumen de inventario
- permite enumeración
- facilita scraping

## Estados de material

Estados permitidos:

```text
OPERATIVO
ROTO
EN_REPARACION
BAJA
```

No se permiten estados libres.

## Auditoría

Toda acción relevante debe crear registro.

Auditar:

- login correcto
- login fallido
- logout
- refresh token
- creación usuario
- edición usuario
- activación/desactivación usuario
- creación oficina
- edición oficina
- alta material
- edición material
- cambio estado
- cambio oficina
- generación QR
- regeneración QR
- escaneo QR
- API pública
- accesos denegados

## Documentación obligatoria

Todo bloque completado debe generar:

```text
docs/99-progress/YYYY-MM-DD-block-XXX.md
```

Debe incluir:

- fecha
- objetivo
- tareas realizadas
- archivos creados
- archivos modificados
- tests ejecutados
- docker validado
- problemas encontrados
- pendientes
- siguiente bloque sugerido

## Validaciones antes de cerrar bloque

Backend:

```bash
mvn clean verify
```

Frontend:

```bash
npm run build
npm run test
```

Docker:

```bash
docker compose up -d
```

## Prohibiciones absolutas

- No microservicios.
- No IDs secuenciales públicos.
- No contraseñas en claro.
- No API keys en claro.
- No hard delete de entidades críticas.
- No modificar módulos cerrados.
- No inventar endpoints.
- No usar estados libres.
- No omitir auditoría.
- No dejar tests rotos.
- No usar base de datos real en tests.
- No hacer cambios sin DONE.md.

## Objetivo final

Sistema robusto, mantenible, seguro, auditable, dockerizado, mobile-first para QR, listo para producción y fácil de continuar por humanos o IA.

    ---

    ## Regla final IA

    La IA debe trabajar solo con el alcance explícito de este archivo, no debe inventar funcionalidad fuera del bloque o documento activo, y debe registrar progreso en `docs/99-progress/` cuando complete trabajo real.
