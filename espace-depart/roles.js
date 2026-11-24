/* Un Espace pour chaque personne de l'entreprise (Cyril, 24/11 : « c'était pas déjà prévu un espace pour chaque type de salarié,
   en comptant les patrons ? »). Repris de la démo RT2O du 14/11, dans le vrai Espace. RÈGLES BLOQUÉES par Cyril (mémoire regles-equipe-roles) :
   - Direction / Bureau / Terrain / Client ; plusieurs patrons = accès à tout.
   - C'EST LE PATRON QUI DÉCIDE QUI VOIT QUOI (« Qui voit quoi », personne par personne) ; par défaut l'ouvrier ne voit pas les prix.
   - Pas de pointage (salariés au mois) : seulement « Où je suis », pour TOUTE l'entreprise (patrons et bureau compris).
   - Plan du chantier sous cadenas : lecture seule, le chef (ou qui a le droit) ouvre et referme.
   - Liste du chantier partagée : tout le monde ajoute matériel / outil / à faire / à savoir ; le matériel part « À commander » au bureau.
   - Prénoms touchables partout : où il est, appeler, SMS, message, son véhicule.
   Démo : « Voir l'Espace comme… » dans le menu ☰. Au vrai lancement : un lien + code par personne (comme les entreprises invitées). */
