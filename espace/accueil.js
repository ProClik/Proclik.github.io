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

  /* Courbe sur 6 mois (exemple de la planche) : encaissé en trait plein, signé en trait fin, détail d'un mois au toucher */
  var GRAPH='<details class="graph"><summary><span>Voir l\'évolution sur 6 mois</span><span class="fl">›</span></summary><div class="leg"><span><i class="l1"></i>Encaissé</span><span><i class="l2"></i>Signé</span></div><svg class="courbe" viewBox="0 0 600 170" role="img" aria-label="Signé et encaissé de mai à octobre"><defs><linearGradient id="gps" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--sig);stop-opacity:.55"/><stop offset="1" style="stop-color:var(--sig);stop-opacity:.02"/></linearGradient><linearGradient id="gpe" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--enc);stop-opacity:.75"/><stop offset=".7" style="stop-color:var(--enc);stop-opacity:.12"/><stop offset="1" style="stop-color:var(--enc);stop-opacity:0"/></linearGradient><filter id="gpo" x="-10%" y="-30%" width="120%" height="160%"><feDropShadow dx="0" dy="-6" stdDeviation="7" flood-color="#000" flood-opacity=".35"/></filter><filter id="gph" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter></defs><line x1="52" x2="576" y1="100.4" y2="100.4" class="grille"/><text x="44" y="103.4" text-anchor="end" class="ax">5 000</text><line x1="52" x2="576" y1="64.8" y2="64.8" class="grille"/><text x="44" y="67.8" text-anchor="end" class="ax">10 000</text><line x1="52" x2="576" y1="29.1" y2="29.1" class="grille"/><text x="44" y="32.1" text-anchor="end" class="ax">15 000</text><line x1="52" x2="576" y1="136" y2="136" class="grille base"/><g class="aire a1"><path d="M52.0,70.5 C69.5,66.5 121.9,45.3 156.8,46.9 C191.7,48.6 226.7,81.1 261.6,80.4 C296.5,79.7 331.5,46.5 366.4,42.7 C401.3,38.9 436.3,58.9 471.2,57.6 C506.1,56.3 558.5,38.6 576.0,34.8 L576.0,136 L52.0,136 Z" fill="url(#gps)"/></g><path class="trace t1" d="M52.0,70.5 C69.5,66.5 121.9,45.3 156.8,46.9 C191.7,48.6 226.7,81.1 261.6,80.4 C296.5,79.7 331.5,46.5 366.4,42.7 C401.3,38.9 436.3,58.9 471.2,57.6 C506.1,56.3 558.5,38.6 576.0,34.8" fill="none" style="stroke:var(--sig)" stroke-width="2" stroke-linecap="round"/><g class="aire a2" filter="url(#gpo)"><path d="M52.0,92.5 C69.5,89.8 121.9,77.5 156.8,76.2 C191.7,74.8 226.7,86.1 261.6,84.7 C296.5,83.3 331.5,68.4 366.4,67.6 C401.3,66.8 436.3,78.6 471.2,79.7 C506.1,80.9 558.5,75.3 576.0,74.4 L576.0,136 L52.0,136 Z" fill="url(#gpe)"/></g><path d="M52.0,92.5 C69.5,89.8 121.9,77.5 156.8,76.2 C191.7,74.8 226.7,86.1 261.6,84.7 C296.5,83.3 331.5,68.4 366.4,67.6 C401.3,66.8 436.3,78.6 471.2,79.7 C506.1,80.9 558.5,75.3 576.0,74.4" fill="none" style="stroke:var(--enc)" stroke-width="6" opacity=".35" filter="url(#gph)"/><path class="trace t2" d="M52.0,92.5 C69.5,89.8 121.9,77.5 156.8,76.2 C191.7,74.8 226.7,86.1 261.6,84.7 C296.5,83.3 331.5,68.4 366.4,67.6 C401.3,66.8 436.3,78.6 471.2,79.7 C506.1,80.9 558.5,75.3 576.0,74.4" fill="none" style="stroke:var(--enc)" stroke-width="3" stroke-linecap="round"/><text x="52.0" y="160" text-anchor="middle" class="ax">Mai</text><text x="156.8" y="160" text-anchor="middle" class="ax">Juin</text><text x="261.6" y="160" text-anchor="middle" class="ax">Juil.</text><text x="366.4" y="160" text-anchor="middle" class="ax">Août</text><text x="471.2" y="160" text-anchor="middle" class="ax">Sept.</text><text x="576.0" y="160" text-anchor="middle" class="ax on">Oct.</text><g class="fin"><circle class="pouls" cx="576.0" cy="74.4" r="7" style="fill:var(--enc)"/><circle cx="576.0" cy="34.8" r="4.5" style="fill:var(--s);stroke:var(--sig)" stroke-width="2.5"/><circle cx="576.0" cy="74.4" r="6" style="fill:var(--enc);stroke:var(--s)" stroke-width="2.5"/><text x="564.0" y="94.4" text-anchor="end" class="val">8 640 €</text><text x="564.0" y="25.8" text-anchor="end" class="val v2">14 210 €</text></g><g class="pt" tabindex="0"><rect x="-0.4" y="22" width="104.8" height="114" fill="transparent"/><line x1="52.0" x2="52.0" y1="22" y2="136" class="guide"/><circle cx="52.0" cy="70.5" r="4" style="fill:var(--s);stroke:var(--sig)" stroke-width="2.5"/><circle cx="52.0" cy="92.5" r="5" style="fill:var(--enc);stroke:var(--s)" stroke-width="2"/><g class="bulle"><rect x="52.0" y="4" width="132" height="52" rx="10"/><text x="64.0" y="21" class="bt">Mai</text><text x="64.0" y="36" class="bs">Signé 9 200 €</text><text x="64.0" y="50" class="be">Encaissé 6 100 €</text></g></g><g class="pt" tabindex="0"><rect x="104.4" y="22" width="104.8" height="114" fill="transparent"/><line x1="156.8" x2="156.8" y1="22" y2="136" class="guide"/><circle cx="156.8" cy="46.9" r="4" style="fill:var(--s);stroke:var(--sig)" stroke-width="2.5"/><circle cx="156.8" cy="76.2" r="5" style="fill:var(--enc);stroke:var(--s)" stroke-width="2"/><g class="bulle"><rect x="90.8" y="4" width="132" height="52" rx="10"/><text x="102.8" y="21" class="bt">Juin</text><text x="102.8" y="36" class="bs">Signé 12 500 €</text><text x="102.8" y="50" class="be">Encaissé 8 400 €</text></g></g><g class="pt" tabindex="0"><rect x="209.2" y="22" width="104.8" height="114" fill="transparent"/><line x1="261.6" x2="261.6" y1="22" y2="136" class="guide"/><circle cx="261.6" cy="80.4" r="4" style="fill:var(--s);stroke:var(--sig)" stroke-width="2.5"/><circle cx="261.6" cy="84.7" r="5" style="fill:var(--enc);stroke:var(--s)" stroke-width="2"/><g class="bulle"><rect x="195.6" y="4" width="132" height="52" rx="10"/><text x="207.6" y="21" class="bt">Juillet</text><text x="207.6" y="36" class="bs">Signé 7 800 €</text><text x="207.6" y="50" class="be">Encaissé 7 200 €</text></g></g><g class="pt" tabindex="0"><rect x="314.0" y="22" width="104.8" height="114" fill="transparent"/><line x1="366.4" x2="366.4" y1="22" y2="136" class="guide"/><circle cx="366.4" cy="42.7" r="4" style="fill:var(--s);stroke:var(--sig)" stroke-width="2.5"/><circle cx="366.4" cy="67.6" r="5" style="fill:var(--enc);stroke:var(--s)" stroke-width="2"/><g class="bulle"><rect x="300.4" y="4" width="132" height="52" rx="10"/><text x="312.4" y="21" class="bt">Août</text><text x="312.4" y="36" class="bs">Signé 13 100 €</text><text x="312.4" y="50" class="be">Encaissé 9 600 €</text></g></g><g class="pt" tabindex="0"><rect x="418.8" y="22" width="104.8" height="114" fill="transparent"/><line x1="471.2" x2="471.2" y1="22" y2="136" class="guide"/><circle cx="471.2" cy="57.6" r="4" style="fill:var(--s);stroke:var(--sig)" stroke-width="2.5"/><circle cx="471.2" cy="79.7" r="5" style="fill:var(--enc);stroke:var(--s)" stroke-width="2"/><g class="bulle"><rect x="405.2" y="4" width="132" height="52" rx="10"/><text x="417.2" y="21" class="bt">Septembre</text><text x="417.2" y="36" class="bs">Signé 11 000 €</text><text x="417.2" y="50" class="be">Encaissé 7 900 €</text></g></g></svg></details>';

  // On ne réécrit l'accueil que s'il change : le graphique ouvert reste ouvert.
  function poser(h){if(acc._h===h)return;acc._h=h;acc.innerHTML=h}

  /* ---------- démo ---------- */
  function demo(){
    var stats='<div class="card stats"><div class="stats-h"><div><small>Encaissé en octobre</small><b>8 640 € <em>HT</em></b></div>'+
      '<svg class="barres" viewBox="0 0 120 52" aria-hidden="true"><g class="b0"><rect x="2" y="22" width="12" height="18" rx="4"/><rect x="22" y="14" width="12" height="26" rx="4"/><rect x="42" y="18" width="12" height="22" rx="4"/><rect x="62" y="10" width="12" height="30" rx="4"/><rect x="82" y="16" width="12" height="24" rx="4"/></g><rect class="b1" x="102" y="4" width="12" height="36" rx="4"/>'+
      '<g class="bm"><text x="8" y="50">M</text><text x="28" y="50">J</text><text x="48" y="50">J</text><text x="68" y="50">A</text><text x="88" y="50">S</text><text x="108" y="50">O</text></g></svg></div>'+
      '<div class="flux"><div><span>Devis envoyés</span><b>9 850 €</b><small>2 sans réponse</small></div><div><span>Signés</span><b>14 210 €</b><small>3 sur 5 · 60 %</small></div>'+
      '<div><span>Facturé</span><b>11 400 €</b><small>ce mois-ci</small></div><div class="cor"><span>À encaisser</span><b>2 760 €</b><small>1 facture</small></div></div>'+
      GRAPH+'<span class="exemple">Chiffres d\'exemple</span></div>';
    var n=+(($("#badge")||{}).textContent||0)||1;
    poser('<div class="acc-g">'+stats+'</div><div class="acc-d">'+tuiles([[n,"à faire ce soir",1],[2,"devis en attente de réponse"],[1,"chantier en cours"]])+
      '<div class="card dem"><div class="dem-h"><div><b>Mme Durand · Grenoble</b><small>Cloisons du séjour</small></div><div class="prix">765,08 € <small>HT</small></div></div>'+
      chaine(7,0)+'<div class="etape-nom"><b>Vérifier le pré-devis</b><span>étape 1 sur 7</span></div>'+
      '<div class="ligne corr"><span>Bâti de porte<span class="cote">730 × 2 040 mm</span></span><span class="q">à vérifier</span></div></div>'+
      bouton(IC_VERIF,"Vérifier le pré-devis","data-accdemo")+
      '<button class="acc-tout" type="button" data-acctout>Toutes les demandes <span>›</span></button></div>');
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
    poser('<div class="acc-d">'+h+"</div>");
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
  function detail(pt){var g=acc.querySelector("details.graph");if(!g)return;var d=g.querySelector(".mois");
    if(!d){d=document.createElement("p");d.className="mois";g.appendChild(d)}
    if(!pt){d.innerHTML="Touchez un mois pour voir le détail.";return}
    var t=[].map.call(pt.querySelectorAll(".bulle text"),function(x){return esc(x.textContent)});
    d.innerHTML="<b>"+t[0]+"</b> · "+t.slice(1).join(" · ")}
  acc.addEventListener("toggle",function(e){if(e.target.matches&&e.target.matches("details.graph")&&e.target.open)detail(null)},true);
  // À l'ouverture du graphique, les courbes se dessinent
  acc.addEventListener("toggle",function(e){var d=e.target;if(!d.matches||!d.matches("details.graph")||!d.open)return;var c=d.querySelector(".courbe");
    c.classList.remove("anime");c.querySelectorAll(".trace").forEach(function(t){var l=t.getTotalLength();t.style.strokeDasharray=l;t.style.strokeDashoffset=l;t.classList.remove("go");void t.getBBox();t.classList.add("go")});
    void c.getBBox();c.classList.add("anime")},true);
  acc.addEventListener("click",function(e){
    if(e.target.closest("[data-accdemo]")){var t=$('#todo [data-open]');if(t)t.click()}
    else if(e.target.closest("[data-acctout]")){var b=$("#nb-devis")||$("#tt-devis");if(b)b.click()}
    var pt=e.target.closest(".courbe .pt");
    if(pt){var on=pt.classList.contains("on");acc.querySelectorAll(".courbe .pt.on").forEach(function(x){x.classList.remove("on")});if(!on)pt.classList.add("on");detail(on?null:pt)}
  });
})();
