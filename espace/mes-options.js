/* Espace ProClik : « Mes options », demandes de Cyril du 3/11 : un bouton en haut de l'Espace (chiffre discret = options branchées),
   qui ouvre toutes les options en galets (branchées en laiton, les autres avec un petit +), icônes qui flottent et font un geste toutes les 4-5 s.
   Chaque galet ouvre sa propre fiche, et rien d'autre. Une ligne « Mes options » dans les Réglages ouvre le même panneau.
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
function liste(){return ORDRE.filter(function(k){return info(k)&&TXT[k]})}
function nbOn(){return liste().filter(function(k){return etat(k)===true}).length}
/* geste propre à chaque option, rejoué toutes les 4 à 5 s (comme les icônes du site vitrine) */
var GESTE={cliky:'mo-salut',reservation:'mo-coche',sms:'mo-parle',assistant:'mo-parle',avis:'mo-monte',reseaux:'mo-salut',image:'mo-tourne'};
var IC_OPT='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="7" height="7" rx="2.2"/><rect x="13" y="4" width="7" height="7" rx="2.2"/><rect x="4" y="13" width="7" height="7" rx="2.2"/><path d="M16.5 13.5v6M13.5 16.5h6"/></svg>';

/* ---------- le bouton « Options » en haut de l'Espace, avec le nombre d'options branchées (sans couleur d'alerte) ---------- */
var bt=d.createElement('button');bt.type='button';bt.className='icon-b mo-bt';bt.id='mo-bt';
function majBt(){var n=nbOn();bt.innerHTML=IC_OPT+(n?'<span class="mo-n">'+n+'</span>':'');
 bt.setAttribute('aria-label','Mes options'+(n?' : '+n+' branchée'+(n>1?'s':''):''));bt.title='Mes options'}
var th=$('#theme');if(th)th.parentNode.insertBefore(bt,th);else{var hr=$('.head-r');if(hr)hr.appendChild(bt)}
majBt();bt.addEventListener('click',function(){ouvrir()});

/* ---------- le panneau : toutes les options en galets, branchées en avant, les autres avec un petit + ---------- */
var pan=null,tic=0;
function ouvrir(){
 if(pan){fermer();return}
 var L=liste().slice().sort(function(a,b){return (etat(b)===true)-(etat(a)===true)});
 pan=d.createElement('div');pan.className='mo-pan';pan.setAttribute('role','dialog');pan.setAttribute('aria-label','Mes options');
 pan.innerHTML='<div class="mo-voile" data-mofer></div><div class="mo-boite"><div class="mo-tt"><b>Mes options</b><span>'+(nbOn()?nbOn()+' branchée'+(nbOn()>1?'s':''):'Aucune branchée pour l\'instant')+'</span></div><div class="mo-grille">'+
  L.map(function(k,j){var o=info(k),on=etat(k)===true;
   return '<button type="button" class="mo-g'+(on?' on':'')+'" data-mo="'+k+'" style="--j:'+j+'"><span class="mo-r"><span class="mo-ic" data-g="'+(GESTE[k]||'mo-salut')+'">'+o.i+'</span>'+(on?'':'<i class="mo-plus" aria-hidden="true">+</i>')+'</span><b>'+esc(o.n)+'</b><small>'+(on?'Branchée':'À découvrir')+'</small></button>'}).join('')+
  '</div></div>';
 d.body.appendChild(pan);bt.setAttribute('aria-pressed','true');
 requestAnimationFrame(function(){pan.classList.add('on')});
 /* toutes les 4,5 s, une icône à la fois fait son petit geste */
 var n=0;tic=setInterval(function(){if(!pan)return;var I=pan.querySelectorAll('.mo-ic');if(!I.length)return;var x=I[n++%I.length];
  x.classList.remove('joue');void x.offsetWidth;x.classList.add('joue')},4500);
 setTimeout(function(){if(pan){var x=pan.querySelector('.mo-ic');if(x)x.classList.add('joue')}},700);
}
function fermer(){clearInterval(tic);if(!pan)return;var p=pan;pan=null;bt.setAttribute('aria-pressed','false');p.classList.remove('on');setTimeout(function(){p.remove()},220)}
d.addEventListener('keydown',function(e){if(e.key==='Escape'&&pan)fermer()});
window.PCMesOptions={ouvrir:ouvrir,fermer:fermer};

/* ---------- dans les Réglages : une ligne qui ouvre le même panneau ---------- */
var menu=$('#menu');
function poser(){
 if($('#x-t').textContent!=='Votre espace'||$('#mo-opt'))return;
 var c=$('#x-in .card.menu');if(!c)return;var n=nbOn();
 var b=d.createElement('button');b.type='button';b.id='mo-opt';
 b.innerHTML='<span class="av mo-i">'+IC_OPT+'</span><span class="tx"><b>Mes options</b><small>'+(n?n+' branchée'+(n>1?'s':'')+' · voir toutes les options':'Voir toutes les options')+'</small></span><span class="go">›</span>';
 b.addEventListener('click',function(){X.xclose();ouvrir()});
 c.insertBefore(b,c.firstChild);
}
if(menu)menu.addEventListener('click',function(){setTimeout(poser,0)});

