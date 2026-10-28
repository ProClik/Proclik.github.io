/* Accueil de l'Espace façon planche « Relief doux » : les chiffres, trois tuiles, la demande en cours avec ses étapes, un seul gros bouton.
   Démo : exemples fictifs, signalés comme tels. Vraies demandes (vrai.js) : on relit la liste gardée sur l'appareil à chaque mise à jour,
   aucun chiffre d'argent n'est inventé (le bloc des chiffres n'apparaît pas tant qu'ils ne viennent pas de GHL). */
(function(){
  "use strict";
  var $=function(s,r){return (r||document).querySelector(s)};
  var esc=function(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})};
  var eur=function(n){return Number(n).toLocaleString("fr-FR",{minimumFractionDigits:2,maximumFractionDigits:2})+" €"};
  var vue=$("#v-accueil"),ancien=vue&&vue.querySelector(".grid2");if(!vue||!ancien)return;
  var acc=document.createElement("div");acc.className="acc";acc.id="acc";ancien.parentNode.insertBefore(acc,ancien);
  document.documentElement.classList.add("pcacc");

  var IC_VERIF='<svg viewBox="0 0 24 24"><path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 14l2 2 3.5-3.5"/></svg>';
  var IC_LISTE='<svg viewBox="0 0 24 24"><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/></svg>';

  function chaine(n,i){var h="";for(var k=0;k<n;k++)h+='<span class="pas'+(k<i?" fait":k===i?" ici":"")+'">'+(k<i?'<svg viewBox="0 0 24 24"><path d="M5 12l5 5 9-10"/></svg>':k+1)+"</span>";
    return '<div class="chaine" style="--fait:'+(n>1?Math.max(0,i)/(n-1):0)+'">'+h+"</div>"}
  function tuiles(T){T=T.filter(function(t){return t[0]>0});if(!T.length)return "";
    return '<div class="tuiles">'+T.map(function(t){return '<div class="tuile'+(t[2]?" chaud":"")+'"><b>'+t[0]+"</b><span>"+t[1]+"</span></div>"}).join("")+"</div>"}
  function bouton(ic,txt,attr){return '<button class="btn go acc-go" type="button" '+attr+'><span class="lab"><span class="ic">'+ic+"</span><span>"+esc(txt)+"</span></span></button>"}

  /* ---------- démo ---------- */
  function demo(){
    var stats='<div class="card stats"><div class="stats-h"><div><small>Encaissé en octobre</small><b>8 640 € <em>HT</em></b></div>'+
      '<svg class="barres" viewBox="0 0 120 52" aria-hidden="true"><g class="b0"><rect x="2" y="22" width="12" height="18" rx="4"/><rect x="22" y="14" width="12" height="26" rx="4"/><rect x="42" y="18" width="12" height="22" rx="4"/><rect x="62" y="10" width="12" height="30" rx="4"/><rect x="82" y="16" width="12" height="24" rx="4"/></g><rect class="b1" x="102" y="4" width="12" height="36" rx="4"/>'+
      '<g class="bm"><text x="8" y="50">M</text><text x="28" y="50">J</text><text x="48" y="50">J</text><text x="68" y="50">A</text><text x="88" y="50">S</text><text x="108" y="50">O</text></g></svg></div>'+
      '<div class="flux"><div><span>Devis envoyés</span><b>9 850 €</b><small>2 sans réponse</small></div><div><span>Signés</span><b>14 210 €</b><small>3 sur 5 · 60 %</small></div>'+
      '<div><span>Facturé</span><b>11 400 €</b><small>ce mois-ci</small></div><div class="cor"><span>À encaisser</span><b>2 760 €</b><small>1 facture</small></div></div>'+
      '<span class="exemple">Chiffres d\'exemple</span></div>';
    var n=+(($("#badge")||{}).textContent||0)||1;
    acc.innerHTML='<div class="acc-g">'+stats+'</div><div class="acc-d">'+tuiles([[n,"à faire ce soir",1],[2,"devis en attente de réponse"],[1,"chantier en cours"]])+
      '<div class="card dem"><div class="dem-h"><div><b>Mme Durand · Grenoble</b><small>Cloisons du séjour</small></div><div class="prix">765,08 € <small>HT</small></div></div>'+
      chaine(7,0)+'<div class="etape-nom"><b>Vérifier le pré-devis</b><span>étape 1 sur 7</span></div></div>'+
      bouton(IC_VERIF,"Vérifier le pré-devis","data-accdemo")+
      '<button class="acc-tout" type="button" data-acctout>Toutes les demandes <span>›</span></button></div>';
  }

  /* ---------- vraies demandes ---------- */
  function vrai(){
    var L=null;try{L=JSON.parse(localStorage.getItem("pc-vrai-liste")||"null")}catch(e){}
    var D=(L&&L.demandes)||[],E=(L&&L.etapes)||[],val=function(d){return /valider/i.test(d.etape||"")};
    var a=D.filter(val),o=D.filter(function(d){return !val(d)}),d=a[0]||null;
    var h=tuiles([[a.length,a.length>1?"demandes à valider":"demande à valider",1],[o.length,o.length>1?"autres demandes en cours":"autre demande en cours"]]);
    if(!L)h+='<div class="card dem"><p class="vide">Chargement de vos demandes…</p></div>';
    else if(!d)h+='<div class="card dem"><p class="vide">Rien à valider pour l\'instant. Le café peut rester chaud.</p></div>';
    else{var i=E.indexOf(d.etape),n=E.length;
      h+='<div class="card dem"><div class="dem-h"><div><b>'+esc(d.client)+"</b><small>"+esc(d.resume||d.titre||"")+"</small></div>"+
        (d.total_ht!=null?'<div class="prix">'+eur(d.total_ht)+" <small>HT</small></div>":"")+"</div>"+
        (n>1&&i>=0?chaine(n,i)+'<div class="etape-nom"><b>'+esc(d.etape)+"</b><span>étape "+(i+1)+" sur "+n+"</span></div>":"")+
        (d.a_verifier?'<div class="ligne corr"><span>'+(d.a_verifier>1?d.a_verifier+" lignes":"1 ligne")+' à vérifier</span><span class="q">à vérifier</span></div>':"")+"</div>"+
        bouton(IC_VERIF,"Vérifier le pré-devis",'data-vc="'+esc(d.contact||"")+'"')}
    if(D.length)h+='<button class="acc-tout" type="button" data-acctout>Toutes les demandes <span>'+D.length+" ›</span></button>";
    acc.innerHTML='<div class="acc-d">'+h+"</div>";
  }

  function rendre(){var ib=$("#instb");if(ib)ib.remove();document.documentElement.classList.contains("pcvrai")?vrai():demo();if(ib)acc.lastElementChild.appendChild(ib)}
  rendre();
  // vrai.js réécrit sa liste (#va) à chaque chargement : on suit le mouvement.
  new MutationObserver(function(){clearTimeout(rendre._t);rendre._t=setTimeout(rendre,60)}).observe(ancien,{childList:true,subtree:true});
  var etat=document.documentElement.classList.contains("pcvrai");
  new MutationObserver(function(){var v=document.documentElement.classList.contains("pcvrai");if(v!==etat){etat=v;rendre()}}).observe(document.documentElement,{attributes:true,attributeFilter:["class"]});
  acc.addEventListener("click",function(e){
    if(e.target.closest("[data-accdemo]")){var t=$('#todo [data-open]');if(t)t.click()}
    else if(e.target.closest("[data-acctout]")){var b=$("#nb-devis")||$("#tt-devis");if(b)b.click()}
  });
})();
