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
var JR=lget('pc-jr',{}),REG=Object.assign({marge:10,pause:60,jour:true,hs:true,cp:'',detour:0},lget('pc-jr-reg',{})),EQ=lget('pc-eq',null),HS=lget('pc-hs',[]);
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
/* Icônes de véhicules ProClik (17/11) : profil de côté, trait fin bleu nuit arrondi, roues avec moyeu laiton (rappel du point du logo).
   viewBox 0 0 48 32, sol à y=26. Classe .vk-c = carrosserie, .vk-w = roue, .vk-h = moyeu laiton, .vk-g = vitre (trait léger). */
var VMOD=[
 ['berline','Berline','<path class="vk-c" d="M4 22.5v-3.2c0-1.2.8-2.2 2-2.5l6.5-1.6 5.6-4.4c1-.8 2.2-1.2 3.4-1.2h9c1.4 0 2.7.6 3.6 1.6l3.4 4 4.4 1c1.2.3 2.1 1.4 2.1 2.6v3.7"/><path class="vk-c" d="M10.5 23h7.5M30 23h7.5M4 23h2.5M41.5 23H44"/><path class="vk-g" d="M14 15.5l4.6-3.6c.7-.5 1.5-.8 2.4-.8h4.5v4.4zM28.5 11.1h2.6c.9 0 1.8.4 2.4 1.1l2.8 3.3h-7.8z"/>',[14.3,33.8]],
 ['suv','SUV','<path class="vk-c" d="M4 22.5v-5.4c0-1 .6-1.9 1.6-2.2l5.4-1.8 3.8-5c.8-1 2-1.6 3.3-1.6h15.6c1.2 0 2.3.5 3.1 1.4l4.7 5.3 1.7.5c1 .3 1.8 1.2 1.8 2.3v6.5"/><path class="vk-c" d="M10.5 23h7.5M30 23h7.5M4 23h2.5M41.5 23H44"/><path class="vk-g" d="M14.2 13.2l2.6-3.4c.4-.5 1-.8 1.6-.8h5.1v4.2zM26.5 9h6.4c.6 0 1.1.3 1.5.7l3.1 3.5h-11z"/><path class="vk-c" d="M18 5.5h14"/>',[14.3,33.8]],
 ['fourgonnette','Fourgonnette','<path class="vk-c" d="M4 22.5V9.6C4 8.2 5.2 7 6.6 7h19.6c1 0 2 .5 2.6 1.3l5.4 6.5 6.3 1.3c1.3.3 2.3 1.4 2.3 2.7v3.7"/><path class="vk-c" d="M10.5 23h7.5M30 23h7.5M4 23h2.5M41.5 23H44"/><path class="vk-g" d="M27 10h1.2c.5 0 .9.2 1.2.5l3.7 4.5H27z"/><path class="vk-c" d="M22.5 8v14"/>',[14.3,33.8]],
 ['fourgon','Fourgon','<path class="vk-c" d="M3 22.5V6.8C3 5.3 4.3 4 5.8 4H31c1.2 0 2.2.6 2.8 1.6l5.3 9.4 4.6 1.4c1.3.4 2.3 1.6 2.3 3v3.1"/><path class="vk-c" d="M10.5 23h7.5M30.5 23h7M3 23h3.5M41.5 23H46"/><path class="vk-g" d="M31.5 7h.3c.5 0 1 .3 1.2.7l3.9 7.3h-5.4z"/><path class="vk-c" d="M27 4.5v18M3 17h24"/>',[14.3,34.3]],
 ['benne','Camion benne','<path class="vk-c" d="M30 22.5V9.3c0-1.3 1.1-2.3 2.3-2.3h4.2c.9 0 1.7.5 2.1 1.3l3.7 7.2 1.6.8c.9.4 1.4 1.3 1.4 2.3v4"/><path class="vk-g" d="M33 10h3.1c.4 0 .8.2 1 .6l2.3 4.4H33z"/><path class="vk-c" d="M2.5 18.5h26.5M4 18.5L2.5 9.5h25l1.5 9"/><path class="vk-c" d="M6 13.5h20" opacity=".55"/><path class="vk-c" d="M10.5 23h3.5M22 23h9.7M38.3 23H44M2.5 23h1.5V18.5"/>',[7.3,18,35]],
 ['plateau','Plateau','<path class="vk-c" d="M30 22.5V9.3c0-1.3 1.1-2.3 2.3-2.3h4.2c.9 0 1.7.5 2.1 1.3l3.7 7.2 1.6.8c.9.4 1.4 1.3 1.4 2.3v4"/><path class="vk-g" d="M33 10h3.1c.4 0 .8.2 1 .6l2.3 4.4H33z"/><path class="vk-c" d="M2 18.5h27.5M2 18.5v-2.5M29.5 18.5v-3"/><path class="vk-c" d="M10.5 23h3.5M22 23h9.7M38.3 23H44M3 23h1"/>',[7.3,18,35]],
 ['pickup','Pick-up','<path class="vk-c" d="M3.5 22.5v-6.3h20V9.4c0-1.3 1.1-2.4 2.4-2.4h7.5c1 0 1.9.5 2.4 1.3l4.3 6.7 2.6.7c1.3.4 2.3 1.6 2.3 3v3.8"/><path class="vk-g" d="M26.5 10h6.3c.5 0 .9.2 1.1.6l3 4.4H26.5z"/><path class="vk-c" d="M3.5 16.2v-2.7"/><path class="vk-c" d="M10.5 23h7.5M30.5 23h7M3.5 23h3M41.5 23h3"/>',[14.3,34.3]]];
function vIcone(mod,cls){var m=VMOD.filter(function(x){return x[0]===mod})[0]||VMOD[3];
 return '<svg class="vk'+(cls?' '+cls:'')+'" viewBox="0 0 48 32" aria-hidden="true">'+m[2]+m[3].map(function(x){return '<circle class="vk-w" cx="'+x+'" cy="23.2" r="3.4"/><circle class="vk-h" cx="'+x+'" cy="23.2" r="1.15"/>'}).join('')+'<path class="vk-s" d="M2 29.5h44"/></svg>'}
