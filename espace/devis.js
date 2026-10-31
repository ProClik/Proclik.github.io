/* Devis de l'Espace, refait à la demande de Cyril (31/10) : « l'artisan ne réfléchit pas ».
   Un petit menu à icônes : Pré-devis (à valider) · Attente fournisseur · Validés.
   Le pré-devis s'ouvre comme un devis qu'on travaille : le plan en tête, les lignes rangées pièce par pièce,
   un appui sur une ligne pour la changer ou l'enlever, « + Ajouter une ligne » (depuis la base ou à la main),
   et un seul gros bouton « Valider le pré-devis » qui demande un second appui (pas d'erreur sur téléphone).
   Plus de « Changer d'étape » : l'étape avance toute seule à chaque validation.
   Même éditeur pour un devis ou une facture faits à la main (window.PCX.nouveauDoc).
   Démo : clients fictifs, rien n'est envoyé ; VosFactures en coulisses dans la vraie appli. */
(function(){
"use strict";
var X=window.PCX;if(!X)return;
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
var esc=X.esc,r2=X.r2,D=X.D,DOS=X.DOS;
var eur=function(n){var s=Math.abs(n).toFixed(2).split('.');return (n<0?'− ':'')+s[0].replace(/\B(?=(\d{3})+(?!\d))/g,' ')+','+s[1]+' €'};
var num=function(s){var n=parseFloat(String(s==null?'':s).replace(/\s/g,'').replace(',','.'));return isFinite(n)?n:0};
var q2=function(n){return String(r2(n)).replace('.',',')};
var tva=function(n){return String(n).replace('.',',')+' %'};

/* ---------- icônes (même trait que le menu) ---------- */
var I=function(p){return '<svg viewBox="0 0 24 24" aria-hidden="true">'+p+'</svg>'};
var IC={pre:I('<path d="M13 21H6V3h8l4 4v4"/><path d="M14 3v4h4M9 9h4M9 13h3"/><path d="M19.5 13.5l-5.5 5.5-.6 2.6 2.6-.6 5.5-5.5z"/>'),
 four:I('<path d="M3 7h11v9H3z"/><path d="M14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/>'),
 val:I('<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 14l2 2 3.5-3.5"/>'),
 plus:I('<path d="M12 5v14M5 12h14"/>'),
 plan:I('<path d="M3 4h18v16H3z"/><path d="M3 12h8v8M11 4v5M15 12h6"/>'),
 cherche:I('<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>'),
 main:I('<path d="M4 20h4l11-11-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>'),
 env:I('<path d="M3 11l18-8-8 18-2-8z"/><path d="M11 13l10-10"/>')};
var BASEI=I('<path d="M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3z"/><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>');

/* ---------- votre base de prix (exemples : ouvrages déjà vus dans la démo, plus quelques-uns marqués « exemple ») ---------- */
var BASE0=[{c:'PLA-CLO',d:'Cloison sur ossature, une plaque par face',u:'m²',p:30.26,t:'Plâtrerie'},{c:'PLA-PORTE',d:'Intégration d\'un bâti de porte',u:'u',p:87,t:'Plâtrerie'},
 {c:'PLA-BJ',d:'Bandes et joints, prêt à peindre',u:'m²',p:10.95,t:'Plâtrerie'},{c:'FEN-POSE-RENO',d:'Pose de fenêtre en rénovation sur l\'ancien cadre',u:'u',p:202.5,t:'Menuiserie'},
 {c:'MO-H',d:'Main-d\'œuvre (heure)',u:'h',p:42,t:'Main-d\'œuvre'},{c:'SOL-POSE',d:'Pose de parquet flottant (main-d\'œuvre)',u:'m²',p:18,t:'Sols',ex:1},
 {c:'PRO-NET',d:'Protection et nettoyage du chantier',u:'forfait',p:120,t:'Divers',ex:1}];
var BASE=X.lsGet('pc-base1',null)||BASE0;
var CLIKY=true; /* Démo : l'option Cliky est active ; sans elle, le produit tapé reste dans ce devis seulement */

/* ---------- les pré-devis de la démo : pièces, plan, et un dossier en attente du fournisseur ---------- */
function prep(){
 D.forEach(function(d){(d.L||[]).forEach(function(l){if(!l.pc)l.pc=d.id==='0043'?'Séjour':/salle de bain/i.test(d.titre)?'Salle de bain':/garage/i.test(d.titre)?'Garage':'Séjour'})});
 var a=X.find('0044');if(a&&!a.plan)a.plan=1;
 if(!DOS.roche)DOS.roche={n:'Mme Roche',v:'Saint-Égrève',adr:'[adresse], Saint-Égrève',tel:'06 •• •• •• 71',t:'Parquet du salon et de la chambre',k:'devis',src:'Formulaire du site',dv:'0046',chat:[],ph:[],docs:[],hist:[['lun. 26/10','Demande reçue sur votre site, plan dessiné'],['mar. 27/10','Demande de prix envoyée par vous à Négoce Isère Matériaux']]};
 if(!X.find('0046'))D.push({id:'0046',client:'Mme Roche',ville:'Saint-Égrève',titre:'Parquet du salon et de la chambre',recu:'lun. 26/10',tva:10,statut:'four',marge:'v',dos:'roche',
  four:{n:'Négoce Isère Matériaux',env:'mar. 27/10',att:'réponse attendue sous 48 h'},
  ask:[['Travaux','Parquet flottant'],['Pièces','salon et chambre'],['Surface','environ 34 m² (plan du client)']],fil:[['lun. 26/10','Demande reçue sur votre site'],['mar. 27/10','Demande de prix envoyée au fournisseur']],
  L:[{c:'SOL-FOUR',d:'Parquet chêne contrecollé (prix fournisseur attendu)',u:'m²',q:22,p:0,step:1,pc:'Salon',v:'prix du fournisseur pas encore reçu'},{c:'SOL-POSE',d:'Pose de parquet flottant (main-d\'œuvre)',u:'m²',q:22,p:18,step:1,pc:'Salon'},
   {c:'SOL-FOUR',d:'Parquet chêne contrecollé (prix fournisseur attendu)',u:'m²',q:12,p:0,step:1,pc:'Chambre',v:'prix du fournisseur pas encore reçu'},{c:'SOL-POSE',d:'Pose de parquet flottant (main-d\'œuvre)',u:'m²',q:12,p:18,step:1,pc:'Chambre'}]});
}
prep();
function sauver(){if(X.saveD)X.saveD();if(X.renderList)try{X.renderList()}catch(e){}}

/* Où en est chaque devis */
var PRE=function(d){return d.statut==='todo'||d.statut==='warn'},FOUR=function(d){return d.statut==='four'},VAL=function(d){return /^(valide|sent|queued|signed)$/.test(d.statut)};
function validesTous(){var L=D.filter(VAL).map(function(d){return {id:d.id,cli:d.client,t:d.titre,ht:X.tot(d).ht,st:d.statut,d:d.signedAt?'signé '+d.signedAt.split(' à ')[0]:d.sentAt?'envoyé '+d.sentAt.split(' à ')[0]:'créé '+(d.recu||''),live:1}});
 var C=X.cf;if(C)(C.DVN||[]).slice().reverse().concat(C.DVX||[]).forEach(function(v){var o=DOS[v.cli];L.push({id:v.id,cli:o?o.n:v.cli,t:v.titre||(o&&o.t)||'',ht:v.ht,st:v.st==='signe'?'signed':v.st==='envoye'?'sent':'valide',d:v.d||'',cdv:1})});
 return L}
var STV={valide:['À envoyer','todo'],sent:['Envoyé','warn'],queued:['Hors réseau','grey'],signed:['Signé','ok']};

/* ---------- l'onglet ---------- */
var seg=null;
function vue(){var v=$('#v-devis');if(!v)return;var c=v.querySelector(':scope>.dv');if(!c){c=document.createElement('div');c.className='cf dv';v.appendChild(c)}
 if(document.documentElement.classList.contains('pcvrai')){c.innerHTML='';return}
 var P=D.filter(PRE),F=D.filter(FOUR),V=validesTous();if(!seg)seg=P.length?'pre':F.length?'four':'val';
 var p=P[0],big=p?['Vérifier le pré-devis','data-dvo="'+p.id+'"',IC.pre]:['Nouveau devis','data-dvnew',IC.plus];
 var h='<div class="row cf-top"><h2>Devis</h2><span class="cf-n">'+(P.length?P.length+' à valider':'tout est à jour')+'</span></div>'+
  '<div class="grid2"><div class="col">'+
  (p?'<div class="card cf-hero"><small>À valider ce soir</small><b>'+eur(X.tot(p).ht)+' <em>HT</em></b><span>'+esc(p.client)+' · '+esc(p.titre)+'</span></div>':'<div class="card cf-rien"><b>Aucun pré-devis à valider</b><span>Les demandes de vos clients arrivent ici, déjà calculées avec vos prix.</span></div>')+
  '<button class="btn go cf-go" type="button" '+big[1]+'><span class="lab"><span class="ic">'+big[2]+'</span><span>'+esc(big[0])+'</span></span></button>'+
  (p?'<div class="cf-main"><button type="button" class="btn sm" data-dvnew>'+IC.plus+'Nouveau devis à la main</button></div>':'')+
  '</div><div class="col">'+
  '<div class="seg cf-seg dv-seg" role="tablist" aria-label="Devis">'+[['pre','Pré-devis',P.length],['four','Fournisseur',F.length],['val','Validés',0]].map(function(s){return '<button role="tab" data-dvseg="'+s[0]+'" aria-selected="'+(seg===s[0])+'">'+IC[s[0]]+'<span>'+s[1]+'</span>'+(s[2]?'<i>'+s[2]+'</i>':'')+'</button>'}).join('')+'</div>';
 if(seg==='pre')h+=P.length?'<div class="sec-h"><h2>Pré-devis à valider</h2><span>préparés avec vos prix</span></div><div class="card lst cf-l">'+P.map(lignePre).join('')+'</div><p class="hint">Touchez un pré-devis pour l\'ouvrir : vous changez une ligne d\'un appui, puis vous validez.</p>':'<p class="hint">Rien à valider. Le café peut rester chaud.</p>';
 else if(seg==='four')h+=F.length?'<div class="sec-h"><h2>En attente du fournisseur</h2><span>les prix arrivent</span></div><div class="card lst cf-l">'+F.map(ligneFour).join('')+'</div><p class="hint">Dès que le fournisseur répond, '+(CLIKY?'Cliky reporte ses prix dans le pré-devis et':'vous reportez ses prix, puis')+' le pré-devis revient dans « Pré-devis ».</p>':'<p class="hint">Aucun devis n\'attend un fournisseur.</p>';
 else h+='<div class="sec-h"><h2>Devis validés</h2><span>du plus récent au plus ancien</span></div><div class="card lst cf-l">'+V.map(ligneVal).join('')+'</div><p class="hint">Un devis signé crée tout seul sa facture d\'acompte, dans Factures.</p>';
 h+='<span class="exemple">Exemples de démonstration · rien n\'est envoyé</span></div></div>';
 c.innerHTML=h;
 var b=$('#badge');if(b){b.textContent=P.length;b.hidden=!P.length}}
var AV=function(ic){return '<span class="cf-av cf-doc">'+ic+'</span>'};
function lignePre(d){return '<button class="cf-li" type="button" data-dvo="'+d.id+'">'+AV(IC.pre)+'<span class="tx"><b>'+esc(d.client)+' · '+esc(d.ville)+'</b><small>'+esc(d.titre)+' · '+esc(d.recu)+'</small></span><span class="cf-m"><b>'+eur(X.tot(d).ht)+'</b><span class="pill '+(d.statut==='warn'?'warn':'todo')+'">'+(d.statut==='warn'?'Prix changé':'À valider')+'</span></span></button>'}
function ligneFour(d){return '<button class="cf-li" type="button" data-dvo="'+d.id+'">'+AV(IC.four)+'<span class="tx"><b>'+esc(d.client)+' · '+esc(d.titre)+'</b><small>Demande envoyée à '+esc(d.four.n)+' · '+esc(d.four.env)+'</small></span><span class="cf-m"><span class="pill grey">Attente</span></span></button>'}
function ligneVal(v){var s=STV[v.st]||STV.valide;return '<button class="cf-li" type="button" '+(v.cdv?'data-cdv="'+esc(v.id)+'"':'data-dvo="'+esc(v.id)+'"')+'>'+AV(IC.val)+'<span class="tx"><b>Devis '+esc(v.id)+' · '+esc(v.cli)+'</b><small>'+esc(v.t)+(v.d?' · '+esc(v.d):'')+'</small></span><span class="cf-m"><b>'+eur(v.ht)+'</b><span class="pill '+s[1]+'">'+s[0]+'</span></span></button>'}

/* ---------- l'éditeur : un devis (pré-devis ou à la main) ou une facture à la main ---------- */
/* doc : {L:[{d,u,q,p,pc,v}], tva, ...} ; mode : 'pre' (un devis de la liste), 'devis' ou 'facture' (à la main) */
var CUR=null,ARME='';
function totaux(doc){var ht=0;doc.L.forEach(function(l){ht+=r2(l.q*l.p)});ht=r2(ht);var tv=r2(ht*doc.tva/100);return{ht:ht,tv:tv,ttc:r2(ht+tv)}}
function pieces(doc){var P=[];doc.L.forEach(function(l){var p=l.pc||'Ensemble';if(P.indexOf(p)<0)P.push(p)});return P}
function planMini(){return '<svg viewBox="0 0 120 80" aria-hidden="true" class="dv-mini"><g fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><path d="M4 4h112v72H4z"/><path d="M62 4v40M4 44h58M90 4v40M62 44h54M36 44v32"/></g><path d="M44 44h12" stroke="var(--cx)" stroke-width="3"/>'+
 '<g font-family="Manrope,sans-serif" font-weight="700" font-size="8" fill="currentColor" text-anchor="middle"><text x="33" y="27">Séjour</text><text x="76" y="27">Cuisine</text><text x="103" y="27">Ch. 2</text><text x="20" y="63">Ch. 1</text><text x="76" y="63">Salle d\'eau</text></g></svg>'}
function editeur(doc,mode,garder){CUR={doc:doc,mode:mode};var t=totaux(doc),fige=mode==='pre'&&!PRE(doc)&&!FOUR(doc),y=$('#x-in')?$('#x-in').scrollTop:0;
 var h='';
 if(mode!=='pre'){var K=Object.keys(DOS);h+='<div class="cf-form dv-qui"><label>Pour qui<select id="dv-c">'+K.map(function(k){return '<option value="'+k+'"'+(k===doc.cli?' selected':'')+'>'+esc(DOS[k].n)+'</option>'}).join('')+'</select></label>'+
  '<label>Les travaux, en une ligne<input id="dv-t" autocomplete="off" value="'+esc(doc.titre||'')+'" placeholder="'+(mode==='devis'?'Ex. : cloison du bureau':'Ex. : reprise d\'une fissure')+'"></label></div>';}
 if(mode==='pre'&&FOUR(doc))h+='<div class="card cf-ou dv-att"><small>En attente du fournisseur</small><b>Demande envoyée à '+esc(doc.four.n)+' · '+esc(doc.four.env)+'</b><span>'+esc(doc.four.att)+'. '+(CLIKY?'Cliky reportera ses prix ici dès sa réponse.':'Vous reporterez ses prix ici.')+'</span></div>';
 if(mode==='pre'&&doc.statut==='warn')h+='<div class="card cf-ou"><small>Le fournisseur a répondu</small><b>Un prix a changé : la ligne est marquée ⚠</b></div>';
 var plan='';if(mode==='pre'&&doc.plan)plan='<div class="card dv-plan"><div class="dv-plan-m">'+planMini()+'</div><div class="dv-plan-t"><b>Le plan de '+esc(doc.client)+'</b><small>Dessiné avec sa demande</small><button type="button" class="btn sm" data-openclient="1">'+IC.plan+'Ouvrir le plan</button></div></div>';
 h+='<div class="card dv-tot"><div><small>Total HT</small><b>'+eur(t.ht)+'</b></div><div><small>TVA '+tva(doc.tva)+'</small><span>'+eur(t.tv)+'</span></div><div><small>Total TTC</small><span>'+eur(t.ttc)+'</span></div></div>'+plan;
 if(mode!=='pre'||!fige)h+='<div class="dv-tva"><span>TVA</span><div class="seg" role="tablist">'+[5.5,10,20].map(function(n){return '<button type="button" role="tab" data-dvtva="'+n+'" aria-selected="'+(n===doc.tva)+'">'+tva(n)+'</button>'}).join('')+'</div></div>';
 var P=pieces(doc);
 h+=P.map(function(p){var L=[],s=0;doc.L.forEach(function(l,i){if((l.pc||'Ensemble')===p){L.push(i);s+=r2(l.q*l.p)}});
  return '<div class="xsec dv-pc">'+(P.length===1&&p==='Ensemble'?'':'<h3>'+esc(p)+' <small>'+eur(r2(s))+' HT</small></h3>')+'<div class="card lst cf-l">'+L.map(function(i){var l=doc.L[i];
   return '<button class="cf-li dv-li'+(l.v?' verif':'')+'" type="button" '+(fige?'disabled':'data-dvl="'+i+'"')+'><span class="tx"><b>'+esc(l.d)+'</b><small>'+q2(l.q)+' '+esc(l.u)+' × '+(l.p?eur(l.p):'prix à venir')+'</small>'+(l.v?'<small class="dv-v">⚠ '+esc(l.v)+'</small>':'')+'</span><span class="cf-m"><b>'+eur(r2(l.q*l.p))+'</b></span>'+(fige?'':'<span class="go">›</span>')+'</button>'}).join('')+'</div></div>'}).join('');
 if(!doc.L.length)h+='<div class="card cf-rien"><b>Pas encore de ligne</b><span>Ajoutez la première : depuis votre base de prix, ou écrite à la main.</span></div>';
 if(!fige)h+='<button type="button" class="btn dv-add" data-dvadd>'+IC.plus+'Ajouter une ligne</button>';
 if(mode==='pre'&&doc.ask)h+='<details class="card dv-ask"><summary>La demande du client <span>›</span></summary><div class="kv" style="margin-top:10px">'+doc.ask.map(function(a){return '<span>'+esc(a[0])+'</span><b>'+esc(a[1])+'</b>'}).join('')+'</div></details>';
 if(mode==='pre')h+='<p class="hint">🔒 Rien ne part chez le client sans vous. Une fois validé, le devis est créé dans vos documents ; vous l\'envoyez quand vous voulez.</p>';
 var titre=mode==='devis'?'Nouveau devis':mode==='facture'?'Nouvelle facture':(PRE(doc)||FOUR(doc)?'Pré-devis · ':'Devis '+doc.id+' · ')+doc.client,
  sous=mode==='pre'?doc.titre+' · '+doc.ville:mode==='devis'?'Fait à la main':'Pour un travail hors devis';
 X.xopen(titre,sous,h,pied(doc,mode),function(){var x=$('#x-in');if(garder&&x)x.scrollTop=y;var i=$('#dv-t');if(i)i.addEventListener('input',function(){doc.titre=i.value});var s=$('#dv-c');if(s)s.addEventListener('change',function(){doc.cli=s.value})});}
/* Le bas du panneau : un seul gros bouton, en deux appuis quand ça compte */
function pied(doc,mode){var a=function(k,t1,t2){var on=ARME===k+(doc.id||'');return on?'<button class="btn" data-dvarm="">Annuler</button><button class="btn go dv-arm" data-dvgo="'+k+'">'+t2+'</button>':'<button class="btn" data-xclose>Fermer</button><button class="btn go" data-dvarm="'+k+'">'+t1+'</button>'};
 if(mode==='devis')return a('creer','Créer le devis','Oui, créer le devis');
 if(mode==='facture')return a('fact','Préparer la facture','Oui, préparer la facture');
 if(FOUR(doc))return '<button class="btn" data-xclose>Fermer</button><button class="btn go" data-dvrep>Déposer la réponse</button>';
 if(PRE(doc))return a('valider','Valider le pré-devis','Oui, créer le devis');
 if(doc.statut==='valide')return a('envoyer','Envoyer au client','Oui, envoyer à '+doc.client);
 return '<button class="btn" data-xclose>Fermer</button><button class="btn go" data-share>Partager le PDF</button>';}

/* Une ligne : on la change, ou on l'enlève (deux appuis) */
function ligne(i){var doc=CUR.doc,l=doc.L[i],P=pieces(doc);if(!l)return;
 var h='<div class="cf-form"><label>Ce qui est fait<textarea id="dl-d" rows="2">'+esc(l.d)+'</textarea></label>'+
  '<div class="dl-q"><span>Quantité</span><div class="qty"><button type="button" data-dlq="-1" aria-label="Moins">−</button><input id="dl-q" inputmode="decimal" value="'+q2(l.q)+'" aria-label="Quantité"><button type="button" data-dlq="1" aria-label="Plus">+</button></div><input id="dl-u" class="dl-u" value="'+esc(l.u)+'" aria-label="Unité"></div>'+
  '<label>Prix unitaire HT<input id="dl-p" inputmode="decimal" value="'+(l.p?q2(l.p):'')+'" placeholder="0,00"></label>'+
  '<label>Pièce<select id="dl-pc">'+P.concat(P.indexOf('Ensemble')<0?['Ensemble']:[]).map(function(p){return '<option'+(p===(l.pc||'Ensemble')?' selected':'')+'>'+esc(p)+'</option>'}).join('')+'<option value="+">Autre pièce…</option></select></label>'+
  '<div class="card cf-ttc"><span>Total de la ligne</span><b id="dl-t">'+eur(r2(l.q*l.p))+'</b></div></div>';
 X.xopen('Modifier la ligne',l.pc||'',h,'<button class="btn" data-dlsup="'+i+'">Enlever</button><button class="btn go" data-dlok="'+i+'">Enregistrer</button>',function(){['#dl-q','#dl-p'].forEach(function(s){$(s).addEventListener('input',majL)});$('#dl-pc').addEventListener('change',autrePiece)},true);}
function majL(){var t=$('#dl-t');if(t)t.textContent=eur(r2(num($('#dl-q').value)*num($('#dl-p').value)))}
function autrePiece(){var s=$('#dl-pc'),n=$('#dl-pcn');if(s.value!=='+'){if(n)n.parentNode.remove();return}if(!n){s.parentNode.insertAdjacentHTML('afterend','<label>Nom de la pièce<input id="dl-pcn" autocomplete="off" placeholder="Ex. : Bureau"></label>');n=$('#dl-pcn')}n.focus()}
function ligneOk(i){var doc=CUR.doc,l=doc.L[i],d=$('#dl-d').value.trim();if(!d){$('#dl-d').focus();return}
 l.d=d;l.q=Math.max(0,r2(num($('#dl-q').value)));l.u=$('#dl-u').value.trim()||'u';l.p=r2(num($('#dl-p').value));var pc=$('#dl-pc').value,pn=$('#dl-pcn');l.pc=pc==='+'?(pn&&pn.value.trim()||l.pc):pc;if(l.p>0&&/prix.*fournisseur/i.test(l.v||''))delete l.v;
 fini('Ligne modifiée',l.d);}
function fini(t,s){if(CUR.mode==='pre')sauver();ARME='';editeur(CUR.doc,CUR.mode,true);vue();if(t)X.toast(t,s)}

/* Ajouter une ligne : chercher dans la base, ou l'écrire */
var filtre='';
function ajout(){var doc=CUR.doc,P=pieces(doc);
 var h='<label class="cf-cherche">'+IC.cherche+'<input type="search" id="db-q" placeholder="Chercher dans ma base : cloison, pose…" autocomplete="off" value="'+esc(filtre)+'" aria-label="Chercher dans ma base"></label>'+
  (P.length>1?'<div class="dl-pcs"><span>Dans</span><select id="db-pc">'+P.map(function(p){return '<option>'+esc(p)+'</option>'}).join('')+'</select></div>':'')+
  '<div class="card lst cf-l" id="db-l"></div>'+
  '<button type="button" class="btn dv-add" data-dbmain>'+IC.main+'Pas dans la liste ? L\'écrire à la main</button>';
 X.xopen('Ajouter une ligne','Depuis votre base de prix, ou à la main',h,'<button class="btn" data-dvback>Retour</button>',function(){var q=$('#db-q');q.addEventListener('input',function(){filtre=q.value.trim().toLowerCase();liste()});liste()},true);}
function liste(){var z=$('#db-l');if(!z)return;var L=BASE.filter(function(b){return !filtre||(b.d+' '+b.t+' '+b.c).toLowerCase().indexOf(filtre)>=0});
 z.innerHTML=L.length?L.map(function(b){return '<button class="cf-li dv-li" type="button" data-db="'+esc(b.c)+'">'+AV(BASEI)+'<span class="tx"><b>'+esc(b.d)+'</b><small>'+esc(b.t)+(b.ex?' · prix d\'exemple':'')+'</small></span><span class="cf-m"><b>'+eur(b.p)+'</b><small class="dv-u">/ '+esc(b.u)+'</small></span></button>'}).join(''):'<p class="hint" style="padding:12px 0">Rien de tel dans votre base. Écrivez-le à la main juste en dessous.</p>'}
function depuisBase(c){var b=BASE.filter(function(x){return x.c===c})[0],doc=CUR.doc;if(!b)return;var s=$('#db-pc'),pc=s?s.value:(pieces(doc)[0]||'Ensemble');
 doc.L.push({c:b.c,d:b.d,u:b.u,q:1,p:b.p,step:1,pc:pc});filtre='';if(CUR.mode==='pre')sauver();ligne(doc.L.length-1);}
function aLaMain(){var doc=CUR.doc,P=pieces(doc);
 var h='<div class="cf-form"><label>Ce qui est fait<textarea id="dm-d" rows="2" placeholder="Ex. : habillage du coffre de volet"></textarea></label>'+
  '<div class="dl-q"><span>Quantité</span><input id="dm-q" inputmode="decimal" value="1" aria-label="Quantité"><input id="dm-u" class="dl-u" value="u" aria-label="Unité"></div>'+
  '<label>Prix unitaire HT<input id="dm-p" inputmode="decimal" placeholder="0,00"></label>'+
  (P.length?'<label>Pièce<select id="dm-pc">'+P.map(function(p){return '<option>'+esc(p)+'</option>'}).join('')+'</select></label>':'')+
  '<p class="dp-opt"><b>'+(CLIKY?'Avec Cliky':'Option Cliky')+'</b> : '+(CLIKY?'ce produit entre aussi dans votre base de prix, pour les prochains devis.':'le produit tapé entrerait dans votre base. Sans l\'option, il reste dans ce document.')+'</p>'+
  '<p class="hint">Vous pouvez aussi dicter : touchez le micro.</p></div>';
 X.xopen('Ligne à la main','',h,'<button class="btn" data-dvback>Retour</button><button class="btn go" data-dmok>Ajouter</button>',function(){setTimeout(function(){var d=$('#dm-d');if(d&&!matchMedia('(pointer:coarse)').matches)d.focus()},200)},true);}
function aLaMainOk(){var doc=CUR.doc,d=$('#dm-d').value.trim(),p=r2(num($('#dm-p').value)),q=r2(num($('#dm-q').value))||1,u=$('#dm-u').value.trim()||'u',s=$('#dm-pc');
 if(!d){$('#dm-d').focus();X.toast('Il manque la description','Une ligne suffit : le client doit comprendre ce qu\'il paie.');return}
 if(!(p>0)){$('#dm-p').focus();X.toast('Il manque le prix','Le prix unitaire hors taxes, en euros.');return}
 doc.L.push({c:'MAIN',d:d,u:u,q:q,p:p,step:1,pc:s?s.value:'Ensemble'});
 if(CLIKY&&!BASE.some(function(b){return b.d.toLowerCase()===d.toLowerCase()})){BASE.push({c:'M'+Date.now().toString(36),d:d,u:u,p:p,t:'Ajouté par vous'});X.lsSet('pc-base1',BASE)}
 fini('Ligne ajoutée',CLIKY?'Et rangée dans votre base de prix.':'');}

/* Les gros boutons, en deux appuis */
function action(k){var doc=CUR.doc;ARME='';
 if(k==='valider'){doc.statut='valide';doc.recu=doc.recu||'';(doc.fil=doc.fil||[]).push(['à l\'instant','Pré-devis validé, devis créé']);sauver();seg='val';vue();X.xclose();X.toast('Devis '+doc.id+' créé','Démo : dans la vraie appli, il est créé dans VosFactures. Il part chez '+doc.client+' quand vous l\'envoyez.');}
 else if(k==='envoyer'){doc.statut='sent';doc.sentAt='à l\'instant';sauver();vue();X.xclose();X.toast('Devis '+doc.id+' envoyé à '+doc.client,'Démo : rien n\'est parti. En vrai, il le reçoit et le signe en ligne.');}
 else if(k==='creer'||k==='fact'){if(!doc.cli){X.toast('Pour qui ?','Choisissez le client.');return}
  if(!doc.L.length){X.toast('Il manque les lignes','Ajoutez au moins une ligne.');return}
  var o=DOS[doc.cli];
  if(k==='creer'){var id='M'+(D.filter(function(d){return /^M\d+$/.test(d.id)}).length+1);D.unshift({id:id,client:o.n,ville:o.v||'',titre:doc.titre||'Devis fait à la main',recu:'à l\'instant',tva:doc.tva,statut:'valide',marge:'v',dos:doc.cli,manuel:1,fil:[['à l\'instant','Devis fait à la main']],L:doc.L});sauver();seg='val';vue();X.xclose();X.toast('Devis '+id+' créé','Il vous attend dans Validés : envoyez-le quand vous voulez.');}
  else{if(X.cf&&X.cf.ajoutFacture)X.cf.ajoutFacture(doc.cli,doc.L.map(function(l){return [l.d+(l.q!==1?' ('+q2(l.q)+' '+l.u+' × '+eur(l.p)+')':''),r2(l.q*l.p)]}),doc.tva);X.xclose();X.toast('Facture préparée','Elle vous attend dans Factures, prête à vérifier et envoyer.');}}}
function reponse(){var doc=CUR.doc;doc.L.forEach(function(l){if(l.c==='SOL-FOUR'&&!l.p){l.p=r2(29.9*1.3);l.v='prix fournisseur reporté'+(CLIKY?' par Cliky':'')+' (exemple), à vérifier'}});doc.statut='warn';(doc.fil=doc.fil||[]).push(['à l\'instant','Réponse du fournisseur déposée']);sauver();seg='pre';vue();editeur(doc,'pre');
 X.toast('Réponse du fournisseur lue',(CLIKY?'Cliky a reporté les prix':'Les prix sont reportés')+'. Démo : prix d\'exemple, vérifiez puis validez.');}

/* Un devis ou une facture à la main, depuis n'importe où */
X.nouveauDoc=function(type,cli){ARME='';filtre='';editeur({cli:cli||Object.keys(DOS)[0],titre:'',tva:10,L:[]},type==='facture'?'facture':'devis');};
function ouvrir(id){var d=X.find(id);if(!d)return;ARME='';filtre='';editeur(d,'pre');}

/* ---------- clics ---------- */
document.addEventListener('click',function(e){
 /* Les anciens accès au pré-devis (accueil, fiche client, recherche) ouvrent maintenant ce panneau-ci */
 var o=e.target.closest&&e.target.closest('[data-open],[data-opendv]');
 if(o&&!document.documentElement.classList.contains('pcvrai')){var id=o.getAttribute('data-open')||o.getAttribute('data-opendv');if(X.find(id)){e.preventDefault();e.stopPropagation();X.go('devis');vue();ouvrir(id);return}}
 var b=e.target.closest&&e.target.closest('[data-dvo],[data-dvnew],[data-dvseg],[data-dvl],[data-dvadd],[data-dvtva],[data-dlq],[data-dlok],[data-dlsup],[data-db],[data-dbmain],[data-dmok],[data-dvback],[data-dvarm],[data-dvgo],[data-dvrep]');if(!b)return;
 var a=function(n){return b.getAttribute(n)};
 if(b.hasAttribute('data-dvo'))ouvrir(a('data-dvo'));
 else if(b.hasAttribute('data-dvnew'))X.nouveauDoc('devis');
 else if(b.hasAttribute('data-dvseg')){seg=a('data-dvseg');vue();}
 else if(b.hasAttribute('data-dvl'))ligne(+a('data-dvl'));
 else if(b.hasAttribute('data-dvadd'))ajout();
 else if(b.hasAttribute('data-dvtva')){CUR.doc.tva=+a('data-dvtva');fini();}
 else if(b.hasAttribute('data-dlq')){var q=$('#dl-q'),l=CUR.doc.L[+$('[data-dlok]').getAttribute('data-dlok')];q.value=q2(Math.max(0,num(q.value)+(+a('data-dlq'))*(l&&l.step||1)));majL();}
 else if(b.hasAttribute('data-dlok'))ligneOk(+a('data-dlok'));
 else if(b.hasAttribute('data-dlsup')){var i=+a('data-dlsup');if(b.classList.contains('arme')){var l2=CUR.doc.L.splice(i,1)[0];fini('Ligne enlevée',l2&&l2.d);}else{b.classList.add('arme');b.textContent='Oui, l\'enlever';}}
 else if(b.hasAttribute('data-db'))depuisBase(a('data-db'));
 else if(b.hasAttribute('data-dbmain'))aLaMain();
 else if(b.hasAttribute('data-dmok'))aLaMainOk();
 else if(b.hasAttribute('data-dvback')){filtre='';editeur(CUR.doc,CUR.mode,true);}
 else if(b.hasAttribute('data-dvarm')){ARME=a('data-dvarm')?a('data-dvarm')+(CUR.doc.id||''):'';$('#x-foot').innerHTML=pied(CUR.doc,CUR.mode);if(ARME&&navigator.vibrate)try{navigator.vibrate(12)}catch(_){}}
 else if(b.hasAttribute('data-dvgo'))action(a('data-dvgo'));
 else if(b.hasAttribute('data-dvrep'))reponse();
},true);
document.addEventListener('click',function(e){var t=e.target.closest&&e.target.closest('[role=tab][data-v="devis"]');if(t)vue()});
new MutationObserver(function(){vue()}).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
vue();
})();
