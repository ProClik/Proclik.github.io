/* Menu de côté (iPad, ordinateur) qui s'ouvre comme sur téléphone (Cyril, 15/11) : 11 entrées les unes sous les autres,
   c'était trop. Le côté garde seulement les boutons choisis dans Réglages > Mon menu de côté
   (1 à 6, Accueil, Clients, Planning, Devis par défaut ; réglage à part de celui du téléphone) et, au milieu, le même galet : il ouvre le même panneau (micro + bulles),
   à droite du galet. Les vrais onglets (#nb-…) restent la seule source : ce menu ne fait qu'appuyer dessus et recopier
   l'onglet en cours et les pastilles. Téléphone : rien ne change (barre.js). */
(function(){
  "use strict";
  var d=document,$=function(s,r){return (r||d).querySelector(s)},$$=function(s,r){return [].slice.call((r||d).querySelectorAll(s))};
  var nav=$("nav.nav"),B=window.PCBarre;if(!nav||!B||$("#fam"))return;
  var large=matchMedia("(min-width:900px)");
  var ICO_MENU='<svg viewBox="0 0 24 24" aria-hidden="true"><path class="l1" d="M5 7h14"/><path class="l2" d="M5 12h14"/><path class="l3" d="M5 17h14"/></svg>';
  function vrai(v){return $("#nb-"+v)}

  var fam=d.createElement("nav");fam.className="nav fam";fam.id="fam";fam.setAttribute("aria-label","Menu principal");
  function bouton(v){
    var i=B.info(v);if(!i)return "";
    return '<button type="button" data-cote="'+v+'"><span class="ico" aria-hidden="true">'+i.ico+'</span>'+i.nom+'<span class="badge" hidden></span></button>';
  }
  function construit(){
    /* les boutons choisis dans Réglages > Mon menu de côté, le galet au milieu */
    var b=B.cote(),h=Math.ceil(b.length/2);
    fam.innerHTML=b.slice(0,h).map(bouton).join("")+
      '<button type="button" class="fam-c" id="fam-c" aria-expanded="false" aria-controls="pb-menu" aria-label="Ouvrir le menu">'+ICO_MENU+'<span class="badge" hidden></span></button>'+
      b.slice(h).map(bouton).join("");
    suit();place();
  }
  function nb(v){var b=vrai(v),s=b&&$(".badge",b);return s&&!s.hidden?+(s.textContent||0)||0:0}
  function suit(){
    var cur=($("nav.nav:not(.fam) [aria-selected=true]")||{dataset:{}}).dataset.v,bas=B.cote(),tot=0;
    $$("[data-cote]",fam).forEach(function(b){
      var v=b.dataset.cote,on=v===cur;b.setAttribute("aria-selected",on?"true":"false");if(on)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current");
      var bd=$(".badge",b),n=nb(v);bd.textContent=n;bd.hidden=!n;
    });
    $$("#pb-menu [data-pb]").forEach(function(x){if(bas.indexOf(x.dataset.pb)<0)tot+=nb(x.dataset.pb)});
    var c=$("#fam-c"),bc=c&&$(".badge",c);
    if(c){c.classList.toggle("on",!!cur&&bas.indexOf(cur)<0);bc.textContent=tot;bc.hidden=!tot}
  }
  /* le panneau s'ouvre à droite du galet : le micro à hauteur du galet, les bulles au-dessus */
  function place(){
    var m=$("#pb-menu"),c=$("#fam-c");if(!m)return;
    if(!large.matches||!c){m.style.left="";m.style.bottom="";return}
    var r=c.getBoundingClientRect(),pan=$(".pb-pan",m),w=pan&&pan.style.width?parseFloat(pan.style.width):380;
    m.style.left=(r.right+28+w/2)+"px";
    m.style.bottom=(innerHeight-(r.top+r.height/2)-68)+"px";
  }
  fam.addEventListener("click",function(e){
    if(e.target.closest("#fam-c")){if(B.ouvert())B.ferme();else{B.remesure();place();B.ouvre()}return}
    var b=e.target.closest("[data-cote]");if(!b)return;
    if(B.ouvert())B.ferme();var t=vrai(b.dataset.cote);if(t)t.click();
  });
  /* galet : ☰ qui devient × à l'ouverture, comme sur téléphone */
  new MutationObserver(function(){
    var o=d.documentElement.classList.contains("pb-ouvert"),c=$("#fam-c");
    if(c){c.setAttribute("aria-expanded",o?"true":"false");c.setAttribute("aria-label",o?"Fermer le menu":"Ouvrir le menu")}
  }).observe(d.documentElement,{attributes:true,attributeFilter:["class"]});

  nav.parentNode.insertBefore(fam,nav.nextSibling);
  var H="html body ";
  var st=d.createElement("style");
  st.textContent=
    "#fam{display:none}"+
    "@media (min-width:900px){"+
      H+"nav.nav:not(.fam){display:none!important}"+
      H+"#fam{display:flex!important;z-index:27}"+
      H+"#fam [data-cote]{position:relative;text-align:center;line-height:1.2}"+
      H+"#fam .fam-c{position:relative;flex:none;width:62px!important;height:62px;margin:6px 0;border-radius:50%;padding:0;display:grid;place-items:center;"+
        "background:var(--bg);box-shadow:var(--n1-pk),var(--n1-calme-sh);color:var(--fg);transition:box-shadow .3s,color .3s;-webkit-tap-highlight-color:transparent}"+
      H+"#fam .fam-c svg{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;overflow:visible}"+
      H+"#fam .fam-c svg path{transform-box:view-box;transform-origin:12px 12px;transition:transform .45s var(--doux),opacity .3s}"+
      H+"#fam .fam-c.on{box-shadow:var(--n1-pk),var(--n1-calme-sh),0 0 0 2px var(--n1-laiton)}"+
      H+"#fam .fam-c .badge{top:-2px;right:-2px}"+
      ".pb-ouvert body #fam .fam-c .l1{transform:rotate(45deg) translateY(5px)}"+
      ".pb-ouvert body #fam .fam-c .l2{opacity:0;transform:scaleX(.2)}"+
      ".pb-ouvert body #fam .fam-c .l3{transform:rotate(-45deg) translateY(-5px)}"+
      ".pb-ouvert body #fam .fam-c .badge{opacity:0}"+
      "@media (prefers-reduced-motion:reduce){"+H+"#fam .fam-c svg path{transition:none}}"+
    "}";
  d.head.appendChild(st);
  construit();
  new MutationObserver(suit).observe(nav,{subtree:true,attributes:true,attributeFilter:["aria-selected","hidden","style"],childList:true,characterData:true});
  addEventListener("resize",function(){requestAnimationFrame(place)});
  if(large.addEventListener)large.addEventListener("change",function(){B.ferme();place()});
  /* « Mon menu de côté » changé dans les Réglages : le côté suit */
  var ap=B.applique;B.applique=function(){ap.apply(B,arguments);construit()};
})();
