/* Ouverture ProClik (validée par Cyril le 28/10).
   Longue (~10,7 s) : un bouton galet au centre reçoit un clic, le point trace le P, le nom arrive, puis le P se range dans le bouton du haut de l'Espace.
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
/* ondes : taille finale fixe et mise à l'échelle (transform), pour rester fluides même pendant le chargement de la page */
var OV=Math.round(1.5*Math.max(innerWidth,innerHeight,600)),OD=(70/OV).toFixed(4);
var css=
'#pc-ouv{--m:#ECEEF2;--mt:#262B38;--md:#6B7280;--ml:#A8823F;--mh:#FFFFFF;--mo:#C5CAD4;--mlc:#E2C68C;--d:cubic-bezier(.45,0,.25,1);position:fixed;inset:0;z-index:200;background:var(--m);display:grid;place-items:center;font-family:Manrope,system-ui,-apple-system,sans-serif;transition:opacity .6s ease;-webkit-tap-highlight-color:transparent}'+
':root[data-theme="dark"] #pc-ouv{--m:#1E2433;--mt:#E6E8EE;--md:#9AA1B0;--ml:#D4B483;--mh:#313B53;--mo:#121620;--mlc:#FBEFD6}'+
'@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) #pc-ouv{--m:#1E2433;--mt:#E6E8EE;--md:#9AA1B0;--ml:#D4B483;--mh:#313B53;--mo:#121620;--mlc:#FBEFD6}}'+
'#pc-ouv.fin{opacity:0;pointer-events:none}'+
'#pc-ouv *,#pc-ouv *::before,#pc-ouv *::after{animation-play-state:paused}#pc-ouv.go *,#pc-ouv.go *::before,#pc-ouv.go *::after{animation-play-state:running}'+
'#pc-ouv .lock{position:relative;z-index:1;display:flex;align-items:center;gap:14px;color:var(--mt)}'+
'#pc-ouv .pbox{position:relative;display:grid;place-items:center;transform-origin:0 0}'+
'#pc-ouv .ouvp{width:48px;height:56px;overflow:visible;flex:none}'+
'#pc-ouv .ouvp path{fill:none;stroke-linecap:round;stroke-linejoin:round}'+
'#pc-ouv .big{transform-box:view-box;transform-origin:50px 50px;transform:translateX(var(--dxu,0px)) scale(3);animation:pcReduit .8s cubic-bezier(.65,0,.35,1) 6.85s forwards}'+
'#pc-ouv .l{stroke-dasharray:100 110;stroke-dashoffset:101}'+
'#pc-ouv .sh{stroke:var(--mlc);stroke-width:3.5;stroke-dasharray:8 200;stroke-dashoffset:8;animation:pcEteint .35s ease 6.55s forwards}'+
'#pc-ouv .pen{stroke:var(--ml);stroke-width:7.5;opacity:0;animation:pcPoint .45s var(--d) .45s forwards,pcEteint .35s ease 6.5s forwards}'+
'#pc-ouv .filet{width:1px;align-self:stretch;background:var(--ml);opacity:.7;transform:scaleY(0);animation:pcFilet .45s var(--d) 7.25s forwards}'+
'#pc-ouv .nom{font-weight:300;font-size:21px;letter-spacing:.32em;line-height:1;white-space:nowrap;margin-right:-.32em}'+
'#pc-ouv .nom .lt{display:inline-block;opacity:0;animation:pcLettre .5s var(--d) calc(7.35s + var(--i) * 45ms) forwards}'+
'#pc-ouv .nom small{display:block;font-size:7.5px;font-weight:600;letter-spacing:.1em;color:var(--md);margin-top:8px;opacity:0;animation:pcApparait .5s ease 7.75s forwards}'+
/* Espace : le nom reste à côté du P (logo centré comme sur le site) et ne s'efface qu'au moment où le P part vers son bouton */
'#pc-ouv.espace .filet,#pc-ouv.espace .nom{transition:opacity .4s ease}#pc-ouv.espace.part .filet,#pc-ouv.espace.part .nom{opacity:0!important}'+

