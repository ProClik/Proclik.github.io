/* Lot 8 du nouvel Espace : Produits à la forme des maquettes du 21/11 (produits.html, produits-famille.html).
   « 16 dans votre base » au-dessus du titre, recherche avec micro, onglet « Fournitures », « Les plus utilisés » (seulement s'il y en a),
   les familles en liste ; toucher une famille = sa page « ‹ Produits » avec ses produits et leur prix.
   produits.js reste la source (vue(), recherche, fiches, prix en direct) : ici on ne fait que ranger. ?forme=0 = ancien. */
(function(){"use strict";
if(/[?&]forme=0\b/.test(location.search))return;
var d=document,$=function(s,c){return (c||d).querySelector(s)},$$=function(s,c){return [].slice.call((c||d).querySelectorAll(s))};
var v=$("#v-produits");if(!v)return;
var FAM=null,root=d.documentElement;
var I=function(p){return '<svg viewBox="0 0 24 24" aria-hidden="true">'+p+'</svg>'};
var MIC=I('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7"/>');
var esc=function(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})};
function usages(){var u=null;try{u=JSON.parse(localStorage.getItem("pc-base-usage"))}catch(e){}return u&&typeof u==="object"?u:{}}
function seg(){var b=$("[data-prodseg][aria-selected=true]",v);return b?b.getAttribute("data-prodseg"):"produit"}
function q(){var i=$("#pr-q",v);return i?i.value.trim():""}
/* micro dans la recherche : la dictée du téléphone remplit la case */
var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
function micro(){var l=$(".pr-q",v);if(!l||!SR||$(".f2p-mic",l))return;var b=d.createElement("button");b.type="button";b.className="f2p-mic";b.setAttribute("aria-label","Dicter");b.innerHTML=MIC;l.appendChild(b);
  b.addEventListener("click",function(e){e.preventDefault();try{var r=new SR();r.lang="fr-FR";r.interimResults=false;b.classList.add("on");
    r.onresult=function(ev){var t=ev.results[0][0].transcript||"",i=$("#pr-q",v);if(i){i.value=t;i.dispatchEvent(new Event("input",{bubbles:true}))}};
    r.onend=function(){b.classList.remove("on")};r.start()}catch(x){b.classList.remove("on")}})}
