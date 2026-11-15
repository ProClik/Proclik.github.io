/* Menu de côté rangé en FAMILLES (iPad couché, ordinateur ; idée de Cyril, 15/11) : 11 entrées les unes sous les autres,
   c'était trop pour quelqu'un qui n'est pas à l'aise. Le menu de côté n'a plus que 5 gros boutons (+ Réseaux si l'option est prise) ;
   une famille de plusieurs écrans montre de grands onglets en haut de l'écran. Les vrais onglets (#nb-…) restent la seule source :
   ce menu ne fait qu'appuyer dessus et recopier l'onglet en cours et les pastilles. Téléphone et iPad debout : rien ne change (barre.js). */
(function(){
  "use strict";
  var d=document,$=function(s,r){return (r||d).querySelector(s)},$$=function(s,r){return [].slice.call((r||d).querySelectorAll(s))};
  var nav=$("nav.nav"),main=$("main");if(!nav||!main||$("#fam"))return;
  var FAM=[
    {k:"accueil",n:"Accueil",v:["accueil"]},
    {k:"clients",n:"Clients",v:["clients"]},
    {k:"devis",n:"Devis et factures",c:"Devis",v:["devis","factures"]},
    {k:"chantiers",n:"Chantiers",v:["chantiers","planning","cotes"]},
    {k:"achats",n:"Achats",v:["prix","produits","depenses"]},
    {k:"reseaux",n:"Réseaux",v:["reseaux"]}
  ];
  function vrai(v){return $("#nb-"+v)}
  function dispo(v){var b=vrai(v);return !!b&&!b.hidden&&b.style.display!=="none"}
  function nom(v){var b=vrai(v),t="";if(!b)return v;[].forEach.call(b.childNodes,function(n){if(n.nodeType===3)t+=n.nodeValue});return t.trim()||v}
  var dernier={};

  /* trois façons de montrer ce qui est ouvert, à choisir par Cyril (15/11) : 1 pilule bleu nuit, 2 trait laiton, 3 menu qui se déplie */
  var V=(function(){try{return JSON.parse(localStorage.getItem("pc-fam"))||1}catch(_){return 1}})();
  d.documentElement.classList.add("fam-v"+V);
  var fam=d.createElement("nav");fam.className="nav fam";fam.id="fam";fam.setAttribute("aria-label","Menu");
  var sous=d.createElement("div");sous.className="fam-sous";sous.id="fam-sous";sous.setAttribute("role","tablist");sous.setAttribute("aria-label","Dans cette famille");sous.hidden=true;
  function construit(){
    fam.innerHTML=FAM.map(function(f){
      var vs=f.v.filter(dispo);if(!vs.length)return "";
      var ico=$(".ico",vrai(vs[0]));
      return '<button type="button" data-fam="'+f.k+'"><span class="ico" aria-hidden="true">'+(ico?ico.innerHTML:"")+'</span>'+(f.c||f.n)+'<span class="badge" hidden></span></button>'+
        (vs.length>1?'<div class="fam-dep" data-dep="'+f.k+'" hidden></div>':'');
    }).join("");
    suit();
  }
  function famDe(v){for(var i=0;i<FAM.length;i++)if(FAM[i].v.indexOf(v)>=0)return FAM[i];return null}
  function nb(v){var s=$(".badge",vrai(v));return s&&!s.hidden?+(s.textContent||0)||0:0}
  function onglets(vs,cur,ico){
    return vs.map(function(v){var n=nb(v),ic=$(".ico",vrai(v));
      return '<button type="button" role="tab" data-sous="'+v+'" aria-selected="'+(v===cur)+'"'+(v===cur?' class="on" aria-current="page"':'')+'>'+
        (ico&&ic?'<span class="fam-g" aria-hidden="true">'+ic.innerHTML+'</span>':'')+'<span class="fam-t">'+nom(v)+'</span>'+(n?'<span class="fam-n">'+n+'</span>':'')+'</button>'}).join("");
  }
  function suit(){
    var cur=($("nav.nav:not(.fam) [aria-selected=true]")||{dataset:{}}).dataset.v,f=famDe(cur);
    if(f)dernier[f.k]=cur;
    $$("[data-fam]",fam).forEach(function(b){
      var on=f&&b.dataset.fam===f.k;b.setAttribute("aria-current",on?"page":"false");b.setAttribute("aria-selected",on?"true":"false");
      var F=FAM.filter(function(x){return x.k===b.dataset.fam})[0],tot=0;
      F.v.filter(dispo).forEach(function(v){tot+=nb(v)});
      var bd=$(".badge",b);bd.textContent=tot;bd.hidden=!tot;
    });
    var vs=f?f.v.filter(dispo):[];
    $$(".fam-dep",fam).forEach(function(x){var on=V===3&&f&&x.dataset.dep===f.k;x.hidden=!on;x.innerHTML=on?onglets(vs,cur,false):""});
    if(V!==3&&vs.length>1){sous.innerHTML=onglets(vs,cur,true);sous.hidden=false}
    else{sous.hidden=true;sous.innerHTML=""}
  }
  fam.addEventListener("click",function(e){
    var s=e.target.closest("[data-sous]");if(s){var u=vrai(s.dataset.sous);if(u)u.click();return}
    var b=e.target.closest("[data-fam]");if(!b)return;
    var F=FAM.filter(function(x){return x.k===b.dataset.fam})[0],vs=F.v.filter(dispo),v=dernier[F.k]&&vs.indexOf(dernier[F.k])>=0?dernier[F.k]:vs[0];
    var t=vrai(v);if(t)t.click();
  });
  sous.addEventListener("click",function(e){var b=e.target.closest("[data-sous]");if(!b)return;var t=vrai(b.dataset.sous);if(t)t.click()});

  nav.parentNode.insertBefore(fam,nav.nextSibling);
  main.insertBefore(sous,main.firstChild);
  var H="html body ",A='#fam [data-fam][aria-selected="true"]';
  var st=d.createElement("style");
  st.textContent=
    "#fam,#fam-sous{display:none}"+
    "@media (min-width:900px){"+
      H+"nav.nav:not(.fam){display:none!important}"+
      H+"#fam{display:flex!important}"+
      H+"#fam [data-fam]{position:relative;text-align:center;line-height:1.2}"+
      H+"#fam [data-fam][aria-selected=\"true\"] .ico,"+H+"#fam [data-fam] .ico{background:transparent!important;box-shadow:none!important}"+
      H+"#fam-sous svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}"+
      H+"#fam-sous button,"+H+"#fam .fam-dep button{position:relative;display:inline-flex;align-items:center;gap:8px;border:0;cursor:pointer;-webkit-tap-highlight-color:transparent;font-family:Manrope,system-ui,sans-serif}"+
      H+".fam-n{display:inline-grid;place-items:center;min-width:19px;height:19px;padding:0 5px;border-radius:10px;background:var(--n1-alert);color:#fff;font-size:11px;font-weight:800}"+
      /* 1 · PILULE BLEU NUIT : la famille ouverte est une pilule pleine ; en haut, une barre à segments, l'écran ouvert plein bleu nuit */
      ".fam-v1 "+A+"{background:var(--n1-nuit);color:var(--n1-nuit-fg)!important;border-radius:20px;width:calc(100% - 18px);padding:10px 0 9px}"+
      ".fam-v1 "+A+" .ico{color:var(--n1-nuit-fg)!important}"+
      ".fam-v1 #fam-sous:not([hidden]){display:inline-flex;gap:4px;margin:0 0 20px;padding:5px;border-radius:999px;background:var(--n1-calme);box-shadow:var(--n1-pk)}"+
      ".fam-v1 #fam-sous button{padding:11px 22px;border-radius:999px;background:transparent;color:var(--n1-muted);font-size:15px;font-weight:700}"+
      ".fam-v1 #fam-sous button.on{background:var(--n1-nuit);color:var(--n1-nuit-fg);box-shadow:var(--n1-go-sh)}"+
      /* 2 · TRAIT LAITON : un trait laiton devant la famille ouverte ; en haut, des onglets écrits, l'ouvert souligné de laiton */
      ".fam-v2 #fam [data-fam]{color:var(--n1-muted)}"+
      ".fam-v2 "+A+"{color:var(--n1-fg)!important;font-weight:800}"+
      ".fam-v2 "+A+" .ico{color:var(--n1-fg)!important}"+
      ".fam-v2 "+A+"::after{content:'';position:absolute;left:0;top:50%;width:4px;height:44px;margin-top:-22px;border-radius:0 4px 4px 0;background:var(--n1-laiton)}"+
      ".fam-v2 #fam-sous:not([hidden]){display:flex;gap:30px;margin:0 0 22px;border-bottom:1px solid var(--n1-line)}"+
      ".fam-v2 #fam-sous button{padding:6px 2px 13px;background:none;color:var(--n1-muted);font-size:16px;font-weight:700}"+
      ".fam-v2 #fam-sous button.on{color:var(--n1-fg);font-weight:800}"+
      ".fam-v2 #fam-sous button.on::after{content:'';position:absolute;left:0;right:0;bottom:-2px;height:3px;border-radius:3px;background:var(--n1-laiton)}"+
      /* 3 · MENU QUI SE DÉPLIE : la famille ouverte se déplie dans le menu de côté, l'écran ouvert en pilule bleu nuit ; rien en haut */
      ".fam-v3 #fam{gap:12px!important}"+
      ".fam-v3 "+A+"{color:var(--n1-fg)!important;font-weight:800}"+
      ".fam-v3 "+A+" .ico{color:var(--n1-fg)!important}"+
      ".fam-v3 #fam .fam-dep:not([hidden]){display:flex;flex-direction:column;gap:4px;width:calc(100% - 16px);margin-top:-6px;padding:6px;border-radius:16px;background:var(--n1-teinte)}"+
      ".fam-v3 #fam .fam-dep button{justify-content:center;width:100%;min-height:0;padding:8px 4px;border-radius:12px;background:transparent;color:var(--n1-muted);font-size:12.5px;font-weight:700}"+
      ".fam-v3 #fam .fam-dep button.on{background:var(--n1-nuit);color:var(--n1-nuit-fg)}"+
      ".fam-v3 #fam .fam-dep .fam-n{position:absolute;top:-6px;right:-2px}"+
    "}";
  d.head.appendChild(st);
  construit();
  new MutationObserver(suit).observe(nav,{subtree:true,attributes:true,attributeFilter:["aria-selected","hidden","style"],childList:true,characterData:true});
})();
