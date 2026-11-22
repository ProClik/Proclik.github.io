/* Lot 8 du nouvel Espace : Achats à la forme des maquettes du 21/11 (achats.html, achats-cas1/cas2, achats-prix, commandes).
   Petit titre au-dessus d'« Achats » (« 1 réponse à regarder »…), rond + qui fait l'action de l'onglet,
   une grande carte pour ce qui demande l'attention (réponse fournisseur, chantier à commander), listes épurées,
   « Mes prix » : un seul bouton « Accepter les N prix » (toucher une ligne = garder l'ancien prix).
   Rien n'est inventé : tout vient des demandes, commandes et chantiers de l'Espace. ?forme=0 = ancien. */
(function(){"use strict";
if(/[?&]forme=0\b/.test(location.search))return;
var d=document,X=window.PCX,$=function(s,c){return (c||d).querySelector(s)},$$=function(s,c){return [].slice.call((c||d).querySelectorAll(s))};
var v=$("#v-prix");if(!v||!X)return;
var esc=X.esc||function(s){return String(s)},SUP=X.SUP||{},DOS=X.DOS||{},CH=X.CH||{};
var I=function(p){return '<svg viewBox="0 0 24 24" aria-hidden="true">'+p+'</svg>'};
var IC={plus:I('<path d="M12 5v14M5 12h14"/>'),photo:I('<rect x="3" y="6" width="18" height="14" rx="3"/><circle cx="12" cy="13" r="3.5"/><path d="M8.5 6l1.5-2.5h4L15.5 6"/>'),
  mail:I('<path d="M3 11l18-8-8 18-2-8z"/><path d="M11 13l10-10"/>'),file:I('<path d="M13 3H6v18h12V8z"/><path d="M13 3v5h5M9 13h6M9 17h4"/>'),
  liv:I('<circle cx="12" cy="12" r="8.5"/><path d="M8 12.5l3 3 5-6"/>'),cmd:I('<path d="M3 7h11v9H3z"/><path d="M14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/>')};
var ini=function(n){return String(n||"").split(/\s+/).filter(function(w){return /^[A-ZÉÈÀ]/.test(w)}).map(function(w){return w[0]}).join("").slice(0,2)||"·"};
var pl=function(n,s,p){return n+" "+(n>1?(p||s+"s"):s)};
var DP=function(){return X.DP||[]},CMD=function(){return X.CMD?X.CMD():[]};
function onglet(){var b=$("#achseg button[aria-selected=true]");return b?b.getAttribute("data-a"):"four"}
function aPrevoir(k){var c=CH[k];return ((c.four||[]).concat(c.extra||[])).filter(function(x){return x[2]==="à prévoir"})}
function aCmd(){return Object.keys(CH).filter(function(k){return CH[k].st!=="done"&&aPrevoir(k).length})}
/* le prix lu par l'IA : « 428,00 € (avant : 412,00 €) » → écart par unité */
function num(s){return parseFloat(String(s).replace(/\s/g,"").replace(",","."))}
function ecart(x){var r=(x.ia||[]).filter(function(a){return /prix/i.test(a[0])})[0];if(!r)return null;
  var m=String(r[1]).match(/([\d\s.,]+)\s*€.*avant\s*:\s*([\d\s.,]+)\s*€/i);if(!m)return null;var a=num(m[1]),b=num(m[2]);if(isNaN(a)||isNaN(b))return null;return {n:a,o:b,e:a-b}}
var eur=function(n){var r=Math.round(n*100)/100;return (r%1?r.toFixed(2).replace(".",","):String(r))};

/* ---- en-tête : petit titre + rond + ---- */
function tete(){var row=$(".row",v);if(!row)return;var h=$(".f2a-hd",v);
  if(!h){h=d.createElement("div");h.className="f2a-hd";h.innerHTML='<div class="f2a-t"><small class="f2a-ey"></small><h2>Achats</h2></div><button type="button" class="f2a-plus" aria-label="Ajouter">'+IC.plus+'</button>';
    row.insertBefore(h,row.firstChild);$(".f2a-plus",h).addEventListener("click",plus)}
  var o=onglet(),t="",D=DP();
  if(o==="four"){var r=D.filter(function(x){return x.st==="recu"}).length,w=D.filter(function(x){return x.st==="wait"}).length;t=r?pl(r,"réponse")+" à regarder":w?pl(w,"demande")+" en attente":""}
  else if(o==="prix"){var n=$$("#upd .upd:not(.done)").length;t=n?pl(n,"prix","prix")+" à mettre à jour":"Vos prix sont à jour"}
  else if(o==="cmd"){var c=CMD().filter(function(x){return x.st!=="livree"}).length;t=c?pl(c,"commande")+" en route":""}
  var e=$(".f2a-ey",h);if(e.textContent!==t)e.textContent=t;
  var lab=o==="four"?"Nouvelle demande de prix":o==="prix"?"Ajouter un tarif":"Nouvelle commande";$(".f2a-plus",h).setAttribute("aria-label",lab);
}
function plus(){var o=onglet();
  if(o==="four"){var b=$("#newdp");if(b)b.click()}
  else if(o==="prix"){var a=$('#a-prix [data-add="photo"]');if(a)a.click()}
  else{var c=$("#a-cmd [data-cmdnew]");if(c)c.click()}}

/* ---- Fournisseurs : la réponse à regarder en grand, la liste épurée ---- */
var ST={wait:"Sans réponse",recu:"Réponse lue",done:"Commandé",sent:"Envoyée"};
function four(){var L=$("#dplist");if(!L)return;var D=DP(),R=D.filter(function(x){return x.st==="recu"}),x=R[0];
  var hero=$("#f2a-hero4");
  if(!x){if(hero)hero.parentNode.removeChild(hero)}
  else{var s=SUP[x.sup]||{n:""},o=DOS[x.dos]||{n:"",t:""},e=ecart(x),it=(x.items||[])[0]||["",""];
    var big=e?'<b class="f2a-big">'+(e.e>0?"+":e.e<0?"−":"")+eur(Math.abs(e.e))+'</b><span class="f2a-u">€ '+(e.e?"par unité":"pas de changement")+'</span>':'<b class="f2a-big f2a-bt">Réponse lue</b>';
    var h='<div class="sec-h f2a-sh"><h2>'+(R.length>1?"Réponses à regarder":"Réponse à regarder")+'</h2>'+(R.length>1?'<span>'+R.length+'</span>':'')+'</div>'+
      '<div class="card f2a-hero"><small class="f2a-src">'+esc(s.n)+' · '+esc(x.got||"")+'</small><div class="f2a-l">'+big+'</div>'+
      '<b class="f2a-qui">'+esc(o.n)+' · '+esc(o.t)+'</b><small class="f2a-det">'+(e?eur(e.o)+' → '+eur(e.n)+' € · ':'')+esc(it[1]+" · "+it[0])+'</small>'+
      '<button type="button" class="btn go f2a-go" data-f2dp="'+esc(x.id)+'">Voir les prix</button></div>';
    if(!hero){hero=d.createElement("div");hero.id="f2a-hero4";var col=L.closest(".col");col.insertBefore(hero,col.firstChild)}
    if(hero.dataset.k!==h){hero.dataset.k=h;hero.innerHTML=h}}
  $$("button[data-dp]",L).forEach(function(b){var y=D.filter(function(z){return z.id===b.getAttribute("data-dp")})[0];if(!y)return;
    b.classList.toggle("f2a-cache",!!x&&y.id===x.id);if(b.dataset.f2a===y.st)return;b.dataset.f2a=y.st;
    var s=SUP[y.sup]||{n:""},o=DOS[y.dos]||{n:"",t:""},av=$(".av",b),sm=$$(".tx small",b);
    if(av)av.textContent=ini(s.n);
    if(sm[0])sm[0].textContent=o.n+" · "+o.t;
    if(sm[1]){sm[1].className="f2a-st f2a-"+y.st;sm[1].textContent=y.st==="wait"?"Sans réponse depuis "+(y.since||"hier"):y.st==="recu"?"Réponse "+(y.got||""):y.st==="done"?"Commandé "+(y.cmd||"")+(y.liv?" · livré "+y.liv:""):"Envoyée "+(y.sent||"")}});
  var tip=$("#a-four .f2a-tip");if(!tip){var c=L.parentNode;tip=d.createElement("p");tip.className="hint f2a-tip";tip.textContent="ProClik prépare vos demandes sans vos prix de vente, et lit les réponses pour vous.";c.insertBefore(tip,L.nextSibling)}}
d.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("[data-f2dp]");if(!b)return;var r=$('#dplist [data-dp="'+b.getAttribute("data-f2dp")+'"]');if(r)r.click()});

