/* Bouton « Présentation » de l'Espace BRS : visible SEULEMENT sur un appareil où Cyril a ouvert une fois
   …/espace/?presentation=1 (…?presentation=0 le retire). L'artisan ne le voit jamais sur le sien.
   Aussi : …/espace/?ouvrir=planning (ou devis, factures…) ouvre directement cet onglet, pour les liens du kit. */
(function(){
  var K='pc-presentation',q;
  try{q=new URLSearchParams(location.search)}catch(e){return}
  try{var v=q.get('presentation');if(v==='1')localStorage.setItem(K,'1');else if(v==='0')localStorage.removeItem(K)}catch(e){}
  var on=false;try{on=localStorage.getItem(K)==='1'}catch(e){}
  function pose(){
    if(!on||document.getElementById('pc-pres'))return;
    var r=document.querySelector('.head-r');if(!r)return;
    var a=document.createElement('a');a.id='pc-pres';a.className='icon-b';a.href='presentation.html';a.setAttribute('aria-label','Présentation');a.title='Présentation';
    a.style.cssText='display:grid;place-items:center;color:inherit;text-decoration:none';
    a.innerHTML='<svg width="19" height="19" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h18M5 4v10h14V4M12 14v3M8 21l4-4 4 4"/></svg>';
    r.insertBefore(a,r.firstChild);
  }
  function ouvre(){var o=q.get('ouvrir');if(!o||!/^[a-z]+$/.test(o))return;var b=document.getElementById('tt-'+o)||document.getElementById('nb-'+o);if(b)b.click()}
  function go(){pose();setTimeout(ouvre,400)}
  if(document.readyState==='complete')go();else addEventListener('load',go);
})();
