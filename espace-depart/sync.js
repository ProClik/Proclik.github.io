/* ================================================================================================
   Espace ProClik : les données de l'Espace gardées dans le service (Cyril 20/11, « C'est parti »).
   Chantiers, planning, dépenses, commandes, équipe, cotes, contrats d'entretien, clients et devis faits à la main :
   avant, tout restait sur l'appareil. Maintenant, dès que l'artisan est connecté :
   - chaque changement part au service ~1,5 s après (et au plus tard quand on quitte la page) ;
   - à l'ouverture, ce qui a été fait sur un autre appareil revient ici (la page se recharge une fois, toute seule) ;
   - sans réseau, rien n'est perdu : c'est envoyé au retour du réseau ou à la prochaine ouverture.
   Le dernier enregistré gagne, mais rien n'est perdu (Cyril 20/11, « des sécurités, voire double ») :
   copie de secours sur l'appareil avant chaque remplacement + historique dans le service (30 jours, retour
   en arrière depuis l'Admin), et la version d'avant toujours gardée en cas de conflit entre deux appareils.
   Rien ne part en démo, dans l'Espace d'exemple ni dans l'aperçu de Cyril (lecture seule).
   Service : GET/POST /espace/donnees (proclik-cliky, calcul/donnees.js). Chargé juste après config.js.
   ================================================================================================ */
