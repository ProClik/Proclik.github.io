/* Accueil dans sa NOUVELLE FORME (maquette figée le 21/11, « ACCUEIL-FIGE-v32 », Cyril 22/11 : « faire tout l'Espace de A à Z avec sa nouvelle forme »).
   Même contenu que l'ancien Accueil, dessiné de neuf : la journée en une carte, LE plus urgent en vedette, les chiffres en barres,
   les chantiers en liste légère, « Créer » en 5 ronds. Un bloc n'apparaît que s'il a quelque chose à dire.
   + la fenêtre « Le point de la journée » (figée le 21/11, v27) : à la 1re ouverture du jour, et en touchant la carte de la journée.
   Les données viennent d'accueil.js (window.PCACC) : démo = exemples de l'Espace ; connecté = vraies demandes.
   Pour comparer avec l'ancien Accueil : ?forme=0 */
(function(){
"use strict";
if(/[?&]forme=0/.test(location.search))return;
var A=window.PCACC,X=window.PCX,d=document,root=d.documentElement;if(!A||!X)return;
var $=function(s,r){return (r||d).querySelector(s)},$$=function(s,r){return [].slice.call((r||d).querySelectorAll(s))};
var esc=function(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})};
var vue=$("#v-accueil");if(!vue)return;
var lsG=function(k,v){try{var x=JSON.parse(localStorage.getItem(k));return x==null?v:x}catch(e){return v}};
var lsS=function(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};

/* ---------- icônes (dessins de la maquette figée) ---------- */
var SP='<svg width="0" height="0" style="position:absolute" aria-hidden="true" id="f2-sprite">'+
'<symbol id="f2i-d" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></symbol>'+
'<symbol id="f2i-x" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></symbol>'+
'<symbol id="f2i-maison" viewBox="0 0 24 24"><path d="M4 10.5 12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5H15v-5.5H9v5.5H5.5A1.5 1.5 0 0 1 4 19z"/></symbol>'+
'<symbol id="f2i-users" viewBox="0 0 24 24"><circle cx="9" cy="8.5" r="3.2"/><path d="M3 19.5c.6-3.2 3-5 6-5s5.4 1.8 6 5"/><path d="M15.5 5.6a3 3 0 0 1 0 5.8M17.5 14.7c1.8.6 3 2.2 3.5 4.8"/></symbol>'+
'<symbol id="f2i-cal" viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/></symbol>'+
'<symbol id="f2i-doc" viewBox="0 0 24 24"><path d="M6.5 3.5h7l4 4v12a1 1 0 0 1-1 1h-10a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1z"/><path d="M13.5 3.5v4h4M9 12h6M9 15.5h4"/></symbol>'+
'<symbol id="f2i-menu" viewBox="0 0 24 24"><path d="M5 8h14M5 12h14M5 16h14"/></symbol>'+
'<symbol id="f2i-options" viewBox="0 0 24 24"><rect x="4" y="4" width="6.5" height="6.5" rx="2"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="2"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="2"/><path d="M16.75 13.5v6.5M13.5 16.75H20"/></symbol>'+
'<symbol id="f2i-lune" viewBox="0 0 24 24"><path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z"/></symbol>'+
'<symbol id="f2i-soleil" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></symbol>'+
'<symbol id="f2i-cafe" viewBox="0 0 24 24"><path d="M5 9h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z"/><path d="M16 10.5h1.5a2.5 2.5 0 0 1 0 5H16M9 3.5c0 1.2 1 1.3 1 2.5M12.5 3.5c0 1.2 1 1.3 1 2.5"/></symbol>'+
'<symbol id="f2i-chantier" viewBox="0 0 24 24"><path d="M4 11 12 4.5l8 6.5"/><path d="M6 9.5V20h12V9.5"/><path d="M9.5 20v-5.5h5V20"/></symbol>'+
'<symbol id="f2i-user" viewBox="0 0 24 24"><circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5"/></symbol>'+
'<symbol id="f2i-bulle" viewBox="0 0 24 24"><path d="M4.5 6.5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H11l-4 3.5v-3.5h-.5a2 2 0 0 1-2-2z"/></symbol>'+
'<symbol id="f2i-drapeau" viewBox="0 0 24 24"><path d="M6 21V4M6 4.5h11l-2.5 4 2.5 4H6"/></symbol>'+
'<symbol id="f2i-camion" viewBox="0 0 24 24"><path d="M3 6.5h11v10H3zM14 9.5h4l3 3.5v3.5h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17.5" cy="17.5" r="1.8"/></symbol>'+
'<symbol id="f2i-nav" viewBox="0 0 24 24"><path d="M4 11.5 20 4l-7.5 16-2-6.5z"/></symbol>'+
'<symbol id="f2i-facture" viewBox="0 0 24 24"><path d="M6 3.5h12v17l-2.5-1.6-2 1.6-1.5-1.2-1.5 1.2-2-1.6L6 20.5z"/><path d="M9 8.5h6M9 12h6M9 15.5h3.5"/></symbol>'+
'<symbol id="f2i-plan" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 12h7v8M11 4v4M15 12h5"/></symbol>'+
'<symbol id="f2i-mic" viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></symbol>'+
'<symbol id="f2i-photo" viewBox="0 0 24 24"><path d="M4 8.5a2 2 0 0 1 2-2h2l1.5-2h5l1.5 2h2a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/><circle cx="12" cy="13" r="3.5"/></symbol>'+
'<symbol id="f2i-grille" viewBox="0 0 24 24"><rect x="4" y="4" width="6.5" height="6.5" rx="2"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="2"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="2"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="2"/></symbol>'+
'<symbol id="f2i-horloge" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></symbol>'+
'<symbol id="f2i-alerte" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v5.5M12 16.3v.2"/></symbol>'+
'<symbol id="f2i-tel" viewBox="0 0 24 24"><path d="M6.5 4h3l1.5 4-2 1.3a10 10 0 0 0 5.7 5.7L16 13l4 1.5v3a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 4.5 6.2 2 2 0 0 1 6.5 4z"/></symbol>'+
'<symbol id="f2i-euro" viewBox="0 0 24 24"><path d="M17.5 6.5a7 7 0 1 0 0 11M4.5 10.5h9M4.5 13.5h9"/></symbol>'+
'<symbol id="f2i-check" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M8.3 12.2l2.6 2.6 4.8-5.2"/></symbol>'+
'<symbol id="f2i-envoi" viewBox="0 0 24 24"><path d="M4 12 20 4.5 14.5 20l-3-6.5z"/><path d="M11.5 13.5 20 4.5"/></symbol>'+
'<symbol id="f2i-tendance" viewBox="0 0 24 24"><path d="M4 17l5-5 3.5 3.5L20 8"/><path d="M15 8h5v5"/></symbol>'+
'<symbol id="f2i-cle" viewBox="0 0 24 24"><path d="M14.5 4.5a5 5 0 0 0-4.6 6.9L4 17.3V20h2.7l.8-.8v-1.7h1.7l1-1v-1.7h1.7l.9-.9a5 5 0 1 0 1.7-9.4z"/><circle cx="15.5" cy="8.5" r="1"/></symbol>'+
'</svg>';
if(!$("#f2-sprite"))d.body.insertAdjacentHTML("beforeend",SP);
function ic(n){return '<svg class="i" aria-hidden="true"><use href="#f2i-'+n+'"/></svg>'}

/* ---------- la couleur de l'Espace (6 couleurs figées le 21/11) : boutons et actions ---------- */
var COUL={nuit:["#1B2440","#FFFFFF","#EFEBE2","#1B2440"],sapin:["#2F4A3E","#FFFFFF","#A9CDB8","#141927"],canard:["#1F5560","#FFFFFF","#94CBD3","#141927"],
  ardoise:["#3A5470","#FFFFFF","#B3C7DE","#141927"],noyer:["#4A3A2E","#FFFFFF","#D8C3B0","#141927"],encre:["#17181D","#FFFFFF","#FFFFFF","#141927"]};
function couleur(){var c=COUL[lsG("pc-couleur-espace","nuit")]||COUL.nuit;
  root.style.setProperty("--f2-act-j",c[0]);root.style.setProperty("--f2-sur-j",c[1]);root.style.setProperty("--f2-act-n",c[2]);root.style.setProperty("--f2-sur-n",c[3])}
couleur();addEventListener("storage",couleur);window.PCF2Couleur=couleur;

/* ---------- le cadre ---------- */
root.classList.add("f2on");
var box=d.createElement("div");box.className="f2";box.id="f2acc";box.innerHTML='<div class="f2a"></div>';vue.insertBefore(box,vue.firstChild);
var app=box.firstChild;
var head=$("header.head");if(head)head.classList.add("f2","f2h");
function visible(){var v=!vue.hidden&&vue.offsetParent!==null;root.classList.toggle("f2v",v);return v}
new MutationObserver(visible).observe(vue,{attributes:true,attributeFilter:["hidden","class","style"]});visible();

