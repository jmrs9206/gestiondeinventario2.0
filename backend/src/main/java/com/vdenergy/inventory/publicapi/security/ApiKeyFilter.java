package com.vdenergy.inventory.publicapi.security;

import com.vdenergy.inventory.publicapi.entity.ApiClient;
import com.vdenergy.inventory.publicapi.service.PublicApiService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class ApiKeyFilter extends OncePerRequestFilter {

    private final PublicApiService publicApiService;

    public ApiKeyFilter(PublicApiService publicApiService) {
        this.publicApiService = publicApiService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        String path = request.getRequestURI();

        if (path.startsWith("/public-api/")) {
            String apiKey = request.getHeader("X-API-Key");
            if (apiKey != null && !apiKey.trim().isEmpty()) {
                String ip = getClientIp(request);
                String userAgent = request.getHeader("User-Agent");

                Optional<ApiClient> clientOpt = publicApiService.validateAndAuthenticateKey(apiKey, ip, userAgent);
                if (clientOpt.isPresent()) {
                    ApiClient client = clientOpt.get();

                    List<SimpleGrantedAuthority> authorities = client.getScopes().stream()
                            .map(scope -> new SimpleGrantedAuthority("SCOPE_" + scope.getScope()))
                            .collect(Collectors.toList());

                    ApiKeyAuthenticationToken authentication = new ApiKeyAuthenticationToken(client, authorities);
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
