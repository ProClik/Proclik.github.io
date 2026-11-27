/* Espace ProClik : bloc « Mon entreprise » en haut des Réglages (signalement n°88, Cyril 27/11 :
   « je ne vois pas où rentrer mes habitudes… il faudrait un menu Mon entreprise avec tout dedans »).
   Tout ce qui concerne l'entreprise (identité, TVA, habitudes de chantier, achats, couleur du formulaire, options)
   est regroupé dans une carte à part, au-dessus des réglages de l'appli (rangés sous « L'Espace »).
   Les lignes gardent leur propre fonctionnement : on ne fait que les déplacer.
   Au passage : « Mes options », « Mes habitudes » et « Mon compte » n'apparaissaient plus, parce que le titre
   « Votre espace » est maintenant affiché « Réglages » (ecrans-forme.js) ; ils lisent le titre d'origine. */
(function(){
var d=document,$=function(s,r){return (r||d).querySelector(s)};
var ORDRE=['m-id','rg-ftva','hb-ligne','m-achats','rg-fcoul','mo-opt'];
function reglages(){var t=$('#x-t'),x=$('#xsheet');return !!(t&&x&&x.classList.contains('on')&&(t.dataset.f2t||t.textContent)==='Votre espace')}
var occupe=false;
function ranger(){
  if(occupe||!reglages())return;var c=$('#x-in .card.menu');if(!c)return;occupe=true;
  try{
    if(window.PCMesOptions&&PCMesOptions.poser)PCMesOptions.poser();
    if(window.PCHabitudes&&PCHabitudes.poser)PCHabitudes.poser();
    var m=$('#rg-moi');
    if(!m){
      var h=d.createElement('h3');h.id='rg-moi-t';h.className='rg-tt';h.textContent='Mon entreprise';
      m=d.createElement('div');m.className='card';m.id='rg-moi'; /* PAS « menu » : les autres scripts posent leurs lignes dans le 1er « #x-in .card.menu » (erreur auto n°89) */
      var h2=d.createElement('h3');h2.id='rg-esp-t';h2.className='rg-tt';h2.textContent='L’Espace';
      c.parentNode.insertBefore(h,c);c.parentNode.insertBefore(m,c);c.parentNode.insertBefore(h2,c);
    }
    /* une ligne posée en retard dans la carte du bas (son script ne la voit plus) : on garde la plus récente, une seule fois */
    ORDRE.forEach(function(id){var L=d.querySelectorAll('#x-in [id="'+id+'"]');if(!L.length)return;var b=L[L.length-1];
      for(var i=0;i<L.length-1;i++)L[i].parentNode.removeChild(L[i]);m.appendChild(b)});
  }finally{setTimeout(function(){occupe=false},0)}
}
var att=null;function plus_tard(){clearTimeout(att);att=setTimeout(ranger,30)}
function brancher(){var xi=$('#x-in');if(!xi){setTimeout(brancher,500);return}
  new MutationObserver(function(){if(!occupe)plus_tard()}).observe(xi,{childList:true,subtree:true});
  var t=$('#x-t');if(t)new MutationObserver(plus_tard).observe(t,{childList:true,characterData:true,subtree:true})}
brancher();
var st=d.createElement('style');
st.textContent='#rg-moi-t:has(+ #rg-moi[hidden]){display:none}#xsheet .rg-tt{margin:18px 2px 8px}#xsheet #rg-moi-t{margin-top:10px}'+
 '#rg-moi>button,#rg-moi>div{display:flex;align-items:center;gap:12px;padding:14px 2px;border-bottom:1px solid var(--line);text-align:left;width:100%}'+
 '#rg-moi>*:last-child{border-bottom:0}#rg-moi .tx{flex:1}#rg-moi small{display:block;color:var(--muted);font-size:12.5px}'+
 'html.f2on.f2pg body #xsheet #rg-moi>button{border-bottom:1px solid var(--z-line)!important;background:transparent!important;box-shadow:none!important}html.f2on.f2pg body #xsheet #rg-moi>button:last-child{border-bottom:0!important}';
d.head.appendChild(st);
})();
