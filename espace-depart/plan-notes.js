/* ProClik · Notes de chantier sur le plan de l'artisan (Cyril 21/11, lot B11).
   Sur le chantier : pas le temps de tout régler ? On touche un mur, une pièce, une porte ou le sol, on dicte, on prend une photo :
   la note est épinglée (numérotée) à cet endroit du plan. À la maison : « N notes à reprendre », une par une, l'élément s'allume,
   « Ouvrir le mur » ouvre directement le bon écran, « Plus tard » si besoin.
   Données : f.notes de chaque étage [{x,y,t,w,txt,ph,fait,d}], gardées avec le plan (Annuler, sauvegarde, export « notes_chantier »).
   Aussi : la légende des matériaux quitte la barre du bas et passe dans l'aide « ? » (à côté du zoom). */
(function(){
"use strict";
if(/[?&]client/.test(location.search))return;
const K=()=>window.PKPLAN,$=id=>document.getElementById(id);
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const IC={mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>',cam:'<path d="M4 8h3l1.6-2.2h6.8L17 8h3v11H4z"/><circle cx="12" cy="13.2" r="3.4"/>',x:'<path d="M6 6l12 12M18 6L6 18"/>',home:'<path d="M4 11l8-6.5 8 6.5M6.5 9.5V19h11V9.5"/>',nx:'<path d="M9 5l7 7-7 7"/>',note:'<path d="M6 3.5h9l4 4V20.5H6z"/><path d="M15 3.5v4h4M9 12h7M9 15.5h7"/>'};
const ico=k=>`<svg viewBox="0 0 24 24" aria-hidden="true">${IC[k]}</svg>`;
let N=null; /* {mode:"pose"|"edit"|"rep", cur:{x,y,t,w,...} ou index, rep:[indices], k} */
const notes=()=>{const f=K().F();return f.notes||(f.notes=[])};
const todo=()=>{let n=0;try{K().ST.floors.forEach(f=>(f.notes||[]).forEach(x=>{if(!x.fait)n++}))}catch(e){}return n};

/* ---------- Ce qui est sous le doigt ---------- */
function dSeg(p,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],L2=dx*dx+dy*dy||1e-9;let t=((p[0]-a[0])*dx+(p[1]-a[1])*dy)/L2;t=Math.max(0,Math.min(1,t));return{d:Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy),t,L:Math.sqrt(L2)}}
function inPoly(p,P){let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])c=!c}return c}
function hit(p){const P=K(),tol=P.pxM(26);let best=null;
 P.segs().forEach((sg,x)=>{const r=dSeg(p,sg.a,sg.b);if(r.d>tol||(best&&r.d>=best.d))return;let op=null;(P.OP.get(sg.a)||[]).forEach((o,i)=>{const m=r.t*r.L;if(m>=o.p-.05&&m<=o.p+o.w+.05)op={o,i}});best={d:r.d,x,sg,op}});
 if(best){const sg=best.sg;if(best.op){let nm="Ouverture";try{nm=P.opName(best.op.o)}catch(e){}return{t:"op",x:best.x,i:best.op.i,w:`${sg.rm.nom} · ${nm}`}}let nm="Mur";try{nm=P.segName(sg)}catch(e){}return{t:"seg",x:best.x,w:`${sg.rm.nom} · ${nm}`}}
 const rs=P.F().rooms;for(let ri=0;ri<rs.length;ri++)if(inPoly(p,rs[ri].pts))return{t:"room",ri,w:`${rs[ri].nom} · Sol et pièce`};return null}
/* La note retrouve son élément par sa position (le plan peut avoir changé depuis) */
function elOf(n){return hit([n.x,n.y])}