var VCSS='.vk{width:100%;height:100%;overflow:visible}.vk .vk-c,.vk .vk-w{fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}'+
 '.vk .vk-g{fill:color-mix(in srgb,currentColor 9%,transparent);stroke:currentColor;stroke-width:1.1;stroke-linejoin:round;opacity:.75}'+
 '.vk .vk-h{fill:var(--n1-laiton,#A8823F)}.vk .vk-s{stroke:currentColor;stroke-width:1;stroke-linecap:round;opacity:.18}';
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
 '.vh{display:grid;gap:14px}.vh-l{display:grid;gap:10px}'+
 '.vh-c{display:flex;align-items:center;gap:12px;width:100%;text-align:left;padding:14px;border-radius:18px;border:0;font:inherit;color:inherit;background:var(--n1-calme,var(--card,#fff));box-shadow:var(--n1-pk,0 1px 3px rgba(0,0,0,.12))}'+
 '.vh-c .go{margin-left:auto;color:var(--muted);font-size:20px}.vh-t{display:grid;gap:2px;min-width:0;flex:1}.vh-t b{font-size:16px}.vh-t em,.vh-hd em{font-style:normal;font-size:12px;font-weight:800;padding:1px 7px;border-radius:6px;border:1.5px solid var(--line,rgba(0,0,0,.15));margin-left:6px;letter-spacing:.04em;vertical-align:2px}'+
 '.vh-t small{color:var(--muted);font-size:13px;font-weight:600}.vh-t .vh-m{color:var(--fg)}'+
 '.vh-i{flex:none;width:48px;height:48px;border-radius:14px;display:grid;place-items:center;background:var(--n1-bg,var(--soft,#EEF1F6));color:var(--n1-nuit,#1B2440)}.vh-i svg,.vh-o span svg{width:26px;height:26px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}.vh-i.lg{width:60px;height:60px;border-radius:18px}.vh-i.lg svg{width:32px;height:32px}'+
 '.vh-add{display:flex;align-items:center;justify-content:center;gap:10px;min-height:56px;border-radius:18px;border:2px dashed var(--line,rgba(0,0,0,.18));background:none;font:inherit;font-weight:800;color:inherit}.vh-add span{font-size:22px;line-height:1}'+
 '.vh-g,.vh-f{display:grid;gap:12px;padding:14px;border-radius:18px;background:var(--n1-calme,var(--card,#fff))}.vh-g>b{font-size:15px}'+
 '.vh label,.vh-lab{display:grid;gap:6px;font-weight:800;font-size:14.5px}.vh label small,.vh-lab small{display:block;color:var(--muted);font-weight:600;font-size:12.5px}'+
 '.vh input:not([type=date]),.vh-d input{width:100%;min-height:48px;border-radius:14px;border:0;padding:10px 14px;font:inherit;font-size:16px;background:var(--n1-bg,var(--bg));color:inherit;box-shadow:var(--n1-in,inset 0 1px 3px rgba(0,0,0,.12))}'+
 '.vh-d{display:flex!important;align-items:center;justify-content:space-between;gap:10px}.vh-d input{max-width:180px;min-height:44px}'+
 '.vh-ch{display:grid;grid-template-columns:repeat(auto-fill,minmax(104px,1fr));gap:8px}'+
 '.vh-o{display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 6px;border-radius:16px;border:0;font:inherit;font-weight:700;font-size:13.5px;color:inherit;background:var(--n1-bg,var(--bg));box-shadow:var(--n1-pk,0 1px 3px rgba(0,0,0,.12))}'+
 '.vh-o span{display:grid;place-items:center;color:var(--muted)}.vh-o[aria-pressed=true]{background:var(--n1-nuit,#1B2440);color:var(--n1-nuit-fg,#fff)}.vh-o[aria-pressed=true] span{color:var(--n1-laiton,#A8823F)}'+
 '.vh-big{display:flex;align-items:baseline;gap:10px}.vh-big input{max-width:130px;font-size:30px!important;font-weight:800;text-align:center;font-variant-numeric:tabular-nums}.vh-big span{color:var(--muted);font-weight:700}.vh-big.sm input{font-size:22px!important;max-width:110px}'+
 '.vh-bs{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px}.vh-b{font-size:12px;font-weight:800;padding:3px 9px;border-radius:999px;background:var(--n1-bg,var(--soft,#EEF1F6));color:var(--muted)}.vh-b.wa{background:color-mix(in srgb,var(--n1-warn,#C98A1B) 18%,transparent);color:var(--n1-warn,#9A6A10)}.vh-b.al{background:color-mix(in srgb,var(--n1-alert,#B9577A) 18%,transparent);color:var(--n1-alert,#B9577A)}'+
 '.vh-hd{display:flex;gap:14px;align-items:center}.vh-hd b{font-size:19px}.vh-hd small{display:block;color:var(--muted);font-weight:600}'+
 '.vh-k{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.vh-k div{padding:12px 8px;border-radius:16px;background:var(--n1-calme,var(--card,#fff));text-align:center}.vh-k b{display:block;font-size:20px;font-variant-numeric:tabular-nums}.vh-k small{color:var(--muted);font-weight:600;font-size:12px}'+
 '.vh-sec{display:grid;gap:6px;padding:14px;border-radius:18px;background:var(--n1-calme,var(--card,#fff))}.vh-r{display:flex;justify-content:space-between;gap:10px;font-size:13.5px;border-top:1px solid var(--line,rgba(0,0,0,.08));padding-top:6px}.vh-r em{font-style:normal;color:var(--muted)}.vh-r b{white-space:nowrap}'+
 '.vh-pick{display:grid;gap:8px}.vh-pick .vh-tick{flex:none;width:30px;height:30px;border-radius:50%;display:grid;place-items:center;box-shadow:var(--n1-in,inset 0 1px 3px rgba(0,0,0,.12));color:transparent}.vh-pick .vh-tick svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2.4}'+
 '.vh-pick.on .vh-c{box-shadow:0 0 0 2px var(--n1-nuit,#1B2440)}.vh-pick.on .vh-tick{background:var(--n1-nuit,#1B2440);color:var(--n1-nuit-fg,#fff)}.vh-qui{padding:0 6px}.vh-qui small{color:var(--muted);font-weight:700}'+
 VCSS+'.vh-i .vk{width:40px;height:27px}.vh-i.lg .vk{width:50px;height:33px}.vh-i svg.vk,.vh-o span svg.vk{fill:none;stroke:none}.vh-m .vh-o span svg.vk{width:58px;height:38px}.vk .vk-h{stroke:none}'+'.vh-m{grid-template-columns:repeat(auto-fill,minmax(96px,1fr))}.vh-m .vh-o{padding:10px 6px 9px;gap:4px;font-size:12.5px}.vh-m .vh-o span{width:62px;height:40px;color:var(--n1-nuit,#1B2440)}.vh-m .vh-o[aria-pressed=true] span{color:var(--n1-nuit-fg,#fff)}.vh-m .vh-o[aria-pressed=true] .vk-h{fill:#D4B483}'+'.jr-four{margin-top:12px;padding:12px;border-radius:16px;background:var(--soft,#EEF1F6);display:grid;gap:8px}.jr-four b{font-size:14.5px}'+
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
 if(onJ())h+=filEcheances();
 var q=questionHS();if(q)h+='<div class="card jr-c"><div class="jr-h"><span class="jr-ic">'+IC.equipe+'</span><span><b>Des heures en plus '+(q===d?'aujourd\'hui':'hier')+' ?</b><small>Pour votre équipe. Vous seul décidez.</small></span></div>'+
  '<div class="jr-row"><button type="button" class="btn" data-jrhsrien="'+q+'">Rien</button><button type="button" class="btn go" data-jrhs="'+q+'">Ouvrir mon équipe</button></div></div>';
 var m=moisHS(d.slice(0,7));if(m.total&&onH())h+='<button type="button" class="card jr-c" data-jrmois style="text-align:left;width:100%"><div class="jr-h"><span class="jr-ic">'+IC.equipe+'</span><span><b>Heures sup de '+moisNom(d)+' : '+hmLong(m.total*60)+'</b><small>Récap par salarié, à imprimer ou à envoyer au comptable ›</small></span></div></button>';
 f.innerHTML=h;f.hidden=!h}