/* ---- Mes prix : un seul bouton, toucher une ligne = la garder ou la refuser ---- */
function prix(){var U=$("#upd");if(!U)return;
  $$(".upd",U).forEach(function(u){if(u.dataset.f2a)return;u.dataset.f2a="1";u.setAttribute("tabindex","0");
    u.addEventListener("click",function(e){if(e.target.closest("button"))return;if(u.classList.contains("done"))return;$$(".upd.f2a-ouv",U).forEach(function(z){if(z!==u)z.classList.remove("f2a-ouv")});u.classList.toggle("f2a-ouv")})});
  var n=$$(".upd:not(.done)",U).length,ok=$("#okall");if(ok){var t=n>1?"Accepter les "+n+" prix":"Accepter ce prix";if(ok.textContent!==t)ok.textContent=t}
  var hp=$("#a-prix .f2a-hp");if(!hp&&ok){hp=d.createElement("p");hp.className="hint f2a-hp";hp.textContent="Pour garder un ancien prix, touchez sa ligne. Les devis déjà envoyés ne changent pas.";ok.parentNode.insertBefore(hp,ok.nextSibling)}
  $$('#a-prix .adds button').forEach(function(b){if(b.dataset.f2a)return;b.dataset.f2a="1";var k=b.getAttribute("data-add"),s=$("span",b);if(s)s.innerHTML=k==="photo"?IC.photo:k==="mail"?IC.mail:IC.file});
  var ad=$("#a-prix .adds");if(ad&&!$("#a-prix .f2a-ha")){var p=d.createElement("p");p.className="hint f2a-ha";p.textContent="Vous ne tapez jamais vos prix : ProClik les lit pour vous.";ad.parentNode.insertBefore(p,ad.nextSibling)}}