/* ---------- Dessin : épingles numérotées + élément allumé ---------- */
function pins(){const svg=$("svg"),P=K();if(!svg||!P||!P.F)return;let g=svg.querySelector("#nt-g");if(g)g.remove();
 const L=notes(),on=document.documentElement.classList.contains("nt-on");if(!L.length&&!(N&&N.cur))return;if(!on&&!L.some(n=>!n.fait))return;
 const k=P.pxM(1);g=document.createElementNS("http://www.w3.org/2000/svg","g");g.id="nt-g";g.setAttribute("pointer-events","none");let s="";
 const hl=(N&&N.cur)?N.cur:(N&&N.mode==="rep"&&L[N.rep[N.k]])?L[N.rep[N.k]]:null;
 if(hl){const e=hl.el||elOf(hl);if(e){if(e.t==="seg"||e.t==="op"){const sg=P.segs()[e.x];if(sg)s+=`<line class="nt-hl" x1="${sg.a[0]}" y1="${sg.a[1]}" x2="${sg.b[0]}" y2="${sg.b[1]}" stroke-width="${k*12}"/>`}else if(e.t==="room"){const rm=P.F().rooms[e.ri];if(rm)s+=`<polygon class="nt-hlr" points="${rm.pts.map(p=>p.join(",")).join(" ")}"/>`}}}
 L.forEach((n,i)=>{if(!on&&n.fait)return;const r=k*12,x=n.x,y=n.y;s+=`<g class="nt-pin${n.fait?" fait":""}" transform="translate(${x} ${y})"><path d="M0 0 C ${-r*.9} ${-r*1.1} ${-r*1.05} ${-r*1.5} ${-r*1.05} ${-r*2.05} A ${r*1.05} ${r*1.05} 0 1 1 ${r*1.05} ${-r*2.05} C ${r*1.05} ${-r*1.5} ${r*.9} ${-r*1.1} 0 0Z"/><text y="${-r*1.72}" font-size="${r*1.15}">${i+1}</text></g>`});
 if(N&&N.cur&&N.cur.x!=null&&N.mode==="pose"){const r=k*12;s+=`<g class="nt-pin new" transform="translate(${N.cur.x} ${N.cur.y})"><circle r="${r*.45}"/></g>`}
 g.innerHTML=s;svg.appendChild(g)}
let OBS=null;function watch(){const svg=$("svg");if(!svg||OBS)return;OBS=new MutationObserver(()=>{if(!svg.querySelector("#nt-g"))pins()});OBS.observe(svg,{childList:true})}

