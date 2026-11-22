/* Produits de l'Espace (demande de Cyril, 02/11) : tous les produits et prestations de l'artisan, au même endroit.
   - Une icône par produit (vis, BA13, ossature, laine, outils…) choisie en premier : une recherche, puis les icônes habituelles.
     Elle sert d'aide visuelle et range les produits par famille (liste des fournitures, lignes du pré-devis).
   - Produit : désignation, prix HT, unité (u, m², ml…). Prestation : un ouvrage tout compris, ex. « Pose cloison simple peau… 50 €/m² ».
   - Une seule base, partagée avec « + Ajouter une ligne » du pré-devis : pc-base1 = [{c,d,u,p,t}] plus des champs facultatifs
     i (icône), k ('produit' ou 'prestation'), f (famille), x (détail d'une prestation).
   - window.PCPROD pour les autres écrans : icone(i), liste(), chercher(texte), ajouter(p), creer(nom, rappel), famille(p).
   Démo : gardé sur l'appareil. Avec Cliky, un produit créé part aussi vers la base de Cliky (vérifié par ProClik). */
(function(){
"use strict";
var X=window.PCX;
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
var esc=X&&X.esc||function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var lsG=function(k,d){try{var v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}};
var lsS=function(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
var prix=function(n){var s=(Math.round((+n||0)*100)/100).toFixed(2).split('.');return s[0].replace(/\B(?=(\d{3})+(?!\d))/g,' ')+','+s[1]+' €'};
var num=function(s){var n=parseFloat(String(s||'').replace(/\s/g,'').replace(',','.'));return isFinite(n)?Math.round(n*100)/100:0};
var sansAcc=function(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')};

/* ---------- les icônes (même trait que le menu de l'Espace) ---------- */
var I=function(p){return '<svg viewBox="0 0 24 24" aria-hidden="true">'+p+'</svg>'};
/* clé : [nom affiché, dessin, famille proposée, mots pour la recherche] */
var ICO={
 ba13:['Plaque BA13','<rect x="5" y="3" width="11" height="17" rx="1"/><path d="M8 3v17"/><path d="M16 6l3 1v14l-11-1"/>','Plaques et cloisons','placo plaque platre ba13 hydro phonique'],
 ossature:['Ossature','<path d="M5 3v18M5 3h4v18H5"/><path d="M15 3v18M15 3h4v18h-4"/><path d="M9 8h6M9 16h6"/>','Ossature','rail montant m48 r48 fourrure f47 metal'],
 laine:['Laine','<path d="M3 7q3-3 6 0t6 0 6 0"/><path d="M3 12q3-3 6 0t6 0 6 0"/><path d="M3 17q3-3 6 0t6 0 6 0"/>','Isolation','laine isolant verre roche isolation'],
 polystyrene:['Isolant rigide','<rect x="3" y="6" width="18" height="12" rx="1.5"/><circle cx="8" cy="10" r="1"/><circle cx="14" cy="9.5" r="1"/><circle cx="11" cy="14" r="1"/><circle cx="17" cy="14" r="1"/>','Isolation','polystyrene pse panneau rigide xps'],
 vis:['Vis','<path d="M12 2v3"/><path d="M8 5h8l-1 3H9z"/><path d="M10 8v9l2 4 2-4V8"/><path d="M10 11l4-1M10 14l4-1"/>','Visserie et fixations','vis ttpc visserie'],
 cheville:['Cheville','<path d="M6 9h10l3 3-3 3H6z"/><path d="M9 9v6M12 9v6"/><path d="M2 12h4"/>','Visserie et fixations','cheville fixation pointe pulsa clou'],
 enduit:['Enduit','<path d="M5 8h14l-1.5 12h-11z"/><path d="M5 8c0-2.2 3.1-4 7-4s7 1.8 7 4"/><path d="M9 12h6"/>','Enduits et bandes','enduit seau sac platre joint mortier colle'],
 bande:['Bande','<circle cx="10" cy="12" r="6"/><circle cx="10" cy="12" r="2"/><path d="M10 18h10"/>','Enduits et bandes','bande joint papier armee angle rouleau'],
 cartouche:['Mastic','<rect x="4" y="9" width="12" height="6" rx="1.5"/><path d="M16 11h3l2 1-2 1h-3"/><path d="M2 12h2"/>','Enduits et bandes','mastic silicone acrylique cartouche colle'],
 fenetre:['Fenêtre','<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M12 3v18M4 12h16"/>','Menuiserie','fenetre pvc alu vitrage baie volet'],
 porte:['Porte','<path d="M6 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17"/><path d="M3 21h18"/><circle cx="15" cy="12" r="1"/>','Menuiserie','porte bloc-porte huisserie bati'],
 bois:['Bois','<path d="M3 8h18v8H3z"/><path d="M7 11h6M10 14h7"/><circle cx="17" cy="10.5" r="1"/>','Menuiserie','bois tasseau planche chevron osb plinthe'],
 carrelage:['Carrelage','<rect x="3" y="3" width="18" height="18" rx="1.5"/><path d="M3 12h18M12 3v18"/>','Sols','carrelage faience gres sol mur'],
 parquet:['Parquet','<path d="M3 5h18v14H3z"/><path d="M3 9.7h18M3 14.3h18M9 5v4.7M15 9.7v4.6M7 14.3V19"/>','Sols','parquet stratifie sol lame plinthe'],
 peinture:['Peinture','<rect x="4" y="3" width="14" height="6" rx="1.5"/><path d="M18 6h2v5h-8v3"/><rect x="10.5" y="14" width="3" height="7" rx="1"/>','Peinture','peinture rouleau sous-couche'],
 elec:['Électricité','<path d="M13 2L5 13h6l-1 9 8-11h-6z"/>','Électricité','electricite prise interrupteur cable gaine spot'],
 eau:['Plomberie','<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>','Plomberie','plomberie eau tuyau cuivre per evacuation'],
 outils:['Outils','<path d="M14.5 6.5a4 4 0 0 0 5 5L12 19a2.1 2.1 0 0 1-3-3z"/><path d="M14.5 6.5l3-3a4 4 0 0 1-3 3z"/>','Outillage','outil outillage cle marteau disque lame'],
 casque:['Main-d\'œuvre','<path d="M4 16a8 8 0 0 1 16 0"/><path d="M3 16h18v2H3z"/><path d="M10 8V5h4v3"/>','Main-d\'œuvre','main oeuvre heure pose ouvrier casque prestation'],
 camion:['Livraison','<path d="M3 6h11v10H3z"/><path d="M14 9h4l3 3v4h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>','Divers','livraison transport camion trajet'],
 benne:['Déchets','<path d="M3 9h18l-2 10H5z"/><path d="M8 9l1-4h6l1 4"/>','Divers','dechets benne evacuation gravats nettoyage'],
 protection:['Protection','<path d="M12 3l7 3v6c0 4.4-3 7.7-7 9-4-1.3-7-4.6-7-9V6z"/><path d="M9 12l2 2 4-4"/>','Divers','protection bache nettoyage film'],
 colis:['Autre','<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>','Divers','autre divers produit carton']};
var ORDRE=Object.keys(ICO);
var FAV0=['ba13','vis','ossature','laine','enduit','outils'];
var FAMS=['Plaques et cloisons','Ossature','Isolation','Visserie et fixations','Enduits et bandes','Menuiserie','Sols','Peinture','Électricité','Plomberie','Outillage','Main-d\'œuvre','Divers'];
/* anciennes familles de la base du pré-devis → familles et icônes d'ici */
var TF={'Plâtrerie':['Plaques et cloisons','ba13'],'Menuiserie':['Menuiserie','fenetre'],'Main-d\'œuvre':['Main-d\'œuvre','casque'],'Sols':['Sols','parquet'],'Divers':['Divers','protection']};
function icone(i){var x=ICO[i];return x?I(x[1]):''}
function famille(p){return p&&(p.f||(TF[p.t]||[])[0]||p.t)||'Divers'}
function icoDe(p){return p&&(p.i||(TF[p.t]||[])[1])||''}
function genre(p){return p&&(p.k||(TF[p.t]&&!p.f?'prestation':'produit'))}

/* ---------- la base (la même que « + Ajouter une ligne » du pré-devis) ---------- */
var EX=[{c:'EX-BA13',d:'Plaque BA13 standard 120 × 250',u:'u',p:7.9,i:'ba13',k:'produit',f:'Plaques et cloisons',ex:1},
 {c:'EX-BA13H',d:'Plaque BA13 hydro 120 × 250',u:'u',p:11.4,i:'ba13',k:'produit',f:'Plaques et cloisons',ex:1},
 {c:'EX-M48',d:'Montant M48 · 3 m',u:'u',p:4.2,i:'ossature',k:'produit',f:'Ossature',ex:1},
 {c:'EX-R48',d:'Rail R48 · 3 m',u:'u',p:3.6,i:'ossature',k:'produit',f:'Ossature',ex:1},
 {c:'EX-L45',d:'Laine minérale 45 mm',u:'m²',p:4.1,i:'laine',k:'produit',f:'Isolation',ex:1},
 {c:'EX-TTPC',d:'Vis TTPC 25 · boîte de 1 000',u:'boîte',p:14.9,i:'vis',k:'produit',f:'Visserie et fixations',ex:1},
 {c:'EX-BJ',d:'Bande à joint · rouleau 150 m',u:'rouleau',p:6.5,i:'bande',k:'produit',f:'Enduits et bandes',ex:1},
 {c:'EX-EJ',d:'Enduit à joint · sac de 25 kg',u:'sac',p:19.8,i:'enduit',k:'produit',f:'Enduits et bandes',ex:1},
 {c:'EX-CLO',d:'Pose cloison simple peau',x:'Laine 45 mm, montant 48 accolé, hauteur 2,50 m',u:'m²',p:50,i:'casque',k:'prestation',f:'Plaques et cloisons',ex:1}];
function lire(){var b=lsG('pc-base1',null);if(Array.isArray(b))return b;try{if(X&&typeof X.base==='function'){var z=X.base();if(Array.isArray(z))return z}}catch(e){}return []}
function liste(){var b=lire(),vu={};b.forEach(function(p){vu[sansAcc(p.d)]=1});return b.concat(EX.filter(function(p){return !vu[sansAcc(p.d)]&&!lsG('pc-prod-ex-'+p.c,0)}))}
function usages(){var u=lsG('pc-base-usage',{})||{};return typeof u==='object'?u:{}}
function chercher(t){var q=sansAcc(t).trim(),U=usages(),L=liste();
 if(q)L=L.filter(function(p){return sansAcc(p.d+' '+(p.x||'')+' '+famille(p)+' '+(ICO[icoDe(p)]||[''])[0]+' '+(ICO[icoDe(p)]||['','','',''])[3]).indexOf(q)>=0});
 return L.sort(function(a,b){return (U[b.c]||0)-(U[a.c]||0)||(a.ex?1:0)-(b.ex?1:0)||a.d.localeCompare(b.d,'fr')})}
function enregistrer(p){var b=lire();if(!b.length&&!lsG('pc-base1',null)){try{if(X&&typeof X.base==='function')b=(X.base()||[]).slice()}catch(e){}}
 var i=-1;b.forEach(function(x,k){if(x.c===p.c)i=k});if(i>=0)b[i]=p;else b.push(p);lsS('pc-base1',b);return p}
function ajouter(p){p=p||{};if(!p.c)p.c='P'+Date.now().toString(36);delete p.ex;
 if(X&&typeof X.ajoutBase==='function'&&!lire().some(function(x){return x.c===p.c})){try{X.ajoutBase(p);if(lire().some(function(x){return x.c===p.c}))return p}catch(e){}}
 return enregistrer(p)}
function retirer(c){var x=EX.filter(function(p){return p.c===c})[0];if(x){lsS('pc-prod-ex-'+c,1)}lsS('pc-base1',lire().filter(function(p){return p.c!==c}))}
function favoris(){var n={};liste().forEach(function(p){var i=icoDe(p);if(i)n[i]=(n[i]||0)+(p.ex?0.5:1)});
 var L=Object.keys(n).sort(function(a,b){return n[b]-n[a]});FAV0.forEach(function(i){if(L.indexOf(i)<0)L.push(i)});return L.slice(0,6)}
var CLIKY=!!(window.PCOPT&&PCOPT.cliky); /* Option Cliky prise (PCOPT) */

/* ---------- l'écran ---------- */
var IC={plus:I('<path d="M12 5v14M5 12h14"/>'),cherche:I('<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>'),
 prod:I('<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>'),
 presta:I('<path d="M4 20h4l11-11-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>'),
 cliky:'<svg viewBox="0 0 100 100" aria-hidden="true" viewBox="22 22 56 56"><path fill="currentColor" fill-rule="evenodd" stroke="none" d="M24.50 50.00A25.50 25.50 0 1 1 75.50 50.00A25.50 25.50 0 1 1 24.50 50.00ZM57.73 67.72A19.34 19.34 0 1 0 42.27 67.72A3.92 3.92 0 0 0 47.76 64.13L47.76 61.21A2.24 2.24 0 0 1 52.24 61.21L52.24 64.13A3.92 3.92 0 0 0 57.73 67.72Z"/><circle cx="50" cy="48.32" r="4.71" fill="#A8823F" stroke="none"/></svg>',
 cle:I('<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3M14 9l2 2"/>')};
IC.doc=I('<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>');
var seg=lsG('pc-prod-seg','produit'),q='';

/* ---------- la base de Cliky en direct (17/11, Cyril) : les articles que Cliky utilise, prix modifiables ----------
   GET /espace/base → articles {c, d, cond, pc (prix du conditionnement), pu, u, f (famille), k, modifie, ajoute, provisoire}.
   Un prix changé ici est gardé par le service (à part de la base commune) : Cliky et « Recalculer » le prennent. */
var BC0=lsG('pc-cliky-base',null),BC={etat:'',articles:BC0&&BC0.articles||null,source:BC0&&BC0.source||'',n:BC0&&BC0.n||0,ouv:{}},qc='',FB={};
function enDirect(){return document.documentElement.classList.contains('pcvrai')&&!!(window.PCV&&PCV.api)}
function majBC(x){BC.articles=x.articles||[];BC.source=x.source||'';BC.n=x.nb_modifies||0;lsS('pc-cliky-base',{articles:BC.articles,source:BC.source,n:BC.n})}
function chargerBC(force){if(!enDirect()||BC.etat==='charge'||(BC.etat==='ok'&&!force))return;BC.etat='charge';
 PCV.api('/espace/base').then(function(x){majBC(x);BC.etat='ok';if(seg==='cliky')vue()},function(e){BC.etat='err';BC.err=e.message;if(seg==='cliky')vue()})}
function parCond(a){var c=String(a.cond||'').split(/ de | \(/)[0].trim();return c||a.u||'u'}
function prixU(n){return (+n||0).toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:4})+' €'}
function sourceBC(){var s=BC.source||'',m=/—\s*([^(,]+)/.exec(s),d=/relevé du ([\d/]+)/.exec(s),t=m?m[1].trim().toLowerCase():'';
 return t?'Prix de votre fournisseur ('+t.charAt(0).toUpperCase()+t.slice(1)+(d?', relevés le '+d[1]:'')+').':''}
function ligneBC(a){return '<button class="cf-li pr-li bc-li" type="button" data-bc="'+esc(a.c)+'"><span class="tx"><b>'+esc(a.d)+'</b><small>'+esc(a.cond)+
  (a.modifie?' · <em class="bc-m">votre prix</em>':a.ajoute?' · <em class="bc-m">ajouté par vous</em>':a.provisoire?' · <em class="bc-p">prix provisoire</em>':'')+'</small></span><span class="cf-m"><b>'+prix(a.pc)+'</b><small>/ '+esc(parCond(a))+'</small></span></button>'}
/* ---------- Mes fournisseurs (17/11, Cyril) : une carte par fournisseur, on y glisse ses documents ---------- */
var FO=lsG('pc-cliky-four',null),FOe='',LF='',LC='';
function chargerFO(force){if(!enDirect()||FOe==='charge'||(FOe==='ok'&&!force))return;FOe='charge';
 PCV.api('/espace/fournisseurs').then(function(x){FO=x.fournisseurs||[];lsS('pc-cliky-four',FO);FOe='ok';if(seg==='cliky')vue()},function(){FOe='err'})}
function fourDe(id){return (FO||[]).filter(function(f){return f.id===id})[0]}
function vueFO(){if(!FO)return '';
 return '<div class="sec-h bc-fh"><h2>Mes fournisseurs</h2><span>'+FO.length+'</span></div><div class="bc-fos">'+FO.map(function(f){
  return '<div class="card bc-fo"><button type="button" class="bc-fot" data-bcfo="'+esc(f.id)+'"><b>'+esc(f.nom)+'</b><small>'+(f.habituel?'<em class="bc-m">votre fournisseur habituel</em> · ':'')+f.n+' article'+(f.n>1?'s':'')+(f.adresse?' · '+esc(f.adresse):'')+'</small></button>'+
   '<button class="btn sm bc-aj" type="button" data-bclire="'+esc(f.id)+'">'+IC.doc+'<span>Déposer un tarif, un devis ou une facture</span></button></div>'}).join('')+
  '<button class="btn sm bc-aj bc-fonew" type="button" data-bcfonew>'+IC.plus+'<span>Ajouter un fournisseur</span></button></div>'}
function corpsFO(f){f=f||{};var m=f.relance_mois==null?6:f.relance_mois;
 return '<div class="cf-form pr-form bc-foform"><label>Nom du fournisseur<input id="fo-n" autocomplete="off" placeholder="Ex. : Point P Grenoble" value="'+esc(f.nom||'')+'"'+(f.id==='base'?'':'')+'></label>'+
  '<label>Son e-mail <small>pour lui demander son tarif à jour</small><input id="fo-e" type="email" autocomplete="off" placeholder="agence@fournisseur.fr" value="'+esc(f.email||'')+'"></label>'+
  '<label>Adresse du comptoir <small>pour calculer le vrai détour quand vous y passez avant le chantier</small><input id="fo-a" autocomplete="off" placeholder="N°, rue, code postal, commune" value="'+esc(f.adresse||'')+'"></label>'+
  '<p class="bc-lab">Lui redemander son tarif</p><div class="pr-u" role="group" aria-label="Relance">'+[[3,'tous les 3 mois'],[6,'tous les 6 mois'],[12,'tous les ans'],[0,'jamais']].map(function(x){return '<button type="button" data-forel="'+x[0]+'" aria-pressed="'+(m===x[0])+'">'+x[1]+'</button>'}).join('')+'</div>'+
  '<div class="dp-opt">'+(window.PCTAG?PCTAG('cliky'):'')+'La relance partira de l\'adresse de Cliky dès qu\'elle sera ouverte : vous la validerez la première fois.</div></div>'}
var FOF={};
function ouvrirFO(id){var f=id?fourDe(id):null;FOF={id:id||'',rel:f?f.relance_mois:6};
 X.xopen(f?f.nom:'Ajouter un fournisseur',f?(f.n+' article'+(f.n>1?'s':'')+(f.habituel?' · fournisseur habituel':'')):'Vous y glisserez ensuite ses tarifs et factures',corpsFO(f),
  (f&&!f.habituel?'<button class="btn" data-fohab="'+esc(f.id)+'">Mon habituel</button>':f&&f.id!=='base'&&!f.n?'<button class="btn" data-fosup="'+esc(f.id)+'">Retirer</button>':'<button class="btn" data-xclose>Annuler</button>')+'<button class="btn go" data-fook>Enregistrer</button>')}
function envoyerFO(corps,msg){$$('[data-fook],[data-fohab],[data-fosup]').forEach(function(x){x.disabled=true});
 PCV.api('/espace/fournisseurs',{method:'POST',body:corps}).then(function(x){FO=x.fournisseurs||[];lsS('pc-cliky-four',FO);X.xclose();vue();X.toast(msg[0],msg[1])},
  function(e){$$('[data-fook],[data-fohab],[data-fosup]').forEach(function(x){x.disabled=false});X.toast('Pas enregistré',e.message)})}
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-bcfo],[data-bcfonew],[data-forel],[data-fook],[data-fohab],[data-fosup]');if(!b||!X)return;var a=function(n){return b.getAttribute(n)};
 if(b.hasAttribute('data-bcfo'))ouvrirFO(a('data-bcfo'));
 else if(b.hasAttribute('data-bcfonew'))ouvrirFO('');
 else if(b.hasAttribute('data-forel')){FOF.rel=+a('data-forel');$$('[data-forel]').forEach(function(x){x.setAttribute('aria-pressed',String(x===b))})}
 else if(b.hasAttribute('data-fohab'))envoyerFO({id:a('data-fohab'),habituel:true},['Fournisseur habituel changé','Cliky prend ses prix d\'abord.']);
 else if(b.hasAttribute('data-fosup'))envoyerFO({id:a('data-fosup'),supprimer:true},['Fournisseur retiré','']);
 else{var n=(($('#fo-n')||{}).value||'').trim(),m=(($('#fo-e')||{}).value||'').trim(),ad=(($('#fo-a')||{}).value||'').trim();if(!n){X.toast('Il manque le nom','Le nom du fournisseur.');return}
  envoyerFO(FOF.id?{id:FOF.id,modif:{nom:n,email:m,adresse:ad,relance_mois:FOF.rel}}:{ajout:{nom:n,email:m,adresse:ad,relance_mois:FOF.rel}},[FOF.id?'Fournisseur enregistré':'Fournisseur ajouté',FOF.id?'':'Glissez-y ses tarifs et factures : Cliky les lit.'])}});
function vueBC(){var A=BC.articles;chargerFO();
 if(!A)return '<p class="hint">'+(BC.etat==='err'?esc(BC.err||'Base indisponible pour l\'instant.')+' <button class="lnk" type="button" data-bcre>Réessayer</button>':'Chargement de la base de Cliky…')+'</p>';
 var t=sansAcc(qc).trim(),L=t?A.filter(function(a){return sansAcc(a.d+' '+a.f+' '+a.c+' '+a.cond).indexOf(t)>=0}):A;
 var h='<div class="card pr-info"><span class="pr-ci">'+IC.cliky+'</span><div><b>'+A.length+' articles que Cliky utilise pour vos pré-devis</b><p>'+esc(sourceBC())+' Touchez un article pour mettre votre prix : Cliky le prend dès le prochain pré-devis, et « Recalculer » aussi.</p>'+
  (BC.n?'<p class="bc-n">'+BC.n+' changement'+(BC.n>1?'s':'')+' de votre part</p>':'')+'</div></div>'+
  vueFO()+
  '<div class="sec-h bc-fh"><h2>Tous les articles</h2><span>'+A.length+'</span></div>'+
  '<label class="pr-q">'+IC.cherche+'<input id="pr-qc" type="search" autocomplete="off" placeholder="Chercher : BA13, vis, laine, porte…" value="'+esc(qc)+'"></label>'+
  '<div class="bc-acts"><button class="btn sm bc-aj" type="button" data-bcnew>'+IC.plus+'<span>Ajouter un article</span></button></div>';
 if(!L.length)return h+'<p class="hint">Rien pour « '+esc(qc)+' ». <button class="lnk" type="button" data-bcnew>L\'ajouter</button></p>';
 var G=[],ix={};L.forEach(function(a){if(!(a.f in ix)){ix[a.f]=G.length;G.push({f:a.f,L:[]})}G[ix[a.f]].L.push(a)});
 G.forEach(function(g){var o=t||BC.ouv[g.f];
  h+='<details class="bc-fam" data-bcf="'+esc(g.f)+'"'+(o?' open':'')+'><summary><span>'+esc(g.f)+'</span><i>'+g.L.length+'</i></summary><div class="card lst cf-l">'+g.L.map(ligneBC).join('')+'</div></details>'});
 return h+(BC.etat==='err'?'<p class="hint">Hors ligne : liste gardée sur l\'appareil.</p>':'')}
function formBC(c){var a=(BC.articles||[]).filter(function(x){return x.c===c})[0];if(!a||!X)return;
 var h='<div class="cf-form pr-form"><p class="bc-d"><b>'+esc(a.d)+'</b><small>'+esc(a.f)+' · vendu par '+esc(a.cond)+'</small></p>'+
  '<div class="pr-pu"><label>Votre prix HT<input id="bc-p" inputmode="decimal" autocomplete="off" value="'+String(a.pc).replace('.',',')+'"></label><span class="pr-par">par '+esc(parCond(a))+'</span></div>'+
  (a.pu&&Math.abs(a.pu-a.pc)>0.001&&a.u?'<p class="hint">Prix actuel : '+prixU(a.pu)+' par '+esc(a.u)+'. Le prix par '+esc(a.u)+' suivra le vôtre.</p>':'')+
  (a.provisoire&&!a.modifie?'<p class="hint">Prix provisoire : mettez le vôtre, Cliky s\'en servira.</p>':'')+
  '<div class="dp-opt">'+(window.PCTAG?PCTAG('cliky'):'')+'Compte pour vos prochains pré-devis et pour « Recalculer ». Les devis déjà faits ne changent pas.</div></div>';
 X.xopen('Votre prix',a.ajoute?'Article ajouté par vous':'Base de Cliky',h,
  (a.modifie?'<button class="btn" data-bcori="'+esc(c)+'">Prix d\'origine</button>':a.ajoute?'<button class="btn" data-bcsup="'+esc(c)+'">Retirer</button>':'<button class="btn" data-xclose>Annuler</button>')+'<button class="btn go" data-bcok="'+esc(c)+'">Enregistrer</button>')}
var CONDS=['unité','m²','ml','boîte de 100','paquet de 10','rouleau de 150 m','sac de 25 kg'];
function corpsAjBC(){var f=[];(BC.articles||[]).forEach(function(a){if(f.indexOf(a.f)<0&&a.k==='produit')f.push(a.f)});if(f.indexOf('Ajoutés par vous')<0)f.push('Ajoutés par vous');
 return '<div class="cf-form pr-form bc-form"><label>Nom de l\'article<input id="bc-d" autocomplete="off" placeholder="Ex. : Cornière d\'angle alu 3 m" value="'+esc(FB.d||'')+'"></label>'+
  '<label>Vendu par<input id="bc-c" autocomplete="off" placeholder="Ex. : boîte de 100" value="'+esc(FB.c||'unité')+'"></label>'+
  '<div class="pr-u" role="group" aria-label="Vendu par">'+CONDS.map(function(u){return '<button type="button" data-bccond="'+esc(u)+'" aria-pressed="'+(FB.c===u)+'">'+esc(u)+'</button>'}).join('')+'</div>'+
  '<div class="pr-pu"><label>Prix HT<input id="bc-p" inputmode="decimal" autocomplete="off" placeholder="0,00" value="'+esc(FB.p||'')+'"></label><span class="pr-par">pour '+esc(FB.c&&FB.c!=='unité'?'1 '+parCond({cond:FB.c}):'1 unité')+'</span></div>'+
  '<label>Famille<select id="bc-f">'+f.map(function(x){return '<option'+(x===(FB.f||'Ajoutés par vous')?' selected':'')+'>'+esc(x)+'</option>'}).join('')+'</select></label>'+
  '<div class="dp-opt">'+(window.PCTAG?PCTAG('cliky'):'')+'Cliky le connaît dès le prochain pré-devis. ProClik le range ensuite dans votre base.</div></div>'}
function lireAjBC(){var g=function(id){var e=$(id);return e?e.value:null};var d=g('#bc-d');if(d!=null)FB.d=d;var c=g('#bc-c');if(c!=null)FB.c=c;var p=g('#bc-p');if(p!=null)FB.p=p;var f=g('#bc-f');if(f!=null)FB.f=f}
function ajBC(nom){FB={d:nom||'',c:'unité'};X.xopen('Ajouter un article','À la base de Cliky',corpsAjBC(),'<button class="btn" data-xclose>Annuler</button><button class="btn go" data-bcaok>Ajouter</button>')}
function uniteDe(c){var m=/de\s+[\d.,]+\s*(m²|m³|ml|kg|m|l)(?![a-z])/i.exec(c);if(m)return m[1];if(/\d/.test(c))return 'pièce';var w=parCond({cond:c});return w==='unité'?'u':w}
function envoyerBC(corps,msg){$$('[data-bcok],[data-bcaok],[data-bcori],[data-bcsup],[data-bcluok]').forEach(function(x){x.disabled=true});
 return PCV.api('/espace/base',{method:'POST',body:corps}).then(function(x){majBC(x);BC.etat='ok';X.xclose();vue();X.toast(msg[0],msg[1])},
  function(e){$$('[data-bcok],[data-bcaok],[data-bcori],[data-bcsup],[data-bcluok]').forEach(function(x){x.disabled=false});X.toast('Pas enregistré',e.message)})}
/* ---------- Cliky lit une facture, un devis ou un bon de livraison du fournisseur (17/11) ---------- */
var LU=null;
function fichierB64(f){return new Promise(function(ok,ko){
 if(f.type==='application/pdf'){if(f.size>3.5*1048576)return ko(new Error('PDF trop lourd (3,5 Mo au plus) : envoyez une photo de chaque page.'));var r=new FileReader();r.onload=function(){ok(String(r.result))};r.onerror=function(){ko(new Error('Fichier illisible'))};return r.readAsDataURL(f)}
 var u=URL.createObjectURL(f),im=new Image();im.onload=function(){var k=Math.min(1,2000/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);ok(c.toDataURL('image/jpeg',0.85))};
 im.onerror=function(){ko(new Error('Photo illisible : JPEG, PNG ou PDF'))};im.src=u})}
function deposer(four,contact){LF=four||'';LC=contact||'';var inp=document.createElement('input');inp.type='file';inp.accept='image/*,application/pdf';inp.onchange=function(){lireDoc(inp.files&&inp.files[0])};inp.click()}
function lireDoc(f){if(!f||!X)return;LU=null;var fo=fourDe(LF);
 X.xopen('Cliky lit votre document',fo?fo.nom:'Tarif, devis, facture ou bon de livraison','<div class="bc-lu"><p class="bc-att"><span class="bc-sp"></span>Cliky lit chaque ligne et la retrouve dans votre base. Comptez une demi-minute.</p></div>','<button class="btn" data-xclose>Annuler</button>');
 fichierB64(f).then(function(d){return PCV.api('/espace/lire-document',{method:'POST',body:{fichier:d,nom:f.name,fournisseur:LF}})}).then(function(x){LU=x;afficherLu()},
  function(e){var z=$('.bc-lu');if(z)z.innerHTML='<p class="hint">'+esc(e.message)+'</p>'})}
function afficherLu(){var z=$('.bc-lu');if(!z||!LU)return;var d=LU.document||{},L=LU.lignes||[];var NL=L.length;/* toutes les lignes lues, même celles rangées plus bas (Cyril 22/11 : « 3 lignes lues » pour 7 produits) */
 /* document déposé chez un autre fournisseur que celui de l'article : son prix devient un article de CE fournisseur (on compare, on n'écrase pas) */
 var art=function(c){return (BC.articles||[]).filter(function(x){return x.c===c})[0]||{}},ailleurs=[];
 if(LU.fournisseur){L=L.filter(function(l){var a=art(l.code);if(l.code&&l.apres&&a.four&&a.four!==LU.fournisseur){var f0=fourDe(a.four);ailleurs.push({designation:l.article,quantite:l.quantite,cond_lu:l.conditionnement,famille:a.f,reference:l.reference,prix_ht:l.apres,compare:l.avant,chez:f0?f0.nom:'',sur:l.sur,note:l.note,u:a.u,pu:a.pu&&a.pc?Math.round(a.pu*l.apres/a.pc*1e6)/1e6:0});return false}return true})}
 var ch=L.filter(function(l){return l.code&&l.apres&&Math.abs(l.apres-l.avant)>=0.005}),pareil=L.filter(function(l){return l.code&&l.apres&&Math.abs(l.apres-l.avant)<0.005}).length,hors=L.filter(function(l){return !l.code});
 var h='<p class="bc-d"><b>'+esc((d.type||'Document').replace(/^./,function(c){return c.toUpperCase()})+(d.fournisseur?' '+d.fournisseur:''))+'</b><small>'+esc([d.numero?'n° '+d.numero:'',d.date].filter(Boolean).join(' · '))+' · '+NL+' ligne'+(NL>1?'s':'')+' lue'+(NL>1?'s':'')+'</small></p>';
 h+=chantierLu();
 if(ch.length)h+='<p class="hint">Cochez les prix à mettre à jour. Ceux qui demandent un œil ne sont pas cochés.</p>'+ch.map(function(l,i){return '<label class="bc-lp'+(l.sur?'':' doute')+'"><input type="checkbox" data-bclp="'+i+'"'+(l.sur?' checked':'')+'><span><b>'+esc(l.article)+'</b><small>'+esc(l.conditionnement)+' · lu : « '+esc(l.designation)+' »</small>'+(l.note?'<em>'+esc(l.note)+'</em>':'')+'</span><i>'+prix(l.avant)+' → <b>'+prix(l.apres)+'</b><small>'+(l.ecart_pct>0?'+':'')+String(l.ecart_pct).replace('.',',')+' %</small></i></label>'}).join('');
 else h+='<p class="hint">Aucun prix à changer'+(pareil?' : '+pareil+' prix déjà à jour.':'.')+'</p>';
 if(ch.length&&pareil)h+='<p class="hint">'+pareil+' prix déjà à jour.</p>';
 var fo=fourDe(LU.fournisseur),nv=ailleurs.concat(hors).filter(function(l){return l.prix_ht>0&&!/livraison|transport|frais de port|\bport\b|éco-?participation|remise|acompte/i.test(l.designation)}),autres=hors.filter(function(l){return nv.indexOf(l)<0});
 if(nv.length)h+='<p class="bc-lab">'+nv.length+' produit'+(nv.length>1?'s':'')+' pas encore dans votre base</p><p class="hint">'+(fo?'Cochés : ils seront rangés chez '+esc(fo.nom)+'.':'Cochez ceux que vous reprenez souvent.')+'</p>'+
  nv.map(function(l,i){return '<label class="bc-lp"><input type="checkbox" data-bcln="'+i+'"'+(fo&&l.sur!==false&&!(+l.quantite<0)?' checked':'')+'><span><b>'+esc(l.designation)+'</b><small>'+esc([l.cond_lu,l.famille,l.reference?'réf. '+l.reference:''].filter(Boolean).join(' · '))+'</small>'+(+l.quantite<0?'<em>Retour de marchandise (rendu) : pas coché, cochez seulement pour garder ce prix</em>':'')+(l.compare?'<em class="bc-cmp">'+(Math.abs(l.prix_ht-l.compare)<0.005?'Même prix':l.prix_ht<l.compare?'Moins cher':'Plus cher')+' que chez '+esc(l.chez||'votre autre fournisseur')+' ('+prix(l.compare)+')</em>':'')+'</span><i><b>'+prix(l.prix_ht)+'</b><small>'+esc(l.cond_lu||'')+'</small></i></label>'}).join('');
 if(autres.length)h+='<details class="bc-hors"><summary>'+autres.length+' ligne'+(autres.length>1?'s':'')+' non reprise'+(autres.length>1?'s':'')+' (frais, lignes sans prix)</summary>'+autres.map(function(l){return '<p>'+esc(l.designation)+'</p>'}).join('')+'</details>';
 h+='<div class="bc-luf"><button class="btn go" type="button" data-bcluok>'+(ch.length||nv.length?'Enregistrer ce qui est coché':'Enregistrer')+'</button></div>';
 z.innerHTML=h;LU.ch=ch;LU.nv=nv}
/* Marge réelle (17/11) : la facture est rangée dans le chantier choisi, pour comparer le matériel prévu au matériel payé */
function montantLu(){var d=LU&&LU.document||{};if(+d.total_ht>0)return +d.total_ht;return Math.round((LU&&LU.lignes||[]).reduce(function(s,l){return s+((+l.quantite>0&&+l.prix_ht>0)?l.quantite*l.prix_ht:0)},0)*100)/100}
function chantierLu(){var D=(window.PCV&&PCV.demandes&&PCV.demandes())||[],t=(LU&&LU.document||{}).type||'';if(!D.length&&!LC)return '';
 if(!LC&&/devis|tarif|autre/i.test(t))return '';
 var L=D.slice(0,8),m=montantLu();if(LC&&!L.some(function(d){return d.contact===LC}))L.unshift({contact:LC,client:'Ce chantier'});
 return '<p class="bc-lab">Pour quel chantier ?</p><p class="hint">'+(m>0?'Montant HT lu : <b>'+prix(m)+'</b>. ':'')+'Cliky le compte dans les achats du chantier, pour voir votre marge réelle.</p><div class="pr-u bc-chs" role="group" aria-label="Chantier">'+
  '<button type="button" data-bclc="" aria-pressed="'+(!LC)+'">Aucun</button>'+L.map(function(d){return '<button type="button" data-bclc="'+esc(d.contact)+'" aria-pressed="'+(LC===d.contact)+'">'+esc(d.client||'Client')+'</button>'}).join('')+'</div>'}
function rangerAchat(){if(!LC||!LU)return Promise.resolve(null);var d=LU.document||{},c=LC;
 return PCV.api('/espace/achats',{method:'POST',body:{contact:c,document:{type:d.type,fournisseur:d.fournisseur,numero:d.numero,date:d.date,total_ht:montantLu()},lignes:(LU.lignes||[]).map(function(l){return {d:l.designation,q:l.quantite,pu:l.prix_ht}})}}).then(function(x){try{document.dispatchEvent(new CustomEvent('pc-achats',{detail:{contact:c,achats:x}}))}catch(e){}return x})}
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-bclc]');if(!b)return;LC=b.getAttribute('data-bclc')||'';$$('[data-bclc]').forEach(function(x){x.setAttribute('aria-pressed',String(x===b))})});
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-bclire],[data-bcluok]');if(!b||!X)return;
 if(b.hasAttribute('data-bclire')){deposer(b.getAttribute('data-bclire')||'','')}
 else{var M=$$('[data-bclp]').filter(function(c){return c.checked}).map(function(c){var l=LU.ch[+c.getAttribute('data-bclp')];return {code:l.code,prix:l.apres}});
  var N=$$('[data-bcln]').filter(function(c){return c.checked}).map(function(c){var l=LU.nv[+c.getAttribute('data-bcln')],cd=l.cond_lu||'unité';return {d:l.designation,cond:cd,u:l.u||uniteDe(cd),pu:l.pu||undefined,prix:l.prix_ht,f:l.famille||'Ajoutés par vous'}});
  if(!M.length&&!N.length&&!LC){X.toast('Rien de coché','Cochez les prix ou les produits à garder, ou choisissez un chantier.');return}var d=LU.document||{},src=[d.type,d.fournisseur,d.numero].filter(Boolean).join(' ');
  if(LC){b.disabled=true;rangerAchat().then(function(){b.disabled=false;LC='';if(!M.length&&!N.length){X.xclose();X.toast('Rangé dans le chantier',prix(montantLu())+' HT de matériel payé')}else suite()},function(e){b.disabled=false;X.toast('Pas rangé dans le chantier',e.message)});return}
  suite();function suite(){
  var fin=function(){var t=[M.length?M.length+' prix mis à jour':'',N.length?N.length+' produit'+(N.length>1?'s':'')+' ajouté'+(N.length>1?'s':''):''].filter(Boolean).join(', ');setTimeout(function(){FOe='';chargerFO(true)},1200);return [t.charAt(0).toUpperCase()+t.slice(1),'Cliky les prend dès le prochain pré-devis.']};
  if(M.length&&N.length)PCV.api('/espace/base',{method:'POST',body:{modifs:M,source:src}}).then(function(){envoyerBC({ajouts:N,four:LU.fournisseur},fin())},function(e){X.toast('Pas enregistré',e.message)});
  else if(M.length)envoyerBC({modifs:M,source:src},fin());else envoyerBC({ajouts:N,four:LU.fournisseur},fin())}}});
