/* ================================================================================================
   Notifications de l'Espace (Cyril 25/11) : « les nouveaux pré-devis s'affichent dans les notifications,
   plus de fausses notifications, une pastille Nouveau à l'Accueil là où se trouve le pré-devis ».
   - Un pré-devis est NOUVEAU tant que l'artisan n'a pas ouvert sa demande (sur cet appareil ou un autre :
     tiroir pc-pd-vus, gardé dans le service par sync.js). Un pré-devis refait plus tard redevient nouveau.
   - Seulement avec un vrai compte connecté (html.pcvrai) : en démo, rien n'est inventé ici.
   - Le panneau « Tout l'Espace » (barre-forme.js) les liste en tête, le rond du menu les compte,
     l'Accueil (accueil-forme.js) et l'écran Devis (vrai.js) posent la pastille « Nouveau ».
   - Quand un nouveau pré-devis arrive pendant que l'Espace est ouvert : un petit message « Nouveau pré-devis ».
   Données : la liste des demandes gardée par vrai.js (pc-vrai-liste). Événement « pc-notifs » à chaque changement.
   ================================================================================================ */
(function(){'use strict';
var d=document,root=d.documentElement,KV='pc-pd-vus',KN='pc-pd-annonces';
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

/* ---------- ce que montre le panneau « Tout l'Espace » ---------- */
var IC='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 21H6V3h8l4 4v4"/><path d="M14 3v4h4M9 9h4M9 13h3"/><path d="M19.5 13.5l-5.5 5.5-.6 2.6 2.6-.6 5.5-5.5z"/></svg>';
function html(){if(!vrai())return '';var N=nouveaux();
  var h='<div class="f2m-g f2nt"><h3>Notifications'+(N.length?' <em>'+N.length+'</em>':'')+'</h3>';
  if(!N.length)return h+'<p class="f2nt-vide">Rien de nouveau. Chaque nouveau pré-devis arrivera ici.</p></div>';
  return h+'<div class="f2nt-l">'+N.slice(0,6).map(function(x){var q=quand(x.pre_devis_le||x.cree_le);
    return '<button type="button" class="f2nt-i" data-vc="'+esc(x.contact)+'"><span class="rond">'+IC+'</span><span class="x"><b>'+esc(x.client||'Client')+'</b>'+
      '<span>'+esc(['Pré-devis prêt',x.total_ht!=null?eur(x.total_ht):'',q].filter(Boolean).join(' · '))+'</span></span><span class="nv">Nouveau</span></button>'}).join('')+
    (N.length>6?'<button type="button" class="f2nt-plus" data-f2m="devis">Et '+(N.length-6)+' autre'+(N.length>7?'s':'')+' ›</button>':'')+'</div></div>'}

/* ---------- prévenir les autres écrans ---------- */
var sig='';
function signale(){sig=signature();try{d.dispatchEvent(new CustomEvent('pc-notifs'))}catch(e){}}
function signature(){return vrai()?nouveaux().map(cle).join(','):''}
/* un pré-devis arrivé pendant que l'Espace est ouvert : un petit message, une seule fois */
function annonce(){if(!vrai())return;var A=lit(KN)||{},N=nouveaux(),neufs=N.filter(function(x){return !A[cle(x)]});
  if(!neufs.length)return;
  var premier=!lit(KN);neufs.forEach(function(x){A[cle(x)]=Date.now()});
  var K=Object.keys(A).sort(function(a,b){return A[b]-A[a]});K.slice(300).forEach(function(k){delete A[k]});ecrit(KN,A);
  if(premier)return; /* première ouverture : la liste suffit, pas de message pour l'ancien */
  var X=window.PCX,x=neufs[0];if(!X||!X.toast)return;
  X.toast(neufs.length>1?neufs.length+' nouveaux pré-devis':'Nouveau pré-devis · '+(x.client||''),
    (neufs.length>1?'Touchez pour les voir':(x.total_ht!=null?eur(x.total_ht)+' · ':'')+'Touchez pour le vérifier'),
    function(){if(neufs.length>1){var t=d.getElementById('nb-devis');if(t)t.click()}else if(window.PCV&&PCV.ouvrirDemande){marquerVu(x.contact);PCV.ouvrirDemande(x.contact)}})}
function suit(){var s=signature();if(s!==sig){sig=s;annonce();try{d.dispatchEvent(new CustomEvent('pc-notifs'))}catch(e){}}}

/* ouvrir une demande (Accueil, Devis, panneau, message) = elle n'est plus nouvelle */
d.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-vc]');if(b)marquerVu(b.getAttribute('data-vc'))},true);
/* la liste change (vrai.js la recharge, un autre appareil a marqué « vu ») */
setInterval(suit,2000);addEventListener('storage',suit);
d.addEventListener('visibilitychange',function(){if(!d.hidden)suit()});

/* ---------- styles (pastille Nouveau + bloc Notifications du panneau) ---------- */
var st=d.createElement('style');st.textContent=
 '.pc-nv{display:inline-flex;align-items:center;gap:5px;font-size:11.5px;font-weight:700;letter-spacing:.01em;padding:4px 10px 4px 8px;border-radius:20px;background:var(--nuit,#1B2440);color:var(--sur-nuit,#fff);white-space:nowrap;line-height:1.2}'+
 '.pc-nv:before{content:"";width:6px;height:6px;border-radius:50%;background:var(--laiton,#A8823F)}'+
 '.f2 .f2a .hero .lab{flex-wrap:wrap}.f2 .f2a .hero .lab .pc-nv{margin-left:auto}'+
 '.f2m .f2nt h3 em{font-style:normal;font-size:11px;font-weight:800;min-width:18px;height:18px;padding:0 5px;border-radius:9px;display:inline-grid;place-items:center;background:var(--rose,#D9534F);color:#fff;margin-left:6px;vertical-align:1px}'+
 '.f2m .f2nt-vide{margin:0;padding:12px 14px;border-radius:16px;background:var(--tile,rgba(0,0,0,.03));color:var(--mut,#6b6f78);font-size:14px}'+
 '.f2m .f2nt-l{display:grid;gap:8px}'+
 '.f2m .f2nt-i{all:unset;box-sizing:border-box;cursor:pointer;display:flex;align-items:center;gap:12px;width:100%;padding:12px 14px;border-radius:18px;background:var(--tile,#fff);box-shadow:0 1px 2px rgba(23,24,29,.06),0 10px 24px -18px rgba(23,24,29,.45);-webkit-tap-highlight-color:transparent}'+
 '.f2m .f2nt-i:active{transform:scale(.985)}'+
 '.f2m .f2nt-i .rond{flex:none;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;background:var(--nuit,#1B2440);color:var(--sur-nuit,#fff)}'+
 '.f2m .f2nt-i .rond svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}'+
 '.f2m .f2nt-i .x{flex:1;min-width:0;display:grid;gap:2px}.f2m .f2nt-i .x b{font-size:15px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
 '.f2m .f2nt-i .x span{font-size:13px;color:var(--mut,#6b6f78)}'+
 '.f2m .f2nt-i .nv{flex:none;font-size:11px;font-weight:700;padding:4px 9px;border-radius:20px;background:var(--nuit,#1B2440);color:var(--sur-nuit,#fff)}'+
 '.f2m .f2nt-plus{all:unset;cursor:pointer;font-size:14px;font-weight:600;padding:6px 4px;color:var(--fg)}'+
 '.vcard .pc-nv{margin-left:8px;vertical-align:1px}';
d.head.appendChild(st);

window.PCNotif={nouveaux:nouveaux,estNouveau:estNouveau,vu:marquerVu,html:html,nb:function(){return nouveaux().length},
  pastille:function(){return '<span class="pc-nv">Nouveau</span>'}};
sig=signature();setTimeout(function(){annonce();sig=signature()},1500);
})();
