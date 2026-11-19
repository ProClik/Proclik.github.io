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
 '.pcpi{display:inline-flex;align-items:center;gap:4px;white-space:nowrap}.pcpi svg{width:14px;height:14px;flex:none;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}'+
 '.rsvf{position:relative;flex:0 0 calc(50% - 5px);min-height:110px;border-radius:16px;overflow:hidden;display:grid;place-items:center;background:color-mix(in srgb,var(--n1-muted) 22%,var(--n1-teinte));color:var(--n1-muted)}'+
 '.rsvf>svg{width:34px;height:34px;fill:none;stroke:currentColor;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round;margin-bottom:18px}'+
 '.rsvf small{position:absolute;left:0;right:0;bottom:0;padding:6px 10px 8px;font-size:11.5px;font-weight:700;color:var(--n1-muted)}'+
 '.rsvok{position:absolute;top:8px;right:8px;width:22px;height:22px;border-radius:50%;background:var(--n1-ok,#3F8F5E);display:grid;place-items:center}.rsvok svg{width:14px;height:14px;fill:none;stroke:#fff;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}';
function addCss(){if(document.getElementById('rsvi-css'))return;var s=document.createElement('style');s.id='rsvi-css';s.textContent=css;document.head.appendChild(s)}
if(document.head)addCss();else document.addEventListener('DOMContentLoaded',addCss);
/* icône de pièce (Cyril 19/11 : « met un icône sur les pièces »), mêmes dessins que le formulaire */
var PC=[[/accueil|boutique|magasin|comptoir/i,'<path d="M4 9.5 5.5 5h13L20 9.5"/><path d="M4 9.5c0 1.5 1.3 2.5 2.7 2.5S9.3 11 9.3 9.5c0 1.5 1.3 2.5 2.7 2.5s2.7-1 2.7-2.5c0 1.5 1.3 2.5 2.6 2.5S20 11 20 9.5"/><path d="M5.5 12v8h13v-8M10 20v-4.5h4V20"/>'],
 [/s[ée]jour|salon|attente|pi[eè]ce de vie/i,'<path d="M5 12V9a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3"/><path d="M3.5 13a1.5 1.5 0 0 1 3 0v1.5h11V13a1.5 1.5 0 0 1 3 0v4.5h-17zM6 17.5V19M18 17.5V19"/>'],
 [/cuisine/i,'<path d="M5 11h14v2.5a6 6 0 0 1-6 6h-2a6 6 0 0 1-6-6z"/><path d="M3.5 11h17M9 8c0-1.2 1-1.2 1-2.4M13 8c0-1.2 1-1.2 1-2.4"/>'],
 [/chambre|cabinet|soin/i,'<path d="M3.5 18.5V6M3.5 14h17v4.5M20.5 14v-2a2.5 2.5 0 0 0-2.5-2.5h-7V14"/><circle cx="7.5" cy="11.2" r="1.7"/>'],
 [/bain|sdb|douche|wc|toilette|sanitaire/i,'<path d="M4 12h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M6 12V6a2 2 0 0 1 3.6-1.2M8 19l-1 1.5M16 19l1 1.5"/>'],
 [/couloir|entr[ée]e|d[ée]gagement|palier|hall/i,'<rect x="6.5" y="3.5" width="11" height="17" rx="1"/><path d="M14.5 12.5h.01"/><path d="M3.5 20.5h17"/>'],
 [/bureau/i,'<rect x="4" y="4.5" width="16" height="10.5" rx="1.2"/><path d="M9 19.5h6M12 15v4.5"/>'],
 [/garage|cave|atelier/i,'<path d="M3.5 10 12 4.5 20.5 10V20H3.5z"/><path d="M7 20v-7.5h10V20M7 15h10M7 17.5h10"/>'],
 [/./,'<path d="M4 11 12 4.5 20 11"/><path d="M6 9.5V19.5h12V9.5"/><path d="M10 19.5v-5h4v5"/>']];
function piece(n){for(var j=0;j<PC.length;j++)if(PC[j][0].test(n||''))return svg(PC[j][1]);return ''}
window.PCPH={piece:piece,kind:kind,nb:nbPh,vg:vg,ico:ico,mini:mini,grand:grand};
})();