document.addEventListener('toggle',function(e){var d=e.target;if(d&&d.classList&&d.classList.contains('bc-fam'))BC.ouv[d.getAttribute('data-bcf')]=d.open},true);
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-bc],[data-bcnew],[data-bcok],[data-bcori],[data-bcsup],[data-bcaok],[data-bccond],[data-bcre]');if(!b||!X)return;
 var a=function(n){return b.getAttribute(n)};
 if(b.hasAttribute('data-bc'))formBC(a('data-bc'));
 else if(b.hasAttribute('data-bcnew'))ajBC(qc);
 else if(b.hasAttribute('data-bcre')){BC.etat='';chargerBC(true);vue()}
 else if(b.hasAttribute('data-bccond')){lireAjBC();FB.c=a('data-bccond');var z=$('.bc-form');if(z)z.outerHTML=corpsAjBC();var p=$('#bc-p');if(p)p.focus()}
 else if(b.hasAttribute('data-bcok')){var v=num(($('#bc-p')||{}).value);if(!(v>0)){X.toast('Il manque le prix','Le prix HT que vous payez, pour le conditionnement indiqué.');return}
  envoyerBC({code:a('data-bcok'),prix:v},['Prix enregistré','Cliky le prend dès le prochain pré-devis.'])}
 else if(b.hasAttribute('data-bcori'))envoyerBC({code:a('data-bcori'),origine:true},['Prix d\'origine remis','Celui de la base de votre fournisseur.']);
 else if(b.hasAttribute('data-bcsup'))envoyerBC({code:a('data-bcsup'),supprimer:true},['Article retiré','Cliky ne l\'utilisera plus.']);
 else if(b.hasAttribute('data-bcaok')){lireAjBC();var d=(FB.d||'').trim(),pv=num(FB.p),c=(FB.c||'unité').trim()||'unité';
  if(!d){var e1=$('#bc-d');if(e1)e1.focus();X.toast('Il manque le nom','Tel qu\'il apparaîtra sur le devis.');return}
  if(!(pv>0)){var e2=$('#bc-p');if(e2)e2.focus();X.toast('Il manque le prix','Le prix HT, pour '+(c==='unité'?'une unité':'1 '+parCond({cond:c}))+'.');return}
  envoyerBC({ajout:{d:d,cond:c,u:uniteDe(c),prix:pv,f:FB.f||'Ajoutés par vous'}},['Article ajouté','Cliky le connaît dès le prochain pré-devis.'])}
});
function ligne(p){var i=icoDe(p);return '<button class="cf-li pr-li" type="button" data-prod="'+esc(p.c)+'"><span class="cf-av pr-av'+(i?'':' vide')+'">'+(icone(i)||esc((p.d||'?').charAt(0).toUpperCase()))+'</span><span class="tx"><b>'+esc(p.d)+'</b><small>'+esc([p.x,famille(p)].filter(Boolean).join(' · '))+(p.ex?' · exemple':'')+'</small></span><span class="cf-m pr-px" data-prpx="'+esc(p.c)+'" title="Changer le prix"><b>'+prix(p.p)+'</b><small>/ '+esc(p.u||'u')+'</small></span></button>'}
function vue(){var v=$('#v-produits');if(!v)return;
 var L=chercher(q),P=L.filter(function(p){return genre(p)===(seg==='cliky'?'produit':seg)}),nP=liste().filter(function(p){return genre(p)==='produit'}).length,nS=liste().length-nP;
 var h='<div class="row cf-top"><h2>Produits</h2><span class="cf-n">'+liste().length+' dans votre base</span></div>'+
  '<button class="btn go cf-go pr-go" type="button" data-prodnew><span class="lab"><span class="ic">'+IC.plus+'</span><span>Créer un produit</span></span></button>'+
  '<div class="seg cf-seg dv-seg" role="tablist" aria-label="Produits">'+[['produit','Produits',IC.prod,nP],['prestation','Prestations',IC.presta,nS],['cliky','Base Cliky',IC.cliky,enDirect()&&BC.articles?BC.articles.length:0]].map(function(s){return '<button role="tab" type="button" data-prodseg="'+s[0]+'" aria-selected="'+(seg===s[0])+'">'+s[2]+'<span>'+s[1]+'</span>'+(s[3]?'<i>'+s[3]+'</i>':'')+'</button>'}).join('')+'</div>';
 if(seg==='cliky'&&enDirect()){chargerBC();h+=vueBC()}
 else if(seg==='cliky'){
  h+='<div class="card pr-info"><span class="pr-ci">'+IC.cliky+'</span><div><b>Avec Cliky, votre base est déjà remplie</b><p>Les prix de matériaux et de pose qu\'il utilise pour vos pré-devis sont là dès le départ. Un produit que vous créez vous-même rejoint aussi la base de Cliky, après vérification par ProClik.</p></div></div>'+
   '<div class="card pr-info"><div style="flex:1;min-width:0">'+(window.PCTAG?PCTAG('cliky','Mise en service'):'<b>Mise en service</b>')+'<p>On crée votre base complète avec vous, ou à partir de vos documents (tarifs fournisseurs, anciens devis). Vous arrivez sur un Espace prêt pour faire vos devis.</p><button class="btn sm" type="button" data-prodmes>Ça m\'intéresse</button></div></div>'+
   '<p class="hint">Un produit manque dans la base de Cliky ? Créez-le ici : il part tout seul chez ProClik pour être ajouté.</p>';
 }else{
  h+='<label class="pr-q">'+IC.cherche+'<input id="pr-q" type="search" autocomplete="off" placeholder="'+(seg==='prestation'?'Chercher : cloison, pose…':'Chercher : BA13, vis, laine…')+'" value="'+esc(q)+'"></label>';
  if(!P.length)h+='<p class="hint">'+(q?'Rien pour « '+esc(q)+' ». ':'Rien pour l\'instant. ')+'<button class="lnk" type="button" data-prodnew="'+esc(q)+'">Le créer</button></p>';
  else{var G={};P.forEach(function(p){var f=famille(p);(G[f]=G[f]||[]).push(p)});
   FAMS.concat(Object.keys(G).filter(function(f){return FAMS.indexOf(f)<0})).forEach(function(f){if(!G[f])return;var i=icoDe(G[f][0]);
    h+='<div class="sec-h pr-fam"><h2>'+(icone(i)?'<span class="pr-fi">'+icone(i)+'</span>':'')+esc(f)+'</h2><span>'+G[f].length+'</span></div><div class="card lst cf-l">'+G[f].map(ligne).join('')+'</div>'})}
  if(seg==='prestation')h+='<p class="hint">Une prestation, c\'est un ouvrage tout compris à un prix : « Pose cloison simple peau, laine 45 mm, montant 48 accolé, hauteur 2,50 m · 50 €/m² ». Elle s\'ajoute d\'un appui au pré-devis.</p>';
  if(L.some(function(p){return p.ex}))h+='<span class="exemple">Lignes « exemple » : à garder, modifier ou supprimer</span>';}
 var c=v.querySelector(':scope>.cf');if(!c){v.innerHTML='';c=document.createElement('div');c.className='cf pr';v.appendChild(c)}c.innerHTML=h;
 var ic=$('#pr-qc');if(ic)ic.addEventListener('input',function(){qc=ic.value;var s=ic.selectionStart;vue();var n=$('#pr-qc');if(n){n.focus();try{n.setSelectionRange(s,s)}catch(e){}}});
 var inp=$('#pr-q');if(inp)inp.addEventListener('input',function(){q=inp.value;var s=inp.selectionStart;vue();var n=$('#pr-q');if(n){n.focus();try{n.setSelectionRange(s,s)}catch(e){}}});}

