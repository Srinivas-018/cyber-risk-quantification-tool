package com.internship.tool.config;

import com.internship.tool.entity.Asset;
import com.internship.tool.service.AuditLogService;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class AuditAspect {

    private final AuditLogService auditLogService;

    public AuditAspect(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @Pointcut("execution(* com.internship.tool.service.AssetService.createAsset(..))")
    public void createAssetPointcut() {}

    @Pointcut("execution(* com.internship.tool.service.AssetService.updateAsset(..))")
    public void updateAssetPointcut() {}

    @Pointcut("execution(* com.internship.tool.service.AssetService.deleteAsset(..))")
    public void deleteAssetPointcut() {}

    @AfterReturning(pointcut = "createAssetPointcut()", returning = "result")
    public void logAssetCreation(JoinPoint joinPoint, Object result) {
        if (result instanceof Asset) {
            Asset asset = (Asset) result;
            String username = getUsername();
            auditLogService.log("CREATE", "Created asset: " + asset.getAssetName() + " (ID: " + asset.getId() + ")", username);
        }
    }

    @AfterReturning(pointcut = "updateAssetPointcut()", returning = "result")
    public void logAssetUpdate(JoinPoint joinPoint, Object result) {
        if (result instanceof Asset) {
            Asset asset = (Asset) result;
            String username = getUsername();
            auditLogService.log("UPDATE", "Updated asset: " + asset.getAssetName() + " (ID: " + asset.getId() + ")", username);
        }
    }

    @AfterReturning(pointcut = "deleteAssetPointcut()")
    public void logAssetDeletion(JoinPoint joinPoint) {
        Object[] args = joinPoint.getArgs();
        if (args.length > 0 && args[0] instanceof Long) {
            Long id = (Long) args[0];
            String username = getUsername();
            auditLogService.log("DELETE", "Soft deleted asset with ID: " + id, username);
        }
    }

    private String getUsername() {
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            return SecurityContextHolder.getContext().getAuthentication().getName();
        }
        return "SYSTEM";
    }
}
