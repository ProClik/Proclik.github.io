/* ProClik · Plan de l'artisan : murs vus de face, plafond, climatisation (17/11, demande de Cyril).
   Sur le modèle de la démo RT2O : chaque mur vu de face avec ses portes et fenêtres, et l'artisan y pose
   ses prises, interrupteurs, arrivées d'eau, évacuations, clim… au doigt, cotes depuis l'angle gauche et le sol.
   Seuls les éléments des métiers de l'artisan sont proposés (un plaquiste ne voit pas les prises).
   Données : EQ (par mur, dans plan.html), rm.eqp (plafond), rm.clim (climatisation), exportées avec le plan. */
(function(){
"use strict";
if(/[?&]client/.test(location.search))return;
const K=()=>window.PKPLAN;
const $=id=>document.getElementById(id);
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fr=v=>String(Math.round(v*100)/100).replace(".",",");
const R5=v=>Math.round(v/5)*5;

/* Familles : el = électricité, eau = plomberie et chauffage, clim = climatisation. h = hauteur du milieu par défaut (cm), à ajuster. */
const FAM={el:"Électricité",eau:"Plomberie et chauffage",clim:"Climatisation"};
const T={
 pc:{n:"Prise 16 A",h:30,f:"el"},pc2:{n:"Prise double",h:30,f:"el"},p32:{n:"Prise 32 A (plaque)",h:15,f:"el"},
 tv:{n:"Prise TV",h:30,f:"el"},rj:{n:"Prise internet (RJ45)",h:30,f:"el"},
 int:{n:"Interrupteur",h:110,f:"el"},vv:{n:"Va-et-vient",h:110,f:"el"},app:{n:"Applique",h:180,f:"el"},
 iph:{n:"Interphone",h:150,f:"el"},tab:{n:"Tableau électrique",h:160,f:"el",w:60,hh:80},vmcm:{n:"Bouche VMC (mur)",h:220,f:"el"},
 ef:{n:"Arrivée eau froide",h:55,f:"eau"},ec:{n:"Arrivée eau chaude",h:55,f:"eau"},ev:{n:"Évacuation",h:40,f:"eau"},mit:{n:"Mitigeur douche",h:110,f:"eau"},
 rad:{n:"Radiateur",h:45,f:"eau",w:80,hh:55},ss:{n:"Sèche-serviettes",h:110,f:"eau",w:50,hh:120},
 split:{n:"Unité intérieure (split mural)",h:230,f:"clim",w:90,hh:30},ge:{n:"Groupe extérieur (côté dehors)",h:50,f:"clim",w:80,hh:60},
 liai:{n:"Passage des liaisons",h:230,f:"clim"},cond:{n:"Évacuation des condensats",h:200,f:"clim"},cmd:{n:"Commande murale clim",h:150,f:"clim"}
};
/* Au plafond */
const TP={
 spot:{n:"Spot encastré",f:"el"},pl:{n:"Point lumineux (plafonnier)",f:"el"},vmc:{n:"Bouche VMC",f:"el"},df:{n:"Détecteur de fumée",f:"el"},
 souf:{n:"Bouche de soufflage (gainable)",f:"clim"},rep:{n:"Grille de reprise (gainable)",f:"clim"},cas:{n:"Cassette clim au plafond",f:"clim"}
};
const MET=[["el","Électricien"],["eau","Plombier / chauffagiste"],["clim","Climatisation"],["placo","Plaquiste"],["menu","Menuisier"],["peint","Peintre"],["carre","Carreleur"],["macon","Maçon"]];
const MK="pk-metiers";
function metiers(){try{const v=JSON.parse(localStorage.getItem(MK)||"null");return Array.isArray(v)?v:null}catch(e){return null}}
function setMetiers(v){try{localStorage.setItem(MK,JSON.stringify(v))}catch(e){}}
const fams=()=>(metiers()||[]).filter(k=>FAM[k]);

/* ---------- État de la vue ---------- */
let V=null; /* {tab:"mur"|"plaf"|"clim", ri, wi (index dans walls()), sel, pick, met} */
const H=()=>Math.round(((K().F().H)||2.5)*100);
function room(){return K().F().rooms[V.ri]}
function walls(){const P=K(),S=P.segs(),rm=room();return S.map((s,x)=>({s,x})).filter(o=>o.s.rm===rm).sort((a,b)=>(a.s.kind==="mur"?0:1)-(b.s.kind==="mur"?0:1))}
function wall(){const W=walls();if(V.wi>=W.length)V.wi=0;return W[V.wi]}
function leftIsA(sg){if(sg.kind!=="mur")return true;const n=K().inward(sg),d=[sg.b[0]-sg.a[0],sg.b[1]-sg.a[1]];/* on regarde le mur depuis la pièce : direction -n ; sa droite (repère écran, y vers le bas) = (n_y,-n_x) */return d[0]*n[1]-d[1]*n[0]>0}
function wName(sg){try{return K().segName(sg)}catch(e){return sg.kind==="mur"?"Mur":"Cloison"}}
function eqs(sg){const P=K();let L=P.EQ.get(sg.a);if(!L){L=[];P.EQ.set(sg.a,L)}return L}
/* Portes et fenêtres de ce mur, y compris celles enregistrées depuis la pièce voisine (mur commun). */
function opens(sg){const P=K(),L=P.dist(sg.a,sg.b),u=[(sg.b[0]-sg.a[0])/L,(sg.b[1]-sg.a[1])/L],la=leftIsA(sg),out=[],seen=new Set();
 const off=p=>Math.abs((p[0]-sg.a[0])*u[1]-(p[1]-sg.a[1])*u[0]),par=p=>(p[0]-sg.a[0])*u[0]+(p[1]-sg.a[1])*u[1];
 P.segs().forEach(t=>{const os=P.OP.get(t.a);if(!os||!os.length)return;if(t.a!==sg.a&&(off(t.a)>.04||off(t.b)>.04))return;const Lt=P.dist(t.a,t.b),ut=[(t.b[0]-t.a[0])/Lt,(t.b[1]-t.a[1])/Lt];
  os.forEach(o=>{if(seen.has(o))return;const A=[t.a[0]+ut[0]*o.p,t.a[1]+ut[1]*o.p],B=[t.a[0]+ut[0]*(o.p+o.w),t.a[1]+ut[1]*(o.p+o.w)];let s1=par(A),s2=par(B);if(s1>s2)[s1,s2]=[s2,s1];if(s2<.02||s1>L-.02)return;seen.add(o);
   s1=Math.max(0,s1);s2=Math.min(L,s2);const x1=la?s1*100:(L-s2)*100,x2=la?s2*100:(L-s1)*100;
   out.push({o,x1,x2,al:o.k==="fenetre"?Math.round((o.al||0)*100):0,h:Math.round((o.h||(o.k==="porte"?2.04:1.35))*100),nm:(()=>{try{return P.opName(o,!t.sh)}catch(e){return o.k==="porte"?"Porte":"Fenêtre"}})()})})});
 return out.sort((a,b)=>a.x1-b.x1)}
const vis=t=>fams().includes((T[t]||TP[t]||{}).f);

/* ---------- Dessins ---------- */
function sym(e,i,fs,sel){const x=e.x,y=H()-e.h;let g="";
 switch(e.t){
  case"pc":g=`<circle class="bx" cx="${x}" cy="${y}" r="8"/><circle class="pt" cx="${x-3}" cy="${y}" r="1.6"/><circle class="pt" cx="${x+3}" cy="${y}" r="1.6"/>`;break;
  case"pc2":g=`<rect class="bx" x="${x-15}" y="${y-8}" width="30" height="16" rx="5"/>${[-10,-4,4,10].map(k=>`<circle class="pt" cx="${x+k}" cy="${y}" r="1.5"/>`).join("")}`;break;
  case"p32":g=`<circle class="bx" cx="${x}" cy="${y}" r="9"/><circle class="pt" cx="${x-3.5}" cy="${y+2}" r="1.5"/><circle class="pt" cx="${x+3.5}" cy="${y+2}" r="1.5"/><circle class="pt" cx="${x}" cy="${y-3.5}" r="1.5"/>`;break;
  case"tv":case"rj":g=`<rect class="bx" x="${x-9}" y="${y-8}" width="18" height="16" rx="4"/><text class="tt" x="${x}" y="${y+3.5}">${e.t==="tv"?"TV":"RJ"}</text>`;break;
  case"int":g=`<rect class="bx" x="${x-8}" y="${y-8}" width="16" height="16" rx="3"/><line class="gl" x1="${x-3}" y1="${y+4}" x2="${x+3}" y2="${y-4}"/>`;break;
  case"vv":g=`<rect class="bx" x="${x-8}" y="${y-8}" width="16" height="16" rx="3"/><line class="gl" x1="${x-4}" y1="${y+3}" x2="${x+1}" y2="${y-4}"/><line class="gl" x1="${x-1}" y1="${y+4}" x2="${x+4}" y2="${y-3}"/>`;break;
  case"app":g=`<circle class="bx" cx="${x}" cy="${y}" r="9"/><line class="gl" x1="${x-5}" y1="${y-5}" x2="${x+5}" y2="${y+5}"/><line class="gl" x1="${x+5}" y1="${y-5}" x2="${x-5}" y2="${y+5}"/>`;break;
  case"iph":g=`<rect class="bx" x="${x-7}" y="${y-11}" width="14" height="22" rx="3"/><circle class="gl" cx="${x}" cy="${y-3}" r="3"/><line class="gl" x1="${x-3}" y1="${y+5}" x2="${x+3}" y2="${y+5}"/>`;break;
  case"tab":g=`<rect class="bx" x="${x-30}" y="${y-40}" width="60" height="80" rx="4"/>${[0,1,2].map(k=>`<line class="gl" x1="${x-22}" y1="${y-22+k*20}" x2="${x+22}" y2="${y-22+k*20}"/>`).join("")}`;break;
  case"vmcm":g=`<circle class="bx" cx="${x}" cy="${y}" r="10"/><circle class="gl" cx="${x}" cy="${y}" r="5"/>`;break;
  case"ef":case"ec":g=`<circle class="bx" cx="${x}" cy="${y}" r="7"/><circle class="${e.t}" cx="${x}" cy="${y}" r="4"/>`;break;
  case"mit":g=`<circle class="bx" cx="${x}" cy="${y}" r="9"/><circle class="ec" cx="${x-3}" cy="${y}" r="3"/><circle class="ef" cx="${x+3}" cy="${y}" r="3"/>`;break;
  case"ev":g=`<circle class="bx" cx="${x}" cy="${y}" r="8"/><circle class="gl" cx="${x}" cy="${y}" r="3.5"/>`;break;
  case"rad":g=`<rect class="bx" x="${x-40}" y="${y-27}" width="80" height="55" rx="4"/>${[-24,-8,8,24].map(k=>`<line class="gl" x1="${x+k}" y1="${y-20}" x2="${x+k}" y2="${y+20}"/>`).join("")}`;break;
  case"ss":g=`<rect class="bx" x="${x-25}" y="${y-60}" width="50" height="120" rx="4"/>${[-40,-20,0,20,40].map(k=>`<line class="gl" x1="${x-18}" y1="${y+k}" x2="${x+18}" y2="${y+k}"/>`).join("")}`;break;
  case"split":g=`<rect class="bx cl" x="${x-45}" y="${y-15}" width="90" height="30" rx="9"/><line class="gl" x1="${x-34}" y1="${y+7}" x2="${x+34}" y2="${y+7}"/><circle class="clp" cx="${x+33}" cy="${y-6}" r="2.2"/>`;break;
  case"ge":g=`<rect class="bx cl ext" x="${x-40}" y="${y-30}" width="80" height="60" rx="5"/><circle class="gl" cx="${x-10}" cy="${y}" r="20"/><line class="gl" x1="${x-24}" y1="${y}" x2="${x+4}" y2="${y}"/><line class="gl" x1="${x-10}" y1="${y-14}" x2="${x-10}" y2="${y+14}"/>`;break;
  case"liai":g=`<circle class="bx cl" cx="${x}" cy="${y}" r="9"/><circle class="clp" cx="${x}" cy="${y}" r="3.5"/>`;break;
  case"cond":g=`<circle class="bx cl" cx="${x}" cy="${y}" r="8"/><path class="gl" d="M${x} ${y-4} q4 5 0 8 q-4 -3 0 -8"/>`;break;
  case"cmd":g=`<rect class="bx cl" x="${x-9}" y="${y-7}" width="18" height="14" rx="3"/><text class="tt" x="${x}" y="${y+3.5}" style="font-size:7px">°C</text>`;break;
 }
 const k=(T[e.t]||{}).w?1:Math.max(1,fs/14),r=Math.max(20*k,((T[e.t]||{}).w||0)/2);
 return `<g class="sym st-${e.st==="faire"?"faire":"exist"}${sel?" on":""}" data-i="${i}"><title>${esc(e.n||(T[e.t]||{}).n)}</title><circle class="hit" cx="${x}" cy="${y}" r="${r}"/>${e.st==="faire"?`<circle class="halo" cx="${x}" cy="${y}" r="${Math.max(17*k,((T[e.t]||{}).w||0)/2+8)}"/>`:""}<g transform="translate(${x} ${y}) scale(${k}) translate(${-x} ${-y})">${g}</g></g>`}
const pill=(x,y,t,fs)=>{const w=t.length*fs*.58+fs*.9;return`<rect class="pill" x="${x-w/2}" y="${y-fs*.75}" width="${w}" height="${fs*1.5}" rx="${fs*.75}"/><text class="pillt" x="${x}" y="${y+fs*.32}" font-size="${fs*.85}">${t}</text>`};
const dim=(x1,x2,y,t,fs)=>`<line class="cl" x1="${x1}" y1="${y}" x2="${x2}" y2="${y}"/><line class="cl" x1="${x1}" y1="${y-fs*.4}" x2="${x1}" y2="${y+fs*.4}"/><line class="cl" x1="${x2}" y1="${y-fs*.4}" x2="${x2}" y2="${y+fs*.4}"/><text class="ck" x="${(x1+x2)/2}" y="${y-fs*.45}" font-size="${fs*.95}">${t}</text>`;

function svgMur(){const w=wall();if(!w)return"";const sg=w.s,P=K(),L=Math.round(P.dist(sg.a,sg.b)*100),Hh=H(),E=eqs(sg),O=opens(sg),sel=V.sel;
 const fs=Math.max(15,(L+160)/34),ml=fs*2.6,mr=fs*1.2,mt=fs*4.4,mb=fs*(sel>=0?2.2:6.6);
 let s=`<svg id="fx-esvg" viewBox="${-ml} ${-mt} ${L+ml+mr} ${Hh+mt+mb}" font-size="${fs}" role="img" aria-label="Mur vu de face">`;
 s+=`<rect class="fond" x="0" y="0" width="${L}" height="${Hh}"/>`;
 O.forEach(o=>{const w=o.x2-o.x1,y=Hh-o.al-o.h;s+=`<rect class="ouv" x="${o.x1}" y="${y}" width="${w}" height="${o.h}"/>`;
  if(o.o.k!=="porte")s+=`<line class="vit" x1="${o.x1+w/2}" y1="${y}" x2="${o.x1+w/2}" y2="${y+o.h}"/>`;else s+=`<circle class="pg" cx="${o.x2-8}" cy="${Hh-100}" r="3"/>`;
  if(w>fs*3.2)s+=`<text class="txt" x="${o.x1+w/2}" y="${y+fs*1.3}" font-size="${fs*.8}">${Math.round(w)} × ${o.h}</text>`;
  if(o.al){s+=`<line class="cl" stroke-dasharray="4 4" x1="${o.x1+5}" y1="${Hh}" x2="${o.x1+5}" y2="${Hh-o.al}"/><text class="txt" x="${o.x1+w/2}" y="${w>fs*3.2&&o.h>fs*3?y+o.h-fs*.6:y-fs*.4}" font-size="${fs*.72}">allège ${o.al}</text>`}});
 s+=`<rect class="bord" x="0" y="0" width="${L}" height="${Hh}"/><line class="sol" x1="${-ml*.6}" y1="${Hh}" x2="${L+mr*.6}" y2="${Hh}"/>`;
 s+=`<text class="txt" x="${-fs*.5}" y="${Hh+fs*1.2}" font-size="${fs*.75}" style="text-anchor:end">sol</text>`;
 s+=`<line class="cl" x1="${-fs*1.3}" y1="0" x2="${-fs*1.3}" y2="${Hh}"/><text class="txt" font-size="${fs*.8}" transform="translate(${-fs*1.7} ${Hh/2}) rotate(-90)">${Hh}</text>`;
 s+=dim(0,L,-fs*3.4,fr(L/100)+" m",fs);
 if(O.length){const pts=[0];O.forEach(o=>pts.push(o.x1,o.x2));pts.push(L);const y2=-fs*1.5;s+=`<line class="cl" x1="0" y1="${y2}" x2="${L}" y2="${y2}"/>`;
  pts.forEach(x=>{s+=`<line class="cl" x1="${x}" y1="${y2-fs*.35}" x2="${x}" y2="${y2+fs*.35}"/>`});
  for(let i=0;i<pts.length-1;i++){const d=pts[i+1]-pts[i];if(d>fs*1.6)s+=`<text class="ck" font-size="${fs*.82}" x="${(pts[i]+pts[i+1])/2}" y="${y2-fs*.45}">${Math.round(d)}</text>`}}
 const shown=E.map((e,i)=>({e,i})).filter(o=>vis(o.e.t));
 shown.forEach(o=>{s+=sym(o.e,o.i,fs,o.i===sel)});
 if(sel>=0&&E[sel]&&vis(E[sel].t)){const e=E[sel],y=Hh-e.h;
  s+=`<line class="cs" stroke-dasharray="6 5" x1="0" y1="${y}" x2="${e.x}" y2="${y}"/><line class="cs" stroke-dasharray="6 5" x1="${e.x}" y1="${Hh}" x2="${e.x}" y2="${y}"/>`;
  s+=pill(e.x/2,y-fs*.9,Math.round(e.x)+" cm",fs)+pill(e.x+fs*2.4,Hh-e.h/2,Math.round(e.h)+" cm",fs)}
 else{const xs=shown.map(o=>Math.round(o.e.x)).sort((a,b)=>a-b).filter((v,i,a)=>i===0||v-a[i-1]>2).filter((v,i,a)=>i===0||v-a[i-1]>=fs*.95||i===a.length-1&&false),yb=Hh+fs*1.4;
  if(xs.length){s+=`<line class="cl" x1="0" y1="${yb}" x2="${xs[xs.length-1]}" y2="${yb}"/><circle class="cd" cx="0" cy="${yb}" r="${fs*.22}"/>`;
   xs.forEach(x=>{s+=`<line class="cl" x1="${x}" y1="${yb-fs*.4}" x2="${x}" y2="${yb+fs*.4}"/><text class="ck" font-size="${fs*.78}" style="text-anchor:end" transform="translate(${x+fs*.28} ${yb+fs*.7}) rotate(-90)">${x}</text>`});
   s+=`<text class="txt" x="0" y="${Hh+fs*6.2}" font-size="${fs*.72}" style="text-anchor:start">Distances depuis l'angle gauche, en cm</text>`}
  shown.forEach(o=>{if(shown.some(p=>p!==o&&p.e.x<o.e.x&&o.e.x-p.e.x<70&&p.e.h===o.e.h))return;const e=o.e,w=((T[e.t]||{}).w||(e.t==="pc2"?30:18)*Math.max(1,fs/14))/2,g=shown.some(p=>p!==o&&p.e.x>e.x&&p.e.x-e.x<fs*2.4&&Math.abs(p.e.h-e.h)<fs*1.2);
   s+=`<text class="txt" font-size="${fs*.7}" x="${g?e.x-w-fs*.25:e.x+w+fs*.25}" y="${Hh-e.h+fs*.25}" style="text-anchor:${g?"end":"start"}">${Math.round(e.h)}</text>`})}
 return s+"</svg>"}

function mini(){const rm=room(),w=wall(),xs=rm.pts.map(p=>p[0]),ys=rm.pts.map(p=>p[1]),x0=Math.min(...xs),y0=Math.min(...ys),W=Math.max(...xs)-x0||1,Hh=Math.max(...ys)-y0||1,M=Math.max(W,Hh),pad=M*.12;
 const cx=x0+W/2,cy=y0+Hh/2,sg=w&&w.s;let s=`<svg class="fx-mini" viewBox="${x0-pad} ${y0-pad} ${W+2*pad} ${Hh+2*pad}" role="group" aria-label="Choisir un mur"><polygon points="${rm.pts.map(p=>p.join(",")).join(" ")}" class="mp"/>`;
 walls().forEach((o,i)=>{s+=`<line data-w="${i}" class="mw${i===V.wi?" on":""}${o.s.kind==="clo"?" clo":""}" x1="${o.s.a[0]}" y1="${o.s.a[1]}" x2="${o.s.b[0]}" y2="${o.s.b[1]}" stroke-width="${M/(i===V.wi?13:26)}"/><line data-w="${i}" class="mhit" x1="${o.s.a[0]}" y1="${o.s.a[1]}" x2="${o.s.b[0]}" y2="${o.s.b[1]}" stroke-width="${M/7}"/>`});
 if(sg&&V.tab==="mur"){const mx=(sg.a[0]+sg.b[0])/2,my=(sg.a[1]+sg.b[1])/2,a=Math.atan2(my-cy,mx-cx),r=M*.16;s+=`<circle class="me" cx="${cx}" cy="${cy}" r="${M/16}"/><line class="me" x1="${cx}" y1="${cy}" x2="${cx+Math.cos(a)*r}" y2="${cy+Math.sin(a)*r}" stroke-width="${M/30}"/>`}
 return s+"</svg>"}

/* Plafond de la pièce, vu de dessus, cotes depuis les murs. */
function svgPlaf(){const rm=room(),pts=rm.pts.map(p=>[p[0]*100,p[1]*100]),xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]),b=[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)],w=b[2]-b[0],h=b[3]-b[1],M=Math.max(w,h),mg=M*.2,fs=M/24;
 let s=`<svg id="fx-psvg" viewBox="${b[0]-mg} ${b[1]-mg} ${w+mg*1.5} ${h+mg*1.5}" font-size="${fs}" role="img" aria-label="Plafond vu de dessus"><polygon class="pfond" points="${pts.map(p=>p.join(",")).join(" ")}"/>`;
 pts.forEach((p,i)=>{const q=pts[(i+1)%pts.length];s+=`<line class="pmur" x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" stroke-width="${M/60}"/>`});
 const E=(rm.eqp||[]).map((e,i)=>({e,i})).filter(o=>vis(o.e.t)),k=M/420,X=[],Y=[];
 E.forEach(({e,i})=>{const x=e.x*100,y=e.y*100;X.push(Math.round(x));Y.push(Math.round(y));s+=`<g class="sym st-${e.st==="faire"?"faire":"exist"}${V.sel===i?" on":""}" data-i="${i}"><title>${esc(e.n||TP[e.t].n)}</title><circle class="hit" cx="${x}" cy="${y}" r="${Math.max(24*k,fs*1.4)}"/>${e.st==="faire"?`<circle class="halo" cx="${x}" cy="${y}" r="${Math.max(24*k,fs*1.2)}"/>`:""}${symPlaf(e.t,x,y,Math.max(1,k))}</g>`});
 s+=chain(X,b[0],b[2],b[1]-mg*.45,1,fs)+chain(Y,b[1],b[3],b[0]-mg*.45,0,fs);
 if(V.sel>=0&&rm.eqp&&rm.eqp[V.sel]){const e=rm.eqp[V.sel],x=e.x*100,y=e.y*100;s+=`<line class="cs" stroke-dasharray="6 5" x1="${b[0]}" y1="${y}" x2="${x}" y2="${y}"/><line class="cs" stroke-dasharray="6 5" x1="${x}" y1="${b[1]}" x2="${x}" y2="${y}"/>`+pill((b[0]+x)/2,y-fs*.9,Math.round(x-b[0])+" cm",fs)+pill(x+fs*2.6,(b[1]+y)/2,Math.round(y-b[1])+" cm",fs)}
 return s+"</svg>"}