/* ---------- créer ou modifier ---------- */
var F={},RAPPEL=null;
var UNITES=['u','m²','ml','m³','h','forfait','kg','boîte','sac','rouleau'];
function picker(){var fv=favoris(),ft=sansAcc(F.qi||'').trim(),L=ORDRE.filter(function(k){return !ft||sansAcc(ICO[k][0]+' '+ICO[k][3]+' '+ICO[k][2]).indexOf(ft)>=0});
 return '<div class="pr-pick" id="pr-pick"><label class="pr-q">'+IC.cherche+'<input id="pr-qi" type="search" autocomplete="off" placeholder="Chercher une icône : vis, placo, laine…" value="'+esc(F.qi||'')+'"></label>'+
  (ft?'':'<small class="pr-pl">Vos habituelles</small><div class="pr-ig">'+fv.map(btnI).join('')+'</div><small class="pr-pl">Toutes</small>')+
  '<div class="pr-ig">'+(L.length?L.filter(function(k){return ft||fv.indexOf(k)<0}).map(btnI).join(''):'<p class="hint">Aucune icône pour « '+esc(F.qi)+' ».</p>')+'<button type="button" class="pr-ib" data-prico=""><span class="pr-ii vide">∅</span><span>Sans icône</span></button></div></div>'}
