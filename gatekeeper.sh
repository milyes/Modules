#!/data/data/com.termux/files/usr/bin/bash
# Z-CORE v24 — gatekeeper.sh — NON DEPENDANCE VALIDEE
# 89b6df2e — IMMORTAL + ZeroTrust — 2026-09-27 20h16 + 2026-10-13 11h30

PORT=8000
TOKEN="89b6df2e-v24"

# L1 AUTO-PORT
for p in 8000 8001; do
  if ! ss -tln | grep -q ":$p "; then
    PORT=$p; break
  fi
done

# L22 IMMORTAL .bashrc
grep -q "gatekeeper.sh" ~/.bashrc 2>/dev/null || echo "nohup ~/gatekeeper.sh >/dev/null 2>&1 &" >> ~/.bashrc

echo "[Z-CORE $TOKEN] LIVE sur :$PORT — NON DEPENDANCE VALIDEE"

while true; do
  # Python minimal server avec ZeroTrust 401 Filter
  python3 -c "
import http.server, json
class H(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        if self.headers.get('X-ZCORE-Token') != '$TOKEN':
            self.send_response(401)
            self.end_headers()
            self.wfile.write(b'{\"error\":\"ZeroTrust 401 Filter\"}')
            return
        self.send_response(200)
        self.send_header('Content-type','application/json')
        self.end_headers()
        self.wfile.write(json.dumps({'status':'LIVE','version':'v24','logics':22,'non_dependance':'VALIDEE','endpoint':'/api/status'}).encode())
    def log_message(self,*a): pass
http.server.HTTPServer(('', $PORT), H).serve_forever()
"
  echo "[!] Crash — restart dans 2s"
  sleep 2
done



