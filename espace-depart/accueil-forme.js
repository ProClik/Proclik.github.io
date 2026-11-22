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
couleur();addEventListener("storage",couleur);

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
function blocs(){return Object.assign({jour:true,afaire:true,chiffres:true,chantiers:true,creer:true},lsG("pc-f2-blocs",{}))}
function rendre(){var D=A.donnees(),J=jour(),B=blocs(),h="";
  /* bonjour */
  h+='<div class="titre"><div><div class="date">'+esc(jourTxt(J.j))+"</div><h1>"+esc(salut())+"</h1></div></div>";
  var vco=$("#vco");
  if(vco&&!vco.hidden){var sp=vco.querySelector("span");h+='<div class="demo-b"><span>'+(sp?sp.innerHTML:"<b>Mode démo.</b>")+'</span><button class="pill" type="button" data-f2="connexion" style="height:34px;padding:0 14px;font-size:12.5px">Se connecter</button></div>'}
  h+='<div class="exn">'+(D.demo?"Chiffres d'exemple":"Chiffres, agenda et chantiers d'exemple")+"</div>";
  h+='<button class="ask2" type="button" data-f2="parler"><span>Que voulez-vous faire ?</span><span class="mic2">'+ic("mic")+"</span></button>";
  /* Déposer un document (Cyril 22/11 : « bien trop compliqué à trouver ») : tout de suite, sans choisir le fournisseur d'abord, Cliky le lit */
  h+='<button class="f2doc" type="button" data-f2="doc"><span class="rond">'+ic("photo")+'</span><span class="x"><b>Déposer un document</b><span>Facture, bon de livraison, devis fournisseur</span></span>'+ic("d")+"</button>";

  /* 1. la journée : un seul endroit pour les rendez-vous, ouvre la fenêtre « Le point de la journée » */
  if(B.jour){var L=J.L;
    h+='<section class="jr2"><button class="jr2-h" type="button" id="f2-ouvre"><span class="rond">'+ic("cafe")+'</span><span style="flex:1"><span class="lab">Le point de la journée</span><b>'+
      (L.length?L.length+" "+pl(L.length,"rendez-vous","rendez-vous")+" aujourd'hui":"Rien de prévu aujourd'hui")+"</b></span>"+ic("d")+"</button>";
    L.slice(0,4).forEach(function(e,k){var l=A.lieu(e),go=l&&e.k!=="pc"&&!J.soir;
      h+='<div class="rv'+(k===J.on?" on":"")+'"><span class="hh">'+A.hTxt(e.s)+'</span><span class="x"><b>'+esc(titreEv(e))+"</b><span>"+esc(e.w||"")+"</span></span>"+
        (go?'<button class="rb2" type="button" data-gps="'+esc(l)+'" aria-label="Y aller : '+esc(l)+'">'+ic("nav")+"</button>":"")+"</div>"});
    if(L.length>4)h+='<button class="dem" type="button" data-accv="planning"><span>Et</span><b>'+(L.length-4)+" autre"+(L.length-4>1?"s":"")+"</b>"+ic("d")+"</button>";
    var dm=J.dem,nl=dm.filter(function(e){return e.k==="liv"}).length,nr=dm.length-nl;
    if(dm.length)h+='<button class="dem" type="button" data-accv="planning"><span>Demain</span><b>'+[nr?nr+" rendez-vous":"",nl?nl+" livraison"+(nl>1?"s":""):""].filter(Boolean).join(" · ")+"</b>"+ic("d")+"</button>";
    h+="</section>"}

  /* 2. à faire : LE plus urgent en vedette, le reste en liste légère */
  var AF=aFaire(D),u=D.urgent,tot=nbAFaire(D);
  if(B.afaire&&D.charge&&(u||AF.length)){
    h+='<div class="sec"><h2>À faire</h2>'+(tot?'<button class="lien" type="button" data-accv="devis">'+tot+" en tout"+ic("d")+"</button>":"")+"</div>";
    var pd=AF.filter(function(x){return x[1]==="predevis"})[0],reste=AF.filter(function(x){return x[1]!=="predevis"}),rows=[];
    if(u){var qui=String(u.qui||"").split(" · ")[0];
      h+='<section class="hero"><div class="lab"><span class="pt2"></span>'+(J.soir?"À valider ce soir":"Le plus urgent · à valider")+"</div>"+
        (u.prix!=null?'<div class="hero-n">'+eur2(u.prix)+"<small>€ HT</small></div>":"")+'<div class="hero-t">'+esc(qui)+"</div>"+
        '<div class="s mut">'+esc(["Pré-devis",u.quoi,pd&&pd[0]>1?pd[0]+" à valider":""].filter(Boolean).join(" · "))+"</div>"+
        '<button class="pill l" type="button" '+u.attr+' style="margin-top:18px">Vérifier</button></section>'}
    /* connecté : les autres demandes prêtes, avec leurs initiales */
    if(!D.demo){var V=null;try{V=JSON.parse(localStorage.getItem("pc-vrai-liste")||"null")}catch(e){}
      ((V&&V.demandes)||[]).filter(function(x){return /valider/i.test(x.etape||"")}).slice(1,3).forEach(function(x){var n=String(x.client||"?"),ini=n.replace(/^(M\.|Mme|Mlle)\s*/,"").split(/\s+/).map(function(m){return m.charAt(0)}).join("").slice(0,2).toUpperCase();
        rows.push('<button type="button" data-vc="'+esc(x.contact||"")+'"><span class="ini">'+esc(ini)+'</span><span class="x"><b>'+esc(n)+"</b><span>"+esc(["Nouvelle demande",x.resume||x.titre||"",x.ville||""].filter(Boolean).join(" · "))+'</span></span><span class="tag">Pré-devis prêt</span></button>')})}
    else if(pd&&pd[0]>1)rows.push('<button type="button" data-accv="devis"><span class="rond">'+ic("doc")+'</span><span class="x"><b>'+(pd[0]-1)+" autre"+(pd[0]>2?"s":"")+" pré-devis à valider</b></span>"+ic("d")+"</button>");
    reste.forEach(function(x){rows.push('<button type="button" data-accv="'+x[5]+'"><span class="rond">'+ic(AIC[x[1]]||"doc")+'</span><span class="x"><b>'+esc(ligneAF(x))+"</b>"+(x[6]?"<span>"+esc(x[6])+"</span>":"")+"</span>"+ic("d")+"</button>")});
    if(rows.length>4){var plus=rows.length-3;rows=rows.slice(0,3);rows.push('<button type="button" data-accv="devis"><span class="rond">'+ic("grille")+'</span><span class="x"><b>Et '+plus+" autre"+(plus>1?"s":"")+"</b></span>"+ic("d")+"</button>")}
    if(rows.length)h+='<div class="liste">'+rows.join("")+"</div>"}
  else if(B.afaire&&D.charge)h+='<div class="sec"><h2>À faire</h2></div><section class="hero"><div class="lab">Tout est à jour</div><div class="hero-t">Rien à valider ni à envoyer</div><div class="s mut">Le café peut rester chaud.</div></section>';

  /* 3. mes chiffres (exemple de l'Espace, comme avant) : un seul langage, des barres */
  if(B.chiffres){var sr=(D.afaire||[]).filter(function(x){return x[1]==="attente"})[0],nsr=D.demo&&sr?sr[0]:0;
    h+='<div class="sec"><h2>Mes chiffres</h2><span class="lien">Octobre · HT</span></div>'+
      '<section class="chif2 cv1"><div class="lab">Encaissé en octobre</div><div class="gros">8 640<small>€</small></div><div class="s mut">sur 14 210 € signés</div>'+
      '<div class="seg"><i style="flex:8640"></i><i class="r" style="flex:2760"></i><i class="v" style="flex:2810"></i></div>'+
      '<div class="leg"><span><i></i>Encaissé</span><span><i class="r"></i>À encaisser 2 760 €</span><span><i class="v"></i>Pas encore facturé</span></div>'+
      '<button class="act2" type="button" data-accv="factures"><span>2 760 € à encaisser</span><b>Relancer</b>'+ic("d")+"</button>"+
      '<div class="dv"><span>Devis signés</span><span class="pts"><i class="on"></i><i class="on"></i><i class="on"></i><i></i><i></i></span><b>3 sur 5</b></div>'+
      (nsr?'<button class="act2" type="button" data-accv="devis" style="border-top:0;padding-top:2px"><span>'+nsr+" devis sans réponse</span><b>Relancer</b>"+ic("d")+"</button>":"")+"</section>"}

  /* 4. chantiers : liste légère, sans répéter la journée */
  var C=X.CH||{},av=X.avc||function(){return 0},CL=Object.keys(C).map(function(k){return C[k]}).filter(function(c){return c.st==="run"||c.st==="start"});
  if(B.chantiers&&CL.length){
    h+='<div class="sec"><h2>Chantiers en cours</h2><button class="lien" type="button" data-accv="chantiers">'+CL.length+" en cours"+ic("d")+"</button></div><div class=\"liste\">"+
      CL.slice(0,4).map(function(c){var p=c.st==="run"?Math.round(av(c)||0):0;
        return '<button type="button" data-chouv="'+esc(c.id)+'">'+(c.st==="run"?'<span class="ann2" style="--p:'+p+'">'+p+"</span>":'<span class="rond">'+ic("cal")+"</span>")+
          '<span class="x"><b>'+esc(c.n)+"</b><span>"+esc([c.v||"",c.st==="run"?(c.dates||""):"à démarrer "+debut(c.dates)].filter(Boolean).join(" · "))+"</span></span>"+ic("d")+"</button>"}).join("")+"</div>"}

  /* 5. créer : 5 ronds */
  if(B.creer)h+='<div class="sec"><h2>Créer</h2></div><div class="ronds r5">'+
    [["predevis","plan","Pré-devis"],["facture","facture","Facture"],["depense","photo","Dépense"],["client","user","Client"],["rdv","cal","RDV"]].map(function(x){
      return '<button type="button" data-f2cree="'+x[0]+'"><span>'+ic(x[1])+"</span>"+x[2]+"</button>"}).join("")+"</div>";
  h+='<div class="f2pied"><button class="lien" type="button" data-f2="perso">'+ic("grille")+"Personnaliser l'accueil</button></div>";
  if(CACHE.h===h)return;CACHE.h=h;app.innerHTML=h;
  CACHE.D=D;CACHE.J=J}
