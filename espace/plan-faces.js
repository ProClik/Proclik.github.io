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
 pc:{n:"Prise 16 A",h:30,f:"el"},pc2:{n:"Prise double",h:30,f:"el"},pc3:{n:"Prise triple",h:30,f:"el"},pc4:{n:"Prise quadruple",h:30,f:"el"},plq:{n:"Plaque composée",h:30,f:"el",hide:1},p32:{n:"Prise 32 A (plaque)",h:15,f:"el"},
 tv:{n:"Prise TV",h:30,f:"el"},rj:{n:"Prise internet (RJ45)",h:30,f:"el"},
 int:{n:"Interrupteur",h:110,f:"el"},vv:{n:"Va-et-vient",h:110,f:"el"},app:{n:"Applique",h:180,f:"el"},
 iph:{n:"Interphone",h:150,f:"el"},tab:{n:"Tableau électrique",h:160,f:"el",w:60,hh:80},vmcm:{n:"Bouche VMC (mur)",h:220,f:"el"},
 ef:{n:"Arrivée eau froide",h:55,f:"eau"},ec:{n:"Arrivée eau chaude",h:55,f:"eau"},ev:{n:"Évacuation",h:40,f:"eau"},mit:{n:"Mitigeur douche",h:110,f:"eau"},
 nour:{n:"Nourrice (départ de l'eau)",h:40,f:"eau"},cee:{n:"Chauffe-eau",h:150,f:"eau",w:50,hh:80},rad:{n:"Radiateur",h:45,f:"eau",w:80,hh:55},ss:{n:"Sèche-serviettes",h:110,f:"eau",w:50,hh:120},
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
/* Plaques vues de face, carrées aux angles adoucis, comme les plaques posées en France (1, 2 ou 3 postes) */
const pl=(x,y,n)=>`<rect class="bx" x="${x-9*n}" y="${y-9}" width="${18*n}" height="18" rx="4"/>${n>1?Array.from({length:n-1},(_,k)=>`<line class="gl sep" x1="${x-9*n+18*(k+1)}" y1="${y-6}" x2="${x-9*n+18*(k+1)}" y2="${y+6}"/>`).join(""):""}`;
const sock=(x,y)=>`<circle class="gl" cx="${x}" cy="${y}" r="5.2"/><circle class="pt" cx="${x-2.3}" cy="${y+.8}" r="1.15"/><circle class="pt" cx="${x+2.3}" cy="${y+.8}" r="1.15"/><circle class="pt" cx="${x}" cy="${y-2.6}" r=".8"/>`;
/* Un poste d'une plaque (mécanisme vu de face) */
const MG={pc:sock,
 int:(x,y)=>`<rect class="gl" x="${x-4.5}" y="${y-5.5}" width="9" height="11" rx="1.6"/><line class="gl" x1="${x-4.5}" y1="${y}" x2="${x+4.5}" y2="${y}"/>`,
 vv:(x,y)=>`<rect class="gl" x="${x-4.5}" y="${y-5.5}" width="9" height="11" rx="1.6"/><path class="gl" d="M${x-2} ${y-2.2}l2-1.6l2 1.6M${x-2} ${y+2.2}l2 1.6l2-1.6"/>`,
 rj:(x,y)=>`<path class="gl" d="M${x-4} ${y-3}h8v4h-2v2h-4v-2h-2z"/>`,
 tv:(x,y)=>`<circle class="gl" cx="${x}" cy="${y}" r="4.2"/><circle class="pt" cx="${x}" cy="${y}" r="1.4"/>`};
/* Postes d'un élément « à plaque » (Cyril 17/11 : plaque + mécanismes pour le devis) ; null si ce n'est pas un élément à plaque */
const PC=["pc","pc2","pc3","pc4"];
function mods(e){if(!e)return null;const k=PC.indexOf(e.t);if(k>=0)return Array(k+1).fill("pc");if(e.t==="plq")return(e.m||["pc"]).slice();return MG[e.t]?[e.t]:null}
const MN={pc:["prise","prises"],int:["interrupteur","interrupteurs"],vv:["va-et-vient","va-et-vient"],rj:["RJ45","RJ45"],tv:["prise TV","prises TV"]};
function plqName(m){const c={};m.forEach(t=>c[t]=(c[t]||0)+1);return"Plaque "+m.length+" postes : "+Object.keys(c).map(t=>(c[t]>1?c[t]+" ":"")+MN[t][c[t]>1?1:0]).join(" + ")}
function setMods(e,m){m=m.slice(0,4);if(m.every(t=>t==="pc"))e.t=PC[m.length-1];else if(m.length===1)e.t=m[0];else e.t="plq";if(e.t==="plq"){e.m=m;e.n=plqName(m)}else{delete e.m;e.n=T[e.t].n}return e}
/* Pour le devis : la plaque de finition + un mécanisme par poste */
const MECA={pc:"Prise 16 A 2P+T",int:"Interrupteur simple allumage",vv:"Interrupteur va-et-vient",rj:"Prise RJ45",tv:"Prise TV"};
function compo(e){const m=mods(e);if(!m)return null;const c={};m.forEach(t=>c[MECA[t]]=(c[MECA[t]]||0)+1);return{plaque:"Plaque de finition "+m.length+" poste"+(m.length>1?"s":""),postes:m.length,mecanismes:Object.keys(c).map(n=>({n,q:c[n]}))}}
function sym(e,i,fs,sel){const x=e.x,y=H()-e.h;let g="";const M=mods(e);
 if(M){g=pl(x,y,M.length)+M.map((t,k)=>MG[t](x-9*M.length+9+18*k,y)).join("")}
 else switch(e.t){
  case"p32":g=`<rect class="bx" x="${x-11}" y="${y-11}" width="22" height="22" rx="4.5"/><circle class="gl" cx="${x}" cy="${y}" r="7"/><circle class="pt" cx="${x-3.3}" cy="${y+2}" r="1.3"/><circle class="pt" cx="${x+3.3}" cy="${y+2}" r="1.3"/><circle class="pt" cx="${x}" cy="${y-3.4}" r="1.3"/>`;break;
  case"app":g=pl(x,y,1)+`<line class="gl" x1="${x-4}" y1="${y-4}" x2="${x+4}" y2="${y+4}"/><line class="gl" x1="${x+4}" y1="${y-4}" x2="${x-4}" y2="${y+4}"/>`;break;
  case"iph":g=`<rect class="bx" x="${x-8}" y="${y-12}" width="16" height="24" rx="3.5"/>${[-6,-3.5,-1].map(k=>`<line class="gl" x1="${x-3.5}" y1="${y+k}" x2="${x+3.5}" y2="${y+k}"/>`).join("")}<rect class="gl" x="${x-3}" y="${y+4}" width="6" height="4" rx="1"/>`;break;
  case"tab":g=`<rect class="bx" x="${x-30}" y="${y-40}" width="60" height="80" rx="5"/>${[-22,-2,18].map(k=>`<rect class="gl" x="${x-24}" y="${y+k}" width="48" height="10" rx="1.5"/>`).join("")}`;break;
  case"vmcm":g=`<rect class="bx" x="${x-10}" y="${y-10}" width="20" height="20" rx="4"/><circle class="gl" cx="${x}" cy="${y}" r="6"/><circle class="gl" cx="${x}" cy="${y}" r="2.5"/>`;break;
  case"ef":case"ec":g=`<rect class="bx" x="${x-8}" y="${y-8}" width="16" height="16" rx="3.5"/><circle class="${e.t}" cx="${x}" cy="${y}" r="4.2"/>`;break;
  case"mit":g=`<rect class="bx" x="${x-12}" y="${y-8}" width="24" height="16" rx="3.5"/><circle class="ec" cx="${x-5.5}" cy="${y}" r="3.2"/><circle class="ef" cx="${x+5.5}" cy="${y}" r="3.2"/><line class="gl" x1="${x-2}" y1="${y}" x2="${x+2}" y2="${y}"/>`;break;
  case"ev":g=`<rect class="bx" x="${x-9}" y="${y-9}" width="18" height="18" rx="4"/><circle class="gl" cx="${x}" cy="${y}" r="5.5"/><circle class="pt" cx="${x}" cy="${y}" r="1.8"/>`;break;
  case"nour":g=`<rect class="bx" x="${x-14}" y="${y-9}" width="28" height="18" rx="4"/>${[-8,0,8].map(k=>`<circle class="ef" cx="${x+k}" cy="${y-3.4}" r="2.3"/><circle class="ec" cx="${x+k}" cy="${y+3.6}" r="2.3"/>`).join("")}`;break;
  case"cee":g=`<rect class="bx" x="${x-25}" y="${y-40}" width="50" height="80" rx="20"/><circle class="ec" cx="${x}" cy="${y+22}" r="5"/><line class="gl sep" x1="${x-16}" y1="${y-24}" x2="${x+16}" y2="${y-24}"/>`;break;
  case"rad":g=`<rect class="bx" x="${x-40}" y="${y-27}" width="80" height="55" rx="6"/>${[-27,-18,-9,0,9,18,27].map(k=>`<line class="gl sep" x1="${x+k}" y1="${y-20}" x2="${x+k}" y2="${y+20}"/>`).join("")}`;break;
  case"ss":g=`<rect class="bx" x="${x-25}" y="${y-60}" width="50" height="120" rx="6"/>${[-48,-36,-24,-12,0,12,24,36,48].map(k=>`<line class="gl sep" x1="${x-19}" y1="${y+k}" x2="${x+19}" y2="${y+k}"/>`).join("")}`;break;
  case"split":g=`<rect class="bx cl" x="${x-45}" y="${y-15}" width="90" height="30" rx="7"/><line class="gl" x1="${x-36}" y1="${y+8}" x2="${x+36}" y2="${y+8}"/><line class="gl sep" x1="${x-36}" y1="${y+4}" x2="${x+36}" y2="${y+4}"/><circle class="clp" cx="${x+34}" cy="${y-6}" r="2"/>`;break;
  case"ge":g=`<rect class="bx cl ext" x="${x-40}" y="${y-30}" width="80" height="60" rx="6"/><rect class="gl" x="${x-32}" y="${y-22}" width="44" height="44" rx="5"/><circle class="gl" cx="${x-10}" cy="${y}" r="16"/><path class="gl" d="M${x-10} ${y-14}v28M${x-24} ${y}h28"/>${[-16,-8,0,8,16].map(k=>`<line class="gl sep" x1="${x+18}" y1="${y+k}" x2="${x+33}" y2="${y+k}"/>`).join("")}`;break;
  case"liai":g=`<rect class="bx cl" x="${x-9}" y="${y-9}" width="18" height="18" rx="4"/><circle class="clp" cx="${x-2.5}" cy="${y}" r="2.4"/><circle class="clp" cx="${x+3}" cy="${y}" r="1.6"/>`;break;
  case"cond":g=`<rect class="bx cl" x="${x-8}" y="${y-8}" width="16" height="16" rx="3.5"/><path class="gl" d="M${x} ${y-4.5} q4 5 0 8.5 q-4 -3.5 0 -8.5"/>`;break;
  case"cmd":g=`<rect class="bx cl" x="${x-9}" y="${y-9}" width="18" height="18" rx="3.5"/><text class="tt" x="${x}" y="${y+3}" style="font-size:7px">°C</text>`;break;
 }
 const k=(T[e.t]||{}).w?1:Math.max(1,fs/14),r=Math.max(20*k,((T[e.t]||{}).w||0)/2);
 return `<g class="sym st-${i<0?"ico":e.st==="faire"?"faire":"exist"}${sel?" on":""}" data-i="${i}"><title>${esc(e.n||(T[e.t]||{}).n)}</title><circle class="hit" cx="${x}" cy="${y}" r="${Math.max(r,(M?9*M.length:0)*k)}"/>${e.st==="faire"?(M&&M.length>1?`<rect class="halo" x="${x-(9*M.length+8)*k}" y="${y-17*k}" width="${2*(9*M.length+8)*k}" height="${34*k}" rx="${17*k}"/>`:`<circle class="halo" cx="${x}" cy="${y}" r="${Math.max(17*k,((T[e.t]||{}).w||0)/2+8)}"/>`):""}<g transform="translate(${x} ${y}) scale(${k}) translate(${-x} ${-y})">${g}</g></g>`}
