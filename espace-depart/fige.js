/* Fenêtre ouverte = page du dessous immobile (bug signalé par Cyril le 2/11 : en glissant le doigt sur une fenêtre, la page derrière bougeait).
   Sur iPhone/iPad, « overflow:hidden » ne suffit pas : on fige la page à sa place (position fixe) et on la remet exactement où elle était à la fermeture.
   Marche pour toutes les fenêtres de l'Espace, même celles ajoutées plus tard : on regarde s'il y a un grand panneau fixe au premier plan. */
(function(){
'use strict';
var d=document,root=d.documentElement,b=d.body,fige=false,Y=0,prevu=0;
var CONNUS='.sheet.on,.scrim.on,.pcov:not([hidden]),#welcome:not([hidden]),[aria-modal="true"]:not([hidden])';
var IGNORE=/(^|\s)(pb|pb-menu|pb-scrim|toast|head|nav)(\s|$)/;
function visible(e){var s=getComputedStyle(e);if(s.display==='none'||s.visibility==='hidden'||+s.opacity<.05)return false;var r=e.getBoundingClientRect();return r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth}
function ouverte(){
  if(root.classList.contains('pb-ouvert'))return true;
  var L=d.querySelectorAll(CONNUS);for(var i=0;i<L.length;i++)if(visible(L[i]))return true;
  /* fenêtres des autres modules : grand panneau fixe au premier plan */
  var E=b.children;for(i=0;i<E.length;i++){var e=E[i];if(e.id==='pc-ouv'||IGNORE.test(e.className||''))continue;
    var s=getComputedStyle(e);if(s.position!=='fixed'||(parseInt(s.zIndex,10)||0)<30)continue;
    if(!visible(e))continue;var r=e.getBoundingClientRect();if(r.width*r.height>.45*innerWidth*innerHeight)return true}
  return false;
}
function applique(){
  prevu=0;var o=ouverte();if(o===fige)return;fige=o;
  if(o){Y=window.scrollY||root.scrollTop||0;b.style.top=-Y+'px';root.classList.add('pc-fige')}
  else{root.classList.remove('pc-fige');b.style.top='';window.scrollTo(0,Y)}
}
function verifie(){if(!prevu)prevu=requestAnimationFrame(applique)}
new MutationObserver(verifie).observe(b,{subtree:true,attributes:true,attributeFilter:['class','hidden','style','aria-modal'],childList:true});
new MutationObserver(verifie).observe(root,{attributes:true,attributeFilter:['class']});
/* iPhone : un glissé sur une partie de la fenêtre qui ne défile pas (titre, boutons, fond grisé) faisait bouger tout l'écran.
   Tant qu'une fenêtre est ouverte, on n'autorise le glissé que dans une zone qui peut vraiment défiler dans ce sens. */
var y0=0;
d.addEventListener('touchstart',function(e){if(e.touches.length===1)y0=e.touches[0].clientY},{passive:true});
d.addEventListener('touchmove',function(e){
  if(!fige||e.touches.length!==1)return;
  var dy=e.touches[0].clientY-y0,n=e.target;
  for(;n&&n!==b&&n.nodeType===1;n=n.parentNode){
    var s=getComputedStyle(n);
    if(/(auto|scroll)/.test(s.overflowY)&&n.scrollHeight>n.clientHeight+1){
      if((dy>0&&n.scrollTop>0)||(dy<0&&n.scrollTop+n.clientHeight<n.scrollHeight-1))return;
      break;
    }
  }
  if(e.cancelable)e.preventDefault();
},{passive:false});
/* les transitions d'ouverture finissent après le changement de classe */
b.addEventListener('transitionend',verifie,true);
var st=d.createElement('style');
st.textContent='html.pc-fige{overscroll-behavior:none}html.pc-fige body{position:fixed!important;left:0;right:0;width:100%;overflow:hidden!important}'+
 '.sheet-in,#x-in,.pcov,.pcov-b,.sheet{overscroll-behavior:contain}'+
 '.scrim{touch-action:none}';
d.head.appendChild(st);
verifie();
})();
