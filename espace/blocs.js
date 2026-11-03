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
  function vrai(){return document.documentElement.classList.contains("pcvrai")}
  function nb(n,un,plu){return n+" "+(n>1?plu:un)}
  function aEnv(n){return n?"préparée"+(n>1?"s":"")+" pour vous":"rien à envoyer"}
  var TU={
    devis:function(){
      if(vrai()){var R=window.PCVD;if(!R)return [["doc","À valider","—","chargement…"],["camion","Fournisseur","—",""],["ok","Validés","—",""]];
        return [["doc","À valider",R.a,R.a?"à vérifier ce soir":"rien ce soir"],["camion","Fournisseur",R.f,R.f?"prix attendus":"aucun en attente"],["ok","Validés",R.v,"et suivantes"]]}
      var D=P.D||[],f=function(s){return D.filter(function(d){return d.statut===s})};
      var a=f("todo"),w=f("warn"),na=Math.max(a.length,badge("#badge")),s=f("sent"),g=f("signed");
      return [["doc","À valider",na,na?eur0(somme(a))+" HT":"rien ce soir"],["camion","Prix fournisseur",w.length,w.length?"a changé":"à jour"],
        ["horloge","Envoyés",s.length,s.length?eur0(somme(s))+" HT · sans réponse":"aucun"],["signe","Signés",g.length,g.length?eur0(somme(g))+" HT":"aucun"]]},
    /* Factures : plus aucun montant écrit en dur (Cyril, 3/11). En direct : les vraies factures VosFactures ; en démo : la liste d'exemple affichée dessous. */
    factures:function(){var n=badge("#badge-f"),ht=0,na=0,tout=0,ac=0;
      if(vrai()){var L=window.PCV&&window.PCV.factures;
        if(!L)return [["facture","À envoyer",n,aEnv(n)],["euro","À encaisser","—","chargement…"],["signe","Facturé","—","chargement…"],["ok","Acomptes","—","à envoyer"]];
        L.forEach(function(d){var h=+d.ht||0;tout+=h;if(d.statut==="sent"||d.statut==="partial"){ht+=h;na++}if(d.type==="acompte"&&d.statut==="issued")ac++});
        return [["facture","À envoyer",n,aEnv(n)],["euro","À encaisser",eur0(ht),na?nb(na,"facture","factures")+" · HT":"rien en attente",0,na?"cor":""],
          ["signe","Facturé",eur0(tout),"HT, toutes vos factures"],["ok","Acomptes",ac,"à envoyer"]]}
      var cf=P.cf||{},F=cf.FA?cf.FA():[],t=function(f){try{return cf.ftot(f).ht}catch(e){return 0}};
      F.forEach(function(f){var h=t(f);tout+=h;if(f.st==="attente"){ht+=h;na++}if(f.ty==="ac"&&f.st==="pret")ac++});
      return [["facture","À envoyer",n,aEnv(n)],["euro","À encaisser",eur0(ht),na?nb(na,"facture","factures")+" · HT":"rien en attente",1,na?"cor":""],
        ["signe","Facturé",eur0(tout),"HT, toutes les factures",1],["ok","Acomptes",ac,"à envoyer"]]},
    clients:function(){var v=$("#v-clients"),t=segN(v,"Tous"),s=segN(v,"À suivre"),p=segN(v,"Pros");if(t==null)return null;
      return [["gens","Clients",t,"en tout"],["horloge","À suivre",s||0,"devis ou chantier en cours"],["pro","Pros",p||0,"entreprises"],["maison","Particuliers",Math.max(0,t-(p||0)),"maisons et appartements"]]},
    depenses:function(){var m=txt($("#v-depenses .dp-mt")),r=badge("#badge-d"),mt=m.match(/[\d\s  ]+,\d\d\s*€/);
      return [["porte","Ce mois-ci",mt?mt[0].trim():(/aucune/i.test(m)?"0 €":"—"),"HT"],["pile","À ranger",r,r?"il manque le chantier":"tout est rangé"]]},
    /* Achats : compté sur les vraies listes (demandes de prix et commandes), plus sur le texte affiché */
    prix:function(){var D=P.DP||[],C=P.CMD?P.CMD():[],k=function(s){return D.filter(function(x){return x.st===s}).length},
      r=C.filter(function(c){return c.st==="envoyee"||c.st==="conf"}).length;
      return [["horloge","En attente",k("wait"),"demandes de prix"],["chat","Réponses",k("recu"),"à lire"],["camion","Commandes",r,r?"en route":"rien en route"]]},
    /* Planning : plus de tuiles (Cyril, 3/11 23h22), la semaine se lit d'un coup d'œil */
    produits:function(){var v=$("#v-produits");return [["boite","Produits",$$(".pr-li",v).length,"dans votre base"],["pile","Familles",$$(".pr-fam",v).length,"bien rangées"]]}
  };

  function tuiles(id,L){var ex=L.some(function(x){return x[4]}),lg=L.some(function(x){return String(x[2]).length>6});
    return '<div class="tb" data-tb="'+id+'"><div class="tb-g'+(lg?" long":"")+'" style="--n:'+L.length+'">'+L.map(function(x){return '<div class="tb-t"><span class="tb-ic">'+I(IC[x[0]])+'</span><b'+(x[5]?' class="'+x[5]+'"':"")+">"+esc(x[2])+'</b><span class="tb-l">'+esc(x[1])+"</span><em>"+esc(x[3])+"</em></div>"}).join("")+"</div>"+
      (ex?'<p class="tb-ex">Chiffres d\'exemple</p>':"")+"</div>"}
  function poseTuiles(v){var id=v.id.replace(/^v-/,""),f=TU[id];if(!f)return;var L=null;try{L=f()}catch(e){}
    var old=v.querySelector(":scope .tb");if(!L){if(old)old.remove();return}
    var h=tuiles(id,L);if(old&&old._h===h&&old.isConnected)return;
    var t=document.createElement("div");t.innerHTML=h;t=t.firstChild;t._h=h;
    var ref=(vrai()&&v.querySelector("#vd .vh"))||v.querySelector(".cf-top")||v.querySelector(":scope>.row")||v.querySelector(".dp-mois");
    if(old)old.replaceWith(t);else if(ref&&ref.parentNode)ref.parentNode.insertBefore(t,ref.nextSibling);else v.insertBefore(t,v.firstChild)}

  /* Dépenses et Chantiers n'avaient pas de titre : chaque onglet commence par son nom */
  function titre(sel,nom){var c=$(sel);if(!c||c.querySelector(":scope>.cf-top"))return;
    var r=document.createElement("div");r.className="row cf-top dp-titre";r.innerHTML="<h2>"+nom+"</h2>";c.insertBefore(r,c.firstChild)}
  function titreDepenses(){titre("#v-depenses>.cf","Dépenses");titre("#v-chantiers .ch-top","Chantiers")}

  /* ---------- le même ordre partout (Cyril, 3/11 : « désordonné d'une page à l'autre ») ----------
     1. le nom de l'onglet  2. les tuiles  3. le gros bouton (Créer, Ajouter…) et sa phrase d'aide
     4. le menu (Factures / Acomptes…, Jour / Semaine…, mois)  5. la recherche  6. les blocs.
     Rien n'est déplacé dans la page (les onglets se redessinent sans casse) : seul l'ordre d'affichage change. */
  function rang(el,id){var c=el.classList;
    if(c.contains("vexemple"))return id==="factures"?42:0;
    if(c.contains("cf-top")||c.contains("dp-titre")||el.tagName==="H2"||(c.contains("vh")&&!el.previousElementSibling))return 10;
    if(c.contains("tb"))return 20;
    if(c.contains("fa-aide")||c.contains("dp-aide"))return 31;
    if((c.contains("cf-main")&&!c.contains("dp-bas"))||c.contains("cf-go")||el.id==="ev-add")return 30;
    if(el.id==="vfa")return 40;
    if(c.contains("tm"))return 20;if(c.contains("seg")||c.contains("dp-mois"))return 50;
    if(c.contains("cf-cherche")||c.contains("pr-q"))return 60;
    return 70}
  function range(c,plat,suf,id){c.classList.add("ord-"+suf);
    (function tour(p){[].forEach.call(p.children,function(x){if(x.tagName==="SCRIPT"||x.tagName==="STYLE")return;
      if(plat.some(function(s){return x.matches(s)})){x.classList.add("fl-"+suf);tour(x)}
      else{var o=rang(x,id);x.classList.add("oi-"+suf);x.style.order=o;x.setAttribute("data-r",o)}})})(c)}
  var ORD={
    devis:function(v){var c=vrai()?$("#vd",v):$(".cf.dv",v);if(c)range(c,vrai()?[".cf"]:[".grid2",".col"],"a","devis")},
    factures:function(v){if(vrai())range(v,[".cf",".grid2",".col"],"a","factures");else{var c=$(":scope>.cf",v);if(c)range(c,[".grid2",".col"],"a","factures")}},
    clients:function(v){var c=$(".cl",v);if(c)range(c,[],"a","clients")},
    planning:function(v){range(v,[".row"],"a","planning")},
    depenses:function(v){var c=$(":scope>.cf",v);if(c)range(c,[".grid2",".col"],"a","depenses")},
    produits:function(v){var c=$(".cf.pr",v);if(c)range(c,[],"a","produits")},
    prix:function(v){range(v,[".row"],"a","prix")},
    chantiers:function(v){var c=$(".ch-top",v);if(c)range(c,[],"a","chantiers")}
  };


  /* ---------- chaque section (titre + liste) devient un seul bloc ---------- */
  function blocs(v){$$(".sec-h",v).forEach(function(h){if(h.closest(".bk,.tdb,.card,.sheet"))return;var c=h.nextElementSibling;
    if(!c||!c.classList.contains("card"))return;var b=document.createElement("div");b.className="bk";h.parentNode.insertBefore(b,h);b.appendChild(h);b.appendChild(c)})}


  /* ---------- ESSAI (Cyril, 3/11 23h) : les tuiles DEVIENNENT le menu ----------
     Plus de doublon tuiles + menu : le menu de l'onglet (Pré-devis / Fournisseur / Validés…) prend la forme de tuiles
     chiffrées qui se touchent. Seul ce qui demande une action est teinté. Par défaut sur Devis, Clients, Factures, Produits (?tuiles=avant pour revoir l ancien). */
  var essai=(function(){try{var q=new URLSearchParams(location.search).get("tuiles");if(q)sessionStorage.setItem("pc-tu",q);return (q||sessionStorage.getItem("pc-tu"))!=="avant"}catch(e){return !/tuiles=avant/.test(location.search)}})();
  if(essai)document.documentElement.setAttribute("data-tu","menu");
  var TM={
    devis:function(v){var c=$(vrai()?"#vd":".cf.dv",v),bs=c?$$(".dv-seg button",c).slice(0,3):[];if(bs.length<3)return null;var N,S;
      if(vrai()){var R=window.PCVD||{a:0,f:0,v:0};N=[R.a,R.f,R.v];S=[R.a?"à vérifier ce soir":"rien ce soir",R.f?"prix attendus":"aucun en attente","et suivantes"]}
      else{var D=P.D||[],f=function(s){return D.filter(function(d){return d.statut===s})},a=f("todo"),w=f("warn");
        N=[Math.max(a.length,badge("#badge")),w.length,f("sent").length+f("signed").length];S=[N[0]?eur0(somme(a))+" HT":"rien ce soir",N[1]?"prix changé":"à jour","envoyés"]}
      return {b:bs,N:N,S:S,T:[N[0]?"chaud":"",N[1]?"chaud":"",""]}},
    /* Factures : en direct, le menu ne pilote que l'exemple du dessous, on garde donc les tuiles des vraies factures */
    factures:function(v){if(vrai())return null;var c=$(":scope>.cf",v),bs=c?$$(".dv-seg button",c).slice(0,3):[];if(bs.length<3)return null;
      var cf=P.cf||{},F=cf.FA?cf.FA():[],R=cf.RC?cf.RC():[],ht=0,t=function(f){try{return cf.ftot(f).ht}catch(e){return 0}};
      F.forEach(function(f){if(f.st==="attente")ht+=t(f)});
      var nf=F.filter(function(f){return f.ty!=="ac"&&f.st==="pret"}).length,na=F.filter(function(f){return f.ty==="ac"&&f.st==="pret"}).length,nr=R.filter(function(r){return r.st!=="payee"}).length;
      return {b:bs,N:[nf,na,nr],S:[ht?eur0(ht)+" dus":"à envoyer","à envoyer",nr?"à payer":"tout est payé"],T:[nf?"chaud":"",na?"chaud":"",nr?"chaud":""]}},
    chantiers:function(v){var c=$(".ch-top",v),bs=c?$$(":scope>.ch-seg button",c):[];if(bs.length<2)return null;var CH=P.CH||{},L=Object.keys(CH).map(function(k){return CH[k]}),
      act=L.filter(function(x){return x.st==="run"||x.st==="cours"}),moy=0;act.forEach(function(x){try{moy+=P.avc(x)}catch(e){}});
      var N=bs.map(function(b){var i=b.querySelector("i");return i?(parseInt(txt(i),10)||0):L.length});
      return {b:bs,N:N,S:[N[0]?"chantiers ouverts":"aucun en cours","depuis le début"],T:[N[0]?"chaud":"",""]}},
    prix:function(v){var bs=$$("#achseg button",v);if(bs.length<3)return null;var D=P.DP||[],C=P.CMD?P.CMD():[],k=function(x){return D.filter(function(d){return d.st===x}).length},
      w=k("wait"),r=k("recu"),c=C.filter(function(x){return x.st==="envoyee"||x.st==="conf"}).length;
      return {b:bs,N:[w+r,"",c],S:[r?nb(r,"réponse","réponses"):w?"en attente":"aucune demande","vos tarifs",c?"en route":"rien en route"],T:[r?"chaud":"","",""],I:["camion","euro","boite"]}},
    produits:function(v){var c=$(".cf.pr",v),bs=c?$$(":scope>.dv-seg button",c):[];if(bs.length<3)return null;
      var N=bs.map(function(b){var i=b.querySelector("i");return i?(parseInt(txt(i),10)||0):""});return {b:bs,N:N,S:["fournitures","main-d'œuvre","référence"],T:["","",""]}},
    clients:function(v){var c=$(".cl",v),bs=c?$$(":scope>.cl-seg button",c):[];if(bs.length<3)return null;
      var N=bs.map(function(b){return parseInt(txt(b.querySelector("i")),10)||0});return {b:bs,N:N,S:["en tout","en cours","entreprises"],T:["",N[1]?"chaud":"",""]}}
  };
  function menuTuiles(v){var id=v.id.replace(/^v-/,""),f=TM[id];if(!essai||!f)return false;var r=null;try{r=f(v)}catch(e){}if(!r)return false;
    r.b[0].parentNode.classList.add("tm");r.b[0].parentNode.style.setProperty("--n",r.b.length);
    r.b.forEach(function(b,i){var k=r.N[i]+"|"+r.S[i]+"|"+r.T[i];if(b._tm===k&&b.querySelector(".tm-n"))return;b._tm=k;
      $$(".tm-n,.tm-s",b).forEach(function(x){x.remove()});
      if(r.I&&!b.querySelector("svg"))b.insertAdjacentHTML("afterbegin",I(IC[r.I[i]]));
      b.insertAdjacentHTML("beforeend",'<b class="tm-n'+(r.T[i]?" "+r.T[i]:"")+'">'+esc(r.N[i])+'</b><em class="tm-s">'+esc(r.S[i])+"</em>")});
    var old=v.querySelector(":scope .tb");if(old)old.remove();return true}

  var fil=0;
  function tout(){fil=0;titreDepenses();$$("section.view").forEach(function(v){if(v.id==="v-accueil"||v.id==="v-reseaux")return;blocs(v);if(!menuTuiles(v))poseTuiles(v);
    var o=ORD[v.id.replace(/^v-/,"")];if(o)try{o(v)}catch(e){}})}
  function plusTard(){if(!fil)fil=setTimeout(tout,80)}
  var main=$("main")||document.body;
  new MutationObserver(function(ms){for(var i=0;i<ms.length;i++){var t=ms[i].target;if(!(t.closest&&t.closest(".tb")))return plusTard()}}).observe(main,{childList:true,subtree:true,characterData:true});
  ["#badge","#badge-f","#badge-d"].forEach(function(id){var b=$(id);if(b)new MutationObserver(plusTard).observe(b,{childList:true,characterData:true,subtree:true,attributes:true})});
  tout();addEventListener("load",tout);
})();