A.apres=function(){rendre();pjMaj()};

/* ---------- les appuis ---------- */
function nav(v){var n=$("#nb-"+v)||$("#tt-"+v);if(n)n.click()}
function apres(fn){setTimeout(fn,160)}
function cree(k){
  if(k==="predevis"){var q=$$(".pcq button")[0];if(q)q.click();return}
  if(k==="facture"){nav("factures");apres(function(){if(X.nouveauDoc)X.nouveauDoc("facture")});return}
  if(k==="depense"){nav("depenses");apres(function(){var b=$("[data-depadd]");if(b)b.click()});return}
  if(k==="client"){nav("clients");apres(function(){var b=$("[data-cadd]");if(b)b.click()});return}
  if(k==="rdv"){if(window.PCPLAN&&PCPLAN.fiche)PCPLAN.fiche({d:A.iso(A.AUJ())});else nav("planning")}}
function perso(){var B=blocs(),N=[["jour","Ma journée"],["afaire","À faire"],["chiffres","Mes chiffres"],["chantiers","Chantiers en cours"],["creer","Créer"]];
  X.xopen("Personnaliser l'accueil","Touchez pour afficher ou cacher un bloc",
    '<div class="f2perso">'+N.map(function(x){return '<button type="button" role="switch" aria-checked="'+(B[x[0]]!==false)+'" data-f2b="'+x[0]+'"><span>'+x[1]+'</span><i aria-hidden="true"></i></button>'}).join("")+"</div>",
    '<button class="btn go" data-xclose style="width:100%">C\'est bon</button>',function(){
      $$("[data-f2b]").forEach(function(b){b.addEventListener("click",function(){var on=b.getAttribute("aria-checked")!=="true";b.setAttribute("aria-checked",String(on));B[b.dataset.f2b]=on;lsS("pc-f2-blocs",B);CACHE.h=null;rendre()})})})}
