/* Photos de démonstration des réserves, au style ProClik (Cyril 19/11) :
   petits dessins au trait crème sur bleu nuit (avant), bleu nuit sur crème (après),
   le défaut marqué d'une touche laiton. Vignette réduite + mini diaporama s'il y a plusieurs photos. */
(function(){
var NUIT='#1B2440',NUIT2='#2B3558',CREME='#F2EEE4',CREME2='#E4DED0',LAITON='#C9A262';
function kindOf(t){t=(t||'').toLowerCase();
 if(/spot|lumi|lampe|prise|interrupt|électr|elec/.test(t))return 'spot';
 if(/joint|lavabo|fuit|fuite|robinet|évier|douche|eau/.test(t))return 'eau';
 if(/plafond|bande|fissure|décoll|peinture|enduit/.test(t))return 'plaf';
 return 'mur'}
var D={
 spot:function(l,a){return '<path d="M0 15H60" stroke="'+l+'"/><path d="M24 15c0 5 2.7 8 6 8s6-3 6-8" stroke="'+l+'"/>'+
  (a?'':'<path d="M22 28l-3 4M30 30v5M38 28l3 4" stroke="'+a+'" stroke-dasharray="2 2"/>')+'<path d="M8 15v38M52 15v38" stroke="'+l+'" opacity=".35"/><rect x="18" y="40" width="24" height="13" rx="2" stroke="'+l+'" opacity=".6"/>'},
 eau:function(l,a,ap){return '<path d="M0 22H60" stroke="'+l+'" opacity=".35"/><path d="M14 30h32c0 9-7 14-16 14s-16-5-16-14z" stroke="'+l+'"/><path d="M26 30v-8c0-3 2-5 5-5h5" stroke="'+l+'"/><path d="M28 44v9M32 44v9" stroke="'+l+'" opacity=".6"/>'+
  (ap?'':'<path d="M44 33c0 0-3 3.5-3 5.5a3 3 0 006 0c0-2-3-5.5-3-5.5z" fill="'+a+'" stroke="none"/>')},
 plaf:function(l,a,ap){return '<path d="M0 14H60" stroke="'+l+'"/><path d="M20 56V26h20v30" stroke="'+l+'"/><path d="M8 14v42M52 14v42" stroke="'+l+'" opacity=".35"/>'+
  (ap?'':'<path d="M14 14c4 0 6 1 9 4s6 3 8 1" stroke="'+a+'"/>')},
 mur:function(l,a){return '<path d="M0 46L20 38V8M20 38H60M20 38" stroke="'+l+'" opacity=".55"/><rect x="30" y="16" width="18" height="14" rx="1.5" stroke="'+l+'"/><path d="M39 16v14M30 23h18" stroke="'+l+'" opacity=".6"/>'+
  '<circle cx="12" cy="30" r="4.5" stroke="'+a+'"/>'}};
function scene(kind,ap,nb){var b1=ap?CREME:NUIT2,b2=ap?CREME2:NUIT,
  l=ap?NUIT:CREME;
 return '<svg viewBox="0 0 60 60" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="60" height="60" fill="'+b2+'"/><circle cx="6" cy="4" r="44" fill="'+b1+'" opacity=".8"/><g fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'+
  (D[kind]||D.mur)(l,LAITON,ap)+'</g>'+
  (ap&&!nb?'<circle cx="49" cy="11" r="6" fill="'+LAITON+'"/><path d="M46.3 11.2l1.9 1.9 3.6-3.8" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>':'')+'</svg>'}
/* photos d'une réserve : [dessin, légende] */
function list(r,jour){var k=kindOf(r.t),L=[];
 if(r.ph)L.push([scene(k,0),'Avant · '+(r.d||'')]);
 if(r.st&&r.st!=='ouv')L.push([scene(k,1),'Après · '+(r.dc||jour||'')]);
 (r.phx||[]).forEach(function(x){L.push([scene(k,0),'De '+x[0]+' · '+x[1]])});
 return L}
/* vignette : diaporama si plusieurs photos ; numéro gardé en haut à gauche */
function vg(r,i,rn){var L=list(r),n=L.length;
 return '<span class="pcv'+(n?'':' vide')+'"'+(n>1?' data-n="'+n+'"':'')+'>'+
  (n?L.map(function(p,j){return '<span class="pcv-s'+(j?'':' on')+'">'+p[0]+'</span>'}).join(''):'<svg class="pcv-ic" viewBox="0 0 24 24"><path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>')+
  (n>1?'<span class="pcv-d">'+L.map(function(p,j){return '<i'+(j?'':' class="on"')+'></i>'}).join('')+'</span>':'')+
  '<b class="'+rn+'">'+(i+1)+'</b></span>'}
var css='.pcv{position:relative;width:38px;height:38px;flex:none;border-radius:11px;display:grid;place-items:center;color:var(--n1-muted);box-shadow:0 2px 6px rgba(14,19,34,.14)}'+
 '.pcv.vide{background:var(--n1-teinte);box-shadow:none;border:1.5px dashed color-mix(in srgb,var(--n1-muted) 40%,transparent)}'+
 '.pcv-ic{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linejoin:round}'+
 '.pcv-s{position:absolute;inset:0;border-radius:11px;overflow:hidden;opacity:0;transition:opacity .6s ease}.pcv-s.on{opacity:1}.pcv-s svg{display:block;width:100%;height:100%}'+
 '.pcv-d{position:absolute;left:0;right:0;bottom:3px;display:flex;justify-content:center;gap:2px}.pcv-d i{width:3px;height:3px;border-radius:50%;background:rgba(255,255,255,.5);box-shadow:0 0 0 .5px rgba(14,19,34,.35)}.pcv-d i.on{background:#fff}'+
 '.pcv>b{position:absolute!important;top:-5px;left:-5px;width:17px!important;height:17px!important;font-size:9.5px!important;margin:0!important;z-index:2;box-shadow:0 0 0 2px var(--n1-calme)}'+
 '.pcf{position:relative;flex:0 0 calc(50% - 5px);min-height:110px;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(14,19,34,.15)}.pcf svg{position:absolute;inset:0;width:100%;height:100%}'+
 '.pcf small{position:absolute;left:0;right:0;bottom:0;padding:14px 10px 7px;font-size:11.5px;font-weight:700;color:#fff;background:linear-gradient(transparent,rgba(14,19,34,.6))}'+
 '.pcf-ok{position:absolute;top:8px;right:8px;width:24px;height:24px;border-radius:50%;background:#C9A262;display:grid;place-items:center}.pcf-ok svg{width:14px;height:14px;fill:none;stroke:#fff;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}'+
 '@media (prefers-reduced-motion:reduce){.pcv-s{transition:none}}';
function addCss(){if(document.getElementById('pcv-css'))return;var s=document.createElement('style');s.id='pcv-css';s.textContent=css;document.head.appendChild(s)}
if(document.head)addCss();else document.addEventListener('DOMContentLoaded',addCss);
/* le diaporama : une photo toutes les 2,4 s */
setInterval(function(){[].forEach.call(document.querySelectorAll('.pcv[data-n]'),function(v){var S=v.querySelectorAll('.pcv-s'),Dd=v.querySelectorAll('.pcv-d i'),k=0;
 for(var j=0;j<S.length;j++)if(S[j].classList.contains('on'))k=j;var m=(k+1)%S.length;
 S[k].classList.remove('on');S[m].classList.add('on');if(Dd[k])Dd[k].classList.remove('on');if(Dd[m])Dd[m].classList.add('on')})},2400);
/* grande photo de la fiche */
function grand(r,kAp,lab){return '<span class="pcf">'+scene(kindOf(r.t),kAp,1)+(kAp?'<em class="pcf-ok"><svg viewBox="0 0 16 16"><path d="M4 8.3l2.6 2.6L12 5.4"/></svg></em>':'')+'<small>'+String(lab).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})+'</small></span>'}
window.PCPH={kindOf:kindOf,scene:scene,list:list,vg:vg,grand:grand};
})();
