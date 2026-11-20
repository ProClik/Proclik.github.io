/* Admin ProClik : « Données de l'Espace » d'un client (Cyril 20/11 : « des sécurités, voire double, pour ne rien perdre »).
   Montre ce que le service garde (chantiers, planning, dépenses…) et l'historique de chaque partie (30 jours),
   avec « Revenir à cette version » en deux appuis. La version actuelle passe elle-même dans l'historique : rien n'est perdu.
   Service : POST /admin/donnees {client} et {client, cle, maj} (proclik-cliky, calcul/donnees.js). */
(function(){'use strict';
var A=window.PCADM;if(!A)return;
var api=A.api,esc=A.esc,toast=A.toast,$=function(s,r){return (r||document).querySelector(s)};
var NOMS={'pc-ch9':'Chantiers','pc-ev1':'Planning','pc-st1':'Sous-traitants (planning)','pc-dep1':'Dépenses','pc-compta1':'Dossier du comptable','pc-cmd1':'Commandes fournisseur','pc-eq1':'Équipe','pc-cotes':'Prises de cotes','pc-ent-v1':'Contrats d\'entretien','pc-ent-on':'Contrats d\'entretien (réglage)','pc-plans':'Plans','pc-cl1':'Clients ajoutés à la main','pc-cl-sup':'Clients retirés','pc-fa1':'Suivi des factures','pc-dvn1':'Devis faits à la main','pc-rc1':'Factures fournisseur payées','pc-sit-reg':'Rappel de situation'};
var POURQUOI={'vidé':'gardée avant d\'être vidée','autre appareil':'gardée : un autre appareil avait écrit','beaucoup retiré':'gardée : beaucoup de choses retirées d\'un coup','avant retour en arrière':'gardée avant un retour en arrière'};
function quand(t){if(!t)return '—';var d=new Date(t);return d.toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'short'})+' à '+d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}
function poids(n){return n>1e6?(n/1e6).toFixed(1).replace('.',',')+' Mo':Math.max(1,Math.round(n/1e3))+' ko'}
function fiche(id){var Z=$('#fdonnees');if(!Z||!id)return;Z.innerHTML='<h2>Données de l\'Espace</h2><p class="mu" style="margin:0">Chargement…</p>';
 api('/admin/donnees',{method:'POST',body:{client:id}}).then(function(j){rendre(Z,id,j)},function(e){Z.innerHTML='<h2>Données de l\'Espace</h2><p class="err">'+esc(e.message)+'</p>'})}
function rendre(Z,id,j){var T=j.tiroirs||[];
 var h='<h2>Données de l\'Espace</h2><p class="mu" style="margin:0 0 8px">Gardées dans le service, avec 30 jours d\'historique. Rien n\'est encore arrivé tant que le client ne s\'est pas connecté depuis la mise à jour.</p>';
 if(!T.length)h+='<p class="mu">Rien de gardé pour l\'instant.</p>';
 T.forEach(function(t){h+='<details class="ck"><summary>'+esc(NOMS[t.cle]||t.cle)+' · <span class="mu">'+(t.maj?quand(t.maj)+' · '+poids(t.taille):'vidé')+' · '+t.versions.length+' version'+(t.versions.length>1?'s':'')+' d\'avant</span></summary>'+
  (t.versions.length?t.versions.map(function(v){return '<div class="ck-row" style="align-items:center;justify-content:space-between;padding:6px 0"><span>'+quand(v.maj)+' · '+poids(v.taille)+(v.pourquoi?' <small class="mu">('+esc(POURQUOI[v.pourquoi]||v.pourquoi)+')</small>':'')+'</span><button type="button" class="btn" data-dnret="'+esc(t.cle)+'|'+v.maj+'">Revenir à cette version</button></div>'}).join(''):'<p class="mu">Pas encore de version d\'avant.</p>')+'</details>'});
 Z.innerHTML=h;
 Z.onclick=function(e){var b=e.target.closest('[data-dnret]');if(!b)return;
  if(!b.dataset.ok){b.dataset.ok=1;var o=b.textContent;b.textContent='Sûr ? Touchez encore';setTimeout(function(){if(b.dataset.ok){delete b.dataset.ok;b.textContent=o}},3500);return}
  var p=b.dataset.dnret.split('|');b.disabled=true;
  api('/admin/donnees',{method:'POST',body:{client:id,cle:p[0],maj:+p[1]}}).then(function(){toast('C\'est fait : le client la retrouve à la prochaine ouverture');fiche(id)},function(e){b.disabled=false;toast(e.message)})}}