/* ---------- Écran ---------- */
const CSS=`
html.nt-on #cltools,html.nt-on #legend,html.nt-on #sheet,html.nt-on #opp,html.nt-on #clbanner{display:none!important}
#nt-ov{position:absolute;inset:0;z-index:3;touch-action:none;cursor:crosshair}
#nt-card{position:fixed;left:0;right:0;bottom:0;z-index:70;background:var(--bg);border-radius:22px 22px 0 0;box-shadow:0 -10px 30px rgba(11,18,38,.16);padding:10px 16px calc(14px + env(safe-area-inset-bottom,0px));max-height:62vh;overflow:auto;font:500 15px/1.4 var(--f);color:var(--fg)}
#nt-card[hidden]{display:none}
@media (orientation:landscape) and (max-height:560px){#nt-card{top:0;right:auto;width:min(330px,42vw);max-height:none;border-radius:0 22px 22px 0;padding:max(10px,env(safe-area-inset-top,0px)) 14px max(10px,env(safe-area-inset-bottom,0px)) max(14px,env(safe-area-inset-left,0px))}#nt-card .gr{display:none}#nt-card textarea{min-height:64px}}
#nt-card .gr{display:block;width:40px;height:4px;border-radius:2px;background:var(--line);margin:0 auto 10px}
#nt-card .hd{display:flex;align-items:center;gap:8px;margin:0 0 8px}#nt-card .hd b{flex:1;font-size:16.5px}
#nt-card .chip{display:inline-flex;align-items:center;gap:6px;background:rgba(184,146,79,.16);border-radius:999px;padding:5px 12px;font:800 13px var(--f)}
#nt-card .rd{appearance:none;width:38px;height:38px;border-radius:50%;border:1px solid var(--line);background:var(--surface);color:var(--fg);display:grid;place-items:center;cursor:pointer;padding:0;flex:none}
#nt-card svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
#nt-card textarea{width:100%;box-sizing:border-box;min-height:84px;border:1px solid var(--line);border-radius:14px;background:var(--surface);color:var(--fg);font:500 16px/1.4 var(--f);padding:10px 12px;resize:vertical}
#nt-card .row{display:flex;align-items:center;gap:10px;margin:10px 0 0}
#nt-card .mic{appearance:none;width:58px;height:58px;border-radius:50%;border:0;background:#1B2440;color:#fff;display:grid;place-items:center;cursor:pointer;flex:none;box-shadow:0 0 0 5px rgba(184,146,79,.25)}
#nt-card .mic svg{width:26px;height:26px}#nt-card .mic.on{animation:ntmic 1s ease-in-out infinite}
@keyframes ntmic{50%{box-shadow:0 0 0 10px rgba(184,146,79,.35)}}
#nt-card .ph{position:relative}#nt-card .ph em{position:absolute;top:-6px;right:-6px;min-width:19px;height:19px;border-radius:999px;background:#1B2440;color:#fff;font:800 11px var(--f);font-style:normal;display:grid;place-items:center}
#nt-card .go{appearance:none;flex:1;min-height:52px;border:0;border-radius:999px;background:#1B2440;color:#fff;font:800 16px var(--f);cursor:pointer;padding:0 18px}
#nt-card .go2{appearance:none;flex:1;min-height:48px;border:1px solid var(--line);border-radius:999px;background:var(--surface);color:var(--fg);font:800 15px var(--f);cursor:pointer}
:root[data-theme="dark"] #nt-card .go,:root[data-theme="dark"] #nt-card .mic{background:#F2EEE4;color:#1B2440}
:root[data-theme="dark"] #nt-card .ph em{background:#F2EEE4;color:#1B2440}
#nt-card .cons{display:flex;gap:8px;align-items:center;color:var(--muted);font-size:14px;margin:8px 2px 0}#nt-card .cons i{width:7px;height:7px;border-radius:50%;background:#B8924F;flex:none}
#nt-card .li{appearance:none;width:100%;text-align:left;display:flex;gap:10px;align-items:flex-start;border:0;border-bottom:1px solid var(--line);background:none;color:var(--fg);padding:10px 2px;cursor:pointer;font:500 14px/1.35 var(--f)}
#nt-card .li>i{flex:none;width:22px;height:22px;border-radius:50%;background:#1B2440;color:#fff;font:800 12px/22px var(--f);font-style:normal;text-align:center}
#nt-card .li b{display:block;font-weight:800}#nt-card .li small{color:var(--muted);font-size:13px}#nt-card .li.fait{opacity:.5}#nt-card .li.fait b{text-decoration:line-through}
:root[data-theme="dark"] #nt-card .li>i{background:#F2EEE4;color:#1B2440}
#nt-card .rep{appearance:none;width:100%;display:flex;align-items:center;gap:12px;border:1px solid var(--line);background:var(--surface);color:var(--fg);border-radius:16px;padding:12px 14px;cursor:pointer;text-align:left;margin:0 0 6px;font:500 13px var(--f)}
#nt-card .rep b{display:block;font-size:15.5px;font-weight:800}#nt-card .rep small{color:var(--muted)}#nt-card .rep>svg{flex:none;width:22px;height:22px}#nt-card .rep span{flex:1}
#nt-card .q{background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:10px 12px;font-size:15.5px}
#nt-card .phs{display:flex;gap:8px;overflow:auto;margin:8px 0 0}#nt-card .phs img{width:84px;height:64px;object-fit:cover;border-radius:10px;flex:none}
#nt-card .lnk{appearance:none;border:0;background:none;color:var(--muted);font:700 13.5px var(--f);text-decoration:underline;cursor:pointer;padding:8px 2px}
#nt-card .lnk.del{color:#C0392B}
#svg .nt-pin path{fill:#1B2440;stroke:#fff;stroke-width:1.5px;vector-effect:non-scaling-stroke}#svg .nt-pin text{fill:#fff;font-weight:800;text-anchor:middle;font-family:var(--f)}
#svg .nt-pin.fait path{fill:#8A90A0}#svg .nt-pin.new circle{fill:#B8924F;stroke:#fff;stroke-width:2px;vector-effect:non-scaling-stroke}
:root[data-theme="dark"] #svg .nt-pin path{fill:#F2EEE4;stroke:#1B2440}:root[data-theme="dark"] #svg .nt-pin text{fill:#1B2440}
#svg .nt-hl{stroke:#B8924F;stroke-linecap:round;opacity:.55;animation:nthl 1.4s ease-in-out infinite}#svg .nt-hlr{fill:#B8924F;opacity:.22;animation:nthl 1.4s ease-in-out infinite}
@keyframes nthl{50%{opacity:.18}}
.cltool[data-cl="notes"]{position:relative}.cltool[data-cl="notes"] em{position:absolute;top:2px;right:calc(50% - 26px);min-width:18px;height:18px;border-radius:999px;background:#1B2440;color:#fff;font:800 10.5px/18px var(--f);font-style:normal;padding:0 4px}
:root[data-theme="dark"] .cltool[data-cl="notes"] em{background:#F2EEE4;color:#1B2440}
#z-help{font:800 17px var(--f)}
#nt-aide{position:absolute;z-index:6;left:8px;right:8px;bottom:92px;max-height:70%;overflow:auto;background:var(--bg);border-radius:16px;box-shadow:var(--up-s,0 8px 24px rgba(0,0,0,.15));padding:12px 14px;font:500 14px/1.45 var(--f);color:var(--fg)}
#nt-aide[hidden]{display:none}#nt-aide b{display:block;font-size:15px;margin:0 0 4px}#nt-aide ul{margin:0 0 6px;padding-left:18px}
html.nt-aide #nt-aide #legend{display:flex!important;flex-wrap:wrap;gap:6px 12px;position:static!important;box-shadow:none!important;background:none!important;padding:0!important;margin:6px 0 0}
`;
function ensure(){if($("nt-card"))return;const st=document.createElement("style");st.textContent=CSS;document.head.appendChild(st);
 const c=document.createElement("div");c.id="nt-card";c.hidden=true;c.setAttribute("role","dialog");c.setAttribute("aria-label","Notes de chantier");document.body.appendChild(c);
 c.addEventListener("click",onClick);c.addEventListener("input",e=>{if(e.target.id==="nt-tx"&&N&&N.cur)N.cur.txt=e.target.value});
 const fi=document.createElement("input");fi.type="file";fi.accept="image/*";fi.id="nt-file";fi.hidden=true;document.body.appendChild(fi);fi.addEventListener("change",()=>{const f=fi.files&&fi.files[0];fi.value="";photo(f)})}
