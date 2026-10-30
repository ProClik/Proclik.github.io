/* Ouverture ProClik (validée par Cyril le 28/10).
   Longue (~9,7 s) : un bouton galet au centre reçoit un clic, le point trace le P, le nom arrive, puis le P se range dans le bouton du haut de l'Espace.
   Courte (~1,5 s) : pour les ouvertures suivantes de la journée, le P se trace dans son bouton en haut de l'Espace.
   Sur le site (data-mode="site"), toujours la longue, et le logo reste affiché à la fin. Un appui sur l'écran passe l'ouverture. */
(function(){
var d=document,root=d.documentElement,me=d.currentScript,site=me&&me.getAttribute('data-mode')==='site';
/* vitrine (data-mode="vitrine") : longue à la toute première visite, courte ensuite ; data-cible = où le P se range */
var vitrine=me&&me.getAttribute('data-mode')==='vitrine',CIB=(me&&me.getAttribute('data-cible'))||'.brand>svg,.brand>span:first-child,.brand>img';
var reduit=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var t=new Date(),jour=t.getFullYear()+'-'+(t.getMonth()+1)+'-'+t.getDate(),court=false;
if(vitrine){try{court=!!localStorage.getItem('pc-ouv-site');localStorage.setItem('pc-ouv-site','1')}catch(e){}}
else if(!site){try{court=localStorage.getItem('pc-ouv')===jour;localStorage.setItem('pc-ouv',jour)}catch(e){}}
var css=
'#pc-ouv{--m:#ECEEF2;--mt:#262B38;--md:#6B7280;--ml:#A8823F;--mh:#FFFFFF;--mo:#C5CAD4;--mlc:#E2C68C;--d:cubic-bezier(.45,0,.25,1);position:fixed;inset:0;z-index:200;background:var(--m);display:grid;place-items:center;font-family:Manrope,system-ui,-apple-system,sans-serif;transition:opacity .6s ease;-webkit-tap-highlight-color:transparent}'+
':root[data-theme="dark"] #pc-ouv{--m:#1E2433;--mt:#E6E8EE;--md:#9AA1B0;--ml:#D4B483;--mh:#313B53;--mo:#121620;--mlc:#FBEFD6}'+
'@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) #pc-ouv{--m:#1E2433;--mt:#E6E8EE;--md:#9AA1B0;--ml:#D4B483;--mh:#313B53;--mo:#121620;--mlc:#FBEFD6}}'+
'#pc-ouv.fin{opacity:0;pointer-events:none}'+
'#pc-ouv *,#pc-ouv *::before,#pc-ouv *::after{animation-play-state:paused}#pc-ouv.go *,#pc-ouv.go *::before,#pc-ouv.go *::after{animation-play-state:running}'+
'#pc-ouv .lock{position:relative;z-index:1;display:flex;align-items:center;gap:14px;color:var(--mt)}'+
'#pc-ouv .pbox{position:relative;display:grid;place-items:center;transform-origin:0 0}'+
'#pc-ouv .pb{width:48px;height:56px;overflow:visible;flex:none}'+
'#pc-ouv .pb path{fill:none;stroke-linecap:round;stroke-linejoin:round}'+
'#pc-ouv .big{transform-box:view-box;transform-origin:50px 50px;transform:translateX(var(--dxu,0px)) scale(3);animation:pcReduit 1s cubic-bezier(.65,0,.35,1) 4.5s forwards}'+
'#pc-ouv .l{stroke:var(--ml);stroke-width:3.3;stroke-dasharray:100 110;stroke-dashoffset:101;animation:pcTrace 1.3s cubic-bezier(.5,0,.3,1) 2.85s forwards,pcFineL 1s cubic-bezier(.65,0,.35,1) 4.5s forwards}'+
'#pc-ouv .sh{stroke:var(--mlc);stroke-width:3.5;stroke-dasharray:8 200;stroke-dashoffset:8;animation:pcReflet 1.3s cubic-bezier(.5,0,.3,1) 2.85s forwards,pcEteint .35s ease 4.15s forwards}'+
'#pc-ouv .pen{stroke:var(--ml);stroke-width:7.5;opacity:0;offset-path:path("M52 69.7 A23 23 0 1 0 33 47 V75 L56 47");offset-rotate:0deg;offset-distance:0%;animation:pcPoint .45s var(--d) .45s forwards,pcPlume 2.05s linear 2.45s forwards,pcFineD 1s cubic-bezier(.65,0,.35,1) 4.5s forwards}'+
'#pc-ouv .filet{width:1px;align-self:stretch;background:var(--ml);opacity:.7;transform:scaleY(0);animation:pcFilet .55s var(--d) 5.1s forwards}'+
'#pc-ouv .nom{font-weight:300;font-size:21px;letter-spacing:.32em;line-height:1;white-space:nowrap;margin-right:-.32em}'+
'#pc-ouv .nom .lt{display:inline-block;opacity:0;animation:pcLettre .55s var(--d) calc(5.25s + var(--i) * 55ms) forwards}'+
'#pc-ouv .nom small{display:block;font-size:7.5px;font-weight:600;letter-spacing:.1em;color:var(--md);margin-top:8px;opacity:0;animation:pcApparait .6s ease 5.85s forwards}'+
'#pc-ouv.espace .filet{animation:pcFilet .55s var(--d) 5.1s forwards,pcEfface .55s ease 7.3s forwards}'+
'#pc-ouv.espace .nom{animation:pcEfface .55s ease 7.3s forwards}'+
'#pc-ouv.espace .pbox{animation:pcRange 1.3s cubic-bezier(.65,0,.35,1) 7.75s forwards}'+
'#pc-ouv .g{position:absolute;left:50%;top:50%;width:76px;height:76px;margin:-38px 0 0 -38px;border-radius:50%;opacity:0;animation:pcLeve .8s var(--d) .1s forwards,pcAppui 1.3s cubic-bezier(.3,0,.2,1) 1.15s,pcFond .5s var(--d) 2.5s forwards}'+
'#pc-ouv .g::before,#pc-ouv .g::after{content:"";position:absolute;inset:0;border-radius:50%;background:var(--m)}'+
'#pc-ouv .g::before{box-shadow:-6px -6px 14px var(--mh),6px 6px 16px var(--mo);animation:pcOmbre 1.3s cubic-bezier(.3,0,.2,1) 1.15s}'+
'#pc-ouv .g::after{box-shadow:inset 4px 4px 9px var(--mo),inset -4px -4px 9px var(--mh);opacity:0;animation:pcCreux 1.3s cubic-bezier(.3,0,.2,1) 1.15s}'+
'@keyframes pcTrace{from{stroke-dashoffset:101}to{stroke-dashoffset:0}}'+
'@keyframes pcReflet{from{stroke-dashoffset:8}to{stroke-dashoffset:-92}}'+
'@keyframes pcEteint{to{opacity:0}}'+
'@keyframes pcPoint{from{opacity:0;transform:scale(.4)}to{opacity:1;transform:scale(1)}}'+
'@keyframes pcReduit{to{transform:none}}'+
'@keyframes pcFineL{from{stroke-width:3.3}to{stroke-width:5}}'+
'@keyframes pcFineD{from{stroke-width:7.5}to{stroke-width:12}}'+
'@keyframes pcFilet{from{transform:scaleY(0)}to{transform:scaleY(1)}}'+
'@keyframes pcLettre{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}'+
'@keyframes pcApparait{from{opacity:0}to{opacity:1}}'+
'@keyframes pcEfface{to{opacity:0;transform:translateX(6px)}}'+
'@keyframes pcRange{to{transform:translate(var(--px),var(--py)) scale(var(--ps,.66))}}'+
'@keyframes pcLeve{from{opacity:0}to{opacity:1}}'+
'@keyframes pcAppui{0%{transform:scale(1)}18%,30%{transform:scale(.955)}100%{transform:scale(1)}}'+
'@keyframes pcOmbre{0%{opacity:1}18%,30%{opacity:0}100%{opacity:1}}'+
'@keyframes pcCreux{0%{opacity:0}18%,30%{opacity:1}100%{opacity:0}}'+
'@keyframes pcFond{to{opacity:0}}'+
/* version courte : le P se trace dans son bouton en haut de l'Espace */
'.pc-court .brand>svg,.pc-court .brand>span:first-child,.pc-court .brand>img{animation:pcLeve .45s cubic-bezier(.45,0,.25,1) both}'+
'.pc-court .brand>svg .pcl{stroke-dasharray:100 110;stroke-dashoffset:101;animation:pcTrace .7s cubic-bezier(.5,0,.3,1) .15s forwards}'+
'.pc-court .brand>svg .pcd{transform-box:fill-box;transform-origin:center;animation:pcPoint .35s cubic-bezier(.45,0,.25,1) .75s both}'+
'.pc-court .logo .g>svg{animation:pcLeve .45s cubic-bezier(.45,0,.25,1) both}'+
'.pc-court .logo .g>svg .pcl{stroke-dasharray:100 110;stroke-dashoffset:101;animation:pcTrace .7s cubic-bezier(.5,0,.3,1) .15s forwards}'+
'.pc-court .logo .g>svg .pcd{transform-box:fill-box;transform-origin:center;animation:pcPoint .35s cubic-bezier(.45,0,.25,1) .75s both}';
var st=d.createElement('style');st.textContent=css;d.head.appendChild(st);
window.PC_OUV_MS=0;
if(reduit&&!site)return;
if(court){root.classList.add('pc-court');window.PC_OUV_MS=1200;setTimeout(function(){root.classList.remove('pc-court')},1500);return}

var o=d.createElement('div');o.id='pc-ouv';o.setAttribute('aria-hidden','true');if(!site)o.className='espace';
o.innerHTML='<div class="g"></div><div class="lock"><span class="pbox"><svg class="pb" viewBox="10 4 80 92"><g class="big"><path class="l" pathLength="100" d="M52 69.7 A23 23 0 1 0 33 47 V75"/><path class="sh" pathLength="100" d="M52 69.7 A23 23 0 1 0 33 47 V75"/><path class="pen" d="M0 0 h0.01"/></g></svg></span><span class="filet"></span><div class="nom">'+
 'PROCLIK'.split('').map(function(c,i){return '<span class="lt" style="--i:'+i+'">'+c+'</span>'}).join('')+'<small>VOTRE COMMERCE EN UN CLIC</small></div></div>';
(d.body||root).appendChild(o);
if(!site)window.PC_OUV_MS=9200;
var fini=false;
function fin(){if(fini)return;fini=true;o.classList.add('fin');setTimeout(function(){o.remove()},650)}
if(!site)o.addEventListener('click',fin);
if(reduit){o.querySelectorAll('*').forEach(function(e){e.style.animation='none'});o.querySelector('.big').style.transform='none';o.querySelector('.pen').style.display='none';o.querySelector('.l').style.cssText='stroke-dasharray:none;stroke-width:5';o.querySelector('.sh').style.display='none';o.querySelector('.g').style.display='none';o.querySelector('.filet').style.transform='none';o.querySelectorAll('.lt,small').forEach(function(e){e.style.opacity=1});o.querySelector('.pb').insertAdjacentHTML('beforeend','<circle cx="56" cy="47" r="6" fill="var(--ml)"/>');return}

function pt(svg,x,y){var m=svg.getScreenCTM();return {x:m.a*x+m.e,y:m.d*y+m.f}}
function prepare(){
 var svg=o.querySelector('.pb'),m=svg.getScreenCTM(),W=window.innerWidth,H=window.innerHeight;
 /* le grand P est centré à l'écran, même si l'ensemble P + nom ne l'est pas */
 var dxu=((W/2-m.e)/m.a)-68;svg.querySelector('.big').style.setProperty('--dxu',dxu+'px');
 /* la pointe part du centre de l'écran (le bouton), glisse au bout de la boucle, trace le P, puis se pose au cœur */
 var cx=((W/2-m.e)/m.a-dxu-50)/3+50,cy=((H/2-m.f)/m.d-50)/3+50;
 var Lg=Math.hypot(52-cx,69.7-cy),T=Lg+140.4+36.2;
 o.querySelector('.pen').style.offsetPath='path("M'+cx.toFixed(2)+' '+cy.toFixed(2)+' L52 69.7 A23 23 0 1 0 33 47 V75 L56 47")';
 st.textContent+='@keyframes pcPlume{0%{offset-distance:0%;animation-timing-function:cubic-bezier(.45,0,.3,1)}19.5%{offset-distance:'+(100*Lg/T).toFixed(2)+'%;animation-timing-function:cubic-bezier(.5,0,.3,1)}82.9%{offset-distance:'+(100*(Lg+140.4)/T).toFixed(2)+'%;animation-timing-function:cubic-bezier(.45,0,.25,1)}100%{offset-distance:100%}}';
 o.classList.add('go');
}
/* juste avant de se ranger, on vise le P du bouton en haut de l'Espace (la page a fini de se mettre en place) */
function vise(){
 /* si l'artisan a mis son logo, le P se pose à sa place puis s'efface devant lui */
 var cible=d.querySelector(CIB),pb=o.querySelector('.pbox'),svg=o.querySelector('.pb');
 if(!cible){fin();return}
 var r=cible.getBoundingClientRect();if(!r.width||r.bottom<0){fin();return}
 var k=cible.tagName.toLowerCase()==='svg'?cible.getScreenCTM().a:(r.width-12)/76;
 var T={x:r.left+r.width/2,y:r.top+r.height/2},G=pt(svg,56,49.5),b=pb.getBoundingClientRect(),ps=k/svg.getScreenCTM().a;
 /* le P quitte la mise en page avant de se ranger : rien ne bouge s'il y a un changement de largeur pendant le trajet */
 var ph=d.createElement('span');ph.style.cssText='width:'+b.width+'px;height:'+b.height+'px;flex:none';pb.parentNode.insertBefore(ph,pb);
 pb.style.cssText+=';position:fixed;left:'+b.left+'px;top:'+b.top+'px;margin:0';
 pb.style.setProperty('--ps',ps);
 pb.style.setProperty('--px',(T.x-b.left-ps*(G.x-b.left))+'px');
 pb.style.setProperty('--py',(T.y-b.top-ps*(G.y-b.top))+'px');
}
function lance(){prepare();if(!site){setTimeout(vise,7600);setTimeout(fin,9100)}}
if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',lance);else lance();
})();
