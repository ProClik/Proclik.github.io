/* ================================================================================================
   Notifications de l'Espace (Cyril 25/11) : « les nouveaux pré-devis s'affichent dans les notifications,
   plus de fausses notifications, une pastille Nouveau à l'Accueil là où se trouve le pré-devis ».
   - Un pré-devis est NOUVEAU tant que l'artisan n'a pas ouvert sa demande (sur cet appareil ou un autre :
     tiroir pc-pd-vus, gardé dans le service par sync.js). Un pré-devis refait plus tard redevient nouveau.
   - Seulement avec un vrai compte connecté (html.pcvrai) : en démo, rien n'est inventé ici.
   - Un bandeau en haut, cliquable, qui part seul après 7 s, pour TOUTE nouvelle (pré-devis, demandes, devis signés,
     messages, réserves, notes… fil /espace/nouvelles du service). Pas dans le menu (Cyril).
   - Les vraies notifications du téléphone / de l'iPad (sw.js + push.js du service), même Espace fermé.
   - L'Accueil (accueil-forme.js) et l'écran Devis (vrai.js) posent la pastille « Nouveau ».
   Données : la liste des demandes gardée par vrai.js (pc-vrai-liste). Événement « pc-notifs » à chaque changement.
   ================================================================================================ */
(function(){'use strict';
var d=document,root=d.documentElement,KV='pc-pd-vus';
function lit(k){try{return JSON.parse(localStorage.getItem(k)||'null')}catch(e){return null}}
function ecrit(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function vrai(){return root.classList.contains('pcvrai')&&!lit('pc-membre')}
function valider(x){return /valider/i.test(x.etape||'')}
/* la « version » d'un pré-devis : sa date (un pré-devis recalculé plus tard redevient nouveau) */
function cle(x){return String(x.contact||'')+'|'+String(x.pre_devis_le||x.cree_le||'')}
function vus(){var v=lit(KV);return v&&typeof v==='object'?v:{}}
function liste(){var L=lit('pc-vrai-liste');return (L&&L.demandes)||[]}
function nouveaux(){if(!vrai())return [];var V=vus();
  return liste().filter(function(x){return x.contact&&valider(x)&&(x.total_ht!=null||x.pre_devis_le)&&!V[cle(x)]})}
function estNouveau(c){if(!c)return false;return nouveaux().some(function(x){return x.contact===c})}
function marquerVu(c){if(!c||!vrai())return;var V=vus(),ch=false;
  liste().forEach(function(x){if(x.contact===c&&!V[cle(x)]){V[cle(x)]=Date.now();ch=true}});
  if(!ch)return;
  /* on ne garde que les 300 plus récents */
  var K=Object.keys(V).sort(function(a,b){return V[b]-V[a]});K.slice(300).forEach(function(k){delete V[k]});
  ecrit(KV,V);signale()}

/* ---------- l'heure d'arrivée, dite simplement ---------- */
function quand(iso){var t=Date.parse(iso||'');if(!t)return '';var dt=new Date(t),now=new Date(),h=dt.getHours()+' h '+String(dt.getMinutes()).padStart(2,'0');
  var j0=new Date(now.getFullYear(),now.getMonth(),now.getDate()).getTime(),dj=Math.floor((j0-new Date(dt.getFullYear(),dt.getMonth(),dt.getDate()).getTime())/864e5);
  if(dj<=0){var m=Math.round((now-dt)/6e4);return m<2?'à l\'instant':m<60?'il y a '+m+' min':'aujourd\'hui à '+h}
  if(dj===1)return 'hier à '+h;
  return 'le '+dt.toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'short'})}
function eur(n){return n==null?'':Number(n).toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})+' € HT'}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}

var IC='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 21H6V3h8l4 4v4"/><path d="M14 3v4h4M9 9h4M9 13h3"/><path d="M19.5 13.5l-5.5 5.5-.6 2.6 2.6-.6 5.5-5.5z"/></svg>',
  ICX='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17"/></svg>';

/* ---------- prévenir les autres écrans ---------- */
var sig='';
function signale(){sig=signature();try{d.dispatchEvent(new CustomEvent('pc-notifs'))}catch(e){}}
function signature(){return vrai()?nouveaux().map(cle).join(','):''}

