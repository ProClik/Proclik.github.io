/* Couleurs du Planning, comme les calendriers de l'iPhone (Cyril 12/11).
   Chaque type (chantier, visite, livraison, rendez-vous…) a sa couleur ; on touche une couleur de la légende
   pour en choisir une autre parmi 8. Le choix est gardé sur l'appareil (pc-couleurs) ; « Par défaut » revient à la palette douce. */
(function(){
  "use strict";
  var d=document,root=d.documentElement,K="pc-couleurs";
  var NOMS={run:"Chantier en cours",plan:"Chantier prévu",done:"Chantier terminé",visit:"Visite",pc:"Point ProClik",liv:"Livraison fournisseur",autre:"Rendez-vous"};
  var CHOIX=[["Bleu","#3E6FB0"],["Vert","#3E8E6A"],["Orange","#C27C2C"],["Violet","#7B5CB3"],["Rose","#B9577A"],["Rouge","#C2453B"],["Laiton","#A8823F"],["Gris","#8A93A3"]];
  function lis(){try{return JSON.parse(localStorage.getItem(K)||"{}")||{}}catch(e){return {}}}
  function ecris(o){try{localStorage.setItem(K,JSON.stringify(o))}catch(e){}}
  /* « Chantier prévu » suit « Chantier en cours » en plus clair, sauf s'il a sa propre couleur */
  function applique(){var o=lis();
    Object.keys(NOMS).forEach(function(k){if(o[k])root.style.setProperty("--k-"+k,o[k]);else root.style.removeProperty("--k-"+k)});
    if(o.run&&!o.plan)root.style.setProperty("--k-plan","color-mix(in srgb,"+o.run+" 55%,var(--bg))")}
  applique();

  var css=d.createElement("style");css.textContent=
    ".cal-key span[data-kc]{cursor:pointer;padding:3px 8px;border-radius:999px;margin:-3px -4px}"+
    ".kc-pop{position:fixed;inset:0;z-index:300;display:grid;place-items:end center;background:rgba(14,19,34,.28)}"+
    ".kc-in{width:min(460px,100%);box-sizing:border-box;padding:18px 18px calc(18px + env(safe-area-inset-bottom,0px));border-radius:24px 24px 0 0;background:var(--n1-calme,var(--bg));box-shadow:var(--n1-calme-sh,none);color:var(--fg)}"+
    "@media (min-width:700px){.kc-pop{place-items:center}.kc-in{border-radius:24px}}"+
    ".kc-in h3{margin:0 0 4px;font-size:18px}.kc-in p{margin:0 0 14px;color:var(--muted);font-size:14px}"+
    ".kc-g{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}"+
    ".kc-g button{display:grid;justify-items:center;gap:6px;border:0;background:none;color:var(--fg);font:600 12.5px/1.2 inherit;padding:4px;cursor:pointer;box-shadow:none}"+
    ".kc-g i{width:44px;height:44px;border-radius:50%;background:var(--c);display:grid;place-items:center;color:#fff}"+
    ".kc-g button[aria-pressed=true] i{box-shadow:0 0 0 3px var(--bg),0 0 0 5px var(--c)}"+
    ".kc-g svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}"+
    ".kc-b{display:flex;gap:10px;margin-top:16px}.kc-b .btn{flex:1}";
  d.head.appendChild(css);

  /* la légende devient touchable : chaque couleur ouvre le choix */
  function marque(){[].forEach.call(d.querySelectorAll(".cal-key span"),function(s){
    var i=s.querySelector("i");if(!i||s.hasAttribute("data-kc"))return;
    var m=/--k-([a-z]+)/.exec(i.getAttribute("style")||"");if(!m||!NOMS[m[1]]||i.classList.contains("tent"))return;
    s.setAttribute("data-kc",m[1]);s.setAttribute("role","button");s.setAttribute("tabindex","0");
    s.setAttribute("aria-label","Changer la couleur : "+NOMS[m[1]])})}
  marque();new MutationObserver(marque).observe(d.body,{childList:true,subtree:true});

  function ouvre(k){
    var o=lis(),act=(o[k]||getComputedStyle(root).getPropertyValue("--k-"+k)).trim().toLowerCase(),OK='<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
    var p=d.createElement("div");p.className="kc-pop";p.setAttribute("role","dialog");p.setAttribute("aria-label","Couleur : "+NOMS[k]);
    p.innerHTML='<div class="kc-in"><h3>'+NOMS[k]+'</h3><p>Choisissez sa couleur dans le Planning.</p><div class="kc-g">'+
      CHOIX.map(function(c){var on=c[1].toLowerCase()===act;return '<button type="button" data-c="'+c[1]+'" aria-pressed="'+on+'" style="--c:'+c[1]+'"><i>'+(on?OK:"")+'</i>'+c[0]+'</button>'}).join("")+
      '</div><div class="kc-b"><button type="button" class="btn" data-x="def">Par défaut</button><button type="button" class="btn go" data-x="ok">Fermer</button></div></div>';
    d.body.appendChild(p);
    p.addEventListener("click",function(e){
      var b=e.target.closest("button");
      if(e.target===p||(b&&b.dataset.x==="ok")){p.remove();return}
      if(!b)return;var o=lis();
      if(b.dataset.x==="def")delete o[k];else if(b.dataset.c)o[k]=b.dataset.c;else return;
      ecris(o);applique();p.remove();
      if(navigator.vibrate)try{navigator.vibrate(8)}catch(_){}
    });
  }
  d.addEventListener("click",function(e){var s=e.target.closest&&e.target.closest("[data-kc]");if(s)ouvre(s.dataset.kc)});
  d.addEventListener("keydown",function(e){var s=e.target.closest&&e.target.closest("[data-kc]");if(s&&(e.key==="Enter"||e.key===" ")){e.preventDefault();ouvre(s.dataset.kc)}});
  addEventListener("storage",function(e){if(e.key===K)applique()});
})();
