/* Menus de l'Espace choisis par Cyril dans la page Admin, client par client (16/11) : « les menus qui servent à certains
   ne serviront pas à d'autres ». Un menu masqué disparaît de la barre, du menu de côté et de l'éventail.
   L'Accueil et les Réglages restent toujours là. Source : la fiche de l'artisan renvoyée par le service (pc-vrai-artisan.menus). */
(function(){
'use strict';
var d=document;
function art(){try{if(sessionStorage.getItem('pc-apercu')==='1')return JSON.parse(sessionStorage.getItem('ap:pc-vrai-artisan'))||{};return JSON.parse(localStorage.getItem('pc-vrai-artisan'))||{}}catch(e){return {}}}
function applique(){
  var m=art().menus||{};
  [].forEach.call(d.querySelectorAll("nav [id^='nb-'],nav [id^='tt-']"),function(b){
    var v=b.id.slice(3);if(v==='accueil'||v==='speak')return;
    if(m[v]===false){b.hidden=true;b.style.display='none';b.dataset.menuOff='1'}
    else if(b.dataset.menuOff){delete b.dataset.menuOff;b.hidden=false;b.style.display=''}
  });
  // vue affichée masquée → retour à l'Accueil
  var cur=d.querySelector("nav [id^='nb-'][aria-selected='true']");
  if(cur&&cur.dataset.menuOff){var a=d.getElementById('nb-accueil');if(a)a.click()}
}
applique();
window.PCMenus={applique:function(){applique();try{d.dispatchEvent(new Event('pc-menus'))}catch(e){}if(window.PCBarre&&window.PCBarre.applique)try{window.PCBarre.applique()}catch(e){}}};
})();
