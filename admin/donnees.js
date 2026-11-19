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
window.PCDonnees={fiche:fiche};
})();
