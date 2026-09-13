"""Private PDF service: put behind HTTPS; restrict network egress; never serve user files publicly."""
import os,json,hmac,tempfile,subprocess
from http.server import HTTPServer,BaseHTTPRequestHandler
from pathlib import Path
TOKEN=os.environ.get('PDF_SERVICE_TOKEN')
if not TOKEN: raise RuntimeError('PDF_SERVICE_TOKEN required')
class Handler(BaseHTTPRequestHandler):
 def setup(self):
  super().setup()
  self.connection.settimeout(30)
 def do_GET(self):
  if self.path!='/health': self.send_error(404);return
  self.send_response(200);self.send_header('Content-Type','application/json');self.send_header('Cache-Control','no-store');self.end_headers();self.wfile.write(b'{"status":"ready"}')
 def do_POST(self):
  if self.path!='/extract' or not hmac.compare_digest(self.headers.get('Authorization',''),'Bearer '+TOKEN): self.send_error(403);return
  try:
   size=int(self.headers.get('Content-Length','0'))
   if not 0<size<=8_000_000: self.send_error(413);return
   data=self.rfile.read(size)
   if len(data)!=size: self.send_error(400);return
   if not data.startswith(b'%PDF'): self.send_error(415);return
   with tempfile.TemporaryDirectory() as tmp:
    p=Path(tmp)/'source.pdf';p.write_bytes(data)
    result=subprocess.run(['python','/app/parse.py',str(p)],capture_output=True,timeout=23,check=True)
   if len(result.stdout)>8_000_000: raise ValueError('Extraction too large')
   self.send_response(200);self.send_header('Content-Type','application/json');self.send_header('Cache-Control','no-store');self.end_headers();self.wfile.write(result.stdout)
  except (ValueError,subprocess.TimeoutExpired,subprocess.CalledProcessError): self.send_error(422,'PDF extraction requires manual review')
 def log_message(self,fmt,*args): print('pdf-service',self.command,self.path,flush=True)
HTTPServer(('0.0.0.0',int(os.environ.get('PORT','8080'))),Handler).serve_forever()
