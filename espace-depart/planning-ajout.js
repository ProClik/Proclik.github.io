/* Planning de l'Espace : ajouter un créneau facilement, comme sur l'iPhone, et voir les livraisons des fournisseurs (demande de Cyril du 2/11).
   Le bouton « + » en haut du planning, ou un appui sur un moment libre de la semaine, ouvre une petite fiche : quoi, quand, pour quel chantier.
   Les livraisons et commandes fournisseurs apparaissent dans le planning ET dans la partie Fournitures du chantier.
   Démo : exemples fictifs, ce que vous ajoutez reste sur l'appareil (pc-ev1). */
(function(){
"use strict";
var X=window.PCX;if(!X||!X.EV)return;
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
var esc=X.esc,EV=X.EV,CK=X.CK,CH=X.CH,SUP=X.SUP||{};
var MOIS=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'],JL=['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];
var I=function(p){return '<svg viewBox="0 0 24 24" aria-hidden="true">'+p+'</svg>'};
var IC={plus:I('<path d="M12 5v14M5 12h14"/>'),camion:I('<path d="M3 6h11v10H3zM14 9h4l3 3v4h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>')};

/* Une nouvelle couleur : les livraisons */
CK.liv=['var(--k-liv)','Livraison fournisseur'];CK.autre=['var(--k-autre)','Rendez-vous'];CK.st=['var(--k-st)','Sous-traitant'];
$$('.cal-key').forEach(function(x){x.innerHTML=X.calKey()});

/* Les livraisons de la démo (fictives) */
var DEMO=[{d:'2026-10-19',s:'07:30',e:'08:00',k:'liv',t:'Livraison Placo Dauphiné',w:'Meylan · 3 suspentes manquantes',x:{ch:'alpes',liv:'Placo Dauphiné'}},
 {d:'2026-10-27',s:'08:00',e:'09:00',k:'liv',t:'Livraison Placo Dauphiné',w:'Échirolles · plaques hydro et rails sur chantier',x:{ch:'lopez',liv:'Placo Dauphiné'}},
 {d:'2026-11-13',s:'10:00',e:'11:00',k:'liv',t:'Fenêtres M. Martin',w:'Menuiseries des Alpes · délai de 4 semaines après commande',x:{liv:'Menuiseries des Alpes',dv:'0043'}}];
/* Sous-traitants (15/11, Cyril : Aurélien travaille seul et fait souvent appel à des sous-traitants).
   Un petit carnet (nom, métier, téléphone) gardé sur l'appareil (pc-st1). Leurs jours vont dans le planning,
   et on leur envoie par SMS depuis le téléphone, sans qu'ils aient besoin de l'appli. Exemples fictifs. */
var STD=[{id:'st-elec',n:'Élec Belledonne',m:'Électricien',tel:'06 •• •• •• ••',demo:1},{id:'st-plomb',n:'Plomberie du Vercors',m:'Plombier',tel:'06 •• •• •• ••',demo:1}];
var STA=X.lsGet('pc-st1',[]);
function stTous(){return STD.concat(STA)}
function stDe(id){return stTous().filter(function(t){return t.id===id})[0]}
DEMO.push({d:'2026-10-29',s:'08:00',e:'17:00',k:'st',t:'Élec Belledonne · M. Lopez',w:'Échirolles · électricité de la salle de bain · toute la journée',x:{ch:'lopez',st:'st-elec',jour:1}},
 {d:'2026-10-30',s:'08:00',e:'17:00',k:'st',t:'Plomberie du Vercors · M. Lopez',w:'Échirolles · raccords douche et lavabo · toute la journée',x:{ch:'lopez',st:'st-plomb',jour:1}});
/* Les jours d'un sous-traitant (sur un chantier, ou partout), à partir d'aujourd'hui */
function stJours(id,ch){var T=iso(X.TODAY);return EV.filter(function(e){return e.k==='st'&&e.x&&e.x.st===id&&(!ch||e.x.ch===ch)&&e.d>=T}).sort(function(a,b){return a.d<b.d?-1:1})}
function stTexte(id,ch){var t=stDe(id),L=stJours(id,ch),c=ch&&CH[ch];if(!t||!L.length)return '';
 var parM={};L.forEach(function(e){var d=new Date(e.d+'T12:00:00'),k=MOIS[d.getMonth()];(parM[k]=parM[k]||[]).push(JL[d.getDay()]+' '+d.getDate())});
 var jours=Object.keys(parM).map(function(m){var a=parM[m];return (a.length>1?a.slice(0,-1).join(', ')+' et '+a[a.length-1]:a[0])+' '+m}).join(', ');
 var e0=L[0],h=e0.x&&e0.x.jour?'à partir de 8 h':'de '+hh(e0.s)+' à '+hh(e0.e);
 return 'Bonjour, voici '+(L.length>1?'vos jours':'votre jour')+(c?' sur le chantier '+c.n+' à '+c.v:'')+' : '+jours+', '+h+'. Merci de me confirmer.'}
function stSms(id,ch){var t=stDe(id),txt=stTexte(id,ch);if(!t)return;
 if(!txt){X.toast('Rien de prévu','Ajoutez d\'abord ses jours au planning.');return}
 var tel=String(t.tel||'').replace(/[^\d+]/g,'');
 if(t.demo||tel.length<10){X.toast('Numéro d\'exemple','Avec un vrai numéro, ce message s\'ouvre dans vos SMS : « '+txt+' »');return}
 location.href='sms:'+tel+'?&body='+encodeURIComponent(txt)}
var AJ=X.lsGet('pc-ev1',[]);
DEMO.concat(AJ).forEach(function(e){EV.push(e)});
function garder(e){AJ.push(e);X.lsSet('pc-ev1',AJ)}
function redessiner(){X.renderCalWeek();X.renderCalMonth()}
function iso(d){return X.iso(d)}
function jolie(s){var d=new Date(s+'T12:00:00');return JL[d.getDay()]+' '+d.getDate()+' '+MOIS[d.getMonth()]}
function hh(s){return s.replace(':00',' h').replace(':',' h ')}

/* ---------- la fiche « Nouvel évènement » ---------- */
var TY=[['chantier','Chantier','plan'],['visit','Visite','visit'],['liv','Livraison','liv'],['st','Sous-traitant','st'],['autre','Rendez-vous','autre']];
var F=null;
function fiche(p){F=Object.assign({ty:'visit',d:iso(X.TODAY),s:'09:00',e:'10:00',jour:false,ch:'',sup:'',t:'',w:'',st:'',d2:'',nn:'',nm:'',nt:''},p||{});
 if(F.ty==='st'){F.jour=true;if(!F.d2)F.d2=F.d}
 if(p&&p.s&&!p.e){var h=+F.s.slice(0,2)+1;F.e=('0'+Math.min(h,23)).slice(-2)+F.s.slice(2)}
 X.xopen('Nouvel évènement',F.ty==='liv'&&F.ch&&CH[F.ch]?'Livraison pour '+CH[F.ch].n:'Dans votre planning',corps(),'<button class="btn" data-xclose>Annuler</button><button class="btn go" id="ev-ok">Ajouter</button>',function(){lier();$('#ev-ok').addEventListener('click',valider)});}
function corps(){var K=Object.keys(CH).filter(function(k){return CH[k].st!=='done'});
 if(F.ty==='st')return corpsSt(K);
 return '<div class="ch-f">'+
  '<div class="ev-ty">'+TY.map(function(t){return '<button type="button" class="btn" data-evty="'+t[0]+'" aria-pressed="'+(F.ty===t[0])+'"><i style="--c:'+CK[t[2]][0]+'"></i>'+t[1]+'</button>'}).join('')+'</div>'+
  (F.ty==='liv'?'<label>Fournisseur<select id="ev-sup"><option value="">Choisir…</option>'+Object.keys(SUP).map(function(k){return '<option value="'+esc(SUP[k].n)+'"'+(F.sup===SUP[k].n?' selected':'')+'>'+esc(SUP[k].n)+'</option>'}).join('')+'<option value="Autre fournisseur"'+(F.sup==='Autre fournisseur'?' selected':'')+'>Autre fournisseur</option></select></label>':'')+
  '<label>'+(F.ty==='liv'?'Ce qui arrive':'Titre')+'<input id="ev-t" value="'+esc(F.t)+'" placeholder="'+(F.ty==='liv'?'Par ex. fenêtres, plaques BA13':F.ty==='visit'?'Par ex. visite M. Bernard':F.ty==='chantier'?'Par ex. pose des plaques':'Par ex. rendez-vous banque')+'"></label>'+
  (F.ty==='chantier'||F.ty==='liv'?'<label>Pour quel chantier<select id="ev-ch"><option value="">'+(F.ty==='liv'?'Au dépôt (aucun chantier)':'Choisir…')+'</option>'+K.map(function(k){return '<option value="'+k+'"'+(F.ch===k?' selected':'')+'>'+esc(CH[k].n)+' · '+esc(CH[k].v)+'</option>'}).join('')+'</select></label>':'')+
  '<label>Jour<input type="date" id="ev-d" value="'+F.d+'"></label>'+
  '<div class="ch-sw"><span>Toute la journée</span><button type="button" class="ch-tg" role="switch" aria-checked="'+F.jour+'" id="ev-j" aria-label="Toute la journée"></button></div>'+
  (F.jour?'':'<div class="two"><label>Début<input type="time" id="ev-s" value="'+F.s+'" step="900"></label><label>Fin<input type="time" id="ev-e" value="'+F.e+'" step="900"></label></div>')+
  '<label>Lieu ou précision<input id="ev-w" value="'+esc(F.w)+'" placeholder="'+(F.ty==='liv'?'Par ex. livré sur chantier, commande DP-012':'Ville, adresse…')+'"></label>'+
  (F.ty==='liv'?'<p class="hint" style="margin:0">La livraison apparaît aussi dans les Fournitures du chantier.</p>':'')+'</div>';}
function corpsSt(K){var S=stTous(),neuf=F.st==='+';
 return '<div class="ch-f">'+
  '<div class="ev-ty">'+TY.map(function(t){return '<button type="button" class="btn" data-evty="'+t[0]+'" aria-pressed="'+(F.ty===t[0])+'"><i style="--c:'+CK[t[2]][0]+'"></i>'+t[1]+'</button>'}).join('')+'</div>'+
  '<label>Qui vient<select id="ev-st"><option value="">Choisir…</option>'+S.map(function(t){return '<option value="'+t.id+'"'+(F.st===t.id?' selected':'')+'>'+esc(t.n)+' · '+esc(t.m)+'</option>'}).join('')+'<option value="+"'+(neuf?' selected':'')+'>+ Nouveau sous-traitant</option></select></label>'+
  (neuf?'<label>Son nom ou son entreprise<input id="ev-nn" value="'+esc(F.nn)+'" placeholder="Par ex. Élec Dupont"></label><div class="two"><label>Son métier<input id="ev-nm" value="'+esc(F.nm)+'" placeholder="Par ex. électricien"></label><label>Son portable<input id="ev-nt" type="tel" inputmode="tel" value="'+esc(F.nt)+'" placeholder="06 12 34 56 78"></label></div>':'')+
  '<label>Pour quel chantier<select id="ev-ch"><option value="">Choisir…</option>'+K.map(function(k){return '<option value="'+k+'"'+(F.ch===k?' selected':'')+'>'+esc(CH[k].n)+' · '+esc(CH[k].v)+'</option>'}).join('')+'</select></label>'+
  '<div class="two"><label>Premier jour<input type="date" id="ev-d" value="'+F.d+'"></label><label>Dernier jour<input type="date" id="ev-d2" value="'+(F.d2||F.d)+'"></label></div>'+
  '<div class="ch-sw"><span>Toute la journée</span><button type="button" class="ch-tg" role="switch" aria-checked="'+F.jour+'" id="ev-j" aria-label="Toute la journée"></button></div>'+
  (F.jour?'':'<div class="two"><label>Début<input type="time" id="ev-s" value="'+F.s+'" step="900"></label><label>Fin<input type="time" id="ev-e" value="'+F.e+'" step="900"></label></div>')+
  '<label>Son travail<input id="ev-w" value="'+esc(F.w)+'" placeholder="Par ex. électricité de la salle de bain"></label>'+
  '<p class="hint" style="margin:0">Le samedi et le dimanche ne sont pas comptés. Ensuite, touchez son créneau pour lui envoyer ses jours par SMS.</p></div>';}
function lire(){var v=function(s){var e=$(s);return e?e.value:null};['t','d','s','e','w','ch','sup','st','d2','nn','nm','nt'].forEach(function(k){var x=v('#ev-'+k);if(x!=null)F[k]=x})}
function lier(){
 $$('[data-evty]').forEach(function(b){b.addEventListener('click',function(){lire();F.ty=b.dataset.evty;$('#x-in').innerHTML=corps();lier()})});
 var sts=$('#ev-st');if(sts)sts.addEventListener('change',function(){lire();$('#x-in').innerHTML=corps();lier()});
 var d1=$('#ev-d'),d2=$('#ev-d2');if(d1&&d2)d1.addEventListener('change',function(){if(!d2.value||d2.value<d1.value)d2.value=d1.value});
 $('#ev-j').addEventListener('click',function(){lire();F.jour=!F.jour;$('#x-in').innerHTML=corps();lier()});
 var s=$('#ev-s');if(s)s.addEventListener('change',function(){var e=$('#ev-e');if(e&&e.value<=s.value){var h=+s.value.slice(0,2)+1;e.value=('0'+Math.min(h,23)).slice(-2)+s.value.slice(2)}});
}
function validerSt(){
  var ch=F.ch&&CH[F.ch],t;
  if(F.st==='+'){var n=F.nn.trim();if(!n){$('#ev-nn').focus();return}
   t={id:'st'+Date.now().toString(36),n:n,m:F.nm.trim()||'Sous-traitant',tel:F.nt.trim()};STA.push(t);X.lsSet('pc-st1',STA);F.st=t.id}
  else t=stDe(F.st);
  if(!t){X.toast('Qui vient ?','Choisissez le sous-traitant, ou ajoutez-en un nouveau.');return}
  if(!ch){X.toast('Pour quel chantier ?','Choisissez le chantier.');return}
  if(!F.jour&&F.e<=F.s){X.toast('L\'heure de fin est avant le début','Changez l\'une des deux.');return}
  var a=new Date(F.d+'T12:00:00'),b=new Date((F.d2&&F.d2>=F.d?F.d2:F.d)+'T12:00:00'),n=0;
  for(var d=new Date(a);d<=b&&n<60;d.setDate(d.getDate()+1)){var w=d.getDay();if(!w||w===6)continue;
   var e={d:iso(d),s:F.jour?'08:00':F.s,e:F.jour?'17:00':F.e,k:'st',t:t.n+' · '+ch.n,w:[ch.v,F.w.trim(),F.jour?'toute la journée':''].filter(Boolean).join(' · '),x:{ch:F.ch,st:t.id}};
   if(F.jour)e.x.jour=1;EV.push(e);garder(e);n++}
  if(!n){X.toast('Aucun jour de semaine','Choisissez au moins un jour du lundi au vendredi.');return}
  X.xclose();X.calWeek(a);redessiner();
  var cur=X.curCh&&X.curCh();if(window.PCCH&&cur===F.ch)PCCH.ouvrir(F.ch,'agenda');
  X.toast(t.n+' ajouté au planning',n+(n>1?' jours':' jour')+' · '+ch.n+'. Touchez son créneau pour lui envoyer par SMS.');}
function valider(){lire();
  if(F.ty==='st'){validerSt();return}
  var t=F.t.trim();if(F.ty==='liv')t='Livraison'+(F.sup&&F.sup!=='Autre fournisseur'?' '+F.sup:'')+(t?' · '+t:'');
  if(!t){$('#ev-t').focus();return}
  if(F.ty==='chantier'&&F.ch&&CH[F.ch]&&t.indexOf(CH[F.ch].n)<0)t=CH[F.ch].n+' · '+t;
  if(!F.jour&&F.e<=F.s){X.toast('L\'heure de fin est avant le début','Changez l\'une des deux.');return}
  var k=F.ty==='chantier'?'plan':F.ty,ch=F.ch&&CH[F.ch];
  var e={d:F.d,s:F.jour?'07:00':F.s,e:F.jour?'18:00':F.e,k:k,t:t,w:[F.w.trim()||(ch?ch.v:''),F.jour?'toute la journée':''].filter(Boolean).join(' · '),x:{}};
  if(ch)e.x.ch=F.ch;if(F.ty==='liv')e.x.liv=F.sup||'Fournisseur';if(F.jour)e.x.jour=1;
  EV.push(e);garder(e);X.xclose();
  var dd=new Date(F.d+'T12:00:00');X.calWeek(dd);redessiner();
  if(F.ty==='liv'&&ch&&window.PCCH){var cur=X.curCh&&X.curCh();if(cur===F.ch)PCCH.ouvrir(F.ch,'four')}
  X.toast(F.ty==='liv'?'Livraison ajoutée':'Ajouté au planning',jolie(F.d)+(F.jour?' · toute la journée':' · '+hh(e.s))+(ch?' · '+ch.n:''));}

/* ---------- le bouton « + » du planning ---------- */
var tete=$('#v-planning>.row');
if(tete&&!$('#ev-add')){(tete.querySelector('h2')||tete).insertAdjacentHTML(tete.querySelector('h2')?'afterend':'beforeend','<button type="button" class="btn go cf-go pl-go" id="ev-add" aria-label="Ajouter un évènement"><span class="lab"><span class="ic">'+IC.plus+'</span><span>Ajouter au planning</span></span></button>');
 $('#ev-add').addEventListener('click',function(){var wk=X.calWeek(),t=X.TODAY,d=(t>=wk&&t<new Date(wk.getTime()+7*864e5))?t:wk;fiche({d:iso(d)})});}
var h=$('#p-semaine .hint');if(h)h.textContent='Touchez un moment libre pour y ajouter un rendez-vous, ou le bouton « Ajouter » en haut. Touchez un évènement pour l\'ouvrir.';

/* ---------- un appui sur un moment libre de la semaine ---------- */
var wkc=$('#wkc');
if(wkc)wkc.addEventListener('click',function(e){if(e.target.closest('.ev'))return;var col=e.target.closest('.wkc-col');if(!col)return;
 var cols=$$('#wkc .wkc-col'),i=cols.indexOf(col);if(i<0)return;
 var wide=matchMedia('(min-width:900px)').matches,PX=wide?46:42,r=col.getBoundingClientRect(),y=e.clientY-r.top,hd=7+y/PX;
 var m=Math.max(7,Math.min(18.5,Math.floor(hd*2)/2)),s=('0'+Math.floor(m)).slice(-2)+(m%1?':30':':00');
 var d=new Date(X.calWeek());d.setDate(d.getDate()+i);fiche({d:iso(d),s:s});});

/* ---------- côté chantier : livraisons et commandes ---------- */
function livraisons(id){var T=iso(X.TODAY);return EV.filter(function(e){return e.k==='liv'&&e.x&&(e.x.ch===id||(id==='alpes'&&e.x.ch===1))}).sort(function(a,b){return (a.d+a.s)<(b.d+b.s)?-1:1}).map(function(e){return {e:e,t:e.t,w:e.w,quand:jolie(e.d)+(e.x.jour?'':' à '+hh(e.s)),passe:e.d<T}})}
function livHTML(c){var L=livraisons(c.id);
 return '<div class="card" id="ch-liv"><div class="row" style="margin-bottom:8px"><b>Livraisons et délais fournisseurs</b><span style="font-size:12px;color:var(--muted)">aussi dans le planning</span></div>'+
  (L.length?'<div class="lst cf-l ch-livl" style="padding:0!important">'+L.map(function(x){return '<div class="cf-li" style="cursor:default"><span class="cf-av cf-doc">'+IC.camion+'</span><span class="tx"><b>'+esc(x.t)+'</b><small>'+esc(x.quand)+(x.w?' · '+esc(x.w):'')+'</small></span><span class="pill '+(x.passe?'ok':'warn')+'">'+(x.passe?'Passée':'Prévue')+'</span></div>'}).join('')+'</div>':'<p class="hint">Aucune livraison prévue pour ce chantier.</p>')+
  (c.st!=='done'?'<button type="button" class="btn" style="width:100%;margin-top:10px;display:flex;align-items:center;justify-content:center;gap:8px" id="ch-livadd">'+IC.plus+'Ajouter une livraison ou un délai</button>':'')+'</div>';}
function lierLiv(c){var b=$('#ch-livadd');if(b)b.addEventListener('click',function(){fiche({ty:'liv',ch:c.id,d:iso(X.TODAY),s:'08:00'})})}
/* Un chantier créé avec des dates : ses jours vont dans le planning (week-end exclus) */
function chantier(c,d1,d2){var a=new Date(d1+'T12:00:00'),b=new Date((d2||d1)+'T12:00:00'),L=[];
 for(var d=new Date(a);d<=b&&L.length<60;d.setDate(d.getDate()+1)){var w=d.getDay();if(w&&w!==6)L.push(iso(d))}
 L.forEach(function(x,i){var e={d:x,s:'08:00',e:'17:00',k:'plan',t:c.n+' · '+c.t,w:c.v+(L.length>1?' · jour '+(i+1)+' sur '+L.length:''),x:{ch:c.id}};EV.push(e);garder(e)});
 redessiner();}
window.PCPLAN={st:{tous:stTous,de:stDe,jours:stJours,texte:stTexte,sms:stSms},fiche:fiche,livraisons:livraisons,livHTML:livHTML,lierLiv:lierLiv,chantier:chantier};
redessiner();
})();
