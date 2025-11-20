@echo off
SETLOCAL

:: Define paths
SET "BACKEND_DIR=backend"
SET "FRONTEND_DIR=frontend"
SET "VENV_DIR=env"

:: Check if Python is installed
python --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo Python is not installed or not in PATH.
    pause
    exit /b
)

:: 1. Setup Virtual Environment
IF NOT EXIST "%VENV_DIR%" (
    echo Creating virtual environment...
    python -m venv %VENV_DIR%
) ELSE (
    echo Virtual environment found.
)

:: 2. Activate Venv and Install Backend Dependencies
echo Installing backend dependencies...
call %VENV_DIR%\Scripts\activate
pip install -r %BACKEND_DIR%\requirements.txt

:: 3. Start Backend Server in a new window
echo Starting Django Backend...
start "Django Backend" cmd /k "call %VENV_DIR%\Scripts\activate && cd %BACKEND_DIR% && python manage.py runserver"

:: 4. Setup and Start Frontend
echo Setting up Frontend...
cd %FRONTEND_DIR%

:: Check if node_modules exists, if not install
IF NOT EXIST "node_modules" (
    echo Installing frontend dependencies...
    call npm install
)

echo Starting React Frontend...
start "React Frontend" cmd /k "npm run dev"

echo.
echo Project started!
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo.
pause
