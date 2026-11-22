/* ProClik · Impression du plan (lot B8, 21/11, Cyril) : plan style architecte sur une feuille A4 couchée,
   au 1:50 (1:75, 1:100… si l'étage ne tient pas), avec cartouche à droite (logo, client, chantier, niveau, date,
   échelle, surfaces, légende). Le plan de l'appli ne prend PAS ce style : seule la feuille imprimée l'a.
   Ouverture : bouton « Imprimer le plan » dans l'aide « ? ». Aperçu plein écran, nom du client et du chantier
   modifiables, puis « Imprimer » (impression du navigateur, ou « Enregistrer en PDF »). */
(function(){
"use strict";
if(/[?&]client/.test(location.search))return;
const K=()=>window.PKPLAN,$=id=>document.getElementById(id);
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const f2=v=>(Math.round(v*100)/100).toFixed(2).replace(".",","),f1=v=>(Math.round(v*10)/10).toFixed(1).replace(".",","),n3=v=>+v.toFixed(3);
const ls=(k,v)=>{try{if(v===undefined)return localStorage.getItem(k)||"";localStorage.setItem(k,v)}catch(e){return""}};
const LOGO=`<path fill="#1B2440" fill-rule="evenodd" d="M24.50 50.00A25.50 25.50 0 1 1 75.50 50.00A25.50 25.50 0 1 1 24.50 50.00ZM57.73 67.72A19.34 19.34 0 1 0 42.27 67.72A3.92 3.92 0 0 0 47.76 64.13L47.76 61.21A2.24 2.24 0 0 1 52.24 61.21L52.24 64.13A3.92 3.92 0 0 0 57.73 67.72Z"/><circle cx="50" cy="48.32" r="4.71" fill="#A8823F"/>`;
const ECH=[50,75,100,150,200];
function area(p){let a=0;for(let i=0;i<p.length;i++){const q=p[(i+1)%p.length];a+=p[i][0]*q[1]-q[0]*p[i][1]}return Math.abs(a/2)}

/* La feuille : viewBox en millimètres (297 × 210). */
function sheet(o){const P=K(),f=P.F(),S=P.segs(),R=f.rooms||[];
 const pts=R.flatMap(r=>r.pts);if(!pts.length)return null;
 const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]),bx=[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)];
 const W0=bx[2]-bx[0]+.4,H0=bx[3]-bx[1]+.4,AW=194,AH=150;/* zone utile du dessin (mm), cotes comprises */
 const ech=ECH.find(e=>W0*1000/e<=AW-20&&H0*1000/e<=AH-24)||200,M=1000/ech;/* mm par mètre */
 const ox=14+20+(AW-20-(bx[2]-bx[0])*M)/2,oy=36+24+(AH-24-(bx[3]-bx[1])*M)/2;
 const X=x=>n3(ox+(x-bx[0])*M),Y=y=>n3(oy+(y-bx[1])*M),Pp=p=>X(p[0])+" "+Y(p[1]);
 let s="";
 /* sols : blanc, parquet en lames fines, carrelage en quadrillage */
 R.forEach(r=>{const rv=(r.sol&&r.sol.revet)||"",fill=/parquet|stratifi/i.test(rv)?"url(#pp-pq)":/carrel/i.test(rv)?"url(#pp-car)":"#fff";s+=`<polygon points="${r.pts.map(Pp).join(" ")}" fill="#fff"/>${fill!=="#fff"?`<polygon points="${r.pts.map(Pp).join(" ")}" fill="${fill}"/>`:""}`});
 /* murs : épaisseur vers l'extérieur de la pièce ; cloisons centrées, plus fines */
 S.forEach(sg=>{const L=P.dist(sg.a,sg.b);if(L<.01)return;const u=[(sg.b[0]-sg.a[0])/L,(sg.b[1]-sg.a[1])/L];
  if(sg.kind==="mur"){let n;try{n=P.inward(sg)}catch(e){n=[-u[1],u[0]]}const t=sg.sh?(sg.t||.1)/2:(sg.t||.2);const A=[sg.a[0]-n[0]*t,sg.a[1]-n[1]*t],B=[sg.b[0]-n[0]*t,sg.b[1]-n[1]*t];
   /* prolonge aux angles pour fermer les coins */const e=t;const a2=[sg.a[0]-u[0]*e,sg.a[1]-u[1]*e],b2=[sg.b[0]+u[0]*e,sg.b[1]+u[1]*e],A2=[A[0]-u[0]*e,A[1]-u[1]*e],B2=[B[0]+u[0]*e,B[1]+u[1]*e];
   s+=`<polygon class="mur" points="${[sg.kind==="mur"&&!sg.sh?a2:sg.a,sg.kind==="mur"&&!sg.sh?b2:sg.b,sg.sh?B:B2,sg.sh?A:A2].map(Pp).join(" ")}"/>`}
  else s+=`<line class="clo" x1="${X(sg.a[0])}" y1="${Y(sg.a[1])}" x2="${X(sg.b[0])}" y2="${Y(sg.b[1])}" stroke-width="${n3(Math.max(.07,sg.t||.07)*M)}"/>`});
 /* baies */
 S.forEach(sg=>{const os=P.OP.get(sg.a);if(!os||!os.length)return;const L=P.dist(sg.a,sg.b),u=[(sg.b[0]-sg.a[0])/L,(sg.b[1]-sg.a[1])/L];let n;try{n=sg.kind==="mur"?P.inward(sg):[-u[1],u[0]]}catch(e){n=[-u[1],u[0]]}
  const t=sg.kind==="mur"?(sg.sh?(sg.t||.1)/2:(sg.t||.2)):Math.max(.07,sg.t||.07),off=sg.kind==="mur"?0:-t/2;
  os.forEach(o=>{const p1=o.p||0,p2=p1+(o.w||.8),at=(p,d)=>[sg.a[0]+u[0]*p+n[0]*d,sg.a[1]+u[1]*p+n[1]*d];const c=[at(p1,-off),at(p2,-off),at(p2,-off-t),at(p1,-off-t)];
   s+=`<polygon class="baie" points="${c.map(Pp).join(" ")}"/>`;
   if(o.k==="fenetre"){[.15,.5,.85].forEach(k=>{const a=at(p1,-off-t*k),b=at(p2,-off-t*k);s+=`<line class="vit${k===.5?" c":""}" x1="${X(a[0])}" y1="${Y(a[1])}" x2="${X(b[0])}" y2="${Y(b[1])}"/>`})}
   else{const w=p2-p1,h=at(p1,-off),lf=[h[0]+n[0]*w,h[1]+n[1]*w],e=at(p2,-off),cr=u[0]*n[1]-u[1]*n[0];s+=`<line class="batt" x1="${X(h[0])}" y1="${Y(h[1])}" x2="${X(lf[0])}" y2="${Y(lf[1])}"/><path class="arc" d="M${Pp(lf)}A${n3(w*M)} ${n3(w*M)} 0 0 ${cr>0?0:1} ${Pp(e)}"/>`}})});
 /* escaliers */
 (f.esc||[]).forEach(e=>{let C;try{C=P.escRect(e)}catch(x){return}if(!C)return;s+=`<polygon class="esc" points="${C.map(Pp).join(" ")}"/>`;const W=(u,v)=>P.escW(e,u,v),N=Math.max(3,Math.round(e.L/.25));
  if(!/trappe|trémie/i.test(e.forme||"")){for(let i=1;i<N;i++){const a=W(e.L*i/N,0),b=W(e.L*i/N,e.l);s+=`<line class="mar" x1="${X(a[0])}" y1="${Y(a[1])}" x2="${X(b[0])}" y2="${Y(b[1])}"/>`}
   const a=W(.12,e.l/2),b=W(e.L-.08,e.l/2),q1=W(e.L-.25,e.l/2-.1),q2=W(e.L-.25,e.l/2+.1);s+=`<circle class="fo0" cx="${X(a[0])}" cy="${Y(a[1])}" r=".9"/><path class="fo" d="M${Pp(a)}L${Pp(b)}M${Pp(q1)}L${Pp(b)}L${Pp(q2)}"/>`}
  else{const a=W(0,0),b=W(e.L,e.l),c=W(e.L,0),d=W(0,e.l);s+=`<path class="mar" d="M${Pp(a)}L${Pp(b)}M${Pp(c)}L${Pp(d)}"/>`}});
 /* ouvrages du lot B9 : hachurés au sol, pointillés en hauteur */
 try{const T=(window.PKFACES&&PKFACES.T)||{};S.forEach(sg=>{(P.EQ.get(sg.a)||[]).forEach(e=>{if(!/^(cv|bwc|rt)$/.test(e.t))return;const d=T[e.t]||{},L=P.dist(sg.a,sg.b),u=[(sg.b[0]-sg.a[0])/L,(sg.b[1]-sg.a[1])/L],rm=sg.rm;let n=[-u[1],u[0]];
   if(rm){let cx=0,cy=0;rm.pts.forEach(p=>{cx+=p[0];cy+=p[1]});cx/=rm.pts.length;cy/=rm.pts.length;if((cx-(sg.a[0]+sg.b[0])/2)*n[0]+(cy-(sg.a[1]+sg.b[1])/2)*n[1]<0)n=[-n[0],-n[1]]}
   let la=true;if(sg.kind==="mur"){try{const m=P.inward(sg);la=(sg.b[0]-sg.a[0])*m[1]-(sg.b[1]-sg.a[1])*m[0]>0}catch(x){}}
   const w=(e.w!=null?e.w:d.dw||60)/100,p=Math.max(.05,(e.p!=null?e.p:d.dp||0)/100),xc=e.x/100,s1=la?xc-w/2:L-xc-w/2,A=[sg.a[0]+u[0]*s1,sg.a[1]+u[1]*s1],B=[A[0]+u[0]*w,A[1]+u[1]*w];
   s+=`<polygon class="ouv${e.t==="rt"?" dsh":""}" points="${[A,B,[B[0]+n[0]*p,B[1]+n[1]*p],[A[0]+n[0]*p,A[1]+n[1]*p]].map(Pp).join(" ")}"/>`})});
  R.forEach(r=>(r.eqp||[]).forEach(e=>{if(e.t!=="cp")return;const w=(e.w||200)/100,l=(e.l||15)/100;s+=`<rect class="ouv dsh" x="${X(e.x-w/2)}" y="${Y(e.y-l/2)}" width="${n3(w*M)}" height="${n3(l*M)}"/>`}))}catch(x){}
 /* noms et surfaces */
 R.forEach(r=>{let cx=0,cy=0;r.pts.forEach(p=>{cx+=p[0];cy+=p[1]});cx/=r.pts.length;cy/=r.pts.length;const rv=(r.sol&&r.sol.revet)||"";s+=`<text class="nm" x="${X(cx)}" y="${Y(cy)}">${esc(r.nom||"Pièce")}</text><text class="sf" x="${X(cx)}" y="${n3(Y(cy)+4.6)}">${f1(area(r.pts))} m²${rv&&!/sais pas/i.test(rv)?" · "+esc(rv):""}</text>`});
 /* chaînes de cotes : en haut et à gauche, sur tous les angles des pièces, puis la cote totale */
 const tk=(x,y)=>`<path class="tk" d="M${n3(x-1.2)} ${n3(y+1.2)}L${n3(x+1.2)} ${n3(y-1.2)}"/>`;
 const uniq=a=>[...new Set(a.map(v=>Math.round(v*100)/100))].sort((p,q)=>p-q);
 const cx=uniq(xs),cy=uniq(ys);
 const chH=(v,y)=>{let c=`<path class="cl" d="M${n3(X(v[0])-2)} ${y}H${n3(X(v[v.length-1])+2)}"/>`;v.forEach(p=>{c+=`<path class="cl" d="M${X(p)} ${y-2}V${y+2}"/>`+tk(X(p),y)});for(let i=0;i<v.length-1;i++)if(v[i+1]-v[i]>=.2)c+=`<text class="ct" x="${n3((X(v[i])+X(v[i+1]))/2)}" y="${n3(y-1.6)}">${f2(v[i+1]-v[i])}</text>`;return c};
 const chV=(v,x)=>{let c=`<path class="cl" d="M${x} ${n3(Y(v[0])-2)}V${n3(Y(v[v.length-1])+2)}"/>`;v.forEach(p=>{c+=`<path class="cl" d="M${x-2} ${Y(p)}H${x+2}"/>`+tk(x,Y(p))});for(let i=0;i<v.length-1;i++)if(v[i+1]-v[i]>=.2){const m=n3((Y(v[i])+Y(v[i+1]))/2);c+=`<text class="ct" x="${n3(x-1.6)}" y="${m}" transform="rotate(-90 ${n3(x-1.6)} ${m})">${f2(v[i+1]-v[i])}</text>`}return c};
 const top=Y(bx[1])-(.3*M)-6,left=X(bx[0])-(.3*M)-6;
 s+=chH(cx,n3(top));if(cx.length>2)s+=chH([cx[0],cx[cx.length-1]],n3(top-8));
 s+=chV(cy,n3(left));if(cy.length>2)s+=chV([cy[0],cy[cy.length-1]],n3(left-8));
 /* échelle graphique : 3 m */
 const ey=196,e0=X(bx[0]);s+=`<rect class="eb1" x="${e0}" y="${ey}" width="${M}" height="1.4"/><rect class="eb2" x="${n3(e0+M)}" y="${ey}" width="${M}" height="1.4"/><rect class="eb1" x="${n3(e0+2*M)}" y="${ey}" width="${M}" height="1.4"/>`+[0,1,2,3].map(k=>`<text class="mini" x="${n3(e0+k*M)}" y="${ey+4.6}">${k}${k===3?" m":""}</text>`).join("")+`<text class="sf2" x="${n3(e0+3*M+6)}" y="${ey+1.4}">Échelle 1:${ech}</text>`;
 /* cadre + cartouche */
 const cx0=214;let k=`<rect class="cad" x="8" y="8" width="281" height="194"/><path class="cad2" d="M${cx0} 8V202"/>`;
 k+=`<text class="tt" x="18" y="24">Plan ${esc(niv(f.nom))}</text><text class="st" x="18" y="31">${o.etat==="actuel"?"État actuel":"État projeté"} · cotes en mètres</text>`;
 k+=`<svg x="${cx0+7}" y="12" width="15" height="15" viewBox="22 22 56 56">${LOGO}</svg><text class="br" x="${cx0+26}" y="22.6">ProClik</text>`;
 let y=38;const lig=(lab,val)=>{k+=`<text class="lb" x="${cx0+8}" y="${y}">${lab}</text><text class="vl" x="${cx0+8}" y="${n3(y+5.2)}">${esc(val||"—")}</text><path class="sep" d="M${cx0+8} ${n3(y+8.3)}H281"/>`;y+=15};
 lig("CLIENT",o.cli);lig("CHANTIER",o.chan);lig("NIVEAU",f.nom||"Rez-de-chaussée");lig("DATE",new Date().toLocaleDateString("fr-FR"));lig("ÉCHELLE","1:"+ech+" sur A4");
 k+=`<text class="lb" x="${cx0+8}" y="${y}">SURFACES</text>`;y+=6;let tot=0;R.slice(0,7).forEach(r=>{const a=area(r.pts);tot+=a;k+=`<text class="sv" x="${cx0+8}" y="${y}">${esc(r.nom||"Pièce")}</text><text class="sv r" x="281" y="${y}">${f1(a)} m²</text>`;y+=5});R.slice(7).forEach(r=>tot+=area(r.pts));
 k+=`<path class="sep" d="M${cx0+8} ${y-2.6}H281"/><text class="sv b" x="${cx0+8}" y="${y+2.4}">Total${R.length>7?` (${R.length} pièces)`:""}</text><text class="sv b r" x="281" y="${y+2.4}">${f1(tot)} m²</text>`;y+=11;
 k+=`<text class="lb" x="${cx0+8}" y="${y}">LÉGENDE</text>`;y+=5;
 const lg=(sym,t)=>{k+=`<g transform="translate(${cx0+8} ${y})">${sym}</g><text class="sv" x="${cx0+24}" y="${y+3}">${t}</text>`;y+=6.2};
 lg(`<rect class="mur" x="0" y=".4" width="12" height="3.4"/>`,"Mur");lg(`<line class="clo" x1="0" y1="2.1" x2="12" y2="2.1" stroke-width="1.6"/>`,"Cloison");
 lg(`<rect class="baie" x="0" y=".4" width="12" height="3.4"/><line class="vit" x1="0" y1="1" x2="12" y2="1"/><line class="vit c" x1="0" y1="2.1" x2="12" y2="2.1"/><line class="vit" x1="0" y1="3.2" x2="12" y2="3.2"/>`,"Fenêtre");
 lg(`<line class="batt" x1="1" y1="4" x2="1" y2="-.6"/><path class="arc" d="M1 -.6A4.6 4.6 0 0 1 5.6 4"/>`,"Porte");
 if((f.esc||[]).length)lg(`<rect class="esc" x="0" y=".4" width="12" height="3.4"/><line class="mar" x1="4" y1=".4" x2="4" y2="3.8"/><line class="mar" x1="8" y1=".4" x2="8" y2="3.8"/>`,"Escalier (sens de montée)");
 if(/class="ouv/.test(s))lg(`<rect class="ouv" x="0" y=".4" width="12" height="3.4"/>`,"Caisson, bâti (pointillés : en hauteur)");
 k+=`<text class="mini l" x="${cx0+8}" y="196">Plan établi avec ProClik · proclik.github.io</text>`;
 const defs=`<defs><pattern id="pp-pq" width="${n3(1.2*M)}" height="${n3(.18*M)}" patternUnits="userSpaceOnUse"><path class="lame" d="M0 ${n3(.18*M)}H${n3(1.2*M)}M${n3(.4*M)} 0v${n3(.18*M)}"/></pattern><pattern id="pp-car" width="${n3(.6*M)}" height="${n3(.6*M)}" patternUnits="userSpaceOnUse"><path class="lame" d="M0 0H${n3(.6*M)}M0 0V${n3(.6*M)}"/></pattern><pattern id="pp-hv" width="1.4" height="1.4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0v1.4" class="htl"/></pattern></defs>`;
 return`<svg id="pp-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 297 210" width="297mm" height="210mm" role="img" aria-label="Plan imprimable">${defs}<rect width="297" height="210" fill="#fff"/>${k}${s}</svg>`}
