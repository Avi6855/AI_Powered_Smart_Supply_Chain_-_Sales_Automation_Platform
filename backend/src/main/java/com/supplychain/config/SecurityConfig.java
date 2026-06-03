package com.supplychain.config;

import com.supplychain.security.JwtAuthenticationFilter;
import com.supplychain.security.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import com.supplychain.security.audit.RestAccessDeniedHandler;
import com.supplychain.security.audit.RestAuthenticationEntryPoint;
import com.supplychain.security.audit.SecurityAuditFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Spring Security configuration for JWT-based stateless authentication.
 * Configures CORS, CSRF protection, session management, and endpoint security.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final UserDetailsServiceImpl userDetailsService;
    private final RestAuthenticationEntryPoint restAuthenticationEntryPoint;
    private final RestAccessDeniedHandler restAccessDeniedHandler;
    private final SecurityAuditFilter securityAuditFilter;

    private static final String[] PUBLIC_ENDPOINTS = {
            "/auth/**",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/v3/api-docs/**",
            "/actuator/health",
            "/actuator/info",
            "/ws/**"
    };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF (stateless JWT API)
            .csrf(AbstractHttpConfigurer::disable)

            // Configure CORS
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // Configure session management (stateless)
            .sessionManagement(session ->
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // Unified 401/403 responses
            .exceptionHandling(ex -> ex
                    .authenticationEntryPoint(restAuthenticationEntryPoint)
                    .accessDeniedHandler(restAccessDeniedHandler)
            )

            // Configure authorization rules
            .authorizeHttpRequests(auth -> auth
                    // Public endpoints
                    .requestMatchers(PUBLIC_ENDPOINTS).permitAll()
                    // Allow OPTIONS requests (CORS preflight)
                    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                    // Admin-only endpoints
                    .requestMatchers("/admin/**").hasAnyRole("SUPER_ADMIN", "ADMIN")
                    .requestMatchers(HttpMethod.DELETE, "/inventory/products/**").hasAnyRole("SUPER_ADMIN", "ADMIN")
                    .requestMatchers(HttpMethod.DELETE, "/suppliers/**").hasAnyRole("SUPER_ADMIN", "ADMIN")

                    // Sales Manager endpoints
                    .requestMatchers("/orders/**").hasAnyRole("SUPER_ADMIN", "ADMIN", "SALES_MANAGER")

                    // Warehouse Manager endpoints
                    .requestMatchers("/warehouses/**").hasAnyRole("SUPER_ADMIN", "ADMIN", "WAREHOUSE_MANAGER")

                    // All authenticated users
                    .anyRequest().authenticated()
            )

            // Configure headers for security
            .headers(headers -> headers
                    .frameOptions(frame -> frame.sameOrigin())
                    .referrerPolicy(referrer ->
                            referrer.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
            )

            // Set authentication provider
            .authenticationProvider(authenticationProvider())

            // Add JWT filter before username/password auth filter
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterAfter(securityAuditFilter, JwtAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of(
                "http://localhost:3000",
                "http://localhost:3001",
                "https://*.supplychain.ai",
                "https://*.vercel.app"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization", "Content-Type", "X-Requested-With", "Accept",
                "Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers",
                "X-User-ID", "X-Tenant-ID"
        ));
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Disposition"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }
}
