/* Accueil de l'Espace façon planche « Relief doux » : les chiffres, trois tuiles, la demande en cours avec ses étapes, un seul gros bouton.
   Démo : exemples fictifs, signalés comme tels. Vraies demandes (vrai.js) : on relit la liste gardée sur l'appareil à chaque mise à jour,
   le bloc des chiffres reste un exemple fictif, signalé « Chiffres d'exemple », tant que l'argent ne vient pas de GHL. */
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

  /* Où en est la demande : 3 grandes étapes que tout le monde comprend (Devis › Chantier › Facture),
     puis en clair ce qu'il faut faire maintenant et ce qui vient ensuite. (Cyril, 2/11 : les chiffres 1 à 7 ne parlaient à personne.) */
  var IC_ET=['<svg viewBox="0 0 24 24"><path d="M13 21H6V3h8l4 4v4"/><path d="M14 3v4h4M9 9h4M9 13h3"/><path d="M19.5 13.5l-5.5 5.5-.6 2.6 2.6-.6 5.5-5.5z"/></svg>',
    '<svg viewBox="0 0 24 24"><path d="M3 20h18M6 20V10l6-4 6 4v10"/><path d="M10 20v-5h4v5"/></svg>',
    '<svg viewBox="0 0 24 24"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/></svg>'];
  var OK='<svg viewBox="0 0 24 24"><path d="M5 12l5 5 9-10"/></svg>';
  function phase(nom){nom=String(nom||"");return /factur|pay|solde|termin|clos/i.test(nom)?2:/chantier|accept|sign|acompte|travaux|planif/i.test(nom)?1:0}
  function parcours(p,maint,ensuite){
    return '<div class="parc" role="img" aria-label="Étape en cours : '+["devis","chantier","facture"][p]+'">'+["Devis","Chantier","Facture"].map(function(t,k){
      return (k?'<i class="parc-l'+(k<=p?" fait":"")+'"></i>':"")+'<span class="parc-e'+(k<p?" fait":k===p?" ici":"")+'"><span class="parc-ic">'+(k<p?OK:IC_ET[k])+"</span><b>"+t+"</b></span>"}).join("")+"</div>"+
      '<div class="parc-tx"><span>Maintenant</span><b>'+esc(maint)+"</b>"+(ensuite?"<small>Ensuite : "+esc(ensuite)+"</small>":"")+"</div>"}
  function bouton(ic,txt,attr){return '<button class="btn go acc-go" type="button" '+attr+'><span class="lab"><span class="ic">'+ic+"</span><span>"+esc(txt)+"</span></span></button>"}

  /* Courbe sur 6 mois (exemple de la planche) : encaissé en trait plein, signé en trait fin, détail d'un mois au toucher */
  var GRAPH='<div class="graph"><div class="leg"><b>6 derniers mois</b><span><i class="l1"></i>Encaissé</span><span><i class="l2"></i>Signé</span></div><svg class="courbe" viewBox="0 0 600 170" role="img" aria-label="Signé et encaissé de mai à octobre"><defs><linearGradient id="gps" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--sig);stop-opacity:.55"/><stop offset="1" style="stop-color:var(--sig);stop-opacity:.02"/></linearGradient><linearGradient id="gpe" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--enc);stop-opacity:.75"/><stop offset=".7" style="stop-color:var(--enc);stop-opacity:.12"/><stop offset="1" style="stop-color:var(--enc);stop-opacity:0"/></linearGradient><filter id="gpo" x="-10%" y="-30%" width="120%" height="160%"><feDropShadow dx="0" dy="-6" stdDeviation="7" flood-color="#000" flood-opacity=".35"/></filter><filter id="gph" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter></defs><line x1="52" x2="576" y1="100.4" y2="100.4" class="grille"/><text x="44" y="103.4" text-anchor="end" class="ax">5 000</text><line x1="52" x2="576" y1="64.8" y2="64.8" class="grille"/><text x="44" y="67.8" text-anchor="end" class="ax">10 000</text><line x1="52" x2="576" y1="29.1" y2="29.1" class="grille"/><text x="44" y="32.1" text-anchor="end" class="ax">15 000</text><line x1="52" x2="576" y1="136" y2="136" class="grille base"/><g class="aire a1"><path d="M52.0,70.5 C69.5,66.5 121.9,45.3 156.8,46.9 C191.7,48.6 226.7,81.1 261.6,80.4 C296.5,79.7 331.5,46.5 366.4,42.7 C401.3,38.9 436.3,58.9 471.2,57.6 C506.1,56.3 558.5,38.6 576.0,34.8 L576.0,136 L52.0,136 Z" fill="url(#gps)"/></g><path class="trace t1" d="M52.0,70.5 C69.5,66.5 121.9,45.3 156.8,46.9 C191.7,48.6 226.7,81.1 261.6,80.4 C296.5,79.7 331.5,46.5 366.4,42.7 C401.3,38.9 436.3,58.9 471.2,57.6 C506.1,56.3 558.5,38.6 576.0,34.8" fill="none" style="stroke:var(--sig)" stroke-width="2" stroke-linecap="round"/><g class="aire a2" filter="url(#gpo)"><path d="M52.0,92.5 C69.5,89.8 121.9,77.5 156.8,76.2 C191.7,74.8 226.7,86.1 261.6,84.7 C296.5,83.3 331.5,68.4 366.4,67.6 C401.3,66.8 436.3,78.6 471.2,79.7 C506.1,80.9 558.5,75.3 576.0,74.4 L576.0,136 L52.0,136 Z" fill="url(#gpe)"/></g><path d="M52.0,92.5 C69.5,89.8 121.9,77.5 156.8,76.2 C191.7,74.8 226.7,86.1 261.6,84.7 C296.5,83.3 331.5,68.4 366.4,67.6 C401.3,66.8 436.3,78.6 471.2,79.7 C506.1,80.9 558.5,75.3 576.0,74.4" fill="none" style="stroke:var(--enc)" stroke-width="6" opacity=".35" filter="url(#gph)"/><path class="trace t2" d="M52.0,92.5 C69.5,89.8 121.9,77.5 156.8,76.2 C191.7,74.8 226.7,86.1 261.6,84.7 C296.5,83.3 331.5,68.4 366.4,67.6 C401.3,66.8 436.3,78.6 471.2,79.7 C506.1,80.9 558.5,75.3 576.0,74.4" fill="none" style="stroke:var(--enc)" stroke-width="3" stroke-linecap="round"/><text x="52.0" y="160" text-anchor="middle" class="ax">Mai</text><text x="156.8" y="160" text-anchor="middle" class="ax">Juin</text><text x="261.6" y="160" text-anchor="middle" class="ax">Juil.</text><text x="366.4" y="160" text-anchor="middle" class="ax">Août</text><text x="471.2" y="160" text-anchor="middle" class="ax">Sept.</text><text x="576.0" y="160" text-anchor="middle" class="ax on">Oct.</text><g class="fin"><circle class="pouls" cx="576.0" cy="74.4" r="7" style="fill:var(--enc)"/><circle cx="576.0" cy="34.8" r="4.5" style="fill:var(--s);stroke:var(--sig)" stroke-width="2.5"/><circle cx="576.0" cy="74.4" r="6" style="fill:var(--enc);stroke:var(--s)" stroke-width="2.5"/><text x="564.0" y="94.4" text-anchor="end" class="val">8 640 €</text><text x="564.0" y="25.8" text-anchor="end" class="val v2">14 210 €</text></g><g class="pt" tabindex="0"><rect x="-0.4" y="22" width="104.8" height="114" fill="transparent"/><line x1="52.0" x2="52.0" y1="22" y2="136" class="guide"/><circle cx="52.0" cy="70.5" r="4" style="fill:var(--s);stroke:var(--sig)" stroke-width="2.5"/><circle cx="52.0" cy="92.5" r="5" style="fill:var(--enc);stroke:var(--s)" stroke-width="2"/><g class="bulle"><rect x="52.0" y="4" width="132" height="52" rx="10"/><text x="64.0" y="21" class="bt">Mai</text><text x="64.0" y="36" class="bs">Signé 9 200 €</text><text x="64.0" y="50" class="be">Encaissé 6 100 €</text></g></g><g class="pt" tabindex="0"><rect x="104.4" y="22" width="104.8" height="114" fill="transparent"/><line x1="156.8" x2="156.8" y1="22" y2="136" class="guide"/><circle cx="156.8" cy="46.9" r="4" style="fill:var(--s);stroke:var(--sig)" stroke-width="2.5"/><circle cx="156.8" cy="76.2" r="5" style="fill:var(--enc);stroke:var(--s)" stroke-width="2"/><g class="bulle"><rect x="90.8" y="4" width="132" height="52" rx="10"/><text x="102.8" y="21" class="bt">Juin</text><text x="102.8" y="36" class="bs">Signé 12 500 €</text><text x="102.8" y="50" class="be">Encaissé 8 400 €</text></g></g><g class="pt" tabindex="0"><rect x="209.2" y="22" width="104.8" height="114" fill="transparent"/><line x1="261.6" x2="261.6" y1="22" y2="136" class="guide"/><circle cx="261.6" cy="80.4" r="4" style="fill:var(--s);stroke:var(--sig)" stroke-width="2.5"/><circle cx="261.6" cy="84.7" r="5" style="fill:var(--enc);stroke:var(--s)" stroke-width="2"/><g class="bulle"><rect x="195.6" y="4" width="132" height="52" rx="10"/><text x="207.6" y="21" class="bt">Juillet</text><text x="207.6" y="36" class="bs">Signé 7 800 €</text><text x="207.6" y="50" class="be">Encaissé 7 200 €</text></g></g><g class="pt" tabindex="0"><rect x="314.0" y="22" width="104.8" height="114" fill="transparent"/><line x1="366.4" x2="366.4" y1="22" y2="136" class="guide"/><circle cx="366.4" cy="42.7" r="4" style="fill:var(--s);stroke:var(--sig)" stroke-width="2.5"/><circle cx="366.4" cy="67.6" r="5" style="fill:var(--enc);stroke:var(--s)" stroke-width="2"/><g class="bulle"><rect x="300.4" y="4" width="132" height="52" rx="10"/><text x="312.4" y="21" class="bt">Août</text><text x="312.4" y="36" class="bs">Signé 13 100 €</text><text x="312.4" y="50" class="be">Encaissé 9 600 €</text></g></g><g class="pt" tabindex="0"><rect x="418.8" y="22" width="104.8" height="114" fill="transparent"/><line x1="471.2" x2="471.2" y1="22" y2="136" class="guide"/><circle cx="471.2" cy="57.6" r="4" style="fill:var(--s);stroke:var(--sig)" stroke-width="2.5"/><circle cx="471.2" cy="79.7" r="5" style="fill:var(--enc);stroke:var(--s)" stroke-width="2"/><g class="bulle"><rect x="405.2" y="4" width="132" height="52" rx="10"/><text x="417.2" y="21" class="bt">Septembre</text><text x="417.2" y="36" class="bs">Signé 11 000 €</text><text x="417.2" y="50" class="be">Encaissé 7 900 €</text></g></g></svg><p class="mois">Touchez un mois pour voir le détail.</p></div>';

  // On ne réécrit l'accueil que s'il change : le graphique ouvert reste ouvert.
  function poser(h){if(acc._h===h)return;acc._h=h;acc.innerHTML=h}

  /* ---------- démo ---------- */
  // Chiffres d'exemple (demandés par Cyril aussi sur ses vraies demandes, tant que l'argent ne vient pas de GHL) : toujours signalés comme tels
  function chiffres(){return '<div class="card stats"><div class="stats-h"><div><small>Encaissé en octobre</small><b>8 640 € <em>HT</em></b></div><span class="exemple">Chiffres d\'exemple</span></div>'+
      GRAPH+
      '<div class="flux"><div><span>Devis envoyés</span><b>9 850 €</b><small>2 sans réponse</small></div><div><span>Signés</span><b>14 210 €</b><small>3 sur 5 · 60 %</small></div>'+
      '<div><span>Facturé</span><b>11 400 €</b><small>ce mois-ci</small></div><div class="cor"><span>À encaisser</span><b>2 760 €</b><small>1 facture</small></div></div></div>';}

  /* ---------- « À faire » : un bloc par type de document, une icône, le nombre en pastille rouge ----------
     Chaque bloc dit CE QUE c'est (pré-devis, facture, dépense…) et CE QU'IL FAUT FAIRE (à valider, à envoyer, à ranger, à suivre).
     Un bloc à zéro ne s'affiche pas (règle de Cyril : aucun bloc inutile). Toucher un bloc ouvre le bon onglet. */
  var I=function(p){return '<svg viewBox="0 0 24 24" aria-hidden="true">'+p+"</svg>"};
  var ICB={predevis:I('<path d="M13 21H6V3h8l4 4v4"/><path d="M14 3v4h4M9 9h4M9 13h3"/><path d="M19.5 13.5l-5.5 5.5-.6 2.6 2.6-.6 5.5-5.5z"/>'),
    facture:I('<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/>'),
    attente:I('<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/>'),
    fournisseur:I('<path d="M3 16V6h11v10M14 9h4l3 3.5V16h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>'),
    depense:I('<path d="M4 7.5h15a1.5 1.5 0 0 1 1.5 1.5v9.5A1.5 1.5 0 0 1 19 20H5.5A1.5 1.5 0 0 1 4 18.5z"/><path d="M4 7.5V6a2 2 0 0 1 2-2h10.5v3.5"/><path d="M16 13.8h1.5"/>'),
    chantier:I('<path d="M3 20h18M6 20V10l6-4 6 4v10"/><path d="M10 20v-5h4v5"/>')};
  // [nombre, icône, quoi, action, type d'action, onglet, détail]
  function blocs(L){L=L.filter(function(x){return x[0]>0});
    if(!L.length)return '<div class="card afa-rien"><b>Tout est à jour</b><span>Rien à valider ni à envoyer. Le café peut rester chaud.</span></div>';
    var n=L.reduce(function(s,x){return s+(x[4]==="suivre"?0:x[0])},0);
    return '<div class="afa-h"><h2>À faire</h2>'+(n?'<span>'+n+(n>1?" documents demandent":" document demande")+" votre attention</span>":"")+'</div><div class="afa">'+L.map(function(x){
      return '<button class="afa-b t-'+x[4]+'" type="button" data-accv="'+x[5]+'"><span class="afa-ic">'+ICB[x[1]]+'<i>'+x[0]+'</i></span><span class="afa-tx"><b>'+esc(x[2])+'</b><em>'+esc(x[3])+"</em>"+(x[6]?"<small>"+esc(x[6])+"</small>":"")+"</span></button>"}).join("")+"</div>"}
  function nbBadge(id){var b=$(id);return b&&!b.hidden?+b.textContent||0:0}
  function pl(n,un,plusieurs){return n>1?plusieurs:un}

  function demo(){
    var X=window.PCX||{},D=X.D||[],CH=X.CH||{};
    var av=nbBadge("#badge")||D.filter(function(d){return d.statut==="todo"}).length;
    var fo=D.filter(function(d){return d.statut==="warn"}).length;
    var sr=D.filter(function(d){return d.statut==="sent"}).length;
    var ch=Object.keys(CH).filter(function(k){return CH[k].st==="run"}).length;
    var h=blocs([[av,"predevis",pl(av,"Pré-devis","Pré-devis"),"à valider","valider","devis","Mme Durand · Cloisons du séjour"],
      [nbBadge("#badge-f"),"facture",pl(nbBadge("#badge-f"),"Facture","Factures"),"à envoyer","envoyer","factures","préparée pour vous"],
      [fo,"fournisseur","Prix fournisseur",fo>1?"ont changé":"a changé","valider","devis","M. Martin · 2 fenêtres PVC"],
      [nbBadge("#badge-d"),"depense",pl(nbBadge("#badge-d"),"Dépense","Dépenses"),"à ranger","ranger","depenses","ticket sans chantier"],
      [sr,"attente",pl(sr,"Devis envoyé","Devis envoyés"),"sans réponse","suivre","devis",""],
      [ch,"chantier",pl(ch,"Chantier","Chantiers"),"en cours","suivre","chantiers",""]]);
    h+='<div class="card dem"><div class="dem-h"><div><small class="urg">Le plus urgent</small><b>Mme Durand · Grenoble</b><small>Cloisons du séjour</small></div><div class="prix">765,08 € <small>HT</small></div></div>'+
      parcours(0,"Vérifier le pré-devis","le devis est prêt à envoyer au client")+
      '<div class="ligne corr"><span>Bâti de porte<span class="cote">730 × 2 040 mm</span></span><span class="q">à vérifier</span></div></div>'+
      bouton(IC_VERIF,"Vérifier le pré-devis","data-accdemo")+
      '<button class="acc-tout" type="button" data-acctout>Toutes les demandes <span>›</span></button>';
    poser('<div class="acc-g">'+chiffres()+'</div><div class="acc-d">'+h+"</div>");
  }

  /* ---------- vraies demandes ---------- */
  function vrai(){
    var L=null;try{L=JSON.parse(localStorage.getItem("pc-vrai-liste")||"null")}catch(e){}
    var D=(L&&L.demandes)||[],E=(L&&L.etapes)||[],val=function(d){return /valider/i.test(d.etape||"")},four=function(d){return /fournisseur/i.test(d.etape||"")};
    var a=D.filter(val),f=D.filter(function(d){return !val(d)&&four(d)}),o=D.filter(function(d){return !val(d)&&!four(d)}),d=a[0]||null;
    var h=L?blocs([[a.length,"predevis","Pré-devis","à valider","valider","devis",a[0]?a[0].client:""],
      [f.length,"fournisseur","Prix fournisseur","attendu"+(f.length>1?"s":""),"suivre","devis",f[0]?f[0].client:""],
      [nbBadge("#badge-d"),"depense",pl(nbBadge("#badge-d"),"Dépense","Dépenses"),"à ranger","ranger","depenses",""],
      [o.length,"attente",pl(o.length,"Autre demande","Autres demandes"),"en cours","suivre","devis",""]]):"";
    if(!L)h+='<div class="card dem"><p class="vide">Chargement de vos demandes…</p></div>';
    else if(d){var i=-1,n=E.length;E.forEach(function(e,k){if(i<0&&(e===d.etape||(e&&(e.id===d.etape_id||e.nom===d.etape))))i=k});
      h+='<div class="card dem"><div class="dem-h"><div><small class="urg">Le plus urgent</small><b>'+esc(d.client)+"</b><small class=\"resume\">"+esc(d.resume||d.titre||"")+"</small></div>"+
        (d.total_ht!=null?'<div class="prix">'+eur(d.total_ht)+" <small>HT</small></div>":"")+"</div>"+
        parcours(phase(d.etape),"Vérifier le pré-devis",i>=0&&E[i+1]?(E[i+1].nom||E[i+1]):"")+
        (d.a_verifier?'<div class="ligne corr"><span>'+(d.a_verifier>1?d.a_verifier+" lignes":"1 ligne")+' à vérifier</span><span class="q">à vérifier</span></div>':"")+"</div>"+
        bouton(IC_VERIF,"Vérifier le pré-devis",'data-vc="'+esc(d.contact||"")+'"')}
    if(D.length)h+='<button class="acc-tout" type="button" data-acctout>Toutes les demandes <span>'+D.length+" ›</span></button>";
    poser('<div class="acc-g">'+chiffres()+'</div><div class="acc-d">'+h+"</div>");
  }

  function rendre(){var ib=$("#instb"),co=$("#vco");if(ib)ib.remove();if(co)co.remove();document.documentElement.classList.contains("pcvrai")?vrai():demo();
    if(co)acc.lastElementChild.appendChild(co);if(ib)acc.lastElementChild.appendChild(ib)}
  // Salutation comme la planche : « Bonsoir » après 18 h, sans point final
  var hello=$("#hello");
  function salut(){if(!hello)return;var t=hello.textContent,n=t.replace(/^Bonjour\b/,new Date().getHours()>=18||new Date().getHours()<5?"Bonsoir":"Bonjour").replace(/\.\s*$/,"");if(n!==t)hello.textContent=n}
  if(hello){salut();new MutationObserver(salut).observe(hello,{childList:true,characterData:true,subtree:true})}
  rendre();
  // vrai.js réécrit sa liste (#va) à chaque chargement : on suit le mouvement.
  new MutationObserver(function(){clearTimeout(rendre._t);rendre._t=setTimeout(rendre,60)}).observe(ancien,{childList:true,subtree:true});
  var etat=document.documentElement.classList.contains("pcvrai");
  new MutationObserver(function(){var v=document.documentElement.classList.contains("pcvrai");if(v!==etat){etat=v;rendre()}}).observe(document.documentElement,{attributes:true,attributeFilter:["class"]});
  // Détail d'un mois touché, écrit en clair sous la courbe (la bulle du dessin serait trop petite sur téléphone)
  function detail(pt){var d=acc.querySelector(".graph .mois");if(!d)return;
    if(!pt){d.innerHTML="Touchez un mois pour voir le détail.";return}
    var t=[].map.call(pt.querySelectorAll(".bulle text"),function(x){return esc(x.textContent)});
    d.innerHTML="<b>"+t[0]+"</b> · "+t.slice(1).join(" · ")}
  // Le graphique est toujours visible : les courbes se dessinent une fois, quand l'accueil s'affiche
  function dessiner(){var c=acc.querySelector(".courbe");if(!c||c._vu||!c.getBoundingClientRect().width)return;c._vu=1;
    c.querySelectorAll(".trace").forEach(function(t){var l=t.getTotalLength();t.style.strokeDasharray=l;t.style.strokeDashoffset=l;t.classList.add("go")});c.classList.add("anime")}
  // Les pastilles des onglets (factures, dépenses…) sont posées par les scripts suivants : on suit leurs changements.
  ["#badge","#badge-f","#badge-d"].forEach(function(id){var b=$(id);if(b)new MutationObserver(function(){clearTimeout(rendre._t);rendre._t=setTimeout(rendre,60)}).observe(b,{childList:true,characterData:true,subtree:true,attributes:true,attributeFilter:["hidden"]})});
  var poser0=poser;poser=function(h){poser0(h);setTimeout(dessiner,80)};rendre();
  document.addEventListener("click",function(e){var t=e.target.closest&&e.target.closest('[role=tab][data-v="accueil"]');if(t)setTimeout(dessiner,120)});
  acc.addEventListener("click",function(e){
    var v=e.target.closest("[data-accv]");if(v){var n=$("#nb-"+v.getAttribute("data-accv"))||$("#tt-"+v.getAttribute("data-accv"));if(n)n.click();return}
    if(e.target.closest("[data-accdemo]")){var t=$('#todo [data-open]');if(t)t.click()}
    else if(e.target.closest("[data-acctout]")){var b=$("#nb-devis")||$("#tt-devis");if(b)b.click()}
    var pt=e.target.closest(".courbe .pt");
    if(pt){var on=pt.classList.contains("on");acc.querySelectorAll(".courbe .pt.on").forEach(function(x){x.classList.remove("on")});if(!on)pt.classList.add("on");detail(on?null:pt)}
  });
})();
