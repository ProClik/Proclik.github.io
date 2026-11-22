/* Lot 1 du nouvel Espace : petites retouches de contenu qui vont avec ecrans-forme.css (aspect seulement). ?forme=0 = ancien. */
(function(){"use strict";
if(/[?&]forme=0\b/.test(location.search))return;
var d=document,$=function(s,c){return (c||d).querySelector(s)},$$=function(s,c){return [].slice.call((c||d).querySelectorAll(s))};
/* Planning, semaine : « 2 rdv » sous chaque jour, comme la maquette */
function jours(){var w=$("#wkc");if(!w)return;var H=$$(".wkc-h>div",w).slice(1),C=$$(".wkc-col",w);
  H.forEach(function(h,i){var c=C[i];if(!c)return;var n=$$(".ev:not(.free)",c).length,t=n?n+" rdv":"";var s=$("small.f2n",h);
    if(!s){s=d.createElement("small");s.className="f2n";h.appendChild(s)}if(s.textContent!==t)s.textContent=t});
  $$(".ev:not(.free)",w).forEach(function(e){e.classList.toggle("f2c",e.offsetHeight>0&&e.offsetHeight<50)})}
var w0=null;function suit(){var w=$("#wkc");if(w&&w!==w0){w0=w;new MutationObserver(function(){clearTimeout(suit.t);suit.t=setTimeout(jours,30)}).observe(w,{childList:true,subtree:true})}jours()}
suit();setInterval(suit,2000);

/* Lot 3 : Réglages, Cadences, Véhicules, Équipe, Mes plans… s'ouvrent en VRAIE PAGE (maquettes du 21/11), plus en feuille du bas.
   La barre du bas reste visible ; « C'est bon / Fermer » du bas disparaît quand il ne fait que fermer (le × en haut reste). */
var root=d.documentElement,PAGES={"Votre espace":"Réglages","Mes cadences":0,"Mes véhicules":0,"Mon équipe":0,"Mes plans":0,"Mes réglages":0};
function page(){var x=$("#xsheet"),t=$("#x-t");if(t&&t.dataset.f2t&&t.textContent!==PAGES[t.dataset.f2t])delete t.dataset.f2t;
  var on=!!(x&&t&&x.classList.contains("on")&&(PAGES.hasOwnProperty(t.textContent)||t.dataset.f2t));
  if(on){var n=PAGES[t.textContent];if(n){t.dataset.f2t=t.textContent;t.textContent=n}
    var f=$("#x-foot");if(f){var B=$$("button",f);f.classList.toggle("f2fin",!B.length||B.every(function(b){return b.hasAttribute("data-xclose")||/^(Fermer|C.est bon)\b/i.test(b.textContent.trim())}))}}
  else if(t&&t.dataset.f2t&&!(x&&x.classList.contains("on"))){t.textContent=t.dataset.f2t;delete t.dataset.f2t}
  root.classList.toggle("f2pg",on)}
var xs=$("#xsheet");if(xs){new MutationObserver(page).observe(xs,{attributes:true,attributeFilter:["class"],childList:true,subtree:true,characterData:true})}
/* toucher la barre du bas ferme la page ouverte par-dessus */
d.addEventListener("click",function(e){if(root.classList.contains("f2pg")&&e.target.closest&&e.target.closest("#f2b [data-f2b]:not([data-f2b=menu])")){var c=$("#x-close");if(c)c.click()}},true);
})();