/* ---------- LE BANDEAU EN HAUT (Cyril 25/11 : « à l'ouverture, en haut de l'Espace, qui disparaît après quelques
   secondes et qui est cliquable » ; « il faut que ça marche pour n'importe quelle nouvelle ») ----------
   Une file : chaque nouvelle passe à son tour (7 s, ou fermée d'un geste). Sources :
   - les pré-devis pas encore ouverts (liste de vrai.js), à chaque ouverture tant qu'ils ne sont pas ouverts ;
   - le fil des nouvelles du service (/espace/nouvelles : demandes, devis signés, messages, réserves, notes…),
     chacune une fois par appareil. */
var I=function(p){return '<svg viewBox="0 0 24 24" aria-hidden="true">'+p+'</svg>'};
var ICT={predevis:IC,demande:I('<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>'),signe:I('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
  message:I('<path d="M4 5h16v11H9l-5 4z"/>'),reserve:I('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v5.5M12 16.3v.2"/>'),note:I('<path d="M5 19l1-4 10-10 3 3-10 10z"/><path d="M14 7l3 3"/>'),
  cloche:I('<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>')};
var SUR={demande:'Nouvelle demande',signe:'Devis signé',message:'Nouveau message',reserve:'Réserve',note:'Note de chantier',chantier:'Chantier'};
var Q=[],ban=null,tmB=null,enCours=null,montres={};
function occupe(){var w=d.getElementById('welcome');return !!(d.getElementById('pc-ouv')||d.getElementById('pc-ouk')||(w&&!w.hidden)||d.getElementById('pc-ini'))}
function pousse(it){if(Q.some(function(y){return y.k===it.k})||(enCours&&enCours.k===it.k))return;Q.push(it);suivant()}
function suivant(){if(enCours||!Q.length)return;
  if(occupe()||d.hidden){setTimeout(suivant,500);return}
  var it=Q.shift();if(it.encore&&!it.encore())return suivant();
  enCours=it;
  if(!ban){ban=d.createElement('div');ban.className='pc-ban';ban.setAttribute('role','status');ban.setAttribute('aria-live','polite');d.body.appendChild(ban);
    ban.addEventListener('click',function(e){var x=enCours;if(e.target.closest('.pc-ban-x')){if(x&&x.non)x.non();cache();return}cache();if(x&&x.act)x.act()});
    /* glisser vers le haut = fermer */
    var y0=null;ban.addEventListener('touchstart',function(e){y0=e.touches[0].clientY},{passive:true});
    ban.addEventListener('touchmove',function(e){if(y0!=null&&e.touches[0].clientY-y0<-25){y0=null;cache()}},{passive:true})}
  ban.innerHTML='<button type="button" class="pc-ban-b"><span class="rond">'+(it.ic||ICT.cloche)+'</span><span class="x"><small>'+esc(it.sur)+'</small>'+
    '<b>'+esc(it.titre)+'</b>'+(it.sous?'<span>'+esc(it.sous)+'</span>':'')+'</span>'+
    '<span class="go">'+esc(it.go||'Voir')+'</span></button><button type="button" class="pc-ban-x" aria-label="Fermer">'+ICX+'</button>';
  ban.hidden=false;requestAnimationFrame(function(){requestAnimationFrame(function(){ban.classList.add('on')})});
  try{if(navigator.vibrate)navigator.vibrate(12)}catch(e){}
  clearTimeout(tmB);tmB=setTimeout(cache,it.ms||7000)}
function cache(){clearTimeout(tmB);if(!ban)return;ban.classList.remove('on');
  setTimeout(function(){if(ban&&!ban.classList.contains('on'))ban.hidden=true;enCours=null;setTimeout(suivant,350)},400)}

/* les pré-devis pas encore ouverts */
function annonce(){if(!vrai())return;var L=nouveaux().filter(function(x){return !montres[cle(x)]});if(!L.length)return;
  L.forEach(function(x){montres[cle(x)]=1});var x=L[0],plus=L.length>1;
  pousse({k:'pd:'+L.map(cle).join(','),ic:IC,sur:plus?L.length+' nouveaux pré-devis':'Nouveau pré-devis',
    titre:plus?L.map(function(y){return y.client||'Client'}).slice(0,3).join(', ')+(L.length>3?'…':''):(x.client||'Client'),
    sous:plus?'Touchez pour les voir':[x.total_ht!=null?eur(x.total_ht):'',quand(x.pre_devis_le||x.cree_le)].filter(Boolean).join(' · '),
    go:plus?'Voir':'Vérifier',encore:function(){return L.some(function(y){return estNouveau(y.contact)})},
    act:function(){if(plus){var t=d.getElementById('nb-devis');if(t)t.click();return}marquerVu(x.contact);if(window.PCV&&PCV.ouvrirDemande)PCV.ouvrirDemande(x.contact)}})}
function suit(){var s=signature();if(s!==sig){sig=s;annonce();try{d.dispatchEvent(new CustomEvent('pc-notifs'))}catch(e){}}}

/* aller là où la nouvelle le dit : une demande (c), un écran (vue) et un chantier (ch) */
function va(n){if(!n)return;
  if(n.c){marquerVu(n.c);if(window.PCV&&PCV.ouvrirDemande)PCV.ouvrirDemande(n.c);return}
  if(n.vue){var t=d.getElementById('nb-'+n.vue);if(t)t.click();if(n.ch)setTimeout(function(){if(window.PCCH&&PCCH.ouvrir)try{PCCH.ouvrir(n.ch)}catch(e){}},350)}}
/* lien d'une notification du téléphone : espace-depart/#vue=chantiers&ch=… (les #c= sont ouverts par vrai.js) */
function lienHash(){var h=location.hash||'',m=/[#&]vue=([a-z0-9-]{2,30})/.exec(h);if(!m)return;var c=/[#&]ch=([^&]{1,60})/.exec(h);
  try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}
  var go=function(){if(occupe()||!vrai())return setTimeout(go,400);va({vue:m[1],ch:c?decodeURIComponent(c[1]):''})};setTimeout(go,300)}
addEventListener('hashchange',lienHash);

/* le fil des nouvelles du service : chacune une fois par appareil */
var KD='pc-nf-depuis',chargeF=0;
function api(c,o){return window.PCV&&PCV.api?PCV.api(c,o):Promise.reject(new Error('hors ligne'))}
function fil(){if(!vrai()||!lit('pc-vrai-jeton'))return;chargeF=Date.now();
  var dep=+lit(KD)||0;if(!dep){dep=Date.now()-864e5;ecrit(KD,dep)} /* 1re fois : seulement les dernières 24 h */
  api('/espace/nouvelles?depuis='+dep).then(function(x){var L=(x&&x.nouvelles)||[];if(!L.length)return;
    ecrit(KD,Math.max.apply(null,L.map(function(n){return n.t}).concat([dep])));
    L.slice().reverse().filter(function(n){return n.type!=='predevis'}).slice(-5).forEach(function(n){
      pousse({k:'nf:'+n.id,ic:ICT[n.type]||ICT.cloche,sur:SUR[n.type]||'Nouveau',titre:/^(demande|signe)$/.test(n.type)?String(n.titre||'').split(' · ').slice(1).join(' · ')||n.titre:String(n.titre||''),
        sous:n.texte||'',go:n.c?'Ouvrir':'Voir',act:function(){va(n)}})})},function(){})}
function auRetour(){if(!d.hidden){suit();if(Date.now()-chargeF>120000)fil()}}

/* ouvrir une demande (Accueil, Devis, bandeau…) = elle n'est plus nouvelle */
d.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-vc]');if(b)marquerVu(b.getAttribute('data-vc'))},true);
/* la liste change (vrai.js la recharge, un autre appareil a marqué « vu ») */
setInterval(suit,2000);addEventListener('storage',suit);
d.addEventListener('visibilitychange',auRetour);
setInterval(function(){if(!d.hidden&&Date.now()-chargeF>180000)fil()},60000);

