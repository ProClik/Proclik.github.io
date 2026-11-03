/* Repère ce qui se touche dans l'Espace (bouton, lien, carte qui s'ouvre…) et le marque .pk pour poussoir.css.
   Si l'élément est transparent (onglet du menu par ex.), c'est le premier galet à l'intérieur qui porte l'anneau (.pk-v).
   Fonctionne aussi pour ce qui s'affiche après coup. */
(function(){
  "use strict";
  var SEL='button,a[href],summary,[role="button"],[role="tab"],label,[data-vc]',CHAMP='INPUT,SELECT,TEXTAREA';
  function ombre(el){var s=getComputedStyle(el).boxShadow;return !!s&&s!=="none"}
  function galet(b){var t=document.createTreeWalker(b,NodeFilter.SHOW_ELEMENT),n;
    while((n=t.nextNode())){if(CHAMP.indexOf(n.tagName)>-1||n instanceof SVGElement)continue;if(ombre(n))return n}return null}
  function marque(){prevu=0;
    document.querySelectorAll(SEL).forEach(function(b){
      if(b.hasAttribute("data-pk"))return;b.setAttribute("data-pk","");
      if(b instanceof SVGElement||b.closest("svg"))return;
      var lab=b.tagName==="LABEL";
      if(lab&&!b.querySelector('input[type="file"],input[type="checkbox"],input[type="radio"]'))return;
      b.classList.add("pk");
      if(!lab&&!ombre(b)){var g=galet(b);if(g)g.classList.add("pk-v")}
    })}
  var prevu=0;function plus(){if(!prevu)prevu=requestAnimationFrame(marque)}
  try{var v=new URLSearchParams(location.search).get("bouton");if(v==="a"||v==="b")document.documentElement.setAttribute("data-pk",v)}catch(_){}
  marque();new MutationObserver(plus).observe(document.body,{childList:true,subtree:true});
})();
