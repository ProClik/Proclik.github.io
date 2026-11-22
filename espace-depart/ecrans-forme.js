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
var root=d.documentElement,PAGES={"Votre espace":"Réglages","Mes cadences":0,"Mes véhicules":0,"Mon équipe":0,"Mes plans":0,"Mes réglages":0,"Votre couleur":0,"Pour quel client ?":0};
/* nom affiché d'une page (undefined = pas une page) ; le plan dessiné (« 📐 Nom ») est une page sans barre du bas, comme la maquette */
var PL=/^📐 /;
function nom(s){if(PAGES.hasOwnProperty(s))return PAGES[s]||s;if(PL.test(s))return s.replace(PL,"");if($("#x-in #pl-frame"))return s.trim()}
function retour(){var z=d.createElement("button");z.setAttribute("data-pllist","");z.hidden=true;d.body.appendChild(z);z.click();z.remove()}
/* Lot 6 : les FICHES (client, devis, pré-devis, facture, chantier, dépense…) ouvertes depuis une liste deviennent aussi une page :
   « ‹ Clients » (l'écran d'où l'on vient) en haut, « Pré-devis · Mme Durand » → petit « Mme Durand » au-dessus du grand « Pré-devis »,
   pas de barre du bas, « Fermer » retiré, le bouton qui fait avancer en grande pilule en bas (maquettes fiche-*.html). */
var FI=null;
d.addEventListener("click",function(e){var r=e.target.closest&&e.target.closest(".view .cf-li,.view .chrow,.view [data-showch],.view [data-dep]");
  if(r&&!r.closest("#xsheet")){var v=r.closest(".view"),nb=v&&$("#nb-"+v.id.replace(/^v-/,""));FI=(nb&&nb.textContent.replace(/\d+/g,"").trim())||"Page d’avant"}},true);
function page(){var x=$("#xsheet"),t=$("#x-t"),s=$("#x-s"),ouv=!!(x&&x.classList.contains("on"));
  if(!ouv)FI=null;
  if(t&&t.dataset.f2t&&t.textContent!==t.dataset.f2n){delete t.dataset.f2t;delete t.dataset.f2n;var pr0=$("#x-s .f2pre");if(pr0)pr0.parentNode.removeChild(pr0)}
  var orig=t&&(t.dataset.f2t||t.textContent),n=t&&nom(orig),fi=false;
  if(ouv&&n===undefined&&FI&&t){fi=true;var k=orig.indexOf(" · ");n=k>0?orig.slice(0,k).trim():orig.trim()}
  var on=!!(ouv&&n!==undefined);
  if(on){if(n!==orig&&!t.dataset.f2t){t.dataset.f2t=orig;t.dataset.f2n=n;t.textContent=n;
      var k2=orig.indexOf(" · ");if(fi&&k2>0&&s){var sp=d.createElement("span");sp.className="f2pre";sp.textContent=orig.slice(k2+3)+(s.textContent.trim()?" · ":"");s.insertBefore(sp,s.firstChild)}}
    var f=$("#x-foot");if(f){var B=$$("button",f).filter(function(b){return !b.hasAttribute("data-pllist")});
      B.forEach(function(b){b.classList.toggle("f2x",fi&&(b.hasAttribute("data-xclose")||/^(Fermer|C.est bon)$/i.test(b.textContent.trim())))});
      f.classList.toggle("f2fin",!B.length||B.every(function(b){return b.hasAttribute("data-xclose")||/^(Fermer|C.est bon)\b/i.test(b.textContent.trim())}))}
    /* plan, « Pour quel client ? » et fiches : retour en texte coloré en haut, pas de barre du bas, le bouton d'action en bas */
    var pl=!!$("#x-in #pl-frame")||orig==="Pour quel client ?",h=t.parentNode,bk=$("#f2bk"),lab=pl?"‹ Mes plans":fi?"‹ "+FI:"";
    root.classList.toggle("f2nb",pl||fi);root.classList.toggle("f2fi",fi);
    if(lab&&!bk){bk=d.createElement("button");bk.id="f2bk";bk.type="button";h.insertBefore(bk,h.firstChild);bk.addEventListener("click",function(){if(root.classList.contains("f2fi")){var c=$("#x-close");if(c)c.click()}else retour()})}
    if(lab&&bk.textContent!==lab)bk.textContent=lab;
    if(!lab&&bk)bk.parentNode.removeChild(bk)}
  else{if(t&&t.dataset.f2t&&!ouv){t.textContent=t.dataset.f2t;delete t.dataset.f2t;delete t.dataset.f2n}var pr=$("#x-s .f2pre");if(pr&&!ouv)pr.parentNode.removeChild(pr);var b2=$("#f2bk");if(b2)b2.parentNode.removeChild(b2);root.classList.remove("f2nb");root.classList.remove("f2fi")}
  root.classList.toggle("f2pg",on)}
var xs=$("#xsheet");if(xs){new MutationObserver(page).observe(xs,{attributes:true,attributeFilter:["class"],childList:true,subtree:true,characterData:true})}
/* toucher la barre du bas ferme la page ouverte par-dessus */
d.addEventListener("click",function(e){if(root.classList.contains("f2pg")&&e.target.closest&&e.target.closest("#f2b [data-f2b]:not([data-f2b=menu])")){var c=$("#x-close");if(c)c.click()}},true);
})();
