/* ================================================================================================
   Espace SANS DÉMO (Cyril 27/11 : « mettre l'Espace ProClik test sans les démos pour pouvoir faire les tests comme il se doit »).
   Pour le compte « ProClik Test » connecté : aucun client, chantier, devis, facture, dépense, équipe ni rendez-vous fictif.
   L'Espace part vide, comme pour un vrai nouvel artisan. Les autres comptes et le mode démo (non connecté) ne changent pas.
   Pour l'étendre plus tard à d'autres comptes : ajouter leur identifiant dans COMPTES.
   Chargé juste après entreprise.js (le rangement à part de l'appareil est déjà en place).

   Ce fichier fait trois choses :
   1) window.PCSANSDEMO = true quand c'est le bon compte (les écrans s'en servent pour ne rien inventer) ;
   2) PCDEMO.deep / PCDEMO.push ne posent plus aucun exemple ;
   3) NETTOYAGE : ce qui avait été enregistré dans le compte à partir des exemples (chantiers Alpes Kiné, Lopez…,
      équipe Thomas / Kevin / Mathieu / Lucas, tickets d'exemple…) est retiré, et SEULEMENT ça : on ne retire que les
      identifiants fixes des exemples, jamais ce qui a été créé (leurs identifiants portent l'heure de création).
      La version d'avant reste dans l'historique du service (30 jours, retour en arrière depuis l'Admin)
      et une copie est gardée sur l'appareil (pc-sd-sauve).
   ================================================================================================ */
