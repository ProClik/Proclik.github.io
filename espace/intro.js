/* Présentation de l'Espace au premier lancement (et depuis le menu « Revoir la présentation »).
   4 images simples + le choix de l'affichage. Un seul gros bouton par écran, on peut glisser du doigt. Cyril, 3/11. */
(function(){
var d=document;
var P='M35.97 74.34V40A20.03 20.03 0 0 1 76.03 40V17.1V40A20.03 20.03 0 0 1 35.97 40',PF='M32.47 40A23.53 23.53 0 1 1 79.53 40A23.53 23.53 0 1 1 32.47 40ZM39.46 40A16.54 16.54 0 1 0 72.54 40A16.54 16.54 0 1 0 39.46 40ZM32.47 38.09H39.46V63.76C39.46 70.21 36.28 72.44 33.1 72.44Q32.47 72.44 32.47 70.53ZM38.19 54.63H45.82V61.22Q39.46 58.17 39.46 63.76H38.19ZM79.53 41.91H72.54V21.24C72.54 18.87 75.72 18.06 78.9 18.06Q79.53 18.06 79.53 19.65ZM73.81 25.37H66.18V18.78Q72.54 21.83 72.54 21.24H73.81Z';
var MIC='<svg class="ic" viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7"/></svg>';
var DOC='<svg class="ic" viewBox="0 0 24 24"><path d="M13 21H6V3h8l4 4v4"/><path d="M14 3v4h4M9 9h4M9 13h3"/></svg>';
var PHO='<svg class="ic" viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="14" rx="3"/><circle cx="12" cy="13" r="3.5"/><path d="M8.5 6l1.5-2.5h4L15.5 6"/></svg>';
var OK='<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
function mots(t){return t.split(' ').map(function(m,k){return '<span style="--k:'+k+'">'+m+'&nbsp;</span>'}).join('')}
var E=[];
var OPTS=[['cliky','Cliky','Le pré-devis se prépare tout seul, puis devis et factures'],
 ['reservation','Réservation','Vos clients prennent rendez-vous en ligne'],
 ['sms','SMS','Une alerte à chaque nouvelle demande'],
 ['avis','Avis Google','La demande d\'avis part toute seule']];
function optHTML(){var L=window.PCOPT&&PCOPT.liste||{};
 return '<div class="pi-op">'+OPTS.map(function(o,k){var ic=L[o[0]]&&L[o[0]].i||'';
  return '<div class="pi-oi pi-carte" style="--k:'+k+'"><span class="pi-galet oic">'+ic+'</span><span class="otx"><b>'+o[1]+'</b><small>'+o[2]+'</small></span></div>'}).join('')+'</div>'}
function ecrans(){
/* Présentation de l'Espace DE BASE (Cyril, 3/11), NEUTRE du début à la fin (aucun état d'option ou de compte) ; les options et ce qu'elles apportent arrivent à la fin */
E=[
 {s:'<div class="pi-logo"><b></b><b></b><span class="pi-galet"><svg viewBox="18 6.5 76 76"><mask id="plmi" maskUnits="userSpaceOnUse" x="0" y="-20" width="120" height="130"><path class="l" pathLength="100" d="'+P+'" style="fill:none;stroke:#fff;stroke-width:14px;stroke-linecap:butt"/></mask><path d="'+PF+'" mask="url(#plmi)" style="fill:var(--acc);stroke:none"/></svg></span></div>',
  h:'Bienvenue dans votre Espace',
  p:'Vos demandes, vos devis, vos chantiers et vos factures, au même endroit. Voici l\'essentiel en quelques images.'},
 {s:'<div class="pi-dem pi-carte pi-arrive"><div class="t"><i></i>Nouvelle demande</div><div class="qui"><span class="av pi-galet">MD</span><span><b>Mme Durand</b><small>Cloisons du séjour</small></span></div><div class="pd pi-creux">'+PHO+'<span>Photos du client</span><em>Jointes</em></div></div>',
  h:'Les demandes arrivent toutes seules',
  p:'Vos clients décrivent leurs travaux sur votre page. La demande arrive ici, avec leurs coordonnées et leurs photos.'},
 {s:'<div class="pi-dv pi-carte"><div class="li pi-creux"><span>Cloison en plaques</span><i class="ok" style="--k:0">'+OK+'</i></div><div class="li pi-creux doigt"><span>Bandes et enduit</span><i class="ok" style="--k:1">'+OK+'</i></div><div class="li pi-creux"><span>Peinture</span><i class="ok" style="--k:2">'+OK+'</i></div><div class="val">Envoyer le devis</div></div>',
  h:'Vos devis en quelques gestes',
  p:'Choisissez vos lignes dans vos produits, les calculs se font tout seuls. Une fois accepté, le devis devient facture.'},
 {s:'<div class="pi-pl pi-carte"><div class="pi-sem">'+['L','M','M','J','V'].map(function(j,k){return '<div class="pi-jr"><small>'+j+'</small><span class="pi-creux pi-col">'+(k===0||k===1?'<i class="pi-ev a" style="--k:'+k+'"></i>':'')+(k===2?'<i class="pi-ev b" style="--k:2"></i>':'')+(k===3||k===4?'<i class="pi-ev c" style="--k:'+k+'"></i>':'')+'</span></div>'}).join('')+'</div><div class="pi-ca pi-creux">'+[38,52,45,64,58,80].map(function(h,k){return '<i style="--h:'+h+'%;--k:'+k+'"></i>'}).join('')+'</div></div>',
  h:'Votre semaine et vos chiffres',
  p:'Le planning se met à jour avec l\'agenda de votre téléphone. Votre chiffre d\'affaires se suit d\'un coup d\'œil.'},
 {s:'<div class="pi-mic"><b></b><b></b><span class="pi-galet">'+MIC+'</span><div class="pi-bulle">« '+mots('Ajoute une porte au devis')+'»</div></div>',
  h:'Parlez, ProClik écrit',
  p:'Le micro est toujours en bas de l\'écran. Parlez normalement, ProClik range tout au bon endroit.'},
 {s:optHTML(),
  h:'Et pour aller plus loin, les options',
  p:'Elles s\'ajoutent à votre Espace quand vous le souhaitez. Retrouvez-les dans le menu, «&nbsp;Mes options&nbsp;».'},
 {choix:1,
  h:'Comment préférez-vous l\'affichage ?',
  p:'Vous pourrez changer à tout moment dans les Réglages.'}
];}
var box,i=0,mode='std',fini,sens='';
function ap(gros){var r='';for(var k=0;k<(gros?5:8);k++)r+='<i class="'+(k===0?'c':k%3===1?'m':k%3===2?'s':'')+'"></i>';return r}
function rend(){
 var e=E[i],der=i===E.length-1;
 var sc=e.choix?'<div class="pi-ch">'+
   '<button class="pi-choix" data-m="std" aria-pressed="'+(mode==='std')+'"><span class="ap">'+ap(0)+'</span><b>Standard</b><small>Tous les détails</small><span class="rd"></span></button>'+
   '<button class="pi-choix gros" data-m="simple" aria-pressed="'+(mode==='simple')+'"><span class="ap">'+ap(1)+'</span><b>Simple</b><small>Plus gros, l\'essentiel</small><span class="rd"></span></button></div>':e.s;
 box.innerHTML='<div class="pi-w">'+
  '<div class="pi-haut"><div class="pi-pts">'+E.map(function(_,k){return '<i class="'+(k===i?'on':'')+'"></i>'}).join('')+'</div><button class="pi-passer" id="pi-passer"'+(der?' hidden':'')+'>Passer</button></div>'+
  '<div class="pi-scene"><div class="pi-anim" style="--r:0">'+sc+'</div></div>'+
  '<div class="pi-txt"><h2 class="pi-anim" style="--r:1">'+e.h+'</h2><p class="pi-anim" style="--r:2">'+e.p+'</p></div>'+
  '<div class="pi-bas"><button class="pi-ret" id="pi-ret" aria-label="Retour"'+(i?'':' hidden')+'><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>'+
  '<button class="btn go" id="pi-suiv">'+(i===0?'Découvrir':der?'C\'est parti':'Suivant')+'</button></div></div>';
 box.classList.remove('go','pi-av','pi-arr');void box.offsetWidth;
 if(sens)box.classList.add(sens);
 if(!d.getElementById('pc-ouv')&&!d.getElementById('pc-ouk'))box.classList.add('go');
 box.querySelector('#pi-suiv').onclick=suiv;
 box.querySelector('#pi-ret').onclick=prec;
 box.querySelector('#pi-passer').onclick=function(){sens='pi-av';i=E.length-1;rend()};
 [].forEach.call(box.querySelectorAll('.pi-choix'),function(b){b.onclick=function(){mode=b.dataset.m;[].forEach.call(box.querySelectorAll('.pi-choix'),function(x){x.setAttribute('aria-pressed',String(x===b))})}});
}
function suiv(){if(i<E.length-1){sens='pi-av';i++;rend()}else{box.hidden=true;box.classList.remove('pi','go');if(fini)fini(mode)}}
function prec(){if(i>0){sens='pi-arr';i--;rend()}}
/* glisser du doigt : à gauche = suivant, à droite = retour */
var x0=null,y0=0;
function tdeb(e){var t=e.touches[0];x0=t.clientX;y0=t.clientY}
function tfin(e){if(x0==null)return;var t=e.changedTouches[0],dx=t.clientX-x0,dy=t.clientY-y0;x0=null;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5){if(dx<0&&i<E.length-1)suiv();else if(dx>0)prec()}}
/* si l'ouverture du logo est encore à l'écran, on attend qu'elle parte pour lancer les animations */
function guette(){if(!box||box.hidden)return;if(d.getElementById('pc-ouv')||d.getElementById('pc-ouk'))return setTimeout(guette,150);box.classList.add('go')}
window.PCIntro={ouvre:function(el,m,cb){
 box=el;mode=m||'std';fini=cb;i=0;sens='';ecrans();
 box.classList.add('pi');box.hidden=false;
 if(!box._pi){box._pi=1;box.addEventListener('touchstart',tdeb,{passive:true});box.addEventListener('touchend',tfin,{passive:true})}
 rend();guette();
}};
})();