'#pc-ouv .ond{position:absolute;inset:0;overflow:hidden;pointer-events:none}'+
'#pc-ouv .ond i{position:absolute;left:var(--ox,50%);top:var(--oy,50%);width:'+OV+'px;height:'+OV+'px;margin:-'+OV/2+'px 0 0 -'+OV/2+'px;border-radius:50%;transform:scale('+OD+');opacity:0;animation:pcOnde 5.5s cubic-bezier(.3,.3,.4,1) calc(1.5s + var(--i) * 1.1s)}'+
/* une vague : un bourrelet sans bord net, éclairé en haut à gauche, ombré en bas à droite */
'#pc-ouv .ond i::before,#pc-ouv .ond i::after{content:"";position:absolute;inset:0;border-radius:50%}'+
'#pc-ouv .ond i::before{background:radial-gradient(closest-side,transparent 76%,var(--mo) 87%,transparent 98%);transform:translate(1%,1.2%);opacity:.38}'+
'#pc-ouv .ond i::after{background:radial-gradient(closest-side,transparent 74%,var(--mh) 84%,transparent 94%);transform:translate(-1%,-1.2%);opacity:.45}'+
/* sur la crête, un liseré laiton fin, comme le socle du téléphone de l'accueil */
'#pc-ouv .ond b{position:absolute;inset:7.5%;border-radius:50%;border:2px solid var(--ml);z-index:1;opacity:.4}'+
'#pc-ouv .g{position:absolute;left:50%;top:50%;width:76px;height:76px;margin:-38px 0 0 -38px;border-radius:50%;opacity:0;animation:pcLeve .8s var(--d) .1s forwards,pcAppui 1.3s linear 1.15s forwards,pcFond .5s var(--d) 2.5s forwards}'+
'#pc-ouv .g::before,#pc-ouv .g::after{content:"";position:absolute;inset:0;border-radius:50%;background:var(--m)}'+
'#pc-ouv .g::before{box-shadow:-7px -7px 16px var(--mh),9px 9px 20px var(--mo),inset 1.5px 1.5px 1px var(--mh),inset -1.5px -1.5px 2px var(--mo);animation:pcOmbre 1.3s linear 1.15s forwards}'+
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
'@keyframes pcOnde{0%{transform:scale('+OD+');opacity:0}12%{opacity:1}55%{opacity:.55}100%{transform:scale(1);opacity:0}}'+
'@keyframes pcFond{to{opacity:0}}'+
/* version courte : le P se trace dans son bouton en haut de l'Espace */
'.pc-court .brand>svg,.pc-court .brand>span:first-child,.pc-court .brand>img{animation:pcLeve 1.05s cubic-bezier(.4,0,.2,1) both}'+
'.pc-court .brand>svg .pcl{stroke-dasharray:100 110;stroke-dashoffset:101;animation:pcTrace .7s cubic-bezier(.5,0,.3,1) .15s forwards}'+
'.pc-court .brand>svg .pcd{transform-box:fill-box;transform-origin:center;animation:pcPoint .35s cubic-bezier(.45,0,.25,1) .75s both}'+
'.pc-court .logo .g>svg{animation:pcLeve 1.05s cubic-bezier(.4,0,.2,1) both}'+
'.pc-court .logo .g>svg .pcl{stroke-dasharray:100 110;stroke-dashoffset:101;animation:pcTrace .7s cubic-bezier(.5,0,.3,1) .15s forwards}'+
'.pc-court .logo .g>svg .pcd{transform-box:fill-box;transform-origin:center;animation:pcPoint .35s cubic-bezier(.45,0,.25,1) .75s both}'+'@keyframes pcTourne{0%{transform:translateY(3px) scale(.96)}16%{transform:translateY(-1.2px)}27%{transform:translateY(.5px)}34%{transform:none;animation-timing-function:cubic-bezier(.42,0,.58,1)}100%{transform:rotate(360deg)}}@keyframes pcFlotte{0%{transform:translateY(3px) scale(.96)}16%{transform:translateY(-1.2px)}27%{transform:translateY(.5px)}34%{transform:none}100%{transform:none}}@keyframes pcVoile{0%{opacity:0;animation-timing-function:cubic-bezier(.4,0,.2,1)}24%,100%{opacity:1}}@keyframes pcPousse{0%,4%{transform:none}14%{transform:scaleY(.7)}24%{transform:scaleY(1.07)}32%{transform:scaleY(.9)}42%,52%{transform:none}62%{transform:scaleY(.7)}72%{transform:scaleY(1.07)}80%{transform:scaleY(.9)}90%,100%{transform:none}}.pcb>.pcj,.pcb>.pch{transform-box:fill-box;animation-name:pcPousse;animation-duration:inherit;animation-delay:inherit;animation-timing-function:cubic-bezier(.45,.05,.55,.95);animation-fill-mode:both}.pcb>.pcj{transform-origin:50% 43%}.pcb>.pch{transform-origin:50% 39%}.pc-court .brand>svg .pcb,.pc-court .logo .g>svg .pcb{transform-box:fill-box;transform-origin:50% 40.35%;animation:pcTourne 4.4s linear 0s both}.pc-court .brand>svg .pcr,.pc-court .logo .g>svg .pcr{transform-box:fill-box;transform-origin:center;animation:pcFlotte 4.4s linear 0s both}.pc-court .brand>svg .pcv,.pc-court .logo .g>svg .pcv{animation:pcVoile 4.4s linear 0s both}'+'#pc-ouv .pen{display:none}#pc-ouv .pcb{transform-box:fill-box;transform-origin:50% 40.35%;animation:pcTourne 4.4s linear 2.4s both}#pc-ouv .pcr{transform-box:fill-box;transform-origin:center;animation:pcFlotte 4.4s linear 2.4s both}#pc-ouv .pcv{animation:pcVoile 4.4s linear 2.4s both}';
var st=d.createElement('style');st.textContent=css;d.head.appendChild(st);
window.PC_OUV_MS=0;
if(reduit&&!site)return;
/* Espace : à chaque ouverture (et au retour dans l'appli après une pause), une courte ouverture plein écran (~2,3 s)
   qui cache la page pendant qu'elle se met en place (plus d'écran qui saute). Cyril, 3/11. */
