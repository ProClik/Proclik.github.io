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
})();
