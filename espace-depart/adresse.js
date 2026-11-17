/* Aide à la saisie des adresses dans l'Espace (Cyril, 17/11 : « le même aide que sur le formulaire »).
   - Adresse complète (dépôt, comptoir d'un fournisseur, adresse d'un client) : propositions de la Base Adresse Nationale
     (Géoplateforme de l'IGN, data.geopf.fr, gratuite, sans clé). Pour une fiche client, le code postal et la ville se remplissent aussi.
   - Code postal → communes, commune → codes postaux : base officielle des communes (geo.api.gouv.fr), comme le formulaire.
   La liste s'affiche sous la case, dans la page (jamais coupée par une fenêtre). Sans réseau : rien ne s'affiche, on tape comme avant. */
(function(){
"use strict";
var d=document;
var BAN="https://data.geopf.fr/geocodage/search?autocomplete=1&limit=5&q=",GEO="https://geo.api.gouv.fr/communes?fields=nom,codesPostaux&";
/* cases connues : adresse seule, ou adresse + code postal + ville d'une fiche client */
var COMPLETE={"jr-vdep":1,"fo-a":1},FICHE={a:"cf-a",cp:"cf-cp",v:"cf-v"};
var cache={},minuteur=null,num=0;
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function norm(v){return String(v||"").normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim()}
function lire(u){if(cache[u])return Promise.resolve(cache[u]);
 var a=window.AbortController?new AbortController():null,t=setTimeout(function(){if(a)a.abort()},6000);
 return fetch(u,a?{signal:a.signal}:{}).then(function(r){clearTimeout(t);return r.ok?r.json():null}).then(function(j){if(j)cache[u]=j;return j},function(){return null})}
function boite(el){var b=el.parentNode.querySelector(".pcadr");if(!b){b=d.createElement("div");b.className="pcadr";b.setAttribute("role","listbox");el.insertAdjacentElement("afterend",b)}return b}
function vider(el){var b=el&&el.parentNode&&el.parentNode.querySelector(".pcadr");if(b)b.remove()}
function toutVider(){[].forEach.call(d.querySelectorAll(".pcadr"),function(b){b.remove()})}
function liste(el,titre,L){if(!L.length){vider(el);return}var b=boite(el);
 b.innerHTML='<p class="pcadr-h">'+esc(titre)+'</p>'+L.map(function(x,i){return '<button type="button" class="pcadr-i" data-pcadr="'+i+'"><span>'+esc(x.t)+'</span>'+(x.s?'<small>'+esc(x.s)+'</small>':'')+'</button>'}).join("");
 b._L=L;b._el=el}
function poser(el,v){if(!el)return;el.value=v;el.dispatchEvent(new Event("input",{bubbles:true}));el.dispatchEvent(new Event("change",{bubbles:true}))}
function val(id){var e=d.getElementById(id);return e?e.value.trim():""}

/* adresse complète */
function adresses(el,fiche){var q=el.value.trim(),n=++num;
 if(q.length<4||!/[a-zà-ÿ]{2}/i.test(q)){vider(el);return}
 if(fiche){var cp=val(FICHE.cp),v=val(FICHE.v);if(/^\d{5}$/.test(cp))q+=" "+cp;else if(v)q+=" "+v}
 lire(BAN+encodeURIComponent(q.slice(0,200))).then(function(j){if(n!==num||d.activeElement!==el)return;
  var L=((j&&j.features)||[]).map(function(f){var p=f.properties||{};return {t:fiche?(p.name||p.label):p.label,s:fiche?[p.postcode,p.city].filter(Boolean).join(" "):"",p:p}}).filter(function(x){return x.t});
  if(L.length===1&&norm(L[0].p.label)===norm(el.value)){vider(el);return}
  liste(el,"Choisissez l'adresse",L)})}
/* code postal → communes */
function communesDuCp(el){var cp=el.value.trim(),n=++num;if(!/^\d{5}$/.test(cp)){vider(el);return}
 lire(GEO+"codePostal="+cp).then(function(j){if(n!==num||!j)return;
  var L=j.map(function(c){return {t:c.nom,s:cp,p:{postcode:cp,city:c.nom}}}).sort(function(a,b){return a.t.localeCompare(b.t,"fr")});
  if(L.some(function(x){return norm(x.t)===norm(val(FICHE.v))})){vider(el);return}
  if(L.length===1&&!val(FICHE.v)){poser(d.getElementById(FICHE.v),L[0].t);vider(el);return}
  liste(el,"Choisissez la commune",L)})}
/* commune → codes postaux */
function cpDeCommune(el){var nom=el.value.trim(),n=++num;if(norm(nom).length<2){vider(el);return}
 lire(GEO+"nom="+encodeURIComponent(nom)+"&boost=population&limit=8").then(function(j){if(n!==num||!j||d.activeElement!==el)return;var L=[];
  j.forEach(function(c){(c.codesPostaux||[]).forEach(function(p){L.push({t:c.nom,s:p,p:{postcode:p,city:c.nom}})})});L=L.slice(0,6);
  if(L.length===1&&norm(L[0].t)===norm(nom)&&L[0].s===val(FICHE.cp)){vider(el);return}
  liste(el,"Choisissez la commune",L)})}

d.addEventListener("input",function(e){var el=e.target;if(!el||el.tagName!=="INPUT"||!e.isTrusted)return;var id=el.id;
 if(!COMPLETE[id]&&id!==FICHE.a&&id!==FICHE.cp&&id!==FICHE.v)return;
 clearTimeout(minuteur);
 if(id===FICHE.cp)return communesDuCp(el);
 minuteur=setTimeout(function(){if(id===FICHE.v)cpDeCommune(el);else adresses(el,id===FICHE.a)},300)});
d.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("[data-pcadr]");
 if(!b){if(!(e.target.closest&&e.target.closest(".pcadr")))toutVider();return}
 e.preventDefault();var box=b.closest(".pcadr"),x=box._L[+b.dataset.pcadr],el=box._el;if(!x||!el)return;box.remove();
 if(el.id===FICHE.a||el.id===FICHE.cp||el.id===FICHE.v){
  if(el.id===FICHE.a)poser(el,x.t);
  if(x.p.postcode)poser(d.getElementById(FICHE.cp),x.p.postcode);
  if(x.p.city)poser(d.getElementById(FICHE.v),x.p.city);
  vider(d.getElementById(FICHE.cp));vider(d.getElementById(FICHE.v));
 }else{poser(el,x.p.label||x.t);
  /* dépôt : le code postal des stations suit l'adresse choisie */
  if(el.id==="jr-vdep"&&x.p.postcode)poser(d.getElementById("jr-vcp"),x.p.postcode)}
 toutVider()},true);

