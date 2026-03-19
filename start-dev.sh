#!/usr/bin/env bash
# Studyond — Start Development Environment
# Starts both the Express API server and Vite frontend in parallel

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
