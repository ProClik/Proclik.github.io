/* Nouveau devis fait à la main, en 3 étapes simples (Cyril 26/11 : « trop compliqué pour créer un devis »,
   puis « optimise à fond, que ce soit incroyable pour l'artisan » et « les prix sont ultra importants »).
   1. Pour quel client ? (un toucher ; un devis commencé et pas fini est proposé à la reprise)
   2. Ajouter : en haut, les TRAVAUX COMPLETS (Cloison, Doublage, Plafond, Combles, Rampants, Porte, Fenêtre) : les mesures
      + 2 ou 3 questions, Cliky calcule toutes les fournitures et la pose avec SA base (POST /espace/ouvrages, sans IA) ;
      puis VOS HABITUELS, « Repartir d'un devis déjà fait », et TOUTE la base rangée par fournisseur puis par famille
      (Castorama · prix publics et Clim à part, « prix à confirmer ») ; recherche au clavier ou à la voix
      (« cloison 4 mètres sur 2,50 » ouvre la cloison déjà remplie).
   3. Les lignes + les travaux complets en un bloc (détail repliable) + Total HT + « Créer le devis » (deux appuis).
   Les prix : vente en gros, et toujours d'où il vient (fournisseur, date du tarif, achat + votre marge) ; comparaison
   avec les autres fournisseurs pour un même produit ; écran « Mes prix à confirmer » (un prix à la fois : C'est bon / Corriger),
   POST /espace/base {valider:[code]} ou {code, prix}.
   Sur iPad/PC (≥ 900 px) : devis à gauche, base à droite. Rien ne part chez le client : le devis est créé dans ses documents. */
