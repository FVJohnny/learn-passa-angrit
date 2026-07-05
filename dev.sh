#!/bin/sh
# 🍌 Local dev server for Gluay Noi.
# Usage: ./dev.sh [port]   (default 8000)
# Serves with Cache-Control: no-store so every browser refresh picks up your
# edits — no ?v= bumping needed locally. Also reachable from phones on the
# same Wi-Fi for testing on a real device before pushing to main.

PORT="${1:-8000}"
IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "")

echo "🍌 Gluay Noi dev server"
echo "   computer: http://localhost:$PORT/"
[ -n "$IP" ] && echo "   phone:    http://$IP:$PORT/   (same Wi-Fi)"
echo "   stop:     Ctrl+C"

( sleep 1; open "http://localhost:$PORT/" 2>/dev/null ) &

exec python3 - "$PORT" <<'EOF'
import http.server, sys

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

http.server.ThreadingHTTPServer(('0.0.0.0', int(sys.argv[1])), NoCacheHandler).serve_forever()
EOF
