/* Réglages de l'Espace (demandes de Cyril, 2/11) :
   - « Un problème ? Une idée ? » : formulaire de bêta-test, envoyé à Cyril sans sortir de l'appli (service ProClik, /espace/retour) ;
     « Écrire à Cyril » : même formulaire en simple message, avec réponse dans l'Espace ou par téléphone ;
   - « Aides à l'écran » : un interrupteur cache les encadrés « ? » et les phrases d'explication de chaque menu ;
   - « Ma barre du bas » : l'artisan choisit les 4 boutons de la barre (téléphone), le reste va dans le menu du milieu ;
   - iPad, appli installée : les boutons de fenêtre (•••) ne recouvrent plus le logo en haut à gauche. */
(function(){
'use strict';
var d=document,root=d.documentElement,X=window.PCX;
var $=function(s,r){return (r||d).querySelector(s)},$$=function(s,r){return [].slice.call((r||d).querySelectorAll(s))};
var lsG=function(k,v){try{var x=JSON.parse(localStorage.getItem(k));return x==null?v:x}catch(e){return v}};
var lsS=function(k,v){try{if(v==null)localStorage.removeItem(k);else localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var toast=function(a,b){if(X&&X.toast)X.toast(a,b)};

/* ---------- iPad, appli installée : place pour les boutons de fenêtre ---------- */
var UA=navigator.userAgent||'',ipad=/iPad/.test(UA)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
var appli=!!(navigator.standalone||(window.matchMedia&&matchMedia('(display-mode: standalone)').matches));
if(ipad&&appli)root.classList.add('pc-ipad-app');

/* ---------- aides à l'écran ---------- */
/* Les encadrés « ? » et les phrases qui expliquent comment faire. Les phrases qui donnent une information (« Rien à valider », un montant…) restent. */
var AIDE=/^(🔒\s*)?(Vous pouvez aussi dicter|Ou dictez|Touchez |Glissez |Cochez |Ajoutez une facture|Chaque demande|Une facture d.acompte se crée|Un devis signé crée|Depuis le 1|Une photo du ticket|Rien ne part sans vous\. Si tout|Rien ne part chez le client sans vous|Rien n.est envoyé au client sans votre confirmation|Les confirmations et bons de livraison|Les e-mails de vos fournisseurs|Une fois sur l.écran d.accueil)/;
var sansAides=!!lsG('pc-sans-aides',false);
function marque(n){
  if(!n||n.nodeType!==1)return;
  var L=n.matches&&n.matches('.hint,.cf-aide,.dp-aide,p,small')?[n]:[];
  L=L.concat($$('.hint,.cf-aide,.dp-aide,.tip p',n));
  L.forEach(function(e){
    if(e.classList.contains('pc-aide'))return;
    if(e.classList.contains('dp-aide')||AIDE.test((e.textContent||'').trim()))e.classList.add('pc-aide');
  });
}
function aidesUI(){root.classList.toggle('pc-sans-aides',sansAides)}
aidesUI();marque(d.body);
var file=[],prevu=0;
new MutationObserver(function(M){M.forEach(function(m){m.addedNodes.forEach(function(n){if(n.nodeType===1)file.push(n)})});
  if(!prevu){prevu=requestAnimationFrame(function(){prevu=0;var f=file;file=[];f.forEach(marque)})}}).observe(d.body,{childList:true,subtree:true});

/* ---------- retours de bêta-test et messages à Cyril ---------- */
var SERVICE=String(window.PC_SERVICE||'').replace(/\/+$/,'');if(!/^https:\/\/[a-z0-9.-]+$/i.test(SERVICE))SERVICE='';
var jeton=function(){return lsG('pc-vrai-jeton',null)};
var KA='pc-retours-attente',KE='pc-retours-envoyes';
var ECRANS=['Accueil','Clients','Devis','Factures','Planning','Chantiers','Dépenses','Achats','Produits','Réseaux sociaux','Plan','Formulaire de demande','Autre'];
var VUE={accueil:'Accueil',clients:'Clients',devis:'Devis',factures:'Factures',planning:'Planning',chantiers:'Chantiers',depenses:'Dépenses',prix:'Achats',produits:'Produits',reseaux:'Réseaux sociaux'};
function ecranActuel(){var b=$('nav.nav [aria-selected=true]');return (b&&VUE[b.dataset.v])||'Accueil'}
function appareil(){
  var o=/iPad/.test(UA)||ipad?'iPad':/iPhone/.test(UA)?'iPhone':/Android/i.test(UA)?'Android':'Ordinateur';
  return o+' · '+innerWidth+' × '+innerHeight+(appli?' · appli':' · navigateur')+' · '+(root.getAttribute('data-theme')==='dark'?'nuit':'jour')+(root.classList.contains('pcvrai')?' · en direct':' · démo');
}
function envoie(r){
  var j=jeton();
  if(!SERVICE||!j)return Promise.reject(new Error('demo'));
  return fetch(SERVICE+'/espace/retour',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+j},body:JSON.stringify(r),cache:'no-store'})
    .then(function(x){return x.json().catch(function(){return {}}).then(function(y){if(!x.ok||!y.ok)throw new Error(y.erreur||('Service '+x.status));return y})});
}
function garde(k,r){var L=lsG(k,[]);L.unshift(r);lsS(k,L.slice(0,20))}
/* ce qui n'a pas pu partir (pas de réseau…) repart tout seul plus tard */
function relance(){
  var L=lsG(KA,[]);if(!L.length||!jeton())return;
  var r=L[L.length-1];
  envoie(r).then(function(){var M=lsG(KA,[]);M.pop();lsS(KA,M);r.photo=null;garde(KE,r);relance()}).catch(function(){});
}
addEventListener('online',relance);setTimeout(relance,4000);

/* photo : réduite sur l'appareil avant l'envoi */
function reduit(f){return new Promise(function(ok,ko){
  var u=URL.createObjectURL(f),im=new Image();
  im.onload=function(){var k=Math.min(1,1400/Math.max(im.width,im.height)),c=d.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);
    c.getContext('2d').drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);ok(c.toDataURL('image/jpeg',.72))};
  im.onerror=function(){URL.revokeObjectURL(u);ko(new Error('image'))};im.src=u;})}

