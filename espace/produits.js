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
var CLIKY=true; /* Démo : l'option Cliky est active (comme dans le pré-devis) */

/* ---------- l'écran ---------- */
var IC={plus:I('<path d="M12 5v14M5 12h14"/>'),cherche:I('<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>'),
 prod:I('<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>'),
 presta:I('<path d="M4 20h4l11-11-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>'),
 cliky:'<svg viewBox="0 0 100 100" aria-hidden="true"><rect x="24" y="14" width="18" height="72" rx="9" fill="currentColor" stroke="none"/><circle cx="54" cy="40" r="26" fill="currentColor" stroke="none"/><circle cx="56" cy="40" r="9" style="fill:var(--rs)" stroke="none"/></svg>',
 cle:I('<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3M14 9l2 2"/>')};
var seg=lsG('pc-prod-seg','produit'),q='';
function ligne(p){var i=icoDe(p);return '<button class="cf-li pr-li" type="button" data-prod="'+esc(p.c)+'"><span class="cf-av pr-av'+(i?'':' vide')+'">'+(icone(i)||esc((p.d||'?').charAt(0).toUpperCase()))+'</span><span class="tx"><b>'+esc(p.d)+'</b><small>'+esc([p.x,famille(p)].filter(Boolean).join(' · '))+(p.ex?' · exemple':'')+'</small></span><span class="cf-m"><b>'+prix(p.p)+'</b><small>/ '+esc(p.u||'u')+'</small></span></button>'}
function vue(){var v=$('#v-produits');if(!v)return;
 var L=chercher(q),P=L.filter(function(p){return genre(p)===(seg==='cliky'?'produit':seg)}),nP=liste().filter(function(p){return genre(p)==='produit'}).length,nS=liste().length-nP;
 var h='<div class="row cf-top"><h2>Produits</h2><span class="cf-n">'+liste().length+' dans votre base</span></div>'+
  '<button class="btn go cf-go pr-go" type="button" data-prodnew><span class="lab"><span class="ic">'+IC.plus+'</span><span>Créer un produit ou une prestation</span></span></button>'+
  '<div class="seg cf-seg dv-seg" role="tablist" aria-label="Produits">'+[['produit','Produits',IC.prod,nP],['prestation','Prestations',IC.presta,nS],['cliky','Base Cliky',IC.cliky,0]].map(function(s){return '<button role="tab" type="button" data-prodseg="'+s[0]+'" aria-selected="'+(seg===s[0])+'">'+s[2]+'<span>'+s[1]+'</span>'+(s[3]?'<i>'+s[3]+'</i>':'')+'</button>'}).join('')+'</div>';
 if(seg==='cliky'){
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

/* ---------- pour les autres écrans ---------- */
window.PCPROD={icone:icone,icones:function(){return ORDRE.map(function(k){return {i:k,nom:ICO[k][0],famille:ICO[k][2]}})},liste:liste,chercher:chercher,ajouter:ajouter,famille:famille,iconeDe:function(p){return icone(icoDe(p))},
 creer:function(nom,rappel){if(!X)return;RAPPEL=typeof rappel==='function'?rappel:null;form(null,nom||'')}};
vue();
})();