/* Demi-largeur dessinée d'un élément (cm), pour qu'ils se collent sans se chevaucher */
const HW={pc:9,pc2:18,pc3:27,pc4:36,p32:11,tv:9,rj:9,int:9,vv:9,app:9,iph:8,tab:30,vmcm:10,ef:7,ec:7,ev:8,mit:9,nour:14,cee:25,rad:40,ss:25,split:45,ge:40,liai:9,cond:8,cmd:9};
const HH={cee:40,tab:40,rad:28,ss:60,split:15,ge:30};
function hw(e,L){const t=typeof e==="string"?e:e.t,fs=Math.max(15,(L+160)/34),k=(T[t]||{}).w?1:Math.max(1,fs/14),M=typeof e==="string"?null:mods(e);return(M?9*M.length:(HW[t]||9))*k}
const pill=(x,y,t,fs)=>{const w=t.length*fs*.58+fs*.9;return`<rect class="pill" x="${x-w/2}" y="${y-fs*.75}" width="${w}" height="${fs*1.5}" rx="${fs*.75}"/><text class="pillt" x="${x}" y="${y+fs*.32}" font-size="${fs*.85}">${t}</text>`};
const dim=(x1,x2,y,t,fs)=>`<line class="cl" x1="${x1}" y1="${y}" x2="${x2}" y2="${y}"/><line class="cl" x1="${x1}" y1="${y-fs*.4}" x2="${x1}" y2="${y+fs*.4}"/><line class="cl" x1="${x2}" y1="${y-fs*.4}" x2="${x2}" y2="${y+fs*.4}"/><text class="ck" x="${(x1+x2)/2}" y="${y-fs*.45}" font-size="${fs*.95}">${t}</text>`;

/* ---------- Dans les murs : ce que le calcul du devis fait passer (Cyril 17/11) ---------- */
const NC={ecl:"#B8924F",pc:"var(--fg)",spe:"#C2255C",cmd:"#E8590C",com:"#2B8A3E",ef:"#2F7DE1",ec:"#E03131",ev:"#868E96",clim:"#7048E8",cond:"#7048E8"};
const NL={ecl:"Éclairage",pc:"Prises",spe:"Circuits spécialisés",cmd:"Vers les interrupteurs",com:"Internet / TV",ef:"Eau froide",ec:"Eau chaude",ev:"Évacuations",clim:"Liaisons clim",cond:"Condensats"};
const NOFF={ecl:0,pc:5,spe:-5,cmd:-9,com:9,ef:-4,ec:4,ev:0,clim:0,cond:6};
function netHops(){try{const r=window.PKRESEAUX&&PKRESEAUX.calc();return r?r._hops:[]}catch(e){return[]}}
function kOK(k){const F=fams();return(["ecl","pc","spe","cmd","com"].includes(k)&&F.includes("el"))||(["ef","ec","ev"].includes(k)&&F.includes("eau"))||(["clim","cond"].includes(k)&&F.includes("clim"))}
const nst=(k,w)=>`style="stroke:${NC[k]};stroke-width:${w}"`;
function netMur(sg,Hh){let s="";const seen=new Set();V.netK=new Set();V.netSpe=new Set();netHops().forEach(hp=>{if(!kOK(hp.k))return;[[hp.b,hp.a],[hp.a,hp.b]].forEach(([p,q])=>{if(!p||!p.w||p.sg.a!==sg.a)return;const o=NOFF[hp.k],y=Hh-p.h*100,f=p.e.st==="faire"||(q&&q.e&&q.e.st==="faire")?"":" ex",sw=hp.k==="ev"?Math.max(4,(hp.d||40)/12):3,same=q&&q.w&&q.sg.a===sg.a;
  if(hp.k==="clim"||hp.k==="cond"){if(!same)return;const key=hp.k+[p.s,q.s].sort().join();if(seen.has(key))return;seen.add(key);V.netK.add(hp.k);s+=`<line class="net${f}${hp.k==="cond"?" dash":""}" ${nst(hp.k,sw)} x1="${p.s*100}" y1="${y}" x2="${q.s*100}" y2="${Hh-q.h*100}"/>`;return}
  V.netK.add(hp.k);if(hp.k==="spe"&&hp.c)V.netSpe.add(hp.c.n+" "+hp.c.dj);
  if(same&&Math.abs(q.h-p.h)<.15){const key=hp.k+[p.s,q.s].sort().join();if(seen.has(key))return;seen.add(key);s+=`<line class="net${f}" ${nst(hp.k,sw)} x1="${p.s*100}" y1="${y+o}" x2="${q.s*100}" y2="${y+o}"/>`;return}
  if(hp.via==="mur"&&q){const dA=Math.hypot(q.x-p.A[0],q.y-p.A[1]),dB=Math.hypot(q.x-p.B[0],q.y-p.B[1]),xe=dA<dB?0:p.lw*100,key=hp.k+"m"+p.s+"|"+xe;if(seen.has(key))return;seen.add(key);s+=`<line class="net${f}${hp.k==="cmd"?" dash":""}" ${nst(hp.k,sw)} x1="${p.s*100}" y1="${y+o}" x2="${xe}" y2="${y+o}"/>`;return}
  if((hp.k==="ef"||hp.k==="ec"||hp.k==="ev")&&q){/* eau : à l'horizontale dans le mur vers la nourrice / la chute ; évacuation en pente */
   const key=hp.k+"e"+p.s+"|"+p.h;if(seen.has(key))return;seen.add(key);const x0=p.s*100+o;let xe,ye=y;
   if(same)xe=q.s*100+o;else{const dA=Math.hypot(q.x-p.A[0],q.y-p.A[1]),dB=Math.hypot(q.x-p.B[0],q.y-p.B[1]);xe=dA<dB?0:p.lw*100}
   if(hp.k==="ev"){const yb=Hh-Math.max(2,p.h*100-2),pe=(window.PKRESEAUX?PKRESEAUX.N.pente:.02);s+=`<path class="net${f}" ${nst(hp.k,sw)} d="M${x0} ${y}V${yb}L${xe} ${yb+Math.abs(xe-x0)*pe}"/>`;return}
   const yo=y+(hp.k==="ec"?6:0);if(same)ye=Hh-q.h*100;s+=`<path class="net${f}" ${nst(hp.k,sw)} d="M${x0} ${y}V${yo}H${xe}V${ye}"/>`;return}
  const eau=["ef","ec","ev"].includes(hp.k),x=p.s*100+o,key=hp.k+"|"+p.s+"|"+p.h;if(seen.has(key))return;seen.add(key);
  s+=`<line class="net${f}${hp.k==="cmd"?" dash":""}" ${nst(hp.k,sw)} x1="${x}" y1="${eau?Hh:0}" x2="${x}" y2="${y}"/>`})});return s}
function netPlaf(rm,M){let s="";const fi=K().ST.fi;V.netK=new Set();V.netSpe=new Set();netHops().forEach(hp=>{if(!kOK(hp.k)||["ef","ec","ev","clim","cond"].includes(hp.k)||hp.via==="mur"||hp.via==="ligne")return;if(hp.k==="spe"&&hp.c)V.netSpe.add(hp.c.n+" "+hp.c.dj);const a=hp.a,b=hp.b;if(!a||!b||a.fi!==fi||b.fi!==fi||(a.rm!==rm&&b.rm!==rm))return;const f=b.e&&b.e.st==="faire"?"":" ex";V.netK.add(hp.k);
  s+=`<path class="net${f}${hp.k==="cmd"?" dash":""}" ${nst(hp.k,M/200)} d="M${a.x*100+NOFF[hp.k]} ${a.y*100}H${b.x*100+NOFF[hp.k]}V${b.y*100}"/>`});return s}
