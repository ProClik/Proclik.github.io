/* ================================================================================================
   « Signaler » (Cyril 27/11 : « pour les tests… plus simple que je te fasse des captures à chaque fois et que je doive
   te détailler les problèmes » ; « je veux les voir ici et qu'on puisse les régler ensemble »).
   Un petit onglet « Signaler » (drapeau) collé au bord gauche de l'écran, pour le compte d'essai (ProClik Test, window.PCSANSDEMO) :
   1) la capture de l'écran se prend toute seule (avant que la fenêtre s'ouvre) ;
   2) on dit le problème en une phrase (micro du clavier) ;
   3) on envoie : l'écran, les derniers gestes, les erreurs techniques, l'appareil et la version partent avec.
   Service : POST /espace/signalement (proclik-cliky, calcul/signalements.js) → dépôt privé, lu par Claude dans le projet.
   Clé GitHub pas encore posée : envoi par l'ancien chemin (Réglages → « Un problème ? », POST /espace/retour).
   Les erreurs techniques qui cassent un écran partent aussi toutes seules (une fois par jour et par erreur).
   Rien ne part en démo, dans l'aperçu de Cyril ni pour un salarié.
   ================================================================================================ */
(function(){'use strict';
if(!window.PCSANSDEMO)return;
var d=document,root=d.documentElement,X=window.PCX||{};
function lsG(k,v){try{var x=JSON.parse(localStorage.getItem(k)||'null');return x==null?v:x}catch(e){return v}}
function lsS(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function apercu(){try{return sessionStorage.getItem('pc-apercu')==='1'}catch(e){return false}}
function actif(){return !!lsG('pc-vrai-jeton',null)&&!apercu()&&!lsG('pc-membre',null)&&window.PCV&&PCV.api}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function toast(a,b){try{(X.toast||window.PCX.toast)(a,b)}catch(e){}}

/* ---------- ce qui part avec : derniers gestes, erreurs, écran, appareil, version ---------- */
var GESTES=[],ERREURS=[];
function geste(t){t=String(t||'').replace(/\s+/g,' ').trim().slice(0,80);if(!t)return;GESTES.push(new Date().toTimeString().slice(0,8)+' · '+t);if(GESTES.length>15)GESTES.shift()}
d.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('button,a,[role=tab],[data-v],input[type=checkbox],label');if(!b||b.closest('#sg'))return;
 geste((b.getAttribute('aria-label')||b.textContent||b.value||b.tagName).trim())},true);
var VUE={accueil:'Accueil',clients:'Clients',devis:'Devis',factures:'Factures',planning:'Planning',chantiers:'Chantiers',depenses:'Dépenses',prix:'Achats',produits:'Produits',cotes:'Prise de cotes',reseaux:'Réseaux sociaux'};
function ecran(){var v=[].slice.call(d.querySelectorAll('.view')).filter(function(s){return !s.hidden})[0],n=v?(VUE[v.id.replace('v-','')]||v.id):'';
 var sh=d.getElementById('xsheet'),t=d.getElementById('x-t');if(sh&&sh.classList.contains('on')&&t&&t.textContent.trim())n+=' › '+t.textContent.trim();
 var pl=d.querySelector('#v-planning .seg [aria-selected=true]');if(v&&v.id==='v-planning'&&pl)n+=' › '+pl.textContent.trim();
 var o=[].slice.call(d.querySelectorAll('[role=dialog][aria-modal=true],.vov.on')).filter(function(x){return x.offsetParent&&x.id!=='sg'})[0];
 if(o){var h=o.querySelector('h1,h2,h3,b');if(h&&h.textContent.trim())n+=' › '+h.textContent.trim().slice(0,40)}
 return n||'Accueil'}
function appareil(){var U=navigator.userAgent,ip=/iPad/.test(U)||(/Macintosh/.test(U)&&navigator.maxTouchPoints>1),ap=(window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone;
 return (ip?'iPad':/iPhone/.test(U)?'iPhone':/Android/i.test(U)?'Android':'Ordinateur')+' · '+innerWidth+' × '+innerHeight+(ap?' · appli':' · navigateur')+' · '+(root.getAttribute('data-theme')==='dark'?'nuit':'jour')+' · '+U.replace(/^Mozilla\/5\.0 /,'').slice(0,120)}
function version(){var s=d.querySelector('script[src*="vrai.js"]');var m=s&&/v=(\d+)/.exec(s.getAttribute('src'));return 'vrai.js v'+(m?m[1]:'?')}
function infos(){return {appareil:appareil(),version:version(),adresse:location.origin+location.pathname+location.search,gestes:GESTES.slice(),erreurs:ERREURS.slice()}}

/* ---------- erreurs techniques : gardées, et envoyées toutes seules une fois par jour ---------- */
function erreur(msg,ou){msg=String(msg||'').slice(0,300);if(!msg||/^Script error\.?$/i.test(msg)||/ResizeObserver loop/i.test(msg))return;
 var t=msg+(ou?' ('+ou+')':'');if(ERREURS.indexOf(t)<0){ERREURS.push(t);if(ERREURS.length>8)ERREURS.shift()}
 var k=new Date().toISOString().slice(0,10)+'|'+msg.slice(0,120),vu=lsG('pc-sg-auto',[]);if(!Array.isArray(vu))vu=[];if(vu.indexOf(k)>=0)return;
 vu=vu.filter(function(x){return x.slice(0,10)===k.slice(0,10)});vu.push(k);lsS('pc-sg-auto',vu.slice(-30));
 setTimeout(function(){if(actif())PCV.api('/espace/signalement',{method:'POST',body:{auto:true,ecran:ecran(),infos:infos()}}).catch(function(){})},1500)}
window.addEventListener('error',function(e){erreur(e.message,(e.filename||'').split('/').pop()+':'+(e.lineno||'?'))});
window.addEventListener('unhandledrejection',function(e){var r=e.reason;erreur(r&&(r.message||String(r))||'Promesse refusée','')});

/* la copie que photographie html2canvas rejoue les animations d'apparition depuis le début (tout pâle, icônes absentes,
   signalement n°82 du 27/11) : chaque élément animé de la copie reçoit l'état exact affiché à l'écran, animation arrêtée */
var PROPS=['opacity','transform','visibility','filter','clip-path','translate','scale','rotate'];
function note(src){var win=src.defaultView,M=[];[].slice.call(src.querySelectorAll('body *')).forEach(function(e){var cs=win.getComputedStyle(e);
 if(cs.animationName==='none'&&!(e.getAnimations&&e.getAnimations().length))return;e.setAttribute('data-sgf',M.length);M.push(PROPS.map(function(k){return cs.getPropertyValue(k)}))});return M}
function fige(M){return function(doc){try{[].slice.call(doc.querySelectorAll('[data-sgf]')).forEach(function(e){var v=M[+e.getAttribute('data-sgf')];if(!v)return;var st=e.style;
 st.setProperty('animation','none','important');st.setProperty('transition','none','important');PROPS.forEach(function(k,i){if(v[i])st.setProperty(k,v[i],'important')})})}catch(e){}}}
function defige(src){[].slice.call(src.querySelectorAll('[data-sgf]')).forEach(function(e){e.removeAttribute('data-sgf')})}
/* ---------- la capture (html2canvas-pro, chargé seulement au premier « Signaler ») ----------
   html2canvas « pro » : comme html2canvas, mais il lit aussi les couleurs modernes de l'Espace (color-mix), que l'original refuse. */
var H2C='https://cdn.jsdelivr.net/npm/html2canvas-pro@1.6.4/dist/html2canvas-pro.min.js',charge=null;
function h2c(){var f=window.html2canvas;return typeof f==='function'?f:f&&(f.default||f.html2canvas)}
function lib(){if(h2c())return Promise.resolve();if(charge)return charge;
 charge=new Promise(function(ok,ko){var s=d.createElement('script');s.src=H2C;s.onload=ok;s.onerror=function(){charge=null;ko(new Error('capture indisponible'))};d.head.appendChild(s)});return charge}
function capture(){var M;return lib().then(function(){var w=innerWidth,h=innerHeight,ech=Math.min(1,1000/Math.max(w,1));M=note(d);
 return h2c()(d.body,{x:scrollX,y:scrollY,width:w,height:h,windowWidth:w,windowHeight:h,scale:ech,logging:false,useCORS:false,backgroundColor:getComputedStyle(d.body).backgroundColor||'#fff',
  ignoreElements:function(el){return el.id==='sg-b'||el.id==='sg'},onclone:fige(M)})}).then(function(c){defige(d);return c.toDataURL('image/jpeg',.72)},function(e){defige(d);throw e})}

/* ---------- l'écran « Signaler » ---------- */
var st=d.createElement('style');st.textContent=
 '#sg-b{position:fixed;left:0;top:62%;z-index:2147482000;display:grid;place-items:center;width:30px;height:46px;padding:0 0 0 2px;border-radius:0 14px 14px 0;border:1px solid var(--line,#d8dce4);border-left:0;background:var(--card,#fff);color:var(--fg,#1B2440);box-shadow:0 6px 18px -8px rgba(11,18,38,.35);cursor:pointer;opacity:.85}'+
 '#sg-b svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}#sg-b span{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}#sg-b.on{opacity:.35;pointer-events:none}'+
 '#sg{position:fixed;inset:0;z-index:2147483100;display:flex;align-items:flex-end;justify-content:center;background:rgba(11,18,38,.45)}#sg[hidden]{display:none}'+
 '#sg .sg-c{width:min(460px,100%);max-height:92vh;overflow:auto;background:var(--bg,#ECEEF2);color:var(--fg,#1B2440);border-radius:22px 22px 0 0;padding:16px 16px calc(16px + env(safe-area-inset-bottom,0px));display:grid;gap:12px;font-family:var(--f,system-ui)}'+
 '@media (min-width:700px){#sg{align-items:center}#sg .sg-c{border-radius:22px}}'+
 '#sg h3{margin:0;font:800 18px var(--f,system-ui)}#sg small{color:var(--muted,#667);font-size:13px;font-weight:600}'+
 '#sg .sg-i{position:relative;border-radius:14px;overflow:hidden;border:1px solid var(--line,#d8dce4);background:var(--card,#fff);max-height:34vh;display:flex;justify-content:center}#sg .sg-i img{max-width:100%;max-height:34vh;display:block}'+
 '#sg .sg-i .sg-x{position:absolute;right:8px;top:8px;border:0;border-radius:999px;padding:6px 10px;font:700 12.5px var(--f,system-ui);background:rgba(11,18,38,.7);color:#fff;cursor:pointer}'+
 '#sg textarea{width:100%;min-height:86px;box-sizing:border-box;border-radius:14px;border:1px solid var(--line,#d8dce4);background:var(--card,#fff);color:inherit;padding:12px;font:600 16px/1.35 var(--f,system-ui);resize:vertical}'+
 '#sg .sg-r{display:flex;gap:8px;align-items:center}#sg .sg-r button{appearance:none;cursor:pointer;min-height:48px;border-radius:14px;font:800 15px var(--f,system-ui);padding:0 16px}'+
 '#sg .sg-go{flex:1;border:0;background:var(--n1-nuit,#1B2440);color:#fff}#sg .sg-no{border:1px solid var(--line,#d8dce4);background:var(--card,#fff);color:inherit}#sg .sg-go[disabled]{opacity:.6}'+
 '#sg .sg-mic{width:48px;padding:0!important;border:1px solid var(--line,#d8dce4);background:var(--card,#fff);color:inherit;display:grid;place-items:center}#sg .sg-mic svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2}#sg .sg-mic.on{background:var(--n1-laiton,#A8823F);color:#fff;border-color:transparent}'+
 '#sg .sg-err{color:#b3261e;font:700 13px var(--f,system-ui);margin:0}';
d.head.appendChild(st);
var IC='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 21V4M5 4h11l-2 4 2 4H5"/></svg>',MIC='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';
var b=d.createElement('button');b.type='button';b.id='sg-b';b.setAttribute('aria-label','Signaler un problème');b.innerHTML=IC+'<span>Signaler</span>';
function poser(){if(!d.body.contains(b))d.body.appendChild(b)}
if(d.body)poser();else d.addEventListener('DOMContentLoaded',poser);
var S=null;
b.addEventListener('click',function(){if(!actif()){toast('Connectez-vous d\'abord','Le signalement part avec votre compte.');return}
 b.classList.add('on');var ec=ecran(),inf=infos();
 capture().then(function(img){ouvrir(ec,inf,img)},function(){ouvrir(ec,inf,null)}).then(function(){b.classList.remove('on')})});
function ouvrir(ec,inf,img){S={ecran:ec,infos:inf,img:img};var o=d.getElementById('sg');if(!o){o=d.createElement('div');o.id='sg';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');d.body.appendChild(o)}
 o.hidden=false;o.innerHTML='<div class="sg-c"><div><h3>Signaler un problème</h3><small>'+esc(ec)+'</small></div>'+
  (img?'<div class="sg-i"><img alt="Capture de l\'écran" src="'+img+'"><button type="button" class="sg-x" data-sg="sans">Retirer la capture</button></div>':'<small>Pas de capture pour cet écran : décrivez simplement ce que vous voyez.</small>')+
  '<textarea id="sg-t" placeholder="Qu\'est-ce qui ne va pas ? Une phrase suffit. Touchez le micro pour parler." aria-label="Le problème"></textarea>'+
  '<p class="sg-err" id="sg-e" hidden></p>'+
  '<div class="sg-r">'+(reco()?'<button type="button" class="sg-mic" data-sg="mic" aria-label="Dicter">'+MIC+'</button>':'')+'<button type="button" class="sg-no" data-sg="x">Annuler</button><button type="button" class="sg-go" data-sg="go">Envoyer</button></div>'+
  '<small>Partent aussi : l\'écran, vos derniers gestes, les erreurs techniques et l\'appareil. Rien d\'autre.</small></div>';
 setTimeout(function(){try{d.getElementById('sg-t').focus()}catch(e){}},250)}
function fermer(){var o=d.getElementById('sg');if(o){o.hidden=true;o.innerHTML=''}stopMic();S=null}
/* dictée (si le navigateur la propose ; sinon, le micro du clavier fait pareil) */
var R=null;function reco(){return window.SpeechRecognition||window.webkitSpeechRecognition}
function stopMic(){if(R){try{R.stop()}catch(e){}R=null}var m=d.querySelector('#sg .sg-mic');if(m)m.classList.remove('on')}
function mic(){if(R)return stopMic();var C=reco();if(!C)return;var t=d.getElementById('sg-t'),avant=t.value?t.value.replace(/\s*$/,' '):'';R=new C();R.lang='fr-FR';R.interimResults=true;R.continuous=false;
 R.onresult=function(e){var s='';for(var i=0;i<e.results.length;i++)s+=e.results[i][0].transcript;t.value=avant+s};R.onend=stopMic;R.onerror=stopMic;
 try{R.start();d.querySelector('#sg .sg-mic').classList.add('on')}catch(e){stopMic()}}
/* envoi, avec secours et file d'attente sans réseau */
function corps(){return {texte:(d.getElementById('sg-t')||{}).value||'',ecran:S.ecran,capture:S.img||'',infos:S.infos}}
function viaRetour(c){return PCV.api('/espace/retour',{method:'POST',body:{type:'probleme',ecran:c.ecran,texte:(c.texte||'(capture seulement)')+'\n\nDerniers gestes :\n'+c.infos.gestes.join('\n')+(c.infos.erreurs.length?'\n\nErreurs :\n'+c.infos.erreurs.join('\n'):''),rappel:'appli',appareil:c.infos.appareil+' · '+c.infos.version,photo:c.capture||undefined}})}
function envoyer(c){return PCV.api('/espace/signalement',{method:'POST',body:c}).catch(function(e){if(/pas encore branch/i.test(String(e&&e.message)))return viaRetour(c);throw e})}
function attente(c){var L=lsG('pc-sg-attente',[]);if(!Array.isArray(L))L=[];c.capture='';L.push(c);lsS('pc-sg-attente',L.slice(-10))}
function rattraper(){if(!actif())return;var L=lsG('pc-sg-attente',[]);if(!Array.isArray(L)||!L.length)return;lsS('pc-sg-attente',[]);
 L.reduce(function(p,c){return p.then(function(){return envoyer(c).catch(function(){attente(c)})})},Promise.resolve())}
setTimeout(rattraper,6000);addEventListener('online',rattraper);
d.addEventListener('click',function(e){var t=e.target.closest&&e.target.closest('[data-sg]');if(!t)return;var a=t.getAttribute('data-sg');
 if(a==='x')return fermer();
 if(a==='mic')return mic();
 if(a==='sans'){S.img=null;var i=t.closest('.sg-i');if(i)i.outerHTML='<small>Capture retirée.</small>';return}
 if(a==='go'){var c=corps(),er=d.getElementById('sg-e');if(!c.texte.trim()&&!c.capture){er.hidden=false;er.textContent='Dites en une phrase ce qui ne va pas.';return}
  stopMic();t.disabled=true;t.textContent='Envoi…';
  envoyer(c).then(function(){fermer();toast('Signalement envoyé','Merci ! On le regarde ensemble dans le projet.')},
   function(e){if(navigator.onLine===false||/fetch|network|réseau|load failed/i.test(String(e&&e.message))){attente(c);fermer();toast('Gardé sur l\'appareil','Il part tout seul au retour du réseau.');return}
    t.disabled=false;t.textContent='Envoyer';er.hidden=false;er.textContent=String(e&&e.message||e)})}});
d.addEventListener('keydown',function(e){if(e.key==='Escape'&&S)fermer()});
})();
