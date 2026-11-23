/* Contrats d'entretien (clim, pompe à chaleur) : demande de Cyril du 17/11.
   « Pour le poseur de clim, on n'oubliera pas les contrats d'entretien qu'ils pourront noter dans l'Espace,
     et qui seront rappelés et relancés au client. »
   - Dans la fiche du client : un bloc « Contrat d'entretien » et un bouton pour en ajouter un (une question à la fois).
   - Dans Clients : un menu « Entretiens » qui range tous les contrats (en retard, à prévoir, rendez-vous pris, plus tard).
   - Les rappels : un mois avant la date, rappel au client ; 10 jours sans rendez-vous, relance ; encore 10 jours, « Appelez le client ».
     L'Accueil montre « Entretien à prévoir ». Une date fixée va dans le Planning ; « Entretien fait » calcule la prochaine date.
   - Démo : les rappels partent tout seuls (comme avec l'option SMS). Vraies demandes : le message est prêt, l'artisan l'envoie
     depuis son téléphone (l'envoi automatique depuis le numéro de l'entreprise viendra avec l'option SMS, côté service).
   - Visible chez les métiers concernés (clim, chauffage, plomberie… d'après l'activité du compte) ; interrupteur dans les Réglages.
   Gardé sur l'appareil : pc-ent1 (démo), pc-ent-v1 (vraies demandes), pc-ent-on (interrupteur). */