var IC={
  bug:'<svg viewBox="0 0 24 24"><path d="M8 9a4 4 0 0 1 8 0v5a4 4 0 0 1-8 0z"/><path d="M12 9v9M4 13h4M16 13h4M5 7l3 2M19 7l-3 2M5 19l3-2M19 19l-3-2M10 5 9 3M14 5l1-2"/></svg>',
  idee:'<svg viewBox="0 0 24 24"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/></svg>',
  msg:'<svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z"/></svg>',
  mic:'<svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
  photo:'<svg viewBox="0 0 24 24"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
  aide:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17.5v.01"/></svg>',
  barre:'<svg viewBox="0 0 24 24"><rect x="3" y="15" width="18" height="6" rx="3"/><circle cx="12" cy="13" r="3"/><path d="M6 18h.01M9 18h.01M15 18h.01M18 18h.01"/></svg>'
};
var TYPES=[['probleme','Un problème',IC.bug,'Ce qui ne marche pas, ou pas comme vous pensiez'],['idee','Une idée',IC.idee,'Ce qui vous ferait gagner du temps'],['message','Un message',IC.msg,'Une question, une demande, un mot pour Cyril']];

function formulaire(type,pre){
  var t=type||'probleme',photo=null,rappel='appli',tel=(window.PCID&&PCID._telephone&&PCID.telephone)||'';
  var h='<p class="rg-lead">Vous testez l\'Espace en avant-première : tout ce que vous dites ici arrive directement chez Cyril. Rien n\'est trop petit.</p>'+
   '<div class="rg-types" role="radiogroup" aria-label="Type d\'envoi">'+TYPES.map(function(x){return '<button type="button" role="radio" data-rgt="'+x[0]+'" aria-checked="'+(x[0]===t)+'"><span class="rg-g" aria-hidden="true">'+x[2]+'</span><b>'+x[1]+'</b></button>'}).join('')+'</div>'+
   '<p class="rg-sous" id="rg-sous"></p>'+
   '<label class="field">Sur quel écran ?<select id="rg-ecran">'+ECRANS.map(function(e){return '<option'+(e===ecranActuel()?' selected':'')+'>'+e+'</option>'}).join('')+'</select></label>'+
   '<label class="field rg-txt"><span id="rg-q">Que s\'est-il passé ?</span><textarea id="rg-texte" rows="5" maxlength="4000" placeholder="Écrivez comme vous parlez. Ou touchez le micro."></textarea>'+
   '<button type="button" class="rg-mic" id="rg-mic" aria-label="Dicter"><span class="rg-g">'+IC.mic+'</span></button></label>'+
   '<div class="rg-photo"><button type="button" class="btn" id="rg-ph">'+IC.photo+'<span>Ajouter une capture d\'écran</span></button><input type="file" accept="image/*" id="rg-file" hidden><span id="rg-phok" hidden></span></div>'+
   '<div class="rg-rep" id="rg-rep"><span>Réponse de Cyril</span><div class="rg-choix" role="radiogroup"><button type="button" role="radio" data-rgr="appli" aria-checked="true">Dans l\'Espace</button><button type="button" role="radio" data-rgr="telephone" aria-checked="false">Il m\'appelle</button></div>'+
   '<label class="field" id="rg-tel-l" hidden>Votre numéro<input id="rg-tel" type="tel" inputmode="tel" autocomplete="tel" value="'+esc(tel)+'"></label></div>'+
   (jeton()&&SERVICE?'':'<p class="rg-note">Mode démonstration : votre envoi est gardé sur cet appareil et partira dès que l\'Espace sera connecté avec votre code.</p>');
  X.xopen(t==='message'?'Écrire à Cyril':'Un problème ? Une idée ?','Bêta-test · réponse sous 24 h ouvrées',h,
   '<button class="btn" data-xclose>Annuler</button><button class="btn go" id="rg-go">Envoyer à Cyril</button>',function(){
    if(pre){$('#rg-texte').value=pre;var se=$('#rg-ecran');if(se)se.value='Autre'}
    function maj(){
      $$('[data-rgt]').forEach(function(b){b.setAttribute('aria-checked',String(b.dataset.rgt===t))});
      var x=TYPES.filter(function(y){return y[0]===t})[0];$('#rg-sous').textContent=x[3];
      $('#rg-q').textContent=t==='probleme'?'Que s\'est-il passé ?':t==='idee'?'Votre idée':'Votre message';
      $('#rg-texte').placeholder=t==='probleme'?'Ex. : sur l\'iPad, quand je touche Valider, rien ne se passe.':t==='idee'?'Ex. : pouvoir ajouter un créneau d\'un seul geste dans le planning.':'Écrivez comme vous parlez. Ou touchez le micro.';
    }
    $$('[data-rgt]').forEach(function(b){b.addEventListener('click',function(){t=b.dataset.rgt;maj()})});
    $$('[data-rgr]').forEach(function(b){b.addEventListener('click',function(){rappel=b.dataset.rgr;$$('[data-rgr]').forEach(function(y){y.setAttribute('aria-checked',String(y===b))});$('#rg-tel-l').hidden=rappel!=='telephone';if(rappel==='telephone'&&!$('#rg-tel').value)$('#rg-tel').focus()})});
    maj();
    /* dictée : celle du navigateur si elle existe, sinon le micro du clavier */
    var SR=window.SpeechRecognition||window.webkitSpeechRecognition,mic=$('#rg-mic'),ec=null;
    mic.addEventListener('click',function(){
      if(!SR){toast('Dictée','Touchez le micro du clavier, en bas à côté de la barre d\'espace.');$('#rg-texte').focus();return}
      if(ec){ec.stop();return}
      ec=new SR();ec.lang='fr-FR';ec.interimResults=false;ec.continuous=true;var base=$('#rg-texte').value;
      ec.onresult=function(e){var s='';for(var i=0;i<e.results.length;i++)s+=e.results[i][0].transcript;$('#rg-texte').value=(base?base.replace(/\s*$/,' '):'')+s.trim()};
      ec.onend=function(){ec=null;mic.classList.remove('on')};ec.onerror=ec.onend;
      try{ec.start();mic.classList.add('on')}catch(e){ec=null}
    });
    $('#rg-ph').addEventListener('click',function(){$('#rg-file').click()});
    $('#rg-file').addEventListener('change',function(){var f=this.files&&this.files[0];if(!f)return;
      reduit(f).then(function(u){photo=u;var o=$('#rg-phok');o.hidden=false;o.innerHTML='<img src="'+u+'" alt=""><button type="button" aria-label="Retirer la capture">×</button>';
        o.querySelector('button').addEventListener('click',function(){photo=null;o.hidden=true;o.innerHTML='';$('#rg-file').value=''})})
      .catch(function(){toast('Image illisible','Essayez une autre capture.')})});
    $('#rg-go').addEventListener('click',function(){
      var b=this,txt=$('#rg-texte').value.trim();
      if(txt.length<2){toast('Message vide','Écrivez ou dictez quelques mots.');$('#rg-texte').focus();return}
      var r={type:t,ecran:$('#rg-ecran').value,texte:txt,rappel:rappel,tel:rappel==='telephone'?$('#rg-tel').value.trim():'',appareil:appareil(),photo:photo,date:new Date().toISOString()};
      b.disabled=true;b.textContent='Envoi…';
      envoie(r).then(function(){r.photo=null;garde(KE,r);X.xclose();toast('Envoyé à Cyril, merci !',rappel==='telephone'?'Il vous rappelle au plus vite.':'Sa réponse arrivera ici, dans les Réglages.')})
      .catch(function(e){
        if(e&&e.message!=='demo'&&navigator.onLine!==false&&!/Failed to fetch|NetworkError|Load failed/i.test(e.message||'')){b.disabled=false;b.textContent='Envoyer à Cyril';toast('Pas parti',String(e.message||e));return}
        garde(KA,r);X.xclose();toast('Gardé sur l\'appareil',jeton()?'Pas de réseau : il partira tout seul dès le retour du réseau.':'Il partira dès que l\'Espace sera connecté.');
      });
    });
  },true);
}