function netLeg(){const K2=[...(V.netK||[])];return`<div class="leg">${K2.length?K2.map(k=>`<span><i style="background:${NC[k]}"></i>${k==="spe"&&V.netSpe&&V.netSpe.size?"Circuit spécialisé (un seul appareil) : "+esc([...V.netSpe].join(", ")):NL[k]}</span>`).join(""):`<span class="muted">Rien à faire passer ici.</span>`}<span class="muted">Pâle : déjà en place</span></div>`}
function svgMur(){const w=wall();if(!w)return"";const sg=w.s,P=K(),L=Math.round(P.dist(sg.a,sg.b)*100),Hh=H(),E=eqs(sg),O=opens(sg),sel=V.sel;
 const fs=Math.max(15,(L+160)/34),ml=fs*2.6,mr=fs*1.2,mt=fs*4.4,mb=fs*(sel>=0?2.2:6.6);
 let s=`<svg id="fx-esvg" viewBox="${-ml} ${-mt} ${L+ml+mr} ${Hh+mt+mb}" font-size="${fs}" role="img" aria-label="Mur vu de face">`;
 s+=`<rect class="fond" x="0" y="0" width="${L}" height="${Hh}"/>`;if(V.net)s+=netMur(sg,Hh);
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
  shown.forEach(o=>{if(shown.some(p=>p!==o&&p.e.x<o.e.x&&o.e.x-p.e.x<70&&p.e.h===o.e.h))return;const e=o.e,w=hw(e,L),g=shown.some(p=>p!==o&&p.e.x>e.x&&p.e.x-e.x<fs*2.4&&Math.abs(p.e.h-e.h)<fs*1.2);
   s+=`<text class="txt" font-size="${fs*.7}" x="${g?e.x-w-fs*.25:e.x+w+fs*.25}" y="${Hh-e.h+fs*.25}" style="text-anchor:${g?"end":"start"}">${Math.round(e.h)}</text>`})}
 return s+"</svg>"}

function mini(){const rm=room(),w=wall(),xs=rm.pts.map(p=>p[0]),ys=rm.pts.map(p=>p[1]),x0=Math.min(...xs),y0=Math.min(...ys),W=Math.max(...xs)-x0||1,Hh=Math.max(...ys)-y0||1,M=Math.max(W,Hh),pad=M*.12;
 const cx=x0+W/2,cy=y0+Hh/2,sg=w&&w.s;let s=`<svg class="fx-mini" viewBox="${x0-pad} ${y0-pad} ${W+2*pad} ${Hh+2*pad}" role="group" aria-label="Choisir un mur"><polygon points="${rm.pts.map(p=>p.join(",")).join(" ")}" class="mp"/>`;
 walls().forEach((o,i)=>{s+=`<line data-w="${i}" class="mw${i===V.wi?" on":""}${o.s.kind==="clo"?" clo":""}" x1="${o.s.a[0]}" y1="${o.s.a[1]}" x2="${o.s.b[0]}" y2="${o.s.b[1]}" stroke-width="${M/(i===V.wi?13:26)}"/><line data-w="${i}" class="mhit" x1="${o.s.a[0]}" y1="${o.s.a[1]}" x2="${o.s.b[0]}" y2="${o.s.b[1]}" stroke-width="${M/7}"/>`});
 if(sg&&V.tab==="mur"){const mx=(sg.a[0]+sg.b[0])/2,my=(sg.a[1]+sg.b[1])/2,a=Math.atan2(my-cy,mx-cx),r=M*.16;s+=`<circle class="me" cx="${cx}" cy="${cy}" r="${M/16}"/><line class="me" x1="${cx}" y1="${cy}" x2="${cx+Math.cos(a)*r}" y2="${cy+Math.sin(a)*r}" stroke-width="${M/30}"/>`}
 return s+"</svg>"}

/* Plafond de la pièce, vu de dessus, cotes depuis les murs. */
function svgPlaf(){const rm=room(),pts=rm.pts.map(p=>[p[0]*100,p[1]*100]),xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]),b=[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)],w=b[2]-b[0],h=b[3]-b[1],M=Math.max(w,h),mg=M*.2,fs=M/24;
 let s=`<svg id="fx-psvg" viewBox="${b[0]-mg} ${b[1]-mg} ${w+mg*1.5} ${h+mg*1.5}" font-size="${fs}" role="img" aria-label="Plafond vu de dessus"><polygon class="pfond" points="${pts.map(p=>p.join(",")).join(" ")}"/>`;if(V.net)s+=`<clipPath id="fx-pclip"><polygon points="${pts.map(p=>p.join(",")).join(" ")}"/></clipPath><g clip-path="url(#fx-pclip)">${netPlaf(rm,M)}</g>`;
 pts.forEach((p,i)=>{const q=pts[(i+1)%pts.length];s+=`<line class="pmur" x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" stroke-width="${M/60}"/>`});
 const E=(rm.eqp||[]).map((e,i)=>({e,i})).filter(o=>vis(o.e.t)),k=M/420,X=[],Y=[];
 E.forEach(({e,i})=>{const x=e.x*100,y=e.y*100;X.push(Math.round(x));Y.push(Math.round(y));s+=`<g class="sym st-${e.st==="faire"?"faire":"exist"}${V.sel===i?" on":""}" data-i="${i}"><title>${esc(e.n||TP[e.t].n)}</title><circle class="hit" cx="${x}" cy="${y}" r="${Math.max(24*k,fs*1.4)}"/>${e.st==="faire"?`<circle class="halo" cx="${x}" cy="${y}" r="${Math.max(24*k,fs*1.2)}"/>`:""}${symPlaf(e.t,x,y,Math.max(1,k))}</g>`});
 s+=chain(X,b[0],b[2],b[1]-mg*.45,1,fs)+chain(Y,b[1],b[3],b[0]-mg*.45,0,fs);
 if(V.sel>=0&&rm.eqp&&rm.eqp[V.sel]){const e=rm.eqp[V.sel],x=e.x*100,y=e.y*100;s+=`<line class="cs" stroke-dasharray="6 5" x1="${b[0]}" y1="${y}" x2="${x}" y2="${y}"/><line class="cs" stroke-dasharray="6 5" x1="${x}" y1="${b[1]}" x2="${x}" y2="${y}"/>`+pill((b[0]+x)/2,y-fs*.9,Math.round(x-b[0])+" cm",fs)+pill(x+fs*2.6,(b[1]+y)/2,Math.round(y-b[1])+" cm",fs)}
 return s+"</svg>"}
function symPlaf(t,x,y,k){const sq=(r,c,rx)=>`<rect class="${c}" x="${x-r*k}" y="${y-r*k}" width="${2*r*k}" height="${2*r*k}" rx="${(rx||5)*k}"/>`;
 if(t==="spot")return sq(13,"pf-spot",5)+`<circle class="pf-x" cx="${x}" cy="${y}" r="${7*k}" fill="none"/><path class="pf-x" d="M${x-4.5*k} ${y-4.5*k}l${9*k} ${9*k}M${x+4.5*k} ${y-4.5*k}l${-9*k} ${9*k}"/>`;
 if(t==="pl")return sq(17,"pf-spot",6)+`<circle class="pf-x" cx="${x}" cy="${y}" r="${10*k}" fill="none"/><circle class="pf-pl" cx="${x}" cy="${y}" r="${4.5*k}"/>`;
 if(t==="vmc")return sq(15,"pf-vmc",5)+`<circle class="pf-x" cx="${x}" cy="${y}" r="${9*k}" fill="none"/><circle class="pf-x" cx="${x}" cy="${y}" r="${4*k}" fill="none"/>`;
 if(t==="df")return sq(15,"pf-df",5)+`<text class="pf-dft" x="${x}" y="${y+4.5*k}" font-size="${12*k}">DF</text>`;
 if(t==="souf")return`<rect class="pf-cl" x="${x-30*k}" y="${y-10*k}" width="${60*k}" height="${20*k}" rx="${5*k}"/>${[-20,-12,-4,4,12,20].map(d=>`<line class="pf-x" x1="${x+d*k}" y1="${y-5*k}" x2="${x+d*k}" y2="${y+5*k}"/>`).join("")}`;
 if(t==="rep")return sq(25,"pf-cl",6)+[-14,-7,0,7,14].map(d=>`<line class="pf-x" x1="${x-18*k}" y1="${y+d*k}" x2="${x+18*k}" y2="${y+d*k}"/>`).join("");
 return sq(30,"pf-cl",7)+`<rect class="pf-x" x="${x-17*k}" y="${y-17*k}" width="${34*k}" height="${34*k}" rx="${4*k}" fill="none"/>`+[[0,-23],[0,23],[-23,0],[23,0]].map(([a,b])=>`<rect class="pf-x" x="${x+(a?a-2:-10)*k}" y="${y+(b?b-2:-10)*k}" width="${(a?4:20)*k}" height="${(b?4:20)*k}" rx="${1*k}" fill="none"/>`).join("")}
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
 ["coin","Distance minimale à un angle",20,"usage"],
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
function hdef(t){const r=RR();return({pc:r.prise,pc2:r.prise,pc3:r.prise,pc4:r.prise,tv:r.rj,rj:r.rj,int:r.inter,vv:r.inter,p32:r.p32,cmd:r.cmd,split:H()-r.splitP-15,liai:H()-r.splitP-15})[t]??T[t].h}
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
function regHTML(){const r=RR();return`<p style="margin:2px 2px 4px;font-weight:800;font-size:16px">Mes règles de pose</p><div class="muted" style="font-size:13.5px;margin-bottom:8px">Utilisées pour pré-remplir chaque pièce. Changez-les une fois pour toutes.</div><div class="regs">${RG.map(([k,n,d,s])=>`<label><span>${esc(n)}<small>${esc(s)}${r[k]!==d?` · d'origine ${d}`:""}</small></span><input data-rg="${k}" inputmode="numeric" value="${r[k]}"> cm</label>`).join("")}</div><div class="note">Minimums de la norme NF C 15-100 appliqués : séjour 1 prise par tranche de 4 m² (au moins 5), chambre 3, cuisine 6 dont 4 au-dessus du plan de travail, 1 point lumineux par pièce, 1 RJ45 par pièce principale, 1 détecteur de fumée par logement.</div><div class="note"><b>Pour le devis, chaque plaque compte</b> : 1 plaque de finition + 1 mécanisme par poste. Prise simple = plaque 1 poste + 1 prise. Double = plaque 2 postes + 2 prises. Triple = plaque 3 postes + 3 prises. Quadruple = plaque 4 postes + 4 prises. Plaque mélangée (par exemple interrupteur + prise + RJ45) = plaque 3 postes + 1 interrupteur + 1 prise + 1 RJ45.</div><button class="bt go" data-a="reg" style="margin-top:10px">C'est noté</button>`}

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
#fx .gl.sep{stroke-width:1;opacity:.45}#fx .ef{fill:#2F7DE1}#fx .ec{fill:#E8590C}
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
#fx-loupe{position:fixed;width:92px;height:92px;border-radius:50%;overflow:hidden;z-index:95;background:var(--surface);box-shadow:0 0 0 1px rgba(184,146,79,.7),0 4px 12px rgba(0,0,0,.14);pointer-events:none}#fx-loupe svg{width:100%;height:100%;display:block}#fx-loupe i{position:absolute;left:50%;top:50%;width:10px;height:10px;margin:-5px 0 0 -5px;border:1px solid #B8924F;border-radius:50%;opacity:.6}
#fx .pk-in.mini{max-width:420px}#fx .tiles.mg2{grid-template-columns:repeat(2,1fr)}#fx .mg2 .tile svg{width:64px;height:64px}
#fx .mg{display:flex;align-items:center;gap:12px;margin:6px 0 14px;font-size:15px}#fx .mg svg{width:64px;height:64px;flex:none}

