# Tool-137: Cyber Risk Quantification Tool

## Project Overview
Tool-137 is an AI-powered web application designed to quantify cyber risks using a modern tech stack . It features real-time AI descriptions, risk recommendations, and comprehensive reporting .

## Tech Stack
* **Backend**: Java 17, Spring Boot 3.x, Spring Security + JWT .
* **AI Service**: Python 3.11, Flask, Groq API (LLaMA-3.3-70b) .
* **Frontend**: React 18+ Vite, Tailwind CSS, Axios .
* **Infrastructure**: Docker + Docker Compose, PostgreSQL 15, Redis 7 .

## Prerequisites
* Docker & Docker Compose installed .
* Java 17 (adoptium.net) .
* Python 3.11 .
* Groq API Key (console.groq.com) .

## Setup Instructions
1. **Configure Environment**: Create a `.env` file based on `.env.example`. Add your `GROQ_API_KEY` and a `JWT_SECRET`.

### Option A: Launch with Docker Compose (Recommended)
1. Ensure Docker Desktop is running.
2. Build and start the stack: `docker-compose up --build`
3. Access the services:
   - Frontend React SPA: `http://localhost`
   - Backend API Swagger: `http://localhost:8080/swagger-ui.html`
   - AI Service Health: `http://localhost:5000/health`

### Option B: Run Locally without Docker (H2 Profile)
1. Start the Flask AI Service:
   - Navigate to `ai-service/` and run: `python app.py` (starts on port 5000).
2. Start the React Frontend:
   - Navigate to `frontend/` and run: `npm install` and then `npm run dev` (starts on port 3000).
3. Start the Spring Boot Backend:
   - Run the Spring Boot application (using the active profile `local`). This configures the backend to use an in-memory H2 database (`jdbc:h2:mem:quant_db`) and simple in-memory caching.
   - Alternatively, execute the helper script `run-local.bat` in the root folder, which automates these steps.

## Deployment & Vercel Hosting
- **React Frontend**: Host on **Vercel**. We have configured a `vercel.json` rewrite proxy inside the `frontend/` folder. Ensure you configure your production API destination in `frontend/vercel.json`.
- **Spring Boot Backend & AI Service**: Deploy on a cloud server environment (e.g. Render, Railway, or Fly.io).

## Security Features
* **Authentication**: Secured via JWT and role-based access control .
* **Rate Limiting**: AI endpoints are limited to 30 requests per minute .
* **Sanitization**: All inputs are sanitized using the Bleach library to prevent XSS/SQLi .
* **Audit Logs**: Comprehensive logging for all Create, Update, and Delete actions .

---