function symPlaf(t,x,y,k){
 if(t==="spot")return`<circle class="pf-spot" cx="${x}" cy="${y}" r="${13*k}"/><line class="pf-x" x1="${x-9*k}" y1="${y-9*k}" x2="${x+9*k}" y2="${y+9*k}"/><line class="pf-x" x1="${x+9*k}" y1="${y-9*k}" x2="${x-9*k}" y2="${y+9*k}"/>`;
 if(t==="pl")return`<circle class="pf-spot" cx="${x}" cy="${y}" r="${18*k}"/><circle class="pf-pl" cx="${x}" cy="${y}" r="${7*k}"/>`;
 if(t==="vmc")return`<rect class="pf-vmc" x="${x-14*k}" y="${y-14*k}" width="${28*k}" height="${28*k}" rx="4"/><circle class="pf-vmc" cx="${x}" cy="${y}" r="${7*k}"/>`;
 if(t==="df")return`<circle class="pf-df" cx="${x}" cy="${y}" r="${15*k}"/><text class="pf-dft" x="${x}" y="${y+5*k}" font-size="${13*k}">DF</text>`;
 if(t==="souf")return`<rect class="pf-cl" x="${x-30*k}" y="${y-9*k}" width="${60*k}" height="${18*k}" rx="3"/>${[-18,-6,6,18].map(d=>`<line class="pf-x" x1="${x+d*k}" y1="${y-5*k}" x2="${x+d*k}" y2="${y+5*k}"/>`).join("")}`;
 if(t==="rep")return`<rect class="pf-cl" x="${x-25*k}" y="${y-25*k}" width="${50*k}" height="${50*k}" rx="3"/>${[-12,0,12].map(d=>`<line class="pf-x" x1="${x-18*k}" y1="${y+d*k}" x2="${x+18*k}" y2="${y+d*k}"/>`).join("")}`;
 return`<rect class="pf-cl" x="${x-30*k}" y="${y-30*k}" width="${60*k}" height="${60*k}" rx="4"/><rect class="pf-x" x="${x-16*k}" y="${y-16*k}" width="${32*k}" height="${32*k}" fill="none"/>`}