var css=d.createElement("style");
css.textContent=".pcadr{margin:6px 0 2px;background:var(--bg,#ECEEF2);border-radius:16px;box-shadow:var(--up-s,0 2px 8px rgba(14,19,34,.12)),0 10px 24px rgba(14,19,34,.14);padding:6px;max-height:260px;overflow:auto}"+
 ".pcadr-h{font-size:12px;color:var(--muted);margin:4px 10px 6px}"+
 ".pcadr-i{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;min-height:48px;padding:10px 12px;border:0;border-radius:12px;background:transparent;box-shadow:none;color:var(--fg);font:inherit;font-weight:600;font-size:15px;text-align:left;cursor:pointer}"+
 ".pcadr-i:active,.pcadr-i:hover{background:var(--n1-teinte,rgba(27,36,64,.06))}.pcadr-i small{color:var(--muted);font-weight:500;font-size:13.5px;white-space:nowrap}"+
 /* dans une case <label> les styles des titres de champ ne doivent pas déteindre sur la liste */
 ".pcadr .pcadr-i span{display:block;margin:0;font-size:15.5px!important;font-weight:600!important;color:var(--fg)!important;text-transform:none;letter-spacing:0}.pcadr .pcadr-i small{display:inline;margin:0;font-size:13.5px!important;font-weight:500!important;color:var(--muted)!important}";
d.head.appendChild(css);
})();