/* ---------- récap du soir (une question à la fois) ---------- */
var RC=null;
function recap(id){var c=CH[id];if(!c)return;var d=jourIso(0),j=journee(d,id,true);secoursCalendrier();
 if(j.dep==null&&j.four==null&&j.cal==null)j.cal=8*60;
 var a=arrivee(j,c),fi=finDe(j),O=c.ouv.map(function(o,i){return [i,o]}).filter(function(x){return x[1][2]<100||(j.fait&&j.fait[x[0]]!=null)});
 RC={carb:null,id:id,k:0,arr:j.arr!=null?j.arr:a.m,arrSrc:j.arrSrc||a.src,det:a.det,fin:j.fin!=null?j.fin:fi.m,finSrc:j.finSrc||fi.src,pers:j.pers||REG.pers||1,pause:j.pause!=null?j.pause:REG.pause,
  fait:Object.assign({},j.fait||{}),O:O,av:{}};O.forEach(function(x){RC.av[x[0]]=x[1][2];if(RC.fait[x[0]]==null)RC.fait[x[0]]=x[1][2]});
 RC.vehs=(j.vehs||vehDefaut(c)).filter(vehDe);RC.cond=Object.assign({},j.cond||{});RC.vehs.forEach(function(id){var v=vehDe(id);if(!RC.cond[id]&&v&&(v.ass||[]).length===1)RC.cond[id]=v.ass[0]});
 if(j.ok)RC.k=99;rcRendre()}