(function(){
'use strict';
var d=document,X=window.PCX,Q=window.PCEQ;if(!X||!Q)return;
function $(s,r){return (r||d).querySelector(s)}
function $$(s,r){return [].slice.call((r||d).querySelectorAll(s))}
var esc=X.esc||function(s){return String(s)},html=d.documentElement;
function lsg(k,v){try{var x=JSON.parse(localStorage.getItem(k)||'null');return x==null?v:x}catch(e){return v}}
function lss(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}

/* ---------- les personnes ---------- */
var PATRON=(window.PCID&&PCID.prenom)||'Julien',BUREAU='Claire';/* Claire = prénom d'exemple pour le bureau */
var PERS=[{n:PATRON,g:'dir',r:'Patron'},{n:BUREAU,g:'bur',r:'Bureau (exemple)'}].concat(Q.EQ.map(function(p){return {n:p.n,g:'ter',r:p.r}}));
var GN={dir:'Direction',bur:'Bureau',ter:'Terrain'};
function pers(n){return PERS.filter(function(p){return p.n===n})[0]||PERS[0]}
/* VRAI ACCÈS PERSONNEL (24/11) : le patron envoie un lien à chacun (fiche de la personne › « Envoyer son accès »).
   Le lien ouvre l'Espace de la personne sur son téléphone, sans mot de passe ; le service ne lui donne que ce que
   « Qui voit quoi » permet (proclik-cliky, calcul/membres.js). Plus de « Changer » ni de « Voir comme » pour elle. */
var SERVICE=String(window.PC_SERVICE||'').replace(/\/+$/,'');
function jeton(){return lsg('pc-vrai-jeton',null)}
var MB=lsg('pc-membre',null);if(MB&&!jeton()){MB=null;lss('pc-membre',null)}
var RN={ref:'Chef',ouv:'Équipe',bur:'Bureau',dir:'Patron'};
if(MB&&!PERS.some(function(p){return p.n===MB.n}))PERS.push({n:MB.n,g:MB.col==='dir'?'dir':MB.col==='bur'?'bur':'ter',r:RN[MB.col]||'Équipe'});
var R=lsg('pc-role',null);if(!R||!R.qui||!PERS.some(function(p){return p.n===R.qui}))R={qui:PATRON};
if(MB&&R.qui!==MB.n)R={qui:MB.n};
function moi(){return pers(R.qui)}
function garde(){lss('pc-role',R)}

/* ---------- qui voit quoi (le patron décide) : même tableau que la démo RT2O du 14/11 (Réglages › Qui voit quoi),
   cette fois chaque case se touche. Colonnes : Référent (chef d'équipe), Ouvrier, Bureau. Les patrons voient tout. ---------- */
var COLS=[['ref','Référent'],['ouv','Ouvrier'],['bur','Bureau']];
var DROITS=[['plan_lire','Lire le plan et les cotes'],['plan','Modifier le plan (ouvrir le cadenas)'],['materiel','Demander du matériel'],
 ['prix','Prix de vente et devis'],['marges','Prix d\'achat et marges'],['fact','Factures et paiements'],['quiou','Qui est où'],
 ['clients','Coordonnées des clients'],['equipe','Planning de toute l\'équipe'],['commande','Passer le matériel « Commandé »'],
 ['hs','Ajouter les heures en plus'],['achats','Achats, fournisseurs, dépenses'],['chiffres','Chiffre d\'affaires et graphiques'],['reglages','Réglages et options de l\'entreprise']];
var DEF={ref:{plan_lire:1,plan:1,materiel:1,quiou:1,clients:1,equipe:1,hs:1},ouv:{plan_lire:1,materiel:1,quiou:1},
 bur:{plan_lire:1,materiel:1,prix:1,fact:1,quiou:1,clients:1,equipe:1,commande:1,achats:1}};
var DR=lsg('pc-droits',{});
function col(p){if(MB&&p.n===MB.n&&MB.col!=='dir')return MB.col;return p.g==='bur'?'bur':p.r==='Chef'?'ref':'ouv'}
function droitC(c,k){var o=DR[c];if(o&&o[k]!=null)return !!o[k];return !!DEF[c][k]}
function droit(n,k){var p=pers(n);if(p.g==='dir')return true;return droitC(col(p),k)}
function peut(k){return droit(R.qui,k)}
function quiVoit(){
  function corps(){return '<p class="hint" style="margin:0 0 10px">C\'est vous qui décidez. Touchez une case pour donner ou retirer l\'accès : l\'Espace de la personne change tout de suite.</p>'+
    '<div class="rl-acc"><table><thead><tr><th></th><th class="dir">Direction</th>'+COLS.map(function(c){return '<th>'+c[1]+'<small>'+PERS.filter(function(p){return p.g!=='dir'&&col(p)===c[0]}).map(function(p){return p.n}).join(', ')+'</small></th>'}).join('')+'</tr></thead><tbody>'+
    DROITS.map(function(x){return '<tr><th>'+x[1]+'</th><td class="dir"><span>✓</span></td>'+COLS.map(function(c){var on=droitC(c[0],x[0]);return '<td><button type="button" data-dc="'+c[0]+'" data-dk="'+x[0]+'" aria-pressed="'+on+'" aria-label="'+x[1]+' pour '+c[1]+' : '+(on?'oui':'non')+'">'+(on?'✓':'—')+'</button></td>'}).join('')+'</tr>'}).join('')+'</tbody></table></div>'+
    '<p class="hint" style="margin:10px 2px 0">Toujours pour chacun : sa semaine, son chantier du jour (adresse comprise), « Où je suis » et ses absences. Le client a son propre accès au chantier partagé.</p>'+
    '<button type="button" class="btn" data-qvd style="width:100%;margin-top:10px">Remettre les réglages de départ</button>'+
    '<h4 class="rl-qa-t">Accès personnels</h4><p class="hint" style="margin:0 0 8px">Chacun reçoit un lien pour son téléphone. Touchez une personne pour l\'envoyer ou couper son accès.</p>'+
    '<div class="rl-qa">'+PERS.filter(function(p){return p.g!=='dir'}).map(function(p){return '<button type="button" data-qacc="'+esc(p.n)+'"><b>'+esc(p.n)+'</b><small data-qet="'+esc(p.n)+'">'+(jeton()?'…':'pas encore envoyé')+'</small></button>'}).join('')+'</div>'}
  X.xopen('Qui voit quoi','Réservé à la Direction',corps(),'',function lie(){
    $$('#x-in [data-dc]').forEach(function(b){b.onclick=function(){var c=b.dataset.dc,k=b.dataset.dk,v=!droitC(c,k);(DR[c]=DR[c]||{})[k]=v?1:0;lss('pc-droits',DR);applique();$('#x-in').innerHTML=corps();lie();
      X.toast(DROITS.filter(function(x){return x[0]===k})[0][1],(v?'Accès donné':'Accès retiré')+' : '+COLS.filter(function(x){return x[0]===c})[0][1])}});
    $$('#x-in [data-qacc]').forEach(function(b){b.onclick=function(){X.xclose();setTimeout(function(){accesPerso(b.dataset.qacc)},250)}});
    if(SERVICE&&jeton())api('/espace/equipe-acces').then(function(x){var M={};(x.membres||[]).forEach(function(m){M[m.n]=m.etat});$$('#x-in [data-qet]').forEach(function(s){var e=M[s.dataset.qet]||'aucun';s.textContent=e==='aucun'?'pas encore envoyé':e==='actif'?'accès ouvert':e})},function(){});
    var r=$('#x-in [data-qvd]');if(r)r.onclick=function(){DR={};lss('pc-droits',DR);applique();$('#x-in').innerHTML=corps();lie();X.toast('Réglages de départ remis','')}})}

/* ---------- choisir la personne (démo) ---------- */
function choisir(){if(MB)return;
  var h='<p class="hint" style="margin:0 0 12px">Chaque personne de l\'entreprise a son Espace. En démo, touchez une personne pour voir ce qu\'elle voit.</p>';
  ['dir','bur','ter'].forEach(function(g){h+='<div class="rl-g"><h4>'+GN[g]+'</h4><div class="rl-p">'+PERS.filter(function(p){return p.g===g}).map(function(p){return '<button type="button" data-rq="'+p.n+'" aria-pressed="'+(R.qui===p.n)+'">'+p.n+'<small>'+p.r+'</small></button>'}).join('')+'</div></div>'});
  h+='<p class="hint" style="margin:12px 2px 0">Au vrai lancement, chacun reçoit son lien et son code sur son téléphone, comme les entreprises invitées.</p>';
  X.xopen('Voir l\'Espace comme…','Démo',h,'',function(){$$('#x-in [data-rq]').forEach(function(b){b.onclick=function(){R={qui:b.dataset.rq};garde();X.xclose();applique();var p=moi();
    X.toast('Espace de '+p.n,p.g==='dir'?'Vous voyez tout.':'Il voit ce que la Direction a choisi (Qui voit quoi).')}})})}

/* ---------- liste du chantier partagée ---------- */
var LI=lsg('pc-liste',null);
if(!LI){LI={};var c0=Object.keys(X.CH||{}).filter(function(k){return X.CH[k].st!=='done'});
  if(c0[0])LI[c0[0]]=[{id:'l1',t:'Vis plaque 25 mm (1 boîte)',ty:'mat',qui:Q.EQ[1]?Q.EQ[1].n:'',st:'acom',ok:0},{id:'l2',t:'Rallonge 25 m',ty:'outil',qui:Q.EQ[0].n,ok:0},{id:'l3',t:'Badge du parking à rendre le soir',ty:'savoir',qui:PATRON,ok:0}];
  lss('pc-liste',LI)}
var TY={mat:'Matériel',outil:'Outil',faire:'À faire',savoir:'À savoir'};
var PCLISTE={get:function(ch){return (LI[ch]||[]).slice()},
 html:function(ch){var L=LI[ch]||[],cm=peut('commande');
  return '<div class="card rl-li" id="ch-liste"><div class="row" style="margin-bottom:6px"><b>Liste du chantier</b><span style="font-size:12px;color:var(--muted)">tout le monde la voit</span></div>'+
   (L.length?L.map(function(x){return '<div class="rl-lx'+(x.ok?' ok':'')+'"><button type="button" class="rl-ck" data-lok="'+x.id+'" aria-pressed="'+!!x.ok+'" aria-label="Fait">'+(x.ok?'✓':'')+'</button><span class="tx"><b>'+esc(x.t)+'</b><small>'+TY[x.ty]+(x.qui?' · '+esc(x.qui):'')+'</small></span>'+
     (x.ty==='mat'?(x.st==='com'?'<em class="rl-st c">Commandé</em>':cm?'<button type="button" class="rl-st a" data-lcom="'+x.id+'">À commander</button>':'<em class="rl-st a">À commander</em>'):'')+'</div>'}).join(''):'<p class="hint" style="margin:4px 0 8px">Rien pour l\'instant.</p>')+
   '<div class="rl-add"><div class="rl-ty">'+Object.keys(TY).map(function(k,i){return '<button type="button" data-lty="'+k+'" aria-pressed="'+(i===0)+'">'+TY[k]+'</button>'}).join('')+'</div>'+
   '<form class="rl-f"><input type="text" placeholder="Ex. : 3 rails de 3 m, la clé du local…" aria-label="Ajouter à la liste"><button type="submit" class="btn go">Ajouter</button></form></div></div>'},
 lier:function(root,ch,apres){if(!root)return;var ty='mat';
  $$('[data-lty]',root).forEach(function(b){b.onclick=function(){ty=b.dataset.lty;$$('[data-lty]',root).forEach(function(y){y.setAttribute('aria-pressed',String(y===b))})}});
  $$('[data-lok]',root).forEach(function(b){b.onclick=function(){var x=(LI[ch]||[]).filter(function(y){return y.id===b.dataset.lok})[0];if(x){x.ok=x.ok?0:1;lss('pc-liste',LI);apres()}}});
  $$('[data-lcom]',root).forEach(function(b){b.onclick=function(){var x=(LI[ch]||[]).filter(function(y){return y.id===b.dataset.lcom})[0];if(x){x.st='com';lss('pc-liste',LI);apres();X.toast('Matériel commandé','Toute l\'équipe le voit.')}}});
  var f=$('.rl-f',root);if(f)f.onsubmit=function(e){e.preventDefault();var v=$('input',f).value.trim();if(!v)return;(LI[ch]=LI[ch]||[]).push({id:'l'+Date.now(),t:v.charAt(0).toUpperCase()+v.slice(1),ty:ty,qui:R.qui,st:ty==='mat'?'acom':'',ok:0});lss('pc-liste',LI);apres();
    X.toast('Ajouté à la liste',ty==='mat'?'Le bureau le voit « À commander ».':'Toute l\'équipe le voit.')}}};
window.PCLISTE=PCLISTE;

/* ---------- cadenas du plan ---------- */
var CAD=lsg('pc-cad',{});
function cadOuvert(ch){var o=CAD[ch];return o&&o.d===Q.iso(Q.auj())?o:null}

/* ---------- fiche d'une personne (prénoms touchables) ---------- */
function vehDe(n){var E=lsg('pc-eq',[]),e=E.filter(function(x){return x.p===n})[0],REG=lsg('pc-jr-reg',{}),V=REG.vehs||[];
  var id=pers(n).g==='dir'?'moi':e&&e.id;return V.filter(function(v){return (v.ass||[]).indexOf(id)>-1})[0]||null}
function fiche(n){var p=pers(n),o=Q.ouSuis(n),T=Q.iso(Q.auj()),v=Q.pGet(T,n),c=(X.CH||{})[v],vh=vehDe(n);
  X.xopen(n,GN[p.g]+' · '+p.r,'<div class="rl-fi"><div class="rl-l"><span>Où il est</span><b>'+(o?Q.OU[o.v]+' <small>depuis '+o.h+'</small>':'Pas encore dit aujourd\'hui')+'</b></div>'+
    (p.g==='ter'?'<div class="rl-l"><span>Aujourd\'hui</span><b>'+esc(c?c.n+' · '+(c.v||''):Q.nomCase(v))+'</b></div>':'')+
    '<div class="rl-l"><span>Véhicule</span><b>'+(vh?esc(vh.nom||'Véhicule'):'Aucun attitré')+'</b></div></div>'+
    '<div class="rl-fb"><button type="button" class="btn go" data-fa="Appel">Appeler</button><button type="button" class="btn" data-fa="SMS">SMS</button><button type="button" class="btn" data-fa="Message">Message</button></div>'+
    (!MB&&moi().g==='dir'&&p.g!=='dir'?'<button type="button" class="rl-acc-b" data-facc><span class="av">'+ic('cle')+'</span><span class="tx"><b>Envoyer son accès</b><small>Un lien pour son téléphone, sans mot de passe</small></span><span class="go">›</span></button>':''),'',function(){
    var fa=$('#x-in [data-facc]');if(fa)fa.onclick=function(){X.xclose();setTimeout(function(){accesPerso(n)},250)};
    $$('#x-in [data-fa]').forEach(function(b){b.onclick=function(){X.toast(b.dataset.fa+' à '+n,'(démo : numéro d\'exemple)')}})})}
/* ---------- accès personnel : créer / envoyer / couper (patron) ---------- */
function ENT(){var a=lsg('pc-vrai-artisan',null)||{};return a.entreprise||''}
function api(chemin,corps){return fetch(SERVICE+chemin,{method:corps?'POST':'GET',headers:corps?{'Content-Type':'application/json',Authorization:'Bearer '+jeton()}:{Authorization:'Bearer '+jeton()},body:corps?JSON.stringify(corps):undefined,cache:'no-store'})
  .then(function(r){return r.json().catch(function(){return {ok:false}}).then(function(x){x._s=r.status;return x})})}
function accesPerso(n){var p=pers(n),c=p.g==='dir'?'dir':col(p),qui=esc(n);
  var expl='<p class="hint" style="margin:0 0 10px">'+qui+' reçoit un lien sur son téléphone. Il l\'ouvre une fois et son Espace reste ouvert : pas de mot de passe à retenir. Il ne voit que ce que vous lui permettez dans « Qui voit quoi ».</p>';
  if(!SERVICE||!jeton()){X.xopen('Accès de '+n,'Démo',expl+'<div class="rl-lien"><span>Exemple de lien</span><b>proclik.github.io/espace-depart/?acces=…</b></div><p class="hint" style="margin:10px 2px 0">En démo, rien n\'est envoyé. Quand votre Espace est connecté, ce bouton crée le vrai lien.</p>','<button class="btn" data-xclose>Fermer</button>');return}
  X.xopen('Accès de '+n,GN[p.g]+' · '+p.r,expl+'<div class="rl-lien" id="rl-lien"><span>Préparation du lien…</span></div>','<button class="btn" data-xclose>Fermer</button>',function(){
    api('/espace/equipe-acces',{op:'lien',n:n,col:c}).then(function(x){var b=$('#rl-lien');if(!b)return;
      if(!x.ok){b.innerHTML='<span>'+esc(x.erreur||'Le service ne répond pas. Réessayez dans un instant.')+'</span>';return}
      var txt='Bonjour '+n+', voici votre accès à l\'Espace '+(ENT()||'de l\'entreprise')+' : '+x.lien;
      b.innerHTML='<span>Lien personnel de '+qui+' · valable 7 jours, une seule fois</span><b>'+esc(x.lien)+'</b>'+
        '<div class="rl-fb"><a class="btn go" href="sms:?&body='+encodeURIComponent(txt)+'">Envoyer par SMS</a><button type="button" class="btn" data-lcp>Copier</button></div>'+
        '<button type="button" class="btn" data-lcut style="width:100%;margin-top:8px">Couper son accès</button>';
      $('[data-lcp]',b).onclick=function(){try{navigator.clipboard.writeText(txt).then(function(){X.toast('Lien copié','Collez-le dans un SMS ou un e-mail.')})}catch(e){X.toast('Copie impossible','Appuyez longuement sur le lien.')}};
      $('[data-lcut]',b).onclick=function(){couper(n)}})})}
function couper(n){api('/espace/equipe-acces',{op:'couper',n:n}).then(function(x){X.xclose();X.toast(x.ok?'Accès coupé':'Pas d\'accès à couper',x.ok?n+' est déconnecté de tous ses appareils.':esc(x.erreur||''))})}
/* le lien ouvert sur le téléphone du salarié */
var ACC=/[?&]acces=([a-z0-9-]{1,30}\.[A-Za-z0-9_-]{10,})/.exec(location.search);
function propre(){try{history.replaceState(null,'',location.pathname+location.hash)}catch(e){}}
if(ACC&&SERVICE){fetch(SERVICE+'/espace/acces',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code:ACC[1]})}).then(function(r){return r.json()}).then(function(x){
    if(x&&x.ok){lss('pc-membre',x.membre);lss('pc-vrai-artisan',x.artisan);lss('pc-role',{qui:x.membre.n});lss('pc-vrai-jeton',x.jeton)}else lss('pc-membre-fin',(x&&x.erreur)||'Ce lien n\'est plus valable.');
    propre();setTimeout(function(){location.reload()},400)},function(){lss('pc-membre-fin','Pas de réseau pour l\'instant : rouvrez le lien dans un moment.');propre();location.reload()})}
