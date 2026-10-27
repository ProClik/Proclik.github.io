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
'.vtot{display:grid;grid-template-columns:1fr auto;gap:4px 10px;font-size:14px}.vtot .big{font-size:18px;font-weight:800}',
'.vul{margin:0;padding-left:18px;display:grid;gap:4px;font-size:14px}',
'.vbtns{display:flex;gap:8px;flex-wrap:wrap}',
'.vpre{white-space:pre-wrap;font:13px/1.5 var(--mono);margin:0}',
'.vlog{display:grid;gap:10px}.vlog input{font:600 17px var(--f);padding:12px 14px;border-radius:12px;border:1.5px solid var(--line);background:var(--bg);color:var(--fg);width:100%}',
'.verr{color:var(--cor-ink);background:var(--cor-bg);border-radius:12px;padding:8px 12px;font-size:13.5px}.verr:empty{display:none}',
'.vfoot{display:flex;gap:8px;padding:10px 16px calc(10px + env(safe-area-inset-bottom,0px));border-top:1px solid var(--line);background:var(--card);flex-wrap:wrap}.vfoot .vbtn{flex:1 1 140px}',
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
function rendre(){var L=(LISTE&&LISTE.demandes)||[],a=L.filter(function(d){return valider(d.etape)}),o=L.filter(function(d){return !valider(d.etape)});
 var art=lsG(KA)||{},etat=LISTE?(LISTE._cache?'Hors connexion · liste du '+esc(quand(LISTE._le)):'À jour · '+esc(quand(LISTE._le))):'Chargement…';
 var h='<div class="vh"><h2>À valider</h2><span>'+etat+'</span></div>'+(a.length?'<div class="vl">'+a.map(carte).join('')+'</div>':'<p class="vst">'+(LISTE?'Rien à valider pour l\'instant. Le café peut rester chaud.':'…')+'</p>');
 if(o.length)h+='<div class="vh" style="margin-top:14px"><h2>Autres demandes en cours</h2><span>'+o.length+'</span></div><div class="vl">'+o.map(carte).join('')+'</div>';
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
 ouvrir('📐 Plan de '+esc(nom)+'<small>Dessiné par le client avec sa demande · tailles à confirmer à la visite</small>','<iframe id="vplanf" title="Plan du client" style="flex:none;width:100%;height:calc(100vh - 150px);min-height:420px;border:0;border-radius:14px;background:var(--card)" src="plan.html?embed=1&attendre=1&v=3&chantier=c-'+encodeURIComponent(k.id||'')+'"></iframe>','<button class="vbtn" type="button" data-vretour>← Retour à la demande</button>');
 $('#vov-b').style.padding='8px';$('#vov-b').style.maxWidth='none';$('#vplanf').style.setProperty('height','calc(100vh - 150px)','important')}
addEventListener('message',function(e){var f=document.getElementById('vplanf');if(!f||e.source!==f.contentWindow)return;var d=e.data||{};
 if(d.type==='proclik-plan-ready'){var D=COUR&&COUR.demande,k=COUR&&COUR.contact||{};f.contentWindow.postMessage({type:'proclik-plan-load',plan:D&&D.details&&D.details.plan,prenom:k.prenom||''},'*')}});