#fx .halo{fill:#B8924F;opacity:.2}#fx .sym.st-exist{opacity:.45}#fx .sym.st-exist.on{opacity:.8}
#fx .it .dt.faire{box-shadow:0 0 0 3px rgba(184,146,79,.35)}#fx .it .dt.exist{opacity:.4}
#fx .ask{flex-wrap:wrap}#fx .ak{flex:1 1 150px}#fx .qk3{display:flex;gap:6px;flex-wrap:wrap}#fx .qk3 button{appearance:none;border:1.5px solid var(--line);background:var(--surface);color:var(--fg);font:800 13.5px var(--f);padding:8px 12px;border-radius:999px;cursor:pointer;min-height:40px}
#fx .qk3 button[aria-pressed="true"]{border-color:#B8924F;background:rgba(184,146,79,.14)}#fx .qk3 button[data-st="exist"][aria-pressed="true"]{border-color:var(--muted);background:var(--paper)}#fx .st1{flex:1 1 100%}
#fx .tiles.one{grid-template-columns:1fr}#fx .tiles.one svg.wide{width:min(100%,220px);height:64px}#fx .net{fill:none;stroke-linecap:round;pointer-events:none;opacity:.9}#fx .net.ex{opacity:.28}#fx .net.dash{stroke-dasharray:7 5}#fx .leg{display:flex;flex-wrap:wrap;gap:6px 12px;margin:8px 4px 0;font:700 12.5px var(--f)}#fx .leg span{display:flex;align-items:center;gap:5px}#fx .leg i{width:16px;height:4px;border-radius:2px}#fx .netb{display:inline-flex;align-items:center;gap:6px;margin-left:auto}#fx .netb svg{width:16px;height:16px}#fx .netb[aria-pressed="true"]{border-color:#B8924F!important;background:rgba(184,146,79,.14)!important;color:var(--fg)!important}
#fx .tabsvg{display:block;width:100%;max-width:460px;margin:8px auto 10px}#fx .tabsvg .tf{fill:var(--surface);stroke:var(--line);stroke-width:1.2}#fx .tabsvg .tbd{fill:#1B2440}#fx .tabsvg .tdot{fill:#B8924F}#fx .tabsvg .ttl{font:800 11px var(--f);fill:#fff}#fx .tabsvg .rail{stroke:var(--line);stroke-width:5;stroke-linecap:round}#fx .tabsvg .g1{stop-color:#fff}#fx .tabsvg .g2{stop-color:#ECEEF3}#fx .tabsvg .dj .bd{fill:url(#tgm);stroke:#C9CDD8;stroke-width:1}#fx .tabsvg .dj .top{fill:#B8924F;opacity:.85}#fx .tabsvg .dj .lv{fill:#1B2440}#fx .tabsvg .dj .cal{font:800 8.5px var(--mono);text-anchor:middle;fill:#1B2440}#fx .tabsvg .id .bd{fill:#1B2440}#fx .tabsvg .id .lv{fill:#F2EEE4}#fx .tabsvg .id .cal{font:800 8.5px var(--mono);text-anchor:middle;fill:#F2EEE4}#fx .tabsvg .id .cal2{font:700 7px var(--f);text-anchor:middle;fill:#B8924F}#fx .tabsvg .nb{fill:none;stroke:#B8924F;stroke-width:1.4}#fx .tabsvg .nbt{font:800 8px var(--f);text-anchor:middle;fill:var(--fg)}#fx .clsvg .cz{font:800 9px var(--f);fill:var(--muted)}#fx .clsvg .mur{stroke:var(--fg);stroke-width:3;stroke-dasharray:2 4;stroke-linecap:round;opacity:.5}#fx .clsvg .ge rect{fill:var(--paper);stroke:#1B2440;stroke-width:1.6}#fx .clsvg .ge circle,#fx .clsvg .ge path,#fx .clsvg .ge line{fill:none;stroke:#1B2440;stroke-width:1.3}#fx .clsvg .kw{font:800 9.5px var(--mono);text-anchor:middle;fill:var(--fg)}#fx .clsvg .lg{fill:none;stroke:#1B2440;stroke-width:2.6;stroke-linejoin:round}#fx .clsvg .ll{fill:none;stroke:#B8924F;stroke-width:1.6;stroke-linejoin:round}#fx .clsvg .lt{font:700 7.5px var(--mono);text-anchor:end;fill:var(--muted)}#fx .clsvg .ui rect{fill:var(--paper);stroke:#1B2440;stroke-width:1.6}#fx .clsvg .ui .in{fill:none;stroke:var(--muted);stroke-width:1.2}#fx .clsvg .led{fill:#B8924F}#fx .clsvg .pln{fill:#1B2440}#fx .clsvg .gs{fill:none;stroke:#7048E8;stroke-width:5;opacity:.35;stroke-linecap:round}#fx .clsvg .bo rect{fill:var(--paper);stroke:#1B2440;stroke-width:1.4}#fx .clsvg .bo line{stroke:var(--fg);stroke-width:1}
:root[data-theme="dark"] #fx .clsvg .ge rect,:root[data-theme="dark"] #fx .clsvg .ui rect,:root[data-theme="dark"] #fx .clsvg .bo rect{stroke:#F2EEE4}:root[data-theme="dark"] #fx .clsvg .ge circle,:root[data-theme="dark"] #fx .clsvg .ge path,:root[data-theme="dark"] #fx .clsvg .ge line,:root[data-theme="dark"] #fx .clsvg .lg{stroke:#F2EEE4}:root[data-theme="dark"] #fx .clsvg .pln{fill:#F2EEE4}
#fx .tabsvg .et{fill:var(--paper);stroke:var(--line);stroke-width:1}#fx .tabsvg .etid{font:800 8px var(--f);text-anchor:middle;fill:#1B2440}#fx .tabsvg .tst{fill:#B8924F}#fx .tabsvg .pc,#fx .tcirc .pc{fill:none;stroke:var(--fg);stroke-width:1.1;stroke-linecap:round;stroke-linejoin:round}#fx .tabsvg .pc .f,#fx .tcirc .pc .f{fill:var(--fg);stroke:none}#fx .tcirc .pcs{width:16px;height:16px;flex:none}
:root[data-theme="dark"] #fx .tabsvg .etid{fill:#F2EEE4}
#fx .tabsvg .libre{fill:none;stroke:var(--muted);stroke-width:1;stroke-dasharray:3 3;opacity:.45}
#fx .tcirc{list-style:none;margin:0 0 8px;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:4px 10px}#fx .calc .tcirc li{display:flex;align-items:center;gap:7px;font-size:13px;background:none;border:0;padding:2px 0}#fx .tcirc i{flex:none;width:18px;height:18px;border-radius:50%;border:1.4px solid #B8924F;display:grid;place-items:center;font:800 10px var(--f);font-style:normal}#fx .tcirc span{flex:1;min-width:0}#fx .tcirc b{font:800 12px var(--mono);color:var(--muted)}
:root[data-theme="dark"] #fx .tabsvg .tbd{fill:#2A3558}:root[data-theme="dark"] #fx .tabsvg .id .bd{fill:#2A3558;stroke:#F2EEE4;stroke-width:1}
#fx .calc h4{margin:12px 2px 4px;font-size:14.5px}#fx .calc ul{list-style:none;margin:0;padding:0;display:grid;gap:4px}#fx .calc li{display:flex;gap:10px;justify-content:space-between;background:var(--bg);border:1px solid var(--line);border-radius:10px;padding:6px 10px;font-size:13.5px}#fx .calc li b{white-space:nowrap;font-family:var(--mono)}#fx .calc .tb{background:var(--bg);border:1.5px solid #B8924F;border-radius:12px;padding:8px 10px;margin-bottom:6px}#fx .calc .tb small{display:block;color:var(--muted)}#fx .calc details{margin-top:8px}#fx .calc summary{font-weight:800;cursor:pointer;padding:4px 2px}#fx .calc .hy li{display:block;color:var(--muted)}
#fx .postes{flex:1 1 100%;display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px}#fx .postes>span{font-weight:800;font-size:13.5px}#fx .postes small{display:block;color:var(--muted);font-weight:600;font-size:12px}#fx .pz{display:flex;gap:6px;flex-wrap:wrap}#fx .pz button{appearance:none;display:flex;flex-direction:column;align-items:center;gap:2px;min-width:58px;min-height:52px;padding:5px 6px;border:1.5px solid var(--line);border-radius:12px;background:var(--surface);color:var(--fg);font:700 11.5px var(--f);cursor:pointer}#fx .pz svg{width:26px;height:26px}#fx .pz em{font-style:normal}#fx .pz .pz-a{min-width:44px;font-size:20px;justify-content:center}
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
 h+=`<div class="tabs" role="group" aria-label="Vue">${tabs.map(([k,n])=>`<button data-tab="${k}" aria-pressed="${V.tab===k}">${n}</button>`).join("")}${V.tab!=="clim"&&F.length&&window.PKRESEAUX?`<button class="netb" data-a="net" aria-pressed="${!!V.net}"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 2v7h12v9M10 9v9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>Dans les murs</button>`:""}</div>`;
 if(P.F().rooms.length>1&&V.tab!=="mur")h+=`<div class="chips" role="group" aria-label="Pièce">${P.F().rooms.map((r,i)=>`<button data-ri="${i}" aria-pressed="${i===V.ri}">${esc(r.nom)}</button>`).join("")}</div>`;
 if(V.tab!=="clim"&&M.length){const n=autoRoom();if(n)setTimeout(()=>toast(`${n} éléments posés aux hauteurs habituelles. Touchez ceux qui sont à faire.`),50)}
 if(V.tab==="mur")h+=murHTML();else if(V.tab==="plaf")h+=plafHTML();else h+=climHTML();
 h+=V.met?`<div class="card" style="margin-top:14px">${metHTML(M)}</div>`:`<button class="lien" data-a="met">Mes métiers : ${M.length?esc(M.map(k=>(MET.find(m=>m[0]===k)||[,""])[1]).join(", ")):"aucun choisi"}</button>`;
 h+=V.reg?`<div class="card" style="margin-top:10px">${regHTML()}</div>`:(fams().length?`<button class="lien" data-a="reg">Mes règles de pose (hauteurs, distances)</button>`:"");
 if(fams().length&&window.PKRESEAUX)h+=V.calc?`<div class="card calc" style="margin-top:10px">${calcHTML()}</div>`:`<button class="lien" data-a="calc">Câbles, tuyaux et tableau (calculés pour le devis)</button>`;
 d.innerHTML=h+`</div>`+(V.merge&&V.tab==="mur"&&wall()?mergeHTML():V.pick?pickHTML():"")}
