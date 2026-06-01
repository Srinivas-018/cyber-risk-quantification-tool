package com.internship.tool.repository;

import com.internship.tool.entity.Asset;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {

    Page<Asset> findByDeletedFalse(Pageable pageable);

    @Query("SELECT a FROM Asset a WHERE a.deleted = false AND " +
           "(COALESCE(:riskLevel, '') = '' OR a.riskLevel = :riskLevel) AND " +
           "(LOWER(a.assetName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(a.assetType) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(a.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Asset> searchAndFilter(
            @Param("query") String query,
            @Param("riskLevel") String riskLevel,
            Pageable pageable
    );

    List<Asset> findByDeletedFalse();

    @Query("SELECT COUNT(a) FROM Asset a WHERE a.deleted = false")
    long countActiveAssets();

    @Query("SELECT AVG(a.riskScore) FROM Asset a WHERE a.deleted = false")
    Double getAverageRiskScore();

    @Query("SELECT COUNT(a) FROM Asset a WHERE a.deleted = false AND a.riskLevel = 'Critical'")
    long countCriticalAssets();

    @Query("SELECT COUNT(a) FROM Asset a WHERE a.deleted = false AND a.riskLevel = 'High'")
    long countHighAssets();
}