/* ---------- Sauvegardes (Cyril 20/11 : « extrêmement bien protégé, ne jamais rien perdre ») ----------
   Chaque nuit, un fichier complet par client dans le coffre R2 (30 nuits + 1er de chaque mois sur 12 mois).
   Télécharger : un seul fichier avec tout son Espace (+ ses demandes GHL et ses devis/factures à l'instant).
   Tout remettre : la situation actuelle est d'abord sauvegardée, donc on peut revenir en arrière. */
function jourDe(n){var m=/(\d{4})-(\d\d)-(\d\d)/.exec(n);if(!m)return n;var d=new Date(+m[1],+m[2]-1,+m[3]);return d.toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
function genre(n){return /^avant-remise/.test(n)?' <small class="mu">(situation juste avant une remise)</small>':/^manuel/.test(n)?' <small class="mu">(faite à la main)</small>':''}
/* envoyer=true (Cyril 20/11 : « lui envoyer en un clic ») : la feuille de partage de l'iPad/iPhone s'ouvre avec le fichier
   déjà joint (Mail, Messages, AirDrop…). Ailleurs : le fichier est téléchargé et Mail s'ouvre avec l'adresse du client. */
var CLIENT={};
function telecharger(id,nom,b,envoyer){if(b)b.disabled=true;api('/admin/sauvegarde/telecharger',{method:'POST',body:{client:id,nom:nom||undefined}}).then(function(j){
  var nomF='espace-'+id+'-'+(nom?nom.replace(/\.json$/,''):new Date().toISOString().slice(0,10))+'.json',texte=JSON.stringify(j.fichier,null,1),c=CLIENT[id]||{};
  var objet='Sauvegarde de votre Espace ProClik',mot='Bonjour'+(c.prenom?' '+c.prenom:'')+',\n\nVoici la sauvegarde complète de votre Espace ProClik (chantiers, planning, dépenses, clients…), en un seul fichier. Gardez-le précieusement.\n\nCyril, ProClik';
  if(envoyer){var F=null;try{F=new File([texte],nomF,{type:'application/json'})}catch(e){}
   if(F&&navigator.canShare&&navigator.canShare({files:[F]})){if(b)b.disabled=false;
    return navigator.share({files:[F],title:objet,text:mot}).then(function(){toast('Sauvegarde envoyée')},function(e){if(e&&e.name!=='AbortError')toast('Envoi impossible : '+e.message)})}}
  var u=URL.createObjectURL(new Blob([texte],{type:'application/json'})),a=document.createElement('a');a.href=u;a.download=nomF;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},4000);
  if(b)b.disabled=false;
  if(envoyer){location.href='mailto:'+encodeURIComponent(c.email||'')+'?subject='+encodeURIComponent(objet)+'&body='+encodeURIComponent(mot+'\n\n(Fichier joint : '+nomF+')');toast('Fichier téléchargé : joignez-le au mail qui s\'ouvre')}
  else toast('Fichier téléchargé : rangez-le dans iCloud ou sur un disque')},function(e){if(b)b.disabled=false;toast(e.message)})}
function sauv(id){var Z=$('#fsauv');if(!Z||!id)return;Z.innerHTML='<h2>Sauvegardes</h2><p class="mu" style="margin:0">Chargement…</p>';
 api('/admin/sauvegardes',{method:'POST',body:{client:id}}).then(function(j){rendreSauv(Z,id,j)},function(e){Z.innerHTML='<h2>Sauvegardes</h2><p class="err">'+esc(e.message)+'</p>'})}
function etatSauv(j){var v=j.voyant||{},e=j.etat||{},h='<div style="margin:0 0 10px">';
 if(v.ok)h+='<span class="pill ok">● Tout va bien</span>';else if(v.attente)h+='<span class="pill w">● Première sauvegarde cette nuit</span>';else h+='<span class="pill al">● À régler</span>';
 if(e.nuit)h+='<div class="mu" style="margin-top:6px">Dernière sauvegarde : '+quand(Date.parse(e.nuit.le))+(e.nuit.ok?' · '+poids(e.nuit.taille||0):' · <b style="color:var(--n1-alert)">ratée</b>')+'</div>';
 if(j.second)h+='<div class="mu">2e copie chez Scaleway (chaque semaine) : '+(e.second?quand(Date.parse(e.second.le))+(e.second.ok?' · OK':' · <b style="color:var(--n1-alert)">ratée</b>'):'la première part cette nuit')+'</div>';
 else h+='<div class="mu">2e copie chez Scaleway : pas encore branchée (voir Réglages).</div>';
 (v.ok||v.attente?[]:v.problemes||[]).forEach(function(p){h+='<div class="err" style="margin-top:4px">'+esc(p)+'</div>'});
 return h+'</div>'}
