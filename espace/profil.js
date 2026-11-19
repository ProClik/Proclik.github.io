/* Nom du profil en exposant à côté de « ProClik », en haut de l'Espace (choix de Cyril, 18/11 : exposant laiton).
   ARCHI pour un architecte, TEAM pour une entreprise à plusieurs, PRO pour quelqu'un qui travaille seul.
   Le profil vient de la fiche Admin : choix « profil » s'il est fait, sinon l'activité (archi…) puis le nombre de personnes.
   Mode démo : window.PC_PROFIL_DEMO (vide = rien). */
(function(){
var d=document,MOTS={archi:'ARCHI',pro:'PRO',team:'TEAM'},fixe=false;
var st=d.createElement('style');
st.textContent='.brand .pc-prof{font:700 8.5px/0 Manrope,system-ui,-apple-system,sans-serif;letter-spacing:.18em;color:var(--n1-laiton,#A8823F);margin-left:4px;vertical-align:8px;font-style:normal;white-space:nowrap}';
d.head.appendChild(st);
function mot(a){
 if(!a)return '';
 if(a.profil&&MOTS[a.profil])return MOTS[a.profil];
 if(/archi/i.test(String(a.activite||'')))return 'ARCHI';
 if((+a.effectif||0)>=2)return 'TEAM';
 return 'PRO';
}
function ecrit(m){
 d.querySelectorAll('.brand>div').forEach(function(el){
  var s=el.querySelector('.pc-prof');
  if(!m){if(s)s.remove();return}
  if(!s){s=d.createElement('sup');s.className='pc-prof';el.insertBefore(s,el.querySelector('small'))}
  s.textContent=m;
 });
}
/* appelé par vrai.js quand l'artisan est connu (connexion, aperçu Admin) ou se déconnecte (null) */
function pose(a){fixe=!!a;ecrit(a?mot(a):(window.PC_PROFIL_DEMO||''))}
window.PCProfil={pose:pose,mot:mot};
function demo(){if(!fixe)ecrit(window.PC_PROFIL_DEMO||'')}
if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',demo);else demo();
})();