/* lien refusé, accès coupé ou expiré : on le dit simplement */
var FIN=lsg('pc-membre-fin',null);if(FIN){lss('pc-membre-fin',null);setTimeout(function(){X.xopen('Votre accès','',
  '<p style="margin:0">'+esc(FIN)+'</p><p class="hint" style="margin:10px 0 0">Demandez un nouveau lien à votre patron : il l\'envoie en deux touchers.</p>','<button class="btn go" data-xclose>D\'accord</button>')},600)}
/* au démarrage : droits à jour, ou accès coupé */
if(MB&&SERVICE)api('/espace/moi').then(function(x){
  if(x._s===401){['pc-membre','pc-vrai-jeton','pc-vrai-liste','pc-role'].forEach(function(k){lss(k,null)});lss('pc-membre-fin','Votre accès a été coupé ou n\'est plus valable.');location.reload();return}
  if(x.ok&&x.membre){MB.col=x.membre.col;MB.droits=x.membre.droits;lss('pc-membre',MB);applique()}},function(){});
window.PCACCES={envoyer:accesPerso,couper:couper};
window.PCPERS={fiche:fiche,droit:droit,peut:peut,moi:function(){return moi()}};
/* un prénom touché n'importe où (data-pers) ouvre sa fiche */
d.addEventListener('click',function(e){var b=e.target.closest('[data-pers]');if(!b)return;e.preventDefault();e.stopPropagation();fiche(b.dataset.pers)},true);

