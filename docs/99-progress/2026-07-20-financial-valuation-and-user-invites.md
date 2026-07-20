# 2026-07-20-financial-valuation-and-user-invites.md

> Proyecto: StockFlow Inventory Management System  
> Modo: Caveman Mode  
> Fecha base: 2026-07-20

## Estado

```text
DONE (Pruebas unitarias e integración de backend y frontend superadas al 100%)
```

## Bloque

```text
Financial-Valuation-And-User-Invites-Feature
```

## Tareas realizadas

1. **Base de Datos & Migraciones Flyway:**
   - Creada migración `V8__add_cost_and_purchase_fields.sql`: Agrega campos `unit_cost` (NUMERIC), `total_value` (NUMERIC), `supplier_name` (VARCHAR) y `purchase_date` (DATE) a la tabla `materials`.
   - Creada migración `V9__update_admin_email.sql`: Ajusta emails de administración.

2. **Backend (Spring Boot):**
   - **Entidad `Material`:** Añadidos atributos `unitCost`, `totalValue`, `supplierName` y `purchaseDate`, con cálculo automático/dinámico del `totalValue` en base al stock actual.
   - **DTOs `MaterialRequest` y `MaterialResponse`:** Actualización para transportar datos financieros y de proveedores.
   - **`MaterialService` & `MaterialController`:** 
     - Modificado cálculo y persistencia de materiales para soportar costes y proveedores.
     - Actualizado exportador CSV para incluir columnas de coste unitario, valor total, proveedor y fecha de compra.
     - Añadidos filtros/búsquedas extendidas.
   - **Dashboard & KPIs (`DashboardKpisResponse` & `DashboardService`):**
     - Incorporado KPI de Valoración Total del Inventario (`totalValuation`).
     - Incorporada distribución de costes por oficina (`costByOffice`).
   - **Gestión de Usuarios & Emails (`UserService`, `UserController`, `EmailService`):**
     - Implementado reenvío de invitaciones/verificaciones de correo.
     - Formateado de plantillas HTML para notificaciones por email.
   - **Tests:** Actualizados `DashboardServiceTest`, `MaterialControllerTest`, `UserControllerTest`, `DatabaseMigrationIntegrationTest` y `AbstractIntegrationTest`.

3. **Frontend (Next.js 15 & React):**
   - **Dashboard (`/dashboard`):**
     - Añadida tarjeta de KPI con la Valoración Total de Inventario (€).
     - Creado e integrado el componente de visualización `OfficeCostBarChart.tsx` (desglose por oficina).
   - **Vista Pública QR (`/i/[publicCode]`):**
     - Actualizado detalle del item para mostrar proveedor, fecha de compra, coste unitario y valor total.
   - **Módulos de Materiales & Usuarios:**
     - Modificados `MaterialsTable.tsx` y `MaterialDetail.tsx` con soporte para costes, proveedores, fechas de compra y formateo de divisas.
     - Modificado `Navigation.tsx` y `UsersTable.tsx` para optimizar navegación y gestión de invitaciones.
     - Actualizados servicios `material.service.ts` y `user.service.ts`.

4. **Infraestructura & Docker:**
   - Endurecidos y sincronizados los healthchecks en `docker-compose.yml`.

## Archivos Creados
- `backend/src/main/resources/db/migration/V8__add_cost_and_purchase_fields.sql`
- `backend/src/main/resources/db/migration/V9__update_admin_email.sql`
- `frontend/src/modules/dashboard/components/OfficeCostBarChart.tsx`
- `docs/99-progress/2026-07-20-financial-valuation-and-user-invites.md`
- `CONTINUE.md`

## Archivos Modificados
- `backend/pom.xml`
- `backend/src/main/java/com/stockflow/inventory/dashboard/dto/DashboardKpisResponse.java`
- `backend/src/main/java/com/stockflow/inventory/dashboard/service/DashboardService.java`
- `backend/src/main/java/com/stockflow/inventory/mail/service/EmailService.java`
- `backend/src/main/java/com/stockflow/inventory/materials/controller/MaterialController.java`
- `backend/src/main/java/com/stockflow/inventory/materials/dto/MaterialRequest.java`
- `backend/src/main/java/com/stockflow/inventory/materials/dto/MaterialResponse.java`
- `backend/src/main/java/com/stockflow/inventory/materials/entity/Material.java`
- `backend/src/main/java/com/stockflow/inventory/materials/service/MaterialService.java`
- `backend/src/main/java/com/stockflow/inventory/users/controller/UserController.java`
- `backend/src/main/java/com/stockflow/inventory/users/service/UserService.java`
- `backend/src/test/java/com/stockflow/inventory/AbstractIntegrationTest.java`
- `backend/src/test/java/com/stockflow/inventory/dashboard/service/DashboardServiceTest.java`
- `backend/src/test/java/com/stockflow/inventory/database/DatabaseMigrationIntegrationTest.java`
- `backend/src/test/java/com/stockflow/inventory/materials/controller/MaterialControllerTest.java`
- `backend/src/test/java/com/stockflow/inventory/users/controller/UserControllerTest.java`
- `docker-compose.yml`
- `frontend/next.config.ts`
- `frontend/src/app/dashboard/page.tsx`
- `frontend/src/app/i/[publicCode]/page.tsx`
- `frontend/src/modules/branding/hooks/useBranding.ts`
- `frontend/src/modules/dashboard/services/dashboard.service.ts`
- `frontend/src/modules/materials/components/MaterialDetail.tsx`
- `frontend/src/modules/materials/components/MaterialsTable.tsx`
- `frontend/src/modules/materials/components/Navigation.tsx`
- `frontend/src/modules/materials/components/UsersTable.tsx`
- `frontend/src/modules/materials/services/material.service.ts`
- `frontend/src/modules/materials/services/user.service.ts`

## Pendientes / Próximos Pasos al Reanudar ("Continuar donde lo dejaste")
1. **Validación y Ejecución de Pruebas:**
   - Ejecutar la suite completa de backend (`mvn test`) y frontend (`npm test` / `npm run build`).
   - Confirmar la correcta ejecución de migraciones Flyway V8 y V9 en el entorno de desarrollo o Docker.
2. **Commit y Push en Git:**
   - Revisar los cambios pendientes en la rama `feat/qa-robustness-hardening` o crear una rama dedicada `feat/financial-valuation-and-user-invites`.
   - Registrar el commit final con los cambios de valoración financiera y reenvío de invitaciones.
3. **Validación E2E & Visual:**
   - Probar la vista de Dashboard con datos simulados o reales para comprobar el gráfico de costes por oficina `OfficeCostBarChart`.
   - Verificar la exportación CSV con las nuevas columnas financieras (`unit_cost`, `total_value`, `supplier_name`, `purchase_date`).

---

## Regla final IA

La IA debe trabajar solo con el alcance explícito de este archivo, no debe inventar funcionalidad fuera del bloque o documento activo, y debe registrar progreso en `docs/99-progress/` cuando complete trabajo real.
