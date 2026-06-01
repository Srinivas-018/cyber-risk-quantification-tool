@echo off
echo ========================================================
echo   Tool-137 - Cyber Risk Quantification Tool Local Runner
echo ========================================================
echo.
echo [1/3] Checking AI Service...
echo Flask AI service is already configured and running on http://localhost:5000
echo.
echo [2/3] Preparing React Frontend...
cd frontend
echo Running npm install (this may take a minute on first run)...
call npm install
echo Starting Vite Dev Server on http://localhost:3000...
start npm run dev
cd ..
echo.
echo [3/3] Preparing Spring Boot Backend...
cd backend
echo Checking if Maven is installed...
where mvn >nul 2>nul
if %errorlevel% neq 0 (
    echo.
    echo WARNING: Maven (mvn) was not found on your system PATH.
    echo.
    echo To run the backend locally:
    echo 1. Open the 'backend' folder in your IDE (IntelliJ IDEA, VS Code, or Eclipse).
    echo 2. Run the 'com.internship.tool.Application' main class.
    echo 3. Add the VM option or Active Profile: local
    echo.
) else (
    echo Starting Spring Boot Backend with H2 local profile...
    start mvn spring-boot:run -Dspring-boot.run.profiles=local
)
cd ..
echo.
echo ========================================================
echo   System launched!
echo   Frontend: http://localhost:3000 (proxies to port 8080)
echo   Sign in credentials: admin / admin
echo ========================================================
pause