/* Tableau vu de face, inspiré des plans de tableau Schneider (étiquette de repérage avec pictogramme au-dessus de chaque
   appareil, différentiel en tête de rangée, place libre visible), à la sauce ProClik : bandeau bleu nuit, point laiton, relief doux. */
function picto(n,x,y){const t=String(n).toLowerCase(),g=d=>`<g class="pc" transform="translate(${x-6} ${y-6})">${d}</g>`;
 if(/eclairage/.test(t.normalize("NFD").replace(/[̀-ͯ]/g,"")))return g(`<circle cx="6" cy="5" r="3.6"/><path d="M4.4 9.2h3.2M4.8 11h2.4"/>`);
 if(/plaque/.test(t))return g(`<rect x="1" y="1" width="10" height="10" rx="2"/><circle cx="4" cy="4" r="1.4"/><circle cx="8" cy="4" r="1.4"/><circle cx="4" cy="8" r="1.4"/><circle cx="8" cy="8" r="1.4"/>`);
 if(/four/.test(t))return g(`<rect x="1" y="1" width="10" height="10" rx="2"/><rect x="3" y="4.5" width="6" height="4.5" rx="1"/><path d="M3 2.8h6"/>`);
 if(/vaisselle/.test(t))return g(`<rect x="1" y="1" width="10" height="10" rx="2"/><path d="M4 4v5M6 4v5M8 4v5"/>`);
 if(/seche/.test(t.normalize("NFD").replace(/[̀-ͯ]/g,"")))return g(`<rect x="1" y="1" width="10" height="10" rx="2"/><circle cx="6" cy="6.5" r="3"/><path d="M4.6 6.5h2.8"/>`);
 if(/linge/.test(t))return g(`<rect x="1" y="1" width="10" height="10" rx="2"/><circle cx="6" cy="6.5" r="3"/>`);
 if(/vmc/.test(t))return g(`<circle cx="6" cy="6" r="4.6"/><path d="M6 6l2.6-2.2M6 6l-.6 3.4M6 6L2.8 4.6"/>`);
 if(/clim|groupe/.test(t))return g(`<path d="M6 1v10M1.7 3.5l8.6 5M1.7 8.5l8.6-5"/>`);
 if(/chauffe/.test(t))return g(`<rect x="2.5" y="1" width="7" height="10" rx="3"/><path d="M6 4.2q1.6 2 0 3.6q-1.6-1.6 0-3.6"/>`);
 if(/hc|contacteur/.test(t))return g(`<circle cx="6" cy="6" r="4.6"/><path d="M6 3.4V6l1.8 1.2"/>`);
 return g(`<circle cx="6" cy="6" r="4.4"/><circle cx="4.4" cy="6.4" r=".9" class="f"/><circle cx="7.6" cy="6.4" r=".9" class="f"/>`)}
function tabSVG(t){const W=20,ET=18,MH=50,RH=ET+MH+34,n=t.rangs.length,X0=18,w=13*W+2*X0,TOP=44,h=TOP+n*RH+10;let k=0;const L=[];
 let s=`<svg class="tabsvg" viewBox="0 0 ${w} ${h}" role="img" aria-label="Tableau électrique vu de face"><defs><filter id="tsh" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#1B2440" flood-opacity=".16"/></filter><linearGradient id="tgm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="g1"/><stop offset="1" class="g2"/></linearGradient></defs>`;
 s+=`<rect class="tf" x="4" y="4" width="${w-8}" height="${h-8}" rx="16" filter="url(#tsh)"/><path class="tbd" d="M4 20a16 16 0 0 1 16-16h${w-40}a16 16 0 0 1 16 16v14h${-(w-8)}z"/><circle class="tdot" cx="${w-24}" cy="19" r="4"/><text class="ttl" x="20" y="24">${esc(t.marque?t.marque.n+" · "+t.marque.tableau:"Tableau électrique")}</text>`;
 t.rangs.forEach((r,ri)=>{const y0=TOP+ri*RH+8,y=y0+ET+2;let x=X0;
  /* étiquette de repérage de la rangée */
  s+=`<rect class="et" x="${X0-2}" y="${y0}" width="${13*W+4}" height="${ET}" rx="4"/><line class="rail" x1="${X0-6}" y1="${y+MH/2}" x2="${X0+13*W+6}" y2="${y+MH/2}"/>`;
  r.forEach(m=>{const mw=m.m*W,cx=x+mw/2;
   if(m.t==="id"){s+=`<text class="etid" x="${cx}" y="${y0+12.5}">ID ${esc(/type A$/.test(m.n)?"A":"AC")}</text><g class="md id"><rect class="bd" x="${x+1.5}" y="${y}" width="${mw-3}" height="${MH}" rx="6"/><rect class="lv" x="${cx-4}" y="${y+9}" width="8" height="14" rx="2.5"/><circle class="tst" cx="${x+mw-8}" cy="${y+8}" r="2.6"/><text class="cal" x="${cx}" y="${y+36}">30 mA</text><text class="cal2" x="${cx}" y="${y+45}">${esc(/type A$/.test(m.n)?"type A":"type AC")}</text></g>`}
   else{k++;L.push({k,n:m.n,cal:m.cal||""});s+=picto(m.t==="hc"?"hc":m.n,cx,y0+ET/2)+`<g class="md dj"><rect class="bd" x="${x+1.5}" y="${y}" width="${mw-3}" height="${MH}" rx="5"/><rect class="top" x="${x+4}" y="${y+3}" width="${mw-8}" height="3" rx="1.5"/><rect class="lv" x="${cx-3.5}" y="${y+12}" width="7" height="13" rx="2"/><text class="cal" x="${cx}" y="${y+40}">${esc(m.t==="hc"?"HC":String(m.cal).replace(" ",""))}</text><circle class="nb" cx="${cx}" cy="${y+MH+13}" r="7.5"/><text class="nbt" x="${cx}" y="${y+MH+16}">${k}</text></g>`}
   x+=mw});
  for(;x<X0+13*W-1;x+=W)s+=`<rect class="libre" x="${x+2.5}" y="${y+2}" width="${W-5}" height="${MH-4}" rx="5"/>`});
 return s+`</svg><ol class="tcirc">${L.map(o=>`<li><i>${o.k}</i><svg viewBox="0 0 12 12" class="pcs" aria-hidden="true">${picto(o.n,6,6)}</svg><span>${esc(o.n)}</span><b>${esc(o.cal)}</b></li>`).join("")}</ol>`}