/* ---------- VRAIES NOTIFICATIONS DU TÉLÉPHONE / DE L'IPAD (même Espace fermé) ----------
   iPhone/iPad : iOS 16.4 ou plus, et l'Espace ajouté à l'écran d'accueil (règle d'Apple). Android, ordinateur : direct.
   Le service envoie (proclik-cliky, push.js) ; ici : l'autorisation, l'abonnement de l'appareil, et sw.js qui affiche. */
var KN='pc-push-non';
function ios(){return /iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)}
function standalone(){return (window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone===true}
function pushOk(){return 'serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window}
function etatPush(){if(pushOk())return Notification.permission==='granted'?(lit('pc-push-on')?'on':'a-finir'):Notification.permission==='denied'?'bloque':'off';
  return ios()&&!standalone()?'installer':'impossible'}
function deb64u(s){var t=String(s).replace(/-/g,'+').replace(/_/g,'/');t+='==='.slice((t.length+3)%4);var b=atob(t),u=new Uint8Array(b.length);for(var i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u}
function appareil(){var u=navigator.userAgent;return /iPad/.test(u)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)?'iPad':/iPhone/.test(u)?'iPhone':/Android/.test(u)?'Android':/Mac/.test(u)?'Mac':/Windows/.test(u)?'PC':'Appareil'}
function enregistrer(){return navigator.serviceWorker.register('sw.js').then(function(){return navigator.serviceWorker.ready})}
function abonner(reg,silence){return api('/espace/push/cle').then(function(k){
    return reg.pushManager.getSubscription().then(function(s){return s||reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:deb64u(k.cle)})})})
  .then(function(s){return api('/espace/push/abonner',{method:'POST',body:{abonnement:s.toJSON(),appareil:appareil()}})})
  .then(function(){ecrit('pc-push-on',Date.now());if(!silence)return api('/espace/push/essai',{method:'POST',body:{}})})}
