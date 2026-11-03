/* Chantiers de l'Espace (demandes de Cyril du 2/11).
   Liste : « Créer un chantier » en premier, la vue d'ensemble, puis un menu « En cours » / « Tous les chantiers ».
   Dans un chantier : le résumé seul à l'ouverture, puis un menu à icônes qui ouvre une partie à la fois
   (Travaux, Finances, Fournitures, Plan, Notes, Photos, Client, Documents).
   Les factures (acompte, situation, solde) passent d'abord par une pré-facture qu'on vérifie, puis partent dans VosFactures :
   une facture ne se modifie plus une fois créée. Ici tout est en démonstration : rien n'est envoyé. */
(function(){
"use strict";
var X=window.PCX;if(!X)return;
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
var esc=X.esc,r2=X.r2,CH=X.CH,DOS=X.DOS;
var eur=function(n){n=r2(n||0);var s=Math.abs(n).toFixed(2).split('.');return (n<0?'− ':'')+s[0].replace(/\B(?=(\d{3})+(?!\d))/g,' ')+','+s[1]+' €'};
var num=function(s){var n=parseFloat(String(s==null?'':s).replace(/\s/g,'').replace(',','.'));return isFinite(n)?n:0};
var fr=function(n){return String(r2(n)).replace('.',',')};
var norm=function(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\s+/g,'')};
var jour=function(){return new Date().toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'numeric'})};
var maint=function(){var d=new Date();return jour()+' · '+d.getHours()+' h '+('0'+d.getMinutes()).slice(-2)};
var cliky=function(){return window.PCOPT&&PCOPT.cliky!=null?!!PCOPT.cliky:X.lsGet('pc-cliky',true)};
var en=function(){return X.online?X.online():true};
var attente=function(t){if(!en()&&X.attente)X.attente(t)};

