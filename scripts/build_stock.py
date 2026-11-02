# Uso: python3 build_stock.py <stock.txt> <app_dir> "<fecha legible>"
# stock.txt: nombre|CODIGO[#V.2]|ruta_cm|rareza|lang|cond|precio|cantidad  (una oferta por línea)
import json,os,re,sys,subprocess,html,io,concurrent.futures as cf
from PIL import Image
src,app,fecha=sys.argv[1],sys.argv[2],sys.argv[3]
rows=[l.split('|') for l in open(src,encoding='utf-8').read().strip().split('\n') if l.strip()]
cache_p=os.path.join(app,'scripts/card-info.json')
info=json.load(open(cache_p)) if os.path.exists(cache_p) else {}
need={r[1].split('#')[0] for r in rows}-set(info)
SETS={'EB05':'Heroines Edition Vol.2','OP15':"Adventure on Kami's Island",'OP16':'The Time of Battle','OP17':"The World's Strongest Warriors",'OP13':'Carrying on his Will','OP14':"The Azure Sea's Seven",'OP11':'A Fist of Divine Speed','OP06':'Wings of the Captain','ST-25':'Starter Blue Buggy','ST33':'Starter Blue Kuzan'}
if need:
    h=subprocess.run(['curl','-s','https://en.onepiece-cardgame.com/cardlist/?series=569115'],capture_output=True,text=True).stdout
    series=list(dict.fromkeys(re.findall(r'<option value="(\d+)"',h)))
    for v in series:
        s=subprocess.run(['curl','-s',f'https://en.onepiece-cardgame.com/cardlist/?series={v}'],capture_output=True,text=True).stdout
        for m in re.finditer(r'<dl class="modalCol" id="([A-Z0-9]+-\d+)(?:_p\d+)?">(.*?)</dl>',s,re.S):
            code,b=m.group(1),m.group(2)
            if code in info: continue
            g=lambda cls: re.sub(r'\s+',' ',re.sub(r'<[^>]+>',' ',(re.search(rf'<div class="{cls}">(.*?)</div>',b,re.S) or [None,''])[1])).strip()
            t=re.search(r'<span>[A-Z0-9-]+</span> \| <span>[^<]*</span> \| <span>([^<]*)</span>',b)
            info[code]=dict(color=g('color').replace('Color','').strip(),type=t.group(1) if t else '')
        if not ({r[1].split('#')[0] for r in rows}-set(info)): break
    os.makedirs(os.path.dirname(cache_p),exist_ok=True); json.dump(info,open(cache_p,'w'))
out=[]; imgdir=os.path.join(app,'cards'); os.makedirs(imgdir,exist_ok=True)
for r in rows:
    name,cv,cm,rar,lang,cond,price,qty=r[:8]
    code=cv.split('#')[0]; v2='#V.2' in cv
    i=info.get(code,{'color':'','type':''})
    fn=f"{code}{'-p1' if v2 and code!='EB05-058' else ''}.webp"
    sk=cm.split('/')[0]
    out.append(dict(n=name,c=code,v=2 if v2 else 1,r=rar,p=float(price.replace('.','').replace(',','.')),q=int(qty),set=SETS.get(sk,sk),col=[x.lower() for x in i['color'].split('/') if x],t=i['type'].title(),img='cards/'+fn))
def img(c):
    fn=c['img'].split('/')[-1]; dst=os.path.join(imgdir,fn)
    if os.path.exists(dst): return None
    s=fn.replace('.webp','').replace('-p1','_p1')
    r=subprocess.run(['curl','-sf',f'https://en.onepiece-cardgame.com/images/cardlist/card/{s}.png'],capture_output=True)
    if r.returncode: return fn
    im=Image.open(io.BytesIO(r.stdout)).convert('RGB'); im=im.resize((300,round(300*im.height/im.width)),Image.LANCZOS); im.save(dst,'WEBP',quality=80,method=6)
with cf.ThreadPoolExecutor(10) as ex: bad=[x for x in ex.map(img,out) if x]

json.dump({'updated':fecha,'cards':out},open(os.path.join(app,'stock.json'),'w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
print('cards',len(out),'missing_img',bad,'missing_info',[o['c'] for o in out if not o['col']])