function range(){var c=$(":scope>.cf",v);if(!c)return;var s=seg(),fams=$$(".sec-h.pr-fam",c),liste=s!=="cliky";
  /* en-tête et onglet « Fournitures » */
  var t=$('[data-prodseg="produit"] span',c);if(t&&t.textContent!=="Fournitures")t.textContent="Fournitures";
  if(!liste){FAM=null}
  if(FAM&&!fams.some(function(f){return nomF(f)===FAM})&&!q())FAM=null;
  root.classList.toggle("f2p-in",!!FAM);c.classList.toggle("f2p-fam",!!FAM);c.classList.toggle("f2p-acc",liste&&!FAM&&!q());
  micro();
  $$(".f2p-x",c).forEach(function(x){x.parentNode.removeChild(x)});
  if(!liste)return;
  var inp=$("#pr-q",c);
  if(FAM){/* page d'une famille */
    var n=0;fams.forEach(function(f){var on=nomF(f)===FAM;f.classList.toggle("f2p-sel",on);var l=f.nextElementSibling;if(l)l.classList.toggle("f2p-sel",on);if(on&&l)n=$$(".pr-li",l).length});
    var hd=d.createElement("div");hd.className="f2p-x f2p-hd";hd.innerHTML='<button type="button" class="f2p-bk">‹ Produits</button><small>'+n+' produit'+(n>1?'s':'')+'</small><h2>'+esc(FAM)+'</h2>';
    c.insertBefore(hd,c.firstChild);$(".f2p-bk",hd).addEventListener("click",function(){FAM=null;var i=$("#pr-q",v);if(i&&i.value){i.value="";i.dispatchEvent(new Event("input",{bubbles:true}))}else range();window.scrollTo(0,0)});
    if(inp)inp.placeholder="Chercher dans "+FAM;
    var last=$$(".cf-l.f2p-sel",c)[0];var h=d.createElement("p");h.className="hint f2p-x";h.textContent=n?"Touchez un prix pour le changer, ou un produit pour le modifier ou le retirer.":"Rien dans cette famille pour « "+q()+" ».";
    if(last)last.parentNode.insertBefore(h,last.nextSibling);else{var lq=$(".pr-q",c);if(lq)lq.parentNode.insertBefore(h,lq.nextSibling)}
    return}
  if(inp)inp.placeholder=s==="prestation"?"Chercher : cloison, pose…":"BA13, vis, laine…";
  if(q()||!fams.length)return;
  /* les plus utilisés (dans vos devis), seulement s'il y en a vraiment */
  var U=usages(),rows=$$(".pr-li",c).map(function(r){var b=$(".tx b",r),k=r.getAttribute("data-prod"),nom=b?b.textContent:"";return {r:r,k:k,nom:nom,n:(U[k]||0)+(U[nom.toLowerCase()]||0)}}).filter(function(x){return x.n>0}).sort(function(a,b){return b.n-a.n}).slice(0,6);
  var avant=fams[0];
  if(rows.length){var st=d.createElement("div");st.className="f2p-x f2p-top";
    st.innerHTML='<div class="sec-h"><h2>Les plus utilisés</h2><span>dans vos devis</span></div><div class="f2p-str">'+rows.map(function(x){var px=$(".pr-px",x.r);return '<button type="button" data-f2p="'+esc(x.k)+'"><b>'+esc(x.nom)+'</b>'+(px?'<span>'+px.innerHTML+'</span>':'')+'</button>'}).join("")+'</div>';
    avant.parentNode.insertBefore(st,avant)}
  var fh=d.createElement("div");fh.className="f2p-x sec-h f2p-fh";fh.innerHTML="<h2>Familles</h2>";avant.parentNode.insertBefore(fh,avant);
  fams.forEach(function(f,i){f.classList.toggle("f2p-p1",!i);f.classList.toggle("f2p-pn",i===fams.length-1);f.setAttribute("role","button");f.setAttribute("tabindex","0");if(!$(".f2p-go",f)){var g=d.createElement("i");g.className="f2p-go";g.textContent="›";f.appendChild(g)}})}
function nomF(f){var h=$("h2",f);return h?h.textContent.trim():""}
v.addEventListener("click",function(e){var c=$(":scope>.cf",v);if(!c)return;
  var f=e.target.closest&&e.target.closest(".f2p-acc .sec-h.pr-fam");if(f){FAM=nomF(f);range();window.scrollTo(0,0);return}
  var p=e.target.closest&&e.target.closest("[data-f2p]");if(p){var r=$('.pr-li[data-prod="'+p.getAttribute("data-f2p")+'"]',v);if(r)r.click();return}
  if(e.target.closest&&e.target.closest("[data-prodseg]"))FAM=null});
v.addEventListener("keydown",function(e){if(e.key==="Enter"&&e.target.matches&&e.target.matches(".f2p-acc .sec-h.pr-fam"))e.target.click()});
/* produits.js redessine tout (recherche, onglets, prix) : on range à chaque fois */
var file=0;new MutationObserver(function(m){if(file)return;if(m.every(function(r){return [].every.call(r.addedNodes,function(n){return n.classList&&(n.classList.contains("f2p-x")||n.classList.contains("f2p-go")||n.classList.contains("f2p-mic"))})&&[].every.call(r.removedNodes,function(n){return n.classList&&n.classList.contains("f2p-x")})}))return;
  file=1;requestAnimationFrame(function(){file=0;range()})}).observe(v,{childList:true,subtree:true});
/* quitter Produits = revenir à la liste des familles */
d.addEventListener("click",function(e){if(e.target.closest&&e.target.closest('.nav [data-v]:not([data-v="produits"]),#f2b [data-f2b]')){FAM=null;root.classList.remove("f2p-in")}},true);
range();
})();
