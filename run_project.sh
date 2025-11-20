#!/bin/bash

# Define paths
BACKEND_DIR="backend"
FRONTEND_DIR="frontend"
VENV_DIR="env"

# Function to handle script termination
cleanup() {
    echo "Stopping servers..."
    kill $BACKEND_PID
    kill $FRONTEND_PID
    exit
}

# Trap SIGINT (Ctrl+C)
trap cleanup SIGINT

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Python 3 is not installed."
    exit 1
fi

# 1. Setup Virtual Environment
if [ ! -d "$VENV_DIR" ]; then
    echo "Creating virtual environment..."
    python3 -m venv $VENV_DIR
else
    echo "Virtual environment found."
fi

# 2. Activate Venv and Install Backend Dependencies
echo "Installing backend dependencies..."
source $VENV_DIR/bin/activate
pip install -r $BACKEND_DIR/requirements.txt

# 3. Start Backend Server
echo "Starting Django Backend..."
cd $BACKEND_DIR
python manage.py runserver &
BACKEND_PID=$!
cd ..

# 4. Setup and Start Frontend
echo "Setting up Frontend..."
cd $FRONTEND_DIR

# Check if node_modules exists, if not install
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

echo "Starting React Frontend..."
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "Project started!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo "Press Ctrl+C to stop both servers."
echo ""

# Wait for processes to finish
wait