(function(){'use strict';
if(/[?&]exemple=/.test(location.search))return;
var SERVICE=String(window.PC_SERVICE||'').replace(/\/+$/,'');if(!/^https:\/\/[a-z0-9.-]+$/i.test(SERVICE))return;
var CLES=['pc-ch9','pc-ev1','pc-st1','pc-dep1','pc-compta1','pc-cmd1','pc-eq1','pc-cotes','pc-ent-v1','pc-ent-on','pc-plans','pc-cl1','pc-cl-sup','pc-fa1','pc-dvn1','pc-rc1','pc-sit-reg'];
var META='pc-sync',ls=window.localStorage,S=Storage.prototype,set0=S.setItem,rem0=S.removeItem,calme=0,minuteur=null,enCours=0,arret=0;
function lit(k){try{var v=ls.getItem(k);return v==null?null:JSON.parse(v)}catch(e){return null}}
function meta(){var m=lit(META);return m&&typeof m==='object'&&m.k?m:{a:null,k:{}}}
function ecrisMeta(m){calme++;try{set0.call(ls,META,JSON.stringify(m))}catch(e){}calme--}
function jeton(){return lit('pc-vrai-jeton')}
function apercu(){try{return sessionStorage.getItem('pc-apercu')==='1'}catch(e){return false}}
function actif(){return !!jeton()&&!apercu()&&!arret}

/* Chaque écriture d'un tiroir suivi le marque « à envoyer ». */
function marquer(k){var m=meta();m.k[k]=m.k[k]||{};m.k[k].sale=1;ecrisMeta(m);if(actif()){clearTimeout(minuteur);minuteur=setTimeout(envoyer,1500)}}
S.setItem=function(x,v){var r=set0.call(this,x,v);if(this===ls&&!calme){if(CLES.indexOf(x)>=0)marquer(x);else if(x==='pc-vrai-jeton'&&v&&v!=='null')setTimeout(tirer,300)}return r};
S.removeItem=function(x){var r=rem0.call(this,x);if(this===ls&&!calme&&CLES.indexOf(x)>=0)marquer(x);return r};

function appel(chemin,o,garder){o=o||{};var h={Authorization:'Bearer '+jeton()};if(o.body)h['Content-Type']='application/json';
 return fetch(SERVICE+chemin,{method:o.method||'GET',headers:h,body:o.body,cache:'no-store',keepalive:!!garder}).then(function(r){
  return r.json().catch(function(){return {}}).then(function(j){if(r.status===401||r.status===402||r.status===403)arret=1;if(!r.ok||j.ok===false)throw new Error(j.erreur||('Erreur '+r.status));return j})})}

/* Photos rangées à part (Cyril 20/11 : « Ok pour … les photos ») : chaque photo écrite dans un tiroir part UNE fois
   au coffre du service (POST /espace/photo) ; le tiroir ne garde que son adresse, ici comme dans le service.
   Ça libère la place de l'appareil et du compte. Si le service ne peut pas la prendre, la photo reste comme avant. */
var PHOTO=/data:image\/[a-z]+;base64,[A-Za-z0-9+\/=]{20000,}/g,PHM='pc-sync-ph';
function emprunte(x){var h=2166136261;for(var i=0;i<x.length;i++){h^=x.charCodeAt(i);h=Math.imul(h,16777619)}return x.length+':'+(h>>>0).toString(36)}
function photosDehors(v){var L=v&&v.indexOf('data:image/')>=0?(v.match(PHOTO)||[]):[];if(!L.length)return Promise.resolve(v);
 var M=lit(PHM)||{},u={};L=L.filter(function(x){if(u[x])return false;u[x]=1;return true});
 return L.reduce(function(p,x){return p.then(function(){var e=emprunte(x);if(M[e])return;
   return appel('/espace/photo',{method:'POST',body:JSON.stringify({img:x})}).then(function(r){if(r&&r.url){M[e]=r.url;calme++;try{set0.call(ls,PHM,JSON.stringify(M))}catch(er){}calme--}},function(){})})},Promise.resolve())
  .then(function(){return v.replace(PHOTO,function(x){return M[emprunte(x)]||x})})}

/* Envoi de ce qui a changé, un tiroir après l'autre. */
function envoyer(garder){if(!actif()||enCours)return;var m=meta(),L=CLES.filter(function(k){return m.k[k]&&m.k[k].sale});if(!L.length)return;
 enCours=1;var k=L[0],v0=ls.getItem(k);
 if(garder&&v0&&PHOTO.test(v0)){PHOTO.lastIndex=0;enCours=0;return}/* des photos à ranger : à la prochaine ouverture */PHOTO.lastIndex=0;
 if(garder)return poste(k,v0,true);
 photosDehors(v0).then(function(v){if(v!==v0&&ls.getItem(k)===v0){calme++;try{set0.call(ls,k,v)}catch(e){}calme--}poste(k,v,false)},function(){poste(k,v0,false)})}
function poste(k,v,garder){var m=meta(),corps=JSON.stringify({cle:k,val:v,base:(m.k[k]&&m.k[k].maj)||0});
 if(garder&&corps.length>60000){enCours=0;return}/* trop gros pour partir pendant la fermeture : part à la prochaine ouverture */
 appel('/espace/donnees',{method:'POST',body:corps},garder).then(function(r){var m2=meta();m2.k[k]=m2.k[k]||{};m2.k[k].maj=r.maj;
   if(ls.getItem(k)===v)delete m2.k[k].sale;ecrisMeta(m2);enCours=0;etat('ok');envoyer()},
  function(e){enCours=0;etat('attente',e.message);if(!arret){clearTimeout(minuteur);minuteur=setTimeout(envoyer,30000)}})}

/* Sécurité n° 1 : avant de remplacer ce qui est sur l'appareil par la version du service, une copie est gardée ici
   (« pc-sync-sauve », la dernière par tiroir). Si l'appareil est plein, on garde au moins le service (historique). */
function sauve(k,v){if(v==null||v.length>1e6)return;try{var x=lit('pc-sync-sauve')||{};x[k]={le:Date.now(),val:v};
 /* jamais plus de ~1,5 million de caractères : la place de l'appareil reste pour l'Espace lui-même */
 var K=Object.keys(x).sort(function(a,b){return x[b].le-x[a].le}),t=0;K.forEach(function(c){t+=x[c].val.length;if(t>15e5)delete x[c]});
 set0.call(ls,'pc-sync-sauve',JSON.stringify(x))}catch(e){try{rem0.call(ls,'pc-sync-sauve')}catch(e2){}}}
function pose(k,val){sauve(k,ls.getItem(k));set0.call(ls,k,val)}

/* À l'ouverture : ce qui a été fait ailleurs revient ici. */
/* 1) les dates seulement (léger) ; 2) le contenu des seuls tiroirs plus récents ailleurs. */
function tirer(){if(!actif())return;arret=0;
 appel('/espace/donnees').then(function(r){var m=meta(),T=r.dates||{},autre=m.a&&m.a!==r.compte,
   L=CLES.filter(function(k){return T[k]&&(autre||T[k]>((m.k[k]||{}).maj||0))});
  if(!L.length)return {compte:r.compte,donnees:{}};
  return appel('/espace/donnees?cles='+encodeURIComponent(L.join(',')))}).then(function(r){if(!r)return;var m=meta(),D=r.donnees||{},change=0;calme++;
  try{
   if(m.a&&m.a!==r.compte){/* autre compte sur cet appareil : on prend les données de ce compte-là */
    CLES.forEach(function(k){var d=D[k],v=ls.getItem(k);if(d){if(v!==d.val){pose(k,d.val);change=1}}else if(v!=null){sauve(k,v);rem0.call(ls,k);change=1}});
    m={a:r.compte,k:{}};CLES.forEach(function(k){if(D[k])m.k[k]={maj:D[k].maj}});
   }else{m.a=r.compte;
    CLES.forEach(function(k){var d=D[k],e=m.k[k]=m.k[k]||{},v=ls.getItem(k);
     if(d&&d.maj>(e.maj||0)){if(e.sale)return;/* changé ici aussi sans avoir pu partir : le plus récent gagne, il repart */
      if(v!==d.val){pose(k,d.val);change=1}e.maj=d.maj;}
     else if(!d&&v!=null&&!e.maj)e.sale=1;/* jamais envoyé (Espace utilisé avant ce branchement) : il part */});
   }
  }finally{calme--}
  ecrisMeta(m);etat('ok');
  if(change){var t=0;try{t=+sessionStorage.getItem('pc-sync-rl')||0}catch(e){}
   if(Date.now()-t>20000){try{sessionStorage.setItem('pc-sync-rl',String(Date.now()))}catch(e){}location.reload();return}}
  envoyer()},function(e){etat('attente',e.message)})}

var ETAT={t:'',msg:''};function etat(t,msg){ETAT={t:t,msg:msg||'',le:Date.now()};try{document.dispatchEvent(new CustomEvent('pc-sync',{detail:ETAT}))}catch(e){}}
window.PCSYNC={tirer:tirer,envoyer:envoyer,etat:function(){return ETAT},cles:CLES.slice()};

window.addEventListener('online',function(){tirer()});
document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden')envoyer(true);else tirer()});
window.addEventListener('pagehide',function(){envoyer(true)});
if(jeton())tirer();
})();
