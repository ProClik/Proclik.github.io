/* Petite vibration au toucher (Cyril 18/11) : sur Android, navigator.vibrate ; sur iPhone (iOS 18 et plus), Safari n'a pas
   de vibration en JavaScript, mais il fait un petit « tic » quand on bascule un interrupteur natif (<input switch>) :
   on en bascule un, invisible, au moment du toucher. iPad et ordinateur : rien (pas de moteur de vibration). */
(function(){
  var d=document,lab=null,occupe=false;
  function ios(){if(lab)return lab;lab=d.createElement("label");lab.setAttribute("aria-hidden","true");lab.style.cssText="position:fixed;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none";
    var i=d.createElement("input");i.type="checkbox";i.setAttribute("switch","");i.tabIndex=-1;lab.appendChild(i);(d.body||d.documentElement).appendChild(lab);return lab}
  function vib(n){try{if(navigator.vibrate){navigator.vibrate(n||8);return}if(/iPhone|iPod/.test(navigator.userAgent)){occupe=true;ios().click();occupe=false}}catch(e){occupe=false}}
  window.pcVib=vib;
  /* Tous les boutons du formulaire et du plan : une seule vibration légère au toucher (pas sur un bouton grisé). */
  var CIBLE="button,[role=button],.chip,.mcard,.card,.ptile,.qo,.btn,a.btn,label.opt";
  d.addEventListener("click",function(e){if(occupe||!e.isTrusted||d.documentElement.hasAttribute("data-vib-page"))return;var t=e.target&&e.target.closest&&e.target.closest(CIBLE);if(!t||t.disabled||t.getAttribute("aria-disabled")==="true")return;if(t.dataset&&t.dataset.vibOk!=null)return;vib(8)},true);
})();
