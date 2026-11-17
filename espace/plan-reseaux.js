/* ProClik · Réseaux calculés pour le devis (Cyril 17/11) : circuits électriques et tableau, câbles (longueur, section, couleur),
   gaines, boîtes ; plomberie (multicouche en pieuvre depuis la nourrice, évacuations PVC) ; clim (liaisons, condensats).
   Rien à saisir : tout part des éléments posés sur les murs et au plafond. Sert aussi à la vue « Dans les murs ».
   Références : NF C 15-100 (circuits, sections, protections, différentiels), DTU 60.11 / usages (diamètres d'évacuation et d'alimentation).
   Les choix de passage (par le plafond pour l'électricité, par le sol pour l'eau) et les marges sont des HYPOTHÈSES listées dans le résultat. */
(function(){
"use strict";
const K=()=>window.PKPLAN,X=()=>window.PKFACES;
/* Normes et usages utilisés. « norme » = NF C 15-100 / DTU ; « usage » = pratique courante, à ajuster par l'artisan. */
const N={
 eclMax:8,      /* norme : 8 points lumineux max par circuit, 1,5 mm², 10 ou 16 A */
 pcMax:12,      /* norme : 12 socles max par circuit en 2,5 mm² / 20 A */
 ptravMax:6,    /* norme : circuit des prises du plan de travail de cuisine, 6 socles max */
 idMax:8,       /* norme : 8 circuits max par interrupteur différentiel */
 rang:13,       /* usage : rangées de 13 modules (Legrand Drivia 13, Schneider Resi9 13) */
 reserve:.2,    /* norme : 20 % de place libre dans le tableau */
 marge:.10,     /* usage : 10 % de marge sur les longueurs */
 lov:.3,        /* usage : 30 cm de réserve de fil dans chaque boîte */
 plancher:.2,   /* usage : épaisseur de plancher entre deux niveaux, en m */
 pente:.02      /* norme DTU 60.11 : pente des évacuations entre 1 et 3 cm par mètre ; 2 cm/m retenu */
};
/* Marque de l'électricien (Cyril 17/11) : il choisit son fournisseur habituel ; « Autre » = sans marque */
const MQ={schneider:{n:"Schneider Electric",coffret:"Resi9 13 modules",app:"Odace"},legrand:{n:"Legrand",coffret:"Drivia 13 modules",app:"Dooxie"},hager:{n:"Hager",coffret:"Gamma 13 modules",app:"Essensya"}};
function marque(){try{return localStorage.getItem("pk-marque")||""}catch(e){return""}}
function setMarque(v){try{localStorage.setItem("pk-marque",v)}catch(e){}}
const COL={ph:"rouge",ne:"bleu",te:"vert/jaune",ret:"orange",nav:"violet"};
const r1=v=>Math.round(v*10)/10;
/* ---- positions dans la maison (m) ---- */
function leftIsA(P,sg){if(sg.kind!=="mur")return true;const n=P.inward(sg),d=[sg.b[0]-sg.a[0],sg.b[1]-sg.a[1]];return d[0]*n[1]-d[1]*n[0]>0}
function points(){const P=K(),ST=P.ST,out=[];let z=0;
 ST.floors.forEach((f,fi)=>{const H=f.H||2.5,zf=z;z+=H+N.plancher;
  P.segs(f).forEach(sg=>{const E=P.EQ.get(sg.a);if(!E||!E.length)return;const L=P.dist(sg.a,sg.b),la=leftIsA(P,sg),A=la?sg.a:sg.b,B=la?sg.b:sg.a,u=[(B[0]-A[0])/L,(B[1]-A[1])/L];
   E.forEach((e,i)=>{const t=e.x/100;out.push({e,i,w:1,sg,rm:sg.rm,f,fi,H,zf,x:A[0]+u[0]*t,y:A[1]+u[1]*t,s:t,h:e.h/100,lw:L,A,B})})});
  f.rooms.forEach(rm=>(rm.eqp||[]).forEach((e,i)=>out.push({e,i,w:0,rm,f,fi,H,zf,x:e.x,y:e.y,h:H})))});
 return out}
const zab=p=>p.zf+p.h;
/* Passage électrique : par le plafond du niveau le plus bas des deux ; le long du mur si même mur et même hauteur. */
function viaEl(a,b){if(a.w&&b.w&&a.sg.a===b.sg.a&&Math.abs(a.h-b.h)<.15)return{L:Math.abs(a.s-b.s)+Math.abs(a.h-b.h),via:"ligne"};
 const lo=a.zf<=b.zf?a:b,top=lo.zf+lo.H,plaf=Math.abs(a.x-b.x)+Math.abs(a.y-b.y)+Math.abs(top-zab(a))+Math.abs(top-zab(b));
 if(a.w&&b.w&&a.rm===b.rm&&a.fi===b.fi){const mur=Math.abs(a.x-b.x)+Math.abs(a.y-b.y)+Math.abs(a.h-b.h);if(mur<plaf)return{L:mur,via:"mur"}}
 return{L:plaf,via:"plafond"}}
function hopEl(a,b){return viaEl(a,b).L}
/* Passage de l'eau : par le sol du niveau le plus haut des deux. */
function hopEau(a,b){return Math.abs(a.x-b.x)+Math.abs(a.y-b.y)+Math.abs(zab(a)-zab(b))}
/* Chaînage au plus proche, à partir d'un départ */
function chaine(dep,L,hop){const rest=L.slice(),seq=[];let cur=dep;while(rest.length){let k=0,best=1e9;rest.forEach((p,i)=>{const d=hop(cur,p);if(d<best){best=d;k=i}});const p=rest.splice(k,1)[0];seq.push({a:cur,b:p,L:best});cur=p}return seq}
const nm=e=>String(e.n||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
const faire=p=>p.e.st==="faire";

function calc(){const P=K(),F=X();if(!P||!F)return null;const pts=points(),hyp=[],T=F.T;
 const mods=F.mods,rtype=F.rtype,surf=P.ST.floors.reduce((a,f)=>a+(f.comb?0:f.rooms.reduce((s,rm)=>s+Math.abs(area(rm.pts)),0)),0);
 /* Tableau : celui posé sur le plan, sinon estimé dans l'entrée (ou la 1re pièce) du rez-de-chaussée */
 let tab=pts.find(p=>p.e.t==="tab");
 if(!tab){const f=P.ST.floors[0],rm=f.rooms.find(r=>rtype(r.nom)==="circ")||f.rooms[0];if(!rm)return null;const a=rm.pts[0],b=rm.pts[1]||a;tab={x:(a[0]+b[0])/2,y:(a[1]+b[1])/2,h:1.6,zf:0,H:f.H||2.5,fi:0,rm,w:0,est:1,e:{t:"tab"}};hyp.push("Tableau : position estimée dans "+rm.nom+" (posez « Tableau électrique » sur un mur pour un calcul exact).")}
 const circ=[],hops=[];
 const add=(c,L,tout)=>{c.nb=L.length;c.pts=L;circ.push(c);const seq=chaine(tab,L,hopEl);seq.forEach(s=>{s.k=c.k;s.c=c;s.via=viaEl(s.a,s.b).via});c.hops=seq;c.faire=L.some(faire);c.L=seq.filter(s=>faire(s.b)).reduce((a,s)=>a+s.L,0)};
 /* --- éclairage : points lumineux (plafonnier, applique, groupe de spots d'une pièce = 1 point) --- */
 const lum=[];const roomsSpots=new Map();
 pts.forEach(p=>{const t=p.e.t;if(t==="pl"||t==="app")lum.push(p);else if(t==="spot"){const k=p.rm;if(!roomsSpots.has(k))roomsSpots.set(k,[]);roomsSpots.get(k).push(p)}});
 roomsSpots.forEach(L=>{const first=L[0];first.spots=L;lum.push(first)});
 const ord=chaine(tab,lum,hopEl).map(s=>s.b);for(let i=0;i<ord.length;i+=N.eclMax)add({k:"ecl",n:"Éclairage",sec:1.5,dj:"10 A",gaine:16},ord.slice(i,i+N.eclMax));
 /* --- prises --- */
 const soc=[],ptrav=[],spe=[];
 pts.forEach(p=>{const m=p.w&&mods(p.e);const t=p.e.t,n=nm(p.e);
  if(t==="p32")return spe.push({p,n:"Plaque de cuisson",sec:6,dj:"32 A",A:1,gaine:25});
  if(t==="cee")return spe.push({p,n:"Chauffe-eau",sec:2.5,dj:"20 A",hc:1,gaine:20});
  if(t==="split")return spe.push({p,n:"Climatisation",sec:2.5,dj:"20 A",gaine:20,note:"selon la notice de l'appareil"});
  if(!m||!m.includes("pc"))return;
  if(t==="pc"&&/lave-linge|seche-linge/.test(n))return spe.push({p,n:/seche/.test(n)?"Sèche-linge":"Lave-linge",sec:2.5,dj:"20 A",A:/lave-linge/.test(n)?1:0,gaine:20});
  if(t==="pc"&&/lave-vaisselle/.test(n))return spe.push({p,n:"Lave-vaisselle",sec:2.5,dj:"20 A",gaine:20});
  if(t==="pc"&&/four/.test(n))return spe.push({p,n:"Four",sec:2.5,dj:"20 A",gaine:20});
  const k=m.filter(x=>x==="pc").length;(/plan de travail/.test(n)?ptrav:soc).push({p,k})});
 const pack=(L,max,c)=>{const o=chaine(tab,L.map(x=>x.p),hopEl).map(s=>L.find(x=>x.p===s.b));let cur=[],n=0;o.forEach(x=>{if(n+x.k>max&&cur.length){add({...c},cur);cur=[];n=0}cur.push(x.p);n+=x.k});if(cur.length)add({...c},cur)};
 pack(soc,N.pcMax,{k:"pc",n:"Prises",sec:2.5,dj:"20 A",gaine:20});
 pack(ptrav,N.ptravMax,{k:"pc",n:"Prises plan de travail",sec:2.5,dj:"20 A",gaine:20});
 spe.forEach(s=>add({k:"spe",n:s.n,sec:s.sec,dj:s.dj,A:s.A,hc:s.hc,gaine:s.gaine,note:s.note},[s.p]));
 if(pts.some(p=>p.e.t==="vmc"||p.e.t==="vmcm")){const v=pts.filter(p=>p.e.t==="vmc"||p.e.t==="vmcm");add({k:"spe",n:"VMC",sec:1.5,dj:"2 A",gaine:16},[v[0]]);hyp.push("VMC : groupe supposé près de la 1re bouche (à ajuster).")}
 if(pts.some(p=>p.e.t==="ge"))add({k:"spe",n:"Groupe extérieur clim",sec:2.5,dj:"20 A",gaine:20,note:"selon la notice"},[pts.find(p=>p.e.t==="ge")]);
 const elc=circ.slice();
 /* --- commandes : interrupteurs reliés au point lumineux de leur pièce --- */
 const cmd=[];pts.forEach(p=>{if(!p.w)return;const m=mods(p.e);if(!m)return;m.forEach(t=>{if(t==="int"||t==="vv")cmd.push({p,t})})});
 const vvRoom=new Map();
 cmd.forEach(c=>{const l=lum.filter(x=>x.rm===c.p.rm&&x.fi===c.p.fi);const src=l.length?l.reduce((a,x)=>hopEl(a,c.p)<hopEl(x,c.p)?a:x):null;if(!src)return;
  const L=hopEl(src,c.p);let fils;if(c.t==="int")fils=[["ph",1.5],["ret",1.5]];else{const k=c.p.rm;const n=(vvRoom.get(k)||0);vvRoom.set(k,n+1);fils=n%2===0?[["ph",1.5],["nav",1.5],["nav",1.5]]:[["ret",1.5],["nav",1.5],["nav",1.5]]}
  hops.push({k:"cmd",a:src,b:c.p,L,fils,gaine:16,via:viaEl(src,c.p).via})});
 /* --- communication : en étoile depuis le coffret, à côté du tableau --- */
 const com=[];pts.forEach(p=>{if(!p.w)return;const m=mods(p.e);if(!m)return;m.forEach(t=>{if(t==="rj"||t==="tv")com.push({p,t})})});
 com.forEach(c=>hops.push({k:"com",a:tab,b:c.p,L:hopEl(tab,c.p),t:c.t,gaine:20}));
 circ.forEach(c=>c.hops.forEach(s=>hops.push(s)));
 roomsSpots.forEach(L=>{const c=circ.find(c=>c.pts.includes(L[0]));if(!c)return;chaine(L[0],L.slice(1),hopEl).forEach(s=>{s.k="ecl";s.c=c;s.via="plafond";hops.push(s)})});
 /* ---- Quantités électricité (seulement ce qui est À FAIRE) ---- */
 const fil={},gaine={},boite={},addF=(k,sec,L)=>{const key=sec+" mm² "+COL[k];fil[key]=(fil[key]||0)+L},addG=(d,L)=>{gaine[d]=(gaine[d]||0)+L},addB=(n,q)=>{boite[n]=(boite[n]||0)+(q||1)};
 const lng=L=>L*(1+N.marge)+2*N.lov;
 hops.forEach(s=>{if(!faire(s.b))return;const L=lng(s.L);
  if(s.k==="cmd")s.fils.forEach(([k,sec])=>addF(k,sec,L));
  else if(s.k==="com"){const n=s.t==="tv"?"Câble coaxial TV 17 VATC":"Câble grade 2TV (catégorie 6)";fil[n]=(fil[n]||0)+L}
  else{const c=s.c;["ph","ne","te"].forEach(k=>addF(k,c.sec,L))}
  addG("ICTA Ø"+(s.gaine||s.c.gaine)+" mm",L*(1+N.marge))});
 pts.forEach(p=>{if(!faire(p))return;const t=p.e.t,m=p.w&&mods(p.e);
  if(m)addB("Boîte d'encastrement "+m.length+" poste"+(m.length>1?"s":""));else if(t==="pl"||t==="app")addB("Boîte DCL + douille");else if(t==="spot")addB("Spot encastré (boîte/capot de protection)");else if(t==="p32")addB("Boîte de sortie de câble 32 A")});
 /* ---- Tableau (toute la maison : un tableau neuf sert tous les circuits) ---- */
 const nA=elc.filter(c=>c.A).length,nAC=elc.length-nA;let idAC=surf<=35?1:surf<=100?2:3;idAC=Math.max(idAC,Math.ceil(nAC/N.idMax));const idA=nA?Math.max(1,Math.ceil(nA/N.idMax)):0;
 const dj={};elc.forEach(c=>{const k="Disjoncteur "+c.dj+" (phase + neutre)";dj[k]=(dj[k]||0)+1});
 const hc=elc.some(c=>c.hc);const mod=elc.length+2*(idAC+idA)+(hc?1:0);
 const G=[];for(let i=0;i<idA;i++)G.push({id:"40 A type A",c:[]});for(let i=0;i<idAC;i++)G.push({id:(surf<=35?"25 A":"40 A")+" type AC",c:[]});
 const gA=G.filter(g=>/type A$/.test(g.id)),gAC=G.filter(g=>/AC$/.test(g.id));let ia=0,ic=0;
 elc.forEach(c=>{if(c.A){gA[ia%gA.length].c.push(c);ia++}else{const g=gAC.slice().sort((x,y)=>x.c.length-y.c.length)[0];g.c.push(c);ic++}});
 /* une rangée de 13 modules par différentiel (2 modules + ses disjoncteurs) ; on ajoute des rangées s'il faut garder 20 % de place libre */
 const rangs=G.map(g=>[{t:"id",n:"ID 30 mA "+g.id,m:2}].concat(g.c.map(c=>({t:"dj",n:c.n,cal:c.dj,m:1}))).concat(g.c.some(c=>c.hc)?[{t:"hc",n:"Contacteur HC",m:1}]:[]));
 let rang=Math.max(rangs.length,Math.ceil(mod*(1+N.reserve)/N.rang));while(rangs.length<rang)rangs.push([]);
 const tableau={surface_m2:r1(surf),circuits:elc.map(c=>({n:c.n,section_mm2:c.sec,disjoncteur:c.dj,points:c.nb,differentiel:c.A?"type A":"type AC",...(c.note?{note:c.note}:{})})),
  differentiels:[{n:"Interrupteur différentiel 30 mA "+(surf<=35?"25 A":"40 A")+" type AC",q:idAC}].concat(idA?[{n:"Interrupteur différentiel 30 mA 40 A type A (plaque de cuisson, lave-linge)",q:idA}]:[]),
  disjoncteurs:Object.keys(dj).map(n=>({n,q:dj[n]})),autres:[{n:"Peigne d'alimentation",q:rang},{n:"Bornier de terre",q:1}].concat(hc?[{n:"Contacteur heures creuses (chauffe-eau)",q:1}]:[]),
  modules:mod,rangees:rang,rangs,coffret:(MQ[marque()]?`${MQ[marque()].n} ${MQ[marque()].coffret}`:`Coffret ${N.rang} modules`)+` × ${rang} rangée${rang>1?"s":""}`,marque:MQ[marque()]?{n:MQ[marque()].n,tableau:MQ[marque()].coffret,appareillage:MQ[marque()].app}:null,
  ...(com.length?{communication:"Coffret de communication (grade 2TV) dans la gaine technique, à côté du tableau"}:{})};
 hyp.push("Électricité : au plus court, dans le mur quand les points sont dans la même pièce, sinon par le plafond puis descente dans le mur ; fils H07V-U sous gaine ICTA ; marge "+Math.round(N.marge*100)+" % + "+N.lov*100+" cm dans chaque boîte.");
 hyp.push("Tableau : compté pour tous les circuits de la maison ; différentiels selon la surface ("+r1(surf)+" m²), 8 circuits max chacun, 20 % de place libre.");
 /* ---- Plomberie ---- */
 const eau=[],evs=[];
 pts.forEach(p=>{const t=p.e.t;if(t==="ef"||t==="ec")eau.push({p,c:t});else if(t==="mit"){eau.push({p,c:"ef"});eau.push({p,c:"ec"})}else if(t==="ev")evs.push(p)});
 let nour=pts.find(p=>p.e.t==="nour")||pts.find(p=>p.e.t==="cee");
 if(!nour&&eau.length){const by=new Map();eau.forEach(o=>by.set(o.p.rm,(by.get(o.p.rm)||0)+1));let rm=null,n=-1;by.forEach((v,k)=>{if(v>n){n=v;rm=k}});const o=eau.find(x=>x.p.rm===rm);nour={...o.p,h:.4,est:1,e:{t:"nour"}};hyp.push("Nourrice : position estimée dans "+rm.nom+" (posez « Nourrice » sur un mur pour un calcul exact). L'arrivée jusqu'à la nourrice est à mesurer.")}
 const mc={},pvc={},rac={},addM=(k,L)=>{mc[k]=(mc[k]||0)+L},addP=(k,L)=>{pvc[k]=(pvc[k]||0)+L},addR=(k,q)=>{rac[k]=(rac[k]||0)+(q||1)};
 eau.forEach(o=>{const L=hopEau(nour,o.p);hops.push({k:o.c,a:nour,b:o.p,L});if(!faire(o.p))return;addM("Multicouche 16 × 2 "+(o.c==="ef"?"(eau froide, gaine bleue)":"(eau chaude, gaine rouge)"),L*(1+N.marge));addR("Raccord à sertir 16 sur la nourrice");addR("Applique à sertir 16 (sortie de mur)");addR("Coude à sertir 16",(Math.abs(nour.x-o.p.x)>.05&&Math.abs(nour.y-o.p.y)>.05?1:0)+(Math.abs(zab(nour)-zab(o.p))>.05?2:0)+1)});
 const nEF=eau.filter(o=>o.c==="ef"&&faire(o.p)).length,nEC=eau.filter(o=>o.c==="ec"&&faire(o.p)).length;
 if(nEF){addR("Nourrice eau froide "+nEF+" départ"+(nEF>1?"s":""));addR("Raccord à sertir d'arrivée sur nourrice")}if(nEC){addR("Nourrice eau chaude "+nEC+" départ"+(nEC>1?"s":""));addR("Raccord à sertir d'arrivée sur nourrice")}
 const dia=p=>{const n=nm(p.e);return/wc/.test(n)?100:/lavabo|bidet|vasque/.test(n)?32:40};
 const chutes=new Map();
 evs.forEach(p=>{let ch=chutes.get(p.fi);if(!ch){ch=evs.find(q=>q.fi===p.fi&&dia(q)===100)||evs.find(q=>dia(q)===100)||evs.find(q=>q.fi===p.fi);ch={...ch,h:0};chutes.set(p.fi,ch);if(dia(ch)!==100||ch.fi!==p.fi)ch.est=1}
  const Lh=Math.abs(p.x-ch.x)+Math.abs(p.y-ch.y),chute=Lh*N.pente,L=Lh+p.h;hops.push({k:"ev",a:ch,b:p,L,d:dia(p),Lh,chute});
  if(faire(p)&&p.h<chute+.01&&dia(p)!==100)hyp.push(`⚠ ${p.e.n||"Évacuation"} (${p.rm.nom}) : ${String(r1(Lh)).replace(".",",")} m jusqu'à la chute, il faut ${Math.round(chute*100)} cm de pente mais la sortie est à ${Math.round(p.h*100)} cm du sol : prévoir une réhausse (receveur, socle) ou un passage sous le plancher.`);if(!faire(p))return;const d=dia(p);addP("PVC évacuation Ø"+d+" (gris)",L*(1+N.marge));addR("Coude PVC Ø"+d+" à coller",2+(Math.abs(p.x-ch.x)>.05&&Math.abs(p.y-ch.y)>.05?1:0));const mj=Math.ceil(L*(1+N.marge)/4)-1;if(mj>0)addR("Manchon PVC Ø"+d+" à coller",mj);if(d!==100)addR("Culotte / té Ø100 × Ø"+d+" à coller");addR("Collier de fixation Ø"+d,Math.max(1,Math.ceil(L/.8)))});
 if(evs.some(faire)){addR("Colle PVC (pot)");addR("Décapant PVC")}
 chutes.forEach(ch=>{if(ch.zf>0){addP("PVC chute Ø100 (gris, descente jusqu'au rez-de-chaussée)",ch.zf);hyp.push("Chute Ø100 : descente jusqu'au rez-de-chaussée comptée ; le raccordement au tout-à-l'égout est à mesurer.")}});
 if(evs.length)hyp.push("Évacuations : diamètres DTU (WC Ø100, lavabo/bidet Ø32, douche, baignoire, évier, lave-linge Ø40), pente de 2 cm par mètre (DTU 60.11 : entre 1 et 3 cm par mètre) vers la chute, branchée au WC, tuyaux le long des murs ; raccords à coller : 2 coudes par branchement (+1 s'il tourne), 1 manchon par barre de 4 m, 1 collier tous les 80 cm (estimation).");
 if(eau.length)hyp.push("Alimentation : multicouche 16 × 2 en pieuvre (une ligne par point d'eau froide ou chaude), passée dans les murs à l'horizontale, montée ou descente seulement là où il faut ; coudes à sertir : 1 au point d'eau, 1 par angle, 2 par changement de hauteur ; marge "+Math.round(N.marge*100)+" %.");
 /* ---- Clim ---- */
 const clim={},cr={};pts.filter(p=>p.e.t==="split").forEach(s=>{const g=pts.find(q=>q.e.t==="ge"&&q.fi===s.fi)||pts.find(q=>q.e.t==="ge");const c=pts.find(q=>q.e.t==="cond"&&q.rm===s.rm);
  if(g){const L=Math.abs(s.x-g.x)+Math.abs(s.y-g.y)+Math.abs(zab(s)-zab(g))+.3;hops.push({k:"clim",a:s,b:g,L});if(faire(s)){const l=r1(L*(1+N.marge));clim["Liaisons frigorifiques cuivre isolé 1/4\" + 3/8\" (jusqu'à environ 3,5 kW ; 1/4\" + 1/2\" au-delà, selon la notice)"]=(clim["Liaisons frigorifiques cuivre isolé 1/4\" + 3/8\" (jusqu'à environ 3,5 kW ; 1/4\" + 1/2\" au-delà, selon la notice)"]||0)+l;clim["Câble d'interconnexion 4G1,5"]=(clim["Câble d'interconnexion 4G1,5"]||0)+l;clim["Goulotte / cache-liaisons"]=(clim["Goulotte / cache-liaisons"]||0)+l}}
  else if(faire(s))hyp.push("Clim : placez le groupe extérieur pour calculer les liaisons (sinon à mesurer).");
  if(faire(s)){cr["Écrou flare 1/4\" (souvent fourni avec l'appareil)"]=(cr["Écrou flare 1/4\" (souvent fourni avec l'appareil)"]||0)+2;cr["Écrou flare 3/8\" (souvent fourni avec l'appareil)"]=(cr["Écrou flare 3/8\" (souvent fourni avec l'appareil)"]||0)+2;cr["Fourreau de traversée de mur"]=(cr["Fourreau de traversée de mur"]||0)+1;cr["Support mural du groupe extérieur"]=(cr["Support mural du groupe extérieur"]||0)+(g?1:0)}
  if(c&&faire(s)){cr["Raccord de condensats + coude"]=(cr["Raccord de condensats + coude"]||0)+1;const L=g?Math.abs(c.x-g.x)+Math.abs(c.y-g.y)+Math.abs(zab(c)-zab(g)):0;if(g){hops.push({k:"cond",a:c,b:g,L});clim["Tube de condensats Ø16"]=(clim["Tube de condensats Ø16"]||0)+r1(L*(1+N.marge))}}});
 const R=o=>{const r={};Object.keys(o).forEach(k=>{if(o[k])r[k]=r1(o[k])});return r};
 const cour=o=>{const r={};Object.keys(o).forEach(k=>{if(/^(1\.5|2\.5) mm²/.test(k))r[k]=Math.ceil(o[k]/100)});return r};
 return{version:"2026-11-17",electricite:{tableau,fils_m:R(fil),fils_couronnes_100m:cour(fil),gaines_m:R(gaine),boites:boite},plomberie:{multicouche_m:R(mc),pvc_m:R(pvc),raccords:rac},climatisation:R(clim),climatisation_raccords:cr,hypotheses:hyp,_hops:hops,_tab:tab,_nour:nour}}
function area(p){let s=0;for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length];s+=a[0]*b[1]-b[0]*a[1]}return s/2}
/* Résultat pour l'export (sans les objets internes) */
function exporter(){const r=calc();if(!r)return null;const o={...r};delete o._hops;delete o._tab;delete o._nour;return o}
window.PKRESEAUX={calc,exporter,N,MQ,marque,setMarque};
})();
