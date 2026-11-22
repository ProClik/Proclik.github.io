/* ProClik · Espace branché sur les vraies demandes (GHL), à travers le service sécurisé ProClik (Cloudflare).
   Aucune clé ici : l'artisan tape son code d'accès une fois, le service renvoie un jeton gardé sur l'appareil.
   Lien direct d'une demande (e-mail d'alerte) : espace/#c=<identifiant du contact GHL>.
   Sans adresse de service (config.js) ou sans connexion, l'Espace reste en mode démo. */
(function(){
'use strict';
var SERVICE=String(window.PC_SERVICE||'').replace(/\/+$/,'');
if(!/^https:\/\/[a-z0-9.-]+$/i.test(SERVICE))SERVICE='';
var KJ='pc-vrai-jeton',KA='pc-vrai-artisan',KL='pc-vrai-liste';
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var lsG=function(k){try{return JSON.parse(localStorage.getItem(k)||'null')}catch(e){return null}};
var lsS=function(k,v){try{if(v==null)localStorage.removeItem(k);else localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
/* Aperçu par l'Admin (#apercu=…) : lecture seule, 1 heure, gardé dans cet onglet seulement (ne touche pas à la connexion de l'appareil). */
var AP=(function(){var m=/[#&]apercu=([A-Za-z0-9_.-]{20,})/.exec(location.hash);if(m){try{sessionStorage.setItem('pc-apercu','1');sessionStorage.setItem('ap:pc-vrai-jeton',JSON.stringify(m[1]));sessionStorage.removeItem('ap:pc-vrai-artisan');sessionStorage.removeItem('ap:pc-vrai-liste');history.replaceState(null,'',location.pathname+location.search)}catch(e){}}
 try{return sessionStorage.getItem('pc-apercu')==='1'}catch(e){return false}})();
if(AP){var AK={'pc-vrai-jeton':1,'pc-vrai-artisan':1,'pc-vrai-liste':1},g0=lsG,s0=lsS;
 lsG=function(k){if(AK[k]){try{return JSON.parse(sessionStorage.getItem('ap:'+k)||'null')}catch(e){return null}}return g0(k)};
 lsS=function(k,v){if(AK[k]){try{v==null?sessionStorage.removeItem('ap:'+k):sessionStorage.setItem('ap:'+k,JSON.stringify(v))}catch(e){}return}s0(k,v)}}
function quitterApercu(){try{['pc-apercu','ap:pc-vrai-jeton','ap:pc-vrai-artisan','ap:pc-vrai-liste'].forEach(function(k){sessionStorage.removeItem(k)})}catch(e){}location.reload()}
var eur=function(n,d){return n==null?'—':Number(n).toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:d||2})+' €'};
var qte=function(n){return n==null?'':String(n).replace('.',',')};
function quand(iso){if(!iso)return '';var d=new Date(iso);if(isNaN(d))return '';var now=new Date(),j=Math.round((new Date(now.toDateString())-new Date(d.toDateString()))/864e5),h=d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}).replace(':',' h ');
 return j===0?'aujourd\'hui, '+h:j===1?'hier, '+h:j<7?d.toLocaleDateString('fr-FR',{weekday:'long'})+', '+h:d.toLocaleDateString('fr-FR',{day:'numeric',month:'short'})}
var valider=function(nom){return /valider/i.test(nom||'')};

/* ---------- styles du mode réel ---------- */
var css=document.createElement('style');
css.textContent=[
'html.pcvrai #v-devis>.grid2{display:block}',
'html.pcvrai #v-devis>.grid2>.col>*:not(#vd),html.pcvrai #dright{display:none!important}',
'html.pcvrai #todo,html.pcvrai .today,html.pcvrai #v-accueil .pcq-h,html.pcvrai #v-accueil .pcq,html.pcvrai #v-accueil .bilan{display:none!important}',
'html.pcvrai .chip-demo{background:var(--turq-bg);color:var(--turq-ink)}',
'.vexemple{margin:0 0 12px;padding:10px 14px;border-radius:14px;background:var(--cor-bg);color:var(--cor-ink);font-size:13.5px}',
'.vco{margin:0 0 14px;padding:12px 14px;border-radius:16px;background:var(--card);box-shadow:var(--shadow);display:flex;gap:12px;align-items:center;flex-wrap:wrap}',
'.vco span{flex:1 1 200px;font-size:13.5px;color:var(--muted)}.vco b{color:var(--fg)}',
'.vl{display:grid;gap:10px}',
'.vcard{appearance:none;text-align:left;width:100%;border:1.5px solid var(--line);background:var(--card);color:var(--fg);border-radius:16px;padding:12px 14px;display:grid;gap:6px;font:inherit;cursor:pointer}',
'.vcard.vav{border-color:var(--turq);box-shadow:0 0 0 3px rgba(46,230,200,.16)}',
'.vcard .r{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}',
'.vcard[disabled]{opacity:.6;cursor:default}.vp[hidden]{display:none}',
'.vcard b{font-size:15.5px}.vcard small{display:block;color:var(--muted);font-size:12.5px}',
'.vamt{font-size:20px;font-weight:800;letter-spacing:-.3px}.vamt small{display:inline;font-size:12px;margin-left:4px}',
'.vp{font-size:11.5px;font-weight:800;padding:4px 9px;border-radius:999px;white-space:nowrap;background:var(--soft);color:var(--muted)}',
'.vp.t{background:var(--turq-bg);color:var(--turq-ink)}.vp.w{background:var(--warn-bg);color:var(--warn)}',
'.vh{display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin:6px 0 8px}.vh h2{margin:0;font-size:18px}.vh span{font-size:12.5px;color:var(--muted)}',
'.vst{font-size:13.5px;color:var(--muted);padding:6px 2px}',
'.vbtn{appearance:none;border:0;border-radius:12px;padding:11px 16px;font:800 14.5px var(--f);cursor:pointer;background:var(--soft);color:var(--fg);min-height:44px}',
'.vbtn.go{background:var(--nuit);color:#fff}html[data-theme="dark"] .vbtn.go{background:var(--turq);color:#0B1226}',
'@media (prefers-color-scheme:dark){html:not([data-theme="light"]) .vbtn.go{background:var(--turq);color:#0B1226}}',
'.vbtn.sm{padding:8px 12px;min-height:36px;font-size:13px}.vbtn[disabled]{opacity:.5}',
'.vov .pcbody{gap:12px}.vov .card{background:var(--card);border-radius:16px;padding:14px;box-shadow:var(--shadow)}',
'.vsec h3{margin:0 0 8px;font-size:15px}.vkv{display:grid;grid-template-columns:auto 1fr;gap:4px 12px;font-size:14px}.vkv span{color:var(--muted)}.vmp{margin:10px 0 4px}.vmp>small{color:var(--muted,#8A93A6)}.vmn{margin:4px 0;font-style:italic;color:var(--muted,#8A93A6)}.vmg{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;margin-top:6px}.vmf{margin:0;padding:8px;border-radius:12px;background:var(--bg,#EEF0F5);color:var(--fg,#1B2440)}.vmf-s{width:100%;height:auto;display:block}.vmf ul{list-style:none;margin:6px 0 0;padding:0;font-size:12.5px;display:grid;gap:2px}.vmf li i{display:inline-block;width:8px;height:8px;border-radius:2px;margin-right:5px}.vmf li small{color:var(--muted,#8A93A6)}.vph{display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:8px}.vph a{display:block;aspect-ratio:1;border-radius:10px;overflow:hidden;background:var(--line,#2a3140)}.vph img{width:100%;height:100%;object-fit:cover;display:block}',
'.vli{display:grid;grid-template-columns:1fr auto;gap:2px 10px;padding:8px 0;border-top:1px solid var(--line);font-size:14px}.vli:first-child{border-top:0}',
'.vli small{grid-column:1/-1;color:var(--muted);font-size:12.5px}.vli .x{font-weight:800;white-space:nowrap}.vli.vv{background:var(--warn-bg);margin:0 -8px;padding:8px;border-radius:10px}',
'.vedit{width:100%;text-align:left;background:none;border:0;border-top:1px solid var(--line);font:inherit;color:inherit;cursor:pointer}.vedit:first-of-type{border-top:0}',
'.vform{display:grid;gap:12px}.vform label{display:grid;gap:6px;font-size:13.5px;font-weight:700}.vform input,.vform select,.vform textarea{width:100%;min-height:46px;padding:10px 12px;border-radius:12px;font-family:inherit;font-size:15px;font-weight:600;color:inherit;border:1px solid var(--line)}.vrow{display:grid;grid-template-columns:1fr 1fr;gap:10px}',
'.vbtn.arme{color:var(--cor-ink)}.vbtn.go.varm{box-shadow:0 0 0 2px var(--acc,#A8823F)}',
'details.vd>summary{cursor:pointer;font-weight:700}details.vd>.card{box-shadow:none;margin:10px 0 0;padding:0;background:none}',
'.vtot{display:grid;grid-template-columns:1fr auto;gap:4px 10px;font-size:14px}.vtot .big{font-size:18px;font-weight:800}',
'.vul{margin:0;padding-left:18px;display:grid;gap:4px;font-size:14px}',
'.vlm summary{list-style:none;display:flex;align-items:baseline;gap:10px;cursor:pointer;font-weight:700;font-size:15.5px}.vlm summary::-webkit-details-marker{display:none}.vlm summary small{color:var(--muted);font-weight:600;font-size:12.5px}.vlm-i{display:grid;grid-template-columns:auto auto 1fr;gap:10px;align-items:baseline;padding:9px 2px;border-top:1px solid var(--line);font-size:14px;cursor:pointer}.vlm-i input{width:20px;height:20px;align-self:center;accent-color:var(--acc,#1B2440)}.vlm-i b{white-space:nowrap}.vlm-i.ok span,.vlm-i.ok b{text-decoration:line-through;color:var(--muted)}',
'.vctl{margin-top:10px;border-radius:12px;background:color-mix(in srgb,#2E7D4F 12%,transparent);padding:8px 12px}.vctl-pb{background:color-mix(in srgb,#C2410C 12%,transparent)}.vctl summary{list-style:none;display:flex;align-items:center;gap:10px;cursor:pointer}.vctl summary::-webkit-details-marker{display:none}',
'.vctl summary i{flex:none;width:26px;height:26px;border-radius:50%;display:grid;place-items:center;font-style:normal;font-weight:800;color:#fff;background:#2E7D4F}.vctl-pb summary i{background:#C2410C}.vctl summary span{display:grid;font-weight:700;font-size:14.5px}.vctl summary small{font-weight:500;font-size:12.5px;color:var(--muted)}.vctl .vul{margin-top:8px;font-size:13px;list-style:none;padding-left:4px}',
'.vbtns{display:flex;gap:8px;flex-wrap:wrap}',
'.vpre{white-space:pre-wrap;font:13px/1.5 var(--mono);margin:0}',
'.vlog{display:grid;gap:10px}.vlog input{font:600 17px var(--f);padding:12px 14px;border-radius:12px;border:1.5px solid var(--line);background:var(--bg);color:var(--fg);width:100%}',
'.verr{color:var(--cor-ink);background:var(--cor-bg);border-radius:12px;padding:8px 12px;font-size:13.5px}.verr:empty{display:none}',
'.vfoot .vbtn.go{flex:2 1 200px}.vfoot{display:flex;gap:8px;padding:10px 16px calc(10px + env(safe-area-inset-bottom,0px));border-top:1px solid var(--line);background:var(--card);flex-wrap:wrap}.vfoot .vbtn{flex:1 1 140px}',
'details.vd summary{cursor:pointer;font-weight:700;font-size:14px}',
/* Devis plus clair (Cyril, 2/11) : un menu en haut de la demande, des parties nettes, « Modifier » visible, alerte fournisseur */
'html.pcvrai #vd .vnew{margin:12px 0 4px}html.pcvrai #vd .vnew .ic svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round}',
'.vmenu{margin:0 0 2px;padding:2px 0 6px}html body .vmenu .dv-seg{display:grid;gap:4px;padding:5px}html body .vmenu .dv-seg button{padding:8px 2px 7px;font-size:11.5px;justify-content:flex-start}html body .vmenu .dv-seg button span{white-space:normal;overflow:visible;text-overflow:clip;line-height:1.15;text-align:center;font-size:11.5px}',
'.dv-seg button i.r{background:#D9534F}.vmenu .dv-seg button svg{width:22px;height:22px;flex:none;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}',
'.vpan{display:grid;gap:12px}.vpan[hidden]{display:none}',
'.vtotc .vtot1{display:flex;justify-content:space-between;align-items:baseline;gap:10px}.vtot1>span{font-size:13.5px;color:var(--muted);font-weight:700}.vtot1>b{font-size:26px;font-weight:800;letter-spacing:-.4px}',
'.vverif h3{display:flex;gap:8px;align-items:baseline}details.vgrp{border-top:1px solid var(--line);padding:2px 0}details.vgrp>summary{list-style:none;cursor:pointer;display:flex;align-items:center;gap:10px;padding:10px 0;font-weight:800;font-size:15px}details.vgrp>summary::-webkit-details-marker{display:none}.vgi{flex:none;width:32px;height:32px;border-radius:50%;display:grid;place-items:center;background:var(--cx,var(--bg));box-shadow:var(--in)}.vgi svg *{fill:none!important}.vgi svg{width:17px;height:17px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.vgn{margin-left:auto;min-width:24px;height:24px;padding:0 7px;border-radius:999px;display:grid;place-items:center;font-size:12px;font-weight:800;color:#fff;background:#C2552E}.vgn.ok{background:#2F7D5B}',
'.vq{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:10px;align-items:start;padding:10px 0;border-top:1px dashed var(--line)}.vq label{display:grid;gap:4px;cursor:pointer}.vq label b{font-size:14.5px;font-weight:700;line-height:1.35}.vq.fait label b{color:var(--muted);text-decoration:line-through}.vchip{justify-self:start;font-size:12px;font-weight:700;color:var(--muted);border:1px solid var(--line);border-radius:999px;padding:2px 9px}.vchip.z{color:#C2552E;border-color:#C2552E}',
'.vtick{appearance:none;-webkit-appearance:none;width:26px;height:26px;margin:1px 0 0;border-radius:50%;border:1.5px solid var(--line);background:var(--cx,var(--bg));box-shadow:var(--in);cursor:pointer;display:grid;place-items:center}.vtick:checked{background:#2F7D5B;border-color:#2F7D5B}.vtick:checked::after{content:"";width:9px;height:5px;border:2.5px solid #fff;border-top:0;border-right:0;transform:rotate(-45deg) translate(1px,-1px)}',
'.vmod2{appearance:none;cursor:pointer;min-height:36px;font:800 12.5px var(--f,inherit);padding:7px 12px;border-radius:999px;background:var(--card);border:1px solid var(--line);color:var(--accx,var(--fg))}details.vmsg{padding:4px 0 10px}details.vmsg>summary{list-style:none;display:flex;justify-content:center;width:100%}details.vmsg>summary::-webkit-details-marker{display:none}details.vmsg textarea{width:100%;margin:10px 0 8px;font:500 14px var(--f,inherit);padding:10px 12px;border-radius:14px;border:1px solid var(--line);background:var(--cx,var(--bg));color:var(--fg)}',
'details.vcomm>summary{list-style:none;display:flex;align-items:center;justify-content:space-between;gap:8px}details.vcomm>summary::-webkit-details-marker{display:none}.vred{flex:none;font:800 12px var(--f,inherit);padding:7px 12px;border-radius:999px;background:var(--card);border:1px solid var(--line);color:var(--fg)}.vred::after{content:"Afficher"}details.vcomm[open] .vred::after{content:"Réduire"}',
'.vtotc details.vd{margin-top:8px}.vtotc details.vd>summary{font-size:13px;color:var(--muted)}',
'.vpart-h{display:grid;gap:2px;margin:0 0 6px}.vpart-h h3{margin:0}.vpart-h small{font-size:12.5px;color:var(--muted)}',
'.vedit{position:relative;padding-right:96px!important}.vedit .vmod{position:absolute;right:0;top:50%;transform:translateY(-50%);appearance:none;cursor:pointer;min-height:38px;font:800 12.5px var(--f,inherit);padding:8px 12px;border-radius:999px;background:var(--card);border:1px solid var(--line);color:var(--accx,var(--fg))}.vedit.fige{padding-right:0!important}',
'.vedit .x{margin-right:0}.vli.vv.vedit{padding-right:92px!important}',
'.vadd{width:100%;margin-top:8px;border:1.5px dashed var(--line);background:transparent}',
'.valerte .vedit{padding-right:126px!important}.valerte{display:grid;gap:6px;background:var(--warn-bg)!important;color:var(--fg)}.valerte>b{color:var(--warn);font-size:15.5px}.valerte>span{font-size:13.5px;line-height:1.45}.valerte .vedit{border-top:1px solid rgba(0,0,0,.08)}',
'.vsug{display:grid;gap:6px}.vsug-t{font-size:12.5px;color:var(--muted);font-weight:700}',
'.vsug-i{display:flex;align-items:center;gap:10px;width:100%;text-align:left;padding:10px 12px;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--fg);font:inherit;font-size:14px;cursor:pointer}',
'.vsug-i>span{flex:1;min-width:0}.vsug-i small{display:block;font-size:12px;color:var(--muted)}.vsug-i>b{white-space:nowrap;font-size:13px}.vsug-i svg{width:22px;height:22px;flex:none}',
'.vsug-new{justify-self:start}',
'.vfg{margin-top:6px}.vfg .vh h2{font-size:15.5px;display:flex;align-items:center;gap:8px}.vfg-env{padding:10px 12px;margin:6px -4px 10px;border-radius:14px;background:var(--soft)}',
'.vrouge{display:inline-block;min-width:20px;height:20px;padding:0 6px;border-radius:10px;background:#D9534F;color:#fff;font:800 11.5px/20px var(--f,inherit);font-style:normal;text-align:center}',
'.vminis{display:flex;gap:10px;overflow-x:auto;padding:4px 2px 10px;margin:0 -2px 6px;scroll-snap-type:x mandatory}.vmini{appearance:none;border:0;background:none;padding:0;text-align:left;cursor:pointer;flex:0 0 auto;width:min(46%,190px);scroll-snap-align:start;color:var(--fg);font:inherit}.vminis .vmini:only-child{width:min(62%,240px)}',
'.vmp{display:block;position:relative;aspect-ratio:210/297;border-radius:10px;overflow:hidden;background:#fff;box-shadow:0 6px 18px rgba(11,18,38,.18),0 0 0 1px var(--line);margin-bottom:6px}.vmp img{display:block;width:100%;height:100%;object-fit:cover;object-position:top;opacity:0;transition:opacity .3s}.vmini.pret .vmp img{opacity:1}.vmp i{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-style:normal;font-size:12.5px;color:#6b7280}.vmini.pret .vmp i{display:none}.vmini.rate .vmp i::after{content:" (indisponible)"}',
'.vmini b{display:block;font-size:13.5px}.vmini small{display:block;font-size:12px;color:var(--muted)}'
].join('\n');
document.head.appendChild(css);

/* ---------- appels au service ---------- */
function api(chemin,opt){opt=opt||{};var j=lsG(KJ),h={};if(j)h.Authorization='Bearer '+j;if(opt.body)h['Content-Type']='application/json';
 return fetch(SERVICE+chemin,{method:opt.method||'GET',headers:h,body:opt.body?JSON.stringify(opt.body):undefined,cache:'no-store'})
  .then(function(r){return r.json().catch(function(){return{ok:false,erreur:'Réponse illisible du service ('+r.status+')'}}).then(function(x){if(r.status===401&&x&&x.reconnexion){if(AP){quitterApercu();return x}deconnecter(true);}if(r.status===402&&x&&x.suspendu)enPause(x.erreur);if(!x.ok)throw new Error(x.erreur||('Erreur '+r.status));return x})},
   function(){throw new Error(navigator.onLine===false?'Pas de réseau pour l\'instant.':'Service ProClik injoignable. Réessayez dans un instant.')});}

/* ---------- panneau plein écran (même style que le plan) ---------- */
var ov=document.createElement('div');ov.className='pcov vov';ov.hidden=true;ov.setAttribute('role','dialog');
ov.innerHTML='<div class="pcov-h"><b id="vov-t"></b><button class="pcov-x" id="vov-x" type="button">Fermer</button></div><div class="pcbody" id="vov-b"></div><div class="vfoot" id="vov-f" hidden></div>';
document.body.appendChild(ov);
function ouvrir(titre,html,foot){$('#vov-b').style.padding='';$('#vov-b').style.maxWidth='';$('#vov-t').innerHTML=titre;$('#vov-b').innerHTML=html;var f=$('#vov-f');f.innerHTML=foot||'';f.hidden=!foot;ov.hidden=false;document.body.style.overflow='hidden';$('#vov-b').scrollTop=0}
function fermer(){ov.hidden=true;document.body.style.overflow='';if(/#c=/.test(location.hash))try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}}
$('#vov-x').addEventListener('click',fermer);
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!ov.hidden)fermer()});

