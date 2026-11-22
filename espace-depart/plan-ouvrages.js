/* ProClik · Plan de l'artisan : ouvrages posés dans les vues de face (lot B9, 22/11, Cyril).
   Caissons, retombées, bâti-support WC (Placo) et verrières (Menuiserie) se retrouvent sur le plan de départ :
   hachurés quand ils sont au sol (caisson vertical, bâti WC), en pointillés quand ils sont en hauteur (retombée,
   caisson au plafond, convention des plans d'architecte), verrière = vitrage dans l'épaisseur du mur. */
(function(){
"use strict";
if(/[?&]client/.test(location.search))return;
const K=()=>window.PKPLAN,$=id=>document.getElementById(id),NS="http://www.w3.org/2000/svg";
const MUR={cv:"Caisson",rt:"Retombée",bwc:"Bâti WC",verr:"Verrière",verp:"Verrière"},HAUT={rt:1};
const CSS=`#ou-g .ou{fill:url(#ou-hv);stroke:var(--fg);vector-effect:non-scaling-stroke;stroke-width:1.4}
#ou-g .ou.dsh{stroke-dasharray:6 4;fill-opacity:.7}
#ou-g .zb{fill:rgba(94,139,168,.10);stroke:#5E8BA8;vector-effect:non-scaling-stroke;stroke-width:1.4;stroke-dasharray:8 5}
#ou-g .hv{stroke:var(--fg);stroke-width:.012;opacity:.55}
#ou-g .vr{fill:var(--surface,#fff);stroke:var(--fg);vector-effect:non-scaling-stroke;stroke-width:1.2}
#ou-g .vl{stroke:#5E8BA8;vector-effect:non-scaling-stroke;stroke-width:1.6}
#ou-g .vp{fill:none;stroke:var(--fg);vector-effect:non-scaling-stroke;stroke-width:1;stroke-dasharray:3 3}
#ou-g text{fill:var(--muted);font-weight:700;font-family:var(--f,system-ui);paint-order:stroke;stroke:var(--paper,#fff);stroke-linejoin:round}`;
function H(){try{return Math.round(((K().F().H)||2.5)*100)}catch(e){return 250}}
/* côté de la pièce : normale vers le centre de la pièce du segment */
function side(P,sg){const L=P.dist(sg.a,sg.b),u=[(sg.b[0]-sg.a[0])/L,(sg.b[1]-sg.a[1])/L];let n=[-u[1],u[0]];const rm=sg.rm;
 if(rm&&rm.pts){let cx=0,cy=0;rm.pts.forEach(p=>{cx+=p[0];cy+=p[1]});cx/=rm.pts.length;cy/=rm.pts.length;const mx=(sg.a[0]+sg.b[0])/2,my=(sg.a[1]+sg.b[1])/2;if((cx-mx)*n[0]+(cy-my)*n[1]<0)n=[-n[0],-n[1]]}
 return{L,u,n}}
function leftIsA(P,sg){if(sg.kind!=="mur")return true;try{const n=P.inward(sg),d=[sg.b[0]-sg.a[0],sg.b[1]-sg.a[1]];return d[0]*n[1]-d[1]*n[0]>0}catch(e){return true}}
const f2=v=>+v.toFixed(3);
function draw(){const P=K(),svg=$("svg");if(!P||!svg||P.CL)return;let g=svg.querySelector("#ou-g");if(g)g.remove();
 const T=(window.PKFACES&&PKFACES.T)||{};let s="";const u1=P.pxM(1),fs=u1*10.5;
 P.segs().forEach(sg=>{const E=(P.EQ.get(sg.a)||[]).filter(e=>MUR[e.t]);if(!E.length)return;const{L,u,n}=side(P,sg),la=leftIsA(P,sg);
  E.forEach(e=>{const d=T[e.t]||{},w=(e.w!=null?e.w:d.dw||60)/100,p=(e.p!=null?e.p:d.dp||0)/100,xc=e.x/100,s1=la?xc-w/2:L-xc-w/2,s2=s1+w;
   const A=[sg.a[0]+u[0]*s1,sg.a[1]+u[1]*s1],B=[sg.a[0]+u[0]*s2,sg.a[1]+u[1]*s2];
   if(/^ver/.test(e.t)){const t=.05,q=k=>[[A[0]+n[0]*k,A[1]+n[1]*k],[B[0]+n[0]*k,B[1]+n[1]*k]];const a=q(-t),b=q(t);
    s+=`<polygon class="vr" points="${[a[0],a[1],b[1],b[0]].map(v=>f2(v[0])+","+f2(v[1])).join(" ")}"/><line class="vl" x1="${f2(A[0])}" y1="${f2(A[1])}" x2="${f2(B[0])}" y2="${f2(B[1])}"/>`;
    if(e.t==="verp"){const pw=Math.min((d.porte||83)/100,w-.2),C=[A[0]+u[0]*pw,A[1]+u[1]*pw],O=[A[0]+n[0]*pw,A[1]+n[1]*pw];s+=`<path class="vp" d="M${f2(A[0])} ${f2(A[1])}L${f2(O[0])} ${f2(O[1])}A${pw} ${pw} 0 0 ${n[0]*u[1]-n[1]*u[0]>0?0:1} ${f2(C[0])} ${f2(C[1])}"/>`}}
   else{const dp=Math.max(p,.05),C=[B[0]+n[0]*dp,B[1]+n[1]*dp],D=[A[0]+n[0]*dp,A[1]+n[1]*dp];s+=`<polygon class="ou${HAUT[e.t]?" dsh":""}" points="${[A,B,C,D].map(v=>f2(v[0])+","+f2(v[1])).join(" ")}"/>`}
   const m=[(A[0]+B[0])/2+n[0]*(Math.max(p,.05)+fs*1.1),(A[1]+B[1])/2+n[1]*(Math.max(p,.05)+fs*1.1)];
   s+=`<text x="${f2(m[0])}" y="${f2(m[1]+fs*.35)}" font-size="${f2(fs)}" text-anchor="middle">${MUR[e.t]}</text>`})});
 /* caissons au plafond : pointillés */
 /* zones de plafond plus bas (22/11) : rectangle bleu en pointillés + hauteur depuis le sol */
 const Hc=H();P.F().rooms.forEach(rm=>(rm.eqp||[]).forEach(e=>{if(e.t!=="zb")return;const w=(e.w||200)/100,l=(e.l||150)/100,hz=((Hc-(e.hh!=null?e.hh:20))/100).toFixed(2).replace(".",",");s+=`<rect class="zb" x="${f2(e.x-w/2)}" y="${f2(e.y-l/2)}" width="${f2(w)}" height="${f2(l)}"/><text x="${f2(e.x)}" y="${f2(e.y+fs*.35)}" font-size="${f2(fs)}" text-anchor="middle">Plafond à ${hz} m</text>`}));
 P.F().rooms.forEach(rm=>(rm.eqp||[]).forEach(e=>{if(e.t!=="cp")return;const w=(e.w||200)/100,l=(e.l||15)/100;s+=`<rect class="ou dsh" x="${f2(e.x-w/2)}" y="${f2(e.y-l/2)}" width="${f2(w)}" height="${f2(l)}"/><text x="${f2(e.x)}" y="${f2(e.y+l/2+fs*1.2)}" font-size="${f2(fs)}" text-anchor="middle">Caisson −${Math.round(e.hh||15)}</text>`}));
 if(!s)return;g=document.createElementNS(NS,"g");g.id="ou-g";g.setAttribute("pointer-events","none");
 g.setAttribute("stroke-width",f2(fs*.3));g.innerHTML=`<defs><pattern id="ou-hv" width=".07" height=".07" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line class="hv" x1="0" y1="0" x2="0" y2=".07"/></pattern></defs>`+s;
 /* sous les étiquettes (repères, cotes, noms des pièces) : juste après les traits des murs */const K2=[...svg.children];let li=-1;K2.forEach((c,i)=>{if(c.tagName==="line")li=i});const at=li>=0?K2[li+1]:svg.querySelector("#rx-g,#nt-g");if(at)svg.insertBefore(g,at);else svg.appendChild(g)}
function boot(){const P=K(),svg=$("svg");if(!P||P.CL||!svg)return;const st=document.createElement("style");st.textContent=CSS;document.head.appendChild(st);
 let T=null;const re=()=>{clearTimeout(T);T=setTimeout(draw,60)};
 new MutationObserver(L=>{if(L.every(m=>[...m.addedNodes,...m.removedNodes].every(x=>x.id==="ou-g"||x.id==="rx-g"||x.id==="nt-g")))return;re()}).observe(svg,{childList:true});
 document.addEventListener("pk-faces-close",re);draw()}
function wait(n){if(K()&&$("svg"))return boot();if(n>80)return;setTimeout(()=>wait(n+1),100)}
wait(0);
window.PKOUV={draw};
})();
