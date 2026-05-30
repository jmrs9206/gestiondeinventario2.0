Excelente análisis. Ahora vamos a ponernos manos a la obra para resolver los puntos débiles identificados y ejecutar el plan de mejora con un estándar de ingeniería de software profesional (10/10). No quiero parches temporales ni "trucos" de código (como usar setTimeouts para callar advertencias de React). Quiero soluciones definitivas y robustas.

Por favor, genera el código detallado, limpio y explicado para resolver los siguientes 4 bloques:

1. CORRECCIÓN DE EFECTOS ASÍNCRONOS EN EL FRONTEND:
- Optimiza los componentes donde se cargaban los datos (Dashboard) y la imagen QR (MaterialDetail.tsx). 
- Elimina los `setTimeout` dentro de los `useEffect`. Implementa un patrón limpio usando banderas de montaje (`isMounted`) o `AbortController` nativos para manejar el asincronismo y evitar fugas de memoria o renderizados redundantes al desmontar componentes.

2. OPTIMIZACIÓN DE LA REDIRECCIÓN DE LA RAÍZ (/):
- En lugar de renderizar una página vacía que use `redirect('/dashboard')` en el cliente/servidor de Next.js, muéstrame cómo delegar esta redirección de forma eficiente. 
- Proporcióname la configuración exacta para hacerlo a nivel de infraestructura/enrutamiento, ya sea en el archivo `next.config.js` o mediante un `middleware.ts`.

3. PROTOCOLO DE SEGURIDAD: RATE LIMITING Y FUERZA BRUTA:
- Desarrollar la solución para proteger el endpoint crítico de autenticación (`POST /api/v1/auth/login`).
- Proporcióname el código para integrar un middleware de rate-limiting (si usamos Node.js/Express, utiliza 'express-rate-limit').
- Explícame brevemente cómo debería estructurarse en la base de datos PostgreSQL el control de intentos fallidos (`intentos_fallidos`, `bloqueado_hasta`) para bloquear cuentas a nivel de negocio.

4. INFRAESTRUCTURA DE FRONTEND TESTING (VITEST + RTL):
- Configura la estructura inicial de pruebas para el Frontend.
- Genera un archivo de prueba modelo (ej. `Login.test.tsx` o `InventoryTable.test.tsx`) usando Vitest y React Testing Library. 
- El test debe evaluar el "Happy Path" (camino feliz) y un caso de error (ej. inputs vacíos o feedback de error del servidor), aplicando mocks para las peticiones de la API.

Entrega el código organizado por archivos, con comentarios concisos que expliquen el porqué de cada decisión técnica. ¡Vamos a dejar el proyecto impecable!