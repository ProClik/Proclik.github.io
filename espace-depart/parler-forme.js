/* Lot 8 : « Parlez à ProClik » (maquette parler.html) : × en haut à droite, « Exemples de consignes », un seul bouton « Appliquer ».
   Aperçu d'un document (apercu-grand.html) : la feuille en grand, « Écartez deux doigts pour zoomer ». ?forme=0 = ancien. */
(function(){"use strict";
if(/[?&]forme=0\b/.test(location.search))return;
var d=document,$=function(s,c){return (c||d).querySelector(s)};
var vs=$("#vsheet");
if(vs){var l=$(".listen",vs);if(l&&!$(".f2v-x",l)){var x=d.createElement("button");x.type="button";x.className="f2v-x";x.setAttribute("aria-label","Fermer");x.textContent="×";l.appendChild(x);
    x.addEventListener("click",function(){var c=$("#vclose");if(c)c.click()})}
  var ex=$("#vex",vs);if(ex&&!$(".f2v-h",vs)){var h=d.createElement("p");h.className="f2v-h";h.textContent="Exemples de consignes";ex.parentNode.insertBefore(h,ex)}}
var xs=$("#xsheet");
function doc(){var p=$("#x-in>.pdf"),on=!!(p&&xs.classList.contains("on"));xs.classList.toggle("f2doc",on);
  if(on&&!$("#x-in>.f2d-h")){var h=d.createElement("small");h.className="f2d-h";h.textContent="Écartez deux doigts pour zoomer.";p.parentNode.insertBefore(h,p.nextSibling)}}
if(xs)new MutationObserver(function(){clearTimeout(doc.t);doc.t=setTimeout(doc,20)}).observe(xs,{attributes:true,attributeFilter:["class"],childList:true,subtree:false});
var xi=$("#x-in");if(xi)new MutationObserver(function(){clearTimeout(doc.t);doc.t=setTimeout(doc,20)}).observe(xi,{childList:true});
})();
