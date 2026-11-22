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
    it.appendChild(r)})}
function suit(){var P=$("#phone");if(!P)return;liste(P);new MutationObserver(function(){liste(P)}).observe(P,{childList:true})}
if(d.readyState==="loading")d.addEventListener("DOMContentLoaded",suit);else suit();
})();