/* Schéma de clim au style ProClik (même esprit que le tableau) : groupe dehors, mur, unités ou gainable + bouches, liaisons cotées */
function climSVG(S){const n=S.unites?S.unites.length:S.bouches.length,RW=52,TOP=46,h=TOP+Math.max(1,n)*RW+(S.unite?44:14),w=330,fr2=v=>String(v).replace(".",","),k0={k:0};const L=[];
 let s=`<svg class="tabsvg clsvg" viewBox="0 0 ${w} ${h}" role="img" aria-label="Schéma de la clim"><defs><filter id="csh" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#1B2440" flood-opacity=".16"/></filter></defs>`;
 s+=`<rect class="tf" x="4" y="4" width="${w-8}" height="${h-8}" rx="16" filter="url(#csh)"/><path class="tbd" d="M4 20a16 16 0 0 1 16-16h${w-40}a16 16 0 0 1 16 16v14h${-(w-8)}z"/><circle class="tdot" cx="${w-24}" cy="19" r="4"/><text class="ttl" x="20" y="24">${esc(S.titre)}</text>`;
 const WX=96,gy=TOP+(h-TOP-10)/2;
 /* dehors : groupe */
 s+=`<text class="cz" x="16" y="${TOP+6}">Dehors</text><text class="cz" x="${WX+10}" y="${TOP+6}">Dedans</text><line class="mur" x1="${WX}" y1="${TOP-4}" x2="${WX}" y2="${h-12}"/>`;
 s+=`<g class="ge"><rect x="14" y="${gy-26}" width="66" height="52" rx="8"/><circle cx="38" cy="${gy}" r="15"/><path d="M38 ${gy-15}v30M23 ${gy}h30"/>${[-12,-4,4,12].map(k=>`<line x1="58" y1="${gy+k}" x2="74" y2="${gy+k}"/>`).join("")}</g><text class="kw" x="47" y="${gy+40}">${fr2(S.groupe.kw)} kW</text>`;
 const line=(y,txt,x2)=>{const xs=82,xm=WX+14;return`<path class="lg" d="M${xs} ${gy-3}H${xm-6}V${y-3}H${x2}"/><path class="ll" d="M${xs} ${gy+3}H${xm}V${y+3}H${x2}"/><text class="lt" x="${x2-4}" y="${y-8}">${esc(txt)}</text>`};
 if(S.unites)S.unites.forEach((u,i)=>{const y=TOP+i*RW+RW/2,x=224;k0.k++;L.push({k:k0.k,n:u.piece+(u.cas?" (cassette)":""),v:fr2(u.kw)+" kW"});
  s+=line(y,u.d.join(" + ")+(u.L!=null?" · "+fr2(Math.round(u.L*10)/10)+" m":" · à mesurer"),x);
  s+=u.cas?`<g class="ui"><rect x="${x}" y="${y-18}" width="36" height="36" rx="7"/><rect class="in" x="${x+8}" y="${y-10}" width="20" height="20" rx="4"/></g>`:`<g class="ui"><rect x="${x}" y="${y-13}" width="80" height="26" rx="8"/><line class="in" x1="${x+8}" y1="${y+6}" x2="${x+72}" y2="${y+6}"/><circle class="led" cx="${x+70}" cy="${y-5}" r="2"/></g>`;
  s+=`<circle class="nb" cx="${x+92}" cy="${y}" r="8"/><text class="nbt" x="${x+92}" y="${y+3}">${k0.k}</text>`});
 if(S.unite){const ux=118,uy=gy;s+=line(uy,S.unite.d.join(" + ")+(S.unite.L!=null?" · "+fr2(Math.round(S.unite.L*10)/10)+" m":" · à mesurer"),ux).replace(/<text class="lt"[^>]*>[^<]*<\/text>/,"");
  s+=`<text class="lt" x="${WX+4}" y="${h-16}" style="text-anchor:start">Liaisons ${esc(S.unite.d.join(" + "))}${S.unite.L!=null?" · "+fr2(Math.round(S.unite.L*10)/10)+" m":" · à mesurer"}</text>`;
  s+=`<g class="ui"><rect x="${ux}" y="${uy-20}" width="58" height="40" rx="8"/><path class="in" d="M${ux+8} ${uy+10}h42"/></g><text class="kw" x="${ux+29}" y="${uy-26}">${fr2(S.unite.kw)} kW</text><rect class="pln" x="${ux+60}" y="${uy-14}" width="14" height="28" rx="4"/>`;
  S.bouches.forEach((b,i)=>{const y=TOP+i*RW+RW/2,x=262;k0.k++;L.push({k:k0.k,n:b.piece,v:"Ø"+b.d+" · "+fr2(Math.round(b.L*10)/10)+" m"});s+=`<path class="gs" d="M${ux+74} ${uy}C${ux+100} ${uy} ${x-30} ${y} ${x} ${y}"/><g class="bo"><rect x="${x}" y="${y-11}" width="22" height="22" rx="5"/>${[-5,0,5].map(k=>`<line x1="${x+5}" y1="${y+k}" x2="${x+17}" y2="${y+k}"/>`).join("")}</g><circle class="nb" cx="${x+36}" cy="${y}" r="8"/><text class="nbt" x="${x+36}" y="${y+3}">${k0.k}</text>`})}
 return s+`</svg><ol class="tcirc">${L.map(o=>`<li><i>${o.k}</i><span>${esc(o.n)}</span><b>${esc(o.v)}</b></li>`).join("")}</ol>`}
function calcHTML(){let r=null;try{r=PKRESEAUX.calc()}catch(e){}if(!r)return`<p class="muted">Rien à calculer pour l'instant.</p>`;const F=fams(),n=v=>String(v).replace(".",","),
 li=(o,u)=>Object.keys(o).filter(k=>o[k]).map(k=>`<li><span>${esc(k)}</span><b>${n(o[k])}${u||""}</b></li>`).join(""),sec=(t,b)=>b?`<h4>${t}</h4><ul>${b}</ul>`:"";
 let h=`<p style="margin:2px 2px 4px;font-weight:800;font-size:16px">Calculé pour le devis</p><div class="muted" style="font-size:13.5px;margin-bottom:6px">Rien à saisir : tout part des éléments posés. Seul ce qui est « à faire » est compté ; le tableau compte toute la maison.</div>`;
 if(F.includes("el")){const t=r.electricite.tableau,e=r.electricite;
  h+=`<h4>Votre marque de matériel</h4><div class="qk2 mq">${[["schneider","Schneider"],["legrand","Legrand"],["hager","Hager"],["","Autre"]].map(([k,n])=>`<button data-a="mq" data-v="${k}" aria-pressed="${PKRESEAUX.marque()===k}">${n}</button>`).join("")}</div>${t.marque?`<div class="muted" style="font-size:13px;margin:-4px 2px 6px">Appareillage : ${esc(t.marque.n)} ${esc(t.marque.appareillage)} (à changer dans le devis si besoin)</div>`:""}<h4>Tableau électrique</h4><div class="tb"><b>${esc(t.coffret)}</b><small>${t.modules} modules utilisés + 20 % de place libre</small></div>${tabSVG(t)}<ul>${t.differentiels.map(d=>`<li><span>${esc(d.n)}</span><b>${d.q}</b></li>`).join("")}${t.disjoncteurs.map(d=>`<li><span>${esc(d.n)}</span><b>${d.q}</b></li>`).join("")}${t.autres.map(d=>`<li><span>${esc(d.n)}</span><b>${d.q}</b></li>`).join("")}</ul>`;
  h+=`<details><summary>${t.circuits.length} circuits</summary><ul>${t.circuits.map(c=>`<li><span>${esc(c.n)} · ${n(c.section_mm2)} mm² · ${esc(c.disjoncteur)}${c.note?` · ${esc(c.note)}`:""}</span><b>${c.points} pt${c.points>1?"s":""}</b></li>`).join("")}</ul></details>`;
  if(t.communication)h+=`<div class="muted" style="font-size:13px;margin:4px 2px">${esc(t.communication)}</div>`;
  h+=sec("Fils et câbles (m)",li(e.fils_m," m"))+sec("Gaines (m)",li(e.gaines_m," m"))+sec("Boîtes",li(e.boites))}
 if(F.includes("eau"))h+=sec("Alimentation (m)",li(r.plomberie.multicouche_m," m"))+sec("Évacuations (m)",li(r.plomberie.pvc_m," m"))+sec("Raccords et nourrices",li(r.plomberie.raccords));
 if(F.includes("clim"))h+=((r._cs||[]).length?`<h4>Climatisation</h4>`+r._cs.map(climSVG).join(""):"")+sec("Climatisation (m)",li(r.climatisation," m"))+sec("Raccords clim",li(r.climatisation_raccords||{}));
 h+=`<details><summary>Comment c'est calculé</summary><ul class="hy">${r.hypotheses.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></details><button class="bt go" data-a="calc" style="margin-top:10px">Fermer</button>`;return h}
function mergeM(){const E=eqs(wall().s),a=E[V.merge.i],b=E[V.merge.j];if(!a||!b)return null;const[l,r]=a.x<=b.x?[a,b]:[b,a];return mods(l).concat(mods(r))}
function mergeHTML(){const m=mergeM();if(!m){V.merge=null;return""}const n=m.length,allPc=m.every(t=>t==="pc");
 const opts=allPc?(n===2?["pc2","pc3"]:n===3?["pc3","pc4"]:["pc4"]).map(t=>({t,ico:icoMur(t),lab:"Une "+T[t].n.toLowerCase()})):[{t:"plq",ico:icoE(setMods({t:"plq",h:30},m)),lab:"Une "+plqName(m).replace(/^Plaque/,"plaque")}];
 return`<div class="pick" role="dialog" aria-label="Éléments collés"><div class="pk-in mini"><div class="pk-h"><b>${allPc?"Ces prises se touchent : on en fait…":"Ils se touchent : on les met sur une seule plaque ?"}</b><button class="rd" data-a="mergeno" aria-label="Fermer">✕</button></div><div class="tiles${opts.length>1?" mg2":" one"}">${opts.map(o=>`<button class="tile" data-a="mergeok" data-t="${o.t}">${o.ico}<span>${esc(o.lab)}</span></button>`).join("")}</div><button class="bt big" data-a="mergeno" style="width:100%;justify-content:center;margin-top:10px">Non, garder ${allPc?n+" prises séparées":"séparé"}</button></div></div>`}
