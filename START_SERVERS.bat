@echo off
echo ========================================
echo   CodeMind.AI - Starting Servers
echo ========================================
echo.

REM Check if Ollama is installed
where ollama >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Ollama not found! Please install from https://ollama.ai
    echo.
    pause
    exit /b 1
)

echo [1/3] Checking Ollama models...
ollama list | findstr "codellama" >nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] CodeLlama model not found!
    echo [INFO] Installing codellama:7b-instruct...
    ollama pull codellama:7b-instruct
)

echo [2/3] Starting Backend Server...
start "CodeMind Backend" cmd /k "cd server && npm start"
timeout /t 3 /nobreak >nul

echo [3/3] Starting Frontend Client...
start "CodeMind Frontend" cmd /k "cd client && npm run dev"

echo.
echo ========================================
echo   Servers Starting...
echo ========================================
echo.
echo Backend:  http://localhost:4000
echo Frontend: http://localhost:3000
echo.
echo Press any key to close this window
echo (Servers will keep running in other windows)
pause >nul
