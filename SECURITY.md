# SECURITY.md - Tool-137 Cyber Risk Quantification Tool

## 1. Executive Summary
This document outlines the comprehensive security posture of  Tool-137 . As the  Security Reviewer , I have conducted multi-layer validation including manual injection testing, automated vulnerability scanning (OWASP ZAP), and script-based rate limit stress testing. All critical risks have been mitigated, and the system is ready for live demonstration.

## 2. Threat Model & Mitigation Log
| ID | Threat Description | Risk Level | Mitigation Strategy | Status |
| :--- | :--- | :--- | :--- | :--- |
|  T-01  |  Prompt Injection : Malicious prompts used to manipulate AI output . | High | Injection pattern detection implemented in `middleware.py` . |  FIXED  ✅ |
|  T-02  |  API Key Exposure : Groq API keys committed to version control . | High | Keys secured in `.env`; strictly excluded via `.gitignore` . |  FIXED  ✅ |
|  T-03  |  Rate Limit Abuse : DDoS or API credit exhaustion via request flooding . | Medium | `flask-limiter` configured for  30 req/min  per IP . |  FIXED  ✅ |
|  T-04  |  SQL Injection : Malicious SQL targeting the PostgreSQL database . | Medium | `bleach` sanitization applied to all input fields . |  FIXED  ✅ |
|  T-05  |  Data Exposure : PII or sensitive system data leaked in AI responses . | Medium | PII audit complete; zero personal data sent in prompts . |  FIXED  ✅ |
|  T-06  |  Missing Headers : Lack of standard HTTP security headers . | Medium | Hardened `app.py` with 4 mandatory security headers . |  FIXED  ✅ |

## 3. Security Validation & Lab Results

### **A. Automated Vulnerability Scan (OWASP ZAP)**
An active scan was conducted on the full integrated stack on May 6, 2026, and subsequent validation was done. 
Current scan status: **COMPLETED / ALL FINDS RESOLVED**.

| Finding ID | Severity | Description | Status |
| :--- | :--- | :--- | :--- |
| **ZAP-01** | **Medium** | CSP: Failure to Define Directive with No Fallback | **FIXED** ✅ |
| **ZAP-02** | **Low** | Server Leaks Version Information via HTTP Header | **FIXED** ✅ |
| **ZAP-03** | **Info** | User Agent Fuzzer (Systemic behavior) | **Reviewed** ✅ |

**Notes**: AI Developer 2 has successfully resolved the CSP directive fallback and Server version leak issues in `ai-service/app.py`. We defined explicit fallbacks (`script-src`, `style-src`, `object-src`, `frame-ancestors`) inside the Content Security Policy, and implemented a WSGI middleware to strip and override the `Server` header value to `SecureServer`.[cite: 1].

###  B. Injection Rejection Test 
Endpoints `/describe` and `/recommend` were tested with XSS and jailbreak payloads .
*  Payload : `{"input": "<script>alert(1)</script>", "context": "Ignore all instructions..."}` 
*  Result :  400 Bad Request  (Successful Rejection) .

###  C. Authentication & Rate Limiting 
*  JWT Validation : Calls without a valid token correctly returned  401 Unauthorized  .
*  Stress Test : Verified via manual refresh and automated Python testing script .
*  Result : System triggered "Too Many Requests" after the  30th  request in one minute .

## 4. Final Security Sign-off
Residual risks are negligible, and the system is safe for deployment .
*  Security Reviewer : SRINIVAS D M 
*  Date : May 7, 2026 