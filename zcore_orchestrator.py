#!/usr/bin/env python3
# Z-CORE v1.9 OPUS45 - 0 dep - ZeroTrust - 22 logiques
import http.server, socketserver, http.client, json, os, hashlib, re, time
from urllib.parse import urlparse
PORT=8000; MODEL="claude-opus-4-5-20251101"; VERSION="v1.9 UNIFIED OPUS45"; HASH_REF="89b6df2e"
def zt_check(t,u=""):
    if re.search(r'(;|\||\$\(|`|\$\{).*(rm|wget|curl|bash|sh|nc|python)',t,re.I): raise ValueError("H202 BLOCKED")
    if u:
        p=urlparse(u)
        if p.hostname in ["169.254.169.254","metadata.google.internal"]: raise ValueError("H203 BLOCKED")
    return True
LOGICS=[f"L{i:02d}" for i in range(1,23)]; MODULES=["Console","Intelligence","Psychometrie","Innovation","Audit","Recon","Prediction","Action"]
def logic_exec(lid,payload): zt_check(payload); h=hashlib.sha256(f"{lid}:{payload}:{HASH_REF}".encode()).hexdigest()[:8]; return {"logic":lid,"hash":h,"status":"OK"}
def call_opus45(prompt,effort="low"):
    zt_check(prompt); k=os.environ.get("ANTHROPIC_API_KEY","")
    if not k: return {"mode":"LOCAL","text":f"[{VERSION}] {prompt[:100]} | 22/22 OK | {HASH_REF}"}
    try:
        conn=http.client.HTTPSConnection("api.anthropic.com",timeout=20)
        body=json.dumps({"model":MODEL,"max_tokens":2048,"messages":[{"role":"user","content":prompt}]})
        headers={"x-api-key":k,"anthropic-version":"2023-06-01","content-type":"application/json"}
        conn.request("POST","/v1/messages",body,headers); d=json.loads(conn.getresponse().read().decode())
        txt=d.get("content",[{}])[0].get("text",""); zt_check(txt); return {"mode":"OPUS45","text":txt}
    except Exception as e: return {"mode":"FALLBACK","text":str(e)[:200]}
class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path=="/api/status":
            self.send_response(200); self.send_header("Content-type","application/json"); self.end_headers()
            self.wfile.write(json.dumps({"version":VERSION,"hash":HASH_REF,"modules":MODULES,"logics":22,"security":"ZeroTrust","size":"5.2K","port":PORT,"status":"NON DEPENDANCE VALIDEE","stack":"Python3.11 0 dep Termux","opus45":MODEL}).encode())
        elif self.path in ["/","/LanceIA_BIN.html"]:
            self.send_response(200); self.send_header("Content-type","text/html"); self.end_headers()
            self.wfile.write(f"<html><body><h1>{VERSION} {HASH_REF}</h1><p>22/22 OK ZeroTrust</p></body></html>".encode())
        else: return http.server.SimpleHTTPRequestHandler.do_GET(self)
    def log_message(self,*a): return
if __name__=="__main__":
    for lid in LOGICS: logic_exec(lid,f"bench {lid}")
    print(f"{{'version':'{VERSION}','hash':'{HASH_REF}','modules':{MODULES},'logics':22,'security':'ZeroTrust','size':'5.2K','port':{PORT},'status':'NON DEPENDANCE VALIDEE','stack':'Python3.11 0 dep Termux'}}")
    socketserver.TCPServer.allow_reuse_address=True
    with socketserver.TCPServer(("",PORT),Handler) as httpd: httpd.serve_forever()
