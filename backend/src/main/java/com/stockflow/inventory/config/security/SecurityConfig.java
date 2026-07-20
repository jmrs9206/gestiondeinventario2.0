package com.stockflow.inventory.config.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stockflow.inventory.audit.service.AuditService;
import com.stockflow.inventory.auth.filter.JwtFilter;
import com.stockflow.inventory.users.entity.User;
import com.stockflow.inventory.users.repository.UserRepository;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import org.springframework.beans.factory.annotation.Value;

import java.io.OutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
 
    private final JwtFilter jwtFilter;
    private final com.stockflow.inventory.common.filter.CorrelationIdFilter correlationIdFilter;
    private final AuditService auditService;

    @Value("${app.security.cors.allowed-origins:http://localhost:3000,http://127.0.0.1:3000}")
    private List<String> allowedOrigins;
 
    public SecurityConfig(JwtFilter jwtFilter, com.stockflow.inventory.common.filter.CorrelationIdFilter correlationIdFilter, AuditService auditService) {
        this.jwtFilter = jwtFilter;
        this.correlationIdFilter = correlationIdFilter;
        this.auditService = auditService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, AuthenticationProvider authenticationProvider) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/health", "/actuator/health", "/actuator/prometheus").permitAll()
                .requestMatchers("/api/v1/branding").permitAll()
                .requestMatchers("/api/v1/auth/login", "/api/v1/auth/refresh", "/api/v1/auth/logout", "/api/v1/auth/accept-invitation").permitAll()
                .requestMatchers("/error").permitAll()
                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider)
            .addFilterBefore(correlationIdFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint(authenticationEntryPoint())
                .accessDeniedHandler(accessDeniedHandler())
            );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService(
            UserRepository userRepository,
            com.stockflow.inventory.users.repository.RolePermissionRepository rolePermissionRepository
    ) {
        return email -> {
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
            if (!user.isAccountNonLocked()) {
                throw new org.springframework.security.authentication.LockedException("La cuenta está bloqueada temporalmente.");
            }
            
            // Load permissions dynamically from DB
            List<com.stockflow.inventory.users.entity.RolePermission> rolePerms = rolePermissionRepository.findByRole(user.getRole().name());
            List<org.springframework.security.core.GrantedAuthority> authorities = new java.util.ArrayList<>();
            authorities.add(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
            
            if (rolePermissionRepository.count() == 0) {
                // Fallback for tests when DB is not seeded
                if (user.getRole() == com.stockflow.inventory.users.entity.Role.ADMIN) {
                    authorities.add(new SimpleGrantedAuthority("CREATE_USER"));
                    authorities.add(new SimpleGrantedAuthority("READ_USER"));
                    authorities.add(new SimpleGrantedAuthority("UPDATE_USER"));
                    authorities.add(new SimpleGrantedAuthority("CREATE_OFFICE"));
                    authorities.add(new SimpleGrantedAuthority("UPDATE_OFFICE"));
                    authorities.add(new SimpleGrantedAuthority("CREATE_MATERIAL"));
                    authorities.add(new SimpleGrantedAuthority("UPDATE_MATERIAL"));
                    authorities.add(new SimpleGrantedAuthority("UPDATE_MATERIAL_STATUS"));
                    authorities.add(new SimpleGrantedAuthority("READ_DASHBOARD"));
                    authorities.add(new SimpleGrantedAuthority("READ_AUDIT_LOG"));
                    authorities.add(new SimpleGrantedAuthority("READ_MATERIAL_HISTORY"));
                    authorities.add(new SimpleGrantedAuthority("MANAGE_API_CLIENTS"));
                    authorities.add(new SimpleGrantedAuthority("REGENERATE_QR"));
                    authorities.add(new SimpleGrantedAuthority("MANAGE_ROLES"));
                } else if (user.getRole() == com.stockflow.inventory.users.entity.Role.TECNICO) {
                    authorities.add(new SimpleGrantedAuthority("CREATE_OFFICE"));
                    authorities.add(new SimpleGrantedAuthority("UPDATE_OFFICE"));
                    authorities.add(new SimpleGrantedAuthority("CREATE_MATERIAL"));
                    authorities.add(new SimpleGrantedAuthority("UPDATE_MATERIAL"));
                    authorities.add(new SimpleGrantedAuthority("UPDATE_MATERIAL_STATUS"));
                    authorities.add(new SimpleGrantedAuthority("READ_MATERIAL_HISTORY"));
                }
            } else {
                for (com.stockflow.inventory.users.entity.RolePermission rp : rolePerms) {
                    authorities.add(new SimpleGrantedAuthority(rp.getPermission()));
                }
            }
            user.setAuthorities(authorities);
            
            return user;
        };
    }

    @Bean
    public AuthenticationProvider authenticationProvider(UserDetailsService userDetailsService, PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder);
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(allowedOrigins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With", "Accept", "X-API-Key", "X-Correlation-ID"));
        configuration.setExposedHeaders(List.of("Authorization", "X-Correlation-ID"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationEntryPoint authenticationEntryPoint() {
        return (request, response, authException) -> {
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

            Map<String, Object> body = new HashMap<>();
            body.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            body.put("status", HttpServletResponse.SC_UNAUTHORIZED);
            body.put("error", "Unauthorized");
            body.put("message", "Full authentication is required to access this resource");
            body.put("path", request.getRequestURI());

            OutputStream out = response.getOutputStream();
            ObjectMapper mapper = new ObjectMapper();
            mapper.writeValue(out, body);
            out.flush();
        };
    }

    @Bean
    public AccessDeniedHandler accessDeniedHandler() {
        return (request, response, accessDeniedException) -> {
            String ip = request.getRemoteAddr();
            String userAgent = request.getHeader("User-Agent");
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userId = "NONE";
            String performedByType = "SYSTEM";
            String action = "ACCESS_DENIED";
            String entityType = "User";
            if (auth != null && auth.isAuthenticated()) {
                if (auth.getPrincipal() instanceof User) {
                    User user = (User) auth.getPrincipal();
                    userId = user.getPublicId();
                    performedByType = "USER";
                } else if (auth.getPrincipal() instanceof com.stockflow.inventory.publicapi.entity.ApiClient) {
                    com.stockflow.inventory.publicapi.entity.ApiClient client = (com.stockflow.inventory.publicapi.entity.ApiClient) auth.getPrincipal();
                    userId = client.getPublicId();
                    performedByType = "API_CLIENT";
                    action = "PUBLIC_API_DENIED";
                    entityType = "ApiClient";
                }
            }
            auditService.logEvent(entityType, userId, action, performedByType, userId, ip, userAgent);

            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);

            Map<String, Object> body = new HashMap<>();
            body.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
            body.put("status", HttpServletResponse.SC_FORBIDDEN);
            body.put("error", "Forbidden");
            body.put("message", "Access is denied");
            body.put("path", request.getRequestURI());

            OutputStream out = response.getOutputStream();
            ObjectMapper mapper = new ObjectMapper();
            mapper.writeValue(out, body);
            out.flush();
        };
    }
}