/* réponses de Cyril et derniers envois */
function messages(){
  var att=lsG(KA,[]),env=lsG(KE,[]);
  var nom={probleme:'Problème',idee:'Idée',message:'Message'};
  var ligne=function(r,etat){return '<div class="it"><span class="tx"><b style="font-size:14px">'+nom[r.type]+(r.ecran?' · '+esc(r.ecran):'')+'</b><small>'+esc(String(r.texte).slice(0,90))+(String(r.texte).length>90?'…':'')+'</small></span><span class="rg-etat'+(etat?'':' att')+'">'+(etat||'en attente')+'</span></div>'};
  X.xopen('Mes échanges avec Cyril','Vos envois et ses réponses',
   '<div id="rg-reps"><p class="hint">'+(jeton()&&SERVICE?'Recherche des réponses…':'Les réponses de Cyril s\'affichent ici quand l\'Espace est connecté.')+'</p></div>'+
   '<div class="xsec"><h3>Vos envois</h3><div class="card lst">'+(att.map(function(r){return ligne(r,'')}).join('')+env.map(function(r){return ligne(r,'envoyé')}).join('')||'<p class="hint">Rien d\'envoyé depuis cet appareil.</p>')+'</div></div>',
   '<button class="btn" data-xclose>Fermer</button><button class="btn go" id="rg-new">Écrire à Cyril</button>',function(){
    $('#rg-new').addEventListener('click',function(){formulaire('message')});
    var j=jeton();if(!SERVICE||!j)return;
    fetch(SERVICE+'/espace/retours',{headers:{Authorization:'Bearer '+j},cache:'no-store'}).then(function(x){return x.json()}).then(function(y){
      var o=$('#rg-reps');if(!o)return;if(!y||!y.ok)throw new Error((y&&y.erreur)||'service');
      lsS('pc-retours-vu',y.reponses.length?y.reponses[0].date:null);
      o.innerHTML=y.reponses.length?'<div class="xsec"><h3>Réponses de Cyril</h3><div class="card lst">'+y.reponses.map(function(r){return '<div class="it"><span class="tx"><b style="font-size:14px;font-weight:600;white-space:pre-wrap">'+esc(r.texte)+'</b><small>'+(r.date?new Date(r.date).toLocaleString('fr-FR',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):'')+'</small></span></div>'}).join('')+'</div></div>':'<p class="hint">Pas encore de réponse. Cyril répond sous 24 h ouvrées.</p>';
    }).catch(function(){var o=$('#rg-reps');if(o)o.innerHTML='<p class="hint">Réponses indisponibles pour l\'instant (réseau).</p>'});
  },true);
}

