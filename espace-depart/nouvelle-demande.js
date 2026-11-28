/* « Nouvelle demande » sur le chantier (maquette, Cyril 28/11) :
   l'artisan, souvent pressé et le client à côté, coche les réponses du formulaire en version courte
   (../devis/index.html?pro=1 : pas d'accueil, pas de photos ni de calendrier, coordonnées facultatives),
   puis le plan s'ouvre déjà préparé avec ces réponses (niveaux, hauteur) : rien n'est demandé deux fois.
   « Passer au plan » reste toujours visible en haut : on peut quitter les questions à tout moment.
   Les demandes sont gardées sur l'appareil (localStorage « pc-nd »). */
(function(){
"use strict";
var d=document,$=function(s,r){return (r||d).querySelector(s)};
var lsG=function(k,v){try{var x=JSON.parse(localStorage.getItem(k));return x==null?v:x}catch(e){return v}};
var lsS=function(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
var V='1';

var css=d.createElement('style');css.textContent=[
'.ndov{position:fixed;inset:0;z-index:9998;background:var(--n1-bg,var(--bg));display:flex;flex-direction:column}.ndov[hidden]{display:none!important}',
'.ndov-h{display:flex;align-items:center;gap:10px;padding:8px max(12px,env(safe-area-inset-right,0px)) 8px max(12px,env(safe-area-inset-left,0px));padding-top:calc(8px + env(safe-area-inset-top,0px));background:var(--n1-bg,var(--card));border-bottom:1px solid var(--line,rgba(14,19,34,.1))}',
'.ndov-h .t{flex:1;min-width:0;font:800 15px var(--f,inherit);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
'.ndov-h .t small{display:block;font-weight:600;font-size:12px;color:var(--muted)}',
'.ndov-h button{appearance:none;border:0;cursor:pointer;font:800 14px var(--f,inherit);border-radius:14px;min-height:42px;display:inline-flex;align-items:center;gap:6px;padding:0 14px}',
'.ndov-h .x{background:var(--n1-calme,var(--card));color:inherit;box-shadow:var(--n1-pk);padding:0 12px}',
'.ndov-h .pl{background:var(--nuit,#1B2440);color:var(--nuit-fg,#fff)}',
'.ndov-h svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex:none}',
'@media (max-width:420px){.ndov-h .t small{display:none}.ndov-h .pl span{display:none}.ndov-h .pl::after{content:"Plan"}}',
'.ndov iframe{flex:1 1 0;border:0;width:100%;min-height:0;background:var(--n1-bg,var(--bg))}'
].join('');d.head.appendChild(css);

var S=function(p){return '<svg viewBox="0 0 24 24" aria-hidden="true">'+p+'</svg>'};
var ov=d.createElement('div');ov.className='ndov';ov.hidden=true;ov.setAttribute('role','dialog');ov.setAttribute('aria-label','Nouvelle demande');
ov.innerHTML='<div class="ndov-h"><button type="button" class="x" data-nd-x aria-label="Fermer">'+S('<path d="M6 6l12 12M18 6 6 18"/>')+'</button>'+
 '<div class="t">Nouvelle demande<small>Cochez les réponses avec le client, le plan suit</small></div>'+
 '<button type="button" class="pl" data-nd-plan>'+S('<rect x="3" y="4" width="18" height="16" rx="1.5"/><path d="M3 12h9V4M12 16v4"/>')+'<span>Passer au plan</span></button></div>'+
 '<iframe title="Nouvelle demande" allow="camera; microphone"></iframe>';
d.body.appendChild(ov);var fr=$('iframe',ov),attente=0;

function ouvrir(){if(!fr.getAttribute('src')||fr.getAttribute('src')==='about:blank')fr.setAttribute('src','../devis/index.html?pro=1&neuf=1&v='+V);ov.hidden=false;d.body.style.overflow='hidden'}
function fermer(){ov.hidden=true;d.body.style.overflow=''}

function nomClient(c){c=c||{};var n=[c.prenom,c.nom].map(function(x){return String(x||'').trim()}).filter(Boolean).join(' ');return n}
function hsp(v){var n=parseFloat(String(v||'').replace(',','.'));return n>1.8&&n<6?n:null}

/* les réponses arrivent : on garde la demande, puis le plan s'ouvre préparé */
function recevoir(m){var st={};try{st=JSON.parse(m.s||'{}')||{}}catch(e){}
 var L=st.logement||{},nom=nomClient(st.contact),id=Date.now().toString(36);
 var dem={id:id,t:Date.now(),client:nom,commune:L.commune||'',cp:L.cp||'',travaux:m.lab||st.travaux||[],fini:!!m.fin,reponses:m.payload||null};
 var all=lsG('pc-nd',[]);if(!Array.isArray(all))all=[];all.unshift(dem);lsS('pc-nd',all.slice(0,30));
 var nd={n:nom||'',ou:Array.isArray(L.ou)?L.ou:[],type:L.type||'',h:hsp(L.hsp),trav:st.travaux||[]};
 if(m.fin)fr.setAttribute('src','about:blank');
 fermer();planOuvrir(id,nd,nom||L.commune||'')}

function planOuvrir(id,nd,qui){var pov=$('#pcov'),pf=$('#pcov-f'),pb=$('#pcov-b'),pt=$('#pcov-t');if(!pov||!pf)return;
 if(pt){pt.firstChild.nodeValue='📐 Plan'+(qui?' · '+qui:'');var sm=$('small',pt);if(sm)sm.textContent='Préparé avec la demande · gardé sur cet appareil'}
 if(pb)pb.hidden=true;pf.hidden=false;
 pf.setAttribute('src','plan.html?embed=1&new=1&chantier=nd-'+id+'&nd='+encodeURIComponent(JSON.stringify(nd))+'&v=82');
 pov.hidden=false;d.body.style.overflow='hidden'}

addEventListener('message',function(e){if(e.source!==fr.contentWindow)return;var m=e.data||{};
 if(m.type==='proclik-pro-demande'){clearTimeout(attente);recevoir(m)}});

ov.addEventListener('click',function(e){
 if(e.target.closest('[data-nd-x]'))return fermer();
 if(e.target.closest('[data-nd-plan]')){
  /* on demande au formulaire ce qui est déjà coché ; s'il ne répond pas, le plan s'ouvre quand même */
  try{fr.contentWindow.postMessage({type:'proclik-pro-get'},'*')}catch(x){}
  clearTimeout(attente);attente=setTimeout(function(){fermer();planOuvrir(Date.now().toString(36),{},'')},800)}});
d.addEventListener('keydown',function(e){if(e.key==='Escape'&&!ov.hidden)fermer()});

window.PCND={ouvrir:ouvrir,liste:function(){return lsG('pc-nd',[])}};
})();
