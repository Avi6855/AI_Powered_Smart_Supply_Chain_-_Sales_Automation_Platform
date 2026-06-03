package com.supplychain.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.UUID;

/**
 * JWT Authentication Filter - processes JWT tokens from Authorization headers.
 * Runs once per request and sets the security context if the token is valid.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsServiceImpl userDetailsService;
    private final com.supplychain.auth.service.AuthTokenService authTokenService;

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        String traceId = UUID.randomUUID().toString();
        try {
            String jwt = extractTokenFromRequest(request);

            // #region debug-point A:jwt-filter-entry
            debugReport(
                    "A",
                    "[DEBUG] jwt-filter-entry",
                    traceId,
                    request,
                    "tokenPresent", String.valueOf(StringUtils.hasText(jwt)),
                    "path", request.getServletPath(),
                    "method", request.getMethod()
            );
            // #endregion

            if (StringUtils.hasText(jwt) && jwtTokenProvider.validateToken(jwt)) {
                if (!authTokenService.isTokenActive(jwt)) {
                    SecurityContextHolder.clearContext();
                    filterChain.doFilter(request, response);
                    return;
                }
                String email = jwtTokenProvider.getUsernameFromToken(jwt);

                if (SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                    if (jwtTokenProvider.validateToken(jwt, userDetails)) {
                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(
                                        userDetails,
                                        null,
                                        userDetails.getAuthorities()
                                );
                        authentication.setDetails(
                                new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        log.debug("Set authentication for user: {}", email);
                    }
                }
            } else {
                SecurityContextHolder.clearContext();
            }
        } catch (Exception ex) {
            log.error("Could not set user authentication in security context: {}", ex.getMessage());
        }

        filterChain.doFilter(request, response);

        // #region debug-point A:jwt-filter-exit
        debugReport(
                "A",
                "[DEBUG] jwt-filter-exit",
                traceId,
                request,
                "status", String.valueOf(response.getStatus()),
                "principal", String.valueOf(SecurityContextHolder.getContext().getAuthentication() != null ? SecurityContextHolder.getContext().getAuthentication().getName() : null),
                "authorities", String.valueOf(SecurityContextHolder.getContext().getAuthentication() != null ? SecurityContextHolder.getContext().getAuthentication().getAuthorities() : null)
        );
        // #endregion
    }

    /**
     * Extracts the JWT token from the Authorization header.
     */
    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader(AUTHORIZATION_HEADER);
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(BEARER_PREFIX)) {
            return bearerToken.substring(BEARER_PREFIX.length());
        }
        return null;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        // Skip filter for public endpoints
        return path.startsWith("/auth/login") ||
               path.startsWith("/auth/signup") ||
               path.startsWith("/auth/refresh") ||
               path.startsWith("/swagger-ui") ||
               path.startsWith("/v3/api-docs") ||
               path.startsWith("/actuator/health");
    }

    private static void debugReport(
            String hypothesisId,
            String msg,
            String traceId,
            HttpServletRequest request,
            String... kvPairs
    ) {
        // #region debug-point A:debug-report
        try {
            String url = resolveDebugServerUrl();
            String sessionId = "api-token-rbac";
            StringBuilder data = new StringBuilder();
            data.append("{");
            data.append("\"sessionId\":\"").append(sessionId).append("\",");
            data.append("\"runId\":\"pre-fix\",");
            data.append("\"hypothesisId\":\"").append(hypothesisId).append("\",");
            data.append("\"ts\":").append(Instant.now().toEpochMilli()).append(",");
            data.append("\"traceId\":\"").append(traceId).append("\",");
            data.append("\"location\":\"JwtAuthenticationFilter\",");
            data.append("\"msg\":\"").append(msg.replace("\"", "\\\"")).append("\",");
            data.append("\"data\":{");
            data.append("\"clientIp\":\"").append(String.valueOf(request.getRemoteAddr()).replace("\"", "\\\"")).append("\"");
            for (int i = 0; i + 1 < kvPairs.length; i += 2) {
                data.append(",\"").append(kvPairs[i].replace("\"", "\\\"")).append("\":\"")
                        .append(String.valueOf(kvPairs[i + 1]).replace("\"", "\\\"")).append("\"");
            }
            data.append("}}");

            HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
            conn.setRequestMethod("POST");
            conn.setConnectTimeout(200);
            conn.setReadTimeout(200);
            conn.setDoOutput(true);
            conn.setRequestProperty("Content-Type", "application/json");
            conn.getOutputStream().write(data.toString().getBytes(StandardCharsets.UTF_8));
            try (BufferedReader r = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
                while (r.readLine() != null) { }
            } catch (Exception ignored) { }
            conn.disconnect();
        } catch (Exception ignored) {
        }
        // #endregion
    }

    private static String resolveDebugServerUrl() {
        String fallback = "http://127.0.0.1:7778/event";
        try {
            Path p1 = Path.of(System.getProperty("user.dir"), ".dbg", "api-token-rbac.env");
            Path p2 = Path.of(System.getProperty("user.dir"), "..", ".dbg", "api-token-rbac.env");
            Path p = Files.exists(p1) ? p1 : (Files.exists(p2) ? p2 : null);
            if (p == null) return fallback;
            for (String line : Files.readAllLines(p, StandardCharsets.UTF_8)) {
                if (line.startsWith("DEBUG_SERVER_URL=")) return line.substring("DEBUG_SERVER_URL=".length()).trim();
            }
        } catch (Exception ignored) {
        }
        return fallback;
    }
}
