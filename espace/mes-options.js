/* Espace ProClik : « Mes options » dans les Réglages (☰), demande de Cyril du 3/11.
   L'artisan voit d'un coup d'œil les options de son abonnement (les options du site vitrine + réseaux sociaux, décision de Cyril du 3/11 :
   Cliky, Réservation, SMS, Assistant du site, Avis Google, Réseaux sociaux, Votre image),
   si chacune est incluse, ce qu'elle fait pour lui, et ce qui se passe sans elle. Aucun prix affiché.
   L'état vient de window.PCOPT (options.js, même détection que les bandeaux d'option) : incluse / non incluse /
   à confirmer quand le service ne l'a pas dit. Pour ajouter une option, « Demander à Cyril » ouvre le message tout prêt. */
(function(){
'use strict';
var d=document,X=window.PCX,O=window.PCOPT;if(!X||!O)return;
var $=function(s,r){return (r||d).querySelector(s)};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};

var TXT={
 cliky:{court:'Le pré-devis se prépare tout seul',
  avec:['Dès qu\'une demande arrive, Cliky prépare le pré-devis avec vos prix et le plan du client.','Il prépare la demande de prix pour votre fournisseur, avec les dimensions.','Le devis, la facture d\'acompte et la facture finale se créent tout seuls après votre validation.','Sur vos chantiers, il range et décrit les photos.'],
  sans:'Vos demandes arrivent quand même, avec les réponses du client, ses photos et son plan. Le chiffrage, les devis et les factures, vous les faites vous-même dans l\'Espace.'},
 reservation:{court:'Vos clients prennent rendez-vous en ligne',
  avec:['Vos clients choisissent un créneau libre dans votre agenda.','Un acompte peut être demandé à la réservation.','Le rendez-vous arrive directement dans votre Planning.'],
  sans:'Vos clients vous appellent ou remplissent la demande de devis, et vous fixez le rendez-vous vous-même.'},
 sms:{court:'Alertes et messages par SMS',
  avec:['Un SMS à chaque nouvelle demande, avec le lien vers votre Espace.','Le point sur le chantier peut partir chez le client par SMS, si vous le décidez.'],
  sans:'Vos alertes arrivent dans l\'appli et par e-mail. Rien n\'est perdu.'},
 avis:{court:'La demande d\'avis Google part toute seule',
  avec:['Quand la facture finale est envoyée, la demande d\'avis Google part au client au bon moment (le lendemain, par défaut).','Vous choisissez chantier par chantier si elle part ou non.'],
  sans:'Vous demandez l\'avis à votre client vous-même, si vous le souhaitez.'},
 assistant:{court:'Répond aux visiteurs de votre site, jour et nuit',
  avec:['Il répond aux questions des visiteurs de votre site, même le soir et le week-end.','Il les guide vers une demande de devis.','Avec Cliky, la conversation devient une demande chiffrée.'],
  sans:'Votre site garde sa bulle d\'aide guidée, qui oriente déjà les visiteurs vers la demande.'},
 image:{court:'Votre logo et vos couleurs',
  avec:['Votre logo et vos couleurs, créés avec vous.','Un site, des cartes et des documents qui vous ressemblent.'],
  sans:'Votre site et vos documents gardent une présentation sobre, avec le nom de votre entreprise.'},
 reseaux:{court:'Vos réseaux sociaux gérés pour vous',
  avec:['ProClik s\'occupe de vos réseaux sociaux à votre place.','Vos plus beaux chantiers mis en avant, avec votre accord.'],
  sans:'Vous gérez vos réseaux sociaux vous-même, si vous en avez.'}
};
var ORDRE=['cliky','reservation','sms','assistant','avis','reseaux','image'];
/* Options pas encore dans options.js : nom et icône ici (même style de trait) */
var I=function(p){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>'};
var EN_PLUS={
 assistant:{n:'Assistant du site',i:I('<path d="M4 5h16v11H9l-5 4z"/><path d="M8.5 10.5h.01M12 10.5h.01M15.5 10.5h.01"/>')},
 image:{n:'Votre image',i:I('<circle cx="12" cy="12" r="8.5"/><circle cx="9" cy="9.5" r="1.3" fill="currentColor" stroke="none"/><circle cx="14.5" cy="8.5" r="1.3" fill="currentColor" stroke="none"/><circle cx="16" cy="13" r="1.3" fill="currentColor" stroke="none"/><path d="M12 20.5c-1.5 0-2-1.2-1.3-2.3.8-1.2 0-2.7-1.6-2.7H7.5"/>')},
 reseaux:{n:'Réseaux sociaux',i:I('<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="m8.2 10.8 7.6-3.6M8.2 13.2l7.6 3.6"/>')}
};
function info(k){return O.liste[k]||EN_PLUS[k]}

function etat(k){return O.actif(k)}
function pastille(e){return e===true?'<span class="mo-st on">Incluse</span>':e===false?'<span class="mo-st">Non incluse</span>':'<span class="mo-st inc">À confirmer</span>'}

/* Le bloc « Mes options », posé dans le panneau Réglages, juste sous « Un problème ? Une idée ? » */
function bloc(){
 return '<div class="xsec mo" id="mo-opt"><h3>Mes options</h3><div class="card menu">'+ORDRE.filter(function(k){return info(k)&&TXT[k]}).map(function(k){var o=info(k),e=etat(k);
  return '<button type="button" data-mo="'+k+'"'+(e===false?' class="off"':'')+'><span class="av mo-i">'+o.i+'</span><span class="tx"><b>'+esc(o.n)+'</b><small>'+esc(TXT[k].court)+'</small></span>'+pastille(e)+'<span class="go">›</span></button>'}).join('')+
  '</div></div>'}

function poser(){
 if($('#x-t').textContent!=='Votre espace'||$('#mo-opt'))return;
 var c=$('#x-in .card.menu');if(!c)return;
 var t=d.createElement('div');t.innerHTML=bloc();c.parentNode.insertBefore(t.firstChild,c);
}
var menu=$('#menu');
if(menu)menu.addEventListener('click',function(){setTimeout(poser,0)});
/* Ouvrir les Réglages directement sur les options (bouton « Mes options » ailleurs, ou retour depuis une option) */
function reglages(){if(menu){menu.click();setTimeout(function(){var m=$('#mo-opt');if(m)m.scrollIntoView({block:'start'})},30)}}
window.PCMesOptions={ouvrir:reglages};

function detail(k){var o=info(k),t=TXT[k];if(!o||!t)return;var e=etat(k),on=e===true;
 var titre=e===true?o.n+' est inclus dans votre abonnement':e===false?o.n+' n\'est pas dans votre abonnement':o.n+' : à confirmer avec Cyril';
 var h='<div class="card mo-tete'+(on?' on':'')+'"><span class="mo-gal">'+o.i+'</span><div><b>'+esc(titre)+'</b><small>'+esc(t.court)+'</small></div></div>'+
  '<div class="xsec"><h3>'+(on?'Ce qu\'elle fait pour vous':'Avec '+esc(o.n))+'</h3><div class="card"><ul class="mo-ul">'+t.avec.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ul></div></div>'+
  (on?'':'<div class="xsec"><h3>Sans cette option</h3><div class="card"><p class="mo-p">'+esc(t.sans)+'</p></div></div>'+
   '<p class="mo-p mo-cy"><b>Pour l\'ajouter, dites-le simplement à Cyril.</b> Il s\'occupe de tout.</p>');
 X.xopen(o.n,on?'Option incluse':e===false?'Option non incluse':'Option',h,
  '<button class="btn" id="mo-ret">‹ Mes options</button>'+(on?'':'<button class="btn go" id="mo-dem">Demander à Cyril</button>'),function(){
   $('#mo-ret').addEventListener('click',reglages);
   var b=$('#mo-dem');if(b)b.addEventListener('click',function(){
    var msg='Bonjour Cyril, je voudrais en savoir plus sur l\'option « '+o.n+' » pour mon Espace.';
    if(window.PCREG&&window.PCREG.ecrire)window.PCREG.ecrire(msg);else X.toast&&X.toast('Écrivez à Cyril','Menu ☰, « Écrire à Cyril ».')});
  })}
d.addEventListener('click',function(ev){var b=ev.target.closest&&ev.target.closest('[data-mo]');if(b)detail(b.getAttribute('data-mo'))});

var st=d.createElement('style');
st.textContent='.mo{margin:0 0 14px;flex:none}'+
 '.mo .mo-i{color:var(--accx,#A8823F)}.mo .mo-i svg{width:20px;height:20px}.mo .off .mo-i{color:var(--muted)}'+
 '.mo-st{flex:none;font-size:12px;font-weight:700;padding:4px 9px;border-radius:999px;color:var(--muted);box-shadow:var(--in);margin-left:6px;white-space:nowrap}'+
 '.mo-st.on{color:var(--accx,#A8823F)}.mo-st.inc{font-weight:600}'+
 '.mo-tete{display:flex;align-items:center;gap:14px}.mo-tete b{display:block;font-size:16px;line-height:1.3}.mo-tete small{display:block;color:var(--muted);font-size:13px;margin-top:3px}'+
 '.mo-gal{flex:none;width:52px;height:52px;border-radius:50%;display:grid;place-items:center;color:var(--muted);box-shadow:var(--in)}'+
 '.mo-tete.on .mo-gal{color:var(--accx,#A8823F);border:1px solid color-mix(in srgb,var(--accx,#A8823F) 45%,transparent)}.mo-gal svg{width:26px;height:26px}'+
 '.mo-ul{margin:0;padding:0 0 0 20px;display:flex;flex-direction:column;gap:8px;line-height:1.4}.mo-p{margin:0;line-height:1.45}.mo-cy{margin:4px 4px 0;color:var(--muted)}';
d.head.appendChild(st);
})();
