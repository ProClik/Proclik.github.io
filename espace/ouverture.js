/* Ouverture ProClik (validée par Cyril le 28/10).
   Longue (~8,9 s) : un bouton galet au centre reçoit un clic, le point trace le P, le nom arrive, puis le P se range dans le bouton du haut de l'Espace.
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
'#pc-ouv .big{transform-box:view-box;transform-origin:50px 50px;transform:translateX(var(--dxu,0px)) scale(3);animation:pcReduit .8s cubic-bezier(.65,0,.35,1) 5.05s forwards}'+
'#pc-ouv .l{stroke:var(--ml);stroke-width:3.3;stroke-dasharray:100 110;stroke-dashoffset:101;animation:pcFineL .8s cubic-bezier(.65,0,.35,1) 5.05s forwards}'+
'#pc-ouv .sh{stroke:var(--mlc);stroke-width:3.5;stroke-dasharray:8 200;stroke-dashoffset:8;animation:pcEteint .35s ease 4.75s forwards}'+
'#pc-ouv .pen{stroke:var(--ml);stroke-width:7.5;opacity:0;animation:pcPoint .45s var(--d) .45s forwards,pcFineD .8s cubic-bezier(.65,0,.35,1) 5.05s forwards}'+
'#pc-ouv .filet{width:1px;align-self:stretch;background:var(--ml);opacity:.7;transform:scaleY(0);animation:pcFilet .45s var(--d) 5.45s forwards}'+
'#pc-ouv .nom{font-weight:300;font-size:21px;letter-spacing:.32em;line-height:1;white-space:nowrap;margin-right:-.32em}'+
'#pc-ouv .nom .lt{display:inline-block;opacity:0;animation:pcLettre .5s var(--d) calc(5.55s + var(--i) * 45ms) forwards}'+
'#pc-ouv .nom small{display:block;font-size:7.5px;font-weight:600;letter-spacing:.1em;color:var(--md);margin-top:8px;opacity:0;animation:pcApparait .5s ease 5.95s forwards}'+
'#pc-ouv.espace .filet{animation:pcFilet .45s var(--d) 5.45s forwards,pcEfface .5s ease 6.85s forwards}'+
'#pc-ouv.espace .nom{animation:pcEfface .5s ease 6.85s forwards}'+

'#pc-ouv .ond{position:absolute;inset:0;overflow:hidden;pointer-events:none}'+
'#pc-ouv .ond i{position:absolute;left:var(--ox,50%);top:var(--oy,50%);width:76px;height:76px;border-radius:50%;transform:translate(-50%,-50%);opacity:0;animation:pcOnde 5.5s cubic-bezier(.3,.3,.4,1) calc(1.5s + var(--i) * 1.1s)}'+
/* une vague : un bourrelet sans bord net, éclairé en haut à gauche, ombré en bas à droite */
'#pc-ouv .ond i::before,#pc-ouv .ond i::after{content:"";position:absolute;inset:0;border-radius:50%}'+
'#pc-ouv .ond i::before{background:radial-gradient(closest-side,transparent 76%,var(--mo) 87%,transparent 98%);transform:translate(1%,1.2%);opacity:.7}'+
'#pc-ouv .ond i::after{background:radial-gradient(closest-side,transparent 74%,var(--mh) 84%,transparent 94%);transform:translate(-1%,-1.2%)}'+
'#pc-ouv .g{position:absolute;left:50%;top:50%;width:76px;height:76px;margin:-38px 0 0 -38px;border-radius:50%;opacity:0;animation:pcLeve .8s var(--d) .1s forwards,pcAppui 1.3s linear 1.15s forwards,pcFond .5s var(--d) 2.5s forwards}'+
'#pc-ouv .g::before,#pc-ouv .g::after{content:"";position:absolute;inset:0;border-radius:50%;background:var(--m)}'+
'#pc-ouv .g::before{box-shadow:-6px -6px 14px var(--mh),6px 6px 16px var(--mo);animation:pcOmbre 1.3s linear 1.15s forwards}'+
'#pc-ouv .g::after{box-shadow:inset 4px 4px 9px var(--mo),inset -4px -4px 9px var(--mh);opacity:0;animation:pcCreux 1.3s linear 1.15s forwards}'+
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
/* le bouton du haut reçoit le P : il s'enfonce un peu, comme le bouton du départ */
'.pc-pose{animation:pcPose 1s cubic-bezier(.35,0,.3,1)}@keyframes pcPose{35%{transform:scale(.93)}}'+
'@keyframes pcLeve{from{opacity:0}to{opacity:1}}'+
'@keyframes pcAppui{0%{transform:scale(1);animation-timing-function:cubic-bezier(.4,0,.2,1)}30%{transform:scale(.93);animation-timing-function:cubic-bezier(.3,0,.3,1)}100%{transform:scale(.97)}}'+
'@keyframes pcOmbre{0%{opacity:1;animation-timing-function:cubic-bezier(.4,0,.2,1)}30%,100%{opacity:0}}'+
'@keyframes pcCreux{0%{opacity:0;animation-timing-function:cubic-bezier(.4,0,.2,1)}30%{opacity:1;animation-timing-function:cubic-bezier(.3,0,.3,1)}100%{opacity:0}}'+
'@keyframes pcOnde{0%{width:70px;height:70px;opacity:0}12%{opacity:.4}55%{opacity:.22}100%{width:150vmax;height:150vmax;opacity:0}}'+
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
o.innerHTML='<div class="ond"><i style="--i:0"></i><i style="--i:1"></i></div><div class="g"></div><div class="lock"><span class="pbox"><svg class="pb" viewBox="10 4 80 92"><g class="big"><path class="l" pathLength="100" d="M52 69.7 A23 23 0 1 0 33 47 V75"/><path class="sh" pathLength="100" d="M52 69.7 A23 23 0 1 0 33 47 V75"/><g class="penw"><path class="pen" d="M0 0 h0.01"/></g></g></svg></span><span class="filet"></span><div class="nom">'+
 'PROCLIK'.split('').map(function(c,i){return '<span class="lt" style="--i:'+i+'">'+c+'</span>'}).join('')+'<small>VOTRE COMMERCE EN UN CLIC</small></div></div>';
