/* Repère ce qui se touche dans l'Espace (bouton, lien, carte qui s'ouvre…) et le marque .pk pour poussoir.css.
   Si l'élément est transparent (onglet du menu par ex.), c'est le premier galet à l'intérieur qui porte l'anneau (.pk-v).
   Fonctionne aussi pour ce qui s'affiche après coup.
   3/11 (bug vu par Cyril en changeant d'onglet) : le marquage se fait AVANT que l'écran soit dessiné, et sans
   transition, sinon chaque bouton redessiné « gonflait » puis se tassait doucement pendant près d'une seconde. */
(function(){
  "use strict";
  var SEL='button,a[href],summary,[role="button"],[role="tab"],label,[data-vc]',CHAMP='INPUT,SELECT,TEXTAREA';
  function ombre(el){var s=getComputedStyle(el).boxShadow;return !!s&&s!=="none"}
  function galet(b){var t=document.createTreeWalker(b,NodeFilter.SHOW_ELEMENT),n;
    while((n=t.nextNode())){if(CHAMP.indexOf(n.tagName)>-1||n instanceof SVGElement)continue;if(ombre(n))return n}return null}
  function pose(el,cl,figes){figes.push([el,el.style.transition]);el.style.transition="none";el.classList.add(cl)}
  function marque(racines){var figes=[];
    racines.forEach(function(r){
      var l=[].slice.call(r.querySelectorAll(SEL));if(r.matches&&r.matches(SEL))l.unshift(r);
      l.forEach(function(b){
        if(b.hasAttribute("data-pk"))return;b.setAttribute("data-pk","");
        if(b instanceof SVGElement||b.closest("svg"))return;
        var lab=b.tagName==="LABEL";
        if(lab&&!b.querySelector('input[type="file"],input[type="checkbox"],input[type="radio"]'))return;
        pose(b,"pk",figes);
        if(!lab&&!ombre(b)){var g=galet(b);if(g)pose(g,"pk-v",figes)}
      })});
    if(!figes.length)return;
    void document.body.offsetWidth; /* le style final est pris tel quel, sans animation… */
    figes.forEach(function(f){f[0].style.transition=f[1]}) /* …puis les effets au toucher reviennent */
  }
  try{var v=new URLSearchParams(location.search).get("bouton");if(v==="a"||v==="b")document.documentElement.setAttribute("data-pk",v)}catch(_){}
  marque([document]);
  new MutationObserver(function(ms){var r=[];
    ms.forEach(function(m){m.addedNodes.forEach(function(n){if(n.nodeType===1&&n.isConnected)r.push(n)})});
    if(r.length)marque(r)}).observe(document.body,{childList:true,subtree:true});
})();
