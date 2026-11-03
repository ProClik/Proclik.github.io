/* Tout l'Espace en BLOCS, comme l'Accueil (demande de Cyril, 3/11 21h51), mais sans déplacement des blocs :
   1. en haut de chaque onglet, une rangée de petites tuiles chiffrées (ce qu'il faut savoir d'un coup d'œil) ;
   2. chaque section (titre + liste) devient un seul bloc en relief, titre à l'intérieur.
   L'Accueil n'est pas touché. Ce que les onglets redessinent est repris tout seul. Les montants fictifs sont signalés « Chiffres d'exemple ». */
(function(){
  "use strict";
  var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
  var esc=function(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})};
  var eur0=function(n){return Math.round(n).toLocaleString("fr-FR")+" €"};
  var I=function(p){return '<svg viewBox="0 0 24 24" aria-hidden="true">'+p+"</svg>"};
  var IC={doc:'<path d="M13 21H6V3h8l4 4v4"/><path d="M14 3v4h4M9 9h4M9 13h3"/><path d="M19.5 13.5l-5.5 5.5-.6 2.6 2.6-.6 5.5-5.5z"/>',
    camion:'<path d="M3 16V6h11v10M14 9h4l3 3.5V16h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
    horloge:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/>',signe:'<path d="M4 17c2.5 0 3-6 5-6s1.5 5 3.5 5 2-3 3.5-3 1.5 2 4 2"/><path d="M4 21h16"/>',
    facture:'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/>',euro:'<path d="M17 6.5A6.5 6.5 0 1 0 17 17.5"/><path d="M4 10h9M4 14h9"/>',
    ok:'<path d="M5 12l5 5 9-10"/>',gens:'<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 14.2A4.5 4.5 0 0 1 21 19"/>',
    pro:'<rect x="3.5" y="7" width="17" height="12" rx="2"/><path d="M9 7V5h6v2M3.5 12h17"/>',maison:'<path d="M3 20h18M6 20V10l6-4 6 4v10"/><path d="M10 20v-5h4v5"/>',
    porte:'<path d="M4 7.5h15a1.5 1.5 0 0 1 1.5 1.5v9.5A1.5 1.5 0 0 1 19 20H5.5A1.5 1.5 0 0 1 4 18.5z"/><path d="M4 7.5V6a2 2 0 0 1 2-2h10.5v3.5"/><path d="M16 13.8h1.5"/>',
    agenda:'<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M8 3v4M16 3v4M4 10h16"/>',visite:'<circle cx="12" cy="10" r="3"/><path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z"/>',
    libre:'<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M4 10h16M10 15h4"/>',boite:'<path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="M3.5 7.5 12 12l8.5-4.5M12 12v9"/>',
    pile:'<path d="M4 7h16M4 12h16M4 17h10"/>',chat:'<path d="M4 5h16v11H9l-5 4z"/>'};
  var P=window.PCX||{};

  /* ---------- les tuiles de chaque onglet : [icône, titre, valeur, sous-titre, exemple?, couleur] ---------- */
  function txt(s){return (s&&s.textContent||"").replace(/\s+/g," ").trim()}
  function segN(v,mot){var b=$$(".seg button",v).filter(function(x){return new RegExp("^"+mot,"i").test(txt(x))})[0];return b?(parseInt(txt(b).replace(/\D+/g,""),10)||0):null}
  function somme(L){var t=0;L.forEach(function(d){try{t+=P.tot(d).ht}catch(e){}});return t}
  function badge(id){var b=$(id);return b&&!b.hidden?+txt(b)||0:0}
  var TU={
    devis:function(){var D=P.D||[],f=function(s){return D.filter(function(d){return d.statut===s})};
      var a=f("todo"),w=f("warn"),na=Math.max(a.length,badge("#badge")),s=f("sent"),g=f("signed");
      return [["doc","À valider",na,na?eur0(somme(a))+" HT":"rien ce soir"],["camion","Prix fournisseur",w.length,w.length?"a changé":"à jour"],
        ["horloge","Envoyés",s.length,s.length?eur0(somme(s))+" HT · sans réponse":"aucun"],["signe","Signés",g.length,g.length?eur0(somme(g))+" HT":"aucun"]]},
    factures:function(){var n=badge("#badge-f"),ac=segN($("#v-factures"),"Acomptes");
      return [["facture","À envoyer",n,n?"préparée"+(n>1?"s":"")+" pour vous":"rien à envoyer"],["euro","À encaisser","2 760 €","1 facture",1,"cor"],
        ["signe","Facturé","11 400 €","ce mois-ci",1],["ok","Acomptes",ac==null?"—":ac,"à envoyer"]]},
    clients:function(){var v=$("#v-clients"),t=segN(v,"Tous"),s=segN(v,"À suivre"),p=segN(v,"Pros");if(t==null)return null;
      return [["gens","Clients",t,"en tout"],["horloge","À suivre",s||0,"devis ou chantier en cours"],["pro","Pros",p||0,"entreprises"],["maison","Particuliers",Math.max(0,t-(p||0)),"maisons et appartements"]]},
    depenses:function(){var m=txt($("#v-depenses .dp-mt")),r=badge("#badge-d"),sub=(m.split("·")[1]||"").trim();
      return [["porte","Ce mois-ci",(m.match(/[\d\s ]+,\d\d\s*€/)||[/aucune/i.test(m)?"0 €":"—"])[0],"HT"],["pile","À ranger",r,r?"il manque le chantier":"tout est rangé"]]},
    prix:function(){var v=$("#v-prix"),L=$$(".cf-li,.card .row,.lst>*",v).map(txt),c=function(re){return L.filter(function(t){return re.test(t)}).length};
      return [["horloge","En attente",c(/en attente/i),"demandes de prix"],["chat","Réponses",c(/réponse/i),"à lire"],["camion","Commandés",c(/command/i),"en route"]]},
    planning:function(){var E=P.EV||[],lun=new Date(2026,9,12),dim=new Date(2026,9,18),iso=function(d){return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2)};
      var S=E.filter(function(e){return e.d>=iso(lun)&&e.d<=iso(dim)}),k=function(x){return S.filter(function(e){return e.k===x}).length};
      return [["maison","Jours de chantier",k("run")+k("plan"),"cette semaine"],["visite","Visites",k("visit"),"cette semaine"],["libre","Créneaux libres",k("free"),"à proposer"],["agenda","Points ProClik",k("pc"),"20 min avec Cyril"]]},
    produits:function(){var v=$("#v-produits");return [["boite","Produits",$$(".pr-li",v).length,"dans votre base"],["pile","Familles",$$(".pr-fam",v).length,"bien rangées"]]}
  };

  function tuiles(id,L){var ex=L.some(function(x){return x[4]});
    return '<div class="tb" data-tb="'+id+'"><div class="tb-g">'+L.map(function(x){return '<div class="tb-t"><span class="tb-h"><span class="tb-ic">'+I(IC[x[0]])+"</span><small>"+esc(x[1])+'</small></span><b'+(x[5]?' class="'+x[5]+'"':"")+">"+esc(x[2])+"</b><em>"+esc(x[3])+"</em></div>"}).join("")+"</div>"+
      (ex?'<p class="tb-ex">Chiffres d\'exemple</p>':"")+"</div>"}
  function poseTuiles(v){var id=v.id.replace(/^v-/,""),f=TU[id];if(!f)return;var L=null;try{L=f()}catch(e){}
    var old=v.querySelector(":scope .tb");if(!L){if(old)old.remove();return}
    var h=tuiles(id,L);if(old&&old._h===h&&old.isConnected)return;
    var t=document.createElement("div");t.innerHTML=h;t=t.firstChild;t._h=h;
    var ref=v.querySelector(".cf-top")||v.querySelector(":scope>.row")||v.querySelector(".dp-mois");
    if(old)old.replaceWith(t);else if(ref&&ref.parentNode)ref.parentNode.insertBefore(t,ref.nextSibling);else v.insertBefore(t,v.firstChild)}

  /* ---------- chaque section (titre + liste) devient un seul bloc ---------- */
  function blocs(v){$$(".sec-h",v).forEach(function(h){if(h.closest(".bk,.tdb,.card,.sheet"))return;var c=h.nextElementSibling;
    if(!c||!c.classList.contains("card"))return;var b=document.createElement("div");b.className="bk";h.parentNode.insertBefore(b,h);b.appendChild(h);b.appendChild(c)})}

  var fil=0;
  function tout(){fil=0;$$("section.view").forEach(function(v){if(v.id==="v-accueil"||v.id==="v-reseaux")return;blocs(v);poseTuiles(v)})}
  function plusTard(){if(!fil)fil=setTimeout(tout,80)}
  var main=$("main")||document.body;
  new MutationObserver(function(ms){for(var i=0;i<ms.length;i++){var t=ms[i].target;if(!(t.closest&&t.closest(".tb")))return plusTard()}}).observe(main,{childList:true,subtree:true,characterData:true});
  ["#badge","#badge-f","#badge-d"].forEach(function(id){var b=$(id);if(b)new MutationObserver(plusTard).observe(b,{childList:true,characterData:true,subtree:true,attributes:true})});
  tout();addEventListener("load",tout);
})();