/* ---------- la fiche d'une option : elle seule, avec son explication ---------- */
function detail(k){var o=info(k),t=TXT[k];if(!o||!t)return;var e=etat(k),on=e===true;fermer();
 var titre=on?o.n+' est branché sur votre Espace':o.n+' n\'est pas encore dans votre abonnement';
 var h='<div class="card mo-tete'+(on?' on':'')+'"><span class="mo-gal">'+o.i+'</span><div><b>'+esc(titre)+'</b><small>'+esc(t.court)+'</small></div></div>'+
  '<div class="xsec"><h3>'+(on?'Ce qu\'elle fait pour vous':'Avec '+esc(o.n))+'</h3><div class="card"><ul class="mo-ul">'+t.avec.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ul></div></div>'+
  (on?'':'<div class="xsec"><h3>Sans cette option</h3><div class="card"><p class="mo-p">'+esc(t.sans)+'</p></div></div>'+
   '<p class="mo-p mo-cy"><b>Pour l\'ajouter, dites-le simplement à Cyril.</b> Il s\'occupe de tout.</p>');
 X.xopen(o.n,on?'Option branchée':'Option à découvrir',h,
  '<button class="btn" id="mo-ret">‹ Mes options</button>'+(on?'':'<button class="btn go" id="mo-dem">Demander à Cyril</button>'),function(){
   $('#mo-ret').addEventListener('click',function(){X.xclose();ouvrir()});
   var b=$('#mo-dem');if(b)b.addEventListener('click',function(){
    var msg='Bonjour Cyril, je voudrais en savoir plus sur l\'option « '+o.n+' » pour mon Espace.';
    if(window.PCREG&&window.PCREG.ecrire)window.PCREG.ecrire(msg);else X.toast&&X.toast('Écrivez à Cyril','Menu ☰, « Écrire à Cyril ».')});
  })}
d.addEventListener('click',function(ev){var t=ev.target.closest&&ev.target.closest('[data-mo],[data-mofer]');if(!t)return;
 if(t.hasAttribute('data-mofer'))fermer();else detail(t.getAttribute('data-mo'))});
/* les options arrivent avec la connexion : on remet le chiffre à jour */
addEventListener('storage',majBt);setTimeout(majBt,1500);setTimeout(majBt,5000);

