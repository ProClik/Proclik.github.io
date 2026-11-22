/* ProClik · Cliky lit la photo d'un plan (option Cliky, Cyril 22/11, point C16 de PLAN-A-BRANCHER.md).
   L'artisan prend en photo un plan (d'architecte, de vente, ou un croquis à main levée) ou choisit un PDF :
   Cliky le lit (service /espace/lire-photo, clé Claude) et propose un plan ProClik, pièce par pièce, avec ce qu'il a dû
   déduire. « Mettre ce plan » : le plan est posé, chaque point douteux devient une note « à reprendre » épinglée dans
   sa pièce, et les fenêtres/portes arrivent sans état (elles tombent dans « À vérifier »).
   RÈGLE (Cyril) : rien de lu sur une photo ne part en commande ni en demande de prix fournisseur sans mesure sur place :
   le niveau est marqué « lu sur photo » (export lu_sur_photo) et le pré-devis le rappelle.
   Où : dans l'aide « ? » (« Partir d'une photo de plan ») et, tant que le plan est vide, un bouton sur le plan. */
(function(){
"use strict";
if(/[?&]client/.test(location.search))return;
const K=()=>window.PKPLAN,$=id=>document.getElementById(id);
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fr=v=>String(Math.round(v*100)/100).replace(".",",");
const toast=t=>{try{window.PKNOTES.toast(t)}catch(e){}};
const ckOn=()=>{try{return window.PKNOTES.ckOn()}catch(e){return false}};
const api=()=>{try{const V=parent!==window&&parent.PCV;if(V&&V.api)return V.api}catch(e){}return null};
const CKI='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="8" width="14" height="11" rx="4"/><path d="M12 4.8V8"/><circle cx="12" cy="3.6" r="1.3" fill="currentColor" stroke="none"/><circle cx="9.5" cy="13.4" r="1.25" fill="currentColor" stroke="none"/><circle cx="14.5" cy="13.4" r="1.25" fill="currentColor" stroke="none"/></svg>';
const PHI='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h3l1.6-2.2h6.8L17 8h3v11H4z"/><path d="M8.5 16.5v-5h4v5M12.5 13.5h3"/></svg>';
let LU=null;

const CSS=`
#pf-card{position:fixed;inset:0;z-index:80;display:grid;place-items:center;background:rgba(11,18,38,.38);padding:16px;padding-top:max(16px,env(safe-area-inset-top,0px));padding-bottom:max(16px,env(safe-area-inset-bottom,0px))}
#pf-card[hidden]{display:none}
#pf-card .in{width:min(560px,100%);max-height:100%;overflow:auto;background:var(--bg);color:var(--fg);border-radius:22px;box-shadow:0 20px 60px rgba(11,18,38,.3);padding:18px 18px 16px;font:500 15px/1.45 var(--f)}
#pf-card h3{margin:0 0 4px;font:800 19px/1.25 var(--f)}#pf-card .sub{color:var(--muted);margin:0 0 12px;font-size:14px}
#pf-card .hd{display:flex;gap:12px;align-items:center;margin:0 0 10px}#pf-card .hd .cki{flex:none;width:42px;height:42px;border-radius:12px;background:#1B2440;color:#fff;display:grid;place-items:center}#pf-card .hd .cki svg{width:26px;height:26px}
:root[data-theme="dark"] #pf-card .hd .cki{background:#F2EEE4;color:#1B2440}
#pf-card .pv{background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:8px;margin:0 0 10px}#pf-card .pv svg{display:block;width:100%;height:auto;max-height:42vh}
#pf-card .pv .r{fill:rgba(184,146,79,.10);stroke:var(--fg);stroke-width:2.2;vector-effect:non-scaling-stroke;stroke-linejoin:round}
#pf-card .pv .w{stroke:#2F7DE1;stroke-width:5;vector-effect:non-scaling-stroke;stroke-linecap:butt}#pf-card .pv .d{stroke:#B8924F;stroke-width:5;vector-effect:non-scaling-stroke}#pf-card .pv polyline.c{fill:none;stroke:var(--fg,#0B1226);stroke-width:3;vector-effect:non-scaling-stroke;stroke-linecap:round}#pf-card .pv line.e{stroke:#7A8499;stroke-width:4;stroke-dasharray:3 2;vector-effect:non-scaling-stroke}#pf-card .pv text.e{fill:#7A8499;font-weight:700}
#pf-card .pv text{font-family:var(--f);font-weight:800;fill:var(--fg);text-anchor:middle}#pf-card .pv text.s{font-weight:600;fill:var(--muted)}
#pf-card .tabs{display:flex;gap:6px;margin:0 0 8px;flex-wrap:wrap}#pf-card .tabs button{appearance:none;border:1px solid var(--line);background:var(--surface);color:var(--fg);border-radius:999px;padding:6px 12px;font:800 13.5px var(--f);cursor:pointer;min-height:36px}#pf-card .tabs button[aria-pressed="true"]{background:#1B2440;color:#fff;border-color:#1B2440}
:root[data-theme="dark"] #pf-card .tabs button[aria-pressed="true"]{background:#F2EEE4;color:#1B2440;border-color:#F2EEE4}
#pf-card .ech{display:flex;gap:8px;align-items:flex-start;font-size:14px;color:var(--muted);margin:0 0 8px}#pf-card .ech i{flex:none;width:7px;height:7px;border-radius:50%;background:#B8924F;margin-top:7px}
#pf-card .av{margin:0 0 12px;padding:0;list-style:none;border-top:1px solid var(--line)}#pf-card .av li{display:flex;gap:10px;padding:9px 2px;border-bottom:1px solid var(--line);font-size:14px}#pf-card .av li b{flex:none;font-weight:800;min-width:0;max-width:40%}#pf-card .av li span{color:var(--fg)}
#pf-card .av .ttl{display:block;font:800 14px var(--f);padding:10px 2px 4px;border:0}
#pf-card .rule{background:rgba(184,146,79,.14);border-radius:12px;padding:9px 12px;font-size:13.5px;margin:0 0 12px}
#pf-card .row{display:flex;gap:10px;flex-wrap:wrap}#pf-card .row.fin{position:sticky;bottom:-16px;background:var(--bg);margin:0 -18px -16px;padding:10px 18px 16px;box-shadow:0 -8px 14px -10px rgba(11,18,38,.25)}#pf-card .go{appearance:none;flex:1 1 200px;min-height:52px;border:0;border-radius:999px;background:#1B2440;color:#fff;font:800 16px var(--f);cursor:pointer;padding:0 18px}
#pf-card .go2{appearance:none;flex:1 1 140px;min-height:52px;border:1px solid var(--line);border-radius:999px;background:var(--surface);color:var(--fg);font:800 15px var(--f);cursor:pointer;padding:0 16px}
:root[data-theme="dark"] #pf-card .go{background:#F2EEE4;color:#1B2440}
#pf-card .wait{display:flex;flex-direction:column;align-items:center;text-align:center;padding:14px 4px 6px}#pf-card .wait .sp{width:46px;height:46px;border-radius:50%;border:4px solid rgba(184,146,79,.25);border-top-color:#B8924F;animation:pfsp 1s linear infinite;margin:0 0 12px}
@keyframes pfsp{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){#pf-card .wait .sp{animation-duration:3s}}
#pf-card .big{display:grid;gap:10px;margin:4px 0 14px}#pf-card .bg{appearance:none;display:flex;align-items:center;gap:14px;text-align:left;width:100%;min-height:76px;border:0;border-radius:18px;background:#1B2440;color:#fff;padding:12px 18px;font:inherit;cursor:pointer}#pf-card .bg svg{flex:none;width:30px;height:30px}#pf-card .bg b{display:block;font:800 17px/1.25 var(--f)}#pf-card .bg small{display:block;font-size:13.5px;opacity:.8;margin-top:2px}#pf-card .bg.l{background:var(--surface);color:var(--fg);border:1.5px solid var(--line)}
:root[data-theme="dark"] #pf-card .bg:not(.l){background:#F2EEE4;color:#1B2440}
#pf-ph{position:absolute;z-index:5;left:50%;transform:translateX(-50%);bottom:14px;appearance:none;display:inline-flex;align-items:center;gap:8px;white-space:nowrap;border:1px solid var(--line);background:var(--surface);color:var(--fg);border-radius:999px;font:800 14.5px var(--f);padding:0 16px 0 8px;min-height:46px;cursor:pointer;box-shadow:0 2px 10px rgba(11,18,38,.10)}
#pf-ph .cki{width:32px;height:32px;border-radius:50%;background:#1B2440;color:#fff;display:grid;place-items:center}#pf-ph .cki svg{width:20px;height:20px}
:root[data-theme="dark"] #pf-ph .cki{background:#F2EEE4;color:#1B2440}
#pf-ph[hidden],html.nt-on #pf-ph{display:none}
#nt-aide .pf-open{display:flex;align-items:center;gap:8px;width:100%;margin:8px 0 2px;appearance:none;border:1px solid var(--line,#0002);background:var(--surface,#fff);color:var(--fg,#0B1226);border-radius:12px;padding:10px 12px;font:800 15px var(--f,system-ui);min-height:44px;cursor:pointer}#nt-aide .pf-open svg{width:20px;height:20px}
`;

/* ---------- La photo : réduite sur l'appareil (≤ 2000 px, JPEG), un PDF part tel quel ---------- */
function lireFichier(f){return new Promise((ok,ko)=>{const r=new FileReader();r.onerror=()=>ko(new Error("Fichier illisible"));
 if(f.type==="application/pdf"){if(f.size>3.4*1024*1024)return ko(new Error("PDF trop lourd (3,5 Mo au plus) : prenez plutôt une photo de la page"));r.onload=()=>ok(String(r.result).slice(String(r.result).indexOf(",")+1));r.readAsDataURL(f);return}
 if(!/^image\//.test(f.type))return ko(new Error("Choisissez une photo ou un PDF"));
 r.onload=()=>{const im=new Image();im.onload=()=>{try{const s=Math.min(1,2000/Math.max(im.width,im.height)),c=document.createElement("canvas");c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);const g=c.getContext("2d");g.fillStyle="#fff";g.fillRect(0,0,c.width,c.height);g.drawImage(im,0,0,c.width,c.height);const u=c.toDataURL("image/jpeg",.86);ok(u.slice(u.indexOf(",")+1))}catch(e){ko(new Error("Photo illisible"))}};im.onerror=()=>ko(new Error("Photo illisible"));im.src=r.result};r.readAsDataURL(f)})}

/* Ouvert depuis « Photo d'un plan » (Mes plans, ?photo=1) : tout de suite les 2 gros boutons, sans chercher (Cyril 22/11) */
function accueil(){if(!ckOn()){card(`<div class="hd"><span class="cki">${CKI}</span><div><h3>Photo d'un plan</h3><p class="sub" style="margin:0">Avec l'option Cliky : il lit la photo d'un plan et le dessine pour vous (Réglages › Mes options).</p></div></div><div class="row fin"><button class="go" data-pf="x">Dessiner moi-même</button></div>`);return}
 card(`<div class="hd"><span class="cki">${CKI}</span><div><h3>Photo d'un plan</h3><p class="sub" style="margin:0">Plan d'architecte, de vente ou dessiné à la main : Cliky le dessine, vous vérifiez.</p></div></div>
  <div class="big"><button class="bg" data-pf="cam">${PHI}<span><b>Prendre le plan en photo</b><small>Bien à plat, toute la feuille dans l'écran</small></span></button>
  <button class="bg l" data-pf="fic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5z"/><path d="M14 3.5v5h5"/></svg><span><b>Choisir une photo ou un PDF</b><small>Déjà dans le téléphone, la tablette ou l'ordinateur</small></span></button></div>
  <div class="row fin"><button class="go2" data-pf="x">Non, je le dessine moi-même</button></div>`)}
function choisir(cam){if(!ckOn()){toast("Avec l'option Cliky : il lit la photo d'un plan et le dessine pour vous (Réglages › Mes options)");return}
 if(!api()){toast(/[?&]demo/.test(location.search)?"En démo, Cliky ne lit pas les photos de plan":"Ouvrez le plan depuis votre Espace pour que Cliky lise la photo");return}
 const f=$("pf-file");if(cam)f.setAttribute("capture","environment");else f.removeAttribute("capture");f.click()}
function envoyer(f){if(!f)return;card(`<div class="wait"><div class="sp" aria-hidden="true"></div><h3>Cliky lit votre plan…</h3><p class="sub">Ça prend souvent moins d'une minute. Gardez cet écran ouvert.</p></div>`);
 lireFichier(f).then(d=>api()("/espace/lire-photo",{method:"POST",body:{sorte:"plan",fichier:d}})).then(x=>{LU={...x,nv:0};resultat()},e=>{
  card(`<div class="hd"><span class="cki">${CKI}</span><div><h3>Cliky n'a pas pu lire ce plan</h3><p class="sub" style="margin:0">${esc(e&&e.message?e.message:"Erreur inconnue")}</p></div></div><div class="row"><button class="go2" data-pf="x">Fermer</button><button class="go" data-pf="re">Essayer une autre photo</button></div>`)})}

/* ---------- Aperçu du plan lu ---------- */
function apercu(nv){const R=nv.pieces;let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;R.forEach(p=>p.points.forEach(q=>{x0=Math.min(x0,q[0]);y0=Math.min(y0,q[1]);x1=Math.max(x1,q[0]);y1=Math.max(y1,q[1])}));
 const m=Math.max(.6,(x1-x0)*.05),W=x1-x0+2*m,H=y1-y0+2*m,fs=Math.max(.22,Math.min(.42,Math.min(W,H)/16));let s="";
 R.forEach(p=>{s+=`<polygon class="r" points="${p.points.map(q=>q.join(",")).join(" ")}"/>`;(p.cloisons||[]).forEach(c=>{s+=`<polyline class="c" points="${c.points.map(q=>q.join(",")).join(" ")}"/>`});p.ouvertures.forEach(o=>{const[a,b]=cote(p,o),L=Math.hypot(b[0]-a[0],b[1]-a[1])||1,ux=(b[0]-a[0])/L,uy=(b[1]-a[1])/L;
  s+=`<line class="${o.type==="porte"?"d":"w"}" x1="${a[0]+ux*o.depuis_m}" y1="${a[1]+uy*o.depuis_m}" x2="${a[0]+ux*(o.depuis_m+o.largeur_m)}" y2="${a[1]+uy*(o.depuis_m+o.largeur_m)}"/>`});
  /* clims, verrières… : petit trait laiton contre le mur, côté pièce, avec son nom court */
  (p.equipements||[]).forEach(o=>{const[a,b]=cote(p,o),L=Math.hypot(b[0]-a[0],b[1]-a[1])||1,ux=(b[0]-a[0])/L,uy=(b[1]-a[1])/L,nx=-uy*.16,ny=ux*.16,m0=o.depuis_m,m1=o.depuis_m+o.largeur_m,mc=(m0+m1)/2;
   s+=`<line class="e" x1="${a[0]+ux*m0+nx}" y1="${a[1]+uy*m0+ny}" x2="${a[0]+ux*m1+nx}" y2="${a[1]+uy*m1+ny}"/><text class="e" text-anchor="middle" x="${a[0]+ux*mc+nx*2.6}" y="${a[1]+uy*mc+ny*2.6}" font-size="${fs*.62}">${EQN[o.type]||""}</text>`})});
 R.forEach(p=>{const c=centre(p.points);s+=`<text x="${c[0]}" y="${c[1]}" font-size="${fs}">${esc(p.nom)}</text><text class="s" x="${c[0]}" y="${c[1]+fs*1.25}" font-size="${fs*.85}">${fr(aire(p.points))} m²</text>`});
 return`<svg viewBox="${x0-m} ${y0-m} ${W} ${H}" role="img" aria-label="Aperçu du plan lu par Cliky">${s}</svg>`}
/* le côté où se trouve une ouverture ou un équipement : contour de la pièce, ou bout de cloison */
function cote(p,o){const ci=o.cloison??-1,L=ci>=0&&p.cloisons&&p.cloisons[ci]?p.cloisons[ci].points:p.points;return[L[o.mur]||L[0],L[(o.mur+1)%L.length]||L[0]]}
const EQN={split:"Clim",ge:"Groupe ext.",verr:"Verrière",verp:"Verrière",rad:"Radiateur",tab:"Tableau",cee:"Ballon"};
function aire(P){let a=0;for(let i=0;i<P.length;i++){const p=P[i],q=P[(i+1)%P.length];a+=p[0]*q[1]-q[0]*p[1]}return Math.abs(a/2)}
function dedans(pt,p){let c=false;for(let i=0,j=p.length-1;i<p.length;j=i++)if(((p[i][1]>pt[1])!==(p[j][1]>pt[1]))&&(pt[0]<(p[j][0]-p[i][0])*(pt[1]-p[i][1])/(p[j][1]-p[i][1])+p[i][0]))c=!c;return c}
function centre(P){let a=0,cx=0,cy=0;for(let i=0;i<P.length;i++){const p=P[i],q=P[(i+1)%P.length],k=p[0]*q[1]-q[0]*p[1];a+=k;cx+=(p[0]+q[0])*k;cy+=(p[1]+q[1])*k}if(Math.abs(a)<1e-6)return[P[0][0],P[0][1]];return[cx/(3*a),cy/(3*a)]}

function resultat(){const N=(LU.niveaux||[]);if(!N.length){card(`<div class="hd"><span class="cki">${CKI}</span><div><h3>Cliky n'a trouvé aucune pièce</h3><p class="sub" style="margin:0">${esc(((LU.a_verifier||[])[0]||{}).texte||"Essayez une photo plus nette, prise bien en face.")}</p></div></div><div class="row"><button class="go2" data-pf="x">Fermer</button><button class="go" data-pf="re">Essayer une autre photo</button></div>`);return}
 const nv=N[LU.nv]||N[0],np=N.reduce((a,n)=>a+n.pieces.length,0),no=N.reduce((a,n)=>a+n.pieces.reduce((b,p)=>b+p.ouvertures.length,0),0),av=LU.a_verifier||[],ne=N.reduce((a,n)=>a+n.pieces.reduce((b,p)=>b+(p.equipements||[]).length,0),0);
 const plein=!vide();
 card(`<div class="hd"><span class="cki">${CKI}</span><div><h3>Cliky a lu ${np} pièce${np>1?"s":""}${N.length>1?` sur ${N.length} niveaux`:""}</h3><p class="sub" style="margin:0">${no} fenêtre${no>1?"s":""} et porte${no>1?"s":""}${ne?` · ${ne} équipement${ne>1?"s":""} (${[...new Set(N.flatMap(n=>n.pieces.flatMap(p=>(p.equipements||[]).map(x=>(EQN[x.type]||"").toLowerCase()))))].filter(Boolean).join(", ")})`:""} · vérifiez d'un coup d'œil</p></div></div>
  ${N.length>1?`<div class="tabs">${N.map((n,i)=>`<button data-nv="${i}" aria-pressed="${i===LU.nv}">${esc(n.nom)}</button>`).join("")}</div>`:""}
  <div class="pv">${apercu(nv)}</div>
  ${LU.echelle?`<div class="ech"><i></i><span>${esc(LU.echelle)}</span></div>`:""}
  ${av.length?`<ul class="av"><li class="ttl">À vérifier sur place (${av.length})</li>${av.map(v=>`<li>${v.piece?`<b>${esc(v.piece)}</b>`:""}<span>${esc(v.texte)}</span></li>`).join("")}</ul>`:""}
  <div class="rule">Mesures lues sur une photo : elles servent au pré-devis. Rien ne part en commande ni chez le fournisseur avant de les avoir prises sur place.</div>
  <div class="row fin"><button class="go2" data-pf="x">Annuler</button><button class="go" data-pf="ok">${plein?"Remplacer mon plan par celui-ci":"Mettre ce plan"}</button></div>`)}

/* ---------- Pose du plan lu ---------- */
/* clims, verrières… lues sur le plan → équipements du mur (même forme que la vue de face : x = centre en cm depuis le début du mur,
   le contour lu tourne dans le sens des aiguilles d'une montre, donc la gauche vue de la pièce = le début du mur) */
function eqMur(p,i,H,ci){const T=(window.PKFACES&&PKFACES.T)||{},Hh=Math.round(H*100),L=ci>=0?p.cloisons[ci].points:p.points,a=L[i],b=L[(i+1)%L.length],Lw=Math.round(Math.hypot(b[0]-a[0],b[1]-a[1])*100);
 return(p.equipements||[]).filter(x=>(x.cloison??-1)===ci&&x.mur===i&&T[x.type]).map(x=>{const d=T[x.type],xc=Math.round((x.depuis_m+x.largeur_m/2)*100);
  if(d.o){const w=Math.min(Lw,Math.round(x.largeur_m*100)||d.dw),hh=Math.min(Hh,Math.round((x.hauteur_m||0)*100)||d.dh||Hh);
   return{t:x.type,n:d.n,x:Math.max(w/2,Math.min(Lw-w/2,xc)),h:d.pos==="al"?Math.min(Hh-hh/2,(d.al||0)+hh/2):hh/2,w,hh,p:d.dp||0,st:"dk",ck:1,lu:1}}
  return{t:x.type,n:d.n||x.type,x:Math.max(5,Math.min(Lw-5,xc)),h:Math.max(5,Math.min(Hh-5,Math.round((x.hauteur_m||0)*100)||d.h||110)),st:"dk",ck:1,lu:1}})}
/* une clim dessinée dans la pièce = « Réversible murale », autant d'unités que dessinées (comme si l'artisan l'avait choisie dans « Murs et plafond ») */
function clim(p){const n=(p.equipements||[]).filter(x=>x.type==="split").length;return n?{clim:{type:"Réversible murale",n}}:{}}
function poser(){const P=K(),N=LU.niveaux||[],av=LU.a_verifier||[];if(!N.length)return;const SOL=P.SOLDEF||{};
 const OPD={fenetre:{k:"fenetre",h:1.35,al:.9},porte_fenetre:{k:"pf",h:2.15,al:0},baie_coulissante:{k:"pf",t:"Baie coulissante",ouv:"Coulissant",h:2.15,al:0},porte:{k:"porte",h:2.04,al:0}};
 const today=new Date().toISOString().slice(0,10);let first=true;
 /* un point du contour (ci = -1) ou d'un bout de cloison (ci = son numéro), avec les ouvertures et équipements du côté qui en part */
 const pt=(p,q,i,ci,H)=>{const o=p.ouvertures.filter(x=>(x.cloison??-1)===ci&&x.mur===i).map(x=>{const d={...OPD[x.type],w:x.largeur_m,p:x.depuis_m};
   /* hauteur écrite (« 125 x 135 ») : on la garde ; une fenêtre garde son linteau à 2,25 m environ */
   if(x.hauteur_m>0){d.h=x.hauteur_m;if(d.k==="fenetre")d.al=Math.max(0,+(2.25-x.hauteur_m).toFixed(2))}return d});
   const e=eqMur(p,i,H,ci);const r={p:[q[0],q[1]]};if(o.length)r.o=o;if(e.length)r.e=e;return r};
 const floors=N.map(nv=>{const H=nv.hauteur_m>0?nv.hauteur_m:2.5,rooms=nv.pieces.map(p=>({nom:p.nom,sol:{...SOL},pts:p.points.map((q,i)=>pt(p,q,i,-1,H)),
   /* bouts de cloison (qui ne ferment rien) : posés comme des cloisons du plan, à leur longueur */
   clos:(p.cloisons||[]).map((c,ci)=>c.points.map((q,i)=>pt(p,q,i,ci,H))),...clim(p)}));
  /* les points douteux deviennent des notes « à reprendre », épinglées au milieu de leur pièce */
  const notes=[];let g=0;av.forEach(v=>{let p=nv.pieces.find(x=>x.nom===v.piece);if(!p&&v.piece){const t=v.piece.toLowerCase();p=nv.pieces.find(x=>x.nom.toLowerCase().includes(t)||t.includes(x.nom.toLowerCase()))}if(!p&&v.piece&&N.some(o=>o.pieces.some(x=>x.nom===v.piece)))return;if(!p&&!first)return;notes.push({pc:p||nv.pieces[0],t:"room",w:(p?p.nom:"Tout le logement")+" · lu sur la photo",txt:"Cliky : "+(!p&&v.piece?v.piece+" : ":"")+v.texte,d:today})});
  /* UNE épingle par pièce (Cyril 22/11 : plusieurs épingles, « ça fait brouillon ») : ses points en liste dans la note,
     posée sous le nom et la surface de la pièce, pour ne pas les cacher */
  const grp=new Map();notes.forEach(n=>{if(!grp.has(n.pc))grp.set(n.pc,[]);grp.get(n.pc).push(n)});notes.length=0;
  grp.forEach((L,pc)=>{const c=centre(pc.points),bas=Math.max(...pc.points.map(q=>q[1])),dy=Math.min(1.6,Math.max(.6,(bas-c[1])*.8));let x=c[0],y=c[1]+dy;if(!dedans([x,y],pc.points))y=c[1]+.5;
   const T=L.map(n=>n.txt.replace(/^Cliky : /,""));notes.push({x:+x.toFixed(2),y:+y.toFixed(2),t:"room",w:L[0].w,txt:"Cliky, à vérifier sur place :\n"+T.map(t=>"• "+t).join("\n"),d:today})});
  first=false;
  return{nom:nv.nom,H:nv.hauteur_m>0?nv.hauteur_m:2.5,...(nv.hauteur_m>0?{hok:true}:{hdk:true}),photo:1,ckl:{lu:{pieces:nv.pieces},le:today},...(notes.length?{notes}:{}),dal:{type:"Béton",ep:"20 cm"},esc:[],rooms}});
 try{P.hist()}catch(e){}
 /* les familles posées (clim, menuiserie…) s'affichent dans la vue de face */
 try{const F=window.PKFACES,T=F.T||{},fam=new Set();N.forEach(n=>n.pieces.forEach(p=>(p.equipements||[]).forEach(x=>{if(T[x.type]&&T[x.type].f)fam.add(T[x.type].f)})));const M=F.metiers()||[],nm=[...new Set([...M,...fam])];if(nm.length!==M.length)F.setMetiers(nm)}catch(e){}
 const S=P.snapState();S.floors=floors;S.fi=0;S.ri=0;
 try{P.loadState(S);P.closeSheet&&P.closeSheet(true)}catch(e){toast("Le plan lu n'a pas pu être posé");return}
 try{P.all();P.autosave&&P.autosave();P.notify&&P.notify()}catch(e){}
 try{window.PKNOTES&&PKNOTES.pins()}catch(e){}
 try{P.say(null,"Plan lu par Cliky sur la photo : touchez « À vérifier » pour confirmer les fenêtres et les portes, puis « Notes » pour les mesures à prendre sur place.")}catch(e){}
 close();const n=av.length,np=floors.reduce((a,f)=>a+(f.notes||[]).length,0);
 setTimeout(()=>toast(n?`Plan posé : ${n} point${n>1?"s":""} à vérifier, dans les ${np>1?np+" notes":"notes"} du plan`:"Plan posé. Fenêtres et portes à confirmer dans « À vérifier »"),250)}

/* ---------- Écran ---------- */
function card(h){let c=$("pf-card");c.innerHTML=`<div class="in" role="dialog" aria-modal="true" aria-label="Photo d'un plan">${h}</div>`;c.hidden=false}
function close(){const c=$("pf-card");if(c){c.hidden=true;c.innerHTML=""}LU=null}
/* plan neuf : rien, ou seulement la 1re pièce posée d'office (« Pièce 1 », sans fenêtre ni porte) */
function vide(){try{const P=K(),R=[];P.ST.floors.forEach(f=>f.rooms.forEach(r=>R.push(r)));if(!R.length)return true;return R.length===1&&/^Pièce \d+$/.test(R[0].nom)&&!R[0].pts.some(q=>(P.OP.get(q)||[]).length)}catch(e){return false}}
function ensure(){const st=document.createElement("style");st.textContent=CSS;document.head.appendChild(st);
 const c=document.createElement("div");c.id="pf-card";c.hidden=true;document.body.appendChild(c);
 c.addEventListener("click",e=>{if(e.target===c&&!c.querySelector(".wait"))return close();const b=e.target.closest("button");if(!b)return;if(b.dataset.nv!=null){LU.nv=+b.dataset.nv;return resultat()}const a=b.dataset.pf;if(a==="x")close();if(a==="re"){close();choisir()}if(a==="cam"||a==="fic")choisir(a==="cam");if(a==="ok")poser()});
 const fi=document.createElement("input");fi.type="file";fi.accept="image/*,application/pdf";fi.id="pf-file";fi.hidden=true;document.body.appendChild(fi);fi.addEventListener("change",()=>{const f=fi.files&&fi.files[0];fi.value="";envoyer(f)});
 /* bouton sur le plan tant qu'il est vide */
 const bd=$("board");if(bd){const b=document.createElement("button");b.id="pf-ph";b.type="button";b.innerHTML=`<span class="cki">${CKI}</span>Partir d'une photo de plan`;b.hidden=true;bd.appendChild(b);b.addEventListener("click",e=>{e.stopPropagation();choisir()});
  const pos=()=>{const v=vide()&&ckOn();if(b.hidden===v)b.hidden=!v;if(!v)return;/* au-dessus de la barre d'outils */const t=$("cltools"),q=bd.getBoundingClientRect();let y=14;if(t){const r=t.getBoundingClientRect();if(r.height>0&&getComputedStyle(t).display!=="none"&&r.top<q.bottom&&r.bottom>q.top)y=Math.max(14,q.bottom-r.top+12)}b.style.bottom=y+"px"};pos();setInterval(pos,500)}}
function addAide(){const a=$("nt-aide");if(!a)return false;if(a.querySelector(".pf-open"))return true;const b=document.createElement("button");b.className="pf-open";b.type="button";b.innerHTML=PHI+"Partir d'une photo de plan";
 b.addEventListener("click",e=>{e.stopPropagation();a.hidden=true;document.documentElement.classList.remove("nt-aide","pro-leg");choisir()});const pp=a.querySelector(".pp-open");if(pp)pp.after(b);else a.insertBefore(b,a.firstChild.nextSibling);return true}
function boot(){const P=K();if(!P||P.CL)return;ensure();if(/[?&]photo=1/.test(location.search))setTimeout(()=>{if(vide())accueil()},900);let n=0;const t=setInterval(()=>{if((addAide()&&$("nt-aide").querySelector(".pp-open"))||++n>100)clearInterval(t)},150);addEventListener("keydown",e=>{const c=$("pf-card");if(e.key==="Escape"&&c&&!c.hidden&&!c.querySelector(".wait"))close()})}
function wait(n){if(K()&&$("svg"))return boot();if(n>80)return;setTimeout(()=>wait(n+1),100)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>wait(0));else wait(0);
window.PKPHOTO={choisir,_poser:x=>{LU={...x,nv:0};poser()},_montrer:x=>{LU={...x,nv:0};resultat()}};
})();
