package com.internship.tool.service;

import com.internship.tool.entity.Asset;
import com.internship.tool.repository.AssetRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ReminderScheduler {

    private final AssetRepository assetRepository;
    private final MailService mailService;

    public ReminderScheduler(AssetRepository assetRepository, MailService mailService) {
        this.assetRepository = assetRepository;
        this.mailService = mailService;
    }

    // Runs once a day at 8:00 AM
    @Scheduled(cron = "0 0 8 * * *")
    public void sendDailyCriticalAssetAlerts() {
        List<Asset> activeAssets = assetRepository.findByDeletedFalse();
        List<Asset> criticalAssets = activeAssets.stream()
                .filter(a -> "Critical".equalsIgnoreCase(a.getRiskLevel()))
                .collect(Collectors.toList());

        if (!criticalAssets.isEmpty()) {
            StringBuilder body = new StringBuilder("Daily Cyber Security Alert:\n\n");
            body.append("The following assets have been quantified with a CRITICAL risk level and require immediate attention:\n\n");

            for (Asset asset : criticalAssets) {
                body.append("• Asset Name: ").append(asset.getAssetName()).append("\n")
                    .append("  Type: ").append(asset.getAssetType()).append("\n")
                    .append("  Risk Score: ").append(asset.getRiskScore()).append("/10\n")
                    .append("  Vulnerabilities: ").append(asset.getVulnerabilities()).append("\n")
                    .append("  Impact: ").append(asset.getImpact()).append("\n\n");
            }

            body.append("Please log into the Cyber Risk Quantification Tool dashboard to review recommendations and apply remediations.\n\n");
            body.append("This is an automated security system notification.");

            mailService.sendEmail("security-admin@company.com", "URGENT: Daily Cyber Risk Alert - Critical Assets Found", body.toString());
        }
    }
}
