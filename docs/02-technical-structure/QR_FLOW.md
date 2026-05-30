# QR_FLOW.md

    > Proyecto: VDEnergy Inventory Management System  
    > Modo: Caveman Mode  
    > Fecha base: 2026-05-22

    ## Objetivo

Definir flujo oficial QR.

## Creación material

1. Técnico crea material.
2. Backend genera `public_code`.
3. Backend genera URL QR.
4. Se crea registro `material_history`.
5. Se crea registro `audit_log`.
6. Se permite imprimir etiqueta.

## URL

```text
https://inventario.vdenergy.es/i/{publicCode}
```

## public_code

Debe ser:

- aleatorio
- único
- largo
- no predecible
- generado con SecureRandom

Ejemplo:

```text
mat_x9KpL72sQe8VzR4nB6tA
```

Prohibido:

```text
VDE-MAT-000001
```

## Escaneo

1. Usuario escanea con móvil.
2. Navegador abre URL.
3. Frontend verifica sesión.
4. Si no hay sesión, login.
5. Tras login, redirección al material.
6. Backend valida usuario activo.
7. Backend valida permisos.
8. Se registra `QR_SCANNED`.

## Acciones desde móvil

Técnico puede:

- ver detalle
- cambiar estado
- mover oficina
- añadir comentario
- ver historial

## Estados

```text
OPERATIVO
ROTO
EN_REPARACION
BAJA
```

## Regeneración QR

Solo ADMIN.

Pasos:

1. generar nuevo public_code
2. incrementar qr_version
3. invalidar anterior
4. registrar audit_log
5. registrar material_history si aplica

## Etiqueta

Debe incluir:

- QR
- tipo material
- marca/modelo opcional
- código visual opcional

El código visual no se usa como seguridad.

## Métricas futuras

- escaneos por material
- materiales más movidos
- incidencias por oficina
- tiempo en reparación

    ---

    ## Regla final IA

    La IA debe trabajar solo con el alcance explícito de este archivo, no debe inventar funcionalidad fuera del bloque o documento activo, y debe registrar progreso en `docs/99-progress/` cuando complete trabajo real.
