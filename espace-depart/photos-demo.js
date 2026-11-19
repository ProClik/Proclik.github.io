/* Réserves : icône du problème à la place de la photo (Cyril 19/11 16h34),
   la photo en tout petit sur la droite, juste pour montrer qu'il y en a une.
   Icônes au trait, même dessin que les icônes du formulaire (devis/icones.js). */
(function(){
var K=[
 ['elec',/spot|lumi|lampe|ampoule|prise|interrupt|électr|elec|tableau/i,'<path d="M9 17.5h6M10 20.5h4"/><path d="M12 3.5a5.5 5.5 0 0 0-3 10.1c.6.4 1 1.1 1 1.9v2h4v-2c0-.8.4-1.5 1-1.9a5.5 5.5 0 0 0-3-10.1z"/>'],
 ['eau',/joint|lavabo|fuit|fuite|robinet|évier|douche|baignoire|wc|eau|humid/i,'<path d="M12 3.5c3.2 4.1 5.5 7.2 5.5 10a5.5 5.5 0 0 1-11 0c0-2.8 2.3-5.9 5.5-10z"/><path d="M9.5 14.5a2.5 2.5 0 0 0 2.5 2.5"/>'],
 ['sol',/sol|carrel|parquet|plinthe|dalle|moquette|vinyle|stratifi/i,'<path d="M4 4h16v16H4z"/><path d="M4 8h16M4 12h16M4 16h16M10 4v4M15 8v4M8 12v4M14 16v4"/>'],
 ['plaf',/plafond|bande|faux.plaf|suspente/i,'<path d="M3.5 6.5h17v4h-17z"/><path d="M6 10.5v2.5M10 10.5v4M14.5 10.5v2M18 10.5v3"/><path d="M3.5 20h17" stroke-opacity=".45"/>'],
 ['porte',/porte|poignée|serrure|huisserie/i,'<rect x="6" y="3.5" width="12" height="17" rx="1"/><path d="M15 12h.01" stroke-width="2.4"/>'],
 ['fen',/fenêtre|fenetre|vitre|volet|baie|velux/i,'<rect x="5" y="3.5" width="14" height="17" rx="1"/><path d="M12 3.5v17M5 12h14"/>'],
 ['peint',/peint|enduit|tache|trace|rayure|teinte/i,'<rect x="4" y="3.5" width="13" height="5" rx="1.5"/><path d="M17 6h2.5v5H11v3"/><rect x="9.5" y="14" width="3" height="6.5" rx="1"/>'],
 ['chauf',/radiateur|chauff|clim|vmc|ventil/i,'<rect x="3.5" y="6" width="17" height="12" rx="2"/><path d="M7.5 6v12M12 6v12M16.5 6v12M5 20.5v-2.5M19 20.5v-2.5"/>'],
 ['fiss',/fissure|cloison|mur|placo|plaque|trou|cass|abîm|abim/i,'<rect x="4" y="4" width="16" height="16" rx="1"/><path d="m12 4-2 4.5 3 2.5-2.5 4 1.5 5"/>'],
 ['autre',/./,'<path d="M14.7 6.3a4 4 0 0 0-5.4 5.2L4 16.8 7.2 20l5.3-5.3a4 4 0 0 0 5.2-5.4l-2.4 2.4-2.6-.6-.6-2.6z"/>']];
function kind(t){t=t||'';for(var j=0;j<K.length;j++)if(K[j][1].test(t))return K[j];return K[K.length-1]}
function svg(p){return '<svg viewBox="0 0 24 24" aria-hidden="true">'+p+'</svg>'}
function nbPh(r){return (r.ph?1:0)+(r.st&&r.st!=='ouv'?1:0)+(r.phx||[]).length}
/* à gauche : icône du problème, numéro dans l'angle en haut */
function ico(r,i,rn){return '<span class="rsvi">'+svg(kind(r.t)[2])+'<b class="'+rn+'">'+(i+1)+'</b></span>'}
/* à droite : la photo en tout petit (avec le nombre s'il y en a plusieurs) */
var PHI='<path d="M4 17l4.5-5 3.5 3.5 2.5-2.5L20 17"/><circle cx="15.5" cy="8.5" r="1.6"/>';
function mini(r){var n=nbPh(r);if(!n)return '';return '<span class="rsvm" aria-label="'+n+' photo'+(n>1?'s':'')+'">'+svg(PHI)+(n>1?'<i class="rsvn">'+n+'</i>':'')+'</span>'}
function vg(r,i,rn){return ico(r,i,rn)}
/* grande photo de la fiche (en démo : cadre photo sobre) */
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function grand(r,ap,lab){return '<span class="rsvf">'+svg(PHI)+(ap?'<em class="rsvok">'+svg('<path d="M7 12.3l3.2 3.2L17 8.7"/>')+'</em>':'')+'<small>'+esc(lab)+'</small></span>'}
var css='.rsvi{position:relative;width:40px;height:40px;flex:none;border-radius:12px;display:grid;place-items:center;background:var(--n1-teinte);color:var(--n1-nuit)}'+
 '.rsvi>svg{width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}'+
 '.rsvi>b{position:absolute!important;top:-5px;left:-5px;width:17px!important;height:17px!important;font-size:9.5px!important;margin:0!important;z-index:2;box-shadow:0 0 0 2px var(--n1-calme)}'+
 '.rsvm{position:relative;width:26px;height:26px;flex:none;border-radius:8px;display:grid;place-items:center;background:color-mix(in srgb,var(--n1-muted) 22%,var(--n1-teinte));color:var(--n1-muted);align-self:center}'+
 '.rsvm>svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}'+
 '.rsvm .rsvn{position:absolute;top:-5px;right:-6px;min-width:15px;height:15px;padding:0 3px;box-sizing:border-box;border-radius:8px;background:var(--n1-nuit);color:var(--n1-nuit-fg);font:800 9px/15px Manrope,sans-serif;font-style:normal;text-align:center}'+
 '.rsvf{position:relative;flex:0 0 calc(50% - 5px);min-height:110px;border-radius:16px;overflow:hidden;display:grid;place-items:center;background:color-mix(in srgb,var(--n1-muted) 22%,var(--n1-teinte));color:var(--n1-muted)}'+
 '.rsvf>svg{width:34px;height:34px;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;margin-bottom:18px}'+
 '.rsvf small{position:absolute;left:0;right:0;bottom:0;padding:6px 10px 8px;font-size:11.5px;font-weight:700;color:var(--n1-muted)}'+
 '.rsvok{position:absolute;top:8px;right:8px;width:22px;height:22px;border-radius:50%;background:var(--n1-ok,#3F8F5E);display:grid;place-items:center}.rsvok svg{width:14px;height:14px;fill:none;stroke:#fff;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}';
function addCss(){if(document.getElementById('rsvi-css'))return;var s=document.createElement('style');s.id='rsvi-css';s.textContent=css;document.head.appendChild(s)}
if(document.head)addCss();else document.addEventListener('DOMContentLoaded',addCss);
window.PCPH={kind:kind,nb:nbPh,vg:vg,ico:ico,mini:mini,grand:grand};
})();