function btnI(k){return '<button type="button" class="pr-ib" data-prico="'+k+'" aria-pressed="'+(F.i===k)+'"><span class="pr-ii">'+icone(k)+'</span><span>'+esc(ICO[k][0])+'</span></button>'}
function corps(){var p=F;
 return '<div class="cf-form pr-form">'+
  '<button type="button" class="pr-icone'+(p.i?' on':'')+'" data-propen aria-expanded="'+(!!F.ouvert)+'"><span class="pr-ii">'+(icone(p.i)||IC.plus)+'</span><span class="tx"><b>'+(p.i?ICO[p.i][0]:'Choisir une icône')+'</b><small>'+(p.i?'touchez pour la changer':'pour le retrouver d\'un coup d\'œil · facultatif')+'</small></span><span class="go">'+(F.ouvert?'▴':'▾')+'</span></button>'+
  (F.ouvert?picker():'')+
  '<div class="seg pr-k" role="tablist" aria-label="Type">'+[['produit','Produit'],['prestation','Prestation']].map(function(s){return '<button type="button" role="tab" data-prk="'+s[0]+'" aria-selected="'+(p.k===s[0])+'">'+s[1]+'</button>'}).join('')+'</div>'+
  '<label>Désignation<input id="pr-d" autocomplete="off" placeholder="'+(p.k==='prestation'?'Ex. : Pose cloison simple peau':'Ex. : Plaque BA13 standard')+'" value="'+esc(p.d||'')+'"></label>'+
  (p.k==='prestation'?'<label>Ce qu\'elle comprend <small>facultatif</small><textarea id="pr-x" rows="2" placeholder="Ex. : laine 45 mm, montant 48 accolé, hauteur 2,50 m">'+esc(p.x||'')+'</textarea></label>':'')+
  '<div class="pr-pu"><label>Prix HT<input id="pr-p" inputmode="decimal" autocomplete="off" placeholder="0,00" value="'+(p.p?String(p.p).replace('.',','):'')+'"></label><span class="pr-par">par</span></div>'+
  '<div class="pr-u" role="group" aria-label="Unité">'+UNITES.map(function(u){return '<button type="button" data-pru="'+esc(u)+'" aria-pressed="'+(p.u===u)+'">'+esc(u)+'</button>'}).join('')+'</div>'+
  '<label>Famille<select id="pr-f">'+FAMS.map(function(f){return '<option'+(f===p.f?' selected':'')+'>'+esc(f)+'</option>'}).join('')+'</select></label>'+
  (CLIKY?'<div class="dp-opt">'+(window.PCTAG?PCTAG('cliky'):'<b>Option Cliky</b> ')+(p.c&&!p.neuf?'Vos changements comptent aussi pour vos prochains pré-devis.':'Ce produit rejoint aussi la base de Cliky, après vérification par ProClik.')+'</div>':'')+
  '</div>'}
