"""Page-aware PDF extraction. Tables and OCR remain visually blocked, regardless of OCR confidence."""
import sys,json,subprocess,tempfile,resource
from pathlib import Path
resource.setrlimit(resource.RLIMIT_CPU,(20,20))
resource.setrlimit(resource.RLIMIT_AS,(768*1024*1024,768*1024*1024))
import pdfplumber
from pypdf import PdfReader
p=Path(sys.argv[1]);reader=PdfReader(p)
if reader.is_encrypted: raise ValueError('Encrypted document')
if len(reader.pages)>80: raise ValueError('Page budget exceeded')
labels=reader.page_labels;pages=[];visual=False
with pdfplumber.open(p) as pdf:
 for index,page in enumerate(pdf.pages):
  text=page.extract_text(layout=True) or '';tables=[];ocr=False
  for t in page.find_tables():
   tables.append({'bbox':list(t.bbox),'cells':t.extract(),'context':text,'requiresVisual':True})
   visual=True
  if len(text.strip())<30:
   ocr=True;visual=True
   with tempfile.TemporaryDirectory() as tmp:
    base=str(Path(tmp)/'page')
    subprocess.run(['pdftoppm','-f',str(index+1),'-l',str(index+1),'-singlefile','-r','150','-png',str(p),base],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,timeout=8)
    r=subprocess.run(['tesseract',base+'.png','stdout','-l','deu+eng'],check=True,capture_output=True,timeout=8)
    text=r.stdout.decode('utf-8')
  pages.append({'pageIndex':index,'printedPage':labels[index] if index<len(labels) else None,'printedPageSource':'PDF page label; not independently verified against printed footer','text':text,'tables':tables,'ocr':ocr,'requiresVisual':bool(tables or ocr),'width':page.width,'height':page.height})
print(json.dumps({'pages':pages,'requiresVisual':visual,'method':'pdfplumber-layout + pypdf labels; Tesseract fallback','limitations':'All OCR and table readings require visual approval; printed labels need confirmation.'},ensure_ascii=False))