function overlay(on){let o=$("nt-ov");if(!on){if(o)o.remove();return}if(o)return;const b=$("board");if(!b)return;o=document.createElement("div");o.id="nt-ov";b.appendChild(o);
 let d=null;o.addEventListener("pointerdown",e=>{d={x:e.clientX,y:e.clientY,id:e.pointerId}});o.addEventListener("pointerup",e=>{if(!d||e.pointerId!==d.id)return;const m=Math.hypot(e.clientX-d.x,e.clientY-d.y);d=null;if(m>12)return;tap(e)})}
function tap(e){const P=K(),p=P.pt(e);
 /* une épingle existante sous le doigt : on la rouvre */
 const L=notes(),r=P.pxM(22);const j=L.findIndex(n=>Math.hypot(n.x-p[0],n.y-p[1]+P.pxM(14))<r);if(j>=0){N={mode:"pose",cur:{...L[j],idx:j}};render();pins();return}
 const h=hit(p);if(!h){toast("Touchez un mur, une pièce, une porte ou le sol");return}
 if(N&&N.cur&&N.cur.idx==null&&String(N.cur.txt||"").trim())keep();
 N={mode:"pose",cur:{x:p[0],y:p[1],t:h.t,w:h.w,txt:"",el:h}};render();pins();setTimeout(()=>{const t=$("nt-tx");if(t&&matchMedia("(pointer:fine)").matches)t.focus()},60)}