/* ---------- connexion : e-mail + mot de passe (un seul Espace pour tous, Cyril 15/11) ----------
   E-mail vide = ancien code d'accès (BRS, ProClik Test) tant que l'artisan n'a pas choisi de mot de passe.
   Code provisoire donné par Cyril (PC-XXXX-XXXX) ou lien d'invitation (#invit=…) → « Choisissez votre mot de passe ». */
var apres=null,KM='pc-vrai-email';
function connecte(x){lsS(KJ,x.jeton);lsS(KA,x.artisan);if(window.PCMenus)window.PCMenus.applique();fermer();demarrer();if(apres){var a=apres;apres=null;a()}}
function oeil(id,inp){$(id).addEventListener('change',function(){[].concat(inp).forEach(function(i){i.type=this.checked?'text':'password'},this)})}
function connexion(msg){
 ouvrir('Votre Espace<small>Connexion à l\'Espace ProClik</small>',
  '<div class="card vlog"><p style="margin:0">'+(msg?esc(msg):'Tapez votre e-mail et votre mot de passe. Cet appareil s\'en souvient 90 jours.')+'</p>'+
  '<input id="vmail" type="email" inputmode="email" autocomplete="username" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Votre e-mail" aria-label="Votre e-mail" value="'+esc(lsG(KM)||'')+'">'+
  '<input id="vcode" type="password" inputmode="text" autocomplete="current-password" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Mot de passe (ou code provisoire)" aria-label="Mot de passe">'+
  '<label style="font-size:13.5px;color:var(--muted);display:flex;gap:8px;align-items:center"><input type="checkbox" id="vvoir" style="width:auto"> Afficher le mot de passe</label>'+
  '<div class="verr" id="verr"></div><button class="vbtn go" id="vgo" type="button">Se connecter</button>'+
  '<p style="margin:0;font-size:13px;color:var(--muted)">Mot de passe oublié ? Demandez à Cyril un nouveau lien : votre Espace et vos données ne bougent pas.</p></div>'+
  '<p class="hint" style="margin:0;color:var(--muted);font-size:13px">Ancien code d\'accès ? Laissez l\'e-mail vide et tapez votre code. Sans connexion, l\'Espace reste en démonstration (exemples fictifs).</p>');
 var inp=$('#vcode'),mail=$('#vmail');setTimeout(function(){try{(mail.value?inp:mail).focus()}catch(e){}},200);
 oeil('#vvoir',inp);
 function go(){var c=inp.value.trim(),m=mail.value.trim().toLowerCase(),b=$('#vgo');if(!c){$('#verr').textContent='Le mot de passe est vide.';return}
  b.disabled=true;b.textContent='Vérification…';$('#verr').textContent='';
  api('/espace/connexion',{method:'POST',body:m?{email:m,mdp:c}:{code:c}}).then(function(x){if(m)lsS(KM,m);if(x.changer){choisir({ticket:x.ticket},x.entreprise);return}connecte(x)},
   function(e){b.disabled=false;b.textContent='Se connecter';$('#verr').textContent=/refusé/.test(e.message)?(m?'E-mail ou mot de passe refusé. Vérifiez les majuscules (la correction automatique aime les changer).':'Code refusé. Vérifiez les majuscules et les espaces.'):e.message})}
 $('#vgo').addEventListener('click',go);inp.addEventListener('keydown',function(e){if(e.key==='Enter')go()});mail.addEventListener('keydown',function(e){if(e.key==='Enter')inp.focus()});
}
var REGLE='10 caractères au minimum, avec au moins une lettre et un chiffre.';
function choisir(o,ent){
 ouvrir('Choisissez votre mot de passe<small>'+(ent?esc(ent):'Espace ProClik')+'</small>',
  '<div class="card vlog"><p style="margin:0">C\'est vous seul qui le connaissez : ni Cyril ni personne d\'autre ne peut le lire. '+REGLE+'</p>'+
  '<input id="vn1" type="password" autocomplete="new-password" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Nouveau mot de passe" aria-label="Nouveau mot de passe">'+
  '<input id="vn2" type="password" autocomplete="new-password" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Retapez-le" aria-label="Retapez le mot de passe">'+
  '<label style="font-size:13.5px;color:var(--muted);display:flex;gap:8px;align-items:center"><input type="checkbox" id="vvoir" style="width:auto"> Afficher</label>'+
  '<div class="verr" id="verr"></div><button class="vbtn go" id="vgo" type="button">Valider et ouvrir mon Espace</button></div>');
 var a=$('#vn1'),b2=$('#vn2');setTimeout(function(){try{a.focus()}catch(e){}},200);oeil('#vvoir',[a,b2]);
 function go(){var v=a.value,b=$('#vgo');if(v!==b2.value){$('#verr').textContent='Les deux ne sont pas pareils.';return}
  if(v.length<10||!/[A-Za-zÀ-ÿ]/.test(v)||!/\d/.test(v)){$('#verr').textContent=REGLE;return}
  b.disabled=true;b.textContent='Un instant…';$('#verr').textContent='';
  api('/espace/activer',{method:'POST',body:{ticket:o.ticket,invit:o.invit,mdp:v}}).then(function(x){connecte(x);toast2('Mot de passe enregistré','Bienvenue dans votre Espace.')},
   function(e){b.disabled=false;b.textContent='Valider et ouvrir mon Espace';$('#verr').textContent=e.message})}
 $('#vgo').addEventListener('click',go);b2.addEventListener('keydown',function(e){if(e.key==='Enter')go()});
}
function toast2(t,s){try{if(window.PCX&&window.PCX.toast)window.PCX.toast(t,s)}catch(e){}}
/* Mon compte (menu ☰ « Votre espace », connecté) : mot de passe, autres appareils, se déconnecter */
function compte(){var art=lsG(KA)||{};
 ouvrir('Mon compte<small>'+esc(art.entreprise||'Espace ProClik')+'</small>',
  '<div class="card vlog"><p style="margin:0"><b>Changer mon mot de passe</b></p>'+
  '<input id="vo" type="password" autocomplete="current-password" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Mot de passe actuel" aria-label="Mot de passe actuel">'+
  '<input id="vn1" type="password" autocomplete="new-password" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Nouveau mot de passe" aria-label="Nouveau mot de passe">'+
  '<input id="vn2" type="password" autocomplete="new-password" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Retapez le nouveau" aria-label="Retapez le nouveau">'+
  '<p style="margin:0;font-size:13px;color:var(--muted)">'+REGLE+' Vos autres appareils seront déconnectés.</p>'+
  '<div class="verr" id="verr"></div><button class="vbtn go" id="vgo" type="button">Changer le mot de passe</button></div>'+
  '<div class="card vlog"><p style="margin:0"><b>Un téléphone perdu ?</b> Déconnectez tous vos autres appareils. Celui-ci reste connecté.</p><button class="vbtn" id="vpart" type="button">Déconnecter mes autres appareils</button></div>'+
  '<div class="card vlog"><button class="vbtn" type="button" id="vsort">Me déconnecter de cet appareil</button><p style="margin:0;font-size:13px;color:var(--muted)">Les demandes gardées sur cet appareil sont effacées.</p></div>');
 $('#vgo').addEventListener('click',function(){var b=this,v=$('#vn1').value;if(v!==$('#vn2').value){$('#verr').textContent='Les deux nouveaux ne sont pas pareils.';return}
  if(v.length<10||!/[A-Za-zÀ-ÿ]/.test(v)||!/\d/.test(v)){$('#verr').textContent=REGLE;return}
  b.disabled=true;$('#verr').textContent='';api('/espace/mot-de-passe',{method:'POST',body:{ancien:$('#vo').value,nouveau:v}}).then(function(x){lsS(KJ,x.jeton);fermer();toast2('Mot de passe changé','Vos autres appareils sont déconnectés.')},function(e){b.disabled=false;$('#verr').textContent=e.message})});
 $('#vpart').addEventListener('click',function(){var b=this;if(!b.dataset.ok){b.dataset.ok=1;b.textContent='Touchez encore pour confirmer';return}
  b.disabled=true;api('/espace/deconnexion-partout',{method:'POST'}).then(function(x){lsS(KJ,x.jeton);fermer();toast2('C\'est fait','Vos autres appareils sont déconnectés.')},function(e){b.disabled=false;$('#verr').textContent=e.message})});
 $('#vsort').addEventListener('click',function(){var b=this;if(!b.dataset.ok){b.dataset.ok=1;b.textContent='Touchez encore pour vous déconnecter';return}fermer();lsS(KA,null);if(window.PCProfil)PCProfil.pose(null);deconnecter(false)});
}
(function(){var m=document.getElementById('menu');if(!m)return;
 m.addEventListener('click',function(){setTimeout(function(){var t=document.getElementById('x-t');if(!t||t.textContent!=='Votre espace'||!lsG(KJ)||document.getElementById('v-compte'))return;
  var c=document.querySelector('#x-in .card.menu');if(!c)return;var b=document.createElement('button');b.type='button';b.id='v-compte';
  b.innerHTML='<span class="av"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5"/></svg></span><span class="tx"><b>Mon compte</b><small>Mot de passe, appareils connectés</small></span><span class="go">›</span>';
  b.addEventListener('click',function(){if(window.PCX&&window.PCX.xclose)window.PCX.xclose();compte()});
  var o=document.getElementById('mo-opt');c.insertBefore(b,o?o.nextSibling:c.firstChild)},10)})})();
/* Espace en pause (abonnement) : rien n'est effacé, message poli, on peut écrire à Cyril. */
function enPause(msg){if(enPause.vu)return;enPause.vu=1;
 ouvrir('Votre Espace est en pause<small>Rien n\'est effacé</small>','<div class="card vlog"><p style="margin:0">'+esc(msg||'Votre Espace est en pause.')+'</p><p style="margin:0;color:var(--muted);font-size:13.5px">Vos clients, vos devis et vos factures sont gardés tels quels. Dès que c\'est réglé, tout se rouvre tout seul.</p>'+
  (window.PCREG&&window.PCREG.ecrire?'<button class="vbtn go" type="button" id="vpause">Écrire à Cyril</button>':'')+'</div>');
 var b=document.getElementById('vpause');if(b)b.addEventListener('click',function(){fermer();window.PCREG.ecrire('Bonjour Cyril, mon Espace est en pause. ')})}
function deconnecter(expire){lsS(KJ,null);lsS(KL,null);document.documentElement.classList.remove('pcvrai');location.hash='';if(expire){setTimeout(function(){connexion('Votre connexion a expiré ou le mot de passe a changé : reconnectez-vous.')},50)}else location.reload()}

/* ---------- liste des demandes ---------- */
var LISTE=null,ETAPES=[],charge=0;
function carte(d){var av=valider(d.etape);
 return '<button class="vcard'+(av?' vav':'')+'" type="button" data-vc="'+esc(d.contact||'')+'"><div class="r"><span><b>'+esc(d.client)+'</b><small>'+esc(d.resume||d.titre||'')+'</small></span><span class="vp '+(av?'t':'')+'">'+esc(d.etape||'—')+'</span></div>'+
  '<div class="r"><span class="vamt">'+(d.total_ht!=null?eur(d.total_ht)+'<small>HT</small>':'<small style="margin:0">pré-devis pas encore prêt</small>')+'</span><small style="text-align:right">'+esc(quand(d.pre_devis_le||d.cree_le))+(d.a_verifier?'<br><span class="vp w">'+d.a_verifier+' à vérifier</span>':'')+'</small></div></button>'}
/* Onglet Devis : le même petit menu à icônes que la démo (Pré-devis · Fournisseur · Validés) */
var VSEG=null,FOURN=function(e){return /fournisseur/i.test(e||'')};
var ICS={pre:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 21H6V3h8l4 4v4"/><path d="M14 3v4h4M9 9h4M9 13h3"/><path d="M19.5 13.5l-5.5 5.5-.6 2.6 2.6-.6 5.5-5.5z"/></svg>',
 four:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h11v9H3z"/><path d="M14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/></svg>',
 val:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 14l2 2 3.5-3.5"/></svg>',
 plus:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
 mat:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 8l9-4 9 4-9 4z"/><path d="M3 8v8l9 4 9-4V8"/><path d="M12 12v8"/></svg>',
 mo:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 6.5a4 4 0 0 0 5 5L12 19a2.1 2.1 0 0 1-3-3z"/><path d="M14.5 6.5l3-3a4 4 0 0 1-3 3z"/></svg>',
 lig:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/></svg>',
 cli:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/></svg>',
 doc:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 12h5M10 16h5"/></svg>',
 calc:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12v18H6z"/><path d="M9 7h6M9 11h.01M12 11h.01M15 11h.01M9 15h.01M12 15h.01M15 15h.01"/></svg>'};
function rendre(){var L=(LISTE&&LISTE.demandes)||[],a=L.filter(function(d){return valider(d.etape)}),o=L.filter(function(d){return !valider(d.etape)});
 window.PCVD=LISTE?{a:a.length,f:o.filter(function(d){return FOURN(d.etape)}).length,v:o.filter(function(d){return !FOURN(d.etape)}).length}:null;
 var art=lsG(KA)||{},etat=LISTE?(LISTE._cache?'Hors connexion · liste du '+esc(quand(LISTE._le)):'À jour · '+esc(quand(LISTE._le))):'Chargement…';
 var f=o.filter(function(d){return FOURN(d.etape)}),v=o.filter(function(d){return !FOURN(d.etape)});if(!VSEG&&LISTE)VSEG=a.length?'pre':f.length?'four':'val';
 var G={pre:[a,'Pré-devis à valider','Rien à valider pour l\'instant. Le café peut rester chaud.'],four:[f,'En attente du fournisseur','Aucune demande n\'attend un fournisseur.'],val:[v,'Validés et suivantes','Aucune autre demande en cours.']}[VSEG||'pre'];
 var h='<div class="cf"><div class="vh"><h2>Devis</h2><span>'+etat+'</span></div><button class="btn go cf-go vnew" type="button" data-vnd><span class="lab"><span class="ic">'+ICS.plus+'</span><span>Créer un devis</span></span></button>'+
  '<div class="seg cf-seg dv-seg" role="tablist" aria-label="Devis">'+[['pre','Pré-devis',a.length],['four','Fournisseur',f.length],['val','Validés',0]].map(function(x){return '<button role="tab" type="button" data-vseg="'+x[0]+'" aria-selected="'+((VSEG||'pre')===x[0])+'">'+ICS[x[0]]+'<span>'+x[1]+'</span>'+(x[2]?'<i>'+x[2]+'</i>':'')+'</button>'}).join('')+'</div></div>'+
  '<div class="vh" style="margin-top:14px"><h2>'+G[1]+'</h2><span>'+G[0].length+'</span></div>'+(G[0].length?'<div class="vl">'+G[0].map(carte).join('')+'</div>':'<p class="vst">'+(LISTE?G[2]:'…')+'</p>');
 var vd=$('#vd');if(vd)vd.innerHTML=h;
 var va=$('#va');if(va)va.innerHTML=a.length?'<div class="vl">'+a.slice(0,4).map(carte).join('')+'</div>'+(a.length>4?'<button class="vbtn sm" type="button" data-vtab style="margin-top:8px">Voir les '+a.length+' demandes ›</button>':''):'<p class="vst">'+(LISTE?'Rien à valider. Profitez-en, ça ne durera pas.':'Chargement…')+'</p>';
 ['#badge'].forEach(function(s){var b=$(s);if(b){b.textContent=a.length;b.hidden=!a.length}});
 if(art.prenom){var hl=$('#hello');if(hl)hl.textContent='Bonjour '+art.prenom+'.';var ph=$('#phrase');if(ph)ph.textContent=a.length?(a.length===1?'Une demande attend votre validation. Le calcul est fait, il ne manque que votre œil.':a.length+' demandes attendent votre validation. Les calculs sont faits.'):'Aucune demande en attente : tout est à jour.'}
}
function charger(){if(!lsG(KJ))return;charge=Date.now();
 api('/espace/demandes').then(function(x){x._le=new Date().toISOString();LISTE=x;if(x.artisan&&x.artisan.options){var ka=lsG(KA)||{},av=JSON.stringify(ka.menus||{});ka.options=x.artisan.options;if(x.artisan.menus)ka.menus=x.artisan.menus;if(x.artisan.effectif!==undefined)ka.effectif=x.artisan.effectif;if(x.artisan.activite!==undefined)ka.activite=x.artisan.activite;if(x.artisan.profil!==undefined)ka.profil=x.artisan.profil;lsS(KA,ka);if(window.PCProfil)PCProfil.pose(ka);if(av!==JSON.stringify(ka.menus)&&window.PCMenus)window.PCMenus.applique()}ETAPES=x.etapes||[];lsS(KL,x);rendre()},
  function(e){var c=lsG(KL);if(c){c._cache=true;LISTE=c;ETAPES=c.etapes||[]}rendre();var vd=$('#vd');if(vd&&lsG(KJ))vd.insertAdjacentHTML('afterbegin','<div class="verr" style="margin-bottom:10px">'+esc(e.message)+'</div>')})}

/* ---------- une demande ---------- */
function lignes(L,vide){return L&&L.length?L.map(function(l){return '<div class="vli'+(l.a_verifier?' vv':'')+'"><span>'+esc(l.libelle)+'</span><span class="x">'+eur(l.total)+'</span><small>'+qte(l.quantite)+' '+esc(l.unite)+' × '+eur(l.pu,4)+(l.a_verifier?' · ⚠ à vérifier':'')+'</small></div>'}).join(''):'<p class="vst">'+vide+'</p>'}
/* ---------- liste du matériel du chantier (promesse du site, 17/11) : tirée du pré-devis, à cocher, à envoyer au fournisseur ---------- */
function cleListe(){return 'pc-liste-'+(COUR&&COUR.contact&&COUR.contact.id||'')}
function lignesListe(p){var M={},O=[];(ED&&ED.materiaux||p.materiaux||[]).forEach(function(l){if(!(+l.quantite>0))return;var k=(l.libelle+'|'+(l.unite||'')).toLowerCase();
  if(!M[k]){M[k]={d:l.libelle,q:0,u:l.unite||''};O.push(M[k])}M[k].q+=+l.quantite});
 var A=(p.attente||[]).map(function(a){return {d:a.libelle,q:+a.quantite||0,u:a.unite||'',att:1}});return O.map(function(x){x.q=Math.round(x.q*100)/100;return x}).concat(A)}
function uL(x){return x.q>1&&/^(barre|boîte|plaque|rouleau|sac|pièce|paquet|lot|seau|sachet|carton|botte|cartouche|tube|unité)$/.test(x.u)?x.u.replace(/^(.*)$/,'$1s'):x.u}
function texteListe(p){var k=COUR&&COUR.contact||{},L=lignesListe(p);
 return 'Liste du matériel · chantier '+(k.nom||'')+(k.ville?' ('+k.ville+')':'')+'\n\n'+L.filter(function(x){return !x.att}).map(function(x){return '- '+qte(x.q)+' '+uL(x)+' · '+x.d}).join('\n')+
  (L.some(function(x){return x.att})?'\n\nÀ chiffrer à part :\n'+L.filter(function(x){return x.att}).map(function(x){return '- '+(x.q?qte(x.q)+' '+uL(x)+' · ':'')+x.d}).join('\n'):'')}
function listeMatHTML(p){var L=lignesListe(p);if(!L.length)return '';var C=lsG(cleListe())||{},n=L.filter(function(x){return C[x.d]}).length;
 var li=function(x){return '<label class="vlm-i'+(C[x.d]?' ok':'')+'"><input type="checkbox" data-vlm="'+esc(x.d)+'"'+(C[x.d]?' checked':'')+'><b>'+(x.q?esc(qte(x.q)+' '+uL(x)):'')+'</b><span>'+esc(x.d)+'</span></label>'};
 return '<details class="card vsec vlm"><summary><span>📋 Liste du matériel</span><small>'+L.length+' article'+(L.length>1?'s':'')+(n?' · '+n+' coché'+(n>1?'s':''):'')+'</small></summary>'+
  '<p class="vst" style="padding:6px 0 4px">Tout ce qu\'il faut acheter pour ce chantier, en boîtes et rouleaux entiers. Cochez au fur et à mesure.</p>'+
  L.filter(function(x){return !x.att}).map(li).join('')+
  (L.some(function(x){return x.att})?'<p class="vst" style="padding:10px 0 2px"><b>À chiffrer à part</b> (prix demandé au fournisseur)</p>'+L.filter(function(x){return x.att}).map(li).join(''):'')+
  '<div class="vbtns" style="margin-top:12px"><button class="vbtn sm" type="button" data-vlmenv>✉️ Envoyer</button><button class="vbtn sm" type="button" data-vlmcp>Copier</button><button class="vbtn sm" type="button" data-vlmimp>Imprimer</button></div></details>'}
document.addEventListener('change',function(e){var c=e.target;if(!c||!c.hasAttribute||!c.hasAttribute('data-vlm'))return;var C=lsG(cleListe())||{},k=c.getAttribute('data-vlm');if(c.checked)C[k]=1;else delete C[k];lsS(cleListe(),C);var l=c.closest('.vlm-i');if(l)l.classList.toggle('ok',c.checked)});
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-vlmenv],[data-vlmcp],[data-vlmimp]');if(!b)return;e.preventDefault();var p=COUR&&COUR.pre_devis[0];if(!p)return;var t=texteListe(p);
 if(b.hasAttribute('data-vlmcp')){(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(function(){toast2('Liste copiée','Collez-la dans un message ou un e-mail.')},function(){toast2('Copie impossible','Utilisez « Envoyer ».')})}
 else if(b.hasAttribute('data-vlmenv')){if(navigator.share)navigator.share({title:'Liste du matériel',text:t}).catch(function(){});else location.href='mailto:?subject='+encodeURIComponent('Liste du matériel')+'&body='+encodeURIComponent(t)}
 else{var w=window.open('','_blank');if(!w){toast2('Fenêtre bloquée','Autorisez les fenêtres pour imprimer.');return}
  w.document.write('<!doctype html><meta charset="utf-8"><title>Liste du matériel</title><style>body{font:15px/1.5 system-ui,sans-serif;margin:32px;color:#111}h1{font-size:20px}li{margin:6px 0;list-style:none}li::before{content:"☐  "}</style><h1>'+esc(t.split('\n')[0])+'</h1><ul>'+t.split('\n').slice(2).map(function(x){return x.indexOf('- ')===0?'<li>'+esc(x.slice(2))+'</li>':x?'<h3>'+esc(x)+'</h3>':''}).join('')+'</ul>');
  w.document.close();setTimeout(function(){w.print()},300)}});