(function(){
"use strict";
var X=window.PCX;if(!X)return;
var d=document,root=d.documentElement;
var $=function(s,r){return (r||d).querySelector(s)},$$=function(s,r){return [].slice.call((r||d).querySelectorAll(s))};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var lsG=function(k,v){try{var x=JSON.parse(localStorage.getItem(k));return x==null?v:x}catch(e){return v}};
var lsS=function(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
var vrai=function(){return root.classList.contains('pcvrai')};
var eur=function(n){var s=Math.abs(n).toFixed(2).split('.');return s[0].replace(/\B(?=(\d{3})+(?!\d))/g,' ')+','+s[1]+' €'};
var I=function(p){return '<svg viewBox="0 0 24 24" aria-hidden="true">'+p+'</svg>'};
var IC={
 clim:I('<rect x="3" y="5" width="18" height="8" rx="2.5"/><path d="M6.5 10h11"/><path d="M8 16.5c0 1.3-1 1.6-1 3M12 16.5c0 1.3-1 1.6-1 3M16 16.5c0 1.3-1 1.6-1 3"/>'),
 plus:I('<path d="M12 5v14M5 12h14"/>'),
 cal:I('<rect x="4" y="5" width="16" height="15" rx="3"/><path d="M8 3v4M16 3v4M4 10h16"/>'),
 ok:I('<path d="M5 12l5 5 9-10"/>'),
 tel:I('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>'),
 sms:I('<path d="M4 5h16v11H9l-5 4z"/>')};
window.PCENT_IC=IC.clim;

/* ---------- visible ou non ---------- */
var RX_METIER=/clim|chauff|plomb|frigo|pompe|\bpac\b|thermi|cvc|g[ée]nie climatique|ventil|chaudi/i;
function metierConcerne(){var a=lsG('pc-vrai-artisan',null)||{};return RX_METIER.test(String(a.activite||'')+' '+String(a.entreprise||''))}
function on(){var o=lsG('pc-ent-on',null);if(o!=null)return !!o;return vrai()?metierConcerne():true}

/* ---------- dates ---------- */
var MOIS=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'],JL=['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];
function iso(t){return t.getFullYear()+'-'+('0'+(t.getMonth()+1)).slice(-2)+'-'+('0'+t.getDate()).slice(-2)}
function dt(s){return new Date(s+'T12:00:00')}
function auj(){return vrai()?iso(new Date()):iso(X.TODAY||new Date())}
function plusMois(s,n){var t=dt(s),j=t.getDate();t.setDate(1);t.setMonth(t.getMonth()+n);var der=new Date(t.getFullYear(),t.getMonth()+1,0,12).getDate();t.setDate(Math.min(j,der));return iso(t)}
function plusJours(s,n){var t=dt(s);t.setDate(t.getDate()+n);return iso(t)}
function ecart(a,b){return Math.round((dt(b)-dt(a))/864e5)}
function jolie(s){var t=dt(s);return JL[t.getDay()]+' '+t.getDate()+' '+MOIS[t.getMonth()]}
function court(s){var t=dt(s);return t.getDate()+'/'+('0'+(t.getMonth()+1)).slice(-2)}
function moisAn(s){var t=dt(s);return MOIS[t.getMonth()]+' '+t.getFullYear()}
function dateLongue(s){var t=dt(s);return t.getDate()+' '+MOIS[t.getMonth()]+' '+t.getFullYear()}
function hh(s){var m=/^(\d+):(\d+)/.exec(s||'');return m?(+m[1])+' h'+(m[2]!=='00'?' '+m[2]:''):''}
function jours(n){return n+(n>1?' jours':' jour')}

/* ---------- appareils, fluides, règles ---------- */
var APP=[['clim','Climatisation','murale, console, cassette'],['gain','Clim gainable','réseau de gaines'],['pac-aa','Pompe à chaleur air/air','clim réversible qui chauffe'],['pac-ae','Pompe à chaleur air/eau','chauffage, eau chaude'],['autre','Autre appareil','VMC, chauffe-eau thermodynamique…']];
function nomApp(k){var a=APP.filter(function(x){return x[0]===k})[0];return a?a[1]:'Appareil'}
function petitNom(k){return {clim:'climatisation','gain':'climatisation','pac-aa':'pompe à chaleur','pac-ae':'pompe à chaleur',autre:'appareil'}[k]||'appareil'}
/* Pouvoir de réchauffement (PRG) des fluides courants, valeurs du règlement européen sur les gaz fluorés */
var PRG={R32:675,R410A:2088,R290:3,R134a:1430,R407C:1774};
function teq(c){var p=PRG[c.fluide],k=+c.charge;return p&&k>0?Math.round(k*p/100)/10:null}
function regles(c){var L=[],t=teq(c);
 if(t!=null&&t>=5)L.push('Contrôle d\'étanchéité obligatoire : '+String(t).replace('.',',')+' t éq. CO₂ (à partir de 5 t), au moins tous les '+(t>=500?'3':t>=50?'6':'12')+' mois.');
 else if(t!=null)L.push('Contrôle d\'étanchéité pas obligatoire : '+String(t).replace('.',',')+' t éq. CO₂, sous le seuil de 5 t.');
 if(/^pac/.test(c.app))L.push('Pompe à chaleur de 4 à 70 kW : entretien obligatoire au moins tous les 2 ans, avec une attestation remise au client (décret n° 2020-912).');
 return L}

/* ---------- les contrats ---------- */
var CLE_D='pc-ent1',CLE_V='pc-ent-v1';
/* Exemples fictifs, posés sur les clients de la démo (aujourd'hui = vendredi 16 octobre 2026) */
var DEMO=[
 {id:'e-perrin',cle:'perrin',nom:'Mme Perrin',ville:'Crolles',tel:'06 •• •• •• 31',app:'pac-aa',nb:3,fluide:'R32',charge:2.1,freq:12,dernier:'2025-10-02',prix:180,msg:[{t:'rappel',d:'2026-09-02',auto:1},{t:'relance',d:'2026-09-12',auto:1}],hist:['2024-10-08','2025-10-02']},
 {id:'e-rey',cle:'rey',nom:'Boulangerie Rey',ville:'Grenoble',tel:'04 •• •• •• 19',app:'clim',nb:2,fluide:'R410A',charge:6,freq:12,dernier:'2025-11-05',prix:260,msg:[{t:'rappel',d:'2026-10-06',auto:1}],hist:['2025-11-05']},
 {id:'e-fabre',cle:'fabre',nom:'M. Fabre',ville:'Seyssinet-Pariset',tel:'06 •• •• •• 54',app:'clim',nb:1,fluide:'R32',charge:.9,freq:12,dernier:'2025-11-20',prix:120,rdv:{d:'2026-10-22',s:'09:00',e:'10:00'},msg:[{t:'rappel',d:'2026-10-14',auto:1},{t:'rdv',d:'2026-10-15'}],hist:['2025-11-20']},
 {id:'e-martin',cle:'martin',nom:'M. Martin',ville:'Saint-Égrève',tel:'06 •• •• •• ••',app:'pac-ae',nb:1,freq:24,dernier:'2025-06-10',prix:190,msg:[],hist:['2025-06-10']}];
if(window.PCDEMO)PCDEMO.deep(DEMO);/* 23/11 : démo à la vraie date */
function cle(){return vrai()?CLE_V:CLE_D}
function tous(){var L=lsG(cle(),null);if(!L){L=vrai()?[]:JSON.parse(JSON.stringify(DEMO));lsS(cle(),L)}return L}
var C=null;function liste(){if(!C||C._v!==vrai()){C=tous();C._v=vrai()}return C}
function garder(){lsS(cle(),liste().slice());majPlanning();signaler()}
function de(id){return liste().filter(function(c){return c.id===id})[0]}
function duClient(k){return liste().filter(function(c){return c.cle===k})}
function prochain(c){return plusMois(c.dernier,+c.freq||12)}
function dernierMsg(c,t){var L=(c.msg||[]).filter(function(m){return m.t===t});return L[L.length-1]}

/* Où on en est, pour un contrat : {k: rdv|retard|prevoir|tard, txt, quoi (prochaine étape des rappels)} */
var AV=30,RELANCE=10;
function etat(c){var T=auj(),p=prochain(c),n=ecart(T,p);
 if(c.rdv&&c.rdv.d>=T)return {k:'rdv',p:p,n:n,txt:'Rendez-vous '+jolie(c.rdv.d)+' à '+hh(c.rdv.s)};
 if(c.rdv&&c.rdv.d<T)return {k:'fait?',p:p,n:n,txt:'Visite du '+court(c.rdv.d)+' : entretien fait ?'};
 if(n>AV)return {k:'tard',p:p,n:n,txt:'Prochain entretien en '+moisAn(p)};
 var r=dernierMsg(c,'rappel'),l=dernierMsg(c,'relance'),q;
 if(!r)q={t:'rappel',le:T};
 else if(!l)q={t:'relance',le:plusJours(r.d,RELANCE)};
 else q={t:'appel',le:plusJours(l.d,RELANCE)};
 var txt=n<0?'En retard de '+jours(-n):n===0?'À faire aujourd\'hui':'À prévoir avant le '+dateLongue(p).replace(/ \d{4}$/,'');
 return {k:n<0?'retard':'prevoir',p:p,n:n,txt:txt,q:q}}
/* Ce que l'artisan doit faire maintenant (ou rien : les rappels partent seuls) */
function aFaire(c,e){e=e||etat(c);if(e.k==='fait?')return 'fait';if(!e.q)return '';var T=auj();if(e.q.le>T)return '';
 if(e.q.t==='appel')return 'appel';return auto()?'':e.q.t}
function auto(){return !vrai()}
/* Démo : les rappels et relances du jour partent tout seuls */
function tourner(){if(!auto())return;var ch=0;liste().forEach(function(c){var e=etat(c);if(e.q&&e.q.t!=='appel'&&e.q.le<=auj()){(c.msg=c.msg||[]).push({t:e.q.t,d:auj(),auto:1});ch=1}});if(ch)lsS(cle(),liste().slice())}

/* Les contrats qui demandent l'artisan (pour l'Accueil et le chiffre du menu) */
function urgents(){return liste().filter(function(c){var e=etat(c);return e.k==='retard'||e.k==='prevoir'||e.k==='fait?'})}

/* ---------- messages au client ---------- */
function entreprise(){if(vrai()){var a=(window.PCV&&PCV.artisan&&PCV.artisan())||lsG('pc-vrai-artisan',{})||{};return a.entreprise||'votre artisan'}return 'Julien, de Dupont Rénovation'}
function texte(c,t,rdv){var ap=petitNom(c.app),b='Bonjour '+(c.nom||'')+', c\'est '+entreprise()+'. ';
 if(t==='rappel')return b+'L\'entretien de votre '+ap+' arrive bientôt (le dernier date du '+dateLongue(c.dernier)+'). Quel jour vous arrange ? Répondez simplement à ce message. Merci !';
 if(t==='relance')return b+'Petit rappel : l\'entretien de votre '+ap+' est à prévoir. Dites-moi le jour qui vous arrange, je m\'adapte. Merci !';
 if(t==='rdv')return b+'Je passerai pour l\'entretien de votre '+ap+' '+jolie(rdv.d)+' à '+hh(rdv.s)+'. À bientôt !';
 return ''}
function numero(c){var s=String(c.tel||'').replace(/[^\d+]/g,'');return s.length>=10?s:''}
function envoyer(c,t,rdv){var txt=texte(c,t,rdv),n=numero(c);
 if(!n){X.toast(c.tel?'Numéro d\'exemple':'Pas de numéro','Avec un vrai numéro, ce message s\'ouvre dans vos SMS : « '+txt.slice(0,90)+'… »');return false}
 location.href='sms:'+n+'?&body='+encodeURIComponent(txt);return true}

/* ---------- Planning : les rendez-vous d'entretien ---------- */
if(X.CK){X.CK.ent=['var(--k-ent)','Entretien'];$$('.cal-key').forEach(function(x){if(X.calKey)x.innerHTML=X.calKey()})}
function majPlanning(){var E=X.EV;if(!E)return;for(var i=E.length-1;i>=0;i--)if(E[i].x&&E[i].x.ent)E.splice(i,1);
 if(on())liste().forEach(function(c){if(c.rdv)E.push({d:c.rdv.d,s:c.rdv.s,e:c.rdv.e||c.rdv.s,k:'ent',t:'Entretien · '+c.nom,w:[c.ville,nomApp(c.app)+(c.nb>1?' · '+c.nb+' unités':'')].filter(Boolean).join(' · '),x:{ent:c.id}})});
 try{X.renderCalWeek();X.renderCalMonth()}catch(e){}}

/* ---------- prévenir les autres écrans ---------- */
function signaler(){try{d.dispatchEvent(new CustomEvent('pc-ent'))}catch(e){}}

/* ---------- une ligne de contrat ---------- */
function init(n){var w=String(n||'').replace(/^(M\.|Mme|Mlle|SCI|SARL|SAS)\s+/i,'').split(/\s+/).filter(Boolean);return ((w[0]||'?').charAt(0)+(w[1]?w[1].charAt(0):'')).toUpperCase()}
function sousTitre(c){return [nomApp(c.app)+(c.nb>1?' · '+c.nb+' unités':''),c.ville].filter(Boolean).join(' · ')}
function ligne(c,sansNom){var e=etat(c),f=aFaire(c,e),chaud=e.k==='retard'||e.k==='prevoir'||e.k==='fait?';
 var suite=f==='appel'?' · à appeler':f==='rappel'?' · rappel à envoyer':f==='relance'?' · relance à envoyer':'';
 return '<button class="cf-li ent-li" type="button" data-entf="'+esc(c.id)+'"><span class="cf-av ent-av'+(chaud?' on':'')+'">'+(sansNom?IC.clim:esc(init(c.nom)))+'</span><span class="tx"><b>'+esc(sansNom?nomApp(c.app)+(c.nb>1?' · '+c.nb+' unités':''):c.nom)+'</b><small>'+esc(sansNom?'Tous les '+freqTxt(c.freq)+(c.prix?' · '+eur(+c.prix)+' HT':''):sousTitre(c))+'</small><small class="cf-et'+(chaud?' on':'')+'">'+esc(e.txt+suite)+'</small></span><span class="go">›</span></button>'}
function freqTxt(f){f=+f||12;return f===12?'ans':f===24?'2 ans':f===6?'6 mois':f+' mois'}

/* ---------- l'écran « Entretiens » (menu de Clients) ---------- */
var GR=[['retard','En retard'],['prevoir','À prévoir ce mois-ci'],['rdv','Rendez-vous pris'],['tard','Plus tard']];
function vue(){var L=liste(),G={retard:[],prevoir:[],rdv:[],tard:[]};
 L.forEach(function(c){var k=etat(c).k;(G[k==='fait?'?'prevoir':k]||G.tard).push(c)});
 G.retard.sort(function(a,b){return prochain(a)<prochain(b)?-1:1});G.prevoir.sort(function(a,b){return prochain(a)<prochain(b)?-1:1});
 G.rdv.sort(function(a,b){return a.rdv.d<b.rdv.d?-1:1});G.tard.sort(function(a,b){return prochain(a)<prochain(b)?-1:1});
 var an=L.reduce(function(s,c){return s+(+c.prix||0)*12/(+c.freq||12)},0);
 var h='<button class="btn go cf-go" type="button" data-entnew><span class="lab"><span class="ic">'+IC.plus+'</span><span>Ajouter un contrat</span></span></button>';
 if(!L.length)h+='<div class="card cf-rien"><b>Aucun contrat d\'entretien</b><span>Notez ici les contrats de vos clients : l\'Espace leur rappelle l\'entretien un mois avant, les relance, et vous prévient.</span></div>';
 GR.forEach(function(g){if(G[g[0]].length)h+='<div class="sec-h ent-sec"><h3>'+g[1]+'</h3><span>'+G[g[0]].length+'</span></div><div class="card lst cf-l">'+G[g[0]].map(function(c){return ligne(c)}).join('')+'</div>'});
 if(L.length)h+='<p class="hint ent-tot">'+L.length+' contrat'+(L.length>1?'s':'')+(an?' · '+eur(Math.round(an*100)/100)+' HT d\'entretiens par an':'')+'</p>';
 h+='<p class="hint">Un mois avant chaque entretien, le client reçoit un rappel par SMS'+(auto()?'':' (prêt à envoyer)')+', puis une relance 10 jours plus tard. Sans réponse, l\'Espace vous dit de l\'appeler.</p>';
 if(!vrai())h+='<span class="exemple">Contrats fictifs de démonstration</span>';
 return h}

/* ---------- le bloc dans la fiche du client ---------- */
function bloc(o){if(!on())return '';var L=duClient(o.cle);majInfos(o);
 return '<div class="card ent-bloc"><div class="ent-bt"><span class="ent-ic">'+IC.clim+'</span><b>Contrat d\'entretien</b></div>'+
  (L.length?'<div class="lst cf-l">'+L.map(function(c){return ligne(c,1)}).join('')+'</div>':'<p class="ent-v">Aucun contrat. L\'entretien sera rappelé au client chaque année.</p>')+
  '<button type="button" class="btn sm ent-add" data-entnew="'+esc(o.cle)+'">'+IC.plus+'<span>'+(L.length?'Ajouter un autre appareil':'Ajouter un contrat')+'</span></button></div>'}
/* Les coordonnées du client peuvent avoir changé : on les reprend */
function majInfos(o){var ch=0;duClient(o.cle).forEach(function(c){['nom','tel','ville'].forEach(function(k){if(o[k]&&c[k]!==o[k]){c[k]=o[k];ch=1}})});if(ch)lsS(cle(),liste().slice())}

/* ---------- la fiche d'un contrat ---------- */
function fiche(id,keep){var c=de(id);if(!c)return;var e=etat(c),f=aFaire(c,e),T=auj();
 var go,h='<div class="card ent-ou"><small>Où on en est</small><b>'+esc(e.txt)+'</b>';
 if(e.k==='rdv'||e.k==='fait?')go='<button class="btn go" type="button" data-entfait="'+c.id+'">Entretien fait</button>';
 else go='<button class="btn go" type="button" data-entdate="'+c.id+'">Fixer la date</button>';
 h+=go.replace('class="btn go"','class="btn go cf-in"')+'</div>';
 /* les rappels au client */
 if(e.k!=='tard'){var R=[],r=dernierMsg(c,'rappel'),l=dernierMsg(c,'relance');
  if(e.k==='rdv'||e.k==='fait?'){var m=dernierMsg(c,'rdv');R.push(['ok','Rendez-vous fixé'+(m?' le '+court(m.d):''),c.rdv?'Pour '+jolie(c.rdv.d)+' à '+hh(c.rdv.s):''])}
  else{
   R.push(r?['ok','Rappel parti le '+court(r.d),r.auto?'Automatiquement, par SMS':'Envoyé par vous']:['att','Rappel au client',f==='rappel'?'À envoyer maintenant':'Part le '+court(e.q.le)]);
   R.push(l?['ok','Relance partie le '+court(l.d),l.auto?'Automatiquement, par SMS':'Envoyée par vous']:['att','Relance','Le '+court(r?plusJours(r.d,RELANCE):plusJours(T,RELANCE))+(f==='relance'?' · à envoyer maintenant':' si pas de réponse')]);
   R.push(['att'+(f==='appel'?' on':''),'Appeler le client',f==='appel'?'Pas de réponse aux messages : un coup de fil règle tout':'Le '+court(l?plusJours(l.d,RELANCE):plusJours(r?plusJours(r.d,RELANCE):plusJours(T,RELANCE),RELANCE))+' si toujours rien'])}
  h+='<div class="xsec"><h3>Les rappels au client</h3><div class="card"><ul class="ent-tl">'+R.map(function(x){return '<li class="'+x[0]+'"><i>'+(x[0]==='ok'?IC.ok:'')+'</i><span><b>'+esc(x[1])+'</b><small>'+esc(x[2])+'</small></span></li>'}).join('')+'</ul>'+
   (f==='rappel'||f==='relance'?'<button class="btn ent-w" type="button" data-entsms="'+c.id+'|'+f+'">'+IC.sms+'<span>Envoyer '+(f==='rappel'?'le rappel':'la relance')+' par SMS</span></button>':'')+
   (numero(c)||c.tel?'<a class="btn ent-w'+(f==='appel'?' go':'')+'" '+(numero(c)?'href="tel:'+numero(c)+'"':'href="#" data-entfaux')+'>'+IC.tel+'<span>Appeler '+esc(c.nom)+'</span></a>':'')+
   '</div></div>'}
 /* le contrat */
 var t=teq(c);
 h+='<div class="xsec"><h3>Le contrat</h3><div class="card"><div class="kv">'+
  '<span>Appareil</span><b>'+esc(nomApp(c.app))+'</b><span>Unités</span><b>'+(+c.nb||1)+'</b>'+
  (c.fluide?'<span>Fluide</span><b>'+esc(c.fluide)+(+c.charge?' · '+String(c.charge).replace('.',',')+' kg':'')+(t!=null?' · '+String(t).replace('.',',')+' t éq. CO₂':'')+'</b>':'')+
  '<span>Entretien</span><b>Tous les '+freqTxt(c.freq)+'</b><span>Dernier</span><b>'+esc(dateLongue(c.dernier))+'</b><span>Prochain</span><b>'+esc(dateLongue(prochain(c)))+'</b>'+
  '<span>Prix</span><b>'+(c.prix?eur(+c.prix)+' HT':'—')+'</b></div></div>';
 var RG=regles(c);if(RG.length)h+='<div class="card ent-loi">'+RG.map(function(x){return '<p>'+esc(x)+'</p>'}).join('')+'</div>';
 if(c.hist&&c.hist.length)h+='<p class="hint">Entretiens faits : '+c.hist.slice().reverse().map(court2).join(', ')+'.</p>';
 h+='</div><div class="ent-pt"><button type="button" class="btn sm" data-entmod="'+c.id+'">Modifier le contrat</button><button type="button" class="btn sm" data-entfin="'+c.id+'">Arrêter ce contrat</button></div>';
 X.xopen('Entretien · '+c.nom,sousTitre(c),h,'<button class="btn" data-xclose>Fermer</button>',null,keep);}
function court2(s){var t=dt(s);return t.getDate()+'/'+('0'+(t.getMonth()+1)).slice(-2)+'/'+t.getFullYear()}

/* ---------- fixer la date ---------- */
function prochainOuvre(s){var t=dt(s);while(t.getDay()===0||t.getDay()===6)t.setDate(t.getDate()+1);return iso(t)}
function fixer(id){var c=de(id);if(!c)return;var T=auj(),p=prochain(c),j=prochainOuvre(p>T?(ecart(T,p)>14?plusJours(p,-7):p):plusJours(T,1)),r=c.rdv||{d:j,s:'09:00',e:'10:00'};
 X.xopen('Fixer la date',c.nom+' · '+nomApp(c.app),
  '<div class="ch-f"><label>Jour<input type="date" id="ent-d" value="'+r.d+'" min="'+T+'"></label><div class="two"><label>Arrivée<input type="time" id="ent-s" value="'+r.s+'" step="900"></label><label>Fin<input type="time" id="ent-e" value="'+(r.e||'10:00')+'" step="900"></label></div>'+
  '<div class="ch-sw"><span>Prévenir le client par SMS</span><button type="button" class="ch-tg" role="switch" aria-checked="true" id="ent-p" aria-label="Prévenir le client par SMS"></button></div>'+
  '<p class="hint" style="margin:0">Le rendez-vous va dans votre Planning. Les rappels s\'arrêtent.</p></div>',
  '<button class="btn" data-xclose>Annuler</button><button class="btn go" id="ent-dok">Mettre au planning</button>',function(){
   $('#ent-p').addEventListener('click',function(){this.setAttribute('aria-checked',String(this.getAttribute('aria-checked')!=='true'))});
   $('#ent-s').addEventListener('change',function(){var e=$('#ent-e'),h=+this.value.slice(0,2)+1;if(e.value<=this.value)e.value=('0'+Math.min(h,23)).slice(-2)+this.value.slice(2)});
   $('#ent-dok').addEventListener('click',function(){var dd=$('#ent-d').value,s=$('#ent-s').value||'09:00',e=$('#ent-e').value||s,pr=$('#ent-p').getAttribute('aria-checked')==='true';
    if(!dd){$('#ent-d').focus();return}if(e<=s){X.toast('L\'heure de fin est avant l\'arrivée','Changez l\'une des deux.');return}
    c.rdv={d:dd,s:s,e:e};(c.msg=c.msg||[]).push({t:'rdv',d:auj(),auto:pr&&auto()?1:0});garder();
    if(X.calWeek)X.calWeek(dt(dd));majPlanning();
    var dit=jolie(dd)+' à '+hh(s);
    if(pr&&auto())X.toast('Entretien au planning',dit+'. Le client est prévenu par SMS (démo : rien n\'est parti).');
    else{X.toast('Entretien au planning',dit+(pr?'. Le message au client s\'ouvre dans vos SMS.':'.'));if(pr)setTimeout(function(){envoyer(c,'rdv',c.rdv)},400)}
    fiche(id);rafraichir();});});}

/* ---------- entretien fait ---------- */
function fait(id){var c=de(id);if(!c)return;var T=auj(),le=c.rdv&&c.rdv.d<=T?c.rdv.d:T;
 c.hist=(c.hist||[]).concat([le]);c.dernier=le;c.rdv=null;c.msg=[];garder();
 var p=prochain(c);X.xclose();rafraichir();
 X.toast('Entretien noté','Prochain en '+moisAn(p)+'. Le rappel partira tout seul un mois avant.');
 if(c.prix&&!vrai()&&X.nouveauDoc&&X.DOS&&X.DOS[c.cle])setTimeout(function(){
  X.xopen('Entretien fait',c.nom+' · '+nomApp(c.app),'<div class="card ent-ou"><small>C\'est noté</small><b>Prochain entretien : '+esc(moisAn(p))+'</b><span class="hint" style="margin:0">Le rappel au client partira tout seul un mois avant.</span></div>',
   '<button class="btn" data-xclose>Plus tard</button><button class="btn go" type="button" data-entfac="'+c.id+'">Faire la facture · '+eur(+c.prix)+' HT</button>')},350);}

/* ---------- ajouter ou modifier un contrat : une question à la fois ---------- */
var W=null;
var ETAPES=['client','app','nb','dernier','freq','prix','fluide','recap'];
function nouveau(k,id){var c=id?de(id):null;
 W={id:id||null,i:0,v:c?JSON.parse(JSON.stringify(c)):{cle:k||'',app:'',nb:1,dernier:'',freq:12,prix:'',fluide:'',charge:''}};
 if(!c&&k){var o=client(k);if(o)Object.assign(W.v,o)}
 W.etapes=ETAPES.filter(function(e){return !(e==='client'&&(k||id))});if(id)W.i=W.etapes.length-1;
 X.xopen(id?'Modifier le contrat':'Nouveau contrat d\'entretien',W.v.nom||'Une question à la fois',corps(),pied(),lier,!!(k||id));}
function clients(){var L=[];
 if(vrai()){var V=(X.cf&&X.cf.vrais&&X.cf.vrais())||[];V.forEach(function(c){L.push({cle:c.contact,nom:c.nom,tel:c.telephone||'',ville:c.ville||''})})}
 else{var D=X.DOS||{},sup=X.lsGet?X.lsGet('pc-cl-sup',[])||[]:[];Object.keys(D).forEach(function(k){if(sup.indexOf(k)<0&&D[k].n)L.push({cle:k,nom:D[k].n,tel:D[k].tel||'',ville:D[k].v||''})})}
 return L.sort(function(a,b){return String(a.nom).replace(/^(M\.|Mme)\s+/,'').localeCompare(String(b.nom).replace(/^(M\.|Mme)\s+/,''),'fr')})}
function client(k){return clients().filter(function(c){return c.cle===k})[0]}
function choix(nom,val,L,sous){return '<div class="ent-ch" role="radiogroup">'+L.map(function(x){var on=String(val)===String(x[0]);return '<button type="button" class="btn ent-o" role="radio" aria-checked="'+on+'" data-ento="'+nom+'|'+esc(x[0])+'"><b>'+esc(x[1])+'</b>'+(x[2]&&sous!==false?'<small>'+esc(x[2])+'</small>':'')+'</button>'}).join('')+'</div>'}
function corps(){var e=W.etapes[W.i],v=W.v,n=W.etapes.length,h='<div class="ent-wz"><div class="ent-bar"><i style="width:'+Math.round((W.i+1)/n*100)+'%"></i></div>';
 if(e==='client')h+='<h3>Pour quel client ?</h3><label class="cf-cherche"><input type="search" id="ent-q" placeholder="Nom ou ville" autocomplete="off" aria-label="Chercher un client"></label><div class="card lst cf-l ent-cl" id="ent-cl">'+listeClients('')+'</div><p class="hint">Un nouveau client ? Ajoutez-le d\'abord dans Clients.</p>';
 else if(e==='app')h+='<h3>Quel appareil ?</h3>'+choix('app',v.app,APP);
 else if(e==='nb')h+='<h3>Combien d\'unités intérieures ?</h3>'+choix('nb',v.nb,[[1,'1'],[2,'2'],[3,'3'],[4,'4'],[5,'5 ou plus']]);
 else if(e==='dernier')h+='<h3>Dernier entretien, ou date de pose ?</h3><div class="ent-ch">'+[[auj(),'Aujourd\'hui','posé ou entretenu aujourd\'hui']].map(function(x){return '<button type="button" class="btn ent-o" role="radio" aria-checked="'+(v.dernier===x[0])+'" data-ento="dernier|'+x[0]+'"><b>'+x[1]+'</b><small>'+x[2]+'</small></button>'}).join('')+'</div><label class="ent-lab">Ou choisissez la date<input type="date" id="ent-dern" value="'+esc(v.dernier&&v.dernier!==auj()?v.dernier:'')+'" max="'+auj()+'"></label>';
 else if(e==='freq')h+='<h3>Tous les combien ?</h3>'+choix('freq',v.freq,[[12,'Tous les ans','le plus courant'],[6,'Tous les 6 mois','commerce, usage intensif'],[24,'Tous les 2 ans','minimum légal d\'une pompe à chaleur']]);
 else if(e==='prix')h+='<h3>Prix de la visite d\'entretien ?</h3><label class="ent-lab">Montant HT, en euros<input id="ent-px" inputmode="decimal" autocomplete="off" placeholder="Par ex. 150" value="'+esc(v.prix)+'"></label><p class="hint">Pour la facture de chaque visite. Vous pouvez le laisser vide.</p>';
 else if(e==='fluide')h+='<h3>Le fluide frigorigène</h3><p class="hint" style="margin-top:0">Sur l\'étiquette du groupe extérieur. Il dit si le contrôle d\'étanchéité est obligatoire.</p>'+choix('fluide',v.fluide,[['R32','R32'],['R410A','R410A'],['R290','R290 (propane)'],['?','Je ne sais pas']],false)+
  (v.fluide&&v.fluide!=='?'?'<label class="ent-lab">Charge totale, en kg<input id="ent-kg" inputmode="decimal" autocomplete="off" placeholder="Par ex. 1,2" value="'+esc(v.charge)+'"></label>':'');
 else if(e==='recap'){var c=Object.assign({},v),RG=regles(c);
  h+='<h3>On vérifie</h3><div class="card lst ent-rc">'+[['client','Client',v.nom],['app','Appareil',nomApp(v.app)],['nb','Unités',v.nb],['dernier','Dernier entretien',v.dernier?dateLongue(v.dernier):'—'],['freq','Entretien','Tous les '+freqTxt(v.freq)],['prix','Prix',v.prix?eur(+v.prix)+' HT':'—'],['fluide','Fluide',v.fluide&&v.fluide!=='?'?v.fluide+(+v.charge?' · '+String(v.charge).replace('.',',')+' kg':''):'Pas renseigné']]
   .filter(function(x){return W.etapes.indexOf(x[0])>=0||x[0]==='client'}).map(function(x){var j=W.etapes.indexOf(x[0]);return '<button type="button" class="it ent-rl"'+(j>=0?' data-entgo="'+j+'"':' disabled')+'><span class="tx"><small>'+x[1]+'</small><b>'+esc(x[2])+'</b></span>'+(j>=0?'<span class="go">›</span>':'')+'</button>'}).join('')+'</div>'+
   (v.dernier?'<p class="hint">Prochain entretien : <b>'+esc(dateLongue(prochain(c)))+'</b>. Le client recevra un rappel un mois avant.</p>':'')+
   (RG.length?'<div class="card ent-loi">'+RG.map(function(x){return '<p>'+esc(x)+'</p>'}).join('')+'</div>':'')}
 return h+'</div>'}
function listeClients(q){q=String(q||'').toLowerCase();var L=clients().filter(function(c){return !q||(c.nom+' '+c.ville).toLowerCase().indexOf(q)>=0});
 return L.length?L.slice(0,40).map(function(c){return '<button type="button" class="cf-li" data-entcli="'+esc(c.cle)+'"><span class="cf-av">'+esc(init(c.nom))+'</span><span class="tx"><b>'+esc(c.nom)+'</b><small>'+esc(c.ville||'')+'</small></span><span class="go">›</span></button>'}).join(''):'<p class="hint" style="padding:10px">Personne à ce nom.</p>'}
function pied(){var e=W.etapes[W.i],der=e==='recap';
 return '<button class="btn" type="button" data-entprev>'+(W.i?'‹ Retour':'Annuler')+'</button>'+(der?'<button class="btn go" type="button" data-entok>'+(W.id?'Enregistrer':'Enregistrer le contrat')+'</button>':
  e==='client'||e==='app'||e==='nb'||e==='freq'?'':'<button class="btn go" type="button" data-entnext>'+(e==='prix'&&!W.v.prix||e==='fluide'&&!W.v.fluide?'Passer':'Continuer')+'</button>')}
function redessiner(){var x=$('#x-in'),f=$('#x-foot');if(!x||!W)return;x.innerHTML=corps();f.innerHTML=pied();f.hidden=false;x.scrollTop=0;lier()}
function lier(){var q=$('#ent-q');if(q)q.addEventListener('input',function(){$('#ent-cl').innerHTML=listeClients(q.value)});
 var dn=$('#ent-dern');if(dn)dn.addEventListener('change',function(){if(dn.value){W.v.dernier=dn.value;$$('[data-ento^="dernier|"]').forEach(function(b){b.setAttribute('aria-checked','false')})}});
 var px=$('#ent-px');if(px)px.addEventListener('input',function(){W.v.prix=px.value.trim();var b=$('[data-entnext]');if(b)b.textContent=W.v.prix?'Continuer':'Passer'});
 var kg=$('#ent-kg');if(kg)kg.addEventListener('input',function(){W.v.charge=kg.value.trim()})}
function nombre(s){var n=parseFloat(String(s||'').replace(/\s/g,'').replace(',','.'));return isFinite(n)&&n>0?Math.round(n*100)/100:''}
function suivant(){var e=W.etapes[W.i];
 if(e==='dernier'&&!W.v.dernier){X.toast('Il manque la date','Le dernier entretien, ou le jour de la pose.');return}
 if(e==='prix'){var p=nombre(W.v.prix);if(W.v.prix&&p===''){X.toast('Montant pas compris','Écrivez le prix en chiffres, par ex. 150.');return}W.v.prix=p}
 if(e==='fluide')W.v.charge=nombre(W.v.charge);
 if(W.id&&e!=='recap'){W.i=W.etapes.length-1}else W.i=Math.min(W.i+1,W.etapes.length-1);redessiner()}
function enregistrer(){var v=W.v,c;
 if(!v.cle||!v.app||!v.dernier){X.toast('Il manque une réponse','Touchez la ligne à compléter.');return}
 if(v.fluide==='?'){v.fluide='';v.charge=''}
 if(W.id){c=de(W.id);Object.assign(c,v)}else{c=Object.assign({id:'e'+Date.now().toString(36),msg:[],hist:[]},v);liste().push(c)}
 c.nb=+c.nb||1;c.freq=+c.freq||12;garder();var nouveauC=!W.id;W=null;
 X.xclose();rafraichir();
 var e=etat(c);X.toast(nouveauC?'Contrat enregistré':'Contrat modifié','Prochain entretien le '+dateLongue(prochain(c))+(e.k==='tard'?'. Le rappel partira un mois avant.':'.'));
 fiche(c.id);}

/* ---------- clics ---------- */
d.addEventListener('click',function(ev){var b=ev.target.closest&&ev.target.closest('[data-entf],[data-entnew],[data-entdate],[data-entfait],[data-entsms],[data-entmod],[data-entfin],[data-entfinok],[data-entfac],[data-ento],[data-entcli],[data-entnext],[data-entprev],[data-entok],[data-entgo],[data-entfaux],[data-entseg]');if(!b)return;
 var a=function(n){return b.getAttribute(n)};
 if(b.hasAttribute('data-entf')){ev.preventDefault();var dans=!!$('#xsheet.on');fiche(a('data-entf'),dans)}
 else if(b.hasAttribute('data-entnew'))nouveau(a('data-entnew')||'');
 else if(b.hasAttribute('data-entdate'))fixer(a('data-entdate'));
 else if(b.hasAttribute('data-entfait'))fait(a('data-entfait'));
 else if(b.hasAttribute('data-entsms')){var p=a('data-entsms').split('|'),c=de(p[0]);if(!c)return;var parti=envoyer(c,p[1]);
  if(parti||!numero(c)){(c.msg=c.msg||[]).push({t:p[1],d:auj()});garder();setTimeout(function(){fiche(c.id);rafraichir()},parti?600:0)}}
 else if(b.hasAttribute('data-entfaux')){ev.preventDefault();X.toast('Numéro d\'exemple','Dans votre Espace, l\'appel part directement vers le client.')}
 else if(b.hasAttribute('data-entmod'))nouveau('',a('data-entmod'));
 else if(b.hasAttribute('data-entfin')){var c2=de(a('data-entfin'));if(!c2)return;
  X.xopen('Arrêter ce contrat ?',c2.nom,'<div class="card cl-sup-c"><b>Plus de rappels</b><p>'+esc(c2.nom)+' ne recevra plus de rappel d\'entretien pour '+esc(nomApp(c2.app).toLowerCase())+'. Ses coordonnées, devis et factures ne bougent pas.</p></div>',
   '<button class="btn" data-xclose>Garder le contrat</button><button class="btn cl-sup-go" type="button" data-entfinok="'+c2.id+'"><span>Arrêter le contrat</span></button>',null,true)}
 else if(b.hasAttribute('data-entfinok')){var L=liste(),i=L.indexOf(de(a('data-entfinok')));if(i>=0)L.splice(i,1);garder();X.xclose();rafraichir();X.toast('Contrat arrêté','Plus aucun rappel pour cet appareil.')}
 else if(b.hasAttribute('data-entfac')){var c3=de(a('data-entfac'));X.xclose();if(c3&&X.nouveauDoc){X.go&&X.go('factures');X.nouveauDoc('facture',c3.cle)}}
 else if(b.hasAttribute('data-ento')&&W){var q=a('data-ento').split('|'),k=q[0],v=q.slice(1).join('|');
  W.v[k]=k==='nb'||k==='freq'?+v:v;if(k==='app'&&/^pac/.test(v)&&W.v.freq===12&&!W.id){}
  $$('[data-ento^="'+k+'|"]').forEach(function(x){x.setAttribute('aria-checked',String(x===b))});
  if(k==='dernier'){var dn=$('#ent-dern');if(dn)dn.value=''}
  if(k==='fluide'){redessiner();return}
  if(k!=='dernier')setTimeout(suivant,220)}
 else if(b.hasAttribute('data-entcli')&&W){var o=client(a('data-entcli'));if(o){Object.assign(W.v,o);$('#x-s').textContent=o.nom;suivant()}}
 else if(b.hasAttribute('data-entnext')&&W)suivant();
 else if(b.hasAttribute('data-entprev')&&W){if(!W.i){W=null;var xb=$('#x-back');if(xb&&!xb.hidden)xb.click();else X.xclose();return}W.i--;redessiner()}
 else if(b.hasAttribute('data-entok')&&W)enregistrer();
 else if(b.hasAttribute('data-entgo')&&W){W.i=+a('data-entgo');redessiner()}
});

/* ---------- rafraîchir les écrans ouverts ---------- */
function rafraichir(){signaler();
 /* fiche client ouverte derrière : on la redessine au retour */
 var blocs=$$('.ent-bloc');blocs.forEach(function(x){var k=x.querySelector('[data-entnew]');if(k){var o=client(k.getAttribute('data-entnew'))||{cle:k.getAttribute('data-entnew')};var t=d.createElement('div');t.innerHTML=bloc(o);if(t.firstChild)x.replaceWith(t.firstChild)}});}

/* ---------- Réglages : l'interrupteur ---------- */
var menu=$('#menu');
if(menu)menu.addEventListener('click',function(){setTimeout(function(){
 var c=$('#x-in .card.menu');if(!c||c.querySelector('#rg-ent'))return;
 var b=d.createElement('button');b.id='rg-ent';b.type='button';
 b.innerHTML='<span class="av">'+IC.clim+'</span><span class="tx"><b>Contrats d\'entretien</b><small>Clim, pompe à chaleur : rappels d\'entretien à vos clients</small></span><span class="sw'+(on()?' on':'')+'" role="switch" aria-checked="'+on()+'"></span>';
 var ap=$('#rg-aides',c);c.insertBefore(b,ap?ap.nextSibling:c.firstChild);
 b.addEventListener('click',function(){var v=!on();lsS('pc-ent-on',v);var w=b.querySelector('.sw');w.classList.toggle('on',v);w.setAttribute('aria-checked',String(v));majPlanning();signaler();
  X.toast(v?'Contrats d\'entretien affichés':'Contrats d\'entretien cachés',v?'Dans Clients, menu « Entretiens », et dans chaque fiche client.':'Vos contrats restent gardés. Rallumez ici à tout moment.')});
},0)});

/* ---------- style ---------- */
var st=d.createElement('style');
st.textContent=':root{--k-ent:#3F7FA6}@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--k-ent:#7FB2D3}}:root[data-theme="dark"]{--k-ent:#7FB2D3}'+
 '.ent-bloc{display:grid;gap:10px}.ent-bt{display:flex;align-items:center;gap:10px}.ent-bt b{font-size:15.5px}'+
 '.ent-ic{flex:none;width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:var(--teinte,var(--soft));color:var(--n1-nuit,var(--fg))}.ent-ic svg,.ent-av svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}'+
 '.ent-v{margin:0;color:var(--muted);font-size:14px}.ent-add{justify-self:start;display:inline-flex;align-items:center;gap:6px}.ent-add svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}'+
 '.ent-bloc .lst{margin:0}.ent-av.on{box-shadow:0 0 0 2px var(--n1-laiton,#A8823F)}'+
 '.ent-sec{margin:14px 2px 6px;display:flex;align-items:baseline;justify-content:space-between}.ent-sec h3{margin:0;font-size:15px}.ent-sec span{color:var(--muted);font-weight:700;font-size:13px}'+
 '.ent-ou{display:grid;gap:4px}.ent-ou small{color:var(--muted);font-weight:700;font-size:12.5px;text-transform:uppercase;letter-spacing:.04em}.ent-ou b{font-size:18px}.ent-ou .btn{margin-top:8px}'+
 '.ent-tl{list-style:none;margin:0;padding:0;display:grid;gap:12px}.ent-tl li{display:flex;gap:10px;align-items:flex-start}.ent-tl li>span{display:grid;gap:1px}.ent-tl small{color:var(--muted);font-size:13px}'+
 '.ent-tl i{flex:none;width:22px;height:22px;border-radius:50%;display:grid;place-items:center;border:2px solid var(--line);margin-top:1px}.ent-tl li.ok i{background:var(--n1-nuit,var(--fg));border-color:transparent;color:var(--n1-nuit-fg,#fff)}.ent-tl li.on i{border-color:var(--n1-laiton,#A8823F)}.ent-tl li.on b{color:var(--cor-ink,#C8463C)}'+
 '.ent-tl i svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round}'+
 '#x-in .btn svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round;vertical-align:-3px;margin-right:6px}'+
 '.ent-loi{display:grid;gap:6px;margin-top:10px;background:var(--teinte,var(--soft));box-shadow:none}.ent-loi p{margin:0;font-size:13.5px;line-height:1.4}'+
 '.ent-pt{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin:14px 0 4px}'+
 '.ent-wz h3{margin:14px 2px 12px;font-size:19px}.ent-bar{height:6px;border-radius:9px;background:var(--line);overflow:hidden}.ent-bar i{display:block;height:100%;background:var(--n1-nuit,var(--fg));border-radius:9px;transition:width .3s var(--doux,ease)}'+
 '.ent-ch{display:grid;gap:10px;grid-template-columns:1fr}.ent-o{display:grid!important;gap:2px;text-align:left;justify-items:start;padding:14px 16px!important;min-height:56px;width:100%}.ent-o b{font-size:16px}.ent-o small{color:var(--muted);font-weight:600;font-size:13px}'+
 '.ent-o[aria-checked="true"]{box-shadow:inset 0 0 0 2px var(--n1-nuit,var(--fg))!important;background:color-mix(in srgb,var(--n1-nuit,#1B2440) 8%,var(--bg))!important}'+
 '@media (min-width:600px){.ent-ch{grid-template-columns:1fr 1fr}}'+
 '.ent-lab{display:grid;gap:6px;margin-top:14px;font-weight:700;font-size:14px}.ent-lab input{font:inherit;font-size:17px;padding:12px 14px;border-radius:14px;border:1px solid var(--line);background:var(--bg);color:var(--fg);box-shadow:var(--in)}'+
 '.ent-cl{max-height:52vh;overflow:auto;margin-top:10px}.ent-rc .it{width:100%;display:flex;align-items:center;gap:10px;text-align:left;background:none;border:0;color:inherit;font:inherit;padding:11px 12px;border-bottom:1px solid var(--line);cursor:pointer}.ent-rc .it:last-child{border-bottom:0}.ent-rc .tx{flex:1;display:grid;gap:1px}.ent-rc small{color:var(--muted);font-size:12.5px;font-weight:700}.ent-rc b{font-size:15.5px}.ent-rc .go{color:var(--muted);font-size:18px}'+
 '.ent-tot{margin-top:12px;font-weight:700}'+
 '#x-in .ent-w{display:flex!important;align-items:center;justify-content:center;gap:4px;width:100%;min-height:48px;margin-top:10px;text-decoration:none;box-sizing:border-box}'+
 /* téléphone : 4 tuiles dans Clients, rangées 2 par 2 pour que « Entretiens » se lise en entier */
 '@media (max-width:560px){html[data-tu="menu"] body .seg.tm.cl-seg4{grid-template-columns:repeat(2,minmax(0,1fr))}}';
d.head.appendChild(st);

/* ---------- démarrage ---------- */
tourner();majPlanning();
new MutationObserver(function(){C=null;tourner();majPlanning();signaler()}).observe(root,{attributes:true,attributeFilter:['class']});
window.PCENT={on:on,vue:vue,bloc:bloc,urgents:urgents,fiche:fiche,nouveau:nouveau,liste:function(){return liste()},etat:etat};
signaler();
})();