(function(){'use strict';
var COMPTES=['test'];
function lit(k){try{var v=localStorage.getItem(k);return v==null?null:JSON.parse(v)}catch(e){return null}}
function apercu(){try{return sessionStorage.getItem('pc-apercu')==='1'}catch(e){return false}}
function compte(){var a=lit('pc-vrai-artisan');return a&&typeof a==='object'?String(a.code||''):''}
var exemple=/[?&]exemple=/.test(location.search);
var SANS=!exemple&&!!lit('pc-vrai-jeton')&&COMPTES.indexOf(compte())>=0;
window.PCSANSDEMO=SANS;
window.PCSD={comptes:COMPTES.slice(),pour:function(code){return COMPTES.indexOf(String(code||''))>=0},nettoyer:nettoyer};

/* ---------- les exemples, par leur identifiant fixe ---------- */
var CH_EX=['alpes','perrin','lopez','rey','fabre','durand','martin','garcia','bernard','tilleuls','roche'];/* chantiers et dossiers d'exemple */
var EQ_EX=['Thomas','Kevin','Mathieu','Lucas'];/* équipe d'exemple (equipe.js ; Kevin et Mathis de journee.js sont retirés par leur identifiant) */
var IDS={'pc-dep1':['d1','d2','d3','d4','d5','d6'],'pc-fa1':['f1','f2','f3','f4','f5','f6','f7','f8'],'pc-cmd1':['C-0012','C-0013'],
 'pc-dp7':['DP-013','DP-012','DP-010'],'pc-ent1':['e-perrin','e-rey','e-fabre','e-martin']};
function exCh(v){return CH_EX.indexOf(String(v))>=0}
function exP(n){return EQ_EX.indexOf(String(n))>=0}

/* Une passe sur les tiroirs : renvoie la liste des tiroirs changés. */
function nettoyer(){var chg=[],L=[];
 function garde(k,v,av){var s=JSON.stringify(v);if(s!==av){L.push([k,av]);try{localStorage.setItem(k,s)}catch(e){}chg.push(k)}}
 function brut(k){try{return localStorage.getItem(k)}catch(e){return null}}
 /* listes à identifiant */
 Object.keys(IDS).forEach(function(k){var av=brut(k),v=lit(k);if(!Array.isArray(v))return;
  garde(k,v.filter(function(x){return !(x&&IDS[k].indexOf(x.id)>=0)}),av)});
 /* chantiers : objet rangé par identifiant */
 (function(){var k='pc-ch9',av=brut(k),v=lit(k);if(!v||typeof v!=='object'||Array.isArray(v))return;var o={};
  Object.keys(v).forEach(function(id){if(!exCh(id))o[id]=v[id]});garde(k,o,av)})();
 /* l'équipe de la journée de chantier : les 4 personnes d'exemple ajoutées d'office (e1…e4) */
 var EQS=[];
 (function(){var k='pc-eq',av=brut(k),v=lit(k);if(!Array.isArray(v))return;
  var n=v.filter(function(x){var ex=x&&(/^e[1-4]$/.test(String(x.id))&&exP(x.p)||x.id==='s1'&&x.p==='Kevin'||x.id==='s2'&&x.p==='Mathis');if(ex)EQS.push(x.id);return !ex});garde(k,n,av)})();
 /* une vraie personne qui porte un prénom de l'exemple (ajoutée par vous) n'est jamais retirée */
 var VRAIS=(lit('pc-eq')||[]).map(function(x){return x&&x.p});function exP2(n){return exP(n)&&VRAIS.indexOf(n)<0}
 /* heures en plus des personnes d'exemple */
 (function(){var k='pc-hs',av=brut(k),v=lit(k);if(!Array.isArray(v)||!EQS.length)return;garde(k,v.filter(function(x){return !(x&&EQS.indexOf(x.s)>=0)}),av)})();
 /* planning de l'équipe (equipe.js) : on retire les personnes et les chantiers d'exemple, on garde le reste */
 (function(){var k='pc-eq2',av=brut(k),S=lit(k);if(!S||typeof S!=='object')return;
  ['jr','ta','pub'].forEach(function(c){var J=S[c];if(!J||typeof J!=='object')return;Object.keys(J).forEach(function(j){var o=J[j];if(!o||typeof o!=='object')return;
   Object.keys(o).forEach(function(n){var val=o[n],ch=typeof val==='string'?val.split('|')[0]:'';if(exP2(n)||exCh(ch))delete o[n]});if(!Object.keys(o).length)delete J[j]})});
  ['bes','env','prev'].forEach(function(c){var B=S[c];if(!B||typeof B!=='object')return;Object.keys(B).forEach(function(id){if(exCh(id))delete B[id]})});
  if(Array.isArray(S.abs))S.abs=S.abs.filter(function(a){return !(a&&(exP2(a.qui)||a.id==='a1'&&a.mo==='Mariage de ma sœur'))});
  garde(k,S,av)})();
 /* liste du chantier partagée (roles.js) : les 3 lignes d'exemple et les listes des chantiers d'exemple */
 (function(){var k='pc-liste',av=brut(k),v=lit(k);if(!v||typeof v!=='object')return;
  Object.keys(v).forEach(function(ch){if(exCh(ch)){delete v[ch];return}if(Array.isArray(v[ch]))v[ch]=v[ch].filter(function(x){return !(x&&/^l[1-3]$/.test(String(x.id)))})});garde(k,v,av)})();
 /* rendez-vous ajoutés : seulement ceux posés sur un chantier d'exemple */
 (function(){var k='pc-ev1',av=brut(k),v=lit(k);if(!Array.isArray(v))return;garde(k,v.filter(function(e){return !(e&&e.x&&exCh(e.x.ch))}),av)})();
 /* factures fournisseur d'exemple marquées payées */
 (function(){var k='pc-rc1',av=brut(k),v=lit(k);if(!v||typeof v!=='object')return;delete v.r1;delete v.r2;garde(k,v,av)})();
 /* copie de ce qui a été retiré, sur l'appareil (au cas où) */
 if(L.length)try{var sv=lit('pc-sd-sauve')||{};L.forEach(function(z){sv[z[0]]={le:Date.now(),val:z[1]}});localStorage.setItem('pc-sd-sauve',JSON.stringify(sv))}catch(e){}
 /* les tiroirs nettoyés repartiront au compte : notés ici, envoyés quand sync.js a fini de relire le compte */
 if(chg.length)try{var ap=lit('pc-sd-apousser')||[];chg.forEach(function(k){if(ap.indexOf(k)<0)ap.push(k)});localStorage.setItem('pc-sd-apousser',JSON.stringify(ap))}catch(e){}
 return chg}

if(!SANS)return;
document.documentElement.classList.add('pcsd');
/* les petites mentions « exemple » qui resteraient (aucun exemple n'est affiché pour ce compte) */
try{var st=document.createElement('style');st.textContent='html.pcsd .exemple,html.pcsd .vexemple,html.pcsd .exn,html.pcsd .tdb-ex,html.pcsd .tb-ex,html.pcsd .eq-ex,html.pcsd .cad-n{display:none!important}';document.head.appendChild(st)}catch(e){}
/* 2) plus aucun exemple posé par la démo */
var P=window.PCDEMO;
if(P){P.deep=function(o){if(Array.isArray(o)){o.length=0;return o}if(o&&typeof o==='object'){Object.keys(o).forEach(function(k){delete o[k]});return o}return o};
 P.push=function(a){return a&&a.length||0}}
/* 3) nettoyage des exemples déjà enregistrés */
nettoyer();
/* Quand sync.js a relu le compte (état « ok »), on renvoie les tiroirs nettoyés : écrits de nouveau, sync.js les voit
   changer et les envoie. Ce qui vient d'arriver d'un autre appareil est nettoyé aussi. Une seule fois par ouverture. */
var fait=0;document.addEventListener('pc-sync',function(e){if(fait||!e.detail||e.detail.t!=='ok'||apercu())return;fait=1;
 nettoyer();var ap=lit('pc-sd-apousser')||[];if(!ap.length)return;
 ap.forEach(function(k){try{var v=localStorage.getItem(k);if(v!=null)localStorage.setItem(k,v)}catch(x){}});
 try{localStorage.removeItem('pc-sd-apousser')}catch(x){}});
})();