function etapes(){return ['arr','fait','pers','fin'].concat(VEHS().length>1?['veh']:[],['recap'])}
function rcRendre(){var ETAPES=RC.E=etapes();if(RC.k>=ETAPES.length)RC.k=ETAPES.length-1;var c=CH[RC.id],e=ETAPES[RC.k],h='<div class="jr-bar">'+ETAPES.map(function(_,i){return '<i class="'+(i<RC.k?'ok':i===RC.k?'cur':'')+'"></i>'}).join('')+'</div>';
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
 if(e==='veh')h+='<p class="jr-q">Quel véhicule aujourd\'hui ?</p><p class="jr-sub">Un ou plusieurs. Les kilomètres comptent pour chacun.</p><div class="vh-l">'+VEHS().map(function(v){var on=RC.vehs.indexOf(v.id)>=0,A=v.ass||[];
   return '<div class="vh-pick'+(on?' on':'')+'"><button type="button" class="vh-c" data-rcv="'+v.id+'" aria-pressed="'+on+'"><span class="vh-i">'+vIcone(v.mod)+'</span><span class="vh-t"><b>'+esc(v.nom)+(v.plaque?' <em>'+esc(v.plaque)+'</em>':'')+'</b><small>'+(A.length?A.map(nomP).join(', '):'Personne d\'attribué')+'</small></span><span class="vh-tick">'+IC.coche+'</span></button>'+
    (on&&A.length>1?'<div class="vh-qui"><small>Qui conduisait ?</small><div class="jr-row">'+A.map(function(a){return '<button type="button" class="btn" data-rcc="'+v.id+'" data-p="'+a+'" aria-pressed="'+(RC.cond[v.id]===a)+'">'+esc(nomP(a))+'</button>'}).join('')+'</div></div>':'')+'</div>'}).join('')+'</div>'+
  '<div class="jr-ok"><button type="button" class="btn" data-jrb>← Retour</button><button type="button" class="btn go" data-jrn>C\'est bon</button></div>';
 if(e==='recap'){var t=Math.max(0,RC.fin-RC.arr-RC.pause),tot=Math.round(t/60*RC.pers*4)/4,ch=RC.O.filter(function(x){return RC.fait[x[0]]!==RC.av[x[0]]});
  h+='<p class="jr-q">Tout est bon ?</p><p class="jr-sub">Touchez une ligne pour la changer.</p><div class="jr-l">'+
   '<button type="button" class="btn" data-jrk="0" style="justify-content:space-between;display:flex"><span>Arrivée</span><b>'+hmLong(RC.arr)+(RC.arrSrc==='modifiee'?'':' (estimée)')+'</b></button>'+
   '<button type="button" class="btn" data-jrk="1" style="justify-content:space-between;display:flex"><span>Avancement</span><b>'+(ch.length?ch.map(function(x){return esc(x[1][0])+' → '+RC.fait[x[0]]+' %'}).join(', '):'inchangé')+'</b></button>'+
   '<button type="button" class="btn" data-jrk="2" style="justify-content:space-between;display:flex"><span>Personnes</span><b>'+RC.pers+'</b></button>'+
   '<button type="button" class="btn" data-jrk="3" style="justify-content:space-between;display:flex"><span>Fin · pause</span><b>'+hmLong(RC.fin)+' · '+(RC.pause?duree(RC.pause):'sans pause')+'</b></button>'+trajLigne()+'</div>'+
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
  if(s.jrn!=null){if(RC.E[RC.k]==='veh')RC.carb=null;RC.k++;return rcRendre()}
  if(s.jrb!=null){RC.k=Math.max(0,RC.k-1);return rcRendre()}
  if(s.rcv){var i=RC.vehs.indexOf(s.rcv);if(i<0){RC.vehs.push(s.rcv);var v=vehDe(s.rcv);if(v&&(v.ass||[]).length===1)RC.cond[s.rcv]=v.ass[0]}else RC.vehs.splice(i,1);RC.carb=null;return rcRendre()}
  if(s.rcc){RC.cond[s.rcc]=s.p;return rcRendre()}
  if(s.jrv!=null)return valider()})}
function trajLigne(){var T=RC.carb;if(!T){var sync=true;coutTrajet(journee(jourIso(0),RC.id,true),CH[RC.id],RC.vehs,function(x){RC.carb=x;if(!sync&&RC.E[RC.k]==='recap'&&$('#jr-rc'))rcRendre()});sync=false;T=RC.carb;
  if(!T)return '<div class="btn" style="justify-content:space-between;display:flex"><span>Trajets</span><b>calcul…</b></div>'}
 var lig=function(g,d,attr){return '<'+(attr?'button type="button" '+attr:'div')+' class="btn jr-tr" style="justify-content:space-between;display:flex"><span style="display:flex!important;flex-direction:column;align-items:flex-start;text-align:left;flex:1;min-width:0">'+g+'</span><b style="flex:none">'+d+'</b></'+(attr?'button':'div')+'>'};
 if(T.err==='veh')return lig('Trajets · '+T.km+' km','Ajoutez votre véhicule ›','data-jrvh');
 if(T.err==='choix')return lig('Trajets · '+T.km+' km','Aucun véhicule choisi');
 if(T.L==null)return lig('Trajets',esc(T.err));
 return T.L.map(function(x){var v=vehDe(x.veh)||{nom:'Véhicule'},n=VEHS().length>1?esc(v.nom)+' · ':'';
  if(x.err)return lig(n+'Trajets · '+T.km+' km',x.err==='prix'?'Notez son prix ›':'À régler ›','data-jrvh');
  return lig(n+'Trajets · '+x.km+' km<small style="display:block;color:var(--muted);font-size:12px;font-weight:600">'+fr2(x.q)+' '+x.u+' × '+fr2(x.prix,3)+' € ('+esc(x.src)+')'+(RC.cond[x.veh]?' · '+esc(nomP(RC.cond[x.veh])):'')+'</small>',fr2(x.eur)+' €')}).join('')}
function valider(){var c=CH[RC.id],d=jourIso(0),j=journee(d,RC.id,true),t=Math.max(0,RC.fin-RC.arr-RC.pause),tot=Math.round(t/60*RC.pers*4)/4;
 c.mo=c.mo||{prev:0,reel:0,taux:0};if(j.ok&&j.h)c.mo.reel=Math.max(0,Math.round((c.mo.reel-j.h)*100)/100);c.mo.reel=Math.round((c.mo.reel+tot)*100)/100;
 var cad=[];RC.O.forEach(function(x){var i=x[0],v=RC.fait[i];if(v!=null&&v!==c.ouv[i][2]){cad.push([x[1][0],c.ouv[i][2],v]);c.ouv[i][2]=v}});
 Object.assign(j,{arr:RC.arr,arrSrc:RC.arrSrc,fin:RC.fin,finSrc:RC.finSrc,pers:RC.pers,pause:RC.pause,fait:RC.fait,h:tot,ok:true,cad:cad});
 c.trajets=(c.trajets||[]).filter(function(x){return x.d!==d});j.traj=null;j.vehs=RC.vehs.slice();j.cond=Object.assign({},RC.cond);
 if(RC.carb&&RC.carb.L){var V=RC.carb.L.filter(function(x){return x.eur!=null}).map(function(x){return Object.assign({cond:RC.cond[x.veh]||null},x)});
  if(V.length){c.trajets.push({d:d,km:RC.carb.km,eur:Math.round(V.reduce(function(a,x){return a+x.eur},0)*100)/100,vehs:V});j.traj=c.trajets[c.trajets.length-1]}}
 REG.pause=RC.pause;REG.pers=RC.pers;save();X.saveCH();X.xclose();
 if(X.updPin)try{X.updPin(c,X.avc(c))}catch(e){}
 X.toast('Journée enregistrée',hFr(tot)+' h'+(j.traj?' et '+fr2(j.traj.eur)+' € de trajet':'')+' ajoutés à '+c.n+'.');majPartout()}

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

