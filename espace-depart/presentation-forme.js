/* Lot 9 du nouvel Espace : la présentation animée figée le 21/11 (presentation.html, vrais écrans de l'Espace dans un téléphone,
   7 écrans + « Votre couleur ») remplace l'ancienne présentation d'intro.js quand la nouvelle forme est active.
   Même fin : le choix Standard / Simple revient à l'Espace. ?forme=0 = ancienne présentation. */
(function(){"use strict";
if(/[?&]forme=0\b/.test(location.search))return;
var d=document,I=window.PCIntro;if(!I||!I.ouvre)return;
var ancien=I.ouvre,SRC=new URL("presentation.html?v=1",d.currentScript?d.currentScript.src:location.href).href;
I.ouvre=function(el,m,cb){if(!d.documentElement.classList.contains("f2on")||!el)return ancien.apply(this,arguments);
  el.classList.add("f2pres");el.innerHTML='<iframe class="f2pres-f" title="Présentation de votre Espace" src="'+SRC+'&m='+(m==="simple"?"simple":"std")+'"></iframe>';el.hidden=false;
  function fin(e){if(!e.data||e.data.pcPres!=="fin")return;var f=el.querySelector("iframe");if(!f||e.source!==f.contentWindow)return;
    window.removeEventListener("message",fin);el.hidden=true;el.classList.remove("f2pres");el.innerHTML="";if(cb)cb(e.data.mode==="simple"?"simple":"std")}
  window.addEventListener("message",fin)};
var s=d.createElement("style");s.textContent="#welcome.f2pres{padding:0!important;display:block!important;background:var(--z-bg,var(--bg))!important}#welcome.f2pres[hidden]{display:none!important}#welcome.f2pres .f2pres-f{position:absolute;inset:0;width:100%;height:100%;border:0;display:block;background:transparent}";
d.head.appendChild(s);
})();
