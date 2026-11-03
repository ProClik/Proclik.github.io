/* Accueil de l'Espace en BLOCS, comme les widgets de l'écran d'accueil d'un iPhone ou d'un iPad (demande de Cyril, 3/11).
   - Une grille de blocs (petit, large, grand, haut) : 4 colonnes sur ordinateur et tablette, 2 sur téléphone.
   - Trois dispositions toutes prêtes : « Atelier », « Chiffres d'abord », « Ma journée ».
   - L'artisan fait SON accueil : appui long sur un bloc (ou « Personnaliser l'accueil ») → les blocs se déplacent du doigt,
     se retirent (−), changent de taille, et « Ajouter un bloc » les remet. Gardé sur l'appareil (pc-tdb1).
   - Le graphique devient de simples barres : l'encaissé de chaque mois, le mois en cours en laiton, touchez une barre pour son montant.
   Démo : exemples fictifs. Vraies demandes (vrai.js) : « Le plus urgent » et « À faire » viennent de la liste gardée sur l'appareil ;
   l'argent, l'agenda et les chantiers restent des exemples, toujours signalés comme tels, tant qu'ils ne viennent pas de GHL.
   Essai d'une disposition sans rien enregistrer : ?accueil=a, b ou c. */
(function(){
  "use strict";
  var $=function(s,r){return (r||document).querySelector(s)};
  var $$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
  var esc=function(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})};
  var eur=function(n){return Number(n).toLocaleString("fr-FR",{minimumFractionDigits:2,maximumFractionDigits:2})+" €"};
  var eur0=function(n){return Number(n).toLocaleString("fr-FR",{maximumFractionDigits:0})+" €"};
  var vue=$("#v-accueil"),ancien=vue&&vue.querySelector(".grid2");if(!vue||!ancien)return;
  var acc=document.createElement("div");acc.className="acc tdb";acc.id="acc";ancien.parentNode.insertBefore(acc,ancien);
  document.documentElement.classList.add("pcacc");
  var vrai=function(){return document.documentElement.classList.contains("pcvrai")};

  var I=function(p){return '<svg viewBox="0 0 24 24" aria-hidden="true">'+p+"</svg>"};
  var IC={predevis:I('<path d="M13 21H6V3h8l4 4v4"/><path d="M14 3v4h4M9 9h4M9 13h3"/><path d="M19.5 13.5l-5.5 5.5-.6 2.6 2.6-.6 5.5-5.5z"/>'),
    facture:I('<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/>'),
    attente:I('<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/>'),
    fournisseur:I('<path d="M3 16V6h11v10M14 9h4l3 3.5V16h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>'),
    depense:I('<path d="M4 7.5h15a1.5 1.5 0 0 1 1.5 1.5v9.5A1.5 1.5 0 0 1 19 20H5.5A1.5 1.5 0 0 1 4 18.5z"/><path d="M4 7.5V6a2 2 0 0 1 2-2h10.5v3.5"/><path d="M16 13.8h1.5"/>'),
    chantier:I('<path d="M3 20h18M6 20V10l6-4 6 4v10"/><path d="M10 20v-5h4v5"/>'),
    agenda:I('<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M8 3v4M16 3v4M4 10h16"/>'),
    argent:I('<path d="M4 20V10M10 20V5M16 20v-7M21 20H3"/>'),
    signe:I('<path d="M4 17c2.5 0 3-6 5-6s1.5 5 3.5 5 2-3 3.5-3 1.5 2 4 2"/><path d="M4 21h16"/>'),
    plan:I('<path d="M4 4h16v16H4z"/><path d="M4 12h7V4M11 16v4M15 12h5"/>'),
    micro:I('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7"/>'),
    photo:I('<rect x="3" y="6" width="18" height="14" rx="3"/><circle cx="12" cy="13" r="3.5"/><path d="M8.5 6l1.5-2.5h4L15.5 6"/>'),
    verif:I('<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 14l2 2 3.5-3.5"/>'),
    ok:I('<path d="M5 12l5 5 9-10"/>'),
    moins:I('<path d="M6 12h12"/>'),plus:I('<path d="M12 6v12M6 12h12"/>'),
    taille:I('<path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/>'),
    grille:I('<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>')};
  var EX='<span class="exemple">Exemple</span>';

  /* ---------- les blocs disponibles : nom, tailles possibles (s petit 1×1, m large 2×1, l grand 2×2, h haut 1×2) ---------- */
  var W={
    urgent:{n:"Le plus urgent",d:"La demande à traiter en premier, avec le bouton pour s'en occuper",t:["l","m"],ic:"verif"},
    afaire:{n:"À faire",d:"Ce qui attend votre validation, votre envoi ou votre rangement",t:["h","l","m"],ic:"predevis"},
    argent:{n:"Chiffre d'affaires",d:"L'encaissé des 6 derniers mois, en barres",t:["l","m"],ic:"argent"},
    agenda:{n:"Agenda",d:"Votre semaine et vos prochains rendez-vous",t:["m","l","h"],ic:"agenda"},
    chantiers:{n:"Chantiers en cours",d:"Où en est chaque chantier",t:["m","l"],ic:"chantier"},
    nouveau:{n:"Nouveau pré-devis",d:"Plan, dictée ou photo de vos notes",t:["m","s"],ic:"plan"},
    encaisse:{n:"Encaissé du mois",d:"Ce qui est rentré ce mois-ci",t:["s"],ic:"argent"},
    signes:{n:"Devis signés",d:"Le montant signé ce mois-ci",t:["s"],ic:"signe"},
    aencaisser:{n:"À encaisser",d:"Les factures pas encore payées",t:["s"],ic:"facture"},
    envoyes:{n:"Devis envoyés",d:"Les devis qui attendent la réponse du client",t:["s"],ic:"attente"},
    reseaux:{n:"Réseaux sociaux",d:"Votre prochaine publication et vos messages",t:["m","s"],ic:"grille",opt:"reseaux"},
    avis:{n:"Avis Google",d:"Votre note et les derniers avis",t:["s","m"],ic:"signe",opt:"avis"}
  };
  /* Les trois dispositions proposées à Cyril (même blocs, rangés autrement) */
  var PRESETS={
    a:{n:"Atelier",d:"Le plus urgent et l'agenda en haut, les chiffres au milieu",L:[["urgent","l"],["agenda","m"],["encaisse","s"],["afaire","h"],["argent","l"],["signes","s"],["aencaisser","s"],["envoyes","s"],["chantiers","m"],["nouveau","m"]]},
    b:{n:"Chiffres d'abord",d:"Quatre chiffres en tête, puis le graphique et ce qu'il reste à faire",L:[["encaisse","s"],["signes","s"],["aencaisser","s"],["envoyes","s"],["argent","l"],["afaire","l"],["urgent","l"],["agenda","m"],["chantiers","m"]]},
    c:{n:"Ma journée",d:"L'agenda du jour et l'urgent côte à côte, l'argent plus bas",L:[["urgent","l"],["agenda","l"],["afaire","h"],["chantiers","m"],["encaisse","s"],["nouveau","m"],["aencaisser","s"],["argent","m"],["signes","s"],["envoyes","s"]]}
  };

  /* ---------- ce qui est enregistré ---------- */
  try{var cj=(location.search.match(/[?&]couleur=(\w+)/)||[])[1];if(cj)document.documentElement.setAttribute("data-couleur",cj);var fd=(location.search.match(/[?&]fond=(\w+)/)||[])[1];if(fd)document.documentElement.setAttribute("data-fond",fd)}catch(e){}
  var CLE="pc-tdb1",essai=(location.search.match(/[?&]accueil=([abc])/)||[])[1];
  function lire(){if(essai)return {p:essai,L:PRESETS[essai].L.slice()};
    try{var o=JSON.parse(localStorage.getItem(CLE)||"null");if(o&&o.L&&o.L.length!=null)return {p:o.p||"",L:o.L.filter(function(x){return W[x[0]]&&W[x[0]].t.indexOf(x[1])>=0})}}catch(e){}
    return {p:"a",L:PRESETS.a.L.slice()}}
  var etat=lire();
  function garder(){if(essai)return;try{localStorage.setItem(CLE,JSON.stringify(etat))}catch(e){}}

  /* ---------- données (démo ou vraies demandes) ---------- */
  function nbBadge(id){var b=$(id);return b&&!b.hidden?+b.textContent||0:0}
  var pl=function(n,un,plus){return n>1?plus:un};
  function donnees(){
    if(vrai()){
      var L=null;try{L=JSON.parse(localStorage.getItem("pc-vrai-liste")||"null")}catch(e){}
      var D=(L&&L.demandes)||[],E=(L&&L.etapes)||[],val=function(d){return /valider/i.test(d.etape||"")},four=function(d){return /fournisseur/i.test(d.etape||"")};
      var a=D.filter(val),f=D.filter(function(d){return !val(d)&&four(d)}),o=D.filter(function(d){return !val(d)&&!four(d)}),d=a[0]||null,u=null;
      if(d){var i=-1;E.forEach(function(e,k){if(i<0&&(e===d.etape||(e&&(e.id===d.etape_id||e.nom===d.etape))))i=k});
        u={qui:d.client,quoi:d.resume||d.titre||"",prix:d.total_ht,phase:phase(d.etape),ensuite:i>=0&&E[i+1]?(E[i+1].nom||E[i+1]):"",
          ligne:d.a_verifier?[(d.a_verifier>1?d.a_verifier+" lignes":"1 ligne")+" à vérifier",""]:null,attr:'data-vc="'+esc(d.contact||"")+'"'}}
      return {charge:!!L,total:D.length,urgent:u,afaire:[[a.length,"predevis","Pré-devis","à valider","valider","devis",a[0]?a[0].client:""],
        [f.length,"fournisseur","Prix fournisseur","attendu"+(f.length>1?"s":""),"suivre","devis",f[0]?f[0].client:""],
        [nbBadge("#badge-d"),"depense",pl(nbBadge("#badge-d"),"Dépense","Dépenses"),"à ranger","ranger","depenses",""],
        [o.length,"attente",pl(o.length,"Autre demande","Autres demandes"),"en cours","suivre","devis",""]]}}
    var X=window.PCX||{},DD=X.D||[],CH=X.CH||{};
    var av=nbBadge("#badge")||DD.filter(function(d){return d.statut==="todo"}).length;
    var fo=DD.filter(function(d){return d.statut==="warn"}).length,sr=DD.filter(function(d){return d.statut==="sent"}).length;
    var ch=Object.keys(CH).filter(function(k){return CH[k].st==="run"}).length,nf=nbBadge("#badge-f"),nd=nbBadge("#badge-d");
    return {charge:true,total:DD.length,demo:true,
      urgent:{qui:"Mme Durand · Grenoble",quoi:"Cloisons du séjour",prix:765.08,phase:0,ensuite:"le devis est prêt à envoyer au client",ligne:["Bâti de porte","730 × 2 040 mm"],attr:"data-accdemo"},
      afaire:[[av,"predevis","Pré-devis","à valider","valider","devis","Mme Durand · Cloisons du séjour"],
        [nf,"facture",pl(nf,"Facture","Factures"),"à envoyer","envoyer","factures","préparée pour vous"],
        [fo,"fournisseur","Prix fournisseur",fo>1?"ont changé":"a changé","valider","devis","M. Martin · 2 fenêtres PVC"],
        [nd,"depense",pl(nd,"Dépense","Dépenses"),"à ranger","ranger","depenses","ticket sans chantier"],
        [sr,"attente",pl(sr,"Devis envoyé","Devis envoyés"),"sans réponse","suivre","devis",""],
        [ch,"chantier",pl(ch,"Chantier","Chantiers"),"en cours","suivre","chantiers",""]]}}
  function phase(nom){nom=String(nom||"");return /factur|pay|solde|termin|clos/i.test(nom)?2:/chantier|accept|sign|acompte|travaux|planif/i.test(nom)?1:0}

  /* ---------- dessin de chaque bloc ---------- */
  function tete(ic,titre,droite){return '<div class="w-h"><span class="w-ic">'+IC[ic]+"</span><b>"+esc(titre)+"</b>"+(droite||"")+"</div>"}
  var IC_ET=[IC.predevis,IC.chantier,IC.facture];
  function parcours(p){return '<div class="parc" role="img" aria-label="Étape en cours : '+["devis","chantier","facture"][p]+'">'+["Devis","Chantier","Facture"].map(function(t,k){
      return (k?'<i class="parc-l'+(k<=p?" fait":"")+'"></i>':"")+'<span class="parc-e'+(k<p?" fait":k===p?" ici":"")+'"><span class="parc-ic">'+(k<p?IC.ok:IC_ET[k])+"</span><b>"+t+"</b></span>"}).join("")+"</div>"}
  function bouton(ic,txt,attr){return '<button class="btn go acc-go" type="button" '+attr+'><span class="lab"><span class="ic">'+IC[ic]+"</span><span>"+esc(txt)+"</span></span></button>"}

  var R={};
  R.urgent=function(t,D){var u=D.urgent;
    if(!D.charge)return tete("verif","Le plus urgent")+'<p class="vide">Chargement de vos demandes…</p>';
    if(!u)return tete("verif","Le plus urgent")+'<div class="w-rien"><b>Tout est à jour</b><span>Rien à valider ni à envoyer. Le café peut rester chaud.</span></div>';
    return '<div class="w-h urg"><small>Le plus urgent</small>'+(u.prix!=null?'<span class="prix">'+eur(u.prix)+" <small>HT</small></span>":"")+"</div>"+
      '<div class="u-qui"><b>'+esc(u.qui)+"</b><small>"+esc(u.quoi)+"</small></div>"+
      (t==="l"?parcours(u.phase):"")+
      '<div class="parc-tx"><span>Maintenant</span><b>Vérifier le pré-devis</b>'+(u.ensuite&&t==="l"?"<small>Ensuite : "+esc(u.ensuite)+"</small>":"")+"</div>"+
      (u.ligne&&t==="l"?'<div class="ligne corr"><span>'+esc(u.ligne[0])+(u.ligne[1]?'<span class="cote">'+esc(u.ligne[1])+"</span>":"")+'</span><span class="q">à vérifier</span></div>':"")+
      bouton("verif","Vérifier le pré-devis",u.attr)};
  R.afaire=function(t,D){var L=D.afaire.filter(function(x){return x[0]>0}),max=t==="m"?2:t==="h"?4:5;
    var n=L.reduce(function(s,x){return s+(x[4]==="suivre"?0:x[0])},0);
    var h=tete("predevis","À faire",n?'<span class="w-n">'+n+"</span>":"");
    if(!D.charge)return h+'<p class="vide">Chargement…</p>';
    if(!L.length)return h+'<div class="w-rien"><b>Tout est à jour</b><span>Rien à valider ni à envoyer.</span></div>';
    return h+'<div class="af">'+L.slice(0,max).map(function(x){
      return '<button class="af-b t-'+x[4]+'" type="button" data-accv="'+x[5]+'"><span class="afa-ic">'+IC[x[1]]+"<i>"+x[0]+'</i></span><span class="afa-tx"><b>'+esc(x[2])+'</b><small><em>'+esc(x[3])+"</em>"+(x[6]?" · "+esc(x[6]):"")+"</small></span>"+'<span class="af-f">›</span></button>'}).join("")+
      (L.length>max?'<button class="af-plus" type="button" data-accv="devis">Et '+(L.length-max)+" autre"+(L.length-max>1?"s":"")+" ›</button>":"")+"</div>"};
  /* Encaissé par mois (exemple) : de simples barres, faciles à lire d'un coup d'œil */
  var MOIS=[["Mai","mai",6100,9200],["Juin","juin",8400,12500],["Juil.","juillet",7200,7800],["Août","août",9600,13100],["Sept.","septembre",7900,11000],["Oct.","octobre",8640,14210]];
  R.argent=function(t){var sel=acc._mois==null?5:acc._mois,m=MOIS[sel],max=10000,moy=MOIS.reduce(function(s,x){return s+x[2]},0)/MOIS.length;
    var ev=sel>0?Math.round((m[2]-MOIS[sel-1][2])/MOIS[sel-1][2]*100):null;
    return tete("argent","Chiffre d'affaires",'<span class="exemple">Chiffres d\'exemple</span>')+
      '<div class="ar"><div class="ar-c"><small>Encaissé en '+m[1]+'</small><b>'+eur0(m[2])+' <em>HT</em></b>'+
      (ev!=null?'<span class="ar-ev'+(ev<0?" bas":"")+'">'+(ev<0?"▾ ":"▴ ")+Math.abs(ev)+" % par rapport à "+MOIS[sel-1][1]+"</span>":"")+
      (t==="l"?'<span class="ar-s">Signé en '+m[1]+" : <b>"+eur0(m[3])+"</b></span>":"")+"</div>"+
      '<div class="bars" role="group" aria-label="Encaissé des 6 derniers mois">'+
      
      MOIS.map(function(x,k){return '<button type="button" data-pk class="bar'+(k===sel?" on":"")+(k===5?" cour":"")+'" data-mois="'+k+'" aria-label="'+x[1]+" : "+eur0(x[2])+'"><span class="bar-v">'+(x[2]/1000).toLocaleString("fr-FR",{maximumFractionDigits:1})+' k</span><span class="bar-f"><span style="height:'+(x[2]/max*100).toFixed(1)+'%"></span></span><span class="bar-m">'+x[0]+"</span></button>"}).join("")+
      "</div></div>"};
  /* Agenda : la semaine en pastilles, puis les rendez-vous du jour choisi (exemple du Planning) */
  var JS=["Lun","Mar","Mer","Jeu","Ven","Sam"],KN={run:"Chantier",plan:"Chantier prévu",done:"Chantier",visit:"Visite",pc:"Point ProClik",free:"Libre"};
  function evs(iso){var E=(window.PCX&&PCX.EV)||[];return E.filter(function(e){return e.d===iso&&e.k!=="free"}).sort(function(a,b){return a.s<b.s?-1:1})}
  var iso=function(d){return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2)};
  R.agenda=function(t){var auj=new Date(2026,9,16),lun=new Date(auj);lun.setDate(auj.getDate()-((auj.getDay()+6)%7));
    var sel=acc._jour||iso(auj),j=[],k;for(k=0;k<6;k++){var d=new Date(lun);d.setDate(lun.getDate()+k);j.push(d)}
    var ds=new Date(sel+"T12:00:00"),L=evs(sel),max=t==="m"?1:3;
    return tete("agenda",ds.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"}).replace(/^./,function(c){return c.toUpperCase()}),EX)+
      '<div class="ag-j">'+j.map(function(d,k){var s=iso(d),n=evs(s).length;return '<button type="button" class="ag-d'+(s===sel?" on":"")+(s===iso(auj)?" auj":"")+'" data-jour="'+s+'"><small>'+JS[k]+"</small><b>"+d.getDate()+"</b>"+(n?"<i></i>":"<i class=\"vide\"></i>")+"</button>"}).join("")+"</div>"+
      '<div class="ag-l">'+(L.length?L.slice(0,max).map(function(e){return '<div class="ag-e k-'+e.k+'"><span class="ag-h">'+e.s.replace(":"," h ")+'</span><span class="ag-t"><b>'+esc(e.t)+"</b><small>"+esc(e.w)+"</small></span></div>"}).join("")+
        (L.length>max&&t!=="m"?'<button type="button" class="af-plus" data-accv="planning">Et '+(L.length-max)+" autre"+(L.length-max>1?"s":"")+" ›</button>":""):'<p class="vide">Rien de prévu ce jour-là.</p>')+"</div>"};
  R.chantiers=function(t){var CH=(window.PCX&&PCX.CH)||{},av=(window.PCX&&PCX.avc)||function(){return 0};
    var L=Object.keys(CH).map(function(k){return CH[k]}).filter(function(c){return c.st==="run"||c.st==="start"}).slice(0,t==="m"?2:4);
    return tete("chantier","Chantiers en cours",vrai()?EX:"")+(L.length?'<div class="ch">'+L.map(function(c){var p=av(c);
      return '<button type="button" class="ch-b" data-accv="chantiers"><span class="ch-t"><b>'+esc(c.n)+"</b><small>"+esc(c.v)+" · "+esc(c.dates||"")+'</small></span><span class="ch-p"><span class="ch-r"><span style="width:'+p+'%"></span></span><em>'+(p?p+" %":"à démarrer")+"</em></span></button>"}).join("")+"</div>":'<p class="vide">Aucun chantier en cours.</p>')};
  R.nouveau=function(t){if(t==="s")return tete("plan","Nouveau")+'<button type="button" class="nv-1" data-nv="0"><span class="nv-ic">'+IC.plan+"</span><b>Nouveau pré-devis</b></button>";
    return tete("plan","Nouveau pré-devis",'<span class="w-sub">3 façons, au choix</span>')+'<div class="nv">'+
      [["plan","Plan et cotes"],["micro","Dicter"],["photo","Photo des notes"]].map(function(x,k){return '<button type="button" data-nv="'+k+'"><span class="nv-ic">'+IC[x[0]]+"</span><b>"+x[1]+"</b></button>"}).join("")+"</div>"};
  function tuile(ic,titre,val,sous,v,cor){return function(){return '<button type="button" class="tu" data-accv="'+v+'"><span class="tu-h"><span class="w-ic">'+IC[ic]+"</span>"+EX+'</span><small>'+titre+'</small><b'+(cor?' class="cor"':"")+">"+val+"</b><em>"+sous+"</em></button>"}}
  R.encaisse=tuile("argent","Encaissé en octobre","8 640 €","HT · ce mois-ci","factures");
  R.signes=tuile("signe","Devis signés","14 210 €","3 sur 5 · 60 %","devis");
  R.aencaisser=tuile("facture","À encaisser","2 760 €","1 facture","factures",1);
  R.envoyes=tuile("attente","Devis envoyés","9 850 €","2 sans réponse","devis");
  R.reseaux=function(t){var tag=window.PCTAG?PCTAG("reseaux"):"";
    return tag+(t==="s"?'<button type="button" class="tu op" data-accv="reseaux"><small>Prochaine publication</small><b>jeu. 22/10</b><em>2 messages à lire</em></button>':
      '<button type="button" class="op-b" data-accv="reseaux"><span class="op-t"><small>Prochaine publication · jeu. 22/10 à 18 h</small><b>Avant / après : salle de bain à Échirolles</b></span><span class="op-n"><i>2</i>messages à lire</span></button>')+EX};
  R.avis=function(t){var tag=window.PCTAG?PCTAG("avis"):"";
    return tag+'<div class="av"><b>4,8 <span class="et">★★★★★</span></b><small>23 avis'+(t==="m"?" · dernier : « Travail propre, délais tenus »":"")+"</small></div>"+EX};

  /* ---------- la grille ---------- */
  var edition=false;
  function bloc(x,D){var w=W[x[0]];return '<section class="w sz-'+x[1]+(w.opt?" w-opt":"")+'" data-w="'+x[0]+'" data-t="'+x[1]+'" aria-label="'+esc(w.n)+'">'+
      '<div class="w-in">'+R[x[0]](x[1],D)+"</div>"+
      '<button type="button" class="w-x" data-wx aria-label="Retirer le bloc '+esc(w.n)+'">'+IC.moins+"</button>"+
      (w.t.length>1?'<button type="button" class="w-s" data-ws aria-label="Changer la taille du bloc '+esc(w.n)+'">'+IC.taille+"</button>":"")+"</section>"}
  function rendre(){if(acc._glisse)return;var D=donnees();
    var h='<div class="tdb-bar" '+(edition?"":"hidden")+'><div><b>Personnaliser l\'accueil</b><small>Gardez le doigt sur un bloc pour le déplacer</small></div><button type="button" class="btn" data-tdbajout>'+IC.plus+' Ajouter un bloc</button><button type="button" class="btn go" data-tdbfin>Terminé</button></div>'+
      '<div class="tdb-g">'+etat.L.map(function(x){return bloc(x,D)}).join("")+"</div>"+
      '<div class="tdb-pied">'+(D.total?'<button class="acc-tout" type="button" data-acctout>Toutes les demandes <span>'+(D.demo?"":D.total+" ")+"›</span></button>":"")+
      '<button type="button" class="tdb-perso" data-tdbperso>'+IC.grille+"<span>Personnaliser l'accueil</span></button></div>";
    if(acc._h===h)return;acc._h=h;acc.innerHTML=h;acc.classList.toggle("edite",edition);
    var ib=$("#instb"),co=$("#vco");if(co)acc.appendChild(co);if(ib)acc.appendChild(ib)}
  function plusTard(){clearTimeout(rendre._t);rendre._t=setTimeout(rendre,60)}

  /* ---------- mode « personnaliser » ---------- */
  // sans tout redessiner : le bloc sous le doigt doit rester le même pour pouvoir le glisser tout de suite
  function editer(on){edition=on;acc.classList.toggle("edite",on);var b=acc.querySelector(".tdb-bar");if(b)b.hidden=!on;acc._h=null;if(!on)rendre();
    if(on&&navigator.vibrate)try{navigator.vibrate(12)}catch(e){}}
  function ordreDOM(){etat.L=$$(".tdb-g>.w",acc).map(function(el){return [el.dataset.w,el.dataset.t]});etat.p="";garder()}
  /* les autres blocs glissent doucement vers leur nouvelle place (FLIP) */
  function flip(sauf,fn){var els=$$(".tdb-g>.w",acc).filter(function(e){return e!==sauf}),av=els.map(function(e){return e.getBoundingClientRect()});fn();
    els.forEach(function(e,i){var r=e.getBoundingClientRect(),dx=av[i].left-r.left,dy=av[i].top-r.top;if(dx||dy)e.animate([{transform:"translate("+dx+"px,"+dy+"px)"},{transform:"none"}],{duration:420,easing:"cubic-bezier(.2,.7,.2,1)"})})}

  var g=null; // glissé en cours : {el, ox, oy, x, y}
  function place(){if(!g)return;var gr=g.el.offsetParent?g.el.offsetParent.getBoundingClientRect():{left:0,top:0};
    g.el.style.transform="translate("+(g.x-g.ox-gr.left-g.el.offsetLeft)+"px,"+(g.y-g.oy-gr.top-g.el.offsetTop)+"px) scale(1.04)"}
  function debut(el,x,y){var r=el.getBoundingClientRect();g={el:el,ox:x-r.left,oy:y-r.top,x:x,y:y};acc._glisse=1;el.classList.add("glisse");acc.classList.add("glisse-on");place();defile()}
  function bouge(x,y){if(!g)return;g.x=x;g.y=y;g.el.style.pointerEvents="none";var sous=document.elementFromPoint(x,y);g.el.style.pointerEvents="";
    var c=sous&&sous.closest&&sous.closest(".tdb-g>.w");
    if(c&&c!==g.el&&!c._anim){var tous=$$(".tdb-g>.w",acc),i=tous.indexOf(g.el),j=tous.indexOf(c);
      flip(g.el,function(){c.parentNode.insertBefore(g.el,i<j?c.nextSibling:c)});c._anim=1;setTimeout(function(){c._anim=0},300)}
    place()}
  function fin(){if(!g)return;var el=g.el;g=null;acc._glisse=0;el.classList.remove("glisse");acc.classList.remove("glisse-on");
    var t=el.style.transform;el.style.transform="";el.animate([{transform:t},{transform:"none"}],{duration:380,easing:"cubic-bezier(.2,.7,.2,1)"});ordreDOM();acc._h=null}
  // près du haut ou du bas de l'écran, la page défile toute seule
  function defile(){if(!g)return;var v=g.y<90?-8:g.y>innerHeight-110?8:0;if(v){scrollBy(0,v);place()}requestAnimationFrame(defile)}

  var appui=null,bloque=false;
  function prend(e,x,y){var el=e.target.closest&&e.target.closest(".tdb-g>.w");if(!el||e.target.closest(".w-x,.w-s"))return;
    clearTimeout(appui&&appui.t);appui={el:el,x:x,y:y,t:setTimeout(function(){var a=appui;appui=null;if(!a)return;bloque=true;if(!edition)editer(true);debut(a.el,a.x,a.y)},edition?220:550)}}
  function lache(){if(appui){clearTimeout(appui.t);appui=null}fin();if(bloque)setTimeout(function(){bloque=false},350)}
  acc.addEventListener("touchstart",function(e){if(e.touches.length===1)prend(e,e.touches[0].clientX,e.touches[0].clientY)},{passive:true});
  acc.addEventListener("touchmove",function(e){var t=e.touches[0];if(g){e.preventDefault();bouge(t.clientX,t.clientY)}
    else if(appui&&Math.hypot(t.clientX-appui.x,t.clientY-appui.y)>10){clearTimeout(appui.t);appui=null}},{passive:false});
  acc.addEventListener("touchend",lache);acc.addEventListener("touchcancel",lache);
  acc.addEventListener("mousedown",function(e){if(e.button===0)prend(e,e.clientX,e.clientY)});
  addEventListener("mousemove",function(e){if(g)bouge(e.clientX,e.clientY);else if(appui&&Math.hypot(e.clientX-appui.x,e.clientY-appui.y)>6){clearTimeout(appui.t);appui=null}});
  addEventListener("mouseup",lache);
  acc.addEventListener("contextmenu",function(e){if(e.target.closest(".tdb-g>.w"))e.preventDefault()});
  // après un appui long, le relâchement ne doit pas « cliquer » sur ce qu'il y avait sous le doigt
  acc.addEventListener("click",function(e){if(bloque){bloque=false;e.preventDefault();e.stopPropagation();return}
    if(edition&&e.target.closest(".w-in")){e.preventDefault();e.stopPropagation()}},true);

  /* ---------- fenêtre « Ajouter un bloc » : les dispositions toutes prêtes et les blocs retirés ---------- */
  var feuille=document.createElement("div");feuille.className="tdb-f";feuille.hidden=true;document.body.appendChild(feuille);
  function mini(L){return '<span class="mini">'+L.map(function(x){return '<i class="sz-'+x[1]+'"></i>'}).join("")+"</span>"}
  function ouvreFeuille(){var pris=etat.L.map(function(x){return x[0]}),reste=Object.keys(W).filter(function(k){return pris.indexOf(k)<0});
    feuille.innerHTML='<div class="tdb-fd" role="dialog" aria-modal="true" aria-label="Ajouter un bloc"><div class="tdb-fh"><b>Ajouter un bloc</b><button type="button" class="btn" data-ffin>Fermer</button></div>'+
      (reste.length?'<div class="tdb-fl">'+reste.map(function(k){var w=W[k];return '<button type="button" class="tdb-fb" data-fajout="'+k+'"><span class="w-ic">'+IC[w.ic]+"</span><span><b>"+esc(w.n)+(w.opt?' <span class="opt-mini">Option</span>':"")+"</b><small>"+esc(w.d)+'</small></span><span class="pl">'+IC.plus+"</span></button>"}).join("")+"</div>":'<p class="vide">Tous les blocs sont déjà sur votre accueil.</p>')+
      '<div class="tdb-fh2"><b>Ou une disposition toute prête</b><small>Elle remplace la vôtre</small></div><div class="tdb-fp">'+Object.keys(PRESETS).map(function(k){var p=PRESETS[k];
        return '<button type="button" class="tdb-pp'+(etat.p===k?" on":"")+'" data-fpreset="'+k+'">'+mini(p.L)+"<b>"+esc(p.n)+"</b><small>"+esc(p.d)+"</small></button>"}).join("")+"</div></div>";
    feuille.hidden=false;requestAnimationFrame(function(){feuille.classList.add("ouv")})}
  function fermeFeuille(){feuille.classList.remove("ouv");setTimeout(function(){feuille.hidden=true},300)}
  feuille.addEventListener("click",function(e){
    if(e.target===feuille||e.target.closest("[data-ffin]"))return fermeFeuille();
    var a=e.target.closest("[data-fajout]");if(a){var k=a.dataset.fajout;etat.L.push([k,W[k].t[0]]);etat.p="";garder();acc._h=null;rendre();fermeFeuille();
      setTimeout(function(){var n=acc.querySelector('.tdb-g>.w[data-w="'+k+'"]');if(n){n.scrollIntoView({behavior:"smooth",block:"center"});n.classList.add("nouveau")}},320);return}
    var p=e.target.closest("[data-fpreset]");if(p){etat={p:p.dataset.fpreset,L:PRESETS[p.dataset.fpreset].L.slice()};garder();acc._h=null;fermeFeuille();flip(null,rendre)}});

  /* ---------- appuis dans l'accueil ---------- */
  acc.addEventListener("click",function(e){var el;
    if(e.target.closest("[data-tdbperso]"))return editer(true);
    if(e.target.closest("[data-tdbfin]"))return editer(false);
    if(e.target.closest("[data-tdbajout]"))return ouvreFeuille();
    if((el=e.target.closest("[data-wx]"))){var w=el.closest(".w");flip(w,function(){etat.L=etat.L.filter(function(x){return x[0]!==w.dataset.w});etat.p="";garder();acc._h=null;rendre()});return}
    if((el=e.target.closest("[data-ws]"))){var b=el.closest(".w"),T=W[b.dataset.w].t;etat.L.forEach(function(x){if(x[0]===b.dataset.w)x[1]=T[(T.indexOf(x[1])+1)%T.length]});etat.p="";garder();flip(null,function(){acc._h=null;rendre()});return}
    if((el=e.target.closest("[data-mois]"))){acc._mois=+el.dataset.mois;acc._h=null;return rendre()}
    if((el=e.target.closest("[data-jour]"))){acc._jour=el.dataset.jour;acc._h=null;return rendre()}
    if((el=e.target.closest("[data-nv]"))){var q=$$(".pcq button",ancien)[+el.dataset.nv];if(q)q.click();return}
    if((el=e.target.closest("[data-accv]"))){var n=$("#nb-"+el.dataset.accv)||$("#tt-"+el.dataset.accv);if(n)n.click();return}
    if(e.target.closest("[data-accdemo]")){var t=$("#todo [data-open]");if(t)t.click()}
    else if(e.target.closest("[data-acctout]")){var d=$("#nb-devis")||$("#tt-devis");if(d)d.click()}
  });
  addEventListener("keydown",function(e){if(e.key==="Escape"){if(!feuille.hidden)fermeFeuille();else if(edition)editer(false)}});

  // Salutation comme la planche : « Bonsoir » après 18 h, sans point final
  var hello=$("#hello");
  function salut(){if(!hello)return;var t=hello.textContent,n=t.replace(/^Bonjour\b/,new Date().getHours()>=18||new Date().getHours()<5?"Bonsoir":"Bonjour").replace(/\.\s*$/,"");if(n!==t)hello.textContent=n}
  if(hello){salut();new MutationObserver(salut).observe(hello,{childList:true,characterData:true,subtree:true})}
  rendre();
  // vrai.js réécrit sa liste à chaque chargement, et les pastilles des onglets bougent : on suit le mouvement.
  new MutationObserver(plusTard).observe(ancien,{childList:true,subtree:true});
  var etatV=vrai();
  new MutationObserver(function(){var v=vrai();if(v!==etatV){etatV=v;acc._h=null;rendre()}}).observe(document.documentElement,{attributes:true,attributeFilter:["class"]});
  ["#badge","#badge-f","#badge-d"].forEach(function(id){var b=$(id);if(b)new MutationObserver(plusTard).observe(b,{childList:true,characterData:true,subtree:true,attributes:true,attributeFilter:["hidden"]})});
  addEventListener("load",function(){acc._h=null;rendre()});
})();
