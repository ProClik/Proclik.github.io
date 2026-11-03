/* Présentation de l'Espace au premier lancement (et depuis le menu « Revoir la présentation »).
   4 images simples + le choix de l'affichage. Un seul gros bouton par écran, on peut glisser du doigt. Cyril, 3/11. */
(function(){
var d=document;
var P='M52 64.7 A23 23 0 1 0 33 42 V70';
var MIC='<svg class="ic" viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7"/></svg>';
var DOC='<svg class="ic" viewBox="0 0 24 24"><path d="M13 21H6V3h8l4 4v4"/><path d="M14 3v4h4M9 9h4M9 13h3"/></svg>';
var OK='<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
function mots(t){return t.split(' ').map(function(m,k){return '<span style="--k:'+k+'">'+m+'&nbsp;</span>'}).join('')}
var E=[
 {s:'<div class="pi-logo"><b></b><b></b><span class="pi-galet"><svg viewBox="18 6.5 76 76"><path class="l" pathLength="100" d="'+P+'"/><circle class="p" cx="56" cy="42" r="6"/></svg></span></div>',
  h:'Bienvenue dans votre Espace',
  p:'Vos demandes, vos devis, vos chantiers et vos factures, au même endroit. Voici l\'essentiel en trois images.'},
 {s:'<div class="pi-dem pi-carte pi-arrive"><div class="t"><i></i>Nouvelle demande</div><div class="qui"><span class="av pi-galet">MD</span><span><b>Mme Durand</b><small>Cloisons du séjour</small></span></div><div class="pd pi-creux">'+DOC+'<span>Pré-devis</span><em>Prêt</em></div></div>',
  h:'Les demandes arrivent toutes seules',
  p:'Vos clients décrivent leurs travaux sur votre site. La demande arrive ici, avec un pré-devis déjà calculé.'},
 {s:'<div class="pi-dv pi-carte"><div class="li pi-creux"><span>Cloison en plaques</span><i class="ok" style="--k:0">'+OK+'</i></div><div class="li pi-creux doigt"><span>Bandes et enduit</span><i class="ok" style="--k:1">'+OK+'</i></div><div class="li pi-creux"><span>Peinture</span><i class="ok" style="--k:2">'+OK+'</i></div><div class="val">Valider</div></div>',
  h:'Vous vérifiez, vous validez',
  p:'Touchez une ligne pour la corriger. Rien ne part chez le client sans votre accord.'},
 {s:'<div class="pi-mic"><b></b><b></b><span class="pi-galet">'+MIC+'</span><div class="pi-bulle">« '+mots('Ajoute une porte au devis')+'»</div></div>',
  h:'Parlez, ProClik écrit',
  p:'Touchez le micro en bas de l\'écran et parlez normalement. ProClik range tout au bon endroit.'},
 {choix:1,
  h:'Comment préférez-vous l\'affichage ?',
  p:'Vous pourrez changer à tout moment dans les Réglages.'}
];
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
 box=el;mode=m||'std';fini=cb;i=0;sens='';
 box.classList.add('pi');box.hidden=false;
 if(!box._pi){box._pi=1;box.addEventListener('touchstart',tdeb,{passive:true});box.addEventListener('touchend',tfin,{passive:true})}
 rend();guette();
}};
})();
