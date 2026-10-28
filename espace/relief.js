/* Effets au toucher du style « Relief doux » : l'appui reste visible même sur une touche rapide,
   la flèche du bouton d'action file au relâcher, l'onglet choisi gonfle doucement, petite vibration.
   Android : navigator.vibrate. iPhone (iOS 18 et plus, dans Safari) : léger « tic » en basculant un interrupteur natif invisible. */
(function(){
  "use strict";
  var GROS=".btn,.vbtn",PETIT=".icon-b,.chips button,.nav button,.seg button,.tabs-top button,.week button,.qty button,.dcard,.vcard,.pcq button,.adds button";
  var lab=document.createElement("label"),inp=document.createElement("input");
  inp.type="checkbox";inp.setAttribute("switch","");inp.tabIndex=-1;lab.setAttribute("aria-hidden","true");
  lab.style.cssText="position:fixed;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none";
  lab.appendChild(inp);document.body.appendChild(lab);
  var ios=/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
  function tic(gros){try{if(navigator.vibrate)navigator.vibrate(gros?14:8)}catch(_){}}
  document.addEventListener("touchstart",function(){},{passive:true});
  document.addEventListener("pointerdown",function(e){
    var b=e.target.closest(GROS)||e.target.closest(PETIT);if(!b||b.disabled)return;
    b._gros=b.matches(GROS);b._t=Date.now();b.classList.add("appui");tic(b._gros)});
  function lache(e){
    document.querySelectorAll(".appui").forEach(function(b){
      var ok=e.type==="pointerup"&&b.contains(e.target),reste=Math.max(0,(b._gros?320:480)-(Date.now()-(b._t||0)));
      setTimeout(function(){b.classList.remove("appui");
        if(ok&&b.matches(".btn.go,.vbtn.go")){b.classList.remove("parti");void b.offsetWidth;b.classList.add("parti");setTimeout(function(){b.classList.remove("parti")},2050)}},reste)})}
  document.addEventListener("pointerup",lache);document.addEventListener("pointercancel",lache);
  document.addEventListener("click",function(e){
    var n=e.target.closest(".nav button");
    if(n){document.querySelectorAll(".nav button.vient").forEach(function(x){x.classList.remove("vient")});n.classList.add("vient")}
    if(ios&&(e.target.closest(GROS)||e.target.closest(PETIT))){try{lab.click()}catch(_){}}
  },true);
})();

/* Plus d'emoji : chaque pictogramme devient une icône en trait fin (même dessin que le menu), y compris dans ce qui s'affiche après coup. */
(function(){
  "use strict";
  var P={
    "✓":'<path d="M5 12l5 5 9-10"/>',
    "🎙":'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    "📐":'<path d="M4 4v16h16z"/><path d="M8 12v4h4"/>',
    "📷":'<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    "🔒":'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    "⚠":'<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/>',
    "📲":'<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
    "📄":'<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4"/>',
    "✉":'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    "📎":'<path d="M20 11l-8 8a5 5 0 0 1-7-7l8-8a3.5 3.5 0 0 1 5 5l-8 8a2 2 0 0 1-3-3l7-7"/>',
    "💬":'<path d="M4 5h16v11H9l-5 4z"/>',
    "⏳":'<path d="M7 3h10M7 21h10M8 3v4l4 5 4-5V3M8 21v-4l4-5 4 5v4"/>',
    "🔍":'<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    "📶":'<path d="M4 20v-3M9 20v-7M14 20V9M19 20V4"/>',
    "⛏":'<path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5"/><path d="M14 6a6 6 0 0 1 6 6v3M4 15v-3a6 6 0 0 1 6-6"/><rect x="2" y="15" width="20" height="4" rx="1"/>',
    "📁":'<path d="M3 6h6l2 2h10v11H3z"/>',
    "⏱":'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M10 2h4"/>',
    "📦":'<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>',
    "☰":'<path d="M4 7h16M4 12h16M4 17h16"/>',
    "📵":'<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M3 3l18 18"/>',
    "📞":'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
    "🧾":'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
    "🏭":'<path d="M3 21V10l6 4v-4l6 4V6h6v15z"/>',
    "🪪":'<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M14 10h4M14 14h4M6 16h6"/>',
    "📥":'<path d="M3 13h5l2 3h4l2-3h5"/><path d="M3 13l3-8h12l3 8v6H3z"/>',
    "👉":'<path d="M5 12h14M13 6l6 6-6 6"/>',
    "🖼":'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
    "👋":""};
  var RE=new RegExp("("+Object.keys(P).join("|")+")️?","g"),SAUF=/^(SCRIPT|STYLE|TEXTAREA|INPUT|OPTION|TITLE|svg|text|tspan)$/;
  function icone(k){if(!P[k])return null;var s=document.createElement("span");s.className="ri";s.setAttribute("aria-hidden","true");
    s.innerHTML='<svg viewBox="0 0 24 24">'+P[k]+"</svg>";return s}
  function texte(n){var t=n.nodeValue;RE.lastIndex=0;if(!RE.test(t))return;var p=n.parentNode;if(!p||SAUF.test(p.nodeName)||p.closest("svg"))return;
    var f=document.createDocumentFragment(),i=0;t.replace(RE,function(m,k,at){if(at>i)f.appendChild(document.createTextNode(t.slice(i,at)));var s=icone(k);if(s)f.appendChild(s);i=at+m.length;return m});
    if(i<t.length)f.appendChild(document.createTextNode(t.slice(i)));p.replaceChild(f,n)}
  function passe(r){if(r.nodeType===3)return texte(r);if(r.nodeType!==1||SAUF.test(r.nodeName))return;
    var w=document.createTreeWalker(r,NodeFilter.SHOW_TEXT),a=[],n;while((n=w.nextNode()))a.push(n);a.forEach(texte)}
  passe(document.body);
  new MutationObserver(function(M){M.forEach(function(m){if(m.type==="characterData")texte(m.target);else m.addedNodes.forEach(passe)})})
    .observe(document.body,{childList:true,subtree:true,characterData:true});
})();
