package com.internship.tool.controller;

import com.internship.tool.entity.Asset;
import com.internship.tool.entity.AuditLog;
import com.internship.tool.repository.AssetRepository;
import com.internship.tool.service.AuditLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final AssetRepository assetRepository;
    private final AuditLogService auditLogService;

    public DashboardController(AssetRepository assetRepository, AuditLogService auditLogService) {
        this.assetRepository = assetRepository;
        this.auditLogService = auditLogService;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        long totalAssets = assetRepository.countActiveAssets();
        Double avgRisk = assetRepository.getAverageRiskScore();
        double averageRiskScore = avgRisk != null ? Math.round(avgRisk * 10.0) / 10.0 : 0.0;
        long criticalCount = assetRepository.countCriticalAssets();
        long highCount = assetRepository.countHighAssets();

        List<Asset> active = assetRepository.findByDeletedFalse();
        
        // Compute risk distribution
        Map<String, Long> distribution = active.stream()
                .collect(Collectors.groupingBy(Asset::getRiskLevel, Collectors.counting()));
        
        // Ensure all levels have values
        String[] levels = {"Critical", "High", "Medium", "Low"};
        for (String level : levels) {
            distribution.putIfAbsent(level, 0L);
        }

        // Compute type distribution
        Map<String, Long> typeDistribution = active.stream()
                .collect(Collectors.groupingBy(Asset::getAssetType, Collectors.counting()));

        // Fetch recent logs
        List<AuditLog> recentLogs = auditLogService.getRecentLogs();

        Map<String, Object> response = new HashMap<>();
        response.put("totalAssets", totalAssets);
        response.put("averageRiskScore", averageRiskScore);
        response.put("criticalCount", criticalCount);
        response.put("highCount", highCount);
        response.put("riskDistribution", distribution);
        response.put("typeDistribution", typeDistribution);
        response.put("recentLogs", recentLogs);

        return ResponseEntity.ok(response);
    }
}