function toast(a,b){if(window.PCX&&PCX.toast)PCX.toast(a,b||'')}
function activer(){var e=etatPush();
  if(e==='installer'){var ic=d.getElementById('inst-card');if(typeof window.showInstall==='function')window.showInstall();else if(ic)ic.click();
    else toast('D\'abord l\'écran d\'accueil','Sur iPhone et iPad, ajoutez l\'Espace à l\'écran d\'accueil (Partager › Sur l\'écran d\'accueil), puis rouvrez-le depuis son icône.');return}
  if(e==='impossible'){toast('Pas possible sur cet appareil','Essayez depuis Safari (iPhone/iPad, appli ajoutée à l\'écran d\'accueil) ou Chrome.');return}
  if(e==='bloque'){toast('Notifications refusées',ios()?'Réglages de l\'iPhone › Notifications › ProClik › Autoriser.':'Autorisez-les dans les réglages du navigateur pour ce site.');return}
  /* la question du téléphone doit partir tout de suite après le toucher */
  var p;try{p=Notification.requestPermission()}catch(x){p=null}
  Promise.resolve(p).then(function(r){if((r||Notification.permission)!=='granted'){toast('Pas de notifications','Vous pourrez les activer plus tard dans les Réglages ☰.');return}
    return enregistrer().then(function(reg){return abonner(reg,false)}).then(function(){toast('Notifications activées','Un essai vient d\'arriver sur cet appareil.');majReglage()})})
  .catch(function(x){toast('Pas pu activer',String(x&&x.message||x))})}
/* déjà autorisé : on garde l'abonnement à jour une fois par jour (il change parfois tout seul) */
function garder(){if(!vrai()||!pushOk()||Notification.permission!=='granted')return;var j=new Date().toDateString();if(lit('pc-push-jour')===j)return;
  enregistrer().then(function(reg){return abonner(reg,true)}).then(function(){ecrit('pc-push-jour',j)},function(){})}
/* l'invitation, une fois l'ouverture passée (et pas plus d'une fois tous les 14 jours si on dit non) */
function invite(){var e=etatPush();if(!vrai()||(e!=='off'&&e!=='installer'))return;if(Date.now()-(+lit(KN)||0)<14*864e5)return;
  pousse({k:'push-invite',ic:ICT.cloche,sur:'Notifications',titre:'Être prévenu sur ce '+(appareil()==='iPad'?'iPad':'téléphone')+' ?',
    sous:e==='installer'?'Ajoutez d\'abord l\'Espace à l\'écran d\'accueil : nouvelles demandes, pré-devis, messages arrivent même Espace fermé.':'Nouvelles demandes, pré-devis, messages… même Espace fermé.',
    go:e==='installer'?'Comment ?':'Activer',ms:12000,act:activer,non:function(){ecrit(KN,Date.now())}})}
/* les clics sur une notification du téléphone quand l'Espace est déjà ouvert (sw.js) */
if('serviceWorker' in navigator)navigator.serviceWorker.addEventListener('message',function(e){var u=e.data&&e.data.pcUrl;if(!u)return;
  var h=String(u).split('#')[1];if(h){location.hash=h;lienHash()}});

/* dans les Réglages ☰ : une ligne « Notifications » */
var MOT={on:['Activées sur cet appareil','sw on'],'a-finir':['Touchez pour finir','sw'],off:['Touchez pour les activer','sw'],bloque:['Refusées : à autoriser dans les réglages','sw'],
  installer:['Ajoutez d\'abord l\'Espace à l\'écran d\'accueil','sw'],impossible:['Pas possible sur ce navigateur','sw']};
