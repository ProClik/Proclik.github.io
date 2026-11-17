/* ProClik · Loupe du plan (17/11, idée de Cyril) : sur téléphone et tablette, le doigt cache ce qu'on touche.
   Pendant qu'on glisse quelque chose (point, mur, fenêtre, pièce, tracé…), une loupe ronde montre au-dessus du doigt
   la zone agrandie, avec une petite mire au centre. Rien à la souris, rien pendant le déplacement ou le zoom du plan. */
(function(){
"use strict";
const S=132,Z=2.4;
let D=null,raf=0,last=null,box=null;
const api=()=>window.PKPLAN;
function svg(){return document.getElementById("svg")}
function el(){if(box)return box;box=document.createElement("div");box.id="pk-loupe";box.setAttribute("aria-hidden","true");box.innerHTML='<svg xmlns="http://www.w3.org/2000/svg"></svg><i></i>';
 const st=document.createElement("style");st.textContent="#pk-loupe{position:fixed;width:"+S+"px;height:"+S+"px;border-radius:50%;overflow:hidden;z-index:9999;background:var(--paper,#F7F8FA);box-shadow:0 0 0 3px #B8924F,0 10px 28px rgba(0,0,0,.25);pointer-events:none}#pk-loupe[hidden]{display:none}#pk-loupe svg{width:100%;height:100%;display:block}#pk-loupe i{position:absolute;left:50%;top:50%;width:16px;height:16px;margin:-8px 0 0 -8px;border:1.5px solid #B8924F;border-radius:50%;opacity:.75}";
 document.head.appendChild(st);document.body.appendChild(box);box.hidden=true;return box}
function hide(){if(box)box.hidden=true}
function toSvg(s,x,y){const m=s.getScreenCTM();if(!m)return null;const p=s.createSVGPoint();p.x=x;p.y=y;return p.matrixTransform(m.inverse())}
function show(){raf=0;const e=last,s=svg(),P=api();if(!D||!e||!s||!P)return;
 const pd=P.PD;if(!pd||pd.type==="pan"||pd.type==="pinch"){hide();return}
 if(Math.hypot(e.x-D.x,e.y-D.y)<8)return;
 const p=toSvg(s,e.x,e.y);if(!p)return;const vb=s.viewBox.baseVal,r=s.getBoundingClientRect();if(!vb||!vb.width||!r.width)return;
 const w=S*(vb.width/r.width)/Z,b=el(),ls=b.firstChild;
 ls.setAttribute("viewBox",(p.x-w/2)+" "+(p.y-w/2)+" "+w+" "+w);ls.setAttribute("class",s.getAttribute("class")||"");ls.innerHTML=s.innerHTML;
 let top=e.y-S-64;if(top<6)top=e.y+56;b.style.left=Math.max(6,Math.min(innerWidth-S-6,e.x-S/2))+"px";b.style.top=top+"px";b.hidden=false}
addEventListener("pointerdown",e=>{const s=svg();if(!s||!s.contains(e.target))return;if(e.pointerType==="mouse"||!e.isPrimary){D=null;hide();return}D={id:e.pointerId,x:e.clientX,y:e.clientY}},true);
addEventListener("pointermove",e=>{if(!D)return;if(e.pointerId!==D.id){D=null;hide();return}last={x:e.clientX,y:e.clientY};if(!raf)raf=requestAnimationFrame(show)},true);
["pointerup","pointercancel"].forEach(t=>addEventListener(t,e=>{if(D&&e.pointerId===D.id){D=null;hide()}},true));
})();