function head(t,s,noBack){return`<div class="eh">${noBack?"":`<button class="bk" data-a="close" aria-label="Retour au plan">‹ Plan</button>`}<div class="tx"><b>${esc(t)}</b><small>${esc(s)}</small></div>${noBack?`<button class="rd" data-a="close" aria-label="Fermer">✕</button>`:""}</div>`}
function area(p){let a=0;for(let i=0;i<p.length;i++){const q=p[(i+1)%p.length];a+=p[i][0]*q[1]-q[0]*p[i][1]}return a/2}
function metHTML(M){return`<p style="margin:4px 2px 6px;font-weight:800;font-size:16px">Quels métiers faites-vous ?</p><div class="muted" style="font-size:14px">Touchez les vôtres. Les prises ne sont proposées qu'aux électriciens, l'eau aux plombiers, la clim aux climaticiens.</div><div class="met">${MET.map(([k,n])=>`<button class="bt${M.includes(k)?" on":""}" data-met="${k}" aria-pressed="${M.includes(k)}">${M.includes(k)?"✓ ":""}${n}</button>`).join("")}</div><button class="bt go big" data-a="metok">C'est noté</button>`}

/* Une seule ligne sous le dessin : l'élément touché (ses 2 cotes à taper, « Encore un », Enlever), sinon le gros bouton Ajouter. */
function barHTML(name,inputs,tp){const e=V.sel>=0;
 if(!fams().length)return`<div class="cons"><i></i><span>Les portes et fenêtres sont affichées. Les prises, l'eau et la clim s'ajoutent pour les électriciens, plombiers et climaticiens (« Mes métiers » en bas).</span></div>`;
 if(e){const it=V.tab==="mur"?eqs(wall().s)[V.sel]:(room().eqp||[])[V.sel];const M=V.tab==="mur"&&mods(it);return`<div class="bar"><b class="nm">${esc(name)}</b>${inputs}${M?`<div class="postes"><span>Sur la plaque <small>touchez un poste pour le changer</small></span><div class="pz">${M.map((t,k)=>`<button data-a="poste" data-k="${k}" aria-label="Poste ${k+1} : ${esc(MECA[t])}"><svg viewBox="-10 -10 20 20" aria-hidden="true"><rect class="bx" x="-9" y="-9" width="18" height="18" rx="4"/>${MG[t](0,0)}</svg><em>${esc(MN[t][0])}</em></button>`).join("")}${M.length<4?`<button class="pz-a" data-a="posteplus" aria-label="Ajouter un poste">＋</button>`:""}${M.length>1?`<button class="pz-a" data-a="postemoins" aria-label="Retirer le dernier poste">−</button>`:""}</div></div>`:""}<div class="qk3 st1"><button data-st="faire" data-i="${V.sel}" aria-pressed="${!!(it&&it.st==="faire")}">${it&&it.st==="faire"?"✓ À faire (dans le devis)":"Déjà en place · touchez pour « à faire »"}</button></div><div class="acts"><button class="bt" data-a="dup">＋ Encore ${esc(un(name))}</button><button class="bt del" data-a="del" aria-label="Enlever">Enlever</button><button class="bt ok" data-a="desel">OK</button></div></div>`}
 return`<div class="cons"><i></i><span><b>Touchez ce qui est à faire</b> : il s'allume et part dans le devis. Ce qui reste pâle est déjà en place.</span></div><div class="bar0"><button class="bt go big" data-a="add">＋ Ajouter</button><button class="bt" data-a="allfaire">Tout est à faire ici</button></div><div class="note">Pour ajouter : touchez ${tp} à un endroit vide.${V.tab==="mur"?" Pour déplacer : glissez à gauche ou à droite.":" Pour déplacer : glissez."}</div>`}
const un=n=>/^(Plaque|Prise|Arrivée|Évacuation|Applique|Bouche|Grille|Cassette|Unité|Commande)/.test(n)?"une":"un";
function murHTML(){const w=wall();if(!w)return`<p class="muted">Cette pièce n'a pas encore de murs.</p>`;const sg=w.s,E=eqs(sg),O=opens(sg),e=V.sel>=0?E[V.sel]:null,W=walls();
 let h=`<div class="grid2"><div><div class="elev">${svgMur()}</div>${V.net?netLeg():""}<div class="nav"><button class="rd" data-a="prev" aria-label="Mur précédent">‹</button><span>Mur ${V.wi+1} sur ${W.length}<small>glissez le doigt sur le mur pour changer</small></span><button class="rd" data-a="next" aria-label="Mur suivant">›</button></div>`;
 h+=barHTML(e?(e.n||T[e.t].n):"",e?`<label>du sol <input data-n="h" inputmode="numeric" value="${Math.round(e.h)}"> cm</label><label>de l'angle gauche <input data-n="x" inputmode="numeric" value="${Math.round(e.x)}"> cm</label>`:"","le mur");
 h+=`</div><div>`;
 const L=[];O.forEach(o=>L.push({x:o.x1,h:`<div class="it ro"><span class="dt ouv"></span><span><b>${esc(o.nm)} ${Math.round(o.x2-o.x1)} × ${o.h}</b><small>${o.al?"allège "+o.al+" cm · ":""}à ${Math.round(o.x1)} cm de l'angle gauche</small></span></div>`}));
 E.forEach((x,i)=>{if(!vis(x.t))return;L.push({x:x.x,h:`<button class="it${i===V.sel?" on":""}" data-sel="${i}"><span class="dt ${T[x.t].f}${x.st?" "+x.st:""}"></span><span><b>${esc(x.n||T[x.t].n)}</b><small>${x.st==="faire"?"<b style=\"display:inline;color:#B8924F\">À faire</b>":"Déjà en place"} · ${Math.round(x.h)} cm du sol · ${Math.round(x.x)} cm de l'angle</small></span></button>`})});
 L.sort((a,b)=>a.x-b.x);
 h+=`<h3>Sur ce mur, de gauche à droite</h3><div class="liste">${L.length?L.map(o=>o.h).join(""):`<div class="muted" style="padding:6px 2px">Rien pour l'instant.</div>`}</div>`;
 const lc=n=>n.charAt(0).toLowerCase()+n.slice(1),all=W.reduce((a,w)=>{(K().EQ.get(w.s.a)||[]).forEach(x=>{if(vis(x.t)){const k=lc(x.t==="plq"?x.n:T[x.t].n);a[k]=(a[k]||0)+1}});return a},{});
 if(Object.keys(all).length)h+=`<div class="note">Dans toute la pièce : ${Object.keys(all).map(k=>`${all[k]} × ${esc(k)}`).join(" · ")}</div>`;
 return h+`</div></div>`}

