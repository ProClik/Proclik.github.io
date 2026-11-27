/* Ma TVA (Cyril 27/11) : dans Réglages, juste après « Couleur de mon formulaire ».
   Un auto-entrepreneur (franchise de TVA) ne peut pas faire la TVA à 10 % : son formulaire client ne pose
   plus la question « Le logement a-t-il plus de 2 ans ? ». Une entreprise qui facture la TVA la garde.
   Gardé sur l'appareil (pc-form-tva : "oui" | "non") et sur le compte (service : /espace/formulaire { tva }). */
(function(){
"use strict";
var d=document,X=window.PCX;
var $=function(s,c){return (c||d).querySelector(s)},$$=function(s,c){return [].slice.call((c||d).querySelectorAll(s))};
var lsG=function(k,v){try{var x=JSON.parse(localStorage.getItem(k));return x==null?v:x}catch(e){return v}};
var lsS=function(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
var toast=function(a,b){if(X&&X.toast)X.toast(a,b)};
var SERVICE=String(window.PC_SERVICE||'').replace(/\/+$/,'');if(!/^https:\/\/[a-z0-9.-]+$/i.test(SERVICE))SERVICE='';
var CH=[['oui','Je facture la TVA','Entreprise (SARL, SAS, EURL…) : votre formulaire demande si le logement a plus de 2 ans, pour la TVA à 10 %'],
        ['non','Je ne facture pas la TVA','Auto-entrepreneur : la question sur la TVA à 10 % n\'est pas posée à vos clients']];
var jeton=function(){return lsG('pc-vrai-jeton',null)};
function lireCompte(){
  var j=jeton();if(!SERVICE||!j)return Promise.resolve(null);
  return fetch(SERVICE+'/espace/formulaire',{headers:{Authorization:'Bearer '+j},cache:'no-store'}).then(function(x){return x.ok?x.json():null})
   .then(function(o){var t=o&&o.reglage&&o.reglage.tva;if(t==='oui'||t==='non'){lsS('pc-form-tva',t);majLigne()}return t||null}).catch(function(){return null});
}
function envoyer(t){
  var j=jeton();if(!SERVICE||!j)return Promise.resolve(false);
  return fetch(SERVICE+'/espace/formulaire',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+j},body:JSON.stringify({tva:t})})
   .then(function(x){return x.ok}).catch(function(){return false});
}
function ouvrir(){
  var t=lsG('pc-form-tva',null);
  function rend(){$$('[data-ftva]').forEach(function(b){b.setAttribute('aria-checked',String(b.getAttribute('data-ftva')===t))});var ok=$('#ftva-ok');if(ok)ok.disabled=!t}
  X.xopen('Ma TVA','Pour poser (ou non) la question de la TVA à 10 % à vos clients',
   '<div class="fc-l" role="radiogroup" aria-label="Ma TVA">'+CH.map(function(c){return '<button type="button" role="radio" class="fc-esp" data-ftva="'+c[0]+'"><span class="tx"><b>'+c[1]+'</b><small>'+c[2]+'</small></span></button>'}).join('')+'</div>'+
   '<p style="margin:12px 2px 0;color:var(--muted);font-size:13px">Pas sûr ? Regardez une de vos factures : s\'il est écrit « TVA non applicable, art. 293 B du CGI », vous ne facturez pas la TVA.</p>'+
   '<button type="button" class="btn go" id="ftva-ok" style="width:100%;margin-top:14px">Enregistrer</button>');
  rend();
  if(!t)lireCompte().then(function(v){if(v&&!t){t=v;rend()}});
  $$('[data-ftva]').forEach(function(b){b.addEventListener('click',function(){t=b.getAttribute('data-ftva');rend()})});
  $('#ftva-ok').addEventListener('click',function(){if(!t)return;
    lsS('pc-form-tva',t);majLigne();
    envoyer(t).then(function(ok){X.xclose();toast('C\'est noté',ok?(t==='non'?'Vos clients n\'auront plus la question sur la TVA à 10 %.':'Vos clients ont la question sur la TVA à 10 %.'):'Gardé sur cet appareil : il partira quand l\'Espace sera connecté.')});
  });
}
function majLigne(){var s=$('#rg-ftva small');if(!s)return;var t=lsG('pc-form-tva',null);s.textContent=t==='non'?'Je ne facture pas la TVA (auto-entrepreneur)':t==='oui'?'Je facture la TVA':'À choisir'}
var menu=$('#menu');
if(menu&&X)menu.addEventListener('click',function(){
  var c=$('#x-in .card.menu');if(!c||c.querySelector('#rg-ftva'))return;
  var b=d.createElement('button');b.id='rg-ftva';
  b.innerHTML='<span class="av"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M19 5 5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/></svg></span><span class="tx"><b>Ma TVA</b><small></small></span><span class="go">›</span>';
  var ap=$('#rg-fcoul',c)||$('#rg-barre',c)||$('#rg-aides',c);
  if(ap&&ap.parentNode===c)c.insertBefore(b,ap.nextSibling);else c.appendChild(b);
  majLigne();b.addEventListener('click',ouvrir);
  if(!lsG('pc-form-tva',null))lireCompte();
});
})();
