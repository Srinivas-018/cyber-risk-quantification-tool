package com.internship.tool.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.Map;

@Service
public class AiServiceClient {

    private final RestTemplate restTemplate;

    @Value("${ai.service.url:http://localhost:5000}")
    private String aiServiceUrl;

    public AiServiceClient(RestTemplateBuilder builder) {
        this.restTemplate = builder
            .setConnectTimeout(Duration.ofSeconds(10))
            .setReadTimeout(Duration.ofSeconds(10))
            .build();
    }

    public Map<String, Object> describe(Map<String, Object> payload) {
        return callAi("/describe", payload);
    }

    public Map<String, Object> recommend(Map<String, Object> payload) {
        return callAi("/recommend", payload);
    }

    public Map<String, Object> generateReport(Map<String, Object> payload) {
        return callAi("/generate-report", payload);
    }

    private Map<String, Object> callAi(String path, Map<String, Object> payload) {
        try {
            return restTemplate.postForObject(aiServiceUrl + path, payload, Map.class);
        } catch (Exception e) {
            System.err.println("AI Service error: " + e.getMessage());
            return null;
        }
    }
}