var st=d.createElement('style');
st.textContent=
 /* bouton du haut : chiffre discret, gris, pour ne pas le confondre avec les choses à faire */
 'html body .head .mo-bt{position:relative;display:grid;place-items:center;color:var(--accx,#A8823F)}html body .head .mo-bt svg{width:20px;height:20px}'+
 '.mo-bt .mo-n{position:absolute;right:-3px;top:-3px;min-width:18px;height:18px;padding:0 5px;border-radius:9px;display:grid;place-items:center;font-size:11px;font-weight:800;line-height:1;color:var(--muted);background:var(--bg);box-shadow:var(--up-s,0 1px 3px rgba(0,0,0,.18));font-variant-numeric:tabular-nums}'+
 /* panneau */
 '.mo-pan{position:fixed;inset:0;z-index:60;pointer-events:none}.mo-pan.on{pointer-events:auto}'+
 '.mo-voile{position:absolute;inset:0;background:rgba(20,24,36,.28);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);opacity:0;transition:opacity .22s}.mo-pan.on .mo-voile{opacity:1}'+
 '.mo-boite{position:absolute;left:50%;top:calc(76px + env(safe-area-inset-top,0px));width:min(560px,calc(100% - 24px));max-height:calc(100% - 110px - env(safe-area-inset-top,0px));overflow:auto;padding:18px 16px 20px;border-radius:28px;background:var(--bg);box-shadow:-6px -6px 14px var(--hi,rgba(255,255,255,.6)),10px 12px 28px rgba(0,0,0,.22);transform:translate(-50%,-10px) scale(.97);opacity:0;transition:transform .26s cubic-bezier(.2,.8,.3,1),opacity .2s}'+
 '.mo-pan.on .mo-boite{transform:translate(-50%,0);opacity:1}'+
 '.mo-tt{display:flex;align-items:baseline;justify-content:space-between;gap:10px;margin:0 4px 14px}.mo-tt b{font-size:18px}.mo-tt span{font-size:13px;color:var(--muted);font-weight:600}'+
 '.mo-grille{display:grid;grid-template-columns:repeat(3,1fr);gap:16px 8px}@media (min-width:520px){.mo-grille{grid-template-columns:repeat(4,1fr)}}'+
 'html body .mo-pan .mo-g{display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:flex-start!important;gap:6px;width:100%;min-width:0;height:auto!important;padding:4px 2px!important;background:none!important;box-shadow:none!important;border:0;border-radius:0!important;color:var(--fg);font:inherit;cursor:pointer;text-align:center;opacity:0;transform:translateY(8px);transition:opacity .3s calc(var(--j)*45ms),transform .35s cubic-bezier(.2,.8,.3,1) calc(var(--j)*45ms)}'+
 '.mo-pan.on .mo-g{opacity:1;transform:none}'+
 '.mo-g b{display:block;font-size:13.5px;line-height:1.2}.mo-g small{display:block}.mo-g small{font-size:11.5px;color:var(--muted);font-weight:600}.mo-g.on small{color:var(--accx,#A8823F)}'+
 '.mo-r{flex:none;position:relative;width:64px;height:64px;border-radius:50%;display:grid;place-items:center;background:var(--bg);box-shadow:var(--up,-5px -5px 12px rgba(255,255,255,.7),6px 6px 14px rgba(0,0,0,.14));color:var(--muted);animation:mo-flotte 4s ease-in-out infinite;animation-delay:calc(var(--j)*-.6s)}'+
 '.mo-g:active .mo-r{box-shadow:var(--in)}'+
 /* branchée : laiton bien visible */
 '.mo-g.on .mo-r{color:var(--accx,#A8823F);background:color-mix(in srgb,var(--accx,#A8823F) 14%,var(--bg));box-shadow:var(--up),0 0 0 2px color-mix(in srgb,var(--accx,#A8823F) 55%,transparent)}'+
 '.mo-ic{display:grid;place-items:center}.mo-ic svg{width:28px;height:28px;transform-origin:50% 60%}'+
 '.mo-plus{position:absolute;right:-2px;top:-2px;width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font-style:normal;font-size:16px;font-weight:700;line-height:1;color:var(--muted);background:var(--bg);box-shadow:var(--up-s,0 1px 3px rgba(0,0,0,.18))}'+
 '@keyframes mo-flotte{0%,100%{translate:0 0}50%{translate:0 -3px}}'+
 '.mo-ic.joue[data-g=mo-salut] svg{animation:mo-salut 1.3s ease}.mo-ic.joue[data-g=mo-coche] svg{animation:mo-coche 1.1s ease}.mo-ic.joue[data-g=mo-parle] svg{animation:mo-parle 1.2s ease}.mo-ic.joue[data-g=mo-tourne] svg{animation:mo-tourne 1.3s ease}.mo-ic.joue[data-g=mo-monte] svg{animation:mo-monte 1.1s ease}'+
 '@keyframes mo-salut{0%,100%{transform:none}20%{transform:rotate(-14deg) translateY(-2px)}45%{transform:rotate(12deg) translateY(-2px)}70%{transform:rotate(-6deg)}}'+
 '@keyframes mo-coche{0%,100%{transform:none}30%{transform:translateY(-4px) scale(1.15)}60%{transform:scale(1.05)}}'+
 '@keyframes mo-parle{0%,100%{transform:none}20%{transform:scale(1.15) rotate(-6deg)}40%{transform:scale(1.05) rotate(5deg)}60%{transform:scale(1.12) rotate(-3deg)}}'+
 '@keyframes mo-tourne{0%{transform:none}60%{transform:rotate(200deg) scale(1.1)}100%{transform:rotate(360deg)}}'+
 '@keyframes mo-monte{0%,100%{transform:none}35%{transform:translateY(-5px) scale(1.2)}}'+
 '@media (prefers-reduced-motion:reduce){.mo-r{animation:none}.mo-ic.joue svg{animation:none!important}}'+
 /* ligne des Réglages + fiche */
 '#mo-opt .mo-i{color:var(--accx,#A8823F)}#mo-opt .mo-i svg{width:20px;height:20px}'+
 '.mo-tete{display:flex;align-items:center;gap:14px}.mo-tete b{display:block;font-size:16px;line-height:1.3}.mo-tete small{display:block;color:var(--muted);font-size:13px;margin-top:3px}'+
 '.mo-gal{flex:none;width:52px;height:52px;border-radius:50%;display:grid;place-items:center;color:var(--muted);box-shadow:var(--in)}'+
 '.mo-tete.on .mo-gal{color:var(--accx,#A8823F);border:1px solid color-mix(in srgb,var(--accx,#A8823F) 45%,transparent)}.mo-gal svg{width:26px;height:26px}'+
 '.mo-ul{margin:0;padding:0 0 0 20px;display:flex;flex-direction:column;gap:8px;line-height:1.4}.mo-p{margin:0;line-height:1.45}.mo-cy{margin:4px 4px 0;color:var(--muted)}';
d.head.appendChild(st);
})();
