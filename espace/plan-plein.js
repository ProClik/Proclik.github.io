/* Plan en plein écran (demande de Cyril, 02/11) : le plan, ouvert dans l'Espace, demande à passer par-dessus tout.
   L'iPhone refuse le vrai plein écran hors vidéo : on pose le cadre du plan sur toute la page, et on le remet ensuite. */
(function(){
var avant=new WeakMap();
function cadre(src){return [].filter.call(document.querySelectorAll('iframe'),function(f){return f.contentWindow===src})[0]}
addEventListener('message',function(e){var d=e.data||{};if(d.type!=='proclik-plan-plein')return;var f=cadre(e.source);if(!f)return;
 if(d.on){if(!avant.has(f))avant.set(f,f.getAttribute('style'));
  f.setAttribute('style','position:fixed!important;left:0!important;top:0!important;right:0!important;bottom:0!important;width:100%!important;height:100%!important;max-height:none!important;min-height:0!important;margin:0!important;border:0!important;border-radius:0!important;z-index:2147483000!important;background:var(--bg,#EEF0F4)!important');
  document.documentElement.classList.add('pc-plan-plein')}
 else if(avant.has(f)){var s=avant.get(f);if(s==null)f.removeAttribute('style');else f.setAttribute('style',s);avant.delete(f);document.documentElement.classList.remove('pc-plan-plein')}});
/* Le cadre fermé en plein écran : on remet tout en place à la prochaine ouverture */
new MutationObserver(function(){[].forEach.call(document.querySelectorAll('iframe'),function(f){if(avant.has(f)&&!f.offsetParent&&f.closest('[hidden]')){var s=avant.get(f);if(s==null)f.removeAttribute('style');else f.setAttribute('style',s);avant.delete(f);document.documentElement.classList.remove('pc-plan-plein');try{f.contentWindow.postMessage({type:'proclik-plan-plein-off'},'*')}catch(x){}}})}).observe(document.body,{attributes:true,subtree:true,attributeFilter:['hidden']});
})();
