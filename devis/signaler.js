/* ================================================================================================
   « Signaler » dans le FORMULAIRE CLIENT d'essai (Cyril 27/11 : « tu peux faire la même chose avec le formulaire ? »).
   Même petit onglet drapeau que dans l'Espace d'essai, collé au bord gauche de l'écran :
   capture de l'écran (le plan et « Vos murs » compris), une phrase (micro), et l'envoi part avec l'écran,
   les derniers gestes, les erreurs techniques et l'appareil. Les erreurs qui cassent un écran partent aussi toutes seules.
   SEULEMENT pour les formulaires d'essai (ESSAI) : un vrai client ne voit rien et rien ne part.
   Service : POST /formulaire/signalement (proclik-cliky, calcul/signalements.js) → dépôt privé, lu par Claude dans le projet.
   ================================================================================================ */
(function(){'use strict';
var ESSAI=['test'],C=window.E2CFG||{};
if(ESSAI.indexOf(String(C.code||'').toLowerCase())<0||!/^https:\/\/[a-z0-9.-]+$/i.test(C.service||''))return;
var d=document,root=d.documentElement;
function lsG(k,v){try{var x=JSON.parse(localStorage.getItem(k)||'null');return x==null?v:x}catch(e){return v}}
function lsS(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}

/* ---------- les fenêtres du formulaire : la page, le plan, « Vos murs » ---------- */
function cadre(){var L=[['planfull','pframe','Plan'],['mursfull','mframe','Vos murs']];
 for(var i=0;i<L.length;i++){var o=d.getElementById(L[i][0]),f=d.getElementById(L[i][1]);if(o&&!o.hidden&&f&&f.contentDocument&&f.contentDocument.body)return {f:f,n:L[i][2]}}return null}

/* ---------- ce qui part avec ---------- */
var GESTES=[],ERREURS=[];
function geste(t,ou){t=String(t||'').replace(/\s+/g,' ').trim().slice(0,80);if(!t)return;GESTES.push(new Date().toTimeString().slice(0,8)+' · '+(ou?ou+' › ':'')+t);if(GESTES.length>15)GESTES.shift()}
function surClic(ou){return function(e){var b=e.target.closest&&e.target.closest('button,a,[role=tab],[role=button],.chip,input[type=checkbox],input[type=radio],label');if(!b||b.closest('#sg'))return;
 geste((b.getAttribute('aria-label')||b.textContent||b.value||b.tagName).trim(),ou)}}
d.addEventListener('click',surClic(''),true);
function titre(doc){var h=[].slice.call(doc.querySelectorAll('#app h1,#app h2,#app .lab,h1,h2')).filter(function(x){return x.offsetParent&&x.textContent.trim()})[0];return h?h.textContent.replace(/\s+/g,' ').trim().slice(0,50):''}
function etape(){return d.body&&d.body.dataset.cur||""}
var NOMS={intro:'Accueil',travaux:'Travaux',simple:'Décrire mes travaux',logement:'Logement',plan:'Plan',contact:'Coordonnées',recap:'Récapitulatif',done:'Envoyé'};
function ecran(){var k=cadre();if(k){var t=titre(k.f.contentDocument);return k.n+(t?' › '+t:'')}
 var e=etape(),n=NOMS[e]||e||'Formulaire',t=titre(d);return n+(t&&t!==n?' › '+t:'')}
function appareil(){var U=navigator.userAgent,ip=/iPad/.test(U)||(/Macintosh/.test(U)&&navigator.maxTouchPoints>1),dans=window.top!==window;
 return (ip?'iPad':/iPhone/.test(U)?'iPhone':/Android/i.test(U)?'Android':'Ordinateur')+' · '+innerWidth+' × '+innerHeight+(dans?' · dans la page GHL':' · page seule')+' · '+(root.getAttribute('data-theme')==='dark'?'nuit':'jour')+' · '+U.replace(/^Mozilla\/5\.0 /,'').slice(0,120)}
function version(){var p=d.getElementById('pframe'),s=p&&p.getAttribute('src')||'',m=/[?&]v=(\d+)/.exec(s);return 'formulaire'+(m?' · plan v'+m[1]:'')}
function infos(){return {appareil:appareil(),version:version(),adresse:location.origin+location.pathname+location.search,gestes:GESTES.slice(),erreurs:ERREURS.slice()}}

/* ---------- envoi ---------- */
function poste(c){c.code=C.code;return fetch(C.service+'/formulaire/signalement',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(c)})
 .then(function(r){return r.json().catch(function(){return {}}).then(function(j){if(r.ok&&j.ok)return j;var e=new Error(j.erreur||('Erreur '+r.status));e.st=r.status;e.branche=j.branche;throw e})})}

/* ---------- erreurs techniques : gardées, envoyées toutes seules une fois par jour et par erreur ---------- */
function erreur(msg,ou){msg=String(msg||'').slice(0,300);if(!msg||/^Script error\.?$/i.test(msg)||/ResizeObserver loop/i.test(msg))return;
 var t=msg+(ou?' ('+ou+')':'');if(ERREURS.indexOf(t)<0){ERREURS.push(t);if(ERREURS.length>8)ERREURS.shift()}
 var k=new Date().toISOString().slice(0,10)+'|'+msg.slice(0,120),vu=lsG('pc-sgf-auto',[]);if(!Array.isArray(vu))vu=[];if(vu.indexOf(k)>=0)return;
 vu=vu.filter(function(x){return x.slice(0,10)===k.slice(0,10)});vu.push(k);lsS('pc-sgf-auto',vu.slice(-30));
 setTimeout(function(){poste({auto:true,ecran:ecran(),infos:infos()}).catch(function(){})},1500)}
function ecoute(w,ou){try{w.addEventListener('error',function(e){erreur(e.message,(ou?ou+' · ':'')+(e.filename||'').split('/').pop()+':'+(e.lineno||'?'))});
 w.addEventListener('unhandledrejection',function(e){var r=e.reason;erreur(r&&(r.message||String(r))||'Promesse refusée',ou)})}catch(e){}}
ecoute(window,'');
/* le plan et « Vos murs » sont dans leur propre fenêtre : on y écoute aussi les gestes et les erreurs */
function brancher(id,ou){var f=d.getElementById(id);if(!f)return;function go(){try{var w=f.contentWindow;if(!w||w.__sg)return;w.__sg=1;ecoute(w,ou);w.document.addEventListener('click',surClic(ou),true)}catch(e){}}
 f.addEventListener('load',go);go()}
function cadres(){brancher('pframe','Plan');brancher('mframe','Vos murs')}
if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',cadres);else cadres();

/* ---------- la capture (html2canvas-pro, chargé au premier « Signaler ») ---------- */
var H2C='https://cdn.jsdelivr.net/npm/html2canvas-pro@1.6.4/dist/html2canvas-pro.min.js',charge=null;
function h2c(){var f=window.html2canvas;return typeof f==='function'?f:f&&(f.default||f.html2canvas)}
function lib(){if(h2c())return Promise.resolve();if(charge)return charge;
 charge=new Promise(function(ok,ko){var s=d.createElement('script');s.src=H2C;s.onload=ok;s.onerror=function(){charge=null;ko(new Error('capture indisponible'))};d.head.appendChild(s)});return charge}
function photo(doc,w,h,ech){var win=doc.defaultView;return h2c()(doc.body,{x:win.scrollX,y:win.scrollY,width:w,height:h,windowWidth:w,windowHeight:h,scale:ech,logging:false,useCORS:false,
 backgroundColor:win.getComputedStyle(doc.body).backgroundColor||'#fff',ignoreElements:function(el){return el.id==='sg-b'||el.id==='sg'||el.tagName==='IFRAME'}})}
/* la page, puis le plan (ou « Vos murs ») posé par-dessus à sa place */
function capture(){return lib().then(function(){var w=innerWidth,h=innerHeight,ech=Math.min(1,1000/Math.max(w,1)),k=cadre();
 return photo(d,w,h,ech).then(function(c){if(!k)return c;var r=k.f.getBoundingClientRect(),fw=Math.round(r.width),fh=Math.round(r.height);if(fw<10||fh<10)return c;
  return photo(k.f.contentDocument,fw,fh,ech).then(function(c2){try{c.getContext('2d').drawImage(c2,r.left*ech,r.top*ech,fw*ech,fh*ech)}catch(e){}return c},function(){return c})})})
 .then(function(c){return c.toDataURL('image/jpeg',.72)})}

/* ---------- l'onglet et la fenêtre (mêmes que dans l'Espace) ---------- */
var st=d.createElement('style');st.textContent=
 '#sg-b{position:fixed;left:0;top:62%;z-index:2147482000;display:grid;place-items:center;width:30px;height:46px;padding:0 0 0 2px;border-radius:0 14px 14px 0;border:1px solid var(--line,#d8dce4);border-left:0;background:var(--card,#fff);color:var(--fg,#1B2440);box-shadow:0 6px 18px -8px rgba(11,18,38,.35);cursor:pointer;opacity:.85;-webkit-tap-highlight-color:transparent}'+
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
 '#sg .sg-err{color:#b3261e;font:700 13px var(--f,system-ui);margin:0}#sg .sg-ok{font:700 14px var(--f,system-ui);margin:0}';
d.head.appendChild(st);
var IC='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 21V4M5 4h11l-2 4 2 4H5"/></svg>',MIC='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';
var b=d.createElement('button');b.type='button';b.id='sg-b';b.setAttribute('aria-label','Signaler un problème');b.innerHTML=IC+'<span>Signaler</span>';
/* en plein écran (le plan), seul l'élément en plein écran se voit : l'onglet et la fenêtre y vont aussi */
function hote(){var f=d.fullscreenElement||d.webkitFullscreenElement;return f&&f.tagName!=='IFRAME'?f:d.body}
function poser(){var h=hote();if(b.parentNode!==h)h.appendChild(b);var o=d.getElementById('sg');if(o&&o.parentNode!==h)h.appendChild(o)}
if(d.body)poser();else d.addEventListener('DOMContentLoaded',poser);
d.addEventListener('fullscreenchange',poser);d.addEventListener('webkitfullscreenchange',poser);
var S=null;
b.addEventListener('click',function(){b.classList.add('on');var ec=ecran(),inf=infos();
 capture().then(function(img){ouvrir(ec,inf,img)},function(){ouvrir(ec,inf,null)}).then(function(){b.classList.remove('on')})});
function ouvrir(ec,inf,img){S={ecran:ec,infos:inf,img:img};var o=d.getElementById('sg');if(!o){o=d.createElement('div');o.id='sg';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true')}
 hote().appendChild(o);o.hidden=false;o.innerHTML='<div class="sg-c"><div><h3>Signaler un problème</h3><small>Formulaire d\'essai · '+esc(ec)+'</small></div>'+
  (img?'<div class="sg-i"><img alt="Capture de l\'écran" src="'+img+'"><button type="button" class="sg-x" data-sg="sans">Retirer la capture</button></div>':'<small>Pas de capture pour cet écran : décrivez simplement ce que vous voyez.</small>')+
  '<textarea id="sg-t" placeholder="Qu\'est-ce qui ne va pas ? Une phrase suffit. Touchez le micro pour parler." aria-label="Le problème"></textarea>'+
  '<p class="sg-err" id="sg-e" hidden></p>'+
  '<div class="sg-r">'+(reco()?'<button type="button" class="sg-mic" data-sg="mic" aria-label="Dicter">'+MIC+'</button>':'')+'<button type="button" class="sg-no" data-sg="x">Annuler</button><button type="button" class="sg-go" data-sg="go">Envoyer</button></div>'+
  '<small>Partent aussi : l\'écran, vos derniers gestes, les erreurs techniques et l\'appareil. Rien d\'autre.</small></div>';
 setTimeout(function(){try{d.getElementById('sg-t').focus()}catch(e){}},250)}
function fermer(){var o=d.getElementById('sg');if(o){o.hidden=true;o.innerHTML=''}stopMic();S=null}
function merci(t){var o=d.getElementById('sg');if(!o)return;o.querySelector('.sg-c').innerHTML='<h3>'+esc(t)+'</h3><p class="sg-ok">Merci ! On le regarde ensemble dans le projet.</p><div class="sg-r"><button type="button" class="sg-go" data-sg="x">Fermer</button></div>';setTimeout(function(){if(o.querySelector('.sg-ok'))fermer()},2600)}
/* dictée (si le navigateur la propose ; sinon le micro du clavier fait pareil) */
var R=null;function reco(){return window.SpeechRecognition||window.webkitSpeechRecognition}
function stopMic(){if(R){try{R.stop()}catch(e){}R=null}var m=d.querySelector('#sg .sg-mic');if(m)m.classList.remove('on')}
function mic(){if(R)return stopMic();var K=reco();if(!K)return;var t=d.getElementById('sg-t'),avant=t.value?t.value.replace(/\s*$/,' '):'';R=new K();R.lang='fr-FR';R.interimResults=true;R.continuous=false;
 R.onresult=function(e){var s='';for(var i=0;i<e.results.length;i++)s+=e.results[i][0].transcript;t.value=avant+s};R.onend=stopMic;R.onerror=stopMic;
 try{R.start();d.querySelector('#sg .sg-mic').classList.add('on')}catch(e){stopMic()}}
/* pas de réseau, ou pas encore branché : gardé sur l'appareil (sans la capture), renvoyé plus tard */
function attente(c){var L=lsG('pc-sgf-attente',[]);if(!Array.isArray(L))L=[];c.capture='';L.push(c);lsS('pc-sgf-attente',L.slice(-10))}
function rattraper(){var L=lsG('pc-sgf-attente',[]);if(!Array.isArray(L)||!L.length)return;lsS('pc-sgf-attente',[]);
 L.reduce(function(p,c){return p.then(function(){return poste(c).catch(function(e){if(e.st!==400&&e.st!==403)attente(c)})})},Promise.resolve())}
setTimeout(rattraper,6000);addEventListener('online',rattraper);
d.addEventListener('click',function(e){var t=e.target.closest&&e.target.closest('[data-sg]');if(!t)return;var a=t.getAttribute('data-sg');
 if(a==='x')return fermer();
 if(a==='mic')return mic();
 if(a==='sans'){S.img=null;var i=t.closest('.sg-i');if(i)i.outerHTML='<small>Capture retirée.</small>';return}
 if(a==='go'){var c={texte:(d.getElementById('sg-t')||{}).value||'',ecran:S.ecran,capture:S.img||'',infos:S.infos},er=d.getElementById('sg-e');
  if(!c.texte.trim()&&!c.capture){er.hidden=false;er.textContent='Dites en une phrase ce qui ne va pas.';return}
  stopMic();t.disabled=true;t.textContent='Envoi…';
  poste(c).then(function(){merci('Signalement envoyé')},function(e){
   if(e.branche===false||navigator.onLine===false||!e.st){attente(c);merci('Gardé sur l\'appareil');var p=d.querySelector('#sg .sg-ok');if(p)p.textContent=e.branche===false?'Il partira tout seul dès que les signalements seront branchés.':'Il partira tout seul au retour du réseau.';return}
   t.disabled=false;t.textContent='Envoyer';er.hidden=false;er.textContent=String(e.message||e)})}});
d.addEventListener('keydown',function(e){if(e.key==='Escape'&&S)fermer()});
})();
