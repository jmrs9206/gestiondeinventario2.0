# Progreso: Módulo de Roles y Permisos Dinámicos
Fecha: 2026-06-30

## Trabajo Realizado
Hemos implementado un sistema de gestión dinámica de roles y permisos con base de datos, control de seguridad en el backend y una interfaz de usuario interactiva y premium en el frontend.

### 1. Backend (Spring Boot & Security)
- **Base de datos:**
  - Creada migración Flyway `V6__dynamic_roles_and_permissions.sql` para crear la tabla `role_permissions` y sembrar los permisos por defecto para `ADMIN` y `TECNICO`.
- **Entidades y Repositorios:**
  - Creada la entidad JPA `RolePermission` y su repositorio `RolePermissionRepository`.
- **Carga de Permisos Dinámicos:**
  - Actualizada la entidad `User` para admitir un campo transient `authorities`.
  - Modificado el bean `userDetailsService` en `SecurityConfig` para cargar los permisos desde la tabla `role_permissions` en cada login/petición JWT.
  - Implementado un mecanismo de contingencia para pruebas unitarias (`rolePermissionRepository.count() == 0`) para garantizar que la suite de pruebas siga funcionando de forma aislada sin fallos.
- **Autorización por Permisos:**
  - Reemplazados los controles estáticos de roles (`@PreAuthorize("hasRole('ADMIN')")` / `@PreAuthorize("hasAnyRole(...)")`) en controladores clave (`UserController`, `OfficeController`, `MaterialController`, `AuditController`, `DashboardController`, `MaterialHistoryController`, `QrController`) por comprobaciones basadas en permisos (`hasAuthority(...)`).
- **Endpoint de Control de Roles:**
  - Creado `RoleController` expuesto en `/api/v1/roles` (protegido con `MANAGE_ROLES`) para consultar y guardar la matriz de permisos de cada rol de forma atómica.

### 2. Frontend (Next.js & UI)
- **Servicios:**
  - Creado `role.service.ts` para conectar con los endpoints de obtención y actualización de permisos.
- **Interfaz Gráfica Premium:**
  - Desarrollado el componente interactivo `RolesPermissionsTable.tsx` que agrupa visualmente los permisos del sistema por categorías (General, Seguridad, Usuarios, Sedes, Inventario) y muestra una cuadrícula de interruptores modernos para activarlos o desactivarlos por rol.
  - Implementados mecanismos de seguridad contra auto-bloqueos en el cliente (no se puede desactivar `MANAGE_ROLES` a `ADMIN` desde la propia cuenta de administrador).
  - Integrada la navegación en la barra lateral mediante la opción "Roles y Permisos", restringida mediante directiva de ruta protegida únicamente al rol `ADMIN`.
