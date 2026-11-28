/* Compte rendu à enregistrer (Cyril 28/11) : « à la fin du formulaire, que le client puisse enregistrer son compte rendu avec les plans ».
   Le PDF est fabriqué dans le téléphone, sans rien envoyer : chaque page est dessinée (textes, plans, murs vus de face, photos) puis rangée dans un PDF.
   window.PKCR.make(doc) -> Promise<Blob>   ;   window.PKCR.save(blob, nom) */
(function(){
const W=1240,H=1754,M=96,CW=W-2*M,NUIT="#1B2440",LAITON="#A8823F",MUTED="#5E6577",CALME="#F6F7F9",LIGNE="#E3E6EC";
const FONT='"Manrope",system-ui,-apple-system,"Segoe UI",Arial,sans-serif';
function svgImg(svg,maxW,maxH){return new Promise(res=>{try{let s=String(svg);if(!/xmlns=/.test(s))s=s.replace("<svg",'<svg xmlns="http://www.w3.org/2000/svg"');
  const vb=(s.match(/viewBox="([^"]+)"/)||[])[1],v=vb?vb.split(/[\s,]+/).map(Number):[0,0,400,300],r=v[2]/Math.max(1,v[3]);let w=maxW,h=w/r;if(h>maxH){h=maxH;w=h*r}
  s=s.replace(/<svg([^>]*?)\swidth="[^"]*"/,"<svg$1").replace(/<svg([^>]*?)\sheight="[^"]*"/,"<svg$1").replace("<svg",`<svg width="${Math.round(w)}" height="${Math.round(h)}"`);
  const im=new Image();im.onload=()=>res({im,w,h});im.onerror=()=>res(null);im.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(s)}catch(e){res(null)}})}
function rasterImg(src,maxW,maxH){return new Promise(res=>{const im=new Image();im.onload=()=>{const r=im.width/Math.max(1,im.height);let w=maxW,h=w/r;if(h>maxH){h=maxH;w=h*r}res({im,w,h})};im.onerror=()=>res(null);im.src=src})}
class Doc{
 constructor(o){this.o=o;this.pages=[];this.add()}
 add(){const c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,W,H);x.textBaseline="alphabetic";this.pages.push(c);this.c=x;this.y=M+20;
  if(this.pages.length>1){x.fillStyle=MUTED;x.font=`600 20px ${FONT}`;x.fillText(this.o.titre||"Mon projet de travaux",M,M-30);x.fillStyle=LIGNE;x.fillRect(M,M-14,CW,2)}}
 need(h){if(this.y+h>H-M-30)this.add()}
 font(w,s){this.c.font=`${w} ${s}px ${FONT}`}
 wrap(t,w){const out=[];String(t).split("\n").forEach(par=>{const words=par.split(/\s+/);let l="";words.forEach(wd=>{const tt=l?l+" "+wd:wd;if(this.c.measureText(tt).width>w&&l){out.push(l);l=wd}else l=tt});out.push(l)});return out}
 text(t,{w=600,s=22,col=NUIT,x=M,mw=CW,lh=1.4,gap=6}={}){this.font(w,s);const L=this.wrap(t,mw);L.forEach(l=>{this.need(s*lh);this.c.fillStyle=col;this.font(w,s);this.c.fillText(l,x,this.y+s);this.y+=s*lh});this.y+=gap}
 kv(k,v){/* « Libellé : valeur » sur une ligne, valeur en gras */this.font(500,21);const kw=Math.min(CW*.5,this.c.measureText(k+" : ").width);this.font(700,21);const L=this.wrap(v,CW-30-kw);this.need(21*1.4);
  this.c.fillStyle=MUTED;this.font(500,21);this.c.fillText(k+" :",M+30,this.y+21);L.forEach((l,i)=>{if(i)this.need(21*1.4);this.c.fillStyle=NUIT;this.font(700,21);this.c.fillText(l,M+30+kw,this.y+21);this.y+=21*1.4});this.y+=2}
 bullet(t){this.font(500,21);const L=this.wrap(t,CW-30);L.forEach((l,i)=>{this.need(21*1.4);if(!i){this.c.fillStyle=LAITON;this.c.beginPath();this.c.arc(M+12,this.y+14,4,0,7);this.c.fill()}this.c.fillStyle=NUIT;this.font(500,21);this.c.fillText(l,M+30,this.y+21);this.y+=21*1.4});this.y+=3}
 h1(t){this.need(120);this.c.fillStyle=LAITON;this.c.fillRect(M,this.y,6,44);this.c.fillStyle=NUIT;this.font(800,34);this.c.fillText(t,M+22,this.y+36);this.y+=70}
 h2(t){this.need(80);this.y+=8;this.c.fillStyle=NUIT;this.font(800,26);this.c.fillText(t,M,this.y+26);this.y+=40;this.c.fillStyle=LIGNE;this.c.fillRect(M,this.y,CW,2);this.y+=16}
 card(im,cap,x,w,y){const c=this.c;c.fillStyle=CALME;c.beginPath();c.roundRect?c.roundRect(x,y,w,im.h+20+(cap?40:0),18):c.rect(x,y,w,im.h+20+(cap?40:0));c.fill();
  if(cap){c.fillStyle=NUIT;this.font(700,20);const L=this.wrap(cap,w-28);c.fillText(L[0],x+14,y+30)}c.drawImage(im.im,x+(w-im.w)/2,y+(cap?40:0)+10,im.w,im.h);return im.h+20+(cap?40:0)}
 async grid(list,cols,maxH,pre){/* list : [{svg|src, t}] ; cols images par ligne ; pre = titres gardés avec la 1re ligne d'images */const g=22,cw=(CW-g*(cols-1))/cols;let row=[];
  const flush=()=>{if(!row.length)return;const hh=Math.max(...row.map(r=>r.im.h+20+(r.t?40:0)));if(pre){this.need(hh+g+pre.h);pre.draw();pre=null}else this.need(hh+g);row.forEach((r,i)=>this.card(r.im,r.t,M+i*(cw+g),cw,this.y));this.y+=hh+g;row=[]};
  if(!list.length&&pre)pre.draw();for(const v of list){const im=v.svg?await svgImg(v.svg,cw-28,maxH):await rasterImg(v.src,cw-28,maxH);if(!im)continue;row.push({im,t:v.t});if(row.length===cols)flush()}flush()}
}
async function make(o){try{if(document.fonts&&document.fonts.load)await Promise.race([Promise.all([document.fonts.load(`800 30px Manrope`),document.fonts.load(`500 20px Manrope`),document.fonts.load(`700 20px Manrope`)]),new Promise(r=>setTimeout(r,1200))])}catch(e){}
 const d=new Doc(o),c=d.c;
 /* en-tête */
 c.fillStyle=NUIT;c.fillRect(0,0,W,14);c.fillStyle=LAITON;c.fillRect(0,14,W,4);d.y=M+10;
 d.text("COMPTE RENDU DE VOTRE DEMANDE",{w:800,s:18,col:LAITON,gap:4});d.text(o.titre||"Mon projet de travaux",{w:800,s:46,lh:1.2,gap:10});
 d.text([o.client,o.commune].filter(Boolean).join(" · "),{w:600,s:24,col:NUIT,gap:2});d.text(`Envoyé à ${o.artisan} le ${o.date}`,{w:500,s:21,col:MUTED,gap:24});
 if(o.bref&&o.bref.length){d.h2("En bref");o.bref.forEach(b=>d.bullet(b));d.y+=10}
 if(o.plans&&o.plans.length){let first=1;for(const p of o.plans){const f1=first;first=0;await d.grid([{svg:p.svg}],1,760,{h:(f1?90:0)+(p.nom?40:0),draw:()=>{if(f1)d.h2(o.plans.length>1?"Votre plan, étage par étage":"Votre plan");if(p.nom)d.text(p.nom,{w:700,s:22,gap:4})}})}}
 if(o.blocs&&o.blocs.length){d.h2("Vos réponses");o.blocs.forEach(b=>{d.need(90);d.text(b.t,{w:800,s:23,gap:4});(b.items||[]).forEach(it=>{if(it.titre){d.need(60);d.text(it.titre,{w:700,s:21,x:M+10,mw:CW-10,gap:2});if(it.sous)d.text(it.sous,{w:500,s:19,col:MUTED,x:M+10,mw:CW-10,gap:2})}(it.parts||[]).forEach(p=>{const k=p.indexOf(" : ");if(k>0)d.kv(p.slice(0,k),p.slice(k+3));else d.bullet(p)})});d.y+=10})}
 if(o.vues&&o.vues.some(r=>r.vues&&r.vues.length)){let first=1;for(const r of o.vues){if(!r.vues||!r.vues.length)continue;const f1=first;first=0;await d.grid(r.vues,2,360,{h:(f1?90:0)+40,draw:()=>{if(f1)d.h2("Vos murs, vus de face");d.text(r.piece+(r.niveau?` (${r.niveau})`:""),{w:800,s:23,gap:6})}})}}
 if(o.photos&&o.photos.length)await d.grid(o.photos,3,300,{h:90,draw:()=>d.h2("Vos photos")});
 d.need(120);d.y+=10;d.text(`Ce compte rendu reprend ce que vous avez envoyé à ${o.artisan}. Le devis sera précisé avec vous lors de la visite.`,{w:500,s:19,col:MUTED});
 /* pieds de page */
 const n=d.pages.length;d.pages.forEach((p,i)=>{const x=p.getContext("2d");x.fillStyle=MUTED;x.font=`500 17px ${FONT}`;x.textAlign="right";x.fillText(`Page ${i+1} sur ${n}`,W-M,H-46);x.textAlign="left";x.fillText(`${o.artisan} · ${o.date}`,M,H-46)});
 return pdf(d.pages)}
/* petit fabricant de PDF : une image JPEG par page (A4) */
function pdf(pages){const enc=new TextEncoder(),parts=[],offs=[];let len=0;const push=b=>{const u=typeof b==="string"?enc.encode(b):b;parts.push(u);len+=u.length};
 const n=pages.length,obj=(i,body)=>{offs[i]=len;push(`${i} 0 obj\n`);body();push("\nendobj\n")};
 push("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
 const kids=[];for(let i=0;i<n;i++)kids.push(`${3+i*3} 0 R`);
 obj(1,()=>push("<< /Type /Catalog /Pages 2 0 R >>"));obj(2,()=>push(`<< /Type /Pages /Kids [${kids.join(" ")}] /Count ${n} >>`));
 const PW=595.28,PH=841.89;
 pages.forEach((c,i)=>{const b64=c.toDataURL("image/jpeg",.86).split(",")[1],bin=atob(b64),jpg=new Uint8Array(bin.length);for(let k=0;k<bin.length;k++)jpg[k]=bin.charCodeAt(k);
  const p=3+i*3,ct=`q ${PW} 0 0 ${PH} 0 0 cm /Im0 Do Q`;
  obj(p,()=>push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PW} ${PH}] /Resources << /XObject << /Im0 ${p+2} 0 R >> >> /Contents ${p+1} 0 R >>`));
  obj(p+1,()=>push(`<< /Length ${ct.length} >>\nstream\n${ct}\nendstream`));
  obj(p+2,()=>{push(`<< /Type /XObject /Subtype /Image /Width ${c.width} /Height ${c.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>\nstream\n`);push(jpg);push("\nendstream")})});
 const N=2+n*3,x0=len;let xr=`xref\n0 ${N+1}\n0000000000 65535 f \n`;for(let i=1;i<=N;i++)xr+=String(offs[i]).padStart(10,"0")+" 00000 n \n";
 push(xr+`trailer\n<< /Size ${N+1} /Root 1 0 R >>\nstartxref\n${x0}\n%%EOF`);return new Blob(parts,{type:"application/pdf"})}
async function save(blob,name){const f=typeof File==="function"?new File([blob],name,{type:"application/pdf"}):null;
 if(f&&navigator.canShare&&matchMedia("(pointer:coarse)").matches){try{if(navigator.canShare({files:[f]})){await navigator.share({files:[f],title:name});return"share"}}catch(e){if(e&&e.name==="AbortError")return"abort"}}
 const u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(u);a.remove()},4000);return"download"}
window.PKCR={make,save};
})();