/* ---- Commandes : le chantier à commander en grand ---- */
function cmd(){var z=$("#a-cmd");if(!z||!$(".cf",z))return;var K=aCmd(),k=K[0],hero=$("#f2a-heroc",z);
  if(!k){if(hero)hero.parentNode.removeChild(hero)}
  else{var c=CH[k],n=aPrevoir(k).length,sous=[c.st==="run"||c.st==="cours"?"Chantier en cours":"Chantier",c.v||c.ville||""].filter(Boolean).join(" · ");
    var h='<div class="sec-h f2a-sh"><h2>À commander</h2><span>pris dans vos chantiers</span></div><div class="card f2a-hero"><small class="f2a-src">'+esc(sous)+'</small>'+
      '<div class="f2a-l"><b class="f2a-big">'+n+'</b><span class="f2a-u">'+(n>1?"articles":"article")+' à prévoir</span></div><b class="f2a-qui">'+esc(c.n)+'</b>'+(c.t?'<small class="f2a-det">'+esc(c.t)+'</small>':'')+
      '<button type="button" class="btn go f2a-go" data-cmdnew="'+esc(k)+'">Préparer la commande</button></div>';
    var col=$(".col",z);if(!hero){hero=d.createElement("div");hero.id="f2a-heroc";col.insertBefore(hero,col.firstChild)}if(hero.dataset.k!==h){hero.dataset.k=h;hero.innerHTML=h}}
  $$(".cf-l [data-cmdnew]",z).forEach(function(b){b.classList.toggle("f2a-cache",b.getAttribute("data-cmdnew")===k)});
  var a=$$(".col",z)[0],sh=a&&$$(".sec-h",a).filter(function(s){return !s.classList.contains("f2a-sh")})[0];if(sh){var rest=$$(".cf-l [data-cmdnew]:not(.f2a-cache)",z).length;sh.classList.toggle("f2a-cache",true);var l=sh.nextElementSibling;if(l&&l.classList.contains("cf-l"))l.classList.toggle("f2a-vide",!rest)}
  $$(".cf-l [data-cmd]",z).forEach(function(b){if(b.dataset.f2a)return;b.dataset.f2a="1";var av=$(".cf-av",b),c=CMD().filter(function(x){return x.id===b.getAttribute("data-cmd")})[0];
    if(av&&c){av.className="cf-av f2a-ini";av.textContent=ini((SUP[c.sup]||{}).n)}})}

var file=0;function tout(){file=0;tete();four();prix();cmd()}
function plus1(){if(file)return;file=1;requestAnimationFrame(tout)}
new MutationObserver(function(m){if(m.some(function(r){var t=r.target;return !(t.closest&&t.closest("#f2a-hero4,#f2a-heroc,.f2a-hd"))}))plus1()}).observe(v,{childList:true,subtree:true,attributes:true,attributeFilter:["aria-selected","class","hidden"]});
tout();
})();
