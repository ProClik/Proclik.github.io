/* Journée de chantier et heures sup (idée de Cyril, 17/11).
   - « J'y vais » sur le chantier : ouvre son GPS (choix déjà dans l'Espace, gps.js) et note l'heure de départ.
     L'arrivée est CALCULÉE (trajet du dépôt au chantier + marge pour les bouchons) : l'artisan n'a rien à toucher en arrivant.
   - Arrêt chez le fournisseur : « Liste donnée au fournisseur ✓ » en bas des fournitures donne une vraie heure ;
     l'arrivée est recalculée depuis là. La liste reste juste au-dessus pour y revenir à tout moment.
   - Rien touché le matin : la journée démarre à l'heure prévue dans le calendrier pour ce chantier.
   - Récap du soir, une question à la fois, tout en boutons : arrivée (estimée, à confirmer d'un toucher), ce qui a été fait
     (les lignes du chantier), combien de personnes, la pause, l'heure de fin. Arrêt d'office à 18 h si oublié.
     Les heures vont dans la main-d'œuvre réelle du chantier (coût réel) et l'avancement se met à jour.
     Ce sont les heures du CHANTIER, pas un pointage par salarié : personne ne pointe, personne ne se compare.
   - Heures sup (règle de Cyril) : JAMAIS tirées du chrono. Cliky pose la question au patron (le soir ou le lendemain matin),
     il ajoute des heures à qui il veut, ou « Rien ». Récap du mois par salarié pour les vrais coûts et la paie
     (ProClik ne fait pas la paie : pas de taux de majoration ici).
   Démonstration : tout reste sur l'appareil (pc-jr, pc-jr-reg, pc-eq, pc-hs). */
