/* Nouveau devis fait à la main, en 3 étapes simples (Cyril 26/11 : « trop compliqué pour créer un devis »).
   1. Pour quel client ? (un toucher)  2. Ajouter : TOUTE la base Cliky, rangée par fournisseur puis par famille,
   avec la recherche au-dessus ; ＋ sur un produit → « Combien ? » (gros − / ＋), prix de vente marge comprise.
   3. Les lignes + Total HT + « Créer le devis » (deux appuis). Sur iPad/PC (≥ 900 px) : lignes à gauche, base à droite.
   Remplace l'ancien écran « Nouveau devis » de vrai.js (nouveauDevis passe ici quand ce fichier est chargé).
   Prix : matériaux = prix d'achat du fournisseur + votre marge (réglage Cliky, GET /espace/base → marge_pct) ;
   main-d'œuvre = votre prix. Rien ne part chez le client : le devis est créé dans vos documents. */
(function(){
"use strict";
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
var lsG=function(k){try{return JSON.parse(localStorage.getItem(k)||'null')}catch(e){return null}};
var lsS=function(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var r2=function(n){return Math.round((+n||0)*100)/100};
var eur=function(n){var s=Math.abs(r2(n)).toFixed(2).split('.');return (n<0?'− ':'')+s[0].replace(/\B(?=(\d{3})+(?!\d))/g,' ')+','+s[1]+' €'};
var nb=function(s){var n=parseFloat(String(s==null?'':s).replace(/\s/g,'').replace(',','.'));return isFinite(n)?n:0};
var qf=function(n){return String(Math.round(n*100)/100).replace('.',',')};
var sans=function(x){return String(x||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')};
var large=function(){return window.innerWidth>=900};

/* ---------- les icônes ---------- */
var I=function(p){return '<svg viewBox="0 0 24 24" aria-hidden="true">'+p+'</svg>'};
var IC={loupe:I('<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>'),pers:I('<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>'),
 x:I('<path d="M6 6l12 12M18 6L6 18"/>'),dos:I('<path d="M15 5l-7 7 7 7"/>'),ch:I('<path d="M9 5l7 7-7 7"/>'),bas:I('<path d="M5 9l7 7 7-7"/>')};
function iconeFam(f,k){var P=window.PCPROD&&PCPROD.icone,t=sans(f),c=k==='prestation'?'casque':/plaque|doublage colle/.test(t)?'ba13':/ossature|suspente|appui/.test(t)?'ossature':/laine|isol|soufflage|combles/.test(t)?'laine':/porte|chassis|quincaill/.test(t)?'porte':/vis|fixation|cheville/.test(t)?'vis':/enduit|bande|colle/.test(t)?'enduit':/mousse|mastic|joint/.test(t)?'cartouche':/sol|plancher|plinthe/.test(t)?'parquet':/protection|proprete|outil/.test(t)?'protection':/trappe/.test(t)?'fenetre':/vapeur|etanch/.test(t)?'protection':'colis';
 return (P&&P(c))||''}

/* ---------- noms lisibles : « PLAQUE DE PLATRE BA13 250 X 120 NF » → « Plaque de plâtre BA13 250 × 120 NF » ---------- */
var ACC={platre:'plâtre',chassis:'châssis',minerale:'minérale',acoustique:'acoustique',etancheite:'étanchéité',allege:'allégé',beton:'béton',fenetre:'fenêtre',ecran:'écran',renforcee:'renforcée',elastomere:'élastomère',degraissant:'dégraissant',equerre:'équerre',metal:'métal',metallique:'métallique',acier:'acier',galvanise:'galvanisé',isolee:'isolée',premiere:'première',securite:'sécurité',decoupe:'découpe'};
/* sans les notes internes entre parenthèses (« (main-d'œuvre, milieu de 5 à 10 €/ml, ootravaux.fr …) ») : elles ne vont pas sur le devis du client */
function lisible(d){d=String(d||'').replace(/\s*\(P\)\s*$/,'').replace(/\s*\((?:[^()]*(?:main-d|milieu|moyenne|rep[eè]re|\.fr|\.com|€|prix)[^()]*)\)/gi,'').trim();
 if(d.replace(/[^a-zà-ÿ]/g,'').length>3)return d; /* déjà en minuscules : on garde */
 var w=d.split(/\s+/).map(function(m,i){if(/\d/.test(m)||m.length<=3&&/^[A-Z]+$/.test(m)&&!/^(DE|DU|LA|LE|LES|ET|EN|AU|AUX|POUR|SUR|AVEC|SANS|UN|UNE|DES|PAR)$/.test(m))return m;
  var l=m.toLowerCase();l=ACC[l]||l;return l});
 var s=w.join(' ').replace(/(\d)\s*[xX]\s*(\d)/g,'$1 × $2').replace(/ x (\d)/g,' × $1');
 return s.charAt(0).toUpperCase()+s.slice(1)}
/* l'unité qu'on compte : « plaque (3 m²) » → plaque ; « barre de 2,49 m » → barre ; sinon l'unité */
function unite(a){var c=String(a.cond||'').split(/ de | \(/)[0].trim();return c||a.u||'u'}
function m2par(a){var m=/([\d]+(?:[.,]\d+)?)\s*m²/.exec(a.cond||'');return m&&/^(plaque|rouleau|colis|pièce|paquet|panneau|botte|carton)/.test(unite(a))?nb(m[1]):0}
function pluriel(u,q){if(q<=1||/[²³]|^(m|ml|h|u|kg|l|forfait)$/i.test(u)||/[sx]$/.test(u)||/\s/.test(u))return u;return u+'s'}
function detail(a){var c=String(a.cond||''),m=/\(([^)]*)\)/.exec(c);return m?m[1]:/ de /.test(c)?c.replace(/^[^ ]+ de /,''):''}

/* ---------- les données : base Cliky, fournisseurs, marge, vos produits ---------- */
var B=lsG('pc-ds-base')||{articles:[],marge_pct:null},FO=lsG('pc-cliky-four')||[],etatB='';
function charger(){if(etatB==='charge')return;etatB='charge';
 PCV.api('/espace/base').then(function(x){B={articles:x.articles||[],marge_pct:x.marge_pct!=null?+x.marge_pct:null,source:x.source||''};lsS('pc-ds-base',B);etatB='ok';rendre()},function(e){etatB='err:'+e.message;rendre()});
 PCV.api('/espace/fournisseurs').then(function(x){FO=x.fournisseurs||[];lsS('pc-cliky-four',FO);rendre()},function(){})}
function marge(){return B.marge_pct!=null&&B.marge_pct>=0?B.marge_pct:0}
function prixVente(a){return a.k==='prestation'?r2(a.pc):r2(a.pc*(1+marge()/100))}
var DEMO=/^(PLA-CLO|PLA-PORTE|PLA-BJ|FEN-POSE-RENO|MO-H|SOL-POSE|PRO-NET|EX-)/;
function vosProduits(){var b=lsG('pc-base1');if(!Array.isArray(b))return [];
 return b.filter(function(p){return p&&p.d&&+p.p>0&&!p.ex&&!DEMO.test(p.c||'')}).map(function(p){return {c:'V-'+(p.c||p.d),d:p.d,cond:p.u||'u',u:p.u||'u',pc:+p.p,k:p.k||'prestation',f:p.f||p.t||'Vos produits',vos:1}})}
function nomFour(id){var f=FO.filter(function(x){return x.id===id})[0];if(f&&f.nom)return f.nom;if(id==='base'){var s=/—\s*(?:TARIF\s+(?:PRO\s+)?)?([^(,]+)/i.exec(B.source||'');return s?s[1].trim().toLowerCase().replace(/(^|\s)\S/g,function(x){return x.toUpperCase()}):'Fournisseur de départ'}return 'Autre fournisseur'}
/* Les groupes : un par fournisseur (l'habituel d'abord), puis la main-d'œuvre, puis vos produits ; dedans, par famille */
function groupes(){var G={},ordre=[];
 var met=function(id,nom,sous,a){if(!G[id]){G[id]={id:id,nom:nom,sous:sous,fam:{},nf:[],n:0};ordre.push(id)}var g=G[id],f=a.f||'Divers';if(!g.fam[f]){g.fam[f]=[];g.nf.push(f)}g.fam[f].push(a);g.n++};
 var hab=(FO.filter(function(x){return x.habituel})[0]||{id:'base'}).id;
 B.articles.forEach(function(a){if(!(a.pc>0))return;if(a.k==='prestation'&&!a.four)met('mo','Main-d’œuvre','vos prix de pose',a);else{var id=a.four||'base';met('f:'+id,nomFour(id),'',a)}});
 vosProduits().forEach(function(a){met('vos','Vos produits','ajoutés par vous',a)});
 ordre.sort(function(a,b){var r=function(x){return x==='f:'+hab?0:/^f:/.test(x)?1:x==='mo'?2:3};return r(a)-r(b)});
 return ordre.map(function(id){var g=G[id];if(id==='f:'+hab)g.hab=1;return g})}

/* ---------- l'état du devis ---------- */
var S=null;
function ouvrirDevis(k,t){S={contact:typeof k==='string'?k:'',nom:'',titre:typeof t==='string'?t.slice(0,120):'',lignes:[],etape:1,q:'',g:'tous',ouv:{},tout:{},arme:0,ok:''};
 var C=clients();if(S.contact){var c=C.filter(function(x){return x.id===S.contact})[0];S.nom=c?c.n:nomDos(S.contact);S.etape=2}
 charger();monter();rendre()}
function clients(){try{return (PCV.clients&&PCV.clients())||[]}catch(e){return []}}
function nomDos(k){try{var d=window.PCX&&PCX.DOS&&PCX.DOS[k];return d&&d.n||''}catch(e){return ''}}
var ov=null;
function monter(){if(ov){ov.hidden=false;document.body.style.overflow='hidden';return}
 ov=document.createElement('div');ov.id='dsv';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-label','Nouveau devis');document.body.appendChild(ov);document.body.style.overflow='hidden';
 ov.addEventListener('click',clic);ov.addEventListener('input',saisie)}
function fermer(){if(ov)ov.hidden=true;document.body.style.overflow='';S=null}
function total(){return r2(S.lignes.reduce(function(s,l){return s+l.total},0))}

/* ---------- l'affichage ---------- */
function fil(n){return '<div class="ds-fil">'+[1,2,3].map(function(i){return '<span class="'+(i<n?'f':i===n?'c':'')+'"></span>'}).join('')+'</div>'}
function tete(t,s,retour){return '<div class="ds-top">'+(retour?'<button type="button" class="ds-rond" data-ds="retour" aria-label="Retour">'+IC.dos+'</button>':'')+'<h1>'+t+'<small>'+s+'</small></h1><button type="button" class="ds-rond" data-ds="fermer" aria-label="Fermer">'+IC.x+'</button></div>'}
function rendre(){if(!S||!ov)return;var y=ov.querySelector('.ds-liste'),sy=y?y.scrollTop:0,h;
 if(S.etape===1)h=ecranClient();
 else if(large())h='<div class="ds-2c"><div class="ds-col">'+ecranLignes(true)+'</div><div class="ds-col ds-col2">'+ecranBase(true)+'</div></div>';
 else h=S.etape===2?ecranBase(false):ecranLignes(false);
 ov.innerHTML='<div class="ds-in">'+h+'</div>'+(S.feuille?'<div class="ds-voile" data-ds="ferf"></div><div class="ds-feuille" role="dialog">'+S.feuille+'</div>':'');
 var y2=ov.querySelector('.ds-liste');if(y2&&sy)y2.scrollTop=sy}
function ecranClient(){
 return tete('Nouveau devis','Étape 1 sur 3 · Pour qui ?')+fil(1)+'<div class="ds-q">Pour quel client ?</div>'+
  '<label class="ds-srch">'+IC.loupe+'<input type="search" data-dsi="qc" value="'+esc(S.qc||'')+'" placeholder="Tapez un nom…" autocomplete="off" enterkeyhint="search"></label>'+
  '<div class="ds-liste ds-lc">'+listeClients()+'</div>'}
function listeClients(){var C=clients(),q=sans(S.qc||'').trim(),L=q?C.filter(function(c){return sans(c.n+' '+c.t).indexOf(q)>=0}):C;
 return '<div class="ds-card">'+(L.length?L.slice(0,80).map(function(c){return '<button type="button" class="ds-row" data-ds="client" data-id="'+esc(c.id)+'"><span class="ds-ic">'+IC.pers+'</span><span class="ds-tx"><b>'+esc(c.n)+'</b>'+(c.t?'<small>'+esc(c.t)+'</small>':'')+'</span><span class="ds-rond p">'+IC.ch+'</span></button>'}).join(''):'<p class="ds-note">'+(q?'Personne à ce nom.':'Pas encore de client.')+'</p>')+'</div>'+
  '<button type="button" class="ds-lien" data-ds="nouvclient">＋ Nouveau client</button>'}
function ecranBase(cote){var G=groupes(),nT=G.reduce(function(s,g){return s+g.n},0);
 var h=(cote?'<div class="ds-top"><h1>Ajouter une ligne<small>Toute la base Cliky, rangée par fournisseur</small></h1></div>':tete('Ajouter au devis',esc(S.nom)+' · Étape 2 sur 3',true)+fil(2))+
  '<label class="ds-srch">'+IC.loupe+'<input type="search" data-dsi="q" value="'+esc(S.q)+'" placeholder="Chercher dans les '+nT+' produits…" autocomplete="off" enterkeyhint="search"></label>'+
  '<div class="ds-chips">'+[['tous','Tous',0]].concat(G.map(function(g){return [g.id,g.nom,g.n]})).map(function(c){return '<button type="button" class="ds-chip'+(S.g===c[0]?' on':'')+'" data-ds="grp" data-id="'+esc(c[0])+'">'+esc(c[1])+(c[2]?' · '+c[2]:'')+'</button>'}).join('')+'</div>';

 return h+'<div class="ds-liste ds-lb">'+listeBase()+'</div>'}
function listeBase(){var G=groupes(),q=sans(S.q).trim(),W=q.split(/\s+/).filter(Boolean),nT=G.reduce(function(s,g){return s+g.n},0),h='';
 if(!nT)h+='<p class="ds-note">'+(etatB==='charge'||!etatB?'Chargement de votre base…':/^err/.test(etatB)?'La base n’a pas pu être chargée : '+esc(etatB.slice(4))+'. Vous pouvez quand même écrire votre ligne.':'Votre base est vide pour l’instant.')+'</p>';
 var trouve=0;
 G.filter(function(g){return S.g==='tous'||S.g===g.id}).forEach(function(g){
  var fams=g.nf.map(function(f){var A=g.fam[f];if(W.length)A=A.filter(function(a){var t=sans(lisible(a.d)+' '+a.d+' '+f+' '+(a.cond||''));return W.every(function(w){return t.indexOf(w)>=0})});return [f,A]}).filter(function(x){return x[1].length});
  if(!fams.length)return;trouve+=fams.length;
  h+='<div class="ds-four"><b>'+esc(g.nom)+'</b><small>'+(g.sous?esc(g.sous)+' · ':'')+g.n+' '+(g.id==='mo'?'prix':'produits')+'</small>'+(g.hab?'<span class="ds-hab">fournisseur habituel</span>':'')+'</div><div class="ds-card">';
  fams.forEach(function(x){var f=x[0],A=x[1],cle=g.id+'|'+f,ouv=W.length||S.ouv[cle],lim=W.length?8:6;
   h+='<button type="button" class="ds-fh'+(ouv?' op':'')+'" data-ds="fam" data-id="'+esc(cle)+'" aria-expanded="'+(ouv?'true':'false')+'"><span class="ds-ic">'+iconeFam(f,A[0].k)+'</span><span class="ds-tx"><b>'+esc(f)+'</b></span><span class="ds-n">'+A.length+'</span><span class="ds-rond p">'+(ouv?IC.bas:IC.ch)+'</span></button>';
   if(!ouv)return;var tout=S.tout[cle]||A.length<=lim+1,V=tout?A:A.slice(0,lim);
   h+='<div class="ds-sub">'+V.map(article).join('')+(tout?'':'<button type="button" class="ds-voir" data-ds="tout" data-id="'+esc(cle)+'">Voir les '+(A.length-lim)+' autres ▾</button>')+'</div>'});
  h+='</div>'});
 if(nT&&!trouve)h+='<p class="ds-note">Rien trouvé pour « '+esc(S.q)+' ». Essayez un autre mot, ou écrivez votre ligne.</p>';
 h+='<button type="button" class="ds-lien" data-ds="main">Je ne trouve pas : écrire ma ligne</button>'+(marge()?'<p class="ds-note">Prix de vente HT. Matériaux : prix de votre fournisseur + votre marge de '+qf(marge())+' %.</p>':'');
 return h}
function article(a){var u=unite(a),dt=detail(a);return '<div class="ds-row ds-art"><span class="ds-tx"><b>'+esc(lisible(a.d))+'</b><small>'+esc(dt)+(a.provisoire?' <em class="ds-tag">prix à confirmer</em>':'')+'</small></span><span class="ds-pr">'+eur(prixVente(a))+'<small>'+esc(u==='u'?'l’unité':/^(m²|m|ml|h|kg|m³)$/.test(u)?'le '+u:'la '+u)+'</small></span><button type="button" class="ds-plus" data-ds="art" data-id="'+esc(a.c)+'" aria-label="Ajouter '+esc(lisible(a.d))+'">＋</button></div>'}
function ecranLignes(cote){var t=total();
 var h=tete('Devis de '+esc(S.nom||'…'),cote?'Étape '+(S.lignes.length?3:2)+' sur 3 · '+(S.lignes.length?'Vérifiez et créez':'Ajoutez les lignes à droite'):'Étape 3 sur 3 · Vérifiez et créez',!cote)+fil(cote?(S.lignes.length?3:2):3)+'<div class="ds-liste ds-lg">';
 if(S.ok)h+='<div class="ds-ok">✓ '+esc(S.ok)+'</div>';
 h+='<div class="ds-sec">LES LIGNES DU DEVIS</div>';
 h+=S.lignes.length?'<div class="ds-card">'+S.lignes.map(function(l,i){return '<button type="button" class="ds-row" data-ds="ligne" data-id="'+i+'"><span class="ds-ic">'+(l.ic||'')+'</span><span class="ds-tx"><b>'+esc(l.libelle)+'</b><small>'+qf(l.quantite)+' '+esc(pluriel(l.unite,l.quantite))+' × '+eur(l.pu)+(l.prov?' <em class="ds-tag">prix à confirmer</em>':'')+'</small></span><span class="ds-pr">'+eur(l.total)+'</span></button>'}).join('')+'</div>':'<p class="ds-note">Pas encore de ligne.'+(cote?' Touchez ＋ sur un produit, à droite.':'')+'</p>';
 if(!cote)h+='<button type="button" class="ds-btn cl" data-ds="ajout">＋ Ajouter une ligne</button>';
 if(S.lignes.length)h+='<p class="ds-note">Touchez une ligne pour changer la quantité, le prix ou l’enlever.</p>';
 h+='<label class="ds-titre">Le titre du devis <span>(facultatif)</span><input data-dsi="titre" value="'+esc(S.titre)+'" placeholder="Ex. : cloison du bureau" autocomplete="off"></label>';
 h+='</div><div class="ds-bas"><div class="ds-tot"><span>Total HT</span><b>'+eur(t)+'</b></div><button type="button" class="ds-btn'+(S.arme?' arme':'')+'" data-ds="creer"'+(S.lignes.length?'':' disabled')+'>'+(S.arme?'Oui, créer le devis':'Créer le devis')+'</button>'+(S.arme?'<button type="button" class="ds-lien" data-ds="desarme">Pas encore</button>':'<p class="ds-note c">Il ne part pas chez le client tant que vous ne l’envoyez pas.</p>')+'</div>';
 return h}

/* ---------- la fenêtre « Combien ? » ---------- */
var F=null;
function feuilleArt(a,i){var l=i!=null?S.lignes[i]:null;
 F={a:a,i:i,q:l?l.quantite:1,pu:l?l.pu:a?prixVente(a):0,lib:l?l.libelle:a?lisible(a.d):'',u:l?l.unite:a?unite(a):'u',edp:0,pu0:0,m2:a?m2par(a):(l&&l.m2u)||0,prov:l?l.prov:a&&a.provisoire,ic:l?l.ic:a?iconeFam(a.f,a.k):'',main:!a&&!(l&&l.base)};
 dessinerF()}
function dessinerF(){if(!F.pu0)F.pu0=F.pu;var a=F.a,man=F.main,tot=r2(F.q*F.pu);
 var h='<div class="ds-grab"></div>';
 if(man)h+='<div class="ds-fq">'+(F.i!=null?'La ligne':'Écrire ma ligne')+'</div><label class="ds-champ">Ce que vous faites ou fournissez<textarea data-dsf="lib" rows="2" placeholder="Ex. : Dépose de l’ancien placard">'+esc(F.lib)+'</textarea></label>';
 else h+='<div class="ds-row ds-fhd"><span class="ds-ic">'+(F.ic||'')+'</span><span class="ds-tx"><b>'+esc(F.lib)+'</b><small>'+esc(a?nomFour(a.four||'base')+(a.k==='prestation'?' · main-d’œuvre':''):'')+(F.prov?' <em class="ds-tag">prix à confirmer</em>':'')+'</small></span></div>';
 h+='<div class="ds-fq">Combien ?</div><div class="ds-st"><button type="button" class="ds-mb" data-ds="moins" aria-label="Un de moins">−</button><label class="ds-qv"><input data-dsf="q" inputmode="decimal" value="'+qf(F.q)+'" aria-label="Quantité"><small>'+(man?'':esc(pluriel(F.u,F.q)))+(F.m2?' · soit '+qf(r2(F.q*F.m2))+' m²':'')+'</small></label><button type="button" class="ds-mb" data-ds="plus" aria-label="Un de plus">＋</button></div>';
 if(man)h+='<div class="ds-2"><label class="ds-champ">Unité<input data-dsf="u" value="'+esc(F.u)+'" placeholder="m², u, h…"></label><label class="ds-champ">Prix de vente HT<input data-dsf="pu" inputmode="decimal" value="'+(F.pu?qf(F.pu):'')+'" placeholder="0,00"></label></div>';
 else h+='<div class="ds-ln"><span>Prix de vente HT</span>'+(F.edp?'<input class="ds-pin" data-dsf="pu" inputmode="decimal" value="'+qf(F.pu)+'">':'<b>'+eur(F.pu)+' <button type="button" class="ds-mod" data-ds="edp">Changer</button></b>')+'</div>'+
  (a&&a.k!=='prestation'&&!a.vos?'<div class="ds-ln s"><span>achat '+eur(a.pc)+(marge()?' + votre marge '+qf(marge())+' %':' (pas de marge réglée)')+'</span></div>':'');
 h+='<div class="ds-ln big"><span>Total de la ligne</span><b data-dst>'+eur(tot)+'</b></div>';
 h+='<button type="button" class="ds-btn" data-ds="okf">'+(F.i!=null?'Enregistrer':'Ajouter au devis')+'</button>';
 if(F.i!=null)h+='<button type="button" class="ds-lien rouge" data-ds="enlever">'+(F.arme?'Oui, enlever cette ligne':'Enlever cette ligne')+'</button>';
 else h+='<button type="button" class="ds-lien" data-ds="ferf">Annuler</button>';
 S.feuille=h;rendre();
 if(man&&!F.lib)setTimeout(function(){var t=ov.querySelector('[data-dsf="lib"]');if(t)t.focus()},250)}
function majTot(){var t=ov.querySelector('[data-dst]');if(t)t.textContent=eur(F.q*F.pu);var s=ov.querySelector('.ds-qv small');if(s&&!F.main)s.textContent=pluriel(F.u,F.q)+(F.m2?' · soit '+qf(r2(F.q*F.m2))+' m²':'')}
function okF(){var lib=String(F.lib||'').trim();
 if(!lib){toast('Il manque la description','Une ligne suffit.');return}
 if(!(F.q>0)||!(F.pu>0)){toast('Il manque la quantité ou le prix','Hors taxes, en euros.');return}
 var l={libelle:lib,quantite:r2(F.q),unite:String(F.u||'u').trim()||'u',pu:r2(F.pu),total:r2(F.q*F.pu),ic:F.ic,prov:!!F.prov&&r2(F.pu)===r2(F.pu0),m2u:F.m2,base:!F.main};
 if(F.i!=null){S.lignes[F.i]=l;S.ok='Ligne modifiée'}
 else{S.lignes.push(l);S.ok='Ajouté : '+lib+(l.quantite>1?' ('+qf(l.quantite)+' '+pluriel(l.unite,l.quantite)+')':'');
  if(F.main&&window.PCPROD&&PCPROD.ajouter&&!vosProduits().some(function(p){return sans(p.d)===sans(lib)}))try{PCPROD.ajouter({d:lib,u:l.unite,p:l.pu,t:'Ajouté par vous',k:'prestation'})}catch(e){}}
 S.arme=0;S.feuille=null;F=null;if(!large())S.etape=3;rendre();
 clearTimeout(okF.t);okF.t=setTimeout(function(){if(S&&S.ok){S.ok='';rendre()}},3500)}

/* ---------- les gestes ---------- */
function clic(e){var b=e.target.closest('[data-ds]');if(!b||!S)return;var a=b.getAttribute('data-ds'),id=b.getAttribute('data-id');
 if(a==='fermer'){if(S.lignes.length&&!S.armeF){S.armeF=1;b.classList.add('arme');toast('Fermer sans créer le devis ?','Touchez encore la croix pour fermer. Les lignes seront perdues.');setTimeout(function(){if(S)S.armeF=0;b.classList.remove('arme')},3500);return}fermer()}
 else if(a==='retour'){S.feuille=null;S.etape=S.etape===3?2:S.etape===2&&S.lignes.length?3:1;rendre()}
 else if(a==='client'){S.contact=id;var c=clients().filter(function(x){return x.id===id})[0];S.nom=c?c.n:nomDos(id);S.etape=S.lignes.length&&!large()?3:2;rendre()}
 else if(a==='nouvclient'){var X=window.PCX;if(X&&X.cf&&X.cf.nouveauClient){ov.hidden=true;document.body.style.overflow='';var garde=S;X.cf.nouveauClient(function(k){S=garde;S.contact=k;S.nom=nomDos(k)||'Nouveau client';S.etape=2;monter();rendre()})}}
 else if(a==='grp'){S.g=id;rendre();var l=ov.querySelector('.ds-liste');if(l)l.scrollTop=0}
 else if(a==='fam'){S.ouv[id]=!S.ouv[id];rendre()}
 else if(a==='tout'){S.tout[id]=1;rendre()}
 else if(a==='art'){var x=B.articles.concat(vosProduits()).filter(function(z){return z.c===id})[0];if(x)feuilleArt(x,null)}
 else if(a==='main')feuilleArt(null,null);
 else if(a==='ligne'){if(S.lignes[+id])feuilleArt(null,+id)}
 else if(a==='ajout'){S.etape=2;rendre()}
 else if(a==='ferf'){S.feuille=null;F=null;rendre()}
 else if(a==='moins'||a==='plus'){F.q=a==='plus'?r2(F.q+1):F.q>1?Math.max(1,r2(F.q-1)):F.q;var i=ov.querySelector('[data-dsf="q"]');if(i)i.value=qf(F.q);majTot()}
 else if(a==='edp'){F.edp=1;dessinerF();var p=ov.querySelector('[data-dsf="pu"]');if(p){p.focus();p.select()}}
 else if(a==='okf')okF();
 else if(a==='enlever'){if(!F.arme){F.arme=1;dessinerF();return}var x2=S.lignes.splice(F.i,1)[0];S.feuille=null;F=null;S.ok='Ligne enlevée : '+(x2&&x2.libelle);rendre()}
 else if(a==='creer')creer(b);
 else if(a==='desarme'){S.arme=0;rendre()}}
function saisie(e){var t=e.target,k=t.getAttribute('data-dsi'),f=t.getAttribute('data-dsf');if(!S)return;
 if(k==='q'||k==='qc'){S[k]=t.value;var z=ov.querySelector(k==='q'?'.ds-lb':'.ds-lc');if(z){z.innerHTML=k==='q'?listeBase():listeClients();z.scrollTop=0}}
 else if(k==='titre')S.titre=t.value;
 else if(f&&F){if(f==='q')F.q=nb(t.value);else if(f==='pu')F.pu=nb(t.value);else F[f]=t.value;if(f==='q'||f==='pu')majTot()}}
function creer(b){if(!S.contact){S.etape=1;rendre();toast('Pour qui ?','Choisissez le client.');return}
 if(!S.lignes.length){toast('Il manque les lignes','Ajoutez au moins une ligne.');return}
 if(!S.arme){S.arme=1;rendre();return}
 b.disabled=true;b.textContent='En cours…';var nom=S.nom;
 PCV.api('/espace/devis',{method:'POST',body:{contact:S.contact,main:true,titre:S.titre,lignes:{materiaux:[],main_oeuvre:S.lignes.map(function(l){return {libelle:l.libelle,quantite:l.quantite,unite:l.unite,total:l.total}})}}}).then(function(x){
  fermer();toast('Devis'+(x.devis&&x.devis.numero?' n° '+x.devis.numero:'')+' créé',nom+' · il vous attend dans ses documents, envoyez-le quand vous voulez.');if(PCV.apresDevis)PCV.apresDevis()},
  function(err){if(!S)return;S.arme=0;rendre();toast('Pas fait',err.message)})}
function toast(a,b){if(PCV.toast)PCV.toast(a,b)}
var lw=large();window.addEventListener('resize',function(){if(S&&large()!==lw){lw=large();if(!lw&&S.etape===2&&S.lignes.length)S.etape=3;rendre()}});

/* ---------- le style (N1 : bleu nuit pour agir, laiton seulement en touche) ---------- */
var css=document.createElement('style');css.textContent=[
'#dsv{position:fixed;inset:0;z-index:2147482000;background:var(--n1-bg,#ECEEF2);color:var(--n1-fg,#0E1322);font:15px/1.35 var(--f,Manrope,system-ui,sans-serif);-webkit-font-smoothing:antialiased}',
'#dsv[hidden]{display:none}#dsv *{box-sizing:border-box}#dsv button{font:inherit;color:inherit;border:0;background:none;cursor:pointer;text-align:left;-webkit-tap-highlight-color:transparent}',
'#dsv svg{width:22px;height:22px;stroke:currentColor;fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}',
'#dsv .ds-in{position:relative;height:100%;display:flex;flex-direction:column;max-width:640px;margin:0 auto;padding-top:env(safe-area-inset-top)}',
'#dsv .ds-2c{display:grid;grid-template-columns:1fr 1fr;height:100%;min-height:0}#dsv .ds-in:has(.ds-2c){max-width:none}',
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
'@media (hover:hover){#dsv .ds-row[data-ds]:hover,#dsv .ds-fh:hover{background:color-mix(in srgb,var(--n1-nuit,#1B2440) 4%,transparent)}}'
].join('\n');document.head.appendChild(css);

window.PCDS={ouvrir:ouvrirDevis};
})();