function keep(){const c=N&&N.cur;if(!c)return;const txt=String(c.txt||"").trim();if(!txt&&!(c.ph&&c.ph.length)){N.cur=null;return}
 const P=K();try{P.hist()}catch(e){}const L=notes(),o={x:c.x,y:c.y,t:c.t,w:c.w,txt,...(c.ph&&c.ph.length?{ph:c.ph}:{}),d:c.d||new Date().toISOString().slice(0,10)};if(c.fait)o.fait=1;
 if(c.idx!=null)L[c.idx]=o;else L.push(o);N.cur=null;save()}
function save(){const P=K();try{P.draw();P.notify();P.autosave&&P.autosave()}catch(e){}badge()}
function badge(){const b=document.querySelector('.cltool[data-cl="notes"]');if(!b)return;const n=todo();let em=b.querySelector("em");if(!n){if(em)em.remove();return}if(!em){em=document.createElement("em");b.appendChild(em)}em.textContent=n}
function render(){ensure();const c=$("nt-card");if(!N){c.hidden=true;return}c.hidden=false;const L=notes();let h='<i class="gr"></i>';
 if(N.mode==="rep"){const R=N.rep,k=N.k,n=L[R[k]];if(!n){N.mode="pose";return render()}const e=elOf(n);
  h+=`<div class="hd"><span class="chip">Note ${k+1} sur ${R.length} · ${esc(n.w)}</span><span style="flex:1"></span><button class="rd" data-a="x" aria-label="Fermer">${ico("x")}</button></div><div class="q">« ${esc(n.txt||"Voir la photo")} »</div>${n.ph&&n.ph.length?`<div class="phs">${n.ph.map(p=>`<img src="${p.u}" alt="">`).join("")}</div>`:""}
  <div class="row">${e?`<button class="go2" data-a="ouvre">${e.t==="room"?"Ouvrir la pièce":e.t==="op"?"Ouvrir "+(/porte/i.test(e.w)?"la porte":"la fenêtre"):"Ouvrir le mur"}</button>`:""}<button class="go2" data-a="tard">Plus tard</button></div><div class="row"><button class="go" data-a="fait">${k<R.length-1?"C'est fait, note suivante":"C'est fait"}</button></div>`}
 else if(N.cur){const c2=N.cur,np=(c2.ph||[]).length;
  h+=`<div class="hd"><span class="chip">${esc(c2.w)}</span><span style="flex:1"></span><button class="rd" data-a="annule" aria-label="Fermer sans garder">${ico("x")}</button></div><textarea id="nt-tx" placeholder="Dites ou écrivez ce qu'il faut faire ici">${esc(c2.txt||"")}</textarea>
  <div class="row"><button class="mic" data-a="mic" aria-label="Dicter la note">${ico("mic")}</button><button class="rd ph" data-a="photo" aria-label="Ajouter une photo">${ico("cam")}${np?`<em>${np}</em>`:""}</button><button class="go" data-a="range">Ranger la note</button></div>
  ${c2.idx!=null?`<div class="row" style="justify-content:space-between"><button class="lnk" data-a="${c2.fait?"refaire":"faite"}">${c2.fait?"Remettre à reprendre":"Marquer comme faite"}</button><button class="lnk del" data-a="suppr">Supprimer la note</button></div>`:`<div class="cons"><i></i>Touchez un autre endroit pour une autre note.</div>`}`}
 else{const n=todo(),mine=L.map((x,i)=>({x,i}));
  h+=`<div class="hd"><b>Notes du chantier</b><button class="rd" data-a="x" aria-label="Fermer">${ico("x")}</button></div>`;
  if(n)h+=`<button class="rep" data-a="reprendre">${ico("home")}<span><b>${n} note${n>1?"s":""} à reprendre</b><small>Une par une, l'endroit s'allume sur le plan</small></span>${ico("nx")}</button>`;
  h+=`<div class="cons"><i></i>Touchez un mur, une pièce, une porte ou le sol pour laisser une note.</div>`;
  if(mine.length)h+=`<div style="margin:8px 0 0">${mine.map(({x,i})=>`<button class="li${x.fait?" fait":""}" data-i="${i}"><i>${i+1}</i><span><b>${esc(x.w)}</b><small>${esc(x.txt||(x.ph?"Photo":""))}</small></span></button>`).join("")}</div>`;
  h+=`<div class="row"><button class="go" data-a="x">C'est bon pour aujourd'hui</button></div>`}
 c.innerHTML=h;fitBoard()}