function form(c,nom){var x=c&&liste().filter(function(p){return p.c===c})[0];
 F=x?{c:x.c,d:x.d,x:x.x||'',p:x.p,u:x.u||'u',i:icoDe(x),k:genre(x),f:famille(x),ex:x.ex}:{neuf:1,d:nom||'',u:'u',i:'',k:seg==='prestation'?'prestation':'produit',f:'Divers',ouvert:!nom};
 if(F.neuf&&nom){var m=ORDRE.filter(function(k){return sansAcc(ICO[k][3]+' '+ICO[k][0]).split(/\s+/).some(function(w){return w.length>2&&sansAcc(nom).indexOf(w)>=0})})[0];if(m){F.i=m;F.f=ICO[m][2]}}
 ouvrir(!!x)}
function ouvrir(modif,garder){if(!X)return;var h=corps();
 X.xopen(modif?'Modifier':'Créer un produit',modif?(F.k==='prestation'?'Prestation':'Produit')+' de votre base':'L\'icône d\'abord, puis le nom et le prix',h,(modif?'<button class="btn" data-prodsup="'+esc(F.c)+'">Supprimer</button>':'<button class="btn" data-xclose>Annuler</button>')+'<button class="btn go" data-prodok>Enregistrer</button>',function(){
  var qi=$('#pr-qi');if(qi)qi.addEventListener('input',function(){lireForm();F.qi=qi.value;var s=qi.selectionStart;rafraichir();var n=$('#pr-qi');if(n){n.focus();try{n.setSelectionRange(s,s)}catch(e){}}})},garder);}