(function(){
"use strict";
var X=window.PCX;if(!X)return;
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
var esc=X.esc,CH=X.CH;
var lget=function(k,d){return X.lsGet(k,d)},lset=function(k,v){X.lsSet(k,v)};
var JR=lget('pc-jr',{}),REG=Object.assign({marge:10,pause:60,jour:true,hs:true},lget('pc-jr-reg',{})),EQ=lget('pc-eq',null),HS=lget('pc-hs',[]);
if(!EQ)EQ=[{id:'s1',p:'Kevin',h:35},{id:'s2',p:'Mathis',h:35}];
/* En option dans Cliky (Cyril 17/11) : l'entreprise active ou non chaque partie. Cliky non pris = rien ne s'affiche. */
var cliky=function(){return window.PCOPT&&PCOPT.cliky!=null?!!PCOPT.cliky:X.lsGet('pc-cliky',true)};
var onJ=function(){return cliky()&&REG.jour!==false},onH=function(){return cliky()&&REG.hs!==false};
var save=function(){lset('pc-jr',JR);lset('pc-jr-reg',REG);lset('pc-eq',EQ);lset('pc-hs',HS)};

/* ---------- heures ---------- */
var VITESSE=50;/* km/h moyens, PROVISOIRE : en attendant le vrai service d'itinéraire */
var DEPOT={lat:45.203,lon:5.839};/* même dépôt que la carte de démonstration */
var FIN_AUTO=18*60;
var mn=function(h){var m=String(h||'').match(/(\d{1,2})\D+(\d{2})/);return m?(+m[1])*60+(+m[2]):null};
var hm=function(m){m=Math.round(m);return Math.floor(m/60)+':'+('0'+(m%60)).slice(-2)};
var hmLong=function(m){m=Math.round(m);var h=Math.floor(m/60),r=m%60;return h+' h'+(r?' '+('0'+r).slice(-2):'')};
var duree=function(m){m=Math.round(m);var h=Math.floor(m/60),r=m%60;return (h?h+' h':'')+(h&&r?' ':'')+(r?r+' min':'')||'0 min'};
var hFr=function(h){return String(Math.round(h*100)/100).replace('.',',')};
var maintenant=function(){var d=new Date();return d.getHours()*60+d.getMinutes()};
var jourIso=function(dec){var d=new Date(X.TODAY||new Date());d.setDate(d.getDate()+(dec||0));return X.iso(d)};
var jourTxt=function(iso){return new Date(iso+'T12:00:00').toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'})};
var cle=function(d,ch){return d+'|'+ch};

/* ---------- trajet estimé ---------- */
function km(a,b){var R=6371,r=Math.PI/180,dl=(b.lat-a.lat)*r,dn=(b.lon-a.lon)*r,x=Math.sin(dl/2)*Math.sin(dl/2)+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(dn/2)*Math.sin(dn/2);return 2*R*Math.asin(Math.sqrt(x))}
function lieu(c){var P=(X.PINS||window.PINS||[]).filter(function(p){return p.name===c.n||p.dos===c.dos||p.ch===c.id})[0];return P&&P.lat?{lat:P.lat,lon:P.lon}:null}
function trajet(c){var L=lieu(c);if(!L)return {km:null,min:20,txt:'environ 20 min de route (adresse sans position)'};
 var d=Math.max(1,km(DEPOT,L)*1.3),m=Math.max(5,Math.round(d/VITESSE*60));return {km:Math.round(d),min:m,txt:'environ '+duree(m)+' de route ('+Math.round(d)+' km)'}}
function arrivee(j,c){var t=trajet(c),marge=REG.marge||0;
 if(j.four!=null)return {m:j.four+t.min+marge,src:'fournisseur',det:'liste donnée au fournisseur à '+hmLong(j.four)+' + '+t.txt+' + '+marge+' min de marge'};
 if(j.dep!=null)return {m:j.dep+t.min+marge,src:'calcul',det:'départ à '+hmLong(j.dep)+' + '+t.txt+' + '+marge+' min de marge'};
 return {m:j.cal,src:'calendrier',det:'heure prévue dans votre calendrier (rien touché ce matin)'}}

/* ---------- la journée d'un chantier ---------- */
function evJour(d){return (X.EV||[]).filter(function(e){return e.d===d&&e.x&&e.x.ch!=null&&(e.k==='run'||e.k==='plan')})}
function chDeEv(e){var v=e.x.ch;if(CH[v])return CH[v];if(v===1)return CH.alpes;return null}
function journee(d,ch,creer){var k=cle(d,ch),j=JR[k];if(j||!creer)return j||null;j=JR[k]={d:d,ch:ch,dep:null,four:null,cal:null,pers:null,fait:{},ok:false};return j}
/* Calendrier en secours : un chantier prévu aujourd'hui, l'heure passée, rien touché → la journée démarre à l'heure du calendrier. */
function secoursCalendrier(){var d=jourIso(0),now=maintenant(),ch=false;
 evJour(d).forEach(function(e){var c=chDeEv(e);if(!c||c.st==='done')return;var s=mn(e.s);if(s==null||now<s)return;
  var j=journee(d,c.id,true);if(j.cal==null){j.cal=s;ch=true}});if(ch)save()}
function aujourdhui(){secoursCalendrier();var d=jourIso(0);return Object.keys(JR).map(function(k){return JR[k]}).filter(function(j){return j.d===d&&CH[j.ch]&&(j.dep!=null||j.four!=null||j.cal!=null)})}
function finDe(j){if(j.fin!=null)return {m:j.fin,src:j.finSrc||'recap'};var now=maintenant();return now>=FIN_AUTO?{m:FIN_AUTO,src:'auto'}:{m:now,src:'maintenant'}}
function heures(j,c){var a=j.arr!=null?j.arr:arrivee(j,c).m,f=finDe(j).m,p=j.pause!=null?j.pause:REG.pause;return Math.max(0,(f-a-p))/60*(j.pers||1)}

/* ---------- styles ---------- */
var css='.jr-c{display:grid;gap:10px}.jr-c .jr-h{display:flex;align-items:center;gap:10px}.jr-c .jr-h b{font-size:16px}.jr-c .jr-h small{display:block;color:var(--muted);font-size:13px;font-weight:600}'+
 '.jr-ic{flex:none;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:var(--soft,#EEF1F6)}.jr-ic svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}'+
 '.jr-go{width:100%;min-height:54px;font-size:16px}.jr-l{display:grid;gap:4px;font-size:14px}.jr-l span{display:flex;justify-content:space-between;gap:10px}.jr-l em{font-style:normal;color:var(--muted);font-size:12.5px}'+
 '.jr-l .btn{align-items:center!important;min-height:50px;height:auto!important;padding:8px 14px!important;text-align:left;gap:12px}.jr-l .btn b{text-align:right}'+
 '.jr-est{display:inline-block;font-size:11.5px;font-weight:800;padding:2px 8px;border-radius:999px;background:var(--soft,#EEF1F6);color:var(--muted);margin-left:6px;vertical-align:1px}'+
 '#jr-fil{display:grid;gap:12px;margin:0 0 14px}#jr-fil .card{margin:0}'+
 '.jr-bar{display:flex;gap:5px;margin:0 0 12px}.jr-bar i{flex:1;height:5px;border-radius:9px;background:var(--line,rgba(0,0,0,.1))}.jr-bar i.ok{background:var(--n1-nuit,#1B2440)}.jr-bar i.cur{background:var(--n1-laiton,#A8823F)}'+
 '.jr-q{font-size:20px;font-weight:800;line-height:1.3;margin:0 0 4px}.jr-sub{color:var(--muted);font-size:13.5px;margin:0 0 14px}'+
 '.jr-big{font-size:34px;font-weight:800;text-align:center;margin:6px 0 12px;font-variant-numeric:tabular-nums}'+
 '.jr-row{display:flex;gap:8px;flex-wrap:wrap}.jr-row .btn{flex:1;min-height:48px;min-width:64px}'+
 '.jr-ch{display:grid;gap:12px}.jr-o{display:grid;gap:6px}.jr-o b{font-size:14.5px}.jr-o .jr-row .btn{min-width:0;padding:0 6px;font-size:13.5px;min-height:44px}'+
 '.jr-ok{display:flex;gap:10px;margin-top:16px}.jr-ok .btn{flex:1;min-height:52px}'+
 '.jr-hs{display:grid;gap:10px}.jr-s{display:grid;gap:8px;padding:12px;border-radius:16px;background:var(--soft,#EEF1F6)}.jr-s .jr-sh{display:flex;align-items:center;justify-content:space-between;gap:8px}'+
 '.jr-step{display:flex;align-items:center;gap:8px}.jr-step b{min-width:64px;text-align:center;font-variant-numeric:tabular-nums}.jr-step .btn{min-width:48px;min-height:44px}'+
 '.jr-s input{width:100%;min-height:42px;border-radius:12px;border:0;padding:8px 12px;font:inherit;background:var(--card,#fff);color:inherit}'+
 '.jr-m{display:grid;gap:10px}.jr-m .jr-s span{display:flex;justify-content:space-between;gap:10px;font-size:13.5px}'+
 '.jr-sw .sw:not(.on){background:var(--line,rgba(0,0,0,.15))!important;box-shadow:inset 0 0 0 1px var(--line,rgba(0,0,0,.15))}.jr-sw{display:flex;align-items:center;justify-content:space-between;gap:12px}.jr-sw span{font-weight:700}.jr-sw small{display:block;color:var(--muted);font-size:12.5px;font-weight:600;margin-top:2px}'+
 '.jr-four{margin-top:12px;padding:12px;border-radius:16px;background:var(--soft,#EEF1F6);display:grid;gap:8px}.jr-four b{font-size:14.5px}'+
 '@media print{body>*:not(#jr-print){display:none!important}}';
var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

var I=function(p){return '<svg viewBox="0 0 24 24" aria-hidden="true">'+p+'</svg>'};
var IC={route:I('<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h6a4 4 0 0 0 0-8h-4a4 4 0 0 1 0-8h6"/>'),
 horloge:I('<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/>'),
 equipe:I('<circle cx="9" cy="8" r="3.2"/><path d="M3 20a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="2.5"/><path d="M15.5 14.2A5 5 0 0 1 21 19"/>'),
 coche:I('<path d="M4 12.5l5 5L20 6.5"/>')};

/* ---------- carte « Journée » dans le chantier ---------- */
function carteChantier(c){if(c.st==='done'||!onJ())return '';var d=jourIso(0);secoursCalendrier();var j=journee(d,c.id,false);
 if(!j||(j.dep==null&&j.four==null&&j.cal==null))return '<div class="card jr-c" id="jr-ch"><div class="jr-h"><span class="jr-ic">'+IC.route+'</span><span><b>Journée sur ce chantier</b><small>Ouvre votre GPS. Cliky calcule votre arrivée : rien à toucher sur place.</small></span></div>'+
  '<button type="button" class="btn go jr-go" data-jrgo="'+esc(c.id)+'">J\'y vais</button></div>';
 if(j.ok)return '<div class="card jr-c" id="jr-ch"><div class="jr-h"><span class="jr-ic">'+IC.coche+'</span><span><b>Journée enregistrée</b><small>'+hmLong(j.arr)+' → '+hmLong(j.fin)+' · '+(j.pers||1)+' personne'+((j.pers||1)>1?'s':'')+' · '+hFr(j.h)+' h ajoutées au chantier</small></span></div>'+
  '<button type="button" class="btn" data-jrrecap="'+esc(c.id)+'">Revoir le récap</button></div>';
 var a=arrivee(j,c),f=finDe(j);
 return '<div class="card jr-c" id="jr-ch"><div class="jr-h"><span class="jr-ic">'+IC.horloge+'</span><span><b>Arrivé vers '+hmLong(a.m)+'<span class="jr-est">estimée</span></b><small>'+esc(a.det)+'</small></span></div>'+
  (f.src==='auto'?'<p class="hint">Arrêté d\'office à 18 h. Le récap prend 20 secondes.</p>':'<p class="hint">Le soir, un récap de 20 secondes. Oublié ? Arrêt d\'office à 18 h.</p>')+
  '<button type="button" class="btn go jr-go" data-jrrecap="'+esc(c.id)+'">Faire le récap du jour</button></div>'}

/* ---------- « Liste donnée au fournisseur » en bas des fournitures ---------- */
function blocFournisseur(c){if(c.st==='done'||!onJ())return '';var j=journee(jourIso(0),c.id,false);
 if(j&&j.four!=null)return '<div class="jr-four" id="jr-four"><b>✓ Liste donnée au fournisseur à '+hmLong(j.four)+'</b><span class="hint">Votre arrivée sur le chantier est recalculée depuis là. Un oubli ? La liste est juste au-dessus.</span>'+
  '<div class="jr-row"><button type="button" class="btn" data-jrlst>Revoir la liste</button><button type="button" class="btn" data-jrfx="'+esc(c.id)+'">Annuler l\'heure</button></div></div>';
 return '<div class="jr-four" id="jr-four"><b>Au comptoir du fournisseur ?</b><span class="hint">Donnez la liste ci-dessus, puis touchez ce bouton : Cliky note l\'heure et recalcule votre arrivée.</span>'+
  '<button type="button" class="btn go jr-go" data-jrfv="'+esc(c.id)+'">Liste donnée au fournisseur ✓</button></div>'}

/* ---------- fil de l'Accueil ---------- */
function fil(){var v=$('#v-accueil');if(!v)return;var f=$('#jr-fil');
 if(!f){f=document.createElement('div');f.id='jr-fil';var acc=$('#acc',v);if(acc)acc.parentNode.insertBefore(f,acc);else v.insertBefore(f,v.firstChild)}
 var h='',now=maintenant(),d=jourIso(0);
 if(onJ())aujourdhui().forEach(function(j){if(j.ok)return;var c=CH[j.ch],a=arrivee(j,c),fi=finDe(j),soir=now>=16*60;
  h+='<div class="card jr-c"><div class="jr-h"><span class="jr-ic">'+IC.horloge+'</span><span><b>'+esc(c.n)+' · arrivé vers '+hmLong(a.m)+'<span class="jr-est">estimée</span></b><small>'+
   (fi.src==='auto'?'Arrêté d\'office à 18 h. Il ne manque que votre récap.':soir?'Fin de journée : votre récap prend 20 secondes.':esc(a.det))+'</small></span></div>'+
   (soir||fi.src==='auto'?'<button type="button" class="btn go jr-go" data-jrrecap="'+esc(c.id)+'">Faire le récap du jour</button>':'')+'</div>'});
 if(onJ()&&!aujourdhui().length){var e=evJour(d).map(chDeEv).filter(function(c){return c&&c.st!=='done'})[0];
  if(e)h+='<div class="card jr-c"><div class="jr-h"><span class="jr-ic">'+IC.route+'</span><span><b>Aujourd\'hui : '+esc(e.n)+'</b><small>'+esc(e.v)+' · touchez en partant, Cliky s\'occupe de l\'heure.</small></span></div><button type="button" class="btn go jr-go" data-jrgo="'+esc(e.id)+'">J\'y vais</button></div>'}
 var q=questionHS();if(q)h+='<div class="card jr-c"><div class="jr-h"><span class="jr-ic">'+IC.equipe+'</span><span><b>Des heures en plus '+(q===d?'aujourd\'hui':'hier')+' ?</b><small>Pour votre équipe. Vous seul décidez.</small></span></div>'+
  '<div class="jr-row"><button type="button" class="btn" data-jrhsrien="'+q+'">Rien</button><button type="button" class="btn go" data-jrhs="'+q+'">Ouvrir mon équipe</button></div></div>';
 var m=moisHS(d.slice(0,7));if(m.total&&onH())h+='<button type="button" class="card jr-c" data-jrmois style="text-align:left;width:100%"><div class="jr-h"><span class="jr-ic">'+IC.equipe+'</span><span><b>Heures sup de '+moisNom(d)+' : '+hmLong(m.total*60)+'</b><small>Récap par salarié, à imprimer ou à envoyer au comptable ›</small></span></div></button>';
 f.innerHTML=h;f.hidden=!h}

/* ---------- récap du soir (une question à la fois) ---------- */
var RC=null;
function recap(id){var c=CH[id];if(!c)return;var d=jourIso(0),j=journee(d,id,true);secoursCalendrier();
 if(j.dep==null&&j.four==null&&j.cal==null)j.cal=8*60;
 var a=arrivee(j,c),fi=finDe(j),O=c.ouv.map(function(o,i){return [i,o]}).filter(function(x){return x[1][2]<100||(j.fait&&j.fait[x[0]]!=null)});
 RC={id:id,k:0,arr:j.arr!=null?j.arr:a.m,arrSrc:j.arrSrc||a.src,det:a.det,fin:j.fin!=null?j.fin:fi.m,finSrc:j.finSrc||fi.src,pers:j.pers||REG.pers||1,pause:j.pause!=null?j.pause:REG.pause,
  fait:Object.assign({},j.fait||{}),O:O,av:{}};O.forEach(function(x){RC.av[x[0]]=x[1][2];if(RC.fait[x[0]]==null)RC.fait[x[0]]=x[1][2]});
 if(j.ok)RC.k=4;rcRendre()}
var ETAPES=['arr','fait','pers','fin','recap'];
function rcRendre(){var c=CH[RC.id],e=ETAPES[RC.k],h='<div class="jr-bar">'+ETAPES.map(function(_,i){return '<i class="'+(i<RC.k?'ok':i===RC.k?'cur':'')+'"></i>'}).join('')+'</div>';
 if(e==='arr')h+='<p class="jr-q">Vous êtes arrivé vers '+hmLong(RC.arr)+' ?</p><p class="jr-sub">'+(RC.arrSrc==='modifiee'?'Heure corrigée par vous.':'Estimée : '+esc(RC.det)+'.')+'</p>'+
  '<div class="jr-big">'+hm(RC.arr)+'</div><div class="jr-row"><button type="button" class="btn" data-jra="-15">− 15 min</button><button type="button" class="btn" data-jra="15">+ 15 min</button></div>'+
  '<div class="jr-ok"><button type="button" class="btn go" data-jrn>C\'est bon</button></div>';
 if(e==='fait')h+='<p class="jr-q">Qu\'avez-vous fait aujourd\'hui ?</p><p class="jr-sub">Touchez où en est chaque ligne. Rien à écrire.</p><div class="jr-ch">'+
  (RC.O.length?RC.O.map(function(x){var i=x[0],v=RC.fait[i],a=RC.av[i];
   return '<div class="jr-o"><b>'+esc(x[1][0])+'</b><div class="jr-row">'+[[a,'Pas touché'],[25,'25 %'],[50,'50 %'],[75,'75 %'],[100,'Fini']].filter(function(p,k){return k===0||p[0]>a}).map(function(p){
    return '<button type="button" class="btn" data-jrf="'+i+'" data-v="'+p[0]+'" aria-pressed="'+(v===p[0])+'">'+p[1]+'</button>'}).join('')+'</div></div>'}).join(''):'<p class="hint">Toutes les lignes sont déjà finies.</p>')+'</div>'+
  '<div class="jr-ok"><button type="button" class="btn" data-jrb>← Retour</button><button type="button" class="btn go" data-jrn>Continuer</button></div>';
 if(e==='pers')h+='<p class="jr-q">Vous étiez combien sur le chantier ?</p><p class="jr-sub">Vous compris. Ça sert seulement au coût du chantier.</p><div class="jr-row">'+[1,2,3,4,5].map(function(n){
   return '<button type="button" class="btn" data-jrp="'+n+'" aria-pressed="'+(RC.pers===n)+'">'+n+(n===5?' et +':'')+'</button>'}).join('')+'</div>'+
  '<div class="jr-ok"><button type="button" class="btn" data-jrb>← Retour</button></div>';
 if(e==='fin')h+='<p class="jr-q">'+(RC.finSrc==='auto'?'Arrêté d\'office à 18 h. Vous avez fini vers quelle heure ?':'Vous finissez à '+hmLong(RC.fin)+' ?')+'</p><p class="jr-sub">Et la pause de midi, retirée des heures.</p>'+
  '<div class="jr-big">'+hm(RC.fin)+'</div><div class="jr-row"><button type="button" class="btn" data-jre="-15">− 15 min</button><button type="button" class="btn" data-jre="15">+ 15 min</button></div>'+
  '<p class="jr-sub" style="margin:14px 0 6px">Pause de midi</p><div class="jr-row">'+[[0,'Aucune'],[30,'30 min'],[60,'1 h'],[90,'1 h 30']].map(function(p){return '<button type="button" class="btn" data-jrz="'+p[0]+'" aria-pressed="'+(RC.pause===p[0])+'">'+p[1]+'</button>'}).join('')+'</div>'+
  '<div class="jr-ok"><button type="button" class="btn" data-jrb>← Retour</button><button type="button" class="btn go" data-jrn>C\'est bon</button></div>';
 if(e==='recap'){var t=Math.max(0,RC.fin-RC.arr-RC.pause),tot=Math.round(t/60*RC.pers*4)/4,ch=RC.O.filter(function(x){return RC.fait[x[0]]!==RC.av[x[0]]});
  h+='<p class="jr-q">Tout est bon ?</p><p class="jr-sub">Touchez une ligne pour la changer.</p><div class="jr-l">'+
   '<button type="button" class="btn" data-jrk="0" style="justify-content:space-between;display:flex"><span>Arrivée</span><b>'+hmLong(RC.arr)+(RC.arrSrc==='modifiee'?'':' (estimée)')+'</b></button>'+
   '<button type="button" class="btn" data-jrk="1" style="justify-content:space-between;display:flex"><span>Avancement</span><b>'+(ch.length?ch.map(function(x){return esc(x[1][0])+' → '+RC.fait[x[0]]+' %'}).join(', '):'inchangé')+'</b></button>'+
   '<button type="button" class="btn" data-jrk="2" style="justify-content:space-between;display:flex"><span>Personnes</span><b>'+RC.pers+'</b></button>'+
   '<button type="button" class="btn" data-jrk="3" style="justify-content:space-between;display:flex"><span>Fin · pause</span><b>'+hmLong(RC.fin)+' · '+(RC.pause?duree(RC.pause):'sans pause')+'</b></button></div>'+
   '<div class="jr-big" style="font-size:24px;margin-top:14px">'+hFr(tot)+' h <small style="font-size:14px;color:var(--muted)">de main-d\'œuvre</small></div>'+
   '<p class="hint" style="text-align:center">'+duree(t)+(RC.pers>1?' × '+RC.pers+' personnes':'')+', ajoutées au coût réel de '+esc(c.n)+'.</p>'+
   '<div class="jr-ok"><button type="button" class="btn" data-jrb>← Retour</button><button type="button" class="btn go" data-jrv>Valider la journée</button></div>'}
 X.xopen('Récap du jour',c.n+' · '+jourTxt(jourIso(0)),'<div id="jr-rc">'+h+'</div>','',rcLier)}
function rcLier(){var b=$('#jr-rc');if(!b)return;
 b.addEventListener('click',function(ev){var t=ev.target.closest('button');if(!t)return;var s=t.dataset;
  if(s.jra){RC.arr+=+s.jra;RC.arrSrc='modifiee';return rcRendre()}
  if(s.jre){RC.fin=Math.min(23*60,RC.fin+(+s.jre));RC.finSrc='modifiee';return rcRendre()}
  if(s.jrz!=null){RC.pause=+s.jrz;return rcRendre()}
  if(s.jrf!=null){RC.fait[+s.jrf]=+s.v;return rcRendre()}
  if(s.jrp){RC.pers=+s.jrp;RC.k++;return rcRendre()}
  if(s.jrk!=null){RC.k=+s.jrk;return rcRendre()}
  if(s.jrn!=null){RC.k++;return rcRendre()}
  if(s.jrb!=null){RC.k=Math.max(0,RC.k-1);return rcRendre()}
  if(s.jrv!=null)return valider()})}
function valider(){var c=CH[RC.id],d=jourIso(0),j=journee(d,RC.id,true),t=Math.max(0,RC.fin-RC.arr-RC.pause),tot=Math.round(t/60*RC.pers*4)/4;
 c.mo=c.mo||{prev:0,reel:0,taux:0};if(j.ok&&j.h)c.mo.reel=Math.max(0,Math.round((c.mo.reel-j.h)*100)/100);c.mo.reel=Math.round((c.mo.reel+tot)*100)/100;
 var cad=[];RC.O.forEach(function(x){var i=x[0],v=RC.fait[i];if(v!=null&&v!==c.ouv[i][2]){cad.push([x[1][0],c.ouv[i][2],v]);c.ouv[i][2]=v}});
 Object.assign(j,{arr:RC.arr,arrSrc:RC.arrSrc,fin:RC.fin,finSrc:RC.finSrc,pers:RC.pers,pause:RC.pause,fait:RC.fait,h:tot,ok:true,cad:cad});
 REG.pause=RC.pause;REG.pers=RC.pers;save();X.saveCH();X.xclose();
 if(X.updPin)try{X.updPin(c,X.avc(c))}catch(e){}
 X.toast('Journée enregistrée',hFr(tot)+' h ajoutées à '+c.n+'.');majPartout()}

/* ---------- heures sup ---------- */
function questionHS(){if(!EQ.length||!onH())return null;var now=maintenant(),d0=jourIso(0),d1=jourIso(-1),fait=lget('pc-hs-q',{});
 if(now>=16*60&&!fait[d0])return d0;if(now<12*60&&!fait[d1])return d1;return null}
function marquer(d){var f=lget('pc-hs-q',{});f[d]=1;lset('pc-hs-q',f)}
var HQ=null;
function feuilleHS(d){HQ={d:d,L:{}};EQ.forEach(function(s){var ex=HS.filter(function(x){return x.d===d&&x.s===s.id})[0];HQ.L[s.id]={h:ex?ex.h:0,ch:ex?ex.ch:(aujourdhui()[0]||{}).ch||'',m:ex?ex.m:''}});hsRendre()}
function chOptions(v){return '<option value="">Sans chantier</option>'+Object.keys(CH).filter(function(k){return CH[k].st!=='done'||k===v}).map(function(k){return '<option value="'+esc(k)+'"'+(k===v?' selected':'')+'>'+esc(CH[k].n)+'</option>'}).join('')}
function hsRendre(){var h='<p class="jr-sub">Ajoutez des heures à qui vous voulez. Personne d\'autre ne les saisit.</p><div class="jr-hs">'+EQ.map(function(s){var x=HQ.L[s.id];
  return '<div class="jr-s"><div class="jr-sh"><b>'+esc(s.p)+'</b><small style="color:var(--muted)">'+s.h+' h par semaine</small></div>'+
   '<div class="jr-step"><button type="button" class="btn" data-hsm="'+s.id+'" aria-label="Moins 30 minutes">−</button><b>'+(x.h?'+ '+hmLong(x.h*60):'Rien')+'</b><button type="button" class="btn" data-hsp="'+s.id+'" aria-label="Plus 30 minutes">+</button></div>'+
   (x.h?'<select data-hsc="'+s.id+'" aria-label="Chantier">'+chOptions(x.ch)+'</select><input data-hst="'+s.id+'" value="'+esc(x.m)+'" placeholder="Motif (facultatif)" aria-label="Motif">':'')+'</div>'}).join('')+'</div>'+
  '<div class="jr-ok"><button type="button" class="btn" data-hseq>Mon équipe</button><button type="button" class="btn go" data-hsok>Enregistrer</button></div>';
 X.xopen('Heures en plus · '+(HQ.d===jourIso(0)?'aujourd\'hui':'hier'),jourTxt(HQ.d),'<div id="jr-hsf">'+h+'</div>','',hsLier)}
function hsLier(){var b=$('#jr-hsf');if(!b)return;
 b.addEventListener('click',function(ev){var t=ev.target.closest('button');if(!t)return;var s=t.dataset;
  if(s.hsp||s.hsm){var x=HQ.L[s.hsp||s.hsm];x.h=Math.max(0,Math.min(8,x.h+(s.hsp?.5:-.5)));return hsRendre()}
  if(s.hseq!=null)return equipe();
  if(s.hsok!=null){HS=HS.filter(function(x){return x.d!==HQ.d});EQ.forEach(function(sa){var x=HQ.L[sa.id];if(x.h>0)HS.push({d:HQ.d,s:sa.id,h:x.h,ch:x.ch,m:x.m})});
   marquer(HQ.d);save();X.xclose();var n=HS.filter(function(x){return x.d===HQ.d}).reduce(function(a,x){return a+x.h},0);X.toast(n?'Heures en plus enregistrées':'Rien pour ce jour',n?hmLong(n*60)+' au total, dans le récap du mois.':'');majPartout()}});
 $$('#jr-hsf [data-hsc]').forEach(function(x){x.addEventListener('change',function(){HQ.L[x.dataset.hsc].ch=x.value})});
 $$('#jr-hsf [data-hst]').forEach(function(x){x.addEventListener('input',function(){HQ.L[x.dataset.hst].m=x.value})})}
function equipe(){var h='<p class="jr-sub">Les personnes payées au mois. Leur horaire sert de repère, rien n\'est calculé tout seul.</p><div class="jr-hs">'+EQ.map(function(s,i){
  return '<div class="jr-s"><div class="jr-sh"><b>'+esc(s.p)+'</b><button type="button" class="btn sm" data-eqx="'+i+'">Retirer</button></div><div class="jr-step"><button type="button" class="btn" data-eqm="'+i+'">−</button><b>'+s.h+' h / sem.</b><button type="button" class="btn" data-eqp="'+i+'">+</button></div></div>'}).join('')+
  '<form class="jr-s" id="jr-eqf"><input id="jr-eqn" placeholder="Prénom du salarié" aria-label="Prénom du salarié" autocapitalize="words"><button class="btn go">Ajouter</button></form></div>'+
  (EQ.length?'':'<p class="hint">Sans salarié, la question des heures en plus ne s\'affiche plus.</p>')+
  '<div class="jr-ok"><button type="button" class="btn go" data-eqok>C\'est bon</button></div>';
 X.xopen('Mon équipe','','<div id="jr-eq">'+h+'</div>','',function(){var b=$('#jr-eq');
  b.addEventListener('click',function(ev){var t=ev.target.closest('button');if(!t)return;var s=t.dataset;
   if(s.eqx!=null){EQ.splice(+s.eqx,1);save();return equipe()}
   if(s.eqp!=null||s.eqm!=null){var e=EQ[+(s.eqp||s.eqm)];e.h=Math.max(1,Math.min(48,e.h+(s.eqp!=null?1:-1)));save();return equipe()}
   if(s.eqok!=null){save();if(HQ){feuilleHS(HQ.d)}else{X.xclose();majPartout()}}});
  $('#jr-eqf').addEventListener('submit',function(e){e.preventDefault();var v=$('#jr-eqn').value.trim();if(!v)return;v=v.charAt(0).toUpperCase()+v.slice(1);EQ.push({id:'s'+Date.now(),p:v,h:35});save();equipe()})})}
var MOISN=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
function moisNom(iso){return MOISN[+iso.slice(5,7)-1]}
function moisHS(m){var L=HS.filter(function(x){return x.d.slice(0,7)===m}),P={};L.forEach(function(x){(P[x.s]=P[x.s]||[]).push(x)});
 return {L:L,P:P,total:L.reduce(function(a,x){return a+x.h},0)}}
function nomSal(id){var s=EQ.filter(function(x){return x.id===id})[0];return s?s.p:'(retiré de l\'équipe)'}
function texteMois(m){var R=moisHS(m),t='Heures supplémentaires · '+moisNom(m+'-01')+' '+m.slice(0,4)+'\n(heures notées par le patron ; les majorations sont à appliquer selon la convention collective)\n';
 Object.keys(R.P).forEach(function(s){var L=R.P[s].sort(function(a,b){return a.d<b.d?-1:1});t+='\n'+nomSal(s)+' : '+hmLong(L.reduce(function(a,x){return a+x.h},0)*60)+'\n'+L.map(function(x){
  return '- '+new Date(x.d+'T12:00:00').toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'numeric'})+' : '+hmLong(x.h*60)+(x.ch&&CH[x.ch]?' · '+CH[x.ch].n:'')+(x.m?' · '+x.m:'')}).join('\n')+'\n'});return t}
function feuilleMois(){var m=jourIso(0).slice(0,7),R=moisHS(m);
 var h='<div class="jr-m">'+(Object.keys(R.P).length?Object.keys(R.P).map(function(s){var L=R.P[s].sort(function(a,b){return a.d<b.d?-1:1}),t=L.reduce(function(a,x){return a+x.h},0);
  return '<div class="jr-s"><div class="jr-sh"><b>'+esc(nomSal(s))+'</b><b>'+hmLong(t*60)+'</b></div>'+L.map(function(x){return '<span><em>'+esc(new Date(x.d+'T12:00:00').toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'numeric'}))+(x.ch&&CH[x.ch]?' · '+esc(CH[x.ch].n):'')+(x.m?' · '+esc(x.m):'')+'</em><b>+ '+hmLong(x.h*60)+'</b></span>'}).join('')+'</div>'}).join(''):'<p class="hint">Aucune heure en plus ce mois-ci.</p>')+
  '<p class="hint">Les heures notées par vous. Les majorations dépendent de la convention collective : votre comptable les applique sur la paie.</p></div>'+
  '<div class="jr-ok"><button type="button" class="btn" data-mimp>Imprimer</button><button type="button" class="btn go" data-menv>Envoyer au comptable</button></div>';
 X.xopen('Heures sup de '+moisNom(m+'-01'),'Total : '+hmLong(R.total*60),'<div id="jr-mo">'+h+'</div>','',function(){var b=$('#jr-mo');
  b.addEventListener('click',function(ev){var t=ev.target.closest('button');if(!t)return;
   if(t.dataset.menv!=null)location.href='mailto:?subject='+encodeURIComponent('Heures supplémentaires · '+moisNom(m+'-01'))+'&body='+encodeURIComponent(texteMois(m));
   if(t.dataset.mimp!=null){var p=document.getElementById('jr-print')||document.createElement('pre');p.id='jr-print';p.style.cssText='white-space:pre-wrap;font:14px/1.5 system-ui;padding:20px';p.textContent=texteMois(m);document.body.appendChild(p);
    setTimeout(function(){window.print();setTimeout(function(){p.remove()},500)},50)}})})}