/* ---------- icônes (même trait que le menu) ---------- */
var I=function(p){return '<svg viewBox="0 0 24 24" aria-hidden="true">'+p+'</svg>'};
var IC={
 trav:I('<path d="M3 20h18M6 20V10l6-4 6 4v10"/><path d="M9 14l2 2 4-4"/>'),
 fin:I('<circle cx="12" cy="12" r="8.5"/><path d="M14.8 9.2a3 3 0 0 0-5.1 1.3M9 13.5a3 3 0 0 0 5.4 1.2M7.5 11h5M7.5 13h4.5"/>'),
 four:I('<path d="M3 8l9-4 9 4-9 4z"/><path d="M3 8v8l9 4 9-4V8"/><path d="M12 12v8"/>'),
 plan:I('<path d="M4 4h16v16H4z"/><path d="M4 12h7v8M11 4v5M15 12h5"/>'),
 notes:I('<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 12h7M9 16h5"/>'),
 photo:I('<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>'),
 cli:I('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
 docs:I('<path d="M8 3h8l4 4v14H8z"/><path d="M16 3v4h4"/><path d="M4 7v14h12"/>'),
 tel:I('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>'),
 sms:I('<path d="M4 5h16v11H9l-5 4z"/>'),
 mail:I('<path d="M3 6h18v12H3z"/><path d="M3 7l9 6 9-6"/>'),
 route:I('<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h6a4 4 0 0 0 0-8h-4a4 4 0 0 1 0-8h6"/>'),
 plus:I('<path d="M12 5v14M5 12h14"/>'),
 crayon:I('<path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 6l3 3"/>'),
 cadenas:I('<rect x="5" y="11" width="14" height="9" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
 micro:I('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>'),
 fact:I('<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/>'),
 devis:I('<path d="M13 21H6V3h8l4 4v4"/><path d="M14 3v4h4M9 9h4M9 13h3"/><path d="M19.5 13.5l-5.5 5.5-.6 2.6 2.6-.6 5.5-5.5z"/>'),
 acompte:I('<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5V12h8.5"/>'),
 prod:I('<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>'),
 chantier:I('<path d="M3 20h18M6 20V10l6-4 6 4v10"/><path d="M10 20v-5h4v5"/>')};
var ONG=[['trav','Travaux'],['fin','Finances'],['four','Fournitures'],['plan','Plan'],['notes','Notes'],['photo','Photos'],['cli','Client'],['docs','Documents']];

/* ---------- état ---------- */
var vue=X.lsGet('pc-chv','cours');
var cur=null,ong=null,edit=null,prevenir=null;
var saveCH=function(){X.saveCH()};
function avc(c){return X.avc?X.avc(c):0}
function cfin(c){return X.cfin(c)}
function etat(c){return c.st==='run'?['En cours','ok']:c.st==='start'?['À démarrer','todo']:['Terminé','grey']}
function dos(c){return c.dos&&DOS[c.dos]}
function lignesDevis(c){if(c.L&&c.L.length)return c.L;var d=c.dv&&X.find(c.dv);if(d&&d.L)return d.L;return c.fin.ht?[{d:c.t,u:'forfait',q:1,p:c.fin.ht}]:[]}
var PIECES={alpes:['Salle d\'attente','Accueil','Couloir'],lopez:['Salle de bain','Couloir'],perrin:['Combles'],rey:['Fournil']};
function pieces(c){var L=[];(PIECES[c.id]||[]).concat(c.pieces||[]).forEach(function(p){if(p&&L.indexOf(p)<0)L.push(p)});
 lignesDevis(c).forEach(function(l){if(l.pc&&L.indexOf(l.pc)<0)L.push(l.pc)});return L}
function aPrevoir(c){return ((c.four||[]).concat(c.extra||[])).filter(function(x){return x[2]==='à prévoir'}).length}
function liv(c){return window.PCPLAN&&PCPLAN.livraisons?PCPLAN.livraisons(c.id):[]}

/* ---------- la liste ---------- */
function liste(){cur=null;ong=null;if(X.setCurCh)X.setCurCh(null);
 var L=Object.keys(CH).map(function(k){return CH[k]}),act=L.filter(function(c){return c.st!=='done'});
 var sumT=0,sumR=0,sumA=0;act.forEach(function(c){var f=cfin(c);sumT+=f.ttc;sumR+=f.rest;sumA+=avc(c)});
 var V=vue==='tous'?L:act;
 var h='<div class="cf ch-top">'+
  '<button type="button" class="btn go cf-go ch-go" id="ch-new"><span class="lab"><span class="ic">'+IC.plus+'</span><span>Créer un chantier</span></span></button>'+
  '<div class="sec-h" style="margin:0"><h2>Vue d\'ensemble</h2><button class="hint" style="font-weight:700;color:var(--accx)" id="ch-map">Voir sur la carte ›</button></div>'+
  '<div class="kpis"><div class="kpi"><small>Chantiers en cours</small><b>'+act.length+'</b></div><div class="kpi"><small>Avancement moyen</small><b>'+(act.length?Math.round(sumA/act.length):0)+' %</b></div><div class="kpi"><small>Signé TTC</small><b>'+eur(sumT)+'</b></div><div class="kpi"><small>Reste à encaisser</small><b>'+eur(sumR)+'</b></div></div>'+
  '<div class="seg cf-seg dv-seg ch-seg" role="tablist" aria-label="Quels chantiers">'+[['cours','En cours',IC.chantier,act.length],['tous','Tous les chantiers',IC.docs,0]].map(function(x){return '<button role="tab" data-chv="'+x[0]+'" aria-selected="'+(vue===x[0])+'">'+x[2]+'<span>'+x[1]+'</span>'+(x[3]?'<i>'+x[3]+'</i>':'')+'</button>'}).join('')+'</div>'+
  '<div class="col" style="gap:10px">'+(V.length?V.map(function(c){var a=avc(c),e=etat(c);return '<button class="chrow" data-showch="'+c.id+'"><span class="ring" style="--p:'+a+'"><span>'+a+'%</span></span><span class="tx"><b>'+esc(c.n)+' · '+esc(c.v)+'</b><small>'+esc(c.t)+'</small><small>'+esc(c.dates||'dates à fixer')+'</small></span><span class="pill '+e[1]+'">'+e[0]+'</span></button>'}).join(''):'<p class="hint">Aucun chantier en cours. Touchez « Créer un chantier » pour en ajouter un.</p>')+'</div></div>';
 $('#chx').innerHTML=h;
 $('#ch-map').addEventListener('click',function(){X.go('planning');var s=$('#seg-carte');if(s)s.click();});
 $('#ch-new').addEventListener('click',function(){nouveau()});
 $$('#chx [data-chv]').forEach(function(b){b.addEventListener('click',function(){vue=b.dataset.chv;X.lsSet('pc-chv',vue);liste();})});
 $$('#chx [data-showch]').forEach(function(b){b.addEventListener('click',function(){ouvrir(b.dataset.showch)})});}

/* ---------- un chantier ---------- */
function ouvrir(id,o){var c=CH[id];if(!c)return;if(cur!==id){edit=null;prevenir=null;}cur=id;ong=o||null;if(X.setCurCh)X.setCurCh(id);
 var e=etat(c),bad={four:aPrevoir(c),trav:c.st==='run'&&!c.pointSent?1:0};
 var h='<div class="cf"><button class="xback" id="ch-back">‹ Tous les chantiers</button><div class="sec-h"><h2 style="font-size:20px">'+esc(c.n)+' · '+esc(c.v)+'</h2><span class="pill '+e[1]+'">'+e[0]+'</span></div><p class="lead" style="font-size:13.5px;margin-bottom:12px">'+esc(c.t)+' · '+esc(c.dates||'dates à fixer')+'</p>'+
  '<div class="seg ch-menu" role="tablist" aria-label="Parties du chantier">'+ONG.map(function(x){return '<button role="tab" data-ong="'+x[0]+'" aria-selected="'+(ong===x[0])+'">'+IC[x[0]]+'<span>'+x[1]+'</span>'+(bad[x[0]]?'<i>'+bad[x[0]]+'</i>':'')+'</button>'}).join('')+'</div>'+
  '<div class="ch-pane" id="ch-pane">'+(ong?'<button class="ch-back2" id="ch-res">‹ Résumé du chantier</button>'+partie(c,ong):resume(c))+'</div></div>';
 $('#chx').innerHTML=h;window.scrollTo(0,0);
 $('#ch-back').addEventListener('click',function(){liste()});
 var rb=$('#ch-res');if(rb)rb.addEventListener('click',function(){ouvrir(id)});
 $$('#chx [data-ong]').forEach(function(b){b.addEventListener('click',function(){ouvrir(id,ong===b.dataset.ong?null:b.dataset.ong)})});
 lier(c);}
function recharger(o,sel){ouvrir(cur,o===undefined?ong:o);if(sel){var t=$(sel);if(t)t.scrollIntoView({block:'center'})}}

/* Le résumé : l'essentiel, ce qu'il reste à faire, le client */
function resume(c){var a=avc(c),f=cfin(c),o=dos(c),reel=(c.reel||[]).reduce(function(s,r){return s+num(r[1])},0);
 var T=[];var n=aPrevoir(c);if(n)T.push(['four',n,'Fourniture'+(n>1?'s':'')+' à prévoir']);
 if(c.st==='run'&&!c.pointSent)T.push(['trav','1','Point du jour à envoyer au client']);
 if(!c.fin.ht)T.push(['docs','+','Créer le devis de ce chantier']);
 else if(!c.fin.ac&&!(c.docs||[]).some(function(d){return d.ty==='ac'}))T.push(['fin','€','Facture d\'acompte à préparer']);
 if(a>=100&&f.rest&&!c.soldeCree)T.push(['fin','€','Facture de solde à préparer']);
 var Lv=liv(c).filter(function(x){return !x.passe});if(Lv.length)T.push(['four',Lv.length,'Livraison'+(Lv.length>1?'s':'')+' prévue'+(Lv.length>1?'s':'')+' · '+Lv[0].quand]);
 var suite=c.st==='done'?'Chantier terminé.':a>=100?'Travaux finis : la facture de solde peut partir.':c.ouv.filter(function(x){return x[2]<100})[0];
 return '<div class="card ch-res"><span class="ring" style="--p:'+a+'"><span>'+a+'%</span></span><span class="tx"><b>Avancement</b><small>'+(typeof suite==='string'?suite:'En ce moment : '+esc(suite[0]).toLowerCase()+' ('+suite[2]+'\u00a0%)')+'</small></span></div>'+
  (c.fin.ht?'<div class="card"><div class="bar2"><span>Encaissé</span><div class="prog f"><i style="width:'+(f.ttc?Math.round((f.ttc-f.rest)/f.ttc*100):0)+'%"></i></div><b>'+eur(f.ttc-f.rest)+'</b><span>Achats</span><div class="prog f"><i style="width:'+(c.prev?Math.min(100,Math.round(reel/c.prev*100)):0)+'%"></i></div><b>'+eur(reel)+(c.prev?' / '+eur(c.prev):'')+'</b></div></div>':'')+
  (T.length?'<div><div class="sec-h"><h2>À faire</h2><span>touchez pour y aller</span></div><div class="ch-afaire">'+T.map(function(t){return '<button type="button" data-aller="'+t[0]+'"><span class="n">'+t[1]+'</span><span class="tx">'+esc(t[2])+'</span><span class="go">›</span></button>'}).join('')+'</div></div>':'')+
  cliCard(c,o,true);}
function cliCard(c,o,court){if(!o)return '<div class="card"><b>Client</b><p class="hint" style="margin-top:6px">Chantier importé avant ProClik : pas de fiche client.</p></div>';
 var adr=o.adr||o.v||'';
 return '<div class="card"><div class="ch-cli"><b>'+esc(o.prenom?o.prenom+' '+(o.nom||o.n):o.contact||o.n)+'</b>'+(o.contact&&!o.prenom?'<span>'+esc(o.n)+'</span>':'')+'<span>'+esc(adr)+'</span>'+(court?'':'<span>'+esc(o.tel||'')+(o.mail?' · '+esc(o.mail):'')+'</span>')+'</div>'+
  '<div class="ch-acts">'+[['tel','Appeler',IC.tel],['sms','SMS',IC.sms],['mail','E-mail',IC.mail],['route','Itinéraire',IC.route]].map(function(x){return '<button type="button" data-cact="'+x[0]+'"><span class="r">'+x[2]+'</span>'+x[1]+'</button>'}).join('')+'</div>'+
  (court?'':'<button class="btn" style="width:100%;margin-top:14px" data-chdos="'+c.dos+'">Ouvrir le dossier complet</button>')+'</div>';}

function partie(c,o){
 if(o==='trav')return travaux(c);
 if(o==='fin')return finances(c);
 if(o==='four')return (X.fourHTML?X.fourHTML(c)+achats(c)+'</div>':'')+(window.PCPLAN&&PCPLAN.livHTML?PCPLAN.livHTML(c):'');
 if(o==='plan')return window.pcPlanCard?window.pcPlanCard(c):'<div class="card"><p class="hint">Pas de plan pour ce chantier.</p></div>';
 if(o==='notes')return notes(c);
 if(o==='photo')return photos(c);
 if(o==='cli')return cliCard(c,dos(c),false);
 if(o==='docs')return documents(c);
 return '';}

/* ---------- Travaux : avancement, avancement par ouvrage modifiable, point client, avis Google ---------- */
function travaux(c){var a=avc(c),run=c.st!=='done';
 var h='<div class="card" id="ch-trav"><div class="row"><b>Avancement</b><b>'+a+' %</b></div><div class="prog" style="margin-top:10px"><i style="width:'+a+'%"></i></div></div>'+
 '<div class="card"><div class="row" style="margin-bottom:4px"><b>Avancement par ouvrage</b><small style="color:var(--muted)">pondéré</small></div><div class="ch-ouv">'+c.ouv.map(function(x,i){
  var ed=edit&&edit.i===i;
  return '<div class="ch-o"><span class="nm">'+esc(x[0])+' <small>'+x[1]+' % du chantier</small></span><span class="pc">'+(ed?edit.v:x[2])+' %</span>'+(!ed&&run?'<span class="bt">'+(x[3]?'<button type="button" class="ch-lock" data-odeb="'+i+'" title="Ligne validée" aria-label="Ligne validée, toucher deux fois pour débloquer">'+IC.cadenas+'<span>Validée</span></button>':'<button type="button" class="btn sm" data-omod="'+i+'">'+IC.crayon+'Modifier</button>')+'</span>':'<span></span>')+'<div class="prog"><i style="width:'+(ed?edit.v:x[2])+'%"></i></div>'+
   (ed?'<div class="ch-ed"><div class="v"><button type="button" class="btn" data-ev="-5" aria-label="Moins 5 %">−</button><b>'+edit.v+' %</b><button type="button" class="btn" data-ev="5" aria-label="Plus 5 %">+</button></div>'+
     '<input type="range" min="0" max="100" step="5" value="'+edit.v+'" id="ch-rg" aria-label="Avancement de la ligne">'+
     '<div class="q">'+[0,25,50,75,100].map(function(v){return '<button type="button" class="btn" data-eq="'+v+'" aria-pressed="'+(edit.v===v)+'">'+v+' %</button>'}).join('')+'</div>'+
     '<div class="ok"><button type="button" class="btn" id="ch-eno">Annuler</button><button type="button" class="btn go" id="ch-eok">Valider</button></div></div>':
    '')+'</div>'}).join('')+'</div>'+
  (run?'<p class="hint" style="margin-top:8px">Touchez « Modifier », réglez le pourcentage, puis « Valider » : la ligne se bloque pour ne pas la changer par erreur. Pour la rouvrir, touchez deux fois « Validée ».</p>':'')+'</div>';
 if(prevenir!=null)h+='<div class="card ch-prev" id="ch-prev"><b>Prévenir le client ?</b><span class="hint">Avancement passé à '+a+' %. Un point du jour est prêt avec ce changement.</span><div class="ok"><button type="button" class="btn" id="ch-pno">Non, pas cette fois</button><button type="button" class="btn go" id="ch-poui">Oui, préparer le message</button></div></div>';
 if(run)h+=pointCard(c);
 h+=avisCard(c);
 return h;}
function salut(o){if(!o)return 'Bonjour,';var n=o.prenom?(o.civ?o.civ+' ':'')+o.nom:(o.contact||o.n||'').split(',')[0];return 'Bonjour '+n.replace(/^(SCI|SARL|SAS|Cabinet|Boulangerie)\s.*/,'').trim()+','}
function pointTexte(c){var o=dos(c),fait=c.ouv.filter(function(x){return x[2]>=100}).map(function(x){return x[0].toLowerCase()}),enc=c.ouv.filter(function(x){return x[2]>0&&x[2]<100}),apres=c.ouv.filter(function(x){return x[2]===0})[0];
 var t=salut(o).replace(/ ,$/,',')+'\n\nPoint du jour sur votre chantier : '+avc(c)+' % des travaux sont faits.';
 if(fait.length)t+='\nTerminé : '+fait.join(', ')+'.';
 if(enc.length)t+='\nEn cours : '+enc.map(function(x){return x[0].toLowerCase()+' ('+x[2]+' %)'}).join(', ')+'.';
 if(apres)t+='\nEnsuite : '+apres[0].toLowerCase()+'.';
 return t+'\n\nBonne soirée,\nJulien · Dupont Rénovation';}
function pointCard(c){var txt=c.pointTxt||pointTexte(c);
 return '<div class="card" id="ch-pt"><div class="row" style="margin-bottom:8px"><b>Point du jour pour le client</b>'+(c.pointSent?'<span class="pill ok">Envoyé</span>':'<span class="pill todo">À valider</span>')+'</div>'+
  '<textarea class="ch-sms" id="ch-ptt" aria-label="Message au client">'+esc(txt)+'</textarea>'+
  '<p class="hint" style="margin:8px 0">Écrit à partir de l\'avancement. Vous le relisez et le changez avant l\'envoi.</p>'+
  '<div class="row" style="gap:8px"><button class="btn" style="flex:1" id="ch-ptr">Refaire</button><button class="btn go" style="flex:1" id="ch-pts">'+(c.pointSent?'Renvoyer':'Envoyer le SMS')+'</button></div></div>';}
var QUAND=[['jour','Le jour de la facture finale'],['lendemain','Le lendemain (conseillé)'],['3j','3 jours après']];
function avisCard(c){var a=c.avis||(c.avis={on:true,quand:'lendemain'});
 return '<div class="card" id="ch-avis">'+(window.PCTAG?PCTAG('avis'):'')+'<div class="ch-sw"><span>Demander un avis Google<small>Part tout seul quand la facture finale est envoyée.</small></span><button type="button" class="ch-tg" role="switch" aria-checked="'+!!a.on+'" id="ch-avt" aria-label="Demander un avis Google"></button></div>'+
  (a.on?'<div class="ch-quand">'+QUAND.map(function(q){return '<button type="button" class="btn" data-avq="'+q[0]+'" aria-pressed="'+(a.quand===q[0])+'">'+q[1]+'</button>'}).join('')+'</div>':'')+
  (c.st==='done'?'<p class="hint" style="margin-top:8px">'+(a.on?'Chantier terminé : demande d\'avis envoyée après la facture finale.':'Pas de demande d\'avis pour ce chantier.')+'</p>':'')+'</div>';}

/* ---------- Finances : pré-factures à vérifier avant VosFactures ---------- */
function finances(c){var f=cfin(c),a=avc(c),D2=c.docs||[];
 var acF=D2.some(function(d){return d.ty==='ac'}),soF=c.soldeCree||D2.some(function(d){return d.ty==='solde'});
 var h='<div class="card" id="ch-fin"><div class="row" style="margin-bottom:8px"><b>Finances</b><span class="pill '+(c.fin.ac?'ok':'warn')+'">'+(!c.fin.ht?'Pas encore de devis':!c.fin.ac?'Acompte à recevoir':f.rest?'Acompte reçu':'Payé')+'</span></div><div class="fin"><span>Devis signé (HT)</span><b>'+eur(c.fin.ht)+'</b><span>TVA '+fr(c.fin.tva)+' %</span><b>'+eur(f.tv)+'</b><span>Total TTC</span><b>'+eur(f.ttc)+'</b><span>Acompte reçu</span><b>− '+eur(c.fin.ac)+'</b>'+(c.fin.paid?'<span>Solde réglé</span><b>− '+eur(f.ttc-c.fin.ac)+'</b>':'')+'<span>Reste à encaisser</span><b>'+eur(f.rest)+'</b></div>';
 if(c.fin.ht&&f.rest)h+='<div class="col cf-in" style="gap:10px">'+
  (!c.fin.ac&&!acF?'<button class="btn go" style="width:100%" data-pf="ac">Préparer la facture d\'acompte</button>':'')+
  (a>0&&a<100&&!soF?'<button class="btn" style="width:100%" data-pf="sit">Préparer une facture de situation ('+a+' %)</button>':'')+
  (!soF?'<button class="btn'+(a>=100?' go':'')+'" style="width:100%" data-pf="solde">Préparer la facture de solde</button>':'<p class="hint">Facture de solde créée : elle est dans Documents et dans Factures.</p>')+
  '<p class="hint">Vous voyez d\'abord une pré-facture : vous enlevez ou ajoutez des lignes, vous vérifiez, puis vous validez. Une facture ne se modifie plus une fois créée.</p></div>';
 h+='</div>';
 if(c.fact&&X.coutHTML)h+='<div class="card" id="ch-cout"><div class="row" style="margin-bottom:8px"><b>Coût réel du chantier</b><span class="pill '+(c.closed?'ok':'warn')+'">'+(c.closed?'Définitif':'En cours')+'</span></div>'+X.coutHTML(c)+'</div>';
 return h;}
function achats(c){if(!c.prev)return '';var reel=(c.reel||[]).reduce(function(s,r){return s+num(r[1])},0);
 return '<div style="margin-top:14px"><b style="font-size:14px">Achats réels face au prévu</b><div class="cmp" style="margin-top:6px">'+(c.reel||[]).map(function(r){return '<span>'+esc(r[0])+'</span><b>'+esc(r[1])+' €</b><span></span>'}).join('')+'<span><b style="color:var(--fg)">Total réel</b></span><b>'+eur(reel)+'</b><span class="delta '+(reel<=c.prev?'ok':'')+'">'+(reel<=c.prev?'−':'+')+eur(Math.abs(reel-c.prev))+'</span><span>Prévu au devis</span><b>'+eur(c.prev)+'</b><span></span></div></div>';}

var TYD={pre:'Pré-devis',devis:'Devis',ac:'Facture d\'acompte',sit:'Facture de situation',solde:'Facture de solde',fact:'Facture'};
var PF=null;
function preFacture(c,ty,doc){var a=avc(c),L0=lignesDevis(c),tva=c.fin.tva||10,acHT=r2((c.fin.ac||0)/(1+tva/100)),L=[],ded=[];
 if(doc){L=doc.L.map(function(l){return Object.assign({},l)});ded=(doc.ded||[]).slice();tva=doc.tva}
 else if(ty==='ac')L=[{d:'Acompte de 30 % sur le devis '+(c.dv||'')+' · '+c.t,u:'forfait',q:1,p:r2(c.fin.ht*.3)}];
 else if(ty==='sit'){var deja=(c.docs||[]).filter(function(d){return d.ty==='sit'}).reduce(function(s,d){return s+d.ht},0);
  L=L0.map(function(l){return {d:l.d+' · '+a+' % réalisé',u:l.u,q:r2(l.q*a/100),p:l.p}});if(deja)ded.push(['Situations déjà facturées',-deja]);}
 else if(ty==='solde'){L=L0.map(function(l){return {d:l.d,u:l.u,q:l.q,p:l.p}});if(acHT)ded.push(['Acompte déjà versé (HT)',-acHT]);
  var sits=(c.docs||[]).filter(function(d){return d.ty==='sit'}).reduce(function(s,d){return s+d.ht},0);if(sits)ded.push(['Situations déjà facturées',-sits]);}
 else if(ty==='devis'||ty==='pre')L=L0.length?L0.map(function(l){return {d:l.d,u:l.u,q:l.q,p:l.p}}):[];
 PF={c:c.id,ty:ty,L:L,ded:ded,tva:tva,doc:doc?doc.id:null,arm:false};pfOuvrir();}
function pfTot(){var ht=0;PF.L.forEach(function(l){ht+=r2(num(l.q)*num(l.p))});PF.ded.forEach(function(d){ht+=d[1]});ht=r2(ht);var tv=r2(ht*PF.tva/100);return{ht:ht,tv:tv,ttc:r2(ht+tv)}}
function pfHTML(){var t=pfTot(),fac=PF.ty!=='pre'&&PF.ty!=='devis';
 return '<div class="pf-warn">'+(fac?'Pré-facture à vérifier. Une fois validée, elle part dans VosFactures et ne se modifie plus.':PF.ty==='pre'?'Brouillon : vous pouvez y revenir quand vous voulez.':'Le devis part dans VosFactures une fois validé.')+'</div>'+
  '<div class="card"><div class="pf-l">'+(PF.L.length?PF.L.map(function(l,i){return '<div class="pf-li"><textarea data-pfd="'+i+'" aria-label="Désignation">'+esc(l.d)+'</textarea><div class="pf-nb"><label>Quantité ('+esc(l.u||'u')+')<input inputmode="decimal" data-pfq="'+i+'" value="'+fr(l.q)+'"></label><label>Prix HT<input inputmode="decimal" data-pfp="'+i+'" value="'+fr(l.p)+'"></label><div class="tt"><small>Total HT</small>'+eur(num(l.q)*num(l.p))+'</div></div><button type="button" class="x" data-pfx="'+i+'">Enlever la ligne</button></div>'}).join(''):'<p class="hint">Aucune ligne. Ajoutez-en une ci-dessous.</p>')+
  PF.ded.map(function(d,i){return '<div class="pf-li ded"><span>'+esc(d[0])+'</span><span class="tt">'+eur(d[1])+'</span><button type="button" class="x" data-pfdx="'+i+'">Enlever</button></div>'}).join('')+'</div>'+
  '<div class="chs-wrap" style="margin-top:10px"><form class="addline" id="pf-add"><input id="pf-a" autocomplete="off" placeholder="+ Ajouter une ligne" aria-label="Ajouter une ligne"><button class="btn sm go">Ajouter</button></form><div class="chs-sug" id="pf-sug" hidden></div></div></div>'+
  '<div class="card pf-tot"><span>Total HT</span><b>'+eur(t.ht)+'</b><span>TVA '+fr(PF.tva)+' %</span><b>'+eur(t.tv)+'</b><span class="ttc">Total TTC</span><b class="ttc">'+eur(t.ttc)+'</b></div>';}
function pfOuvrir(){var c=CH[PF.c],titre={pre:'Pré-devis',devis:'Devis',ac:'Pré-facture d\'acompte',sit:'Pré-facture de situation',solde:'Pré-facture de solde'}[PF.ty]+' · à vérifier';
 X.xopen(titre,c.n+' · '+c.t,'<div class="col" style="gap:12px" id="pf">'+pfHTML()+'</div>',
  '<button class="btn" data-xclose>Annuler</button><button class="btn go" id="pf-ok">'+(PF.ty==='pre'?'Enregistrer le brouillon':PF.ty==='devis'?'Valider le devis':'Valider et créer la facture')+'</button>',function(){pfLier();$('#pf-ok').addEventListener('click',pfValider)});}
function pfMaj(){var p=$('#pf');if(!p)return;var y=p.closest('.sheet-in');var s=y?y.scrollTop:0;p.innerHTML=pfHTML();pfLier();if(y)y.scrollTop=s;}
function pfLier(){
 $$('#pf [data-pfd]').forEach(function(x){x.addEventListener('input',function(){PF.L[+x.dataset.pfd].d=x.value})});
 $$('#pf [data-pfq],#pf [data-pfp]').forEach(function(x){x.addEventListener('change',function(){var i=+(x.dataset.pfq||x.dataset.pfp);PF.L[i][x.dataset.pfq!=null?'q':'p']=num(x.value);pfMaj()})});
 $$('#pf [data-pfx]').forEach(function(x){x.addEventListener('click',function(){PF.L.splice(+x.dataset.pfx,1);pfMaj()})});
 $$('#pf [data-pfdx]').forEach(function(x){x.addEventListener('click',function(){PF.ded.splice(+x.dataset.pfdx,1);pfMaj()})});
 var f=$('#pf-add');f.addEventListener('submit',function(e){e.preventDefault();var v=$('#pf-a').value.trim();if(!v)return;PF.L.push({d:v,u:'u',q:1,p:0});pfMaj();var q=$$('#pf [data-pfp]');if(q.length)q[q.length-1].focus();});
 suggerer($('#pf-a'),$('#pf-sug'),function(p){PF.L.push({d:p.d,u:p.u||'u',q:1,p:p.p||0});pfMaj();var q=$$('#pf [data-pfq]');if(q.length)q[q.length-1].focus();},true);}
function pfValider(){var b=$('#pf-ok'),c=CH[PF.c],t=pfTot();
 if(!PF.L.length){X.toast('Ajoutez au moins une ligne','Une facture vide ne peut pas partir.');return}
 if(PF.ty!=='pre'&&!PF.arm){PF.arm=true;b.classList.add('ch-arm');b.textContent='Touchez encore pour confirmer';setTimeout(function(){if(PF&&PF.arm&&b.isConnected){PF.arm=false;b.classList.remove('ch-arm');b.textContent=PF.ty==='devis'?'Valider le devis':'Valider et créer la facture'}},4000);return}
 c.docs=c.docs||[];var d={id:'d'+Date.now().toString(36),ty:PF.ty,n:TYD[PF.ty],d:jour(),L:PF.L,ded:PF.ded,tva:PF.tva,ht:t.ht,ttc:t.ttc,st:PF.ty==='pre'?'brouillon':'cree'};
 if(PF.doc){c.docs=c.docs.filter(function(x){return x.id!==PF.doc})}
 c.docs.unshift(d);
 if(PF.ty==='devis'){c.L=PF.L.map(function(l){return {d:l.d,u:l.u,q:num(l.q),p:num(l.p)}});c.fin.ht=r2(PF.L.reduce(function(s,l){return s+num(l.q)*num(l.p)},0));c.fin.tva=PF.tva;c.dv=c.dv||'(nouveau)';
  if(c.ouv.length<=1&&!c.ouv.some(function(x){return x[2]})){var tot=c.fin.ht||1,acc=0;c.ouv=c.L.map(function(l,i){var w=i===c.L.length-1?100-acc:Math.round(num(l.q)*num(l.p)/tot*100);acc+=w;return [l.d.split(/[,·(]/)[0].trim().slice(0,40),w,0]})}}
 if(PF.ty==='solde')c.soldeCree=true;
 if(PF.ty!=='pre'&&PF.ty!=='devis'&&X.cf&&X.cf.ajoutFacture&&c.dos){try{X.cf.ajoutFacture(c.dos,PF.L.map(function(l){return [l.d,r2(num(l.q)*num(l.p))]}).concat(PF.ded.map(function(x){return [x[0],x[1]]})),PF.tva)}catch(e){}}
 saveCH();attente('facture');var ty=PF.ty;PF=null;X.xclose();ouvrir(c.id,'docs');
 X.toast(ty==='pre'?'Brouillon enregistré':TYD[ty]+' créé'+(ty==='devis'?'':'e')+' : '+eur(t.ttc)+' TTC',ty==='pre'?'Retrouvez-le dans Documents.':en()?'Démo : dans votre Espace, VosFactures renvoie le PDF, rangé ici et dans Factures.':'Elle partira au retour du réseau.');}

/* ---------- Notes : un bouton, on écrit ou on dicte, rangées par pièce ---------- */
function notes(c){var P={},ord=[];(c.notes||[]).forEach(function(n){var p=n[2]||'Tout le chantier';if(!P[p]){P[p]=[];ord.push(p)}P[p].push(n)});
 return '<button type="button" class="btn go cf-go" id="ch-nadd"><span class="lab"><span class="ic">'+IC.plus+'</span><span>Ajouter une note</span></span></button>'+
  '<div class="card ch-nt" id="ch-notes">'+(ord.length?ord.map(function(p){return '<h3>'+esc(p)+'</h3>'+P[p].slice().reverse().map(function(n){return '<div class="n">'+esc(n[1])+'<small>'+esc(n[0])+'</small></div>'}).join('')}).join(''):'<p class="hint">Aucune note pour l\'instant.</p>')+'</div>';}
var NP=null;
function choixPieces(c,sel,id){var P=pieces(c);return '<div class="ch-pcs" id="'+id+'">'+['Tout le chantier'].concat(P).map(function(p){return '<button type="button" class="btn" data-pc="'+esc(p)+'" aria-pressed="'+(sel===p)+'">'+esc(p)+'</button>'}).join('')+'<button type="button" class="btn" data-pcnew>+ Autre pièce</button></div>'}
function lierPieces(c,id,cb){$$('#'+id+' [data-pc]').forEach(function(b){b.addEventListener('click',function(){$$('#'+id+' [data-pc]').forEach(function(x){x.setAttribute('aria-pressed',String(x===b))});cb(b.dataset.pc)})});
 var n=$('#'+id+' [data-pcnew]');if(n)n.addEventListener('click',function(){var w=$('#'+id);if(w.querySelector('input'))return;n.insertAdjacentHTML('afterend','<input placeholder="Nom de la pièce" aria-label="Nom de la pièce" style="flex:1 1 160px;min-height:40px;border-radius:999px;padding:8px 14px">');var i=w.querySelector('input');i.focus();i.addEventListener('change',function(){var v=i.value.trim();if(!v)return;c.pieces=c.pieces||[];if(c.pieces.indexOf(v)<0)c.pieces.push(v);saveCH();cb(v);$$('#'+id+' [data-pc]').forEach(function(x){x.setAttribute('aria-pressed','false')});i.style.boxShadow='0 0 0 2px var(--acc)'})});}
function noteSheet(c){NP=pieces(c)[0]||'Tout le chantier';
 X.xopen('Nouvelle note',c.n,'<div class="col" style="gap:12px"><b style="font-size:14px">Où ?</b>'+choixPieces(c,NP,'np')+
  '<p class="hint" style="margin:0">Pièces reprises du devis et du plan.</p>'+
  '<textarea class="ch-txt" id="nt-t" placeholder="Écrivez la note, ou touchez « Dicter »" aria-label="Note"></textarea>'+
  '<button type="button" class="btn ch-dic" id="nt-d">'+IC.micro+'<span>Dicter la note</span></button></div>',
  '<button class="btn" data-xclose>Annuler</button><button class="btn go" id="nt-ok">Ajouter la note</button>',function(){
  lierPieces(c,'np',function(p){NP=p});
  dictee($('#nt-d'),$('#nt-t'));
  $('#nt-ok').addEventListener('click',function(){var v=$('#nt-t').value.trim();if(!v){$('#nt-t').focus();return}c.notes=c.notes||[];c.notes.push([maint(),v,NP]);saveCH();attente('note');X.xclose();recharger('notes');X.toast('Note ajoutée',NP+(en()?'':' · gardée sur le téléphone'));});});}
var REC=null;
function dictee(btn,ta){var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
 btn.addEventListener('click',function(){
  if(!SR){ta.focus();X.toast('Touchez le micro du clavier','Votre téléphone écrit ce que vous dites.');return}
  if(REC){REC.stop();return}
  try{REC=new SR();REC.lang='fr-FR';REC.interimResults=true;REC.continuous=true;}catch(e){ta.focus();return}
  var base=ta.value?ta.value.replace(/\s*$/,' '):'';
  REC.onresult=function(e){var t='';for(var i=0;i<e.results.length;i++)t+=e.results[i][0].transcript;ta.value=base+t;};
  REC.onend=function(){REC=null;btn.classList.remove('on');btn.querySelector('span').textContent='Dicter la note'};
  REC.onerror=function(){X.toast('Dictée indisponible','Touchez le micro du clavier à la place.')};
  btn.classList.add('on');btn.querySelector('span').textContent='J\'écoute… touchez pour arrêter';REC.start();});}

/* ---------- Photos : prises ou choisies ici, rangées par pièce, avec une note ---------- */
function photos(c){var ck=cliky();
 return '<button type="button" class="btn go cf-go" id="ch-padd"><span class="lab"><span class="ic">'+IC.photo+'</span><span>Ajouter une photo</span></span></button>'+
  '<div class="card" id="ch-ph"><div class="row" style="margin-bottom:10px"><b>Photos</b><span style="font-size:12px;color:var(--muted)">'+(c.ph||[]).length+' photo'+((c.ph||[]).length>1?'s':'')+'</span></div>'+
  ((c.ph||[]).length?'<div class="ch-ph">'+c.ph.map(function(p){var mine=p.length>2;return '<figure><span class="im"'+(p[2]?' style="background-image:url('+p[2]+')"':'')+'></span><figcaption><b>'+esc(p[0])+'</b>'+(mine?(p[1]?'<small>'+esc(p[1])+'</small>':'')+'<small>'+esc(p[3]||'')+'</small>':ck?'<span class="ck">Cliky : '+esc(p[1])+'</span>':'')+'</figcaption></figure>'}).join('')+'</div>':'<p class="hint">Aucune photo pour l\'instant.</p>')+
  (ck?'<p class="hint" style="margin-top:10px">Avec Cliky, les photos sont aussi analysées (hauteur estimée, défauts repérés).</p>':'')+'</div>';}
var PH=null;
function photoSheet(c){PH={img:null,pc:pieces(c)[0]||'Tout le chantier'};
 X.xopen('Nouvelle photo',c.n,'<div class="col" style="gap:12px">'+
  '<div class="ch-pick"><label>'+IC.photo+'Prendre une photo<input type="file" accept="image/*" capture="environment" id="ph-cam"></label><label>'+IC.docs+'Choisir une photo<input type="file" accept="image/*" id="ph-gal"></label></div>'+
  '<div id="ph-ap"></div><b style="font-size:14px">Quelle pièce ?</b>'+choixPieces(c,PH.pc,'pp')+
  '<textarea class="ch-txt" id="ph-n" style="min-height:70px" placeholder="Une note sous la photo (facultatif)" aria-label="Note sous la photo"></textarea></div>',
  '<button class="btn" data-xclose>Annuler</button><button class="btn go" id="ph-ok">Ajouter la photo</button>',function(){
  lierPieces(c,'pp',function(p){PH.pc=p});
  ['#ph-cam','#ph-gal'].forEach(function(s){$(s).addEventListener('change',function(){var f=this.files&&this.files[0];if(f)reduire(f,function(u){PH.img=u;$('#ph-ap').innerHTML='<img class="ch-apercu" alt="Aperçu de la photo" src="'+u+'">'})})});
  $('#ph-ok').addEventListener('click',function(){if(!PH.img){X.toast('Prenez ou choisissez une photo d\'abord','');return}
   c.ph=c.ph||[];c.ph.push([PH.pc,$('#ph-n').value.trim(),PH.img,maint()]);saveCH();attente('photo');X.xclose();recharger('photo');X.toast('Photo ajoutée',PH.pc+(cliky()?' · Cliky l\'analyse.':''));});});}
function reduire(f,cb){var r=new FileReader();r.onload=function(){var im=new Image();im.onload=function(){var m=640,s=Math.min(1,m/Math.max(im.width,im.height)),cv=document.createElement('canvas');cv.width=Math.round(im.width*s);cv.height=Math.round(im.height*s);cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);try{cb(cv.toDataURL('image/jpeg',.72))}catch(e){cb(r.result)}};im.onerror=function(){X.toast('Photo illisible','Essayez avec une autre.')};im.src=r.result};r.readAsDataURL(f);}

/* ---------- Documents : pré-devis, devis, factures d'acompte, factures ---------- */
function documents(c){var o=dos(c),L=[];
 (c.docs||[]).forEach(function(d){L.push({ic:d.ty==='pre'||d.ty==='devis'?IC.devis:d.ty==='ac'?IC.acompte:IC.fact,t:TYD[d.ty],s:(d.st==='brouillon'?'brouillon, à finir · ':'créé'+(d.ty==='devis'?'':'e')+' '+d.d+' · ')+eur(d.ttc)+' TTC',a:'data-cdoc="'+d.id+'"'})});
 if(o)(o.docs||[]).forEach(function(x){if(X.DOCS&&X.DOCS[x])L.push({ic:x==='devis'?IC.devis:x==='acompte'?IC.acompte:x==='plan'?IC.plan:IC.docs,t:X.DOCS[x][0]+(x==='devis'&&c.dv?' '+c.dv:''),s:X.DOCS[x][1],a:'data-odoc="'+c.dos+'|'+x+'"'})});
 var G={devis:[],fact:[],autre:[]};L.forEach(function(x){(/Devis|Pré-devis/.test(x.t)?G.devis:/Facture|acompte/i.test(x.t)?G.fact:G.autre).push(x)});
 var li=function(x){return '<button class="cf-li" type="button" '+x.a+'><span class="cf-av cf-doc">'+x.ic+'</span><span class="tx"><b>'+esc(x.t)+'</b><small>'+esc(x.s)+'</small></span><span class="go">›</span></button>'};
 return '<div class="card"><b style="font-size:14px">Créer</b><div class="ch-new" style="margin-top:10px">'+[['pre','Pré-devis',IC.devis],['devis','Devis',IC.devis],['ac','Facture d\'acompte',IC.acompte],['fact','Facture',IC.fact]].map(function(x){return '<button type="button" class="btn" data-chnew="'+x[0]+'">'+x[2]+x[1]+'</button>'}).join('')+'</div>'+
  '<p class="hint" style="margin-top:8px">Tout passe d\'abord par un brouillon que vous vérifiez. Factures et devis partent ensuite dans VosFactures.</p></div>'+
  [['Devis',G.devis],['Factures',G.fact],['Autres documents',G.autre]].map(function(g){return g[1].length?'<div><div class="sec-h"><h2>'+g[0]+'</h2><span>'+g[1].length+'</span></div><div class="card lst cf-l ch-docs">'+g[1].map(li).join('')+'</div></div>':''}).join('')+
  (L.length?'':'<p class="hint">Aucun document pour ce chantier.</p>');}
function pdf(c,d){var o=dos(c),t={ht:d.ht,ttc:d.ttc,tv:r2(d.ttc-d.ht)};
 return '<div class="pdf" role="document"><span class="stamp s-'+(d.st==='brouillon'?'draft':'sent')+'">'+(d.st==='brouillon'?'Brouillon':'Créé'+(d.ty==='devis'?'':'e'))+'</span><div class="pdf-h"><div><b>Dupont Rénovation</b><span>[Adresse] · SIRET [numéro]</span></div><div class="r"><span class="pdf-t">'+esc(TYD[d.ty].toUpperCase())+'</span><span>N° '+(d.st==='brouillon'?'non numéroté':'[numéro VosFactures]')+'</span><span>'+esc(d.d)+'</span></div></div>'+
  '<div class="pdf-c"><span class="pdf-k">Client</span><b>'+esc(o?o.n:c.n)+'</b><span>'+esc(o?o.adr:c.v)+'</span><span class="pdf-k" style="margin-top:6px">Chantier</span><span>'+esc(c.t)+'</span></div>'+
  '<table><thead><tr><th>Désignation</th><th class="r">Qté</th><th class="r">PU HT</th><th class="r">Total HT</th></tr></thead><tbody>'+d.L.map(function(l){return '<tr><td>'+esc(l.d)+'</td><td class="r">'+fr(num(l.q))+' '+esc(l.u||'')+'</td><td class="r">'+eur(num(l.p))+'</td><td class="r">'+eur(num(l.q)*num(l.p))+'</td></tr>'}).join('')+(d.ded||[]).map(function(x){return '<tr><td>'+esc(x[0])+'</td><td></td><td></td><td class="r">'+eur(x[1])+'</td></tr>'}).join('')+'</tbody></table>'+
  '<div class="pdf-tot"><div><span>Total HT</span><b>'+eur(t.ht)+'</b></div><div><span>TVA '+fr(d.tva)+' %</span><span>'+eur(t.tv)+'</span></div><div class="ttc"><span>Total TTC</span><b>'+eur(t.ttc)+'</b></div></div></div>';}
function voirDoc(c,id){var d=(c.docs||[]).filter(function(x){return x.id===id})[0];if(!d)return;
 if(d.st==='brouillon')return preFacture(c,d.ty,d);
 X.xopen(TYD[d.ty],c.n+' · '+d.d,pdf(c,d)+'<p class="note-demo" style="margin-top:12px">Démo : dans votre Espace, c\'est le PDF renvoyé par VosFactures qui s\'affiche ici.</p>','<button class="btn" data-xclose>Fermer</button>',null);}

/* ---------- suggestions de produits (remplace la liste du navigateur) ---------- */
function produits(q){var R=[];
 if(window.PCPROD&&PCPROD.chercher){try{R=(PCPROD.chercher(q)||[]).map(function(p){return {d:p.d,u:p.u,p:p.p,ic:p.i&&PCPROD.icone?PCPROD.icone(p.i):''}})}catch(e){R=[]}}
 if(!R.length){var vu={},use={};
  Object.keys(CH).forEach(function(k){((CH[k].four||[]).concat(CH[k].extra||[])).forEach(function(x){var n=norm(x[0]);use[n]=(use[n]||0)+1})});
  var base=(X.lsGet('pc-base1',null)||[]).map(function(p){return {d:p.d,u:p.u,p:p.p}}).concat((X.CATA||[]).map(function(a){return {d:a}}));
  var w=String(q||'').split(/\s+/).map(norm).filter(Boolean);
  base.forEach(function(p){var n=norm(p.d);if(!p.d||vu[n])return;if(w.length&&!w.every(function(x){return n.indexOf(x)>=0}))return;vu[n]=1;p.n=use[n]||0;R.push(p)});
  R.sort(function(a,b){return b.n-a.n});}
 return R.slice(0,8);}
function surligne(t,q){var w=String(q||'').trim();if(!w)return esc(t);var i=norm(t).indexOf(norm(w.split(/\s+/)[0]));if(i<0)return esc(t);
 var a=0,j=0,s=String(t);var m=[];for(var k=0;k<s.length;k++){var n=norm(s.charAt(k));m.push(j);j+=n.length}
 var st=m.indexOf(i),L=norm(w.split(/\s+/)[0]).length,en2=st;while(en2<s.length&&m[en2]<i+L)en2++;if(st<0)return esc(t);
 return esc(s.slice(0,st))+'<mark>'+esc(s.slice(st,en2))+'</mark>'+esc(s.slice(en2));}
function suggerer(inp,box,pick,prix){if(!inp||!box)return;var tm;
 function montrer(){var q=inp.value.trim(),R=produits(q);
  if(!R.length){box.hidden=true;return}
  box.innerHTML='<div class="chs-h">'+(q?'Dans vos produits':'Les plus utilisés')+'</div>'+R.map(function(p,i){return '<button type="button" data-sg="'+i+'"><span class="pi">'+(p.ic||IC.prod)+'</span><span>'+surligne(p.d,q)+'</span>'+(prix&&p.p?'<small>'+eur(p.p)+(p.u?' / '+esc(p.u):'')+'</small>':p.u?'<small>'+esc(p.u)+'</small>':'')+'</button>'}).join('');
  box.hidden=false;
  $$('[data-sg]',box).forEach(function(b){b.addEventListener('mousedown',function(e){e.preventDefault()});b.addEventListener('click',function(){var p=R[+b.dataset.sg];box.hidden=true;pick(p)})});}
 inp.addEventListener('input',montrer);inp.addEventListener('focus',montrer);
 inp.addEventListener('keydown',function(e){if(e.key==='Escape')box.hidden=true});
 inp.addEventListener('blur',function(){clearTimeout(tm);tm=setTimeout(function(){box.hidden=true},180)});}

/* ---------- client : appeler, SMS, e-mail, itinéraire ---------- */
function action(c,a){var o=dos(c);if(!o)return;var tel=String(o.tel||'').replace(/[^\d+]/g,''),fake=/•/.test(o.tel||'')||tel.length<10;
 if(a==='tel'||a==='sms'){if(fake)return X.toast('Numéro d\'exemple','Dans votre Espace, '+(a==='tel'?'l\'appel part':'le SMS s\'ouvre')+' directement vers '+o.n+'.');location.href=(a==='tel'?'tel:':'sms:')+tel;return}
 if(a==='mail'){if(!o.mail)return X.toast('Pas d\'e-mail pour ce client','Ajoutez-le dans sa fiche.');location.href='mailto:'+o.mail;return}
 var adr=/\[/.test(o.adr||'')?(o.v||c.v)+', Isère':(o.adr||o.v||c.v),q=encodeURIComponent(adr);
 X.xopen('Itinéraire',adr,'<div class="col" style="gap:10px">'+[['Waze','https://waze.com/ul?q='+q+'&navigate=yes'],['Plans (iPhone)','https://maps.apple.com/?daddr='+q],['Google Maps','https://www.google.com/maps/dir/?api=1&destination='+q]].map(function(x){return '<a class="btn" style="display:flex;align-items:center;justify-content:center;min-height:54px;text-decoration:none" href="'+x[1]+'" target="_blank" rel="noopener">'+x[0]+'</a>'}).join('')+'</div>','<button class="btn" data-xclose>Fermer</button>',null);}

/* ---------- les gestes de la page ---------- */
function lier(c){var id=c.id;
 $$('#chx [data-aller]').forEach(function(b){b.addEventListener('click',function(){ouvrir(id,b.dataset.aller)})});
 $$('#chx [data-cact]').forEach(function(b){b.addEventListener('click',function(){action(c,b.dataset.cact)})});
 $$('#chx [data-chdos]').forEach(function(b){b.addEventListener('click',function(){var k=b.dataset.chdos;if(X.cf&&X.cf.ficheClient)X.cf.ficheClient(k);else X.openDossier(k)})});
 /* travaux */
 $$('#chx [data-omod]').forEach(function(b){b.addEventListener('click',function(){var i=+b.dataset.omod;edit={i:i,v:c.ouv[i][2]};recharger('trav')})});
 $$('#chx [data-odeb]').forEach(function(b){b.addEventListener('click',function(){var i=+b.dataset.odeb;if(b.dataset.arm){c.ouv[i][3]=false;saveCH();edit={i:i,v:c.ouv[i][2]};recharger('trav');return}b.dataset.arm='1';b.lastChild.textContent='Encore pour débloquer';setTimeout(function(){if(b.isConnected){delete b.dataset.arm;b.lastChild.textContent='Validée'}},3500)})});
 var setV=function(v){edit.v=Math.max(0,Math.min(100,v));var o=$('#chx .ch-ed');if(!o)return;o.querySelector('.v b').textContent=edit.v+' %';var row=o.closest('.ch-o');row.querySelector('.pc').textContent=edit.v+' %';row.querySelector('.prog i').style.width=edit.v+'%';$('#ch-rg').value=edit.v;$$('#chx [data-eq]').forEach(function(x){x.setAttribute('aria-pressed',String(+x.dataset.eq===edit.v))})};
 $$('#chx [data-ev]').forEach(function(b){b.addEventListener('click',function(){setV(edit.v+(+b.dataset.ev))})});
 $$('#chx [data-eq]').forEach(function(b){b.addEventListener('click',function(){setV(+b.dataset.eq)})});
 var rg=$('#ch-rg');if(rg)rg.addEventListener('input',function(){setV(+rg.value)});
 var en1=$('#ch-eno');if(en1)en1.addEventListener('click',function(){edit=null;recharger('trav')});
 var ok=$('#ch-eok');if(ok)ok.addEventListener('click',function(){var o2=c.ouv[edit.i],av=o2[2];o2[2]=edit.v;o2[3]=true;edit=null;c.pointTxt=null;if(o2[2]!==av){c.pointSent=false;prevenir=1}saveCH();attente('av');var na=avc(c);if(X.updPin)X.updPin(c,na);if(c.st==='start'&&na>0){c.st='run';saveCH()}recharger('trav',prevenir!=null?'#ch-prev':null);X.toast('Avancement : '+na+' %','Ligne validée et bloquée.');});
 var pn=$('#ch-pno');if(pn)pn.addEventListener('click',function(){prevenir=null;c.pointSent=true;saveCH();recharger('trav');X.toast('Client non prévenu','Vous pourrez lui envoyer un point plus tard.');});
 var po=$('#ch-poui');if(po)po.addEventListener('click',function(){prevenir=null;c.pointTxt=null;recharger('trav','#ch-pt');var t=$('#ch-ptt');if(t)t.focus();});
 var pt=$('#ch-ptt');if(pt)pt.addEventListener('input',function(){c.pointTxt=pt.value;saveCH()});
 var pr=$('#ch-ptr');if(pr)pr.addEventListener('click',function(){c.pointTxt=null;saveCH();recharger('trav','#ch-pt')});
 var ps=$('#ch-pts');if(ps)ps.addEventListener('click',function(){c.pointSent=true;c.pointTxt=$('#ch-ptt').value;saveCH();attente('sms');if(X.renderTodo)X.renderTodo();recharger('trav','#ch-pt');X.toast('Point du jour envoyé',en()?'SMS parti depuis le numéro de votre entreprise (démo).':'Il partira au retour du réseau.');});
 var at=$('#ch-avt');if(at)at.addEventListener('click',function(){c.avis.on=!c.avis.on;saveCH();recharger('trav','#ch-avis')});
 $$('#chx [data-avq]').forEach(function(b){b.addEventListener('click',function(){c.avis.quand=b.dataset.avq;saveCH();recharger('trav','#ch-avis');X.toast('Demande d\'avis Google',QUAND.filter(function(q){return q[0]===c.avis.quand})[0][1].replace(' (conseillé)','')+'.')})});
 /* finances */
 $$('#chx [data-pf]').forEach(function(b){b.addEventListener('click',function(){preFacture(c,b.dataset.pf)})});
 $$('#chx [data-fact]').forEach(function(b){b.addEventListener('click',function(){X.openFact(c,+b.dataset.fact)})});
 $$('#chx [data-mo]').forEach(function(b){b.addEventListener('click',function(){c.mo.reel=Math.max(0,c.mo.reel+(+b.dataset.mo));saveCH();recharger('fin','#ch-cout')})});
 $$('#chx [data-addfact]').forEach(function(b){b.addEventListener('click',function(){var card=$('#ch-cout');card.insertAdjacentHTML('beforeend','<div class="airead" style="margin-top:10px"><span class="spin"></span>Lecture du bon de livraison…</div>');setTimeout(function(){c.fact.push({n:'Placo Dauphiné',ty:'Bon de livraison',ref:'[n° de BL]',d:'à l\'instant',tot:31.30,L:[['Enduit à joint · sac de 25 kg','1 u','1 u','ok'],['Bande armée d\'angle','1 rouleau','1 rouleau','ok']]});c.reel.push(['Placo Dauphiné · bon de livraison','31,30']);c.four.forEach(function(x){if(/Bande armée|Enduit/.test(x[0]))x[2]='livré'});saveCH();attente('fact');recharger('fin','#ch-cout');X.toast('Bon de livraison lu et rapproché','2 lignes livrées · coût du chantier mis à jour.');},1500)})});
 /* fournitures */
 var FST=X.FST||['à prévoir','prix demandé','commandé','livré','pris au dépôt'];
 $$('#chx [data-fchk]').forEach(function(b){b.addEventListener('change',function(){var x=c.four[+b.dataset.fchk];x[2]=b.checked?(x[2]==='pris au dépôt'?x[2]:'livré'):'à prévoir';if(x[5])c.fst[x[5]]=x[2];saveCH();attente('four');recharger('four','#ch-four')})});
 $$('#chx [data-fst]').forEach(function(b){b.addEventListener('click',function(){var x=c.four[+b.dataset.fst];x[2]=FST[(FST.indexOf(x[2])+1)%FST.length];if(x[5])c.fst[x[5]]=x[2];saveCH();recharger('four','#ch-four')})});
 var ff=$('#ch-ff');if(ff){ff.addEventListener('submit',function(e){e.preventDefault();var a=$('#ch-fa').value.trim(),q=$('#ch-fq').value.trim();if(!a)return;(c.cote?(c.extra=c.extra||[]):c.four).push([a,q||'1 u','à prévoir','main']);saveCH();attente('four');recharger('four','#ch-ff');X.toast('Ajouté aux fournitures',a+(q?' · '+q:''));});
  suggerer($('#ch-fa'),$('#ch-fsug'),function(p){$('#ch-fa').value=p.d;var q=$('#ch-fq');if(q){if(p.u&&!q.value)q.placeholder='Qté ('+p.u+')';q.focus()}});}
 var fc=$('#ch-fcalc');if(fc)fc.addEventListener('click',function(){window.fcalcOn=!window.fcalcOn;recharger('four','#ch-four')});
 var fv=$('#ch-fv');if(fv&&X.dicter)fv.addEventListener('click',function(){X.dicter(3)});
 var fdp=$('#ch-fdp');if(fdp)fdp.addEventListener('click',function(){var L=c.four.filter(function(x){return x[2]==='à prévoir'});X.xopen('Demande de prix','Préparée à partir des fournitures de '+c.n,'<label class="field">Fournisseur<select id="fd-sup"><option value="pd">Placo Dauphiné</option><option value="nim">Négoce Isère Matériaux</option></select></label><div class="mail">'+L.map(function(x){return '• '+esc(x[0])+' · '+esc(x[1])}).join('\n')+'</div><p class="hint">Ni vos prix de vente ni votre marge. Vous relisez, puis elle part de votre adresse.</p>','<button class="btn" data-xclose>Annuler</button><button class="btn go" id="fd-go">Envoyer depuis ma messagerie</button>',function(){$('#fd-go').addEventListener('click',function(){var sp=$('#fd-sup').value,DP=X.DP;DP.unshift({id:'DP-0'+(14+DP.length-3),sup:sp,dos:c.dos||'alpes',st:'wait',sent:'à l\'instant',since:'0 h',items:L.map(function(x){return[x[0],x[1]]})});L.forEach(function(x){x[2]='prix demandé';if(x[5])c.fst[x[5]]='prix demandé'});X.saveDP();saveCH();if(X.renderFour)X.renderFour();X.xclose();recharger('four');X.toast('Demande de prix envoyée',X.SUP[sp].n+' · ProClik surveille la réponse.');attente('dp');})})});
 if(window.PCPLAN&&PCPLAN.lierLiv)PCPLAN.lierLiv(c);
 /* notes, photos, documents */
 var na=$('#ch-nadd');if(na)na.addEventListener('click',function(){noteSheet(c)});
 var pa=$('#ch-padd');if(pa)pa.addEventListener('click',function(){photoSheet(c)});
 $$('#chx [data-chnew]').forEach(function(b){b.addEventListener('click',function(){var t=b.dataset.chnew;if((t==='ac'||t==='fact')&&!c.fin.ht){X.toast('Créez d\'abord le devis','La facture reprend les lignes du devis.');return}preFacture(c,t==='fact'?'solde':t)})});
 $$('#chx [data-cdoc]').forEach(function(b){b.addEventListener('click',function(){voirDoc(c,b.dataset.cdoc)})});
 $$('#chx [data-odoc]').forEach(function(b){b.addEventListener('click',function(){var p=b.dataset.odoc.split('|');X.openDoc(p[0],p[1])})});}

/* ---------- créer un chantier ---------- */
var NC=null;
function nouveau(){var K=Object.keys(DOS).filter(function(k){return DOS[k]&&DOS[k].n}).sort(function(a,b){return DOS[a].n.localeCompare(DOS[b].n,'fr')});NC=NC||{cli:K[0]||''};
 var d0=new Date(),d1=new Date(d0.getTime()+86400000);var iso=function(d){return d.toISOString().slice(0,10)};
 X.xopen('Créer un chantier','Choisissez le client, puis les travaux','<div class="ch-f">'+
  '<label>Pour quel client<select id="nc-c">'+K.map(function(k){return '<option value="'+k+'"'+(NC.cli===k?' selected':'')+'>'+esc(DOS[k].n)+' · '+esc(DOS[k].v||'')+'</option>'}).join('')+'</select></label>'+
  '<button type="button" class="lnk" id="nc-nc">+ Nouveau client</button>'+
  '<label>Les travaux<input id="nc-t" placeholder="Par ex. cloison du séjour avec une porte" value="'+esc(NC.t||'')+'"></label>'+
  '<label>Ville du chantier<input id="nc-v" placeholder="Ville" value="'+esc(NC.v||(DOS[NC.cli]&&DOS[NC.cli].v)||'')+'"></label>'+
  '<div class="two"><label>Début<input type="date" id="nc-d1" value="'+(NC.d1||iso(d0))+'"></label><label>Fin<input type="date" id="nc-d2" value="'+(NC.d2||iso(d1))+'"></label></div>'+
  '<p class="hint" style="margin:0">Ensuite, dans le chantier : créez le pré-devis, le devis, les factures d\'acompte et les factures.</p></div>',
  '<button class="btn" data-xclose>Annuler</button><button class="btn go" id="nc-ok">Créer le chantier</button>',function(){
  var garder=function(){NC.cli=$('#nc-c').value;NC.t=$('#nc-t').value;NC.v=$('#nc-v').value;NC.d1=$('#nc-d1').value;NC.d2=$('#nc-d2').value};
  $('#nc-c').addEventListener('change',function(){var o=DOS[this.value];if(o)$('#nc-v').value=o.v||''});
  $('#nc-nc').addEventListener('click',function(){garder();var retour=function(k){if(k&&DOS[k]){NC.cli=k;NC.v=DOS[k].v||NC.v}nouveau()};
   if(X.cf&&X.cf.nouveauClient)X.cf.nouveauClient(retour);else clientSecours(retour);});
  $('#nc-ok').addEventListener('click',function(){garder();if(!NC.t.trim()){$('#nc-t').focus();return}creer(NC);NC=null;});});}
function dt(s){var d=new Date(s+'T12:00:00');return isNaN(d)?'':d.toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'numeric'})}
function creer(n){var o=DOS[n.cli],id='c'+Date.now().toString(36);
 CH[id]={id:id,dos:n.cli,n:o?o.n:'Client',v:n.v||(o&&o.v)||'',t:n.t.trim(),st:'start',dv:'',dates:(n.d1?dt(n.d1)+(n.d2&&n.d2!==n.d1?' → '+dt(n.d2):''):'dates à fixer'),
  ouv:[['Travaux',100,0]],fin:{ht:0,tva:10,ac:0},four:[],fst:{},prev:0,reel:[],notes:[],ph:[],docs:[],avis:{on:true,quand:'lendemain'}};
 if(o){o.k='chantier';o.ch=id}saveCH();
 if(window.PCPLAN&&PCPLAN.chantier&&n.d1)PCPLAN.chantier(CH[id],n.d1,n.d2||n.d1);
 X.xclose();vue='cours';ouvrir(id);X.toast('Chantier créé',CH[id].n+' · prochaine étape : le devis.');}
/* Petit formulaire de secours, si l'onglet Clients n'en propose pas encore (même format que clients.js) */
function clientSecours(cb){var ty='part';
 var corps=function(){return '<div class="ch-f"><div class="seg2"><button type="button" class="btn" data-ty="part" aria-pressed="'+(ty==='part')+'">Particulier</button><button type="button" class="btn" data-ty="pro" aria-pressed="'+(ty==='pro')+'">Professionnel</button></div>'+
  (ty==='pro'?'<label>Entreprise<input id="cs-e"></label><label>SIRET<input id="cs-s" inputmode="numeric"></label>':'')+
  '<div class="two"><label>Prénom<input id="cs-p" autocomplete="given-name"></label><label>Nom<input id="cs-n" autocomplete="family-name"></label></div>'+
  '<label>Téléphone<input id="cs-t" type="tel" autocomplete="tel"></label><label>E-mail<input id="cs-m" type="email" autocomplete="email"></label>'+
  '<label>Adresse<input id="cs-a" autocomplete="street-address"></label><div class="two"><label>Code postal<input id="cs-cp" inputmode="numeric" autocomplete="postal-code"></label><label>Ville<input id="cs-v" autocomplete="address-level2"></label></div></div>'};
 X.xopen('Nouveau client','Particulier ou professionnel',corps(),'<button class="btn" id="cs-x">Retour</button><button class="btn go" id="cs-ok">Enregistrer le client</button>',function(){
  var lier2=function(){$$('[data-ty]').forEach(function(b){b.addEventListener('click',function(){ty=b.dataset.ty;$('#x-in').innerHTML=corps();lier2()})})};lier2();
  $('#cs-x').addEventListener('click',function(){cb(null)});
  $('#cs-ok').addEventListener('click',function(){var v=function(s){var e=$(s);return e?e.value.trim():''};var nom=v('#cs-n'),pre=v('#cs-p'),ent=v('#cs-e');
   if(!nom&&!ent){($('#cs-e')||$('#cs-n')).focus();return}
   var k='n'+Date.now().toString(36),o={n:ty==='pro'&&ent?ent:(pre?pre+' ':'')+nom,prenom:pre,nom:nom,type:ty,entreprise:ent,siret:v('#cs-s'),v:v('#cs-v'),cp:v('#cs-cp'),adr:[v('#cs-a'),[v('#cs-cp'),v('#cs-v')].filter(Boolean).join(' ')].filter(Boolean).join(', '),tel:v('#cs-t'),mail:v('#cs-m'),t:'',k:'visite',src:'Ajouté à la main',chat:[],ph:[],docs:[],hist:[[jour(),'Client ajouté par vous']]};
   if(ty==='pro'&&pre)o.contact=pre+' '+nom;
   DOS[k]=o;var N=X.lsGet('pc-cl1',{});N[k]=o;X.lsSet('pc-cl1',N);cb(k);});});}

window.PCCH={liste:liste,ouvrir:function(id,o){ouvrir(id,o||null)},nouveau:nouveau,suggerer:suggerer};
if(X.setCurCh)liste();
})();
