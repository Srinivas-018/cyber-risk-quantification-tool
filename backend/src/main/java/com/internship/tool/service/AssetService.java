package com.internship.tool.service;

import com.internship.tool.entity.Asset;
import com.internship.tool.repository.AssetRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class AssetService {

    private final AssetRepository assetRepository;
    private final AiServiceClient aiServiceClient;

    public AssetService(AssetRepository assetRepository, AiServiceClient aiServiceClient) {
        this.assetRepository = assetRepository;
        this.aiServiceClient = aiServiceClient;
    }

    @Transactional
    @CacheEvict(value = "assets", allEntries = true)
    public Asset createAsset(Asset asset) {
        // Quantify risk using AI Service
        Asset quantified = quantifyRisk(asset);
        return assetRepository.save(quantified);
    }

    @Transactional
    @CacheEvict(value = "assets", allEntries = true)
    public Asset updateAsset(Long id, Asset details) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Asset not found with id: " + id));

        asset.setAssetName(details.getAssetName());
        asset.setAssetType(details.getAssetType());
        
        // Re-quantify if description changed
        if (!Objects.equals(asset.getDescription(), details.getDescription())) {
            asset.setDescription(details.getDescription());
            asset = quantifyRisk(asset);
        }

        return assetRepository.save(asset);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "assets", key = "#id")
    public Optional<Asset> getAssetById(Long id) {
        return assetRepository.findById(id).filter(a -> !a.isDeleted());
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "assets", key = "'list-' + #query + '-' + #riskLevel + '-' + #pageable.pageNumber + '-' + #pageable.pageSize")
    public Page<Asset> getAssets(String query, String riskLevel, Pageable pageable) {
        return assetRepository.searchAndFilter(query, riskLevel, pageable);
    }

    @Transactional
    @CacheEvict(value = "assets", allEntries = true)
    public void deleteAsset(Long id) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Asset not found with id: " + id));
        asset.setDeleted(true);
        assetRepository.save(asset);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getRecommendations(Long id) {
        Asset asset = getAssetById(id)
                .orElseThrow(() -> new NoSuchElementException("Asset not found with id: " + id));

        Map<String, Object> payload = new HashMap<>();
        payload.put("asset_name", asset.getAssetName());
        payload.put("asset_type", asset.getAssetType());
        payload.put("description", asset.getDescription());
        payload.put("risk_level", asset.getRiskLevel());

        Map<String, Object> aiResult = aiServiceClient.recommend(payload);
        if (aiResult instanceof List) {
            return (List<Map<String, Object>>) (List<?>) aiResult;
        } else if (aiResult != null && aiResult.get("recommendations") instanceof List) {
            return (List<Map<String, Object>>) aiResult.get("recommendations");
        } else if (aiResult != null) {
            // If it returned a JSON array representation
            try {
                // Just map it as a singleton list or parsed elements
                return List.of(aiResult);
            } catch (Exception e) {
                // fall through
            }
        }

        // Return fallback recommendations if AI fails
        List<Map<String, Object>> fallbacks = new ArrayList<>();
        Map<String, Object> rec1 = new HashMap<>();
        rec1.put("action_type", "configure");
        rec1.put("description", "Conduct a manual configuration audit and establish firewall access restrictions.");
        rec1.put("priority", "High");
        fallbacks.add(rec1);

        Map<String, Object> rec2 = new HashMap<>();
        rec2.put("action_type", "patch");
        rec2.put("description", "Apply the latest security patches to software and firmware components.");
        rec2.put("priority", "Medium");
        fallbacks.add(rec2);

        Map<String, Object> rec3 = new HashMap<>();
        rec3.put("action_type", "monitor");
        rec3.put("description", "Configure real-time monitoring and enable audit logging logs.");
        rec3.put("priority", "Low");
        fallbacks.add(rec3);

        return fallbacks;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> generateReport(Long id) {
        Asset asset = getAssetById(id)
                .orElseThrow(() -> new NoSuchElementException("Asset not found with id: " + id));

        Map<String, Object> payload = new HashMap<>();
        payload.put("asset_name", asset.getAssetName());
        payload.put("asset_type", asset.getAssetType());
        payload.put("description", asset.getDescription());
        payload.put("risk_level", asset.getRiskLevel());
        payload.put("risk_score", asset.getRiskScore());
        payload.put("impact", asset.getImpact());
        payload.put("vulnerabilities", Arrays.asList(asset.getVulnerabilities().split(", ")));

        Map<String, Object> report = aiServiceClient.generateReport(payload);
        if (report != null) {
            return report;
        }

        // Fallback report
        Map<String, Object> fallbackReport = new HashMap<>();
        fallbackReport.put("title", "Executive Cyber Risk Report - " + asset.getAssetName());
        fallbackReport.put("summary", "System risk assessment report details a risk level of " + asset.getRiskLevel() + ".");
        fallbackReport.put("overview", "Overview: Evaluated " + asset.getAssetName() + " (" + asset.getAssetType() + ") risk factors.");
        fallbackReport.put("key_items", List.of("Assessed Risk Score: " + asset.getRiskScore(), "Identified Vulnerabilities: " + asset.getVulnerabilities()));
        fallbackReport.put("recommendations", List.of("Conduct manual verification", "Verify input sanitization"));
        fallbackReport.put("is_fallback", true);
        return fallbackReport;
    }

    private Asset quantifyRisk(Asset asset) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("asset_name", asset.getAssetName());
        payload.put("asset_type", asset.getAssetType());
        payload.put("description", asset.getDescription());

        Map<String, Object> aiResult = aiServiceClient.describe(payload);
        if (aiResult != null) {
            try {
                asset.setRiskLevel(String.valueOf(aiResult.getOrDefault("risk_level", "Medium")));
                Object scoreObj = aiResult.get("risk_score");
                if (scoreObj instanceof Number) {
                    asset.setRiskScore(((Number) scoreObj).intValue());
                } else {
                    asset.setRiskScore(Integer.parseInt(String.valueOf(scoreObj)));
                }

                Object vulnsObj = aiResult.get("vulnerabilities");
                if (vulnsObj instanceof List) {
                    asset.setVulnerabilities(String.join(", ", (List<String>) vulnsObj));
                } else {
                    asset.setVulnerabilities(String.valueOf(vulnsObj));
                }

                asset.setImpact(String.valueOf(aiResult.getOrDefault("impact", "Unknown")));
                return asset;
            } catch (Exception e) {
                System.err.println("Error parsing AI result, applying fallbacks: " + e.getMessage());
            }
        }

        // AI Fallback defaults
        asset.setRiskLevel("Medium");
        asset.setRiskScore(5);
        asset.setVulnerabilities("Unknown vulnerabilities (AI unavailable)");
        asset.setImpact("Business operational impact (AI unavailable)");
        return asset;
    }
}
