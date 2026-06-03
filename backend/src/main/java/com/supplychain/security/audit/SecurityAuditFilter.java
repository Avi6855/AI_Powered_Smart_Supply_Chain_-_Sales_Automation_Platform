package com.supplychain.security.audit;

import com.supplychain.auth.entity.User;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class SecurityAuditFilter extends OncePerRequestFilter {

    public static final String DENIED_REASON_ATTR = "SECURITY_DENIED_REASON";

    private final SecurityAuditLogRepository securityAuditLogRepository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        try {
            filterChain.doFilter(request, response);
        } finally {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            User user = (auth != null && auth.getPrincipal() instanceof User u) ? u : null;

            String path = request.getRequestURI();
            String query = request.getQueryString();
            if (query != null && !query.isBlank()) path = path + "?" + query;

            int status = response.getStatus();
            boolean allowed = status != 401 && status != 403;
            String reason = (String) request.getAttribute(DENIED_REASON_ATTR);

            SecurityAuditLog log = SecurityAuditLog.builder()
                    .user(user)
                    .email(user != null ? user.getEmail() : null)
                    .role(user != null && user.getRole() != null ? user.getRole().name() : null)
                    .method(request.getMethod())
                    .path(path)
                    .status(status)
                    .allowed(allowed)
                    .reason(reason)
                    .clientIp(request.getRemoteAddr())
                    .userAgent(request.getHeader("User-Agent"))
                    .build();

            securityAuditLogRepository.save(log);
        }
    }
}

