/* Lien négoce ↔ poseur, pour de vrai (Cyril 24/11 « C'est parti pour la négoce » ; décisions du 15/11, démo ERAL).
   Deux Espaces ProClik se relient par un code : le NÉGOCE (option « Réseau négoce », c'est lui qui paie) et ses POSEURS (gratuit).
   - Poseur : un bouton à part AU NOM DU NÉGOCE (ses clients ne se mélangent jamais aux vôtres) : À répondre, Calées, Faites.
     Accepter / Proposer une autre date / Refuser ; « Pose faite » avec photos et réserves ; « Envoyer ma facture de pose ».
     Une pose acceptée arrive dans SON planning (« Pose · nom du négoce · client »).
   - Négoce : « Mes poseurs » : relier un poseur (code de 8 caractères), envoyer une pose, voir les réponses, marquer payé.
   Service : proclik-cliky, calcul/negoce.js. Rien en démo : le bouton n'apparaît que dans un Espace connecté. */
(function(){
'use strict';
var d=document,X=window.PCX;if(!X)return;
function $(s,r){return (r||d).querySelector(s)}
function $$(s,r){return [].slice.call((r||d).querySelectorAll(s))}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function lsg(k,v){try{var x=JSON.parse(localStorage.getItem(k)||'null');return x==null?v:x}catch(e){return v}}
function lss(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
var SERVICE=String(window.PC_SERVICE||'').replace(/\/+$/,'');
function jeton(){return lsg('pc-vrai-jeton',null)}
function apercu(){try{return sessionStorage.getItem('pc-apercu')==='1'}catch(e){return false}}
function reel(){return !!(SERVICE&&jeton()&&!lsg('pc-membre',null)&&!apercu())}
function api(chemin,corps){return fetch(SERVICE+chemin,{method:corps?'POST':'GET',headers:corps?{'Content-Type':'application/json',Authorization:'Bearer '+jeton()}:{Authorization:'Bearer '+jeton()},body:corps?JSON.stringify(corps):undefined,cache:'no-store'})
 .then(function(r){return r.json().catch(function(){return {ok:false}})})}
function toast(a,b){X.toast&&X.toast(a,b||'')}
var I=function(p){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>'};
var IC={lien:I('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'),
 maison:I('<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>'),tel:I('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>'),
 map:I('<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>'),photo:I('<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>'),
 plus:I('<path d="M12 5v14M5 12h14"/>'),check:I('<path d="m5 12 5 5 9-10"/>')};
var JC=['dim.','lun.','mar.','mer.','jeu.','ven.','sam.'];
function jour(iso){if(!iso)return 'date à caler';var t=new Date(iso+'T12:00:00');return JC[t.getDay()]+' '+t.getDate()+'/'+(t.getMonth()+1)}
function hh(h){return h?h.replace(':',' h ').replace(' h 00',' h'):''}
function eur(n){return (Math.round(n*100)/100).toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})+' €'}
var ST={proposee:['À répondre','wa'],autre:['Autre date proposée','wa'],acceptee:['Calée','ok'],refusee:['Refusée','no'],faite:['Faite','ok'],annulee:['Annulée','no']};

var D={negoce:false,poseurs:[],negoces:[],poses:[]},charge=false;
function charger(){if(!reel())return Promise.resolve(D);
 return api('/espace/negoce').then(function(x){if(x&&x.ok){D=x;charge=true;entree();planning();accueil()}return D},function(){return D})}
function actifsN(){return D.negoces.filter(function(n){return n.etat==='actif'})}
function aVoir(role,avec){return D.poses.filter(function(p){return p.role===role&&p.nouveau&&(!avec||p.avec===avec)}).length}

/* ---------- l'entrée du menu (comme Plans, Cadences…) : au nom du négoce pour un poseur, « Mes poseurs » pour un négoce ---------- */
function entree(){var nav=$('nav.nav');if(!nav)return;var b=$('#nb-negoce'),N=actifsN(),voir=D.negoce||N.length;
 if(!voir){if(b)b.hidden=true;return}
 var nom=D.negoce?'Mes poseurs':(N.length===1?N[0].n:'Mes négoces'),n=aVoir(D.negoce?'neg':'pos')+(D.negoce&&N.length?aVoir('pos'):0);
 if(!b){b=d.createElement('button');b.type='button';b.id='nb-negoce';b.setAttribute('data-pbx','');b.addEventListener('click',function(){ouvrir()});nav.appendChild(b)}
 b.hidden=false;b.innerHTML='<span class="ico" aria-hidden="true">'+(D.negoce?IC.lien:IC.maison)+'</span>'+esc(nom)+'<span class="badge"'+(n?'':' hidden')+'>'+n+'</span>';
 if(window.PCBarre&&PCBarre.applique)PCBarre.applique()}
/* une ligne à l'Accueil quand une pose attend une réponse (Cyril 15/11 : « Valcroix · 1 pose à accepter ») */
function accueilL(){var L=[];actifsN().forEach(function(n){var k=D.poses.filter(function(p){return p.role==='pos'&&p.avec===n.id&&p.st==='proposee'}).length;if(k)L.push([n.id,n.n+' · '+k+' pose'+(k>1?'s':'')+' à accepter'])});
 if(D.negoce){var r=D.poses.filter(function(p){return p.role==='neg'&&p.nouveau}).length;if(r)L.push(['',r+' réponse'+(r>1?'s':'')+' de vos poseurs'])}return L}
function accueilHTML(){if(!reel())return '';return accueilL().map(function(l){return '<button type="button" class="f2doc ng-al" data-nga="'+esc(l[0])+'"><span class="rond">'+(l[0]?IC.maison:IC.lien)+'</span><span class="x"><b>'+esc(l[1])+'</b><span>Touchez pour voir et répondre</span></span><span class="ng-go">›</span></button>'}).join('')}
function accueil(){var A=window.PCACC;if(A&&A.apres)try{A.apres()}catch(e){}}
d.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-nga]');if(b)ouvrir(b.dataset.nga||null)});
/* ---------- les poses dans le planning de chacun (une pose calée = un créneau) ---------- */
function planning(){var E=lsg('pc-ev1',[]);if(!Array.isArray(E))return;var avant=JSON.stringify(E),gardees={};
 D.poses.forEach(function(p){var cale=(p.st==='acceptee'||p.st==='faite')&&p.date;if(!cale)return;gardees[p.id]=1;
  var fin=p.h&&p.h<'12:00'?'12:00':'17:00',e={d:p.date,s:p.h||'08:00',e:p.h?fin:'17:00',k:'plan',t:'Pose · '+p.avecN+' · '+(p.client&&p.client.n||''),w:(p.client&&p.client.adr)||'',x:{neg:p.id,negr:p.role}};
  var i=E.findIndex(function(x){return x&&x.x&&x.x.neg===p.id});if(i<0)E.push(e);else if(E[i].d!==e.d||E[i].s!==e.s||E[i].t!==e.t)E[i]=e});
 E=E.filter(function(x){return !(x&&x.x&&x.x.neg)||gardees[x.x.neg]});
 if(JSON.stringify(E)!==avant){lss('pc-ev1',E);if(window.EV&&Array.isArray(window.EV)){for(var j=EV.length-1;j>=0;j--)if(EV[j]&&EV[j].x&&EV[j].x.neg)EV.splice(j,1);E.forEach(function(x){if(x.x&&x.x.neg)EV.push(x)})}}}

/* ---------- l'écran principal ---------- */
var VUE='repondre';
function ouvrir(avec){if(!reel()){toast('Lien négoce','Il marche dans votre Espace connecté.');return}
 X.xopen(D.negoce?'Mes poseurs':(actifsN().length===1?actifsN()[0].n:'Mes négoces'),'Chargement…','<p class="hint">Un instant…</p>','',null);
 charger().then(function(){if(D.negoce&&!avec)ecranNegoce();else ecranPoseur(avec||(actifsN()[0]||{}).id)})}

function carte(p){var s=ST[p.st]||['',''],c=p.client||{};
 return '<button type="button" class="ng-p" data-ngp="'+esc(p.id)+'" data-av="'+esc(p.avec)+'">'+(p.nouveau?'<i class="ng-nv" aria-label="nouveau"></i>':'')+
  '<span class="ng-d"><b>'+esc(jour(p.st==='autre'&&p.prop?p.prop.date:p.date).split(' ')[1]||'—')+'</b><small>'+esc(jour(p.date).split(' ')[0]||'')+'</small></span>'+
  '<span class="tx"><b>'+esc(c.n)+'</b><small>'+esc(p.quoi)+(c.adr?' · '+esc(c.adr.split(',').pop().trim()):'')+'</small>'+
  '<span class="ng-st '+s[1]+'">'+esc(s[0])+(p.st==='autre'&&p.prop?' : '+esc(jour(p.prop.date)):'')+(p.role==='neg'?' · '+esc(p.avecN):'')+(p.facture?' · facture '+(p.facture.st==='payee'?'payée':'à payer'):'')+'</span></span><span class="ng-go">›</span></button>'}

function ecranPoseur(neg){var n=D.negoces.filter(function(x){return x.id===neg})[0];
 if(!n){X.xopen('Lien négoce','','<p class="hint">Aucun négoce relié pour l\'instant.</p>'+blocLier(),'<button class="btn" data-xclose>Fermer</button>',lierLier);return}
 var L=D.poses.filter(function(p){return p.role==='pos'&&p.avec===neg}),G={repondre:L.filter(function(p){return p.st==='proposee'||p.st==='autre'}),calees:L.filter(function(p){return p.st==='acceptee'}),faites:L.filter(function(p){return p.st==='faite'||p.st==='refusee'})};
 if(!G[VUE].length&&VUE==='repondre'&&G.calees.length)VUE='calees';
 var T=[['repondre','À répondre'],['calees','Calées'],['faites','Faites']];
 var h='<p class="hint" style="margin:0 0 12px">Les poses que '+esc(n.n)+' vous confie. Ses clients restent à part : ils ne se mélangent pas aux vôtres.</p>'+
  '<div class="seg ng-seg" role="tablist">'+T.map(function(t){return '<button role="tab" data-ngv="'+t[0]+'" aria-selected="'+(VUE===t[0])+'">'+t[1]+(G[t[0]].length?' <i>'+G[t[0]].length+'</i>':'')+'</button>'}).join('')+'</div>'+
  '<div class="ng-l">'+(G[VUE].length?G[VUE].map(carte).join(''):'<p class="hint" style="text-align:center;margin:18px 0">'+(VUE==='repondre'?'Rien à répondre pour l\'instant.':VUE==='calees'?'Aucune pose calée.':'Pas encore de pose faite.')+'</p>')+'</div>'+
  (n.etat!=='actif'?'<p class="hint">Le lien avec ce négoce est coupé.</p>':'');
 X.xopen(n.n,'Poses confiées · relié depuis le '+jour(n.depuis),h,'<button class="btn" data-xclose>Fermer</button>',function(){
  $$('#x-in [data-ngv]').forEach(function(b){b.addEventListener('click',function(){VUE=b.dataset.ngv;ecranPoseur(neg)})});
  lierCartes(function(){ecranPoseur(neg)})})}

function ecranNegoce(){var P=D.poseurs,L=D.poses.filter(function(p){return p.role==='neg'&&p.st!=='annulee'});
 var G={rep:L.filter(function(p){return p.st==='proposee'||p.st==='autre'||p.st==='refusee'}),cal:L.filter(function(p){return p.st==='acceptee'}),fac:L.filter(function(p){return p.st==='faite'})};
 var h='<button type="button" class="btn go ng-big" id="ng-env"'+(P.some(function(x){return x.etat==='actif'})?'':' disabled')+'>'+IC.plus+'Envoyer une pose</button>'+
  sec('Réponses des poseurs',G.rep,'Aucune pose en attente de réponse.')+sec('Calées',G.cal,'Aucune pose calée.')+sec('Faites · factures de pose',G.fac,'Pas encore de pose faite.')+
  '<div class="xsec"><h3>Vos poseurs</h3><div class="card">'+(P.length?P.map(function(x){return '<div class="ng-r"><span class="ng-ic">'+IC.maison+'</span><span class="tx"><b>'+esc(x.n)+'</b><small>'+(x.etat==='actif'?'Relié depuis le '+esc(jour(x.depuis)):'Lien coupé')+'</small></span>'+(x.etat==='actif'?'<button type="button" class="btn" data-ngcut="'+esc(x.id)+'">Couper</button>':'')+'</div>'}).join(''):'<p class="hint" style="margin:0">Aucun poseur relié pour l\'instant.</p>')+
  '<button type="button" class="btn" id="ng-code" style="width:100%;margin-top:10px">'+IC.lien+' Relier un poseur</button></div>'+
  '<p class="hint" style="margin:8px 2px 0">Le poseur garde son propre Espace (gratuit pour lui). Il ne voit que les poses que vous lui envoyez.</p></div>'+
  (actifsN().length?'<button type="button" class="btn" id="ng-moi" style="width:100%;margin-top:12px">Les poses que mes négoces me confient</button>':'');
 X.xopen('Mes poseurs',P.length+' poseur'+(P.length>1?'s':'')+' relié'+(P.length>1?'s':''),h,'<button class="btn" data-xclose>Fermer</button>',function(){
  var e=$('#ng-env');if(e)e.addEventListener('click',function(){formulaire(null)});
  $('#ng-code').addEventListener('click',nouveauCode);
  var m=$('#ng-moi');if(m)m.addEventListener('click',function(){ecranPoseur(actifsN()[0].id)});
  $$('#x-in [data-ngcut]').forEach(function(b){var arm=0;b.addEventListener('click',function(){if(!arm){arm=1;b.textContent='Sûr ? Touchez encore';setTimeout(function(){arm=0;b.textContent='Couper'},3500);return}
   api('/espace/negoce',{op:'couper',avec:b.dataset.ngcut}).then(function(){charger().then(ecranNegoce);toast('Lien coupé','Ce poseur ne reçoit plus vos poses.')})})});
  lierCartes(ecranNegoce)})}
function sec(t,L,vide){return '<div class="xsec"><h3>'+esc(t)+(L.length?' · '+L.length:'')+'</h3>'+(L.length?'<div class="ng-l">'+L.map(carte).join('')+'</div>':'<p class="hint" style="margin:0 2px">'+esc(vide)+'</p>')+'</div>'}
function lierCartes(retour){$$('#x-in [data-ngp]').forEach(function(b){b.addEventListener('click',function(){fiche(b.dataset.av,b.dataset.ngp,retour)})})}

/* ---------- relier : le négoce crée un code, le poseur le tape ---------- */
function nouveauCode(){api('/espace/negoce',{op:'code'}).then(function(x){if(!x.ok){toast('Code impossible',x.erreur);return}
 var txt='Bonjour, pour recevoir nos poses directement dans votre Espace ProClik : ouvrez votre Espace, Mes options › Lien négoce, et tapez le code '+x.code+' (valable 7 jours). Ou touchez ce lien : '+x.lien;
 X.xopen('Relier un poseur','Code valable 7 jours, une seule fois','<div class="card ng-code"><span>Code à donner au poseur</span><b>'+x.code.slice(0,4)+' '+x.code.slice(4)+'</b><small>Il le tape dans son Espace : Mes options › Lien négoce. Il n\'a pas d\'Espace ? Il en ouvre un gratuitement avec vous.</small></div>'+
  '<div class="rl-fb" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px"><a class="btn go" href="sms:?&body='+encodeURIComponent(txt)+'">Envoyer par SMS</a><button type="button" class="btn" id="ng-cp">Copier</button></div>','<button class="btn" id="ng-ret">‹ Mes poseurs</button>',function(){
  $('#ng-cp').addEventListener('click',function(){try{navigator.clipboard.writeText(txt).then(function(){toast('Copié','Collez-le dans un SMS ou un e-mail.')})}catch(e){toast('Copie impossible','Notez le code.')}});
  $('#ng-ret').addEventListener('click',function(){charger().then(ecranNegoce)})})})}
function blocLier(code){return '<div class="card ng-lier"><b>Relier votre Espace à un négoce</b><p class="hint" style="margin:4px 0 10px">Votre négoce vous donne un code de 8 caractères. Ses poses arrivent ensuite ici, dans un bouton à son nom. C\'est gratuit pour vous.</p>'+
 '<input id="ng-ci" class="ng-ci" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="9" placeholder="ABCD 2345" aria-label="Code du négoce" value="'+esc(code||'')+'"><p id="ng-ce" role="alert" class="ng-err"></p><button type="button" class="btn go" id="ng-cok" style="width:100%">Relier mon Espace</button></div>'}
function lierLier(){var b=$('#ng-cok');if(!b)return;b.addEventListener('click',function(){var c=$('#ng-ci').value,e=$('#ng-ce');e.textContent='';
 if(c.replace(/[^A-Za-z0-9]/g,'').length!==8){e.textContent='Le code a 8 caractères.';return}
 b.disabled=true;api('/espace/negoce',{op:'lier',code:c}).then(function(x){b.disabled=false;if(!x.ok){e.textContent=x.erreur||'Ce code ne passe pas.';return}
  try{if(/#lier=/.test(location.hash))history.replaceState(null,'',location.pathname+location.search)}catch(er){}
  toast('Relié à '+x.negoce.n,'Ses poses arriveront dans le bouton « '+x.negoce.n+' ».');charger().then(function(){ecranPoseur(x.negoce.id)})},function(){b.disabled=false;e.textContent='Pas de réseau pour l\'instant.'})})}

/* ---------- une pose ---------- */
function fiche(avec,id,retour){api('/espace/negoce/pose?avec='+encodeURIComponent(avec)+'&id='+encodeURIComponent(id)).then(function(x){if(!x.ok){toast('Pose introuvable',x.erreur);return}
 var p=x.pose,c=p.client||{},neg=p.role==='neg',s=ST[p.st]||['',''];
 var h='<div class="card ng-f"><span class="ng-st '+s[1]+'">'+esc(s[0])+'</span><b class="ng-t">'+esc(p.quoi)+'</b>'+
  '<div class="ng-r"><span class="ng-ic">'+IC.map+'</span><span class="tx"><b>'+esc(jour(p.date))+(p.h?' · '+esc(hh(p.h)):'')+(p.duree?' · '+esc(p.duree):'')+'</b><small>'+esc(c.adr||'Adresse à demander')+'</small></span>'+(c.adr?'<a class="btn" href="https://maps.apple.com/?daddr='+encodeURIComponent(c.adr)+'">Itinéraire</a>':'')+'</div>'+
  '<div class="ng-r"><span class="ng-ic">'+IC.tel+'</span><span class="tx"><b>'+esc(c.n)+'</b><small>'+(neg?'Votre client':'Client de '+esc(p.avecN))+'</small></span>'+(c.tel?'<a class="btn" href="tel:'+esc(c.tel.replace(/[^\d+]/g,''))+'">Appeler</a>':'')+'</div>'+
  (p.ref?'<p class="hint" style="margin:8px 0 0">Référence : '+esc(p.ref)+'</p>':'')+'</div>'+
  (p.st==='autre'&&p.prop?'<div class="card ng-prop"><b>'+(neg?esc(p.avecN)+' propose le '+esc(jour(p.prop.date))+(p.prop.h?' à '+esc(hh(p.prop.h)):''):'Vous avez proposé le '+esc(jour(p.prop.date)))+'</b>'+(p.prop.mot?'<small>« '+esc(p.prop.mot)+' »</small>':'')+(neg?'<button type="button" class="btn go" id="ng-okd" style="width:100%;margin-top:10px">Accepter cette date</button>':'<small>En attente de la réponse du négoce.</small>')+'</div>':'')+
  (p.st==='refusee'?'<div class="card ng-prop"><b>'+(neg?esc(p.avecN)+' ne peut pas':'Vous avez refusé')+'</b>'+(p.mot?'<small>« '+esc(p.mot)+' »</small>':'')+'</div>':'')+
  (p.cotes?'<div class="xsec"><h3>Cotes</h3><div class="card"><p class="ng-pre">'+esc(p.cotes)+'</p></div></div>':'')+
  (p.notes?'<div class="xsec"><h3>À savoir</h3><div class="card"><p class="ng-pre">'+esc(p.notes)+'</p></div></div>':'')+
  (p.plan?'<div class="xsec"><h3>Le plan</h3><div class="card ng-plan">'+p.plan+'</div></div>':'')+
  (p.faite?'<div class="xsec"><h3>Pose faite le '+esc(jour(p.faite.d))+'</h3><div class="card">'+(p.photos&&p.photos.length?'<div class="ng-ph">'+p.photos.map(function(f){return '<img alt="Photo de la pose" src="'+esc(f)+'">'}).join('')+'</div>':'')+
   (p.faite.res?'<p class="ng-pre"><b>Réserves :</b> '+esc(p.faite.res)+'</p>':'<p class="hint" style="margin:6px 0 0">Aucune réserve.</p>')+(p.faite.mot?'<p class="ng-pre">'+esc(p.faite.mot)+'</p>':'')+'</div></div>':'')+
  (p.facture?'<div class="xsec"><h3>Facture de pose</h3><div class="card ng-r"><span class="tx"><b>'+eur(p.facture.ht)+' HT</b><small>'+(p.facture.num?'N° '+esc(p.facture.num)+' · ':'')+'envoyée le '+esc(jour(p.facture.d))+(p.facture.st==='payee'?' · payée le '+esc(jour(p.facture.payee)):'')+'</small></span>'+
   (neg&&p.facture.st!=='payee'?'<button type="button" class="btn go" id="ng-pay">Payée</button>':'<span class="ng-st '+(p.facture.st==='payee'?'ok':'wa')+'">'+(p.facture.st==='payee'?'Payée':'À payer')+'</span>')+'</div></div>':'')+
  '<div class="xsec"><h3>Messages</h3><div class="card"><div class="ng-msgs">'+((p.msgs||[]).length?p.msgs.map(function(m){var moi=(m.de==='neg')===neg;return '<p class="ng-m'+(moi?' moi':'')+'"><span>'+esc(m.t)+'</span><small>'+(moi?'Vous':esc(p.avecN))+' · '+esc(jour(m.h.slice(0,10)))+' '+esc(m.h.slice(11,16).replace(':',' h '))+'</small></p>'}).join(''):'<p class="hint" style="margin:0">Pas encore de message.</p>')+'</div>'+
   '<div class="ng-w"><textarea id="ng-mt" rows="1" placeholder="Écrire à '+esc(p.avecN)+'…" aria-label="Message"></textarea><button type="button" class="btn go" id="ng-ms">Envoyer</button></div></div></div>';
 var pied='<button class="btn" id="ng-ret">‹ Retour</button>';
 if(!neg&&p.st==='proposee')pied='<button class="btn" id="ng-ret">‹</button><button class="btn" id="ng-aut">Autre date</button><button class="btn go" id="ng-acc">Accepter</button>';
 else if(!neg&&p.st==='acceptee')pied='<button class="btn" id="ng-ret">‹ Retour</button><button class="btn go" id="ng-fai">'+IC.check+' Pose faite</button>';
 else if(!neg&&p.st==='faite'&&!p.facture)pied='<button class="btn" id="ng-ret">‹ Retour</button><button class="btn go" id="ng-fac">Envoyer ma facture de pose</button>';
 else if(neg&&p.st!=='faite')pied='<button class="btn" id="ng-ret">‹</button><button class="btn" id="ng-ann">Annuler</button><button class="btn go" id="ng-mod">Modifier</button>';
 X.xopen(esc(c.n)?c.n:'Pose',neg?'Pose confiée à '+p.avecN:'Pose pour '+p.avecN,h,pied,function(){
  var corps=function(o){o.avec=avec;o.id=id;return o};
  var faire=function(o,msg){return api('/espace/negoce',corps(o)).then(function(y){if(!y.ok){toast('Pas envoyé',y.erreur);return}if(msg)toast(msg[0],msg[1]);charger().then(function(){fiche(avec,id,retour)})},function(){toast('Pas de réseau','Réessayez dans un instant.')})};
  $('#ng-ret').addEventListener('click',function(){charger().then(retour)});
  $('#ng-ms').addEventListener('click',function(){var t=$('#ng-mt').value.trim();if(t)faire({op:'msg',t:t})});
  var b;
  if((b=$('#ng-acc')))b.addEventListener('click',function(){faire({op:'repondre',rep:'accepter'},['Pose acceptée','Elle est dans votre planning, et '+p.avecN+' est prévenu.'])});
  if((b=$('#ng-aut')))b.addEventListener('click',function(){autreDate(p,faire)});
  if((b=$('#ng-fai')))b.addEventListener('click',function(){poseFaite(p,faire)});
  if((b=$('#ng-fac')))b.addEventListener('click',function(){facture(p,faire)});
  if((b=$('#ng-pay')))b.addEventListener('click',function(){faire({op:'payee'},['Marquée payée',p.avecN+' le voit.'])});
  if((b=$('#ng-okd')))b.addEventListener('click',function(){var q=JSON.parse(JSON.stringify(p));q.date=p.prop.date;if(p.prop.h)q.h=p.prop.h;
   api('/espace/negoce',{op:'envoyer',pos:avec,pose:q}).then(function(y){if(!y.ok){toast('Pas envoyé',y.erreur);return}toast('Date acceptée',p.avecN+' n\'a plus qu\'à confirmer.');charger().then(function(){fiche(avec,id,retour)})})});
  if((b=$('#ng-mod')))b.addEventListener('click',function(){formulaire(p)});
  if((b=$('#ng-ann'))){var arm=0;b.addEventListener('click',function(){if(!arm){arm=1;b.textContent='Sûr ?';setTimeout(function(){arm=0;b.textContent='Annuler'},3500);return}faire({op:'annuler'},['Pose annulée',p.avecN+' ne la voit plus.'])})}})})}

function autreDate(p,faire){X.xopen('Proposer une autre date',p.client.n,'<label class="ng-lab">Votre date<input type="date" id="ng-ad" value="'+esc(p.date||'')+'"></label><label class="ng-lab">Heure (facultatif)<input type="time" id="ng-ah" value="'+esc(p.h||'')+'"></label>'+
 '<label class="ng-lab">Un mot pour '+esc(p.avecN)+' (facultatif)<textarea id="ng-am" rows="2" placeholder="Ex. : le 3 je suis sur un autre chantier"></textarea></label><button type="button" class="ng-lien" id="ng-ref">Je ne peux pas prendre cette pose</button>',
 '<button class="btn" data-xclose>Annuler</button><button class="btn go" id="ng-aok">Proposer</button>',function(){
  $('#ng-aok').addEventListener('click',function(){var dd=$('#ng-ad').value;if(!dd){toast('Choisissez une date','');return}faire({op:'repondre',rep:'autre',date:dd,h:$('#ng-ah').value,mot:$('#ng-am').value},['Date proposée',p.avecN+' va vous répondre.'])});
  var arm=0,r=$('#ng-ref');r.addEventListener('click',function(){if(!arm){arm=1;r.textContent='Touchez encore pour refuser la pose';setTimeout(function(){arm=0;r.textContent='Je ne peux pas prendre cette pose'},3500);return}faire({op:'repondre',rep:'refuser',mot:$('#ng-am').value},['Pose refusée',p.avecN+' est prévenu.'])})},1)}
function reduire(f,cb){var r=new FileReader();r.onload=function(){var im=new Image();im.onload=function(){var m=1000,s=Math.min(1,m/Math.max(im.width,im.height)),cv=d.createElement('canvas');cv.width=Math.round(im.width*s);cv.height=Math.round(im.height*s);cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);cb(cv.toDataURL('image/jpeg',.72))};im.src=r.result};r.readAsDataURL(f)}
function poseFaite(p,faire){var F=[];X.xopen('Pose faite',p.client.n,'<label class="btn ng-phb">'+IC.photo+' Ajouter des photos<input type="file" accept="image/*" multiple id="ng-pf" hidden></label><div class="ng-ph" id="ng-pa"></div>'+
 '<label class="ng-lab">Des réserves ? (facultatif)<textarea id="ng-pr" rows="2" placeholder="Ex. : joint de la fenêtre 2 à reprendre"></textarea></label><label class="ng-lab">Un mot (facultatif)<textarea id="ng-pm" rows="2"></textarea></label>',
 '<button class="btn" data-xclose>Annuler</button><button class="btn go" id="ng-pok">Envoyer</button>',function(){
  $('#ng-pf').addEventListener('change',function(){[].slice.call(this.files||[]).slice(0,6-F.length).forEach(function(f){reduire(f,function(u){F.push(u);$('#ng-pa').innerHTML=F.map(function(x){return '<img alt="" src="'+x+'">'}).join('')})})});
  $('#ng-pok').addEventListener('click',function(){this.disabled=true;faire({op:'faite',photos:F,reserves:$('#ng-pr').value,mot:$('#ng-pm').value},['C\'est envoyé',p.avecN+' voit la pose faite'+(F.length?' et vos photos':'')+'.'])})},1)}
function facture(p,faire){X.xopen('Facture de pose',p.client.n,'<label class="ng-lab">Montant de la pose (HT)<input id="ng-fh" inputmode="decimal" placeholder="Ex. : 320"></label><label class="ng-lab">Numéro de votre facture (facultatif)<input id="ng-fn" placeholder="Ex. : F-2026-041"></label>'+
 '<p class="hint" style="margin:0">'+esc(p.avecN)+' la reçoit dans son Espace et la marque payée quand c\'est réglé.</p>','<button class="btn" data-xclose>Annuler</button><button class="btn go" id="ng-fok">Envoyer</button>',function(){
  $('#ng-fok').addEventListener('click',function(){var v=$('#ng-fh').value;if(!(parseFloat(String(v).replace(',','.'))>0)){toast('Le montant HT ?','');return}faire({op:'facture',ht:v,num:$('#ng-fn').value},['Facture envoyée',p.avecN+' la voit dans son Espace.'])})},1)}

/* ---------- le négoce envoie (ou modifie) une pose ---------- */
function formulaire(p){var P=D.poseurs.filter(function(x){return x.etat==='actif'}),q=p||{client:{}},c=q.client||{};
 var h='<label class="ng-lab">Poseur<select id="ng-fp"'+(p?' disabled':'')+'>'+P.map(function(x){return '<option value="'+esc(x.id)+'"'+(p&&p.avec===x.id?' selected':'')+'>'+esc(x.n)+'</option>'}).join('')+'</select></label>'+
  '<label class="ng-lab">Client<input id="ng-cn" value="'+esc(c.n||'')+'" placeholder="Nom du client" autocapitalize="words"></label>'+
  '<label class="ng-lab">Téléphone du client<input id="ng-ct" type="tel" value="'+esc(c.tel||'')+'" placeholder="06 12 34 56 78"></label>'+
  '<label class="ng-lab">Adresse du chantier<input id="ng-ca" value="'+esc(c.adr||'')+'" placeholder="N°, rue, commune"></label>'+
  '<label class="ng-lab">Ce qu\'il y a à poser<input id="ng-q" value="'+esc(q.quoi||'')+'" placeholder="Ex. : 2 fenêtres PVC + 1 porte-fenêtre"></label>'+
  '<div class="ng-2"><label class="ng-lab">Date<input type="date" id="ng-dt" value="'+esc(q.date||'')+'"></label><label class="ng-lab">Heure<input type="time" id="ng-h" value="'+esc(q.h||'')+'"></label></div>'+
  '<label class="ng-lab">Durée (facultatif)<input id="ng-du" value="'+esc(q.duree||'')+'" placeholder="Ex. : 1 journée"></label>'+
  '<label class="ng-lab">Cotes (facultatif)<textarea id="ng-co" rows="3" placeholder="Ex. : F1 cuisine 120 × 135">'+esc(q.cotes||'')+'</textarea></label>'+
  '<label class="ng-lab">À savoir (facultatif)<textarea id="ng-no" rows="2" placeholder="Accès, étage, clés, livraison…">'+esc(q.notes||'')+'</textarea></label>'+
  '<label class="ng-lab">Votre référence (facultatif)<input id="ng-rf" value="'+esc(q.ref||'')+'" placeholder="N° de commande"></label>';
 X.xopen(p?'Modifier la pose':'Envoyer une pose',p?'Le poseur la revoit pour dire oui':'Le poseur la reçoit dans son Espace',h,'<button class="btn" data-xclose>Annuler</button><button class="btn go" id="ng-fok">'+(p?'Renvoyer':'Envoyer')+'</button>',function(){
  $('#ng-fok').addEventListener('click',function(){var b=this,v=function(s){return $(s).value.trim()};
   var pose={id:p&&p.id,client:{n:v('#ng-cn'),tel:v('#ng-ct'),adr:v('#ng-ca')},quoi:v('#ng-q'),date:v('#ng-dt'),h:v('#ng-h'),duree:v('#ng-du'),cotes:v('#ng-co'),notes:v('#ng-no'),ref:v('#ng-rf'),plan:p&&p.plan||''};
   if(!pose.client.n||!pose.quoi){toast('Il manque le client ou ce qu\'il y a à poser','');return}
   b.disabled=true;api('/espace/negoce',{op:'envoyer',pos:p?p.avec:$('#ng-fp').value,pose:pose}).then(function(y){b.disabled=false;if(!y.ok){toast('Pas envoyé',y.erreur);return}
    toast(p?'Pose renvoyée':'Pose envoyée','Le poseur la voit dans son Espace et vous répond.');charger().then(ecranNegoce)},function(){b.disabled=false;toast('Pas de réseau','Réessayez dans un instant.')})})})}

/* ---------- Mes options › Lien négoce : le vrai bloc pour se relier ---------- */
window.PCNEG={reel:reel,ouvrir:ouvrir,charger:charger,accueilHTML:accueilHTML,
 blocOption:function(){var N=actifsN();return (N.length?'<div class="xsec"><h3>Vos négoces</h3><div class="card">'+N.map(function(n){return '<button type="button" class="ng-r ng-rb" data-ngo="'+esc(n.id)+'"><span class="ng-ic">'+IC.maison+'</span><span class="tx"><b>'+esc(n.n)+'</b><small>Relié depuis le '+esc(jour(n.depuis))+'</small></span><span class="ng-go">›</span></button>'}).join('')+'</div></div>':'')+'<div class="xsec">'+blocLier()+'</div>'+
  (D.negoce?'<div class="xsec"><button type="button" class="btn go" style="width:100%" data-ngo="">Mes poseurs</button></div>':'')},
 lierOption:function(){lierLier();$$('#x-in [data-ngo]').forEach(function(b){b.addEventListener('click',function(){ouvrir(b.dataset.ngo||null)})})}};

/* lien reçu par SMS : #lier=CODE ouvre directement « Relier mon Espace » */
function lienRecu(){var m=/#lier=([A-Za-z0-9-]{8,9})/.exec(location.hash);if(!m||!reel())return;
 X.xopen('Lien négoce','Relier votre Espace',blocLier(m[1].toUpperCase()),'<button class="btn" data-xclose>Plus tard</button>',lierLier)}

var css=d.createElement('style');css.textContent=
 ''+
 '.ng-ic{width:36px;height:36px;border-radius:12px;display:grid;place-items:center;background:var(--soft,#EEF1F6);flex:none}.ng-ic svg,.ng-big svg,.ng-phb svg{width:20px;height:20px}'+
 '.ng-go{color:var(--muted);font-size:22px}.ng-seg{margin:0 0 12px;display:flex}.ng-seg button{flex:1}.ng-seg i{font-style:normal;opacity:.7}'+
 '.ng-l{display:grid;gap:8px}.ng-p{position:relative;display:flex;align-items:center;gap:12px;width:100%;text-align:left;padding:12px 14px;border:0;border-radius:16px;background:var(--card,#fff);box-shadow:0 1px 0 var(--line,rgba(0,0,0,.06)),0 2px 10px rgba(0,0,0,.04);font:inherit;color:inherit;cursor:pointer}'+
 '.ng-p .tx,.ng-r .tx{flex:1;min-width:0;display:grid;gap:2px}.ng-p .tx small,.ng-r .tx small{color:var(--muted);font-size:13px}'+
 '.ng-d{width:48px;flex:none;display:grid;text-align:center;line-height:1.1}.ng-d b{font-size:17px}.ng-d small{font-size:12px;color:var(--muted)}'+
 '.ng-nv{position:absolute;left:6px;top:6px;width:9px;height:9px;border-radius:50%;background:var(--n1-laiton,#B08A3E)}'+
 '.ng-st{display:inline-block;justify-self:start;font-size:12px;font-weight:700;padding:3px 8px;border-radius:999px;background:var(--soft,#EEF1F6)}.ng-st.wa{background:#F7EBD3;color:#7A5410}.ng-st.ok{background:#E2F0E6;color:#1E6B3A}.ng-st.no{background:#F6E1E1;color:#8E2A2A}'+
 '.ng-r a.btn,.ng-r .btn{text-decoration:none;flex:none;width:auto;min-height:40px;padding:0 14px;display:inline-flex;align-items:center;justify-content:center}.ng-r{display:flex;align-items:center;gap:12px;padding:10px 0;border-top:1px solid var(--line,rgba(0,0,0,.07))}.ng-r:first-child{border-top:0}.ng-rb{width:100%;background:none;border-left:0;border-right:0;border-bottom:0;font:inherit;color:inherit;text-align:left;cursor:pointer}'+
 '.ng-f{display:grid;gap:4px}.ng-t{font-size:18px;margin:6px 0 4px}.ng-prop{margin-top:10px;display:grid;gap:4px}.ng-prop small{color:var(--muted)}.ng-pre{white-space:pre-wrap;margin:6px 0 0;font-size:14.5px}'+
 '.ng-plan svg{width:100%;height:auto;max-height:50vh;display:block}.ng-ph{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:8px 0}.ng-ph img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:10px}'+
 '.ng-msgs{display:grid;gap:8px;margin-bottom:10px}.ng-m{margin:0;display:grid;justify-items:start}.ng-m span{background:var(--soft,#EEF1F6);padding:8px 12px;border-radius:14px 14px 14px 4px;max-width:85%}.ng-m.moi{justify-items:end}.ng-m.moi span{background:var(--n1-nuit,#1B2440);color:#fff;border-radius:14px 14px 4px 14px}.ng-m small{font-size:11.5px;color:var(--muted);margin-top:2px}'+
 '.ng-w{display:flex;gap:8px}.ng-w textarea{flex:1;min-width:0;border-radius:14px;padding:10px 12px;font:inherit;border:1px solid var(--line,rgba(0,0,0,.12));background:var(--bg);color:var(--fg);resize:none}'+
 '.ng-lab{display:grid;gap:6px;font-weight:600;font-size:14px;margin:0 0 12px}.ng-lab input,.ng-lab select,.ng-lab textarea{box-sizing:border-box;width:100%;min-width:0;min-height:46px;border-radius:12px;padding:10px 12px;font:inherit;font-weight:400;border:1px solid var(--line,rgba(0,0,0,.15));background:var(--bg);color:var(--fg)}'+
 '.ng-2{display:grid;grid-template-columns:1fr 1fr;gap:10px}.ng-big{width:100%;min-height:52px;display:flex;align-items:center;justify-content:center;gap:8px;margin:0 0 14px}'+
 '.ng-code{display:grid;gap:6px;text-align:center}.ng-code b{font-size:34px;letter-spacing:.12em;font-variant-numeric:tabular-nums}.ng-code small,.ng-code span{color:var(--muted)}'+
 '.ng-ci{box-sizing:border-box;width:100%;min-height:54px;font-size:24px;letter-spacing:.14em;text-align:center;text-transform:uppercase;border-radius:14px;border:1px solid var(--line,rgba(0,0,0,.15));background:var(--bg);color:var(--fg)}'+
 '.ng-err{min-height:18px;margin:6px 0;color:#B3261E;font-weight:600;font-size:13.5px}.ng-phb{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;margin:0 0 6px;cursor:pointer}'+
 '.ng-lien{background:none;border:0;color:var(--muted);text-decoration:underline;font:inherit;padding:8px 0;cursor:pointer}';
d.head.appendChild(css);

if(reel()){setTimeout(function(){charger().then(lienRecu)},1200);
 d.addEventListener('visibilitychange',function(){if(d.visibilityState==='visible'&&charge)charger()})}
})();
