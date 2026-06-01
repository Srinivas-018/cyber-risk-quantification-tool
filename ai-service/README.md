# AI Service — Tool-137 Cyber Risk Quantification Tool

## Overview
Flask-based AI microservice using Groq API (LLaMA-3.3-70b-versatile)
for cyber risk assessment.

## Tech Stack
- Python 3.11
- Flask 3.0
- Groq API (LLaMA-3.3-70b-versatile)
- flask-limiter (30 req/min)
- bleach (input sanitisation)
- Redis (AI response cache)

## Prerequisites
- Python 3.11
- pip3
- Redis (optional)
- Groq API key (console.groq.com)

## Setup

### 1. Clone the repo
git clone https://github.com/yashaswinijayakumarr/cyber-risk-quantification-tool.git
cd cyber-risk-quantification-tool/ai-service

### 2. Install dependencies
pip3 install -r requirements.txt

### 3. Create .env file
cp ../.env.example .env
Add your GROQ_API_KEY to .env

### 4. Run the service
python3 app.py

### 5. Verify it's running
curl http://localhost:5000/health

## Environment Variables
| Variable | Description | Required |
|----------|-------------|----------|
| GROQ_API_KEY | Groq API key from console.groq.com | Yes |
| REDIS_HOST | Redis host (default: localhost) | No |
| REDIS_PORT | Redis port (default: 6379) | No |

## API Reference

### GET /health
Returns service health status.

Response:
{
    "status": "healthy",
    "model": "llama-3.3-70b-versatile",
    "uptime": "0h 0m 5s",
    "avg_response_time_ms": 0,
    "total_requests": 0
}

### POST /describe
Returns cyber risk assessment for an asset.

Request:
{
    "asset_name": "Web Server",
    "asset_type": "Server",
    "description": "Public facing server with no firewall"
}

Response:
{
    "risk_level": "Critical",
    "risk_score": 9,
    "description": "...",
    "vulnerabilities": ["...", "...", "..."],
    "impact": "...",
    "generated_at": "2026-01-01T00:00:00"
}

### POST /recommend
Returns 3 security recommendations for an asset.

Request:
{
    "asset_name": "Web Server",
    "asset_type": "Server",
    "description": "Public facing server with no firewall",
    "risk_level": "Critical"
}

Response:
[
    {
        "action_type": "configure",
        "description": "...",
        "priority": "High"
    }
]

### POST /generate-report
Returns a structured, executive-level cyber risk report for an asset.

Request:
```json
{
    "asset_name": "Web Server",
    "asset_type": "Server",
    "description": "Public facing server with no firewall",
    "risk_level": "Critical",
    "risk_score": 9,
    "vulnerabilities": ["Unencrypted traffic", "Weak credentials"],
    "impact": "High business impact"
}
```

Response:
```json
{
    "title": "Cyber Risk Assessment Report: Web Server",
    "summary": "...",
    "overview": "...",
    "key_items": ["...", "...", "..."],
    "recommendations": ["...", "...", "..."]
}
```

## Running Tests
cd ai-service
python3 -m pytest tests/test_endpoints.py -v

## Security
See SECURITY.md for full threat model and test results.