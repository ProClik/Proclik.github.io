/* Dépenses de l'Espace (demande de Cyril, 29/10) : toutes les dépenses au même endroit.
   Celles des chantiers (achats réels, factures fournisseurs rapprochées) et les frais de tous les jours (carburant, repas, outillage).
   Un seul gros bouton : « Ajouter une dépense ». Photo du ticket, ou on tape, ou on dicte.
   Espace de base : l'artisan tape ou dicte le montant. Option Cliky : le ticket photographié est lu tout seul.
   Une dépense rangée dans un chantier rejoint aussi son « Coût réel ». Démo : exemples fictifs, gardés sur l'appareil (pc-dep1).
   Retouches de Cyril (2/11) : le mois en cours en haut (flèches pour les mois précédents, total du mois en petit),
   « Ajouter une dépense » en premier, montant saisi HORS TAXES, blocs plus petits, « Tout voir » et « Comptable » en bas.
   Comptable (option) : le dossier du mois se clôture le dernier jour, toutes les dépenses et leurs photos rangées par chantier ;
   on peut ajouter un oubli, puis l'envoyer d'un appui. Un auto-entrepreneur sans comptable laisse l'option décochée. */
(function(){
"use strict";
var X=window.PCX;if(!X)return;
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
var esc=X.esc,r2=X.r2,CH=X.CH;
var eur=function(n){var s=Math.abs(n).toFixed(2).split('.');return (n<0?'− ':'')+s[0].replace(/\B(?=(\d{3})+(?!\d))/g,' ')+','+s[1]+' €'};
var num=function(s){var n=parseFloat(String(s||'').replace(/\s/g,'').replace(',','.'));return isFinite(n)?r2(n):0};
var fr=function(n){return n.toFixed(2).replace('.',',')};
var JM=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
var p2=function(n){return (n<10?'0':'')+n};
var isoJ=function(d){return d.getFullYear()+'-'+p2(d.getMonth()+1)+'-'+p2(d.getDate())};
var jourDe=function(j){var d=new Date(j+'T12:00:00');return isNaN(d)?'':d.toLocaleDateString('fr-FR',{weekday:'short'})+' '+d.getDate()+'/'+p2(d.getMonth()+1)};
var jour=function(){return jourDe(isoJ(new Date()))};
var moisDe=function(j){return String(j||'').slice(0,7)};
var nomMois=function(m){var a=m.split('-');return JM[+a[1]-1].charAt(0).toUpperCase()+JM[+a[1]-1].slice(1)+' '+a[0]};
var decaler=function(m,n){var a=m.split('-'),d=new Date(+a[0],+a[1]-1+n,1);return d.getFullYear()+'-'+p2(d.getMonth()+1)};
var finMois=function(m){var a=m.split('-');return new Date(+a[0],+a[1],0)};
var MOIS=moisDe(isoJ(new Date()));

/* ---------- icônes (même trait que le menu) ---------- */
var I=function(p){return '<svg viewBox="0 0 24 24" aria-hidden="true">'+p+'</svg>'};
var IC={photo:I('<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>'),
 plus:I('<path d="M12 5v14M5 12h14"/>'),
 liste:I('<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>'),
 compta:I('<path d="M6 3h12v18H6z"/><path d="M9 7h6M9 11h6M9 15h3"/><path d="M14 17l1.5 1.5L18 16"/>'),
 chantier:I('<path d="M3 20h18M6 20V10l6-4 6 4v10"/><path d="M10 20v-5h4v5"/>')};
/* Ce que c'est : cinq choix, pas un de plus */
var CAT={mat:['Matériaux',I('<path d="M3 8l9-4 9 4-9 4z"/><path d="M3 8v8l9 4 9-4V8"/><path d="M12 12v8"/>'),20],
 carb:['Carburant',I('<path d="M5 20V5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v15"/><path d="M4 20h11M7 8h5"/><path d="M14 10h2a2 2 0 0 1 2 2v4a1.5 1.5 0 0 0 3 0V8l-3-3"/>'),20],
 repas:['Repas',I('<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10"/><path d="M17 21V3c-2 1-3 4-3 7h3"/>'),10],
 outil:['Outillage',I('<path d="M14.5 6.5a4 4 0 0 0 5 5L12 19a2.1 2.1 0 0 1-3-3z"/><path d="M14.5 6.5l3-3a4 4 0 0 1-3 3z"/>'),20],
 autre:['Autre',I('<circle cx="6" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="18" cy="12" r="1.2"/>'),20]};
var ORD=['mat','carb','repas','outil','autre'];

/* ---------- les dépenses tapées, dictées ou photographiées (exemples fictifs) ---------- */
var DEP0=[
 {id:'d1',d:'jeu. 29/10',cat:'mat',ou:'Gedimat',ttc:23.80,tva:20,ch:null,src:'cliky',ranger:1,ph:1,lu:'Gedimat · 23,80 € TTC'},
 {id:'d2',d:'mar. 27/10',cat:'outil',ou:'Brico Dépôt, Échirolles',ttc:38.90,tva:20,ch:'lopez',src:'photo',ph:1},
 {id:'d3',d:'lun. 26/10',cat:'carb',ou:'Station du Versoud',ttc:72.40,tva:20,ch:null,src:'photo',ph:1},
 {id:'d4',d:'ven. 16/10',cat:'repas',ou:'Restaurant, Meylan',ttc:16.50,tva:10,ch:null,src:'voix'},
 {id:'d5',d:'mer. 14/10',cat:'carb',ou:'Station de Crolles',ttc:65.10,tva:20,ch:null,src:'photo',ph:1},
 {id:'d6',d:'jeu. 8/10',cat:'repas',ou:'Boulangerie, Crolles',ttc:11.20,tva:10,ch:null,src:'main'}];
var DEP=X.lsGet('pc-dep1',null)||DEP0;
/* Chaque dépense a sa vraie date (j, AAAA-MM-JJ) : les anciennes « jeu. 29/10 » sont relues une fois */
DEP.forEach(function(x){if(x.j)return;var m=/(\d{1,2})\/(\d{1,2})/.exec(x.d||''),n=new Date(),y=n.getFullYear();if(!m){x.j=isoJ(n);return}if(+m[2]>n.getMonth()+1)y--;x.j=y+'-'+p2(+m[2])+'-'+p2(+m[1])});
function save(){X.lsSet('pc-dep1',DEP)}
function dep(id){return DEP.filter(function(x){return x.id===id})[0]}
var ht=function(x){return x.ht!=null?r2(x.ht):r2(x.ttc/(1+x.tva/100))};
var lib=function(x){return x.ou||(x.cat?CAT[x.cat][0]:'Ticket à ranger')};

/* Une dépense rangée dans un chantier a sa ligne dans le « Coût réel » du chantier (montant HT), et on la retire si on la déplace */
function syncCH(x){Object.keys(CH).forEach(function(k){var c=CH[k];if(!c.reel)return;c.reel=c.reel.filter(function(r){return r[2]!==x.id})});
 if(x&&!x.del&&x.ch&&CH[x.ch]&&x.cat){CH[x.ch].reel=CH[x.ch].reel||[];CH[x.ch].reel.push([lib(x)+(x.cat==='mat'?'':' · '+CAT[x.cat][0].toLowerCase()),fr(ht(x)),x.id])}
 X.saveCH();}

/* Tout ce qui a été dépensé, quelle que soit la porte d'entrée : lignes des chantiers + dépenses ci-dessus */
function tout(){var L=[];
 Object.keys(CH).forEach(function(k){(CH[k].reel||[]).forEach(function(r,i){if(r[2])return;L.push({id:'c:'+k+':'+i,d:'',cat:'mat',ou:r[0],ht:num(r[1]),ch:k,src:'chantier'})})});
 DEP.forEach(function(x){if(!x.ranger)L.push({id:x.id,d:x.j?jourDe(x.j):x.d,j:x.j,cat:x.cat,ou:lib(x),ht:ht(x),ttc:x.ttc,ch:x.ch,src:x.src,x:x})});
 return L}
var somme=function(L){var t=0;L.forEach(function(x){t+=x.ht});return r2(t)};

/* ---------- l'écran ---------- */
function ligne(x,ici){var c=x.ch&&CH[x.ch];
 return '<button class="cf-li" type="button" data-dep="'+esc(x.id)+'"><span class="cf-av cf-doc">'+CAT[x.cat||'autre'][1]+'</span><span class="tx"><b>'+esc(x.ou)+'</b><small>'+esc([x.d||'achat du chantier',ici?'':c?c.n:'Frais généraux'].filter(Boolean).join(' · '))+'</small></span><span class="cf-m"><b>'+eur(x.ht)+'</b></span></button>'}
function duMois(L,m){return L.filter(function(x){return x.j&&moisDe(x.j)===m})}
function vue(){var vrai=document.documentElement.classList.contains('pcvrai'),T=tout(),L=duMois(T,MOIS),R=DEP.filter(function(x){return x.ranger}),auj=moisDe(isoJ(new Date()));
 var ch=L.filter(function(x){return x.ch}),fg=L.filter(function(x){return !x.ch});
 var h=(vrai?'<div class="vexemple"><b>Exemple</b> : vos vraies dépenses s\'afficheront ici dès le branchement. Vous pouvez déjà essayer, rien n\'est envoyé.</div>':'')+
  '<div class="dp-mois"><button type="button" class="dp-fl" data-depmois="-1" aria-label="Mois précédent">‹</button><div class="dp-mt"><b>'+nomMois(MOIS)+'</b><small>'+(L.length?eur(somme(L))+' HT · '+L.length+' dépense'+(L.length>1?'s':''):'aucune dépense')+(MOIS===auj?' · mois en cours':'')+'</small></div><button type="button" class="dp-fl" data-depmois="1" aria-label="Mois suivant"'+(MOIS>=auj?' disabled':'')+'>›</button></div>'+
  '<div class="grid2"><div class="col">'+
  '<button class="btn go cf-go" type="button" data-depadd><span class="lab"><span class="ic">'+IC.photo+'</span><span>Ajouter une dépense</span></span></button>'+
  '<p class="dp-aide">Une photo du ticket, ou le montant hors taxes tapé, ou dicté au micro. C\'est rangé.</p>'+
  (R.length?'<div class="sec-h dp-sh"><h2>À ranger</h2><span>il manque le chantier</span></div><div class="card lst cf-l dp-c">'+R.map(function(x){return '<button class="cf-li" type="button" data-depadd="'+x.id+'"><span class="cf-av cf-doc">'+IC.photo+'</span><span class="tx"><b>'+esc(x.lu||'Ticket photographié')+'</b><small>'+esc(x.j?jourDe(x.j):x.d)+(x.src==='cliky'?' · lu par Cliky':'')+'</small></span><span class="cf-m"><span class="pill todo">À ranger</span></span></button>'}).join('')+'</div>':'')+
  '</div><div class="col">';
 var K=Object.keys(CH).filter(function(k){return ch.some(function(x){return x.ch===k})});
 if(K.length)h+='<div class="sec-h dp-sh"><h2>Par chantier</h2><span>'+eur(somme(ch))+' HT</span></div><div class="card lst cf-l dp-c">'+K.map(function(k){var c=CH[k],s=somme(ch.filter(function(x){return x.ch===k})),tot=somme(T.filter(function(x){return x.ch===k})),p=c.prev||0,pc=p?Math.min(100,Math.round(tot/p*100)):0;
  return '<button class="cf-li dp-ch" type="button" data-depch="'+k+'"><span class="cf-av cf-doc">'+IC.chantier+'</span><span class="tx"><b>'+esc(c.n)+'</b>'+(p?'<span class="dp-bar'+(tot>p?' trop':'')+'"><i style="width:'+pc+'%"></i></span>':'')+'</span><span class="cf-m"><b>'+eur(s)+'</b></span></button>'}).join('')+'</div>';
 var C=ORD.map(function(k){return [k,fg.filter(function(x){return (x.cat||'autre')===k})]}).filter(function(z){return z[1].length});
 if(C.length)h+='<div class="sec-h dp-sh"><h2>Frais généraux</h2><span>'+eur(somme(fg))+' HT</span></div><div class="card lst cf-l dp-c">'+C.map(function(z){return '<button class="cf-li" type="button" data-depcat="'+z[0]+'"><span class="cf-av cf-doc">'+CAT[z[0]][1]+'</span><span class="tx"><b>'+CAT[z[0]][0]+'</b><small>'+z[1].length+' ticket'+(z[1].length>1?'s':'')+'</small></span><span class="cf-m"><b>'+eur(somme(z[1]))+'</b></span></button>'}).join('')+'</div>';
 if(!L.length)h+='<div class="card cf-rien"><b>Rien en '+JM[+MOIS.split('-')[1]-1]+' pour l\'instant</b><span>'+(MOIS===auj?'Le premier ticket du mois se range ici. Les mois précédents sont derrière la flèche ‹.':'Aucune dépense ce mois-là.')+'</span></div>';
 h+='<div class="cf-main dp-bas"><button type="button" class="btn sm" data-deptout>'+IC.liste+'Tout voir</button><button type="button" class="btn sm" data-depcompta>'+IC.compta+'Comptable</button></div>'+
  '<span class="exemple">Exemples de démonstration · montants fictifs</span></div></div>';
 var v=$('#v-depenses');if(!v)return;var c2=v.querySelector(':scope>.cf');if(!c2){c2=document.createElement('div');c2.className='cf';v.appendChild(c2)}c2.innerHTML=h;
 var b=$('#badge-d');if(b){b.textContent=R.length;b.hidden=!R.length}}

/* ---------- le dossier du comptable (option) ---------- */
var CPT=X.lsGet('pc-compta1',null)||{on:false,mail:'',env:{}};
function saveC(){X.lsSet('pc-compta1',CPT)}
function comptable(){var auj=moisDe(isoJ(new Date()));
 if(!CPT.on){X.xopen('Pour votre comptable','Une option, à cocher si vous en avez un',
  '<div class="card dp-cpt"><p>Le dernier jour du mois, ProClik prépare tout seul le <b>dossier de vos dépenses</b> : toutes les dépenses du mois, avec les photos des tickets et les factures en PDF, <b>rangées par chantier</b> (même si le chantier n\'est pas fini).</p><p>Vous vérifiez, vous ajoutez un oubli si besoin, puis vous l\'envoyez d\'un appui.</p></div>'+
  '<div class="cf-form"><label class="dp-chk"><input type="checkbox" id="cp-on"> <span>Préparer le dossier du comptable chaque mois</span></label>'+
  '<label>Adresse e-mail de votre comptable<input id="cp-m" type="email" inputmode="email" autocomplete="off" placeholder="comptable@exemple.fr" value="'+esc(CPT.mail)+'"></label></div>'+
  '<p class="hint">Auto-entrepreneur sans comptable ? Laissez décoché : vos dépenses restent rangées ici, mois par mois.</p>',
  '<button class="btn" data-xclose>Plus tard</button><button class="btn go" data-cpok>Enregistrer</button>',null,$('#xsheet').classList.contains('on'));return}
 var T=tout(),M=[];for(var i=0;i<6;i++){var m=decaler(auj,-i);if(i===0||duMois(T,m).length)M.push(m)}
 X.xopen('Pour votre comptable','Envoyé à '+(CPT.mail||'votre comptable'),
  '<div class="card lst cf-l">'+M.map(function(m){var L=duMois(T,m),f=finMois(m),en=m===auj;
   return '<button class="cf-li" type="button" data-cpm="'+m+'"><span class="cf-av cf-doc">'+IC.compta+'</span><span class="tx"><b>'+nomMois(m)+'</b><small>'+L.length+' dépense'+(L.length>1?'s':'')+' · '+eur(somme(L))+' HT</small></span><span class="cf-m"><span class="pill '+(CPT.env[m]?'ok':en?'grey':'todo')+'">'+(CPT.env[m]?'Envoyé':en?'Clôture le '+f.getDate()+'/'+p2(f.getMonth()+1):'Prêt à envoyer')+'</span></span></button>'}).join('')+'</div>'+
  '<p class="hint">Le dossier du mois se clôture tout seul le dernier jour au soir. Il attend votre appui pour partir.</p>',
  '<button class="btn" data-cpreg>Réglages</button><button class="btn go" data-xclose>Fermer</button>',null,$('#xsheet').classList.contains('on'));}
var ARMEC='';
function dossier(m){var L=duMois(tout(),m),auj=moisDe(isoJ(new Date())),en=m===auj,f=finMois(m);
 var G={};L.forEach(function(x){var k=x.ch||'';(G[k]=G[k]||[]).push(x)});var K=Object.keys(G).sort(function(a,b){return (a?0:1)-(b?0:1)});
 var ttc=0;L.forEach(function(x){ttc+=x.x?x.x.ttc:x.ht});
 var h='<div class="card dp-tot3"><div><small>Hors taxes</small><b>'+eur(somme(L))+'</b></div><div><small>TVA</small><span>'+eur(r2(ttc-somme(L)))+'</span></div><div><small>TTC</small><span>'+eur(r2(ttc))+'</span></div></div>'+
  (K.length?K.map(function(k){var c=k&&CH[k];return '<div class="xsec"><h3>'+(c?esc(c.n):'Frais généraux')+' <small>'+eur(somme(G[k]))+' HT</small></h3><div class="card lst cf-l dp-c">'+G[k].map(function(x){return ligne(x,1).replace('</b></span></button>','</b><small class="dp-pj">'+(x.x&&x.x.ph?'📷 photo':x.src==='chantier'?'facture du chantier':'sans photo')+'</small></span></button>')}).join('')+'</div></div>'}).join(''):'<p class="hint">Aucune dépense ce mois-là.</p>')+
  '<button type="button" class="btn dv-add" data-depadd="mois:'+m+'">'+IC.plus+'Ajouter un oubli dans '+JM[+m.split('-')[1]-1]+'</button>'+
  (CPT.env[m]?'<p class="hint">Envoyé le '+esc(CPT.env[m])+' à '+esc(CPT.mail)+'. Un oubli ajouté depuis partira dans le prochain envoi.</p>':en?'<p class="hint">Ce dossier se clôture tout seul le '+f.getDate()+'/'+p2(f.getMonth()+1)+' au soir. Ensuite, un appui suffit pour l\'envoyer.</p>':'');
 var arm=ARMEC===m;
 X.xopen('Dossier de '+nomMois(m).toLowerCase(),L.length+' dépense'+(L.length>1?'s':'')+' · rangées par chantier',h,
  en||CPT.env[m]?'<button class="btn go" data-xback2>Retour</button>':'<button class="btn" '+(arm?'data-cpann>Annuler':'data-xback2>Retour')+'</button><button class="btn go'+(arm?' dv-arm':'')+'" data-cpsend="'+m+'">'+(arm?'Oui, envoyer à '+esc(CPT.mail||'mon comptable'):'Envoyer au comptable')+'</button>',null,true);}

/* Une liste dans le panneau : un chantier, une catégorie, ou tout */
function liste(titre,sous,L,foot,ici){L=L.slice();
 X.xopen(titre,sous,(L.length?'<div class="card cf-ou"><small>Total HT</small><b>'+eur(somme(L))+'</b></div><div class="card lst cf-l">'+L.map(function(x){return ligne(x,ici)}).join('')+'</div>':'<p class="hint">Rien pour l\'instant.</p>'),foot||'<button class="btn" data-xclose>Fermer</button><button class="btn go" data-depadd>Ajouter</button>',null,$('#xsheet').classList.contains('on'));}

/* Fiche d'une dépense */
function fiche(id){var x=tout().filter(function(z){return z.id===id})[0];if(!x)return;var d=x.x,c=x.ch&&CH[x.ch];
 var h=(d&&d.ph?'<div class="dp-ph'+(d.img?'':' vide')+'">'+(d.img?'<img alt="Photo du ticket" src="'+d.img+'">':IC.photo+'<span>Photo du ticket</span>')+'</div>':'')+
  '<div class="card"><div class="kv"><span>Hors taxes</span><b>'+eur(x.ht)+'</b>'+(d?'<span>TVA '+String(d.tva).replace('.',',')+' %</span><b>'+eur(r2(d.ttc-x.ht))+'</b><span>Payé TTC</span><b>'+eur(d.ttc)+'</b>':'')+
  '<span>C\'est</span><b>'+CAT[x.cat||'autre'][0]+'</b><span>Pour</span><b>'+esc(c?c.n:'Frais généraux')+'</b>'+(x.d?'<span>Date</span><b>'+esc(x.d)+'</b>':'')+
  '<span>Ajoutée</span><b>'+({chantier:'depuis la fiche du chantier',photo:'en photo',cliky:'en photo, lue par Cliky',voix:'à la voix',main:'à la main'})[x.src]+'</b></div></div>'+
  (d?'<p class="hint">Gardée avec ses justificatifs pour votre comptable. La TVA récupérable se règle avec lui.</p>':'<p class="hint">Cette dépense vient du coût réel du chantier : elle se modifie depuis sa fiche.</p>');
 X.xopen(x.ou,eur(x.ht)+' HT'+(x.d?' · '+x.d:''),h,(d?'<button class="btn" data-depsup="'+d.id+'">Supprimer</button><button class="btn go" data-depadd="'+d.id+'">Modifier</button>':'<button class="btn" data-xclose>Fermer</button>'+(c?'<button class="btn go" data-depvoirch="'+x.ch+'">Voir le chantier</button>':'')),null,$('#xsheet').classList.contains('on'));}

/* ---------- ajouter (ou ranger, ou modifier) une dépense ---------- */
var F={};
function form(id){var pre=/^ch:/.test(id||'')?id.slice(3):null,mo=/^mois:/.test(id||'')?id.slice(5):null;if(pre||mo)id=null;var x=id&&dep(id);
 var jd=x&&x.j?x.j:mo?(mo===moisDe(isoJ(new Date()))?isoJ(new Date()):isoJ(finMois(mo))):isoJ(new Date());F={id:id||null,cat:x&&x.cat||null,tva:x?x.tva:20,img:x&&x.img||null,ph:x&&x.ph||0,src:x?x.src:'main'};
 var K=Object.keys(CH).filter(function(k){return CH[k].st!=='done'}).concat(Object.keys(CH).filter(function(k){return CH[k].st==='done'}));
 var h='<div class="cf-form dp-form">'+
  '<label class="dp-photo'+(F.img||F.ph?' on':'')+'" id="dp-photo"><input type="file" accept="image/*" capture="environment" id="dp-file" hidden>'+
   (F.img?'<img alt="" src="'+F.img+'">':'<span class="dp-pi">'+IC.photo+'</span>')+'<span class="dp-pt"><b>'+(F.img||F.ph?'Ticket en photo':'Prendre le ticket en photo')+'</b><small>'+(F.img||F.ph?'touchez pour la refaire':'ticket, facture, reçu')+'</small></span></label>'+
  (x&&x.ranger&&x.lu?'<div class="airead dp-lu">✓ Lu par Cliky : '+esc(x.lu)+'</div>':'')+
  '<label>Montant payé <small>hors taxes (HT)</small><input id="dp-m" inputmode="decimal" placeholder="0,00" autocomplete="off" value="'+(x&&x.ttc?fr(ht(x)):'')+'"></label>'+
  '<p class="dp-ttc" id="dp-ttc"></p>'+
  '<div class="dp-q"><span>C\'est…</span><div class="dp-cats">'+ORD.map(function(k){return '<button type="button" data-dpcat="'+k+'" aria-pressed="'+(F.cat===k)+'">'+CAT[k][1]+'<span>'+CAT[k][0]+'</span></button>'}).join('')+'</div></div>'+
  '<label>Pour quel chantier<select id="dp-ch"><option value="">Aucun : frais généraux</option>'+K.map(function(k){return '<option value="'+k+'"'+((x?x.ch:pre)===k?' selected':'')+'>'+esc(CH[k].n)+(CH[k].st==='done'?' (terminé)':'')+'</option>'}).join('')+'</select></label>'+
  '<label>Date<input id="dp-j" type="date" value="'+jd+'" max="'+isoJ(new Date())+'"></label>'+
  '<label>Où <small>facultatif</small><input id="dp-ou" autocomplete="off" placeholder="Ex. : Station du Versoud" value="'+esc(x&&x.ou||'')+'"></label>'+
  '<details class="dp-tva"><summary>TVA : <b id="dp-tv">'+String(F.tva).replace('.',',')+' %</b> · changer</summary><div class="seg" role="tablist">'+[0,5.5,10,20].map(function(t){return '<button type="button" role="tab" data-dptva="'+t+'" aria-selected="'+(t===F.tva)+'">'+String(t).replace('.',',')+' %</button>'}).join('')+'</div></details>'+
  '<p class="hint">Vous pouvez aussi dicter : touchez le micro, « 72 euros de gazole ».</p>'+
  '<div class="dp-opt">'+(window.PCTAG?PCTAG('cliky'):'<b>Option Cliky</b> ')+'Le ticket photographié est lu tout seul, montant et magasin remplis. Sans l\'option, vous tapez ou dictez le montant.</div></div>';
 X.xopen(x?(x.ranger?'Ranger le ticket':'Modifier la dépense'):'Ajouter une dépense',x&&x.ranger?'Il ne manque que le chantier':'Trois choses, et c\'est rangé',h,'<button class="btn" data-xclose>Annuler</button><button class="btn go" data-depok>Enregistrer</button>',function(){
  var f=$('#dp-file');if(f)f.addEventListener('change',function(){if(f.files&&f.files[0])photo(f.files[0])});
  var mm=$('#dp-m');if(mm)mm.addEventListener('input',majTtc);majTtc();
  if(!x){var m=$('#dp-m');if(m&&!matchMedia('(pointer:coarse)').matches)setTimeout(function(){m.focus()},250)}});}
function majTtc(){var z=$('#dp-ttc'),m=num(($('#dp-m')||{}).value);if(z)z.textContent=m>0?'Soit '+eur(r2(m*(1+F.tva/100)))+' TTC avec la TVA à '+String(F.tva).replace('.',',')+' %.':'Le montant HT est écrit sur le ticket, juste avant la TVA.'}
/* La photo est réduite (elle reste lisible) pour tenir sur l'appareil ; avec Cliky, le ticket est lu */
function photo(file){var r=new FileReader();r.onload=function(){var im=new Image();im.onload=function(){var k=Math.min(1,720/Math.max(im.width,im.height)),cv=document.createElement('canvas');cv.width=Math.round(im.width*k);cv.height=Math.round(im.height*k);cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);
  try{F.img=cv.toDataURL('image/jpeg',.62)}catch(e){F.img=null}F.ph=1;
  var l=$('#dp-photo');if(l){l.classList.add('on');var pi=l.querySelector('.dp-pi,img');if(pi)pi.outerHTML='<img alt="" src="'+(F.img||'')+'">';l.querySelector('.dp-pt b').textContent='Ticket en photo';l.querySelector('.dp-pt small').textContent='touchez pour la refaire'}
  if($('#dp-m')&&!$('#dp-m').value){var w=document.createElement('div');w.className='airead dp-lu';w.innerHTML='<span class="spin"></span>Cliky lit le ticket…';l.insertAdjacentElement('afterend',w);
   setTimeout(function(){if(!$('#dp-m'))return;$('#dp-m').value='19,83';majTtc();if(!$('#dp-ou').value)$('#dp-ou').value='Gedimat';choisir('mat');F.src='cliky';w.innerHTML='✓ Lu par Cliky. Démo : montant d\'exemple, vérifiez-le.'},1300)}};im.src=r.result};r.readAsDataURL(file);}
function choisir(k){F.cat=k;$$('[data-dpcat]').forEach(function(b){b.setAttribute('aria-pressed',String(b.dataset.dpcat===k))});
 if(!F.tvaMain){F.tva=CAT[k][2];majTva()}}
function majTva(){majTtc();var t=$('#dp-tv');if(t)t.textContent=String(F.tva).replace('.',',')+' %';$$('[data-dptva]').forEach(function(b){b.setAttribute('aria-selected',String(+b.dataset.dptva===F.tva))})}
function ok(){var m=num($('#dp-m').value);
 if(!(m>0)){$('#dp-m').focus();X.toast('Il manque le montant','Le montant hors taxes, écrit sur le ticket.');return}
 if(!F.cat){X.toast('C\'est quoi ?','Touchez Matériaux, Carburant, Repas, Outillage ou Autre.');return}
 var x=F.id&&dep(F.id),neuf=!x;if(neuf){x={id:'d'+Date.now().toString(36),d:jour(),src:F.ph?'photo':'main'};DEP.unshift(x)}
 var jj=($('#dp-j')||{}).value;x.j=/^\d{4}-\d\d-\d\d$/.test(jj||'')?jj:(x.j||isoJ(new Date()));x.d=jourDe(x.j);
 x.ht=m;x.ttc=r2(m*(1+F.tva/100));x.tva=F.tva;x.cat=F.cat;x.ch=$('#dp-ch').value||null;x.ou=$('#dp-ou').value.trim();x.ph=F.ph;if(F.src==='cliky')x.src='cliky';delete x.ranger;delete x.lu;
 if(F.img)x.img=F.img;
 try{save()}catch(e){delete x.img;save()}
 syncCH(x);var mo2=moisDe(x.j),dos=$('#xsheet').classList.contains('on')&&/^Dossier de/.test(($('#x-t')||{}).textContent||'');X.xclose();if(MOIS!==mo2&&!dos)MOIS=mo2;vue();if(dos){comptable();dossier(mo2)}
 X.toast(neuf?'Dépense ajoutée : '+eur(m)+' HT':'Dépense rangée',x.ch?'Rangée dans le chantier '+CH[x.ch].n+', son coût réel est à jour.':'Rangée dans les frais généraux.');}

/* ---------- clics ---------- */
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-dep],[data-depadd],[data-depok],[data-dpcat],[data-dptva],[data-depch],[data-depcat],[data-deptout],[data-depcompta],[data-depsup],[data-depvoirch],[data-depmois],[data-cpok],[data-cpm],[data-cpsend],[data-cpann],[data-cpreg],[data-xback2]');if(!b)return;
 var a=function(n){return b.getAttribute(n)};
 if(b.hasAttribute('data-dep'))fiche(a('data-dep'));
 else if(b.hasAttribute('data-depadd'))form(a('data-depadd'));
 else if(b.hasAttribute('data-depok'))ok();
 else if(b.hasAttribute('data-dpcat'))choisir(a('data-dpcat'));
 else if(b.hasAttribute('data-dptva')){F.tva=+a('data-dptva');F.tvaMain=1;majTva();}
 else if(b.hasAttribute('data-depch')){var k=a('data-depch'),c=CH[k];liste(c.n,(c.prev?'Prévu au devis : '+eur(c.prev)+' HT':'Dépenses du chantier'),tout().filter(function(x){return x.ch===k}),'<button class="btn" data-depvoirch="'+k+'">Le chantier</button><button class="btn go" data-depadd="ch:'+k+'">Ajouter</button>',1);}
 else if(b.hasAttribute('data-depcat')){var t=a('data-depcat');liste(CAT[t][0],'Frais généraux, hors chantier',tout().filter(function(x){return !x.ch&&(x.cat||'autre')===t}));}
 else if(b.hasAttribute('data-deptout'))liste('Dépenses de '+nomMois(MOIS).toLowerCase(),'Chantiers et frais généraux',duMois(tout(),MOIS).concat(tout().filter(function(x){return !x.j})));
 else if(b.hasAttribute('data-depcompta'))comptable();
 else if(b.hasAttribute('data-depmois')){var n2=decaler(MOIS,+a('data-depmois'));if(n2<=moisDe(isoJ(new Date()))){MOIS=n2;vue();}}
 else if(b.hasAttribute('data-cpok')){var on=$('#cp-on').checked,ml=$('#cp-m').value.trim();if(on&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ml)){$('#cp-m').focus();X.toast('Il manque l\'adresse','Celle de votre comptable, pour lui envoyer le dossier.');return}CPT.on=on;CPT.mail=ml;saveC();X.xclose();if(on){comptable();X.toast('C\'est réglé','Le dossier se préparera tout seul à la fin de chaque mois.')}else X.toast('Option non cochée','Vos dépenses restent rangées ici, mois par mois.');}
 else if(b.hasAttribute('data-cpreg')){var wason=CPT.on;CPT.on=false;comptable();CPT.on=wason;setTimeout(function(){var c=$('#cp-on');if(c)c.checked=wason},0);}
 else if(b.hasAttribute('data-cpm')){ARMEC='';dossier(a('data-cpm'));}
 else if(b.hasAttribute('data-cpann')){var m3=ARMEC;ARMEC='';X.xclose();comptable();dossier(m3);}
 else if(b.hasAttribute('data-cpsend')){var m4=a('data-cpsend');if(ARMEC!==m4){ARMEC=m4;X.xclose();comptable();dossier(m4);return}ARMEC='';CPT.env[m4]=new Date().toLocaleDateString('fr-FR');saveC();X.xclose();comptable();X.toast('Dossier de '+nomMois(m4).toLowerCase()+' envoyé','Démo : rien n\'est parti. En vrai, votre comptable reçoit le PDF et les photos.');}
 else if(b.hasAttribute('data-xback2')){ARMEC='';X.xclose();comptable();}
 else if(b.hasAttribute('data-depsup')){var x=dep(a('data-depsup'));if(x){DEP=DEP.filter(function(z){return z!==x});x.del=1;save();syncCH(x);}X.xclose();vue();X.toast('Dépense supprimée','Elle ne compte plus nulle part.');}
 else if(b.hasAttribute('data-depvoirch')){var c2=a('data-depvoirch');X.xclose();X.go('chantiers');X.showCh(c2);}
});
/* La dictée : une consigne d'exemple de plus, comme les autres */
if(X.VX)X.VX.push(['Dépense','J\'ai fait le plein : 68 euros de gazole.',function(){var x={id:'d'+Date.now().toString(36),d:jour(),j:isoJ(new Date()),cat:'carb',ou:'Carburant (dicté)',ttc:68,tva:20,ch:null,src:'voix'};DEP.unshift(x);save();MOIS=moisDe(x.j);X.go('depenses');vue();return['Dépense ajoutée : 68,00 € TTC','Carburant · rangée dans les frais généraux. Une photo du ticket ? Touchez la ligne.']}]);
/* À chaque ouverture de l'onglet, tout est à jour (un achat a pu être ajouté depuis un chantier) */
document.addEventListener('click',function(e){var t=e.target.closest&&e.target.closest('[role=tab][data-v="depenses"]');if(t)vue()});
new MutationObserver(function(){vue()}).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
vue();
})();
