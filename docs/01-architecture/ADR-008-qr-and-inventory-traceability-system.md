# ADR-008-qr-and-inventory-traceability-system.md

    > Proyecto: VDEnergy Inventory Management System  
    > Modo: Caveman Mode  
    > Fecha base: 2026-05-22

    ## Estado

```text
ACEPTADO
```

## Contexto

La empresa no usará pistola scanner. El móvil escaneará pegatinas QR.
Los códigos no deben ser adivinables.

## Decisión

Cada material tendrá un `public_code` aleatorio seguro y QR con URL `https://inventario.vdenergy.es/i/{publicCode}`.

## Reglas derivadas

- Nunca usar IDs secuenciales públicos.
- QR requiere usuario autenticado para ver datos.
- Escaneo QR se audita.
- Regeneración QR solo ADMIN.

## Consecuencias positivas

- Menos errores humanos.
- Acceso rápido.
- Seguridad contra enumeración.
- Trazabilidad física/digital.

## Consecuencias negativas

- Gestión de etiquetas.
- Más lógica.

## Validación

Esta decisión se considera válida mientras el sistema sea un inventario corporativo pequeño/medio, con dos roles principales, un único dominio funcional y despliegue containerizado.

## Resultado esperado

Inventario físico conectado a ficha digital segura mediante QR.

    ---

    ## Regla final IA

    La IA debe trabajar solo con el alcance explícito de este archivo, no debe inventar funcionalidad fuera del bloque o documento activo, y debe registrar progreso en `docs/99-progress/` cuando complete trabajo real.