function lireForm(){var g=function(id){var e=$(id);return e?e.value:null};var d=g('#pr-d');if(d!=null)F.d=d;var x=g('#pr-x');if(x!=null)F.x=x;var p=g('#pr-p');if(p!=null)F.p=num(p);var f=g('#pr-f');if(f!=null)F.f=f}
function rafraichir(){var z=$('.pr-form');if(z)z.outerHTML=corps();var qi=$('#pr-qi');if(qi)qi.addEventListener('input',function(){lireForm();F.qi=qi.value;var s=qi.selectionStart;rafraichir();var n=$('#pr-qi');if(n){n.focus();try{n.setSelectionRange(s,s)}catch(e){}}})}
function ok(){lireForm();var d=(F.d||'').trim();
 if(!d){var e=$('#pr-d');if(e)e.focus();X.toast('Il manque la désignation','Le nom tel qu\'il apparaîtra sur le devis.');return}
 if(!(F.p>0)){var e2=$('#pr-p');if(e2)e2.focus();X.toast('Il manque le prix','Le prix HT, pour une unité.');return}
 var neuf=!!F.neuf||!!F.ex,p={c:F.ex?'P'+Date.now().toString(36):(F.c||'P'+Date.now().toString(36)),d:d,u:F.u||'u',p:F.p,t:F.f,f:F.f,k:F.k};
 if(F.i)p.i=F.i;if(F.k==='prestation'&&(F.x||'').trim())p.x=F.x.trim();
 if(F.ex)lsS('pc-prod-ex-'+F.c,1);
 if(neuf)ajouter(p);else enregistrer(p);
 X.xclose();seg=p.k;lsS('pc-prod-seg',seg);q='';vue();
 X.toast(neuf?(p.k==='prestation'?'Prestation créée':'Produit créé'):'Modifié',neuf?'Vous la retrouvez dans « + Ajouter une ligne » du pré-devis'+(CLIKY?' et Cliky la connaît.':'.'):'Les prochains devis prennent le nouveau prix. Les devis déjà faits ne changent pas.');
 if(RAPPEL){var r=RAPPEL;RAPPEL=null;try{r(p)}catch(e){}}}

