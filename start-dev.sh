#!/bin/bash
# Studyond — Start Development Environment
# Starts both the Express API server and Vite frontend in parallel

# Check for .env file in backend
if [ ! -f backend/.env ]; then
  echo "⚠️  No backend/.env found. Creating with placeholder..."
  echo "ANTHROPIC_API_KEY=your-key-here" > backend/.env
  echo "PORT=3001" >> backend/.env
  echo "Edit backend/.env and add your ANTHROPIC_API_KEY"
fi

# Load .env if available
if [ -f backend/.env ]; then
  export $(grep -v '^#' backend/.env | xargs)
fi

echo "Starting Studyond AI Thesis Journey..."
echo ""
echo "  API Server:    http://localhost:3001"
echo "  Frontend:      http://localhost:5173"
echo ""

# Start backend in background
(cd backend && npm run dev) &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 1

# Start frontend in foreground
(cd my-studyond-app && npm run dev)

# When frontend exits, kill backend too
kill $BACKEND_PID 2>/dev/null
