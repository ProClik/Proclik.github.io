/* Réseaux sociaux de l'Espace (demande de Cyril, 3/11) : une OPTION de l'abonnement (PCOPT.actif('reseaux')).
   L'artisan écrit un post une fois, il part sur Facebook, Instagram, sa fiche Google et LinkedIn à l'heure choisie ;
   les messages reçus sur ses posts arrivent ici et dans la fiche du client. Il ne quitte jamais l'Espace :
   seule la liaison d'un compte ouvre, une fois, la fenêtre officielle du réseau (aucun mot de passe chez ProClik).
   Plus tard : branché sur le Social Planner de GHL par le service ProClik. Aujourd'hui : démo, rien n'est publié.
   Logos : Facebook, Instagram et LinkedIn en version unie (couleur du texte de l'Espace), comme leurs guides le permettent ;
   Google : pas son « G » (usage réservé), une icône de boutique et le nom écrit.
   Sans l'option (Espace connecté et option non prise) : l'écran dit ce qu'elle apporte et comment la demander. */
(function(){
"use strict";
var X=window.PCX;if(!X)return;
var $=function(s,r){return (r||document).querySelector(s)};
var esc=X.esc||function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var lsG=function(k,d){try{var v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}};
var lsS=function(k,v){try{if(v==null)localStorage.removeItem(k);else localStorage.setItem(k,JSON.stringify(v))}catch(e){}};

/* ---------- dessins ---------- */
var S=function(p){return '<svg viewBox="0 0 24 24" aria-hidden="true">'+p+'</svg>'};
var L=function(d){return '<svg viewBox="0 0 24 24" aria-hidden="true" class="rs-logo"><path d="'+d+'"/></svg>'};
var IC={
 plus:S('<path d="M12 5v14M5 12h14"/>'),
 msg:S('<path d="M4 5h16v11H9l-5 4z"/>'),
 lien:S('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'),
 retour:S('<path d="M15 5l-7 7 7 7"/>'),
 fl:S('<path d="M9 5l7 7-7 7"/>'),
 mic:S('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>'),
 cliky:S('<rect x="5" y="8" width="14" height="11" rx="4"/><path d="M12 4.8V8"/><circle cx="9.5" cy="13.4" r="1.1"/><circle cx="14.5" cy="13.4" r="1.1"/>'),
 photo:S('<rect x="3" y="6" width="18" height="14" rx="2.5"/><circle cx="12" cy="13" r="3.5"/><path d="M8.5 6l1.5-2h4l1.5 2"/>'),
 cle:S('<rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
 ok:S('<path d="M5 12.5l4.5 4.5L19 7.5"/>')
};
var RS=[
 {k:'fb',nom:'Facebook',ou:'Votre page',logo:L('M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z')},
 {k:'ig',nom:'Instagram',ou:'Votre compte pro',logo:L('M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077')},
 {k:'go',nom:'Google',ou:'Votre fiche, vue sur Maps',logo:S('<path d="M4 9.5 5.5 4h13L20 9.5"/><path d="M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0"/><path d="M5.5 12.5V20h13v-7.5"/><path d="M10 20v-4.5h4V20"/>')},
 {k:'li',nom:'LinkedIn',ou:'Votre profil',logo:L('M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z')}
];
var rs=function(k){return RS.filter(function(r){return r.k===k})[0]};
var pastille=function(k){var r=rs(k);return '<span class="rs-p" aria-hidden="true">'+(r?r.logo:'')+'</span>'};

/* ---------- données (démo, gardées sur l'appareil) ---------- */
var KC='pc-rs-comptes',KP='pc-rs-posts',KM='pc-rs-msg';
function comptes(){return lsG(KC,{fb:true,ig:true,go:true,li:false})}
function jeudi18(){var d=new Date(),j=(4-d.getDay()+7)%7;if(j===0&&d.getHours()>=18)j=7;d.setDate(d.getDate()+j);d.setHours(18,0,0,0);return d}
var JOURS=['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'],MOIS=['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
function quandTxt(t){var d=new Date(t);return JOURS[d.getDay()].replace(/^./,function(c){return c.toUpperCase()})+' '+d.getDate()+' '+MOIS[d.getMonth()]+' · '+d.getHours()+' h'+(d.getMinutes()?String(d.getMinutes()).padStart(2,'0'):'')}
function posts(){var p=lsG(KP,null);if(p)return p;var j=jeudi18().getTime();
 return [{id:'e1',ex:1,t:'Salle de bain refaite à Crolles',v:'APRÈS',q:j,r:['fb','ig','go'],e:'prevu'},
  {id:'e2',ex:1,t:'Isolation des combles : avant l\'hiver',v:'ÉQUIPE',q:j+2*864e5-8*36e5,r:['fb','go'],e:'prevu'},
  {id:'e3',ex:1,t:'Cliky propose : « 3 conseils pour une pièce plus chaude »',v:'IDÉE',q:0,r:[],e:'brouillon'}]}
function messages(){return lsG(KM,null)||[
 {id:'m1',ex:1,qui:'Mme Roux',rs:'fb',ou:'commentaire sur « Salle de bain refaite »',t:'Bonjour, vous faites aussi les combles ? On est à Bernin.',neuf:1,client:0},
 {id:'m2',ex:1,qui:'M. Fabre',rs:'ig',ou:'message privé',t:'Super résultat ! Vous passez quand pour la cuisine ?',neuf:1,client:1}]}

/* ---------- l'option ---------- */
function vrai(){return document.documentElement.classList.contains('pcvrai')}
function prise(){var a=window.PCOPT?PCOPT.actif('reseaux'):null;return a===true||(a==null&&!vrai())}
function tag(dit){return window.PCTAG?PCTAG('reseaux',dit):'<b>Réseaux sociaux</b>'}

/* ---------- écrans ---------- */
var ecran='home',F=null;
function tete(titre,sous,retour){
 return '<div class="rs-tete">'+(retour?'<button type="button" class="rs-ret" data-rs="home" aria-label="Retour">'+IC.retour+'</button>':'')+
  '<div><h2>'+titre+'</h2><small>'+sous+'</small></div></div><div class="card rs-tag">'+tag(prise()?'Option incluse':'Option à ajouter')+'</div>'}
function ligneBtn(act,ico,titre,sous,badge){
 return '<button type="button" class="card rs-row" data-rs="'+act+'"><span class="rs-ri">'+ico+'</span><span class="tx"><b>'+titre+'</b><small>'+sous+'</small></span>'+
  (badge?'<span class="badge rs-bd">'+badge+'</span>':'<span class="rs-fl">'+IC.fl+'</span>')+'</button>'}

function vHome(){
 var P=posts().slice().sort(function(a,b){return (a.q||9e15)-(b.q||9e15)}),M=messages(),C=comptes(),nC=RS.filter(function(r){return C[r.k]}).length,nN=M.filter(function(m){return m.neuf}).length;
 var h=tete('Réseaux sociaux','Vos posts, d\'un seul endroit')+
  '<button class="btn go cf-go" type="button" data-rs="write"><span class="lab"><span class="ic">'+IC.plus+'</span><span>Écrire un post</span></span></button>'+
  '<div class="card rs-sem"><div class="rs-h"><b>Vos posts</b>'+(P.some(function(p){return p.ex})?'<span class="exemple">Exemples</span>':'')+'</div>'+
  (P.length?P.map(function(p){return '<div class="rs-post"><span class="rs-vi v-'+esc(p.v==='APRÈS'?'a':p.v==='IDÉE'?'i':'e')+'">'+(p.img?'<img alt="" src="'+esc(p.img)+'">':esc(p.v||'POST'))+'</span><span class="tx"><b>'+esc(p.t)+'</b><small>'+
   (p.e==='brouillon'?'À relire, pas encore prévu':(p.e==='parti'?'Parti ':'')+quandTxt(p.q)+' · '+p.r.map(function(k){return rs(k).nom}).join(', '))+'</small>'+
   '<i class="rs-et '+(p.e==='brouillon'?'br':'ok')+'">'+(p.e==='brouillon'?'Brouillon de Cliky':p.e==='parti'?'Publié':'Prévu')+'</i></span></div>'}).join(''):'<p class="hint">Rien de prévu. Un chantier fini fait un très bon post.</p>')+'</div>'+
  ligneBtn('messages',IC.msg,'Messages reçus','Ils arrivent aussi dans la fiche du client',nN||'')+
  ligneBtn('comptes',IC.lien,'Vos comptes',nC+' réseau'+(nC>1?'x':'')+' relié'+(nC>1?'s':'')+' sur '+RS.length,'');
 if(!vrai())h+='<p class="rs-demo">Démo : rien n\'est publié pour de vrai.</p>';
 return h}

function vWrite(){var C=comptes();
 if(!F){var q=jeudi18();F={t:'',cl:0,r:RS.filter(function(r){return C[r.k]}).map(function(r){return r.k}),quand:'jeudi',dt:'',ph:[]}}
 var cliky=window.PCOPT?PCOPT.cliky:true,q=jeudi18();
 var h=tete('Écrire un post','Une fois, il part partout',1)+
  '<div class="card rs-bl"><label class="rs-l" for="rs-t">Votre texte</label><textarea id="rs-t" rows="5" placeholder="Ex. : Salle de bain terminée à Crolles, avant / après.">'+esc(F.t)+'</textarea>'+
  '<div class="rs-2"><button type="button" class="btn" data-rs="dicter">'+IC.mic+'<span>Dicter</span></button>'+
  (cliky?'<button type="button" class="btn rs-cl" data-rs="cliky">'+IC.cliky+'<span>Cliky l\'écrit pour moi</span></button>':'')+'</div>'+
  (F.cl?'<p class="hint">Cliky a écrit ce texte à partir de votre dernier chantier. Relisez-le, changez ce que vous voulez.</p>':'')+'</div>'+
  '<div class="card rs-bl"><span class="rs-l">Photos</span><div class="rs-ph">'+F.ph.map(function(u,i){return '<span class="rs-th"><img alt="Photo '+(i+1)+'" src="'+u+'"><button type="button" data-rs="phx" data-i="'+i+'" aria-label="Retirer la photo">×</button></span>'}).join('')+
  (F.ph.length<4?'<label class="rs-add">'+IC.photo+'<span>Photo</span><input type="file" accept="image/*" id="rs-f" hidden></label>':'')+'</div><p class="hint">Les photos de vos chantiers font les meilleurs posts : avant / après.</p></div>'+
  '<div class="card rs-bl"><span class="rs-l">Où publier</span>'+RS.map(function(r){var on=F.r.indexOf(r.k)>=0,li=!!C[r.k];
   return '<div class="rs-ln">'+pastille(r.k)+'<span class="tx"><b>'+r.nom+'</b><small>'+(li?r.ou:'Pas encore relié')+'</small></span>'+
    (li?'<button type="button" class="ch-tg" role="switch" aria-checked="'+on+'" data-rs="rs" data-k="'+r.k+'" aria-label="Publier sur '+r.nom+'"></button>':'<button type="button" class="btn sm" data-rs="relier" data-k="'+r.k+'">Relier</button>')+'</div>'}).join('')+'</div>'+
  '<div class="card rs-bl"><span class="rs-l">Quand</span><div class="rs-q" role="radiogroup" aria-label="Quand">'+
   [['now','Maintenant','tout de suite'],['jeudi',JOURS[q.getDay()].replace(/^./,function(c){return c.toUpperCase()})+' 18 h','le meilleur moment'],['autre','Choisir','date et heure']].map(function(x){return '<button type="button" role="radio" aria-checked="'+(F.quand===x[0])+'" data-rs="quand" data-k="'+x[0]+'"><b>'+x[1]+'</b><small>'+x[2]+'</small></button>'}).join('')+'</div>'+
   (F.quand==='autre'?'<label class="rs-dt">Le jour et l\'heure<input type="datetime-local" id="rs-dt" value="'+esc(F.dt)+'"></label>':'')+'</div>'+
  '<button class="btn go cf-go" type="button" data-rs="publier"><span class="lab"><span>'+(F.quand==='now'?'Publier maintenant':'Prévoir le post')+'</span></span></button>'+
  (!vrai()?'<p class="rs-demo">Démo : rien n\'est publié pour de vrai.</p>':'');
 return h}

function vMessages(){var M=messages();
 return tete('Messages reçus','Commentaires et messages privés',1)+
  (M.length?M.map(function(m){return '<div class="card rs-m">'+'<div class="rs-mh">'+pastille(m.rs)+'<span class="tx"><b>'+esc(m.qui)+'</b><small>'+rs(m.rs).nom+' · '+esc(m.ou)+'</small></span>'+(m.neuf?'<span class="badge rs-bd">Nouveau</span>':'')+'</div>'+
   '<p class="rs-mt">« '+esc(m.t)+' »</p><small class="rs-mf">'+(m.client?'Déjà client : rangé dans sa fiche.':'Nouvelle personne : ajoutée à vos Clients.')+'</small>'+
   (m.rep?'<p class="rs-rep"><b>Votre réponse</b>'+esc(m.rep)+'</p>':'')+
   '<div class="rs-2"><button type="button" class="btn" data-rs="repondre" data-id="'+m.id+'">Répondre</button><button type="button" class="btn rs-cl" data-rs="'+(m.client?'fiche':'demande')+'" data-id="'+m.id+'">'+(m.client?'Ouvrir sa fiche':'Créer une demande')+'</button></div></div>'}).join('')+(M.some(function(m){return m.ex})?'<span class="exemple">Messages d\'exemple</span>':''):'<p class="hint">Aucun message pour l\'instant.</p>')}

function vComptes(){var C=comptes();
 return tete('Vos comptes','Reliés une seule fois',1)+
  '<div class="card rs-bl">'+RS.map(function(r){return '<div class="rs-ln">'+pastille(r.k)+'<span class="tx"><b>'+r.nom+(r.k==='go'?' (votre fiche)':'')+'</b><small class="'+(C[r.k]?'rs-okc':'')+'">'+(C[r.k]?'Relié':'Pas encore relié')+'</small></span>'+
   (C[r.k]?'<button type="button" class="btn sm" data-rs="delier" data-k="'+r.k+'">Retirer</button>':'<button type="button" class="btn go sm" data-rs="relier" data-k="'+r.k+'">Relier</button>')+'</div>'}).join('')+'</div>'+
  '<div class="card rs-info">'+IC.cle+'<p><b>Une seule fois, et sans mot de passe.</b> « Relier » ouvre la fenêtre officielle du réseau. Vous dites oui, vous revenez ici, et c\'est fini. Ni ProClik ni Cliky ne voient votre mot de passe.</p></div>'}

function vSans(){
 return tete('Réseaux sociaux','Une option de votre abonnement')+
  '<div class="card rs-bl rs-sans"><p class="rs-pitch">Vous écrivez un post une fois. Il part sur <b>Facebook, Instagram, votre fiche Google et LinkedIn</b>, à l\'heure choisie.</p>'+
  '<ul class="rs-pts"><li>'+IC.ok+'<span>Avec l\'option Cliky, il l\'écrit pour vous à partir d\'un chantier fini, avec les photos avant / après.</span></li>'+
  '<li>'+IC.ok+'<span>Les commentaires et messages arrivent ici et dans la fiche du client.</span></li>'+
  '<li>'+IC.ok+'<span>Vous ne donnez jamais vos mots de passe.</span></li></ul>'+
  '<div class="rs-logos" aria-hidden="true">'+RS.map(function(r){return pastille(r.k)}).join('')+'</div></div>'+
  '<button class="btn go cf-go" type="button" data-rs="demander"><span class="lab"><span>Je veux cette option</span></span></button>'+
  '<p class="hint">Cyril vous rappelle pour l\'ajouter à votre abonnement.</p>'}

function vue(){var v=$('#v-reseaux');if(!v)return;
 var h=!prise()?vSans():ecran==='write'?vWrite():ecran==='messages'?vMessages():ecran==='comptes'?vComptes():vHome();
 var c=v.querySelector(':scope>.cf');if(!c){v.innerHTML='';c=document.createElement('div');c.className='cf rs';v.appendChild(c)}c.innerHTML=h;
 var t=$('#rs-t');if(t)t.addEventListener('input',function(){F.t=t.value});
 var dt=$('#rs-dt');if(dt)dt.addEventListener('change',function(){F.dt=dt.value});
 var f=$('#rs-f');if(f)f.addEventListener('change',function(){var x=f.files&&f.files[0];if(!x)return;var r=new FileReader();r.onload=function(){reduire(r.result,function(u){F.ph.push(u);vue()})};r.readAsDataURL(x)});
 majBadge()}
function aller(e){ecran=e;if(e!=='write')F=null;vue();window.scrollTo(0,0)}
/* photo réduite à 900 px pour rester légère sur l'appareil */
function reduire(src,cb){var im=new Image();im.onload=function(){var k=Math.min(1,900/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);try{cb(c.toDataURL('image/jpeg',.8))}catch(e){cb(src)}};im.onerror=function(){cb(src)};im.src=src}

function texteCliky(){var ch=null;try{var C=X.CH||{},k=Object.keys(C),fini=k.filter(function(x){return C[x].closed||C[x].st==='done'});ch=C[(fini.length?fini:k)[0]]||null}catch(e){}
 var quoi=(ch&&ch.t?String(ch.t).split(' · ')[0]:'Salle de bain refaite à neuf'),lieu=ch&&ch.v?' à '+ch.v:'';
 return quoi+lieu+' : terminé dans les temps, chantier rendu propre. Vous avez un projet ? Demandez votre devis sur notre site.'}

function publier(){var t=(F.t||'').trim();
 if(!t){var e=$('#rs-t');if(e)e.focus();X.toast('Il manque le texte','Écrivez-le, dictez-le, ou laissez Cliky l\'écrire.');return}
 if(!F.r.length){X.toast('Choisissez au moins un réseau','Touchez l\'interrupteur à côté du réseau.');return}
 var q=F.quand==='now'?Date.now():F.quand==='jeudi'?jeudi18().getTime():(F.dt?new Date(F.dt).getTime():NaN);
 if(!(q>0)){X.toast('Il manque le jour et l\'heure','Choisissez quand le post doit partir.');return}
 var P=posts().filter(function(p){return !p.ex});
 P.push({id:'p'+Date.now().toString(36),t:t.length>70?t.slice(0,68)+'…':t,v:'POST',img:F.ph[0]||'',q:q,r:F.r.slice(),e:F.quand==='now'?'parti':'prevu'});
 lsS(KP,P);var now=F.quand==='now';F=null;ecran='home';vue();window.scrollTo(0,0);
 X.toast(now?'C\'est parti':'C\'est prévu',(now?'Votre post part sur vos réseaux.':'Il partira '+quandTxt(q).replace(' · ',' à ')+'.')+(vrai()?'':' (Démo : rien n\'est publié.)'))}

function repondre(id){var m=messages().filter(function(x){return x.id===id})[0];if(!m)return;
 X.xopen('Répondre à '+esc(m.qui),rs(m.rs).nom+' · '+esc(m.ou),'<p class="rs-mt">« '+esc(m.t)+' »</p><label class="field">Votre réponse<textarea id="rs-r" rows="4" placeholder="Bonjour, oui bien sûr…"></textarea></label>',
  '<button class="btn" data-xclose>Annuler</button><button class="btn go" data-rs="envoyer" data-id="'+id+'">Envoyer</button>')}
function envoyer(id){var r=$('#rs-r'),t=r&&r.value.trim();if(!t){if(r)r.focus();return}
 var M=messages().map(function(m){if(m.id===id){m.rep=t;m.neuf=0}return m});lsS(KM,M);X.xclose();vue();
 X.toast('Réponse envoyée','Elle part sur '+rs(M.filter(function(m){return m.id===id})[0].rs).nom+'.'+(vrai()?'':' (Démo : rien n\'est envoyé.)'))}

function dicter(){var R=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!R){X.toast('Dictée','Touchez le micro du clavier de votre téléphone pour dicter.');var t=$('#rs-t');if(t)t.focus();return}
 var r=new R();r.lang='fr-FR';r.interimResults=false;X.toast('Je vous écoute','Parlez, puis arrêtez-vous : le texte s\'écrit tout seul.');
 r.onresult=function(e){var s=e.results[0][0].transcript;F.t=(F.t?F.t.replace(/\s*$/,' '):'')+s;vue()};try{r.start()}catch(e){}}

function demander(){var txt='Bonjour Cyril, je voudrais ajouter l\'option Réseaux sociaux à mon abonnement.';
 if(window.PCREG&&typeof PCREG.ecrire==='function'){PCREG.ecrire(txt);return}
 X.toast('C\'est noté','Écrivez « Réseaux sociaux » à Cyril depuis Réglages ☰ › Écrire à Cyril : il vous rappelle.')}

function majBadge(){var n=prise()?messages().filter(function(m){return m.neuf}).length:0;
 ['#nb-reseaux','#tt-reseaux'].forEach(function(s){var b=$(s);if(!b)return;var i=b.querySelector('.rs-nb');if(!n){if(i)i.remove();return}
  if(!i){i=document.createElement('span');i.className='badge rs-nb';b.appendChild(i)}i.textContent=n})}

/* ---------- clics ---------- */
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-rs]');if(!b)return;
 var a=b.getAttribute('data-rs'),k=b.getAttribute('data-k'),id=b.getAttribute('data-id');
 if(a==='home'||a==='write'||a==='messages'||a==='comptes')aller(a);
 else if(a==='rs'){var i=F.r.indexOf(k);if(i>=0)F.r.splice(i,1);else F.r.push(k);b.setAttribute('aria-checked',String(i<0))}
 else if(a==='quand'){F.quand=k;if(k==='autre'&&!F.dt){var d=jeudi18();d.setDate(d.getDate()+1);d.setHours(10);F.dt=new Date(d.getTime()-d.getTimezoneOffset()*6e4).toISOString().slice(0,16)}vue()}
 else if(a==='cliky'){F.t=texteCliky();F.cl=1;vue()}
 else if(a==='dicter')dicter();
 else if(a==='phx'){F.ph.splice(+b.getAttribute('data-i'),1);vue()}
 else if(a==='publier')publier();
 else if(a==='relier'){var C=comptes();C[k]=true;lsS(KC,C);if(F&&F.r.indexOf(k)<0)F.r.push(k);vue();X.toast(rs(k).nom+' est relié',vrai()?'C\'est fait, une fois pour toutes.':'Démo : la fenêtre officielle de '+rs(k).nom+' s\'ouvrira ici.')}
 else if(a==='delier'){var C2=comptes();C2[k]=false;lsS(KC,C2);vue();X.toast(rs(k).nom+' n\'est plus relié','Vos posts déjà publiés restent en ligne.')}
 else if(a==='repondre')repondre(id);
 else if(a==='envoyer')envoyer(id);
 else if(a==='fiche'||a==='demande'){if(X.go)X.go('clients');X.toast(a==='fiche'?'Sa fiche':'Nouvelle demande',a==='fiche'?'Le message est rangé dans son historique.':'La personne est dans vos Clients, avec son message.')}
 else if(a==='demander')demander();
});
document.addEventListener('click',function(e){var t=e.target.closest&&e.target.closest('[role=tab][data-v="reseaux"]');if(t){if(ecran!=='write')ecran='home';vue()}});
window.PCRS={vue:vue};
vue();
})();