if(!site&&!vitrine){
 var K='#pc-ouk{--m:#ECEEF2;--mt:#262B38;--md:#6B7280;--ml:#A8823F;--mh:#FFFFFF;--mo:#C5CAD4;--d:cubic-bezier(.45,0,.25,1);position:fixed;inset:0;z-index:200;background:var(--m);display:grid;place-items:center;font-family:Manrope,system-ui,-apple-system,sans-serif;transition:opacity .45s ease}'+
 ':root[data-theme="dark"] #pc-ouk{--m:#1E2433;--mt:#E6E8EE;--md:#9AA1B0;--ml:#D4B483;--mh:#313B53;--mo:#121620}'+
 '@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) #pc-ouk{--m:#1E2433;--mt:#E6E8EE;--md:#9AA1B0;--ml:#D4B483;--mh:#313B53;--mo:#121620}}'+
 '#pc-ouk.fin{opacity:0;pointer-events:none}'+
 '#pc-ouk .lk{display:flex;align-items:center;gap:14px;color:var(--mt)}'+
 '#pc-ouk .gk{width:64px;height:64px;border-radius:50%;display:grid;place-items:center;background:var(--m);box-shadow:-6px -6px 14px var(--mh),7px 7px 16px var(--mo),inset 1px 1px 1px var(--mh),inset -1px -1px 2px var(--mo);opacity:0;transform:translateX(var(--dx,0px)) scale(.9);animation:pkLeve 1.05s cubic-bezier(.4,0,.2,1) .05s forwards,pkGlisse .55s cubic-bezier(.65,0,.35,1) 1.15s forwards}'+
 '#pc-ouk svg{width:40px;height:40px;overflow:visible}'+
 '#pc-ouk .l{fill:none;stroke:var(--ml);stroke-width:5;stroke-linecap:round;stroke-dasharray:100 110;stroke-dashoffset:101;animation:pkTrace .7s cubic-bezier(.65,0,.35,1) .35s forwards}'+
 '#pc-ouk .p{fill:var(--ml);transform-box:fill-box;transform-origin:center;transform:scale(0);animation:pkPoint .35s var(--d) 1.0s forwards}'+
 '#pc-ouk .f{width:1px;align-self:stretch;background:var(--ml);opacity:.7;transform:scaleY(0);animation:pkFilet .35s var(--d) 1.45s forwards}'+
 '#pc-ouk .n{font-weight:300;font-size:19px;letter-spacing:.32em;line-height:1;white-space:nowrap;margin-right:-.32em}'+
 '#pc-ouk .n i{font-style:normal;display:inline-block;opacity:0;animation:pkLettre .4s var(--d) calc(1.55s + var(--i) * 40ms) forwards}'+
 '#pc-ouk .n small{display:block;font-size:7px;font-weight:600;letter-spacing:.1em;color:var(--md);margin-top:7px;opacity:0;animation:pkApp .4s ease 1.85s forwards}'+
 '@keyframes pkLeve{to{opacity:1;transform:translateX(var(--dx,0px))}}@keyframes pkGlisse{from{opacity:1;transform:translateX(var(--dx,0px))}to{opacity:1;transform:none}}@keyframes pkTrace{to{stroke-dashoffset:0}}@keyframes pkPoint{to{transform:scale(1)}}'+
 '@keyframes pkFilet{to{transform:scaleY(1)}}@keyframes pkLettre{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}@keyframes pkApp{to{opacity:1}}'+
 '#pc-ouk .pcb{transform-box:fill-box;transform-origin:50% 40.35%;animation:pcTourne 4.4s linear .05s both}'+
 '#pc-ouk .pcr{transform-box:fill-box;transform-origin:center;animation:pcFlotte 4.4s linear .05s both}#pc-ouk .pcv{animation:pcVoile 4.4s linear .05s both}'+
 '@media (prefers-reduced-motion:reduce){#pc-ouk *{animation-duration:.01s!important;animation-delay:0s!important}}';
 var stk=d.createElement('style');stk.textContent=K;d.head.appendChild(stk);
 var DUK=reduit?700:5000;
 function couvre(){
  var a=d.getElementById('pc-ouk');if(a)a.remove();
  var o=d.createElement('div');o.id='pc-ouk';o.setAttribute('aria-hidden','true');
  o.innerHTML='<div class="lk"><span class="gk"><svg viewBox="18 6.5 76 76"><g class="pcv"><path class="pcf pcr" d="M32.47 40A23.53 23.53 0 1 1 79.53 40A23.53 23.53 0 1 1 32.47 40ZM39.46 40A16.54 16.54 0 1 0 72.54 40A16.54 16.54 0 1 0 39.46 40Z" style="fill:var(--ml);stroke:none"/><g class="pcb l"><path class="pcf pcj" d="M32.47 38.09H39.46V63.76C39.46 70.21 36.28 72.44 33.1 72.44Q32.47 72.44 32.47 70.53ZM38.19 54.63H45.82V61.22Q39.46 58.17 39.46 63.76H38.19Z" style="fill:var(--ml);stroke:none"/><path class="pcf pch" d="M79.53 41.91H72.54V21.24C72.54 18.87 75.72 18.06 78.9 18.06Q79.53 18.06 79.53 19.65ZM73.81 25.37H66.18V18.78Q72.54 21.83 72.54 21.24H73.81Z" style="fill:var(--ml);stroke:none"/></g></g></svg></span><span class="f"></span><div class="n">'+
   'PROCLIK'.split('').map(function(c,i){return '<i style="--i:'+i+'">'+c+'</i>'}).join('')+'<small>VOTRE COMMERCE EN UN CLIC</small></div></div>';
  (d.body||root).appendChild(o);
  /* le galet part du centre de l'écran (comme sur le site), puis se range à gauche quand le nom arrive */
  var lk=o.querySelector('.lk'),gk=o.querySelector('.gk');gk.style.setProperty('--dx',((lk.offsetWidth-gk.offsetWidth)/2)+'px');
  var fait=false;function fin(){if(fait)return;fait=true;o.classList.add('fin');setTimeout(function(){o.remove()},500)}
  o.addEventListener('click',fin);setTimeout(fin,DUK);
 }
 if(court){window.PC_OUV_MS=DUK;couvre()}
 /* retour dans l'appli après au moins 30 s ailleurs : on rejoue la courte ouverture */
 var cache=0;
 d.addEventListener('visibilitychange',function(){if(d.hidden){cache=Date.now()}else if(cache&&Date.now()-cache>30000){cache=0;couvre()}});
 window.addEventListener('pageshow',function(e){if(e.persisted)couvre()});
 if(court)return}
