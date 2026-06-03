package com.supplychain.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AuthTokenRbacIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void loginStoresToken_logoutRevokesToken() throws Exception {
        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "firstName": "Admin",
                                  "lastName": "User",
                                  "email": "admin1@supplychain.com",
                                  "password": "Password123!",
                                  "confirmPassword": "Password123!",
                                  "role": "ADMIN"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        String loginBody = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "admin1@supplychain.com",
                                  "password": "Password123!"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode loginJson = objectMapper.readTree(loginBody);
        String token = loginJson.path("data").path("token").asText();

        mockMvc.perform(get("/api/products")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/auth/logout")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        mockMvc.perform(get("/api/products")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void rbacBlocksUnauthorizedDeletes() throws Exception {
        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "firstName": "Analyst",
                                  "lastName": "User",
                                  "email": "analyst1@supplychain.com",
                                  "password": "Password123!",
                                  "confirmPassword": "Password123!",
                                  "role": "ANALYST"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        String loginBody = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "analyst1@supplychain.com",
                                  "password": "Password123!"
                                }
                                """))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode loginJson = objectMapper.readTree(loginBody);
        String token = loginJson.path("data").path("token").asText();

        mockMvc.perform(delete("/api/suppliers/999")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }
}

