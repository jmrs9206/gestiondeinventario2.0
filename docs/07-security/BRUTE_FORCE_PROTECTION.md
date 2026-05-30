# Brute Force Protection & Rate Limiting Strategy

Para proteger el endpoint crítico de autenticación (`POST /api/v1/auth/login`) contra ataques de fuerza bruta y denegación de servicio (DDoS), implementamos una estrategia de seguridad en dos capas:
1. **Infraestructura (Proxy Inverso):** Rate limiting a nivel de IP con Nginx.
2. **Negocio (Base de Datos & Aplicación):** Bloqueo temporal de cuentas tras múltiples intentos fallidos secuenciales.

---

## 1. Rate Limiting en Nginx (Infraestructura)

Nginx controla la frecuencia de las solicitudes entrantes utilizando el algoritmo *Token Bucket*. Para proteger la ruta `/api/v1/auth/login`, se define una zona de límite de solicitudes basada en la dirección IP del cliente (`$binary_remote_addr`).

### Configuración en `nginx.conf`

```nginx
http {
    # Define la zona de almacenamiento (10MB permite guardar ~160,000 IPs)
    # y la tasa máxima de solicitudes permitidas (5 peticiones por minuto)
    limit_req_zone $binary_remote_addr zone=login_limit:10m rate=5r/m;

    server {
        listen 443 ssl;
        server_name inventario.vdenergy.es;

        # Protección específica del endpoint de Login
        location /api/v1/auth/login {
            # Aplica el limitador con un buffer (burst) de 5 peticiones y nodelay para rechazar de inmediato
            limit_req zone=login_limit burst=5 nodelay;
            
            proxy_pass http://backend:8080;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Demás rutas...
    }
}
```

---

## 2. Bloqueo de Cuentas a Nivel de Negocio (Base de Datos)

Para evitar la fuerza bruta sobre contraseñas específicas, se almacenan contadores de intentos y marcas de tiempo de bloqueo en la tabla de usuarios de MySQL.

### Estructura de la Tabla `users` (MySQL 8.4)

```sql
ALTER TABLE users 
ADD COLUMN failed_login_attempts INT DEFAULT 0,
ADD COLUMN lockout_until TIMESTAMP NULL DEFAULT NULL;
```

- `failed_login_attempts`: Entero que incrementa con cada intento fallido y se reinicia a `0` tras un login exitoso.
- `lockout_until`: Marca de tiempo que define hasta cuándo la cuenta estará bloqueada para iniciar sesión. Si es `NULL` o está en el pasado, la cuenta está desbloqueada.

---

## 3. Implementación en Spring Boot (Código Java)

Implementamos el control de bloqueo mediante eventos nativos de seguridad de Spring Security (`AuthenticationFailureBadCredentialsEvent` e `InteractiveAuthenticationSuccessEvent`).

### Servicio de Bloqueo de Usuarios (`UserLockoutService.java`)

```java
package com.vdenergy.inventory.auth.service;

import com.vdenergy.inventory.users.model.User;
import com.vdenergy.inventory.users.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class UserLockoutService {

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final int LOCKOUT_DURATION_MINUTES = 15;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public void registerFailedAttempt(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);
            
            if (user.getFailedLoginAttempts() >= MAX_FAILED_ATTEMPTS) {
                user.setLockoutUntil(LocalDateTime.now().plusMinutes(LOCKOUT_DURATION_MINUTES));
            }
            
            userRepository.save(user);
        });
    }

    @Transactional
    public void resetFailedAttempts(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            user.setFailedLoginAttempts(0);
            user.setLockoutUntil(null);
            userRepository.save(user);
        });
    }

    public boolean isLocked(User user) {
        if (user.getLockoutUntil() == null) {
            return false;
        }
        // Comprobar si el tiempo de bloqueo ya expiró
        if (user.getLockoutUntil().isBefore(LocalDateTime.now())) {
            // Desbloqueo pasivo
            resetFailedAttempts(user.getEmail());
            return false;
        }
        return true;
    }
}
```

### Listeners de Eventos de Autenticación (`AuthenticationListeners.java`)

```java
package com.vdenergy.inventory.auth.listener;

import com.vdenergy.inventory.auth.service.UserLockoutService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.security.authentication.event.AuthenticationFailureBadCredentialsEvent;
import org.springframework.security.authentication.event.AuthenticationSuccessEvent;
import org.springframework.stereotype.Component;

@Component
public class AuthenticationListeners {

    @Autowired
    private UserLockoutService lockoutService;

    @EventListener
    public void onFailure(AuthenticationFailureBadCredentialsEvent event) {
        String email = event.getAuthentication().getName();
        lockoutService.registerFailedAttempt(email);
    }

    @EventListener
    public void onSuccess(AuthenticationSuccessEvent event) {
        String email = event.getAuthentication().getName();
        lockoutService.resetFailedAttempts(email);
    }
}
```

### Integración en `UserDetailsService`

Durante la carga del usuario en Spring Security, validamos si la cuenta está bloqueada y arrojamos la excepción correspondiente:

```java
package com.vdenergy.inventory.auth.service;

import com.vdenergy.inventory.users.model.User;
import com.vdenergy.inventory.users.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserLockoutService lockoutService;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con email: " + email));

        if (lockoutService.isLocked(user)) {
            throw new LockedException("La cuenta ha sido bloqueada temporalmente por exceso de intentos fallidos.");
        }

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .disabled(!user.isActive())
                .accountLocked(true) // Spring Security lanzará LockedException si está en true
                .authorities(user.getRole().name())
                .build();
    }
}
```
