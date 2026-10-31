/* ProClik · Espace branché sur les vraies demandes (GHL), à travers le service sécurisé ProClik (Cloudflare).
   Aucune clé ici : l'artisan tape son code d'accès une fois, le service renvoie un jeton gardé sur l'appareil.
   Lien direct d'une demande (e-mail d'alerte) : espace/#c=<identifiant du contact GHL>.
   Sans adresse de service (config.js) ou sans connexion, l'Espace reste en mode démo. */
(function(){
'use strict';
var SERVICE=String(window.PC_SERVICE||'').replace(/\/+$/,'');
if(!/^https:\/\/[a-z0-9.-]+$/i.test(SERVICE))SERVICE='';
var KJ='pc-vrai-jeton',KA='pc-vrai-artisan',KL='pc-vrai-liste';
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var lsG=function(k){try{return JSON.parse(localStorage.getItem(k)||'null')}catch(e){return null}};
var lsS=function(k,v){try{if(v==null)localStorage.removeItem(k);else localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
var eur=function(n,d){return n==null?'—':Number(n).toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:d||2})+' €'};
var qte=function(n){return n==null?'':String(n).replace('.',',')};
function quand(iso){if(!iso)return '';var d=new Date(iso);if(isNaN(d))return '';var now=new Date(),j=Math.round((new Date(now.toDateString())-new Date(d.toDateString()))/864e5),h=d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}).replace(':',' h ');
 return j===0?'aujourd\'hui, '+h:j===1?'hier, '+h:j<7?d.toLocaleDateString('fr-FR',{weekday:'long'})+', '+h:d.toLocaleDateString('fr-FR',{day:'numeric',month:'short'})}
var valider=function(nom){return /valider/i.test(nom||'')};

/* ---------- styles du mode réel ---------- */
var css=document.createElement('style');
css.textContent=[
'html.pcvrai #v-devis>.grid2{display:block}',
'html.pcvrai #v-devis>.grid2>.col>*:not(#vd),html.pcvrai #dright{display:none!important}',
'html.pcvrai #todo,html.pcvrai .today,html.pcvrai #v-accueil .pcq-h,html.pcvrai #v-accueil .pcq,html.pcvrai #v-accueil .bilan{display:none!important}',
'html.pcvrai .chip-demo{background:var(--turq-bg);color:var(--turq-ink)}',
'.vexemple{margin:0 0 12px;padding:10px 14px;border-radius:14px;background:var(--cor-bg);color:var(--cor-ink);font-size:13.5px}',
'.vco{margin:0 0 14px;padding:12px 14px;border-radius:16px;background:var(--card);box-shadow:var(--shadow);display:flex;gap:12px;align-items:center;flex-wrap:wrap}',
'.vco span{flex:1 1 200px;font-size:13.5px;color:var(--muted)}.vco b{color:var(--fg)}',
'.vl{display:grid;gap:10px}',
'.vcard{appearance:none;text-align:left;width:100%;border:1.5px solid var(--line);background:var(--card);color:var(--fg);border-radius:16px;padding:12px 14px;display:grid;gap:6px;font:inherit;cursor:pointer}',
'.vcard.vav{border-color:var(--turq);box-shadow:0 0 0 3px rgba(46,230,200,.16)}',
'.vcard .r{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}',
'.vcard[disabled]{opacity:.6;cursor:default}.vp[hidden]{display:none}',
'.vcard b{font-size:15.5px}.vcard small{display:block;color:var(--muted);font-size:12.5px}',
'.vamt{font-size:20px;font-weight:800;letter-spacing:-.3px}.vamt small{display:inline;font-size:12px;margin-left:4px}',
'.vp{font-size:11.5px;font-weight:800;padding:4px 9px;border-radius:999px;white-space:nowrap;background:var(--soft);color:var(--muted)}',
'.vp.t{background:var(--turq-bg);color:var(--turq-ink)}.vp.w{background:var(--warn-bg);color:var(--warn)}',
'.vh{display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin:6px 0 8px}.vh h2{margin:0;font-size:18px}.vh span{font-size:12.5px;color:var(--muted)}',
'.vst{font-size:13.5px;color:var(--muted);padding:6px 2px}',
'.vbtn{appearance:none;border:0;border-radius:12px;padding:11px 16px;font:800 14.5px var(--f);cursor:pointer;background:var(--soft);color:var(--fg);min-height:44px}',
'.vbtn.go{background:var(--nuit);color:#fff}html[data-theme="dark"] .vbtn.go{background:var(--turq);color:#0B1226}',
'@media (prefers-color-scheme:dark){html:not([data-theme="light"]) .vbtn.go{background:var(--turq);color:#0B1226}}',
'.vbtn.sm{padding:8px 12px;min-height:36px;font-size:13px}.vbtn[disabled]{opacity:.5}',
'.vov .pcbody{gap:12px}.vov .card{background:var(--card);border-radius:16px;padding:14px;box-shadow:var(--shadow)}',
'.vsec h3{margin:0 0 8px;font-size:15px}.vkv{display:grid;grid-template-columns:auto 1fr;gap:4px 12px;font-size:14px}.vkv span{color:var(--muted)}.vph{display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:8px}.vph a{display:block;aspect-ratio:1;border-radius:10px;overflow:hidden;background:var(--line,#2a3140)}.vph img{width:100%;height:100%;object-fit:cover;display:block}',
'.vli{display:grid;grid-template-columns:1fr auto;gap:2px 10px;padding:8px 0;border-top:1px solid var(--line);font-size:14px}.vli:first-child{border-top:0}',
'.vli small{grid-column:1/-1;color:var(--muted);font-size:12.5px}.vli .x{font-weight:800;white-space:nowrap}.vli.vv{background:var(--warn-bg);margin:0 -8px;padding:8px;border-radius:10px}',
'.vedit{width:100%;text-align:left;background:none;border:0;border-top:1px solid var(--line);font:inherit;color:inherit;cursor:pointer}.vedit:first-of-type{border-top:0}',
'.vform{display:grid;gap:12px}.vform label{display:grid;gap:6px;font-size:13.5px;font-weight:700}.vform input,.vform select,.vform textarea{width:100%;min-height:46px;padding:10px 12px;border-radius:12px;font-family:inherit;font-size:15px;font-weight:600;color:inherit;border:1px solid var(--line)}.vrow{display:grid;grid-template-columns:1fr 1fr;gap:10px}',
'.vbtn.arme{color:var(--cor-ink)}.vbtn.go.varm{box-shadow:0 0 0 2px var(--acc,#A8823F)}',
'details.vd>summary{cursor:pointer;font-weight:700}details.vd>.card{box-shadow:none;margin:10px 0 0;padding:0;background:none}',
'.vtot{display:grid;grid-template-columns:1fr auto;gap:4px 10px;font-size:14px}.vtot .big{font-size:18px;font-weight:800}',
'.vul{margin:0;padding-left:18px;display:grid;gap:4px;font-size:14px}',
'.vbtns{display:flex;gap:8px;flex-wrap:wrap}',
'.vpre{white-space:pre-wrap;font:13px/1.5 var(--mono);margin:0}',
'.vlog{display:grid;gap:10px}.vlog input{font:600 17px var(--f);padding:12px 14px;border-radius:12px;border:1.5px solid var(--line);background:var(--bg);color:var(--fg);width:100%}',
'.verr{color:var(--cor-ink);background:var(--cor-bg);border-radius:12px;padding:8px 12px;font-size:13.5px}.verr:empty{display:none}',
'.vfoot .vbtn.go{flex:2 1 200px}.vfoot{display:flex;gap:8px;padding:10px 16px calc(10px + env(safe-area-inset-bottom,0px));border-top:1px solid var(--line);background:var(--card);flex-wrap:wrap}.vfoot .vbtn{flex:1 1 140px}',
'details.vd summary{cursor:pointer;font-weight:700;font-size:14px}'
].join('\n');
document.head.appendChild(css);