function rendreSauv(Z,id,j){var L=j.sauvegardes||[];
 var h='<h2>Sauvegardes</h2>'+etatSauv(j)+(j.coffre?'<p class="mu" style="margin:0 0 10px">Chaque nuit à 3 h, tout son Espace est copié dans le coffre. On garde 30 nuits, le 1er de chaque mois pendant un an, et la 1re nuit de chaque année pour toujours.</p>':'<p class="err" style="margin:0 0 10px">Le coffre de sauvegarde n\'est pas encore créé dans Cloudflare : pas de sauvegarde de nuit pour l\'instant. Le téléchargement marche déjà.</p>')+
  '<div class="ck-row" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px"><button type="button" class="btn go" data-sv="env">Envoyer au client</button><button type="button" class="btn" data-sv="dl">Télécharger tout son Espace</button>'+(j.coffre?'<button type="button" class="btn" data-sv="now">Sauvegarder maintenant</button>':'')+'<label class="btn" style="cursor:pointer">Remettre depuis un fichier<input type="file" accept="application/json,.json" data-sv="fic" hidden></label></div>';
 if(j.coffre)h+=L.length?'<details class="ck"><summary>'+L.length+' sauvegarde'+(L.length>1?'s':'')+' · la plus récente : '+esc(jourDe(L[0].nom))+'</summary>'+L.map(function(x){return '<div style="display:flex;gap:8px;align-items:center;justify-content:space-between;flex-wrap:wrap;padding:6px 0;border-top:1px solid var(--li)"><span>'+esc(jourDe(x.nom))+genre(x.nom)+' · <span class="mu">'+poids(x.taille)+'</span></span><span style="display:flex;gap:6px"><button type="button" class="btn" data-svdl="'+esc(x.nom)+'">Télécharger</button><button type="button" class="btn" data-svenv="'+esc(x.nom)+'">Envoyer</button><button type="button" class="btn" data-svret="'+esc(x.nom)+'">Tout remettre à cette date</button></span></div>'}).join('')+'</details>':'<p class="mu">Première sauvegarde cette nuit.</p>';
 Z.innerHTML=h;
 Z.onclick=function(e){var b=e.target.closest('button');if(!b)return;
  if(b.dataset.sv==='dl')return telecharger(id,null,b);
  if(b.dataset.sv==='env'||b.dataset.svenv)return envoyerMail(id,b.dataset.svenv||null,b);
  if(b.dataset.svdl)return telecharger(id,b.dataset.svdl,b);
  if(b.dataset.sv==='now'){b.disabled=true;api('/admin/sauvegarde/maintenant',{method:'POST',body:{client:id}}).then(function(){toast('Sauvegarde faite');sauv(id)},function(er){b.disabled=false;toast(er.message)});return}
  if(b.dataset.svret){if(!b.dataset.ok){b.dataset.ok=1;var o=b.textContent;b.textContent='Sûr ? Tout son Espace revient à cette date. Touchez encore';setTimeout(function(){if(b.dataset.ok){delete b.dataset.ok;b.textContent=o}},5000);return}
   b.disabled=true;api('/admin/sauvegarde/remettre',{method:'POST',body:{client:id,nom:b.dataset.svret}}).then(function(r){toast('Espace remis ('+r.remises+' éléments). La situation d\'avant est gardée.');sauv(id);fiche(id)},function(er){b.disabled=false;toast(er.message)})}};
 var fi=Z.querySelector('[data-sv="fic"]');if(fi)fi.onchange=function(){var x=fi.files&&fi.files[0];if(!x)return;var r=new FileReader();r.onload=function(){var f;try{f=JSON.parse(r.result)}catch(er){toast('Ce fichier n\'est pas une sauvegarde ProClik');return}
  if(f&&f.proclik==='sauvegarde chiffrée'){fi.value='';return chiffre(Z,id,f)}
  if(!f||f.client!==id){toast('Ce fichier n\'est pas une sauvegarde de ce client');return}
  if(!confirmer2(fi))return;api('/admin/sauvegarde/remettre',{method:'POST',body:{client:id,fichier:f}}).then(function(rr){toast('Espace remis depuis le fichier ('+rr.remises+' éléments)');sauv(id);fiche(id)},function(er){toast(er.message)})};r.readAsText(x)}}