/* ---------- clics ---------- */
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-prod],[data-prodnew],[data-prodseg],[data-prodok],[data-prodsup],[data-prodmes],[data-propen],[data-prico],[data-prk],[data-pru]');if(!b)return;
 var a=function(n){return b.getAttribute(n)};
 if(b.hasAttribute('data-prodseg')){seg=a('data-prodseg');lsS('pc-prod-seg',seg);vue();}
 else if(b.hasAttribute('data-prodnew')){RAPPEL=null;form(null,a('data-prodnew')||'');}
 else if(b.hasAttribute('data-prod'))form(a('data-prod'));
 else if(b.hasAttribute('data-prodok'))ok();
 else if(b.hasAttribute('data-prodsup')){retirer(a('data-prodsup'));X.xclose();vue();X.toast('Supprimé de votre base','Les devis déjà faits ne changent pas.');}
 else if(b.hasAttribute('data-prodmes'))X.toast('Mise en service','Démo : votre demande partira chez ProClik, qui vous rappelle pour préparer votre base avec vous.');
 else if(b.hasAttribute('data-propen')){lireForm();F.ouvert=!F.ouvert;F.qi='';rafraichir();}
 else if(b.hasAttribute('data-prico')){lireForm();F.i=a('data-prico');if(F.i)F.f=ICO[F.i][2];F.ouvert=false;F.qi='';rafraichir();}
 else if(b.hasAttribute('data-prk')){lireForm();F.k=a('data-prk');if(F.k==='prestation'&&F.u==='u')F.u='m²';rafraichir();}
 else if(b.hasAttribute('data-pru')){lireForm();F.u=a('data-pru');rafraichir();}
});
document.addEventListener('click',function(e){var t=e.target.closest&&e.target.closest('[role=tab][data-v="produits"]');if(t)vue()});