/* ---------- ma barre du bas ---------- */
function barre(){
  var B=window.PCBarre;if(!B)return;
  var choix=B.bas();
  var dispo=B.TOUS.filter(function(v){return v!=='reglages'&&B.info(v)});
  function rend(){
    var p=$('#rg-pos');if(!p)return;
    p.innerHTML=[0,1,'c',2,3].map(function(i){if(i==='c')return '<span class="rg-c" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 7h14M5 12h14M5 17h14"/></svg></span>';
      var v=choix[i],x=B.info(v);return '<span class="rg-pos-i"><span class="rg-g">'+(x?x.ico:'')+'</span><small>'+esc(x?x.nom:v)+'</small></span>'}).join('');
    $$('[data-rgb]').forEach(function(b){var k=choix.indexOf(b.dataset.rgb);b.setAttribute('aria-pressed',String(k>=0));b.querySelector('.rg-n').textContent=k>=0?String(k+1):''});
    $('#rg-ok').disabled=choix.length!==4;
    $('#rg-reste').textContent=choix.length===4?'Les autres menus restent dans le gros bouton du milieu.':'Encore '+(4-choix.length)+' à choisir.';
  }
  X.xopen('Ma barre du bas','Les 4 boutons toujours sous votre pouce',
   '<p class="rg-lead">Touchez les menus dans l\'ordre où vous les voulez, de gauche à droite. Touchez un menu choisi pour l\'enlever.</p>'+
   '<div class="rg-pos" id="rg-pos"></div><p class="rg-sous" id="rg-reste"></p>'+
   '<div class="rg-grille">'+dispo.map(function(v){var x=B.info(v);return '<button type="button" data-rgb="'+v+'" aria-pressed="false"><span class="rg-g">'+x.ico+'<span class="rg-n"></span></span><b>'+esc(x.nom)+'</b></button>'}).join('')+'</div>',
   '<button class="btn" id="rg-defaut">Par défaut</button><button class="btn go" id="rg-ok">Enregistrer</button>',function(){
    $$('[data-rgb]').forEach(function(b){b.addEventListener('click',function(){var v=b.dataset.rgb,k=choix.indexOf(v);if(k>=0)choix.splice(k,1);else if(choix.length<4)choix.push(v);else{toast('Déjà 4 menus','Touchez un menu choisi pour l\'enlever d\'abord.');return}rend()})});
    $('#rg-defaut').addEventListener('click',function(){choix=B.DEFAUT.slice();rend()});
    $('#rg-ok').addEventListener('click',function(){if(choix.length!==4)return;lsS('pc-barre',choix);B.applique();X.xclose();toast('Barre enregistrée',innerWidth<900?'Votre nouvelle barre est en bas de l\'écran.':'Elle s\'affiche sur téléphone et sur iPad en portrait.')});
    rend();
  },true);
}