/* ---------- réglages dans la fiche Cliky (Mes options) ---------- */
function sw(k,t,sub){return '<div class="ch-sw jr-sw"><span>'+t+'<small>'+sub+'</small></span><button type="button" class="sw'+(REG[k]!==false?' on':'')+'" role="switch" aria-checked="'+(REG[k]!==false)+'" data-jrsw="'+k+'" aria-label="'+t+'" style="border:0;padding:0"></button></div>'}
function reglagesHTML(){return '<div class="xsec" id="jr-reg"><h3>À activer ou non pour votre entreprise</h3><div class="card jr-c">'+
 sw('jour','Journée de chantier','« J\'y vais », arrivée calculée, récap du soir à cocher. Les heures vont dans le coût du chantier.')+
 sw('hs','Heures sup de l\'équipe','Cliky vous demande le soir ou le lendemain. Récap du mois pour la paie.')+
 (REG.hs!==false?'<button type="button" class="btn" data-jreq>Mon équipe ('+EQ.length+')</button>':'')+'</div></div>'}
document.addEventListener('click',function(e){var t=e.target.closest&&e.target.closest('[data-jrsw],[data-jreq]');if(!t)return;
 if(t.dataset.jreq!=null){HQ=null;return equipe()}
 var k=t.dataset.jrsw;REG[k]=REG[k]===false;save();var r=$('#jr-reg');if(r)r.outerHTML=reglagesHTML();
 X.toast(REG[k]?'Activé':'Désactivé',k==='jour'?'Journée de chantier':'Heures sup de l\'équipe');majPartout()});

