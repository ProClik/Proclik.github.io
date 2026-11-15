/* Démo ProClik menuiserie (négoce) : outils communs (jour/nuit, logo, icônes, mémoire partagée entre les pages de la démo). */
(function(){
  var K='pc-theme';
  function get(){try{return localStorage.getItem(K)}catch(e){return null}}
  var t=get();if(t)document.documentElement.setAttribute('data-theme',t);
  window.PCD={};
  PCD.toggleTheme=function(){
    var d=document.documentElement,cur=d.getAttribute('data-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
    var n=cur==='dark'?'light':'dark';d.setAttribute('data-theme',n);try{localStorage.setItem(K,n)}catch(e){}
    document.querySelectorAll('[data-theme-ic]').forEach(function(b){b.innerHTML=PCD.ic(n==='dark'?'sun':'moon')});
  };
  PCD.themeIc=function(){var d=document.documentElement.getAttribute('data-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');return PCD.ic(d==='dark'?'sun':'moon')};
  PCD.logo='<svg viewBox="16 -1.5 80 92" aria-hidden="true"><path d="M30.50 44.50A25.50 25.50 0 1 1 81.50 44.50A25.50 25.50 0 1 1 30.50 44.50ZM63.73 62.22A19.34 19.34 0 1 0 48.27 62.22A3.92 3.92 0 0 0 53.76 58.63L53.76 55.71A2.24 2.24 0 0 1 58.24 55.71L58.24 58.63A3.92 3.92 0 0 0 63.73 62.22Z" fill="var(--nuit)"/><circle cx="56" cy="42.82" r="4.71" fill="var(--laiton)"/></svg>';
  var P={
    devis:'M6 3h8l4 4v6M14 3v4h4M6 3v18h6M13 20l1-3 5-5 2 2-5 5z',
    chart:'M4 20V10M10 20V4M16 20v-7M22 20H2',
    folder:'M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z',
    car:'M5 16l1.5-5A2 2 0 0 1 8.4 9.5h7.2a2 2 0 0 1 1.9 1.5L19 16M4 16h16v3H4zM7 19v1.5M17 19v1.5M7.5 13.5h.01M16.5 13.5h.01',
    brief:'M3 8h18v12H3zM9 8V5h6v3M3 13h18',
    monitor:'M3 4h18v12H3zM8 20h8M12 16v4',
    helmet:'M4 16a8 8 0 0 1 16 0zM2 16h20v2H2zM12 8v3M9 5.6V9M15 5.6V9',
    user:'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
    gift:'M3 9h18v4H3zM5 13v8h14v-8M12 9v12M12 9C9 9 7 5 9.5 4.5S12 9 12 9zM12 9c3 0 5-4 2.5-4.5S12 9 12 9z',
    pay:'M3 6h18v12H3zM3 10h18M7 15h4',
    thumb:'M7 11v9H4v-9zM7 11l4-8a2 2 0 0 1 3 2l-1 5h6a2 2 0 0 1 2 2.3l-1.4 7A2 2 0 0 1 17.6 21H7',
    trophy:'M8 4h8v5a4 4 0 0 1-8 0zM8 6H4a3 3 0 0 0 4 4M16 6h4a3 3 0 0 1-4 4M12 13v4M8 21h8M9 17h6',
    lock:'M6 11h12v10H6zM8 11V8a4 4 0 0 1 8 0v3',
    unlock:'M6 11h12v10H6zM8 11V8a4 4 0 0 1 7.5-2',
    plan:'M3 3h18v18H3zM3 12h8M11 3v13M15 12h6M15 12v9',
    ruler:'M3 17L17 3l4 4L7 21zM7 13l2 2M10 10l2 2M13 7l2 2',
    hammer:'M14 4l6 6-3 3-6-6zM11 7L3 15l3 3 8-8',
    phone:'M5 3h4l2 5-3 2a11 11 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z',
    map:'M9 4L3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14',
    key:'M15 8a4 4 0 1 1-2.8 6.8L6 21H3v-3l6.2-6.2A4 4 0 0 1 15 8z',
    sign:'M3 17c3-3 5 2 8-1s3-6 6-3M3 21h18',
    users:'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21v-1a6 6 0 0 1 12 0v1M17 11a3 3 0 1 0 0-6M22 21v-1a5 5 0 0 0-4-4.9',
    image:'M4 5h16v14H4zM4 15l4-4 4 4 3-3 5 5M15 9h.01',
    list:'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
    undo:'M9 14L4 9l5-5M4 9h11a5 5 0 0 1 0 10h-3',
    trash:'M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14',
    left:'M15 18l-6-6 6-6',right:'M9 18l6-6-6-6',
    euro2:'M17 6a7 7 0 1 0 0 12M4 10h9M4 14h9',
    insta:'M4 4h16v16H4zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM17 7h.01',
    sparks:'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6',
    home:'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
    box:'M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10',
    team:'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21v-1a6 6 0 0 1 12 0v1M16 3.5a4 4 0 0 1 0 7.5M18 14a5 5 0 0 1 4 5v2',
    chat:'M4 5h16v11H9l-5 4z',
    cal:'M4 6h16v15H4zM4 10h16M8 3v4M16 3v4',
    gear:'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
    stock:'M3 21V9l9-6 9 6v12M7 21v-7h10v7M7 17h10',
    alert:'M12 3l10 18H2zM12 10v5M12 18h.01',
    clock:'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
    sun:'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
    moon:'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',
    check:'M5 12.5l4.5 4.5L19 7',
    x:'M6 6l12 12M18 6L6 18',
    arrow:'M5 12h14M13 6l6 6-6 6',
    back:'M19 12H5M11 6l-6 6 6 6',
    doc:'M6 2h9l5 5v15H6zM14 2v6h6M9 13h8M9 17h8',
    shield:'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
    cam:'M4 8h3l2-3h6l2 3h3v12H4zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    mic:'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3',
    chip:'M7 7h10v10H7zM10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4',
    cog2:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1L7 17M17 7l2.1-2.1',
    robot:'M5 9h14v10H5zM12 4v5M9 13h.01M15 13h.01M9 16h6M2 13v3M22 13v3',
    eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    truck:'M2 6h12v10H2zM14 10h4l3 3v3h-7M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
    euro:'M17 6a7 7 0 1 0 0 12M4 10h9M4 14h9',
    pin:'M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12zM12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
    bell:'M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 21h4',
    plus:'M12 5v14M5 12h14',
    send:'M3 11l18-8-8 18-2-8z',
    wrench:'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z',
    idea:'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3z',
    clip:'M21 11l-8.5 8.5a5 5 0 0 1-7-7L14 4a3.5 3.5 0 0 1 5 5l-8.5 8.5a2 2 0 0 1-3-3L15 7'
  };
  /* Mêmes dessins que l'Espace BRS (Cyril 15/11 : « vérifie le moindre icône ») : pour une même chose, la même icône partout.
     Un dessin qui commence par « < » est repris tel quel de l'Espace (espace/index.html, accueil.js, chantiers.js…). */
  var BRS={
    home:'<path d="M4 11l8-6 8 6v8H4z"/>',
    users:'<circle cx="9" cy="8" r="3.5"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.6a6 6 0 0 1 3 5.4"/>',
    cal:'<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
    devis:'<path d="M13 21H6V3h8l4 4v4"/><path d="M14 3v4h4M9 9h4M9 13h3"/><path d="M19.5 13.5l-5.5 5.5-.6 2.6 2.6-.6 5.5-5.5z"/>',
    facture:'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
    depense:'<path d="M4 7.5h15a1.5 1.5 0 0 1 1.5 1.5v9.5A1.5 1.5 0 0 1 19 20H5.5A1.5 1.5 0 0 1 4 18.5z"/><path d="M4 7.5V6a2 2 0 0 1 2-2h10.5v3.5"/><path d="M16 13.8h1.5"/>',
    chantier:'<path d="M3 20h7M6 20V10l6-4 5 3.4"/><g transform="translate(10.6 10.4) scale(.56)"><path vector-effect="non-scaling-stroke" d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5"/><path vector-effect="non-scaling-stroke" d="M14 6a6 6 0 0 1 6 6v3"/><path vector-effect="non-scaling-stroke" d="M4 15v-3a6 6 0 0 1 6-6"/><rect vector-effect="non-scaling-stroke" x="2" y="15" width="20" height="4" rx="1"/></g>',
    achat:'<path d="M4 6h2l2 10h10l2-7H7"/><circle cx="9" cy="20" r="1"/><circle cx="17" cy="20" r="1"/>',
    box:'<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>',
    cotes:'<circle cx="10" cy="12" r="7"/><circle cx="10" cy="12" r="2"/><path d="M17 15h4v3h-11"/>',
    reglages:'<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
    mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    moon:'<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    truck:'<path d="M3 16V6h11v10M14 9h4l3 3.5V16h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
    clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/>',
    chart:'<path d="M4 20V10M10 20V5M16 20v-7M21 20H3"/>',
    euro:'<path d="M17 6.5A6.5 6.5 0 1 0 17 17.5"/><path d="M4 10h9M4 14h9"/>',
    plan:'<path d="M4 4h16v16H4z"/><path d="M4 12h7V4M11 16v4M15 12h5"/>',
    doc:'<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 12h7M9 16h5"/>',
    cam:'<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    phone:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
    pin:'<circle cx="12" cy="10" r="3"/><path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z"/>',
    send:'<path d="M3 11l18-8-8 18-2-8z"/><path d="M11 13l10-10"/>',
    check:'<path d="M5 12l5 5 9-10"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    lock:'<rect x="5" y="11" width="14" height="9" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    list:'<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
    trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/><path d="M10 11v6M14 11v6"/>',
    search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    idea:'<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
    sign:'<path d="M4 17c2.5 0 3-6 5-6s1.5 5 3.5 5 2-3 3.5-3 1.5 2 4 2"/><path d="M4 21h16"/>',
    user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    menu:'<path d="M5 7h14M5 12h14M5 17h14"/>',
    route:'<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h6a4 4 0 0 0 0-8h-4a4 4 0 0 1 0-8h6"/>'
  };
  BRS.ruler=BRS.cotes;BRS.team=BRS.users;BRS.gear=BRS.reglages;BRS.euro2=BRS.euro;BRS.stock=BRS.box;
  for(var k in BRS)P[k]=BRS[k];
  PCD.ic=function(n){var v=P[n]||P.box;return '<svg class="i" viewBox="0 0 24 24">'+(v.charAt(0)==='<'?v:'<path d="'+v+'"/>')+'</svg>'};
  /* mémoire partagée de la démo (formulaire → Espace, salarié → encadrant) : tout reste dans ce navigateur */
  var SK='pcd-vlx-v1';
  PCD.load=function(){try{return JSON.parse(localStorage.getItem(SK)||'null')}catch(e){return null}};
  PCD.save=function(s){try{localStorage.setItem(SK,JSON.stringify(s))}catch(e){}};
})();