function chain(vals,a,b,pos,horiz,fs){const v=[a].concat(vals.filter((x,i,t)=>t.indexOf(x)===i).sort((x,y)=>x-y)).concat([b]);let s="";const t8=fs*.45;
 for(let i=0;i<v.length-1;i++){const m=(v[i]+v[i+1])/2,t=String(Math.round(v[i+1]-v[i]));if(v[i+1]-v[i]<1)continue;
  s+=horiz?`<line class="cl" x1="${v[i]}" y1="${pos}" x2="${v[i+1]}" y2="${pos}"/><line class="cl" x1="${v[i]}" y1="${pos-t8}" x2="${v[i]}" y2="${pos+t8}"/><text class="ck" font-size="${fs*.85}" x="${m}" y="${pos-t8}">${t}</text>`
  :`<line class="cl" x1="${pos}" y1="${v[i]}" x2="${pos}" y2="${v[i+1]}"/><line class="cl" x1="${pos-t8}" y1="${v[i]}" x2="${pos+t8}" y2="${v[i]}"/><text class="ck" font-size="${fs*.85}" x="${pos-t8}" y="${m}" transform="rotate(-90 ${pos-t8} ${m})">${t}</text>`}
 return s+(horiz?`<line class="cl" x1="${b}" y1="${pos-t8}" x2="${b}" y2="${pos+t8}"/>`:`<line class="cl" x1="${pos-t8}" y1="${b}" x2="${pos+t8}" y2="${b}"/>`)}

/* ---------- Règles de base (17/11, Cyril) ----------
   « norme » = NF C 15-100 ou obligation ; « usage » = hauteur courante en France, réglable dans « Mes règles ». Toutes en cm. */
const RG=[
 ["prise","Prises de courant : hauteur du milieu",30,"usage (norme : au moins 5 cm)"],
 ["inter","Interrupteurs : hauteur du milieu",115,"usage (accessibilité : entre 90 et 130 cm)"],
 ["porte","Interrupteur : distance au bord de la porte",20,"usage"],
 ["coin","Distance minimale à un angle",15,"usage"],
 ["ptrav","Cuisine : prises au-dessus du plan de travail",110,"usage"],
 ["p32","Cuisine : prise 32 A de la plaque",15,"usage"],
 ["rj","Prises RJ45 et TV : hauteur",30,"usage"],
 ["evEau","Évier : arrivées d'eau",55,"usage"],["evEv","Évier : évacuation",45,"usage"],
 ["lavEau","Lavabo : arrivées d'eau",55,"usage"],["lavEv","Lavabo : évacuation",45,"usage"],
 ["douche","Douche : mitigeur",110,"usage"],
 ["wcEau","WC : arrivée d'eau",20,"usage"],["wcEv","WC : évacuation",10,"usage"],
 ["llEau","Lave-linge : robinet",90,"usage"],["llEv","Lave-linge : évacuation",80,"usage"],
 ["entraxe","Eau chaude / eau froide : écart",15,"usage (eau chaude à gauche)"],
 ["splitP","Clim : haut du split sous le plafond",15,"usage (voir la notice du fabricant)"],
 ["cmd","Clim : commande murale",150,"usage"]];
const RK="pk-regles";
function RR(){const o={};RG.forEach(r=>o[r[0]]=r[2]);try{Object.assign(o,JSON.parse(localStorage.getItem(RK)||"{}"))}catch(e){}return o}
function setRR(k,v){let o={};try{o=JSON.parse(localStorage.getItem(RK)||"{}")}catch(e){}if(v==null)delete o[k];else o[k]=v;try{localStorage.setItem(RK,JSON.stringify(o))}catch(e){}}
/* hauteur par défaut d'un élément, d'après les règles */
function hdef(t){const r=RR();return({pc:r.prise,pc2:r.prise,tv:r.rj,rj:r.rj,int:r.inter,vv:r.inter,p32:r.p32,cmd:r.cmd,split:H()-r.splitP-15,liai:H()-r.splitP-15})[t]??T[t].h}
/* Type de pièce d'après son nom */
function rtype(nom){const n=String(nom||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"");
 if(/cuisine/.test(n))return"cui";if(/bain|sdb|salle d.?eau|douche/.test(n))return"sdb";if(/\bwc\b|toilette/.test(n))return"wc";if(/chambre|parental/.test(n))return"ch";
 if(/sejour|salon|living|piece de vie|salle a manger|pdv/.test(n))return"sej";if(/entree|couloir|degagement|hall|palier/.test(n))return"circ";if(/buanderie|cellier|lingerie/.test(n))return"bua";if(/bureau/.test(n))return"bur";return"autre"}
/* Minimum de prises 16 A (NF C 15-100) hors cuisine plan de travail */
function nbPrises(ty,m2){return{sej:Math.min(12,Math.max(5,Math.ceil(m2/4))),ch:3,bur:3,cui:2,circ:m2>=4?1:0,sdb:1,bua:1,wc:0,autre:m2>4?1:0}[ty]||0}
/* Intervalles libres d'un mur (cm, depuis l'angle gauche) */
function libres(w,opts){const r=RR(),L=Math.round(K().dist(w.s.a,w.s.b)*100),bl=[[0,r.coin],[L-r.coin,L]];opens(w.s).forEach(o=>{const m=o.o.k==="porte"?30:o.o.k==="pf"?15:(opts&&opts.sousFen?-1e9:10);if(m>-1e8)bl.push([o.x1-m,o.x2+m])});
 (K().EQ.get(w.s.a)||[]).forEach(e=>{if(!opts||!opts.h||Math.abs(e.h-opts.h)<40)bl.push([e.x-25,e.x+25])});
 bl.sort((a,b)=>a[0]-b[0]);const out=[];let c=0;bl.forEach(([a,b])=>{if(a>c)out.push([c,a]);c=Math.max(c,b)});if(c<L)out.push([c,L]);return out.filter(([a,b])=>b-a>=20)}
/* Pose n éléments en les répartissant : chaque fois au milieu du plus grand espace libre de la pièce */
function repartir(ws,n,mk){for(let k=0;k<n;k++){let best=null;ws.forEach(w=>libres(w,{h:mk.h}).forEach(([a,b])=>{if(!best||b-a>best.l)best={w,x:R5((a+b)/2),l:b-a}}));if(!best||best.l<30)return k;eqs(best.w.s).push({...mk,x:best.x})}return n}
function addOn(w,t,x,h,n){const L=Math.round(K().dist(w.s.a,w.s.b)*100);eqs(w.s).push({t,n:n||T[t].n,x:Math.max(5,Math.min(L-5,R5(x))),h:R5(h),auto:1})}
/* Le mur du plan de travail / de l'évier : un mur qui donne dehors avec fenêtre, sinon le plus long sans porte */
function murEvier(ws){const sc=w=>{const O=opens(w.s),L=K().dist(w.s.a,w.s.b);return(O.some(o=>o.o.k==="fenetre")?3:0)+(w.s.kind==="mur"&&!w.s.sh?1:0)-(O.some(o=>o.o.k==="porte"||o.o.k==="pf")?2:0)+L/10};return ws.slice().sort((a,b)=>sc(b)-sc(a))[0]}
function plusLong(ws,f){return ws.filter(f||(()=>true)).sort((a,b)=>K().dist(b.s.a,b.s.b)-K().dist(a.s.a,a.s.b))[0]}
function trioEau(w,x,eau,ev,nom){const r=RR();addOn(w,"ec",x-r.entraxe/2,eau,"Arrivée eau chaude"+(nom?" ("+nom+")":""));addOn(w,"ef",x+r.entraxe/2,eau,"Arrivée eau froide"+(nom?" ("+nom+")":""));addOn(w,"ev",x,ev,"Évacuation"+(nom?" ("+nom+")":""))}
function milieuLibre(w,pref){const L=libres(w,{sousFen:pref==="fen"});if(pref==="fen"){const f=opens(w.s).find(o=>o.o.k==="fenetre");if(f)return R5((f.x1+f.x2)/2)}const g=L.sort((a,b)=>(b[1]-b[0])-(a[1]-a[0]))[0];return g?R5((g[0]+g[1])/2):R5(K().dist(w.s.a,w.s.b)*50)}

