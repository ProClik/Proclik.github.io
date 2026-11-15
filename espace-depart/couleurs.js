/* Couleurs du Planning, comme les calendriers de l'iPhone (Cyril 12/11).
   Deux façons de colorer, au choix sous le planning :
   - « Par client » (par défaut) : chaque client reçoit sa couleur, tirée au hasard dès qu'il apparaît dans le planning
     (chantier, visite pour le devis, livraison pour son chantier…). On la change en touchant son nom sous le planning.
   - « Par type » : une couleur par type (chantier, visite, livraison…), palette douce, qu'on change en touchant la légende.
   Créneau libre, Point ProClik et chantier terminé gardent toujours la couleur de leur type.
   Tout est gardé sur l'appareil : pc-couleurs (types), pc-couleurs-clients (clients), pc-couleurs-mode. */
(function(){
  "use strict";
  var d=document,root=d.documentElement,K="pc-couleurs",KC="pc-couleurs-clients",KM="pc-couleurs-mode";
  var NOMS={run:"Chantier en cours",plan:"Chantier prévu",done:"Chantier terminé",visit:"Visite",pc:"Point ProClik",liv:"Livraison fournisseur",autre:"Rendez-vous"};
  var CHOIX=[["Bleu","#3E6FB0"],["Vert","#3E8E6A"],["Orange","#C27C2C"],["Violet","#7B5CB3"],["Rose","#B9577A"],["Rouge","#C2453B"],["Laiton","#A8823F"],["Gris","#8A93A3"]];
  /* couleurs des clients : 10 teintes douces, plus claires la nuit */
  var CLI=[["Bleu","#3E6FB0","#7FA6E0"],["Vert","#3E8E6A","#6FC39B"],["Orange","#C27C2C","#E3A65E"],["Violet","#7B5CB3","#AE93E0"],["Rose","#B9577A","#E08AAA"],
           ["Canard","#2D8590","#62BCC6"],["Rouge","#C2453B","#E8807A"],["Olive","#738A2E","#A9C266"],["Indigo","#4F5BC0","#8E98EC"],["Brun","#93653C","#C99A70"]];
  var SANS={free:1,pc:1,done:1};
  function lis(k,def){try{return JSON.parse(localStorage.getItem(k)||"null")||def}catch(e){return def}}
  function ecris(k,o){try{localStorage.setItem(k,JSON.stringify(o))}catch(e){}}
  function mode(){return lis(KM,"client")==="type"?"type":"client"}

  /* couleurs des types choisies par l'artisan ; « Chantier prévu » suit « Chantier en cours » en plus clair */
  function applique(){var o=lis(K,{});
    Object.keys(NOMS).forEach(function(k){if(o[k])root.style.setProperty("--k-"+k,o[k]);else root.style.removeProperty("--k-"+k)});
    if(o.run&&!o.plan)root.style.setProperty("--k-plan","color-mix(in srgb,"+o.run+" 55%,var(--bg))")}
  applique();

  /* à quel client appartient un évènement : son chantier, sinon le nom dans le titre (« Visite Mme Perrin » → Mme Perrin) */
  function client(e){var x=e.x||{},CH=window.PCX&&PCX.CH;
    if(x.ch!=null&&CH&&CH[x.ch]&&CH[x.ch].n)return CH[x.ch].n;
    if(x.liv)return null; /* livraison au dépôt, sans chantier */
    var t=String(e.t||"").split(" · ")[0].replace(/^(Chantier|Visite|Réception|Devis|Rendez-vous|RDV|Métré|Fenêtres|Pose)\s+(de |du |chez )?/i,"").trim();
    if(!t)return null;
    /* même client écrit autrement (« Cabinet Alpes Kiné » / « Alpes Kiné ») : on reprend le nom de sa fiche chantier */
    if(CH)for(var k in CH){var n=CH[k]&&CH[k].n;if(n&&(t.indexOf(n)>-1||n.indexOf(t)>-1))return n}
    return t}
  /* première fois qu'on voit un client : couleur au hasard parmi les moins utilisées */
  function idx(nom){var o=lis(KC,{});if(o[nom]!=null)return o[nom];
    var n=CLI.map(function(){return 0});Object.keys(o).forEach(function(k){n[o[k]]=(n[o[k]]||0)+1});
    var mn=Math.min.apply(null,n),libres=[];n.forEach(function(v,i){if(v===mn)libres.push(i)});
    o[nom]=libres[Math.floor(Math.random()*libres.length)];ecris(KC,o);return o[nom]}
  window.PCCOUL={ev:function(e){if(mode()!=="client"||SANS[e.k])return null;var c=client(e);return c?"var(--cl-"+idx(c)+")":null},client:client};

  var css=d.createElement("style");css.textContent=
    ":root{"+CLI.map(function(c,i){return "--cl-"+i+":"+c[1]}).join(";")+"}"+
    ":root[data-theme=dark]{"+CLI.map(function(c,i){return "--cl-"+i+":"+c[2]}).join(";")+"}"+
    "html body .cal-key [data-kcl] i{width:10px;height:10px;border-radius:50%;background:var(--c)!important;box-shadow:none!important;vertical-align:0}"+
    ".cal-key span[data-kc],.cal-key span[data-kcl]{cursor:pointer;padding:3px 8px;border-radius:999px;margin:-3px -4px}"+
    ".kc-mode{flex-basis:100%;display:flex;align-items:center;gap:8px;margin-bottom:4px;color:var(--muted);font-size:12.5px}"+
    ".kc-mode .seg{display:inline-flex;gap:2px;padding:3px;border-radius:999px}.kc-mode .seg button{border:0;background:none;padding:5px 12px;border-radius:999px;font:600 12.5px/1 inherit;color:var(--muted);cursor:pointer}"+
    ".kc-mode .seg button[aria-selected=true]{color:var(--fg)}"+
    ".kc-pop{position:fixed;inset:0;z-index:300;display:grid;place-items:end center;background:rgba(14,19,34,.28)}"+
    ".kc-in{width:min(460px,100%);box-sizing:border-box;padding:18px 18px calc(18px + env(safe-area-inset-bottom,0px));border-radius:24px 24px 0 0;background:var(--n1-calme,var(--bg));box-shadow:var(--n1-calme-sh,none);color:var(--fg)}"+
    "@media (min-width:700px){.kc-pop{place-items:center}.kc-in{border-radius:24px}}"+
    ".kc-in h3{margin:0 0 4px;font-size:18px}.kc-in p{margin:0 0 14px;color:var(--muted);font-size:14px}"+
    ".kc-g{display:grid;grid-template-columns:repeat(var(--n,4),1fr);gap:12px 6px}"+
    ".kc-g button{display:grid;justify-items:center;gap:6px;border:0;background:none;color:var(--fg);font:600 12.5px/1.2 inherit;padding:4px;cursor:pointer;box-shadow:none}"+
    ".kc-g i{width:44px;height:44px;border-radius:50%;background:var(--c);display:grid;place-items:center;color:#fff}"+
    ".kc-g button[aria-pressed=true] i{box-shadow:0 0 0 3px var(--bg),0 0 0 5px var(--c)}"+
    ".kc-g svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}"+
    ".kc-b{display:flex;gap:10px;margin-top:16px}.kc-b .btn{flex:1}";
  d.head.appendChild(css);
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}

  /* sous le planning : « Par client / Par type », puis la légende qui va avec ; chaque couleur se touche pour la changer */
  function legende(x){
    var m=mode(),h='<div class="kc-mode">Couleurs<span class="seg"><button type="button" role="tab" data-kcm="client" aria-selected="'+(m==="client")+'">Par client</button><button type="button" role="tab" data-kcm="type" aria-selected="'+(m==="type")+'">Par type</button></span></div>';
    if(m==="client"){var vus={},L=[];(window.PCX&&PCX.EV||[]).forEach(function(e){if(SANS[e.k])return;var c=client(e);if(c&&!vus[c]){vus[c]=1;L.push(c)}});
      h+=L.slice(0,14).map(function(c){return '<span data-kcl="'+esc(c)+'" role="button" tabindex="0" aria-label="Changer la couleur de '+esc(c)+'"><i style="--c:var(--cl-'+idx(c)+')"></i>'+esc(c)+'</span>'}).join("")+
        '<span><i style="--c:var(--k-done)"></i>Terminé</span><span><i style="--c:var(--k-pc)"></i>Point ProClik</span>';
      x.innerHTML=h}
    else{var t=x.innerHTML.replace(/<div class="kc-mode">[\s\S]*?<\/div>/,"");x.innerHTML=h+t;
      [].forEach.call(x.querySelectorAll("span"),function(s){var i=s.querySelector("i");if(!i||s.closest(".kc-mode"))return;
        var mm=/--k-([a-z]+)/.exec(i.getAttribute("style")||"");if(!mm||!NOMS[mm[1]]||i.classList.contains("tent"))return;
        s.setAttribute("data-kc",mm[1]);s.setAttribute("role","button");s.setAttribute("tabindex","0");s.setAttribute("aria-label","Changer la couleur : "+NOMS[mm[1]])})}
    x.setAttribute("data-kcmode",m)}
  function marque(){[].forEach.call(d.querySelectorAll(".cal-key"),function(x){if(!x.querySelector(".kc-mode")||x.getAttribute("data-kcmode")!==mode())legende(x)})}
  marque();new MutationObserver(marque).observe(d.body,{childList:true,subtree:true});

  /* redessine le planning ouvert (même vue) pour que les nouvelles couleurs s'affichent */
  function redessine(){var X=window.PCX;try{if(X&&X.renderCalWeek)X.renderCalWeek();if(X&&X.renderCalMonth)X.renderCalMonth()}catch(_){}
    [].forEach.call(d.querySelectorAll(".cal-key"),legende)}
  redessine();

  function pop(titre,sous,liste,act,fin,defaut){
    var OK='<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
    var p=d.createElement("div");p.className="kc-pop";p.setAttribute("role","dialog");p.setAttribute("aria-label",titre);
    p.innerHTML='<div class="kc-in"><h3>'+esc(titre)+'</h3><p>'+sous+'</p><div class="kc-g" style="--n:'+(liste.length>8?5:4)+'">'+
      liste.map(function(c,i){var on=i===act;return '<button type="button" data-i="'+i+'" aria-pressed="'+on+'" style="--c:'+c[1]+'"><i>'+(on?OK:"")+'</i>'+c[0]+'</button>'}).join("")+
      '</div><div class="kc-b">'+(defaut?'<button type="button" class="btn" data-x="def">Par défaut</button>':'')+'<button type="button" class="btn go" data-x="ok">Fermer</button></div></div>';
    d.body.appendChild(p);
    p.addEventListener("click",function(e){var b=e.target.closest("button");
      if(e.target===p||(b&&b.dataset.x==="ok")){p.remove();return}
      if(!b)return;if(b.dataset.x==="def")fin(null);else if(b.dataset.i!=null)fin(+b.dataset.i);else return;
      p.remove();if(navigator.vibrate)try{navigator.vibrate(8)}catch(_){}})}
  function ouvreType(k){var o=lis(K,{}),act=(o[k]||getComputedStyle(root).getPropertyValue("--k-"+k)).trim().toLowerCase();
    pop(NOMS[k],"Choisissez sa couleur dans le Planning.",CHOIX,CHOIX.findIndex(function(c){return c[1].toLowerCase()===act}),
      function(i){var o=lis(K,{});if(i==null)delete o[k];else o[k]=CHOIX[i][1];ecris(K,o);applique();redessine()},true)}
  function ouvreClient(nom){var sombre=root.getAttribute("data-theme")==="dark";
    pop(nom,"Sa couleur dans le Planning : chantier, visites, livraisons.",CLI.map(function(c){return [c[0],sombre?c[2]:c[1]]}),idx(nom),
      function(i){var o=lis(KC,{});o[nom]=i;ecris(KC,o);redessine()},false)}
  window.PCCOUL.choisir=ouvreClient;
  d.addEventListener("click",function(e){if(!e.target.closest)return;
    var m=e.target.closest("[data-kcm]");if(m){ecris(KM,m.dataset.kcm);redessine();return}
    var s=e.target.closest("[data-kc]");if(s){ouvreType(s.dataset.kc);return}
    var c=e.target.closest("[data-kcl]");if(c)ouvreClient(c.dataset.kcl)});
  d.addEventListener("keydown",function(e){if(e.key!=="Enter"&&e.key!==" ")return;var s=e.target.closest&&e.target.closest("[data-kc],[data-kcl]");if(!s)return;
    e.preventDefault();if(s.dataset.kc)ouvreType(s.dataset.kc);else ouvreClient(s.dataset.kcl)});
  addEventListener("storage",function(e){if(e.key===K)applique();if(e.key===KC||e.key===KM)redessine()});
})();
