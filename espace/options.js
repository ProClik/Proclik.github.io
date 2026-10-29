/* Options de l'abonnement (Cliky, SMS, assistant du site…) : ce que l'artisan a, ce qu'il n'a pas, en clair.
   Vraies demandes : la liste vient du service ProClik (artisan.options), rien n'est deviné ici.
   Démo : options d'exemple, modifiables avec les interrupteurs « Démo » pour voir les deux cas.
   Sans une option, rien ne casse : on dit simplement ce qui se passe à la place. Aucun prix affiché. */
(function(){
  "use strict";
  var $=function(s,r){return (r||document).querySelector(s)};
  var esc=function(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})};
  var lsG=function(k){try{return JSON.parse(localStorage.getItem(k)||"null")}catch(e){return null}};
  var lsS=function(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
  var html=document.documentElement;

  // Robot Cliky (le même que sur le formulaire) : yeux laiton quand il est là, yeux fermés sinon
  function robot(on){return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="8" width="14" height="11" rx="4"/><path d="M12 4.8V8"/><circle cx="12" cy="3.6" r="1.3" class="pl"/>'+
    (on?'<circle cx="9.5" cy="13.4" r="1.25" class="pl"/><circle cx="14.5" cy="13.4" r="1.25" class="pl"/>':'<path d="M8.4 13.6h2.2M13.4 13.6h2.2"/>')+"</svg>"}
  var IC_SMS='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/></svg>';
  var IC_CHAT='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/><path d="M8.5 10.5h.01M12 10.5h.01M15.5 10.5h.01"/></svg>';

  /* Le catalogue des options. Pour en ajouter une : une ligne ici, et la mettre dans artisan.options côté service. */
  var OPTIONS=[
    {id:"cliky",nom:"Cliky",ic:robot,court:"Le pré-devis se prépare tout seul",
     avec:["Dès qu'une demande arrive, Cliky prépare le pré-devis avec vos prix.","Il vous montre les lignes à vérifier.","Rien ne part au client sans votre accord."],
     sans:"Vos demandes arrivent quand même, avec les réponses du client, ses photos et son plan. Le chiffrage, vous le faites vous-même."},
    {id:"sms",nom:"SMS",ic:function(){return IC_SMS},court:"Alertes et messages par SMS",
     avec:["Un SMS à chaque nouvelle demande, avec le lien vers votre Espace.","Le client reçoit une confirmation par SMS.","Appel manqué : un SMS part tout seul pour dire que vous rappelez."],
     sans:"Vos alertes arrivent par e-mail et dans l'appli. Rien n'est perdu."},
    {id:"chatbot",nom:"Assistant du site",ic:function(){return IC_CHAT},court:"Répond aux visiteurs de votre site",
     avec:["Il répond aux questions des visiteurs de votre site, même le soir.","Il les guide vers la demande de devis."],
     sans:"Votre site garde sa bulle d'aide guidée, qui oriente déjà les visiteurs."}
  ];
  var DEMO_DEF={cliky:true,sms:true,chatbot:false};

  function vrai(){return html.classList.contains("pcvrai")}
  function artisan(){var L=lsG("pc-vrai-liste");return (L&&L.artisan)||lsG("pc-vrai-artisan")||{}}
  // Service sans liste d'options : Cliky était déjà branché. Option absente de la liste : « à confirmer », jamais deviné.
  function etat(id){
    if(!vrai()){var d=lsG("pc-demo-options")||{};return id in d?!!d[id]:!!DEMO_DEF[id]}
    var o=artisan().options;
    if(!o||typeof o!=="object")return id==="cliky"?true:null;
    return id in o?!!o[id]:null;
  }
  window.pcOption=function(id){return etat(id)!==false};

  // Cliky « connecté » : vraies demandes lues à l'instant ; sinon on dit la vérité (hors connexion)
  function liaison(){
    if(!vrai())return {ok:true,txt:"Connecté à vos demandes"};
    var L=lsG("pc-vrai-liste");if(!L)return {ok:null,txt:"Vérification…"};
    if(L._cache)return {ok:false,txt:"Hors connexion pour l'instant"};
    var der=(L.demandes||[]).map(function(d){return d.pre_devis_le}).filter(Boolean).sort().pop();
    return {ok:true,txt:"Connecté à vos demandes",der:der};
  }
  function quand(iso){var d=new Date(iso);if(isNaN(d))return "";var j=Math.round((new Date(new Date().toDateString())-new Date(d.toDateString()))/864e5),
    h=d.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}).replace(":"," h ");
    return j===0?"aujourd'hui, "+h:j===1?"hier, "+h:d.toLocaleDateString("fr-FR",{day:"numeric",month:"long"})}

  function statut(e){return e===null?'<span class="opt-st inc">À confirmer</span>':e?'<span class="opt-st on">Incluse</span>':'<span class="opt-st">Non incluse</span>'}

  /* ---------- l'accueil : une seule ligne pour Cliky, sous la phrase du jour ---------- */
  var puce=document.createElement("button");puce.type="button";puce.className="opt-puce";puce.setAttribute("data-optd","cliky");
  var ph=$("#phrase");if(ph)ph.parentNode.insertBefore(puce,ph.nextSibling);
  function majPuce(){var on=etat("cliky")!==false,l=liaison();
    puce.classList.toggle("on",on);puce.classList.toggle("coupe",on&&l.ok===false);
    puce.innerHTML='<span class="opt-ic">'+robot(on)+"</span><span>"+(on?"<b>Cliky</b> · "+(l.ok===false?"hors connexion":"connecté"):"<b>Cliky</b> n'est pas dans votre abonnement")+'</span><span class="fl">›</span>'}

  /* ---------- « Mes options » dans le menu Votre espace ---------- */
  window.pcOptionsHTML=function(){
    return '<div class="xsec"><h3>Mes options</h3><div class="card menu opt-l">'+OPTIONS.map(function(o){var e=etat(o.id);
      return '<button type="button" data-optd="'+o.id+'"'+(e===false?' class="off"':"")+'><span class="av opt-ic">'+o.ic(e!==false)+'</span><span class="tx"><b>'+esc(o.nom)+"</b><small>"+esc(o.court)+"</small></span>"+statut(e)+'<span class="go">›</span></button>'}).join("")+
      "</div></div>"};

  function detail(id,garder){var o=OPTIONS.filter(function(x){return x.id===id})[0];if(!o||!window.pcX)return;var e=etat(id),on=e!==false,l=id==="cliky"&&on?liaison():null;
    var h='<div class="card opt-tete'+(on?" on":"")+'"><span class="opt-gal">'+o.ic(on)+"</span><div><b>"+(e===null?esc(o.nom)+" : à confirmer avec Cyril":on?esc(o.nom)+" est inclus dans votre abonnement":esc(o.nom)+" n'est pas dans votre abonnement")+"</b>"+
      (l?'<span class="opt-li'+(l.ok===false?" coupe":"")+'"><i></i>'+esc(l.txt)+"</span>"+(l.der?'<small>Dernier pré-devis : '+esc(quand(l.der))+"</small>":""):"")+"</div></div>";
    if(on)h+='<div class="xsec"><h3>Ce qu\'il fait pour vous</h3><div class="card"><ul class="opt-ul">'+o.avec.map(function(x){return "<li>"+esc(x)+"</li>"}).join("")+"</ul></div></div>";
    else h+='<div class="xsec"><h3>Sans cette option</h3><div class="card"><p class="opt-p">'+esc(o.sans)+"</p></div></div>"+
      '<div class="xsec"><h3>Avec '+esc(o.nom)+'</h3><div class="card"><ul class="opt-ul">'+o.avec.map(function(x){return "<li>"+esc(x)+"</li>"}).join("")+"</ul>"+
      '<p class="opt-p" style="margin-top:12px"><b>Pour l\'ajouter, dites-le simplement à Cyril</b> : il s\'occupe de tout, vous n\'avez rien à régler.</p></div></div>';
    if(!vrai())h+='<div class="card menu"><button type="button" data-optdemo="'+id+'"><span class="tx"><b>Démo : '+esc(o.nom)+" dans l'abonnement</b><small>Pour voir l'Espace avec ou sans cette option</small></span>"+'<span class="sw'+(on?" on":"")+'" role="switch" aria-checked="'+on+'"></span></button></div>';
    window.pcX.open(o.nom,on?"Option incluse":"Option non incluse",h,'<button class="btn" data-xclose>Fermer</button>',null,garder)}

  document.addEventListener("click",function(ev){
    var d=ev.target.closest("[data-optd]");if(d){detail(d.getAttribute("data-optd"),!!d.closest("#xsheet"));return}
    var m=ev.target.closest("[data-optdemo]");if(m){var id=m.getAttribute("data-optdemo"),o=lsG("pc-demo-options")||{};o[id]=!(id in o?o[id]:DEMO_DEF[id]);lsS("pc-demo-options",o);
      maj();if(window.pcX){window.pcX.back();detail(id,true)}}
  });

  // Démo sans Cliky : la phrase du jour ne promet pas des devis « déjà calculés »
  var phOrig=null;
  function phrase(){if(!ph||vrai())return;var off=etat("cliky")===false;
    if(off){if(phOrig===null)phOrig=ph.textContent;ph.textContent="Deux demandes vous attendent, avec les réponses et les photos du client."}
    else if(phOrig!==null){ph.textContent=phOrig;phOrig=null}}
  function maj(){majPuce();phrase();html.classList.toggle("sans-cliky",etat("cliky")===false);document.dispatchEvent(new CustomEvent("pc-options"))}
  maj();
  // La liste des vraies demandes (et donc les options) arrive après le chargement : on suit.
  addEventListener("storage",maj);
  new MutationObserver(maj).observe(html,{attributes:true,attributeFilter:["class"]});
  // Le menu est réécrit à chaque retour en arrière : on remet les états du moment.
  var xin=$("#x-in");if(xin)new MutationObserver(function(){var l=xin.querySelector(".opt-l");if(l&&!l._ok){var t=document.createElement("div");t.innerHTML=window.pcOptionsHTML();var n=t.querySelector(".opt-l");n._ok=true;l.parentNode.replaceChild(n,l)}}).observe(xin,{childList:true});
  var va=$("#va");if(va)new MutationObserver(function(){clearTimeout(maj._t);maj._t=setTimeout(maj,80)}).observe(va,{childList:true});
})();