/* Remplit la pièce une seule fois par métier, selon son type, ses portes et fenêtres. */
function autoRoom(){const rm=room(),F=fams();if(!rm||!F.length)return 0;rm.eqAuto=rm.eqAuto||{};const todo=F.filter(f=>(f==="el"||f==="eau")&&!rm.eqAuto[f]);if(!todo.length)return 0;
 const ws=walls();if(!ws.length)return 0;snap();const r=RR(),ty=rtype(rm.nom),m2=Math.abs(area(rm.pts)),b=bb(rm),cx=(b[0]+b[2])/2,cy=(b[1]+b[3])/2;let n=0;const cnt=()=>ws.reduce((a,w)=>a+(K().EQ.get(w.s.a)||[]).length,0)+(rm.eqp||[]).length,n0=cnt();
 if(todo.includes("eau")){
  if(ty==="cui"){const w=murEvier(ws);if(w)trioEau(w,milieuLibre(w,"fen"),r.evEau,r.evEv,"évier")}
  if(ty==="sdb"){const w=plusLong(ws,w=>!opens(w.s).some(o=>o.o.k==="fenetre"))||ws[0];trioEau(w,milieuLibre(w),r.lavEau,r.lavEv,"lavabo");const d=ws.find(x=>x!==w&&!opens(x.s).some(o=>o.o.k==="porte"))||ws.find(x=>x!==w);if(d){const L=libres(d)[0];const x=L?L[0]+45:60;addOn(d,"mit",x,r.douche,"Mitigeur douche");addOn(d,"ev",x,5,"Évacuation douche (au sol)")}}
  if(ty==="wc"){const w=plusLong(ws,w=>!opens(w.s).length)||plusLong(ws);const x=milieuLibre(w);addOn(w,"ef",x+20,r.wcEau,"Arrivée eau WC");addOn(w,"ev",x,r.wcEv,"Évacuation WC")}
  if(ty==="bua"){const w=plusLong(ws,w=>!opens(w.s).some(o=>o.o.k==="porte"))||plusLong(ws);const x=milieuLibre(w);addOn(w,"ef",x,r.llEau,"Robinet lave-linge");addOn(w,"ev",x+20,r.llEv,"Évacuation lave-linge")}
  rm.eqAuto.eau=1}
 if(todo.includes("el")){
  /* interrupteurs : à côté de chaque porte, côté où il y a le plus de mur */
  const portes=[];ws.forEach(w=>opens(w.s).forEach(o=>{if(o.o.k==="porte")portes.push({w,o})}));const t=portes.length>1?"vv":"int";
  portes.forEach(({w,o})=>{const L=Math.round(K().dist(w.s.a,w.s.b)*100),dr=L-o.x2,gc=o.x1;const x=dr>=gc?o.x2+r.porte:o.x1-r.porte;addOn(w,t,x,r.inter)});
  if(!portes.length&&ws[0])addOn(ws[0],"int",r.coin+30,r.inter);
  /* cuisine : 4 prises au-dessus du plan de travail + plaque 32 A + lave-vaisselle et four */
  if(ty==="cui"){const w=murEvier(ws);if(w){const mk={t:"pc",n:"Prise plan de travail",h:r.ptrav,auto:1},k=repartir([w],4,mk);if(k<4)repartir(ws.filter(x=>x!==w),4-k,mk);repartir([w],1,{t:"p32",n:"Plaque de cuisson 32 A",h:r.p32,auto:1})}
   repartir(ws,1,{t:"pc",n:"Prise lave-vaisselle",h:r.prise,auto:1});repartir(ws,1,{t:"pc",n:"Prise four",h:r.prise,auto:1})}
  if(ty==="bua")repartir(ws,1,{t:"pc",n:"Prise lave-linge",h:r.prise,auto:1});
  const np=nbPrises(ty,m2);if(np)repartir(ws,np,{t:"pc",n:"Prise 16 A",h:ty==="sdb"?r.ptrav:r.prise,auto:1});
  if(ty==="sej"||ty==="ch"||ty==="bur")repartir(ws,1,{t:"rj",n:T.rj.n,h:r.rj,auto:1});
  if(ty==="sej")repartir(ws,1,{t:"tv",n:T.tv.n,h:r.rj,auto:1});
  /* plafond : point lumineux au centre, VMC dans les pièces d'eau, détecteur de fumée (1 par logement, au dégagement) */
  rm.eqp=rm.eqp||[];if(!rm.eqp.some(e=>e.t==="pl"||e.t==="spot"))rm.eqp.push({t:"pl",n:TP.pl.n,x:R5(cx)/100,y:R5(cy)/100,auto:1});
  if(["cui","sdb","wc","bua"].includes(ty)&&!rm.eqp.some(e=>e.t==="vmc"))rm.eqp.push({t:"vmc",n:TP.vmc.n,x:R5(b[0]+(b[2]-b[0])*.75)/100,y:R5(b[1]+(b[3]-b[1])*.25)/100,auto:1});
  const dfOk=K().ST.floors.some(f=>f.rooms.some(x=>(x.eqp||[]).some(e=>e.t==="df"))),circ=K().F().rooms.some(x=>rtype(x.nom)==="circ");
  if(!dfOk&&(ty==="circ"||(!circ&&ty==="sej")))rm.eqp.push({t:"df",n:TP.df.n,x:R5(cx+(ty==="circ"?0:60))/100,y:R5(cy)/100,auto:1});
  rm.eqAuto.el=1}
 n=cnt()-n0;save();return n}

/* Clim réversible : split en haut d'un mur qui donne dehors (sans fenêtre de préférence), liaisons à côté, commande près de l'interrupteur. */
function autoSplit(){const ws=walls(),r=RR();const ext=ws.filter(w=>w.s.kind==="mur"&&!w.s.sh);const w=ext.sort((a,b)=>(opens(a.s).length-opens(b.s).length)||(K().dist(b.s.a,b.s.b)-K().dist(a.s.a,a.s.b)))[0]||plusLong(ws);if(!w)return;snap();
 const x=milieuLibre(w),h=H()-r.splitP-15;addOn(w,"split",x,h);addOn(w,"liai",x+55,h,"Passage des liaisons (vers dehors)");addOn(w,"cond",x-55,h-30,"Évacuation des condensats");
 let ok=false;ws.forEach(v=>{if(ok)return;const i=(K().EQ.get(v.s.a)||[]).find(e=>e.t==="int"||e.t==="vv");if(i){addOn(v,"cmd",i.x+(i.x+40<K().dist(v.s.a,v.s.b)*100?25:-25),r.cmd);ok=true}});
 if(!ok)addOn(w,"cmd",Math.max(30,x-120),r.cmd);V.wi=walls().indexOf(w);V.sel=-1;save()}

/* Spots : 3 façons simples (1 au centre, grille régulière, ligne au milieu). Grille : écart au mur = moitié de l'écart entre spots. */
const SPOTS=[["1 au centre",1,1],["4 en carré",2,2],["6 en grille",3,2],["9 en grille",3,3],["3 en ligne",3,1],["4 en ligne",4,1]];