(function(){
"use strict";
var $=function(s,r){return (r||document).querySelector(s)};
var lsG=function(k){try{return JSON.parse(localStorage.getItem(k)||'null')}catch(e){return null}};
var lsS=function(k,v){try{if(v==null)localStorage.removeItem(k);else localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var r2=function(n){return Math.round((+n||0)*100)/100};
var eur=function(n){var s=Math.abs(r2(n)).toFixed(2).split('.');return (n<0?'− ':'')+s[0].replace(/\B(?=(\d{3})+(?!\d))/g,' ')+','+s[1]+' €'};
var nb=function(s){var n=parseFloat(String(s==null?'':s).replace(/\s/g,'').replace(',','.'));return isFinite(n)?n:0};
var qf=function(n){return String(Math.round(n*100)/100).replace('.',',')};
var cm2=function(n){var s=(Math.round(n*100)/100).toFixed(2);return s.replace('.',',').replace(/,00$/,'')};
var sans=function(x){return String(x||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')};
var large=function(){return window.innerWidth>=900};
var SR=window.SpeechRecognition||window.webkitSpeechRecognition;

/* ---------- les icônes ---------- */
var I=function(p){return '<svg viewBox="0 0 24 24" aria-hidden="true">'+p+'</svg>'};
var IC={cad:I('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),doc:I('<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 12h5M10 16h5"/>'),loupe:I('<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>'),pers:I('<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>'),
 x:I('<path d="M6 6l12 12M18 6L6 18"/>'),dos:I('<path d="M15 5l-7 7 7 7"/>'),ch:I('<path d="M9 5l7 7-7 7"/>'),bas:I('<path d="M5 9l7 7 7-7"/>'),
 mic:I('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>'),ok:I('<path d="M5 12l5 5 9-10"/>'),
 hist:I('<path d="M4 12a8 8 0 1 0 3-6.2"/><path d="M4 4v4h4M12 8v4l3 2"/>'),etoile:I('<path d="M12 4l2.4 5 5.4.6-4 3.7 1.1 5.3L12 16l-4.9 2.6 1.1-5.3-4-3.7 5.4-.6z"/>'),
 prix:I('<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/>'),
 pose:I('<path d="M4 15a8 8 0 0 1 16 0"/><path d="M3 15h18v3H3zM12 7V4M9 8l-1-2M15 8l1-2"/>'),
 prod:I('<path d="M3 8l9-5 9 5v8l-9 5-9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>'),
 tr:I('<path d="M4 20V9l8-5 8 5v11z"/><path d="M9 20v-6h6v6"/>'),plus:I('<path d="M12 5v14M5 12h14"/>')};
var ICT={cloison:I('<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 3v18M15 3v18"/>'),
 doublage:I('<rect x="3" y="3" width="6" height="18" rx="1"/><path d="M12 6c3 0 3 2 6 2M12 11c3 0 3 2 6 2M12 16c3 0 3 2 6 2"/>'),
 plafond:I('<path d="M3 5h18M7 5v4M12 5v4M17 5v4M4 9h16"/><path d="M8 20v-6h8v6"/>'),
 combles:I('<path d="M3 12l9-8 9 8"/><path d="M6 12c2 0 2 2 4 2s2-2 4-2 2 2 4 2"/><path d="M5 12v8h14v-8"/>'),
 rampants:I('<path d="M3 20L12 4l9 16"/><path d="M8 14c1.5 0 2 1.5 3.5 1.5S13.5 14 15 14"/>'),
 portes:I('<rect x="6" y="3" width="12" height="18" rx="1"/><circle cx="15" cy="12" r="1"/>'),
 fenetres:I('<rect x="4" y="4" width="16" height="16" rx="1"/><path d="M12 4v16M4 12h16"/>'),
 sol:I('<path d="M3 20h18M5 20l3-9h8l3 9M9.5 11l-1 9M14.5 11l1 9M6.5 15.5h11"/>'),
 elec:I('<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>'),
 plomb:I('<path d="M7 4v6a5 5 0 0 0 10 0V4"/><path d="M5 4h4M15 4h4M12 15v5M9 20h6"/>'),
 peinture:I('<rect x="4" y="3" width="14" height="6" rx="1.5"/><path d="M18 6h2v5h-8v3"/><rect x="10.5" y="14" width="3" height="7" rx="1"/>'),
 clim:I('<rect x="3" y="5" width="18" height="8" rx="2"/><path d="M6 10h12M8 16c0 1.5-1 2-1 3M12 16c0 1.5-1 2-1 3M16 16c0 1.5-1 2-1 3"/>')};
function iconeFam(f,k){var P=window.PCPROD&&PCPROD.icone,t=sans(f),c=k==='prestation'?'casque':/plaque|doublage colle/.test(t)?'ba13':/ossature|suspente|appui/.test(t)?'ossature':/laine|isol|soufflage|combles/.test(t)?'laine':/porte|chassis|quincaill/.test(t)?'porte':/vis|fixation|cheville/.test(t)?'vis':/enduit|bande|colle/.test(t)?'enduit':/mousse|mastic|joint/.test(t)?'cartouche':/sol|plancher|plinthe/.test(t)?'parquet':/protection|proprete|outil/.test(t)?'protection':/trappe/.test(t)?'fenetre':/vapeur|etanch/.test(t)?'protection':/electri|cable|gaine/.test(t)?'elec':/plomb|sanitaire|eau|clim/.test(t)?'eau':'colis';
 return (P&&P(c))||''}

/* ---------- noms lisibles : « PLAQUE DE PLATRE BA13 250 X 120 NF » → « Plaque de plâtre BA13 250 × 120 NF » ---------- */
var ACC={platre:'plâtre',chassis:'châssis',minerale:'minérale',etancheite:'étanchéité',allege:'allégé',beton:'béton',fenetre:'fenêtre',ecran:'écran',renforcee:'renforcée',elastomere:'élastomère',degraissant:'dégraissant',equerre:'équerre',metal:'métal',metallique:'métallique',galvanise:'galvanisé',isolee:'isolée',premiere:'première',securite:'sécurité',decoupe:'découpe'};
/* sans les notes internes entre parenthèses (« (main-d'œuvre, milieu de 5 à 10 €/ml, ootravaux.fr …) ») : elles ne vont pas sur le devis du client */
function lisible(d){d=String(d||'').replace(/\s*\(P\)\s*$/,'').replace(/\s*\((?:[^()]*(?:main-d|milieu|moyenne|rep[eè]re|\.fr|\.com|€|prix|confirmer)[^()]*)\)/gi,'').trim();
 if(d.replace(/[^a-zà-ÿ]/g,'').length>3)return d;
 var w=d.split(/\s+/).map(function(m){if(/\d/.test(m)||m.length<=3&&/^[A-Z]+$/.test(m)&&!/^(DE|DU|LA|LE|LES|ET|EN|AU|AUX|POUR|SUR|AVEC|SANS|UN|UNE|DES|PAR)$/.test(m))return m;
  var l=m.toLowerCase();l=ACC[l]||l;return l});
 var s=w.join(' ').replace(/(\d)\s*[xX]\s*(\d)/g,'$1 × $2').replace(/ x (\d)/g,' × $1');
 return s.charAt(0).toUpperCase()+s.slice(1)}
function unite(a){var c=String(a.cond||'').split(/ de | \(/)[0].trim();return c||a.u||'u'}
/* Ce que contient un conditionnement (Cyril 26/11 : « le prix à l'unité mais aussi au m², au ml ») :
   « plaque (3 m²) » → 3 m² ; « barre de 2,6 m » → 2,6 ml ; « sac de 25 kg » → 25 kg ; « boîte de 200 » → 200 pièces */
function mesure(a){var c=String(a.cond||'').trim();if(/^(m²|ml|m|m³|u|kg|h|forfait|unité)$/i.test(c))return null;
 var m=/(\d+(?:[.,]\d+)?)\s*(m²|m³|kg|m)(?![a-zà-ÿ²³])/i.exec(c);if(m){var n=nb(m[1]);return n>0&&n!==1?{n:n,u:m[2]==='m'?'ml':m[2]}:null}
 m=/^(?:boîte|pack|lot|sachet|paquet|carton) de (\d+)\s*$/i.exec(c);if(m&&+m[1]>1)return {n:+m[1],u:'pièce'};return null}
function m2par(a){var x=mesure(a);return x?x.n:0}
var eurF=function(n){return n>0&&n<1?String(Math.round(n*1000)/1000).replace('.',',')+' €':eur(n)};
function prixMesure(a,pu){var x=mesure(a);return x?eurF((pu!=null?pu:prixVente(a))/x.n)+' '+parU(x.u):''}
function pluriel(u,q){if(q<=1||/[²³]|^(m|ml|h|u|kg|l|forfait)$/i.test(u)||/[sx]$/.test(u)||/\s/.test(u))return u;return u+'s'}
function detail(a){var c=String(a.cond||''),m=/\(([^)]*)\)/.exec(c);return m?m[1]:/ de /.test(c)?c.replace(/^[^ ]+ de /,''):''}
function parU(u){return u==='u'?'l’unité':/^(m²|m|ml|h|kg|m³|l)$/.test(u)?'le '+u:'la '+u}

/* ---------- les données : base Cliky, compléments, fournisseurs, marge, vos produits ---------- */
var B=lsG('pc-ds-base')||{articles:[],complements:[],marge_pct:null},FO=lsG('pc-cliky-four')||[],etatB='';
function prendreBase(x){B={articles:x.articles||[],complements:x.complements||B.complements||[],marge_pct:x.marge_pct!=null?+x.marge_pct:B.marge_pct,source:x.source||B.source||''};lsS('pc-ds-base',B);CLE={};CACHE={}}
function charger(){if(etatB==='charge')return;etatB='charge';
 PCV.api('/espace/base').then(function(x){prendreBase(x);etatB='ok';rendre()},function(e){etatB='err:'+e.message;rendre()});
 PCV.api('/espace/fournisseurs').then(function(x){FO=x.fournisseurs||[];lsS('pc-cliky-four',FO);rendre()},function(){})}
function marge(){return B.marge_pct!=null&&B.marge_pct>=0?B.marge_pct:0}
function prixVente(a){return a.k==='prestation'?r2(a.pc):r2(a.pc*(1+marge()/100))}
var DEMO=/^(PLA-CLO|PLA-PORTE|PLA-BJ|FEN-POSE-RENO|MO-H|SOL-POSE|PRO-NET|EX-)/;
function vosProduits(){var b=lsG('pc-base1');if(!Array.isArray(b))return [];
 return b.filter(function(p){return p&&p.d&&+p.p>0&&!p.ex&&!DEMO.test(p.c||'')}).map(function(p){return {c:'V-'+(p.c||p.d),d:p.d,cond:p.u||'u',u:p.u||'u',pc:+p.p,k:p.k||'prestation',f:p.f||p.t||'Vos produits',vos:1}})}
function tousArt(){return B.articles.concat(B.complements||[],vosProduits())}
function trouveArt(c){return tousArt().filter(function(z){return z.c===c})[0]}
var NOMS={castorama:'Castorama · prix publics',clim:'Clim'};
function nomFour(id){if(NOMS[id])return NOMS[id];var f=FO.filter(function(x){return x.id===id})[0];if(f&&f.nom)return f.nom;if(id==='base'){var s=/—\s*(?:TARIF\s+(?:PRO\s+)?)?([^(,]+)/i.exec(B.source||'');return s?s[1].trim().toLowerCase().replace(/(^|\s)\S/g,function(x){return x.toUpperCase()}):'Fournisseur de départ'}return 'Autre fournisseur'}
function nomDe(a){return a.vos?'Vos produits':a.k==='prestation'&&!a.four?'Votre main-d’œuvre':nomFour(a.four||'base')}
/* La date du tarif : « relevé du 21/10/2026 … valable jusqu'au 31/10/2026 » (base) ou la rubrique (compléments) */
var jour=function(d){var m=/(\d{2})\/(\d{2})\/(\d{4})/.exec(d||'');return m?new Date(+m[3],+m[2]-1,+m[1]):null};
function tarif(id){var src=id==='base'?B.source||'':id==='castorama'||id==='clim'?((B.complements||[]).filter(function(a){return a.four===id})[0]||{}).src||'':'';
 var rel=/relev[ée] du (\d{2}\/\d{2}\/\d{4})/i.exec(src)||/(\d{2}\/\d{2}\/\d{4})/.exec(src),val=/valable jusqu.au (\d{2}\/\d{2}\/\d{4})/i.exec(src);
 var t={du:rel?rel[1]:'',fin:val?val[1]:''};t.passe=!!(t.fin&&jour(t.fin)<new Date());t.public=/public/i.test(src);t.ttc=/TTC/.test(src);return t}
function phraseTarif(id){var t=tarif(id);return (t.du?'tarif du '+t.du:'')+(t.public?' (prix publics'+(t.ttc?', TTC ÷ 1,2':'')+')':'')}

/* ---------- comparer un même produit chez plusieurs fournisseurs ---------- */
var STOP=/^(pour|avec|sans|les|des|une|par|sur|aux|the|nf|ce)$/,CLE={};
function cle(a){if(CLE[a.c])return CLE[a.c];var t=sans(lisible(a.d)).replace(/×/g,' ').replace(/[^a-z0-9,.]+/g,' ');
 var n=(t.match(/\d+(?:[.,]\d+)?/g)||[]).sort().join('|'),w=t.split(' ').filter(function(x){return x.length>=3&&!/\d/.test(x)&&!STOP.test(x)});
 return CLE[a.c]={n:n,w:w}}
function pareil(a,b){var x=cle(a),y=cle(b);if(x.n!==y.n||!x.w.length||!y.w.length)return false;var c=0;x.w.forEach(function(m){if(y.w.indexOf(m)>=0)c++});return c/Math.max(x.w.length,y.w.length)>=.6}
function ailleurs(a){if(a.vos)return [];var fa=a.four||'mo';return tousArt().filter(function(b){return b!==a&&!b.vos&&(b.four||'mo')!==fa&&b.k===a.k&&unite(b)===unite(a)&&pareil(a,b)}).sort(function(x,y){return prixVente(x)-prixVente(y)})}
function moinsCher(a){var L=ailleurs(a);return L.length&&prixVente(L[0])<prixVente(a)-.01?L[0]:null}

/* ---------- les travaux complets (Cliky calcule tout, comme pour un pré-devis) ---------- */
/* Sol : plancher sur lambourdes (questions seulement si « Oui ») ; peinture : murs et plafonds ont plus de questions */
function PLB(d){return d.plancher==='Oui'}
function MP(d){return d.support==='Murs'||d.support==='Plafond'}
/* La mesure de la peinture change selon ce qu’on peint : m² (murs, plafond), nombre (portes, radiateurs, fenêtres), mètres (plinthes) */
function mesDe(t,d,m){if(t!=='peinture')return m;var s=d.support;return /Portes|Radiateurs|Fenêtres/.test(s)?[m[0],'Combien ?','u']:s==='Plinthes'?[m[0],'Longueur','m']:[m[0],'Surface','m²']}
var OUV={
 cloison:{nom:'Cloison',mes:[['L','Longueur','m'],['H','Hauteur','m',2.5]],q:[['portes','Une porte dedans ?',[['Non',0],['1 porte',1],['2 portes',2]]],['largeur','Largeur de la porte',[['63 cm','63 cm'],['73 cm','73 cm'],['83 cm','83 cm'],['93 cm','93 cm']],2,function(d){return d.portes>0}],['phonique','Contre le bruit',[['Standard','Standard'],['Renforcée','Renforcée']]],['hydro','Salle d’eau d’un côté ?',[['Non',false],['Oui',true]]]]},
 doublage:{nom:'Doublage d’un mur',mes:[['L','Longueur','m'],['H','Hauteur','m',2.5]],q:[['ext','Quel mur ?',[['Extérieur','Oui'],['Intérieur','Non']]],['etat','État du mur',[['Bon','Bon'],['Abîmé, irrégulier','Abîmé'],['Je ne sais pas','Je ne sais pas']]],['fen','Fenêtres dans ce mur',[['Aucune',0],['1',1],['2',2]]],['objectif','Isolation',[['Standard','Standard'],['Pour les aides (R ≥ 3,7)','Aides']]]]},
 plafond:{nom:'Plafond',mes:[['L','Longueur','m'],['l','Largeur','m'],['H','Hauteur sous plafond','m',2.5]],q:[['support','Au-dessus',[['Solives ou béton','Solives ou béton'],['Ancien plafond','Ancien plafond'],['Je ne sais pas','Je ne sais pas']]],['humide','Pièce humide ?',[['Non','Non'],['Oui','Oui']]]]},
 combles:{nom:'Combles perdus',mes:[['surface','Surface au sol','m²']],q:[],fixe:{type:'Perdus (grenier non habité)'}},
 rampants:{nom:'Rampants',mes:[['surface','Surface des rampants','m²']],q:[]},
 portes:{nom:'Porte',mes:[],q:[['largeur','Largeur',[['63 cm','63 cm'],['73 cm','73 cm'],['83 cm','83 cm'],['93 cm','93 cm']],2],['bati','La pose',[['Bloc-porte neuf','Oui'],['Remplace l’ancienne','Dépose de l’ancienne'],['Porte seule','Non']]],['sens','Sens',[['Gauche poussant','Gauche poussant'],['Droite poussant','Droite poussant']]],['type','Porte',[['Standard','Standard'],['Plus isolante','Isolante (bruit)']]]]},
 sol:{nom:'Sol',mes:[['surface','Surface','m²']],q:[['neuf','Revêtement',[['Carrelage','Carrelage'],['Parquet','Parquet'],['Stratifié','Stratifié'],['Vinyle','Sol souple (vinyle)'],['Aucun (plancher seul)','Aucun']]],['format','Format du carrelage',[['30 × 60','30 × 60'],['45 × 45','45 × 45'],['60 × 60','60 × 60'],['75 × 75','75 × 75']],2,function(d){return d.neuf==='Carrelage'}],['depose','Ancien sol à enlever ?',[['Non','Non'],['Oui','Oui']]],['actuel','Ancien sol',[['Carrelage','Carrelage'],['Parquet','Parquet'],['Moquette','Moquette'],['Lino','Lino']],0,function(d){return d.depose==='Oui'}],['plinthes','Plinthes neuves',[['Oui','Oui'],['Non','Non']],0,function(d){return d.neuf!=='Aucun'}],
  ['plancher','Créer un plancher (lambourdes + panneaux) ?',[['Non','Non'],['Oui','Oui']]],
  ['section','Lambourdes',[['40 × 60','40 × 60'],['45 × 70','45 × 70'],['50 × 75','50 × 75'],['63 × 75','63 × 75']],0,PLB],
  ['entraxe','Entraxe des lambourdes',[['40 cm','40 cm'],['50 cm','50 cm'],['60 cm','60 cm']],0,PLB],
  ['panneau','Panneaux',[['OSB 18 mm','OSB 18'],['OSB 22 mm','OSB 22'],['CTBH 22 mm','CTBH 22']],0,PLB],
  ['support','Lambourdes posées sur',[['Plancher bois','Plancher bois'],['Dalle béton','Dalle béton']],0,PLB]]},
 peinture:{nom:'Peinture',mes:[['n','Surface','m²']],q:[['support','Quoi ?',[['Murs','Murs'],['Plafond','Plafond'],['Portes','Portes'],['Plinthes','Plinthes'],['Radiateurs','Radiateurs'],['Fenêtres','Fenêtres']],0,null,'avant'],
  ['etat','État',[['Placo neuf','Neuf (placo)'],['Bon état','Bon état'],['Abîmé','Abîmé']],1,MP],
  ['revetement','Revêtement',[['Peinture','Peinture'],['Toile de verre','Toile de verre + peinture'],['Papier peint','Papier peint']],0,MP],
  ['depose','Ancien papier peint à enlever ?',[['Non','Non'],['Oui','Oui']],0,MP],
  ['enduit','Enduit de lissage ?',[['Non','Non'],['Oui','Oui']],0,MP],
  ['finition','Finition',[['Mat','Mat'],['Velours','Velours'],['Satin','Satin'],['Laque','Laque']],0,function(d){return d.revetement!=='Papier peint'||!MP(d)}],
  ['application','Application',[['Rouleau','Rouleau'],['Pistolet','Pistolet']],0,function(d){return d.revetement!=='Papier peint'||!MP(d)}]]},
 elec:{nom:'Électricité',eq:1,compte:[['Prise','Prise'],['Prise double','Prise double'],['Prise plan de travail','Prise plan de travail'],['Interrupteur','Interrupteur'],['Va-et-vient','Va-et-vient'],['Prise TV','Prise TV'],['Prise internet (RJ45)','Prise internet'],['Applique','Applique'],['Tableau électrique','Tableau électrique']]},
 plomb:{nom:'Plomberie',eq:1,compte:[['WC suspendu','WC suspendu'],['Lave-mains','Lave-mains'],['Douche','Douche'],['Baignoire','Baignoire'],['Meuble vasque','Meuble vasque'],['Meuble évier','Évier'],['Chauffe-eau','Chauffe-eau'],['Lave-linge','Lave-linge'],['Lave-vaisselle','Lave-vaisselle']]},
 clim:{nom:'Chauffage, clim',eq:1,compte:[['Clim murale','Clim murale'],['Radiateur','Radiateur'],['Sèche-serviettes','Sèche-serviettes']]},
 fenetres:{nom:'Fenêtre (pose)',mes:[['Lc','Largeur','cm'],['Hc','Hauteur','cm']],q:[['mat','Matière',[['PVC','PVC'],['Alu','Alu'],['Bois','Bois']]],['pose','La pose',[['Sur l’ancien cadre','Sur ancien cadre'],['Dépose complète','Dépose complète']]]]}};
var ORDRE=['cloison','doublage','plafond','combles','rampants','portes','fenetres','sol','peinture','elec','plomb','clim'];
['elec','plomb','clim'].forEach(function(t){OUV[t].mes=[];OUV[t].q=[['etat','Travaux',[['À créer','À créer'],['À changer','À changer']]]]});
/* Électricité, plomberie, clim : des compteurs ; envoyés au calcul comme « Prise:2;Clim murale:1 » */
function nEq(d){var n=0;for(var k in d.c||{})n+=+d.c[k]||0;return n}
function serv(o){if(o.travail==='peinture'){var d={},s=o.d.support;for(var k in o.d)if(k!=='n')d[k]=o.d[k];d[/Portes|Radiateurs|Fenêtres/.test(s)?'nombre':s==='Plinthes'?'longueur':'surface']=o.d.n;return {travail:'peinture',d:d}}
 if(!OUV[o.travail].eq)return {travail:o.travail,d:o.d};var c=o.d.c||{};return {travail:'equipements',d:{etat:o.d.etat,liste:Object.keys(c).filter(function(k){return c[k]>0}).map(function(k){return k+':'+c[k]}).join(';')}}}
function listeEq(o){var c=o.d.c||{},t=OUV[o.travail];return t.compte.filter(function(x){return c[x[0]]>0}).map(function(x){var n=c[x[0]];return n+' '+(n>1?x[1].toLowerCase().replace(/^(\S+)/,function(m){return /[sx]$/.test(m)?m:m+'s'}):x[1].toLowerCase())})}
function dOuv(t,pre){var o=OUV[t],d={};if(o.compte)d.c={};o.mes.forEach(function(m){d[m[0]]=m[3]!=null?m[3]:0});o.q.forEach(function(q){d[q[0]]=q[2][q[3]||0][1]});if(o.fixe)for(var k in o.fixe)d[k]=o.fixe[k];if(pre)for(var p in pre)d[p]=pre[p];return d}
function pret(o){if(OUV[o.travail].eq)return nEq(o.d)>0;return OUV[o.travail].mes.every(function(m){return nb(o.d[m[0]])>0})}
function titreOuv(o){var t=OUV[o.travail],d=o.d,m=t.mes;
 if(t.eq)return t.nom+' · '+nEq(d)+' élément'+(nEq(d)>1?'s':'');
 if(o.travail==='peinture'){var u=mesDe('peinture',d,m[0])[2];return u==='u'?'Peinture '+cm2(d.n)+' '+String(d.support).toLowerCase().replace(/s$/,nb(d.n)>1?'s':''):'Peinture '+String(d.support).toLowerCase()+' '+cm2(d.n)+' '+u}
 if(o.travail==='sol'&&d.neuf==='Aucun')return 'Plancher sur lambourdes '+cm2(d.surface)+' m²';
 if(o.travail==='sol')return 'Sol '+String(d.neuf==='Sol souple (vinyle)'?'vinyle':d.neuf).toLowerCase()+' '+cm2(d.surface)+' m²';
 if(o.travail==='portes')return 'Porte '+d.largeur;
 if(o.travail==='fenetres')return 'Fenêtre '+cm2(d.Lc)+' × '+cm2(d.Hc)+' cm';
 if(m.length===1)return t.nom+' '+cm2(d[m[0][0]])+' m²';
 return t.nom+' '+cm2(d[m[0][0]])+' × '+cm2(d[m[1][0]])+' m'}
function resumeOuv(o){var t=OUV[o.travail],R=[];if(t.eq)return listeEq(o).join(', ')+' · '+String(o.d.etat).toLowerCase();
 if(o.travail==='sol'){var d0=o.d;return [d0.neuf==='Carrelage'?d0.format:'',d0.depose==='Oui'?'dépose '+String(d0.actuel).toLowerCase():'sans dépose',d0.plinthes==='Oui'&&d0.neuf!=='Aucun'?'plinthes neuves':'',d0.plancher==='Oui'?'plancher '+d0.section+' à '+d0.entraxe+', '+d0.panneau+', sur '+String(d0.support).toLowerCase():''].filter(Boolean).join(' · ')}
 if(o.travail==='peinture'){var d1=o.d;if(!MP(d1))return [d1.finition.toLowerCase(),d1.application==='Pistolet'?'au pistolet':''].filter(Boolean).join(' · ');
  return [d1.etat==='Neuf (placo)'?'placo neuf':d1.etat.toLowerCase(),d1.depose==='Oui'?'dépose papier peint':'',d1.enduit==='Oui'?'enduit de lissage':'',d1.revetement==='Peinture'?'':d1.revetement.toLowerCase(),d1.revetement==='Papier peint'?'':d1.finition.toLowerCase(),d1.application==='Pistolet'?'au pistolet':''].filter(Boolean).join(' · ')}if(o.travail==='plafond')R.push('hauteur '+cm2(o.d.H)+' m');
 t.q.forEach(function(q){if(q[0]==='largeur'||q[4]&&!q[4](o.d))return;var v=o.d[q[0]],c=q[2].filter(function(x){return x[1]===v})[0];if(!c)return;
  if(q[0]==='portes')R.push(v?c[0]:'sans porte');else if(q[0]==='hydro'||q[0]==='humide'){if(v===true||v==='Oui')R.push(q[0]==='hydro'?'salle d’eau':'pièce humide')}
  else if(q[0]==='fen'){if(v)R.push(v+' fenêtre'+(v>1?'s':''))}else if(q[0]==='ext')R.push('mur '+c[0].toLowerCase());else R.push(c[0].toLowerCase())});
 return R.join(' · ')}
/* Le calcul : tout ensemble (vis, bandes, protection et nettoyage comptés une seule fois). Mémorisé par contenu. */
var CACHE={};
function chiffrer(liste){var L=liste.filter(pret).map(serv);if(!L.length)return Promise.resolve({total_ht:0,groupes:[],a_verifier:[]});
 var k=JSON.stringify(L);if(!CACHE[k])CACHE[k]=PCV.api('/espace/ouvrages',{method:'POST',body:{ouvrages:L}}).then(function(x){if(x&&x.ok===false)throw new Error(x.erreur||'Calcul impossible');return x},function(e){delete CACHE[k];throw e});return CACHE[k]}
function recalculer(){if(!S)return;var n=++recalculer.n;if(!S.ouvrages.length){S.calc=null;S.calcEtat='';rendre();return}S.calcEtat='charge';
 chiffrer(S.ouvrages).then(function(x){if(!S||n!==recalculer.n)return;S.calc=x;S.calcEtat='';rendre()},function(e){if(!S||n!==recalculer.n)return;S.calcEtat='err:'+e.message;rendre()})}
recalculer.n=0;
function lignesCalc(){var R=[];(S&&S.calc&&S.calc.groupes||[]).forEach(function(g){g.lignes.forEach(function(l){R.push(l)})});return R}
/* « Pose bloc-porte (prix moyen, provisoire) » → « Pose bloc-porte » : la mention reste en étiquette pour vous, pas sur le devis du client */
function libC(x){return String(x||'').replace(/\s*\((?:prix moyen(?:,\s*provisoire)?|tarif provisoire|provisoire)\)\s*$/i,'')}

/* ---------- DEUX DEVIS (Cyril 26/11) : « le devis final pour le client n'affichera pas les produits, juste des lignes qui expliquent
   les travaux et le prix, tout se fond dedans » + « un devis qui ne peut pas quitter l'Espace, détaillé à 100 % pour l'artisan ».
   « Pour moi » = tout le détail (produits, quantités, prix), il reste dans l'Espace.
   « Pour le client » = une ligne par travail : un titre, une phrase écrite par Cliky depuis les réglages, le prix (fournitures fondues).
   On change un réglage (laine 45 → 100 mm) dans le détaillé : le prix ET la phrase du client se mettent à jour tout seuls.
   Une phrase changée à la main est gardée ; si Cliky aurait écrit autre chose depuis, on le signale (« Mettre à jour »). ---------- */
var GCL={'Cloisons':'cloison','Doublage et isolation des murs':'doublage','Plafonds':'plafond','Isolation des combles':'combles','Trappe d’accès':'combles',"Trappe d'accès":'combles',
 'Isolation des rampants':'rampants','Portes':'portes','Fenêtres':'fenetres','Fenêtres de toit':'fenetres','Sols':'sol','Plinthes':'sol','Peinture':'peinture',
 'Électricité, plomberie et équipements':'eq','Bandes, enduit et vis (toutes les plaques)':'*plaque','Protection, nettoyage et évacuation':'chantier','Déplacement':'dep'};
var PLAQ=['cloison','doublage','plafond','rampants','combles'];
var RANGS=['cloison','doublage','plafond','combles','rampants','portes','fenetres','sol','peinture','eq'];
function bkO(o){return /^(elec|plomb|clim)$/.test(o.travail)?'eq':o.travail}
var TCL={cloison:['Création d’une cloison','Création de cloisons'],doublage:['Doublage et isolation des murs'],plafond:['Faux plafond','Faux plafonds'],combles:['Isolation des combles'],rampants:['Isolation des rampants'],
 portes:['Fourniture et pose d’une porte','Fourniture et pose de portes'],fenetres:['Fourniture et pose d’une fenêtre','Fourniture et pose de fenêtres'],sol:['Revêtement de sol','Revêtements de sol'],peinture:['Peinture'],
 chantier:['Protection, nettoyage et évacuation du chantier'],dep:['Déplacement']};
function titreBk(k,O){if(k==='eq'){var n={elec:'Électricité',plomb:'Plomberie',clim:'Climatisation'},T=[];O.forEach(function(o){var x=n[o.travail];if(x&&T.indexOf(x)<0)T.push(x)});return T.length?T.join(', ').replace(/, ([^,]*)$/,' et $1'):'Électricité, plomberie et équipements'}
 if(k==='sol'&&O.length&&O.every(function(o){return o.d.neuf==='Aucun'}))return 'Création d’un plancher';var t=TCL[k];return t?(O.length>1&&t[1]?t[1]:t[0]):k}
function maj1(x){x=String(x||'').trim();return x.charAt(0).toUpperCase()+x.slice(1)}
/* La phrase du client, en mots simples, depuis les réglages du travail (jamais un nom de produit). */
function phraseO(o){var d=o.d||{},t=o.travail,x=function(v){return cm2(nb(v))},P=[];
 if(t==='cloison'){P.push('Cloison de '+x(d.L)+' × '+x(d.H)+' m sur ossature métallique avec isolant phonique'+(d.phonique==='Renforcée'?' renforcé':''));if(d.hydro===true)P.push('plaques hydrofuges côté salle d’eau');if(+d.portes>0)P.push((+d.portes>1?d.portes+' portes':'une porte')+(d.largeur?' de '+d.largeur:''))}
 else if(t==='doublage'){P.push('Doublage isolant du mur '+(d.ext==='Non'?'intérieur':'extérieur')+' de '+x(d.L)+' × '+x(d.H)+' m');if(d.objectif==='Aides')P.push('isolation éligible aux aides (R ≥ 3,7)');if(+d.fen>0)P.push('avec le tour de '+(+d.fen>1?d.fen+' fenêtres':'la fenêtre'))}
 else if(t==='plafond')P.push('Faux plafond de '+x(d.L)+' × '+x(d.l)+' m sur ossature métallique');
 else if(t==='combles')P.push('Isolation des combles perdus sur '+x(d.surface)+' m²');
 else if(t==='rampants')P.push('Isolation des rampants sous toiture sur '+x(d.surface)+' m²');
 else if(t==='portes'){P.push((d.bati==='Non'?'Porte seule':'Bloc-porte')+(d.largeur?' de '+d.largeur:'')+(d.type&&d.type!=='Standard'?', isolant contre le bruit':''));if(/Dépose/.test(d.bati||''))P.push('dépose de l’ancienne porte')}
 else if(t==='fenetres'){P.push('Fenêtre'+(d.mat?' '+d.mat:'')+' de '+x(d.Lc)+' × '+x(d.Hc)+' cm');P.push(/Dépose/.test(d.pose||'')?'pose en dépose complète':'pose sur l’ancien cadre')}
 else if(t==='sol'){if(d.neuf==='Aucun')P.push('Plancher neuf sur lambourdes sur '+x(d.surface)+' m²');else{var nm={'Sol souple (vinyle)':'Sol vinyle'}[d.neuf]||d.neuf||'Sol';P.push(nm+(d.neuf==='Carrelage'&&d.format?' '+d.format:'')+' sur '+x(d.surface)+' m²');if(d.plancher==='Oui')P.push('sur plancher neuf (lambourdes et panneaux)')}
  if(d.depose==='Oui')P.push('dépose de l’ancien sol');if(d.plinthes==='Oui'&&d.neuf!=='Aucun')P.push('plinthes neuves')}
 else if(t==='peinture'){var sp=String(d.support||'Murs');if(!MP(d))P.push('Peinture '+(/s$/.test(sp)?'des ':'du ')+sp.toLowerCase()+(nb(d.n)?' ('+x(d.n)+(/Plinthes/.test(sp)?' m':'')+')':'')+(d.finition?', finition '+String(d.finition).toLowerCase():''));
  else{var Q=[(sp==='Plafond'?'Plafond':'Murs')+', '+x(d.n)+' m² :'],pr=[];if(d.depose==='Oui')pr.push('dépose de l’ancien papier peint');pr.push(d.etat==='Abîmé'?'reprise des supports abîmés':d.etat==='Neuf (placo)'?'':'préparation des supports');if(d.enduit==='Oui')pr.push('enduit de lissage');
   if(d.revetement==='Papier peint')pr.push('pose de papier peint');else{if(d.revetement&&/Toile/.test(d.revetement))pr.push('pose de toile de verre');if(d.etat!=='Bon état')pr.push('une couche d’impression');pr.push('deux couches de peinture'+(d.finition?' '+String(d.finition).toLowerCase():''))}
   P.push(Q[0]+' '+pr.filter(Boolean).join(', ').replace(/, ([^,]*)$/,' et $1'))}}
 else if(OUV[t]&&OUV[t].eq){var le=listeEq(o);P.push(le.length?maj1(le.join(', ').replace(/, ([^,]*)$/,' et $1')):OUV[t].nom);if(d.etat==='À changer')P.push('en remplacement de l’existant')}
 else{var r=resumeOuv(o).split(' · ').filter(Boolean).join(', ');P.push(titreOuv(o)+(r?', '+r:''))}
 return maj1(P.join(', '))+'.'}
function phraseBk(k,O,plaque){if(k==='chantier')return 'Protection des sols et des meubles, nettoyage en fin de chantier et évacuation des déchets.';if(k==='dep')return '';
 var p=O.map(phraseO).join(' ');if(plaque)p+=' Bandes et enduit des joints compris.';
 if(O.length)p+=k==='peinture'?' Fourniture et application.':' Fourniture et pose.';return p.trim()}
function uidL(l){if(!l.uid)l.uid='l'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);return l.uid}
/* Les lignes du devis du client, dans l'ordre d'un chantier. Le total est exactement celui du devis détaillé. */
function lignesClient(){var B={},ordre=[],sansT=[],c=S.calc&&!S.calcEtat?S.calc:null,plq=0;
 function bk(k){if(!B[k]){B[k]={k:k,O:[],total:0,pl:0,L:[]};ordre.push(k)}return B[k]}
 S.ouvrages.forEach(function(o){if(pret(o))bk(bkO(o)).O.push(o)});
 if(c)c.groupes.forEach(function(g){var k=GCL[g.groupe];if(k==='*plaque'){plq+=g.total;return}
  if(!k){var x=bk('g:'+g.groupe);x.total+=g.total;x.nom=g.groupe;return}
  if(!B[k]&&(k==='portes'||k==='fenetres')){var h=PLAQ.filter(function(p){return B[p]})[0];if(h)k=h}
  bk(k).total+=g.total});
 S.lignes.forEach(function(l){uidL(l);var k=l.rg||(l.gr&&GCL[l.gr]);if(k==='*plaque')k=PLAQ.filter(function(p){return B[p]})[0];
  if(k&&k!=='seule'&&(B[k]||l.rg)){var x=bk(k);x.total+=l.total;x.L.push(l)}else sansT.push(l)});
 if(plq>0){var P=PLAQ.filter(function(p){return B[p]&&B[p].total>0});if(!P.length){var y=bk('*plaque');y.total+=plq;y.nom='Bandes, enduit et vis'}
  else{var tp=P.reduce(function(s2,p){return s2+B[p].total},0),reste=r2(plq);P.forEach(function(p,i){var v=i===P.length-1?reste:r2(plq*B[p].total/tp);reste=r2(reste-v);B[p].total+=v;B[p].pl=1})}}
 var rg=function(k){var i=RANGS.indexOf(k);return i<0?(k==='chantier'?90:k==='dep'?95:80):i};
 ordre.sort(function(a,b){return rg(a)-rg(b)});
 var R=ordre.map(function(k){var x=B[k],auto=k.indexOf('g:')===0||k==='*plaque'?{t:x.nom,p:''}:{t:titreBk(k,x.O),p:phraseBk(k,x.O,x.pl)},e=(S.cl||{})[k]||{};
  return {k:k,titre:e.t||auto.t,phrase:e.p!=null?e.p:auto.p,auto:auto,perso:e.p!=null,vieux:e.p!=null&&e.pb!==auto.p,total:r2(x.total),quantite:1,unite:'forfait',L:x.L}}).filter(function(x){return x.total>0||x.L.length});
 sansT.forEach(function(l){var e=(S.cl||{})[l.uid]||{};R.push({k:l.uid,seule:1,titre:e.t||l.libelle,phrase:e.p||'',auto:{t:l.libelle,p:''},perso:e.p!=null,total:l.total,quantite:l.quantite,unite:l.unite})});
 return R}
function bkPresents(){var K=[];lignesClient().forEach(function(x){if(!x.seule&&x.k.indexOf('g:')<0&&x.k!=='*plaque'&&x.k!=='chantier'&&x.k!=='dep')K.push(x)});return K}
function vueClient(){var R=lignesClient(),t=total(),vieux=R.filter(function(x){return x.vieux}).length,h='';
 h+='<p class="ds-note c">C’est ce devis-là que '+esc(S.nom||'le client')+' recevra. Le détail reste dans votre Espace.</p>';
 if(vieux)h+='<div class="ds-ver ds-sp"><b>'+vieux+' phrase'+(vieux>1?'s':'')+' à revoir</b><small>Vous avez changé un réglage après avoir écrit la phrase vous-même. Touchez la ligne marquée pour la mettre à jour.</small></div>';
 h+='<div class="ds-pap">'+(S.titre?'<div class="ds-pt">'+esc(S.titre)+'</div>':'')+R.map(function(x){return '<button type="button" class="ds-pl" data-ds="cll" data-id="'+esc(x.k)+'"><span><b>'+esc(x.titre)+(x.vieux?' <em class="ds-tag r">à revoir</em>':'')+'</b>'+(x.phrase?'<small>'+esc(x.phrase)+'</small>':'')+(x.seule?'<small class="ds-pq">'+qf(x.quantite)+' '+esc(pluriel(x.unite||'u',x.quantite))+' · ligne seule, <u>la ranger dans un travail</u></small>':'')+'</span><b class="ds-pr">'+eur(x.total)+'</b></button>'}).join('')+
  '<div class="ds-ptot"><span>Total HT</span><b>'+eur(t)+'</b></div></div>';
 h+='<p class="ds-note">Touchez une ligne pour changer son titre ou sa phrase.</p>';return h}
function feuilleCl(k){var x=lignesClient().filter(function(z){return z.k===k})[0];if(!x)return;F={cl:k,t:x.titre,p:x.phrase,seule:x.seule};
 var P=x.seule?bkPresents():[];
 S.feuille='<div class="ds-grab"></div><div class="ds-fq">Sur le devis du client</div>'+
  '<label class="ds-titre">Le titre<input data-dsc="t" value="'+esc(x.titre)+'" autocomplete="off"></label>'+
  '<label class="ds-titre">La phrase qui explique<textarea data-dsc="p" rows="5" placeholder="Ce qui est fait, en mots simples">'+esc(x.phrase)+'</textarea></label>'+
  (x.vieux?'<div class="ds-ver ds-sp"><b>Cliky écrirait maintenant :</b><small>'+esc(x.auto.p)+'</small></div>':'')+
  (x.perso||x.titre!==x.auto.t?'<button type="button" class="ds-btn cl" data-ds="clrem">'+IC.hist+' Reprendre le texte de Cliky</button>':'')+
  (P.length?'<div class="ds-sec" style="margin:12px 0 6px">FONDRE CETTE LIGNE DANS UN TRAVAIL</div><div class="ds-chips">'+P.map(function(b){return '<button type="button" class="ds-chip" data-ds="clrg" data-id="'+esc(b.k)+'">'+esc(b.titre)+'</button>'}).join('')+'</div><p class="ds-note c">Le client ne la voit plus : son prix s’ajoute à ce travail.</p>':'')+
  (!x.seule&&x.L&&x.L.some(function(l){return l.rg})?'<button type="button" class="ds-lien" data-ds="clsort">Remettre mes lignes ajoutées à part</button>':'')+
  '<button type="button" class="ds-btn" data-ds="clok">C’est bon</button><button type="button" class="ds-lien" data-ds="ferf">Annuler</button>';rendre()}
function okCl(){var x=lignesClient().filter(function(z){return z.k===F.cl})[0];if(!x){S.feuille=null;F=null;rendre();return}
 S.cl=S.cl||{};var e={},t=String(F.t||'').trim(),p=String(F.p||'').trim();
 if(t&&t!==x.auto.t)e.t=t.slice(0,200);if(p!==x.auto.p){e.p=p.slice(0,2000);e.pb=x.auto.p}
 if(e.t||e.p!=null)S.cl[F.cl]=e;else delete S.cl[F.cl];S.feuille=null;F=null;S.ok='Devis du client modifié';rendre()}

/* ---------- vos habituels, vos anciens devis, le devis commencé ---------- */
function usage(){return lsG('pc-ds-usage')||{}}
function compter(c){var u=usage();u[c]=(u[c]||0)+1;lsS('pc-ds-usage',u)}
function habituels(){var u=usage();return Object.keys(u).sort(function(a,b){return u[b]-u[a]}).map(trouveArt).filter(Boolean).slice(0,6)}
function anciens(){var L=lsG('pc-ds-devis');return Array.isArray(L)?L:[]}
function garder(){if(!S||S.mode==='prix'||S.maj)return;if(S.lignes.length||S.ouvrages.length){S.aGarde=1;S.reprise=null}else if(S.aGarde){lsS('pc-ds-brouillon',null);return}else return;lsS('pc-ds-brouillon',{contact:S.contact,nom:S.nom,titre:S.titre,lignes:S.lignes,ouvrages:S.ouvrages,cl:S.cl||{},le:Date.now()})}
function dateC(t){try{return new Date(t).toLocaleDateString('fr-FR',{day:'numeric',month:'long'})}catch(e){return ''}}
/* Repartir d'un devis : les produits de la base reprennent le prix d'aujourd'hui (sauf un prix changé à la main) */
function reprendre(D){var n=0;S.lignes=(D.lignes||[]).map(function(l){var a=l.c&&trouveArt(l.c);l=JSON.parse(JSON.stringify(l));
  if(a&&!l.pm){var p=prixVente(a);if(r2(p)!==r2(l.pu))n++;l.pu=p;l.total=r2(l.quantite*p);l.prov=!!a.provisoire}return l});
 S.ouvrages=JSON.parse(JSON.stringify(D.ouvrages||[]));if(!S.titre&&D.titre)S.titre=D.titre;recalculer();return n}

/* ---------- l'état du devis ---------- */
var S=null;
function etat0(){return {mode:'devis',contact:'',nom:'',titre:'',lignes:[],ouvrages:[],calc:null,calcEtat:'',etape:1,q:'',g:'tous',ouv:{},tout:{},arme:0,ok:'',det:0,tri:'fam',vue:'moi',cl:{}}}
function ouvrirDevis(k,t){S=etat0();S.contact=typeof k==='string'?k:'';S.titre=typeof t==='string'?t.slice(0,120):'';
 var br=lsG('pc-ds-brouillon');if(br&&(br.lignes&&br.lignes.length||br.ouvrages&&br.ouvrages.length)&&(!S.contact||S.contact===br.contact))S.reprise=br;
 var C=clients();if(S.contact){var c=C.filter(function(x){return x.id===S.contact})[0];S.nom=c?c.n:nomDos(S.contact);S.etape=2}
 charger();monter();rendre()}
function ouvrirPrix(){if(!S){S=etat0();S.solo=1;charger();monter()}S.mode='prix';S.feuille=null;S.P={i:0,fait:0,ed:0,liste:aConfirmer().map(function(a){return a.c})};rendre()}
function clients(){try{return (PCV.clients&&PCV.clients())||[]}catch(e){return []}}
function nomDos(k){try{var d=window.PCX&&PCX.DOS&&PCX.DOS[k];return d&&d.n||''}catch(e){return ''}}
var ov=null;
function monter(){if(ov){ov.hidden=false;document.body.style.overflow='hidden';return}
 ov=document.createElement('div');ov.id='dsv';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-label','Nouveau devis');document.body.appendChild(ov);document.body.style.overflow='hidden';
 ov.addEventListener('click',clic);ov.addEventListener('input',saisie)}
function fermer(){if(ov)ov.hidden=true;document.body.style.overflow='';S=null;F=null}
function totalCalc(){return S.calc&&!S.calcEtat?r2(S.calc.total_ht):0}
function total(){return r2(S.lignes.reduce(function(s,l){return s+l.total},0)+totalCalc())}
function vide(){return !S.lignes.length&&!S.ouvrages.length}

/* ---------- l'affichage ---------- */
function fil(n){return '<div class="ds-fil">'+[1,2,3].map(function(i){return '<span class="'+(i<n?'f':i===n?'c':'')+'"></span>'}).join('')+'</div>'}
function tete(t,s,retour){return '<div class="ds-top">'+(retour?'<button type="button" class="ds-rond" data-ds="retour" aria-label="Retour">'+IC.dos+'</button>':'')+'<h1>'+t+'<small>'+s+'</small></h1><button type="button" class="ds-rond" data-ds="fermer" aria-label="Fermer">'+IC.x+'</button></div>'}
function rendre(){if(!S||!ov)return;var y=ov.querySelector('.ds-liste'),sy=y?y.scrollTop:0,fy=ov.querySelector('.ds-feuille'),fsy=fy?fy.scrollTop:0,h;
 if(S.mode==='prix')h=ecranPrix();
 else if(S.etape===1)h=ecranClient();
 else if(large())h='<div class="ds-2c"><div class="ds-col">'+ecranLignes(true)+'</div><div class="ds-col ds-col2">'+ecranBase(true)+'</div></div>';
 else h=S.etape===2?ecranBase(false):ecranLignes(false);
 ov.innerHTML='<div class="ds-in">'+h+'</div>'+(S.feuille?'<div class="ds-voile" data-ds="ferf"></div><div class="ds-feuille" role="dialog">'+S.feuille+'</div>':'');
 var y2=ov.querySelector('.ds-liste');if(y2&&sy)y2.scrollTop=sy;var f2=ov.querySelector('.ds-feuille');if(f2&&fsy)f2.scrollTop=fsy;
 /* la feuille d’un travail garde le prix à jour même si l’écran se redessine pendant le calcul */
 var zp=f2&&F&&F.o&&f2.querySelector('[data-dsp]');if(zp)zp.innerHTML=zonePrix();garder()}
function bandeauReprise(){var r=S.reprise;if(!r)return '';var n=(r.lignes||[]).length,o=(r.ouvrages||[]).length;
 return '<div class="ds-rep"><b>Un devis commencé'+(r.nom?' pour '+esc(r.nom):'')+'</b><small>'+(dateC(r.le)?'le '+dateC(r.le)+' · ':'')+[n?n+' ligne'+(n>1?'s':''):'',o?o+(o>1?' travaux complets':' travail complet'):''].filter(Boolean).join(', ')+'</small>'+
  '<div class="ds-rep2"><button type="button" class="ds-btn p" data-ds="reprendre">Le reprendre</button><button type="button" class="ds-lien" data-ds="nonrep">Non, un nouveau</button></div></div>'}
function ecranClient(){
 return tete('Nouveau devis','Étape 1 sur 3 · Pour qui ?')+fil(1)+bandeauReprise()+'<div class="ds-q">Pour quel client ?</div>'+
  '<label class="ds-srch">'+IC.loupe+'<input type="search" data-dsi="qc" value="'+esc(S.qc||'')+'" placeholder="Tapez un nom…" autocomplete="off" enterkeyhint="search"></label>'+
  '<div class="ds-liste ds-lc">'+listeClients()+'</div>'}
function listeClients(){var C=clients(),q=sans(S.qc||'').trim(),L=q?C.filter(function(c){return sans(c.n+' '+c.t).indexOf(q)>=0}):C;
 return '<div class="ds-card">'+(L.length?L.slice(0,80).map(function(c){return '<button type="button" class="ds-row" data-ds="client" data-id="'+esc(c.id)+'"><span class="ds-ic">'+IC.pers+'</span><span class="ds-tx"><b>'+esc(c.n)+'</b>'+(c.t?'<small>'+esc(c.t)+'</small>':'')+'</span><span class="ds-rond p">'+IC.ch+'</span></button>'}).join(''):'<p class="ds-note">'+(q?'Personne à ce nom.':'Pas encore de client.')+'</p>')+'</div>'+
  '<button type="button" class="ds-lien" data-ds="nouvclient">＋ Nouveau client</button>'}
function groupes(){var G={},ordre=[];
 var met=function(id,nom,sous,a){if(!G[id]){G[id]={id:id,nom:nom,sous:sous,fam:{},nf:[],n:0};ordre.push(id)}var g=G[id],f=a.f||'Divers';if(!g.fam[f]){g.fam[f]=[];g.nf.push(f)}g.fam[f].push(a);g.n++};
 var hab=(FO.filter(function(x){return x.habituel})[0]||{id:'base'}).id;
 B.articles.forEach(function(a){if(!(a.pc>0))return;if(a.k==='prestation'&&!a.four)met('mo','Poses (main-d’œuvre)','vos prix de pose',a);else{var id=a.four||'base';met('f:'+id,nomFour(id),'',a)}});
 (B.complements||[]).forEach(function(a){if(!(a.pc>0))return;if(a.k==='prestation')met('mo','Poses (main-d’œuvre)','vos prix de pose',a);else met('f:'+a.four,nomFour(a.four),'en plus de votre base',a)});
 vosProduits().forEach(function(a){met('vos','Vos produits','ajoutés par vous',a)});
 /* Cyril 26/11 : « pourquoi je ne trouve pas au début les poses » → les poses d’abord, puis le fournisseur habituel */
 var rang=function(x){return x==='mo'?0:x==='f:'+hab?1:x==='f:castorama'||x==='f:clim'?3:/^f:/.test(x)?2:4};
 ordre.sort(function(a,b){return rang(a)-rang(b)});
 return ordre.map(function(id){var g=G[id];if(id==='f:'+hab)g.hab=1;return g})}
function court(n){return n.replace(' · prix publics','')}
function ecranBase(cote){var G=groupes(),nT=G.reduce(function(s,g){return s+g.n},0);
 var h=(cote?'<div class="ds-top"><h1>Ajouter au devis<small>Travaux complets ou toute la base, rangée par fournisseur</small></h1></div>':tete('Ajouter au devis',esc(S.nom)+' · Étape 2 sur 3',true)+fil(2))+(cote?'':bandeauReprise())+
  '<label class="ds-srch">'+IC.loupe+'<input type="search" data-dsi="q" value="'+esc(S.q)+'" placeholder="Chercher, ou dites « cloison 4 m sur 2,50 »" autocomplete="off" enterkeyhint="search">'+(SR?'<button type="button" class="ds-mic'+(S.ecoute?' on':'')+'" data-ds="mic" aria-label="Dicter">'+IC.mic+'</button>':'')+'</label>'+
  '<div class="ds-chips">'+[['tous','Accueil',0],['trav','Travaux complets',0],['mo','Poses',nPoses()],['prod','Produits',nProd()]].concat(S.g==='prod'||/^f:|^vos$/.test(S.g)?G.filter(function(g){return g.id!=='mo'}).map(function(g){return [g.id,court(g.nom),g.n]}):[]).map(function(c){return '<button type="button" class="ds-chip'+(S.g===c[0]?' on':'')+'" data-ds="grp" data-id="'+esc(c[0])+'">'+esc(c[1])+(c[2]?' · '+c[2]:'')+'</button>'}).join('')+
  '<button type="button" class="ds-chip t" data-ds="tri">'+(S.tri==='prix'?'Rangé par prix ↑':'Rangé par famille')+'</button></div>';
 return h+'<div class="ds-liste ds-lb">'+listeBase()+'</div>'}
function aConfirmer(){return B.articles.filter(function(a){return a.provisoire&&a.pc>0}).sort(function(a,b){return (a.k==='prestation'?0:1)-(b.k==='prestation'?0:1)})}
function haut(){var h='',P=aConfirmer().length;
 if(P)h+='<button type="button" class="ds-alerte" data-ds="prix"><span class="ds-ic">'+IC.prix+'</span><span class="ds-tx"><b>'+P+' prix à confirmer</b><small>Vérifiez-les une fois : vos devis seront justes. Un toucher par prix.</small></span><span class="ds-rond p">'+IC.ch+'</span></button>';
 h+='<div class="ds-sec">TRAVAUX COMPLETS <span>· Cliky compte tout : fournitures, vis, bandes, pose</span></div><div class="ds-tuiles">'+ORDRE.map(function(t){return '<button type="button" class="ds-tuile" data-ds="ouv" data-id="'+t+'"><span>'+ICT[t]+'</span>'+esc(OUV[t].nom.replace(' d’un mur','').replace(' (pose)',''))+'</button>'}).join('')+'</div>';
 var H=habituels();if(H.length)h+='<div class="ds-sec">'+IC.etoile+' VOS HABITUELS</div><div class="ds-card">'+H.map(article).join('')+'</div>';
 var A=anciens();if(A.length)h+='<button type="button" class="ds-btn cl ds-anc" data-ds="anciens">'+IC.hist+' Repartir d’un devis déjà fait</button>';
 return h}
/* Écran de départ (Cyril 26/11 : « au départ, créer soit avec des poses soit avec des produits… simplicité et visuel beau à voir ») :
   trois grandes cartes, une seule idée par carte ; le reste (habituels, anciens devis, prix à confirmer) en dessous. */
function nPoses(){return groupes().filter(function(g){return g.id==='mo'}).reduce(function(s,g){return s+g.n},0)}
function nProd(){return groupes().filter(function(g){return g.id!=='mo'}).reduce(function(s,g){return s+g.n},0)}
function nFour(){return groupes().filter(function(g){return /^f:/.test(g.id)}).length}
/* Variantes du départ à essayer (Cyril 26/11 « propose-moi plusieurs sortes ») : ?dv=B|C|D ou pc-ds-v sur l’appareil ; A par défaut. */
function varDep(){var v='';try{v=(location.search.match(/[?&]dv=([A-D])/)||[])[1]||lsG('pc-ds-v','A')}catch(e){}return /^[A-D]$/.test(v)?v:'A'}
function depart(){var v=varDep();if(v!=='A')return depart2(v);return departA()}
function suiteDep(){var h='',H=habituels();if(H.length)h+='<div class="ds-sec">'+IC.etoile+' VOS HABITUELS</div><div class="ds-card">'+H.map(article).join('')+'</div>';
 var A=anciens();if(A.length)h+='<button type="button" class="ds-btn cl ds-anc" data-ds="anciens">'+IC.hist+' Repartir d’un devis déjà fait</button>';
 var P=aConfirmer().length;if(P)h+='<button type="button" class="ds-alerte" data-ds="prix"><span class="ds-ic">'+IC.prix+'</span><span class="ds-tx"><b>'+P+' prix à confirmer</b><small>Vérifiez-les une fois : vos devis seront justes.</small></span><span class="ds-rond p">'+IC.ch+'</span></button>';
 return h}
function depart2(v){var np=nPoses(),nr=nProd(),nf=nFour(),h='';
 var C=[['trav',IC.tr,'Un travail complet','Cliky compte tout'],['mo',IC.pose,'Une pose',np+' prix de pose'],['prod',IC.prod,'Un produit',nr+' produits'+(nf>1?' · '+nf+' fournisseurs':'')]];
 if(v==='B'){h+='<div class="ds-q">Qu’ajoutez-vous au devis ?</div><div class="ds-rgs">'+C.map(function(c,k){return '<button type="button" class="ds-rg'+(k===0?' sombre':'')+'" data-ds="grp" data-id="'+c[0]+'"><span class="ds-bi">'+c[1]+'</span><span class="ds-bt"><b>'+c[2]+'</b><small>'+esc(c[3])+'</small></span><span class="ds-bgo">'+IC.ch+'</span></button>'}).join('')+
  '<button type="button" class="ds-rg cr" data-ds="main"><span class="ds-bi">'+IC.plus+'</span><span class="ds-bt"><b>Ma propre ligne</b><small>Une pose ou un produit que je crée</small></span></button></div>'}
 else if(v==='C'){h+='<div class="ds-q">Qu’ajoutez-vous ?</div><div class="ds-g4">'+C.concat([['main',IC.plus,'Je crée','une pose ou un produit']]).map(function(c,k){return '<button type="button" class="ds-c4'+(k===0?' sombre':'')+(c[0]==='main'?' cr':'')+'" data-ds="'+(c[0]==='main'?'main':'grp')+'" data-id="'+(c[0]==='main'?'':c[0])+'"><span class="ds-bi">'+c[1]+'</span><b>'+c[2]+'</b><small>'+esc(c[3])+'</small></button>'}).join('')+'</div>'}
 else{h+='<div class="ds-hero"><small>ÉTAPE 2</small><b>Qu’ajoutez-vous<br>au devis ?</b></div><div class="ds-pils">'+C.map(function(c,k){return '<button type="button" class="ds-pl'+(k===0?' plein':'')+'" data-ds="grp" data-id="'+c[0]+'"><span class="ds-pi">'+c[1]+'</span><span class="ds-bt"><b>'+c[2]+'</b><small>'+esc(c[3])+'</small></span>'+IC.ch+'</button>'}).join('')+'</div><div class="ds-cree"><button type="button" class="ds-pil" data-ds="main" data-id="pose">'+IC.plus+' Créer une pose</button><button type="button" class="ds-pil" data-ds="main" data-id="prod">'+IC.plus+' Créer un produit</button></div>'}
 return '<div class="ds-dep v'+v+'">'+h+'</div>'+suiteDep()}
function departA(){var np=nPoses(),nr=nProd(),nf=nFour(),h='<div class="ds-dep">';
 h+='<button type="button" class="ds-big sombre" data-ds="grp" data-id="trav"><span class="ds-bi">'+IC.tr+'</span><span class="ds-bt"><b>Un travail complet</b><small>Cloison, sol, peinture… Cliky compte tout : fournitures, vis et pose.</small></span><span class="ds-bmini">'+['cloison','plafond','sol','peinture','elec'].map(function(t){return '<i>'+ICT[t]+'</i>'}).join('')+'</span><span class="ds-bgo">'+IC.ch+'</span></button>';
 h+='<div class="ds-duo">'+
  '<button type="button" class="ds-big" data-ds="grp" data-id="mo"><span class="ds-bi">'+IC.pose+'</span><b>Une pose</b><small>'+np+' prix de main-d’œuvre</small><span class="ds-bgo">'+IC.ch+'</span></button>'+
  '<button type="button" class="ds-big" data-ds="grp" data-id="prod"><span class="ds-bi">'+IC.prod+'</span><b>Un produit</b><small>'+nr+' produits'+(nf>1?' · '+nf+' fournisseurs':'')+'</small><span class="ds-bgo">'+IC.ch+'</span></button></div>';
 h+='<div class="ds-cree"><button type="button" class="ds-pil" data-ds="main" data-id="pose">'+IC.plus+' Créer une pose</button><button type="button" class="ds-pil" data-ds="main" data-id="prod">'+IC.plus+' Créer un produit</button></div></div>';
 var H=habituels();if(H.length)h+='<div class="ds-sec">'+IC.etoile+' VOS HABITUELS</div><div class="ds-card">'+H.map(article).join('')+'</div>';
 var A=anciens();if(A.length)h+='<button type="button" class="ds-btn cl ds-anc" data-ds="anciens">'+IC.hist+' Repartir d’un devis déjà fait</button>';
 var P=aConfirmer().length;if(P)h+='<button type="button" class="ds-alerte" data-ds="prix"><span class="ds-ic">'+IC.prix+'</span><span class="ds-tx"><b>'+P+' prix à confirmer</b><small>Vérifiez-les une fois : vos devis seront justes.</small></span><span class="ds-rond p">'+IC.ch+'</span></button>';
 return h}
function tuilesTravaux(){return '<div class="ds-sec">UN TRAVAIL COMPLET <span>· Cliky compte tout : fournitures, vis, bandes, pose</span></div><div class="ds-tuiles">'+ORDRE.map(function(t){return '<button type="button" class="ds-tuile" data-ds="ouv" data-id="'+t+'"><span>'+ICT[t]+'</span>'+esc(OUV[t].nom.replace(' d’un mur','').replace(' (pose)',''))+'</button>'}).join('')+'</div>'}
function listeBase(){var G=groupes(),q=sans(S.q).trim(),W=q.split(/\s+/).filter(Boolean),nT=G.reduce(function(s,g){return s+g.n},0),h='';
 if(!W.length&&S.g==='tous')return depart();
 if(!W.length&&S.g==='trav')return tuilesTravaux();
 if(!nT)h+='<p class="ds-note">'+(etatB==='charge'||!etatB?'Chargement de votre base…':/^err/.test(etatB)?'La base n’a pas pu être chargée : '+esc(etatB.slice(4))+'. Vous pouvez quand même écrire votre ligne.':'Votre base est vide pour l’instant.')+'</p>';
 var trouve=0;
 G.filter(function(g){return S.g==='tous'||S.g==='trav'||S.g===g.id||(S.g==='prod'&&g.id!=='mo')}).forEach(function(g){
  var fams=g.nf.map(function(f){var A=g.fam[f];if(W.length)A=A.filter(function(a){var t=sans(lisible(a.d)+' '+a.d+' '+f+' '+(a.cond||''));return W.every(function(w){return t.indexOf(w)>=0})});
   if(S.tri==='prix')A=A.slice().sort(function(x,y){return prixVente(x)-prixVente(y)});return [f,A]}).filter(function(x){return x[1].length});
  if(!fams.length)return;trouve+=fams.length;
  var id=g.id.slice(2),tf=/^f:/.test(g.id)?tarif(id):null,pt=tf?phraseTarif(id):'';
  h+='<div class="ds-four"><b>'+esc(g.nom)+'</b><small>'+(g.sous?esc(g.sous)+' · ':'')+g.n+' '+(g.id==='mo'?'prix':'produits')+(pt?' · '+esc(pt):'')+'</small>'+(g.hab?'<span class="ds-hab">fournisseur habituel</span>':'')+
   (tf&&tf.passe?'<span class="ds-tag r">tarif valable jusqu’au '+esc(tf.fin)+' : à mettre à jour</span>':'')+(g.id==='f:castorama'||g.id==='f:clim'?'<span class="ds-tag">prix à confirmer</span>':'')+'</div><div class="ds-card">';
  fams.forEach(function(x){var f=x[0],A=x[1],cle2=g.id+'|'+f,ouv=W.length||S.ouv[cle2],lim=W.length?8:6;
   h+='<button type="button" class="ds-fh'+(ouv?' op':'')+'" data-ds="fam" data-id="'+esc(cle2)+'" aria-expanded="'+(ouv?'true':'false')+'"><span class="ds-ic">'+iconeFam(f,A[0].k)+'</span><span class="ds-tx"><b>'+esc(f)+'</b></span><span class="ds-n">'+A.length+'</span><span class="ds-rond p">'+(ouv?IC.bas:IC.ch)+'</span></button>';
   if(!ouv)return;var tout=S.tout[cle2]||A.length<=lim+1,V=tout?A:A.slice(0,lim);
   h+='<div class="ds-sub">'+V.map(article).join('')+(tout?'':'<button type="button" class="ds-voir" data-ds="tout" data-id="'+esc(cle2)+'">Voir les '+(A.length-lim)+' autres ▾</button>')+'</div>'});
  h+='</div>'});
 if(nT&&W.length&&!trouve)h+='<p class="ds-note">Rien trouvé pour « '+esc(S.q)+' ». Essayez un autre mot, ou écrivez votre ligne.</p>';
 h+='<button type="button" class="ds-lien" data-ds="main" data-id="'+(S.g==='mo'?'pose':S.g==='prod'?'prod':'')+'">'+(S.g==='mo'?'Je ne trouve pas : créer une pose':S.g==='prod'?'Je ne trouve pas : créer un produit':'Je ne trouve pas : écrire ma ligne')+'</button>'+(marge()?'<p class="ds-note">Prix de vente HT. Matériaux : prix d’achat chez le fournisseur + votre marge de '+qf(marge())+' %. Main-d’œuvre : votre prix.</p>':'');
 return h}
function article(a){var u=unite(a),dt=detail(a),mc=moinsCher(a);
 var src=a.k==='prestation'?(a.vos?'votre prix':a.complement?'prix moyen France, à confirmer':'votre prix de pose'):a.vos?'votre prix':'achat '+eur(a.pc)+(marge()?' + '+qf(marge())+' %':'');
 return '<div class="ds-row ds-art"><span class="ds-tx"><b>'+esc(lisible(a.d))+'</b><small>'+(dt?esc(dt)+' · ':'')+esc(src)+(a.provisoire&&!a.complement?' <em class="ds-tag">à confirmer</em>':'')+(mc?' <em class="ds-tag v">moins cher chez '+esc(court(nomDe(mc)))+'</em>':'')+'</small></span><span class="ds-pr">'+eur(prixVente(a))+'<small>'+esc(parU(u))+'</small>'+(prixMesure(a)?'<small class="m">'+esc(prixMesure(a))+'</small>':'')+'</span><button type="button" class="ds-plus" data-ds="art" data-id="'+esc(a.c)+'" aria-label="Ajouter '+esc(lisible(a.d))+'">＋</button></div>'}
function blocOuvrages(){if(!S.ouvrages.length)return '';var c=S.calc,ch=S.calcEtat==='charge',er=/^err/.test(S.calcEtat||''),L=lignesCalc();
 var h='<div class="ds-sec">TRAVAUX COMPLETS <span>· calculés par Cliky</span></div><div class="ds-card">'+S.ouvrages.map(function(o,i){return '<button type="button" class="ds-row" data-ds="ouvl" data-id="'+i+'"><span class="ds-ic">'+ICT[o.travail]+'</span><span class="ds-tx"><b>'+esc(titreOuv(o))+'</b><small>'+esc(resumeOuv(o))+'</small></span><span class="ds-rond p">'+IC.ch+'</span></button>'}).join('');
 h+='<button type="button" class="ds-row ds-tc" data-ds="det"><span class="ds-tx"><b>Fournitures et pose</b><small>'+(ch?'Cliky calcule…':er?'Calcul impossible : '+esc(S.calcEtat.slice(4)):L.length+' lignes, tout compté une seule fois · '+(S.det?'masquer le détail':'voir le détail'))+'</small></span><span class="ds-pr">'+(ch?'…':c&&!er?eur(c.total_ht):'')+'</span><span class="ds-rond p">'+(S.det?IC.bas:IC.ch)+'</span></button>';
 if(S.det&&c&&!ch)h+='<div class="ds-det">'+c.groupes.map(function(g){return '<div class="ds-dg"><b>'+esc(g.groupe)+'</b><span>'+eur(g.total)+'</span></div>'+g.lignes.map(function(l){return '<div class="ds-dl"><span>'+esc(libC(l.libelle))+'<small>'+qf(l.quantite)+' '+esc(pluriel(l.unite||'',l.quantite))+' × '+eur(l.pu)+(l.provisoire?' <em class="ds-tag">à confirmer</em>':'')+'</small></span><b>'+eur(l.total)+'</b></div>'}).join('')}).join('')+'</div>';
 h+='</div>';
 if(c&&!ch)h+=blocSansPrix(c);
 return h}
/* Ce qui n’a pas encore de prix (Cyril : « vérifie qu’il ne manque rien ») : chaque article a son « ＋ Mon prix »,
   qui ouvre une ligne déjà remplie (nom, quantité, unité) ; il ne reste qu’à taper le prix. Rien ne disparaît en silence. */
function sansPrixRestants(){var A=S.calc&&S.calc.a_chiffrer||[];return A.filter(function(x){return !dejaPrix(x)}).length}
function dejaPrix(x){return S.lignes.some(function(l){return l.libelle===x.libelle})}
function blocSansPrix(c){var A=c.a_chiffrer||[],V=(c.a_verifier||[]).filter(function(v){return !/^(À chiffrer|Prix fournisseur à demander) : /.test(v)});
 if(!A.length&&!V.length)return '';var tout=S.verT,n=sansPrixRestants(),h='';
 if(A.length){h+='<div class="ds-ver ds-sp"><b>Sans prix pour l’instant ('+n+(n<A.length?' sur '+A.length:'')+')</b><small>Pas sur le devis tant que vous n’avez pas mis votre prix.</small>';
  h+=A.map(function(x,k){if(!tout&&k>=6)return '';var ok=dejaPrix(x);return '<div class="ds-spl'+(ok?' ok':'')+'"><span>'+esc(x.libelle)+'<small>'+(x.fournisseur?'au devis du fournisseur':qf(x.quantite)+' '+esc(pluriel(x.unite||'u',x.quantite)))+'</small></span>'+(ok?'<em>Prix mis</em>':'<button type="button" class="ds-mp" data-ds="ach" data-id="'+k+'">＋ Mon prix</button>')+'</div>'}).join('');
  if(A.length>6)h+='<button type="button" class="ds-voir c" data-ds="vert">'+(tout?'Masquer':'Voir les '+A.length)+'</button>';
  h+='</div>'}
 if(V.length)h+='<div class="ds-ver"><b>À vérifier ('+V.length+')</b>'+V.slice(0,tout?99:6).map(function(v){return '<span>'+esc(v)+'</span>'}).join('')+(V.length>6&&!A.length?'<button type="button" class="ds-voir c" data-ds="vert">'+(tout?'Masquer':'Voir les '+V.length)+'</button>':'')+'</div>';
 return h}
function ecranLignes(cote){var t=total(),n=S.lignes.length+S.ouvrages.length,vc=S.vue==='client'&&n;
 var h=tete((S.maj?'Devis n° '+esc(S.maj.numero||'')+' · ':'Devis de ')+esc(S.nom||'…'),cote?'Étape '+(n?3:2)+' sur 3 · '+(n?'Vérifiez et '+(S.maj?'mettez à jour':'créez'):'Ajoutez à droite'):'Étape 3 sur 3 · Vérifiez et '+(S.maj?'mettez à jour':'créez'),!cote)+fil(cote?(n?3:2):3)+(cote&&!S.maj?bandeauReprise():'')+'<div class="ds-liste ds-lg">';
 if(S.ok)h+='<div class="ds-ok">✓ '+esc(S.ok)+'</div>';
 if(n)h+='<div class="ds-vues" role="tablist"><button type="button" role="tab" aria-selected="'+!vc+'" data-ds="vue" data-id="moi">'+IC.cad+' Pour moi</button><button type="button" role="tab" aria-selected="'+!!vc+'" data-ds="vue" data-id="client">'+IC.doc+' Pour le client</button></div>';
 if(vc){h+=vueClient();h+='</div>'+basLignes(t,n);return h}
 if(n)h+='<p class="ds-note c ds-moi">Tout le détail, pour vous seul : il ne quitte jamais votre Espace.</p>';
 h+=blocOuvrages();
 if(S.lignes.length||!S.ouvrages.length)h+='<div class="ds-sec">'+(S.ouvrages.length?'LES AUTRES LIGNES':'LES LIGNES DU DEVIS')+'</div>';
 h+=S.lignes.length?'<div class="ds-card">'+S.lignes.map(function(l,i){return '<button type="button" class="ds-row" data-ds="ligne" data-id="'+i+'"><span class="ds-ic">'+(l.ic||'')+'</span><span class="ds-tx"><b>'+esc(l.libelle)+'</b><small>'+qf(l.quantite)+' '+esc(pluriel(l.unite,l.quantite))+' × '+eur(l.pu)+(l.m2u&&l.mu&&l.mu!=='pièce'?' · '+qf(r2(l.quantite*l.m2u))+' '+esc(l.mu):'')+(l.prov?' <em class="ds-tag">à confirmer</em>':'')+'</small></span><span class="ds-pr">'+eur(l.total)+'</span></button>'}).join('')+'</div>':!S.ouvrages.length?'<p class="ds-note">Pas encore de ligne.'+(cote?' Touchez un travail complet ou ＋ sur un produit, à droite.':'')+'</p>':'';
 if(!cote)h+='<button type="button" class="ds-btn cl" data-ds="ajout">＋ Ajouter</button>';
 if(n)h+='<p class="ds-note">Touchez une ligne ou un travail pour le changer ou l’enlever.</p>';
 h+='<label class="ds-titre">Le titre du devis <span>(facultatif)</span><input data-dsi="titre" value="'+esc(S.titre)+'" placeholder="Ex. : cloison du bureau" autocomplete="off"></label>';
 h+='</div>'+basLignes(t,n);return h}
function basLignes(t,n){var att=S.calcEtat==='charge',h='';
 if(S.maj){h+='<div class="ds-bas"><div class="ds-tot"><span>Total HT</span><b>'+(att?'…':eur(t))+'</b></div><button type="button" class="ds-btn'+(S.arme?' arme':'')+'" data-ds="creer"'+(n&&!att?'':' disabled')+'>'+(S.arme?'Oui, mettre à jour':'Mettre à jour le devis n° '+esc(S.maj.numero||''))+'</button>'+(S.arme?'<p class="ds-note c">Le devis du client prend ces lignes et ce total. Il n’est pas renvoyé tout seul.</p><button type="button" class="ds-lien" data-ds="desarme">Pas encore</button>':'<p class="ds-note c">Changez ce que vous voulez : prix et phrases du client suivent tout seuls.</p>')+'</div>';return h}
 h+='<div class="ds-bas"><div class="ds-tot"><span>Total HT</span><b>'+(att?'…':eur(t))+'</b></div><button type="button" class="ds-btn'+(S.arme?' arme':'')+'" data-ds="creer"'+(n&&!att?'':' disabled')+'>'+(S.arme?'Oui, créer le devis':'Créer le devis')+'</button>'+(S.arme?(sansPrixRestants()?'<p class="ds-note c ds-avert">'+sansPrixRestants()+' article'+(sansPrixRestants()>1?'s':'')+' sans prix ne ser'+(sansPrixRestants()>1?'ont':'a')+' pas sur ce devis.</p>':'')+'<button type="button" class="ds-lien" data-ds="desarme">Pas encore</button>':'<p class="ds-note c">Il ne part pas chez le client tant que vous ne l’envoyez pas.</p>')+'</div>';
 return h}

/* ---------- l'écran « Mes prix à confirmer » : un prix à la fois ---------- */
function ecranPrix(){var P=S.P,L=P.liste,n=L.length,a=null;while(P.i<n&&!(a=trouveArt(L[P.i])))P.i++;
 var h=tete('Mes prix à confirmer',n?'Prix '+Math.min(P.i+1,n)+' sur '+n:'Tout est vérifié',!S.solo)+'<div class="ds-pb"><span style="width:'+(n?Math.round(100*P.i/n):100)+'%"></span></div><div class="ds-liste">';
 if(!a){h+='<div class="ds-fin">'+IC.ok+'<b>'+(P.fait?P.fait+' prix vérifié'+(P.fait>1?'s':'')+'. Merci !':'Aucun prix à confirmer.')+'</b><small>Cliky s’en sert dès maintenant, pour vos devis et vos pré-devis.</small></div><button type="button" class="ds-btn" data-ds="finprix">'+(S.solo?'Fermer':'Retour au devis')+'</button></div>';return h}
 var mo=a.k==='prestation',u=unite(a);
 h+='<div class="ds-pc"><span class="ds-ic g">'+iconeFam(a.f,a.k)+'</span><b>'+esc(lisible(a.d))+'</b><small>'+esc(mo?'Votre main-d’œuvre':nomDe(a)+(phraseTarif(a.four||'base')?' · '+phraseTarif(a.four||'base'):''))+(detail(a)?' · '+esc(detail(a)):'')+'</small>'+
  '<div class="ds-pv">'+(P.ed?'<input data-dsp2="pc" inputmode="decimal" value="'+qf(a.pc)+'" aria-label="Le bon prix">':eur(a.pc))+'<small>'+(mo?'HT ':'HT d’achat, ')+esc(parU(u))+(mesure(a)?' · soit '+esc(prixMesure(a,a.pc)):'')+'</small></div>'+
  '<p class="ds-pq">'+(mo?'C’est un prix moyen de pose en France, mis en attendant le vôtre. Est-ce votre prix ?':'Ce prix n’a pas encore été vérifié chez votre fournisseur. Est-ce le bon prix d’achat ?')+'</p>'+
  (!mo&&marge()?'<p class="ds-note c">Vendu '+eur(prixVente(a))+' avec votre marge de '+qf(marge())+' %.</p>':'')+'</div>';
 if(P.ed)h+='<button type="button" class="ds-btn" data-ds="pxsave">Enregistrer ce prix</button><button type="button" class="ds-lien" data-ds="pxannul">Annuler</button>';
 else h+='<button type="button" class="ds-btn ok" data-ds="pxok">'+IC.ok+' Oui, c’est le bon prix</button><button type="button" class="ds-btn cl" data-ds="pxed">Non, je corrige</button><button type="button" class="ds-lien" data-ds="pxpasse">Je ne sais pas, plus tard</button>';
 return h+'</div>'}
function envoiPrix(corps,msg){var P=S.P;P.attente=1;
 PCV.api('/espace/base',{method:'POST',body:corps}).then(function(x){if(!S)return;if(x&&x.articles)prendreBase(x);P.attente=0;P.ed=0;P.fait++;P.i++;S.ok=msg;rendre();if(S.ouvrages.length)recalculer()},
  function(e){if(!S)return;P.attente=0;toast('Pas enregistré',e.message)})}

/* ---------- la fenêtre « Combien ? » (un produit ou ma ligne) ---------- */
var F=null;
function feuilleArt(a,i){var l=i!=null?S.lignes[i]:null;if(l&&l.c&&!a)a=trouveArt(l.c)||null;
 F={a:a,i:i,q:l?l.quantite:1,pu:l?l.pu:a?prixVente(a):0,lib:l?l.libelle:a?lisible(a.d):'',u:l?l.unite:a?unite(a):'u',edp:0,pu0:0,m2:a?m2par(a):(l&&l.m2u)||0,mu:a&&mesure(a)?mesure(a).u:(l&&l.mu)||'m²',prov:l?l.prov:a&&a.provisoire,ic:l?l.ic:a?iconeFam(a.f,a.k):'',main:!a&&!(l&&l.base),pm:l&&l.pm};
 dessinerF()}
function dessinerF(){if(!F.pu0)F.pu0=F.pu;var a=F.a,man=F.main,tot=r2(F.q*F.pu);
 var h='<div class="ds-grab"></div>';
 if(man)h+='<div class="ds-fq">'+(F.i!=null?'La ligne':F.kind==='pose'?'Créer une pose':F.kind==='prod'?'Créer un produit':'Écrire ma ligne')+'</div><label class="ds-champ">Ce que vous faites ou fournissez<textarea data-dsf="lib" rows="2" placeholder="Ex. : Dépose de l’ancien placard">'+esc(F.lib)+'</textarea></label>';
 else h+='<div class="ds-row ds-fhd"><span class="ds-ic">'+(F.ic||'')+'</span><span class="ds-tx"><b>'+esc(F.lib)+'</b><small>'+esc(a?nomDe(a):'')+(F.prov?' <em class="ds-tag">prix à confirmer</em>':'')+'</small></span></div>';
 h+='<div class="ds-fq">Combien ?</div><div class="ds-st"><button type="button" class="ds-mb" data-ds="moins" aria-label="Un de moins">−</button><label class="ds-qv"><input data-dsf="q" inputmode="decimal" value="'+qf(F.q)+'" aria-label="Quantité"><small>'+(man?'':esc(pluriel(F.u,F.q)))+(F.m2?' · soit '+qf(r2(F.q*F.m2))+' '+F.mu:'')+'</small></label><button type="button" class="ds-mb" data-ds="plus" aria-label="Un de plus">＋</button></div>';
 if(man)h+='<div class="ds-2"><label class="ds-champ">Unité<input data-dsf="u" value="'+esc(F.u)+'" placeholder="m², u, h…"></label><label class="ds-champ">Prix de vente HT<input data-dsf="pu" inputmode="decimal" value="'+(F.pu?qf(F.pu):'')+'" placeholder="0,00"></label></div>';
 else{h+='<div class="ds-ln"><span>Prix de vente HT</span>'+(F.edp?'<input class="ds-pin" data-dsf="pu" inputmode="decimal" value="'+qf(F.pu)+'">':'<b>'+eur(F.pu)+' <button type="button" class="ds-mod" data-ds="edp">Changer</button></b>')+'</div>'+
  (F.m2&&F.mu!=='pièce'?'<div class="ds-ln s"><span>Soit <b data-dsm>'+eurF(F.pu/F.m2)+'</b> HT '+esc(parU(F.mu))+'</span><label class="ds-enm">ou en '+esc(F.mu)+' <input data-dsf="m2q" inputmode="decimal" placeholder="'+esc(F.mu)+'"></label></div>':F.m2?'<div class="ds-ln s"><span>Soit <b data-dsm>'+eurF(F.pu/F.m2)+'</b> HT la pièce</span></div>':'');
  /* d'où vient le prix */
  if(a&&!a.vos)h+='<div class="ds-ln s"><span>'+(a.k==='prestation'?'Votre prix de pose'+(a.provisoire?' (prix moyen France, à confirmer)':''):'Achat '+eur(a.pc)+' chez '+esc(court(nomDe(a)))+(phraseTarif(a.four||'base')?', '+esc(phraseTarif(a.four||'base')):'')+(marge()?' + votre marge '+qf(marge())+' %':' (pas de marge réglée)'))+'</span></div>';
  /* le même produit ailleurs */
  var E=a?ailleurs(a).slice(0,3):[];
  if(E.length)h+='<div class="ds-cmp"><b>Le même ailleurs</b>'+E.map(function(b){var d=prixVente(b)-F.pu,pc=F.pu?Math.round(100*d/F.pu):0;return '<button type="button" class="ds-row" data-ds="swap" data-id="'+esc(b.c)+'"><span class="ds-tx"><b>'+esc(court(nomDe(b)))+'</b><small>'+esc(lisible(b.d))+'</small></span><span class="ds-pr">'+eur(prixVente(b))+'<small class="'+(d<0?'v':'r')+'">'+(d<0?'':'+')+pc+' %</small></span></button>'}).join('')+'<small>Touchez pour prendre celui-là.</small></div>'}
 h+='<div class="ds-ln big"><span>Total de la ligne</span><b data-dst>'+eur(tot)+'</b></div>';
 h+='<button type="button" class="ds-btn" data-ds="okf">'+(F.i!=null?'Enregistrer':'Ajouter au devis')+'</button>';
 if(F.i!=null)h+='<button type="button" class="ds-lien rouge" data-ds="enlever">'+(F.arme?'Oui, enlever cette ligne':'Enlever cette ligne')+'</button>';
 else h+='<button type="button" class="ds-lien" data-ds="ferf">Annuler</button>';
 S.feuille=h;rendre();
 if(man&&!F.lib)setTimeout(function(){var t=ov.querySelector('[data-dsf="lib"]');if(t)t.focus()},250)}
function majTot(){var t=ov.querySelector('[data-dst]');if(t)t.textContent=eur(F.q*F.pu);var s=ov.querySelector('.ds-qv small');if(s&&!F.main)s.textContent=pluriel(F.u,F.q)+(F.m2?' · soit '+qf(r2(F.q*F.m2))+' '+F.mu:'')}
function okF(){var lib=String(F.lib||'').trim();
 if(!lib){toast('Il manque la description','Une ligne suffit.');return}
 if(!(F.q>0)||!(F.pu>0)){toast('Il manque la quantité ou le prix','Hors taxes, en euros.');return}
 var pm=F.pm||r2(F.pu)!==r2(F.pu0);
 var l={libelle:lib,quantite:r2(F.q),unite:String(F.u||'u').trim()||'u',pu:r2(F.pu),total:r2(F.q*F.pu),ic:F.ic,prov:!!F.prov&&!pm,m2u:F.m2,mu:F.mu,base:!F.main,c:F.a?F.a.c:'',pm:F.a?pm:true};
 var av=F.i!=null?S.lignes[F.i]:null;if(F.gr||av&&av.gr)l.gr=F.gr||av.gr;if(av&&av.rg)l.rg=av.rg;if(av&&av.uid)l.uid=av.uid;
 if(F.i!=null){S.lignes[F.i]=l;S.ok='Ligne modifiée'}
 else{S.lignes.push(l);S.ok='Ajouté : '+lib+(l.quantite>1?' ('+qf(l.quantite)+' '+pluriel(l.unite,l.quantite)+')':'');if(F.a)compter(F.a.c);
  if(F.main&&window.PCPROD&&PCPROD.ajouter&&!vosProduits().some(function(p){return sans(p.d)===sans(lib)}))try{PCPROD.ajouter({d:lib,u:l.unite,p:l.pu,t:'Ajouté par vous',k:'prestation'})}catch(e){}}
 fini()}
function fini(){S.arme=0;S.feuille=null;F=null;if(!large())S.etape=3;rendre();
 clearTimeout(fini.t);fini.t=setTimeout(function(){if(S&&S.ok){S.ok='';rendre()}},3500)}

/* ---------- la fenêtre d'un travail complet ---------- */
function feuilleOuv(t,i,pre){var o=i!=null?S.ouvrages[i]:null;F={o:1,t:o?o.travail:t,i:i,d:o?JSON.parse(JSON.stringify(o.d)):dOuv(t,pre),arme:0};dessinerO();prixO()}
function dessinerO(){var o=OUV[F.t],d=F.d;
 var h='<div class="ds-grab"></div><div class="ds-row ds-fhd"><span class="ds-ic">'+ICT[F.t]+'</span><span class="ds-tx"><b>'+esc(o.nom)+'</b><small>Cliky compte les fournitures et la pose, avec vos prix</small></span></div>';
 var oq=function(q){if(q[4]&&!q[4](d))return;h+='<div class="ds-oq"><span>'+esc(q[1])+'</span><div class="ds-seg">'+q[2].map(function(c,k){return '<button type="button" class="'+(d[q[0]]===c[1]?'on':'')+'" data-ds="oq" data-k="'+q[0]+'" data-id="'+k+'">'+esc(c[0])+'</button>'}).join('')+'</div></div>'};
 o.q.forEach(function(q){if(q[5]==='avant')oq(q)});
 if(o.mes.length)h+='<div class="ds-mes">'+o.mes.map(function(m){m=mesDe(F.t,d,m);return '<label class="ds-champ">'+esc(m[1])+'<span class="ds-u"><input data-dso="'+m[0]+'" inputmode="decimal" value="'+(nb(d[m[0]])?qf(d[m[0]]):'')+'" placeholder="0"><i>'+esc(m[2])+'</i></span></label>'}).join('')+'</div>';
 if(o.compte)h+='<div class="ds-card ds-cpt">'+o.compte.map(function(x){var n=d.c[x[0]]||0;return '<div class="ds-row"><span class="ds-tx"><b>'+esc(x[1])+'</b></span><button type="button" class="ds-mb p" data-ds="cpt" data-k="'+esc(x[0])+'" data-id="-1" aria-label="Un de moins"'+(n?'':' disabled')+'>−</button><b class="ds-cn">'+n+'</b><button type="button" class="ds-mb p" data-ds="cpt" data-k="'+esc(x[0])+'" data-id="1" aria-label="Un de plus">＋</button></div>'}).join('')+'</div>';
 o.q.forEach(function(q){if(q[5]!=='avant')oq(q)});
 h+='<div data-dsp>'+zonePrix()+'</div>';
 h+='<button type="button" class="ds-btn" data-ds="okfo">'+(F.i!=null?'Enregistrer':'Ajouter au devis')+'</button>';
 h+=F.i!=null?'<button type="button" class="ds-lien rouge" data-ds="enlevo">'+(F.arme?'Oui, enlever ce travail':'Enlever ce travail')+'</button>':'<button type="button" class="ds-lien" data-ds="ferf">Annuler</button>';
 S.feuille=h;rendre();
 if(o.mes.length&&!nb(d[o.mes[0][0]]))setTimeout(function(){var x=ov&&ov.querySelector('[data-dso]');if(x)x.focus()},250)}
function zonePrix(){if(!F||!F.o)return '';
 if(!pret({travail:F.t,d:F.d}))return '<p class="ds-note c">'+(OUV[F.t].eq?'Touchez ＋ sur ce qu’il faut poser':'Tapez les mesures')+' : le prix s’affiche ici.</p>';
 if(F.pe==='charge')return '<div class="ds-ln big"><span>Cliky calcule…</span><b>…</b></div>';
 if(/^err/.test(F.pe||''))return '<p class="ds-note c">'+esc(F.pe.slice(4))+'</p>';
 var x=F.px;if(!x)return '';
 var h='<div class="ds-ln big"><span>'+(S.ouvrages.length-(F.i!=null?1:0)>0?'Ce travail ajoute':'Ce travail')+'</span><b>'+eur(x.marg)+' HT</b></div>';
 var L=[];x.seul.groupes.forEach(function(g){g.lignes.forEach(function(l){L.push(l)})});
 h+='<button type="button" class="ds-voir c" data-ds="vdet">'+(F.vd?'Masquer':'Voir')+' ce que Cliky compte ('+L.length+' lignes) '+(F.vd?'▴':'▾')+'</button>';
 if(F.vd)h+='<div class="ds-det f">'+L.map(function(l){return '<div class="ds-dl"><span>'+esc(libC(l.libelle))+'<small>'+qf(l.quantite)+' '+esc(pluriel(l.unite||'',l.quantite))+(l.provisoire?' <em class="ds-tag">à confirmer</em>':'')+'</small></span><b>'+eur(l.total)+'</b></div>'}).join('')+'</div>';
 if(x.seul.a_verifier&&x.seul.a_verifier.length)h+='<div class="ds-ver f"><b>À vérifier</b>'+x.seul.a_verifier.slice(0,3).map(function(v){return '<span>'+esc(v)+'</span>'}).join('')+'</div>';
 return h}
function majPrix(){var z=ov&&ov.querySelector('[data-dsp]');if(z)z.innerHTML=zonePrix()}
/* « Ce travail ajoute » = le devis avec ce travail − le devis sans lui (les vis et la protection déjà comptées ne sont pas recomptées) */
function prixO(){clearTimeout(prixO.t);if(!F||!F.o)return;if(!pret({travail:F.t,d:F.d})){F.px=null;majPrix();return}F.pe='charge';majPrix();
 prixO.t=setTimeout(function(){if(!F||!F.o)return;var moi={travail:F.t,d:JSON.parse(JSON.stringify(F.d))},autres=S.ouvrages.filter(function(_,k){return k!==F.i}),cle3=JSON.stringify(moi);
  Promise.all([chiffrer(autres.concat([moi])),chiffrer(autres),chiffrer([moi])]).then(function(r){if(!F||!F.o||JSON.stringify({travail:F.t,d:F.d})!==cle3)return;F.pe='';F.px={marg:r2(r[0].total_ht-r[1].total_ht),seul:r[2]};majPrix()},
   function(e){if(!F||!F.o)return;F.pe='err:'+e.message;majPrix()})},350)}
function okFO(){if(!pret({travail:F.t,d:F.d})){if(OUV[F.t].eq)toast('Rien à poser','Touchez ＋ sur au moins un élément.');else toast('Il manque une mesure',OUV[F.t].mes.map(function(m){return mesDe(F.t,F.d,m)[1]}).join(', ')+'.');return}
 var o={travail:F.t,d:F.d};if(F.i!=null){S.ouvrages[F.i]=o;S.ok='Travail modifié : '+titreOuv(o)}else{S.ouvrages.push(o);S.ok='Ajouté : '+titreOuv(o)}
 recalculer();fini()}

/* ---------- la dictée : « cloison 4 mètres sur 2,50 » → la cloison déjà remplie ; sinon, la recherche ---------- */
function comprendre(txt){var s=sans(txt).replace(/virgule/g,',').replace(/(\d+)\s*(?:m|metres?)\s+(\d{1,2})\b/g,'$1,$2').replace(/(\d+)\s*(?:m|metres?)(\d{2})\b/g,'$1,$2');
 var t=/pein[td]|toile de verre|tapiss|enduit de lissage/.test(s)?'peinture':/cloison/.test(s)?'cloison':/\bclim|radiateur|seche.serviette/.test(s)?'clim':/prise|interrupteur|va.et.vient|tableau electrique|applique/.test(s)?'elec':/\bwc\b|toilette|douche|baignoire|lavabo|vasque|lave.mains|chauffe.eau|evier/.test(s)?'plomb':/carrelage|parquet|stratifie|vinyle|\bsol\b|plancher|lambourde/.test(s)&&!/plafond/.test(s)?'sol':/doubl|isol\w*\s+(?:d.un\s+|du\s+|le\s+|les\s+)?mur/.test(s)?'doublage':/rampant|sous (?:la )?toiture/.test(s)?'rampants':/comble/.test(s)?'combles':/plafond/.test(s)?'plafond':/fenetre/.test(s)?'fenetres':/porte/.test(s)?'portes':'';
 if(!t)return null;var N=(s.match(/\d+(?:[.,]\d+)?/g)||[]).map(nb),p={};
 if(t==='cloison'||t==='doublage'){if(N[0])p.L=N[0];if(N[1])p.H=N[1];if(t==='cloison'){if(/porte/.test(s))p.portes=/deux portes|2 portes/.test(s)?2:1;if(/salle d.eau|salle de bain|douche/.test(s))p.hydro=true;if(/renforc|phoniq|bruit/.test(s))p.phonique='Renforcée'}
  if(t==='doublage'&&/interieur/.test(s))p.ext='Non'}
 else if(t==='plafond'){if(N[0])p.L=N[0];if(N[1])p.l=N[1];if(N[2])p.H=N[2]}
 else if(t==='combles'||t==='rampants'){if(N[0])p.surface=N[1]&&/ sur | par | x /.test(s)?r2(N[0]*N[1]):N[0]}
 else if(OUV[t].eq){p.c=compterEq(s,t);if(/changer|remplacer/.test(s))p.etat='À changer'}
 else if(t==='peinture'){p.support=/plafond/.test(s)?'Plafond':/porte/.test(s)?'Portes':/plinthe/.test(s)?'Plinthes':/radiateur/.test(s)?'Radiateurs':/fenetre/.test(s)?'Fenêtres':'Murs';if(N[0])p.n=N[1]&&/ sur | par | x /.test(s)?r2(N[0]*N[1]):N[0];
  if(/papier peint/.test(s)&&/(enlever|deposer|depose|retirer|arracher)/.test(s))p.depose='Oui';if(/papier peint/.test(s)&&!/(enlever|deposer|depose|retirer|arracher)/.test(s)||/tapiss/.test(s))p.revetement='Papier peint';if(/toile de verre/.test(s))p.revetement='Toile de verre + peinture';
  if(/abime|mauvais etat/.test(s))p.etat='Abîmé';else if(/neuf|placo/.test(s))p.etat='Neuf (placo)';if(/enduit|lissage|ratiss/.test(s))p.enduit='Oui';
  var f=/laque/.test(s)?'Laque':/satin/.test(s)?'Satin':/velours/.test(s)?'Velours':/\bmat\b/.test(s)?'Mat':'';if(f)p.finition=f;if(/pistolet|airless/.test(s))p.application='Pistolet'}
 else if(t==='sol'){if(/plancher|lambourde|osb/.test(s)){p.plancher='Oui';if(!/carrelage|parquet|stratifie|vinyle/.test(s))p.neuf='Aucun'}
  if(N[0])p.surface=N[1]&&/ sur | par | x /.test(s)?r2(N[0]*N[1]):N[0];if(p.neuf!=='Aucun')p.neuf=/parquet/.test(s)?'Parquet':/stratifie/.test(s)?'Stratifié':/vinyle/.test(s)?'Sol souple (vinyle)':'Carrelage'}
 else if(t==='portes'){var w=N.filter(function(x){return x>=55&&x<=100})[0];if(w)p.largeur=[63,73,83,93].reduce(function(a,b){return Math.abs(b-w)<Math.abs(a-w)?b:a})+' cm'}
 else if(t==='fenetres'){var c=function(x){return x<10?r2(x*100):x};if(N[0])p.Lc=c(N[0]);if(N[1])p.Hc=c(N[1]);if(/alu/.test(s))p.mat='Alu';if(/bois/.test(s))p.mat='Bois'}
 return {t:t,p:p}}
/* « 3 prises et 2 interrupteurs » → {Prise:3, Interrupteur:2} ; « une prise double » ne compte pas comme une prise simple */
var MOTS={un:1,une:1,deux:2,trois:3,quatre:4,cinq:5,six:6,sept:7,huit:8,neuf:9,dix:10};
function compterEq(s,t){var c={},L=OUV[t].compte.map(function(x){return [x[0],sans(x[1]).replace(/[()]/g,'').replace(/-/g,' ')]}).sort(function(a,b){return b[1].length-a[1].length});
 var r=s.replace(/-/g,' ');
 L.forEach(function(x){var w=x[1].split(' '),re=new RegExp('(?:(\\d+|'+Object.keys(MOTS).join('|')+')\\s+)?'+w[0]+'s?'+(w.length>1?'\\s+'+w.slice(1).join('\\s+')+'s?':'')+'\\b','g'),m;
  while((m=re.exec(r))){c[x[0]]=(c[x[0]]||0)+(m[1]?(+m[1]||MOTS[m[1]]):1)}
  r=r.replace(re,' ')});
 return c}
function dicter(){if(!SR||S.ecoute)return;try{var r=new SR();r.lang='fr-FR';r.interimResults=false;r.maxAlternatives=1;S.ecoute=1;rendre();
  r.onresult=function(ev){var txt=(ev.results[0][0].transcript||'').trim();if(!S)return;S.ecoute=0;entendu(txt)};
  r.onerror=function(ev){if(!S)return;S.ecoute=0;rendre();if(ev&&ev.error&&ev.error!=='no-speech'&&ev.error!=='aborted')toast('Micro indisponible','Autorisez le micro, ou tapez votre recherche. ('+ev.error+')')};
  r.onend=function(){if(S&&S.ecoute){S.ecoute=0;rendre()}};r.start()}catch(e){S.ecoute=0;rendre()}}
function entendu(txt){var c=comprendre(txt);
 if(c){S.q='';feuilleOuv(c.t,null,c.p);S.ok='';toast('J’ai compris : '+OUV[c.t].nom.toLowerCase(),'« '+txt+' » · vérifiez et ajoutez.')}
 else{S.q=txt;rendre()}}

/* ---------- les gestes ---------- */
function clic(e){var b=e.target.closest('[data-ds]');if(!b||!S)return;var a=b.getAttribute('data-ds'),id=b.getAttribute('data-id');
 if(a==='fermer'){if(S.maj)toast('Rien de changé','Le devis n° '+(S.maj.numero||'')+' reste comme il était.');else if(!vide()&&S.mode!=='prix')toast('Devis gardé','Vous le retrouverez au prochain « Nouveau devis ».');fermer()}
 else if(a==='retour'){if(S.mode==='prix'){S.mode='devis';rendre();return}S.feuille=null;S.etape=S.etape===3?2:S.etape===2&&!vide()?3:1;rendre()}
 else if(a==='client'){S.contact=id;var c=clients().filter(function(x){return x.id===id})[0];S.nom=c?c.n:nomDos(id);if(S.reprise&&S.reprise.contact!==id)S.reprise=null;S.etape=!vide()&&!large()?3:2;rendre()}
 else if(a==='nouvclient'){var X=window.PCX;if(X&&X.cf&&X.cf.nouveauClient){ov.hidden=true;document.body.style.overflow='';var garde=S;X.cf.nouveauClient(function(k){S=garde;S.contact=k;S.nom=nomDos(k)||'Nouveau client';S.etape=2;monter();rendre()})}}
 else if(a==='reprendre'){var r=S.reprise;S.reprise=null;if(!S.contact&&r.contact){S.contact=r.contact;S.nom=r.nom||nomDos(r.contact)}S.titre=S.titre||r.titre||'';S.lignes=r.lignes||[];S.ouvrages=r.ouvrages||[];S.cl=r.cl||{};recalculer();S.etape=S.contact?(large()?2:3):1;S.ok='Devis repris';rendre()}
 else if(a==='nonrep'){S.reprise=null;lsS('pc-ds-brouillon',null);rendre()}
 else if(a==='grp'){S.g=id;rendre();var l=ov.querySelector('.ds-liste');if(l)l.scrollTop=0}
 else if(a==='tri'){S.tri=S.tri==='prix'?'fam':'prix';rendre()}
 else if(a==='fam'){S.ouv[id]=!S.ouv[id];rendre()}
 else if(a==='tout'){S.tout[id]=1;rendre()}
 else if(a==='art'){var x=trouveArt(id);if(x)feuilleArt(x,null)}
 else if(a==='swap'){var y=trouveArt(id);if(y&&F){var q=F.q,i0=F.i;feuilleArt(y,null);F.q=q;F.i=i0;dessinerF()}}
 else if(a==='main'){feuilleArt(null,null);if(id){F.kind=id;if(id==='pose')F.u='m²';dessinerF()}}
 else if(a==='ligne'){if(S.lignes[+id])feuilleArt(null,+id)}
 else if(a==='ajout'){S.etape=2;rendre()}
 else if(a==='ferf'){S.feuille=null;F=null;rendre()}
 else if(a==='moins'||a==='plus'){F.q=a==='plus'?r2(F.q+1):F.q>1?Math.max(1,r2(F.q-1)):F.q;var inp=ov.querySelector('[data-dsf="q"]');if(inp)inp.value=qf(F.q);majTot()}
 else if(a==='edp'){F.edp=1;dessinerF();var p=ov.querySelector('[data-dsf="pu"]');if(p){p.focus();p.select()}}
 else if(a==='okf')okF();
 else if(a==='enlever'){if(!F.arme){F.arme=1;dessinerF();return}var x2=S.lignes.splice(F.i,1)[0];S.feuille=null;F=null;S.ok='Ligne enlevée : '+(x2&&x2.libelle);rendre()}
 /* travaux complets */
 else if(a==='ouv')feuilleOuv(id,null);
 else if(a==='ouvl'){if(S.ouvrages[+id])feuilleOuv(null,+id)}
 else if(a==='oq'){var k=b.getAttribute('data-k'),qq=OUV[F.t].q.filter(function(z){return z[0]===k})[0];if(qq){F.d[k]=qq[2][+id][1];dessinerO();prixO()}}
 else if(a==='cpt'){var kk=b.getAttribute('data-k');F.d.c[kk]=Math.max(0,(F.d.c[kk]||0)+(+id));dessinerO();prixO()}
 else if(a==='vdet'){F.vd=!F.vd;majPrix()}
 else if(a==='okfo')okFO();
 else if(a==='enlevo'){if(!F.arme){F.arme=1;dessinerO();return}var o2=S.ouvrages.splice(F.i,1)[0];S.ok='Travail enlevé : '+titreOuv(o2);recalculer();S.feuille=null;F=null;rendre()}
 else if(a==='det'){S.det=!S.det;rendre()}
 /* dictée, anciens devis */
 else if(a==='mic')dicter();
 else if(a==='anciens')feuilleAnciens();
 else if(a==='ancien'){var D=anciens()[+id];if(D){var n=reprendre(D);S.feuille=null;S.ok='Repris du devis'+(D.numero?' n° '+D.numero:'')+(n?' · '+n+' prix mis à jour':'');S.det=0;if(!large())S.etape=3;rendre()}}
 /* mes prix */
 else if(a==='prix')ouvrirPrix();
 else if(a==='pxok'){var A1=trouveArt(S.P.liste[S.P.i]);if(A1&&!S.P.attente)envoiPrix({valider:[A1.c]},'Prix confirmé : '+lisible(A1.d))}
 else if(a==='pxed'){S.P.ed=1;rendre();var pi=ov.querySelector('[data-dsp2]');if(pi){pi.focus();pi.select()}}
 else if(a==='pxannul'){S.P.ed=0;rendre()}
 else if(a==='pxsave'){var A2=trouveArt(S.P.liste[S.P.i]),v=nb((ov.querySelector('[data-dsp2]')||{}).value);if(!(v>0)){toast('Prix illisible','En euros hors taxes, ex. 38,50');return}if(A2&&!S.P.attente)envoiPrix({code:A2.c,prix:v},'Prix enregistré : '+lisible(A2.d)+' '+eur(v))}
 else if(a==='pxpasse'){S.P.i++;rendre()}
 else if(a==='finprix'){if(S.solo)fermer();else{S.mode='devis';rendre()}}
 else if(a==='creer')creer(b);
 else if(a==='desarme'){S.arme=0;rendre()}
 else if(a==='vert'){S.verT=!S.verT;rendre()}
 else if(a==='vue'){S.vue=id;rendre();var lv=ov.querySelector('.ds-liste');if(lv)lv.scrollTop=0}
 else if(a==='cll')feuilleCl(id);
 else if(a==='clok'&&F&&F.cl!=null)okCl();
 else if(a==='clrem'&&F&&F.cl!=null){if(S.cl)delete S.cl[F.cl];var kk=F.cl;feuilleCl(kk)}
 else if(a==='clrg'&&F&&F.cl!=null){var lr=S.lignes.filter(function(l){return l.uid===F.cl})[0];if(lr){lr.rg=id;if(S.cl)delete S.cl[F.cl]}S.feuille=null;F=null;S.ok='Ligne fondue dans le travail';rendre()}
 else if(a==='clsort'&&F&&F.cl!=null){var kc=F.cl;S.lignes.forEach(function(l){if(l.rg===kc)l.rg='seule'});S.feuille=null;F=null;rendre()}
 else if(a==='ach'){var x=S.calc&&S.calc.a_chiffrer&&S.calc.a_chiffrer[+id];if(!x)return;feuilleArt(null,null);F.gr=x.groupe||'';F.lib=x.libelle;F.q=x.fournisseur?1:x.quantite;F.u=x.unite||'u';F.pu=0;F.pu0=0;dessinerF();setTimeout(function(){var z=ov&&ov.querySelector('[data-dsf="pu"]');if(z)z.focus()},250)}}
function feuilleAnciens(){var A=anciens();F={anc:1};
 S.feuille='<div class="ds-grab"></div><div class="ds-fq">Repartir d’un devis déjà fait</div><p class="ds-note c">Les produits de votre base reprennent le prix d’aujourd’hui. Vous changez ensuite ce que vous voulez.</p><div class="ds-card">'+A.map(function(D,i){var n=(D.lignes||[]).length+(D.ouvrages||[]).length;return '<button type="button" class="ds-row" data-ds="ancien" data-id="'+i+'"><span class="ds-ic">'+IC.hist+'</span><span class="ds-tx"><b>'+esc(D.titre||'Devis'+(D.nom?' de '+D.nom:''))+'</b><small>'+esc((D.nom||'')+(D.numero?' · n° '+D.numero:'')+' · '+dateC(D.le)+' · '+n+' ligne'+(n>1?'s':''))+'</small></span><span class="ds-pr">'+eur(D.total)+'</span></button>'}).join('')+'</div><button type="button" class="ds-lien" data-ds="ferf">Annuler</button>';rendre()}
function saisie(e){var t=e.target,k=t.getAttribute('data-dsi'),f=t.getAttribute('data-dsf'),o=t.getAttribute('data-dso'),cz=t.getAttribute('data-dsc');if(!S)return;
 if(cz&&F&&F.cl!=null){F[cz]=t.value;return}
 if(k==='q'||k==='qc'){S[k]=t.value;var z=ov.querySelector(k==='q'?'.ds-lb':'.ds-lc');if(z){z.innerHTML=k==='q'?listeBase():listeClients();z.scrollTop=0}}
 else if(k==='titre')S.titre=t.value;
 else if(o&&F&&F.o){F.d[o]=nb(t.value);prixO()}
 else if(f==='m2q'&&F&&F.m2){var v=nb(t.value);if(v>0){F.q=Math.ceil(v/F.m2-1e-9);var qi=ov.querySelector('[data-dsf="q"]');if(qi)qi.value=qf(F.q);majTot()}}
 else if(f&&F){if(f==='q')F.q=nb(t.value);else if(f==='pu')F.pu=nb(t.value);else F[f]=t.value;if(f==='q'||f==='pu')majTot();if(f==='pu'){var dm=ov.querySelector('[data-dsm]');if(dm&&F.m2)dm.textContent=eurF(F.pu/F.m2)}}}
function creer(b){if(!S.contact){S.etape=1;rendre();toast('Pour qui ?','Choisissez le client.');return}
 if(vide()){toast('Il manque les lignes','Ajoutez au moins une ligne.');return}
 if(S.calcEtat){toast(S.calcEtat==='charge'?'Un instant':'Calcul impossible',S.calcEtat==='charge'?'Cliky finit le calcul des travaux.':S.calcEtat.slice(4));return}
 if(!S.arme){S.arme=1;rendre();return}
 b.disabled=true;b.textContent='En cours…';var nom=S.nom,copie={nom:S.nom,titre:S.titre,lignes:S.lignes,ouvrages:S.ouvrages,cl:S.cl||{},total:total(),le:Date.now()};
 /* Le client reçoit une ligne par travail (titre + phrase + prix) ; le détail part seulement dans le coffre de l'Espace. */
 var L=lignesClient().map(function(x){return {libelle:x.titre,description:x.phrase||undefined,quantite:x.quantite,unite:x.unite,total:x.total}});
 var det={v:1,contact:S.contact,nom:S.nom,titre:S.titre,lignes:S.lignes,ouvrages:S.ouvrages,cl:S.cl||{},le:Date.now()};
 if(S.maj){var mj=S.maj;PCV.api('/espace/devis/maj',{method:'POST',body:{id:mj.id,contact:S.contact,titre:S.titre,lignes:{materiaux:[],main_oeuvre:L},detail:det}}).then(function(){
   fermer();toast('Devis n° '+(mj.numero||'')+' mis à jour',nom+' · le devis du client a pris les nouveaux prix et les nouvelles phrases.');if(PCV.apresDevis)PCV.apresDevis()},
   function(err){if(!S)return;S.arme=0;rendre();toast('Pas fait',err.message)});return}
 PCV.api('/espace/devis',{method:'POST',body:{contact:S.contact,main:true,titre:S.titre,lignes:{materiaux:[],main_oeuvre:L},detail:det}}).then(function(x){
  copie.numero=x.devis&&x.devis.numero||'';lsS('pc-ds-devis',[copie].concat(anciens()).slice(0,15));lsS('pc-ds-brouillon',null);
  fermer();toast('Devis'+(x.devis&&x.devis.numero?' n° '+x.devis.numero:'')+' créé',nom+' · il vous attend dans ses documents, envoyez-le quand vous voulez.');if(PCV.apresDevis)PCV.apresDevis()},
  function(err){if(!S)return;S.arme=0;rendre();toast('Pas fait',err.message)})}
function toast(a,b){if(window.PCV&&PCV.toast)PCV.toast(a,b)}
var lw=large();window.addEventListener('resize',function(){if(S&&large()!==lw){lw=large();if(!lw&&S.etape===2&&!vide())S.etape=3;rendre()}});

/* ---------- le style (N1 : bleu nuit pour agir, laiton seulement en touche) ---------- */
var css=document.createElement('style');css.textContent=[
'#dsv{position:fixed;inset:0;z-index:2147482000;background:var(--n1-bg,#ECEEF2);color:var(--n1-fg,#0E1322);font:15px/1.35 var(--f,Manrope,system-ui,sans-serif);-webkit-font-smoothing:antialiased}',
'#dsv[hidden]{display:none}#dsv *{box-sizing:border-box}#dsv button{font:inherit;color:inherit;border:0;background:none;cursor:pointer;text-align:left;-webkit-tap-highlight-color:transparent}',
'#dsv svg{width:22px;height:22px;stroke:currentColor;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}',
'#dsv .ds-in{position:relative;height:100%;display:flex;flex-direction:column;max-width:640px;margin:0 auto;padding-top:env(safe-area-inset-top)}',
'#dsv .ds-2c{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr);height:100%;min-height:0}#dsv .ds-in:has(.ds-2c){max-width:none}',
'#dsv .ds-col{display:flex;flex-direction:column;min-height:0;height:100%;position:relative}#dsv .ds-col2{border-left:1px solid var(--n1-line,rgba(14,19,34,.09));background:color-mix(in srgb,var(--n1-nuit,#1B2440) 3%,var(--n1-bg,#ECEEF2))}',
'#dsv .ds-top{display:flex;align-items:center;gap:10px;padding:14px 16px 10px;flex:none}#dsv .ds-top h1{flex:1;margin:0;font-size:20px;font-weight:800;line-height:1.2}#dsv .ds-top h1 small{display:block;font-size:13px;color:var(--n1-muted,#565E73);font-weight:500;margin-top:2px}',
'#dsv .ds-rond{flex:none;width:40px;height:40px;border-radius:50%;background:var(--n1-calme,#F6F7F9);box-shadow:var(--n1-pk);display:grid;place-items:center;color:var(--n1-muted,#565E73);text-align:center}#dsv .ds-rond.p{width:30px;height:30px;box-shadow:none;background:color-mix(in srgb,var(--n1-nuit,#1B2440) 7%,transparent)}#dsv .ds-rond.p svg{width:16px;height:16px}#dsv .ds-rond.arme{background:var(--n1-alert,#B9577A);color:#fff}',
'#dsv .ds-fil{display:flex;gap:6px;padding:0 16px 12px;flex:none}#dsv .ds-fil span{flex:1;height:5px;border-radius:3px;background:color-mix(in srgb,var(--n1-fg,#0E1322) 14%,transparent)}#dsv .ds-fil span.f{background:var(--n1-nuit,#1B2440)}#dsv .ds-fil span.c{background:var(--n1-laiton,#A8823F)}',
'#dsv .ds-q{font-size:22px;font-weight:800;padding:4px 16px 12px}',
'#dsv .ds-srch{flex:none;margin:0 16px 12px;display:flex;align-items:center;gap:10px;background:color-mix(in srgb,var(--n1-nuit,#1B2440) 6%,var(--n1-bg,#ECEEF2));box-shadow:var(--n1-in);border-radius:16px;padding:0 14px;color:var(--n1-muted,#565E73)}',
'#dsv .ds-srch input{flex:1;min-width:0;width:auto;border:0!important;background:none!important;box-shadow:none!important;border-radius:0!important;margin:0!important;font:600 17px var(--f,inherit);color:var(--n1-fg,#0E1322);padding:15px 0!important;outline:none;-webkit-appearance:none;appearance:none}#dsv input::placeholder,#dsv textarea::placeholder{color:#8A90A0;font-weight:500}',
'#dsv .ds-chips{flex:none;display:flex;gap:8px;padding:0 16px 12px;overflow-x:auto;scrollbar-width:none}#dsv .ds-chips::-webkit-scrollbar{display:none}',
'#dsv .ds-chip{flex:none;padding:9px 14px;border-radius:999px;background:var(--n1-calme,#F6F7F9);box-shadow:var(--n1-pk);font-weight:700;font-size:14px;white-space:nowrap}#dsv .ds-chip.on{background:var(--n1-nuit,#1B2440);color:var(--n1-nuit-fg,#fff);box-shadow:none}',
'#dsv .ds-liste{flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;padding-bottom:28px}#dsv .ds-lg{padding-bottom:190px}',
'#dsv .ds-four{display:flex;flex-wrap:wrap;align-items:baseline;gap:2px 8px;padding:6px 18px 8px}#dsv .ds-four b{flex-basis:100%;font-size:15.5px;font-weight:800}#dsv .ds-four small{color:var(--n1-muted,#565E73);font-size:12.5px;font-weight:600}#dsv .ds-hab{font-size:12px;color:var(--n1-laiton,#A8823F);font-weight:700}',
'#dsv .ds-card{margin:0 16px 14px;background:var(--n1-calme,#F6F7F9);border-radius:18px;box-shadow:var(--n1-calme-sh);overflow:hidden}',
'#dsv .ds-row{display:flex;width:100%;align-items:center;gap:12px;padding:12px 14px;border-top:1px solid var(--n1-line,rgba(14,19,34,.09))}#dsv .ds-card>.ds-row:first-child,#dsv .ds-sub>.ds-row:first-child{border-top:0}',
'#dsv .ds-ic{flex:none;width:40px;height:40px;border-radius:12px;background:color-mix(in srgb,var(--n1-nuit,#1B2440) 7%,transparent);display:grid;place-items:center;color:var(--n1-nuit,#1B2440)}#dsv .ds-ic:empty{display:none}',
'#dsv .ds-tx{flex:1;min-width:0}#dsv .ds-tx b{display:block;font-size:15.5px;font-weight:700;overflow-wrap:anywhere}#dsv .ds-tx small{display:block;color:var(--n1-muted,#565E73);font-size:13px;margin-top:1px}',
'#dsv .ds-pr{flex:none;text-align:right;font-weight:800;font-size:15px;white-space:nowrap}#dsv .ds-pr small{display:block;font-weight:500;color:var(--n1-muted,#565E73);font-size:12px}',
'#dsv .ds-plus{flex:none;width:42px;height:42px;border-radius:50%;background:var(--n1-nuit,#1B2440);color:var(--n1-nuit-fg,#fff);display:grid;place-items:center;font-size:24px;font-weight:600;text-align:center;box-shadow:var(--n1-go-sh)}',
'#dsv .ds-tag{font-style:normal;display:inline-block;font-size:11.5px;font-weight:700;padding:1px 7px;border-radius:6px;color:var(--n1-laiton,#A8823F);background:color-mix(in srgb,var(--n1-laiton,#A8823F) 13%,transparent)}',
'#dsv .ds-fh{display:flex;width:100%;align-items:center;gap:12px;padding:12px 14px;border-top:1px solid var(--n1-line,rgba(14,19,34,.09));font-weight:700}#dsv .ds-card>.ds-fh:first-child{border-top:0}#dsv .ds-fh.op{background:color-mix(in srgb,var(--n1-nuit,#1B2440) 6%,transparent)}#dsv .ds-n{font-size:13px;color:var(--n1-muted,#565E73);font-weight:600}',
'#dsv .ds-sub .ds-row{padding-left:22px}#dsv .ds-voir{display:block;width:100%;padding:11px 14px 13px 22px;font-size:14px;font-weight:700;color:var(--n1-nuit,#1B2440);border-top:1px solid var(--n1-line,rgba(14,19,34,.09))}',
'#dsv .ds-lien{display:block;width:100%;text-align:center!important;color:var(--n1-nuit,#1B2440);font-weight:700;font-size:15px;padding:14px 0;text-decoration:underline;text-underline-offset:3px}#dsv .ds-lien.rouge{color:var(--n1-alert,#B9577A)}',
'#dsv .ds-note{font-size:13px;color:var(--n1-muted,#565E73);padding:0 18px 10px;margin:0}#dsv .ds-note.c{text-align:center;padding:8px 0 0}',
'#dsv .ds-sec{font-size:12.5px;font-weight:800;color:var(--n1-muted,#565E73);letter-spacing:.02em;padding:4px 18px 8px}',
'#dsv .ds-btn{display:flex;width:calc(100% - 32px);align-items:center;justify-content:center;margin:0 16px;min-height:58px;border-radius:18px;background:var(--n1-nuit,#1B2440);color:var(--n1-nuit-fg,#fff);font-weight:800;font-size:18px;text-align:center!important;box-shadow:var(--n1-go-sh)}#dsv .ds-btn.cl{min-height:52px;font-size:16px;background:var(--n1-calme,#F6F7F9);color:var(--n1-fg,#0E1322);box-shadow:var(--n1-pk)}#dsv .ds-btn[disabled]{opacity:.45}#dsv .ds-btn.arme{background:var(--n1-ok,#3E8E6A);color:#fff}',
'#dsv .ds-bas{position:absolute;left:0;right:0;bottom:0;padding:12px 0 calc(16px + env(safe-area-inset-bottom));background:linear-gradient(transparent,var(--n1-bg,#ECEEF2) 20%)}#dsv .ds-in>.ds-bas{max-width:640px;margin:0 auto}',
'#dsv .ds-tot{display:flex;justify-content:space-between;align-items:baseline;padding:12px 18px}#dsv .ds-tot span{font-weight:700;color:var(--n1-muted,#565E73)}#dsv .ds-tot b{font-size:28px;font-weight:800}',
'#dsv .ds-ok{margin:0 16px 12px;padding:12px 14px;border-radius:14px;background:color-mix(in srgb,var(--n1-ok,#3E8E6A) 13%,transparent);color:var(--n1-ok,#3E8E6A);font-weight:700;font-size:14px}',
'#dsv .ds-titre{display:block;margin:6px 16px 0;font-size:13px;font-weight:700;color:var(--n1-muted,#565E73)}#dsv .ds-titre span{font-weight:500}',
'#dsv input:not(.ds-srch input),#dsv textarea{display:block;width:100%;margin-top:6px;border:0;border-radius:14px;padding:13px 14px;font:600 16px var(--f,inherit);color:var(--n1-fg,#0E1322);background:color-mix(in srgb,var(--n1-nuit,#1B2440) 6%,var(--n1-bg,#ECEEF2));box-shadow:var(--n1-in);outline:none;resize:none}',
'#dsv .ds-voile{position:absolute;inset:0;background:rgba(14,19,34,.4)}',
/* deux devis : onglets « Pour moi » / « Pour le client », le devis du client en feuille de papier */
'#dsv .ds-vues{display:flex;gap:6px;margin:0 16px 10px;padding:4px;border-radius:16px;background:color-mix(in srgb,var(--n1-nuit,#1B2440) 6%,transparent)}',
'#dsv .ds-vues button{flex:1;display:flex;align-items:center;justify-content:center;gap:6px;min-height:44px;border-radius:12px;font-weight:800;font-size:14.5px;color:var(--n1-muted,#565E73)}',
'#dsv .ds-vues button svg{width:17px;height:17px}',
'#dsv .ds-vues button[aria-selected="true"]{background:var(--n1-nuit,#1B2440);color:var(--n1-nuit-fg,#fff)}',
'#dsv .ds-moi{margin:-2px 16px 10px;text-align:left}',
'#dsv .ds-pap{margin:0 16px 10px;padding:14px 14px 10px;border-radius:12px;background:#fff;color:#141A2E;box-shadow:0 1px 2px rgba(20,26,46,.08),0 8px 24px rgba(20,26,46,.10)}',
'#dsv .ds-pt{font-weight:800;font-size:15px;padding:0 0 8px;border-bottom:1px solid #E3E6EC;margin-bottom:4px}',
'#dsv .ds-pap .ds-pl{display:flex;gap:10px;width:100%;text-align:left;padding:10px 0;margin:0;border:0;border-bottom:1px solid #EEF0F4;border-radius:0;background:none;box-shadow:none;color:inherit;align-items:flex-start;min-height:0}',
'#dsv .ds-pap .ds-pl:active{background:#F4F5F8}',
'#dsv .ds-pl>span{flex:1;min-width:0}#dsv .ds-pl b{display:block;font-size:14.5px;line-height:1.25}',
'#dsv .ds-pl small{display:block;margin-top:3px;font-size:13px;line-height:1.4;color:#4A5266}#dsv .ds-pl small.ds-pq{color:#8A6A2E}',
'#dsv .ds-pl .ds-pr{flex:none;font-variant-numeric:tabular-nums}',
'#dsv .ds-ptot{display:flex;justify-content:space-between;align-items:baseline;padding:10px 0 2px;font-weight:800}#dsv .ds-ptot b{font-size:17px;font-variant-numeric:tabular-nums}',
'#dsv .ds-feuille .ds-titre{margin:10px 16px 0}#dsv .ds-feuille .ds-chips{padding:0 16px 6px;flex-wrap:wrap}#dsv .ds-feuille>.ds-btn.cl{margin:10px 16px 0;width:calc(100% - 32px)}',
'#dsv .ds-feuille{position:absolute;left:0;right:0;bottom:0;max-height:92%;overflow-y:auto;background:var(--n1-calme,#F6F7F9);border-radius:26px 26px 0 0;padding:10px 0 calc(18px + env(safe-area-inset-bottom));box-shadow:0 -10px 40px rgba(0,0,0,.2);animation:dsup .22s ease-out}',
'@media (min-width:700px){#dsv .ds-feuille{left:50%;right:auto;width:480px;margin-left:-240px;bottom:auto;top:50%;transform:translateY(-50%);border-radius:24px;animation:none}}',
'@keyframes dsup{from{transform:translateY(40px);opacity:.4}}',
'#dsv .ds-grab{width:42px;height:5px;border-radius:3px;background:color-mix(in srgb,var(--n1-fg,#0E1322) 20%,transparent);margin:0 auto 12px}',
'#dsv .ds-fhd{border:0;padding:0 18px 12px}#dsv .ds-fhd b{font-size:18px}',
'#dsv .ds-fq{text-align:center;font-size:13px;font-weight:800;color:var(--n1-muted,#565E73);letter-spacing:.03em;text-transform:uppercase;padding:4px 0 6px}',
'#dsv .ds-st{display:flex;align-items:center;justify-content:space-between;margin:0 16px 8px;gap:10px}#dsv .ds-mb{width:66px;height:66px;border-radius:50%;background:var(--n1-calme,#F6F7F9);box-shadow:var(--n1-pk);display:grid;place-items:center;font-size:32px;font-weight:600;text-align:center}',
'#dsv .ds-qv{flex:1;text-align:center}#dsv .ds-qv input{background:none!important;box-shadow:none!important;text-align:center;font-size:44px!important;font-weight:800!important;padding:0!important;margin:0!important}#dsv .ds-qv small{display:block;color:var(--n1-muted,#565E73);font-weight:600;font-size:14px}',
'#dsv .ds-ln{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:10px 18px;border-top:1px solid var(--n1-line,rgba(14,19,34,.09));font-size:15px}#dsv .ds-ln span{color:var(--n1-muted,#565E73)}#dsv .ds-ln b{font-size:17px;white-space:nowrap}#dsv .ds-ln.s{border:0;padding-top:0;font-size:13px}#dsv .ds-ln.big b{font-size:24px}#dsv .ds-ln.big{margin-bottom:12px}',
'#dsv .ds-mod{font-size:13px!important;font-weight:700;color:var(--n1-nuit,#1B2440)!important;padding:6px 10px!important;border-radius:10px;background:color-mix(in srgb,var(--n1-nuit,#1B2440) 8%,transparent)!important;margin-left:6px}',
'#dsv .ds-pin{width:130px!important;text-align:right;margin:0!important}',
'#dsv .ds-champ{display:block;margin:0 16px 12px;font-size:13px;font-weight:700;color:var(--n1-muted,#565E73)}#dsv .ds-2{display:grid;grid-template-columns:1fr 1fr;gap:0}#dsv .ds-2 .ds-champ:first-child{margin-right:6px}#dsv .ds-2 .ds-champ:last-child{margin-left:6px}',
'@media (hover:hover){#dsv .ds-row[data-ds]:hover,#dsv .ds-fh:hover{background:color-mix(in srgb,var(--n1-nuit,#1B2440) 4%,transparent)}}',
'#dsv .ds-srch .ds-mic{flex:none;width:40px;height:40px;margin-right:-6px;border-radius:50%;display:grid;place-items:center;color:var(--n1-nuit,#1B2440);background:color-mix(in srgb,var(--n1-nuit,#1B2440) 8%,transparent)}#dsv .ds-srch .ds-mic.on{background:var(--n1-laiton,#A8823F);color:#fff;animation:dsmic 1s ease-in-out infinite}@keyframes dsmic{50%{transform:scale(1.12)}}',
'#dsv .ds-rep{margin:0 16px 14px;padding:14px 16px 6px;border-radius:18px;background:var(--n1-calme,#F6F7F9);box-shadow:var(--n1-calme-sh);border-left:4px solid var(--n1-laiton,#A8823F)}#dsv .ds-rep>b{display:block;font-size:16px}#dsv .ds-rep>small{display:block;color:var(--n1-muted,#565E73);margin-top:2px}#dsv .ds-rep2{display:flex;align-items:center;gap:12px;margin-top:10px}#dsv .ds-rep2 .ds-btn{width:auto;margin:0;flex:1;min-height:48px;font-size:16px}#dsv .ds-rep2 .ds-lien{width:auto;flex:1}',
'#dsv .ds-chip.t{background:none;box-shadow:none;color:var(--n1-nuit,#1B2440);text-decoration:underline;text-underline-offset:3px}',
'#dsv .ds-alerte{display:flex;width:calc(100% - 32px);margin:0 16px 14px;align-items:center;gap:12px;padding:12px 14px;border-radius:18px;background:color-mix(in srgb,var(--n1-laiton,#A8823F) 12%,var(--n1-calme,#F6F7F9));box-shadow:var(--n1-pk)}#dsv .ds-alerte .ds-ic{background:var(--n1-laiton,#A8823F);color:#fff}',
'#dsv .ds-sec span{font-weight:600;letter-spacing:0;text-transform:none}#dsv .ds-sec svg{width:14px;height:14px;vertical-align:-2px;color:var(--n1-laiton,#A8823F)}',
'#dsv .ds-dep{padding:4px 16px 6px;display:grid;gap:12px}#dsv .ds-big{position:relative;display:flex;flex-direction:column;align-items:flex-start;gap:4px;text-align:left!important;padding:18px 18px 16px;border-radius:26px;background:var(--n1-calme,#F6F7F9);box-shadow:var(--n1-calme-sh);min-height:132px}#dsv .ds-big b{font-size:19px;font-weight:800;letter-spacing:-.01em}#dsv .ds-big small{font-size:13px;opacity:.7;line-height:1.3}#dsv .ds-bi{width:46px;height:46px;border-radius:15px;display:grid;place-items:center;background:color-mix(in srgb,var(--n1-nuit,#1B2440) 8%,transparent);margin-bottom:8px}#dsv .ds-bi svg{width:24px;height:24px}#dsv .ds-bgo{position:absolute;top:16px;right:16px;width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:var(--n1-nuit,#1B2440);color:var(--n1-nuit-fg,#fff)}#dsv .ds-bgo svg{width:16px;height:16px}#dsv .ds-big.sombre{background:var(--n1-nuit,#1B2440);color:var(--n1-nuit-fg,#fff);min-height:0;padding:20px 18px 18px;flex-direction:column}#dsv .ds-big.sombre .ds-bi{background:color-mix(in srgb,var(--n1-nuit-fg,#fff) 14%,transparent)}#dsv .ds-big.sombre .ds-bgo{background:var(--n1-laiton,#A8823F);color:#fff}#dsv .ds-bt{display:grid;gap:4px;padding-right:40px}#dsv .ds-bmini{display:flex;gap:8px;margin-top:12px}#dsv .ds-bmini i{width:34px;height:34px;border-radius:11px;display:grid;place-items:center;background:color-mix(in srgb,var(--n1-nuit-fg,#fff) 10%,transparent)}#dsv .ds-bmini svg{width:18px;height:18px}#dsv .ds-duo{display:grid;grid-template-columns:1fr 1fr;gap:12px}#dsv .ds-cree{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;padding:2px 0 6px}#dsv .ds-pil{display:inline-flex;align-items:center;gap:6px;padding:9px 14px;border-radius:999px;font-weight:700;font-size:14px;background:transparent;border:1.5px dashed color-mix(in srgb,currentColor 28%,transparent)}#dsv .ds-pil svg{width:16px;height:16px}#dsv .ds-q{font-size:20px;font-weight:800;letter-spacing:-.01em;padding:4px 2px 2px}#dsv .ds-rgs{display:grid;gap:10px}#dsv .ds-rg{position:relative;display:flex;align-items:center;gap:14px;text-align:left!important;padding:16px;border-radius:22px;background:var(--n1-calme,#F6F7F9);box-shadow:var(--n1-calme-sh)}#dsv .ds-rg .ds-bi{margin:0;flex:none}#dsv .ds-rg .ds-bt{flex:1;padding:0}#dsv .ds-rg b{font-size:17px;font-weight:800}#dsv .ds-rg small{font-size:13px;opacity:.7}#dsv .ds-rg .ds-bgo{position:static;flex:none}#dsv .ds-rg.sombre{background:var(--n1-nuit,#1B2440);color:var(--n1-nuit-fg,#fff)}#dsv .ds-rg.sombre .ds-bi{background:color-mix(in srgb,var(--n1-nuit-fg,#fff) 14%,transparent)}#dsv .ds-rg.sombre .ds-bgo{background:var(--n1-laiton,#A8823F);color:#fff}#dsv .ds-rg.cr,#dsv .ds-c4.cr{background:transparent;box-shadow:none;border:1.5px dashed color-mix(in srgb,currentColor 25%,transparent)}#dsv .ds-g4{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px}#dsv .ds-c4{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;min-height:150px;min-width:0;border-radius:28px;background:var(--n1-calme,#F6F7F9);box-shadow:var(--n1-calme-sh);text-align:center!important;padding:12px}#dsv .ds-c4 .ds-bi{width:60px;height:60px;border-radius:20px;margin:0 0 8px}#dsv .ds-c4 .ds-bi svg{width:30px;height:30px}#dsv .ds-c4 b{font-size:17px;font-weight:800}#dsv .ds-c4 small{font-size:12.5px;opacity:.7}#dsv .ds-c4.sombre{background:var(--n1-nuit,#1B2440);color:var(--n1-nuit-fg,#fff)}#dsv .ds-c4.sombre .ds-bi{background:var(--n1-laiton,#A8823F);color:#fff}#dsv .ds-hero{padding:10px 4px 6px}#dsv .ds-hero small{display:block;font-size:12px;font-weight:800;letter-spacing:.12em;color:var(--n1-laiton,#A8823F)}#dsv .ds-hero b{display:block;font-size:30px;line-height:1.1;font-weight:800;letter-spacing:-.02em;margin-top:6px}#dsv .ds-pils{display:grid;gap:10px}#dsv .ds-pl{display:flex;align-items:center;gap:14px;padding:12px 18px 12px 12px;border-radius:999px;background:var(--n1-calme,#F6F7F9);box-shadow:var(--n1-calme-sh);text-align:left!important}#dsv .ds-pl>svg{width:18px;height:18px;opacity:.6;flex:none}#dsv .ds-pl .ds-bt{flex:1;padding:0;gap:1px}#dsv .ds-pl b{font-size:17px;font-weight:800}#dsv .ds-pl small{font-size:12.5px;opacity:.7}#dsv .ds-pi{width:48px;height:48px;border-radius:50%;display:grid;place-items:center;background:color-mix(in srgb,var(--n1-nuit,#1B2440) 8%,transparent);flex:none}#dsv .ds-pi svg{width:22px;height:22px}#dsv .ds-pl.plein{background:var(--n1-nuit,#1B2440);color:var(--n1-nuit-fg,#fff)}#dsv .ds-pl.plein .ds-pi{background:var(--n1-laiton,#A8823F);color:#fff}#dsv .ds-tuiles{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:0 16px 16px}#dsv .ds-tuile{display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 4px 10px;border-radius:16px;background:var(--n1-calme,#F6F7F9);box-shadow:var(--n1-pk);font-weight:700;font-size:13px;text-align:center!important;line-height:1.15}#dsv .ds-tuile span{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:color-mix(in srgb,var(--n1-nuit,#1B2440) 8%,transparent);color:var(--n1-nuit,#1B2440)}#dsv .ds-tuile svg{width:26px;height:26px}',
'#dsv .ds-anc{gap:8px;margin-bottom:16px}',
'#dsv .ds-tag.r{color:var(--n1-alert,#B9577A);background:color-mix(in srgb,var(--n1-alert,#B9577A) 12%,transparent)}#dsv .ds-tag.v{color:var(--n1-ok,#3E8E6A);background:color-mix(in srgb,var(--n1-ok,#3E8E6A) 12%,transparent)}#dsv .ds-four .ds-tag{margin-top:2px}',
'#dsv small.v{color:var(--n1-ok,#3E8E6A)!important;font-weight:700!important}#dsv small.r{color:var(--n1-alert,#B9577A)!important;font-weight:700!important}',
'#dsv .ds-tc{background:color-mix(in srgb,var(--n1-nuit,#1B2440) 5%,transparent)}#dsv .ds-tc .ds-pr{font-size:17px}',
'#dsv .ds-det{padding:4px 14px 10px 14px;border-top:1px solid var(--n1-line,rgba(14,19,34,.09))}#dsv .ds-det.f{margin:0 16px 10px;border:0;border-radius:14px;background:color-mix(in srgb,var(--n1-nuit,#1B2440) 4%,transparent)}',
'#dsv .ds-dg{display:flex;justify-content:space-between;font-weight:800;font-size:13.5px;padding:10px 0 4px}#dsv .ds-dl{display:flex;justify-content:space-between;gap:10px;font-size:13.5px;padding:4px 0 4px 8px}#dsv .ds-dl small{display:block;color:var(--n1-muted,#565E73);font-size:12px}#dsv .ds-dl b{white-space:nowrap;font-weight:700}',
'#dsv .ds-ver{margin:0 16px 14px;padding:10px 14px;border-radius:14px;background:color-mix(in srgb,var(--n1-laiton,#A8823F) 10%,transparent);font-size:13px}#dsv .ds-ver b{display:block;color:var(--n1-laiton,#A8823F);margin-bottom:4px}#dsv .ds-ver span{display:block;padding:2px 0}#dsv .ds-sp small{display:block;opacity:.75;margin-bottom:6px}#dsv .ds-spl{display:flex;align-items:center;gap:10px;padding:7px 0;border-top:1px solid color-mix(in srgb,currentColor 10%,transparent)}#dsv .ds-spl span{flex:1;min-width:0}#dsv .ds-spl span small{margin:0}#dsv .ds-spl em{flex:none;font-style:normal;font-size:12px;color:var(--n1-ok,#2E7D4F);white-space:nowrap}#dsv .ds-spl.ok span{opacity:.6}#dsv .ds-mp{flex:none;border:0;border-radius:999px;padding:7px 12px;font:600 13px inherit;font-family:inherit;background:var(--n1-nuit,#1B2440);color:var(--n1-nuit-fg,#fff);box-shadow:var(--n1-go-sh);cursor:pointer}#dsv .ds-avert{color:#B3412E;font-weight:600}',
'#dsv .ds-pb{flex:none;height:6px;margin:0 16px 14px;border-radius:3px;background:color-mix(in srgb,var(--n1-fg,#0E1322) 12%,transparent);overflow:hidden}#dsv .ds-pb span{display:block;height:100%;background:var(--n1-laiton,#A8823F);transition:width .3s}',
'#dsv .ds-pc{margin:6px 16px 18px;padding:20px 18px;border-radius:22px;background:var(--n1-calme,#F6F7F9);box-shadow:var(--n1-calme-sh);text-align:center}#dsv .ds-pc>b{display:block;font-size:19px;margin-top:10px}#dsv .ds-pc>small{display:block;color:var(--n1-muted,#565E73);margin-top:4px}#dsv .ds-ic.g{width:56px;height:56px;margin:0 auto;border-radius:16px}',
'#dsv .ds-pv{font-size:40px;font-weight:800;margin:16px 0 4px}#dsv .ds-pv small{display:block;font-size:13px;font-weight:600;color:var(--n1-muted,#565E73)}#dsv .ds-pv input{max-width:220px;margin:0 auto!important;text-align:center;font-size:34px!important;font-weight:800!important}',
'#dsv .ds-pq{margin:12px 0 0;font-weight:600}',
'#dsv .ds-btn.ok{gap:8px;margin-bottom:12px}#dsv .ds-btn.ok svg{width:24px;height:24px}#dsv .ds-pc~.ds-btn.cl{margin-top:0}',
'#dsv .ds-fin{text-align:center;padding:40px 24px 24px}#dsv .ds-fin svg{width:64px;height:64px;color:var(--n1-ok,#3E8E6A);stroke-width:2.4}#dsv .ds-fin b{display:block;font-size:21px;margin-top:10px}#dsv .ds-fin small{display:block;color:var(--n1-muted,#565E73);margin-top:6px}',
'#dsv .ds-cmp{margin:4px 16px 8px;border-radius:14px;background:color-mix(in srgb,var(--n1-nuit,#1B2440) 4%,transparent);overflow:hidden}#dsv .ds-cmp>b{display:block;font-size:12.5px;font-weight:800;color:var(--n1-muted,#565E73);padding:10px 14px 0}#dsv .ds-cmp>small{display:block;font-size:12px;color:var(--n1-muted,#565E73);padding:0 14px 10px}#dsv .ds-cmp .ds-row{border:0;padding:8px 14px}',
'#dsv .ds-mes{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:0 4px;padding:0 0 4px}#dsv .ds-mes .ds-champ{margin:0 12px 12px}#dsv .ds-u{position:relative;display:block}#dsv .ds-u input{font-size:22px!important;font-weight:800!important;padding-right:42px!important}#dsv .ds-u i{position:absolute;right:14px;top:50%;transform:translateY(-35%);font-style:normal;font-weight:700;color:var(--n1-muted,#565E73)}',
'#dsv .ds-oq{padding:0 16px 12px}#dsv .ds-oq>span{display:block;font-size:13px;font-weight:700;color:var(--n1-muted,#565E73);margin-bottom:6px}#dsv .ds-seg{display:flex;flex-wrap:wrap;gap:8px}#dsv .ds-seg button{flex:1 1 auto;min-height:44px;padding:8px 12px;border-radius:14px;background:var(--n1-calme,#F6F7F9);box-shadow:var(--n1-pk);font-weight:700;font-size:14.5px;text-align:center!important}#dsv .ds-seg button.on{background:var(--n1-nuit,#1B2440);color:var(--n1-nuit-fg,#fff);box-shadow:none}',
'#dsv .ds-voir.c{text-align:center!important;border:0;padding:4px 0 10px}',
'#dsv .ds-pr small.m{color:var(--n1-fg,#0E1322);font-weight:700;margin-top:3px;font-size:12.5px}#dsv .ds-enm{display:flex;align-items:center;gap:6px;font-size:13px;color:var(--n1-muted,#565E73);white-space:nowrap}#dsv .ds-enm input{width:88px!important;margin:0!important;padding:8px 10px!important;font-size:15px!important;text-align:right}',
'#dsv .ds-cpt{margin:0 16px 12px}#dsv .ds-cpt .ds-row{padding:6px 10px 6px 14px}#dsv .ds-mb.p{width:44px;height:44px;font-size:24px}#dsv .ds-mb[disabled]{opacity:.35}#dsv .ds-cn{min-width:28px;text-align:center;font-size:19px}',
'@media (max-width:360px){#dsv .ds-tuiles{grid-template-columns:repeat(3,1fr)}}'
].join('\n');document.head.appendChild(css);

/* Rouvrir le devis DÉTAILLÉ d'un devis déjà créé (gardé dans l'Espace), changer ce qu'on veut, et mettre à jour celui du client. */
function modifierDevis(id,numero,k){return PCV.api('/espace/devis/detail?id='+encodeURIComponent(id)).then(function(x){var D=x&&x.detail;
  if(!D){toast('Pas de détail pour ce devis','Il a été fait avant : faites un nouveau devis pour le changer.');return false}
  S=etat0();S.maj={id:+id,numero:numero||''};S.contact=D.contact||k||'';S.nom=D.nom||nomDos(S.contact);S.titre=D.titre||'';
  S.lignes=JSON.parse(JSON.stringify(D.lignes||[]));S.ouvrages=JSON.parse(JSON.stringify(D.ouvrages||[]));S.cl=D.cl||{};S.etape=3;
  charger();monter();recalculer();rendre();return true},function(err){toast('Devis détaillé non ouvert',err.message);return false})}
window.PCDS={ouvrir:ouvrirDevis,prix:ouvrirPrix,modifier:modifierDevis};
})();
