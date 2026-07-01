# Progreso: Sembrado de Datos de Prueba (Mocks / Demo) en Base de Datos
Fecha: 2026-06-30

## Trabajo Realizado
Hemos solucionado la falta de datos iniciales en la aplicación mediante el sembrado automático de datos demo (mocks) de oficinas, materiales e historial de trazabilidad.

### 1. Creación de Migración de Sembrado (Backend)
- Diseñamos y creamos la migración [V7__seed_mock_data.sql](file:///home/jmrs/gestionDeInventario2.0/backend/src/main/resources/db/migration/V7__seed_mock_data.sql) para inicializar:
  - **Técnicos de Prueba:** Registramos a `tecnico1@tuempresa.com` (Carlos Ruiz) y `tecnico2@tuempresa.com` (Laura Gómez) con contraseña `tecnico123` encriptada en BCrypt.
  - **Sedes:** Insertamos la "Sede Central - Madrid", "Sede Barcelona" y "Sede Valencia".
  - **Materiales:** Registramos 13 materiales de prueba de distintos tipos (Monitores Dell/LG, Teclados Logitech/Corsair, Ratones Logitech/Razer, Audífonos Sennheiser/Sony y Laptops Lenovo/Apple/HP) distribuidos en diferentes estados operativos (`OPERATIVO`, `EN_REPARACION`, `ROTO`, `BAJA`).
  - **Historial de Cambios:** Registramos los movimientos e incidencias iniciales para alimentar las tablas de trazabilidad y reportes del Dashboard.

### 2. Aplicación y Verificación
- Compilamos y desplegamos el backend. Flyway aplicó la migración `V7` exitosamente sobre MySQL (`now at version v7`).
- Ahora, al iniciar sesión como Administrador o Técnico, el sistema cargará automáticamente gráficos, KPIs de operatividad, inventarios de sede y logs de auditoría reales en lugar de mostrar pantallas vacías.