function majReglage(){var b=d.getElementById('pcn-reg');if(!b)return;var m=MOT[etatPush()];b.querySelector('small').textContent=m[0];b.querySelector('.sw').className=m[1]}
var menu=d.getElementById('menu');
if(menu)menu.addEventListener('click',function(){setTimeout(function(){if(!vrai())return;var c=d.querySelector('#x-in .card.menu');if(!c||d.getElementById('pcn-reg'))return;
  var b=d.createElement('button');b.id='pcn-reg';b.innerHTML='<span class="av">'+ICT.cloche+'</span><span class="tx"><b>Notifications</b><small></small></span><span class="sw" role="switch" aria-hidden="true"><i></i></span>';
  var a=d.getElementById('rg-aides');c.insertBefore(b,a||c.firstChild);majReglage();
  b.addEventListener('click',function(){var e=etatPush();if(e==='on'){api('/espace/push/essai',{method:'POST',body:{}}).then(function(){toast('Essai envoyé','Il arrive sur vos appareils dans un instant.')},function(x){toast('Pas pu envoyer',x.message)});return}activer()})},60)});

/* ---------- styles (pastille Nouveau + bandeau du haut) ---------- */
var st=d.createElement('style');st.textContent=
 ':root{--pcn-a:var(--f2-act-j,#1B2440);--pcn-s:var(--f2-sur-j,#fff);--pcn-l:#A8823F}:root[data-theme=dark]{--pcn-a:var(--f2-act-n,#EFEBE2);--pcn-s:var(--f2-sur-n,#1B2440);--pcn-l:#D4B483}'+
 '.pc-nv{display:inline-flex;align-items:center;gap:5px;font-size:11.5px;font-weight:700;letter-spacing:.01em;padding:4px 10px 4px 8px;border-radius:20px;background:var(--pcn-a);color:var(--pcn-s);white-space:nowrap;line-height:1.2}'+
 '.pc-nv:before{content:"";width:6px;height:6px;border-radius:50%;background:var(--pcn-l)}'+
 '.f2 .f2a .hero .lab{flex-wrap:wrap}.f2 .f2a .hero .lab .pc-nv{margin-left:auto}'+
 '.pc-ban{position:fixed;z-index:120;left:50%;top:calc(10px + env(safe-area-inset-top,0px));width:min(560px,calc(100vw - 24px));transform:translate(-50%,-140%);opacity:0;transition:transform .45s cubic-bezier(.2,.8,.2,1),opacity .3s;display:flex;align-items:stretch;border-radius:22px;background:#fff;color:#17181D;box-shadow:0 2px 6px rgba(23,24,29,.08),0 18px 40px -14px rgba(23,24,29,.45)}'+
 '.pc-ban.on{transform:translate(-50%,0);opacity:1}'+
 '[data-theme=dark] .pc-ban{background:#262B36;color:#F2EEE4;box-shadow:0 18px 40px -14px rgba(0,0,0,.7)}'+
 '.pc-ban button{all:unset;box-sizing:border-box;cursor:pointer;-webkit-tap-highlight-color:transparent}'+
 '.pc-ban .pc-ban-b{flex:1;min-width:0;display:flex;align-items:center;gap:12px;padding:12px 6px 12px 14px}'+
 '.pc-ban .pc-ban-b:active{opacity:.8}'+
 '.pc-ban .rond{flex:none;width:42px;height:42px;border-radius:50%;display:grid;place-items:center;background:var(--pcn-a);color:var(--pcn-s)}'+
 '.pc-ban .rond svg{width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}'+
 '.pc-ban .x{flex:1;min-width:0;display:grid;gap:1px}'+
 '.pc-ban .x small{font-size:12px;font-weight:700;color:var(--pcn-l);letter-spacing:.01em}'+
 '.pc-ban .x b{font-size:16px;font-weight:700;line-height:1.25;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}'+
 '.pc-ban .x span{font-size:13px;opacity:.7}'+
 '.pc-ban .go{flex:none;font-size:13.5px;font-weight:700;padding:8px 14px;border-radius:20px;background:var(--pcn-a);color:var(--pcn-s)}'+
 '.pc-ban .pc-ban-x{flex:none;width:40px;display:grid;place-items:center;opacity:.55}'+
 '.pc-ban .pc-ban-x svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}'+
 '@media (prefers-reduced-motion:reduce){.pc-ban{transition:opacity .2s}}'+
 '.vcard .pc-nv{margin-left:8px;vertical-align:1px}';
d.head.appendChild(st);

window.PCNotif={nouveaux:nouveaux,estNouveau:estNouveau,vu:marquerVu,activer:activer,etat:etatPush,montre:pousse,nb:function(){return nouveaux().length},
  pastille:function(){return '<span class="pc-nv">Nouveau</span>'}};
sig=signature();setTimeout(function(){annonce();sig=signature();fil();lienHash();garder();setTimeout(invite,2500)},1200);
})();
