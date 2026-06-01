package com.internship.tool.controller;

import com.internship.tool.entity.Asset;
import com.internship.tool.repository.AssetRepository;
import com.internship.tool.service.AssetService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/assets")
public class AssetController {

    private final AssetService assetService;
    private final AssetRepository assetRepository; // For export database access

    public AssetController(AssetService assetService, AssetRepository assetRepository) {
        this.assetService = assetService;
        this.assetRepository = assetRepository;
    }

    @GetMapping
    public ResponseEntity<Page<Asset>> getAllAssets(
            @RequestParam(defaultValue = "") String query,
            @RequestParam(defaultValue = "") String riskLevel,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Asset> assets = assetService.getAssets(query, riskLevel, pageable);
        return ResponseEntity.ok(assets);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Asset> getAssetById(@PathVariable Long id) {
        return assetService.getAssetById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PostMapping
    public ResponseEntity<Asset> createAsset(@RequestBody Asset asset) {
        Asset saved = assetService.createAsset(asset);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Asset> updateAsset(@PathVariable Long id, @RequestBody Asset asset) {
        try {
            Asset updated = assetService.updateAsset(id, asset);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAsset(@PathVariable Long id) {
        try {
            assetService.deleteAsset(id);
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/{id}/recommendations")
    public ResponseEntity<List<Map<String, Object>>> getRecommendations(@PathVariable Long id) {
        try {
            List<Map<String, Object>> recommendations = assetService.getRecommendations(id);
            return ResponseEntity.ok(recommendations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/{id}/report")
    public ResponseEntity<Map<String, Object>> generateReport(@PathVariable Long id) {
        try {
            Map<String, Object> report = assetService.generateReport(id);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping("/export")
    public void exportToCsv(HttpServletResponse response) throws IOException {
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=cyber_risk_assets.csv");
        PrintWriter writer = response.getWriter();
        
        // CSV Header
        writer.println("ID,Asset Name,Asset Type,Description,Risk Level,Risk Score,Vulnerabilities,Impact,Created Date");
        
        List<Asset> assets = assetRepository.findByDeletedFalse();
        for (Asset asset : assets) {
            writer.println(String.format("%d,\"%s\",\"%s\",\"%s\",\"%s\",%d,\"%s\",\"%s\",\"%s\"",
                asset.getId(),
                escapeCsv(asset.getAssetName()),
                escapeCsv(asset.getAssetType()),
                escapeCsv(asset.getDescription()),
                asset.getRiskLevel(),
                asset.getRiskScore(),
                escapeCsv(asset.getVulnerabilities()),
                escapeCsv(asset.getImpact()),
                asset.getCreatedDate().toString()
            ));
        }
        writer.flush();
        writer.close();
    }

    private String escapeCsv(String val) {
        if (val == null) {
            return "";
        }
        return val.replace("\"", "\"\"");
    }
}