/* « Envoyer au client » (Cyril 20/11, choix « e-mail auto avec lien sécurisé ») : le mail part du GHL de ProClik vers son
   adresse, avec un lien personnel (7 jours). Deux appuis. Si l'envoi auto n'est pas branché : feuille de partage / Mail. */
function envoyerMail(id,nom,b){var c=CLIENT[id]||{};
 if(!b.dataset.ok){b.dataset.ok=1;var o=b.dataset.o=b.textContent;b.textContent='Envoyer à '+(c.email||'son adresse')+' ? Touchez encore';setTimeout(function(){if(b.dataset.ok){delete b.dataset.ok;b.textContent=o}},5000);return}
 delete b.dataset.ok;b.textContent=b.dataset.o||b.textContent;b.disabled=true;
 api('/admin/sauvegarde/envoyer',{method:'POST',body:{client:id,nom:nom||undefined}}).then(function(r){b.disabled=false;toast('E-mail envoyé à '+r.email+' (lien valable 7 jours)');sauv(id)},
  function(e){b.disabled=false;if(/pas encore branché/.test(e.message))return telecharger(id,nom,b,true);toast(e.message)})}
/* Copie chiffrée (2e copie Scaleway) : la phrase secrète est tapée ici et ne quitte jamais l'iPad. */
function b64u(x){return Uint8Array.from(atob(x),function(c){return c.charCodeAt(0)})}
function dechiffrer(f,phrase){var C=crypto.subtle,te=new TextEncoder();
 return C.importKey('raw',te.encode(phrase),'PBKDF2',false,['deriveKey']).then(function(k){return C.deriveKey({name:'PBKDF2',salt:b64u(f.sel),iterations:100000,hash:'SHA-256'},k,{name:'AES-GCM',length:256},false,['decrypt'])})
  .then(function(k){return C.decrypt({name:'AES-GCM',iv:b64u(f.iv)},k,b64u(f.data))}).then(function(b){return JSON.parse(new TextDecoder().decode(b))})}
function chiffre(Z,id,f){var d=document.createElement('div');d.className='res';d.style.marginTop='10px';
 d.innerHTML='<p style="margin:0 0 8px"><b>Copie chiffrée (Scaleway)</b><br><span class="mu">Tapez votre phrase secrète pour l\'ouvrir. Elle reste sur cet appareil.</span></p><input class="t" type="password" autocomplete="off" aria-label="Phrase secrète" style="margin-bottom:8px"><div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn go">Ouvrir</button><button type="button" class="btn">Annuler</button></div>';
 Z.appendChild(d);var inp=d.querySelector('input'),bs=d.querySelectorAll('button');inp.focus();
 bs[1].onclick=function(){d.remove()};
 bs[0].onclick=function(){var b=this;b.disabled=true;dechiffrer(f,inp.value).then(function(x){
   if(!x||x.client!==id){b.disabled=false;toast('Cette copie n\'est pas celle de ce client');return}
   d.innerHTML='<p style="margin:0 0 8px"><b>Copie ouverte</b> · du '+esc(jourDe((x.le||'').slice(0,10)))+'</p><div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn go">Tout remettre depuis cette copie</button><button type="button" class="btn">Annuler</button></div>';
   var r=d.querySelectorAll('button');r[1].onclick=function(){d.remove()};
   r[0].onclick=function(){var bb=this;if(!bb.dataset.ok){bb.dataset.ok=1;bb.textContent='Sûr ? Tout son Espace revient à cette copie. Touchez encore';return}
    bb.disabled=true;api('/admin/sauvegarde/remettre',{method:'POST',body:{client:id,fichier:x}}).then(function(rr){toast('Espace remis depuis la copie chiffrée ('+rr.remises+' éléments)');sauv(id);fiche(id)},function(er){bb.disabled=false;toast(er.message)})}},
  function(){b.disabled=false;toast('Phrase secrète incorrecte')})}}
/* Fichier choisi : deuxième geste demandé par un petit bandeau (pas de fenêtre du navigateur). */
function confirmer2(fi){var lab=fi.parentNode;if(lab.dataset.ok){delete lab.dataset.ok;return true}lab.dataset.ok=1;toast('Choisissez le fichier une 2e fois pour confirmer la remise');fi.value='';setTimeout(function(){delete lab.dataset.ok},8000);return false}
window.PCDonnees={fiche:function(id,c){if(c)CLIENT[id]=c;sauv(id);fiche(id)}};
})();
