package com.supplychain.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SwaggerAliasController {

    @GetMapping("/v3/api-docs")
    public String forwardV3ApiDocs() {
        return "forward:/api-docs";
    }

    @GetMapping("/v3/api-docs/swagger-config")
    public String forwardV3SwaggerConfig() {
        return "forward:/api-docs/swagger-config";
    }

    @GetMapping("/swagger-ui-index.html")
    public String redirectSwaggerUiIndex() {
        return "redirect:/swagger-ui/index.html";
    }
}