/* Choix de l'élément : grandes tuiles avec le dessin, sans menus. */
function icoE(e){const m=Math.max(28,18*(mods(e)||[1]).length+8),hh=H();return`<svg class="wide" viewBox="${-m/2} ${hh-e.h-14} ${m} 28" aria-hidden="true">${sym({...e,x:0},-1,14,false)}</svg>`}
function icoMur(t){const d=T[t],m=Math.max(28,2*(HW[t]||9)+8,2*(HH[t]||9)+8,(d.w||0)+10,(d.hh||0)+10),hh=H();return`<svg viewBox="${-m/2} ${hh-d.h-m/2} ${m} ${m}" aria-hidden="true">${sym({t,x:0,h:d.h},-1,14,false)}</svg>`}
function icoPlaf(t){const m=({spot:16,pl:20,vmc:18,df:18,souf:34,rep:28,cas:34})[t]||36;return`<svg viewBox="${-m} ${-m} ${2*m} ${2*m}" aria-hidden="true">${symPlaf(t,0,0,1)}</svg>`}
function pickHTML(){const F=fams(),mur=V.tab==="mur",TT=mur?T:TP,keys=Object.keys(TT).filter(k=>F.includes(TT[k].f)&&!TT[k].hide&&!(mur&&k==="ge"&&wall()&&wall().s.sh));const g={};keys.forEach(k=>{(g[TT[k].f]=g[TT[k].f]||[]).push(k)});const G=Object.keys(g);
 return`<div class="pick" role="dialog" aria-label="Que posez-vous ?"><div class="pk-in"><div class="pk-h"><b>${V.pick.at?"Que posez-vous ici ?":"Que posez-vous ?"}</b><button class="rd" data-a="pickx" aria-label="Fermer">✕</button></div>${G.map(f=>`${G.length>1?`<p>${FAM[f]}</p>`:""}<div class="tiles">${g[f].map(k=>`<button class="tile" data-put="${k}">${mur?icoMur(k):icoPlaf(k)}<span>${esc(TT[k].n)}</span></button>`).join("")}</div>`).join("")}${!mur&&F.includes("el")?`<p>Spots : bien répartis d'un coup</p><div class="tiles">${SPOTS.map(([t,c,r])=>`<button class="tile sm" data-grid="${c} × ${r}">${spotIco(c,r)}<span>${t}</span></button>`).join("")}</div>`:""}</div></div>`}

function plafHTML(){const rm=room(),E=rm.eqp||[],e=V.sel>=0?E[V.sel]:null,b=bb(rm);
 let h=`<div class="grid2"><div><div class="elev">${svgPlaf()}</div>${V.net?netLeg():""}`;
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
 h+=`<div class="card"><p>À relever sur place (facultatif)</p><div class="num"><label>Puissance <input data-cn="kw" inputmode="decimal" value="${esc(c.kw||"")}"> kW</label><label>Liaisons <input data-cn="liais" inputmode="decimal" value="${esc(c.liais||"")}"> m</label></div><div class="note">Vide = noté « à vérifier ».</div></div><div class="note" style="margin-top:10px">✓ C'est tout pour cette pièce.</div>`;try{const r=window.PKRESEAUX&&PKRESEAUX.calc();if(r&&r._cs&&r._cs.length)h+=`<div class="card calc" style="margin-top:12px"><p>Votre installation</p>${r._cs.map(climSVG).join("")}</div>`}catch(e){}
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
 if(a==="mergeno"){V.merge=null;return render()}
 if(a==="mergeok"&&V.merge){const E=eqs(wall().s),A=E[V.merge.i],B=E[V.merge.j],m=mergeM();if(A&&B&&m){snap();const na=mods(A).length,nb=mods(B).length,k=PC.indexOf(d.t);while(k>=0&&m.length<k+1)m.push("pc");B.x=Math.round((A.x*na+B.x*nb)/(na+nb));setMods(B,m);if(A.st==="faire")B.st="faire";E.splice(V.merge.i,1);V.sel=E.indexOf(B)}V.merge=null;save();render();toast(V.sel>=0?eqs(wall().s)[V.sel].n:"Une seule plaque");return}
 if(a==="askx"){V.ask=false;return render()}
 if(a==="allfaire"){snap();const L=V.tab==="mur"?(K().EQ.get(wall().s.a)||[]):(room().eqp||[]),all=L.filter(e=>vis(e.t)).every(e=>e.st==="faire");L.forEach(e=>{if(vis(e.t))e.st=all?undefined:"faire"});save();render();toast(all?"Tout remis « déjà en place »":"Tout est à faire ici");return}
 if(a==="mq"){PKRESEAUX.setMarque(d.v||"");return render()}
 if(a==="net"){V.net=!V.net;return render()}
 if(a==="calc"){V.calc=!V.calc;render();if(V.calc)setTimeout(()=>{const c=$("fx").querySelector(".calc");c&&c.scrollIntoView({behavior:"smooth",block:"start"})},30);return}
 if(a==="reg"){V.reg=!V.reg;render();if(V.reg)setTimeout(()=>{const c=$("fx").querySelector(".regs");c&&c.scrollIntoView({behavior:"smooth",block:"start"})},30);return}
 if(a==="met"){V.met=!V.met;render();if(V.met)setTimeout(()=>{const c=$("fx").querySelector(".card:last-of-type");c&&c.scrollIntoView({behavior:"smooth",block:"center"})},30);return}
 if(a==="metok"){if(!metiers())setMetiers(V.metTmp||[]);V.met=false;return render()}
 if(a==="desel"){V.sel=-1;return render()}
 if(a==="prev"||a==="next")return go(a==="next"?1:-1);
 if(a==="add"){V.pick={};return render()}
 if(a==="putsplit"){V.tab="mur";const k=walls().findIndex(w=>(P.EQ.get(w.s.a)||[]).some(x=>x.t==="split"));if(k>=0){V.wi=k;V.sel=(P.EQ.get(walls()[k].s.a)||[]).findIndex(x=>x.t==="split");return render()}autoSplit();render();toast("Split posé en haut d'un mur qui donne dehors, commande près de l'interrupteur");return}
 if(a==="putsouf"||a==="putcas"){V.tab="plaf";const t=a==="putsouf"?"souf":"cas";if((room().eqp||[]).some(x=>x.t===t||x.t==="rep")){V.sel=-1;return render()}put(t);return}
 if(V.tab==="mur"){const w=wall();if(!w)return;const E=eqs(w.s),e=E[V.sel];if(!e)return;snap();
  if(a==="poste"||a==="posteplus"||a==="postemoins"){const m=mods(e),CY=["pc","int","vv","rj","tv"];if(a==="poste"){const k=+d.k;m[k]=CY[(CY.indexOf(m[k])+1)%CY.length]}else if(a==="posteplus")m.push("pc");else m.pop();setMods(e,m);save();render();focusBar();return}
  if(a==="dup"){const L=Math.round(P.dist(w.s.a,w.s.b)*100),fs=Math.max(15,(L+160)/34),st=R5(Math.max(40,((T[e.t]||{}).w||2*hw(e,L))+20));let x=e.x+st;if(x>L-5)x=e.x-st;E.push({...e,...(e.m?{m:e.m.slice()}:{}),x:Math.max(5,Math.min(L-5,R5(x)))});V.sel=E.length-1}
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

/* Loupe au-dessus du doigt pendant le glissement (le doigt cache ce qu'on touche) */
function loupe(ev,c){let d=$("fx-loupe");if(!ev){if(d)d.hidden=true;return}if(ev.pointerType==="mouse")return;const svg=DR&&DR.svg;if(!svg)return;
 if(!d){d=document.createElement("div");d.id="fx-loupe";d.innerHTML='<svg></svg><i></i>';$("fx").appendChild(d)}const S=92,Z=2,vb=svg.viewBox.baseVal,sc=vb.width/svg.getBoundingClientRect().width,w=S*sc/Z;
 const ls=d.querySelector("svg");ls.setAttribute("viewBox",`${c.x-w/2} ${c.y-w/2} ${w} ${w}`);ls.setAttribute("font-size",svg.getAttribute("font-size")||"");ls.innerHTML=svg.innerHTML;
 let top=ev.clientY-S-26;if(top<8)top=ev.clientY+30;d.style.left=Math.max(8,Math.min(innerWidth-S-8,ev.clientX-S/2))+"px";d.style.top=top+"px";d.hidden=false}
/* Doigt : sur un élément = le glisser (pas de 5 cm) ; sur le mur vide = toucher pour poser, glisser à gauche/droite = mur suivant. */
let DR=null,BG=null;
function svgPt(svg,e){const pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;return pt.matrixTransform(svg.getScreenCTM().inverse())}
function onDown(ev){if(!V||ev.target.closest(".pick"))return;const g=ev.target.closest(".sym");if(!g){const svg=ev.target.closest("#fx-esvg,#fx-psvg");BG=svg?{svg,x0:ev.clientX,y0:ev.clientY,id:ev.pointerId}:null;return}const svg=g.ownerSVGElement;const i=+g.dataset.i;V.sel=i;DR={i,svg,id:ev.pointerId,moved:false,x0:ev.clientX,y0:ev.clientY};try{svg.setPointerCapture(ev.pointerId)}catch(e){}ev.preventDefault();svg.querySelectorAll(".sym").forEach(s=>s.classList.toggle("on",+s.dataset.i===i))}
function onMove(ev){if(!DR||ev.pointerId!==DR.id)return;if(!DR.moved&&Math.hypot(ev.clientX-DR.x0,ev.clientY-DR.y0)<4)return;if(!DR.moved){DR.moved=true;snap()}const Pt=svgPt(DR.svg,ev),P=K();
 if(V.tab==="mur"){const w=wall(),e=eqs(w.s)[DR.i],L=Math.round(P.dist(w.s.a,w.s.b)*100);const r=RR(),E=eqs(w.s),a=hw(e,L),lo=Math.max(r.coin,a),hi=L-Math.max(r.coin,a);let x=Math.max(lo,Math.min(hi,R5(Pt.x)));
  /* collé à l'élément voisin, jamais l'un sur l'autre (Cyril 17/11) */for(let n=0;n<3;n++)E.forEach((o,j)=>{if(j===DR.i||Math.abs(o.h-e.h)>=Math.max(18,(HH[o.t]||8)+(HH[e.t]||8)))return;const d=a+hw(o,L);if(Math.abs(x-o.x)<d)x=x>=o.x?o.x+d:o.x-d});
  e.x=Math.round(Math.max(lo,Math.min(hi,x)));/* hauteur fixée par la règle : on glisse seulement à l'horizontale (Cyril) */const el=$("fx").querySelector(".elev");el.innerHTML=svgMur();DR.svg=$("fx-esvg");try{DR.svg.setPointerCapture(DR.id)}catch(e){}loupe(ev,{x:e.x,y:H()-e.h})}
 else{const rm=room(),e=rm.eqp[DR.i],b=bb(rm);e.x=Math.max(b[0],Math.min(b[2],b[0]+R5(Pt.x-b[0])))/100;e.y=Math.max(b[1],Math.min(b[3],b[1]+R5(Pt.y-b[1])))/100;const el=$("fx").querySelector(".elev");el.innerHTML=svgPlaf();DR.svg=$("fx-psvg");try{DR.svg.setPointerCapture(DR.id)}catch(e){}loupe(ev,{x:e.x*100,y:e.y*100})}}
function onUp(ev){loupe(null);if(DR&&DR.moved&&V.tab==="mur"){const w=wall(),E=eqs(w.s),e=E[DR.i],L=Math.round(K().dist(w.s.a,w.s.b)*100);if(e&&mods(e)){const j=E.findIndex((o,j)=>j!==DR.i&&mods(o)&&Math.abs(o.h-e.h)<10&&Math.abs(o.x-e.x)<=hw(o,L)+hw(e,L)+1);if(j>=0&&mods(e).length+mods(E[j]).length<=4)V.merge={i:DR.i,j}}}
 if(DR){const m=DR.moved,i=DR.i;DR=null;if(!m){/* un toucher = à faire / déjà en place (Cyril 17/11) */const it=V.tab==="mur"?eqs(wall().s)[i]:(room().eqp||[])[i];if(it){snap();it.st=it.st==="faire"?undefined:"faire"}V.sel=i}save();render();return}
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
window.PKFACES={open,close,metiers,setMetiers,compo,mods,rtype,T};
})();