(d.body||root).appendChild(o);
if(!site)window.PC_OUV_MS=8400;
var fini=false;
function fin(){if(fini)return;fini=true;o.classList.add('fin');setTimeout(function(){o.remove()},650)}
if(!site)o.addEventListener('click',fin);
if(reduit){o.querySelectorAll('*').forEach(function(e){e.style.animation='none'});o.querySelector('.big').style.transform='none';o.querySelector('.pen').style.display='none';o.querySelector('.l').style.cssText='stroke-dasharray:none;stroke-width:5';o.querySelector('.sh').style.display='none';o.querySelector('.g').style.display='none';o.querySelector('.ond').style.display='none';o.querySelector('.filet').style.transform='none';o.querySelectorAll('.lt,small').forEach(function(e){e.style.opacity=1});o.querySelector('.pb').insertAdjacentHTML('beforeend','<circle cx="56" cy="47" r="6" fill="var(--ml)"/>');return}

/* la pointe : elle glisse jusqu'au bout de la boucle, trace le P (le trait la suit exactement), se lève et se pose au cœur.
   Elle s'étire dans le sens du mouvement selon sa vitesse, et s'écrase un peu en se posant. */
function bez(x1,y1,x2,y2){return function(x){var a=0,b=1,t=x;for(var i=0;i<24;i++){t=(a+b)/2;var u=1-t,xx=3*u*u*t*x1+3*u*t*t*x2+t*t*t;if(xx<x)a=t;else b=t}var u=1-t;return 3*u*u*t*y1+3*u*t*t*y2+t*t*t}}
function plume(svg,centre){
 var c0=centre(),cx=c0[0],cy=c0[1];
 var NS='http://www.w3.org/2000/svg',g=svg.querySelector('.penw'),l=svg.querySelector('.l'),sh=svg.querySelector('.sh');
 var P=d.createElementNS(NS,'path');P.setAttribute('d','M52 69.7 A23 23 0 1 0 33 47 V75');var L=P.getTotalLength();
 var H=d.createElementNS(NS,'path');H.setAttribute('d','M33 75 C34 62 47 41 56 47');var LH=H.getTotalLength();
 var e1=bez(.45,0,.3,1),e2=bez(.5,0,.3,1),e3=bez(.45,0,.25,1),t0=performance.now(),px=cx,py=cy,pt0=0,ang=0,s=1;
 function pos(t){
  if(t<2.45){var c=centre();cx=c[0];cy=c[1];
   /* l'appui : la pointe s'enfonce avec le bouton, puis revient doucement pendant que la vague part */
   var a=t-1.15,dz=a<0?0:a<.39?bez(.4,0,.2,1)(a/.39):a<1.3?1-bez(.3,0,.3,1)((a-.39)/.91):0,pop=0;
   return [cx,cy,1-.2*dz+pop]}
  if(t<2.85){var k=e1((t-2.45)/.4);return [cx+(52-cx)*k,cy+(69.7-cy)*k,1]}
  if(t<4.75){var k=e2((t-2.85)/1.9),q=P.getPointAtLength(k*L);l.style.strokeDashoffset=101-101*k;sh.style.strokeDashoffset=8-100*k;return [q.x,q.y,1]}
  l.style.strokeDashoffset=0;sh.style.strokeDashoffset=-92;
  if(t<5.05){var k=e3((t-4.75)/.3),q=H.getPointAtLength(k*LH);return [q.x,q.y,1-.16*Math.sin(Math.PI*k)]}
  return [56,47,1];
 }
 function pas(now){
  var t=(now-t0)/1000,p=pos(t),dt=Math.max(.001,t-pt0),vx=(p[0]-px)/dt,vy=(p[1]-py)/dt,v=Math.hypot(vx,vy);
  if(v>4){var a=Math.atan2(vy,vx)*180/Math.PI,da=((a-ang+540)%360)-180;ang+=da*.5}
  var cible=1+Math.min(.55,v/380);s+=(cible-s)*.45;
  var sx=s,sy=1/Math.sqrt(s);
  /* posé au cœur : petit écrasement qui se détend */
  if(t>=5.05&&t<5.65){var k=(t-5.05)/.6,w=Math.sin(Math.PI*Math.min(1,k*1.6))*(1-k);sx=1+.22*w;sy=1-.18*w;ang=0}
  g.setAttribute('transform','translate('+p[0].toFixed(2)+' '+p[1].toFixed(2)+') rotate('+ang.toFixed(1)+') scale('+(sx*p[2]).toFixed(3)+' '+(sy*p[2]).toFixed(3)+')');
  px=p[0];py=p[1];pt0=t;
  if(t<5.75)requestAnimationFrame(pas);else g.setAttribute('transform','translate(56 47)');
 }
 g.setAttribute('transform','translate('+cx.toFixed(2)+' '+cy.toFixed(2)+')');
 requestAnimationFrame(pas);
}
function pt(svg,x,y){var m=svg.getScreenCTM();return {x:m.a*x+m.e,y:m.d*y+m.f}}
function prepare(){
 var svg=o.querySelector('.pb'),gal=o.querySelector('.g');
 /* le grand P est centré sur le bouton, même si l'ensemble P + nom ne l'est pas ; recalculé tant que la pointe est dans le bouton
    (la police peut arriver après coup et décaler le nom) */
 function centre(){var m=svg.getScreenCTM(),r=gal.getBoundingClientRect(),X=r.left+r.width/2,Y=r.top+r.height/2;
  var dxu=((X-m.e)/m.a)-68;svg.querySelector('.big').style.setProperty('--dxu',dxu+'px');
  /* la pointe part du centre du bouton */
  return [((X-m.e)/m.a-dxu-50)/3+50,((Y-m.f)/m.d-50)/3+50]}
 plume(svg,centre);
 o.classList.add('go');
}
/* juste avant de se ranger, on vise le P du bouton en haut de l'Espace (la page a fini de se mettre en place) */
function vise(){
 /* si l'artisan a mis son logo, le P se pose à sa place puis s'efface devant lui */
 var cible=d.querySelector(CIB),pb=o.querySelector('.pbox'),svg=o.querySelector('.pb');
 if(!cible){fin();return}
 var r=cible.getBoundingClientRect();if(!r.width||r.bottom<0){fin();return}
 var k=cible.tagName.toLowerCase()==='svg'?cible.getScreenCTM().a:(r.width-12)/76;
 var T={x:r.left+r.width/2,y:r.top+r.height/2},G=(function(){var vb=cible.viewBox&&cible.viewBox.baseVal;return vb&&vb.width?pt(svg,vb.x+vb.width/2,vb.y+vb.height/2+5):pt(svg,56,49.5)})(),b=pb.getBoundingClientRect(),ps=k/svg.getScreenCTM().a;
 /* le P quitte la mise en page avant de se ranger : rien ne bouge s'il y a un changement de largeur pendant le trajet */
 var ph=d.createElement('span');ph.style.cssText='width:'+b.width+'px;height:'+b.height+'px;flex:none';pb.parentNode.insertBefore(ph,pb);
 pb.style.cssText+=';position:fixed;left:'+b.left+'px;top:'+b.top+'px;margin:0';
 var px=T.x-b.left-ps*(G.x-b.left),py=T.y-b.top-ps*(G.y-b.top);
 /* le trajet : une courbe (il part d'abord sur le côté, puis monte), un léger penché dans le virage, et il se pose en douceur */
 var ex=bez(.5,0,.2,1),ey=bez(.7,0,.3,1),es=bez(.55,0,.3,1),t1=performance.now()+100,DU=1100,pose=false;
 function vol(now){
  var k=Math.max(0,Math.min(1,(now-t1)/DU)),s=1+(ps-1)*es(k),a=-7*Math.sin(Math.PI*Math.pow(k,.8));
  pb.style.transform='translate('+(px*ex(k)).toFixed(2)+'px,'+(py*ey(k)).toFixed(2)+'px) rotate('+a.toFixed(2)+'deg) scale('+s.toFixed(4)+')';
  if(k>.9&&!pose){pose=true;var gal=cible.parentNode;if(gal){gal.classList.remove('pc-pose');void gal.offsetWidth;gal.classList.add('pc-pose');setTimeout(function(){gal.classList.remove('pc-pose')},1100)}}
  if(k<1)requestAnimationFrame(vol);
 }
 requestAnimationFrame(vol);
}
function lance(){prepare();if(!site){setTimeout(vise,7100);setTimeout(fin,8350)}}
if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',lance);else lance();
})();
