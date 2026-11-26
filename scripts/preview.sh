#!/usr/bin/env bash
set -e
# Start Vite preview in background
#!/usr/bin/env bash
set -e
# Start Vite preview in background
vite preview > /dev/null 2>&1 &
PID=$!
# Wait briefly for server to start
sleep 1
# Open default browser to preview URL
if command -v xdg-open > /dev/null; then
  xdg-open http://localhost:4173
elif command -v open > /dev/null; then
  open http://localhost:4173
fi
# Detach background process (keep server running)
exit 0 > /dev/null 2>&1 &
PID=$!
# Wait briefly for server to start
sleep 1
# Open default browser to preview URL
if command -v xdg-open > /dev/null; then
  xdg-open http://localhost:4173
elif command -v open > /dev/null; then
  open http://localhost:4173
fi
# Detach background process (keep server running)
exit 0
