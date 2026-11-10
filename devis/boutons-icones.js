/* ProClik · une icône sur les boutons d'ajout et d'action (formulaire, plan client, plan de l'Espace).
   Demande de Cyril (10/11) : « plus facilement visible au premier coup d'œil, de partout ».
   L'icône se choisit d'après le texte du bouton ; les boutons qui ont déjà une icône ou un symbole sont laissés tels quels. */
(function(){
  var P={
    ft:'<path d="M3.5 19.5 9 5h11.5L15 19.5z"/><path d="M6.6 12.2h11.2M11.8 5l-5.4 14.5"/>',
    pf:'<rect x="6" y="2.5" width="12" height="19" rx="1"/><path d="M12 2.5v19M6 11h12"/>',
    win:'<rect x="3.5" y="4.5" width="17" height="15" rx="1.2"/><path d="M12 4.5v15M3.5 12h17"/>',
    door:'<path d="M5.5 21V4a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v17"/><path d="M3.5 21h17"/><circle cx="15" cy="12.5" r="1" fill="currentColor" stroke="none"/>',
    esc:'<path d="M3.5 20h4.5v-4h4.5v-4h4.5V8h3.5"/><path d="M3.5 20h17"/>',
    clo:'<rect x="9.5" y="3" width="5" height="18" rx="1"/><path d="M9.5 8l5 3M9.5 13l5 3"/>',
    wall:'<rect x="3" y="5" width="18" height="14" rx="1"/><path d="M3 9.7h18M3 14.3h18M9 5v4.7M15 9.7v4.6M9 14.3V19"/>',
    lvl:'<path d="M12 3 3 7.5 12 12l9-4.5z"/><path d="M3 12l9 4.5 9-4.5M3 16.5 12 21l9-4.5"/>',
    roof:'<path d="M2.5 13 12 4.5l9.5 8.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M10 20v-5h4v5"/>',
    room:'<path d="M4 4h16v16H4z"/><path d="M4 13h7v7"/>',
    del:'<path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13"/><path d="M10.5 11v5.5M13.5 11v5.5"/>',
    copy:'<rect x="8" y="8" width="12" height="12" rx="1.5"/><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8"/>',
    chev:'<path d="M5 3v18M12 3v18M19 3v18"/><path d="M9 10h6v4H9z"/>',
    cube:'<path d="M12 3 4 7.5v9L12 21l8-4.5v-9z"/><path d="M4 7.5 12 12l8-4.5M12 12v9"/>',
    opt:'<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
    photo:'<path d="M3.5 8.5A1.5 1.5 0 0 1 5 7h2.5L9 4.5h6L16.5 7H19a1.5 1.5 0 0 1 1.5 1.5V18A1.5 1.5 0 0 1 19 19.5H5A1.5 1.5 0 0 1 3.5 18z"/><circle cx="12" cy="13" r="3.5"/>',
    plan:'<path d="M3.5 4h17v16h-17z"/><path d="M11 4v6H3.5M11 14v6M15 10h5.5"/>',
    turn:'<path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M20 4v5h-5"/>',
    help:'<circle cx="12" cy="12" r="9"/><path d="M9.6 9.3a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.1-2.4 3.6"/><circle cx="12" cy="17" r=".9" fill="currentColor" stroke="none"/>',
    send:'<path d="M3 11.5 21 3l-6.5 18-3-7.5z"/><path d="M11.5 13.5 21 3"/>'
  };
  // Le premier texte qui correspond gagne : du plus précis au plus général.
  var R=[[/fen[êe]tres? de toit/i,'ft'],[/porte-fen[êe]tre/i,'pf'],[/fen[êe]tre/i,'win'],[/\bportes?\b/i,'door'],[/escalier/i,'esc'],[/cloison/i,'clo'],[/\bmurs?\b/i,'wall'],
    [/[ée]tage/i,'lvl'],[/combles|\btoit\b/i,'roof'],[/pi[èe]ce/i,'room'],[/supprimer|retirer/i,'del'],[/copier|dupliquer/i,'copy'],[/chevron/i,'chev'],[/\b3d\b/i,'cube'],
    [/^options$/i,'opt'],[/photo/i,'photo'],[/plan\b/i,'plan'],[/tourner/i,'turn'],[/je n'y arrive pas|besoin d'aide/i,'help'],[/envoyer/i,'send']];
  var SEL='button.btn,button.add,button.chip.add,#opp button,.sh-h button,button.bigbtn,label.drop b';
  // Boutons qui ont déjà leur icône, ou qu'il ne faut pas toucher (barre d'outils, étapes, choix Plan/3D, retour/continuer…).
  var SKIP='#cltools,#cltl,.pill,#nav,.cards,.modes,.cltool,.chips:not(.addrow)';
  function deco(b){
    if(b.dataset.bi)return;b.dataset.bi='1';
    if(b.querySelector('svg,img')||b.closest(SKIP))return;
    var t=(b.textContent||'').replace(/\s+/g,' ').trim();
    if(!t||t.length>48)return;
    // Déjà un symbole devant (✓, ↻, 🗑, ⧉, ✏️…) : on n'en ajoute pas un deuxième.
    if(/^[^\p{L}\p{N}+«(]/u.test(t))return;
    var k=null;for(var i=0;i<R.length;i++){if(R[i][0].test(t)){k=R[i][1];break}}
    if(!k)return;
    b.insertAdjacentHTML('afterbegin','<svg class="bi" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+P[k]+'</svg>');
  }
  function run(){document.querySelectorAll(SEL).forEach(deco)}
  var st=document.createElement('style');
  st.textContent='svg.bi{width:1.4em;height:1.4em;vertical-align:-.34em;margin-right:.45em;color:var(--mint,#A8823F);flex:none;display:inline-block}';
  document.head.appendChild(st);
  var q=false;function later(){if(q)return;q=true;requestAnimationFrame(function(){q=false;run()})}
  function go(){run();new MutationObserver(later).observe(document.body,{childList:true,subtree:true})}
  if(document.body)go();else document.addEventListener('DOMContentLoaded',go);
})();
