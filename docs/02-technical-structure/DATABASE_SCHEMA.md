# DATABASE_SCHEMA.md

    > Proyecto: VDEnergy Inventory Management System  
    > Modo: Caveman Mode  
    > Fecha base: 2026-05-22

    ## Objetivo

Modelo oficial de base de datos.

## Motor

```text
MySQL 8.04 ó 8.4
```

## Migraciones

```text
Flyway
```

## Tablas principales

```text
users
offices
materials
material_history
audit_log
refresh_tokens
api_clients
api_client_scopes
```

## users

```text
id BIGINT PK
public_id VARCHAR(64) UNIQUE NOT NULL
first_name VARCHAR(120) NOT NULL
last_name VARCHAR(120) NOT NULL
email VARCHAR(180) UNIQUE NOT NULL
password_hash VARCHAR(255) NOT NULL
role ENUM('ADMIN','TECNICO') NOT NULL
active BOOLEAN NOT NULL DEFAULT TRUE
created_at TIMESTAMP NOT NULL
updated_at TIMESTAMP NOT NULL
```

## offices

```text
id BIGINT PK
public_id VARCHAR(64) UNIQUE NOT NULL
name VARCHAR(160) NOT NULL
active BOOLEAN NOT NULL DEFAULT TRUE
created_at TIMESTAMP NOT NULL
updated_at TIMESTAMP NOT NULL
```

## materials

```text
id BIGINT PK
public_code VARCHAR(80) UNIQUE NOT NULL
material_type VARCHAR(80) NOT NULL
brand VARCHAR(120)
model VARCHAR(120)
serial_number VARCHAR(160)
office_id BIGINT NOT NULL FK offices(id)
status ENUM('OPERATIVO','ROTO','EN_REPARACION','BAJA') NOT NULL
qr_generated_at TIMESTAMP
qr_version INT NOT NULL DEFAULT 1
active BOOLEAN NOT NULL DEFAULT TRUE
created_at TIMESTAMP NOT NULL
updated_at TIMESTAMP NOT NULL
```

## material_history

```text
id BIGINT PK
material_id BIGINT NOT NULL FK materials(id)
action VARCHAR(80) NOT NULL
previous_status VARCHAR(40)
new_status VARCHAR(40)
previous_office_id BIGINT
new_office_id BIGINT
comment TEXT
performed_by_user_id BIGINT FK users(id)
created_at TIMESTAMP NOT NULL
```

## audit_log

```text
id BIGINT PK
entity_type VARCHAR(80) NOT NULL
entity_id VARCHAR(120)
action VARCHAR(120) NOT NULL
old_value JSON
new_value JSON
performed_by_type VARCHAR(40) NOT NULL
performed_by_id VARCHAR(120)
ip_address VARCHAR(80)
user_agent VARCHAR(500)
created_at TIMESTAMP NOT NULL
```

## refresh_tokens

```text
id BIGINT PK
user_id BIGINT NOT NULL FK users(id)
token_hash VARCHAR(255) NOT NULL
expires_at TIMESTAMP NOT NULL
revoked BOOLEAN NOT NULL DEFAULT FALSE
created_at TIMESTAMP NOT NULL
```

## api_clients

```text
id BIGINT PK
public_id VARCHAR(64) UNIQUE NOT NULL
name VARCHAR(180) NOT NULL
api_key_hash VARCHAR(255) NOT NULL
active BOOLEAN NOT NULL DEFAULT TRUE
last_used_at TIMESTAMP
created_at TIMESTAMP NOT NULL
updated_at TIMESTAMP NOT NULL
```

## api_client_scopes

```text
id BIGINT PK
api_client_id BIGINT NOT NULL FK api_clients(id)
scope VARCHAR(120) NOT NULL
created_at TIMESTAMP NOT NULL
```

## Índices obligatorios

```text
users.email
users.public_id
offices.public_id
materials.public_code
materials.status
materials.office_id
materials.active
material_history.material_id
material_history.created_at
audit_log.entity_type
audit_log.entity_id
audit_log.action
audit_log.created_at
refresh_tokens.user_id
api_clients.public_id
api_client_scopes.api_client_id
```

## Reglas

- No hard delete para entidades críticas.
- No IDs secuenciales públicos.
- No estados libres.
- No modificar schema sin Flyway.

    ---

    ## Regla final IA

    La IA debe trabajar solo con el alcance explícito de este archivo, no debe inventar funcionalidad fuera del bloque o documento activo, y debe registrar progreso en `docs/99-progress/` cuando complete trabajo real.