/* ---------- prix changé en direct, sur la ligne (Cyril 22/11 : « modifier le prix directement sur le produit, même sans Cliky ») ---------- */
function editPrix(row,c,fini){var p=liste().filter(function(x){return x.c===c})[0];if(!p||!row)return;
 var ed=document.createElement('div');ed.className='pr-ed';
 ed.innerHTML='<b class="pr-ed-n">'+esc(p.d)+'</b><div class="pr-ed-l"><label class="pr-ed-f"><input type="text" inputmode="decimal" autocomplete="off" value="'+(Math.round((+p.p||0)*100)/100).toFixed(2).replace('.',',')+'" aria-label="Prix HT"><span>€ HT / '+esc(p.u||'u')+'</span></label>'+
  '<button type="button" class="btn sm" data-pred-x>Annuler</button><button type="button" class="btn sm go" data-pred-ok>OK</button></div>';
 row.replaceWith(ed);var inp=ed.querySelector('input');inp.focus();try{inp.select()}catch(e){}
 function fin(ch){if(fini)fini(ch);else vue()}
 function ok(){var v=parseFloat(String(inp.value).replace(/\s/g,'').replace(',','.'));
  if(!isFinite(v)||v<0){X&&X.toast('Prix à vérifier','Tapez un nombre, par exemple 11,40.');inp.focus();return}
  var n={};for(var k in p)n[k]=p[k];n.p=Math.round(v*100)/100;ajouter(n);
  X&&X.toast('Prix enregistré',p.d+' : '+prix(n.p)+' HT / '+(p.u||'u')+'. Vos prochains devis le prennent.');fin(true)}
 ed.querySelector('[data-pred-ok]').addEventListener('click',ok);
 ed.querySelector('[data-pred-x]').addEventListener('click',function(){fin(false)});
 inp.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();ok()}else if(e.key==='Escape')fin(false)})}
document.addEventListener('click',function(e){var t=e.target.closest&&e.target.closest('[data-prpx]');if(!t)return;
 e.preventDefault();e.stopImmediatePropagation();editPrix(t.closest('.pr-li'),t.getAttribute('data-prpx'))},true);

/* ---------- pour les autres écrans ---------- */
window.PCPROD={deposer:function(contact){if(!X)return;chargerBC();deposer('',contact)},cliky:function(){chargerBC();return BC.articles||[]},parCond:parCond,icone:icone,icones:function(){return ORDRE.map(function(k){return {i:k,nom:ICO[k][0],famille:ICO[k][2]}})},liste:liste,chercher:chercher,ajouter:ajouter,famille:famille,iconeDe:function(p){return icone(icoDe(p))},editPrix:editPrix,
 creer:function(nom,rappel){if(!X)return;RAPPEL=typeof rappel==='function'?rappel:null;form(null,nom||'')}};
vue();
})();
