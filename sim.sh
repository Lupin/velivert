#!/usr/bin/env bash
# sim.sh — build + launch EvenHub simulator for Vélivert
# Usage: ./sim.sh
set -euo pipefail
cd "$(dirname "$0")"

echo "→ Killing old simulator & Vite instances..."
pkill -9 -f evenhub-simulator 2>/dev/null || true
pkill -9 -f "vite.*5173" 2>/dev/null || true
lsof -ti :5173 | xargs kill -9 2>/dev/null || true
sleep 1

echo "→ Building..."
npm run build

echo "→ Launching Vite dev server..."
npx vite --host 0.0.0.0 --port 5173 &
VITE_PID=$!
sleep 3

# Wait for Vite to be ready
for i in $(seq 1 10); do
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/ 2>/dev/null | grep -q 200; then
    break
  fi
  sleep 1
done

echo "→ Launching EvenHub Simulator..."
npx evenhub-simulator http://localhost:5173 &
SIM_PID=$!

echo "→ Ready. Glasses Display: http://localhost:5173"
echo "→ QR for sideload: http://$(ipconfig getifaddr en0 2>/dev/null || echo 'YOUR_IP'):5173/"
echo "→ Press Ctrl+C to stop (or close the simulator window)"
wait $VITE_PID