function agir(el){var v;
  if((v=el.getAttribute("data-f2"))){
    if(v==="connexion"){var b=$("#vco button");if(b)b.click()}
    else if(v==="parler"){var s=$("#speak");if(s)s.click()}
    else if(v==="perso")perso();
    else if(v==="doc"){if(window.PCPROD&&PCPROD.deposer)PCPROD.deposer("");else X.toast("Pas encore disponible","Le dépôt de document arrive avec Cliky.")}
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
/* le contenu de la fenêtre, tiré de la vraie journée */
function pjContenu(){var D=A.donnees(),J=jour(),L=J.L,AF=aFaire(D),u=D.urgent,tu=[],tf=[],k=0;DET={};
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
  if(tf.length)g+='<div class="grt">À faire aujourd\'hui</div><div class="gr" style="grid-template-columns:repeat('+tf.length+',minmax(0,1fr))">'+tfH+"</div>";
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

rendre();
addEventListener("load",function(){CACHE.h=null;rendre()});
/* l'ancien Accueil se redessine (badges, vraies demandes) : on suit */
["#badge","#badge-f","#badge-d"].forEach(function(id){var b=$(id);if(b)new MutationObserver(function(){CACHE.h=null;rendre()}).observe(b,{childList:true,characterData:true,subtree:true,attributes:true,attributeFilter:["hidden"]})});
var hl=$("#hello");if(hl)new MutationObserver(function(){CACHE.h=null;rendre()}).observe(hl,{childList:true,characterData:true,subtree:true});
setTimeout(auDebut,600);
})();