/* le plan reste visible au-dessus de la carte */
function fitBoard(){const c=$("nt-card"),b=$("board");if(!b)return;b.style.paddingBottom="";b.style.paddingLeft="";if(c&&!c.hidden&&innerWidth>innerHeight&&innerHeight<=560){const r=b.getBoundingClientRect(),cw=c.getBoundingClientRect().width,over=cw-r.left;if(over>0)b.style.paddingLeft=over+"px";return}if(c&&!c.hidden){const r=b.getBoundingClientRect(),ch=c.getBoundingClientRect().height,over=r.bottom-(innerHeight-ch);if(over>0)b.style.paddingBottom=Math.min(over,r.height*.55)+"px"}}
let REC=null;
function mic(){const t=$("nt-tx"),b=document.querySelector("#nt-card .mic");const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(REC){try{REC.stop()}catch(e){}return}
 if(!SR){if(t){t.focus()}toast("Touchez la case, puis le micro du clavier pour dicter");return}
 try{const r=new SR();REC=r;r.lang="fr-FR";r.interimResults=false;r.continuous=false;b&&b.classList.add("on");
  r.onresult=e=>{const s=[...e.results].map(x=>x[0].transcript).join(" ").trim();if(!s)return;const v=(N.cur.txt||"").trim();N.cur.txt=(v?v+" ":"")+s.charAt(0).toUpperCase()+s.slice(1);if(t)t.value=N.cur.txt};
  r.onerror=e=>{toast(e&&e.error==="not-allowed"?"Micro non autorisé : touchez la case puis le micro du clavier":"La dictée n'a pas marché");t&&t.focus()};
  r.onend=()=>{REC=null;b&&b.classList.remove("on")};r.start()}catch(e){REC=null;t&&t.focus()}}