/* ---------- branchements ---------- */
function partir(id){var c=CH[id];if(!c)return;var d=jourIso(0),j=journee(d,id,true);j.dep=maintenant();j.ok=false;save();
 var o=c.dos&&X.DOS&&X.DOS[c.dos],adr=(o&&o.adr&&!/\[/.test(o.adr)?o.adr:c.v)||c.v;
 if(window.PCGPS)PCGPS.ouvrir(adr);X.toast('Bonne route','Arrivée estimée vers '+hmLong(arrivee(j,c).m)+'. Rien à toucher en arrivant.');majPartout()}
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-jrgo],[data-jrrecap],[data-jrfv],[data-jrfx],[data-jrlst],[data-jrhs],[data-jrhsrien],[data-jrmois]');if(!b)return;var s=b.dataset;
 if(s.jrgo)return partir(s.jrgo);
 if(s.jrrecap)return recap(s.jrrecap);
 if(s.jrfv){var j=journee(jourIso(0),s.jrfv,true);j.four=maintenant();j.ok=false;save();X.toast('Liste donnée ✓','Arrivée recalculée vers '+hmLong(arrivee(j,CH[s.jrfv]).m)+'.');return majPartout()}
 if(s.jrfx){var j2=journee(jourIso(0),s.jrfx,false);if(j2){j2.four=null;save()}return majPartout()}
 if(s.jrlst!=null){var l=$('#ch-four');if(l)l.scrollIntoView({behavior:'smooth',block:'start'});return}
 if(s.jrhs)return feuilleHS(s.jrhs);
 if(s.jrhsrien){marquer(s.jrhsrien);X.toast('Noté : rien en plus','');return fil()}
 if(s.jrmois!=null)return feuilleMois()});
