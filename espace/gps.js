/* Itinéraire : l'artisan choisit son GPS (demande de Cyril, 3/11).
   Google Maps, Waze et Plans d'Apple, les trois les plus utilisés en France. Le dernier choisi passe en premier.
   Partout dans l'Espace : tout bouton qui porte data-gps="adresse" ouvre ce choix (fiche client, chantier, planning, pré-devis).
   Sa propre petite fenêtre, au-dessus de tout (elle s'ouvre aussi depuis la page du pré-devis). */
(function(){
"use strict";
var K='pc-gps';
function lire(){try{return localStorage.getItem(K)||''}catch(e){return ''}}
function noter(v){try{localStorage.setItem(K,v)}catch(e){}}
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var I=function(p){return '<svg viewBox="0 0 24 24" aria-hidden="true">'+p+'</svg>'};
var GPS=[
 {id:'google',nom:'Google Maps',sous:'Le plus utilisé',ic:I('<path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>'),
  url:function(q){return 'https://www.google.com/maps/dir/?api=1&destination='+q}},
 {id:'waze',nom:'Waze',sous:'Bouchons et radars en direct',ic:I('<path d="M5 15.5A7.5 7 0 1 1 19.5 12c0 2.5-1.6 4.4-4 5.2H9.5"/><path d="M5 15.5c-1 0-1.8-.6-2-1.5"/><circle cx="8" cy="19" r="1.6"/><circle cx="15.5" cy="19" r="1.6"/><path d="M10 10.5h.01M14.5 10.5h.01M10 13.5c1.2 1 3.3 1 4.5 0"/>'),
  url:function(q){return 'https://waze.com/ul?q='+q+'&navigate=yes'}},
 {id:'apple',nom:'Plans',sous:'L\'application d\'Apple (iPhone, iPad)',ic:I('<path d="M4 6.5l5-2 6 2 5-2v13l-5 2-6-2-5 2z"/><path d="M9 4.5v13M15 6.5v13"/>'),
  url:function(q){return 'https://maps.apple.com/?daddr='+q}}];
var css='#pcgps-scrim{position:fixed;inset:0;z-index:10000;background:rgba(7,11,24,.45);opacity:0;transition:opacity .2s}'+
 '#pcgps-scrim.on{opacity:1}'+
 '#pcgps{position:fixed;left:50%;bottom:0;z-index:10000;width:min(460px,100%);transform:translate(-50%,105%);transition:transform .25s cubic-bezier(.2,.8,.2,1);background:var(--bg,#F4F6FA);color:var(--fg,#0B1226);border-radius:26px 26px 0 0;padding:18px 16px calc(16px + env(safe-area-inset-bottom,0px));box-shadow:0 -10px 40px rgba(0,0,0,.25);font-family:var(--f,inherit)}'+
 '#pcgps.on{transform:translate(-50%,0)}'+
 '@media (min-width:700px){#pcgps{bottom:auto;top:50%;border-radius:26px;transform:translate(-50%,-40%);opacity:0;pointer-events:none;transition:transform .2s,opacity .2s}#pcgps.on{transform:translate(-50%,-50%);opacity:1;pointer-events:auto}}'+
 '#pcgps h2{margin:0;font-size:19px}#pcgps .gps-a{margin:3px 0 14px;color:var(--muted,#4A5470);font-size:13px}'+
 '#pcgps .gps-l{display:flex;flex-direction:column;gap:10px}'+
 '#pcgps .gps-l a{display:flex;align-items:center;gap:14px;min-height:64px;padding:10px 16px;border-radius:20px;background:var(--card,#fff);box-shadow:var(--shadow);color:inherit;text-decoration:none}'+
 '#pcgps .gps-ic{flex:none;width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--soft,#EEF1F6)}'+
 '#pcgps .gps-ic svg{width:23px;height:23px;fill:none;stroke:var(--accx,currentColor);stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}'+
 '#pcgps .gps-t{display:flex;flex-direction:column;flex:1;min-width:0}#pcgps .gps-t b{font-size:16px}#pcgps .gps-t small{color:var(--muted,#4A5470);font-size:12.5px}'+
 '#pcgps .gps-der{flex:none;font-size:11.5px;font-weight:800;padding:3px 9px;border-radius:999px;background:var(--turq-bg,#E3FBF6);color:var(--turq-ink,#0B6B5B)}'+
 '#pcgps .gps-x{margin-top:12px;width:100%;min-height:50px;border-radius:999px;font:inherit;font-weight:800;background:var(--soft,#EEF1F6);color:inherit;border:0}';
function poser(){if(document.getElementById('pcgps'))return;
 var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
 var s=document.createElement('div');s.id='pcgps-scrim';s.hidden=true;document.body.appendChild(s);
 var g=document.createElement('div');g.id='pcgps';g.setAttribute('role','dialog');g.setAttribute('aria-modal','true');g.setAttribute('aria-labelledby','gps-t');g.hidden=true;document.body.appendChild(g);
 s.addEventListener('click',fermer);}
function fermer(){var g=document.getElementById('pcgps'),s=document.getElementById('pcgps-scrim');if(!g)return;
 g.classList.remove('on');s.classList.remove('on');setTimeout(function(){if(!g.classList.contains('on')){g.hidden=true;s.hidden=true}},260);}
function ouvrir(adr){adr=String(adr||'').trim();if(!adr)return;poser();
 var q=encodeURIComponent(adr),der=lire(),L=GPS.slice();
 L.sort(function(a,b){return (b.id===der)-(a.id===der)});
 var g=document.getElementById('pcgps'),s=document.getElementById('pcgps-scrim');
 g.innerHTML='<h2 id="gps-t">Itinéraire</h2><p class="gps-a">'+esc(adr)+'</p><div class="gps-l">'+L.map(function(x){
  return '<a href="'+x.url(q)+'" target="_blank" rel="noopener" data-gpsapp="'+x.id+'"><span class="gps-ic">'+x.ic+'</span><span class="gps-t"><b>'+x.nom+'</b><small>'+x.sous+'</small></span>'+(x.id===der?'<span class="gps-der">Votre dernier choix</span>':'')+'</a>'}).join('')+
  '</div><button type="button" class="gps-x">Annuler</button>';
 g.querySelector('.gps-x').addEventListener('click',fermer);
 [].forEach.call(g.querySelectorAll('[data-gpsapp]'),function(a){a.addEventListener('click',function(){noter(a.getAttribute('data-gpsapp'));setTimeout(fermer,150)})});
 g.hidden=false;s.hidden=false;void g.offsetWidth;g.classList.add('on');s.classList.add('on');
 var p=g.querySelector('a');if(p)try{p.focus({preventScroll:true})}catch(e){}}
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-gps]');if(!b)return;e.preventDefault();ouvrir(b.getAttribute('data-gps'));});
document.addEventListener('keydown',function(e){var g=document.getElementById('pcgps');if(e.key==='Escape'&&g&&g.classList.contains('on'))fermer();});
window.PCGPS={ouvrir:ouvrir,fermer:fermer};
if(window.PCX)window.PCX.itineraire=ouvrir;
})();
