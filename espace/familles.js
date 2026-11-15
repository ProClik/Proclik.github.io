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

  var fam=d.createElement("nav");fam.className="nav fam";fam.id="fam";fam.setAttribute("aria-label","Menu");
  var sous=d.createElement("div");sous.className="fam-sous";sous.id="fam-sous";sous.setAttribute("role","tablist");sous.setAttribute("aria-label","Dans cette famille");sous.hidden=true;
  function construit(){
    fam.innerHTML=FAM.map(function(f){
      var vs=f.v.filter(dispo);if(!vs.length)return "";
      var ico=$(".ico",vrai(vs[0]));
      return '<button type="button" data-fam="'+f.k+'"><span class="ico" aria-hidden="true">'+(ico?ico.innerHTML:"")+'</span>'+(f.c||f.n)+'<span class="badge" hidden></span></button>';
    }).join("");
    suit();
  }
  function famDe(v){for(var i=0;i<FAM.length;i++)if(FAM[i].v.indexOf(v)>=0)return FAM[i];return null}
  function suit(){
    var cur=($("nav.nav:not(.fam) [aria-selected=true]")||{dataset:{}}).dataset.v,f=famDe(cur);
    if(f)dernier[f.k]=cur;
    $$("button",fam).forEach(function(b){
      var on=f&&b.dataset.fam===f.k;b.setAttribute("aria-current",on?"page":"false");b.setAttribute("aria-selected",on?"true":"false");
      var F=FAM.filter(function(x){return x.k===b.dataset.fam})[0],tot=0;
      F.v.filter(dispo).forEach(function(v){var s=$(".badge",vrai(v));if(s&&!s.hidden)tot+=+(s.textContent||0)||0});
      var bd=$(".badge",b);bd.textContent=tot;bd.hidden=!tot;
    });
    var vs=f?f.v.filter(dispo):[];
    if(vs.length>1){
      sous.innerHTML=vs.map(function(v){var s=$(".badge",vrai(v)),n=s&&!s.hidden?+(s.textContent||0)||0:0;
        var ico=$(".ico",vrai(v));
        return '<button type="button" role="tab" data-sous="'+v+'" aria-selected="'+(v===cur)+'"'+(v===cur?' class="on" aria-current="page"':'')+'><span class="fam-g" aria-hidden="true">'+(ico?ico.innerHTML:"")+'</span><span class="fam-t">'+nom(v)+'</span>'+(n?'<span class="badge fam-n">'+n+'</span>':'')+'</button>'}).join("");
      sous.hidden=false;
    }else{sous.hidden=true;sous.innerHTML=""}
  }
  fam.addEventListener("click",function(e){
    var b=e.target.closest("[data-fam]");if(!b)return;
    var F=FAM.filter(function(x){return x.k===b.dataset.fam})[0],vs=F.v.filter(dispo),v=dernier[F.k]&&vs.indexOf(dernier[F.k])>=0?dernier[F.k]:vs[0];
    var t=vrai(v);if(t)t.click();
  });
  sous.addEventListener("click",function(e){var b=e.target.closest("[data-sous]");if(!b)return;var t=vrai(b.dataset.sous);if(t)t.click()});

  nav.parentNode.insertBefore(fam,nav.nextSibling);
  main.insertBefore(sous,main.firstChild);
  var st=d.createElement("style");
  st.textContent=
    "#fam,#fam-sous{display:none}"+
    "@media (min-width:900px){"+
      "html body nav.nav:not(.fam){display:none!important}"+
      "html body #fam{display:flex!important}"+
      "html body #fam button{text-align:center;line-height:1.2}"+
      /* onglets d'une famille = même panneau que sur téléphone : carte en relief, bulles rondes, celle qui est ouverte cerclée de laiton */
      "html body #fam-sous:not([hidden]){display:inline-flex;gap:6px;margin:0 0 20px;padding:12px 14px 10px;border-radius:26px;background:var(--bg);box-shadow:var(--n1-pk,var(--up))}"+
      "html body #fam-sous button{position:relative;display:flex;flex-direction:column;align-items:center;gap:6px;width:92px;padding:0;background:none;border:0;box-shadow:none;color:var(--muted);font:600 12.5px/1.15 Manrope,system-ui,sans-serif;cursor:pointer;-webkit-tap-highlight-color:transparent}"+
      "html body #fam-sous .fam-g{display:grid;place-items:center;width:46px;height:46px;border-radius:50%;background:var(--bg);box-shadow:var(--n1-pk,var(--up-s));transition:box-shadow .3s,color .3s}"+
      "html body #fam-sous .fam-g svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}"+
      "html body #fam-sous button.on{color:var(--fg);font-weight:800}"+
      "html body #fam-sous button.on .fam-g{color:var(--n1-nuit,var(--accx));box-shadow:var(--n1-pk,var(--in)),0 0 0 2px var(--n1-laiton,#A8823F)}"+
      "html body #fam-sous button:not(.on):hover .fam-g{color:var(--fg)}"+
      "html body #fam-sous button:active .fam-g{box-shadow:var(--in)}"+
      "html body #fam-sous .fam-n{position:absolute;top:-4px;right:calc(50% - 30px)}"+
    "}";
  d.head.appendChild(st);
  construit();
  new MutationObserver(suit).observe(nav,{subtree:true,attributes:true,attributeFilter:["aria-selected","hidden","style"],childList:true,characterData:true});
})();
