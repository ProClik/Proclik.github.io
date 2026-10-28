/* Effets au toucher du style « Relief doux » : l'appui reste visible même sur une touche rapide,
   la flèche du bouton d'action file au relâcher, l'onglet choisi gonfle doucement, petite vibration.
   Android : navigator.vibrate. iPhone (iOS 18 et plus, dans Safari) : léger « tic » en basculant un interrupteur natif invisible. */
(function(){
  "use strict";
  var GROS=".btn,.vbtn",PETIT=".icon-b,.chips button,.nav button,.seg button,.tabs-top button,.week button,.qty button,.dcard,.vcard,.pcq button,.adds button";
  var lab=document.createElement("label"),inp=document.createElement("input");
  inp.type="checkbox";inp.setAttribute("switch","");inp.tabIndex=-1;lab.setAttribute("aria-hidden","true");
  lab.style.cssText="position:fixed;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none";
  lab.appendChild(inp);document.body.appendChild(lab);
  var ios=/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
  function tic(gros){try{if(navigator.vibrate)navigator.vibrate(gros?14:8)}catch(_){}}
  document.addEventListener("touchstart",function(){},{passive:true});
  document.addEventListener("pointerdown",function(e){
    var b=e.target.closest(GROS)||e.target.closest(PETIT);if(!b||b.disabled)return;
    b._gros=b.matches(GROS);b._t=Date.now();b.classList.add("appui");tic(b._gros)});
  function lache(e){
    document.querySelectorAll(".appui").forEach(function(b){
      var ok=e.type==="pointerup"&&b.contains(e.target),reste=Math.max(0,(b._gros?320:480)-(Date.now()-(b._t||0)));
      setTimeout(function(){b.classList.remove("appui");
        if(ok&&b.matches(".btn.go,.vbtn.go")){b.classList.remove("parti");void b.offsetWidth;b.classList.add("parti");setTimeout(function(){b.classList.remove("parti")},2050)}},reste)})}
  document.addEventListener("pointerup",lache);document.addEventListener("pointercancel",lache);
  document.addEventListener("click",function(e){
    var n=e.target.closest(".nav button");
    if(n){document.querySelectorAll(".nav button.vient").forEach(function(x){x.classList.remove("vient")});n.classList.add("vient")}
    if(ios&&(e.target.closest(GROS)||e.target.closest(PETIT))){try{lab.click()}catch(_){}}
  },true);
})();