if(court){root.classList.add('pc-court');window.PC_OUV_MS=1200;setTimeout(function(){root.classList.remove('pc-court')},4700);return}

var o=d.createElement('div');o.id='pc-ouv';o.setAttribute('aria-hidden','true');if(!site)o.className='espace';
o.innerHTML='<div class="ond"><i style="--i:0"><b></b></i><i style="--i:1"><b></b></i></div><div class="g"></div><div class="lock"><span class="pbox"><svg class="ouvp" viewBox="10 4 80 92"><g class="big"><g class="pcv"><path class="pcf pcr" d="M32.47 45A23.53 23.53 0 1 1 79.53 45A23.53 23.53 0 1 1 32.47 45ZM39.46 45A16.54 16.54 0 1 0 72.54 45A16.54 16.54 0 1 0 39.46 45Z" style="fill:var(--ml);stroke:none"/><g class="pcb l"><path class="pcf pcj" d="M32.47 43.09H39.46V68.76C39.46 75.21 36.28 77.44 33.1 77.44Q32.47 77.44 32.47 75.53ZM38.19 59.63H45.82V66.22Q39.46 63.17 39.46 68.76H38.19Z" style="fill:var(--ml);stroke:none"/><path class="pcf pch" d="M79.53 46.91H72.54V26.24C72.54 23.87 75.72 23.06 78.9 23.06Q79.53 23.06 79.53 24.65ZM73.81 30.37H66.18V23.78Q72.54 26.83 72.54 26.24H73.81Z" style="fill:var(--ml);stroke:none"/></g></g><g class="penw"><path class="pen" d="M0 0 h0.01"/></g></g></svg></span><span class="filet"></span><div class="nom">'+
 'PROCLIK'.split('').map(function(c,i){return '<span class="lt" style="--i:'+i+'">'+c+'</span>'}).join('')+'<small>VOTRE COMMERCE EN UN CLIC</small></div></div>';
