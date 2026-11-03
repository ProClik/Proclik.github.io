/* Titres de section des onglets (Devis, Factures, Clients, Chantiers, Planning, Achats, Dépenses…) au même dessin que les blocs de l'Accueil :
   une petite icône dans un creux + le titre (Cyril, 3/11). L'icône est choisie d'après les mots du titre ; marche aussi pour ce qui s'affiche après coup. */
(function(){
  "use strict";
  var I=function(p){return '<svg viewBox="0 0 24 24" aria-hidden="true">'+p+"</svg>"};
  var ICONES=[
    [/pré-devis|devis/i,'<path d="M13 21H6V3h8l4 4v4"/><path d="M14 3v4h4M9 9h4M9 13h3"/><path d="M19.5 13.5l-5.5 5.5-.6 2.6 2.6-.6 5.5-5.5z"/>'],
    [/factur|payée|paiement|reçues/i,'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/>'],
    [/fournisseur|commande|livraison/i,'<path d="M3 16V6h11v10M14 9h4l3 3.5V16h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>'],
    [/chantier|vue d.ensemble/i,'<path d="M3 20h18M6 20V10l6-4 6 4v10"/><path d="M10 20v-5h4v5"/>'],
    [/agenda|planifier|vendredi|lundi|mardi|mercredi|jeudi|samedi|dimanche|janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre/i,'<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M8 3v4M16 3v4M4 10h16"/>'],
    [/ranger|frais|dépense/i,'<path d="M4 7.5h15a1.5 1.5 0 0 1 1.5 1.5v9.5A1.5 1.5 0 0 1 19 20H5.5A1.5 1.5 0 0 1 4 18.5z"/><path d="M4 7.5V6a2 2 0 0 1 2-2h10.5v3.5"/><path d="M16 13.8h1.5"/>'],
    [/tarif|prix|mise.? à jour/i,'<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/>'],
    [/à faire|attente/i,'<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/>'],
    [/document/i,'<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4"/>']];
  var DEF='<path d="M5 6h14M5 12h14M5 18h9"/>';
  function pose(h){if(h.dataset.ti||h.closest("#v-accueil,.tdb"))return;h.dataset.ti="1";
    var t=h.textContent||"",p=DEF;for(var i=0;i<ICONES.length;i++)if(ICONES[i][0].test(t)){p=ICONES[i][1];break}
    var s=document.createElement("span");s.className="ti-ic";s.innerHTML=I(p);h.insertBefore(s,h.firstChild);h.classList.add("ti")}
  function tout(r){[].forEach.call((r||document).querySelectorAll(".sec-h>h2"),pose)}
  var st=document.createElement("style");
  st.textContent=".sec-h>h2.ti{display:flex;align-items:center;gap:10px}"+
    ".ti-ic{display:grid;place-items:center;width:30px;height:30px;flex:none;border-radius:50%;background:var(--cx);box-shadow:var(--in);color:var(--muted)}"+
    ".ti-ic svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}";
  document.head.appendChild(st);
  tout();
  new MutationObserver(function(ms){ms.forEach(function(m){m.addedNodes.forEach(function(n){if(n.nodeType===1){if(n.matches&&n.matches(".sec-h>h2"))pose(n);else tout(n)}})})}).observe(document.body,{childList:true,subtree:true});
})();