function niv(n){const t=String(n||"Rez-de-chaussée");return/^rez/i.test(t)?"du rez-de-chaussée":/^combles/i.test(t)?"des combles":"de l'"+t.toLowerCase().replace(/^l'/,"")}

const CSS=`#pp{position:fixed;inset:0;z-index:60;background:#D9DDE4;display:flex;flex-direction:column;font-family:var(--f,system-ui)}
#pp[hidden]{display:none}
#pp .pp-bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:10px max(12px,env(safe-area-inset-left,0px));padding-top:max(10px,env(safe-area-inset-top,0px));background:var(--surface,#fff);color:var(--fg,#0B1226);box-shadow:0 1px 0 var(--line,#0002)}
#pp .pp-bar b{font-size:16px;margin-right:auto}
#pp label{display:flex;align-items:center;gap:6px;font-size:14px;font-weight:700}
#pp input{font:600 15px var(--f,system-ui);padding:8px 10px;border-radius:10px;border:1px solid var(--line,#0003);background:var(--paper,#fff);color:var(--fg,#0B1226);width:170px;max-width:42vw}
#pp .pp-seg{display:flex;background:var(--paper,#eee);border-radius:999px;padding:3px}
#pp .pp-seg button{appearance:none;border:0;background:none;font:700 14px var(--f,system-ui);color:var(--muted,#5B6579);padding:7px 12px;border-radius:999px;min-height:36px}
#pp .pp-seg button[aria-pressed="true"]{background:var(--surface,#fff);color:var(--fg,#0B1226);box-shadow:0 1px 3px #0002}
#pp .pp-b{appearance:none;border:0;border-radius:999px;font:800 15px var(--f,system-ui);padding:10px 18px;min-height:44px;background:var(--paper,#eee);color:var(--fg,#0B1226)}
#pp .pp-b.go{background:#1B2440;color:#fff}
#pp .pp-pg{flex:1;overflow:auto;padding:16px;display:flex;align-items:flex-start;justify-content:center}
#pp .pp-pg svg{width:min(100%,1100px);height:auto;box-shadow:0 10px 30px #0003;background:#fff}
#pp-svg .cad{fill:none;stroke:#0B1226;stroke-width:.5}#pp-svg .cad2,#pp-svg .sep{stroke:#0B1226;stroke-width:.35}#pp-svg .sep{stroke:#C9CED8;stroke-width:.25}
#pp-svg .mur{fill:#1B2440}#pp-svg .clo{stroke:#1B2440}
#pp-svg .baie{fill:#fff}#pp-svg .vit{stroke:#1B2440;stroke-width:.22}#pp-svg .vit.c{stroke-width:.35}
#pp-svg .batt{stroke:#1B2440;stroke-width:.45}#pp-svg .arc{fill:none;stroke:#5B6579;stroke-width:.22}
#pp-svg .esc{fill:#fff;stroke:#1B2440;stroke-width:.35}#pp-svg .mar{stroke:#5B6579;stroke-width:.2;fill:none}#pp-svg .fo{fill:none;stroke:#1B2440;stroke-width:.35}#pp-svg .fo0{fill:#1B2440}
#pp-svg .lame{stroke:#D6DAE1;stroke-width:.18;fill:none}#pp-svg .htl{stroke:#1B2440;stroke-width:.2}
#pp-svg .ouv{fill:url(#pp-hv);stroke:#1B2440;stroke-width:.3}#pp-svg .ouv.dsh{stroke-dasharray:1.2 .9}
#pp-svg .cl{stroke:#5B6579;stroke-width:.22;fill:none}#pp-svg .tk{stroke:#1B2440;stroke-width:.4}
#pp-svg text{font-family:Manrope,Inter,system-ui,sans-serif;fill:#0B1226}
#pp-svg .ct{font-size:3.2px;font-weight:700;text-anchor:middle}#pp-svg .nm{font-size:4.4px;font-weight:800;text-anchor:middle}#pp-svg .sf{font-size:3.1px;fill:#5B6579;text-anchor:middle}
#pp-svg .tt{font-size:7.4px;font-weight:800}#pp-svg .st{font-size:3.6px;fill:#5B6579}#pp-svg .br{font-size:6.4px;font-weight:800}
#pp-svg .lb{font-size:2.5px;font-weight:800;fill:#A8823F;letter-spacing:.25px}#pp-svg .vl{font-size:4px;font-weight:700}
#pp-svg .sv{font-size:3.1px}#pp-svg .sv.b{font-weight:800}#pp-svg .r{text-anchor:end}
#pp-svg .mini{font-size:2.6px;fill:#5B6579;text-anchor:middle}#pp-svg .mini.l{text-anchor:start}#pp-svg .sf2{font-size:3px;font-weight:700}
#pp-svg .eb1{fill:#0B1226}#pp-svg .eb2{fill:#fff;stroke:#0B1226;stroke-width:.25}
#nt-aide .pp-open{display:flex;align-items:center;gap:8px;width:100%;margin:8px 0 2px;appearance:none;border:1px solid var(--line,#0002);background:var(--surface,#fff);color:var(--fg,#0B1226);border-radius:12px;padding:10px 12px;font:800 15px var(--f,system-ui);min-height:44px}
#nt-aide .pp-open svg{width:20px;height:20px}
@media print{@page{size:A4 landscape;margin:0}html.pp-on,html.pp-on body{margin:0!important;padding:0!important;background:#fff!important;height:auto!important;min-height:0!important;overflow:visible!important}html.pp-on body>*:not(#pp){display:none!important}html.pp-on #pp{position:static;background:#fff;display:block}html.pp-on #pp .pp-bar{display:none}html.pp-on #pp .pp-pg{padding:0;display:block;overflow:visible}html.pp-on #pp .pp-pg svg{display:block;width:297mm;height:209mm;box-shadow:none}}`;
let O={etat:"projet"};
function render(){const d=$("pp");if(!d)return;const s=sheet(O);d.querySelector(".pp-pg").innerHTML=s||`<p style="font:700 16px system-ui">Dessinez d'abord une pièce.</p>`}
function open(){const P=K();if(!P)return;let d=$("pp");
 if(!d){d=document.createElement("div");d.id="pp";d.setAttribute("role","dialog");d.setAttribute("aria-label","Imprimer le plan");
  d.innerHTML=`<div class="pp-bar"><b>Plan à imprimer (A4)</b><label>Client <input id="pp-cli" autocomplete="off" placeholder="Nom du client"></label><label>Chantier <input id="pp-chan" autocomplete="off" placeholder="Ex. : cloisons du séjour"></label><div class="pp-seg" role="group" aria-label="État"><button data-pe="projet" aria-pressed="true">Projeté</button><button data-pe="actuel" aria-pressed="false">Actuel</button></div><button class="pp-b" data-pp="x">Fermer</button><button class="pp-b go" data-pp="go">Imprimer</button></div><div class="pp-pg"></div>`;
  document.body.appendChild(d);
  d.addEventListener("input",e=>{if(e.target.id==="pp-cli"){O.cli=e.target.value;ls("pk-pp-cli",O.cli)}if(e.target.id==="pp-chan"){O.chan=e.target.value;ls("pk-pp-chan",O.chan)}render()});
  d.addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;if(b.dataset.pe){O.etat=b.dataset.pe;d.querySelectorAll("[data-pe]").forEach(x=>x.setAttribute("aria-pressed",x===b));render()}
   if(b.dataset.pp==="x")close();if(b.dataset.pp==="go"){try{window.print()}catch(x){}}})}
 const q=new URLSearchParams(location.search);O.cli=q.get("cn")||ls("pk-pp-cli");O.chan=q.get("ch")||ls("pk-pp-chan");$("pp-cli").value=O.cli||"";$("pp-chan").value=O.chan||"";
 d.hidden=false;document.documentElement.classList.add("pp-on");render()}
function close(){const d=$("pp");if(d)d.hidden=true;document.documentElement.classList.remove("pp-on")}
function addBtn(){const a=$("nt-aide");if(!a||a.querySelector(".pp-open"))return!!a;const b=document.createElement("button");b.className="pp-open";b.type="button";
 b.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M6 14h12v7H6z"/></svg>Imprimer le plan (A4)`;
 b.addEventListener("click",e=>{e.stopPropagation();a.hidden=true;document.documentElement.classList.remove("nt-aide");open()});a.insertBefore(b,a.firstChild.nextSibling);return true}
function boot(){const st=document.createElement("style");st.textContent=CSS;document.head.appendChild(st);let n=0;const t=setInterval(()=>{if(addBtn()||++n>100)clearInterval(t)},150);
 addEventListener("keydown",e=>{if(e.key==="Escape"&&$("pp")&&!$("pp").hidden)close()})}
function wait(n){if(K()&&$("svg"))return boot();if(n>80)return;setTimeout(()=>wait(n+1),100)}
wait(0);
window.PKPRINT={open,close,sheet};
})();