function liste(t,L,cl){return L&&L.length?'<div class="card vsec"><h3>'+t+'</h3><ul class="vul">'+L.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ul></div>':''}
var LIB={delai:'Délai',msg:'Message',budget:'Budget',message:'Message',objectif:'Objectif',aides:'Aides',disponibilites:'Disponibilités',visite:'Visite'};
var TRAV={cloison:'Cloison',doublage:'Doublage / isolation des murs',plafond:'Plafond',rampants:'Rampants',combles:'Combles',fenetres:'Fenêtres',portes:'Portes',sols:'Sols',autre:'Autre'};
function demandeHTML(D){if(!D)return '<div class="card vsec"><h3>Réponses du client</h3><p class="vst" style="padding:0">Le détail des réponses du formulaire n\'est pas encore rangé dans la fiche du client. Le pré-devis ci-dessus en tient déjà compte.</p></div>';
 var r=[];if(D.travaux&&D.travaux.length)r.push(['Travaux',D.travaux.map(function(t){return TRAV[t]||t}).join(', ')]);
 var lg=D.logement||{};var lo=[lg.type,[lg.cp,lg.commune].filter(Boolean).join(' '),Array.isArray(lg.ou)&&lg.ou.length?lg.ou.join(', '):null,lg.niveau!=null&&lg.niveau!==''?(+lg.niveau?'étage '+lg.niveau:'rez-de-chaussée'):null,lg.ascenseur?'ascenseur : '+lg.ascenseur:null].filter(Boolean).join(' · ');if(lo)r.push(['Logement',lo]);if(lg.age)r.push(['Plus de 2 ans',lg.age]);if(lg.occupe)r.push(['Habité pendant les travaux',lg.occupe]);if(Array.isArray(lg.pcs)&&lg.pcs.length)r.push(['Pièces en travaux',lg.pcs.join(', ')]);if(lg.mur)r.push(['Murs',lg.mur+(lg.isocote?' · isolation '+String(lg.isocote).toLowerCase():'')]);if(lg.cuis)r.push(['Cuisine',lg.cuis]);if(lg.sdb)r.push(['Salle de bain',lg.sdb+(Array.isArray(lg.sdbeq)&&lg.sdbeq.length?' : '+lg.sdbeq.join(', '):'')]);if(lg.elec)r.push(['Électricité',lg.elec]);if(lg.plomb)r.push(['Plomberie',lg.plomb]);if(lg.chauf)r.push(['Chauffage',lg.chauf]);
 var p=D.details&&D.details.plan;if(p){var np=0;(p.floors||[]).forEach(function(f){np+=(f.rooms||[]).length});r.push(['Plan dessiné',(np?np+' pièce'+(np>1?'s':'')+' · ':'')+(p.surface_totale_m2?qte(p.surface_totale_m2)+' m² au sol':'')]);if(p.aide_demandee)r.push(['⚠ Plan',p.aide_demandee])}
 var pj=D.projet||{};Object.keys(pj).forEach(function(k){var v=pj[k];if(v!==''&&v!=null&&typeof v!=='object')r.push([LIB[k]||k.charAt(0).toUpperCase()+k.slice(1).replace(/_/g,' '),String(v)])});
 var F=D.fichiers||{},ph=(F.photos_liens||[]).filter(okLien),pl=(F.plans_liens||[]).filter(okLien);
 if(!ph.length&&F.photos&&F.photos.length)r.push(['Photos',F.photos.length+' envoyée(s) avec la demande (pas rangées dans la fiche)']);
 var g='';if(p&&(p.floors||[]).some(function(f){return (f.pieces||[]).length}))g+='<button class="vbtn go" type="button" data-vplan style="width:100%;margin-top:12px">📐 Voir le plan dessiné par le client</button>';
 g+=mursHTML(D.murs);
 if(ph.length)g+='<h3 style="margin-top:12px">Photos du client ('+ph.length+')</h3><div class="vph">'+ph.map(function(x,i){return '<a href="'+esc(x.url)+'" target="_blank" rel="noopener"><img src="'+esc(x.url)+'" alt="Photo '+(i+1)+'" loading="lazy"></a>'}).join('')+'</div>';
 if(pl.length)g+='<h3 style="margin-top:12px">Plans joints ('+pl.length+')</h3><ul class="vul">'+pl.map(function(x,i){return '<li><a href="'+esc(x.url)+'" target="_blank" rel="noopener">'+(/\.pdf$/i.test(x.nom||'')?'📄':'🖼')+' Plan '+(i+1)+'</a></li>'}).join('')+'</ul>';
 return '<div class="card vsec"><h3>Réponses du client</h3><div class="vkv">'+r.map(function(x){return '<span>'+esc(x[0])+'</span><b>'+esc(x[1])+'</b>'}).join('')+'</div>'+g+'</div>'}
/* Murs vus de face par le client (formulaire, « Vos murs », 18/11) : un dessin par mur, ce qui est à créer / à changer / en place. */
var MCOUL={'À créer':['#A8823F','À créer'],'À changer':['#C2410C','À changer'],'Déjà en place':['#8A93A6','En place'],'Je ne sais pas':['#5B6478','?']};
function murFace(m,H){var L=Math.max(50,+m.longueur_cm||0),E=m.elements||[],W=300,k=W/L,Hh=Math.round(H*k),sv='<svg viewBox="-2 -2 '+(W+4)+' '+(Hh+22)+'" class="vmf-s" role="img" aria-label="Mur '+m.mur+'"><rect x="0" y="0" width="'+W+'" height="'+Hh+'" fill="var(--surface,#fff)" stroke="currentColor" stroke-width="1.5" rx="2"/>';
 E.forEach(function(e){var c=MCOUL[e.etat]||MCOUL['Je ne sais pas'],w=Math.max(5,(+e.largeur_cm||10)*k),h=Math.max(5,(+e.hauteur_cm||10)*k),x=(+e.x_cm||0)*k,y=Hh-((+e.hauteur_du_sol_cm||0)*k)-h;sv+='<rect x="'+x.toFixed(1)+'" y="'+Math.max(0,y).toFixed(1)+'" width="'+w.toFixed(1)+'" height="'+h.toFixed(1)+'" rx="1.5" fill="'+c[0]+'" fill-opacity=".22" stroke="'+c[0]+'" stroke-width="1.3"'+(e.etat==='Je ne sais pas'?' stroke-dasharray="3 2"':'')+'><title>'+esc(e.type+' · '+e.etat)+'</title></rect>'});
 sv+='<text x="'+(W/2)+'" y="'+(Hh+17)+'" text-anchor="middle" font-size="15" fill="currentColor">Mur '+m.mur+' · '+qte(L/100)+' m</text></svg>';
 var cpt={};E.forEach(function(e){if(e.etat==='Déjà en place'||/^(Porte|Fenêtre)$/.test(e.type))return;var key=e.type+'|'+e.etat;cpt[key]=(cpt[key]||0)+1});
 var li=Object.keys(cpt).map(function(key){var p=key.split('|'),c=MCOUL[p[1]]||MCOUL['Je ne sais pas'];return '<li><i style="background:'+c[0]+'"></i>'+cpt[key]+' × '+esc(p[0])+' <small>'+esc(c[1])+'</small></li>'}).join('');
 return '<figure class="vmf">'+sv+(li?'<ul>'+li+'</ul>':'')+'</figure>'}
function mursHTML(M){if(!Array.isArray(M)||!M.length)return '';
 return '<h3 style="margin-top:12px">Murs vus de face par le client</h3><p class="vst" style="padding:0;margin:0 0 6px">Ce que le client a montré mur par mur : <b style="color:#A8823F">à créer</b>, <b style="color:#C2410C">à changer</b>, en place, ou « je ne sais pas » (pointillés). À vérifier au rendez-vous.</p>'+M.map(function(p){var H=+p.hauteur_cm||250;return '<div class="vmp"><b>'+esc(p.piece||'Pièce')+'</b>'+(p.niveau?' <small>· '+esc(p.niveau)+'</small>':'')+(p.photos?' <small>· '+p.photos+' photo'+(p.photos>1?'s':'')+'</small>':'')+(p.note?'<p class="vmn">« '+esc(p.note)+' »</p>':'')+'<div class="vmg">'+(p.murs||[]).map(function(m){return murFace(m,H)}).join('')+'</div></div>'}).join('')}
function okLien(x){return x&&typeof x.url==='string'&&/^https:\/\/[^\s"'<>]+$/.test(x.url)}
function ouvrirDemande(c){if(!c)return;
 if(!lsG(KJ)){apres=function(){ouvrirDemande(c)};connexion();return}
 ouvrir('Demande<small>Chargement…</small>','<p class="vst">Lecture de la fiche du client…</p>');
 api('/espace/demande?c='+encodeURIComponent(c)).then(function(x){afficher(x.demande)},function(e){if(!lsG(KJ))return;ouvrir('Demande<small>Impossible de l\'ouvrir</small>','<div class="verr">'+esc(e.message)+'</div>','<button class="vbtn" type="button" data-vfermer>Fermer</button><button class="vbtn go" type="button" data-vc="'+esc(c)+'">Réessayer</button>')})}
var COUR=null;
/* Plan dessiné par le client : le module Plan s'ouvre en mode artisan et reçoit le plan de la demande.
   Les retouches de l'artisan restent sur cet appareil (une sauvegarde par client). */
var VPNEW=false;
function voirPlan(nouveau){var D=COUR&&COUR.demande,P=D&&D.details&&D.details.plan,pm=lsG(clePm());if(!P&&!pm&&!nouveau)return;var k=COUR.contact||{},nom=k.nom||'le client',moi=!P;VPNEW=moi;
 ouvrir('📐 Plan de '+esc(nom)+(moi?'<small>Dessiné par vous · le pré-devis le reprend quand vous recalculez</small>':'<small>Dessiné par le client avec sa demande · tailles à confirmer à la visite</small>'),'<iframe id="vplanf" title="Plan du client" allow="microphone" style="flex:none;width:100%;height:calc(100vh - 150px);min-height:420px;border:0;border-radius:14px;background:var(--card)" src="plan.html?embed=1&attendre=1&v=66&chantier=c-'+encodeURIComponent(k.id||'')+'&cn='+encodeURIComponent(nom||'')+'"></iframe>','<button class="vbtn" type="button" data-vretour>← Retour à la demande</button>');
 $('#vov-b').style.padding='8px';$('#vov-b').style.maxWidth='none';$('#vplanf').style.setProperty('height','calc(100vh - 150px)','important')}
addEventListener('message',function(e){var f=document.getElementById('vplanf');if(!f||e.source!==f.contentWindow)return;var d=e.data||{};
 if(d.type==='proclik-plan-ready'){var D=COUR&&COUR.demande,k=COUR&&COUR.contact||{};f.contentWindow.postMessage({type:'proclik-plan-load',plan:D&&D.details&&D.details.plan,prenom:k.prenom||'',nouveau:VPNEW},'*')}
 /* Plan retouché par l'artisan : gardé ici jusqu'au recalcul (sauf s'il est identique au plan déjà recalculé) */
 if(d.type==='proclik-plan-modifie'&&d.plan&&COUR&&COUR.contact){var D2=COUR.demande,P2=D2&&D2.plan_corrige_le&&D2.details&&D2.details.plan;if(P2&&JSON.stringify(P2)===JSON.stringify(d.plan))lsS(clePm(),null);else pmGarder(clePm(),d.plan)}});
/* Appareil plein (22/11) : on garde le plan sans ses photos et on le dit, au lieu de tout perdre sans rien dire */
function pmSansPh(k,v){if(typeof v==='string'&&/^data:image/.test(v))return undefined;if(Array.isArray(v)&&v.length&&v.every(function(x){return x&&typeof x.u==='string'&&/^data:image/.test(x.u)}))return undefined;return v}
var pmAv=0;function pmGarder(k,plan){var o={t:Date.now(),plan:plan},n=0;try{localStorage.setItem(k,JSON.stringify(o))}catch(e){try{localStorage.setItem(k,JSON.stringify(o,pmSansPh));n=1}catch(e2){n=2}}if(n&&Date.now()-pmAv>90000&&window.PCX&&PCX.toast){pmAv=Date.now();PCX.toast(n===2?'Plan pas gardé':'Photos du plan pas gardées',n===2?'Plus de place sur cet appareil. Ne fermez pas la page et libérez de la place.':'Plus de place sur cet appareil. Le plan est gardé, mais pas ses photos : gardez-les aussi dans votre galerie.')}}
/* Le pré-devis à valider, comme un devis qu'on travaille (Cyril, 31/10) : le total, le plan, les lignes modifiables d'un appui,
   « + Ajouter une ligne », puis un seul gros bouton en bas, en deux appuis. Plus de « Changer d'étape » : l'étape suit les validations.
   Les retouches restent sur cet appareil jusqu'à la création du devis, qui les envoie (mêmes taux de marge et de frais généraux). */
var ED=null,VTAB='devis',MODE='pre',ND=null;
function T(){return MODE==='nd'?ND:ED}
function retour(){return MODE==='nd'?rendreND():afficher(COUR)}
function cleLg(){return 'pc-lg-'+(COUR&&COUR.contact&&COUR.contact.id||'')}
function edition(p){var s=lsG(cleLg());if(s&&s.le===p.le){s.four=s.four||{};return s}var c=function(L){return L.map(function(l){return {libelle:l.libelle,quantite:l.quantite,unite:l.unite,pu:l.pu,total:l.total,a_verifier:l.a_verifier}})};
 var e={le:p.le,materiaux:c(p.materiaux),main_oeuvre:c(p.main_oeuvre),touche:0,four:{}},R=lsG(cleRt());
 /* Après un recalcul : les retouches de l'artisan sont remises par-dessus le nouveau calcul */
 if(R&&R.avant!==p.le){e.materiaux=appliquerRt(e.materiaux,R.materiaux);e.main_oeuvre=appliquerRt(e.main_oeuvre,R.main_oeuvre);e.touche=1;if(R.att===JSON.stringify((p.attente||[]).map(function(a){return a.libelle})))e.four=R.four||{};lsS(cleRt(),null);lsS(cleLg(),e)}
 return e}
function cleRt(){return 'pc-rt-'+(COUR&&COUR.contact&&COUR.contact.id||'')}
function clePm(){return 'pc-planmod-'+(COUR&&COUR.contact&&COUR.contact.id||'')}
/* Retouches de l'artisan = ce qui diffère du calcul de Cliky (lignes changées ou ajoutées, lignes enlevées) */
function retouches(p){if(!ED||!ED.touche||!p)return null;var R={n:0};['materiaux','main_oeuvre'].forEach(function(k){var o=(p[k]||[]).slice(),ch=[];(ED[k]||[]).forEach(function(l){var i=-1;for(var j=0;j<o.length;j++)if(o[j]&&o[j].libelle===l.libelle&&o[j].quantite===l.quantite&&o[j].pu===l.pu&&o[j].total===l.total){i=j;break}if(i>=0)o[i]=null;else ch.push(l)});
  var sup=o.filter(Boolean).map(function(x){return x.libelle});R[k]={ch:ch,sup:sup};R.n+=ch.length+sup.filter(function(x){return !ch.some(function(l){return l.libelle===x})}).length});return R.n?R:null}
function appliquerRt(L,r){if(!r)return L;L=L.slice();var fait={};r.ch.forEach(function(l){var i=-1;for(var j=0;j<L.length;j++)if(!fait[j]&&L[j].libelle===l.libelle){i=j;break}if(i>=0){L[i]=l;fait[i]=1}else{L.push(l);fait[L.length-1]=1}});
 r.sup.forEach(function(x){for(var j=0;j<L.length;j++)if(L[j]&&!fait[j]&&L[j].libelle===x){L[j]=null;break}});return L.filter(Boolean)}
/* Recalcul du pré-devis après une modification du plan (ou des prix) : fait par le programme, sans frais */
var RC=null;
function recalc(){var k=COUR&&COUR.contact;if(!k)return;var pm=lsG(clePm());ouvrir('↻ Recalcul<small>Un instant…</small>','<p class="vst">Le calcul est refait avec '+(pm?'le plan modifié':'vos prix à jour')+'…</p>');
 api('/espace/recalcul',{method:'POST',body:{contact:k.id,plan:pm&&pm.plan||undefined}}).then(function(x){RC=x;RC.pm=!!pm;rendreRc()},function(e){ouvrir('↻ Recalcul<small>Impossible pour l\'instant</small>','<div class="verr">'+esc(e.message)+'</div>','<button class="vbtn" type="button" data-vretour>← Retour</button>')})}
function rendreRc(){var x=RC,ch=x.changements||{},R=retouches(COUR.pre_devis[0]),np=x.pre_devis,
 /* Avec des retouches : on compare ce que l'artisan voit (ses retouches comprises), avant et après */
 av=R&&ED?totauxEd(COUR.pre_devis[0]).total_ht:x.avant.total_ht,ap=R&&np?totauxEd(np,{materiaux:appliquerRt(np.materiaux,R.materiaux),main_oeuvre:appliquerRt(np.main_oeuvre,R.main_oeuvre)}).total_ht:x.apres.total_ht,d=ap-av,q=function(n){return String(n).replace('.',',')};
 var lg=function(t,L,f){return L&&L.length?'<div class="card vsec"><h3>'+t+'</h3><ul class="vul">'+L.map(f).join('')+'</ul></div>':''},f2=function(l){return '<li>'+esc(l.libelle)+' · '+eur(l.total)+'</li>'};
 var h='<div class="card vsec vtotc"><div class="vtot1"><span>Avant'+(R?' (avec vos retouches)':'')+'</span><b style="font-size:18px">'+eur(av)+'</b></div><div class="vtot1"><span>Après le recalcul</span><b>'+eur(ap)+'</b></div><p class="vst" style="padding:4px 0 0">'+(Math.abs(d)<0.005?'Le total ne change pas.':(d>0?'+ ':'− ')+eur(Math.abs(d))+' HT')+'</p></div>'+
  lg('Lignes qui changent',ch.modifiees,function(l){return '<li>'+esc(l.libelle)+' : '+q(l.avant.quantite)+' → '+q(l.apres.quantite)+' '+esc(l.unite||'')+' ('+eur(l.avant.total)+' → '+eur(l.apres.total)+')</li>'})+lg('Nouvelles lignes',ch.ajoutees,f2)+lg('Lignes retirées',ch.retirees,f2)+
  '<p class="vst">'+(x.gardees?x.gardees+' ligne'+(x.gardees>1?'s':'')+' chiffrée'+(x.gardees>1?'s':'')+' par Cliky en dehors du plan (travaux « Autre »…) '+(x.gardees>1?'sont gardées':'est gardée')+' telle'+(x.gardees>1?'s':'')+' quelle'+(x.gardees>1?'s':'')+'. ':'')+(R?(R.n>1?'Vos '+R.n+' retouches à la main seront remises':'Votre retouche à la main sera remise')+' par-dessus. ':'')+'Fait par le programme, sans frais. L\'ancien pré-devis reste dans l\'historique.</p>';
 ouvrir('↻ Recalcul du pré-devis<small>'+(x.pm?'Avec le plan modifié':'Avec vos prix à jour')+'</small>',h,'<button class="vbtn" type="button" data-vretour>← Annuler</button><button class="vbtn go" type="button" data-vrecalcok>Garder ce calcul</button>')}
function recalcOk(b){var k=COUR&&COUR.contact;if(!k)return;var id=k.id,pm=lsG(clePm()),p=COUR.pre_devis[0],R=retouches(p);b.disabled=true;b.textContent='Enregistrement…';
 api('/espace/recalcul',{method:'POST',body:{contact:id,plan:pm&&pm.plan||undefined,enregistrer:true}}).then(function(x){
  if(R){R.avant=p.le;R.att=JSON.stringify((p.attente||[]).map(function(a){return a.libelle}));R.four=ED&&ED.four;lsS(cleRt(),R)}
  lsS(clePm(),null);lsS(cleLg(),null);toastV('Pré-devis recalculé',eur(x.apres.total_ht)+' HT');
  return api('/espace/demande?c='+encodeURIComponent(id)).then(function(y){if(COUR&&COUR.contact&&COUR.contact.id===id)afficher(y.demande)})
 }).catch(function(e){b.disabled=false;b.textContent='Garder ce calcul';toastV('Pas enregistré',e.message)})}
function garderEd(){ED.touche=1;lsS(cleLg(),ED)}
/* Étape C (Cyril, 17/11) : le calcul normal, puis le même avec la vraie cadence de l'artisan (espace/journee.js, « Mes cadences »).
   Il compare les deux totaux et applique, ou non. Rien ne change sans son geste. */
function cadR(){return window.PCJR&&PCJR.cadences?PCJR.cadences():{}}
function cadLigne(l,r){var q=+l.quantite||0,pu=+l.pu||0,n={},k;for(k in l)n[k]=l[k];if(/^h/.test(l.unite||'')){n.quantite=Math.round(q*r*100)/100}else{n.pu=Math.round(pu*r*100)/100}n.total=Math.round((+n.quantite||0)*(+n.pu||0)*100)/100;n.cad=r;n.q0=l.quantite;n.pu0=l.pu;n.t0=l.total;return n}
function cadInv(l){var n={},k;for(k in l)if(!/^(cad|q0|pu0|t0)$/.test(k))n[k]=l[k];n.quantite=l.q0;n.pu=l.pu0;n.total=l.t0;return n}
function cadLignes(){var C=cadR(),o=[];if(!ED||!window.PCJR)return o;ED.main_oeuvre.forEach(function(l,i){if(l.cad)return;var t=PCJR.typeLigne(l.libelle);if(t&&C[t])o.push({i:i,t:t,c:C[t]})});return o}
function cadCle(p){return 'pc-cadx-'+(COUR&&COUR.contact&&COUR.contact.id||'')+'-'+(p&&p.le||'')}
function cadPct(r){var x=Math.round((r-1)*100);return (x>0?'+':x<0?'−':'')+Math.abs(x)+' %'}
function cadHTML(p){if(!ED||!window.PCJR)return '';var tag=window.PCTAG?PCTAG('cliky','connaît votre cadence'):'';
 var faite=ED.main_oeuvre.filter(function(l){return l.cad});
 if(faite.length){var t0=totauxEd(p,{materiaux:ED.materiaux,main_oeuvre:ED.main_oeuvre.map(function(l){if(!l.cad)return l;return cadInv(l)})});
  return '<div class="card vsec vcad ok">'+tag+'<b>✓ Votre cadence est appliquée</b><p class="vst" style="padding:4px 0 0">'+faite.length+' ligne'+(faite.length>1?'s':'')+' de main-d\'œuvre. Calcul normal : '+eur(t0.total_ht)+' HT. <a href="#" data-vcad="raz">Revenir au calcul normal</a></p></div>'}
 var L=cadLignes();if(!L.length||lsG(cadCle(p)))return '';var k=cadCle(p);if(CADSEL.k!==k)CADSEL={k:k,non:{}};var oui=function(i){return !CADSEL.non[i]},nOui=L.filter(function(x){return oui(x.i)}).length;
 var E2={materiaux:ED.materiaux,main_oeuvre:ED.main_oeuvre.map(function(l,i){var x=L.filter(function(y){return y.i===i})[0];return x&&oui(i)?cadLigne(l,x.c.r):l})},t1=totauxEd(p),t2=totauxEd(p,E2),d=t2.total_ht-t1.total_ht;
 return '<div class="card vsec vcad">'+tag+'<h3>Avec votre cadence</h3><p class="vst" style="padding:0 0 10px">Cliky a fait son calcul normal. Le voici refait avec votre vrai rythme, appris sur vos chantiers.</p>'+
  '<div class="vcad-2"><div><span>Calcul normal</span><b>'+eur(t1.total_ht)+'</b><small>HT</small></div><div class="on"><span>Avec votre cadence</span><b>'+eur(t2.total_ht)+'</b><small>HT · '+(d>=0?'+':'−')+eur(Math.abs(d))+'</small></div></div>'+
  '<p class="vcad-q">Ligne par ligne : ma cadence ?</p><ul class="vcad-l">'+L.map(function(x){var l=ED.main_oeuvre[x.i],n=cadLigne(l,x.c.r),o=oui(x.i);return '<li class="'+(o?'':'non')+'"><span>'+esc(l.libelle)+'<small>'+esc(PCJR.nomType(x.t))+' '+cadPct(x.c.r)+' · appris sur '+x.c.n+' chantiers</small><b>'+(o?'<s>'+eur(l.total)+'</s> '+eur(n.total):eur(l.total)+' <s>'+eur(n.total)+'</s>')+'</b></span>'+
   '<span class="vcad-on" role="group" aria-label="Ma cadence sur cette ligne"><button type="button" data-vcadl="'+x.i+'|0" aria-pressed="'+!o+'">Non</button><button type="button" data-vcadl="'+x.i+'|1" aria-pressed="'+o+'">Oui</button></span></li>'}).join('')+'</ul>'+
  '<div class="vbtns vcad-b"><button type="button" class="vbtn" data-vcad="non">Garder le calcul normal</button>'+(nOui?'<button type="button" class="vbtn go" data-vcad="ok">Appliquer sur '+(nOui===L.length?(L.length>1?'les '+L.length+' lignes':'cette ligne'):nOui+' ligne'+(nOui>1?'s':''))+'</button>':'')+'</div></div>'}
var CADSEL={k:null,non:{}};
function cadLigneChoix(v){var p=COUR&&COUR.pre_devis&&COUR.pre_devis[0],a=v.split('|'),c=document.querySelector('.vcad');if(!p||!c)return;if(a[1]==='1')delete CADSEL.non[a[0]];else CADSEL.non[a[0]]=1;var h=cadHTML(p);if(h)c.outerHTML=h}
function cadAction(a){var p=COUR&&COUR.pre_devis&&COUR.pre_devis[0];if(!p||!ED)return;
 if(a==='non'){lsS(cadCle(p),1);toastV('Calcul normal gardé','Vous pourrez toujours modifier une ligne à la main.');return retour()}
 if(a==='ok'){var L=cadLignes().filter(function(x){return !CADSEL.non[x.i]});L.forEach(function(x){ED.main_oeuvre[x.i]=cadLigne(ED.main_oeuvre[x.i],x.c.r)});garderEd();toastV('Votre cadence est appliquée',L.length+' ligne'+(L.length>1?'s':'')+' de main-d\'œuvre recalculée'+(L.length>1?'s':'')+'.');return retour()}
 if(a==='raz'){ED.main_oeuvre=ED.main_oeuvre.map(function(l){if(!l.cad)return l;return cadInv(l)});lsS(cadCle(p),1);garderEd();toastV('Calcul normal remis','Pour la main-d\'œuvre de votre cadence.');return retour()}}
/* Ce qui manque encore du fournisseur : on ne valide pas tant que tous les prix ne sont pas là (Cyril, 2/11) */
function manque(p){p=p||(COUR&&COUR.pre_devis[0]);if(!p||!p.lue||!ED)return [];return (p.attente||[]).map(function(a,i){return [a,i]}).filter(function(x){return !ED.four[x[1]]})}
/* Mêmes taux que le serveur (calcul/vosfactures.js, lignesDevis) : marge sur les matériaux, frais généraux sur tout */
function totauxEd(p,E){E=E||ED;var t=p.totaux||{},s=function(L){return L.reduce(function(a,l){return a+(+l.total||0)},0)},sm0=s(p.materiaux),so0=s(p.main_oeuvre),tm=sm0>0&&t.marge?t.marge/sm0:0,b0=sm0*(1+tm)+so0+(t.deplacement||0),tf=b0>0&&t.frais_generaux?t.frais_generaux/b0:0;
 var sm=s(E.materiaux),so=s(E.main_oeuvre),mg=sm*tm,b=sm+mg+so+(t.deplacement||0),fg=b*tf,r=function(x){return Math.round(x*100)/100};
 return {materiaux:r(sm),marge:r(mg),main_oeuvre:r(so),deplacement:t.deplacement||0,frais_generaux:r(fg),total_ht:r(b+fg)}}
/* Une partie du pré-devis : on voit tout de suite que chaque ligne se modifie, et chaque partie a son « + Ajouter » */
function lignesEd(cle,titre,aide,ajout){var L=ED[cle];
 return '<div class="card vsec vpart"><div class="vpart-h"><h3>'+titre+'</h3><small>'+aide+'</small></div>'+(L.length?L.map(function(l,i){return '<div class="vli vedit'+(l.a_verifier?' vv':'')+'"><span>'+esc(l.libelle)+(l.four!=null?' <span class="vp t">prix fournisseur</span>':'')+'</span><span class="x">'+eur(l.total)+'</span><small>'+qte(l.quantite)+' '+esc(l.unite)+' × '+eur(l.pu,4)+(l.a_verifier?' · ⚠ à vérifier':'')+'</small><button type="button" class="vmod" data-vlg="'+cle+'|'+i+'">Modifier</button></div>'}).join(''):'<p class="vst">Aucune ligne pour l\'instant.</p>')+
  '<button class="vbtn vadd" type="button" data-vlg="+'+cle+'">＋ '+ajout+'</button></div>'}
/* ---------- À vérifier : rangé par qui répond (option Cliky). Une case « c'est bon » par question,
   « Modifier » quand la question touche une ligne qu'on retrouve, questions du client envoyées en un message. ---------- */
function vokCle(p){return 'pc-vok-'+(COUR&&COUR.contact&&COUR.contact.id||'')+'-'+(p&&p.le||'')}
function vcap(x){x=String(x||'').trim();return x.charAt(0).toUpperCase()+x.slice(1)}
function vcourt(s){s=String(s||'').trim();var r='',g='vis',m;
 if(/mis à 0 €/i.test(s))return {g:'prix',q:vcap(s.replace(/\s*:?\s*mis à 0 €.*$/i,'')),r:'0 € pour l\'instant'};
 if(/client|à changer ou à garder|sens d'ouverture|poignée|à choisir|plaque hydro|phonique|finition|grand format|renforcée/i.test(s))g='cli';
 m=s.match(/\s*\(([^()]*(?:retenu|chiffr|dépose)[^()]*)\)/i);if(m){r=m[1];s=s.replace(m[0],'')}
 if(!r){m=s.match(/([,?])\s*((?:chiffrée?s?|considérée?s?|réponses détaillées retenues|doublage sur)[^,?]*)/i);if(m){r=m[2];s=s.replace(m[0],m[1]==='?'?' ?':'')}}
 s=s.replace(/,\s*à valider\s*$/i,'').replace(/,?\s*à (?:confirmer|valider) avec le client/ig,'').replace(/\s*,\s*$/,'').replace(/\s+\?/,' ?').trim();
 if(r){r=r.trim().replace(/\s*\bretenue?s?\b/i,'').replace(/^chiffrée?s? /i,'chiffré ');r='Retenu : '+r}
 return {g:g,q:vcap(s),r:r}}
/* la ligne du pré-devis que touche la question, quand on la retrouve sans hésiter */
function vligne(x){if(!ED)return null;var C=[];['materiaux','main_oeuvre'].forEach(function(c){(ED[c]||[]).forEach(function(l,i){C.push([c,i,String(l.libelle||'').toLowerCase()])})});
 var q=x.q.toLowerCase(),A=C.filter(function(c){return c[2]&&(c[2].indexOf(q)===0||q.indexOf(c[2])===0)});if(A.length===1)return {lg:A[0][0]+'|'+A[0][1]};
 var suj=q.split(' : ')[0].split(/[\s()']+/).filter(function(w){return w.length>=5}).map(function(w){return w.replace(/s$/,'')});if(!suj.length)return null;
 A=C.filter(function(c){return suj.every(function(w){return c[2].indexOf(w)>=0})});if(A.length===1)return {lg:A[0][0]+'|'+A[0][1]};
 if(A.length>1&&A.every(function(c){return c[0]===A[0][0]}))return {tab:A[0][0]==='materiaux'?'mat':'mo'};return null}
var VGR=[['cli','À demander au client','<path d="M4 5h16v11H9l-5 4z"/>'],['vis','À voir à la visite','<path d="M3 17 17 3l4 4L7 21H3z"/><path d="m12 8 2 2m-5 1 2 2m-5 1 2 2"/>'],['prix','À chiffrer','<circle cx="12" cy="12" r="9"/><path d="M15 9.5a3.5 3.5 0 1 0 0 5M7.5 11h5m-5 2h5"/>']];
/* Contrôle n° 1 (fait par le programme avant l'arrivée du pré-devis) : badge vert, ou le nombre de points à regarder */
function controleHTML(p){var v=p&&p.verification;if(!v)return '';var n=v.points||0;
 return '<details class="vctl'+(n?' vctl-pb':'')+'"><summary><i>'+(n?'!':'✓')+'</i><span>'+(n?n+' point'+(n>1?'s':'')+' à regarder<small>relevé'+(n>1?'s':'')+' par la vérification, dans « À vérifier »</small>':'Vérifié par le programme<small>'+v.ok.length+' contrôle'+(v.ok.length>1?'s':'')+' passé'+(v.ok.length>1?'s':'')+'</small>')+'</span></summary><ul class="vul">'+v.ok.map(function(x){return '<li>✓ '+esc(x)+'</li>'}).join('')+'</ul></details>'}
function verifHTML(p){var L=(p.a_verifier||[]);if(!L.length)return '';var tag=window.PCTAG?PCTAG('cliky','a relevé ces points'):'';
 if(window.PCOPT&&!PCOPT.cliky)return '<div class="card vsec">'+tag+'<p class="vst" style="padding:0">Avec l\'option Cliky, les points à vérifier de chaque demande sont rangés ici : à demander au client, à voir à la visite, à chiffrer.</p></div>';
 var ok=lsG(vokCle(p))||[],Q=L.map(vcourt),k=COUR&&COUR.contact||{};
 return '<div class="card vsec vverif">'+tag+'<h3 style="margin:0 0 2px">À vérifier</h3>'+(function(){var r=L.map(function(_,i){return i}).filter(function(i){return ok.indexOf(i)<0}).length;return r?'<button type="button" class="vbtn vwz-go" data-vwzgo="1">▶ Vérifier un par un ('+r+')</button>':''})()+
  VGR.map(function(G){var I=[];Q.forEach(function(x,i){if(x.g===G[0])I.push(i)});if(!I.length)return '';var reste=I.filter(function(i){return ok.indexOf(i)<0}).length;
   return '<details class="vgrp" data-vgrp="'+G[0]+'"'+(reste?' open':'')+'><summary><span class="vgi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+G[2]+'</svg></span>'+G[1]+'<span class="vgn'+(reste?'':' ok')+'">'+(reste||'✓')+'</span></summary>'+
    I.map(function(i){var x=Q[i],li=vligne(x),fait=ok.indexOf(i)>=0;
     return '<div class="vq'+(fait?' fait':'')+'"><input type="checkbox" class="vtick" id="vq'+i+'" data-vok="'+i+'"'+(fait?' checked':'')+' aria-label="C\'est bon"><label for="vq'+i+'"><b>'+esc(x.q)+'</b>'+(x.r?'<span class="vchip'+(G[0]==='prix'?' z':'')+'">'+esc(x.r)+'</span>':'')+'</label>'+
      (li?'<button type="button" class="vmod2" '+(li.lg?'data-vlg="'+li.lg+'"':'data-vtabd="'+li.tab+'"')+'>Modifier</button>':'')+'</div>'}).join('')+
    (G[0]==='cli'&&(k.telephone||k.email)?'<details class="vmsg"><summary class="vbtn sm">Envoyer ces questions au client</summary><textarea id="vmsg-t" rows="7" aria-label="Message au client">'+esc(vmsgTexte(p))+'</textarea><div class="vbtns">'+
     (k.telephone?'<a class="vbtn sm" id="vmsg-sms" href="#" style="text-decoration:none">💬 Par SMS</a>':'')+(k.email?'<a class="vbtn sm" id="vmsg-mail" href="#" style="text-decoration:none">✉️ Par e-mail</a>':'')+'<button type="button" class="vbtn sm" id="vmsg-cp">Copier</button></div><p class="vst" style="padding:4px 0 0;font-size:12px">Le message s\'ouvre dans votre appli SMS ou e-mail : vous le relisez avant de l\'envoyer.</p></details>':'')+
   '</details>'}).join('')+'</div>'}
function vmsgTexte(p){var ok=lsG(vokCle(p))||[],k=COUR&&COUR.contact||{},art=lsG(KA)||{};
 var Q=(p.a_verifier||[]).map(vcourt).map(function(x,i){return [x,i]}).filter(function(z){return z[0].g==='cli'&&ok.indexOf(z[1])<0}).map(function(z){return '- '+z[0].q.replace(/^([^:]+) : (.+)$/,'$1 : $2')});
 return 'Bonjour'+(k.prenom?' '+k.prenom:'')+',\nPour finaliser votre devis, j\'ai besoin de quelques précisions :\n'+Q.join('\n')+'\nMerci !\n'+(art.prenom||'')+(art.entreprise?' · '+art.entreprise:'')}
function vverifMaj(){var p=COUR&&COUR.pre_devis&&COUR.pre_devis[0];if(!p)return;var ok=lsG(vokCle(p))||[];
 $$('#vov-b .vgrp').forEach(function(g){var I=$$('.vtick',g),r=I.filter(function(c){return !c.checked}).length,n=$('.vgn',g);n.textContent=r||'✓';n.classList.toggle('ok',!r)});
 $$('#vov-b .vtick').forEach(function(c){c.parentNode.classList.toggle('fait',c.checked)});
 var t=$('#vmsg-t');if(t&&!t._touche)t.value=vmsgTexte(p);
 var r=$$('#vov-b .vtick').filter(function(c){return !c.checked}).length;$$('#vov-b [data-vwzgo]').forEach(function(b){b.hidden=!r;b.textContent='▶ Vérifier un par un ('+r+')'})}
document.addEventListener('change',function(e){var c=e.target;if(!c||!c.hasAttribute||!c.hasAttribute('data-vok'))return;var p=COUR&&COUR.pre_devis&&COUR.pre_devis[0];if(!p)return;
 var ok=lsG(vokCle(p))||[],i=+c.getAttribute('data-vok');ok=ok.filter(function(x){return x!==i});if(c.checked)ok.push(i);lsS(vokCle(p),ok.length?ok:null);vverifMaj()});
document.addEventListener('input',function(e){if(e.target&&e.target.id==='vmsg-t')e.target._touche=true});
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('#vmsg-sms,#vmsg-mail,#vmsg-cp');if(!a)return;e.preventDefault();var t=$('#vmsg-t'),k=COUR&&COUR.contact||{},txt=t?t.value:'';
 if(a.id==='vmsg-cp'){var f=function(){t.select();try{document.execCommand('copy')}catch(x){}};if(navigator.clipboard)navigator.clipboard.writeText(txt).then(function(){a.textContent='Copié ✓'},f);else f();return}
 if(a.id==='vmsg-sms')location.href='sms:'+String(k.telephone||'').replace(/\s/g,'')+'?&body='+encodeURIComponent(txt);
 else location.href='mailto:'+(k.email||'')+'?subject='+encodeURIComponent('Votre demande de devis')+'&body='+encodeURIComponent(txt)});
function alerteFour(p){var M=manque(p);if(!M.length)return '';
 return '<div class="card valerte" role="alert"><b>⚠ Il manque le devis du fournisseur</b><span>Vous ne pouvez pas valider ce pré-devis avant d\'avoir ses prix. Dès que vous les avez, tapez-les ici : '+(M.length>1?M.length+' lignes':'une ligne')+'.</span>'+
  M.map(function(x){return '<div class="vli vedit"><span>'+esc(x[0].libelle)+'</span><span class="x">0,00 €</span><small>'+(x[0].quantite!=null?qte(x[0].quantite)+' '+esc(x[0].unite||'')+' · ':'')+'prix fournisseur pas encore reçu</small><button type="button" class="vmod" data-vlg="f|'+x[1]+'">Saisir le prix</button></div>'}).join('')+'</div>'}
var ONG=[['devis','Résumé','lig'],['mat','Matériaux','mat'],['mo','Main-d\'œuvre','mo'],['client','Client','cli'],['docs','Docs','doc']];
function recalcHTML(d){if(lsG(clePm()))return '<div class="card vsec vrc"><b>📐 Vous avez modifié le plan</b><p class="vst" style="padding:4px 0 10px">Le pré-devis n\'en tient pas encore compte.</p><button class="vbtn go" type="button" data-vrecalc style="width:100%">↻ Recalculer le pré-devis</button></div>';return ''}
/* « Plan » dans la barre du haut de la demande (Cyril 17/11) : ouvre le plan d'un appui.
   Pas de plan : bouton plus clair, avec une petite croix en haut à droite. */
function boutonPlan(a){return '<button type="button" class="vtab-plan'+(a?'':' vsans')+'" '+(a?'data-vplan':'data-vnoplan')+' aria-label="'+(a?'Voir le plan':'Pas de plan dessiné')+'">'+ICPLAN+'<span>Plan</span>'+(a?'':'<i class="vx" aria-hidden="true">×</i>')+'</button>'}
var ICPLAN='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v16H4z"/><path d="M4 12h7v8M11 4v5M15 12h5"/></svg>';
(function(){var s=document.createElement('style');s.textContent='html body .cf .dv-seg button.vtab-plan.vsans{opacity:.5;box-shadow:none}html body .cf .dv-seg button.vtab-plan .vx{position:absolute;top:3px;right:calc(50% - 24px);width:17px;height:17px;min-width:0;padding:0;border-radius:50%;background:var(--muted,#8A90A0);color:#fff;font:700 13px/17px var(--f,inherit);text-align:center}';document.head.appendChild(s)})();
function afficher(d){MODE='pre';if(COUR!==d)VTAB='devis';COUR=d;var k=d.contact,p=d.pre_devis[0],o=d.opportunites[0],P=d.demande&&d.demande.details&&d.demande.details.plan,aPlan=P&&(P.floors||[]).some(function(f){return (f.pieces||[]).length});if(!aPlan){var pm0=lsG(clePm());aPlan=!!(pm0&&pm0.plan&&(pm0.plan.floors||[]).some(function(f){return (f.pieces||[]).length}))}
 var plan=aPlan?'<button class="vbtn" type="button" data-vplan style="width:100%">📐 '+(d.demande.plan_corrige_le?'Voir le plan (retouché par vous)':'Voir le plan dessiné par le client')+'</button>':'';
 /* Le client : ses coordonnées, ses réponses, ses photos, son plan */
 var cl='<div class="card"><div class="vkv">'+(k.telephone?'<span>Téléphone</span><b><a href="tel:'+esc(k.telephone)+'">'+esc(k.telephone)+'</a></b>':'')+(k.email?'<span>E-mail</span><b style="word-break:break-all"><a href="mailto:'+esc(k.email)+'">'+esc(k.email)+'</a></b>':'')+
  '<span>Commune</span><b>'+esc([k.cp,k.ville].filter(Boolean).join(' ')||'non renseignée')+'</b><span>Reçue</span><b>'+esc(quand(k.cree_le)||'—')+'</b>'+(o?'<span>Où on en est</span><b>'+esc(o.etape)+'</b>':'')+'</div>'+
  '<div class="vbtns" style="margin-top:10px">'+(k.telephone?'<a class="vbtn sm" href="tel:'+esc(k.telephone)+'" style="text-decoration:none">📞 Appeler</a><a class="vbtn sm" href="sms:'+esc(k.telephone)+'" style="text-decoration:none">💬 SMS</a>':'')+(k.email?'<a class="vbtn sm" href="mailto:'+esc(k.email)+'" style="text-decoration:none">✉️ E-mail</a>':'')+(k.ville||k.cp?'<button type="button" class="vbtn sm" data-gps="'+esc([k.adresse,k.cp,k.ville].filter(Boolean).join(' '))+'">🧭 Itinéraire</button>':'')+'</div></div>'+
  demandeHTML(d.demande);
 /* Le devis : l'alerte fournisseur, le total, les deux parties modifiables */
 var dv='',calc='',mat='',mo='';
 if(!p){ED=null;dv='<div class="card"><b>Pas encore de pré-devis Cliky</b><p class="vst" style="padding:4px 0 0">Si la demande vient d\'arriver, patientez une minute : il s\'affiche tout seul.</p></div>';}
 else if(!p.lue){ED=null;dv='<div class="card vsec"><h3>Pré-devis Cliky · '+esc(quand(p.le))+'</h3><p class="vst" style="padding:0 0 8px">Ancienne présentation : affichée telle quelle.</p><pre class="vpre">'+esc(p.texte)+'</pre></div>';}
 else{ED=edition(p);var t=totauxEd(p);
  dv=alerteFour(p)+'<div class="card vsec vtotc">'+(window.PCTAG?PCTAG('cliky','a préparé ce pré-devis'):'')+'<div class="vtot1"><span>Total HT'+(ED.touche?' · <span class="vp t">retouché par vous</span>':'')+'</span><b>'+eur(t.total_ht)+'</b></div>'+(p.resume?'<p class="vst" style="padding:4px 0 0">'+esc(p.resume)+'</p>':'')+controleHTML(p)+
   '<details class="vd vcomm"'+(lsG('pc-calc-ferme')?'':' open')+'><summary>Comment ce total est fait<span class="vred"></span></summary><div class="vtot" style="margin-top:8px"><span>Matériaux (achat)</span><b>'+eur(t.materiaux)+'</b><span>'+esc((p.totaux||{}).marge_libelle||'Marge')+'</span><b>'+eur(t.marge)+'</b><span>Main-d\'œuvre</span><b>'+eur(t.main_oeuvre)+'</b><span>Déplacement</span><b>'+eur(t.deplacement)+'</b><span>'+esc((p.totaux||{}).frais_generaux_libelle||'Frais généraux')+'</span><b>'+eur(t.frais_generaux)+'</b></div><p class="vst" style="padding:6px 0 0">TVA non comprise : c\'est vous qui la fixez.</p></details></div>'+
   cadHTML(p)+recalcHTML(d)+verifHTML(p)+'<div id="vsuivi"></div>'+
   (ED.touche?'<p class="vst" style="padding:0">Vos retouches restent sur cet appareil jusqu\'à la création du devis. <a href="#" data-vlg="raz">Revenir au calcul de Cliky</a></p>':'')+plan;
  var raz=ED.touche?'<p class="vst" style="padding:0">Vos retouches restent sur cet appareil jusqu\'à la création du devis. <a href="#" data-vlg="raz">Revenir au calcul de Cliky</a></p>':'';
  mat=listeMatHTML(p)+lignesEd('materiaux','Matériaux · '+eur(t.materiaux),'prix d\'achat HT · touchez « Modifier » pour changer une ligne','Ajouter un matériau')+raz;
  mo=lignesEd('main_oeuvre','Main-d\'œuvre · '+eur(t.main_oeuvre),'touchez « Modifier » pour changer une ligne','Ajouter de la main-d\'œuvre')+raz;
  calc=liste('Alertes',p.alertes)+liste('Hypothèses de Cliky',p.hypotheses)+(p.controles.length?'<div class="card vsec"><h3>Contrôles du calcul</h3><ul class="vul">'+p.controles.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ul></div>':'');
 }
 if(d.pre_devis.length>1)calc+='<details class="card vd"><summary>'+(d.pre_devis.length-1)+' pré-devis plus ancien'+(d.pre_devis.length>2?'s':'')+'</summary>'+d.pre_devis.slice(1).map(function(x){return '<p class="vst">'+esc(quand(x.le))+(x.totaux&&x.totaux.total_ht!=null?' · '+eur(x.totaux.total_ht)+' HT':'')+'</p><pre class="vpre">'+esc(x.texte)+'</pre>'}).join('')+'</details>';
 if(p&&p.lue)calc+='<p class="vst vrc"><a href="#" data-vrecalc>↻ Recalculer avec vos prix à jour</a> · sans frais</p>';
 if(calc)dv+='<details class="card vd"><summary>Le détail du calcul de Cliky</summary>'+calc+'</details>';
 var Z={devis:dv,mat:mat,mo:mo,client:cl,docs:'<div class="card vsec" id="vdocs"><h3>Devis et factures</h3><p class="vst" style="padding:0">Chargement…</p></div>'};
 var O=ONG.filter(function(x){return Z[x[0]]});if(!Z[VTAB])VTAB='devis';
 var h='<div class="cf vmenu"><div class="seg cf-seg dv-seg" role="tablist" aria-label="La demande" style="grid-template-columns:repeat('+(O.length+1)+',minmax(0,1fr))">'+O.map(function(x){var n=x[0]==='devis'?manque(p).length:0;return '<button role="tab" type="button" data-vtabd="'+x[0]+'" aria-selected="'+(VTAB===x[0])+'">'+ICS[x[2]]+'<span>'+x[1]+'</span>'+(n?'<i class="r">'+n+'</i>':'')+'</button>'+(x[0]==='client'?boutonPlan(aPlan):'')}).join('')+(O.some(function(x){return x[0]==='client'})?'':boutonPlan(aPlan))+'</div></div>'+
  O.map(function(x){return '<div class="vpan" data-vpan="'+x[0]+'"'+(VTAB===x[0]?'':' hidden')+'>'+Z[x[0]]+'</div>'}).join('')+
  '<p class="vst" style="font-size:12.5px">Rien n\'est envoyé au client sans votre confirmation. Les montants viennent de votre base de prix.</p>';
 ouvrir(esc(k.nom)+'<small>'+esc([o&&o.titre,k.ville].filter(Boolean).join(' · '))+'</small>',h,'<button class="vbtn" type="button" data-vfermer>Fermer</button>');
 if(DOCC===k.id&&DOCS)rendreDocs();else chargerDocs(k.id);
 try{document.dispatchEvent(new CustomEvent('pcv-afficher',{detail:{d:d,p:p&&p.lue?p:null,t:p&&p.lue?totauxEd(p):null,etape:o&&o.etape||''}}))}catch(e){}}
function onglet(t){VTAB=t;$$('#vov-b [data-vtabd]').forEach(function(b){b.setAttribute('aria-selected',String(b.getAttribute('data-vtabd')===t))});$$('#vov-b [data-vpan]').forEach(function(z){z.hidden=z.getAttribute('data-vpan')!==t});$('#vov-b').scrollTop=0}

/* ---------- ajouter ou modifier une ligne : le libellé propose votre base (les plus utilisés d'abord) ---------- */
function base(){var B=[];try{B=(window.PCX&&window.PCX.base&&window.PCX.base())||[]}catch(e){}return B}
function usage(){return lsG('pc-base-usage')||{}}
function suggestions(q,cle){var U=usage(),B=base().filter(function(b){return b&&b.d}).map(function(b){return {d:b.d,u:b.u,p:cle==='materiaux'&&b.ach?b.ach:b.p,t:b.f||b.t,i:b.i,n:U[b.d.toLowerCase()]||0}});
 /* les lignes déjà vues dans ce pré-devis comptent aussi : l'artisan retrouve ce qu'il vient de taper */
 if(T())T()[cle==='materiaux'?'materiaux':'main_oeuvre'].forEach(function(l){if(!B.some(function(b){return b.d.toLowerCase()===l.libelle.toLowerCase()}))B.push({d:l.libelle,u:l.unite,p:l.pu,t:'Dans ce pré-devis',n:U[l.libelle.toLowerCase()]||0})});
 q=(q||'').trim().toLowerCase();var m=function(b){return !q||(b.d+' '+(b.t||'')).toLowerCase().indexOf(q)>=0};
 var R=B.filter(m).sort(function(a,b){return b.n-a.n});
 /* puis la base de Cliky (prix de son fournisseur, ou le sien s'il l'a changé dans Produits) */
 if(q.length>1&&window.PCPROD&&PCPROD.cliky){var k=cle==='materiaux'?'produit':'prestation';
  (PCPROD.cliky()||[]).forEach(function(a){if(a.k===k&&R.length<12&&!R.some(function(b){return b.d.toLowerCase()===a.d.toLowerCase()})){var b={d:a.d,u:PCPROD.parCond(a),p:a.pc,t:'Base Cliky · '+a.cond,n:0};if(m(b)||(a.c+' '+a.f).toLowerCase().indexOf(q)>=0)R.push(b)}})}
 return R.slice(0,q?8:5)}
function sugHTML(cle){var L=suggestions(($('#vl-l')||{}).value,cle),q=(($('#vl-l')||{}).value||'').trim();
 return (L.length?'<small class="vsug-t">'+(q?'Dans votre base':'Les plus utilisés')+'</small>'+L.map(function(b,i){return '<button type="button" class="vsug-i" data-vsug="'+i+'">'+((window.PCPROD&&window.PCPROD.icone&&b.i&&window.PCPROD.icone(b.i))||'')+'<span>'+esc(b.d)+'<small>'+esc(b.t||'')+(b.n?' · utilisé '+b.n+' fois':'')+'</small></span><b>'+eur(b.p)+' / '+esc(b.u||'u')+'</b></button>'}).join(''):'<small class="vsug-t">Rien de tel dans votre base.</small>')+
  '<button type="button" class="vbtn sm vsug-new" data-vsugnew>＋ Créer « '+(q?esc(q.length>40?q.slice(0,40)+'…':q):'un produit')+' » dans mes produits</button>'}
var SUG=[],NOUVP=false;
function majSug(cle){var z=$('#vl-sug');if(!z)return;SUG=suggestions(($('#vl-l')||{}).value,cle);z.innerHTML=sugHTML(cle)}
function ligneV(ref){var p=MODE==='nd'?{attente:[]}:COUR&&COUR.pre_devis[0];if(MODE!=='nd'&&(!p||!ED))return;
 if(ref==='raz'){lsS(cleLg(),null);toastV('Calcul de Cliky remis','Vos retouches sont effacées.');return retour()}
 var fo=/^f\|/.test(ref)?+ref.slice(2):null,nv=ref.charAt(0)==='+'||fo!=null,c,i,l;NOUVP=false;
 if(fo!=null){var a=p.attente[fo];if(!a)return;c='materiaux';i=-1;l={libelle:a.libelle,quantite:a.quantite!=null?a.quantite:1,unite:a.unite||'u',pu:0}}
 else if(nv){c=ref.slice(1)==='materiaux'?'materiaux':'main_oeuvre';i=-1;l={libelle:'',quantite:1,unite:'u',pu:0}}
 else{c=ref.split('|')[0];i=+ref.split('|')[1];l=T()[c][i]}
 if(!l)return;
 var h='<div class="card vform">'+(fo!=null?'<p class="vst" style="padding:0">Recopiez le prix d\'achat HT écrit sur le devis du fournisseur.</p>':'')+
  '<label>'+(c==='materiaux'?'Le matériau':'Ce qui est fait')+'<textarea id="vl-l" rows="2" autocomplete="off" placeholder="'+(c==='materiaux'?'Tapez : ba13, rail, laine…':'Tapez : pose, cloison, joints…')+'">'+esc(l.libelle)+'</textarea></label>'+
  (fo!=null?'':'<div class="vsug" id="vl-sug"></div>')+
  '<div class="vrow"><label>Quantité<input id="vl-q" inputmode="decimal" value="'+qte(l.quantite)+'"></label><label>Unité<input id="vl-u" value="'+esc(l.unite||'')+'"></label></div>'+
  '<label>Prix unitaire HT'+(c==='materiaux'?' (achat)':MODE==='nd'?' (vente)':'')+'<input id="vl-p" inputmode="decimal" value="'+(l.pu?String(Math.round(l.pu*10000)/10000).replace('.',','):'')+'" placeholder="0,00"></label>'+
  '<p class="vst" style="padding:0">Total de la ligne : <b id="vl-t">'+eur((+l.quantite||0)*(+l.pu||0))+'</b>. La marge et les frais généraux s\'ajoutent comme dans le calcul de Cliky.</p></div>';
 var r=fo!=null?'f|'+fo:nv?'+'+c:c+'|'+i;
 ouvrir((MODE==='nd'&&nv?'Ajouter une ligne':fo!=null?'Prix du fournisseur':nv?(c==='materiaux'?'Ajouter un matériau':'Ajouter de la main-d\'œuvre'):'Modifier la ligne')+'<small>'+esc(MODE==='nd'?'Nouveau devis':k0())+'</small>',h,'<button class="vbtn" type="button" data-vretour>‹ Retour</button>'+(nv?'':'<button class="vbtn" type="button" data-vlsup="'+c+'|'+i+'">Enlever</button>')+'<button class="vbtn go" type="button" data-vlok="'+r+'">Enregistrer</button>');
 ['#vl-q','#vl-p'].forEach(function(s){$(s).addEventListener('input',function(){$('#vl-t').textContent=eur(nb($('#vl-q').value)*nb($('#vl-p').value))})});
 if(fo==null){$('#vl-l').addEventListener('input',function(){majSug(c)});majSug(c)}
 if(fo!=null)setTimeout(function(){try{$('#vl-p').focus()}catch(e){}},200);}
function choisirSug(i){var b=SUG[i];if(!b)return;$('#vl-l').value=b.d;$('#vl-u').value=b.u||'u';if(b.p)$('#vl-p').value=String(b.p).replace('.',',');$('#vl-t').textContent=eur(nb($('#vl-q').value)*nb($('#vl-p').value));var z=$('#vl-sug');if(z)z.innerHTML='<small class="vsug-t">✓ Repris de votre base : vérifiez la quantité et le prix.</small>'}
function k0(){return COUR&&COUR.contact?COUR.contact.nom:''}
function nb(s){var n=parseFloat(String(s||'').replace(/\s/g,'').replace(',','.'));return isFinite(n)?n:0}
function ligneVok(ref){var lib=$('#vl-l').value.trim(),q=nb($('#vl-q').value),pu=nb($('#vl-p').value);
 if(!lib){toastV('Il manque la description','Une ligne suffit.');return $('#vl-l').focus()}
 if(!(q>0)||!(pu>0)){toastV('Il manque la quantité ou le prix','Hors taxes, en euros.');return}
 var l={libelle:lib,quantite:q,unite:$('#vl-u').value.trim(),pu:pu,total:Math.round(q*pu*100)/100};
 if(/^f\|/.test(ref)){var fo=+ref.slice(2);l.four=fo;ED.four[fo]=1;ED.materiaux.push(l)}
 else if(ref.charAt(0)==='+')T()[ref.slice(1)==='materiaux'?'materiaux':'main_oeuvre'].push(l);
 else{var c=ref.split('|')[0],i=+ref.split('|')[1],av=T()[c][i];if(av&&av.four!=null)l.four=av.four;T()[c][i]=l}
 var U=usage(),kk=lib.toLowerCase();U[kk]=(U[kk]||0)+1;lsS('pc-base-usage',U);
 if(NOUVP)try{var np={d:lib,u:l.unite||'u',p:pu,t:'Ajouté par vous',k:c==='materiaux'?'produit':'prestation'};if(c==='materiaux')np.ach=pu;if(window.PCPROD&&window.PCPROD.ajouter)window.PCPROD.ajouter(np);else if(window.PCX&&window.PCX.ajoutBase)window.PCX.ajoutBase(np)}catch(e){}
 if(MODE!=='nd')garderEd();var m=MODE==='nd'?0:manque().length;retour();
 toastV(/^f\|/.test(ref)?(m?'Prix reçu, il en manque '+m:'Tous les prix du fournisseur sont là'):ref.charAt(0)==='+'?'Ligne ajoutée':'Ligne modifiée',/^f\|/.test(ref)&&!m?'Vous pouvez valider le pré-devis.':lib+(NOUVP?' · rangé dans vos produits':''));
 /* « Je retiens ? » (suivi.js) : un prix changé à la main peut devenir le prix de la base */
 if(av&&MODE!=='nd')try{document.dispatchEvent(new CustomEvent('pcv-ligne',{detail:{avant:av,apres:l,cle:c}}))}catch(e){}}
function ligneVsup(b){if(!b.classList.contains('arme')){b.classList.add('arme');b.textContent='Oui, l\'enlever';return}
 var r=b.getAttribute('data-vlsup').split('|'),x=T()[r[0]].splice(+r[1],1)[0];if(x&&x.four!=null)delete ED.four[x.four];if(MODE!=='nd')garderEd();retour();toastV('Ligne enlevée',x&&x.libelle)}
/* ---------- créer un devis directement (sans pré-devis) : le client, les lignes au prix de vente, un gros bouton en deux appuis ---------- */
function clientsListe(){var L=(LISTE&&LISTE.demandes)||[],vu={};var R=L.filter(function(d){if(!d.contact||vu[d.contact])return false;vu[d.contact]=1;return true}).map(function(d){return {id:d.contact,n:d.client,t:d.resume||d.titre||''}});
 /* + les clients créés dans l'Espace ou venus de VosFactures (Cyril 17/11 : tout doit être raccordé) */
 try{var X=window.PCX,V=X&&X.cf&&X.cf.vrais?X.cf.vrais():[];V.forEach(function(c){if(c.contact&&!vu[c.contact]){vu[c.contact]=1;R.push({id:c.contact,n:c.nom||'Client',t:c.demande||''})}})}catch(e){}
 return R.sort(function(a,b){return String(a.n).localeCompare(String(b.n),'fr')})}
function nouveauDevis(k,t){MODE='nd';ND={contact:typeof k==='string'?k:'',titre:typeof t==='string'?t.slice(0,120):'',materiaux:[],main_oeuvre:[],arme:0};var C=clientsListe();if(!ND.contact&&C.length===1)ND.contact=C[0].id;rendreND()}
function rendreND(){MODE='nd';var C=clientsListe(),t=ND.main_oeuvre.reduce(function(a,l){return a+(+l.total||0)},0);
 var h='<div class="card vform"><label>Pour quel client<select id="vnd-c"><option value="">Choisissez…</option>'+C.map(function(c){return '<option value="'+esc(c.id)+'"'+(c.id===ND.contact?' selected':'')+'>'+esc(c.n)+'</option>'}).join('')+'</select></label>'+
  '<p class="vst" style="padding:0">Le client n\'est pas dans la liste ? Ajoutez-le d\'abord dans Clients.</p>'+
  '<label>Les travaux, en une ligne<input id="vnd-t" autocomplete="off" value="'+esc(ND.titre)+'" placeholder="Ex. : cloison du bureau"></label></div>'+
  '<div class="card vsec vtotc"><div class="vtot1"><span>Total HT</span><b>'+eur(Math.round(t*100)/100)+'</b></div><p class="vst" style="padding:4px 0 0">La TVA s\'ajoute dans le devis, à votre taux habituel.</p></div>'+
  '<div class="card vsec vpart"><div class="vpart-h"><h3>Les lignes</h3><small>prix de vente HT · touchez « Modifier » pour changer une ligne</small></div>'+(ND.main_oeuvre.length?ND.main_oeuvre.map(function(l,i){return '<div class="vli vedit"><span>'+esc(l.libelle)+'</span><span class="x">'+eur(l.total)+'</span><small>'+qte(l.quantite)+' '+esc(l.unite)+' × '+eur(l.pu,4)+'</small><button type="button" class="vmod" data-vlg="main_oeuvre|'+i+'">Modifier</button></div>'}).join(''):'<p class="vst">Pas encore de ligne : ajoutez la première, votre base vous propose vos produits.</p>')+
  '<button class="vbtn vadd" type="button" data-vlg="+main_oeuvre">＋ Ajouter une ligne</button></div>'+
  '<p class="vst" style="font-size:12.5px">Le devis est créé dans vos documents. Il ne part pas chez le client tant que vous ne l\'envoyez pas.</p>';
 ouvrir('Nouveau devis<small>Fait par vous, sans pré-devis</small>',h,'<button class="vbtn" type="button" '+(ND.arme?'data-vnd>Annuler':'data-vfermer>Fermer')+'</button><button class="vbtn go'+(ND.arme?' varm':'')+'" type="button" data-vndok>'+(ND.arme?'Oui, créer le devis':'Créer le devis')+'</button>');
 var sc=$('#vnd-c'),ti=$('#vnd-t');sc.addEventListener('change',function(){ND.contact=sc.value});ti.addEventListener('input',function(){ND.titre=ti.value})}
function ndOk(b){if(!ND)return;if(!ND.contact){toastV('Pour qui ?','Choisissez le client.');return}
 if(!ND.main_oeuvre.length){toastV('Il manque les lignes','Ajoutez au moins une ligne.');return}
 if(!ND.arme){ND.arme=1;rendreND();return}
 b.disabled=true;b.textContent='En cours…';var c2=ND.contact,nom=(clientsListe().filter(function(x){return x.id===c2})[0]||{}).n||'';
 api('/espace/devis',{method:'POST',body:{contact:c2,main:true,titre:ND.titre,lignes:{materiaux:[],main_oeuvre:ND.main_oeuvre.map(function(l){return {libelle:l.libelle,quantite:l.quantite,unite:l.unite,total:l.total}})}}}).then(function(x){
  ND=null;MODE='pre';fermer();toastV('Devis'+(x.devis&&x.devis.numero?' n° '+x.devis.numero:'')+' créé',nom+' · il vous attend dans ses documents, envoyez-le quand vous voulez.');VSEG='val';charger();chargerFa()},
  function(err){ND.arme=0;rendreND();toastV('Pas fait',err.message)})}
/* L'étape suit les validations : on range la demande dans l'étape qui porte le bon nom, si elle existe */
var AVANCE={creer:/devis.*(cr[ée]|pr[eê]t|à envoyer)/i,envoyer:/devis.*envoy/i,accepted:/(accept|gagn|sign)/i,rejected:/(refus|perdu)/i,paid:/(pay|termin)/i,acompte:/chantier/i};
function avancer(a){var d=COUR,o=d&&d.opportunites[0],re=AVANCE[a];if(!o||!re)return;var e=(d.etapes||ETAPES).filter(function(x){return re.test(x.nom)})[0];if(!e||e.id===o.etape_id)return;
 api('/espace/etape',{method:'POST',body:{opportunite:o.opportunite,etape:e.id}}).then(function(){o.etape=e.nom;o.etape_id=e.id;charger()},function(){})}
function etapes(){var d=COUR,o=d&&d.opportunites[0];if(!o)return;var L=d.etapes||ETAPES,i=L.findIndex(function(e){return e.id===o.etape_id});
 var h='<div class="card"><p style="margin:0 0 10px">La demande de <b>'+esc(d.contact.nom)+'</b> est à l\'étape <b>'+esc(o.etape||'—')+'</b>. Choisissez où la ranger :</p><div class="vl">'+
  L.map(function(e,j){var tag=e.id===o.etape_id?'actuelle':j===i+1?'suivante':'';return '<button class="vcard'+(j===i+1?' vav':'')+'" type="button" data-vset="'+esc(e.id)+'"'+(e.id===o.etape_id?' disabled':'')+'><div class="r"><b>'+esc(e.nom)+'</b><span class="vp'+(j===i+1?' t':'')+'"'+(tag?'':' hidden')+'>'+tag+'</span></div>'+(/envoy/i.test(e.nom)?'<small>⚠ Les relances automatiques au client partent de cette étape (e-mail après 3 jours).</small>':'')+'</button>'}).join('')+
  '</div></div><p class="vst">Le changement se voit tout de suite dans GHL et une ligne est ajoutée à la fiche du client. Vous pourrez revenir en arrière.</p>';
 ouvrir('Changer d\'étape<small>'+esc(d.contact.nom)+'</small>',h,'<button class="vbtn" type="button" data-vretour>‹ Retour</button>');}
function changer(id){var d=COUR,o=d&&d.opportunites[0],e=(d.etapes||ETAPES).filter(function(x){return x.id===id})[0];if(!o||!e)return;
 var b=document.querySelector('[data-vset="'+id+'"]');var bp=b&&b.querySelector('.vp');if(b){b.disabled=true;bp.hidden=false;bp.textContent='en cours…'}
 api('/espace/etape',{method:'POST',body:{opportunite:o.opportunite,etape:id}}).then(function(){o.etape=e.nom;o.etape_id=e.id;afficher(d);charger();toastV('Rangée dans « '+e.nom+' »',d.contact.nom)},function(err){if(b){b.disabled=false;bp.textContent='erreur'}toastV('Étape non changée',err.message)})}
function toastV(t,s){var tt=$('#tt'),ts=$('#ts'),to=$('#toast');if(!to)return;tt.textContent=t;ts.textContent=s||'';to.classList.add('on');clearTimeout(toastV.t);toastV.t=setTimeout(function(){to.classList.remove('on')},3400)}

/* ---------- devis et factures (VosFactures en coulisses, routes /espace/documents… du service) ---------- */
// Un seul gros bouton : l'étape suivante. Rien ne part chez le client sans une confirmation de l'artisan.
function pctDef(){var v=lsG('pc-acompte');return v!=null&&v>=0&&v<100?v:30}
var TYP={devis:'Devis',facture:'Facture',acompte:'Facture d\'acompte',solde:'Facture finale',avoir:'Avoir'},DOCS=null,DOCC=null,ARME='',ERRDOC='';
function pillDoc(d){var c=d.statut==='paid'||d.statut==='accepted'?'t':d.statut==='rejected'||d.statut==='issued'?'w':'';return '<span class="vp '+c+'">'+esc(d.statut_libelle||d.statut)+'</span>'}
function jourDoc(s){var m=/^(\d{4})-(\d\d)-(\d\d)/.exec(s||'');return m?m[3]+'/'+m[2]+'/'+m[1]:''}
function ligneDoc(d){return '<div class="vli"><span>'+esc(TYP[d.type]||d.type)+' n° '+esc(d.numero)+'</span><span class="x">'+eur(d.ht)+' HT</span><small>'+esc(jourDoc(d.date))+' · '+pillDoc(d)+' · <a href="#" style="color:inherit;font-weight:800" data-vdoc="pdf" data-id="'+d.id+'">📄 Voir le PDF</a></small></div>'}
function suite(L,pre){var dv=L.filter(function(d){return d.type==='devis'&&d.statut!=='rejected'})[0],F=L.filter(function(d){return d.type!=='devis'&&d.type!=='avoir'});
 var aEnv=F.filter(function(d){return d.statut==='issued'})[0],aPay=F.filter(function(d){return d.statut==='sent'||d.statut==='partial'})[0],solde=F.filter(function(d){return d.type==='solde'||d.type==='facture'})[0],ac=F.filter(function(d){return d.type==='acompte'})[0];
 if(!dv)return pre?{t:'Valider le pré-devis et créer le devis',a:'creer',s:'Le devis est créé dans vos documents. Il ne part pas chez le client tant que vous ne l\'envoyez pas.'}:null;
 if(dv.statut==='issued')return {t:'Envoyer le devis n° '+dv.numero+' au client',a:'envoyer',id:dv.id,s:'Vérifiez le PDF avant : le client le reçoit par e-mail.'};
 if(dv.statut==='sent')return {t:'Le client a accepté le devis',a:'accepted',id:dv.id,b:{t:'Refusé',a:'rejected',id:dv.id}};
 if(aEnv)return {t:'Envoyer la '+(TYP[aEnv.type]||'facture').toLowerCase()+' n° '+aEnv.numero,a:'envoyer',id:aEnv.id,s:'Vérifiez le PDF avant : le client la reçoit par e-mail.'};
 if(dv.statut==='accepted'&&!solde)return ac?{t:'Fin de chantier : créer la facture finale',a:'finale',id:dv.id,s:'L\'acompte déjà facturé est déduit tout seul.'}:{t:'Créer la facture d\'acompte',a:'acompte',id:dv.id,b:{t:'Pas d\'acompte : facture finale',a:'finale',id:dv.id}};
 if(aPay)return {t:'Facture n° '+aPay.numero+' payée',a:'paid',id:aPay.id};
 return null}
// Miniature de la 1re page du vrai PDF (pdf.js chargé à la demande) : le devis saute aux yeux, un appui l'ouvre en grand.
var PDFJS='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/',MINI={},pdfjsP=null;
function chargerPdfjs(){if(window.pdfjsLib)return Promise.resolve(window.pdfjsLib);if(pdfjsP)return pdfjsP;
 pdfjsP=new Promise(function(ok,ko){var s=document.createElement('script');s.crossOrigin='anonymous';s.src=PDFJS+'pdf.min.js';s.onload=function(){if(!window.pdfjsLib)return ko(new Error('pdf.js'));window.pdfjsLib.GlobalWorkerOptions.workerSrc=PDFJS+'pdf.worker.min.js';ok(window.pdfjsLib)};s.onerror=function(){pdfjsP=null;ko(new Error('pdf.js'))};document.head.appendChild(s)});return pdfjsP}
function miniature(id){if(MINI[id])return MINI[id];var j=lsG(KJ);
 MINI[id]=fetch(SERVICE+'/espace/document/pdf?id='+encodeURIComponent(id),{headers:j?{Authorization:'Bearer '+j}:{}}).then(function(r){if(!r.ok)throw new Error(r.status);return r.arrayBuffer()})
  .then(function(buf){return chargerPdfjs().then(function(L){return L.getDocument({data:buf}).promise})}).then(function(doc){return doc.getPage(1)})
  .then(function(pg){var v=pg.getViewport({scale:1}),k=Math.min(3,(window.devicePixelRatio||1))*320/v.width,vv=pg.getViewport({scale:k}),c=document.createElement('canvas');c.width=vv.width;c.height=vv.height;
   return pg.render({canvasContext:c.getContext('2d'),viewport:vv}).promise.then(function(){return c.toDataURL('image/jpeg',.82)})})
  .catch(function(e){delete MINI[id];throw e});return MINI[id]}
function poserMinis(){$$('#vdocs [data-vmini]').forEach(function(b){var id=b.getAttribute('data-id');miniature(id).then(function(u){var i=b.querySelector('img');if(i){i.src=u;b.classList.add('pret')}},function(){b.classList.add('rate')})})}
function blocMinis(L){L=L.slice(0,4);if(!L.length)return '';return '<div class="vminis">'+L.map(function(d){return '<button type="button" class="vmini" data-vmini data-vdoc="pdf" data-id="'+d.id+'"><span class="vmp"><img alt=""><i>Aperçu…</i></span><b>'+esc(TYP[d.type]||d.type)+' n° '+esc(d.numero)+'</b><small>'+eur(d.ht)+' HT · toucher pour ouvrir</small></button>'}).join('')+'</div>'}
function rendreDocs(){var z=$('#vdocs');if(!z||!DOCS)return;var p=COUR&&COUR.pre_devis[0],n=suite(DOCS,p&&p.lue),h='<h3>Devis et factures</h3>';
 if(DOCS.some(function(d){return d.type==='devis'&&d.statut!=='rejected'})){$$('#vov-b [data-vlg],#vov-b .vrc').forEach(function(b){b.remove()});$$('#vov-b .vedit').forEach(function(b){b.classList.add('fige')});$$('#vov-b .vpart-h small').forEach(function(x){x.textContent='Le devis est créé : ces lignes ne se changent plus ici.'});var rt=$('#vov-b .vp.t');if(rt)rt.textContent='devis créé'}
 if(!n){var f0=$('#vov-f');if(f0)f0.innerHTML='<button class="vbtn" type="button" data-vfermer>Fermer</button>'}
 var M=n&&n.a==='creer'?manque(p):[];
 if(M.length){var fz=$('#vov-f');if(fz){fz.innerHTML='<button class="vbtn" type="button" data-vfermer>Fermer</button><button class="vbtn go" type="button" disabled>⏳ En attente du devis fournisseur</button>';fz.hidden=false}
  h+='<p class="vst" style="padding:8px 10px;margin:0 0 8px;border-radius:10px;background:var(--warn-bg);color:var(--warn)"><b>Pas encore validable :</b> il manque le prix du fournisseur pour '+M.map(function(x){return esc(x[0].libelle)}).join(', ')+'. Tapez-le dans « Le devis ».</p>';n=null}
 if(n){var arm=ARME===n.a+(n.id||'');
  var C={creer:['Valider le pré-devis','Oui, créer le devis'],envoyer:['Envoyer au client','Oui, envoyer'],accepted:['Le client a accepté','Oui, accepté'],acompte:['Créer l\'acompte','Créer l\'acompte'],finale:['Créer la facture finale','Oui, la créer'],paid:['Marquer payée','Oui, payée']}[n.a]||[n.t,'Oui, '+n.t.charAt(0).toLowerCase()+n.t.slice(1)];
  var f=$('#vov-f');if(f){f.innerHTML='<button class="vbtn" type="button" '+(arm?'data-vdoc="annuler">Annuler':'data-vfermer>Fermer')+'</button><button class="vbtn go'+(arm?' varm':'')+'" type="button" data-vdoc="'+n.a+'" data-id="'+(n.id||'')+'">'+esc(arm?C[1]:C[0])+'</button>';f.hidden=false}
  if(ERRDOC)h+='<p class="vst" style="padding:8px 10px;margin:0 0 8px;border-radius:10px;background:var(--warn-bg);color:var(--warn)"><b>Pas fait :</b> '+esc(ERRDOC)+'</p>';
  if(n.a==='creer')h+=blocAj(p);
  if(!arm&&n.a!=='creer')h+='<p style="margin:0 0 6px;font-weight:700">'+esc(n.t)+'</p>';
  if(arm)h+='<p class="vst" style="padding:0 0 6px"><b>Touchez encore le bouton du bas pour confirmer'+(n.a==='envoyer'?' l\'envoi au client':'')+'.</b></p>';
  else if(n.s)h+='<p class="vst" style="padding:0 0 6px">'+esc(n.s)+'</p>';
  if(n.b)h+='<button class="vbtn sm" type="button" style="margin-bottom:8px" data-vdoc="'+n.b.a+'" data-id="'+n.b.id+'">'+esc(n.b.t)+'</button>';
  var champ='<div class="vli" style="align-items:center"><span>Acompte demandé<small style="display:block">0 = pas d\'acompte</small></span><span class="x"><input id="vpct" type="number" inputmode="decimal" min="0" max="99" value="'+pctDef()+'" style="width:70px;font:inherit;padding:6px;border-radius:8px;border:1px solid var(--line)"> %</span></div>';
  if(arm&&n.a==='accepted')h+=champ+'<p class="vst" style="padding:0 0 6px">La facture d\'acompte se crée toute seule. Elle ne part pas sans vous.</p>';
  if(ARME==='acompte'+n.id)h+=champ+'<button class="vbtn go sm" type="button" data-vdoc="acompte-ok" data-id="'+n.id+'">Créer l\'acompte</button>';
 }
 h+=blocMinis(DOCS);
 h+=DOCS.length?DOCS.map(ligneDoc).join(''):'<p class="vst" style="padding:0">Aucun devis ni facture pour ce client.</p>';
 z.innerHTML=h;poserMinis();
 var ax=$('#vajx');if(ax)ax.onchange=function(){var v=parseFloat(String(ax.value||'0').replace(',','.').replace('−','-'));if(!isFinite(v))v=0;if(v<-50||v>50){toastV('Entre −50 % et +50 %','');return}garderAj(Math.round(v*10)/10);rendreDocs()}}
/* Prix pour ce client (BRS, 16/11) : un client fidèle n'a pas le prix d'un client « lambda ». Choisi à la fin, sur tout le devis ; gardé pour ce client. */
function cleAj(){return 'pc-aj-'+(COUR&&COUR.contact&&COUR.contact.id||'')}
function garderAj(v){lsS(cleAj(),v);var c=COUR&&COUR.contact&&COUR.contact.id;if(c)api('/espace/prix-client',{method:'POST',body:{contact:c,ajustement:v}}).catch(function(){toastV('Pas enregistré','Vérifiez la connexion.')})}
function ajC(){var v=+lsG(cleAj());return isFinite(v)?v:0}
function blocAj(p){var a=ajC(),t=p&&p.lue?(ED&&ED.touche?totauxEd(p).total_ht:(p.totaux||{}).total_ht):null,f=function(v){return (v>0?'+':v<0?'−':'')+String(Math.abs(v)).replace('.',',')+' %'};
 return '<div style="margin:0 0 10px"><p style="margin:0 0 6px;font-weight:700">Prix pour ce client</p><div style="display:flex;flex-wrap:wrap;gap:6px">'+
  [-15,-10,-5,0,5,10].map(function(v){return '<button type="button" class="vbtn sm'+(v===a?' go':'')+'" style="flex:1 1 56px;min-width:56px" data-vdoc="aj" data-id="'+v+'">'+(v?f(v):'Normal')+'</button>'}).join('')+'</div>'+
  '<div class="vli" style="align-items:center;margin-top:6px"><span>Autre pourcentage<small style="display:block">− pour une remise, + pour un supplément</small></span><span class="x"><input id="vajx" type="text" inputmode="decimal" value="'+([-15,-10,-5,0,5,10].indexOf(a)<0?String(a).replace('.',','):'')+'" placeholder="0" style="width:70px;font:inherit;padding:6px;border-radius:8px;border:1px solid var(--line)"> %</span></div>'+
  (t!=null?'<p class="vst" style="padding:4px 0 0">Total du devis : <b>'+eur(Math.round(t*(1+a/100)*100)/100)+' HT</b>'+(a?' (au lieu de '+eur(t)+')':'')+'</p>':'')+'</div>'}
function chargerDocs(c){DOCC=c;DOCS=null;ARME='';ERRDOC='';var z=$('#vdocs');
 api('/espace/documents?c='+encodeURIComponent(c)).then(function(x){if(DOCC!==c)return;DOCS=x.documents||[];if(typeof x.prix_client==='number')lsS(cleAj(),x.prix_client);rendreDocs()},function(err){if(z)z.innerHTML='<h3>Devis et factures</h3><p class="vst" style="padding:0">'+esc(err.message)+'</p>'})}
function pdfDoc(id){var w=null;try{w=window.open('','_blank')}catch(e){}var j=lsG(KJ);
 fetch(SERVICE+'/espace/document/pdf?id='+encodeURIComponent(id),{headers:j?{Authorization:'Bearer '+j}:{}}).then(function(r){if(!r.ok)throw new Error('PDF indisponible ('+r.status+')');return r.blob()})
  .then(function(b){var u=URL.createObjectURL(b);if(w)w.location=u;else location.href=u},function(err){if(w)w.close();toastV('PDF non ouvert',err.message)})}
function actionDoc(a,id){var c=DOCC,k=COUR&&COUR.contact;if(!c)return;
 if(a==='annuler'){ARME='';return rendreDocs()}
 if(a==='pdf')return pdfDoc(id);
 if(a==='aj'){garderAj(+id);if(ARME==='creer')ARME='';return rendreDocs()}
 if(a==='acompte'){ARME='acompte'+id;rendreDocs();var i=$('#vpct');if(i)i.focus();return}
 if((a==='envoyer'||a==='creer'||a==='accepted'||a==='rejected'||a==='paid'||a==='finale')&&ARME!==a+(id||'')){ARME=a+(id||'');return rendreDocs()}
 var p;
 var lg=ED&&ED.touche?{materiaux:ED.materiaux,main_oeuvre:ED.main_oeuvre}:undefined;
 var pd=COUR&&COUR.pre_devis[0];
 if(a==='creer'&&manque(pd).length){toastV('Pas encore','Il manque le prix du fournisseur.');return rendreDocs()}
 if(a==='creer')p=api('/espace/devis',{method:'POST',body:{contact:c,lignes:lg,forcer:!!(pd&&pd.attente&&pd.attente.length),ajustement:ajC()||undefined}});
 else if(a==='envoyer')p=api('/espace/envoyer',{method:'POST',body:{id:+id}});
 else if(a==='finale')p=api('/espace/facture',{method:'POST',body:{devis:+id,type:'finale'}});
 else if(a==='acompte-ok'){var v=parseFloat(String(($('#vpct')||{}).value||'').replace(',','.'));if(!(v>0&&v<100)){toastV('Il manque le pourcentage','Par exemple celui écrit sur votre devis.');return}lsS('pc-acompte',v);p=api('/espace/facture',{method:'POST',body:{devis:+id,type:'acompte',pourcentage:v}})}
 else if(a==='accepted'){var w=parseFloat(String(($('#vpct')||{}).value||'').replace(',','.'));if(!(w>=0&&w<100)){toastV('Pourcentage d\'acompte illisible','Entre 0 et 99 %.');return}lsS('pc-acompte',w);p=api('/espace/statut',{method:'POST',body:{id:+id,statut:a,pourcentage:w}})}
 else p=api('/espace/statut',{method:'POST',body:{id:+id,statut:a}});
 ARME='';ERRDOC='';var z=$('#vdocs');if(z)z.querySelectorAll('button').forEach(function(b){b.disabled=true});var fb=$('#vov-f .vbtn.go');if(fb){fb.disabled=true;fb.textContent='En cours…'}
 p.then(function(x){toastV(a==='envoyer'?'Envoyé au client':x.deja?'Déjà fait':'C\'est fait',k?k.nom:'');if(a==='creer'){if(!x.deja)lsS(cleLg(),null);avancer('creer')}else if(a==='envoyer'){var dv=(DOCS||[]).filter(function(d){return d.id==id})[0];if(dv&&dv.type==='devis')avancer('envoyer')}else if(a==='paid'){var fp=(DOCS||[]).filter(function(d){return d.id==id})[0];avancer(fp&&fp.type==='acompte'?'acompte':'paid')}else avancer(a);chargerDocs(c);chargerFa()},
  function(err){toastV('Pas fait',err.message);ERRDOC=err.message;rendreDocs();var zz=$('#vdocs');if(zz&&zz.scrollIntoView)zz.scrollIntoView({block:'center',behavior:'smooth'})})}
// Onglet « Factures » : les vraies factures en haut (les devis ont leur onglet), l'exemple en dessous.
function chargerFa(){var v=$('#v-factures');if(!v)return;var z=$('#vfa');if(!z){z=document.createElement('div');z.id='vfa';z.className='card vsec';var b=v.querySelector('.vexemple');v.insertBefore(z,b?b.nextSibling:v.firstChild)}
 api('/espace/documents').then(function(x){var L=(x.documents||[]).filter(function(d){return d.type!=='devis'}).slice(0,60),li=function(d){return ligneDoc(d).replace('<span>','<span>'+esc(d.client)+' · ')};
  /* Trois groupes, celles à envoyer en premier avec la pastille rouge (Cyril, 2/11) */
  var G=[['À envoyer','à vérifier puis envoyer',L.filter(function(d){return d.statut==='issued'}),1],['En attente de paiement','envoyées au client',L.filter(function(d){return d.statut==='sent'||d.statut==='partial'}),0],['Payées','les plus récentes',L.filter(function(d){return d.statut==='paid'}),0]];
  var R=L.filter(function(d){return !/^(issued|sent|partial|paid)$/.test(d.statut)});if(R.length)G.push(['Autres','',R,0]);
  z.innerHTML='<h3>Vos vraies factures</h3>'+(L.length?G.filter(function(g){return g[2].length}).map(function(g){return '<div class="vfg'+(g[3]?' vfg-env':'')+'"><div class="vh"><h2>'+g[0]+(g[3]?' <i class="vrouge">'+g[2].length+'</i>':'')+'</h2><span>'+g[1]+'</span></div>'+g[2].map(li).join('')+'</div>'}).join(''):'<p class="vst" style="padding:0">Pas encore de facture. Elles se créent depuis la fiche d\'une demande, ou toutes seules quand le client signe.</p>');
  if(window.PCV)window.PCV.factures=L;var bf=$('#badge-f'),ne=G[0][2].length;if(bf){bf.textContent=ne;bf.hidden=!ne}},
  function(err){z.innerHTML='<h3>Vos vraies factures</h3><p class="vst" style="padding:0">'+esc(/pas encore branché/i.test(err.message)?'Bientôt ici : vos vraies factures (branchement en cours).':err.message)+'</p>'})}

/* ---------- clics ---------- */
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-vc],[data-vfermer],[data-vetapes],[data-vset],[data-vretour],[data-vplan],[data-vnoplan],[data-vplannew],[data-vrefresh],[data-vout],[data-vtab],[data-vlogin],[data-vdoc],[data-vseg],[data-vlg],[data-vlok],[data-vlsup],[data-vtabd],[data-vsug],[data-vsugnew],[data-vnd],[data-vndok],[data-vrecalc],[data-vrecalcok],[data-vcad],[data-vcadl]');if(!b)return;e.preventDefault();e.stopPropagation();
 if(b.hasAttribute('data-vc'))ouvrirDemande(b.getAttribute('data-vc'));
 else if(b.hasAttribute('data-vfermer'))fermer();
 else if(b.hasAttribute('data-vetapes'))etapes();
 else if(b.hasAttribute('data-vset'))changer(b.getAttribute('data-vset'));
 else if(b.hasAttribute('data-vretour'))retour();
 else if(b.hasAttribute('data-vplan'))voirPlan();
 else if(b.hasAttribute('data-vnoplan'))ouvrir('📐 Pas de plan<small>'+esc((COUR&&COUR.contact&&COUR.contact.nom)||'Le client')+' n\'a pas dessiné de plan avec sa demande</small>','<div class="card vsec"><p class="vst" style="padding:0">Vous pouvez le dessiner vous-même, par exemple pendant la visite. Ensuite, un appui sur « Recalculer » et le pré-devis le reprend.</p></div>','<button class="vbtn" type="button" data-vretour>← Retour</button><button class="vbtn go" type="button" data-vplannew>📐 Créer le plan</button>');
 else if(b.hasAttribute('data-vplannew'))voirPlan(true);
 else if(b.hasAttribute('data-vrecalc'))recalc();
 else if(b.hasAttribute('data-vcadl'))cadLigneChoix(b.getAttribute('data-vcadl'));
 else if(b.hasAttribute('data-vcad'))cadAction(b.getAttribute('data-vcad'));
 else if(b.hasAttribute('data-vrecalcok'))recalcOk(b);
 else if(b.hasAttribute('data-vrefresh'))charger();
 else if(b.hasAttribute('data-vout')){deconnecter(false)}
 else if(b.hasAttribute('data-vtab')){var t=$('#nb-devis')||$('#tt-devis');if(t)t.click()}
 else if(b.hasAttribute('data-vlogin'))connexion();
 else if(b.hasAttribute('data-vdoc'))actionDoc(b.getAttribute('data-vdoc'),b.getAttribute('data-id'));
 else if(b.hasAttribute('data-vseg')){VSEG=b.getAttribute('data-vseg');rendre();}
 else if(b.hasAttribute('data-vlg'))ligneV(b.getAttribute('data-vlg'));
 else if(b.hasAttribute('data-vlok'))ligneVok(b.getAttribute('data-vlok'));
 else if(b.hasAttribute('data-vlsup'))ligneVsup(b);
 else if(b.hasAttribute('data-vtabd'))onglet(b.getAttribute('data-vtabd'));
 else if(b.hasAttribute('data-vsug'))choisirSug(+b.getAttribute('data-vsug'));
 else if(b.hasAttribute('data-vsugnew')){NOUVP=true;var sz=$('#vl-sug');if(sz)sz.innerHTML='<small class="vsug-t">✓ Nouveau produit : complétez la quantité, l\'unité et le prix. Il sera rangé dans vos produits à l\'enregistrement.</small>';var ok=$('#vov-f [data-vlok]');if(ok)ok.textContent='Enregistrer et ranger';try{$('#vl-u').focus()}catch(e){}}
 else if(b.hasAttribute('data-vnd')){if(ND&&ND.arme){ND.arme=0;rendreND()}else nouveauDevis()}
 else if(b.hasAttribute('data-vndok'))ndOk(b);
},true);

/* ---------- démarrage ---------- */
function bandeauExemple(sel,txt){var s=$(sel);if(!s||s.querySelector('.vexemple'))return;var d=document.createElement('div');d.className='vexemple';d.innerHTML=txt;s.insertBefore(d,s.firstChild)}
function demarrer(){var art=lsG(KA)||{};document.documentElement.classList.add('pcvrai');var vco=$('#vco');if(vco)vco.remove();
 var chip=$('.chip-demo');if(chip)chip.textContent='EN DIRECT';
 var br=$('.brand small');if(br&&art.entreprise)br.textContent='Devis & Chantiers · '+art.entreprise;if(window.PCProfil)PCProfil.pose(art);
 var col=$('#v-devis .grid2 .col');if(col&&!$('#vd')){var v=document.createElement('div');v.id='vd';col.insertBefore(v,col.firstChild)}
 var td=$('#todo');if(td&&!$('#va')){var a=document.createElement('div');a.id='va';td.parentNode.insertBefore(a,td)}
 var ex='<b>Exemple de démonstration.</b> Ici rien n\'est encore branché : seules vos demandes (Accueil, Clients et Devis) sont réelles.';
 ['#v-planning','#v-chantiers','#v-prix'].forEach(function(s){bandeauExemple(s,ex)});
 bandeauExemple('#v-factures','<b>En dessous : exemple de démonstration.</b> Vos vrais devis et factures sont dans le premier cadre.');chargerFa();
 var ag=$('#v-accueil .agenda');if(ag&&!ag.previousElementSibling.classList.contains('vexemple')){var d=document.createElement('div');d.className='vexemple';d.innerHTML='<b>Agenda : exemple.</b> Le vrai planning arrive plus tard.';ag.parentNode.insertBefore(d,ag)}
 // Le message de démonstration « Nouvelle demande : Mme Durand » ne doit pas apparaître ici.
 setTimeout(function(){var t=$('#toast'),tt=$('#tt');if(t&&tt&&/Nouvelle demande de devis/.test(tt.textContent))t.classList.remove('on')},2200);
 var c=lsG(KL);if(c){c._cache=true;LISTE=c;ETAPES=c.etapes||[]}rendre();charger();}
function proposer(){if(!SERVICE)return;var ph=$('#phrase');if(!ph||$('#vco'))return;var d=document.createElement('div');d.className='vco';d.id='vco';
 d.innerHTML='<span><b>Mode démo.</b> C\'est votre Espace ? Connectez-vous pour voir vos vraies demandes.</span><button class="vbtn go sm" type="button" data-vlogin>Se connecter</button>';ph.parentNode.insertBefore(d,ph.nextSibling)}
// Lien collé à la main : espaces, guillemets ou %20 autour de l'identifiant sont ignorés.
function lienDirect(){var h=location.hash;try{h=decodeURIComponent(h)}catch(e){}var m=/[#&]c=[\s"'<>]*([A-Za-z0-9_-]{6,64})/.exec(h);return m?m[1]:null}

if(!SERVICE){if(lienDirect())setTimeout(function(){ouvrir('Espace pas encore branché','<div class="card"><p style="margin:0">Ce lien ouvre une vraie demande, mais l\'adresse du service ProClik n\'est pas encore réglée dans l\'Espace. Prévenez Cyril : c\'est une ligne à ajouter.</p></div>','<button class="vbtn" type="button" data-vfermer>Fermer</button>')},1500);return}
/* Pour l'onglet Clients (clients.js) : appels au service, ouverture d'une demande, PDF d'un document */
(function(){var c=document.createElement('style');c.textContent='.vcad h3{margin:0 0 4px}.vcad-2{display:grid;grid-template-columns:1fr 1fr;gap:8px}.vcad-2>div{border-radius:14px;padding:10px 12px;background:var(--soft,#EEF1F6);display:grid;gap:2px}.vcad-2 span{font-size:12.5px;font-weight:700;color:var(--muted)}.vcad-2 b{font-size:20px}.vcad-2 small{font-size:12.5px;color:var(--muted);font-weight:600}.vcad-2 .on{background:var(--n1-nuit,#1B2440);color:var(--n1-nuit-fg,#fff)}.vcad-2 .on span,.vcad-2 .on small{color:inherit;opacity:.8}.vcad-l{list-style:none;margin:10px 0 0;padding:0;display:grid;gap:8px}.vcad-q{margin:12px 0 0;font-size:13px;font-weight:800;color:var(--muted)}.vcad-l li{display:flex;justify-content:space-between;align-items:center;gap:10px;font-size:13.5px;border-top:1px solid var(--line);padding-top:8px}.vcad-l small{display:block;color:var(--muted);font-size:12.5px}.vcad-l li>span:first-child b{display:block;margin-top:2px}.vcad-l s{color:var(--muted);font-weight:600}.vcad-l li.non>span:first-child{opacity:.75}.vcad-on{flex:none;display:inline-flex;padding:3px;border-radius:999px;background:var(--soft,#EEF1F6)}.vcad-on button{appearance:none;border:0;background:none;font:800 13.5px var(--f,inherit);color:var(--muted);min-width:48px;min-height:38px;border-radius:999px;cursor:pointer}.vcad-on button[aria-pressed=true]{background:var(--card,#fff);color:var(--fg);box-shadow:0 1px 3px rgba(14,19,34,.18)}.vcad-on button[data-vcadl$="|1"][aria-pressed=true]{background:var(--n1-nuit,#1B2440);color:var(--n1-nuit-fg,#fff)}.vcad-b{margin-top:12px}.vcad-b .vbtn{flex:1 1 150px}.vcad.ok{border-left:4px solid var(--n1-laiton,#A8823F)}';document.head.appendChild(c)})();
window.PCV={nouveauDevis:function(k,t){nouveauDevis(k,t)},api:function(c,o){return SERVICE?api(c,o):Promise.reject(new Error('Service ProClik pas encore réglé.'))},ouvrirDemande:ouvrirDemande,pdf:pdfDoc,
 demandes:function(){return (LISTE&&LISTE.demandes)||[]},cour:function(){return COUR},recalc:function(){recalc()},toast:function(a,b){toastV(a,b)},
 questionsClient:function(p){var ok=lsG(vokCle(p))||[];return (p.a_verifier||[]).map(vcourt).map(function(x,i){return [x,i]}).filter(function(z){return z[0].g==='cli'&&ok.indexOf(z[1])<0}).map(function(z){return z[0].q})},artisan:function(){return lsG(KA)||{}},
 prendre:function(np){if(!ED||!COUR||!np)return;var c=function(L){return (L||[]).map(function(l){return {libelle:l.libelle,quantite:l.quantite,unite:l.unite,pu:l.pu,total:l.total,a_verifier:l.a_verifier}})};ED.materiaux=c(np.materiaux);ED.main_oeuvre=c(np.main_oeuvre);garderEd();afficher(COUR)}};
if(AP){var bd=document.createElement('div');bd.id='vapercu';bd.setAttribute('role','status');bd.style.cssText='position:fixed;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom));z-index:2147483000;justify-content:space-between;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;background:var(--n1-nuit,#1B2440);color:var(--n1-nuit-fg,#fff);padding:8px 8px 8px 14px;border-radius:14px;font:600 13px var(--f);display:flex;gap:10px;align-items:center;box-shadow:0 8px 20px -8px rgba(0,0,0,.4);max-width:calc(100% - 24px)';
 bd.innerHTML='<span id="vapn" style="overflow:hidden;text-overflow:ellipsis">Aperçu (lecture seule)</span><button type="button" style="flex:none;border:0;border-radius:10px;padding:6px 10px;font:700 13px var(--f);background:rgba(255,255,255,.18);color:inherit;cursor:pointer">Quitter</button>';
 document.body.appendChild(bd);bd.querySelector('button').addEventListener('click',quitterApercu);
 api('/espace/moi').then(function(x){if(!x||!x.artisan)return;lsS(KA,x.artisan);if(window.PCProfil)PCProfil.pose(x.artisan);document.getElementById('vapn').textContent='Aperçu : '+x.artisan.entreprise+' (lecture seule)';if(window.PCMenus)window.PCMenus.applique()}).catch(function(){})}
if(lsG(KJ))demarrer();else proposer();
(function(){var m=/[#&]invit=([A-Za-z0-9_-]{20,80})/.exec(location.hash);if(!m)return;try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}
 setTimeout(function(){choisir({invit:m[1]})},lsG(KJ)?300:1200)})();
var c0=lienDirect();if(c0)setTimeout(function(){ouvrirDemande(c0)},lsG(KJ)?300:1500);
window.addEventListener('hashchange',function(){var c=lienDirect();if(c)ouvrirDemande(c)});
document.addEventListener('click',function(e){var t=e.target.closest&&e.target.closest('[role=tab][data-v="devis"]');if(t&&lsG(KJ)&&Date.now()-charge>30000)charger()});
document.addEventListener('toggle',function(e){var d=e.target;if(d&&d.classList&&d.classList.contains('vcomm'))lsS('pc-calc-ferme',d.open?null:1)},true);
document.addEventListener('visibilitychange',function(){if(!document.hidden&&lsG(KJ)&&Date.now()-charge>60000)charger()});
/* « Vérifier un par un » (Cyril 12/11) : les points à vérifier du pré-devis en un seul parcours, une question à la fois,
   dans la même petite fenêtre que le plan ; à la fin, on rappelle les points du plan (bouton « À vérifier » du plan). */
var PLANCHK=0,VWZ=null;window.addEventListener('message',function(e){var d=e.data;if(d&&d.type==='proclik-plan-chk')PLANCHK=+d.n||0});
function vwzPts(){var p=COUR&&COUR.pre_devis&&COUR.pre_devis[0];if(!p)return null;var ok=lsG(vokCle(p))||[],Q=(p.a_verifier||[]).map(vcourt);return {p:p,ok:ok,Q:Q,R:Q.map(function(x,i){return i}).filter(function(i){return ok.indexOf(i)<0})}}
function vwzShow(){var o=$('#vwz');if(!o){o=document.createElement('div');o.id='vwz';o.setAttribute('role','dialog');(document.querySelector('.vov')||document.body).appendChild(o)}var P=vwzPts();if(!VWZ||!P){o.hidden=true;return}o.hidden=false;
 var I=VWZ.I,n=I.length,k=VWZ.k,x='<button type="button" class="vwz-x" data-vwz="x" aria-label="Fermer">✕</button>',h;
 if(k>=n){var reste=P.R.length,cli=P.R.some(function(i){return P.Q[i].g==='cli'}),c=COUR&&COUR.contact||{};
  h='<div class="vwz-h"><div><b>À vérifier</b><small>Pré-devis</small></div>'+x+'</div><div class="vwz-q vwz-in"><h3>'+(reste?'C\'est passé en revue':'Tout est vérifié ✓')+'</h3>'+(reste?'<p>'+reste+' point'+(reste>1?'s':'')+' laissé'+(reste>1?'s':'')+' pour plus tard : ils restent dans la liste « À vérifier ».</p>':'<p>Plus rien à regarder dans le pré-devis.</p>')+(PLANCHK?'<p><b>Le plan a encore '+PLANCHK+' point'+(PLANCHK>1?'s':'')+'</b> : ouvrez le plan et touchez « À vérifier » en haut.</p>':'')+'</div><div class="vwz-f">'+(cli&&(c.telephone||c.email)?'<button type="button" class="vwz-l" data-vwz="cli">Envoyer les questions au client</button>':'<span></span>')+'<button type="button" class="vwz-s" data-vwz="x">Fermer</button></div>'}
 else{var i=I[k],q=P.Q[i],G=VGR.filter(function(g){return g[0]===q.g})[0]||VGR[1],li=vligne(q),fait=P.ok.indexOf(i)>=0;
  h='<div class="vwz-h"><div><b>À vérifier · '+(k+1)+' sur '+n+'</b><small>'+esc(G[1])+'</small></div>'+x+'</div><div class="vwz-p">'+I.map(function(_,j){return '<i class="'+(j<k?'ok':j===k?'cur':'')+'"></i>'}).join('')+'</div>'+
   '<div class="vwz-q '+(VWZ.d<0?'vwz-bk':'vwz-in')+'"><h3>'+esc(q.q)+'</h3>'+(q.r?'<span class="vchip'+(q.g==='prix'?' z':'')+'">'+esc(q.r)+'</span>':'')+(fait?'<p>✓ Déjà marqué « C\'est bon ».</p>':'')+
   '<div class="vwz-b"><button type="button" class="vwz-s" data-vwz="ok">✓ C\'est bon</button>'+(li?'<button type="button" class="vwz-m" data-vwz="mod">Modifier la ligne</button>':'')+'</div></div>'+
   '<div class="vwz-f">'+(k>0?'<button type="button" class="vwz-l" data-vwz="prev">← Retour</button>':'<span></span>')+'<button type="button" class="vwz-l" data-vwz="next">Plus tard →</button></div>'}
 o.innerHTML=h;VWZ.d=0}
document.addEventListener('click',function(e){var t=e.target.closest&&e.target.closest('[data-vwzgo],[data-vwz]');if(!t)return;var P=vwzPts();if(!P)return;
 if(t.hasAttribute('data-vwzgo')){e.preventDefault();if(!P.R.length)return;VWZ={I:P.R.slice(),k:0,d:1};vwzShow();return}
 var a=t.getAttribute('data-vwz');if(!VWZ)return;
 if(a==='x'){VWZ=null;vwzShow();return}
 if(a==='prev'){VWZ.k=Math.max(0,VWZ.k-1);VWZ.d=-1;vwzShow();return}
 if(a==='next'){VWZ.k++;VWZ.d=1;vwzShow();return}
 if(a==='ok'){var i=VWZ.I[VWZ.k],ok=P.ok.filter(function(z){return z!==i});ok.push(i);lsS(vokCle(P.p),ok);var c=$('#vov-b [data-vok="'+i+'"]');if(c)c.checked=true;vverifMaj();VWZ.k++;VWZ.d=1;setTimeout(vwzShow,160);return}
 if(a==='mod'){var j=VWZ.I[VWZ.k],r=$('#vov-b [data-vok="'+j+'"]'),m=r&&r.parentNode.querySelector('.vmod2');VWZ=null;vwzShow();if(m)m.click();return}
 if(a==='cli'){VWZ=null;vwzShow();var g=$('#vov-b details.vgrp[data-vgrp="cli"]'),d=$('#vov-b details.vmsg');if(g)g.open=true;if(d){d.open=true;d.scrollIntoView({block:'center',behavior:'smooth'})}return}});
(function(){var s=document.createElement('style');s.textContent='#vwz{position:fixed;z-index:9000;left:50%;bottom:12px;transform:translateX(-50%);width:min(420px,calc(100% - 24px));max-height:min(80vh,620px);overflow:auto;display:grid;gap:10px;padding:14px 16px;border-radius:22px;background:var(--bg,#ECEEF2);color:var(--fg);border:1px solid var(--line);box-shadow:0 18px 44px -12px rgba(11,18,38,.4)}#vwz[hidden]{display:none}@media (min-width:900px){#vwz{left:auto;right:20px;transform:none;bottom:20px}}'+
 '.vwz-h{display:flex;align-items:center;gap:10px}.vwz-h>div{flex:1;min-width:0}.vwz-h b{display:block;font:800 15px var(--f)}.vwz-h small{display:block;font:600 12px var(--f);color:var(--muted)}.vwz-x{flex:none;width:36px;height:36px;border-radius:50%;border:0;background:transparent;color:var(--muted);font:700 16px var(--f);cursor:pointer}'+
 '.vwz-p{display:flex;gap:4px}.vwz-p i{flex:1;height:4px;border-radius:2px;background:var(--line)}.vwz-p i.ok{background:var(--acc,#1B2440)}.vwz-p i.cur{background:var(--laiton,#A8823F)}'+
 '.vwz-q{display:grid;gap:10px}.vwz-q h3{margin:2px 0 0;font:800 19px/1.25 var(--f)}.vwz-q p{margin:0;color:var(--muted);font:600 14px/1.4 var(--f)}.vwz-q .vchip{justify-self:start}'+
 '.vwz-b{display:grid;gap:8px}.vwz-s,.vwz-m{appearance:none;cursor:pointer;min-height:48px;border-radius:14px;font:800 15px var(--f);padding:0 18px}.vwz-s{border:0;background:var(--acc,#1B2440);color:var(--bg,#fff)}.vwz-m{border:1px solid var(--line);background:var(--card);color:var(--fg)}'+
 '.vwz-f{display:flex;justify-content:space-between;align-items:center;gap:10px}.vwz-l{appearance:none;border:0;background:none;color:var(--fg);font:700 14px var(--f);text-decoration:underline;cursor:pointer;padding:8px 2px}.vwz-f .vwz-s{min-height:44px}'+
 '.vwz-in>*{animation:vwzi .4s cubic-bezier(.22,1,.36,1) both}.vwz-bk>*{animation:vwzb .4s cubic-bezier(.22,1,.36,1) both}@keyframes vwzi{from{opacity:0;transform:translateX(24px)}}@keyframes vwzb{from{opacity:0;transform:translateX(-24px)}}@media (prefers-reduced-motion:reduce){.vwz-in>*,.vwz-bk>*{animation:none}}'+
 '.vwz-go{width:100%;margin:6px 0 4px;min-height:48px;background:var(--acc,#1B2440)!important;color:var(--bg,#fff)!important}';document.head.appendChild(s)})();
})();
