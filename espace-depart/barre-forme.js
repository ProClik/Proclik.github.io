/* Barre du bas + menu « Tout l'Espace » dans leur nouvelle forme (maquette figée du 21/11, FIGE-21-11/menu.html).
   Rien n'est retiré : les vrais boutons (nav.nav, #nb-*) restent la source ; barre.js garde ses réglages (4 boutons choisis).
   Téléphone : nouvelle barre de 5 ronds (4 choisis + rond du menu au milieu). iPad/PC : le galet du menu de côté ouvre le même panneau.
   ?forme=0 = ancienne barre. */
(function(){"use strict";
var d=document,root=d.documentElement;
if(/[?&]forme=0\b/.test(location.search))return;
var $=function(s,c){return (c||d).querySelector(s)},$$=function(s,c){return [].slice.call((c||d).querySelectorAll(s))};
var B=window.PCBarre;if(!B||!$("nav.nav"))return;
root.classList.add("f2bar");

var I={x:'<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  menu:'<svg viewBox="0 0 24 24"><path d="M5 8h14M5 16h14"/></svg>',
  mic:'<svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg>',
  loupe:'<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
  options:'<svg viewBox="0 0 24 24"><rect x="4" y="4" width="7" height="7" rx="2.2"/><rect x="13" y="4" width="7" height="7" rx="2.2"/><rect x="4" y="13" width="7" height="7" rx="2.2"/><path d="M16.5 13.5v6M13.5 16.5h6"/></svg>',
  d:'<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>'};
var esc=function(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})};
var sa=function(s){return String(s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase()};

/* familles du panneau (mêmes que la maquette) ; ce qui est dans la barre n'y est pas répété */
var FAM=[{t:"Devis et factures",v:["devis","factures","cadences"]},
  {t:"Et aussi",v:["accueil","clients","reseaux","options","reglages"]},
  {t:"Chantiers",v:["chantiers","planning","plans","cotes","vehicules","monequipe"]},
  {t:"Achats",v:["prix","produits","depenses"]}];
var COURT={cadences:"Cadences",vehicules:"Véhicules",monequipe:"Équipe",options:"Options"};

function dispo(v){if(v==="reglages")return true;if(v==="options")return !!$("#mo-bt");var b=$("#nb-"+v);return !!b&&!b.hidden}
function info(v){if(v==="options")return {ico:I.options,nom:"Options"};var i=B.info(v);if(!i)return null;return {ico:i.ico,nom:COURT[v]||i.nom}}
function badge(v){var s=$("#nb-"+v+" .badge");var n=s&&!s.hidden?+(s.textContent||0)||0:0;return n}
function optm(v){var b=$("#nb-"+v+" .pc-optm");return b?b.outerHTML:""}
function agit(v){
  if(v==="micro"){var m=$("#speak");if(m)m.click();return}
  if(v==="reglages"){var r=$("#menu");if(r)r.click();return}
  if(v==="options"){var o=$("#mo-bt");if(o)o.click();return}
  var b=$("#nb-"+v);if(b)b.click()}
function courant(){return ($("nav.nav [aria-selected=true]")||{dataset:{}}).dataset.v}

/* ---------- la barre (téléphone) ---------- */
var bar=d.createElement("nav");bar.className="f2 f2b";bar.id="f2b";bar.setAttribute("aria-label","Menu principal");
function rond(v,cls){var i=info(v);if(!i)return "";var n=badge(v);
  return '<button type="button" class="og'+(cls||"")+'" data-f2b="'+v+'"><span class="r">'+i.ico+"</span>"+esc(i.nom)+(n?'<span class="b">'+n+"</span>":"")+"</button>"}
function barre(){var bas=B.bas(),cur=courant(),h="";
  bas.slice(0,2).forEach(function(v){h+=rond(v,v===cur?" on":"")});
  h+='<button type="button" class="og mid" data-f2b="menu" aria-expanded="'+ouvert+'" aria-label="'+(ouvert?"Fermer le menu":"Tout l\'Espace")+'"><span class="r">'+(ouvert?I.x:I.menu)+"</span>"+(totalMenu()&&!ouvert?'<span class="b">'+totalMenu()+"</span>":"")+"</button>";
  bas.slice(2,4).forEach(function(v){h+=rond(v,v===cur?" on":"")});
  if(bar.innerHTML!==h)bar.innerHTML=h}
bar.addEventListener("click",function(e){var b=e.target.closest("[data-f2b]");if(!b)return;var v=b.dataset.f2b;
  if(v==="menu"){ouvert?ferme():ouvre();return}ferme();agit(v)});

/* ---------- le panneau « Tout l'Espace » ---------- */
var scrim=d.createElement("div");scrim.className="f2 f2ms";scrim.hidden=true;
var pan=d.createElement("div");pan.className="f2 f2m";pan.id="f2m";pan.hidden=true;pan.setAttribute("role","dialog");pan.setAttribute("aria-label","Tout l'Espace");
var ouvert=false,q="";
function horsBarre(){var bas=innerWidth<900?B.bas():(B.cote?B.cote():[]);return function(v){return bas.indexOf(v)<0&&dispo(v)}}
function groupes(){var ok=horsBarre(),vus={};
  var G=FAM.map(function(f){var v=f.v.filter(function(x){if(ok(x)){vus[x]=1;return true}});return {t:f.t,v:v}});
  /* une entrée nouvelle (option, menu ajouté plus tard) va dans « Et aussi » ; Scanner a sa propre carte */
  $$("nav.nav [data-pbx]").forEach(function(b){var v=(b.id||"").replace(/^nb-/,"");if(v&&v!=="cliky"&&!vus[v]&&ok(v))G[1].v.push(v)});
  return G}
function totalMenu(){var ok=horsBarre(),t=0;FAM.forEach(function(f){f.v.forEach(function(v){if(ok(v))t+=badge(v)})});return t}
function bouton(v){var i=info(v);if(!i)return "";var n=badge(v);
  return '<button type="button" data-f2m="'+v+'" data-nom="'+esc(sa(i.nom))+'"><span class="r">'+i.ico+optm(v)+"</span>"+esc(i.nom)+(n?"<em>"+n+"</em>":"")+"</button>"}
function bloc(g,cls){if(!g.v.length)return "";return '<div class="f2m-g"><h3>'+esc(g.t)+'</h3><div class="gr4'+(cls||"")+'">'+g.v.map(bouton).join("")+"</div></div>"}
function scanner(){var b=$("#nb-cliky");if(!b||b.hidden)return "";var ic=$(".ico",b);
  return '<button type="button" class="f2m-sc" data-f2m="cliky"><span class="rond">'+(ic?ic.innerHTML:"")+'</span><span class="x"><b>Scanner</b><span>Un prix, un plan, une facture… Cliky s\'en occupe</span></span>'+I.d+"</button>"}
function contenu(){var G=groupes(),h="";
  h+='<div class="tete"><b>Tout l\'Espace</b><button type="button" class="xr" data-f2m="x" aria-label="Fermer">'+I.x+"</button></div>";
  h+='<label class="cherche">'+I.loupe+'<input type="search" id="f2m-q" autocomplete="off" enterkeyhint="go" placeholder="Chercher ou dire un écran…"><button type="button" class="mic2" id="f2m-mic" aria-label="Dire un écran">'+I.mic+"</button></label>";
  h+='<div class="defile">'+scanner();
  var a=G[0],b=G[1];
  if(a.v.length&&b.v.length&&a.v.length<=2&&b.v.length<=3)h+='<div class="duo2">'+bloc(a," g2")+bloc(b," g3")+"</div>";
  else h+=bloc(a)+bloc(b);
  h+=bloc(G[2])+bloc(G[3]);
  h+='<p class="f2m-vide" hidden>Aucun écran ne porte ce nom. Essayez « factures », « plans », « produits »…</p></div>';
  pan.innerHTML=h;
  var inp=$("#f2m-q",pan);inp.addEventListener("input",function(){filtre(inp.value)});
  inp.addEventListener("keydown",function(e){if(e.key==="Enter"){var v=$$("[data-f2m]:not([hidden])",$(".defile",pan)).filter(function(x){return x.dataset.f2m!=="x"});if(v.length===1||(v.length&&q)){e.preventDefault();ferme();agit(v[0].dataset.f2m)}}});
  dictee($("#f2m-mic",pan),inp)}
function filtre(t){q=sa(t).trim();var vide=true;
  $$(".gr4 button",pan).forEach(function(b){var on=!q||b.dataset.nom.indexOf(q)>=0;b.hidden=!on;if(on)vide=false});
  $$(".f2m-g",pan).forEach(function(g){g.hidden=!$$("button:not([hidden])",g).length});
  var sc=$(".f2m-sc",pan);if(sc){var on=!q||/^(scan|cliky|photo)/.test(q)||"scanner cliky photo".indexOf(q)>=0;sc.hidden=!on;if(on)vide=false}
  $(".f2m-vide",pan).hidden=!vide}
function dictee(mic,inp){var SR=window.SpeechRecognition||window.webkitSpeechRecognition,ec=null;
  mic.addEventListener("click",function(e){e.preventDefault();
    if(!SR){inp.focus();if(window.X&&X.toast)X.toast("Dictée","Touchez le micro du clavier, en bas à côté de la barre d'espace.");return}
    if(ec){ec.stop();return}
    ec=new SR();ec.lang="fr-FR";ec.interimResults=true;mic.classList.add("on");
    ec.onresult=function(ev){var t="";for(var i=0;i<ev.results.length;i++)t+=ev.results[i][0].transcript;inp.value=t.replace(/[.?!]$/,"");filtre(inp.value);
      if(ev.results[ev.results.length-1].isFinal){var v=$$(".defile [data-f2m]:not([hidden])",pan);if(v.length===1){setTimeout(function(){ferme();agit(v[0].dataset.f2m)},350)}}};
    ec.onend=ec.onerror=function(){mic.classList.remove("on");ec=null};try{ec.start()}catch(_){ec=null;mic.classList.remove("on")}})}
pan.addEventListener("click",function(e){var b=e.target.closest("[data-f2m]");if(!b)return;var v=b.dataset.f2m;ferme();if(v!=="x")setTimeout(function(){agit(v)},120)});
scrim.addEventListener("click",ferme);
d.addEventListener("keydown",function(e){if(e.key==="Escape"&&ouvert)ferme()});

function ouvre(){if(ouvert)return;ouvert=true;q="";contenu();scrim.hidden=false;pan.hidden=false;pan.setAttribute("aria-modal","true");
  root.classList.add("f2m-on");requestAnimationFrame(function(){pan.classList.add("in");scrim.classList.add("in")});barre();
  try{if(navigator.vibrate)navigator.vibrate(8)}catch(_){}}
function ferme(){if(!ouvert)return;ouvert=false;pan.classList.remove("in");scrim.classList.remove("in");root.classList.remove("f2m-on");pan.removeAttribute("aria-modal");
  setTimeout(function(){if(!ouvert){pan.hidden=true;scrim.hidden=true}},220);barre()}

/* le galet du menu de côté (iPad/PC, familles.js) et tout ce qui appelait l'ancien panneau ouvrent maintenant celui-ci */
B.ouvre=ouvre;B.ferme=ferme;B.ouvert=function(){return ouvert};
var app0=B.applique;B.applique=function(){var r=app0.apply(this,arguments);barre();if(ouvert)contenu();return r};

d.body.appendChild(scrim);d.body.appendChild(pan);d.body.appendChild(bar);
barre();
var nav=$("nav.nav");new MutationObserver(function(){barre()}).observe(nav,{subtree:true,attributes:true,attributeFilter:["aria-selected","hidden"],childList:true,characterData:true});
setInterval(barre,3000);
})();
