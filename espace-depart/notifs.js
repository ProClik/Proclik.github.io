/* ================================================================================================
   Notifications de l'Espace (Cyril 25/11) : « les nouveaux pré-devis s'affichent dans les notifications,
   plus de fausses notifications, une pastille Nouveau à l'Accueil là où se trouve le pré-devis ».
   - Un pré-devis est NOUVEAU tant que l'artisan n'a pas ouvert sa demande (sur cet appareil ou un autre :
     tiroir pc-pd-vus, gardé dans le service par sync.js). Un pré-devis refait plus tard redevient nouveau.
   - Seulement avec un vrai compte connecté (html.pcvrai) : en démo, rien n'est inventé ici.
   - Un bandeau en haut, cliquable, qui part seul après 7 s : à chaque ouverture tant qu'un pré-devis n'est pas
     ouvert, et dès qu'un nouveau arrive pendant que l'Espace est ouvert (Cyril : pas dans le menu).
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

/* ---------- le bandeau en haut (Cyril 25/11 : « à l'ouverture, en haut de l'Espace, qui disparaît après
   quelques secondes et qui est cliquable ») : à chaque ouverture tant qu'un pré-devis n'est pas ouvert,
   et dès qu'un nouveau arrive pendant que l'Espace est ouvert ---------- */
var montres={},ban=null,tmB=null;
function occupe(){var w=d.getElementById('welcome');return !!(d.getElementById('pc-ouv')||d.getElementById('pc-ouk')||(w&&!w.hidden)||d.getElementById('pc-ini'))}
function bandeau(L){if(!L.length)return;
  if(occupe()||d.hidden){setTimeout(function(){bandeau(L.filter(function(x){return estNouveau(x.contact)}))},500);return}
  var x=L[0],plus=L.length>1;
  if(!ban){ban=d.createElement('div');ban.className='pc-ban';ban.setAttribute('role','status');ban.setAttribute('aria-live','polite');d.body.appendChild(ban);
    ban.addEventListener('click',function(e){if(e.target.closest('.pc-ban-x')){cache();return}
      var c=ban.dataset.c;cache();
      if(!c){var t=d.getElementById('nb-devis');if(t)t.click();return}
      marquerVu(c);if(window.PCV&&PCV.ouvrirDemande)PCV.ouvrirDemande(c)});
    /* glisser vers le haut = fermer */
    var y0=null;ban.addEventListener('touchstart',function(e){y0=e.touches[0].clientY},{passive:true});
    ban.addEventListener('touchmove',function(e){if(y0!=null&&e.touches[0].clientY-y0<-25){y0=null;cache()}},{passive:true})}
  ban.dataset.c=plus?'':x.contact;
  ban.innerHTML='<button type="button" class="pc-ban-b"><span class="rond">'+IC+'</span><span class="x"><small>'+(plus?L.length+' nouveaux pré-devis':'Nouveau pré-devis')+'</small>'+
    '<b>'+esc(plus?L.map(function(y){return y.client||'Client'}).slice(0,3).join(', ')+(L.length>3?'…':''):(x.client||'Client'))+'</b>'+
    '<span>'+esc(plus?'Touchez pour les voir':[x.total_ht!=null?eur(x.total_ht):'',quand(x.pre_devis_le||x.cree_le)].filter(Boolean).join(' · '))+'</span></span>'+
    '<span class="go">'+(plus?'Voir':'Vérifier')+'</span></button><button type="button" class="pc-ban-x" aria-label="Fermer">'+ICX+'</button>';
  ban.hidden=false;requestAnimationFrame(function(){requestAnimationFrame(function(){ban.classList.add('on')})});
  try{if(navigator.vibrate)navigator.vibrate(12)}catch(e){}
  clearTimeout(tmB);tmB=setTimeout(cache,7000)}
function cache(){clearTimeout(tmB);if(!ban)return;ban.classList.remove('on');setTimeout(function(){if(ban&&!ban.classList.contains('on'))ban.hidden=true},400)}
function annonce(){if(!vrai())return;var L=nouveaux().filter(function(x){return !montres[cle(x)]});if(!L.length)return;
  L.forEach(function(x){montres[cle(x)]=1});bandeau(L)}
function suit(){var s=signature();if(s!==sig){sig=s;annonce();try{d.dispatchEvent(new CustomEvent('pc-notifs'))}catch(e){}}}

/* ouvrir une demande (Accueil, Devis, panneau, message) = elle n'est plus nouvelle */
d.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-vc]');if(b)marquerVu(b.getAttribute('data-vc'))},true);
/* la liste change (vrai.js la recharge, un autre appareil a marqué « vu ») */
setInterval(suit,2000);addEventListener('storage',suit);
d.addEventListener('visibilitychange',function(){if(!d.hidden)suit()});

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
 '.pc-ban .x b{font-size:16px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
 '.pc-ban .x span{font-size:13px;opacity:.7}'+
 '.pc-ban .go{flex:none;font-size:13.5px;font-weight:700;padding:8px 14px;border-radius:20px;background:var(--pcn-a);color:var(--pcn-s)}'+
 '.pc-ban .pc-ban-x{flex:none;width:40px;display:grid;place-items:center;opacity:.55}'+
 '.pc-ban .pc-ban-x svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round}'+
 '@media (prefers-reduced-motion:reduce){.pc-ban{transition:opacity .2s}}'+
 '.vcard .pc-nv{margin-left:8px;vertical-align:1px}';
d.head.appendChild(st);

window.PCNotif={nouveaux:nouveaux,estNouveau:estNouveau,vu:marquerVu,nb:function(){return nouveaux().length},
  pastille:function(){return '<span class="pc-nv">Nouveau</span>'}};
sig=signature();setTimeout(function(){annonce();sig=signature()},1200);
})();