/* ---------- appels au service ---------- */
function api(chemin,opt){opt=opt||{};var j=lsG(KJ),h={};if(j)h.Authorization='Bearer '+j;if(opt.body)h['Content-Type']='application/json';
 return fetch(SERVICE+chemin,{method:opt.method||'GET',headers:h,body:opt.body?JSON.stringify(opt.body):undefined,cache:'no-store'})
  .then(function(r){return r.json().catch(function(){return{ok:false,erreur:'Réponse illisible du service ('+r.status+')'}}).then(function(x){if(r.status===401&&x&&x.reconnexion){deconnecter(true);}if(!x.ok)throw new Error(x.erreur||('Erreur '+r.status));return x})},
   function(){throw new Error(navigator.onLine===false?'Pas de réseau pour l\'instant.':'Service ProClik injoignable. Réessayez dans un instant.')});}

/* ---------- panneau plein écran (même style que le plan) ---------- */
var ov=document.createElement('div');ov.className='pcov vov';ov.hidden=true;ov.setAttribute('role','dialog');
ov.innerHTML='<div class="pcov-h"><b id="vov-t"></b><button class="pcov-x" id="vov-x" type="button">Fermer</button></div><div class="pcbody" id="vov-b"></div><div class="vfoot" id="vov-f" hidden></div>';
document.body.appendChild(ov);
function ouvrir(titre,html,foot){$('#vov-b').style.padding='';$('#vov-b').style.maxWidth='';$('#vov-t').innerHTML=titre;$('#vov-b').innerHTML=html;var f=$('#vov-f');f.innerHTML=foot||'';f.hidden=!foot;ov.hidden=false;document.body.style.overflow='hidden';$('#vov-b').scrollTop=0}
function fermer(){ov.hidden=true;document.body.style.overflow='';if(/#c=/.test(location.hash))try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}}
$('#vov-x').addEventListener('click',fermer);
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!ov.hidden)fermer()});

/* ---------- connexion ---------- */
var apres=null;
function connexion(msg){
 ouvrir('🔒 Vos vraies demandes<small>Connexion à l\'Espace ProClik</small>',
  '<div class="card vlog"><p style="margin:0">'+(msg?esc(msg):'Tapez le code d\'accès que Cyril vous a donné. Vous ne le retaperez pas à chaque fois : cet appareil s\'en souvient 90 jours.')+'</p>'+
  '<input id="vcode" type="password" inputmode="text" autocomplete="current-password" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Code d\'accès" aria-label="Code d\'accès">'+
  '<label style="font-size:13.5px;color:var(--muted);display:flex;gap:8px;align-items:center"><input type="checkbox" id="vvoir" style="width:auto"> Afficher le code</label>'+
  '<div class="verr" id="verr"></div><button class="vbtn go" id="vgo" type="button">Se connecter</button></div>'+
  '<p class="hint" style="margin:0;color:var(--muted);font-size:13px">Sans code, l\'Espace reste en démonstration (exemples fictifs). Vos données restent dans votre compte : rien n\'est envoyé à un client sans vous.</p>');
 var inp=$('#vcode');setTimeout(function(){try{inp.focus()}catch(e){}},200);
 $('#vvoir').addEventListener('change',function(){inp.type=this.checked?'text':'password'});
 function go(){var c=inp.value.trim(),b=$('#vgo');if(!c){$('#verr').textContent='Le code est vide.';return}
  b.disabled=true;b.textContent='Vérification…';$('#verr').textContent='';
  api('/espace/connexion',{method:'POST',body:{code:c}}).then(function(x){lsS(KJ,x.jeton);lsS(KA,x.artisan);fermer();demarrer();if(apres){var a=apres;apres=null;a()}},
   function(e){b.disabled=false;b.textContent='Se connecter';$('#verr').textContent=e.message==='Code d\'accès refusé'?'Code refusé. Vérifiez les majuscules et les espaces (la correction automatique de l\'iPad aime les changer).':e.message})}
 $('#vgo').addEventListener('click',go);inp.addEventListener('keydown',function(e){if(e.key==='Enter')go()});
}
function deconnecter(expire){lsS(KJ,null);lsS(KL,null);document.documentElement.classList.remove('pcvrai');location.hash='';if(expire){setTimeout(function(){connexion('Votre connexion a expiré ou le code a changé : retapez votre code d\'accès.')},50)}else location.reload()}

/* ---------- liste des demandes ---------- */
var LISTE=null,ETAPES=[],charge=0;
function carte(d){var av=valider(d.etape);
 return '<button class="vcard'+(av?' vav':'')+'" type="button" data-vc="'+esc(d.contact||'')+'"><div class="r"><span><b>'+esc(d.client)+'</b><small>'+esc(d.resume||d.titre||'')+'</small></span><span class="vp '+(av?'t':'')+'">'+esc(d.etape||'—')+'</span></div>'+
  '<div class="r"><span class="vamt">'+(d.total_ht!=null?eur(d.total_ht)+'<small>HT</small>':'<small style="margin:0">pré-devis pas encore prêt</small>')+'</span><small style="text-align:right">'+esc(quand(d.pre_devis_le||d.cree_le))+(d.a_verifier?'<br><span class="vp w">'+d.a_verifier+' à vérifier</span>':'')+'</small></div></button>'}