/* ---------- « Où êtes-vous ? » (pour tout le monde) ---------- */
function ouHTML(n,court){var o=Q.ouSuis(n);
  return '<div class="rl-ou'+(court?' court':'')+'"><b class="rl-ot">'+ic('pin')+'Où êtes-vous ?</b><div class="tr-chips">'+Object.keys(Q.OU).map(function(k){return '<button type="button" data-ou="'+k+'" aria-pressed="'+(!!o&&o.v===k)+'">'+Q.OU[k]+'</button>'}).join('')+'</div>'+
    (court?(o?'<p class="tr-h">Toute l\'équipe voit « '+Q.OU[o.v]+' » depuis '+o.h+'.</p>':''):'<p class="tr-h">'+(o?'Toute l\'équipe voit « '+Q.OU[o.v]+' » depuis '+o.h+'.':'Un toucher suffit : chacun sait qui est où. Ce n\'est pas un pointage.')+'</p>')+'</div>'}
var ouA=d.createElement('div');ouA.id='rl-oua';
/* l'Accueil est dessiné dans #f2acc (accueil-forme.js) : on pose la carte juste sous la case « Que voulez-vous faire ? » */
function placer(){var f=$('#f2acc')||$('#v-accueil');if(!f)return;
  /* « Bonjour Julien » devient le prénom de la personne qui regarde */
  $$('h1,h2',f).forEach(function(h){var m=/^Bonjour (.+)$/.exec(h.textContent.trim());if(m&&m[1]!==moi().n&&(m[1]===PATRON||PERS.some(function(p){return p.n===m[1]})))h.textContent='Bonjour '+moi().n});
  /* juste avant « Le point de la journée », dans le même bloc que la case « Que voulez-vous faire ? » */
  var t=[].slice.call(f.querySelectorAll('*')).filter(function(x){return !ouA.contains(x)&&x.children.length<4&&/Le point de la journée/.test(x.textContent)}).pop();
  while(t&&t.parentNode&&t.parentNode!==f&&!/Que voulez-vous faire/.test(t.parentNode.textContent))t=t.parentNode;
  if(t&&t.parentNode){if(ouA.nextElementSibling!==t)t.parentNode.insertBefore(ouA,t)}else if(ouA.parentNode!==f)f.appendChild(ouA)}
placer();(function(){var f=$('#f2acc');if(f&&window.MutationObserver)new MutationObserver(function(){if(!ouA.isConnected||!ouA.nextElementSibling||!/Le point/.test(ouA.nextElementSibling.textContent))placer()}).observe(f,{childList:true,subtree:true})})();
ouA.addEventListener('click',function(e){var b=e.target.closest('[data-ou]');if(b)Q.setOu(R.qui,b.dataset.ou)});
function rendOuA(){if(moi().g==='ter'){ouA.innerHTML='';return}ouA.innerHTML='<div class="card rl-ouc">'+ouHTML(R.qui,true)+'</div>';var c=ouA.querySelector('[aria-pressed="true"]');if(c)setTimeout(function(){c.parentNode.scrollLeft=Math.max(0,c.offsetLeft-20)},0)}

/* ---------- icônes ---------- */
var IC={
 pin:'<path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10z"/><circle cx="12" cy="11" r="2.2"/>',
 tel:'<path d="M6.5 4h3l1.5 4-2 1.2a10 10 0 0 0 5.8 5.8L16 13l4 1.5v3a2 2 0 0 1-2 2A15.5 15.5 0 0 1 4.5 6a2 2 0 0 1 2-2z"/>',
 cad:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
 cado:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.5-2"/>',
 cal:'<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
 ph:'<rect x="3.5" y="6" width="17" height="13" rx="2"/><circle cx="12" cy="12.5" r="3.2"/><path d="M9 6l1.5-2h3L15 6"/>',
 gens:'<circle cx="9" cy="8" r="3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><path d="M16 5.5a3 3 0 0 1 0 5.5M17.5 19a5 5 0 0 0-2-4"/>',
 cle:'<circle cx="8" cy="12" r="3.5"/><path d="M11.5 12H21M18 12v3M15 12v2"/>',
 plus:'<path d="M12 5v14M5 12h14"/>'};
function ic(n){return '<svg class="tri" viewBox="0 0 24 24" aria-hidden="true">'+IC[n]+'</svg>'}
function cap(t){return String(t).replace(/^./,function(x){return x.toUpperCase()})}

/* ---------- bandeau « vous voyez l'Espace comme… » ---------- */
var band=d.createElement('div');band.id='rl-band';band.hidden=true;
var app=$('.app');if(app)app.insertBefore(band,app.firstChild);
band.addEventListener('click',function(e){if(e.target.closest('[data-rlx]'))return choisir();if(e.target.closest('[data-rlback]')){R.full=false;garde();applique()}});

