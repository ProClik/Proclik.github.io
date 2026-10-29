/* Jour par défaut, quel que soit le réglage du téléphone (demande de Cyril, 29/10). Le bouton lune/soleil en haut à droite passe en nuit et revient au jour.
   Le choix est retenu sur l'appareil et partagé par l'Espace, le formulaire et le plan (le plan ouvert dans le formulaire suit tout de suite). */
(function(){
  var K="pc-theme",r=document.documentElement;
  function lu(){try{return localStorage.getItem(K)}catch(e){return null}}
  function mets(t){r.setAttribute("data-theme",t)}
  var t=lu();
  if(t!=="dark"&&t!=="light"){try{if(parent!==window)t=parent.document.documentElement.getAttribute("data-theme")}catch(e){}}
  mets(t==="dark"?"dark":"light");
  addEventListener("storage",function(e){if(e.key===K&&(e.newValue==="dark"||e.newValue==="light"))mets(e.newValue)});
  window.pcTheme=function(){
    var n=r.getAttribute("data-theme")==="dark"?"light":"dark";mets(n);
    try{localStorage.setItem(K,n)}catch(e){}
    [].forEach.call(document.querySelectorAll("iframe"),function(f){try{f.contentDocument.documentElement.setAttribute("data-theme",n)}catch(e){}});
    return n};
})();