function photo(f){if(!f||!/^image\//.test(f.type)||!N||!N.cur)return;const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{let u=r.result;try{const s=Math.min(1,1400/Math.max(im.width,im.height));if(s<1){const c=document.createElement("canvas");c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);c.getContext("2d").drawImage(im,0,0,c.width,c.height);u=c.toDataURL("image/jpeg",.82)}}catch(x){}if(!N||!N.cur)return;N.cur.ph=(N.cur.ph||[]).concat([{u}]);render()};im.src=r.result};r.readAsDataURL(f)}
function onClick(e){const b=e.target.closest("button");if(!b||!N)return;const a=b.dataset.a,L=notes();
 if(b.dataset.i!=null){const i=+b.dataset.i;N={mode:"pose",cur:{...L[i],idx:i}};render();pins();return}
 if(a==="x"){if(N.cur&&String(N.cur.txt||"").trim())keep();return stop()}
 if(a==="annule"){N.cur=null;render();pins();return}
 if(a==="range"){keep();render();pins();toast("Note rangée sur le plan");return}
 if(a==="mic")return mic();
 if(a==="photo"){const f=$("nt-file");f&&f.click();return}
 if(a==="suppr"){const i=N.cur.idx;try{K().hist()}catch(e){}L.splice(i,1);N.cur=null;save();render();pins();return}
 if(a==="faite"||a==="refaire"){N.cur.fait=a==="faite"?1:0;keep();render();pins();return}
 if(a==="reprendre"){const R=L.map((n,i)=>n.fait?-1:i).filter(i=>i>=0);if(!R.length)return;N={mode:"rep",rep:R,k:0};render();pins();return}
 if(a==="tard"||a==="fait"){if(a==="fait"){try{K().hist()}catch(x){}L[N.rep[N.k]].fait=1;save()}if(N.k<N.rep.length-1){N.k++;render();pins()}else{toast(a==="fait"?"Toutes les notes sont reprises ✓":"Les autres notes attendent");stop()}return}
 if(a==="ouvre"){const n=L[N.rep[N.k]],el=elOf(n),P=K();stop(true);try{if(el.t==="seg")P.openWall(el.x);else if(el.t==="op")P.openOp(el.x,el.i);else P.openRoom(el.ri)}catch(x){}return}}
function start(){ensure();const P=K();try{P.closeSheet(true);P.setMode("plan")}catch(e){}document.documentElement.classList.add("nt-on");overlay(true);N={mode:"pose",cur:null};render();pins();press(true)}
function stop(keepPins){N=null;document.documentElement.classList.remove("nt-on");overlay(false);render();const b=$("board");if(b){b.style.paddingBottom="";b.style.paddingLeft=""}pins();press(false);badge()}
function press(on){const b=document.querySelector('.cltool[data-cl="notes"]');if(b)b.setAttribute("aria-pressed",on)}
function toggle(){if(N)stop();else start()}
function toast(t){let d=$("nt-toast");if(!d){d=document.createElement("div");d.id="nt-toast";d.style.cssText="position:fixed;left:50%;top:calc(12px + env(safe-area-inset-top,0px));transform:translateX(-50%);z-index:90;background:#1B2440;color:#fff;font:800 14px var(--f);padding:10px 16px;border-radius:999px;box-shadow:0 8px 24px rgba(0,0,0,.2);max-width:90vw;text-align:center";document.body.appendChild(d)}d.textContent=t;d.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>{d.hidden=true},2400)}
/* Aide « ? » à côté du zoom : les gestes + la légende des matériaux (sortie de la barre du bas, Cyril 21/11) */
function aide(){const fit=$("z-fit");if(!fit||$("z-help"))return;const b=document.createElement("button");b.id="z-help";b.type="button";b.setAttribute("aria-label","Aide : gestes et couleurs");b.textContent="?";fit.after(b);
 const d=document.createElement("div");d.id="nt-aide";d.hidden=true;d.innerHTML=`<b>Aide</b><ul><li>Un doigt déplace le plan, deux doigts zooment.</li><li>Touchez une pièce, un mur, une porte pour le régler.</li><li>Le cadenas fige le plan.</li></ul><b>Les couleurs des matériaux</b>`;const lg=$("legend");const bd=$("board");if(bd)bd.appendChild(d);
 b.addEventListener("click",e=>{e.stopPropagation();const on=d.hidden;d.hidden=!on;document.documentElement.classList.toggle("nt-aide",on);document.documentElement.classList.toggle("pro-leg",on);if(lg&&on)d.appendChild(lg)});
 document.addEventListener("pointerdown",e=>{if(!d.hidden&&!d.contains(e.target)&&e.target!==b){d.hidden=true;document.documentElement.classList.remove("nt-aide","pro-leg")}},true)}
function boot(){const P=K();if(!P||P.CL)return;ensure();watch();aide();badge();pins();addEventListener("resize",fitBoard)}
function wait(n){if(K()&&$("svg"))return boot();if(n>80)return;setTimeout(()=>wait(n+1),100)}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>wait(0));else wait(0);
window.PKNOTES={start,stop,toggle,todo,pins};
})();