function afficher(d){COUR=d;var k=d.contact,p=d.pre_devis[0],o=d.opportunites[0],t=p&&p.totaux||{};
 var h='<div class="card"><div class="vkv">'+(k.telephone?'<span>Téléphone</span><b><a href="tel:'+esc(k.telephone)+'">'+esc(k.telephone)+'</a></b>':'')+(k.email?'<span>E-mail</span><b style="word-break:break-all"><a href="mailto:'+esc(k.email)+'">'+esc(k.email)+'</a></b>':'')+
  '<span>Commune</span><b>'+esc([k.cp,k.ville].filter(Boolean).join(' ')||'non renseignée')+'</b><span>Reçue</span><b>'+esc(quand(k.cree_le)||'—')+'</b>'+(o?'<span>Étape</span><b>'+esc(o.etape)+'</b>':'')+'</div>'+
  '<div class="vbtns" style="margin-top:10px">'+(k.telephone?'<a class="vbtn sm" href="tel:'+esc(k.telephone)+'" style="text-decoration:none">📞 Appeler</a><a class="vbtn sm" href="sms:'+esc(k.telephone)+'" style="text-decoration:none">💬 SMS</a>':'')+(k.ville||k.cp?'<a class="vbtn sm" target="_blank" rel="noopener" style="text-decoration:none" href="https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent([k.adresse,k.cp,k.ville].filter(Boolean).join(' '))+'">Itinéraire</a>':'')+'</div></div>';
 if(!p)h+='<div class="card"><b>Pas encore de pré-devis Cliky</b><p class="vst" style="padding:4px 0 0">La note « CLIKY – PRÉ-DEVIS À VALIDER » n\'est pas (encore) dans la fiche. Si la demande vient d\'arriver, patientez une minute et actualisez.</p></div>';
 else if(!p.lue)h+='<div class="card vsec"><h3>Pré-devis Cliky · '+esc(quand(p.le))+'</h3><p class="vst" style="padding:0 0 8px">Ancienne présentation : affichée telle quelle.</p><pre class="vpre">'+esc(p.texte)+'</pre></div>';
 else{
  h+='<div class="card vsec"><h3>Pré-devis Cliky · '+esc(quand(p.le))+'</h3>'+(p.resume?'<p style="margin:0 0 10px">'+esc(p.resume)+'</p>':'')+
   '<div class="vtot"><span>Matériaux (achat)</span><b>'+eur(t.materiaux)+'</b><span>'+esc(t.marge_libelle||'Marge')+'</span><b>'+eur(t.marge)+'</b><span>Main-d\'œuvre</span><b>'+eur(t.main_oeuvre)+'</b><span>Déplacement</span><b>'+eur(t.deplacement)+'</b><span>'+esc(t.frais_generaux_libelle||'Frais généraux')+'</span><b>'+eur(t.frais_generaux)+'</b><span class="big">Total HT</span><b class="big">'+eur(t.total_ht)+'</b></div>'+
   '<p class="vst" style="padding:6px 0 0">TVA non comprise : c\'est vous qui la fixez.</p></div>';
  h+=liste('⚠ À vérifier ('+p.a_verifier.length+')',p.a_verifier);
  h+='<div class="card vsec"><h3>Matériaux · prix d\'achat HT</h3>'+lignes(p.materiaux,'Aucun matériau.')+'</div>';
  if(p.main_oeuvre.length)h+='<div class="card vsec"><h3>Main-d\'œuvre</h3>'+lignes(p.main_oeuvre,'')+'</div>';
  if(p.attente.length)h+='<div class="card vsec"><h3>En attente du devis fournisseur (0 €)</h3><ul class="vul">'+p.attente.map(function(a){return '<li>'+esc(a.libelle)+(a.quantite!=null?' × '+qte(a.quantite):'')+'</li>'}).join('')+'</ul></div>';
  h+=liste('Alertes',p.alertes)+liste('Hypothèses de Cliky',p.hypotheses);
  if(p.controles.length)h+='<details class="card vd"><summary>Contrôles du calcul ('+p.controles.length+')</summary><ul class="vul" style="margin-top:8px">'+p.controles.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ul></details>';
 }
 h+=demandeHTML(d.demande);
 if(d.pre_devis.length>1)h+='<details class="card vd"><summary>'+(d.pre_devis.length-1)+' pré-devis plus ancien'+(d.pre_devis.length>2?'s':'')+'</summary>'+d.pre_devis.slice(1).map(function(x){return '<p class="vst">'+esc(quand(x.le))+(x.totaux&&x.totaux.total_ht!=null?' · '+eur(x.totaux.total_ht)+' HT':'')+'</p><pre class="vpre">'+esc(x.texte)+'</pre>'}).join('')+'</details>';
 h+='<p class="vst" style="font-size:12.5px">🔒 Rien n\'est envoyé au client depuis cet écran. Les montants viennent de votre base de prix ; le devis définitif se fait avec vous.</p>';
 var foot='<button class="vbtn" type="button" data-vfermer>Fermer</button>'+(o?'<button class="vbtn go" type="button" data-vetapes>Changer d\'étape…</button>':'');
 ouvrir(esc(k.nom)+'<small>'+esc([o&&o.titre,k.ville].filter(Boolean).join(' · '))+'</small>',h,foot);}
function etapes(){var d=COUR,o=d&&d.opportunites[0];if(!o)return;var L=d.etapes||ETAPES,i=L.findIndex(function(e){return e.id===o.etape_id});
 var h='<div class="card"><p style="margin:0 0 10px">La demande de <b>'+esc(d.contact.nom)+'</b> est à l\'étape <b>'+esc(o.etape||'—')+'</b>. Choisissez où la ranger :</p><div class="vl">'+
  L.map(function(e,j){var tag=e.id===o.etape_id?'actuelle':j===i+1?'suivante':'';return '<button class="vcard'+(j===i+1?' vav':'')+'" type="button" data-vset="'+esc(e.id)+'"'+(e.id===o.etape_id?' disabled':'')+'><div class="r"><b>'+esc(e.nom)+'</b><span class="vp'+(j===i+1?' t':'')+'"'+(tag?'':' hidden')+'>'+tag+'</span></div>'+(/envoy/i.test(e.nom)?'<small>⚠ Les relances automatiques au client partent de cette étape (e-mail après 3 jours).</small>':'')+'</button>'}).join('')+
  '</div></div><p class="vst">Le changement se voit tout de suite dans GHL et une ligne est ajoutée à la fiche du client. Vous pourrez revenir en arrière.</p>';
 ouvrir('Changer d\'étape<small>'+esc(d.contact.nom)+'</small>',h,'<button class="vbtn" type="button" data-vretour>‹ Retour</button>');}
function changer(id){var d=COUR,o=d&&d.opportunites[0],e=(d.etapes||ETAPES).filter(function(x){return x.id===id})[0];if(!o||!e)return;
 var b=document.querySelector('[data-vset="'+id+'"]');var bp=b&&b.querySelector('.vp');if(b){b.disabled=true;bp.hidden=false;bp.textContent='en cours…'}
 api('/espace/etape',{method:'POST',body:{opportunite:o.opportunite,etape:id}}).then(function(){o.etape=e.nom;o.etape_id=e.id;afficher(d);charger();toastV('Rangée dans « '+e.nom+' »',d.contact.nom)},function(err){if(b){b.disabled=false;bp.textContent='erreur'}toastV('Étape non changée',err.message)})}
function toastV(t,s){var tt=$('#tt'),ts=$('#ts'),to=$('#toast');if(!to)return;tt.textContent=t;ts.textContent=s||'';to.classList.add('on');clearTimeout(toastV.t);toastV.t=setTimeout(function(){to.classList.remove('on')},3400)}

/* ---------- clics ---------- */
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-vc],[data-vfermer],[data-vetapes],[data-vset],[data-vretour],[data-vplan],[data-vrefresh],[data-vout],[data-vtab],[data-vlogin]');if(!b)return;e.preventDefault();e.stopPropagation();
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
},true);

/* ---------- démarrage ---------- */
function bandeauExemple(sel,txt){var s=$(sel);if(!s||s.querySelector('.vexemple'))return;var d=document.createElement('div');d.className='vexemple';d.innerHTML=txt;s.insertBefore(d,s.firstChild)}
function demarrer(){var art=lsG(KA)||{};document.documentElement.classList.add('pcvrai');var vco=$('#vco');if(vco)vco.remove();
 var chip=$('.chip-demo');if(chip)chip.textContent='EN DIRECT';
 var br=$('.brand small');if(br&&art.entreprise)br.textContent='Devis & Chantiers · '+art.entreprise;
 var col=$('#v-devis .grid2 .col');if(col&&!$('#vd')){var v=document.createElement('div');v.id='vd';col.insertBefore(v,col.firstChild)}
 var td=$('#todo');if(td&&!$('#va')){var a=document.createElement('div');a.id='va';td.parentNode.insertBefore(a,td)}
 var ex='<b>Exemple de démonstration.</b> Ici rien n\'est encore branché : seules vos demandes (Accueil et Devis) sont réelles.';
 ['#v-planning','#v-chantiers','#v-prix'].forEach(function(s){bandeauExemple(s,ex)});
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
