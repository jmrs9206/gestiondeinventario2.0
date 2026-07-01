# Progreso: Refactorización y Robustez de Roles y Permisos y Solución de Contrastes
Fecha: 2026-06-30

## Trabajo Realizado
Hemos optimizado y robustecido el módulo de roles y permisos dinámicos, eliminado el módulo duplicado de visualización de branding de la configuración, resuelto el problema de contraste de blanco sobre blanco y añadido un panel de accesos de prueba (mocks) en el login.

### 1. Robustez de la Matriz de Roles y Permisos
- **Inyección de Permisos en JWT (Backend):**
  - Modificado [JwtService.java](file:///home/jmrs/gestionDeInventario2.0/backend/src/main/java/com/stockflow/inventory/auth/service/JwtService.java) para inyectar la lista de permisos activos del rol del usuario como un claim `permissions` en el token JWT. Esto permite que el cliente Next.js conozca y sincronice los permisos dinámicos en tiempo real sin recargas adicionales del backend.
- **Sincronización del Cliente (Frontend):**
  - Actualizado [AuthProvider.tsx](file:///home/jmrs/gestionDeInventario2.5/frontend/src/modules/auth/providers/AuthProvider.tsx) para parsear el claim `permissions` del JWT y guardarlo en la sesión del usuario como `user.permissions`.
  - Modificado [ProtectedRoute.tsx](file:///home/jmrs/gestionDeInventario2.5/frontend/src/modules/auth/components/ProtectedRoute.tsx) para dar soporte al parámetro `requiredPermission` y bloquear el acceso a rutas si el usuario no tiene asignado el permiso correspondiente.
  - Actualizado [Navigation.tsx](file:///home/jmrs/gestionDeInventario2.5/frontend/src/modules/materials/components/Navigation.tsx) para ocultar de manera dinámica las opciones de la barra lateral si el usuario carece del permiso requerido (ej. `READ_DASHBOARD`, `READ_USER`, `MANAGE_ROLES`, `READ_AUDIT_LOG`).
- **Guardado Atómico de la Matriz (Frontend):**
  - Rediseñado el componente [RolesPermissionsTable.tsx](file:///home/jmrs/gestionDeInventario2.5/frontend/src/modules/materials/components/RolesPermissionsTable.tsx) con una estrategia de guardado atómico. Se proporciona un único botón **Guardar Matriz** y un botón de **Descartar** para revertir cambios a su estado inicial.

### 2. Eliminación de Configuración Duplicada de Branding
- Reemplazamos la página redundante de visualización de branding en `/settings` por el panel de gestión de **Roles y Permisos**. El sidebar redirige la opción de configuración directamente a este módulo.
- Removimos la carpeta obsoleta `/roles` del frontend.

### 3. Panel de Accesos de Prueba (Mocks) en Login
- Agregamos un panel interactivo de **Acceso Rápido (Mocks)** en [login/page.tsx](file:///home/jmrs/gestionDeInventario2.5/frontend/src/app/login/page.tsx) con botones dedicados para los usuarios sembrados (`Administrador`, `Técnico Carlos` y `Técnico Laura`) que pre-popula instantáneamente los inputs de correo y contraseña facilitando las pruebas de control de acceso.

### 4. Solución a Problemas de Contraste Visual (Blanco sobre Blanco)
- Actualizamos [globals.css](file:///home/jmrs/gestionDeInventario2.0/frontend/src/app/globals.css) para usar una paleta basada en tonos pizarra (Slate 100 `#f1f5f9` para fondo de cuerpo y Slate 900 `#0f172a` para el texto principal) y modificamos la opacidad de los bordes y el fondo de `.glass-card` a `0.9` en modo claro. Esto proporciona una excelente visibilidad y elimina las zonas confusas de blanco sobre blanco.
