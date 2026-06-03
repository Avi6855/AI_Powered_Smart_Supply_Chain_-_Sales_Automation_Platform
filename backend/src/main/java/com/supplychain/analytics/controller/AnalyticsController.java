package com.supplychain.analytics.controller;
import com.supplychain.analytics.dto.DashboardStatsDTO;
import com.supplychain.analytics.service.AnalyticsService;
import com.supplychain.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/analytics") @RequiredArgsConstructor
public class AnalyticsController {
    private final AnalyticsService analyticsService;
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardStatsDTO>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getDashboardStats()));
    }
}