/* ---------- l'Espace Terrain ---------- */
var tr=d.createElement('div');tr.id='terrain';tr.hidden=true;d.body.appendChild(tr);
function infosCh(c){var o=(X.D||{})[c.dos]||{};return {adr:/\[/.test(o.adr||'')?(o.v||c.v):(o.adr||c.v),contact:o.contact||c.n,tel:o.tel||''}}
function heures(id,k){var c=(X.CH||{})[id],e=(X.EV||[]).filter(function(e){var x=e.x||{};return e.k==='run'&&e.d===k&&(x.ch===id||(id==='alpes'&&x.ch===1)||(c&&String(e.t||'').indexOf(c.n)>-1))})[0];
  return e?e.s.replace(':','h')+' – '+e.e.replace(':','h'):'8h00 – 17h00'}
function nomT(n){return '<button type="button" class="rl-nm" data-pers="'+esc(n)+'">'+esc(n)+'</button>'}
function plusDroits(){return ['prix','fact','chiffres','achats','reglages'].filter(peut)}
function rendTer(){var P=moi(),n=P.n,T=Q.iso(Q.auj()),v=Q.pGet(T,n),c=(X.CH||{})[v],h='';
  h+=MB?'<div class="tr-band"><span>Espace de <b>'+esc(n)+'</b>'+(ENT()?' · '+esc(ENT()):'')+'</span></div>':'<div class="tr-band"><span>Démo · Espace de <b>'+n+'</b> ('+P.r+')</span><button type="button" data-rlx>Changer</button></div>';
  h+='<div class="tr-in"><div class="tr-top"><small>'+cap(Q.jourLong(T))+'</small><h1>Bonjour '+n+'</h1></div>';
  h+='<section class="tr-c">'+ouHTML(n)+'</section>';
  h+='<h3 class="tr-t">Aujourd\'hui</h3>';
  if(c){var t=Q.pTaches(T,n),avec=Q.pQui(v,T).filter(function(p){return p.n!==n}).map(function(p){return p.n}),I=infosCh(c),chef=n===Q.EQ[0].n?null:Q.EQ[0].n,notes=(c.notes||[]).slice(-2),ph=(c.ph||[]),cad=cadOuvert(v);
    h+='<section class="tr-c tr-auj" style="--cc:'+Q.couleur(v)+'"><div class="tr-ch"><i></i><span><b>'+esc(c.n)+'</b><small>'+esc(I.adr)+' · '+heures(v,T)+'</small></span></div>'+
      '<div class="tr-l"><span>À faire</span><b>'+(t.length?esc(t.join(', ')):'Voir avec le chef')+'</b></div>'+
      '<div class="tr-l"><span>Avec</span><b>'+(avec.length?avec.map(nomT).join(', '):'Seul')+'</b></div>'+
      '<div class="tr-l"><span>Sur place</span><b>'+esc(I.contact)+(I.tel&&peut('clients')?'<small>'+esc(I.tel)+'</small>':'')+'</b></div>'+
      '<div class="tr-b"><button type="button" class="btn go" data-tri="'+esc(I.adr)+'">Itinéraire</button>'+(chef?'<button type="button" class="btn" data-pers="'+chef+'">'+ic('tel')+chef+'</button>':'<button type="button" class="btn" data-pers="'+PATRON+'">'+ic('tel')+PATRON+'</button>')+'</div></section>';
    if(notes.length)h+='<section class="tr-c"><h2>À savoir</h2>'+notes.map(function(x){return '<p class="tr-n">'+esc(String(x[1]).replace(/^🎙\s*/,''))+'<small>'+esc(x[0])+'</small></p>'}).join('')+'</section>';
    if(peut('materiel'))h+='<section class="tr-c tr-li">'+PCLISTE.html(v)+'</section>';
    if(peut('plan_lire'))h+='<section class="tr-c"><h2>'+ic(cad?'cado':'cad')+'Plan du chantier <em class="'+(cad?'ouv':'')+'">'+(cad?'Ouvert par '+esc(cad.by):'Lecture seule')+'</em></h2><button type="button" class="tr-plan pcplan" data-trp aria-label="Voir le plan en grand">'+(window.PC_PLAN_MINI||'')+'</button>'+
      (peut('plan')?'<button type="button" class="btn'+(cad?'':' go')+'" data-cad="'+v+'" style="width:100%;margin-top:10px">'+ic(cad?'cad':'cado')+(cad?'Refermer le cadenas':'Ouvrir le cadenas pour modifier')+'</button>':'')+
      '<p class="tr-h">'+(cad?'Le plan peut être modifié aujourd\'hui. Pensez à refermer.':'Vous pouvez regarder et zoomer. '+(peut('plan')?'Vous seul pouvez ouvrir le cadenas.':'Seul le chef peut ouvrir le cadenas.'))+'</p></section>';
    if(ph.length)h+='<section class="tr-c"><h2>'+ic('ph')+'Photos du chantier</h2><div class="tr-ph">'+ph.map(function(x){return '<span class="tr-pi"><i>'+ic('ph')+'</i><b>'+esc(x[0])+'</b></span>'}).join('')+'</div><button type="button" class="btn" data-trph style="width:100%;margin-top:10px">'+ic('ph')+'Ajouter une photo</button></section>';
  }else{h+='<section class="tr-c tr-rien"><b>'+(v?Q.nomCase(v):'Rien de prévu pour l\'instant')+'</b><small>'+(v&&Q.ABS[v]?'Bon repos !':v==='bureau'?'Au bureau toute la journée.':'Votre patron vous préviendra.')+'</small></section>'}
  /* le planning de toute l'équipe, si la Direction l'a permis */
  if(peut('equipe')||peut('quiou')){h+='<h3 class="tr-t">'+(peut('equipe')?'L\'équipe aujourd\'hui':'Qui est où')+'</h3><section class="tr-c tr-js">'+PERS.filter(function(p){return p.n!==n}).map(function(p){var w=Q.pGet(T,p.n),cc=(X.CH||{})[w],o=Q.ouSuis(p.n);
      var lieu=peut('equipe')?(cc?cc.n:p.g==='ter'?Q.nomCase(w):GN[p.g]):(o?Q.OU[o.v]:'Pas encore dit');
      return '<div class="tr-j" style="'+(cc&&peut('equipe')?'--cc:'+Q.couleur(w):'')+'"><span class="tr-d">'+nomT(p.n)+'</span><span class="tr-w"><b>'+esc(lieu)+'</b>'+(o&&peut('equipe')?'<small>'+Q.OU[o.v]+' · '+o.h+'</small>':'')+'</span></div>'}).join('')+'</section>'}
  /* prochains jours */
  var J=[],x=Q.plus(Q.auj(),1);while(J.length<5){if(x.getDay()%6)J.push(Q.iso(x));x=Q.plus(x,1)}
  h+='<h3 class="tr-t">Mes prochains jours</h3><section class="tr-c tr-js">'+J.map(function(k){var w=Q.pGet(k,n),cc=(X.CH||{})[w],tt=Q.pTaches(k,n);
    return '<div class="tr-j'+(cc?'':' gris')+'" style="'+(cc?'--cc:'+Q.couleur(w):'')+'"><span class="tr-d">'+cap(Q.relatif(k))+'</span><span class="tr-w"><b>'+esc(cc?cc.n:Q.nomCase(w))+'</b>'+(cc?'<small>'+esc(cc.v||'')+(tt.length?' · '+esc(tt.join(', ').toLowerCase()):'')+'</small>':'')+'</span></div>'}).join('')+'</section>';
  /* heures en plus, si la Direction l'a permis (personne autorisée) */
  if(peut('hs'))h+='<section class="tr-c"><button type="button" class="btn" data-trhs style="width:100%">'+ic('gens')+'Ajouter des heures en plus à l\'équipe</button></section>';
  /* absences */
  var A=Q.absences().filter(function(a){return a.qui===n}).reverse();
  h+='<h3 class="tr-t">Absences et congés</h3><section class="tr-c"><button type="button" class="btn go" data-tra style="width:100%">'+ic('cal')+'Demander une absence</button>'+
    (A.length?A.map(function(a){return '<div class="tr-a"><span><b>'+Q.ABS[a.ty]+'</b><small>'+(a.du===a.au?Q.jourLong(a.du):'du '+Q.jourLong(a.du)+' au '+Q.jourLong(a.au))+'</small></span><em class="st-'+a.st+'">'+(a.st==='ok'?'Accepté ✓':a.st==='non'?'Refusé':'En attente')+'</em></div>'}).join(''):'<p class="tr-h">Malade, congé, rendez-vous : votre patron reçoit la demande et vous répond ici.</p>')+'</section>';
  var PD=plusDroits();
  if(PD.length)h+='<section class="tr-c"><button type="button" class="btn" data-trfull style="width:100%">'+ic('cle')+'Ouvrir le reste de l\'Espace</button><p class="tr-h">La Direction vous a donné accès à : '+PD.map(function(k){return DROITS.filter(function(x){return x[0]===k})[0][1].toLowerCase()}).join(', ')+'.</p></section>';
  h+='<p class="tr-pied">Ce que '+n+' voit, c\'est la Direction qui le décide (menu ☰ › Qui voit quoi).</p></div>';
  tr.innerHTML=h;PCLISTE.lier($('#ch-liste',tr),v,rendTer)}
function demande(){var T=Q.iso(Q.auj()),ty='malade';
  X.xopen('Demander une absence',moi().n,'<div class="tr-f"><p class="tr-q">C\'est pour…</p><div class="tr-chips" id="tr-ty">'+Object.keys(Q.ABS).map(function(k){return '<button type="button" data-ty="'+k+'" aria-pressed="'+(k===ty)+'">'+Q.ABS[k]+'</button>'}).join('')+'</div>'+
    '<div class="tr-dd"><label>Du<input type="date" id="tr-du" value="'+T+'"></label><label>Au<input type="date" id="tr-au" value="'+T+'"></label></div>'+
    '<label class="tr-mo">Un mot pour le patron <small>(facultatif)</small><input type="text" id="tr-mo" placeholder="Ex. : rendez-vous médical à 10 h"></label></div>',
    '<button class="btn go" id="tr-env" style="width:100%">Envoyer la demande</button>',function(){
      $$('#tr-ty [data-ty]').forEach(function(b){b.onclick=function(){ty=b.dataset.ty;$$('#tr-ty [data-ty]').forEach(function(y){y.setAttribute('aria-pressed',String(y===b))})}});
      $('#tr-env').onclick=function(){var du=$('#tr-du').value,au=$('#tr-au').value;if(!du)return;if(!au||au<du)au=du;
        Q.demanderAbs({qui:moi().n,ty:ty,du:du,au:au,mo:$('#tr-mo').value.trim()});X.xclose();X.toast('Demande envoyée','Votre patron la voit dans son planning. Réponse ici.')}})}
tr.addEventListener('click',function(e){var b=e.target.closest('button');if(!b||b.closest('#ch-liste'))return;
  if(b.dataset.rlx!=null)return choisir();
  if(b.dataset.ou){Q.setOu(moi().n,b.dataset.ou);return}
  if(b.dataset.tri!=null)return X.toast('Itinéraire','Ouvre Waze ou Plans vers '+(b.dataset.tri||'le chantier')+' (démo).');
  if(b.dataset.trp!=null)return X.xopen('Plan du chantier',cadOuvert(Q.pGet(Q.iso(Q.auj()),moi().n))?'Cadenas ouvert':'Lecture seule','<div class="tr-plan grand pcplan">'+(window.PC_PLAN_MINI||'')+'</div>','');
  if(b.dataset.cad){var ch=b.dataset.cad;if(cadOuvert(ch))delete CAD[ch];else CAD[ch]={by:moi().n,d:Q.iso(Q.auj())};lss('pc-cad',CAD);rendTer();X.toast(cadOuvert(ch)?'Cadenas ouvert':'Cadenas refermé',cadOuvert(ch)?'Le plan peut être modifié. Les autres le voient.':'Le plan est de nouveau en lecture seule.');return}
  if(b.dataset.trph!=null)return X.toast('Photo','La photo part dans le chantier, le patron la voit (démo).');
  if(b.dataset.trhs!=null){if(window.PCJR&&PCJR.heuresSup)PCJR.heuresSup(Q.iso(Q.auj()));return}
  if(b.dataset.trfull!=null){R.full=true;garde();applique();return}
  if(b.dataset.tra!=null)return demande()});
Q.ecoute(function(){if(!tr.hidden)rendTer();rendOuA()});

/* ---------- appliquer : qui je suis, ce que je vois ---------- */
var VUE_DROIT={devis:'prix',produits:'prix',factures:'fact',depenses:'achats',prix:'achats',clients:'clients',reseaux:'reglages'};
function interdit(v){var k=VUE_DROIT[v];return k&&!peut(k)}
function applique(){var p=moi(),ter=p.g==='ter'&&!R.full;
  html.classList.toggle('role-ter',ter);html.classList.toggle('role-lim',p.g!=='dir');
  DROITS.forEach(function(x){html.classList.toggle('no-'+x[0],!peut(x[0]))});
  tr.hidden=!ter;if(ter){rendTer();tr.scrollTop=0}
  band.hidden=p.g==='dir'||ter;
  band.innerHTML=p.g==='dir'||ter?'':MB?'<span>Espace de <b>'+esc(p.n)+'</b> ('+GN[p.g]+')'+(ENT()?' · '+esc(ENT()):'')+'</span>'+(p.g==='ter'?'<button type="button" data-rlback>Mon Espace</button>':''):'<span>Démo · Espace de <b>'+p.n+'</b> ('+GN[p.g]+') : ce que la Direction lui permet</span>'+(p.g==='ter'?'<button type="button" data-rlback>Mon Espace</button>':'')+'<button type="button" data-rlx>Changer</button>';
  rendOuA();
  /* écran interdit ouvert ? retour à l'Accueil */
  var vis=$$('.view').filter(function(s){return !s.hidden})[0];if(vis&&interdit(vis.id.slice(2))&&X.go)X.go('accueil')}
/* garde : on ne peut pas ouvrir un écran que la Direction n'a pas permis */
d.addEventListener('click',function(e){var b=e.target.closest('[data-v],[data-pb]');if(!b)return;var v=b.dataset.v||b.dataset.pb;
  if(interdit(v)){e.preventDefault();e.stopPropagation();X.toast('Réservé','La Direction ne vous a pas donné accès à cet écran.')}},true);

/* ---------- menu ☰ ---------- */
var GARDER=['rl-m','rl-qv','m-simple','rg-aides','rg-barre','m-net','m-welcome','m-inst','rg-help','rg-pb'];
function filtreMenu(){var c=$('#x-in .card.menu');if(!c)return;
  if(!MB&&!$('#rl-m')){var b=d.createElement('button');b.id='rl-m';b.type='button';b.innerHTML='<span class="av">'+ic('gens')+'</span><span class="tx"><b>Voir l\'Espace comme…</b><small>Démo : un patron, le bureau ou un salarié · maintenant : '+moi().n+'</small></span><span class="go">›</span>';
    c.insertBefore(b,c.firstChild);b.onclick=function(){X.xclose();setTimeout(choisir,250)}}
  if(!MB&&moi().g==='dir'&&!$('#rl-qv')){var q=d.createElement('button');q.id='rl-qv';q.type='button';q.innerHTML='<span class="av">'+ic('cle')+'</span><span class="tx"><b>Qui voit quoi</b><small>Vous décidez ce que voient le bureau et chaque salarié</small></span><span class="go">›</span>';
    c.insertBefore(q,($('#rl-m')||c.firstChild).nextSibling);q.onclick=function(){X.xclose();setTimeout(quiVoit,250)}}
  if(!peut('reglages')){$$('#x-in .card.menu > *').forEach(function(x){if(GARDER.indexOf(x.id)<0)x.hidden=true});$$('#x-in .xsec, #x-in .rg-beta ~ .card:not(.menu)').forEach(function(s){s.hidden=true});
    if(!$('#rl-note')){var n=d.createElement('p');n.id='rl-note';n.className='hint';n.style.margin='10px 2px 0';n.textContent='Les réglages et les options de l\'entreprise sont réservés à la Direction.';c.after(n)}}}
var menu=$('#menu');
if(menu)menu.addEventListener('click',function(){[0,120,400].forEach(function(t){setTimeout(filtreMenu,t)})});

var st=d.createElement('style');
st.textContent=
 'html.role-ter{overflow:hidden}html.role-ter body>*:not(#terrain):not(#xscrim):not(#xsheet):not(#toast):not(#vscrim):not(#vsheet):not(script):not(style):not(link):not(svg){display:none!important}'+
 'html.no-prix [data-v="devis"],html.no-prix [data-pb="devis"],html.no-prix [data-v="produits"],html.no-prix [data-pb="produits"],html.no-fact [data-v="factures"],html.no-fact [data-pb="factures"],'+
 'html.no-achats [data-v="depenses"],html.no-achats [data-pb="depenses"],html.no-achats [data-v="prix"],html.no-achats [data-pb="prix"],html.no-clients [data-v="clients"],html.no-clients [data-pb="clients"],html.no-reglages [data-pb="reglages"],html.no-reglages [data-v="reseaux"]{display:none!important}'+
 '#terrain{position:fixed;inset:0;z-index:33;overflow-y:auto;-webkit-overflow-scrolling:touch;background:var(--bg);color:var(--fg)}'+
 'svg.tri{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round;flex:none}'+
 '.rl-acc-b{display:flex;align-items:center;gap:12px;width:100%;margin-top:12px;padding:12px 14px;border-radius:16px;background:var(--bg);box-shadow:var(--n1-pk);text-align:left;color:var(--fg);min-height:56px}.rl-acc-b .tx{flex:1;min-width:0}.rl-acc-b b{display:block;font-size:15px}.rl-acc-b small{display:block;font-size:12.5px;color:var(--muted)}.rl-acc-b .av svg{width:20px;height:20px}'+
 '.rl-lien{display:grid;gap:6px;padding:12px 14px;border-radius:14px;background:var(--teinte,rgba(0,0,0,.05))}.rl-lien span{font-size:12.5px;color:var(--muted);font-weight:600}.rl-lien b{font-size:13.5px;word-break:break-all}.rl-lien .rl-fb a{text-decoration:none;display:flex;align-items:center;justify-content:center}'+
 '.rl-qa-t{margin:18px 2px 4px;font-size:15px}.rl-qa{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px}.rl-qa button{display:grid;gap:2px;padding:10px 12px;border-radius:14px;background:var(--bg);box-shadow:var(--n1-pk);text-align:left;color:var(--fg);min-height:52px}.rl-qa small{font-size:12px;color:var(--muted)}'+
 '#rl-band,#terrain .tr-band{display:flex;align-items:center;gap:8px;padding:8px 14px;background:var(--n1-nuit,#1B2440);color:#fff;font-size:13px}#rl-band span,#terrain .tr-band span{flex:1;min-width:0}'+
 '#rl-band{position:sticky;top:0;z-index:20;border-radius:0 0 14px 14px;margin:0 0 6px}#rl-band[hidden]{display:none}'+
 '#rl-band button,#terrain .tr-band button{flex:none;min-height:32px;padding:0 12px;border-radius:99px;border:1.5px solid rgba(255,255,255,.5);background:none;color:#fff;font:700 13px var(--f,inherit);box-shadow:none}'+
 '#terrain .tr-band{position:sticky;top:0;z-index:2;padding-top:calc(8px + env(safe-area-inset-top,0px))}'+
 '#terrain .tr-in{max-width:540px;margin:0 auto;padding:16px 16px calc(40px + env(safe-area-inset-bottom,0px))}'+
 '#terrain .tr-top small{display:block;color:var(--muted);font-size:13.5px}#terrain .tr-top h1{margin:2px 0 14px;font-size:28px}'+
 '#terrain .tr-c{padding:14px 16px;border-radius:20px;background:var(--z-tile,var(--card));box-shadow:var(--z-ombre-s,0 1px 3px rgba(0,0,0,.08));margin:0 0 12px}'+
 '#terrain .tr-c h2{display:flex;align-items:center;gap:8px;margin:0 0 10px;font-size:16px}#terrain .tr-c h2 em{margin-left:auto;font-style:normal;font-size:11.5px;font-weight:700;color:var(--muted);padding:3px 9px;border-radius:99px;background:var(--teinte,rgba(0,0,0,.06));white-space:nowrap}#terrain .tr-c h2 em.ouv{color:var(--n1-laiton,#A8823F)}'+
 '#terrain .tr-t{margin:18px 2px 8px;font-size:15px;color:var(--muted)}'+
 '.rl-ot{display:flex;align-items:center;gap:8px;font-size:16px;margin:0 0 10px}'+
 '.tr-chips{display:flex;flex-wrap:wrap;gap:8px}.tr-chips button{min-height:42px;padding:0 15px;border-radius:99px;background:var(--bg);box-shadow:var(--n1-pk);color:var(--fg);font:700 14px var(--f,inherit)}'+
 '.tr-chips button[aria-pressed="true"]{background:var(--n1-nuit,#1B2440);color:#fff;box-shadow:none}'+
 '.tr-h{margin:10px 2px 0;font-size:13px;color:var(--muted)}'+
 'html body .rl-ou .tr-chips button{background:var(--bg)!important;box-shadow:var(--n1-pk)!important;color:var(--fg)!important;border:0!important;border-radius:99px!important}html body .rl-ou .tr-chips button[aria-pressed="true"]{background:var(--n1-nuit,#1B2440)!important;color:#fff!important;box-shadow:none!important}'+'.rl-ouc{margin:0 0 14px;padding:12px 14px}.rl-ou.court .rl-ot{font-size:14.5px;margin:0 0 8px}.rl-ou.court .tr-chips{flex-wrap:nowrap;overflow-x:auto;margin:0 -14px;padding:2px 14px 4px;scrollbar-width:none}.rl-ou.court .tr-chips button{flex:none;min-height:38px;padding:0 13px;font-size:13.5px}.rl-ou.court .tr-h{margin-top:6px}'+
 '#terrain .tr-auj{box-shadow:inset 5px 0 0 var(--cc),var(--z-ombre-s,0 1px 3px rgba(0,0,0,.08));padding-left:20px}'+
 '#terrain .tr-ch{display:flex;gap:10px;margin-bottom:6px}#terrain .tr-ch i{flex:none;width:12px;height:12px;border-radius:50%;background:var(--cc);margin-top:8px}#terrain .tr-ch span{display:flex;flex-direction:column}#terrain .tr-ch b{font-size:21px}#terrain .tr-ch small{font-size:14px;color:var(--muted)}'+
 '#terrain .tr-l{display:flex;gap:10px;padding:8px 0 0 22px;font-size:15px}#terrain .tr-l>span{flex:none;width:72px;color:var(--muted);font-size:13.5px;padding-top:1px}#terrain .tr-l b small{display:block;font-weight:600;color:var(--muted);font-size:13px}'+
 '.rl-nm{display:inline;padding:0;border:0;background:none;box-shadow:none;color:inherit;font:inherit;text-decoration:underline;text-decoration-color:var(--n1-laiton,#A8823F);text-decoration-thickness:2px;text-underline-offset:3px;cursor:pointer;min-height:0}'+
 '#terrain .tr-b{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0 0 22px}#terrain .tr-b .btn{flex:1 1 140px;justify-content:center;gap:6px}'+
 '#terrain .tr-n{margin:0 0 8px;font-size:15px}#terrain .tr-n small{display:block;color:var(--muted);font-size:12px;margin-top:2px}'+
 '#terrain .tr-plan{display:block;width:100%;padding:10px;border:0;border-radius:14px;background:var(--bg);box-shadow:inset 0 0 0 1px var(--line)}#terrain .tr-plan svg{margin:0}'+
 '#terrain .tr-ph{display:flex;gap:8px;overflow-x:auto;padding-bottom:2px}#terrain .tr-pi{flex:none;width:118px;padding:10px;border-radius:14px;background:var(--teinte,rgba(0,0,0,.05));display:flex;flex-direction:column;gap:6px;font-size:12.5px}#terrain .tr-pi i{color:var(--muted)}'+
 '#terrain .tr-rien b{display:block;font-size:17px}#terrain .tr-rien small{color:var(--muted);font-size:13.5px}'+
 '#terrain .tr-js{padding:6px 16px}#terrain .tr-j{display:flex;align-items:center;gap:12px;padding:10px 0;border-top:1px solid var(--line)}#terrain .tr-j:first-child{border-top:0}'+
 '#terrain .tr-d{flex:none;width:76px;font-size:13.5px;font-weight:700}#terrain .tr-w{display:flex;flex-direction:column;padding-left:10px;box-shadow:inset 3px 0 0 var(--cc,var(--line))}#terrain .tr-w b{font-size:15px}#terrain .tr-w small{color:var(--muted);font-size:12.5px}#terrain .tr-j.gris b{color:var(--muted)}'+
 '#terrain .tr-a{display:flex;align-items:center;gap:10px;padding:10px 0 0;margin-top:10px;border-top:1px solid var(--line)}#terrain .tr-a span{flex:1;display:flex;flex-direction:column}#terrain .tr-a small{color:var(--muted);font-size:13px}'+
 '#terrain .tr-a em{font-style:normal;font-size:12.5px;font-weight:800;padding:4px 10px;border-radius:99px;background:var(--teinte,rgba(0,0,0,.06))}#terrain .tr-a em.st-ok{color:var(--ok,#3E8E6A)}#terrain .tr-a em.st-non{color:var(--cor,#B4472F)}#terrain .tr-a em.st-att{color:var(--n1-laiton,#A8823F)}'+
 '#terrain .btn svg{margin-right:4px}#terrain .tr-pied{text-align:center;color:var(--muted);font-size:12.5px;margin:18px 10px 0}'+
 '#terrain .tr-li{padding:0;background:none;box-shadow:none}#terrain .tr-li .card{margin:0}'+
 '.rl-li .row{display:flex;justify-content:space-between;align-items:baseline}.rl-lx{display:flex;align-items:center;gap:10px;padding:9px 0;border-top:1px solid var(--line)}.rl-lx .tx{flex:1;min-width:0;display:flex;flex-direction:column}.rl-lx b{font-size:14.5px}.rl-lx small{color:var(--muted);font-size:12.5px}.rl-lx.ok b{text-decoration:line-through;color:var(--muted)}'+
 '.rl-ck{flex:none;width:28px;height:28px;min-height:0;padding:0;border-radius:50%;border:2px solid var(--line);background:none;box-shadow:none;color:#fff;font-weight:800}.rl-ck[aria-pressed="true"]{background:var(--ok,#3E8E6A);border-color:var(--ok,#3E8E6A)}'+
 '.rl-st{flex:none;font-style:normal;font-size:12px;font-weight:800;padding:5px 10px;border-radius:99px;min-height:0;box-shadow:none;border:0}.rl-st.a{background:color-mix(in srgb,var(--n1-laiton,#A8823F) 18%,transparent);color:var(--n1-laiton,#A8823F)}.rl-st.c{background:color-mix(in srgb,var(--ok,#3E8E6A) 16%,transparent);color:var(--ok,#3E8E6A)}'+
 '.rl-add{margin-top:10px;padding-top:10px;border-top:1px solid var(--line)}.rl-ty{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px}.rl-ty button{min-height:34px;padding:0 12px;border-radius:99px;background:var(--bg);box-shadow:var(--n1-pk);color:var(--fg);font:700 13px var(--f,inherit)}.rl-ty button[aria-pressed="true"]{background:var(--n1-nuit,#1B2440);color:#fff;box-shadow:none}'+
 '.rl-f{display:flex;gap:8px}.rl-f input{flex:1;min-width:0;min-height:44px;padding:0 12px;border-radius:12px;border:1.5px solid var(--line);background:var(--bg);color:var(--fg);font:600 15px var(--f,inherit)}.rl-f .btn{flex:none}'+
 '.tr-f .tr-q{margin:0 0 8px;font-weight:700}.tr-f .tr-dd{display:flex;gap:10px;margin:14px 0}.tr-f label{flex:1;display:flex;flex-direction:column;gap:4px;font-size:13.5px;color:var(--muted);font-weight:700}.tr-f input{min-height:44px;padding:0 12px;border-radius:12px;border:1.5px solid var(--line);background:var(--bg);color:var(--fg);font:600 15px var(--f,inherit)}.tr-f .tr-mo small{font-weight:500}'+
 '.rl-g h4{margin:12px 2px 6px;font-size:13px;color:var(--muted);text-transform:uppercase;letter-spacing:.04em}.rl-g:first-of-type h4{margin-top:0}'+
 '.rl-p{display:flex;flex-wrap:wrap;gap:8px}.rl-p button{display:flex;flex-direction:column;align-items:flex-start;min-height:48px;padding:6px 16px;border-radius:16px;background:var(--bg);box-shadow:var(--n1-pk);color:var(--fg);font:800 15px var(--f,inherit);text-align:left}.rl-p button small{font-size:11.5px;font-weight:600;color:var(--muted)}'+
 '.rl-p button[aria-pressed="true"]{background:var(--n1-nuit,#1B2440);color:#fff;box-shadow:none}.rl-p button[aria-pressed="true"] small{color:rgba(255,255,255,.75)}.rl-pp{margin:0 0 12px}'+
 '.rl-acc{margin:0 -4px}.rl-acc table{border-collapse:separate;border-spacing:0 4px;width:100%}.rl-acc th,.rl-acc td{padding:4px;font-size:13.5px;text-align:center}.rl-acc tbody th{text-align:left;font-weight:700;min-width:130px}'+
 '.rl-acc thead th{font-size:13px;vertical-align:bottom}.rl-acc thead th small{display:block;font-size:11px;color:var(--muted);font-weight:600}.rl-acc .dir{color:var(--muted)}.rl-acc td.dir span{font-weight:800}'+
 '.rl-acc td button{width:44px;height:38px;min-height:0;padding:0;border-radius:12px;background:var(--bg);box-shadow:var(--n1-pk);color:var(--muted);font:800 16px var(--f,inherit)}.rl-acc td button[aria-pressed="true"]{background:var(--n1-nuit,#1B2440);color:#fff;box-shadow:none}'+
 '.rl-fi .rl-l{display:flex;gap:10px;padding:8px 0;border-bottom:1px solid var(--line);font-size:15px}.rl-fi .rl-l>span{flex:none;width:90px;color:var(--muted);font-size:13.5px}.rl-fi .rl-l small{color:var(--muted);font-weight:600}'+
 '.rl-fb{display:flex;gap:8px;margin-top:14px}.rl-fb .btn{flex:1;justify-content:center}'+
 '#rl-m .av svg,#rl-qv .av svg{width:20px;height:20px}';
d.head.appendChild(st);
applique();
window.PCROLE={moi:moi,choisir:choisir,quiVoit:quiVoit,peut:peut};
})();
