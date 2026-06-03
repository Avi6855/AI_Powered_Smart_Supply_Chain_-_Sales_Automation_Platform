package com.supplychain.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * JWT token provider for generating, validating, and parsing JWT tokens.
 * Uses HMAC-SHA512 signing algorithm for security.
 */
@Component
@Slf4j
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    @Value("${jwt.refresh-expiration}")
    private long refreshExpiration;

    /**
     * Generates an access token for the given user details.
     *
     * @param userDetails the user details
     * @return the JWT access token
     */
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        if (userDetails instanceof com.supplychain.auth.entity.User user) {
            claims.put("role", user.getRole().name());
            claims.put("firstName", user.getFirstName());
            claims.put("lastName", user.getLastName());
            claims.put("userId", user.getId());
        }
        return buildToken(claims, userDetails, jwtExpiration);
    }

    /**
     * Generates a refresh token for the given user details.
     *
     * @param userDetails the user details
     * @return the JWT refresh token
     */
    public String generateRefreshToken(UserDetails userDetails) {
        return buildToken(new HashMap<>(), userDetails, refreshExpiration);
    }

    /**
     * Validates a JWT token against the given user details.
     *
     * @param token the JWT token
     * @param userDetails the user details to validate against
     * @return true if the token is valid
     */
    public boolean validateToken(String token, UserDetails userDetails) {
        final String username = getUsernameFromToken(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    /**
     * Validates a JWT token without user details check.
     *
     * @param token the JWT token
     * @return true if the token is structurally valid and not expired
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (MalformedJwtException ex) {
            log.error("Invalid JWT token: {}", ex.getMessage());
        } catch (ExpiredJwtException ex) {
            log.error("JWT token is expired: {}", ex.getMessage());
        } catch (UnsupportedJwtException ex) {
            log.error("JWT token is unsupported: {}", ex.getMessage());
        } catch (IllegalArgumentException ex) {
            log.error("JWT claims string is empty: {}", ex.getMessage());
        }
        return false;
    }

    /**
     * Extracts the username (email) from a JWT token.
     */
    public String getUsernameFromToken(String token) {
        return getClaimFromToken(token, Claims::getSubject);
    }

    /**
     * Extracts the expiration date from a JWT token.
     */
    public Date getExpirationFromToken(String token) {
        return getClaimFromToken(token, Claims::getExpiration);
    }

    /**
     * Extracts a specific claim from a JWT token.
     */
    public <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = getAllClaimsFromToken(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Checks if a JWT token has expired.
     */
    public boolean isTokenExpired(String token) {
        final Date expiration = getExpirationFromToken(token);
        return expiration.before(new Date());
    }

    /**
     * Returns the expiration time in milliseconds.
     */
    public long getExpirationTime() {
        return jwtExpiration;
    }

    // ================================================================
    // Private helper methods
    // ================================================================

    private String buildToken(Map<String, Object> extraClaims, UserDetails userDetails, long expiration) {
        return Jwts.builder()
                .claims(extraClaims)
                .subject(userDetails.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(), Jwts.SIG.HS512)
                .compact();
    }

    private Claims getAllClaimsFromToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