/* ---------- étape B : véhicules et carburant (Cyril 17/11) ----------
   « Mes véhicules » : un ou plusieurs véhicules, chacun attribué à des personnes de l'équipe (ou à vous),
   avec son carburant et sa consommation (lue sur le tableau de bord : rien d'inventé).
   Prix du jour : service ProClik (/espace/carburant, données publiques des prix à la pompe, médiane du secteur du dépôt).
   Sans service (démo) ou sans réponse : le prix noté pour ce véhicule. Électrique : son prix du kWh.
   Kilomètres du jour, par véhicule : dépôt → chantier → dépôt, + le détour fournisseur s'il y est passé.
   Suivi complet d'un véhicule : km, carburant et € du mois, par chantier et par conducteur, historique, échéances
   (contrôle technique, entretien, assurance) rappelées dans le fil 30 jours avant. */
var CARB=[['gazole','Diesel'],['e10','Essence E10'],['sp95','SP95'],['sp98','SP98'],['e85','E85'],['gplc','GPL'],['elec','Électrique']];
var carbNom=function(t){var x=CARB.filter(function(c){return c[0]===t})[0];return x?x[1]:t};
var uniteV=function(v){return v.type==='elec'?'kWh':'L'};
var PJ=lget('pc-carb',{});if(PJ&&PJ.type)PJ={};
var fr2=function(n,d){return Number(n).toLocaleString('fr-FR',{minimumFractionDigits:d==null?2:d,maximumFractionDigits:d==null?2:d})};
/* anciens réglages (un seul véhicule) → liste */
if(!REG.vehs){REG.vehs=REG.veh&&REG.veh.type?[Object.assign({id:'v1',nom:'Mon véhicule',plaque:'',ass:['moi']},REG.veh)]:[]}delete REG.veh;
var VEHS=function(){return REG.vehs||(REG.vehs=[])};
var vehDe=function(id){return VEHS().filter(function(v){return v.id===id})[0]||null};
var vehPret=function(v){return !!(v&&v.type&&v.conso>0)};
var IV={van:I('<path d="M2.5 16.5V8a2 2 0 0 1 2-2h9.5v10.5"/><path d="M14 9h4.2l3.3 3.6v3.9h-2"/><circle cx="7" cy="17.5" r="2"/><circle cx="17" cy="17.5" r="2"/><path d="M9 17.5h6M2.5 16.5H5"/>'),
 goutte:I('<path d="M12 3.5s6 6.6 6 11a6 6 0 0 1-12 0c0-4.4 6-11 6-11z"/>'),prise:I('<path d="M13 3L6 13h5l-1 8 7-10h-5z"/>'),
 cal:I('<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'),route:IC.route,gens:IC.equipe};
function personnes(){return [{id:'moi',p:'Vous'}].concat(EQ)}
function nomP(id){var x=personnes().filter(function(s){return s.id===id})[0];return x?x.p:'(retiré)'}
function prixCarb(v,cb){if(!vehPret(v))return cb(null);
 if(v.type==='elec')return cb(v.prix>0?{prix:v.prix,src:'votre prix du kWh'}:null);
 var k=v.type+'|'+REG.cp,m=PJ[k];if(m&&Date.now()-m.t<3*3600e3)return cb(m);
 var P=window.PCV,vrai=document.documentElement.classList.contains('pcvrai');
 var repli=function(){cb(v.prix>0?{prix:v.prix,src:'prix noté'}:null)};
 if(!P||!P.api||!vrai||!/^\d{5}$/.test(REG.cp||''))return repli();
 P.api('/espace/carburant?cp='+REG.cp+'&type='+v.type).then(function(x){if(!x||!(x.prix>0))return repli();
  PJ[k]={prix:x.prix,src:'prix du jour, '+x.n+' station'+(x.n>1?'s':'')+(x.cp&&x.cp.length===2?' du département':' du secteur'),t:Date.now()};lset('pc-carb',PJ);cb(PJ[k])},repli)}
function kmJour(j,c){var t=trajet(c);if(t.km==null)return null;return {km:t.km*2+(j.four!=null?(REG.detour||0):0),det:t.km+' km aller, '+t.km+' km retour'+(j.four!=null&&REG.detour?', '+REG.detour+' km de détour fournisseur':'')}}
/* coût des trajets du jour pour les véhicules choisis : [{veh, cond, km, q, u, prix, eur, src} | {veh, err}] */
function coutTrajet(j,c,ids,cb){var k=kmJour(j,c);if(!k)return cb({err:'Adresse du chantier sans position : kilomètres inconnus.'});
 if(!VEHS().length)return cb({err:'veh',km:k.km,det:k.det});
 var L=[],n=ids.length;if(!n)return cb({err:'choix',km:k.km});
 ids.forEach(function(id,i){var v=vehDe(id);if(!vehPret(v)){L[i]={veh:id,err:'veh'};if(!--n)fin();return}
  prixCarb(v,function(p){if(!p)L[i]={veh:id,err:'prix'};else{var q=Math.round(k.km*v.conso/100*100)/100;L[i]={veh:id,km:k.km,q:q,u:uniteV(v),prix:p.prix,src:p.src,eur:Math.round(q*p.prix*100)/100}}if(!--n)fin()})});
 function fin(){cb({km:k.km,det:k.det,L:L,eur:Math.round(L.reduce(function(a,x){return a+(x.eur||0)},0)*100)/100,err:L.some(function(x){return x.err})?'partiel':null})}}
/* véhicules proposés pour la journée : ceux du jour précédent sur ce chantier, sinon ceux attribués à vous, sinon le premier */
function vehDefaut(c){var dern=(c.trajets||[]).slice(-1)[0];if(dern&&dern.vehs)return dern.vehs.map(function(x){return x.veh}).filter(vehDe);
 var a=VEHS().filter(function(v){return (v.ass||[]).indexOf('moi')>=0});return (a.length?[a[0]]:VEHS().slice(0,1)).map(function(v){return v.id})}

