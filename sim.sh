#!/usr/bin/env bash
# sim.sh — build + launch EvenHub simulator for Vélivert
# Usage: ./sim.sh
# NOTE: launches Vite + simulator on macOS (not in Hermes VM) because
# the simulator needs to connect to localhost on the macOS host.
set -euo pipefail
cd "$(dirname "$0")"

echo "→ Killing old simulator & Vite instances..."
pkill -9 -f evenhub-simulator 2>/dev/null || true
pkill -9 -f "vite.*5173" 2>/dev/null || true
lsof -ti :5173 | xargs kill -9 2>/dev/null || true
sleep 1

echo "→ Building..."
npm run build

echo "→ Launching Vite on macOS..."
osascript -e "tell application \"Terminal\" to do script \"cd $(pwd) && npx vite --host 0.0.0.0 --port 5173\""
sleep 4

# Verify Vite is up
for i in $(seq 1 10); do
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:5173/ 2>/dev/null | grep -q 200; then
    echo "→ Vite ready ✓"
    break
  fi
  sleep 1
done

echo "→ Launching EvenHub Simulator on macOS..."
osascript -e "tell application \"Terminal\" to do script \"cd $(pwd) && npx evenhub-simulator http://localhost:5173\""

echo "→ Ready."
echo "   Companion UI: http://localhost:5173"
echo "   Glasses Display window should appear on macOS."
echo "   Use Up/Down/Click buttons at bottom of simulator window to interact."