(d.body||root).appendChild(o);
if(!site)window.PC_OUV_MS=10450;
var fini=false;
function fin(){if(fini)return;fini=true;o.classList.add('fin');setTimeout(function(){o.remove()},650)}
if(!site)o.addEventListener('click',fin);
if(reduit){o.querySelectorAll('*').forEach(function(e){e.style.animation='none'});o.querySelector('.big').style.transform='none';o.querySelector('.pen').style.display='none';o.querySelector('.g').style.display='none';o.querySelector('.ond').style.display='none';o.querySelector('.filet').style.transform='none';o.querySelectorAll('.lt,small').forEach(function(e){e.style.opacity=1});return}

/* la pointe : elle glisse jusqu'au bout de la boucle, trace le P (le trait la suit exactement), se lève et se pose au cœur.
   Elle s'étire dans le sens du mouvement selon sa vitesse, et s'écrase un peu en se posant. */
function bez(x1,y1,x2,y2){return function(x){var a=0,b=1,t=x;for(var i=0;i<24;i++){t=(a+b)/2;var u=1-t,xx=3*u*u*t*x1+3*u*t*t*x2+t*t*t;if(xx<x)a=t;else b=t}var u=1-t;return 3*u*u*t*y1+3*u*t*t*y2+t*t*t}}
function plume(svg,centre){
 var c0=centre(),cx=c0[0],cy=c0[1];
 var NS='http://www.w3.org/2000/svg',g=svg.querySelector('.penw'),l=svg.querySelector('.l');
 var P=d.createElementNS(NS,'path');P.setAttribute('d','M35.97 79.34V45A20.03 20.03 0 0 1 76.03 45V22.1V45A20.03 20.03 0 0 1 35.97 45');var L=P.getTotalLength();
 var H=d.createElementNS(NS,'path');H.setAttribute('d','M33 75 C34 62 47 41 56 47');var LH=H.getTotalLength();
 var e1=bez(.45,0,.3,1),e2=bez(.5,0,.3,1),e3=bez(.45,0,.25,1),t0=performance.now(),px=cx,py=cy,pt0=0,ang=0,s=1;
 function pos(t){
  if(t<2.45){var c=centre();cx=c[0];cy=c[1];
   /* l'appui : la pointe s'enfonce avec le bouton, puis revient doucement pendant que la vague part */
   var a=t-1.15,dz=a<0?0:a<.39?bez(.4,0,.2,1)(a/.39):a<1.3?1-bez(.3,0,.3,1)((a-.39)/.91):0,pop=0;
   return [cx,cy,1-.2*dz+pop]}
  if(t<2.85){var k=e1((t-2.45)/.4);return [cx+(35.97-cx)*k,cy+(79.34-cy)*k,1]}
  if(t<4.75){var k=e2((t-2.85)/1.9),q=P.getPointAtLength(k*L);l.style.strokeDashoffset=101-101*k;return [q.x,q.y,1]}
  l.style.strokeDashoffset=0;
  return [35.97,45,1];
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
  if(t<5.75)requestAnimationFrame(pas);else g.setAttribute('transform','translate(35.97 45)');
 }
 g.setAttribute('transform','translate('+cx.toFixed(2)+' '+cy.toFixed(2)+')');
 requestAnimationFrame(pas);
}
function pt(svg,x,y){var m=svg.getScreenCTM();return {x:m.a*x+m.e,y:m.d*y+m.f}}
function prepare(){
 var svg=o.querySelector('.ouvp'),gal=o.querySelector('.g');
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
 var cible=d.querySelector(CIB),pb=o.querySelector('.pbox'),svg=o.querySelector('.ouvp');
 if(!cible){fin();return}
 var r=cible.getBoundingClientRect();if(!r.width||r.bottom<0){fin();return}
 var k=cible.tagName.toLowerCase()==='svg'?cible.getScreenCTM().a:(r.width-12)/76;
 var T={x:r.left+r.width/2,y:r.top+r.height/2},G=(function(){var vb=cible.viewBox&&cible.viewBox.baseVal;return vb&&vb.width?pt(svg,vb.x+vb.width/2,vb.y+vb.height/2+5):pt(svg,56,49.5)})(),b=pb.getBoundingClientRect(),ps=k/svg.getScreenCTM().a;
 /* le P quitte la mise en page avant de se ranger : rien ne bouge s'il y a un changement de largeur pendant le trajet */
 var ph=d.createElement('span');ph.style.cssText='width:'+b.width+'px;height:'+b.height+'px;flex:none';pb.parentNode.insertBefore(ph,pb);
 pb.style.cssText+=';position:fixed;left:'+b.left+'px;top:'+b.top+'px;margin:0';
 var px=T.x-b.left-ps*(G.x-b.left),py=T.y-b.top-ps*(G.y-b.top);
 /* le trajet reste droit ; c'est le P qui vit : il s'étire dans le sens du déplacement quand il file,
    puis s'écrase un peu en se posant et se détend */
 var e=bez(.65,0,.35,1),DU=1100,FIN=1600,cx=G.x-b.left,cy=G.y-b.top,th=Math.atan2(py,px)*180/Math.PI,k0=0,e0=0,im=[];
 /* le trajet est calculé d'avance puis confié au navigateur (animation composée par la puce graphique) : il reste fluide même si la page travaille */
 for(var ms=0;ms<=FIN;ms+=16){
  var k=Math.min(1,ms/DU),ek=e(k),v=k>k0?(ek-e0)/(k-k0):0,sc=1+(ps-1)*ek,sx=1,sy=1;k0=k;e0=ek;
  if(ms<DU){var st=1+.16*Math.min(1,v/1.9);sx=st;sy=1/Math.sqrt(st)}
  else{var q=Math.min(1,(ms-DU)/(FIN-DU)),w=Math.sin(Math.PI*Math.min(1,q*1.5))*(1-q);sx=1-.12*w;sy=1+.08*w}
  im.push({offset:Math.min(1,ms/FIN),transform:'translate('+(px*ek).toFixed(2)+'px,'+(py*ek).toFixed(2)+'px) scale('+sc.toFixed(4)+') translate('+cx.toFixed(2)+'px,'+cy.toFixed(2)+'px) rotate('+th.toFixed(1)+'deg) scale('+sx.toFixed(4)+','+sy.toFixed(4)+') rotate('+(-th).toFixed(1)+'deg) translate('+(-cx).toFixed(2)+'px,'+(-cy).toFixed(2)+'px)'});
 }
 im[im.length-1].offset=1;pb.style.willChange='transform';pb.style.transform=im[0].transform;
 o.classList.add('part');
 if(pb.animate)pb.animate(im,{duration:FIN,delay:100,fill:'forwards',easing:'linear'});else pb.style.transform=im[im.length-1].transform;
 setTimeout(function(){var gal=cible.parentNode;if(gal){gal.classList.remove('pc-pose');void gal.offsetWidth;gal.classList.add('pc-pose');setTimeout(function(){gal.classList.remove('pc-pose')},1100)}},100+DU*.9);
}
function lance(){prepare();if(!site){setTimeout(vise,8900);setTimeout(fin,10400)}}
if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',lance);else lance();
})();
