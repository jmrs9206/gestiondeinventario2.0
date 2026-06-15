# 2026-05-22-qa-improvement.md

    > Proyecto: StockFlow Inventory Management System  
    > Modo: Caveman Mode  
    > Fecha base: 2026-05-22

    ## Estado

```text
DONE
```

## Bloque

```text
QA-Improvement-Refinements
```

## Tareas realizadas

- **Asynchronous Refactoring (isMounted Safety)**:
  - Eliminados los `setTimeout` de 0 ms en los hooks `useEffect` en todo el proyecto frontend para evitar fugas de memoria y llamadas redundantes.
  - Implementado un patrón seguro de control de ciclo de vida con `useRef` (`isMountedRef`) en los cargadores de datos del `Dashboard`, `MaterialDetail`, `MaterialsTable`, `OfficesTable`, `UsersTable` y `AuditLogsTable`, protegiendo el cambio de estados en llamadas asíncronas no resueltas al desmontar los componentes.
- **Root Path Redirection Optimization**:
  - Delegada la redirección de la raíz del sitio (`/`) al enrutador de Next.js mediante reglas de `redirects` en `next.config.ts`, mejorando el rendimiento en la carga inicial y eliminando destellos en el cliente.
- **Security Protocols & Brute Force Protection Guide**:
  - Creado el manual técnico en [docs/07-security/BRUTE_FORCE_PROTECTION.md](file:///home/jmrs/gestionDeInventario2.0/docs/07-security/BRUTE_FORCE_PROTECTION.md) detallando la doble capa de protección contra fuerza bruta:
    1. **Nginx Rate Limiting:** Zona de peticiones IP limitada a `5r/m` con zona burst para proteger `POST /api/v1/auth/login`.
    2. **Database Account Lockout:** Registro de intentos fallidos en MySQL (`failed_login_attempts`, `lockout_until`) y listeners de eventos de Spring Security en Java para bloquear/desbloquear accesos temporalmente.
- **Frontend Testing Model Setup**:
  - Creado el archivo de test modelo en [src/modules/auth/components/Login.test.tsx](file:///home/jmrs/gestionDeInventario2.0/frontend/src/modules/auth/components/Login.test.tsx) utilizando Vitest y React Testing Library.
  - El caso evalúa el login exitoso (Happy Path), validaciones de campos vacíos en el cliente y visualización de errores devueltos por el servidor.

## Archivos creados
- `docs/07-security/BRUTE_FORCE_PROTECTION.md`
- `frontend/src/modules/auth/components/Login.test.tsx`

## Archivos modificados
- `frontend/next.config.ts`
- `frontend/src/app/dashboard/page.tsx`
- `frontend/src/app/i/[publicCode]/page.tsx`
- `frontend/src/modules/materials/components/AuditLogsTable.tsx`
- `frontend/src/modules/materials/components/MaterialDetail.tsx`
- `frontend/src/modules/materials/components/MaterialsTable.tsx`
- `frontend/src/modules/materials/components/OfficesTable.tsx`
- `frontend/src/modules/materials/components/UsersTable.tsx`

## Validación

- **Vitest Suites Check:** Las pruebas de frontend pasaron con éxito (`13/13 passed`).
- **Next.js Production Compilation:** El empaquetado de producción de Next.js (`npm run build`) compiló y completó la generación de páginas estáticas exitosamente sin errores de TypeScript.

## Siguiente paso

```text
Listo para revisión final.
```

    ---

    ## Regla final IA

    La IA debe trabajar solo con el alcance explícito de este archivo, no debe inventar funcionalidad fuera del bloque o documento activo, y debe registrar progreso en `docs/99-progress/` cuando complete trabajo real.
