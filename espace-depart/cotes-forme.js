/* Prise de cotes au style du nouvel Espace (maquettes figées du 21/11 : cotes.html, cotes-question.html).
   Seulement l'aspect et l'ordre des éléments à l'écran : les questions, les cotes et les données ne changent pas. ?forme=0 = ancien. */
(function(){"use strict";
if(/[?&]forme=0\b/.test(location.search))return;
var d=document,root=d.documentElement,$=function(s,c){return (c||d).querySelector(s)},$$=function(s,c){return [].slice.call((c||d).querySelectorAll(s))};
root.classList.add("f2on");
/* la couleur choisie pour l'Espace (« Votre couleur ») */
var COUL={nuit:["#1B2440","#FFFFFF","#EFEBE2","#1B2440"],sapin:["#2F4A3E","#FFFFFF","#A9CDB8","#141927"],canard:["#1F5560","#FFFFFF","#94CBD3","#141927"],
  ardoise:["#3A5470","#FFFFFF","#B3C7DE","#141927"],noyer:["#4A3A2E","#FFFFFF","#D8C3B0","#141927"],encre:["#17181D","#FFFFFF","#FFFFFF","#141927"]};
function lsG(k,v){try{var x=JSON.parse(localStorage.getItem(k));return x==null?v:x}catch(e){return v}}
var c=COUL[lsG("pc-couleur-espace","nuit")]||COUL.nuit;
root.style.setProperty("--f2-act-j",c[0]);root.style.setProperty("--f2-sur-j",c[1]);root.style.setProperty("--f2-act-n",c[2]);root.style.setProperty("--f2-sur-n",c[3]);
var OK='<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10" cy="10" r="7.2"/><path d="M7 10.2l2.1 2L13 8"/></svg>';
function liste(P){var b=$(".ph-b",P),sum=b&&$(".card.sum",b);P.classList.toggle("f2l",!!sum);if(!sum||b.dataset.f2)return;b.dataset.f2="1";
  var h=$(".ph-h",P),t=$(".t",h),ring=$("svg.ring",h);
  if(ring&&!$(".f2brand",h))ring.insertAdjacentHTML("afterend",'<span class="f2brand">ProClik<sup>PRO</sup></span>');
  /* en-tête de page : client au-dessus, grand titre, + rond à droite, mention démo dessous */
  var hd=d.createElement("div");hd.className="f2hd";
  hd.innerHTML='<div class="f2hd-t"><small></small><h1></h1></div>';
  $("small",hd).textContent=t?$("small",t).textContent:"";$("h1",hd).textContent=t?$("b",t).textContent:"Prise de cotes";
  var add=$(".addr",b);if(add)hd.appendChild(add);
  var exc=$(".exc",P);if(exc)$(".f2hd-t",hd).appendChild(exc);
  b.insertBefore(hd,b.firstChild);
  /* « Où on en est » */
  var n=$(".sum-n",sum),s=n&&$("span",n);
  if(n){var tot=(s&&s.textContent.replace(/\D/g,""))||"0";if(s)s.textContent="sur "+tot+" mesurée"+(+tot>1?"s":"");
    sum.insertAdjacentHTML("afterbegin",'<small class="f2lab">Où on en est</small>')}
  /* titre de la liste */
  var L=$(".list",b);
  if(L&&L.children.length&&!$(".f2sec",b))L.insertAdjacentHTML("beforebegin",'<div class="f2sec"><b>Menuiseries</b><span>en mm</span></div>');
  $$(".item",b).forEach(function(it){var dim=$(".dim",it),em=$("em",it),no=$(".no",it),sm=$(".txt small",it);
    if(no&&sm)sm.textContent="n°"+no.textContent+(sm.textContent?" · "+sm.textContent:"");
    var r=d.createElement("span");r.className="f2r";if(dim)r.appendChild(dim);
    if(em){if(em.classList.contains("ok"))em.innerHTML=OK+"mesurée";r.appendChild(em)}
    it.appendChild(r)});
  pieces(P,b,hd)}
/* Dès 8 menuiseries : « Par pièce » (maquettes cotes-pieces.html / cotes-piece.html). Toucher une pièce = sa page, « ‹ Prise de cotes ». */
var PIECE=null,SEUIL=8;
var PI={"Séjour":'<path d="M4 13v-2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2"/><path d="M3 13h18v4H3zM5 17v2M19 17v2"/>',"Cuisine":'<path d="M5 10h14v8a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2zM3 10h18M9 6v1.5M12 5v2.5M15 6v1.5"/>',
  "Chambre":'<path d="M3 18V8M3 14h18v4M21 18v-4a3 3 0 0 0-3-3h-7v3"/><circle cx="7" cy="11.5" r="1.6"/>',"Salle de bain":'<path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM6 12V6a2 2 0 0 1 4 0M7 19l-1 2M17 19l1 2"/>',
  "WC":'<path d="M7 4h6v7H7zM5 11h12a5 5 0 0 1-5 5h-2l1 4H8l-1-4"/>',"Entrée":'<path d="M6 21V4h12v17M4 21h16"/><circle cx="15" cy="12.5" r=".9"/>',"Garage":'<path d="M3 20V9l9-5 9 5v11M7 20v-7h10v7M7 16h10"/>'};
var PICO=function(p){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(PI[p]||PI["Entrée"])+'</svg>'};
var escH=function(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})};
function lesItems(){var C=window.PCCotes;return C&&C.S&&Array.isArray(C.S.items)?C.S.items:[]}
function pieces(P,b,hd){var I=lesItems(),L=$(".list",b);if(!L)return;var on=I.length>=SEUIL;P.classList.toggle("f2pp",on);if(!on){PIECE=null;return}
  var G={},ordre=[];I.slice().sort(function(a,c){return a.no-c.no}).forEach(function(it){var p=it.piece||"Sans pièce";if(!G[p]){G[p]=[];ordre.push(p)}G[p].push(it)});
  if(PIECE&&!G[PIECE])PIECE=null;
  $$(".item",L).forEach(function(it){var x=I[+it.getAttribute("data-i")];(it.closest(".irow")||it).classList.toggle("f2hors",!!PIECE&&(!x||(x.piece||"Sans pièce")!==PIECE))});
  P.classList.toggle("f2p1",!!PIECE);
  var sec=$(".f2sec",b);
  if(PIECE){var g=G[PIECE],r=g.filter(function(x){return !x.fini}).length;
    hd.querySelector("small").textContent=g.length+" menuiserie"+(g.length>1?"s":"")+" · "+(r?r+" à mesurer":g.length>1?"toutes mesurées":"mesurée");
    hd.querySelector("h1").textContent=PIECE;
    if(!$(".f2bk",P)){var bk=d.createElement("button");bk.type="button";bk.className="f2bk";bk.textContent="‹ Prise de cotes";bk.addEventListener("click",function(){PIECE=null;rafr(P)});var hh=$(".ph-h",P);hh.insertBefore(bk,hh.firstChild)}
    return}
  var bk0=$(".f2bk",P);if(bk0)bk0.parentNode.removeChild(bk0);
  var pp=d.createElement("div");pp.className="f2pp-l";
  pp.innerHTML='<div class="f2sec"><b>Par pièce</b><span>'+I.length+' menuiseries</span></div><div class="f2pp-c">'+ordre.map(function(p){var g=G[p],r=g.filter(function(x){return !x.fini}).length;
    return '<button type="button" class="f2pc" data-f2pc="'+escH(p)+'"><span class="f2pc-i">'+PICO(p)+'</span><span class="f2pc-t"><b>'+escH(p)+'</b><small>'+g.length+' menuiserie'+(g.length>1?'s':'')+'</small></span>'+
      (r?'<em class="f2pc-a">'+r+' à mesurer</em>':'<em class="f2pc-ok">'+OK+(g.length>1?'toutes':'mesurée')+'</em>')+'<i class="f2pc-go">›</i></button>'}).join("")+'</div>';
  if(sec)sec.classList.add("f2hors");L.parentNode.insertBefore(pp,L);
  $$("[data-f2pc]",pp).forEach(function(x){x.addEventListener("click",function(){PIECE=x.getAttribute("data-f2pc");rafr(P);window.scrollTo(0,0)})})}
function rafr(P){var C=window.PCCotes;if(C&&C.render)C.render()}
function suit(){var P=$("#phone");if(!P)return;liste(P);new MutationObserver(function(){liste(P)}).observe(P,{childList:true})}
if(d.readyState==="loading")d.addEventListener("DOMContentLoaded",suit);else suit();
})();
