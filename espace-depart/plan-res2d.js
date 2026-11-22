/* ProClik · Réseaux sur le plan de l'artisan (Cyril 21/11, lot B10) : bascule Plan / Élec / Eau / Clim.
   Élec : Implantation (symboles sur les murs, n° de circuit, interrupteur → lumière en courbe) ou Trajets (le long des murs,
   en gris ce qui passe au plafond). Eau : eau froide en bleu, eau chaude en rouge, évacuations grises avec diamètre et pente.
   Clim : unités, groupe extérieur, liaison avec sa longueur, condensats. Tout est CALCULÉ (plan-reseaux.js) : rien à dessiner.
   Un circuit touché dans la liste s'allume en laiton. « Voir les réseaux en détail » ouvre la page des câbles, tuyaux et tableau.
   À revoir plus tard avec des électriciens et des plombiers (Cyril). */
(function(){
"use strict";
if(/[?&]client/.test(location.search))return;
const K=()=>window.PKPLAN,R=()=>window.PKRESEAUX,X=()=>window.PKFACES,$=id=>document.getElementById(id);
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const frn=v=>String(Math.round(v*10)/10).replace(".",",");
let M="plan",SUB="imp",SEL=null,RES=null;
const fams=()=>{try{return(X().metiers()||[]).filter(k=>k==="el"||k==="eau"||k==="clim")}catch(e){return[]}};
function calc(){try{RES=R()&&R().calc()}catch(e){RES=null}return RES}
const COL={ecl:"#B8924F",pc:"var(--rx-ink)",spe:"#C2255C",cmd:"#E8590C",com:"#2B8A3E",ef:"#2F7DE1",ec:"#E03131",ev:"#868E96",clim:"#7048E8",cond:"#7048E8"};
/* ---------- tracés ---------- */
function onFloor(p){return p&&p.x!=null&&(p.fi==null||p.fi===K().ST.fi)}
/* périmètre de la pièce : on longe les murs entre deux points posés sur les murs de la même pièce */
function perim(rm,a,b){const P=rm.pts,n=P.length,proj=q=>{let best=null;for(let i=0;i<n;i++){const A=P[i],B=P[(i+1)%n],dx=B[0]-A[0],dy=B[1]-A[1],L2=dx*dx+dy*dy||1e-9;let t=((q[0]-A[0])*dx+(q[1]-A[1])*dy)/L2;t=Math.max(0,Math.min(1,t));const d=Math.hypot(q[0]-A[0]-t*dx,q[1]-A[1]-t*dy);if(!best||d<best.d)best={i,t,d}}return best};
 const pa=proj(a),pb=proj(b);if(!pa||!pb)return null;const len=i=>Math.hypot(P[(i+1)%n][0]-P[i][0],P[(i+1)%n][1]-P[i][1]),per=[...Array(n).keys()].reduce((s,i)=>s+len(i),0),pos=o=>{let s=0;for(let i=0;i<o.i;i++)s+=len(i);return s+o.t*len(o.i)};
 const sa=pos(pa),sb=pos(pb),fw=((sb-sa)+per)%per,dir=fw<=per/2?1:-1,pts=[[a[0],a[1]]];let i=pa.i;
 if(pa.i!==pb.i||(dir>0?pb.t<pa.t:pb.t>pa.t)){let k=0;if(dir>0){i=pa.i;while(k++<n+1){const v=P[(i+1)%n];pts.push(v);i=(i+1)%n;if(i===pb.i)break}}else{i=pa.i;while(k++<n+1){pts.push(P[i]);i=(i-1+n)%n;if((i+1)%n===pb.i){break}}}}
 pts.push([b[0],b[1]]);return pts}
/* décale un tracé vers l'intérieur de la pièce pour qu'il longe le mur sans le couvrir */
function inset(pts,rm,d){if(!rm)return pts;const xs=rm.pts.map(p=>p[0]),ys=rm.pts.map(p=>p[1]),cx=(Math.min(...xs)+Math.max(...xs))/2,cy=(Math.min(...ys)+Math.max(...ys))/2;return pts.map(p=>{const dx=cx-p[0],dy=cy-p[1],L=Math.hypot(dx,dy)||1;return[p[0]+dx/L*d,p[1]+dy/L*d]})}
const poly=(pts,cls,st)=>`<polyline class="${cls}" ${st||""} points="${pts.map(p=>p.join(",")).join(" ")}"/>`;
function route(h,u){const a=h.a,b=h.b;if(!onFloor(a)||!onFloor(b))return null;const A=[a.x,a.y],B=[b.x,b.y];
 if((h.via==="mur"||h.via==="ligne")&&a.rm&&a.rm===b.rm){const p=perim(a.rm,A,B);if(p)return{pts:inset(p,a.rm,u*5),pl:false}}
 if(/^e[fcv]$/.test(h.k)&&a.rm===b.rm&&a.rm){const p=perim(a.rm,A,B);if(p)return{pts:inset(p,a.rm,u*(h.k==="ef"?4:h.k==="ec"?8:12)),pl:false}}
 return{pts:[A,[B[0],A[1]],B],pl:true}}
function sym(p,u,k){const x=p.x,y=p.y,r=u*7;const t=p.e&&p.e.t;
 if(p.w===0)return t==="spot"||t==="pl"?`<g class="rx-s"><circle cx="${x}" cy="${y}" r="${r}"/><path d="M${x-r*.7} ${y-r*.7}L${x+r*.7} ${y+r*.7}M${x+r*.7} ${y-r*.7}L${x-r*.7} ${y+r*.7}"/></g>`:`<g class="rx-s"><rect x="${x-r}" y="${y-r}" width="${2*r}" height="${2*r}" rx="${r*.3}"/></g>`;
 if(t==="int"||t==="vv")return`<g class="rx-s"><circle cx="${x}" cy="${y}" r="${r*.8}"/><path d="M${x} ${y}l${r*1.1} ${-r*1.1}"/></g>`;
 if(t==="tab")return`<g class="rx-s tab"><rect x="${x-r*1.6}" y="${y-r}" width="${3.2*r}" height="${2*r}" rx="${r*.3}"/></g>`;
 return`<g class="rx-s"><circle cx="${x}" cy="${y}" r="${r}"/><circle class="f" cx="${x-r*.38}" cy="${y}" r="${r*.18}"/><circle class="f" cx="${x+r*.38}" cy="${y}" r="${r*.18}"/></g>`}
function draw(){const svg=$("svg"),P=K();if(!svg||!P)return;let g=svg.querySelector("#rx-g");if(g)g.remove();if(M==="plan")return;const r=RES||calc();if(!r)return;
 const u=P.pxM(1),fl=P.F();g=document.createElementNS("http://www.w3.org/2000/svg","g");g.id="rx-g";g.setAttribute("pointer-events","none");
 const xs=fl.rooms.flatMap(rm=>rm.pts.map(p=>p[0])),ys=fl.rooms.flatMap(rm=>rm.pts.map(p=>p[1]));let s=xs.length?`<rect class="rx-veil" x="${Math.min(...xs)-1}" y="${Math.min(...ys)-1}" width="${Math.max(...xs)-Math.min(...xs)+2}" height="${Math.max(...ys)-Math.min(...ys)+2}"/>`:"";
 const H=r._hops||[],C=r._circ||[];
 if(M==="el"){const ks=["ecl","pc","spe","cmd","com"];
  if(SUB==="traj")H.forEach(h=>{if(!ks.includes(h.k))return;const ro=route(h,u);if(!ro)return;const on=SEL!=null&&h.c===C[SEL];s+=poly(ro.pts,`rx-l${ro.pl?" pl":""}${h.k==="ecl"?" dash":""}${on?" on":""}`,`style="stroke:${ro.pl&&!on?"":COL[h.k]};stroke-width:${u*(on?4:2.4)}"`)});
  else H.forEach(h=>{if(h.k!=="cmd"||!onFloor(h.a)||!onFloor(h.b))return;const a=h.a,b=h.b,mx=(a.x+b.x)/2+(b.y-a.y)*.25,my=(a.y+b.y)/2-(b.x-a.x)*.25;s+=`<path class="rx-l cmdc" style="stroke-width:${u*1.6}" d="M${b.x} ${b.y}Q${mx} ${my} ${a.x} ${a.y}"/>`});
  const seen=new Set();C.forEach((c,ci)=>(c.pts||[]).forEach(p=>{if(!onFloor(p))return;seen.add(p);const on=SEL===ci;s+=`<g class="${on?"rx-on":""}">${sym(p,u)}<text class="rx-t" x="${p.x+u*9}" y="${p.y-u*8}" font-size="${u*10}">C${ci+1}</text></g>`}));
  if(r._tab&&onFloor(r._tab))s+=sym({...r._tab,e:{t:"tab"},w:1},u)+`<text class="rx-t" x="${r._tab.x}" y="${r._tab.y+u*20}" font-size="${u*10}" text-anchor="middle">Tableau</text>`;
  H.forEach(h=>{if(h.k==="cmd"&&onFloor(h.b)&&!seen.has(h.b)){seen.add(h.b);s+=sym({...h.b,e:{t:"int"}},u)}})}
 if(M==="eau"){H.forEach(h=>{if(!/^(ef|ec|ev)$/.test(h.k))return;const ro=route(h,u);if(!ro)return;s+=poly(ro.pts,`rx-l${h.k==="ev"?" ev":""}`,`style="stroke:${COL[h.k]};stroke-width:${u*(h.k==="ev"?4.5:2.6)}"`);if(h.k==="ev"&&h.d){const q=ro.pts[Math.floor(ro.pts.length/2)];s+=`<text class="rx-t" x="${q[0]+u*6}" y="${q[1]-u*6}" font-size="${u*9.5}">Ø${h.d} · ${frn((R().N.pente||.02)*100)} cm/m</text>`}});
  const n=r._nour;if(n&&onFloor(n))s+=`<g class="rx-s"><rect x="${n.x-u*9}" y="${n.y-u*6}" width="${u*18}" height="${u*12}" rx="${u*2}"/></g><text class="rx-t" x="${n.x}" y="${n.y+u*18}" font-size="${u*10}" text-anchor="middle">Nourrice${n.est?" (estimée)":""}</text>`}
 if(M==="clim"){H.forEach(h=>{if(h.k!=="clim"&&h.k!=="cond")return;const ro=route(h,u);if(!ro)return;s+=poly(ro.pts,`rx-l${h.k==="cond"?" dash":""}`,`style="stroke:${COL[h.k]};stroke-width:${u*(h.k==="cond"?1.8:3.4)}"`);if(h.k==="clim"&&h.L){const q=ro.pts[1]||ro.pts[0];s+=`<text class="rx-t" x="${q[0]+u*6}" y="${q[1]-u*6}" font-size="${u*10}">liaison ≈ ${frn(h.L)} m</text>`}});
  (r._cs||[]).forEach(S=>{(S.unites||[]).forEach(un=>{if(un.p&&onFloor(un.p))s+=`<g class="rx-s cl"><rect x="${un.p.x-u*12}" y="${un.p.y-u*5}" width="${u*24}" height="${u*10}" rx="${u*3}"/></g>`});if(S.groupe&&S.groupe.p&&onFloor(S.groupe.p))s+=`<g class="rx-s cl"><rect x="${S.groupe.p.x-u*11}" y="${S.groupe.p.y-u*9}" width="${u*22}" height="${u*18}" rx="${u*2}"/><circle cx="${S.groupe.p.x-u*3}" cy="${S.groupe.p.y}" r="${u*5}"/></g><text class="rx-t" x="${S.groupe.p.x}" y="${S.groupe.p.y+u*22}" font-size="${u*10}" text-anchor="middle">Groupe extérieur</text>`})}
 g.innerHTML=s;const nt=svg.querySelector("#nt-g");if(nt)svg.insertBefore(g,nt);else svg.appendChild(g)}
let OBS=null;function watch(){const svg=$("svg");if(!svg||OBS)return;OBS=new MutationObserver(()=>{if(M!=="plan"&&!svg.querySelector("#rx-g"))draw()});OBS.observe(svg,{childList:true})}
/* ---------- carte du bas ---------- */
const CSS=`
#rx-seg{position:absolute;z-index:5;left:50%;transform:translateX(-50%);bottom:88px;display:flex;background:var(--surface);border:1px solid var(--line);border-radius:999px;padding:3px;box-shadow:0 6px 16px -8px rgba(11,18,38,.3)}
#rx-seg[hidden]{display:none}
#rx-seg button{appearance:none;border:0;background:none;color:var(--muted);font:700 13px var(--f);border-radius:999px;padding:0 11px;height:32px;cursor:pointer;display:inline-flex;align-items:center;gap:4px;white-space:nowrap}
#rx-seg button[aria-pressed="true"]{background:var(--fg);color:var(--bg);font-weight:800}
#rx-seg svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
html.rx-on #rx-seg{display:none!important}
#rx-card .segc{display:flex;background:var(--paper);border-radius:999px;padding:3px;margin:0 0 10px}#rx-card .segc button{appearance:none;flex:1;border:0;background:none;color:var(--muted);font:700 13.5px var(--f);border-radius:999px;height:34px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:4px}#rx-card .segc button[aria-pressed="true"]{background:var(--surface);color:var(--fg);font-weight:800;box-shadow:0 1px 3px rgba(0,0,0,.12)}#rx-card .segc svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
html.rx-on #cltools,html.rx-on #legend,html.rx-on #clbanner,html.nt-on #rx-seg{display:none!important}
@media (min-width:700px){#rx-seg{bottom:104px}}
#rx-card{position:fixed;left:0;right:0;bottom:0;z-index:65;background:var(--bg);border-radius:22px 22px 0 0;box-shadow:0 -10px 30px rgba(11,18,38,.16);padding:10px 16px calc(14px + env(safe-area-inset-bottom,0px));max-height:46vh;overflow:auto;font:500 14px/1.4 var(--f);color:var(--fg)}
#rx-card[hidden]{display:none}
@media (min-width:900px){#rx-card{left:auto;right:16px;bottom:16px;width:380px;border-radius:22px;max-height:70vh}}
@media (orientation:landscape) and (max-height:560px){#rx-card{top:0;right:auto;width:min(320px,40vw);max-height:none;border-radius:0 22px 22px 0;padding-left:max(14px,env(safe-area-inset-left,0px))}}
#rx-card .gr{display:block;width:40px;height:4px;border-radius:2px;background:var(--line);margin:0 auto 8px}
#rx-card .sub{display:flex;gap:4px;background:var(--paper);border-radius:999px;padding:3px;margin:0 0 8px;width:max-content}
#rx-card .sub button{appearance:none;border:0;background:none;color:var(--muted);font:700 13px var(--f);border-radius:999px;padding:0 12px;height:30px;cursor:pointer}
#rx-card .sub button[aria-pressed="true"]{background:var(--fg);color:var(--bg)}
#rx-card .lg{display:flex;flex-wrap:wrap;gap:4px 12px;font:600 12.5px var(--f);color:var(--muted);margin:0 0 8px}#rx-card .lg i{display:inline-block;width:16px;height:0;border-top:3px solid;vertical-align:middle;margin-right:5px}#rx-card .lg i.d{border-top-style:dashed}
#rx-card .it{appearance:none;width:100%;display:flex;gap:10px;align-items:center;text-align:left;border:0;border-bottom:1px solid var(--line);background:none;color:var(--fg);padding:9px 2px;cursor:pointer;font:500 13px var(--f)}
#rx-card .it .c{flex:none;width:30px;height:30px;border-radius:10px;background:var(--surface);border:1px solid var(--line);display:grid;place-items:center;font:800 11.5px var(--f)}
#rx-card .it.on .c{border-color:#B8924F;background:rgba(184,146,79,.16)}
#rx-card .it span{flex:1;min-width:0}#rx-card .it b{display:block;font-size:14.5px}#rx-card .it small{color:var(--muted)}#rx-card .it em{font-style:normal;font-weight:800;white-space:nowrap}
#rx-card .go{appearance:none;width:100%;min-height:50px;border:0;border-radius:999px;background:#1B2440;color:#fff;font:800 15.5px var(--f);cursor:pointer;margin:10px 0 0}
:root[data-theme="dark"] #rx-card .go{background:#F2EEE4;color:#1B2440}
#rx-card .muted{color:var(--muted)}
:root{--rx-ink:#1B2440}:root[data-theme="dark"]{--rx-ink:#F2EEE4}
#svg .rx-veil{fill:var(--bg);opacity:.5}
#svg .rx-l{fill:none;stroke-linecap:round;stroke-linejoin:round;opacity:.95}#svg .rx-l.pl{stroke:#9AA0AA;stroke-dasharray:.12 .1;opacity:.8}#svg .rx-l.dash{stroke-dasharray:.14 .1}#svg .rx-l.on{stroke:#B8924F!important;opacity:1;stroke-dasharray:none}
#svg .rx-l.cmdc{stroke:#E8590C;stroke-dasharray:.08 .08}
#svg .rx-s rect,#svg .rx-s circle{fill:var(--surface);stroke:var(--rx-ink);stroke-width:1.2px;vector-effect:non-scaling-stroke}#svg .rx-s path{stroke:var(--rx-ink);stroke-width:1.2px;vector-effect:non-scaling-stroke;fill:none}#svg .rx-s .f{fill:var(--rx-ink);stroke:none}
#svg .rx-s.cl rect,#svg .rx-s.cl circle{stroke:#7048E8}#svg .rx-on .rx-s rect,#svg .rx-on .rx-s circle{stroke:#B8924F;stroke-width:2.4px}
#svg .rx-t{fill:var(--rx-ink);font-weight:800;font-family:var(--f)}#svg .rx-on .rx-t{fill:#B8924F}
`;
const ICS={plan:'<path d="M4 5h16v14H4zM12 5v8h8"/>',el:'<path d="M13 3L5 13h6l-1 8 8-10h-6z"/>',eau:'<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',clim:'<rect x="3" y="6" width="18" height="8" rx="2"/><path d="M7 18l-1 2M12 18v2M17 18l1 2"/>'};
function ensure(){if($("rx-card"))return;const st=document.createElement("style");st.textContent=CSS;document.head.appendChild(st);
 const c=document.createElement("div");c.id="rx-card";c.hidden=true;document.body.appendChild(c);c.addEventListener("click",onClick);
 const b=$("board");if(!b)return;const sg=document.createElement("div");sg.id="rx-seg";sg.hidden=true;sg.setAttribute("role","group");sg.setAttribute("aria-label","Réseaux");b.appendChild(sg);sg.addEventListener("click",e=>{const x=e.target.closest("button");if(!x)return;e.stopPropagation();setM(x.dataset.m)})}
function seg(){const sg=$("rx-seg");if(!sg)return;const F=fams();let has=false;try{const P=K();P.ST.floors.forEach(f=>P.segs(f).forEach(s=>{if((P.EQ.get(s.a)||[]).length)has=true}))}catch(e){}
 const L=[["plan","Plan"]].concat(F.includes("el")?[["el","Élec"]]:[],F.includes("eau")?[["eau","Eau"]]:[],F.includes("clim")?[["clim","Clim"]]:[]);sg.hidden=!(has&&L.length>1&&R())||document.documentElement.classList.contains("bloque-x");
 sg.innerHTML=L.map(([k,n])=>`<button data-m="${k}" aria-pressed="${M===k}"><svg viewBox="0 0 24 24" aria-hidden="true">${ICS[k]}</svg>${n}</button>`).join("")}
function setM(m){M=m||"plan";SEL=null;const on=M!=="plan";document.documentElement.classList.toggle("rx-on",on);if(on){try{K().closeSheet(true);K().setMode("plan")}catch(e){}calc()}seg();card();draw();fit()}
function fit(){const c=$("rx-card"),b=$("board");if(!b)return;b.style.paddingBottom="";if(c&&!c.hidden&&innerWidth<900&&!(innerWidth>innerHeight&&innerHeight<=560)){const r=b.getBoundingClientRect(),ch=c.getBoundingClientRect().height,over=r.bottom-(innerHeight-ch);if(over>0)b.style.paddingBottom=Math.min(over,r.height*.5)+"px"}}
function card(){ensure();const c=$("rx-card");if(M==="plan"){c.hidden=true;return}c.hidden=false;const r=RES||calc();const sg=$("rx-seg");let h='<i class="gr"></i>'+(sg?`<div class="segc" role="group" aria-label="Réseaux">${sg.innerHTML}</div>`:"");
 if(!r){c.innerHTML=h+'<p class="muted">Rien à calculer pour l\'instant : posez des prises, des points d\'eau ou une clim dans « Murs et plafond ».</p>';return}
 if(M==="el"){const C=r._circ||[];h+=`<div class="sub"><button data-s="imp" aria-pressed="${SUB==="imp"}">Implantation</button><button data-s="traj" aria-pressed="${SUB==="traj"}">Trajets</button></div>`;
  h+=SUB==="imp"?`<div class="lg"><span>○ Prise</span><span>⊗ Point lumineux</span><span>⌀ Interrupteur</span><span><i class="d" style="border-color:#E8590C"></i>Commande</span><span>C2 = n° de circuit</span></div>`:`<div class="lg"><span><i style="border-color:var(--rx-ink)"></i>Prises 2,5 mm²</span><span><i class="d" style="border-color:#B8924F"></i>Éclairage 1,5 mm²</span><span><i style="border-color:#C2255C"></i>Spécialisés</span><span><i class="d" style="border-color:#9AA0AA"></i>Passe au plafond</span></div>`;
  h+=C.length?C.map((x,i)=>`<button class="it${SEL===i?" on":""}" data-c="${i}"><span class="c">C${i+1}</span><span><b>${esc(x.n)}</b><small>${String(x.sec).replace(".",",")} mm² · ${esc(x.dj)}${SEL===i?" · touché, il s'allume":""}</small></span><em>${x.nb} pt${x.nb>1?"s":""}</em></button>`).join(""):`<p class="muted">Aucun circuit pour l'instant.</p>`}
 if(M==="eau"){const H=(r._hops||[]).filter(x=>/^(ef|ec|ev)$/.test(x.k));h+=`<div class="lg"><span><i style="border-color:#2F7DE1"></i>Eau froide (EF)</span><span><i style="border-color:#E03131"></i>Eau chaude (EC)</span><span><i style="border-color:#868E96;border-top-width:5px"></i>Évacuation</span></div>`;
  const by=new Map();H.forEach(x=>{const n=(x.b&&x.b.e&&(x.b.e.n||x.b.e.t))||"Point d'eau";const k=n+(x.b&&x.b.rm?" · "+x.b.rm.nom:"");const o=by.get(k)||{n:k,ef:0,ec:0,ev:null};if(x.k==="ev")o.ev=x.d;else o[x.k]++;by.set(k,o)});
  h+=by.size?[...by.values()].map(o=>`<div class="it"><span class="c">💧</span><span><b>${esc(o.n)}</b><small>${o.ef||o.ec?"multicouche 16":""}${o.ev?(o.ef||o.ec?" · ":"")+"PVC Ø"+o.ev:""}</small></span></div>`).join("")+(r._nour?`<div class="it"><span class="c">N</span><span><b>Nourrice${r._nour.est?" (position estimée)":""}</b><small>départs en pieuvre</small></span></div>`:""):`<p class="muted">Aucun point d'eau.</p>`}
 if(M==="clim"){h+=`<div class="lg"><span><i style="border-color:#7048E8"></i>Liaisons frigorifiques</span><span><i class="d" style="border-color:#7048E8"></i>Condensats</span></div>`;
  h+=(r._cs||[]).length?r._cs.map(S=>`<div class="it"><span class="c">❄</span><span><b>${esc(S.titre)}</b><small>groupe ${frn(S.groupe.kw)} kW${(S.unites||[]).map(u=>` · ${esc(u.piece)} ${frn(u.kw)} kW${u.L!=null?`, liaison ${frn(u.L)} m${u.est?" (estimée)":""}`:""}`).join("")}</small></span></div>`).join(""):`<p class="muted">Aucune clim choisie (onglet Clim de « Murs et plafond »).</p>`}
 h+=`<button class="go" data-a="det">Voir les réseaux en détail</button>`;c.innerHTML=h;fit()}
function onClick(e){const b=e.target.closest("button");if(!b)return;if(b.dataset.m){setM(b.dataset.m);return}if(b.dataset.s){SUB=b.dataset.s;card();draw();return}if(b.dataset.c!=null){const i=+b.dataset.c;SEL=SEL===i?null:i;if(SEL!=null&&SUB==="imp")SUB="traj";card();draw();return}
 if(b.dataset.a==="det"){const m=M;setM("plan");try{X().open({calc:m})}catch(x){}}}
function boot(){const P=K();if(!P||P.CL)return;ensure();watch();seg();const rm=$("rooms");document.addEventListener("click",e=>{if(e.target.closest&&e.target.closest('.cltool[data-cl="notes"]')&&M!=="plan")setM("plan")},true);setInterval(()=>{if(!document.hidden)seg()},2500);addEventListener("resize",fit);
 /* toute modification du plan : on recalcule */let T=null;const re=()=>{if(M==="plan")return;clearTimeout(T);T=setTimeout(()=>{RES=null;calc();card();draw()},300)};const svg=$("svg");if(svg)new MutationObserver(L=>{const own=n=>n.id==="rx-g"||n.id==="nt-g";if(L.every(m=>[...m.addedNodes,...m.removedNodes].every(own)))return;re()}).observe(svg,{childList:true})}
function wait(n){if(K()&&$("svg")&&$("board"))return boot();if(n>80)return;setTimeout(()=>wait(n+1),100)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>wait(0));else wait(0);
window.PKRX={set:setM,get mode(){return M}};
})();