/* Fin de mur : « Qu'est-ce qui est à faire ici ? » */
const ST3=[["faire","À faire"],["exist","Existe déjà"],["non","Pas besoin"]];
function aDemander(w){return(K().EQ.get(w.s.a)||[]).map((e,i)=>({e,i})).filter(o=>vis(o.e.t)&&!o.e.st)}
function askHTML(){const w=wall(),L=(K().EQ.get(w.s.a)||[]).map((e,i)=>({e,i})).filter(o=>vis(o.e.t)).sort((a,b)=>a.e.x-b.e.x),last=V.wi===walls().length-1;
 return`<div class="pick" role="dialog" aria-label="À faire sur ce mur"><div class="pk-in"><div class="pk-h"><b>Sur ce mur, qu'est-ce qui est à faire ?</b><button class="rd" data-a="askx" aria-label="Fermer">✕</button></div>
 <button class="bt go big" data-a="allfaire" style="width:100%;justify-content:center;margin:4px 0 10px">Tout est à faire${last?"":" · mur suivant ›"}</button>
 <div class="liste">${L.map(({e,i})=>`<div class="it ro ask"><span class="dt ${T[e.t].f}"></span><span class="ak"><b>${esc(e.n||T[e.t].n)}</b><small>${Math.round(e.h)} cm du sol · ${Math.round(e.x)} cm de l'angle</small></span><span class="qk3">${ST3.map(([k,n])=>`<button data-st="${k}" data-i="${i}" aria-pressed="${e.st===k}">${n}</button>`).join("")}</span></div>`).join("")}</div>
 <button class="bt big" data-a="askok" style="width:100%;justify-content:center;margin-top:12px">${last?"C'est bon pour ce mur":"Mur suivant ›"}</button></div></div>`}
function regHTML(){const r=RR();return`<p style="margin:2px 2px 4px;font-weight:800;font-size:16px">Mes règles de pose</p><div class="muted" style="font-size:13.5px;margin-bottom:8px">Utilisées pour pré-remplir chaque pièce. Changez-les une fois pour toutes.</div><div class="regs">${RG.map(([k,n,d,s])=>`<label><span>${esc(n)}<small>${esc(s)}${r[k]!==d?` · d'origine ${d}`:""}</small></span><input data-rg="${k}" inputmode="numeric" value="${r[k]}"> cm</label>`).join("")}</div><div class="note">Minimums de la norme NF C 15-100 appliqués : séjour 1 prise par tranche de 4 m² (au moins 5), chambre 3, cuisine 6 dont 4 au-dessus du plan de travail, 1 point lumineux par pièce, 1 RJ45 par pièce principale, 1 détecteur de fumée par logement.</div><button class="bt go" data-a="reg" style="margin-top:10px">C'est noté</button>`}

/* ---------- Écran ---------- */
const CSS=`
#fx{position:fixed;inset:0;z-index:80;background:var(--bg);color:var(--fg);overflow:auto;-webkit-overflow-scrolling:touch;font:500 15px/1.45 var(--f);padding:max(10px,env(safe-area-inset-top,0px)) 16px calc(28px + env(safe-area-inset-bottom,0px))}
#fx[hidden]{display:none}
html.fx-open,html.fx-open body{overflow:hidden!important}
#fx .in{max-width:980px;margin:0 auto}
#fx .eh{display:flex;align-items:center;gap:10px;margin:2px 0 10px}
#fx .eh .tx{flex:1;min-width:0}#fx .eh b{display:block;font-size:17px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#fx .eh small{color:var(--muted);font-size:13px}
#fx .rd{appearance:none;border:1.5px solid var(--line);background:var(--surface);color:var(--fg);width:44px;height:44px;border-radius:50%;display:grid;place-items:center;font:800 20px var(--f);cursor:pointer;flex:none;padding:0}
#fx .fx-mini{width:62px;height:62px;flex:none;background:var(--surface);border-radius:14px;border:1px solid var(--line)}
#fx .fx-mini .mp{fill:var(--paper);stroke:none}#fx .fx-mini .mw{stroke:var(--muted);stroke-linecap:round;opacity:.55}#fx .fx-mini .mw.clo{stroke-dasharray:.08 .08}#fx .fx-mini .mw.on{stroke:#B8924F;opacity:1}#fx .fx-mini .mhit{stroke:transparent;cursor:pointer}#fx .fx-mini .me{fill:#1B2440;stroke:#1B2440;stroke-linecap:round}
:root[data-theme="dark"] #fx .fx-mini .me{fill:#F2EEE4;stroke:#F2EEE4}
#fx .tabs,#fx .chips,#fx .qk2{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 10px}
#fx .tabs button,#fx .chips button,#fx .qk2 button{appearance:none;border:1.5px solid var(--line);background:var(--surface);color:var(--fg);font:800 14px var(--f);padding:9px 14px;border-radius:999px;cursor:pointer;min-height:42px}
#fx .tabs button[aria-pressed="true"]{background:#1B2440;border-color:#1B2440;color:#fff}
#fx .chips button[aria-pressed="true"],#fx .qk2 button[aria-pressed="true"]{border-color:#1B2440;box-shadow:inset 0 0 0 1.5px #1B2440}
:root[data-theme="dark"] #fx .tabs button[aria-pressed="true"]{background:#F2EEE4;border-color:#F2EEE4;color:#1B2440}
:root[data-theme="dark"] #fx .chips button[aria-pressed="true"],:root[data-theme="dark"] #fx .qk2 button[aria-pressed="true"]{border-color:#F2EEE4;box-shadow:inset 0 0 0 1.5px #F2EEE4}
#fx .elev{background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:8px;touch-action:none}
#fx .elev svg{display:block;width:100%;height:auto;max-height:58vh}
#fx .fond{fill:var(--paper)}#fx .bord{fill:none;stroke:var(--fg);stroke-width:3}#fx .sol{stroke:var(--fg);stroke-width:5}
#fx .ouv{fill:var(--surface);stroke:var(--fg);stroke-width:2}#fx .vit{stroke:var(--muted);stroke-width:1.2}#fx .pg{fill:var(--muted)}
#fx .cl{stroke:var(--muted);stroke-width:1.2;fill:none}#fx .cd{fill:var(--muted)}#fx .cs{stroke:#B8924F;stroke-width:2}
#fx .txt{fill:var(--muted);text-anchor:middle;font-weight:700}#fx .ck{fill:var(--fg);text-anchor:middle;font-weight:800;font-family:var(--mono)}
#fx .pill{fill:#1B2440}#fx .pillt{fill:#fff;text-anchor:middle;font-weight:800;font-family:var(--mono)}
#fx .bx{fill:var(--surface);stroke:var(--fg);stroke-width:1.6}#fx .bx.cl{stroke:#2F7DE1}#fx .bx.ext{stroke-dasharray:5 3}#fx .clp{fill:#2F7DE1}
#fx .pt{fill:var(--fg)}#fx .gl{stroke:var(--fg);stroke-width:1.6;fill:none;stroke-linecap:round}#fx .tt{fill:var(--fg);font-size:9px;font-weight:800;text-anchor:middle}
#fx .ef{fill:#2F7DE1}#fx .ec{fill:#E8590C}
#fx .sym{cursor:grab}#fx .sym .hit{fill:transparent}#fx .sym.on .bx,#fx .sym.on .pf-spot,#fx .sym.on .pf-cl,#fx .sym.on .pf-vmc,#fx .sym.on .pf-df{stroke:#B8924F;stroke-width:3}
#fx .pfond{fill:var(--paper)}#fx .pmur{stroke:var(--fg);stroke-linecap:round}
#fx .pf-spot{fill:var(--surface);stroke:var(--fg);stroke-width:2}#fx .pf-x{stroke:var(--fg);stroke-width:1.6}#fx .pf-pl{fill:var(--fg)}#fx .pf-vmc{fill:var(--surface);stroke:var(--fg);stroke-width:2}
#fx .pf-df{fill:var(--surface);stroke:#E8590C;stroke-width:2}#fx .pf-dft{fill:#E8590C;text-anchor:middle;font-weight:800}#fx .pf-cl{fill:var(--surface);stroke:#2F7DE1;stroke-width:2}
#fx .cons{display:flex;gap:10px;align-items:flex-start;margin:10px 2px 0;color:var(--muted);font-size:14px}#fx .cons i{flex:none;width:8px;height:8px;border-radius:50%;background:#B8924F;margin-top:7px}
#fx .tools{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0 0}
#fx .bt{appearance:none;border:1.5px solid var(--line);background:var(--surface);color:var(--fg);font:800 14.5px var(--f);padding:10px 15px;border-radius:999px;cursor:pointer;min-height:44px;display:inline-flex;align-items:center;gap:6px}
#fx .bt.go{background:#1B2440;border-color:#1B2440;color:#fff}#fx .bt.del{color:#C0392B}
:root[data-theme="dark"] #fx .bt.go{background:#F2EEE4;border-color:#F2EEE4;color:#1B2440}
#fx .num{display:flex;gap:10px;flex-wrap:wrap;margin:12px 0 0}#fx .num label{display:flex;align-items:center;gap:6px;font-weight:700;font-size:14px;background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:6px 10px}
#fx .num input,#fx .clim input{width:76px;font:800 16px var(--mono);border:1.5px solid var(--line);border-radius:10px;padding:6px 8px;background:var(--bg);color:var(--fg)}
#fx h3{font-size:15px;margin:16px 2px 6px}
#fx .liste{display:grid;gap:6px}#fx .it{appearance:none;text-align:left;width:100%;display:flex;gap:10px;align-items:center;border:1px solid var(--line);background:var(--surface);color:var(--fg);border-radius:14px;padding:9px 12px;font:600 14px var(--f);cursor:pointer}
#fx .it.on{border-color:#B8924F;box-shadow:inset 0 0 0 1.5px #B8924F}#fx .it b{display:block;font-weight:800}#fx .it small{color:var(--muted);font-size:12.5px}#fx .it .dt{flex:none;width:12px;height:12px;border-radius:4px;background:var(--muted)}
#fx .it .dt.el{background:#B8924F}#fx .it .dt.eau{background:#2F7DE1}#fx .it .dt.clim{background:#0B8F7C}#fx .it .dt.ouv{background:transparent;border:2px solid var(--fg)}
#fx .add{background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:12px;margin:12px 0 0}#fx .add p{margin:0 0 6px;font-weight:800}#fx .add .qk2{margin-bottom:8px}
#fx .muted{color:var(--muted)}#fx .note{font-size:12.5px;color:var(--muted);margin:6px 2px 0}
#fx .card{background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:12px 14px;margin:0 0 10px}#fx .card p{margin:0 0 8px;font-weight:800}
#fx .met{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:8px;margin:10px 0}
#fx .opt{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;font-weight:800;color:var(--muted);margin-left:auto}
@media (min-width:900px){#fx .grid2{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(280px,1fr);gap:16px;align-items:start}#fx .grid2>div:last-child h3:first-child{margin-top:0}}
#v-face{white-space:nowrap}
#fx .halo{fill:#B8924F;opacity:.2}#fx .sym.st-exist{opacity:.45}#fx .sym.st-exist.on{opacity:.8}
#fx .it .dt.faire{box-shadow:0 0 0 3px rgba(184,146,79,.35)}#fx .it .dt.exist{opacity:.4}
#fx .ask{flex-wrap:wrap}#fx .ak{flex:1 1 150px}#fx .qk3{display:flex;gap:6px;flex-wrap:wrap}#fx .qk3 button{appearance:none;border:1.5px solid var(--line);background:var(--surface);color:var(--fg);font:800 13.5px var(--f);padding:8px 12px;border-radius:999px;cursor:pointer;min-height:40px}
#fx .qk3 button[aria-pressed="true"]{border-color:#B8924F;background:rgba(184,146,79,.14)}#fx .qk3 button[data-st="exist"][aria-pressed="true"]{border-color:var(--muted);background:var(--paper)}#fx .st1{flex:1 1 100%}
#fx .regs{display:grid;gap:6px}#fx .regs label{display:flex;align-items:center;gap:8px;background:var(--bg);border:1px solid var(--line);border-radius:12px;padding:6px 10px;font-weight:700;font-size:14px}#fx .regs label span{flex:1}#fx .regs small{display:block;color:var(--muted);font-weight:600;font-size:12px}#fx .regs input{width:70px;font:800 16px var(--mono);border:1.5px solid var(--line);border-radius:10px;padding:6px 8px;background:var(--surface);color:var(--fg)}
#fx .tile.sm svg{width:54px;height:40px;color:var(--fg)}

#fx .bk{appearance:none;border:1.5px solid var(--line);background:var(--surface);color:var(--fg);font:800 15px var(--f);height:44px;padding:0 14px;border-radius:999px;cursor:pointer;flex:none}
#fx .nav{display:flex;align-items:center;gap:10px;justify-content:space-between;margin:8px 0 0}#fx .nav span{text-align:center;font-weight:800;font-size:14.5px;line-height:1.2}#fx .nav small{display:block;font-weight:600;font-size:12px;color:var(--muted)}
#fx .bar0{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin:12px 0 0}#fx .bar0 .muted{font-size:14px}
#fx .big{min-height:52px;font-size:16.5px;padding:0 24px}
#fx .bar{background:var(--surface);border:1.5px solid #B8924F;border-radius:18px;padding:10px 12px;margin:12px 0 0;display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center}
#fx .bar .nm{flex:1 1 100%;font-size:15.5px}#fx .bar label{display:flex;align-items:center;gap:6px;font-weight:700;font-size:14px}
#fx .bar input{width:74px;font:800 17px var(--mono);border:1.5px solid var(--line);border-radius:10px;padding:7px 8px;background:var(--bg);color:var(--fg)}
#fx .bar .acts{display:flex;gap:8px;flex-wrap:wrap;flex:1 1 100%}#fx .bar .ok{margin-left:auto}
#fx .lien{display:block;appearance:none;border:0;background:none;color:var(--muted);font:700 13px var(--f);text-decoration:underline;margin:12px 2px 0;padding:6px 0;cursor:pointer;text-align:left}
#fx .bt.on{border-color:#1B2440;box-shadow:inset 0 0 0 1.5px #1B2440}:root[data-theme="dark"] #fx .bt.on{border-color:#F2EEE4;box-shadow:inset 0 0 0 1.5px #F2EEE4}
#fx .met .bt{justify-content:flex-start}
#fx .it.ro{cursor:default}
#fx .pick{position:fixed;inset:0;z-index:85;background:rgba(11,18,38,.35);display:flex;align-items:flex-end;justify-content:center}
#fx .pk-in{background:var(--bg);width:100%;max-width:720px;max-height:78vh;overflow:auto;border-radius:22px 22px 0 0;padding:14px 16px calc(18px + env(safe-area-inset-bottom,0px));box-shadow:0 -10px 30px rgba(0,0,0,.18);animation:fxup .22s ease-out}
@keyframes fxup{from{transform:translateY(30px);opacity:.4}to{transform:none;opacity:1}}
#fx .pk-h{display:flex;align-items:center;justify-content:space-between;margin:0 0 6px}#fx .pk-h b{font-size:17px}#fx .pick p{margin:12px 2px 6px;font-weight:800;color:var(--muted);font-size:13px}
#fx .tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(104px,1fr));gap:8px}#fx .tiles.g2{grid-template-columns:repeat(auto-fill,minmax(64px,1fr))}
#fx .tile{appearance:none;border:1.5px solid var(--line);background:var(--surface);color:var(--fg);border-radius:16px;padding:8px 6px 10px;display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;font:700 12.5px/1.2 var(--f);text-align:center;min-height:92px}
#fx .tile svg{width:46px;height:46px}#fx .tile.sm{min-height:48px;justify-content:center;font-size:15px;font-weight:800}
#fx .elev.sl{animation:fxsl .25s ease-out}#fx .elev.sr{animation:fxsr .25s ease-out}
@keyframes fxsl{from{transform:translateX(24px);opacity:.3}to{transform:none;opacity:1}}@keyframes fxsr{from{transform:translateX(-24px);opacity:.3}to{transform:none;opacity:1}}
@media (min-width:900px){#fx .pick{align-items:center}#fx .pk-in{border-radius:22px}}

`;
function ensure(){if($("fx"))return;const st=document.createElement("style");st.textContent=CSS;document.head.appendChild(st);const d=document.createElement("div");d.id="fx";d.hidden=true;d.setAttribute("role","dialog");d.setAttribute("aria-label","Murs de face et plafond");document.body.appendChild(d);
 d.addEventListener("click",onClick);d.addEventListener("change",onChange);d.addEventListener("pointerdown",onDown);d.addEventListener("pointermove",onMove);d.addEventListener("pointerup",onUp);d.addEventListener("pointercancel",onUp)}

function open(o){ensure();const P=K();if(!P)return;const SH=P.SH;let ri=P.ST.ri||0,wi=0,tab="mur";
 if(o&&o.ri!=null)ri=o.ri;else if(SH&&SH.type==="seg"){const sg=P.segs()[SH.x];if(sg){ri=P.F().rooms.indexOf(sg.rm)}}else if(SH&&SH.type==="room")ri=SH.ri;
 if(!P.F().rooms[ri])ri=0;if(!P.F().rooms.length)return;
 V={tab:o&&o.tab||tab,ri,wi:0,sel:-1,pick:null};
 if(SH&&SH.type==="seg"){const sg=P.segs()[SH.x];const k=walls().findIndex(w=>w.s.a===sg.a);if(k>=0)V.wi=k}
 if(o&&o.tab)V.tab=o.tab;
 try{P.closeSheet(true)}catch(e){}
 $("fx").hidden=false;document.documentElement.classList.add("fx-open");render();$("fx").scrollTop=0}
function close(){$("fx").hidden=true;document.documentElement.classList.remove("fx-open");V=null;const P=K();try{P.draw();P.notify()}catch(e){}}
function save(){const P=K();try{P.draw();P.notify()}catch(e){}}
function snap(){try{K().hist()}catch(e){}}

function render(){const d=$("fx"),P=K(),rm=room();if(!rm)return close();const F=fams(),M=metiers();
 if(!M){d.innerHTML=`<div class="in">${head("Vos métiers","Une seule fois : on ne vous propose que ce qui vous concerne",true)}${metHTML(V.metTmp||[])}</div>`;return}
 const W=walls(),w=wall(),tabs=[["mur","Murs"],["plaf","Plafond"]].concat(F.includes("clim")?[["clim","Clim"]]:[]);
 if(V.tab==="clim"&&!F.includes("clim"))V.tab="mur";
 let h=`<div class="in">`;
 if(V.tab==="mur"&&w){const sg=w.s,L=P.dist(sg.a,sg.b);h+=`<div class="eh"><button class="bk" data-a="close" aria-label="Retour au plan">‹ Plan</button><div class="tx"><b>${esc(rm.nom)} · ${esc(wName(sg))}</b><small>${fr(L)} m${sg.kind==="mur"?(sg.sh?" · entre deux pièces":" · donne dehors"):" · cloison"}</small></div>${mini()}</div>`}
 else h+=`<div class="eh"><button class="bk" data-a="close" aria-label="Retour au plan">‹ Plan</button><div class="tx"><b>${esc(rm.nom)}</b><small>${fr(Math.abs(area(rm.pts)))} m²</small></div></div>`;
 h+=`<div class="tabs" role="group" aria-label="Vue">${tabs.map(([k,n])=>`<button data-tab="${k}" aria-pressed="${V.tab===k}">${n}</button>`).join("")}</div>`;
 if(P.F().rooms.length>1&&V.tab!=="mur")h+=`<div class="chips" role="group" aria-label="Pièce">${P.F().rooms.map((r,i)=>`<button data-ri="${i}" aria-pressed="${i===V.ri}">${esc(r.nom)}</button>`).join("")}</div>`;
 if(V.tab!=="clim"&&M.length){const n=autoRoom();if(n)setTimeout(()=>toast(`${n} éléments posés aux hauteurs habituelles. Touchez ceux qui sont à faire.`),50)}
 if(V.tab==="mur")h+=murHTML();else if(V.tab==="plaf")h+=plafHTML();else h+=climHTML();
 h+=V.met?`<div class="card" style="margin-top:14px">${metHTML(M)}</div>`:`<button class="lien" data-a="met">Mes métiers : ${M.length?esc(M.map(k=>(MET.find(m=>m[0]===k)||[,""])[1]).join(", ")):"aucun choisi"}</button>`;
 h+=V.reg?`<div class="card" style="margin-top:10px">${regHTML()}</div>`:(fams().length?`<button class="lien" data-a="reg">Mes règles de pose (hauteurs, distances)</button>`:"");
 d.innerHTML=h+`</div>`+(V.ask&&V.tab==="mur"&&wall()?askHTML():V.pick?pickHTML():"")}
function head(t,s,noBack){return`<div class="eh">${noBack?"":`<button class="bk" data-a="close" aria-label="Retour au plan">‹ Plan</button>`}<div class="tx"><b>${esc(t)}</b><small>${esc(s)}</small></div>${noBack?`<button class="rd" data-a="close" aria-label="Fermer">✕</button>`:""}</div>`}
function area(p){let a=0;for(let i=0;i<p.length;i++){const q=p[(i+1)%p.length];a+=p[i][0]*q[1]-q[0]*p[i][1]}return a/2}
function metHTML(M){return`<p style="margin:4px 2px 6px;font-weight:800;font-size:16px">Quels métiers faites-vous ?</p><div class="muted" style="font-size:14px">Touchez les vôtres. Les prises ne sont proposées qu'aux électriciens, l'eau aux plombiers, la clim aux climaticiens.</div><div class="met">${MET.map(([k,n])=>`<button class="bt${M.includes(k)?" on":""}" data-met="${k}" aria-pressed="${M.includes(k)}">${M.includes(k)?"✓ ":""}${n}</button>`).join("")}</div><button class="bt go big" data-a="metok">C'est noté</button>`}

/* Une seule ligne sous le dessin : l'élément touché (ses 2 cotes à taper, « Encore un », Enlever), sinon le gros bouton Ajouter. */
function barHTML(name,inputs,tp){const e=V.sel>=0;
 if(!fams().length)return`<div class="cons"><i></i><span>Les portes et fenêtres sont affichées. Les prises, l'eau et la clim s'ajoutent pour les électriciens, plombiers et climaticiens (« Mes métiers » en bas).</span></div>`;
 if(e){const it=V.tab==="mur"?eqs(wall().s)[V.sel]:(room().eqp||[])[V.sel];return`<div class="bar"><b class="nm">${esc(name)}</b>${inputs}<div class="qk3 st1"><button data-st="faire" data-i="${V.sel}" aria-pressed="${!!(it&&it.st==="faire")}">${it&&it.st==="faire"?"✓ À faire (dans le devis)":"Déjà en place · touchez pour « à faire »"}</button></div><div class="acts"><button class="bt" data-a="dup">＋ Encore ${esc(un(name))}</button><button class="bt del" data-a="del" aria-label="Enlever">Enlever</button><button class="bt ok" data-a="desel">OK</button></div></div>`}
 return`<div class="cons"><i></i><span><b>Touchez ce qui est à faire</b> : il s'allume et part dans le devis. Ce qui reste pâle est déjà en place.</span></div><div class="bar0"><button class="bt go big" data-a="add">＋ Ajouter</button><button class="bt" data-a="allfaire">Tout est à faire ici</button></div><div class="note">Pour ajouter : touchez ${tp} à un endroit vide.${V.tab==="mur"?" Pour déplacer : glissez à gauche ou à droite.":" Pour déplacer : glissez."}</div>`}
const un=n=>/^(Prise|Arrivée|Évacuation|Applique|Bouche|Grille|Cassette|Unité|Commande)/.test(n)?"une":"un";
function murHTML(){const w=wall();if(!w)return`<p class="muted">Cette pièce n'a pas encore de murs.</p>`;const sg=w.s,E=eqs(sg),O=opens(sg),e=V.sel>=0?E[V.sel]:null,W=walls();
 let h=`<div class="grid2"><div><div class="elev">${svgMur()}</div><div class="nav"><button class="rd" data-a="prev" aria-label="Mur précédent">‹</button><span>Mur ${V.wi+1} sur ${W.length}<small>glissez le doigt sur le mur pour changer</small></span><button class="rd" data-a="next" aria-label="Mur suivant">›</button></div>`;
 h+=barHTML(e?(e.n||T[e.t].n):"",e?`<label>du sol <input data-n="h" inputmode="numeric" value="${Math.round(e.h)}"> cm</label><label>de l'angle gauche <input data-n="x" inputmode="numeric" value="${Math.round(e.x)}"> cm</label>`:"","le mur");
 h+=`</div><div>`;
 const L=[];O.forEach(o=>L.push({x:o.x1,h:`<div class="it ro"><span class="dt ouv"></span><span><b>${esc(o.nm)} ${Math.round(o.x2-o.x1)} × ${o.h}</b><small>${o.al?"allège "+o.al+" cm · ":""}à ${Math.round(o.x1)} cm de l'angle gauche</small></span></div>`}));
 E.forEach((x,i)=>{if(!vis(x.t))return;L.push({x:x.x,h:`<button class="it${i===V.sel?" on":""}" data-sel="${i}"><span class="dt ${T[x.t].f}${x.st?" "+x.st:""}"></span><span><b>${esc(x.n||T[x.t].n)}</b><small>${x.st==="faire"?"<b style=\"display:inline;color:#B8924F\">À faire</b>":"Déjà en place"} · ${Math.round(x.h)} cm du sol · ${Math.round(x.x)} cm de l'angle</small></span></button>`})});
 L.sort((a,b)=>a.x-b.x);
 h+=`<h3>Sur ce mur, de gauche à droite</h3><div class="liste">${L.length?L.map(o=>o.h).join(""):`<div class="muted" style="padding:6px 2px">Rien pour l'instant.</div>`}</div>`;
 const all=W.reduce((a,w)=>{(K().EQ.get(w.s.a)||[]).forEach(x=>{if(vis(x.t))a[x.t]=(a[x.t]||0)+1});return a},{});
 if(Object.keys(all).length)h+=`<div class="note">Dans toute la pièce : ${Object.keys(all).map(k=>`${all[k]} × ${esc(T[k].n.toLowerCase())}`).join(" · ")}</div>`;
 return h+`</div></div>`}

/* Choix de l'élément : grandes tuiles avec le dessin, sans menus. */
function icoMur(t){const d=T[t],m=Math.max(46,(d.w||0)+10,(d.hh||0)+10),hh=H();return`<svg viewBox="${-m/2} ${hh-d.h-m/2} ${m} ${m}" aria-hidden="true">${sym({t,x:0,h:d.h},-1,14,false)}</svg>`}
function icoPlaf(t){return`<svg viewBox="-36 -36 72 72" aria-hidden="true">${symPlaf(t,0,0,1)}</svg>`}
function pickHTML(){const F=fams(),mur=V.tab==="mur",TT=mur?T:TP,keys=Object.keys(TT).filter(k=>F.includes(TT[k].f)&&!(mur&&k==="ge"&&wall()&&wall().s.sh));const g={};keys.forEach(k=>{(g[TT[k].f]=g[TT[k].f]||[]).push(k)});const G=Object.keys(g);
 return`<div class="pick" role="dialog" aria-label="Que posez-vous ?"><div class="pk-in"><div class="pk-h"><b>${V.pick.at?"Que posez-vous ici ?":"Que posez-vous ?"}</b><button class="rd" data-a="pickx" aria-label="Fermer">✕</button></div>${G.map(f=>`${G.length>1?`<p>${FAM[f]}</p>`:""}<div class="tiles">${g[f].map(k=>`<button class="tile" data-put="${k}">${mur?icoMur(k):icoPlaf(k)}<span>${esc(TT[k].n)}</span></button>`).join("")}</div>`).join("")}${!mur&&F.includes("el")?`<p>Spots : bien répartis d'un coup</p><div class="tiles">${SPOTS.map(([t,c,r])=>`<button class="tile sm" data-grid="${c} × ${r}">${spotIco(c,r)}<span>${t}</span></button>`).join("")}</div>`:""}</div></div>`}

function plafHTML(){const rm=room(),E=rm.eqp||[],e=V.sel>=0?E[V.sel]:null,b=bb(rm);
 let h=`<div class="grid2"><div><div class="elev">${svgPlaf()}</div>`;
 h+=barHTML(e?(e.n||TP[e.t].n):"",e?`<label>du mur de gauche <input data-n="px" inputmode="numeric" value="${Math.round(e.x*100-b[0])}"> cm</label><label>du mur du haut <input data-n="py" inputmode="numeric" value="${Math.round(e.y*100-b[1])}"> cm</label>`:"","le plafond");
 h+=`</div><div><h3>Au plafond</h3><div class="liste">`;const L=E.map((x,i)=>({x,i})).filter(o=>vis(o.x.t));
 h+=L.length?L.map(({x,i})=>`<button class="it${i===V.sel?" on":""}" data-sel="${i}"><span class="dt ${TP[x.t].f}${x.st?" "+x.st:""}"></span><span><b>${esc(x.n||TP[x.t].n)}</b><small>${x.st==="faire"?"<b style=\"display:inline;color:#B8924F\">À faire</b>":"Déjà en place"} · ${Math.round(x.x*100-b[0])} cm du mur de gauche · ${Math.round(x.y*100-b[1])} cm du mur du haut</small></span></button>`).join(""):`<div class="muted" style="padding:6px 2px">Rien pour l'instant.</div>`;
 h+=`</div>`;const n=L.reduce((a,o)=>(a[o.x.t]=(a[o.x.t]||0)+1,a),{});if(L.length)h+=`<div class="note">${Object.keys(n).map(k=>`${n[k]} × ${esc(TP[k].n.toLowerCase())}`).join(" · ")}</div>`;
 return h+`</div></div>`}
function spotIco(c,r){let s=`<svg viewBox="0 0 60 44" aria-hidden="true"><rect x="2" y="2" width="56" height="40" rx="3" fill="none" stroke="currentColor" stroke-width="2"/>`;for(let j=0;j<r;j++)for(let i=0;i<c;i++)s+=`<circle cx="${2+56*(i+.5)/c}" cy="${2+40*(j+.5)/r}" r="3.6" fill="currentColor"/>`;return s+"</svg>"}
function bb(rm){const xs=rm.pts.map(p=>p[0]*100),ys=rm.pts.map(p=>p[1]*100);return[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)]}

/* Climatisation : une question à la fois, la suivante apparaît après la réponse. Aucun chiffre inventé. */
const CLT=["Aucune","Réversible murale","Gainable","Cassette au plafond","Je ne sais pas"];
function climHTML(){const rm=room(),c=rm.clim||{},q=(k,lab,opts)=>`<div class="card"><p>${lab}</p><div class="qk2">${opts.map(v=>`<button data-cl="${k}" data-v="${esc(v)}" aria-pressed="${(c[k]||"")===v}">${esc(v)}</button>`).join("")}</div></div>`;
 let h=q("type","Quelle clim dans cette pièce ?",CLT);if(!c.type||c.type==="Aucune"||c.type==="Je ne sais pas")return h;
 const cnt=t=>walls().reduce((a,w)=>a+(K().EQ.get(w.s.a)||[]).filter(x=>x.t===t).length,0),cntP=t=>(rm.eqp||[]).filter(x=>x.t===t).length;
 if(c.type==="Réversible murale"){const n=cnt("split");h+=`<div class="card"><p>Unité intérieure</p>${n?`<div class="muted" style="margin-bottom:8px">✓ Placée sur le mur.</div>`:""}<button class="bt go big" data-a="putsplit">${n?"Voir sur le mur":"Placer sur un mur"}</button></div>`;if(!n)return h}
 if(c.type==="Gainable"){h+=q("ug","L'unité gainable sera dans…",["Les combles","Le faux plafond","Un placard technique","Je ne sais pas"]);if(!c.ug)return h;const s=cntP("souf"),r=cntP("rep");
  h+=`<div class="card"><p>Bouches au plafond</p>${s+r?`<div class="muted" style="margin-bottom:8px">✓ ${s} de soufflage · ${r} de reprise</div>`:""}<button class="bt go big" data-a="putsouf">${s+r?"Voir au plafond":"Placer au plafond"}</button></div>`;if(!(s+r))return h}
 if(c.type==="Cassette au plafond"){const n=cntP("cas");h+=`<div class="card"><p>Cassette</p>${n?`<div class="muted" style="margin-bottom:8px">✓ Placée au plafond.</div>`:""}<button class="bt go big" data-a="putcas">${n?"Voir au plafond":"Placer au plafond"}</button></div>`;if(!n)return h}
 h+=q("ge","Groupe extérieur",["Au sol","Sur console au mur","Sur le toit","Déjà en place","Je ne sais pas"]);if(!c.ge)return h;
 h+=`<div class="card"><p>À relever sur place (facultatif)</p><div class="num"><label>Puissance <input data-cn="kw" inputmode="decimal" value="${esc(c.kw||"")}"> kW</label><label>Liaisons <input data-cn="liais" inputmode="decimal" value="${esc(c.liais||"")}"> m</label></div><div class="note">Vide = noté « à vérifier ».</div></div><div class="note" style="margin-top:10px">✓ C'est tout pour cette pièce.</div>`;
 return h}

/* ---------- Actions ---------- */
function onClick(ev){if(V&&V.pick&&ev.target.classList&&ev.target.classList.contains("pick")){V.pick=null;return render()}const b=ev.target.closest("button,[data-w]");if(!b||!V)return;const d=b.dataset,P=K();
 if(d.st){const i=+d.i,it=V.tab==="mur"?eqs(wall().s)[i]:(room().eqp||[])[i];if(!it)return;snap();if(d.st==="non"){if(V.tab==="mur")eqs(wall().s).splice(i,1);else room().eqp.splice(i,1);V.sel=-1}else it.st=it.st===d.st?undefined:d.st;save();return render()}
 if(d.put){const at=V.pick&&V.pick.at;V.pick=null;return put(d.put,at)}
 if(d.grid){V.pick=null;return grid(d.grid)}
 if(d.w!=null){V.wi=+d.w;V.sel=-1;return render()}
 if(d.tab){V.tab=d.tab;V.sel=-1;V.pick=null;return render()}
 if(d.ri!=null){V.ri=+d.ri;V.wi=0;V.sel=-1;return render()}
 if(d.sel!=null){V.sel=V.sel===+d.sel?-1:+d.sel;render();focusBar();return}
 if(d.met){const has=!!metiers(),L=has?metiers().slice():(V.metTmp=V.metTmp||[]);const i=L.indexOf(d.met);if(i>=0)L.splice(i,1);else L.push(d.met);if(has)setMetiers(L);return render()}
 if(d.cl){snap();const rm=room();rm.clim={...(rm.clim||{}),[d.cl]:d.v};save();render();const c=$("fx").querySelectorAll(".card");const z=c[c.length-1];if(z)z.scrollIntoView({behavior:"smooth",block:"nearest"});return}
 const a=d.a;if(!a)return;
 if(a==="close")return close();
 if(a==="pickx"){V.pick=null;return render()}
 if(a==="askx"){V.ask=false;return render()}
 if(a==="allfaire"){snap();const L=V.tab==="mur"?(K().EQ.get(wall().s.a)||[]):(room().eqp||[]),all=L.filter(e=>vis(e.t)).every(e=>e.st==="faire");L.forEach(e=>{if(vis(e.t))e.st=all?undefined:"faire"});save();render();toast(all?"Tout remis « déjà en place »":"Tout est à faire ici");return}
 if(a==="reg"){V.reg=!V.reg;render();if(V.reg)setTimeout(()=>{const c=$("fx").querySelector(".regs");c&&c.scrollIntoView({behavior:"smooth",block:"start"})},30);return}
 if(a==="met"){V.met=!V.met;render();if(V.met)setTimeout(()=>{const c=$("fx").querySelector(".card:last-of-type");c&&c.scrollIntoView({behavior:"smooth",block:"center"})},30);return}
 if(a==="metok"){if(!metiers())setMetiers(V.metTmp||[]);V.met=false;return render()}
 if(a==="desel"){V.sel=-1;return render()}
 if(a==="prev"||a==="next")return go(a==="next"?1:-1);
 if(a==="add"){V.pick={};return render()}
 if(a==="putsplit"){V.tab="mur";const k=walls().findIndex(w=>(P.EQ.get(w.s.a)||[]).some(x=>x.t==="split"));if(k>=0){V.wi=k;V.sel=(P.EQ.get(walls()[k].s.a)||[]).findIndex(x=>x.t==="split");return render()}autoSplit();render();toast("Split posé en haut d'un mur qui donne dehors, commande près de l'interrupteur");return}
 if(a==="putsouf"||a==="putcas"){V.tab="plaf";const t=a==="putsouf"?"souf":"cas";if((room().eqp||[]).some(x=>x.t===t||x.t==="rep")){V.sel=-1;return render()}put(t);return}
 if(V.tab==="mur"){const w=wall();if(!w)return;const E=eqs(w.s),e=E[V.sel];if(!e)return;snap();
  if(a==="dup"){const L=Math.round(P.dist(w.s.a,w.s.b)*100),fs=Math.max(15,(L+160)/34),st=R5(Math.max(40,((T[e.t]||{}).w||(e.t==="pc2"?30:18)*Math.max(1,fs/14))+20));let x=e.x+st;if(x>L-5)x=e.x-st;E.push({...e,x:Math.max(5,Math.min(L-5,R5(x)))});V.sel=E.length-1}
  if(a==="del"){E.splice(V.sel,1);V.sel=-1;if(!E.length)P.EQ.delete(w.s.a)}
  save();return render()}
 if(V.tab==="plaf"){const rm=room(),E=rm.eqp||[],e=E[V.sel];if(!e)return;snap();const b=bb(rm);
  if(a==="dup"){let x=e.x*100+60;if(x>b[2]-10)x=e.x*100-60;E.push({...e,x:R5(x)/100});V.sel=E.length-1}
  if(a==="del"){E.splice(V.sel,1);V.sel=-1}
  save();return render()}}
function focusBar(){const b=$("fx").querySelector(".bar");if(b&&b.getBoundingClientRect().bottom>innerHeight)b.scrollIntoView({behavior:"smooth",block:"nearest"})}
function go(d,force){const n=walls().length;if(n<2)return;V.wi=(V.wi+d+n)%n;V.sel=-1;V.pick=null;render();const el=$("fx").querySelector(".elev");if(el){el.classList.add(d>0?"sl":"sr");setTimeout(()=>el.classList.remove("sl","sr"),260)}}
/* Pose : à l'endroit touché (hauteur habituelle de l'élément), sinon au milieu sur une place libre. */
function put(t,at){const P=K();snap();
 if(V.tab==="mur"){const w=wall();if(!w)return;const L=Math.round(P.dist(w.s.a,w.s.b)*100),E=eqs(w.s),h=Math.min(H()-10,hdef(t));let x;
  if(at)x=R5(at.x);else{x=R5(L/2);for(let k=0;k<12&&E.some(e=>Math.abs(e.x-x)<25&&Math.abs(e.h-h)<25);k++)x=R5(L/2+(k%2?-1:1)*30*Math.ceil((k+1)/2))}
  E.push({t,n:T[t].n,x:Math.max(5,Math.min(L-5,x)),h,st:"faire"});V.sel=E.length-1}
 else{const rm=room(),b=bb(rm);rm.eqp=rm.eqp||[];const x=at?R5(at.x):R5((b[0]+b[2])/2),y=at?R5(at.y):R5((b[1]+b[3])/2);rm.eqp.push({t,n:TP[t].n,x:x/100,y:y/100,st:"faire"});V.sel=rm.eqp.length-1}
 save();render();focusBar();toast(at?"Posé. Glissez-le pour ajuster.":"Posé : glissez-le à sa place")}
function grid(txt){const [c,r]=txt.split("×").map(v=>parseInt(v,10)),rm=room(),b=bb(rm),w=b[2]-b[0],h=b[3]-b[1];snap();rm.eqp=(rm.eqp||[]).filter(x=>x.t!=="spot"&&x.t!=="pl");
 for(let j=0;j<r;j++)for(let i=0;i<c;i++)rm.eqp.push({t:c*r===1?"pl":"spot",n:c*r===1?TP.pl.n:TP.spot.n,x:R5(b[0]+w*(i+.5)/c)/100,y:R5(b[1]+h*(j+.5)/r)/100,st:"faire"});
 V.sel=-1;save();render();toast(c*r===1?"Lumière au centre de la pièce":`${c*r} spots répartis régulièrement`)}
function onChange(ev){const i=ev.target;if(!V)return;
 if(i.dataset.cn){snap();const rm=room();rm.clim={...(rm.clim||{}),[i.dataset.cn]:i.value.trim()};save();return}
 if(i.dataset.rg){const k=i.dataset.rg,v=parseFloat(String(i.value).replace(",","."));const d=(RG.find(r=>r[0]===k)||[])[2];setRR(k,isFinite(v)&&v!==d?Math.round(v):null);return render()}
 const n=i.dataset.n;if(!n)return;const v=parseFloat(String(i.value).replace(",","."));if(!isFinite(v))return render();snap();
 if(V.tab==="mur"){const w=wall(),e=eqs(w.s)[V.sel];if(!e)return;const L=Math.round(K().dist(w.s.a,w.s.b)*100);if(n==="h")e.h=Math.max(0,Math.min(H(),v));if(n==="x")e.x=Math.max(0,Math.min(L,v))}
 else{const rm=room(),e=(rm.eqp||[])[V.sel],b=bb(rm);if(!e)return;if(n==="px")e.x=Math.max(b[0],Math.min(b[2],b[0]+v))/100;if(n==="py")e.y=Math.max(b[1],Math.min(b[3],b[1]+v))/100}
 save();render()}

/* Doigt : sur un élément = le glisser (pas de 5 cm) ; sur le mur vide = toucher pour poser, glisser à gauche/droite = mur suivant. */
let DR=null,BG=null;
function svgPt(svg,e){const pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;return pt.matrixTransform(svg.getScreenCTM().inverse())}
function onDown(ev){if(!V||ev.target.closest(".pick"))return;const g=ev.target.closest(".sym");if(!g){const svg=ev.target.closest("#fx-esvg,#fx-psvg");BG=svg?{svg,x0:ev.clientX,y0:ev.clientY,id:ev.pointerId}:null;return}const svg=g.ownerSVGElement;const i=+g.dataset.i;V.sel=i;DR={i,svg,id:ev.pointerId,moved:false,x0:ev.clientX,y0:ev.clientY};try{svg.setPointerCapture(ev.pointerId)}catch(e){}ev.preventDefault();svg.querySelectorAll(".sym").forEach(s=>s.classList.toggle("on",+s.dataset.i===i))}
function onMove(ev){if(!DR||ev.pointerId!==DR.id)return;if(!DR.moved&&Math.hypot(ev.clientX-DR.x0,ev.clientY-DR.y0)<4)return;if(!DR.moved){DR.moved=true;snap()}const Pt=svgPt(DR.svg,ev),P=K();
 if(V.tab==="mur"){const w=wall(),e=eqs(w.s)[DR.i],L=Math.round(P.dist(w.s.a,w.s.b)*100);e.x=Math.max(5,Math.min(L-5,R5(Pt.x)));/* hauteur fixée par la règle : on glisse seulement à l'horizontale (Cyril) */const el=$("fx").querySelector(".elev");el.innerHTML=svgMur();DR.svg=$("fx-esvg");try{DR.svg.setPointerCapture(DR.id)}catch(e){}}
 else{const rm=room(),e=rm.eqp[DR.i],b=bb(rm);e.x=Math.max(b[0],Math.min(b[2],b[0]+R5(Pt.x-b[0])))/100;e.y=Math.max(b[1],Math.min(b[3],b[1]+R5(Pt.y-b[1])))/100;const el=$("fx").querySelector(".elev");el.innerHTML=svgPlaf();DR.svg=$("fx-psvg");try{DR.svg.setPointerCapture(DR.id)}catch(e){}}}
function onUp(ev){if(DR){const m=DR.moved,i=DR.i;DR=null;if(!m){/* un toucher = à faire / déjà en place (Cyril 17/11) */const it=V.tab==="mur"?eqs(wall().s)[i]:(room().eqp||[])[i];if(it){snap();it.st=it.st==="faire"?undefined:"faire"}V.sel=i}save();render();return}
 if(!BG||ev.pointerId!==BG.id)return;const B=BG;BG=null;const dx=ev.clientX-B.x0,dy=ev.clientY-B.y0;
 if(V.tab==="mur"&&Math.abs(dx)>60&&Math.abs(dx)>2*Math.abs(dy))return go(dx<0?1:-1);
 if(Math.hypot(dx,dy)>10)return;
 if(V.sel>=0){V.sel=-1;return render()}
 if(!fams().length)return;const Pt=svgPt(B.svg,ev);
 if(V.tab==="mur"){const w=wall(),L=Math.round(K().dist(w.s.a,w.s.b)*100);if(Pt.x<0||Pt.x>L||Pt.y<0||Pt.y>H())return;V.pick={at:{x:Pt.x}}}
 else if(V.tab==="plaf"){const b=bb(room());if(Pt.x<b[0]||Pt.x>b[2]||Pt.y<b[1]||Pt.y>b[3])return;V.pick={at:{x:Pt.x,y:Pt.y}}}
 render()}

function toast(t){let d=$("fx-toast");if(!d){d=document.createElement("div");d.id="fx-toast";d.style.cssText="position:fixed;left:50%;top:calc(14px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:90;background:#1B2440;color:#fff;font:800 14px var(--f);padding:11px 16px;border-radius:999px;box-shadow:0 8px 24px rgba(0,0,0,.2);max-width:90vw;text-align:center";document.body.appendChild(d)}d.textContent=t;d.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>{d.hidden=true},2600)}

/* ---------- Entrées : bouton « De face » en haut du plan + boutons dans les fiches mur et pièce ---------- */
function boot(){const P=K();if(!P||P.CL)return;chip();const r=$("rooms");if(r&&!r._fx){r._fx=1;new MutationObserver(()=>chip()).observe(r,{childList:true})}
 const body=$("sh-body");if(body&&!body._fx){body._fx=1;new MutationObserver(()=>inject()).observe(body,{childList:true})}}
/* Bouton « Murs et plafond » au bout de la ligne des pièces (visible sur téléphone comme sur iPad). */
function chip(){const r=$("rooms");if(!r||r.querySelector("#v-face")||!K().F().rooms.length)return;const ref=[...r.querySelectorAll("button")].pop();const b=document.createElement("button");b.id="v-face";b.type="button";b.className=ref?ref.className.replace(/\b(on|active)\b/g,""):"chip";b.textContent="▦ Murs et plafond";b.title="Murs vus de face, plafond, climatisation";b.addEventListener("click",e=>{e.stopPropagation();open()});r.appendChild(b)}
function inject(){const P=K(),SH=P&&P.SH,body=$("sh-body");if(!SH||!body||body.querySelector(".fx-in"))return;if(SH.type!=="seg"&&!(SH.type==="room"&&!SH.z))return;
 const d=document.createElement("div");d.className="fx-in";d.style.cssText="display:flex;gap:8px;flex-wrap:wrap;margin:0 0 10px";
 const mk=(t,o)=>{const b=document.createElement("button");b.type="button";b.className="btn";b.style.cssText="width:auto;flex:1 1 auto;font-size:14.5px;padding:10px 14px;min-height:44px";b.textContent=t;b.addEventListener("click",e=>{e.stopPropagation();open(o)});return b};
 if(SH.type==="seg")d.appendChild(mk("Voir ce mur de face",{tab:"mur"}));else{d.appendChild(mk("Voir les murs de face",{tab:"mur",ri:SH.ri}));d.appendChild(mk("Voir le plafond",{tab:"plaf",ri:SH.ri}));if(fams().includes("clim"))d.appendChild(mk("Climatisation",{tab:"clim",ri:SH.ri}))}
 const h=body.querySelector(".sh-h");if(h&&h.nextSibling)body.insertBefore(d,h.nextSibling);else body.prepend(d)}
addEventListener("keydown",e=>{if(e.key==="Escape"&&V)close()});
function wait(n){if(K())return boot();if(n>80)return;setTimeout(()=>wait(n+1),100)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>wait(0));else wait(0);
window.PKFACES={open,close,metiers,setMetiers};
})();