/* Pour « Mes options » (mes-options.js) : écrire à Cyril avec un texte déjà prêt */
window.PCREG={ecrire:function(txt){formulaire('message',txt)}};

/* ---------- dans le panneau Réglages ---------- */
var menu=$('#menu');
if(menu&&X)menu.addEventListener('click',function(){
  var c=$('#x-in .card.menu');if(!c||c.querySelector('#rg-beta'))return;
  /* la bêta en premier, bien visible */
  var bt=d.createElement('div');bt.className='rg-beta';bt.id='rg-beta';
  bt.innerHTML='<button type="button" class="rg-gros" id="rg-pb"><span class="rg-g">'+IC.bug+'</span><span class="tx"><b>Un problème ? Une idée ?</b><small>Dites-le à Cyril en 30 secondes, sans quitter l\'appli</small></span><span class="go">›</span></button>';
  c.parentNode.insertBefore(bt,c);
  $('#rg-pb').addEventListener('click',function(){formulaire('probleme')});
  /* aides + barre, juste après « Affichage simple » */
  var s=$('#m-simple',c),frag=d.createElement('div');
  frag.innerHTML='<button id="rg-aides"><span class="av">'+IC.aide+'</span><span class="tx"><b>Aides à l\'écran</b><small>Les explications de chaque menu. À couper quand vous êtes à l\'aise</small></span><span class="sw'+(sansAides?'':' on')+'" role="switch" aria-checked="'+(!sansAides)+'"></span></button>'+
    (window.PCBarre?'<button id="rg-barre"><span class="av">'+IC.barre+'</span><span class="tx"><b>Ma barre du bas</b><small>Choisir les 4 boutons toujours à portée de pouce</small></span><span class="go">›</span></button>':'');
  var apres=s?s.nextSibling:c.firstChild;
  while(frag.firstChild)c.insertBefore(frag.firstChild,apres);
  $('#rg-aides').addEventListener('click',function(){
    sansAides=!sansAides;lsS('pc-sans-aides',sansAides);
    if(!sansAides){lsS('pc-tips',{});$$('.tip[data-tip]').forEach(function(t){t.hidden=false})}
    aidesUI();var w=this.querySelector('.sw');w.classList.toggle('on',!sansAides);w.setAttribute('aria-checked',String(!sansAides));
    toast(sansAides?'Aides cachées':'Aides de retour',sansAides?'Vous pouvez les rallumer ici à tout moment.':'Les explications sont revenues dans chaque menu.');
  });
  var rb=$('#rg-barre');if(rb)rb.addEventListener('click',barre);
  /* « Une question ? » : devient un vrai message à Cyril (avant, il n'envoyait rien) */
  var h=$('#m-help',c);
  if(h){var n=h.cloneNode(true);n.id='rg-help';n.querySelector('.tx b').textContent='Écrire à Cyril';n.querySelector('.tx small').textContent='Vos messages et ses réponses · par écrit ou il vous rappelle';h.parentNode.replaceChild(n,h);n.addEventListener('click',messages)}
});
})();