var curCh=null,setCur=X.setCurCh;X.setCurCh=function(v){curCh=v;if(setCur)setCur(v)};
function injecter(){var chx=$('#chx');if(!chx||!curCh||!CH[curCh])return;var c=CH[curCh];
 var r=$('.ch-res',chx);if(r){var o=$('#jr-ch',chx),h=carteChantier(c);if(o)o.outerHTML=h;else if(h)r.insertAdjacentHTML('afterend',h)}
 var f=$('#ch-four',chx);if(f){var o2=$('#jr-four',chx),h2=blocFournisseur(c);if(o2)o2.outerHTML=h2;else if(h2)f.insertAdjacentHTML('beforeend',h2)}}
function majPartout(){injecter();fil()}
var chx=$('#chx');if(chx)new MutationObserver(function(){if(!$('#jr-ch',chx)&&$('.ch-res',chx)||!$('#jr-four',chx)&&$('#ch-four',chx))injecter()}).observe(chx,{childList:true,subtree:true});
fil();setInterval(fil,60000);
document.addEventListener('visibilitychange',function(){if(!document.hidden)majPartout()});
window.PCJR={reglagesHTML:reglagesHTML,recap:recap,partir:partir,heuresSup:feuilleHS,mois:feuilleMois,equipe:equipe,_jr:function(){return JR},_hs:function(){return HS}};
})();