/* ---------- petits outils ---------- */
var KT={run:"Chantier",plan:"Chantier",done:"Chantier",visit:"Visite",pc:"Point",liv:"Livraison",devis:"Devis",ent:"Entretien",st:"Sous-traitant",autre:"Rendez-vous"};
var KI={run:"chantier",plan:"chantier",done:"chantier",visit:"user",pc:"bulle",liv:"camion",ent:"cle",st:"chantier",devis:"doc",autre:"cal"};
var AIC={predevis:"doc",facture:"facture",fournisseur:"tendance",depense:"euro",entretien:"cle",attente:"horloge",chantier:"chantier"};
function nomEv(e){return e.k==="visit"?String(e.t).replace(/^Visite\s*/,""):e.t}
function titreEv(e){return e.k==="pc"?e.t:(KT[e.k]||"Rendez-vous")+" · "+nomEv(e)}
function jourTxt(dt){return dt.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})}
function cap(t){return String(t).replace(/^./,function(c){return c.toUpperCase()})}
function prenom(){var h=$("#hello"),t=h?h.textContent:"";return t.replace(/^Bon(jour|soir)\s*/,"").replace(/[.!]\s*$/,"").trim()}
function salut(){var h=$("#hello");return h?h.textContent.replace(/[.!]\s*$/,"").trim():"Bonjour"}
function eur2(n){return Number(n).toLocaleString("fr-FR",{minimumFractionDigits:2,maximumFractionDigits:2})}
function debut(t){t=String(t||"");var p=t.split(" → "),m=(t.match(/\/\d{1,2}\s*$/)||[""])[0];return p[0]+(p[1]&&!/\//.test(p[0])?m:"")}
function clikyOn(){return !!(window.PCOPT&&PCOPT.cliky)}
var SCI='<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8.5V6.5A2.5 2.5 0 0 1 6.5 4h2M15.5 4h2A2.5 2.5 0 0 1 20 6.5v2M20 15.5v2a2.5 2.5 0 0 1-2.5 2.5h-2M8.5 20h-2A2.5 2.5 0 0 1 4 17.5v-2"/><path d="M7 12h10"/></svg>';
var CKI='<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="8" width="14" height="11" rx="4"/><path d="M12 4.8V8"/><circle cx="12" cy="3.6" r="1.3" fill="currentColor" stroke="none"/><circle cx="9.5" cy="13.4" r="1.25" fill="currentColor" stroke="none"/><circle cx="14.5" cy="13.4" r="1.25" fill="currentColor" stroke="none"/></svg>';
function pl(n,un,plus){return n>1?plus:un}
function chDe(e){var C=X.CH||{},c=null;Object.keys(C).forEach(function(k){var y=C[k];if(!c&&y&&(y.id===(e.x&&e.x.ch)||y.n===e.t||(y.n&&String(e.t).indexOf(y.n)>=0)))c=y});return c}
function manque(c){if(!c||!c.four)return null;var m=c.four.filter(function(x){return !/livr|pris/i.test(x[2])&&/manquant/i.test(String(x[1]))})[0];
  if(!m)return null;var n=(String(m[1]).match(/(\d+)\s*manquant/)||[])[1];return {art:m[0],n:n?+n:0,txt:String(m[1])}}
function jour(){var j=A.AUJ(),L=A.evs(A.iso(j)),n=A.nowMin(),soir=A.moment()==="soir",on=-1;
  if(!soir)L.forEach(function(e,k){if(on<0&&A.hm(e.e||e.s)>n)on=k});
  var dm=new Date(j.getTime()+864e5);return {j:j,L:L,on:on,dem:A.evs(A.iso(dm)),soir:soir}}

/* Les choses à faire (même liste que l'ancien Accueil), dans l'ordre */
function aFaire(D){return (D.afaire||[]).filter(function(x){return x[0]>0&&x[1]!=="chantier"&&!(D.demo&&x[1]==="attente")})}
function nbAFaire(D){return (D.afaire||[]).reduce(function(s,x){return s+(x[4]==="suivre"?0:(x[0]||0))},0)}
function ligneAF(x){var n=x[0],lab=String(x[2]).toLowerCase();
  if(x[1]==="fournisseur")return n+" prix fournisseur "+x[3];
  return n+" "+lab+" "+x[3]}

/* ---------- l'Accueil ---------- */
var CACHE={};
/* 26/11 (Cyril : « l'Accueil modifiable, chaque bloc qu'on veut, où on le veut ») : dans « Personnaliser l'accueil »,
   chaque bloc s'affiche ou se cache, monte ou descend (flèches), et sur iPad couché/PC passe à gauche ou à droite.
   Des blocs d'autres pages s'ajoutent (Ma semaine, À encaisser, Dépenses du mois). Gardé avec le compte (tiroir pc-f2-acc). */
var BL=[["scanner","Scanner","g",1],["ouetes","Où êtes-vous ?","g",1],["jour","Ma journée","g",1],["afaire","À faire","g",1],
  ["chiffres","Mes chiffres","d",1],["chantiers","Chantiers en cours","d",1],["creer","Créer","d",1],
  ["semaine","Ma semaine","d",0],["encaisser","À encaisser","d",0],["depenses","Dépenses du mois","g",0]];
var BLN={};BL.forEach(function(x){BLN[x[0]]=x});
function conf(){var c=lsG("pc-f2-acc",null),v=lsG("pc-f2-blocs",{}),o=[],on={},col={};c=c&&typeof c==="object"?c:{};
  (c.ordre||[]).forEach(function(k){if(BLN[k]&&o.indexOf(k)<0)o.push(k)});
  BL.forEach(function(x,i){if(o.indexOf(x[0])<0){var j=-1;for(var n=i-1;n>=0&&j<0;n--)j=o.indexOf(BL[n][0]);o.splice(j+1,0,x[0])}
    on[x[0]]=c.on&&c.on[x[0]]!=null?!!c.on[x[0]]:(v[x[0]]!=null?!!v[x[0]]:!!x[3]);
    col[x[0]]=c.col&&(c.col[x[0]]==="g"||c.col[x[0]]==="d")?c.col[x[0]]:x[2]});
  return {ordre:o,on:on,col:col}}
function blocs(){return conf().on}
/* un bloc qui n'a pas lieu d'être chez cet artisan n'apparaît ni sur l'Accueil ni dans « Personnaliser » */
function ouOff0(){try{var k=sessionStorage.getItem("pc-apercu")==="1"?sessionStorage.getItem("ap:pc-vrai-artisan"):localStorage.getItem("pc-vrai-artisan");var a=JSON.parse(k)||{};return !!(a.menus&&a.menus.ouetes===false)}catch(e){return false}}
function dispo(k){if(k==="scanner")return clikyOn();if(k==="ouetes")return window.PCOU?PCOU.dispo():!ouOff0();return true}
/* 26/11 (Cyril : « les blocs sautent de partout à l'ouverture ») : on ne refait plus tout l'Accueil à chaque petite nouvelle
   (badge, bonjour, données qui arrivent). On compare l'ancien et le nouveau dessin et on ne change QUE ce qui a changé :
   les autres blocs restent exactement à leur place, sans clignoter. La carte « Où êtes-vous ? » (roles.js) n'est jamais retirée. */
function morph(o,n,dep){
  if(o.nodeType===1&&o.id==="f2-slot-ouetes"&&n.id==="f2-slot-ouetes")return;
  if(o.nodeType!==n.nodeType||o.nodeName!==n.nodeName){o.parentNode.replaceChild(n,o);return}
  if(o.nodeType===3||o.nodeType===8){if(o.nodeValue!==n.nodeValue)o.nodeValue=n.nodeValue;return}
  if(o.nodeType!==1)return;
  var oc=[].slice.call(o.childNodes),nc=[].slice.call(n.childNodes);
  if(dep>5||o.className!==n.className||oc.length!==nc.length){if(!o.isEqualNode(n))o.parentNode.replaceChild(n,o);return}
  [].slice.call(o.attributes).forEach(function(at){if(!n.hasAttribute(at.name))o.removeAttribute(at.name)});
  [].slice.call(n.attributes).forEach(function(at){if(o.getAttribute(at.name)!==at.value)o.setAttribute(at.name,at.value)});
  for(var i=0;i<oc.length;i++)morph(oc[i],nc[i],dep+1)}
function poser(app,h){
  if(!app.firstChild){app.innerHTML=h;return}
  var t=document.createElement("div");t.innerHTML=h;
  var oc=[].slice.call(app.childNodes),nc=[].slice.call(t.childNodes);
  if(oc.length!==nc.length){app.innerHTML=h;return}
  for(var i=0;i<oc.length;i++)morph(oc[i],nc[i],0)}
var MQ=window.matchMedia?matchMedia("(min-width:900px) and (min-aspect-ratio:1/1)"):null;
function large(){return !!(MQ&&MQ.matches)}
/* le dessin ne dépend plus de la taille de l'écran (CSS) ; seule la fenêtre « Personnaliser » ouverte se redessine */
if(MQ){var mqf=function(){if($("#f2perso"))persoRemplir()};if(MQ.addEventListener)MQ.addEventListener("change",mqf);else if(MQ.addListener)MQ.addListener(mqf)}
function fa(){try{return (X.cf&&X.cf.FA&&X.cf.FA())||[]}catch(e){return []}}
function nomCli(k){var o=X.DOS&&X.DOS[k];return o&&o.n?o.n:String(k||"")}
function eur0(n){return Math.round(n).toLocaleString("fr-FR")}
function rendre(){var D=A.donnees(),J=jour(),C0=conf(),B=C0.on,h="",H={};
  /* bonjour */
  h+='<div class="titre"><div><div class="date">'+esc(jourTxt(J.j))+"</div><h1>"+esc(salut())+"</h1></div></div>";
  var vco=$("#vco");
  if(vco&&!vco.hidden){var sp=vco.querySelector("span");h+='<div class="demo-b"><span>'+(sp?sp.innerHTML:"<b>Mode démo.</b>")+'</span><button class="pill" type="button" data-f2="connexion" style="height:34px;padding:0 14px;font-size:12.5px">Se connecter</button></div>'}
  h+='<div class="exn">'+(D.demo?"Chiffres d'exemple":"Chiffres, agenda et chantiers d'exemple")+"</div>";
  /* 24/11 (Cyril : « ça fait vide sur iPad ou PC ») : deux colonnes sur grand écran. À gauche ce qu'on fait (demander, scanner, la journée, à faire), à droite ce qu'on regarde (chiffres, chantiers, créer). Sur téléphone : rien ne change, tout reste l'un sous l'autre. */
  var ask='<button class="ask2" type="button" data-f2="parler"><span>Que voulez-vous faire ?</span><span class="mic2">'+ic("mic")+"</span></button>";
  /* Mode Cliky (Cyril 22/11) : une seule entrée, bien visible, seulement avec l'option Cliky. Une photo, une image ou un PDF,
     et Cliky crée ce qu'il sait créer (plan, prix fournisseur, mur…). Remplace « Déposer un document ». */
  if(clikyOn())H.scanner='<button class="f2doc" type="button" data-f2="doc"><span class="rond">'+SCI+'</span><span class="x"><b>Scanner</b><span>Un prix, un plan, une facture… Cliky s\'en occupe</span></span>'+ic("d")+"</button>";

  /* Lien négoce (24/11) : « Valcroix · 1 pose à accepter », une ligne seulement quand une pose attend (negoce.js) */
  if(window.PCNEG&&PCNEG.accueilHTML)ask+=PCNEG.accueilHTML();
  /* « Où êtes-vous ? » : roles.js pose sa carte dans cette place */
  H.ouetes='<div id="f2-slot-ouetes"></div>';
  /* 1. la journée : un seul endroit pour les rendez-vous, ouvre la fenêtre « Le point de la journée » */
  {var L=J.L,hj="";
    hj+='<section class="jr2"><button class="jr2-h" type="button" id="f2-ouvre"><span class="rond">'+ic("cafe")+'</span><span style="flex:1"><span class="lab">Le point de la journée</span><b>'+
      (L.length?L.length+" "+pl(L.length,"rendez-vous","rendez-vous")+" aujourd'hui":"Rien de prévu aujourd'hui")+"</b></span>"+ic("d")+"</button>";
    L.slice(0,4).forEach(function(e,k){var l=A.lieu(e),go=l&&e.k!=="pc"&&!J.soir;
      hj+='<div class="rv'+(k===J.on?" on":"")+'"><span class="hh">'+A.hTxt(e.s)+'</span><span class="x"><b>'+esc(titreEv(e))+"</b><span>"+esc(e.w||"")+"</span></span>"+
        (go?'<button class="rb2" type="button" data-gps="'+esc(l)+'" aria-label="Y aller : '+esc(l)+'">'+ic("nav")+"</button>":"")+"</div>"});
    if(L.length>4)hj+='<button class="dem" type="button" data-accv="planning"><span>Et</span><b>'+(L.length-4)+" autre"+(L.length-4>1?"s":"")+"</b>"+ic("d")+"</button>";
    var dm=J.dem,nl=dm.filter(function(e){return e.k==="liv"}).length,nr=dm.length-nl;
    if(dm.length)hj+='<button class="dem" type="button" data-accv="planning"><span>Demain</span><b>'+[nr?nr+" rendez-vous":"",nl?nl+" livraison"+(nl>1?"s":""):""].filter(Boolean).join(" · ")+"</b>"+ic("d")+"</button>";
    hj+="</section>";H.jour=hj}

  /* 2. à faire : LE plus urgent en vedette, le reste en liste légère */
  var AF=aFaire(D),u=D.urgent,tot=nbAFaire(D);
  if(D.charge&&(u||AF.length)){var ha="";
    ha+='<div class="sec"><h2>À faire</h2>'+(tot?'<button class="lien" type="button" data-accv="devis">'+tot+" en tout"+ic("d")+"</button>":"")+"</div>";
    var pd=AF.filter(function(x){return x[1]==="predevis"})[0],reste=AF.filter(function(x){return x[1]!=="predevis"}),rows=[];
    if(u){var qui=String(u.qui||"").split(" · ")[0];
      /* 25/11 (Cyril) : pastille « Nouveau » tant que la demande n'a pas été ouverte (notifs.js) */
      var uc=(String(u.attr||"").match(/data-vc="([^"]*)"/)||[])[1],nv=!!(uc&&window.PCNotif&&PCNotif.estNouveau(uc.replace(/&amp;/g,"&")));
      ha+='<section class="hero'+(nv?" nv":"")+'"><div class="lab"><span class="pt2"></span>'+(J.soir?"À valider ce soir":"Le plus urgent · à valider")+(nv?PCNotif.pastille():"")+"</div>"+
        (u.prix!=null?'<div class="hero-n">'+eur2(u.prix)+"<small>€ HT</small></div>":"")+'<div class="hero-t">'+esc(qui)+"</div>"+
        '<div class="s mut">'+esc(["Pré-devis",u.quoi,pd&&pd[0]>1?pd[0]+" à valider":""].filter(Boolean).join(" · "))+"</div>"+
        '<button class="pill l" type="button" '+u.attr+' style="margin-top:18px">Vérifier</button></section>'}
    /* connecté : les autres demandes prêtes, avec leurs initiales */
    if(!D.demo){var V=null;try{V=JSON.parse(localStorage.getItem("pc-vrai-liste")||"null")}catch(e){}
      ((V&&V.demandes)||[]).filter(function(x){return /valider/i.test(x.etape||"")}).slice(1,3).forEach(function(x){var n=String(x.client||"?"),ini=n.replace(/^(M\.|Mme|Mlle)\s*/,"").split(/\s+/).map(function(m){return m.charAt(0)}).join("").slice(0,2).toUpperCase();
        rows.push('<button type="button" data-vc="'+esc(x.contact||"")+'"><span class="ini">'+esc(ini)+'</span><span class="x"><b>'+esc(n)+"</b><span>"+esc(["Nouvelle demande",x.resume||x.titre||"",x.ville||""].filter(Boolean).join(" · "))+'</span></span><span class="tag">'+(window.PCNotif&&PCNotif.estNouveau(x.contact)?"Nouveau":"Pré-devis prêt")+'</span></button>')})}
    else if(pd&&pd[0]>1)rows.push('<button type="button" data-accv="devis"><span class="rond">'+ic("doc")+'</span><span class="x"><b>'+(pd[0]-1)+" autre"+(pd[0]>2?"s":"")+" pré-devis à valider</b></span><span class=\"vb\">Vérifier</span></button>");
    /* 24/11 (Cyril : « qu'on sache d'un coup d'œil ce qu'on doit faire ») : chaque ligne finit par le VERBE de l'action, en petit bouton */
    var VB={valider:"Vérifier",envoyer:"Envoyer",ranger:"Ranger",suivre:"Voir"};
    reste.forEach(function(x){rows.push('<button type="button" data-accv="'+x[5]+'"><span class="rond">'+ic(AIC[x[1]]||"doc")+'</span><span class="x"><b>'+esc(ligneAF(x))+"</b>"+(x[6]?"<span>"+esc(x[6])+"</span>":"")+'</span><span class="vb">'+(VB[x[4]]||"Voir")+"</span></button>")});
    if(rows.length>4){var plus=rows.length-3;rows=rows.slice(0,3);rows.push('<button type="button" data-accv="devis"><span class="rond">'+ic("grille")+'</span><span class="x"><b>Et '+plus+" autre"+(plus>1?"s":"")+"</b></span>"+ic("d")+"</button>")}
    if(rows.length)ha+='<div class="liste">'+rows.join("")+"</div>";H.afaire=ha}
  else if(D.charge)H.afaire='<div class="sec"><h2>À faire</h2></div><section class="hero"><div class="lab">Tout est à jour</div><div class="hero-t">Rien à valider ni à envoyer</div><div class="s mut">Le café peut rester chaud.</div></section>';

  /* 3. mes chiffres (exemple de l'Espace, comme avant) : un seul langage, des barres */
  {var MN=["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"][(window.PCDEMO?PCDEMO.today():new Date()).getMonth()],sr=(D.afaire||[]).filter(function(x){return x[1]==="attente"})[0],nsr=D.demo&&sr?sr[0]:0;
    H.chiffres='<div class="sec"><h2>Mes chiffres</h2><span class="lien">'+MN.charAt(0).toUpperCase()+MN.slice(1)+' · HT</span></div>'+
      '<section class="chif2 cv1"><button class="chq" type="button" data-accv="factures"><span class="pt3"></span><span class="x"><b>2 760 € à encaisser</b><span>'+(nsr?"1 facture et "+nsr+" devis sans réponse":"1 facture en attente")+'</span></span><span class="vb">Relancer</span></button><div class="lab">Encaissé en '+MN+'</div><div class="gros">8 640<small>€</small></div><div class="s mut">sur 14 210 € signés</div>'+
      '<div class="seg"><i style="flex:8640"></i><i class="r" style="flex:2760"></i><i class="v" style="flex:2810"></i></div>'+
      '<div class="leg"><span><i></i>Encaissé</span><span><i class="r"></i>À encaisser 2 760 €</span><span><i class="v"></i>Pas encore facturé</span></div>'+
      
      '<div class="dv"><span>Devis signés</span><span class="pts"><i class="on"></i><i class="on"></i><i class="on"></i><i></i><i></i></span><b>3 sur 5</b></div>'+
      "</section>"}

  /* 4. chantiers : liste légère, sans répéter la journée */
  var C=X.CH||{},av=X.avc||function(){return 0},CL=Object.keys(C).map(function(k){return C[k]}).filter(function(c){return c.st==="run"||c.st==="start"});
  /* 24/11 : sous chaque chantier, ce qu'il y a à faire ensuite ; point orange = ça bloque */
  var et={},nPb=0;CL.forEach(function(c){var m=manque(c),ap=(c.four||[]).filter(function(x){return /prévoir|commander/i.test(x[2])})[0];
    if(m){et[c.id]=[(m.n?m.n+" ":"")+m.art.toLowerCase()+" manquant"+(m.n>1?"es":"")+" · à relancer",1];nPb++}
    else if(ap){et[c.id]=["Commande à passer : "+String(ap[0]).split(" · ")[0],1];nPb++}
    else if(c.st==="start")et[c.id]=["Prêt à démarrer · rien à faire",0]});
  if(CL.length){
    H.chantiers='<div class="sec"><h2>Chantiers en cours'+(nPb?'<span class="f2etat f2pb">'+nPb+" à régler</span>":'<span class="f2etat ok">À jour ✓</span>')+'</h2><button class="lien" type="button" data-accv="chantiers">'+CL.length+" en cours"+ic("d")+"</button></div><div class=\"liste\">"+
      CL.slice(0,4).map(function(c){var p=c.st==="run"?Math.round(av(c)||0):0;
        return '<button type="button" data-chouv="'+esc(c.id)+'">'+(c.st==="run"?'<span class="ann2" style="--p:'+p+'">'+p+"</span>":'<span class="rond">'+ic("cal")+"</span>")+
          '<span class="x"><b>'+esc(c.n)+"</b><span>"+esc([c.v||"",c.st==="run"?(c.dates||""):"à démarrer "+debut(c.dates)].filter(Boolean).join(" · "))+"</span>"+
          (et[c.id]?'<span class="f2et'+(et[c.id][1]?" f2pb":"")+'">'+(et[c.id][1]?'<i class="pt3"></i>':"")+esc(et[c.id][0])+"</span>":"")+"</span>"+ic("d")+"</button>"}).join("")+"</div>"}

  /* 5. créer : 5 ronds */
  H.creer='<div class="sec"><h2>Créer</h2></div><div class="ronds r5">'+
    [["predevis","plan","Pré-devis"],["facture","facture","Facture"],["depense","photo","Dépense"],["client","user","Client"],["rdv","cal","RDV"]].map(function(x){
      return '<button type="button" data-f2cree="'+x[0]+'"><span>'+ic(x[1])+"</span>"+x[2]+"</button>"}).join("")+"</div>";
  /* blocs venus d'autres pages (cachés au départ, à ajouter dans « Personnaliser ») */
  if(B.semaine)H.semaine=blocSemaine(J);
  if(B.encaisser)H.encaisser=blocEncaisser();
  if(B.depenses)H.depenses=blocDepenses();
  /* rangés dans l'ordre choisi ; iPad couché/PC : chacun dans sa colonne */
  /* 26/11 : chaque bloc est TOUJOURS dans sa colonne ; sur téléphone et iPad debout, le CSS remet les deux colonnes en une seule
     liste dans l'ordre choisi (style order). Plus de décalage entre le dessin et la taille de l'écran (aperçu iPad à moitié vide). */
  var g=[],dr=[],n=0;
  C0.ordre.forEach(function(k){if(!B[k]||!H[k]||!dispo(k))return;n++;var x='<div class="f2k f2k-'+k+'" style="order:'+n+'">'+H[k]+"</div>";if(C0.col[k]==="d")dr.push(x);else g.push(x)});
  h+='<div class="f2cols"><div class="f2c f2c1">'+ask+g.join("")+'</div><div class="f2c f2c2">'+dr.join("")+"</div></div>";
  h+='<div class="f2pied"><button class="lien" type="button" data-f2="perso">'+ic("grille")+"Personnaliser l'accueil</button></div>";
  if(CACHE.h===h)return;CACHE.h=h;poser(app,h);
  CACHE.D=D;CACHE.J=J}
A.apres=function(){rendre();pjMaj()};
window.PCF2Rendre=function(){CACHE.h=null;rendre()};
/* Ma semaine : les 7 prochains jours, le 1er rendez-vous de chaque jour (+ combien d'autres), touche = Planning */
function blocSemaine(J){var j0=J.j,rows=[],n=0;
  for(var i=1;i<=7;i++){var dj=new Date(j0.getTime()+i*864e5),L=A.evs(A.iso(dj));if(!L.length)continue;n+=L.length;
    rows.push('<button type="button" data-accv="planning"><span class="f2jr"><b>'+cap(dj.toLocaleDateString("fr-FR",{weekday:"short"}).replace(".",""))+"</b>"+dj.getDate()+'</span><span class="x"><b>'+esc(A.hTxt(L[0].s)+" · "+titreEv(L[0]))+"</b><span>"+(L.length>1?"et "+(L.length-1)+" autre"+(L.length>2?"s":"")+" rendez-vous":esc(L[0].w||""))+"</span></span>"+ic("d")+"</button>")}
  return '<div class="sec"><h2>Ma semaine</h2><button class="lien" type="button" data-accv="planning">'+(n?n+" rendez-vous":"Planning")+ic("d")+"</button></div>"+
    (rows.length?'<div class="liste">'+rows.slice(0,5).join("")+"</div>":'<section class="hero"><div class="hero-t">Rien de prévu cette semaine</div><div class="s mut">Ajoutez un rendez-vous depuis « Créer ».</div></section>')}
/* À encaisser : factures envoyées pas encore payées, et celles prêtes à partir */
function blocEncaisser(){var F=fa(),att=F.filter(function(f){return f.st==="attente"}),pr=F.filter(function(f){return f.st==="pret"}),tot=0,t=function(f){try{return X.cf.ftot(f).ttc}catch(e){return 0}};
  att.forEach(function(f){tot+=t(f)});
  var rows=att.slice(0,3).map(function(f){return '<button type="button" data-accv="factures"><span class="rond">'+ic("facture")+'</span><span class="x"><b>'+esc(nomCli(f.cli))+" · "+eur2(t(f))+" €</b><span>Envoyée "+esc(f.env||"")+'</span></span><span class="vb">Relancer</span></button>'})
    .concat(pr.slice(0,2).map(function(f){return '<button type="button" data-accv="factures"><span class="rond">'+ic("envoi")+'</span><span class="x"><b>'+esc(nomCli(f.cli))+" · "+eur2(t(f))+' €</b><span>Prête, pas encore envoyée</span></span><span class="vb">Envoyer</span></button>'}));
  return '<div class="sec"><h2>À encaisser</h2><button class="lien" type="button" data-accv="factures">Factures'+ic("d")+"</button></div>"+
    (rows.length?'<section class="f2tot"><span class="lab">Attendu de vos clients</span><b>'+eur0(tot)+"<small>€ TTC</small></b></section>"+'<div class="liste">'+rows.join("")+"</div>":'<section class="hero"><div class="hero-t">Tout est encaissé</div><div class="s mut">Aucune facture en attente.</div></section>')}
/* Dépenses du mois : total, tickets à ranger, bouton Ajouter */
function blocDepenses(){var L=(window.PCDEP&&PCDEP.liste())||[],n=A.AUJ(),m=n.getFullYear()+"-"+("0"+(n.getMonth()+1)).slice(-2),M=L.filter(function(x){return String(x.j||"").slice(0,7)===m}),tot=0,ar=L.filter(function(x){return x.ranger}).length;
  M.forEach(function(x){tot+=+x.ttc||0});
  var MN=n.toLocaleDateString("fr-FR",{month:"long"});
  return '<div class="sec"><h2>Dépenses du mois</h2><button class="lien" type="button" data-accv="depenses">'+M.length+" en "+MN+ic("d")+"</button></div>"+
    '<section class="f2tot"><span class="lab">Dépensé en '+MN+'</span><b>'+eur0(tot)+'<small>€ TTC</small></b>'+(ar?'<button type="button" class="f2et f2pb" data-accv="depenses"><i class="pt3"></i>'+ar+" ticket"+(ar>1?"s":"")+" à ranger</button>":"")+
    '<button class="pill l" type="button" data-f2cree="depense" style="margin-top:14px">Ajouter une dépense</button></section>'}


/* ---------- les appuis ---------- */
function nav(v){var n=$("#nb-"+v)||$("#tt-"+v);if(n)n.click()}
function apres(fn){setTimeout(fn,160)}
function cree(k){
  if(k==="predevis"){var q=$$(".pcq button")[0];if(q)q.click();return}
  if(k==="facture"){nav("factures");apres(function(){if(X.nouveauDoc)X.nouveauDoc("facture")});return}
  if(k==="depense"){nav("depenses");apres(function(){var b=$("[data-depadd]");if(b)b.click()});return}
  if(k==="client"){nav("clients");apres(function(){var b=$("[data-cadd]");if(b)b.click()});return}
  if(k==="rdv"){if(window.PCPLAN&&PCPLAN.fiche)PCPLAN.fiche({d:A.iso(A.AUJ())});else nav("planning")}}
function perso(){X.xopen("Personnaliser l'accueil",large()?"Affichez, cachez, montez ou descendez un bloc, ou changez-le de côté":"Affichez, cachez, montez ou descendez un bloc",
    '<div class="f2perso" id="f2perso"></div>','<button class="btn go" data-xclose style="width:100%">C\'est bon</button>',function(){persoRemplir()})}
function persoRemplir(){var box=$("#f2perso");if(!box)return;var c=conf(),lg=large(),UP='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 15l6-6 6 6"/></svg>',DN='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
  var ks=c.ordre.filter(dispo);
  function ligne(k,L,i){var on=c.on[k];
    return '<div class="f2pl'+(on?"":" off")+'"><button type="button" class="f2sw" role="switch" aria-checked="'+on+'" data-f2b="'+k+'"><i aria-hidden="true"></i><span>'+esc(BLN[k][1])+"</span></button>"+
      (lg?'<button type="button" class="f2fl f2cote" data-f2c="'+k+'">'+(c.col[k]==="d"?"À gauche":"À droite")+"</button>":"")+
      '<button type="button" class="f2fl" data-f2m="'+k+'" data-s="-1"'+(i===0?" disabled":"")+' aria-label="Monter '+esc(BLN[k][1])+'">'+UP+"</button>"+
      '<button type="button" class="f2fl" data-f2m="'+k+'" data-s="1"'+(i===L.length-1?" disabled":"")+' aria-label="Descendre '+esc(BLN[k][1])+'">'+DN+"</button></div>"}
  function liste(L){return L.map(function(k,i){return ligne(k,L,i)}).join("")}
  if(lg){var G=ks.filter(function(k){return c.col[k]==="g"}),Dd=ks.filter(function(k){return c.col[k]==="d"});
    box.innerHTML='<div class="f2pt">Colonne de gauche</div>'+(G.length?liste(G):'<div class="f2pv">Aucun bloc</div>')+'<div class="f2pt">Colonne de droite</div>'+(Dd.length?liste(Dd):'<div class="f2pv">Aucun bloc</div>')}
  else box.innerHTML=liste(ks);
  function garde(){var sc=box.closest("[class*=x-in],#x-in")||box.parentNode,y=sc?sc.scrollTop:0;lsS("pc-f2-acc",c);CACHE.h=null;rendre();persoRemplir();if(sc)sc.scrollTop=y}
  $$("[data-f2b]",box).forEach(function(b){b.onclick=function(){c.on[b.dataset.f2b]=!c.on[b.dataset.f2b];garde()}});
  $$("[data-f2c]",box).forEach(function(b){b.onclick=function(){var k=b.dataset.f2c;c.col[k]=c.col[k]==="d"?"g":"d";garde()}});
  $$("[data-f2m]",box).forEach(function(b){b.onclick=function(){var k=b.dataset.f2m,st=+b.dataset.s,
      L=c.ordre.filter(function(x){return dispo(x)&&(!lg||c.col[x]===c.col[k])}),i=L.indexOf(k),o=L[i+st];if(!o)return;
      var a1=c.ordre.indexOf(k),a2=c.ordre.indexOf(o);c.ordre[a1]=o;c.ordre[a2]=k;garde();
      var nb=$('[data-f2m="'+k+'"][data-s="'+st+'"]');if(nb&&!nb.disabled)nb.focus()}})}
/* « Déposer un document » : un seul endroit pour tout ce qu'on photographie (Cyril 22/11 : « le chemin doit être plus simple et plus visible »).
   Fournisseur : Cliky lit la facture, le devis, le bon ou le tarif (sans choisir le fournisseur d'abord).
   Plan : la photo est prise ici, un nouveau plan s'ouvre et Cliky la lit tout de suite (plan-photo.js).
   Mur : la photo se rattache à un mur, donc on ouvre ses plans et on touche le mur. */
var fiPlan=null;
function prixTxt(p){var v=Number(p.p!=null?p.p:(p.pu!=null?p.pu:p.pc));if(!isFinite(v)||v<=0)return "";
  return v.toLocaleString("fr-FR",{minimumFractionDigits:2,maximumFractionDigits:2})+" € HT"+(p.u?" / "+p.u:"")}
function scResultats(t){var r=$("#sc-r");if(!r)return;t=(t||"").trim();
  if(!t){r.innerHTML="";r.hidden=true;return}
  var L=(window.PCPROD&&PCPROD.chercher)?PCPROD.chercher(t):[];var sa=function(x){return String(x||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase()},qq=sa(t);L=L.map(function(p,i){return {p:p,i:i,r:(sa(p.d).indexOf(qq)>=0?0:2)+(p.k==="prestation"?1:0)}}).sort(function(a,b){return a.r-b.r||a.i-b.i}).map(function(o){return o.p});r.hidden=false;
  if(!L.length){r.innerHTML='<p class="sc-vide">Rien pour « '+esc(t)+' » dans votre base. Scannez le tarif ou la facture du fournisseur : Cliky l\'ajoute.</p>';return}
  r.innerHTML=L.slice(0,6).map(function(p){var ico=(PCPROD.iconeDe?PCPROD.iconeDe(p):"");
    return '<button type="button" class="sc-l" data-sc-c="'+esc(p.c||"")+'"><span class="sc-i">'+ico+'</span><span class="sc-d">'+esc(p.d)+(p.ex?'<small>Exemple</small>':"")+'</span><b>'+prixTxt(p)+'</b><span class="sc-crayon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 20h4l11-11-4-4L4 16z"/></svg></span></button>'}).join("")+
    (L.length>6?'<button type="button" class="sc-tout" data-sc-tout>Voir les '+L.length+" résultats</button>":"")}
function deposer(){
  X.xopen("Scanner","Cherchez un prix (touchez-le pour le changer), ou prenez une photo",
    '<div class="f2sc"><label class="sc-q"><svg class="i" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg><input id="sc-q" type="search" autocomplete="off" enterkeyhint="search" placeholder="Un produit, un prix… « BA13 »"><button type="button" class="sc-mic" id="sc-mic" aria-label="Dicter">'+ic("mic")+'</button></label><div class="sc-r" id="sc-r" hidden></div></div>'+
    '<p class="f2sc-t">Ou prenez une photo</p>'+
    '<div class="f2dc"><button type="button" data-f2dc="four"><span class="f2dc-i">'+ic("facture")+'</span><span><b>Les prix d\'un fournisseur</b><small>Facture, devis, bon de livraison ou tarif : Cliky met vos prix à jour et range l\'achat dans le chantier</small></span></button>'+
    '<button type="button" data-f2dc="plan"><span class="f2dc-i">'+ic("plan")+'</span><span><b>Un plan</b><small>D\'architecte, de vente ou un croquis : Cliky le dessine, pièce par pièce</small></span></button>'+
    '<button type="button" data-f2dc="mur"><span class="f2dc-i">'+ic("photo")+'</span><span><b>Un mur vu de face</b><small>Ouvrez le plan du client, touchez le mur, puis « Photo » : Cliky note ce qui est déjà en place</small></span></button></div>',
    '<button class="btn" data-xclose style="width:100%">Fermer</button>',function(){
      var qi=$("#sc-q");if(qi){qi.addEventListener("input",function(){scResultats(qi.value)})}
      var r=$("#sc-r");if(r)r.addEventListener("click",function(e){var l=e.target.closest("[data-sc-c]");if(l&&window.PCPROD&&PCPROD.editPrix){PCPROD.editPrix(l,l.getAttribute("data-sc-c"),function(){scResultats(qi?qi.value:"")});return}
        if(e.target.closest("[data-sc-tout],[data-sc-c]")){var t=qi?qi.value:"";X.xclose();nav("produits");
        setTimeout(function(){var q=$("#pr-q");if(q){q.value=t;q.dispatchEvent(new Event("input",{bubbles:true}))}},350)}});
      var SR=window.SpeechRecognition||window.webkitSpeechRecognition,mic=$("#sc-mic"),ec=null;
      if(mic)mic.addEventListener("click",function(){
        if(!SR){X.toast("Dictée","Touchez le micro du clavier, en bas à côté de la barre d\'espace.");qi.focus();return}
        if(ec){ec.stop();return}
        ec=new SR();ec.lang="fr-FR";ec.interimResults=true;mic.classList.add("on");
        ec.onresult=function(ev){var t="";for(var i=0;i<ev.results.length;i++)t+=ev.results[i][0].transcript;qi.value=t.replace(/[.?!]$/,"");scResultats(qi.value)};
        ec.onend=ec.onerror=function(){mic.classList.remove("on");ec=null};try{ec.start()}catch(e){ec=null;mic.classList.remove("on")}});
      $$("[data-f2dc]").forEach(function(b){b.addEventListener("click",function(){var k=b.dataset.f2dc;
        if(k==="four"){X.xclose();if(window.PCPROD&&PCPROD.deposer)PCPROD.deposer("");return}
        if(k==="plan"){
          if(!fiPlan){fiPlan=d.createElement("input");fiPlan.type="file";fiPlan.accept="image/*,application/pdf";fiPlan.hidden=true;d.body.appendChild(fiPlan);
            fiPlan.addEventListener("change",function(){var f=fiPlan.files&&fiPlan.files[0];fiPlan.value="";if(!f)return;X.xclose();
              /* 26/11 (Cyril) : un plan NEUF dans Mes plans, plus le brouillon partagé « Nouveau relevé » (il gardait l'ancien plan et ses fenêtres) */
              if(window.PCPLANS&&PCPLANS.photo){PCPLANS.photo(f);return}
              window.PC_PLAN_PHOTO=f;var o=$('[data-openplan="Nouveau relevé"]');if(o)o.click();
              var fr=$("#pcov-f");setTimeout(function(){try{if(fr&&fr.contentWindow)fr.contentWindow.postMessage({pcPlanPhoto:1},"*")}catch(e){}},700)})}
          fiPlan.click();return}
        if(k==="mur"){X.xclose();if(window.PCPLANS&&PCPLANS.liste)PCPLANS.liste();X.toast("La photo d'un mur","Ouvrez le plan du client, touchez le mur, puis « Photo » : Cliky la lit.")}})})})}
function agir(el){var v;
  if((v=el.getAttribute("data-f2"))){
    if(v==="connexion"){var b=$("#vco button");if(b)b.click()}
    else if(v==="parler"){var s=$("#speak");if(s)s.click()}
    else if(v==="perso")perso();
    else if(v==="doc")deposer();
    return true}
  if((v=el.getAttribute("data-f2cree"))){cree(v);return true}
  if((v=el.getAttribute("data-chouv"))){nav("chantiers");apres(function(){if(window.PCCH)PCCH.ouvrir(v)});return true}
  if((v=el.getAttribute("data-accv"))){if(v==="entretiens"){nav("clients");var sg=$('[data-clseg="ent"]');if(sg)sg.click()}else nav(v);return true}
  if(el.hasAttribute("data-accdemo")){var t=$("#todo [data-open]");if(t)t.click();return true}
  return false}
var SEL="[data-f2],[data-f2cree],[data-chouv],[data-accv],[data-accdemo]";
app.addEventListener("click",function(e){
  if(e.target.closest("#f2-ouvre")){pjOuvre(e.target.closest("#f2-ouvre"));return}
  var el=e.target.closest(SEL);if(el&&app.contains(el))agir(el)});

/* =================== Fenêtre « Le point de la journée » (figée le 21/11) =================== */
var wrap=d.createElement("div");wrap.className="f2";wrap.id="f2pjw";
wrap.innerHTML='<div class="pj" id="f2pj" role="dialog" aria-modal="true" aria-labelledby="f2pj-t"><div class="f" id="f2pj-f"><span class="poignee" id="f2pj-p" aria-hidden="true"></span><div class="vues"><section class="vue v1" id="f2pj-1"></section><section class="vue v2" id="f2pj-2" aria-live="polite"></section></div></div></div>';
d.body.appendChild(wrap);
var pj=$("#f2pj"),f=$("#f2pj-f"),v1=$("#f2pj-1"),v2=$("#f2pj-2"),src=null,tuileSrc=null,cur=null,ORDRE=[],DET={};
var EZ="cubic-bezier(.2,.85,.15,1)",reduit=matchMedia("(prefers-reduced-motion: reduce)").matches;
v2.setAttribute("inert","");pj.hidden=true;
function lg(i,t){return '<div class="lg"><span class="tic">'+ic(i)+"</span><span>"+t+"</span></div>"}
function bt(t,i,c,attr){return '<button class="pill l'+(c?" c":"")+'" type="button" '+(attr||"")+">"+(i?ic(i):"")+t+"</button>"}
/* 26/11 Cyril : « propose-moi une fenêtre note du jour plus jolie ». 3 formes (rien ne déborde) :
   1 = Liste, 2 = Chiffres, 3 = Fil (CHOISIE par Cyril 26/11 : les rendez-vous sur un trait, les choses à faire en liste SANS trait, pour ne pas ressembler au Planning). ?pj=0 = l'ancienne. */
var FV=(function(){var m=location.search.match(/[?&]pj=(\d)/);if(m)return +m[1];var v=+lsG("pc-pj-forme",3);return v>=0&&v<=3?v:3})();
function chev(){return '<span class="nch">'+ic("d")+"</span>"}
function pjForme(RV,tf){var h="";
  if(FV===3){h+='<div class="nf">'+RV.map(function(r){return '<button class="tu nfl'+(r.now?" now":"")+'" type="button" data-d="'+r.k+'"><span class="nh">'+r.h+'</span><span class="np"></span><span class="ntx"><b>'+esc(r.t)+"</b><small>"+esc(r.s)+(r.he?" · jusqu’à "+r.he:"")+"</small></span>"+chev()+"</button>"}).join("")+"</div>";return h}
  if(FV===2&&RV.length===1){var r=RV[0];return '<div class="grt">Votre rendez-vous</div><button class="tu nrv'+(r.now?" now":"")+'" type="button" data-d="'+r.k+'"><span class="nh">'+r.h+'</span><span class="ntx"><b>'+esc(r.t)+"</b><small>"+esc(r.s)+"</small></span>"+chev()+"</button>"}
  h+='<div class="grt">'+(RV.length>1?"Vos rendez-vous, dans l’ordre":"Votre rendez-vous")+'</div><div class="nl-box">'+RV.map(function(r){return '<button class="tu nl'+(r.now?" now":"")+'" type="button" data-d="'+r.k+'"><span class="nh">'+r.h+'</span><span class="ntx"><b>'+esc(r.t)+"</b><small>"+esc(r.s)+"</small></span>"+chev()+"</button>"}).join("")+"</div>";return h}
function nbDe(x){var m=String(x[3]).match(/^(\d+)\s+(.*)$/);return m?[m[1],m[2]]:["",x[3]]}
function pjFaire(tf){
  if(FV===2)return '<div class="grt">À faire aujourd\'hui</div><div class="nc" style="grid-template-columns:repeat('+tf.length+',minmax(0,1fr))">'+tf.map(function(x){var n=nbDe(x);
    return '<button class="tu ncc'+(x[1]?" "+x[1]:"")+'" type="button" data-d="'+x[0]+'"><span class="nv1">'+esc(x[2])+'</span><span class="nn">'+n[0]+'</span><b>'+esc(n[1])+"</b><small>"+esc(x[4])+"</small></button>"}).join("")+"</div>";
  if(FV===-3)return '<div class="grt">Dans la journée</div><div class="nf nf2">'+tf.map(function(x){return '<button class="tu nfl nft'+(x[1]?" "+x[1]:"")+'" type="button" data-d="'+x[0]+'"><span class="nh">'+ic(x[5])+'</span><span class="np"></span><span class="ntx"><b>'+esc(x[2])+" "+esc(x[3])+"</b><small>"+esc(x[4])+"</small></span>"+chev()+"</button>"}).join("")+"</div>";
  return '<div class="grt">À faire aujourd\'hui</div><div class="nl-box">'+tf.map(function(x){return '<button class="tu nl nlf'+(x[1]?" "+x[1]:"")+'" type="button" data-d="'+x[0]+'"><span class="nr">'+ic(x[5])+'</span><span class="ntx"><b>'+esc(x[2])+" "+esc(x[3])+"</b><small>"+esc(x[4])+"</small></span>"+(x[1]?'<i class="npt"></i>':"")+chev()+"</button>"}).join("")+"</div>"}
/* le contenu de la fenêtre, tiré de la vraie journée */
function pjContenu(){var D=A.donnees(),J=jour(),L=J.L,AF=aFaire(D),u=D.urgent,tu=[],tf=[],k=0,RV=[];DET={};
  var p=prenom(),n=A.nowMin();
  L.slice(0,3).forEach(function(e,i){var key="rv"+i,l=A.lieu(e),c=chDe(e),nom=nomEv(e),sm=[e.k==="pc"?"ProClik":String(nom).replace(/^Cabinet\s+/,""),e.k==="pc"?"20 min":l].filter(Boolean).join(" · ");
    var now=i===J.on&&!J.soir,dl=[],ac="";
    if(c){var et=c.ouv&&c.ouv.filter(function(o){return o[2]<100})[0];if(et)dl.push(["chantier","Aujourd’hui : <b>"+esc(et[0])+"</b> · "+et[2]+" % fait"]);
      var m=manque(c);if(m)dl.push(["camion","Commandé : <b>"+esc(m.art)+"</b> · "+esc(m.n?m.n+" manquante"+(m.n>1?"s":""):m.txt)]);
      if(c.dates)dl.push(["cal","En cours · "+esc(c.dates)])}
    else{if(e.w)dl.push([e.k==="visit"?"alerte":"bulle",esc(String(e.w).split(" · ").slice(e.k==="pc"?0:1).join(" · ")||e.w)]);
      if(e.e)dl.push(["horloge",A.hTxt(e.s)+" → "+A.hTxt(e.e)])}
    if(l&&e.k!=="pc")ac+=bt("Y aller","nav",0,'data-gps="'+esc(l)+'"');
    if(c)ac+=bt("Voir le chantier","",1,'data-chouv="'+esc(c.id)+'"');else ac+=bt("Voir dans le planning","cal",1,'data-accv="planning"');
    var pc=c?Math.round((X.avc||function(){return 0})(c)||0):0;
    DET[key]={i:KI[e.k]||"cal",lai:now,lab:now?'<span style="color:var(--laiton)">'+A.hTxt(e.s)+(e.e?" → "+A.hTxt(e.e):"")+" · "+(KT[e.k]||"rendez-vous").toLowerCase()+"</span>":A.hTxt(e.s)+" · "+(KT[e.k]||"rendez-vous").toLowerCase(),
      t:nom,s:String(e.w||"").split(" · ")[0]+(c&&/jour \d/.test(e.w||"")?" · "+(String(e.w).match(/jour \d+ sur \d+/)||[""])[0]:""),
      c:pc?'<div class="chif"><span class="big">'+pc+'<small>% du chantier</small></span></div><div class="bar"><i style="width:'+pc+'%"></i></div>':"",l:dl,a:ac};
    RV.push({k:key,now:now,i:KI[e.k]||"cal",h:A.hTxt(e.s),he:e.e?A.hTxt(e.e):"",t:KT[e.k]||"Rendez-vous",s:sm});
    tu.push('<button class="tu'+(now?" now":"")+'" type="button" data-d="'+key+'" style="transition-delay:'+(k++*.05)+'s"><span class="tic">'+ic(KI[e.k]||"cal")+'</span><span><span class="hh">'+A.hTxt(e.s)+"</span><b>"+esc(KT[e.k]||"Rendez-vous")+"</b><small>"+esc(sm)+"</small></span></button>")});
  /* à faire aujourd'hui : 3 cases au plus */
  var pd=AF.filter(function(x){return x[1]==="predevis"})[0];
  if(pd&&u){var qui=String(u.qui||"").split(" · ")[0];
    DET.predevis={i:"doc",lab:'<span style="color:var(--rose)">'+ic("alerte")+"Le plus urgent · à valider</span>",t:pd[0]+" "+pl(pd[0],"pré-devis","pré-devis"),s:qui+(u.quoi?" · "+u.quoi:""),
      c:u.prix!=null?'<div class="chif"><span class="big">'+eur2(u.prix)+"<small>€ HT</small></span></div>":"",
      l:(pd[0]>1?[["doc","Et "+(pd[0]-1)+" autre"+(pd[0]>2?"s":"")+" pré-devis à valider"]]:[]).concat([["check","Vérifiez, corrigez une ligne si besoin, validez"]]),a:bt("Vérifier","check",0,u.attr)};
    tf.push(["predevis","urg","Valider",pd[0]+" "+pl(pd[0],"pré-devis","pré-devis"),"à vérifier","doc"])}
  var fa=AF.filter(function(x){return x[1]==="facture"})[0];
  if(fa){DET.facture={i:"facture",lab:"À envoyer",t:fa[0]+" "+pl(fa[0],"facture","factures"),s:"Prête"+(fa[0]>1?"s":"")+", il ne reste qu’à l’envoyer",l:[["envoi","Envoyée par e-mail au client"],["euro","Elle passe dans « À encaisser »"]],a:bt("Voir et envoyer","envoi",0,'data-accv="factures"')};
    tf.push(["facture","","Envoyer",fa[0]+" "+pl(fa[0],"facture","factures"),"prête"+(fa[0]>1?"s":""),"facture"])}
  var CL=X.CH||{},mq=null,mc=null;Object.keys(CL).forEach(function(kk){var c=CL[kk];if(!mq&&c&&c.st==="run"){var m=manque(c);if(m){mq=m;mc=c}}});
  if(mq&&mq.n){DET.livraison={i:"camion",lab:'<span style="color:#B7791F">'+ic("alerte")+"Livraison incomplète</span>",t:mq.art,s:"Chantier "+mc.n+(mc.v?" · "+mc.v:""),
      c:'<div class="chif"><span class="big">'+mq.n+"<small>"+(mq.n>1?"manquantes":"manquante")+"</small></span></div>",l:[["chantier","Pour le chantier de "+esc(mc.v||mc.n)],["camion","Commandées chez le fournisseur"]],a:bt("Voir le chantier","camion",1,'data-chouv="'+esc(mc.id)+'"')};
    tf.push(["livraison","att","Attention",mq.n+" "+String(mq.art).toLowerCase(),mq.n>1?"manquantes":"manquante","camion"])}
  AF.forEach(function(x){if(tf.length>=3||/predevis|facture|attente/.test(x[1]))return;
    DET[x[1]]={i:AIC[x[1]]||"doc",lab:esc(cap(x[3])),t:x[0]+" "+String(x[2]).toLowerCase(),s:x[6]||"",l:[],a:bt("Voir","",0,'data-accv="'+x[5]+'"')};
    tf.push([x[1],x[1]==="fournisseur"?"att":"",x[1]==="depense"?"Ranger":"Vérifier",x[0]+" "+String(x[2]).toLowerCase(),x[3],AIC[x[1]]||"doc"])});
  tf=tf.slice(0,3);
  var tfH=tf.map(function(x){return '<button class="tu'+(x[1]?" "+x[1]:"")+'" type="button" data-d="'+x[0]+'" style="transition-delay:'+(k++*.05)+'s"><span class="tic">'+ic(x[5])+'</span><span><span class="hh">'+x[2]+"</span><b>"+esc(x[3])+"</b><small>"+esc(x[4])+"</small></span></button>"}).join("");
  /* la phrase : le premier rendez-vous, ou la journée légère / libre */
  var res,f0=L[0];
  if(!L.length)res="Rien de prévu aujourd’hui.<br><b>Journée libre</b>, le café peut prendre son temps.";
  else if(L.length===1)res="Un seul rendez-vous aujourd’hui, à <b>"+A.hTxt(f0.s)+"</b>."+(pd?"<br>Et "+pd[0]+" "+pl(pd[0],"pré-devis","pré-devis")+" à valider.":"");
  else res="Premier rendez-vous à <b>"+A.hTxt(f0.s)+"</b>"+(/run|plan/.test(f0.k)&&A.lieu(f0)?", sur le chantier de "+esc(A.lieu(f0)):f0.k==="visit"?", visite chez "+esc(nomEv(f0)):f0.k==="liv"?", une livraison":"")+".";
  var g="";
  if(L.length)g+='<div class="grt">Vos rendez-vous, dans l\'ordre</div><div class="gr" style="grid-template-columns:repeat('+Math.min(3,L.length)+',minmax(0,1fr))">'+tu.join("")+"</div>";
  else{var pr=A.prochain(),pe=pr?A.evs(A.iso(pr))[0]:null;
    if(pe){var l0=A.lieu(pe);DET.prochain={i:KI[pe.k]||"cal",lab:cap(pr.toLocaleDateString("fr-FR",{weekday:"long"}))+" · "+A.hTxt(pe.s),t:nomEv(pe),s:l0||"",l:pe.w?[["cal",esc(pe.w)]]:[],a:bt("Voir dans le planning","cal",1,'data-accv="planning"')};
      g+='<div class="grt">Prochain rendez-vous</div><div class="gr" style="grid-template-columns:1fr"><button class="tu" type="button" data-d="prochain"><span class="tic">'+ic(KI[pe.k]||"cal")+'</span><span><span class="hh">'+cap(pr.toLocaleDateString("fr-FR",{weekday:"long"}))+" · "+A.hTxt(pe.s)+"</span><b>"+esc(KT[pe.k]||"Rendez-vous")+"</b><small>"+esc([nomEv(pe),l0].filter(Boolean).join(" · "))+"</small></span></button></div>"}
    var en=(X.D||[]).filter(function(x){return x.statut==="sent"})[0];
    if(D.demo&&en&&!tf.length){DET.relance={i:"envoi",lab:"Si vous avez un moment",t:"1 devis en attente",s:en.client+" · "+en.ville,l:[["envoi","Un petit message suffit, ProClik le prépare"]],a:bt("Voir le devis","",1,'data-accv="devis"')};
      g+='<div class="grt">Si vous avez un moment</div><div class="gr" style="grid-template-columns:1fr"><button class="tu" type="button" data-d="relance"><span class="tic">'+ic("envoi")+'</span><span><span class="hh">Relancer</span><b>1 devis en attente</b><small>'+esc(en.client)+" · sans réponse</small></span></button></div>"}}
  if(FV&&L.length)g=pjForme(RV,tf);else if(FV)g=g.replace(/<div class="gr"[^>]*>/g,'<div class="nl-box">').replace(/class="tu"/g,'class="tu nl"');
  if(FV&&tf.length)g+=pjFaire(tf);else if(tf.length)g+='<div class="grt">À faire aujourd\'hui</div><div class="gr" style="grid-template-columns:repeat('+tf.length+',minmax(0,1fr))">'+tfH+"</div>";
  pj.classList.toggle("nv",!!FV);pj.classList.remove("k1","k2","k3");if(FV)pj.classList.add("k"+FV);
  if(FV){v1.innerHTML='<div class="top"><div><span class="nj">'+ic("cal")+esc(cap(jourTxt(J.j)))+'</span><h2 id="f2pj-t">'+esc(salut())+' !<span>Voici votre journée.</span></h2></div><button class="x" type="button" data-ferme aria-label="Fermer">'+ic("x")+"</button></div>"+
    '<p class="resume">'+res+"</p>"+g+'<div class="bas"><button class="pill l go" type="button" data-ferme>C\'est parti</button><div class="ask"><button type="button" data-f2pjmic aria-label="Parler à ProClik">'+ic("mic")+"</button></div></div>";
    ORDRE=$$(".tu",v1).map(function(b){return b.getAttribute("data-d")});return}
  v1.innerHTML='<div class="top"><h2 id="f2pj-t">'+esc(salut())+(p?"":"")+' !<span>voici votre journée.</span></h2><button class="x" type="button" data-ferme aria-label="Fermer">'+ic("x")+"</button></div>"+
    '<span class="heure">'+ic("cal")+esc(jourTxt(J.j))+"</span>"+'<p class="resume">'+res+'</p><div class="vide"></div>'+g+
    '<div class="bas"><button class="pill l go" type="button" data-ferme>C\'est parti</button><div class="ask"><button type="button" data-f2pjmic aria-label="Parler à ProClik">'+ic("mic")+"</button></div></div>";
  ORDRE=$$(".tu",v1).map(function(b){return b.getAttribute("data-d")})}
function pjMaj(){if(!pj.classList.contains("vis"))return;if(!v2.classList.contains("on"))pjContenu()}
function carte(k){var D=DET[k];
  return '<div class="top" style="padding:0"><button class="retour" type="button" data-retour id="f2pj-r">'+ic("d")+'Ma journée</button><button class="x" type="button" data-retour aria-label="Revenir à ma journée">'+ic("x")+"</button></div>"+
    '<div class="grand"><span class="rond'+(D.lai?" lai":"")+'">'+ic(D.i)+'</span><span><span class="lab">'+D.lab+"</span><h3>"+esc(D.t)+'</h3></span></div><div class="sous">'+esc(D.s)+"</div>"+(D.c||"")+
    (D.l.length?'<div class="lignes">'+D.l.map(function(x){return lg(x[0],x[1])}).join("")+"</div>":"")+'<div class="act">'+D.a+"</div>"+
    (ORDRE.length>1?'<div class="pts">'+ORDRE.map(function(o){return "<i"+(o===k?' class="on"':"")+"></i>"}).join("")+"</div>":"")}
function clipDe(el,b){var r=el.getBoundingClientRect(),q=b.getBoundingClientRect();return "inset("+(r.top-q.top)+"px "+(q.right-r.right)+"px "+(q.bottom-r.bottom)+"px "+(r.left-q.left)+"px round 22px)"}
function vis(el){if(!el)return false;var r=el.getBoundingClientRect();return r.width>0&&r.bottom>0&&r.top<innerHeight}
function voir(k,tu,sens){if(!DET[k])return;tuileSrc=tu;cur=k;v2.innerHTML=carte(k);if(sens)return;
  v2.classList.add("on");v1.classList.add("dessous");v2.scrollTop=0;v1.setAttribute("inert","");v2.removeAttribute("inert");
  if(!reduit&&tu){v2.animate([{clipPath:clipDe(tu,v2)},{clipPath:"inset(0 0 0 0 round 28px)"}],{duration:480,easing:EZ});
    [].forEach.call(v2.children,function(c,i){c.animate([{opacity:0,transform:"translateY(14px)"},{opacity:1,transform:"none"}],{duration:380,delay:120+i*40,easing:EZ,fill:"backwards"})});
    v1.animate([{transform:"scale(1)",opacity:1},{transform:"scale(.96)",opacity:.4}],{duration:480,easing:EZ})}
  setTimeout(function(){var r=$("#f2pj-r");if(r)r.focus({preventScroll:true})},480)}
function retour(vite){if(!v2.classList.contains("on"))return;v1.classList.remove("dessous");
  var fin=function(){v2.classList.remove("on");v2.setAttribute("inert","");v1.removeAttribute("inert");if(tuileSrc&&!vite&&tuileSrc.isConnected)tuileSrc.focus({preventScroll:true})};
  if(vite||reduit||!tuileSrc||!tuileSrc.isConnected)return fin();
  v1.animate([{transform:"scale(.96)",opacity:.4},{transform:"scale(1)",opacity:1}],{duration:420,easing:EZ});
  v2.animate([{clipPath:"inset(0 0 0 0 round 28px)"},{clipPath:clipDe(tuileSrc,v2),opacity:.3}],{duration:420,easing:EZ}).onfinish=fin}
/* glisser à gauche / à droite dans la case ouverte : la case voisine arrive, collée à 14 px */
var gx=null,gy=0,gdx=0,glisse=false,fant=null,fk=null,ESP=14,vientDeGlisser=0,pid=null,t0g=0,finir=null;
function pose(dx){var w=v2.offsetWidth+ESP,rot=" rotate("+(dx/60)+"deg)";v2.style.transform="translateY(-50%) translateX("+dx+"px)"+rot;
  var sens=dx<0?1:-1,k=ORDRE[ORDRE.indexOf(cur)+sens];
  if(!k){if(fant){fant.remove();fant=null;fk=null}return}
  if(fk!==k){if(!fant){fant=d.createElement("section");fant.className="vue v2 on fant";fant.setAttribute("inert","");fant.setAttribute("aria-hidden","true");v2.parentNode.appendChild(fant)}
    fant.innerHTML=carte(k).replace('id="f2pj-r"',"");fk=k}
  fant.style.transform="translateY(-50%) translateX("+(dx+sens*w)+"px)"+rot}
function dansCarte(e){if(!v2.classList.contains("on"))return false;var r=v2.getBoundingClientRect();return e.clientY>=r.top-10&&e.clientY<=r.bottom+10}
pj.addEventListener("pointerdown",function(e){if(!dansCarte(e)||e.target.closest("button"))return;if(finir)finir();gx=e.clientX;gy=e.clientY;gdx=0;glisse=false;pid=e.pointerId;t0g=Date.now()});
pj.addEventListener("pointermove",function(e){if(gx===null)return;gdx=e.clientX-gx;
  if(!glisse&&Math.abs(gdx)>8&&Math.abs(gdx)>Math.abs(e.clientY-gy)){glisse=true;try{pj.setPointerCapture(pid)}catch(_){}}
  if(glisse){var i=ORDRE.indexOf(cur),bord=(gdx>0&&i===0)||(gdx<0&&i===ORDRE.length-1);pose(bord?gdx/4:gdx)}});
function lache(){if(gx===null)return;gx=null;if(!glisse){v2.style.transform="";return}
  vientDeGlisser=Date.now();var vit=Math.abs(gdx)/Math.max(1,Date.now()-t0g),i=ORDRE.indexOf(cur)+(gdx<0?1:-1),w=v2.offsetWidth+ESP,dep=v2.style.transform,fdep=fant&&fant.style.transform;
  if((Math.abs(gdx)<50&&vit<.35)||i<0||i>=ORDRE.length){v2.style.transform="";v2.animate([{transform:dep},{transform:"translateY(-50%)"}],{duration:380,easing:EZ});
    if(fant){var f0=fant,s0=gdx<0?1:-1;fant=null;fk=null;f0.animate([{transform:fdep},{transform:"translateY(-50%) translateX("+(s0*w)+"px)"}],{duration:380,easing:EZ}).onfinish=function(){f0.remove()}}return}
  var sens=gdx<0?1:-1,k=ORDRE[i],f1=fant,ez="cubic-bezier(.25,.8,.25,1)",fait=false;fant=null;fk=null;
  finir=function(){if(fait)return;fait=true;finir=null;voir(k,v1.querySelector('.tu[data-d="'+k+'"]'),sens);v2.getAnimations().forEach(function(x){x.cancel()});v2.style.transform="";if(f1)f1.remove()};
  v2.animate([{transform:dep},{transform:"translateY(-50%) translateX("+(-sens*w)+"px) rotate("+(-sens*5)+"deg)"}],{duration:560,easing:ez,fill:"forwards"});
  if(f1)f1.animate([{transform:fdep},{transform:"translateY(-50%)"}],{duration:560,easing:ez,fill:"forwards"}).onfinish=function(){finir&&finir()};else finir()}
pj.addEventListener("pointerup",lache);pj.addEventListener("pointercancel",lache);
pj.addEventListener("click",function(e){
  if(Date.now()-vientDeGlisser<400){e.preventDefault();e.stopPropagation();return}
  if(e.target===pj)return ferme();
  if(v2.classList.contains("on")&&!e.target.closest("#f2pj-2"))return retour();
  if(e.target.closest("[data-f2pjmic]")){ferme();setTimeout(function(){var s=$("#speak");if(s)s.click()},300);return}
  if(e.target.closest("[data-ferme]"))return ferme();
  if(e.target.closest("[data-retour]"))return retour();
  var a=e.target.closest("[data-chouv],[data-accv],[data-accdemo]");if(a){ferme();setTimeout(function(){agir(a)},250);return}
  if(e.target.closest("[data-gps],[data-vc]")){ferme();return}
  var b=e.target.closest("[data-d]");if(b)voir(b.getAttribute("data-d"),b)});
var appEl=$(".app");
function pjOuvre(depuis){pj.hidden=false;pjContenu();src=depuis||null;retour(true);pj.classList.add("on","vis");d.body.classList.add("pjo");d.body.style.overflow="hidden";f.style.transform="";
  if(reduit)return;
  if(vis(src)){f.animate([{clipPath:clipDe(src,f),opacity:.6},{clipPath:"inset(0 0 0 0 round 34px)",opacity:1}],{duration:560,easing:EZ});
    v1.animate([{opacity:0,transform:"translateY(18px)"},{opacity:1,transform:"none"}],{duration:420,delay:140,easing:EZ,fill:"backwards"})}
  else f.animate([{transform:"translateY(105%)"},{transform:"none"}],{duration:520,easing:EZ})}
function ferme(){if(!pj.classList.contains("vis"))return;pj.classList.remove("on");d.body.classList.remove("pjo");d.body.style.overflow="";
  var fin=function(){pj.classList.remove("vis");pj.hidden=true;f.style.transform="";retour(true)};if(reduit)return fin();
  var dep=f.style.transform||"none",cible=vis(src)&&src.id==="f2-ouvre"?src:null;
  if(cible)f.animate([{transform:dep,clipPath:"inset(0 0 0 0 round 34px)",opacity:1},{transform:"none",clipPath:clipDe(cible,f),opacity:.2}],{duration:460,easing:EZ}).onfinish=fin;
  else f.animate([{transform:dep},{transform:"translateY(105%)"}],{duration:380,easing:"cubic-bezier(.4,0,.8,.4)"}).onfinish=fin}
/* glisser vers le bas pour fermer (poignée ou haut de la fenêtre) ; dans une case ouverte : retour à la journée */
var y0=null,dy=0,t0=0;
f.addEventListener("pointerdown",function(e){if(e.target.closest("button,input,a"))return;var r=f.getBoundingClientRect();if(e.target.id!=="f2pj-p"&&e.clientY-r.top>90)return;
  y0=e.clientY;dy=0;t0=Date.now();try{f.setPointerCapture(e.pointerId)}catch(_){}});
f.addEventListener("pointermove",function(e){if(y0===null)return;dy=e.clientY-y0;f.style.transform="translateY("+(dy>0?dy:dy/6)+"px)";
  if(appEl)appEl.style.transform="scale("+(.94+Math.min(.06,Math.max(0,dy)/3000))+")"});
f.addEventListener("pointerup",function(){if(y0===null)return;y0=null;if(appEl)appEl.style.transform="";var v=dy/Math.max(1,Date.now()-t0);
  if((dy>110||v>.6)&&v2.classList.contains("on")){var d0=f.style.transform;f.style.transform="";f.animate([{transform:d0},{transform:"none"}],{duration:380,easing:EZ});retour()}
  else if(dy>110||v>.6)ferme();else{var dp=f.style.transform;f.style.transform="";f.animate([{transform:dp},{transform:"none"}],{duration:380,easing:EZ})}});
f.addEventListener("pointercancel",function(){y0=null;f.style.transform="";if(appEl)appEl.style.transform=""});
d.addEventListener("keydown",function(e){if(e.key==="Escape"&&pj.classList.contains("vis")){if(v2.classList.contains("on"))retour();else ferme()}});
window.PCPJ={ouvrir:function(){pjOuvre(null)},fermer:ferme};

/* à la 1re ouverture du jour : on attend que le logo, la présentation et la connexion soient partis */
function auDebut(){var t=new Date(),j=t.getFullYear()+"-"+(t.getMonth()+1)+"-"+t.getDate();
  if(/[?&]point=non/.test(location.search)||(lsG("pc-f2-pj","")===j&&!/[?&]point=oui/.test(location.search)))return;
  var essais=0;(function guette(){essais++;if(essais>80)return;
    var w=$("#welcome"),occupe=$("#pc-ouv")||$("#pc-ouk")||(w&&!w.hidden)||$(".x-scrim.on,#x.on,.sheet.on")||!visible();
    if(occupe)return setTimeout(guette,400);lsS("pc-f2-pj",j);pjOuvre(null)})()}

/* l'entrée « Scanner » (mode Cliky) du menu (barre du bas, panneau du galet, menu de côté), seulement avec l'option */
function entreeMenu(){var nav=$("nav.nav");if(!nav)return;var b=$("#nb-cliky"),ch=false;
  if(!b){b=d.createElement("button");b.type="button";b.id="nb-cliky";b.setAttribute("data-pbx","");b.setAttribute("data-opt","cliky");
    b.innerHTML='<span class="ico" aria-hidden="true">'+SCI.replace(' class="i"',"")+"</span>Scanner";b.addEventListener("click",function(e){e.preventDefault();e.stopImmediatePropagation();deposer()});nav.appendChild(b);ch=true}
  var h=!clikyOn();if(b.hidden!==h){b.hidden=h;ch=true}
  if(ch&&window.PCBarre&&PCBarre.applique)PCBarre.applique()}
entreeMenu();setInterval(entreeMenu,3000);
rendre();
addEventListener("load",function(){CACHE.h=null;rendre()});
/* l'ancien Accueil se redessine (badges, vraies demandes) : on suit */
["#badge","#badge-f","#badge-d"].forEach(function(id){var b=$(id);if(b)new MutationObserver(function(){CACHE.h=null;rendre()}).observe(b,{childList:true,characterData:true,subtree:true,attributes:true,attributeFilter:["hidden"]})});
d.addEventListener("pc-notifs",function(){CACHE.h=null;rendre()}); /* un pré-devis ouvert ou arrivé (notifs.js) */
var hl=$("#hello");if(hl)new MutationObserver(function(){CACHE.h=null;rendre()}).observe(hl,{childList:true,characterData:true,subtree:true});
setTimeout(auDebut,600);
})();