/* --- écran « Mes véhicules » --- */
function trajetsTous(){var L=[];Object.keys(CH).forEach(function(k){(CH[k].trajets||[]).forEach(function(t){(t.vehs||[]).forEach(function(x){L.push(Object.assign({d:t.d,ch:k},x))})})});return L.sort(function(a,b){return a.d<b.d?1:-1})}
function statsVeh(id,mois){var L=trajetsTous().filter(function(x){return x.veh===id&&(!mois||x.d.slice(0,7)===mois)});
 return {L:L,km:L.reduce(function(a,x){return a+(x.km||0)},0),q:Math.round(L.reduce(function(a,x){return a+(x.q||0)},0)*10)/10,eur:Math.round(L.reduce(function(a,x){return a+(x.eur||0)},0)*100)/100,j:L.length}}
function echeances(v){var t=new Date(X.TODAY||new Date());return [['ct','Contrôle technique'],['ent','Entretien'],['assu','Assurance']].filter(function(e){return v[e[0]]}).map(function(e){
 var d=new Date(v[e[0]]+'T12:00:00'),n=Math.round((d-t)/864e5);return {k:e[0],nom:e[1],d:v[e[0]],n:n}})}
function badgeEch(e){return '<span class="vh-b'+(e.n<0?' al':e.n<=30?' wa':'')+'">'+esc(e.nom)+' · '+(e.n<0?'dépassé':e.n===0?'aujourd\'hui':e.n<=30?'dans '+e.n+' j':new Date(e.d+'T12:00:00').toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric'}))+'</span>'}
function carteVeh(v){var s=statsVeh(v.id,jourIso(0).slice(0,7)),E=echeances(v).filter(function(e){return e.n<=30});
 return '<button type="button" class="vh-c" data-vhs="'+v.id+'"><span class="vh-i">'+vIcone(v.mod)+'</span><span class="vh-t"><b>'+esc(v.nom||'Véhicule')+(v.plaque?' <em>'+esc(v.plaque)+'</em>':'')+'</b>'+
  '<small>'+(vehPret(v)?carbNom(v.type)+' · '+fr2(v.conso,1)+' '+uniteV(v)+'/100 km':'À régler')+' · '+((v.ass||[]).length?(v.ass||[]).map(nomP).join(', '):'personne d\'attribué')+'</small>'+
  (s.j?'<small class="vh-m">Ce mois : '+fr2(s.km,0)+' km · '+fr2(s.eur)+' €</small>':'')+(E.length?'<span class="vh-bs">'+E.map(badgeEch).join('')+'</span>':'')+'</span><span class="go">›</span></button>'}
function mesVehicules(retour){MV.retour=retour||MV.retour;var V=VEHS();
 var h='<div id="jr-mv" class="vh"><p class="jr-sub">'+(V.length?'Touchez un véhicule pour voir son suivi.':'Ajoutez le véhicule qui va sur vos chantiers. Il sert au coût des trajets.')+'</p>'+
  '<div class="vh-l">'+V.map(carteVeh).join('')+'</div><button type="button" class="vh-add" data-vhn><span>+</span>Ajouter un véhicule</button>'+
  '<div class="vh-g"><b>Pour tous les véhicules</b><label>Code postal du dépôt<small>Pour le prix du jour des stations autour de chez vous.</small><input id="jr-vcp" inputmode="numeric" maxlength="5" value="'+esc(REG.cp||'')+'"></label>'+
  '<div><span class="vh-lab">Détour pour passer chez le fournisseur<small>Ajouté les jours où la liste est donnée au comptoir.</small></span><div class="jr-row">'+[0,5,10,15,20].map(function(n){return '<button type="button" class="btn" data-vhd="'+n+'" aria-pressed="'+((REG.detour||0)===n)+'">'+(n?n+' km':'Aucun')+'</button>'}).join('')+'</div></div></div>'+
  (MV.retour?'<div class="jr-ok"><button type="button" class="btn go" data-vhfin>C\'est bon</button></div>':'')+'</div>';
 X.xopen('Mes véhicules',V.length?V.length+' véhicule'+(V.length>1?'s':''):'','<div>'+h+'</div>','',function(){var b=$('#jr-mv');
  var cp=$('#jr-vcp');cp.addEventListener('change',function(){if(/^\d{5}$/.test(cp.value.trim())){REG.cp=cp.value.trim();save()}});
  b.addEventListener('click',function(ev){var t=ev.target.closest('button');if(!t)return;var s=t.dataset;
   if(s.vhs)return suiviVeh(s.vhs);
   if(s.vhn!=null)return ficheVeh(null);
   if(s.vhd!=null){REG.detour=+s.vhd;save();return mesVehicules()}
   if(s.vhfin!=null){var r=MV.retour;MV.retour=null;if(r)r();else X.xclose()}})})}
var MV={retour:null};
function ficheVeh(id){var v=id?Object.assign({},vehDe(id)):{id:'v'+Date.now(),nom:'',plaque:'',ass:['moi']},nv=!id;F=v;ficheRendre(nv)}
var F=null;
function ficheRendre(nv){var v=F,el=v.type==='elec',P=personnes();
 var h='<div id="jr-fv" class="vh">'+
  '<div class="vh-f"><label>Nom<small>Comme vous l\'appelez : « le Trafic », « camion blanc »…</small><input id="fv-n" value="'+esc(v.nom)+'" placeholder="Nom du véhicule" autocapitalize="sentences"></label>'+
  '<label>Plaque <small>(facultatif)</small><input id="fv-p" value="'+esc(v.plaque)+'" placeholder="AB-123-CD" autocapitalize="characters"></label></div>'+
  '<div class="vh-f"><span class="vh-lab">Modèle</span><div class="vh-ch vh-m">'+VMOD.map(function(m){return '<button type="button" class="vh-o" data-fvm="'+m[0]+'" aria-pressed="'+((v.mod||'fourgon')===m[0])+'"><span>'+vIcone(m[0])+'</span>'+m[1]+'</button>'}).join('')+'</div></div>'+
  '<div class="vh-f"><span class="vh-lab">Carburant</span><div class="vh-ch">'+CARB.map(function(c){return '<button type="button" class="vh-o" data-fvt="'+c[0]+'" aria-pressed="'+(v.type===c[0])+'"><span>'+(c[0]==='elec'?IV.prise:IV.goutte)+'</span>'+c[1]+'</button>'}).join('')+'</div></div>'+
  (v.type?'<div class="vh-f"><span class="vh-lab">Consommation<small>Celle de votre tableau de bord.</small></span><div class="vh-big"><input id="fv-c" inputmode="decimal" value="'+(v.conso?String(v.conso).replace('.',','):'')+'" placeholder="—" aria-label="Consommation"><span>'+(el?'kWh':'L')+' / 100 km</span></div>'+
   '<span class="vh-lab">'+(el?'Votre prix du kWh':'Prix au litre de secours')+'<small>'+(el?'Celui de votre recharge (maison ou borne).':'Utilisé seulement si le prix du jour n\'arrive pas.')+'</small></span><div class="vh-big sm"><input id="fv-x" inputmode="decimal" value="'+(v.prix?String(v.prix).replace('.',','):'')+'" placeholder="—" aria-label="Prix"><span>€ / '+(el?'kWh':'L')+'</span></div></div>':'')+
  '<div class="vh-f"><span class="vh-lab">Qui l\'utilise ?<small>Touchez pour attribuer. Plusieurs personnes possibles.</small></span><div class="vh-ch">'+P.map(function(s){return '<button type="button" class="vh-o" data-fva="'+s.id+'" aria-pressed="'+((v.ass||[]).indexOf(s.id)>=0)+'"><span>'+IV.gens+'</span>'+esc(s.p)+'</button>'}).join('')+'</div></div>'+
  '<div class="vh-f"><span class="vh-lab">Échéances <small>(facultatif) Cliky vous prévient 30 jours avant.</small></span>'+[['ct','Contrôle technique'],['ent','Prochain entretien'],['assu','Assurance']].map(function(e){return '<label class="vh-d">'+e[1]+'<input type="date" data-fvd="'+e[0]+'" value="'+esc(v[e[0]]||'')+'"></label>'}).join('')+'</div>'+
  '<div class="jr-ok">'+(nv?'<button type="button" class="btn" data-fvx>Annuler</button>':'<button type="button" class="btn" data-fvdel>Retirer</button>')+'<button type="button" class="btn go" data-fvok>Enregistrer</button></div></div>';
 X.xopen(nv?'Nouveau véhicule':(v.nom||'Véhicule'),'Réglé une fois','<div>'+h+'</div>','',function(){var b=$('#jr-fv');
  var garder=function(){var n=function(id){var x=$(id);return x?parseFloat(x.value.replace(',','.').replace(/[^\d.]/g,'')):NaN};F.nom=$('#fv-n').value.trim();F.plaque=$('#fv-p').value.trim().toUpperCase();
   var c=n('#fv-c'),p=n('#fv-x');if(isFinite(c)&&c>0&&c<60)F.conso=c;if(isFinite(p)&&p>0&&p<10)F.prix=p;$$('#jr-fv [data-fvd]').forEach(function(x){F[x.dataset.fvd]=x.value||''})};
  b.addEventListener('click',function(ev){var t=ev.target.closest('button');if(!t)return;var s=t.dataset;
   if(s.fvm){garder();F.mod=s.fvm;return ficheRendre(nv)}
   if(s.fvt){garder();if(F.type!==s.fvt){F.type=s.fvt;delete F.conso;delete F.prix}return ficheRendre(nv)}
   if(s.fva){garder();F.ass=F.ass||[];var i=F.ass.indexOf(s.fva);if(i<0)F.ass.push(s.fva);else F.ass.splice(i,1);return ficheRendre(nv)}
   if(s.fvx!=null)return mesVehicules();
   if(s.fvdel!=null){if(t.dataset.arm){REG.vehs=VEHS().filter(function(x){return x.id!==F.id});save();X.toast('Véhicule retiré','Ses trajets passés restent dans les chantiers.');return mesVehicules()}t.dataset.arm=1;t.textContent='Touchez encore pour retirer';return}
   if(s.fvok!=null){garder();if(!F.nom){X.toast('Donnez-lui un nom','Par exemple « le Trafic ».');$('#fv-n').focus();return}if(!vehPret(F)){X.toast('Il manque le carburant ou la consommation','La consommation est sur votre tableau de bord.');return}
    var i=VEHS().map(function(x){return x.id}).indexOf(F.id);if(i<0)VEHS().push(F);else VEHS()[i]=F;save();X.toast('Véhicule enregistré',F.nom+' · '+carbNom(F.type)+' · '+fr2(F.conso,1)+' '+uniteV(F)+'/100 km');return mesVehicules()}})})}
function suiviVeh(id){var v=vehDe(id);if(!v)return mesVehicules();var m=jourIso(0).slice(0,7),s=statsVeh(id,m),T=statsVeh(id,null),E=echeances(v);
 var parCh={},parC={};s.L.forEach(function(x){var a=parCh[x.ch]=parCh[x.ch]||{km:0,eur:0,j:0};a.km+=x.km||0;a.eur+=x.eur||0;a.j++;var c=x.cond||'?',b=parC[c]=parC[c]||{km:0,j:0};b.km+=x.km||0;b.j++});
 var h='<div id="jr-sv" class="vh"><div class="vh-hd"><span class="vh-i lg">'+vIcone(v.mod)+'</span><div><b>'+esc(v.nom)+(v.plaque?' <em>'+esc(v.plaque)+'</em>':'')+'</b><small>'+carbNom(v.type)+' · '+fr2(v.conso,1)+' '+uniteV(v)+'/100 km</small>'+
  '<span class="vh-bs">'+((v.ass||[]).length?(v.ass||[]).map(function(a){return '<span class="vh-b">'+esc(nomP(a))+'</span>'}).join(''):'<span class="vh-b">Personne d\'attribué</span>')+'</span></div></div>'+
  '<div class="vh-k"><div><b>'+fr2(s.km,0)+'</b><small>km en '+moisNom(m+'-01')+'</small></div><div><b>'+fr2(s.q,1)+'</b><small>'+uniteV(v)+'</small></div><div><b>'+fr2(s.eur)+' €</b><small>de carburant</small></div></div>'+
  (E.length?'<div class="vh-sec"><b>Échéances</b><span class="vh-bs">'+E.map(badgeEch).join('')+'</span></div>':'')+
  (s.j?'<div class="vh-sec"><b>Par chantier ce mois</b>'+Object.keys(parCh).map(function(k){var a=parCh[k];return '<span class="vh-r"><em>'+esc(CH[k]?CH[k].n:k)+' · '+a.j+' jour'+(a.j>1?'s':'')+'</em><b>'+fr2(a.km,0)+' km · '+fr2(a.eur)+' €</b></span>'}).join('')+'</div>'+
   '<div class="vh-sec"><b>Par conducteur ce mois</b>'+Object.keys(parC).map(function(k){var a=parC[k];return '<span class="vh-r"><em>'+esc(k==='?'?'Non précisé':nomP(k))+' · '+a.j+' jour'+(a.j>1?'s':'')+'</em><b>'+fr2(a.km,0)+' km</b></span>'}).join('')+'</div>':'<p class="hint">Pas encore de trajet ce mois-ci. Ils arrivent avec le récap du soir.</p>')+
  (T.L.length?'<div class="vh-sec"><b>Historique</b>'+T.L.slice(0,12).map(function(x){return '<span class="vh-r"><em>'+esc(new Date(x.d+'T12:00:00').toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'numeric'}))+' · '+esc(CH[x.ch]?CH[x.ch].n:x.ch)+(x.cond?' · '+esc(nomP(x.cond)):'')+'</em><b>'+fr2(x.km,0)+' km · '+fr2(x.eur)+' €</b></span>'}).join('')+'</div>':'')+
  '<div class="jr-ok"><button type="button" class="btn" data-svb>‹ Mes véhicules</button><button type="button" class="btn go" data-sve>Modifier</button></div></div>';
 X.xopen(v.nom,'Suivi du véhicule','<div>'+h+'</div>','',function(){$('#jr-sv').addEventListener('click',function(ev){var t=ev.target.closest('button');if(!t)return;
  if(t.dataset.svb!=null)return mesVehicules();if(t.dataset.sve!=null)return ficheVeh(id)})})}
