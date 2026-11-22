/* Couleur du formulaire client (Cyril 22/11) : dans Réglages, « Couleur de mon formulaire ».
   « Comme mon Espace » (suit la couleur de l'Espace) ou une des 6 couleurs figées le 21/11.
   Gardé sur l'appareil (pc-form-coul) et sur le compte (service : /espace/formulaire), lu par le formulaire du client.
   La couleur de l'Espace : pc-couleur-espace (bleu nuit tant que l'écran « Votre couleur » n'est pas branché).
   Quand la couleur de l'Espace change : appeler window.PCFormCouleur.envoyer() pour que le formulaire suive. */
(function(){
"use strict";
var d=document,X=window.PCX;
var $=function(s,c){return (c||d).querySelector(s)},$$=function(s,c){return [].slice.call((c||d).querySelectorAll(s))};
var lsG=function(k,v){try{var x=JSON.parse(localStorage.getItem(k));return x==null?v:x}catch(e){return v}};
var lsS=function(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
var toast=function(a,b){if(X&&X.toast)X.toast(a,b)};
var SERVICE=String(window.PC_SERVICE||'').replace(/\/+$/,'');if(!/^https:\/\/[a-z0-9.-]+$/i.test(SERVICE))SERVICE='';
var C=[['nuit','Bleu nuit','#1B2440','#EFEBE2'],['sapin','Sapin','#2F4A3E','#A9CDB8'],['canard','Canard','#1F5560','#94CBD3'],['ardoise','Ardoise','#3A5470','#B3C7DE'],['noyer','Noyer','#4A3A2E','#D8C3B0'],['encre','Encre','#17181D','#FFFFFF']];
var FC=new URL('fc/',location.href).href;
var info=function(k){for(var i=0;i<C.length;i++)if(C[i][0]===k)return C[i];return C[0]};
var espaceCoul=function(){var k=lsG('pc-couleur-espace','nuit');return info(k)[0]};
var reg=function(){var r=lsG('pc-form-coul',null)||{};return {suivre:r.suivre!==false,choix:info(r.choix||'nuit')[0]}};
var affichee=function(r){return r.suivre?espaceCoul():r.choix};
function envoyer(){
  var r=reg(),j=lsG('pc-vrai-jeton',null);if(!SERVICE||!j)return Promise.resolve(false);
  return fetch(SERVICE+'/espace/formulaire',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+j},body:JSON.stringify({suivre:r.suivre,choix:r.choix,espace:espaceCoul()})})
   .then(function(x){return x.ok}).catch(function(){return false});
}
window.PCFormCouleur={envoyer:envoyer};
function nuitActive(){return d.documentElement.getAttribute('data-theme')==='dark'}
function ouvrir(){
  var r=reg();
  function rend(){
    $$('[data-fc]').forEach(function(b){var k=b.getAttribute('data-fc');b.setAttribute('aria-checked',String(k==='espace'?r.suivre:(!r.suivre&&r.choix===k)))});
    var c=info(affichee(r));['j','n'].forEach(function(t){var im=$('#fc-im-'+t);if(im)im.src=FC+c[0]+'-'+t+'.jpg?v=2'});
    var t=$('#fc-nom');if(t)t.textContent=(r.suivre?'Comme mon Espace · ':'')+c[1];
  }
  X.xopen('Couleur de mon formulaire','Ce que voient vos clients quand ils demandent un devis',
   '<div class="fc-apw"><figure><img id="fc-im-j" alt="Votre formulaire de jour"><figcaption>Jour</figcaption></figure><figure><img id="fc-im-n" alt="Votre formulaire de nuit"><figcaption>Nuit</figcaption></figure></div>'+
   '<p class="fc-nomw">Votre formulaire · <b id="fc-nom"></b></p>'+
   '<div class="fc-l" role="radiogroup" aria-label="Couleur du formulaire">'+
   '<button type="button" role="radio" class="fc-esp" data-fc="espace"><span class="fc-rd" style="background:conic-gradient('+C.map(function(x,i){return x[2]+' '+(i*60)+'deg '+((i+1)*60)+'deg'}).join(',')+')"></span><span class="tx"><b>Comme mon Espace</b><small>Si vous changez la couleur de l\'Espace, le formulaire suit</small></span></button>'+
   '<div class="fc-g">'+C.map(function(x){return '<button type="button" role="radio" data-fc="'+x[0]+'"><span class="fc-rd" style="background:'+x[2]+'"></span><small>'+x[1]+'</small></button>'}).join('')+'</div></div>'+
   '<button type="button" class="fc-autre" id="fc-autre">Une autre couleur ? Demandez-la, on vous la crée</button>'+
   '<button type="button" class="btn go" id="fc-ok" style="width:100%;margin-top:14px">Enregistrer</button>');
  rend();
  $$('[data-fc]').forEach(function(b){b.addEventListener('click',function(){var k=b.getAttribute('data-fc');if(k==='espace')r.suivre=true;else{r.suivre=false;r.choix=k}rend()})});
  $('#fc-autre').addEventListener('click',function(){X.xclose();if(window.PCREG&&PCREG.ecrire)PCREG.ecrire('Je voudrais une autre couleur pour mon formulaire (et mon Espace) : ');});
  $('#fc-ok').addEventListener('click',function(){
    lsS('pc-form-coul',r);majLigne();
    envoyer().then(function(ok){X.xclose();toast('Couleur enregistrée',ok?'Votre formulaire la prend tout de suite.':'Gardée sur cet appareil : elle partira quand l\'Espace sera connecté.')});
  });
}
function majLigne(){var s=$('#rg-fcoul small');if(s){var r=reg();s.textContent=(r.suivre?'Comme mon Espace · ':'')+info(affichee(r))[1]}}
var menu=$('#menu');
if(menu&&X)menu.addEventListener('click',function(){
  var c=$('#x-in .card.menu');if(!c||c.querySelector('#rg-fcoul'))return;
  var b=d.createElement('button');b.id='rg-fcoul';
  b.innerHTML='<span class="av"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.7-.8 1.7-1.6 0-.5-.2-.8-.5-1.2-.3-.3-.5-.7-.5-1.2 0-.9.8-1.6 1.7-1.6H16a5 5 0 0 0 5-5c0-4-4-7.4-9-7.4z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10.5" cy="7.5" r="1"/><circle cx="15" cy="7.5" r="1"/></svg></span><span class="tx"><b>Couleur de mon formulaire</b><small></small></span><span class="go">›</span>';
  var ap=$('#rg-barre',c)||$('#rg-aides',c);
  if(ap&&ap.parentNode===c)c.insertBefore(b,ap.nextSibling);else c.appendChild(b);
  majLigne();b.addEventListener('click',ouvrir);
});
})();
