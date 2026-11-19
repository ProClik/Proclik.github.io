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
  var hello=null;
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
    entretien:I('<rect x="3" y="5" width="18" height="8" rx="2.5"/><path d="M6.5 10h11"/><path d="M8 16.5c0 1.3-1 1.6-1 3M12 16.5c0 1.3-1 1.6-1 3M16 16.5c0 1.3-1 1.6-1 3"/>'),
    grille:I('<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>')};

  /* ---------- les blocs disponibles : nom, tailles possibles (s petit 1×1, m large 2×1, l grand 2×2, h haut 1×2) ---------- */
  var W={
    point:{n:"Le point du jour",d:"Votre journée en quelques mots, et la chose à faire en premier",t:["m"],ic:"verif"},
    jour:{n:"Ma journée",d:"Vos rendez-vous du jour, avec le bouton pour y aller (le soir : demain)",t:["l","m"],ic:"agenda"},
    chiffres:{n:"Mes chiffres du mois",d:"Les quatre chiffres du mois sur une seule bande",t:["m"],ic:"argent"},
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
  /* « Matin et soir » (Cyril, 19/11) : l'accueil change tout seul avec l'heure.
     Le matin : ma journée d'abord (rendez-vous + Y aller). Le soir : ce qu'il reste à valider, puis demain. */
  var AUTO={matin:[["point","m"],["afaire","m"],["jour","l"],["chiffres","m"],["chantiers","m"],["nouveau","m"]],
    soir:[["point","m"],["afaire","m"],["jour","l"],["chiffres","m"],["chantiers","m"],["nouveau","m"]]};
  var forceM=(location.search.match(/[?&]moment=(matin|soir)/)||[])[1];
  function moment(){if(forceM)return forceM;var h=new Date().getHours();return h>=17||h<4?"soir":"matin"}
  var PRESETS={
    auto:{n:"Matin et soir",d:"Le matin votre journée, le soir ce qu'il reste à valider. Change tout seul avec l'heure",L:AUTO.matin},
    a:{n:"Atelier",d:"Le plus urgent et l'agenda en haut, les chiffres au milieu",L:[["urgent","l"],["agenda","m"],["encaisse","s"],["afaire","h"],["argent","l"],["signes","s"],["aencaisser","s"],["envoyes","s"],["chantiers","m"],["nouveau","m"]]},
    b:{n:"Chiffres d'abord",d:"Quatre chiffres en tête, puis le graphique et ce qu'il reste à faire",L:[["encaisse","s"],["signes","s"],["aencaisser","s"],["envoyes","s"],["argent","l"],["afaire","l"],["urgent","l"],["agenda","m"],["chantiers","m"]]},
    c:{n:"Ma journée",d:"L'agenda du jour et l'urgent côte à côte, l'argent plus bas",L:[["urgent","l"],["agenda","l"],["afaire","h"],["chantiers","m"],["encaisse","s"],["nouveau","m"],["aencaisser","s"],["argent","m"],["signes","s"],["envoyes","s"]]}
  };

  /* ---------- ce qui est enregistré ---------- */
  var CLE="pc-tdb1",essai=(location.search.match(/[?&]accueil=([abc]|auto)/)||[])[1];
  function lire(){if(essai)return {p:essai,L:PRESETS[essai].L.slice()};
    try{var o=JSON.parse(localStorage.getItem(CLE)||"null");if(o&&o.L&&o.L.length!=null)return {p:o.p||"",L:o.L.filter(function(x){return W[x[0]]&&W[x[0]].t.indexOf(x[1])>=0})}}catch(e){}
    return {p:"auto",L:AUTO.matin.slice()}}
  var etat=lire();
  function liste(){return etat.p==="auto"?AUTO[moment()]:etat.L}
  function fige(){if(etat.p==="auto")etat.L=AUTO[moment()].map(function(x){return x.slice()})}
  function garder(){if(essai)return;try{localStorage.setItem(CLE,JSON.stringify(etat))}catch(e){}}

  /* ---------- données (démo ou vraies demandes) ---------- */
  function nbBadge(id){var b=$(id);return b&&!b.hidden?+b.textContent||0:0}
  var pl=function(n,un,plus){return n>1?plus:un};
  /* Contrats d'entretien (entretiens.js) : « Entretien à prévoir » */
  function entRow(){var P=window.PCENT;if(!P||!P.on())return [0];var L=P.urgents();return [L.length,"entretien",pl(L.length,"Entretien","Entretiens"),"à prévoir","valider","entretiens",L[0]?L[0].nom:""]}
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
        entRow(),
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
        entRow(),
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
    var tu=moment()==="soir"?"À valider ce soir":"Le plus urgent";
    if(!D.charge)return tete("verif",tu)+'<p class="vide">Chargement de vos demandes…</p>';
    if(!u)return tete("verif",tu)+'<div class="w-rien"><b>Tout est à jour</b><span>'+(moment()==="soir"?"Rien à valider ce soir. Les pieds sous la table, c'est mérité.":"Rien à valider ni à envoyer. Le café peut rester chaud.")+'</span></div>';
    return '<div class="w-h urg"><small>'+(moment()==="soir"?"À valider ce soir":"Le plus urgent")+'</small>'+(u.prix!=null?'<span class="prix">'+eur(u.prix)+" <small>HT</small></span>":"")+"</div>"+
      '<div class="u-qui"><b>'+esc(u.qui)+"</b><small>"+esc(u.quoi)+"</small></div>"+
      (t==="l"?parcours(u.phase):"")+
      '<div class="parc-tx"><span>Maintenant</span><b>Vérifier le pré-devis</b>'+(u.ensuite&&t==="l"?"<small>Ensuite : "+esc(u.ensuite)+"</small>":"")+"</div>"+
      (u.ligne&&t==="l"?'<div class="ligne corr"><span>'+esc(u.ligne[0])+(u.ligne[1]?'<span class="cote">'+esc(u.ligne[1])+"</span>":"")+'</span><span class="q">à vérifier</span></div>':"")+
      bouton("verif","Vérifier le pré-devis",u.attr)};
  R.afaire=function(t,D){var L=D.afaire.filter(function(x){return x[0]>0}),max=t==="m"?3:t==="h"?4:5;
    var n=L.reduce(function(s,x){return s+(x[4]==="suivre"?0:x[0])},0);
    var h=tete("predevis","À faire",n?'<span class="w-n">'+n+"</span>":"");
    if(!D.charge)return h+'<p class="vide">Chargement…</p>';
    if(!L.length)return h+'<div class="w-rien"><b>Tout est à jour</b><span>Rien à valider ni à envoyer.</span></div>';
    return h+'<div class="af">'+L.slice(0,max).map(function(x){
      return '<button class="af-b t-'+x[4]+' i-'+x[1]+'" type="button" data-accv="'+x[5]+'"><span class="afa-ic">'+IC[x[1]]+"<i>"+x[0]+'</i></span><span class="afa-tx"><b>'+esc(x[2])+'</b><small><em>'+esc(x[3])+"</em>"+(x[6]?" · "+esc(x[6]):"")+"</small></span>"+'<span class="af-f">›</span></button>'}).join("")+
      (L.length>max?'<button class="af-plus" type="button" data-accv="devis">Et '+(L.length-max)+" autre"+(L.length-max>1?"s":"")+" ›</button>":"")+"</div>"};
  /* Encaissé par mois (exemple) : de simples barres, faciles à lire d'un coup d'œil */
  var MOIS=[["Mai","mai",6100,9200],["Juin","juin",8400,12500],["Juil.","juillet",7200,7800],["Août","août",9600,13100],["Sept.","septembre",7900,11000],["Oct.","octobre",8640,14210]];
  R.argent=function(t){var sel=acc._mois==null?5:acc._mois,m=MOIS[sel],max=10000,moy=MOIS.reduce(function(s,x){return s+x[2]},0)/MOIS.length;
    var ev=sel>0?Math.round((m[2]-MOIS[sel-1][2])/MOIS[sel-1][2]*100):null;
    return tete("argent","Chiffre d'affaires")+
      '<div class="ar"><div class="ar-c"><small>Encaissé en '+m[1]+'</small><b>'+eur0(m[2])+' <em>HT</em></b>'+
      (ev!=null?'<span class="ar-ev'+(ev<0?" bas":"")+'">'+(ev<0?"▾ ":"▴ ")+Math.abs(ev)+" % par rapport à "+MOIS[sel-1][1]+"</span>":"")+
      (t==="l"?'<span class="ar-s">Signé en '+m[1]+" : <b>"+eur0(m[3])+"</b></span>":"")+"</div>"+
      '<div class="bars" role="group" aria-label="Encaissé des 6 derniers mois">'+
      
      MOIS.map(function(x,k){return '<button type="button" data-pk class="bar'+(k===sel?" on":"")+(k===5?" cour":"")+'" data-mois="'+k+'" aria-label="'+x[1]+" : "+eur0(x[2])+'"><span class="bar-v">'+(x[2]/1000).toLocaleString("fr-FR",{maximumFractionDigits:1})+' k</span><span class="bar-f"><span style="height:'+(x[2]/max*100).toFixed(1)+'%"></span></span><span class="bar-m">'+x[0]+"</span></button>"}).join("")+
      "</div></div>"};
  /* Agenda : la semaine en pastilles, puis les rendez-vous du jour choisi (exemple du Planning) */
  var JS=["Lun","Mar","Mer","Jeu","Ven","Sam"],KN={ent:"Entretien",run:"Chantier",plan:"Chantier prévu",done:"Chantier",visit:"Visite",pc:"Point ProClik",free:"Libre"};
  function evs(iso){var E=(window.PCX&&PCX.EV)||[];return E.filter(function(e){return e.d===iso&&e.k!=="free"}).sort(function(a,b){return a.s<b.s?-1:1})}
  var iso=function(d){return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2)};
  R.agenda=function(t){var auj=new Date(2026,9,16),lun=new Date(auj);lun.setDate(auj.getDate()-((auj.getDay()+6)%7));
    var sel=acc._jour||iso(auj),j=[],k;for(k=0;k<6;k++){var d=new Date(lun);d.setDate(lun.getDate()+k);j.push(d)}
    var ds=new Date(sel+"T12:00:00"),L=evs(sel),max=t==="m"?1:3;
    return tete("agenda",ds.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"}).replace(/^./,function(c){return c.toUpperCase()}))+
      '<div class="ag-j">'+j.map(function(d,k){var s=iso(d),n=evs(s).length;return '<button type="button" class="ag-d'+(s===sel?" on":"")+(s===iso(auj)?" auj":"")+'" data-jour="'+s+'"><small>'+JS[k]+"</small><b>"+d.getDate()+"</b>"+(n?"<i></i>":"<i class=\"vide\"></i>")+"</button>"}).join("")+"</div>"+
      '<div class="ag-l">'+(L.length?L.slice(0,max).map(function(e){return '<div class="ag-e k-'+e.k+'"><span class="ag-h">'+e.s.replace(":"," h ")+'</span><span class="ag-t"><b>'+esc(e.t)+"</b><small>"+esc(e.w)+"</small></span></div>"}).join("")+
        (L.length>max&&t!=="m"?'<button type="button" class="af-plus" data-accv="planning">Et '+(L.length-max)+" autre"+(L.length-max>1?"s":"")+" ›</button>":""):'<p class="vide">Rien de prévu ce jour-là.</p>')+"</div>"};
  /* « Ma journée » : la journée en ligne de temps, un bouton « Y aller » par adresse ; le soir, la prochaine journée prévue */
  var AUJ=function(){return new Date(2026,9,16)};
  function hm(s){var p=String(s||"").split(":");return (+p[0]||0)*60+(+p[1]||0)}
  function hTxt(s){var p=String(s||"").split(":");return (+p[0])+"\u00a0h"+(p[1]&&p[1]!=="00"?"\u00a0"+p[1]:"")}
  function lieu(e){return String(e.w||"").split(" · ")[0].trim()}
  function prochain(){var d=new Date(AUJ());for(var k=0;k<10;k++){d.setDate(d.getDate()+1);if(evs(iso(d)).length)return d}return null}
  /* une icône par moment de la journée (Cyril, 19/11) : café pour commencer, fournisseur, chantier, visite… */
  var JI={cafe:I('<path d="M5 10h11v4.5A4.5 4.5 0 0 1 11.5 19h-2A4.5 4.5 0 0 1 5 14.5z"/><path d="M16 11.5h1.5a2.2 2.2 0 0 1 0 4.4H16"/><path d="M8.5 3.5c-.6 1 .6 1.8 0 3M12 3.5c-.6 1 .6 1.8 0 3"/>'),
    liv:IC.fournisseur,run:IC.chantier,plan:IC.chantier,done:IC.chantier,
    visit:I('<circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5"/>'),
    pc:I('<path d="M5 5h14v10H10l-4 4v-4H5z"/>'),devis:IC.predevis,ent:IC.entretien||IC.chantier,autre:IC.agenda,st:IC.chantier,
    fin:I('<path d="M4 11l8-6 8 6v8H4z"/><path d="M10 19v-5h4v5"/>')};
  function jli(cl,ico,hh,b,sm,extra){return '<li class="jr-e '+cl+'"><span class="jr-h">'+hh+'</span><span class="jr-p" aria-hidden="true">'+ico+'</span><span class="jr-t">'+(extra||"")+"<b>"+b+"</b><small>"+sm+"</small></span></li>"}
  R.jour=function(t){var soir=moment()==="soir",d=soir?prochain():AUJ(),L=d?evs(iso(d)):[],max=t==="m"?2:4;
    var dem=d&&soir&&iso(d)===iso(new Date(AUJ().getTime()+864e5)),nom=d?d.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"}):"";
    var titre=soir?(dem?"Demain":"Prochaine journée"):"Ma journée",sous=soir?nom:"";
    var now=new Date(),nm=now.getHours()*60+now.getMinutes(),ic=-1;
    if(!soir)L.forEach(function(e,k){if(ic<0&&hm(e.e||e.s)>nm)ic=k});
    var h=tete("agenda",titre,sous?'<span class="w-sub">'+esc(sous)+"</span>":(L.length?'<span class="w-sub">'+L.length+" rendez-vous</span>":""));
    if(!L.length)return h+'<div class="w-rien"><b>'+(soir?"Rien de prévu pour l'instant":"Rien de prévu aujourd'hui")+"</b><span>"+(soir?"Un créneau tout neuf à offrir à un client.":"Une journée pour avancer les devis. Ou le rangement du camion.")+"</span></div>"+
      '<button type="button" class="af-plus" data-accv="planning">Ouvrir le planning ›</button>';
    return h+'<ol class="jr">'+jli("k-cafe"+(!soir&&(ic>0||ic<0)?" passe":""),JI.cafe,"","Un café, et c'est parti",soir?"Pour bien commencer demain":"La journée commence")+L.slice(0,max).map(function(e,k){var l=lieu(e),go=!soir&&l&&e.k!=="pc";
      return '<li class="jr-e k-'+e.k+(k===ic?" ici":"")+(!soir&&ic>=0&&k<ic?" passe":"")+'"><span class="jr-h">'+hTxt(e.s)+'</span><span class="jr-p" aria-hidden="true">'+(JI[e.k]||IC.agenda)+'</span><span class="jr-t">'+(k===ic?'<em class="jr-n">'+(hm(e.s)<=nm?"En ce moment":"Ensuite")+"</em>":"")+"<b>"+esc(e.t)+"</b><small>"+esc(e.w||KN[e.k]||"")+"</small></span>"+
        (go?'<button type="button" class="jr-go" data-gps="'+esc(l)+'" aria-label="Y aller : '+esc(l)+'"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11.5L20 4l-7.5 16-2-6.5z"/></svg><span>Y aller</span></button>':"")+"</li>"}).join("")+(L.length<=max?jli("k-fin",JI.fin,"","Fin de journée","On range les outils, et à demain"):"")+"</ol>"+
      (L.length>max?'<button type="button" class="af-plus" data-accv="planning">Et '+(L.length-max)+" autre"+(L.length-max>1?"s":"")+" ›</button>":'<button type="button" class="af-plus" data-accv="planning">Tout le planning ›</button>')};
  /* « Le point du matin / du soir » : la journée racontée en deux phrases, un petit mot léger, et la seule chose à faire en premier */
  R.point=function(t,D){var P=acc._pt||{},u=D.urgent,soir=moment()==="soir";
    return '<div class="pt"><div class="pt-h"><span class="pt-ic">'+(soir?LUNE:SOLEIL)+"</span><small>"+(soir?"Le point du soir":"Le point du matin")+"</small></div>"+
      '<p class="pt-t">'+(P.html||"")+"</p>"+(P.mot?'<p class="pt-mot">'+esc(P.mot)+"</p>":"")+
      (u?'<button type="button" class="pt-go" '+u.attr+'><span><small>'+(soir?"À valider ce soir":"Pour commencer")+" · "+esc(String(u.qui).split(" · ")[0])+'</small><b>Vérifier le pré-devis</b></span><i aria-hidden="true">→</i></button>':"")+"</div>"};
  /* « Mes chiffres du mois » : les quatre chiffres sur une seule bande, touchez-en un pour le détail */
  R.chiffres=function(){var C=[["Encaissé","8 640 €","factures",0],["Signés","14 210 €","devis",0],["À encaisser","2 760 €","factures",1],["Envoyés","9 850 €","devis",0]];
    return tete("argent","Mes chiffres d'octobre",'<span class="w-sub">HT</span>')+'<div class="cm">'+C.map(function(x){return '<button type="button" class="cm-c" data-accv="'+x[2]+'"><small>'+x[0]+"</small><b"+(x[3]?' class="cor"':"")+">"+x[1]+"</b></button>"}).join("")+"</div>"};
  R.chantiers=function(t){var CH=(window.PCX&&PCX.CH)||{},av=(window.PCX&&PCX.avc)||function(){return 0};
    var L=Object.keys(CH).map(function(k){return CH[k]}).filter(function(c){return c.st==="run"||c.st==="start"}).slice(0,t==="m"?2:4);
    return tete("chantier","Chantiers en cours")+(L.length?'<div class="ch">'+L.map(function(c){var p=av(c);
      return '<button type="button" class="ch-b" data-accv="chantiers"><span class="ch-t"><b>'+esc(c.n)+"</b><small>"+esc(c.v)+" · "+esc(c.dates||"")+'</small></span><span class="ch-p">'+(p?'<span class="ch-o" style="--p:'+p+'"><em>'+p+' %</em></span><span class="ch-o-t">avancé</span>':'<span class="ch-o-t z">à démarrer</span>')+"</span></button>"}).join("")+"</div>":'<p class="vide">Aucun chantier en cours.</p>')};
  R.nouveau=function(t){if(t==="s")return tete("plan","Nouveau")+'<button type="button" class="nv-1" data-nv="0"><span class="nv-ic">'+IC.plan+"</span><b>Nouveau pré-devis</b></button>";
    return tete("plan","Nouveau pré-devis",'<span class="w-sub">3 façons, au choix</span>')+'<div class="nv">'+
      [["plan","Plan et cotes","Tracez la pièce"],["micro","Dicter","Parlez, ça s'écrit"],["photo","Photo des notes","Votre feuille papier"]].map(function(x,k){return '<button type="button" data-nv="'+k+'"><span class="nv-ic">'+IC[x[0]]+"</span><span class=\"nv-t\"><b>"+x[1]+"</b><small>"+x[2]+"</small></span></button>"}).join("")+"</div>"};
  /* Petites tuiles : le titre en haut, le chiffre bien visible, et une petite tendance en bas (barres des 6 mois, ou part d'un total) */
  function spark(k){var max=Math.max.apply(null,MOIS.map(function(x){return x[k]}));
    return '<span class="tu-sp" aria-hidden="true">'+MOIS.map(function(x,i){return '<i'+(i===5?' class="on"':"")+' style="height:'+Math.max(12,x[k]/max*100).toFixed(0)+'%"></i>'}).join("")+"</span>"}
  function part(p,txt){return '<span class="tu-pa" aria-hidden="true"><span><i style="width:'+p+'%"></i></span><small>'+txt+"</small></span>"}
  function tuile(ic,titre,val,sous,v,cor,bas){return function(){return '<button type="button" class="tu" data-accv="'+v+'"><span class="tu-h"><span class="w-ic">'+IC[ic]+"</span><small>"+titre+'</small></span><b'+(cor?' class="cor"':"")+">"+val+"</b><em>"+sous+"</em>"+bas()+"</button>"}}
  R.encaisse=tuile("argent","Encaissé","8 640 €","HT · en octobre","factures",0,function(){return spark(2)});
  R.signes=tuile("signe","Devis signés","14 210 €","3 sur 5 · 60 %","devis",0,function(){return spark(3)});
  R.aencaisser=tuile("facture","À encaisser","2 760 €","1 facture","factures",1,function(){return part(24,"24 % du facturé")});
  R.envoyes=tuile("attente","Devis envoyés","9 850 €","2 sans réponse","devis",0,function(){return part(40,"2 sur 5 en attente")});
  R.reseaux=function(t){var tag=window.PCTAG?PCTAG("reseaux"):"";
    return tag+(t==="s"?'<button type="button" class="tu op" data-accv="reseaux"><small>Prochaine publication</small><b>jeu. 22/10</b><em>2 messages à lire</em></button>':
      '<button type="button" class="op-b" data-accv="reseaux"><span class="op-t"><small>Prochaine publication · jeu. 22/10 à 18 h</small><b>Avant / après : salle de bain à Échirolles</b></span><span class="op-n"><i>2</i>messages à lire</span></button>')};
  R.avis=function(t){var tag=window.PCTAG?PCTAG("avis"):"";
    return tag+'<div class="av"><b>4,8 <span class="et">★★★★★</span></b><small>23 avis'+(t==="m"?" · dernier : « Travail propre, délais tenus »":"")+"</small></div>"};

  /* ---------- la grille ---------- */
  var edition=false;
  function bloc(x,D){var w=W[x[0]];return '<section class="w sz-'+x[1]+(w.opt?" w-opt":"")+'" data-w="'+x[0]+'" data-t="'+x[1]+'" aria-label="'+esc(w.n)+'">'+
      '<div class="w-in">'+R[x[0]](x[1],D)+"</div>"+
      '<button type="button" class="w-x" data-wx aria-label="Retirer le bloc '+esc(w.n)+'">'+IC.moins+"</button>"+
      (w.t.length>1?'<button type="button" class="w-s" data-ws aria-label="Changer la taille du bloc '+esc(w.n)+'">'+IC.taille+"</button>":"")+"</section>"}
  function rendre(){if(acc._glisse)return;var D=donnees();bonjour(D);
    var h='<p class="tdb-ex">'+(D.demo?"Chiffres d'exemple":"Chiffres, agenda et chantiers d'exemple")+"</p>"+'<div class="tdb-bar" '+(edition?"":"hidden")+'><div><b>Personnaliser l\'accueil</b><small>Gardez le doigt sur un bloc pour le déplacer</small></div><button type="button" class="btn" data-tdbajout>'+IC.plus+' Ajouter un bloc</button><button type="button" class="btn go" data-tdbfin>Terminé</button></div>'+
      '<div class="tdb-g">'+liste().map(function(x){return bloc(x,D)}).join("")+"</div>"+
      '<div class="tdb-pied">'+(D.total?'<button class="acc-tout" type="button" data-acctout>Toutes les demandes <span>'+(D.demo?"":D.total+" ")+"›</span></button>":"")+
      '<button type="button" class="tdb-perso" data-tdbperso>'+IC.grille+"<span>Personnaliser l'accueil</span></button></div>";
    if(acc._h===h)return;acc._h=h;var ib=$("#instb"),co=$("#vco");acc.innerHTML=h;acc.classList.toggle("edite",edition);
    if(co)acc.insertBefore(co,acc.firstChild);if(ib)acc.appendChild(ib)}
  function plusTard(){clearTimeout(rendre._t);rendre._t=setTimeout(rendre,60)}

  /* ---------- mode « personnaliser » ---------- */
  // sans tout redessiner : le bloc sous le doigt doit rester le même pour pouvoir le glisser tout de suite
  function editer(on){if(on)fige();edition=on;acc.classList.toggle("edite",on);var b=acc.querySelector(".tdb-bar");if(b)b.hidden=!on;acc._h=null;if(!on)rendre();
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
    if((el=e.target.closest("[data-accv=entretiens]"))){var tc=$("#nb-clients")||$("#tt-clients");if(tc)tc.click();var sg=$('[data-clseg="ent"]');if(sg)sg.click();return}
    if((el=e.target.closest("[data-accv]"))){var n=$("#nb-"+el.dataset.accv)||$("#tt-"+el.dataset.accv);if(n)n.click();return}
    if(e.target.closest("[data-accdemo]")){var t=$("#todo [data-open]");if(t)t.click()}
    else if(e.target.closest("[data-acctout]")){var d=$("#nb-devis")||$("#tt-devis");if(d)d.click()}
  });
  addEventListener("keydown",function(e){if(e.key==="Escape"){if(!feuille.hidden)fermeFeuille();else if(edition)editer(false)}});

  /* ---------- le bloc « Bonjour » : la date, la journée en une phrase vraie, et un petit mot léger ---------- */
  var hello0=$("#hello"),hero=document.createElement("div");hero.className="acc-bj";
  if(hello0){hello0.parentNode.insertBefore(hero,hello0);hero.innerHTML='<span class="bj-ic" aria-hidden="true"></span><div class="bj-c"><small class="bj-d"></small><div class="bj-h"></div><p class="bj-r"></p><p class="bj-mot"></p></div>';
    hero.querySelector(".bj-h").appendChild(hello0);var ph=$("#phrase");if(ph)ph.classList.add("bj-cache")}
  var SOLEIL='<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></svg>',
    LUNE='<svg viewBox="0 0 24 24"><path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z"/></svg>';
  var MOTS={matin:["Le café d'abord, l'Espace s'occupe du reste.","Belle journée sur les chantiers. On garde la boutique.","Un bon chantier commence toujours par un bon café.","La paperasse attendra ce soir. Elle a l'habitude."],
    soir:["Encore quelques minutes et la journée est bouclée.","Les pieds sous la table, les devis en deux clics.","Dernier coup d'œil, et rideau.","La journée est faite. On boucle ça vite et bien."]};
  function liste2(a){return a.length>1?a.slice(0,-1).join(", ")+" et "+a[a.length-1]:a[0]||""}
  function bonjour(D){if(!hello0)return;var m=moment(),soir=m==="soir",j=AUJ(),L=evs(iso(j)),nv=0,a=[];
    (D.afaire||[]).forEach(function(x){if(x[4]!=="suivre")nv+=x[0]});
    var ch=L.filter(function(e){return /run|plan/.test(e.k)}).length,vi=L.filter(function(e){return e.k==="visit"});
    var r;
    if(soir){if(nv)a.push(nv+" chose"+(nv>1?"s":"")+" à valider");var p=prochain(),pl2=p?evs(iso(p)):[];
      r=(a.length?"Ce soir : "+liste2(a)+".":"Ce soir : rien à valider.")+(pl2.length?" "+(iso(p)===iso(new Date(j.getTime()+864e5))?"Demain":p.toLocaleDateString("fr-FR",{weekday:"long"}).replace(/^./,function(c){return c.toUpperCase()}))+" : "+pl2[0].t+" à "+hTxt(pl2[0].s)+".":"")}
    else{if(ch)a.push(ch+" chantier"+(ch>1?"s":""));if(vi.length)a.push(vi.length===1?"1 visite à "+hTxt(vi[0].s):vi.length+" visites");if(nv)a.push(nv+" chose"+(nv>1?"s":"")+" à valider");
      r=a.length?"Aujourd'hui : "+liste2(a)+".":"Aujourd'hui : rien de prévu, tout est à jour."}
    var mo=MOTS[m];if(!nv&&!L.length)mo=[soir?"Tout est à jour. Le canapé vous attend.":"Rien d'urgent. Le café peut rester chaud."];
    var jd=Math.floor((Date.now()-new Date(new Date().getFullYear(),0,1))/864e5);
    hero.classList.toggle("soir",soir);
    hero.querySelector(".bj-ic").innerHTML=soir?LUNE:SOLEIL;
    hero.querySelector(".bj-d").textContent=j.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"});
    hero.querySelector(".bj-r").textContent=r;hero.querySelector(".bj-mot").textContent=mo[jd%mo.length];
    var B=function(x){return "<b>"+esc(x)+"</b>"},ev=function(e){return (e.k==="visit"?e.t.replace(/^Visite\s*/,"la visite chez "):e.k==="liv"?"la "+e.t.replace(/^Livraison/,"livraison"):e.t)},h2;
    var nvTx=nv?B(nv+" chose"+(nv>1?"s":""))+" attend"+(nv>1?"ent":"")+" votre œil.":"Rien n'attend votre validation.";
    if(soir){var pp=prochain(),Lp=pp?evs(iso(pp)):[],qd=pp?(iso(pp)===iso(new Date(j.getTime()+864e5))?"Demain":pp.toLocaleDateString("fr-FR",{weekday:"long"}).replace(/^./,function(c){return c.toUpperCase()})):"";
      h2=(nv?B(nv+" chose"+(nv>1?"s":""))+" à valider ce soir, quelques minutes suffisent.":"Rien à valider ce soir.")+(Lp.length?" "+qd+", vous commencez à "+B(hTxt(Lp[0].s))+" : "+B(ev(Lp[0]))+".":"")}
    else{h2=L.length?"Vous commencez à "+B(hTxt(L[0].s))+" : "+B(ev(L[0]))+(L[1]?", puis "+B(ev(L[1]))+" à "+B(hTxt(L[1].s)):"")+". "+nvTx:"Rien de prévu au planning aujourd'hui. "+nvTx}
    acc._pt={html:h2,mot:mo[jd%mo.length]};acc.classList.toggle("acc-pro",etat.p==="auto");document.documentElement.classList.toggle("acc-pro-on",etat.p==="auto");salut()}
  // Salutation comme la planche : « Bonsoir » après 18 h, sans point final
  hello=$("#hello");
  function salut(){if(!hello)return;var hh=new Date().getHours(),t=hello.textContent,n=t.replace(/^Bon(jour|soir)\b/,(forceM?forceM==="soir":hh>=18||hh<5)?"Bonsoir":"Bonjour").replace(/\.\s*$/,"");if(n!==t)hello.textContent=n}
  if(hello){salut();new MutationObserver(salut).observe(hello,{childList:true,characterData:true,subtree:true})}
  rendre();
  // vrai.js réécrit sa liste à chaque chargement, et les pastilles des onglets bougent : on suit le mouvement.
  document.addEventListener("pc-ent",function(){acc._h=null;plusTard()});
  new MutationObserver(plusTard).observe(ancien,{childList:true,subtree:true});
  var etatV=vrai();
  new MutationObserver(function(){var v=vrai();if(v!==etatV){etatV=v;acc._h=null;rendre()}}).observe(document.documentElement,{attributes:true,attributeFilter:["class"]});
  ["#badge","#badge-f","#badge-d"].forEach(function(id){var b=$(id);if(b)new MutationObserver(plusTard).observe(b,{childList:true,characterData:true,subtree:true,attributes:true,attributeFilter:["hidden"]})});
  addEventListener("load",function(){acc._h=null;rendre()});
})();