/* échéances proches dans le fil */
function filEcheances(){var h='';VEHS().forEach(function(v){echeances(v).filter(function(e){return e.n<=30}).forEach(function(e){
 h+='<button type="button" class="card jr-c" data-vhs2="'+v.id+'" style="text-align:left;width:100%"><div class="jr-h"><span class="jr-ic">'+IV.cal+'</span><span><b>'+esc(e.nom)+' · '+esc(v.nom)+'</b><small>'+(e.n<0?'Date dépassée':e.n===0?'C\'est aujourd\'hui':'Dans '+e.n+' jour'+(e.n>1?'s':''))+' ('+new Date(e.d+'T12:00:00').toLocaleDateString('fr-FR',{day:'numeric',month:'long'})+') ›</small></span></div></button>'})});return h}
document.addEventListener('click',function(e){var t=e.target.closest&&e.target.closest('[data-vhs2]');if(t)suiviVeh(t.dataset.vhs2)});

/* ---------- réglages dans la fiche Cliky (Mes options) ---------- */
function sw(k,t,sub){return '<div class="ch-sw jr-sw"><span>'+t+'<small>'+sub+'</small></span><button type="button" class="sw'+(REG[k]!==false?' on':'')+'" role="switch" aria-checked="'+(REG[k]!==false)+'" data-jrsw="'+k+'" aria-label="'+t+'" style="border:0;padding:0"></button></div>'}
function reglagesHTML(){return '<div class="xsec" id="jr-reg"><h3>À activer ou non pour votre entreprise</h3><div class="card jr-c">'+
 sw('jour','Journée de chantier','« J\'y vais », arrivée calculée, récap du soir à cocher. Les heures vont dans le coût du chantier.')+
 sw('hs','Heures sup de l\'équipe','Cliky vous demande le soir ou le lendemain. Récap du mois pour la paie.')+
 (REG.jour!==false?'<button type="button" class="btn" data-jrvh>Mes véhicules ('+(VEHS().length?VEHS().length+' · '+VEHS().map(function(v){return v.nom}).join(', '):'à ajouter')+')</button>':'')+
 (REG.hs!==false?'<button type="button" class="btn" data-jreq>Mon équipe ('+EQ.length+')</button>':'')+'</div></div>'}
document.addEventListener('click',function(e){var t=e.target.closest&&e.target.closest('[data-jrsw],[data-jreq],[data-jrvh]');if(!t)return;
 if(t.dataset.jreq!=null){HQ=null;return equipe()}
 if(t.dataset.jrvh!=null){if($('#jr-rc'))return mesVehicules(function(){RC.carb=null;RC.vehs=RC.vehs.filter(vehDe);if(!RC.vehs.length)RC.vehs=vehDefaut(CH[RC.id]);rcRendre()});return mesVehicules(null)}
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
window.PCJR={vehicules:mesVehicules,suiviVehicule:suiviVeh,reglagesHTML:reglagesHTML,recap:recap,partir:partir,heuresSup:feuilleHS,mois:feuilleMois,equipe:equipe,_jr:function(){return JR},_hs:function(){return HS}};
})();