/* Onglet Devis : le même petit menu à icônes que la démo (Pré-devis · Fournisseur · Validés) */
var VSEG=null,FOURN=function(e){return /fournisseur/i.test(e||'')};
var ICS={pre:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 21H6V3h8l4 4v4"/><path d="M14 3v4h4M9 9h4M9 13h3"/><path d="M19.5 13.5l-5.5 5.5-.6 2.6 2.6-.6 5.5-5.5z"/></svg>',
 four:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h11v9H3z"/><path d="M14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/></svg>',
 val:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 14l2 2 3.5-3.5"/></svg>'};
function rendre(){var L=(LISTE&&LISTE.demandes)||[],a=L.filter(function(d){return valider(d.etape)}),o=L.filter(function(d){return !valider(d.etape)});
 var art=lsG(KA)||{},etat=LISTE?(LISTE._cache?'Hors connexion · liste du '+esc(quand(LISTE._le)):'À jour · '+esc(quand(LISTE._le))):'Chargement…';
 var f=o.filter(function(d){return FOURN(d.etape)}),v=o.filter(function(d){return !FOURN(d.etape)});if(!VSEG&&LISTE)VSEG=a.length?'pre':f.length?'four':'val';
 var G={pre:[a,'Pré-devis à valider','Rien à valider pour l\'instant. Le café peut rester chaud.'],four:[f,'En attente du fournisseur','Aucune demande n\'attend un fournisseur.'],val:[v,'Validés et suivantes','Aucune autre demande en cours.']}[VSEG||'pre'];
 var h='<div class="cf"><div class="vh"><h2>Devis</h2><span>'+etat+'</span></div><div class="seg cf-seg dv-seg" role="tablist" aria-label="Devis">'+[['pre','Pré-devis',a.length],['four','Fournisseur',f.length],['val','Validés',0]].map(function(x){return '<button role="tab" type="button" data-vseg="'+x[0]+'" aria-selected="'+((VSEG||'pre')===x[0])+'">'+ICS[x[0]]+'<span>'+x[1]+'</span>'+(x[2]?'<i>'+x[2]+'</i>':'')+'</button>'}).join('')+'</div></div>'+
  '<div class="vh" style="margin-top:14px"><h2>'+G[1]+'</h2><span>'+G[0].length+'</span></div>'+(G[0].length?'<div class="vl">'+G[0].map(carte).join('')+'</div>':'<p class="vst">'+(LISTE?G[2]:'…')+'</p>');
 h+='<div class="vbtns" style="margin-top:12px"><button class="vbtn sm" type="button" data-vrefresh>↻ Actualiser</button><button class="vbtn sm" type="button" data-vout>Se déconnecter</button></div>';
 var vd=$('#vd');if(vd)vd.innerHTML=h;
 var va=$('#va');if(va)va.innerHTML=a.length?'<div class="vl">'+a.slice(0,4).map(carte).join('')+'</div>'+(a.length>4?'<button class="vbtn sm" type="button" data-vtab style="margin-top:8px">Voir les '+a.length+' demandes ›</button>':''):'<p class="vst">'+(LISTE?'Rien à valider. Profitez-en, ça ne durera pas.':'Chargement…')+'</p>';
 ['#badge'].forEach(function(s){var b=$(s);if(b){b.textContent=a.length;b.hidden=!a.length}});
 if(art.prenom){var hl=$('#hello');if(hl)hl.textContent='Bonjour '+art.prenom+'.';var ph=$('#phrase');if(ph)ph.textContent=a.length?(a.length===1?'Une demande attend votre validation. Le calcul est fait, il ne manque que votre œil.':a.length+' demandes attendent votre validation. Les calculs sont faits.'):'Aucune demande en attente : tout est à jour.'}
}
function charger(){if(!lsG(KJ))return;charge=Date.now();
 api('/espace/demandes').then(function(x){x._le=new Date().toISOString();LISTE=x;ETAPES=x.etapes||[];lsS(KL,x);rendre()},
  function(e){var c=lsG(KL);if(c){c._cache=true;LISTE=c;ETAPES=c.etapes||[]}rendre();var vd=$('#vd');if(vd&&lsG(KJ))vd.insertAdjacentHTML('afterbegin','<div class="verr" style="margin-bottom:10px">'+esc(e.message)+'</div>')})}

/* ---------- une demande ---------- */
function lignes(L,vide){return L&&L.length?L.map(function(l){return '<div class="vli'+(l.a_verifier?' vv':'')+'"><span>'+esc(l.libelle)+'</span><span class="x">'+eur(l.total)+'</span><small>'+qte(l.quantite)+' '+esc(l.unite)+' × '+eur(l.pu,4)+(l.a_verifier?' · ⚠ à vérifier':'')+'</small></div>'}).join(''):'<p class="vst">'+vide+'</p>'}
function liste(t,L,cl){return L&&L.length?'<div class="card vsec"><h3>'+t+'</h3><ul class="vul">'+L.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ul></div>':''}
var LIB={delai:'Délai',msg:'Message',budget:'Budget',message:'Message',objectif:'Objectif',aides:'Aides',disponibilites:'Disponibilités',visite:'Visite'};
var TRAV={cloison:'Cloison',doublage:'Doublage / isolation des murs',plafond:'Plafond',rampants:'Rampants',combles:'Combles',fenetres:'Fenêtres',portes:'Portes',sols:'Sols',autre:'Autre'};
function demandeHTML(D){if(!D)return '<div class="card vsec"><h3>Réponses du client</h3><p class="vst" style="padding:0">Le détail des réponses du formulaire n\'est pas encore rangé dans la fiche du client. Le pré-devis ci-dessus en tient déjà compte.</p></div>';
 var r=[];if(D.travaux&&D.travaux.length)r.push(['Travaux',D.travaux.map(function(t){return TRAV[t]||t}).join(', ')]);
 var lg=D.logement||{};var lo=[lg.type,[lg.cp,lg.commune].filter(Boolean).join(' '),Array.isArray(lg.ou)&&lg.ou.length?lg.ou.join(', '):null,lg.niveau!=null&&lg.niveau!==''?(+lg.niveau?'étage '+lg.niveau:'rez-de-chaussée'):null,lg.ascenseur?'ascenseur : '+lg.ascenseur:null].filter(Boolean).join(' · ');if(lo)r.push(['Logement',lo]);if(lg.age)r.push(['Plus de 2 ans',lg.age]);if(lg.occupe)r.push(['Habité pendant les travaux',lg.occupe]);
 var p=D.details&&D.details.plan;if(p){var np=0;(p.floors||[]).forEach(function(f){np+=(f.rooms||[]).length});r.push(['Plan dessiné',(np?np+' pièce'+(np>1?'s':'')+' · ':'')+(p.surface_totale_m2?qte(p.surface_totale_m2)+' m² au sol':'')]);if(p.aide_demandee)r.push(['⚠ Plan',p.aide_demandee])}
 var pj=D.projet||{};Object.keys(pj).forEach(function(k){var v=pj[k];if(v!==''&&v!=null&&typeof v!=='object')r.push([LIB[k]||k.charAt(0).toUpperCase()+k.slice(1).replace(/_/g,' '),String(v)])});
 var F=D.fichiers||{},ph=(F.photos_liens||[]).filter(okLien),pl=(F.plans_liens||[]).filter(okLien);
 if(!ph.length&&F.photos&&F.photos.length)r.push(['Photos',F.photos.length+' envoyée(s) avec la demande (pas rangées dans la fiche)']);
 var g='';if(p&&(p.floors||[]).some(function(f){return (f.pieces||[]).length}))g+='<button class="vbtn go" type="button" data-vplan style="width:100%;margin-top:12px">📐 Voir le plan dessiné par le client</button>';
 if(ph.length)g+='<h3 style="margin-top:12px">Photos du client ('+ph.length+')</h3><div class="vph">'+ph.map(function(x,i){return '<a href="'+esc(x.url)+'" target="_blank" rel="noopener"><img src="'+esc(x.url)+'" alt="Photo '+(i+1)+'" loading="lazy"></a>'}).join('')+'</div>';
 if(pl.length)g+='<h3 style="margin-top:12px">Plans joints ('+pl.length+')</h3><ul class="vul">'+pl.map(function(x,i){return '<li><a href="'+esc(x.url)+'" target="_blank" rel="noopener">'+(/\.pdf$/i.test(x.nom||'')?'📄':'🖼')+' Plan '+(i+1)+'</a></li>'}).join('')+'</ul>';
 return '<div class="card vsec"><h3>Réponses du client</h3><div class="vkv">'+r.map(function(x){return '<span>'+esc(x[0])+'</span><b>'+esc(x[1])+'</b>'}).join('')+'</div>'+g+'</div>'}
function okLien(x){return x&&typeof x.url==='string'&&/^https:\/\/[^\s"'<>]+$/.test(x.url)}
function ouvrirDemande(c){if(!c)return;
 if(!lsG(KJ)){apres=function(){ouvrirDemande(c)};connexion();return}
 ouvrir('Demande<small>Chargement…</small>','<p class="vst">Lecture de la fiche du client…</p>');
 api('/espace/demande?c='+encodeURIComponent(c)).then(function(x){afficher(x.demande)},function(e){if(!lsG(KJ))return;ouvrir('Demande<small>Impossible de l\'ouvrir</small>','<div class="verr">'+esc(e.message)+'</div>','<button class="vbtn" type="button" data-vfermer>Fermer</button><button class="vbtn go" type="button" data-vc="'+esc(c)+'">Réessayer</button>')})}
var COUR=null;
/* Plan dessiné par le client : le module Plan s'ouvre en mode artisan et reçoit le plan de la demande.
   Les retouches de l'artisan restent sur cet appareil (une sauvegarde par client). */
function voirPlan(){var D=COUR&&COUR.demande,P=D&&D.details&&D.details.plan;if(!P)return;var k=COUR.contact||{},nom=k.nom||'le client';
 ouvrir('📐 Plan de '+esc(nom)+'<small>Dessiné par le client avec sa demande · tailles à confirmer à la visite</small>','<iframe id="vplanf" title="Plan du client" style="flex:none;width:100%;height:calc(100vh - 150px);min-height:420px;border:0;border-radius:14px;background:var(--card)" src="plan.html?embed=1&attendre=1&v=4&chantier=c-'+encodeURIComponent(k.id||'')+'"></iframe>','<button class="vbtn" type="button" data-vretour>← Retour à la demande</button>');
 $('#vov-b').style.padding='8px';$('#vov-b').style.maxWidth='none';$('#vplanf').style.setProperty('height','calc(100vh - 150px)','important')}
addEventListener('message',function(e){var f=document.getElementById('vplanf');if(!f||e.source!==f.contentWindow)return;var d=e.data||{};
 if(d.type==='proclik-plan-ready'){var D=COUR&&COUR.demande,k=COUR&&COUR.contact||{};f.contentWindow.postMessage({type:'proclik-plan-load',plan:D&&D.details&&D.details.plan,prenom:k.prenom||''},'*')}});
/* Le pré-devis à valider, comme un devis qu'on travaille (Cyril, 31/10) : le total, le plan, les lignes modifiables d'un appui,
   « + Ajouter une ligne », puis un seul gros bouton en bas, en deux appuis. Plus de « Changer d'étape » : l'étape suit les validations.
   Les retouches restent sur cet appareil jusqu'à la création du devis, qui les envoie (mêmes taux de marge et de frais généraux). */
var ED=null;
function cleLg(){return 'pc-lg-'+(COUR&&COUR.contact&&COUR.contact.id||'')}
function edition(p){var s=lsG(cleLg());if(s&&s.le===p.le)return s;var c=function(L){return L.map(function(l){return {libelle:l.libelle,quantite:l.quantite,unite:l.unite,pu:l.pu,total:l.total,a_verifier:l.a_verifier}})};
 return {le:p.le,materiaux:c(p.materiaux),main_oeuvre:c(p.main_oeuvre),touche:0}}
function garderEd(){ED.touche=1;lsS(cleLg(),ED)}
/* Mêmes taux que le serveur (calcul/vosfactures.js, lignesDevis) : marge sur les matériaux, frais généraux sur tout */
function totauxEd(p){var t=p.totaux||{},s=function(L){return L.reduce(function(a,l){return a+(+l.total||0)},0)},sm0=s(p.materiaux),so0=s(p.main_oeuvre),tm=sm0>0&&t.marge?t.marge/sm0:0,b0=sm0*(1+tm)+so0+(t.deplacement||0),tf=b0>0&&t.frais_generaux?t.frais_generaux/b0:0;
 var sm=s(ED.materiaux),so=s(ED.main_oeuvre),mg=sm*tm,b=sm+mg+so+(t.deplacement||0),fg=b*tf,r=function(x){return Math.round(x*100)/100};
 return {materiaux:r(sm),marge:r(mg),main_oeuvre:r(so),deplacement:t.deplacement||0,frais_generaux:r(fg),total_ht:r(b+fg)}}
function lignesEd(cle,titre){var L=ED[cle];if(!L.length&&cle==='main_oeuvre')return '';
 return '<div class="card vsec"><h3>'+titre+'</h3>'+(L.length?L.map(function(l,i){return '<button type="button" class="vli vedit'+(l.a_verifier?' vv':'')+'" data-vlg="'+cle+'|'+i+'"><span>'+esc(l.libelle)+'</span><span class="x">'+eur(l.total)+' ›</span><small>'+qte(l.quantite)+' '+esc(l.unite)+' × '+eur(l.pu,4)+(l.a_verifier?' · ⚠ à vérifier':'')+'</small></button>'}).join(''):'<p class="vst">Aucune ligne.</p>')+'</div>'}
function afficher(d){COUR=d;var k=d.contact,p=d.pre_devis[0],o=d.opportunites[0],P=d.demande&&d.demande.details&&d.demande.details.plan;
 var h='<div class="card"><div class="vkv">'+(k.telephone?'<span>Téléphone</span><b><a href="tel:'+esc(k.telephone)+'">'+esc(k.telephone)+'</a></b>':'')+(k.email?'<span>E-mail</span><b style="word-break:break-all"><a href="mailto:'+esc(k.email)+'">'+esc(k.email)+'</a></b>':'')+
  '<span>Commune</span><b>'+esc([k.cp,k.ville].filter(Boolean).join(' ')||'non renseignée')+'</b><span>Reçue</span><b>'+esc(quand(k.cree_le)||'—')+'</b>'+(o?'<span>Où on en est</span><b>'+esc(o.etape)+'</b>':'')+'</div>'+
  '<div class="vbtns" style="margin-top:10px">'+(k.telephone?'<a class="vbtn sm" href="tel:'+esc(k.telephone)+'" style="text-decoration:none">📞 Appeler</a><a class="vbtn sm" href="sms:'+esc(k.telephone)+'" style="text-decoration:none">💬 SMS</a>':'')+(k.ville||k.cp?'<a class="vbtn sm" target="_blank" rel="noopener" style="text-decoration:none" href="https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent([k.adresse,k.cp,k.ville].filter(Boolean).join(' '))+'">Itinéraire</a>':'')+'</div></div>';
 if(!p){ED=null;h+='<div class="card"><b>Pas encore de pré-devis Cliky</b><p class="vst" style="padding:4px 0 0">La note « CLIKY – PRÉ-DEVIS À VALIDER » n\'est pas (encore) dans la fiche. Si la demande vient d\'arriver, patientez une minute et actualisez.</p></div>';}
 else if(!p.lue){ED=null;h+='<div class="card vsec"><h3>Pré-devis Cliky · '+esc(quand(p.le))+'</h3><p class="vst" style="padding:0 0 8px">Ancienne présentation : affichée telle quelle.</p><pre class="vpre">'+esc(p.texte)+'</pre></div>';}
 else{ED=edition(p);var t=totauxEd(p);
  h+='<div class="card vsec"><h3>Pré-devis Cliky · '+esc(quand(p.le))+(ED.touche?' · <span class="vp t">retouché par vous</span>':'')+'</h3>'+(p.resume?'<p style="margin:0 0 10px">'+esc(p.resume)+'</p>':'')+
   '<div class="vtot"><span class="big">Total HT</span><b class="big">'+eur(t.total_ht)+'</b><span>Matériaux (achat)</span><b>'+eur(t.materiaux)+'</b><span>'+esc((p.totaux||{}).marge_libelle||'Marge')+'</span><b>'+eur(t.marge)+'</b><span>Main-d\'œuvre</span><b>'+eur(t.main_oeuvre)+'</b><span>Déplacement</span><b>'+eur(t.deplacement)+'</b><span>'+esc((p.totaux||{}).frais_generaux_libelle||'Frais généraux')+'</span><b>'+eur(t.frais_generaux)+'</b></div>'+
   '<p class="vst" style="padding:6px 0 0">TVA non comprise : c\'est vous qui la fixez.</p></div>';
  if(P&&(P.floors||[]).some(function(f){return (f.pieces||[]).length}))h+='<button class="vbtn" type="button" data-vplan style="width:100%">📐 Voir le plan dessiné par le client</button>';
  h+=liste('⚠ À vérifier ('+p.a_verifier.length+')',p.a_verifier);
  h+=lignesEd('materiaux','Matériaux · prix d\'achat HT')+lignesEd('main_oeuvre','Main-d\'œuvre');
  h+='<button class="vbtn" type="button" data-vlg="+" style="width:100%">＋ Ajouter une ligne</button>';
  if(ED.touche)h+='<p class="vst" style="padding:6px 0 0">Vos retouches restent sur cet appareil jusqu\'à la création du devis. <a href="#" data-vlg="raz">Revenir au calcul de Cliky</a></p>';
  if(p.attente.length)h+='<div class="card vsec"><h3>En attente du devis fournisseur (0 €)</h3><ul class="vul">'+p.attente.map(function(a){return '<li>'+esc(a.libelle)+(a.quantite!=null?' × '+qte(a.quantite):'')+'</li>'}).join('')+'</ul></div>';
 }
 h+='<div class="card vsec" id="vdocs"><h3>Devis et factures</h3><p class="vst" style="padding:0">Chargement…</p></div>';
 h+='<details class="card vd"><summary>Les réponses du client</summary>'+demandeHTML(d.demande).replace(/<button class="vbtn go" type="button" data-vplan[^>]*>[^<]*<\/button>/,'')+'</details>';
 if(p&&p.lue){var plus=liste('Alertes',p.alertes)+liste('Hypothèses de Cliky',p.hypotheses)+(p.controles.length?'<div class="card vsec"><h3>Contrôles du calcul</h3><ul class="vul">'+p.controles.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ul></div>':'');
  if(plus)h+='<details class="card vd"><summary>Le détail du calcul de Cliky</summary>'+plus+'</details>'}
 if(d.pre_devis.length>1)h+='<details class="card vd"><summary>'+(d.pre_devis.length-1)+' pré-devis plus ancien'+(d.pre_devis.length>2?'s':'')+'</summary>'+d.pre_devis.slice(1).map(function(x){return '<p class="vst">'+esc(quand(x.le))+(x.totaux&&x.totaux.total_ht!=null?' · '+eur(x.totaux.total_ht)+' HT':'')+'</p><pre class="vpre">'+esc(x.texte)+'</pre>'}).join('')+'</details>';
 h+='<p class="vst" style="font-size:12.5px">🔒 Rien n\'est envoyé au client sans votre confirmation. Les montants viennent de votre base de prix.</p>';
 ouvrir(esc(k.nom)+'<small>'+esc([o&&o.titre,k.ville].filter(Boolean).join(' · '))+'</small>',h,'<button class="vbtn" type="button" data-vfermer>Fermer</button>');
 if(DOCC===k.id&&DOCS)rendreDocs();else chargerDocs(k.id);}
/* Une ligne : la changer, l'enlever (deux appuis), ou en ajouter une */
function ligneV(ref){var p=COUR&&COUR.pre_devis[0];if(!p||!ED)return;
 if(ref==='raz'){lsS(cleLg(),null);toastV('Calcul de Cliky remis','Vos retouches sont effacées.');return afficher(COUR)}
 var nv=ref==='+',c=nv?'main_oeuvre':ref.split('|')[0],i=nv?-1:+ref.split('|')[1],l=nv?{libelle:'',quantite:1,unite:'u',pu:0}:ED[c][i];if(!l)return;
 var h='<div class="card vform">'+(nv?'<label>C\'est<select id="vl-c"><option value="materiaux">Un matériau (prix d\'achat)</option><option value="main_oeuvre" selected>De la main-d\'œuvre</option></select></label>':'')+
  '<label>Ce qui est fait<textarea id="vl-l" rows="2">'+esc(l.libelle)+'</textarea></label>'+
  '<div class="vrow"><label>Quantité<input id="vl-q" inputmode="decimal" value="'+qte(l.quantite)+'"></label><label>Unité<input id="vl-u" value="'+esc(l.unite||'')+'"></label></div>'+
  '<label>Prix unitaire HT'+(c==='materiaux'&&!nv?' (achat)':'')+'<input id="vl-p" inputmode="decimal" value="'+(l.pu?String(Math.round(l.pu*10000)/10000).replace('.',','):'')+'" placeholder="0,00"></label>'+
  '<p class="vst" style="padding:0">Total de la ligne : <b id="vl-t">'+eur((+l.quantite||0)*(+l.pu||0))+'</b>. La marge et les frais généraux s\'ajoutent comme dans le calcul de Cliky.</p></div>';
 ouvrir((nv?'Ajouter une ligne':'Modifier la ligne')+'<small>'+esc(k0())+'</small>',h,'<button class="vbtn" type="button" data-vretour>‹ Retour</button>'+(nv?'':'<button class="vbtn" type="button" data-vlsup="'+c+'|'+i+'">Enlever</button>')+'<button class="vbtn go" type="button" data-vlok="'+(nv?'+':c+'|'+i)+'">Enregistrer</button>');
 ['#vl-q','#vl-p'].forEach(function(s){$(s).addEventListener('input',function(){$('#vl-t').textContent=eur(nb($('#vl-q').value)*nb($('#vl-p').value))})})}
function k0(){return COUR&&COUR.contact?COUR.contact.nom:''}
function nb(s){var n=parseFloat(String(s||'').replace(/\s/g,'').replace(',','.'));return isFinite(n)?n:0}
function ligneVok(ref){var lib=$('#vl-l').value.trim(),q=nb($('#vl-q').value),pu=nb($('#vl-p').value);
 if(!lib){toastV('Il manque la description','Une ligne suffit.');return $('#vl-l').focus()}
 if(!(q>0)||!(pu>0)){toastV('Il manque la quantité ou le prix','Hors taxes, en euros.');return}
 var l={libelle:lib,quantite:q,unite:$('#vl-u').value.trim(),pu:pu,total:Math.round(q*pu*100)/100};
 if(ref==='+')ED[$('#vl-c').value].push(l);else{var c=ref.split('|')[0],i=+ref.split('|')[1];ED[c][i]=l}
 garderEd();afficher(COUR);toastV(ref==='+'?'Ligne ajoutée':'Ligne modifiée',lib)}
function ligneVsup(b){if(!b.classList.contains('arme')){b.classList.add('arme');b.textContent='Oui, l\'enlever';return}
 var r=b.getAttribute('data-vlsup').split('|'),x=ED[r[0]].splice(+r[1],1)[0];garderEd();afficher(COUR);toastV('Ligne enlevée',x&&x.libelle)}
/* L'étape suit les validations : on range la demande dans l'étape qui porte le bon nom, si elle existe */
var AVANCE={creer:/devis.*(cr[ée]|pr[eê]t|à envoyer)/i,envoyer:/devis.*envoy/i,accepted:/(accept|gagn|sign)/i,rejected:/(refus|perdu)/i,paid:/(pay|termin)/i,acompte:/chantier/i};
function avancer(a){var d=COUR,o=d&&d.opportunites[0],re=AVANCE[a];if(!o||!re)return;var e=(d.etapes||ETAPES).filter(function(x){return re.test(x.nom)})[0];if(!e||e.id===o.etape_id)return;
 api('/espace/etape',{method:'POST',body:{opportunite:o.opportunite,etape:e.id}}).then(function(){o.etape=e.nom;o.etape_id=e.id;charger()},function(){})}
function etapes(){var d=COUR,o=d&&d.opportunites[0];if(!o)return;var L=d.etapes||ETAPES,i=L.findIndex(function(e){return e.id===o.etape_id});
 var h='<div class="card"><p style="margin:0 0 10px">La demande de <b>'+esc(d.contact.nom)+'</b> est à l\'étape <b>'+esc(o.etape||'—')+'</b>. Choisissez où la ranger :</p><div class="vl">'+
  L.map(function(e,j){var tag=e.id===o.etape_id?'actuelle':j===i+1?'suivante':'';return '<button class="vcard'+(j===i+1?' vav':'')+'" type="button" data-vset="'+esc(e.id)+'"'+(e.id===o.etape_id?' disabled':'')+'><div class="r"><b>'+esc(e.nom)+'</b><span class="vp'+(j===i+1?' t':'')+'"'+(tag?'':' hidden')+'>'+tag+'</span></div>'+(/envoy/i.test(e.nom)?'<small>⚠ Les relances automatiques au client partent de cette étape (e-mail après 3 jours).</small>':'')+'</button>'}).join('')+
  '</div></div><p class="vst">Le changement se voit tout de suite dans GHL et une ligne est ajoutée à la fiche du client. Vous pourrez revenir en arrière.</p>';
 ouvrir('Changer d\'étape<small>'+esc(d.contact.nom)+'</small>',h,'<button class="vbtn" type="button" data-vretour>‹ Retour</button>');}
function changer(id){var d=COUR,o=d&&d.opportunites[0],e=(d.etapes||ETAPES).filter(function(x){return x.id===id})[0];if(!o||!e)return;
 var b=document.querySelector('[data-vset="'+id+'"]');var bp=b&&b.querySelector('.vp');if(b){b.disabled=true;bp.hidden=false;bp.textContent='en cours…'}
 api('/espace/etape',{method:'POST',body:{opportunite:o.opportunite,etape:id}}).then(function(){o.etape=e.nom;o.etape_id=e.id;afficher(d);charger();toastV('Rangée dans « '+e.nom+' »',d.contact.nom)},function(err){if(b){b.disabled=false;bp.textContent='erreur'}toastV('Étape non changée',err.message)})}
function toastV(t,s){var tt=$('#tt'),ts=$('#ts'),to=$('#toast');if(!to)return;tt.textContent=t;ts.textContent=s||'';to.classList.add('on');clearTimeout(toastV.t);toastV.t=setTimeout(function(){to.classList.remove('on')},3400)}

/* ---------- devis et factures (VosFactures en coulisses, routes /espace/documents… du service) ---------- */
// Un seul gros bouton : l'étape suivante. Rien ne part chez le client sans une confirmation de l'artisan.
function pctDef(){var v=lsG('pc-acompte');return v!=null&&v>=0&&v<100?v:30}
var TYP={devis:'Devis',facture:'Facture',acompte:'Facture d\'acompte',solde:'Facture finale',avoir:'Avoir'},DOCS=null,DOCC=null,ARME='';
function pillDoc(d){var c=d.statut==='paid'||d.statut==='accepted'?'t':d.statut==='rejected'||d.statut==='issued'?'w':'';return '<span class="vp '+c+'">'+esc(d.statut_libelle||d.statut)+'</span>'}
function jourDoc(s){var m=/^(\d{4})-(\d\d)-(\d\d)/.exec(s||'');return m?m[3]+'/'+m[2]+'/'+m[1]:''}
function ligneDoc(d){return '<div class="vli"><span>'+esc(TYP[d.type]||d.type)+' n° '+esc(d.numero)+'</span><span class="x">'+eur(d.ht)+' HT</span><small>'+esc(jourDoc(d.date))+' · '+pillDoc(d)+' · <a href="#" style="color:inherit;font-weight:800" data-vdoc="pdf" data-id="'+d.id+'">📄 Voir le PDF</a></small></div>'}
function suite(L,pre){var dv=L.filter(function(d){return d.type==='devis'&&d.statut!=='rejected'})[0],F=L.filter(function(d){return d.type!=='devis'&&d.type!=='avoir'});
 var aEnv=F.filter(function(d){return d.statut==='issued'})[0],aPay=F.filter(function(d){return d.statut==='sent'||d.statut==='partial'})[0],solde=F.filter(function(d){return d.type==='solde'||d.type==='facture'})[0],ac=F.filter(function(d){return d.type==='acompte'})[0];
 if(!dv)return pre?{t:'Valider le pré-devis et créer le devis',a:'creer',s:'Le devis est créé dans vos documents. Il ne part pas chez le client tant que vous ne l\'envoyez pas.'}:null;
 if(dv.statut==='issued')return {t:'Envoyer le devis n° '+dv.numero+' au client',a:'envoyer',id:dv.id,s:'Vérifiez le PDF avant : le client le reçoit par e-mail.'};
 if(dv.statut==='sent')return {t:'Le client a accepté le devis',a:'accepted',id:dv.id,b:{t:'Refusé',a:'rejected',id:dv.id}};
 if(aEnv)return {t:'Envoyer la '+(TYP[aEnv.type]||'facture').toLowerCase()+' n° '+aEnv.numero,a:'envoyer',id:aEnv.id,s:'Vérifiez le PDF avant : le client la reçoit par e-mail.'};
 if(dv.statut==='accepted'&&!solde)return ac?{t:'Fin de chantier : créer la facture finale',a:'finale',id:dv.id,s:'L\'acompte déjà facturé est déduit tout seul.'}:{t:'Créer la facture d\'acompte',a:'acompte',id:dv.id,b:{t:'Pas d\'acompte : facture finale',a:'finale',id:dv.id}};
 if(aPay)return {t:'Facture n° '+aPay.numero+' payée',a:'paid',id:aPay.id};
 return null}
function rendreDocs(){var z=$('#vdocs');if(!z||!DOCS)return;var p=COUR&&COUR.pre_devis[0],n=suite(DOCS,p&&p.lue),h='<h3>Devis et factures</h3>';
 if(DOCS.some(function(d){return d.type==='devis'&&d.statut!=='rejected'})){$$('#vov-b [data-vlg]').forEach(function(b){if(b.tagName==='A'||b.getAttribute('data-vlg')==='+')b.remove();else{b.disabled=true;b.querySelector('.x').textContent=b.querySelector('.x').textContent.replace(' ›','')}});var rt=$('#vov-b .vp.t');if(rt)rt.textContent='devis créé'}
 if(!n){var f0=$('#vov-f');if(f0)f0.innerHTML='<button class="vbtn" type="button" data-vfermer>Fermer</button>'}
 if(n){var arm=ARME===n.a+(n.id||'');
  var C={creer:['Valider le pré-devis','Oui, créer le devis'],envoyer:['Envoyer au client','Oui, envoyer'],accepted:['Le client a accepté','Oui, accepté'],acompte:['Créer l\'acompte','Créer l\'acompte'],finale:['Créer la facture finale','Oui, la créer'],paid:['Marquer payée','Oui, payée']}[n.a]||[n.t,'Oui, '+n.t.charAt(0).toLowerCase()+n.t.slice(1)];
  var f=$('#vov-f');if(f){f.innerHTML='<button class="vbtn" type="button" '+(arm?'data-vdoc="annuler">Annuler':'data-vfermer>Fermer')+'</button><button class="vbtn go'+(arm?' varm':'')+'" type="button" data-vdoc="'+n.a+'" data-id="'+(n.id||'')+'">'+esc(arm?C[1]:C[0])+'</button>';f.hidden=false}
  if(!arm&&n.a!=='creer')h+='<p style="margin:0 0 6px;font-weight:700">'+esc(n.t)+'</p>';
  if(arm)h+='<p class="vst" style="padding:0 0 6px"><b>Touchez encore le bouton du bas pour confirmer'+(n.a==='envoyer'?' l\'envoi au client':'')+'.</b></p>';
  else if(n.s)h+='<p class="vst" style="padding:0 0 6px">'+esc(n.s)+'</p>';
  if(n.b)h+='<button class="vbtn sm" type="button" style="margin-bottom:8px" data-vdoc="'+n.b.a+'" data-id="'+n.b.id+'">'+esc(n.b.t)+'</button>';
  var champ='<div class="vli" style="align-items:center"><span>Acompte demandé<small style="display:block">0 = pas d\'acompte</small></span><span class="x"><input id="vpct" type="number" inputmode="decimal" min="0" max="99" value="'+pctDef()+'" style="width:70px;font:inherit;padding:6px;border-radius:8px;border:1px solid var(--line)"> %</span></div>';
  if(arm&&n.a==='accepted')h+=champ+'<p class="vst" style="padding:0 0 6px">La facture d\'acompte se crée toute seule. Elle ne part pas sans vous.</p>';
  if(ARME==='acompte'+n.id)h+=champ+'<button class="vbtn go sm" type="button" data-vdoc="acompte-ok" data-id="'+n.id+'">Créer l\'acompte</button>';
 }
 h+=DOCS.length?DOCS.map(ligneDoc).join(''):'<p class="vst" style="padding:0">Aucun devis ni facture pour ce client.</p>';
 z.innerHTML=h}
function chargerDocs(c){DOCC=c;DOCS=null;ARME='';var z=$('#vdocs');
 api('/espace/documents?c='+encodeURIComponent(c)).then(function(x){if(DOCC!==c)return;DOCS=x.documents||[];rendreDocs()},function(err){if(z)z.innerHTML='<h3>Devis et factures</h3><p class="vst" style="padding:0">'+esc(err.message)+'</p>'})}
function pdfDoc(id){var w=null;try{w=window.open('','_blank')}catch(e){}var j=lsG(KJ);
 fetch(SERVICE+'/espace/document/pdf?id='+encodeURIComponent(id),{headers:j?{Authorization:'Bearer '+j}:{}}).then(function(r){if(!r.ok)throw new Error('PDF indisponible ('+r.status+')');return r.blob()})
  .then(function(b){var u=URL.createObjectURL(b);if(w)w.location=u;else location.href=u},function(err){if(w)w.close();toastV('PDF non ouvert',err.message)})}
function actionDoc(a,id){var c=DOCC,k=COUR&&COUR.contact;if(!c)return;
 if(a==='annuler'){ARME='';return rendreDocs()}
 if(a==='pdf')return pdfDoc(id);
 if(a==='acompte'){ARME='acompte'+id;rendreDocs();var i=$('#vpct');if(i)i.focus();return}
 if((a==='envoyer'||a==='creer'||a==='accepted'||a==='rejected'||a==='paid'||a==='finale')&&ARME!==a+(id||'')){ARME=a+(id||'');return rendreDocs()}
 var p;
 var lg=ED&&ED.touche?{materiaux:ED.materiaux,main_oeuvre:ED.main_oeuvre}:undefined;
 if(a==='creer')p=api('/espace/devis',{method:'POST',body:{contact:c,lignes:lg}});
 else if(a==='forcer')p=api('/espace/devis',{method:'POST',body:{contact:c,forcer:true,lignes:lg}});
 else if(a==='envoyer')p=api('/espace/envoyer',{method:'POST',body:{id:+id}});
 else if(a==='finale')p=api('/espace/facture',{method:'POST',body:{devis:+id,type:'finale'}});
 else if(a==='acompte-ok'){var v=parseFloat(String(($('#vpct')||{}).value||'').replace(',','.'));if(!(v>0&&v<100)){toastV('Il manque le pourcentage','Par exemple celui écrit sur votre devis.');return}lsS('pc-acompte',v);p=api('/espace/facture',{method:'POST',body:{devis:+id,type:'acompte',pourcentage:v}})}
 else if(a==='accepted'){var w=parseFloat(String(($('#vpct')||{}).value||'').replace(',','.'));if(!(w>=0&&w<100)){toastV('Pourcentage d\'acompte illisible','Entre 0 et 99 %.');return}lsS('pc-acompte',w);p=api('/espace/statut',{method:'POST',body:{id:+id,statut:a,pourcentage:w}})}
 else p=api('/espace/statut',{method:'POST',body:{id:+id,statut:a}});
 ARME='';var z=$('#vdocs');if(z)z.querySelectorAll('button').forEach(function(b){b.disabled=true});
 p.then(function(x){toastV(a==='envoyer'?'Envoyé au client':x.deja?'Déjà fait':'C\'est fait',k?k.nom:'');if(a==='creer'||a==='forcer'){if(!x.deja)lsS(cleLg(),null);avancer('creer')}else if(a==='envoyer'){var dv=(DOCS||[]).filter(function(d){return d.id==id})[0];if(dv&&dv.type==='devis')avancer('envoyer')}else if(a==='paid'){var fp=(DOCS||[]).filter(function(d){return d.id==id})[0];avancer(fp&&fp.type==='acompte'?'acompte':'paid')}else avancer(a);chargerDocs(c);chargerFa()},
  function(err){if(a==='creer'&&/fournisseur/i.test(err.message)){var z2=$('#vdocs');rendreDocs();if(z2)z2.insertAdjacentHTML('beforeend','<p class="vst" style="padding:8px 0 0">⏳ '+esc(err.message)+'. <a href="#" data-vdoc="forcer">Créer le devis quand même</a></p>');return}toastV('Pas fait',err.message);rendreDocs()})}
// Onglet « Factures » : les vraies factures en haut (les devis ont leur onglet), l'exemple en dessous.
function chargerFa(){var v=$('#v-factures');if(!v)return;var z=$('#vfa');if(!z){z=document.createElement('div');z.id='vfa';z.className='card vsec';var b=v.querySelector('.vexemple');v.insertBefore(z,b?b.nextSibling:v.firstChild)}
 api('/espace/documents').then(function(x){var L=(x.documents||[]).filter(function(d){return d.type!=='devis'}),du=0;L.forEach(function(d){if(d.type!=='devis'&&d.type!=='avoir'&&d.statut!=='paid'&&d.ttc!=null)du+=d.ttc-(d.paye||0)});
  z.innerHTML='<h3>Vos vraies factures</h3>'+(L.length?'<p class="vst" style="padding:0 0 6px">Reste à encaisser : <b>'+eur(Math.round(du*100)/100)+' TTC</b></p>'+L.slice(0,30).map(function(d){return ligneDoc(d).replace('<span>','<span>'+esc(d.client)+' · ')}).join(''):'<p class="vst" style="padding:0">Pas encore de devis ni de facture. Ils se créent depuis la fiche d\'une demande.</p>')},
  function(err){z.innerHTML='<h3>Vos vraies factures</h3><p class="vst" style="padding:0">'+esc(/pas encore branché/i.test(err.message)?'Bientôt ici : vos vraies factures (branchement en cours).':err.message)+'</p>'})}

/* ---------- clics ---------- */
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-vc],[data-vfermer],[data-vetapes],[data-vset],[data-vretour],[data-vplan],[data-vrefresh],[data-vout],[data-vtab],[data-vlogin],[data-vdoc],[data-vseg],[data-vlg],[data-vlok],[data-vlsup]');if(!b)return;e.preventDefault();e.stopPropagation();
 if(b.hasAttribute('data-vc'))ouvrirDemande(b.getAttribute('data-vc'));
 else if(b.hasAttribute('data-vfermer'))fermer();
 else if(b.hasAttribute('data-vetapes'))etapes();
 else if(b.hasAttribute('data-vset'))changer(b.getAttribute('data-vset'));
 else if(b.hasAttribute('data-vretour'))afficher(COUR);
 else if(b.hasAttribute('data-vplan'))voirPlan();
 else if(b.hasAttribute('data-vrefresh'))charger();
 else if(b.hasAttribute('data-vout')){deconnecter(false)}
 else if(b.hasAttribute('data-vtab')){var t=$('#nb-devis')||$('#tt-devis');if(t)t.click()}
 else if(b.hasAttribute('data-vlogin'))connexion();
 else if(b.hasAttribute('data-vdoc'))actionDoc(b.getAttribute('data-vdoc'),b.getAttribute('data-id'));
 else if(b.hasAttribute('data-vseg')){VSEG=b.getAttribute('data-vseg');rendre();}
 else if(b.hasAttribute('data-vlg'))ligneV(b.getAttribute('data-vlg'));
 else if(b.hasAttribute('data-vlok'))ligneVok(b.getAttribute('data-vlok'));
 else if(b.hasAttribute('data-vlsup'))ligneVsup(b);
},true);

/* ---------- démarrage ---------- */
function bandeauExemple(sel,txt){var s=$(sel);if(!s||s.querySelector('.vexemple'))return;var d=document.createElement('div');d.className='vexemple';d.innerHTML=txt;s.insertBefore(d,s.firstChild)}
function demarrer(){var art=lsG(KA)||{};document.documentElement.classList.add('pcvrai');var vco=$('#vco');if(vco)vco.remove();
 var chip=$('.chip-demo');if(chip)chip.textContent='EN DIRECT';
 var br=$('.brand small');if(br&&art.entreprise)br.textContent='Devis & Chantiers · '+art.entreprise;
 var col=$('#v-devis .grid2 .col');if(col&&!$('#vd')){var v=document.createElement('div');v.id='vd';col.insertBefore(v,col.firstChild)}
 var td=$('#todo');if(td&&!$('#va')){var a=document.createElement('div');a.id='va';td.parentNode.insertBefore(a,td)}
 var ex='<b>Exemple de démonstration.</b> Ici rien n\'est encore branché : seules vos demandes (Accueil, Clients et Devis) sont réelles.';
 ['#v-planning','#v-chantiers','#v-prix'].forEach(function(s){bandeauExemple(s,ex)});
 bandeauExemple('#v-factures','<b>En dessous : exemple de démonstration.</b> Vos vrais devis et factures sont dans le premier cadre.');chargerFa();
 var ag=$('#v-accueil .agenda');if(ag&&!ag.previousElementSibling.classList.contains('vexemple')){var d=document.createElement('div');d.className='vexemple';d.innerHTML='<b>Agenda : exemple.</b> Le vrai planning arrive plus tard.';ag.parentNode.insertBefore(d,ag)}
 // Le message de démonstration « Nouvelle demande : Mme Durand » ne doit pas apparaître ici.
 setTimeout(function(){var t=$('#toast'),tt=$('#tt');if(t&&tt&&/Nouvelle demande de devis/.test(tt.textContent))t.classList.remove('on')},2200);
 var c=lsG(KL);if(c){c._cache=true;LISTE=c;ETAPES=c.etapes||[]}rendre();charger();}
function proposer(){if(!SERVICE)return;var ph=$('#phrase');if(!ph||$('#vco'))return;var d=document.createElement('div');d.className='vco';d.id='vco';
 d.innerHTML='<span><b>Mode démo.</b> Vous êtes l\'artisan ? Connectez-vous pour voir vos vraies demandes.</span><button class="vbtn go sm" type="button" data-vlogin>Se connecter</button>';ph.parentNode.insertBefore(d,ph.nextSibling)}
// Lien collé à la main : espaces, guillemets ou %20 autour de l'identifiant sont ignorés.
function lienDirect(){var h=location.hash;try{h=decodeURIComponent(h)}catch(e){}var m=/[#&]c=[\s"'<>]*([A-Za-z0-9_-]{6,64})/.exec(h);return m?m[1]:null}

if(!SERVICE){if(lienDirect())setTimeout(function(){ouvrir('Espace pas encore branché','<div class="card"><p style="margin:0">Ce lien ouvre une vraie demande, mais l\'adresse du service ProClik n\'est pas encore réglée dans l\'Espace. Prévenez Cyril : c\'est une ligne à ajouter.</p></div>','<button class="vbtn" type="button" data-vfermer>Fermer</button>')},1500);return}
if(lsG(KJ))demarrer();else proposer();
var c0=lienDirect();if(c0)setTimeout(function(){ouvrirDemande(c0)},lsG(KJ)?300:1500);
window.addEventListener('hashchange',function(){var c=lienDirect();if(c)ouvrirDemande(c)});
document.addEventListener('visibilitychange',function(){if(!document.hidden&&lsG(KJ)&&Date.now()-charge>60000)charger()});
})();
