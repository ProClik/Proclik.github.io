/* Clients et Factures de l'Espace (demande de Cyril, 29/10).
   Clients : la fiche de chaque client (appeler, itinéraire, où on en est, l'argent, ses documents).
   Factures (« Devis et factures ») : la facture prête à partir d'abord, un seul gros bouton, puis en attente, payées, devis, et les factures reçues des fournisseurs.
   Devis et factures passent par VosFactures (plateforme agréée) : branchement plus tard, ici tout est en démonstration, rien n'est envoyé.
   Vraies demandes (vrai.js) : l'onglet Clients montre les vrais clients tirés des demandes ; Factures reste un exemple signalé. */
(function(){
"use strict";
var X=window.PCX;if(!X)return;
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
var esc=X.esc,r2=X.r2,D=X.D,DOS=X.DOS,CH=X.CH;
/* Montants écrits comme sur l'accueil : « 2 760,00 € » (le français n'espace pas les milliers sous 10 000 par défaut) */
var eur=function(n){var s=Math.abs(n).toFixed(2).split('.');return (n<0?'− ':'')+s[0].replace(/\B(?=(\d{3})+(?!\d))/g,'\u00a0')+','+s[1]+'\u00a0€'};

/* ---------- deux clients de plus pour la démo (fictifs, comme les autres) ---------- */
if(!DOS.fabre)DOS.fabre={n:'M. Fabre',v:'Seyssinet-Pariset',adr:'[adresse], Seyssinet-Pariset',tel:'06 •• •• •• 54',t:'Doublage des chambres',k:'fini',src:'Recommandation',chat:[],ph:[],docs:[],
 hist:[['lun. 21/09','Devis 0035 signé en ligne'],['mar. 22/09','Facture d\'acompte envoyée'],['jeu. 24/09','Acompte reçu'],['ven. 9/10','Fin du chantier validée par vous'],['lun. 12/10','Facture finale envoyée (avec le supplément du coffre de volet)']]};
if(!DOS.rey)DOS.rey={n:'Boulangerie Rey',v:'Grenoble',adr:'[adresse], Grenoble',tel:'04 •• •• •• 19',t:'Faux plafond du fournil',k:'chantier',ch:'rey',src:'Téléphone',chat:[],ph:[],docs:[],
 hist:[['lun. 28/09','Devis 0034 signé'],['mar. 29/09','Acompte reçu'],['lun. 5 → mer. 7/10','Chantier'],['mer. 7/10','Facture finale envoyée'],['ven. 9/10','Tout est payé']]};

/* ---------- les devis (numéros de la démo) et les factures ---------- */
var DVX=[{id:'0037',cli:'alpes',ht:CH.alpes?CH.alpes.fin.ht:0,tva:20,st:'signe',d:'ven. 2/10'},{id:'0036',cli:'perrin',ht:2180,tva:5.5,st:'signe',d:'mer. 7/10'},
 {id:'0035',cli:'fabre',ht:3600,tva:10,st:'signe',d:'lun. 21/09',L:[{d:'Doublage isolant des deux chambres, plaques et bandes, prêt à peindre',u:'forfait',q:1,p:3600}]},{id:'0034',cli:'rey',ht:2870,tva:20,st:'signe',d:'lun. 28/09'}];
var FA0=[
 {id:'f1',cli:'lopez',ty:'ac',dv:'0042',L:[['Acompte de 30 % sur le devis 0042',r2(504.28*.3)]],tva:10,st:'pret',cree:'hier soir, 20 h 41'},
 {id:'f2',cli:'fabre',ty:'fin',dv:'0035',L:[['Doublage des chambres, selon le devis 0035',3600],['Supplément : habillage du coffre de volet, demandé sur place',240]],ac:1080,tva:10,st:'attente',env:'lun. 12/10',rel:'lundi 19/10'},
 {id:'f3',cli:'fabre',ty:'ac',dv:'0035',L:[['Acompte de 30 % sur le devis 0035',1080]],tva:10,st:'payee',env:'mar. 22/09',paye:'jeu. 24/09'},
 {id:'f4',cli:'alpes',ty:'ac',dv:'0037',L:[['Acompte de 30 % sur le devis 0037',582.93]],tva:20,st:'payee',env:'ven. 2/10',paye:'lun. 5/10'},
 {id:'f5',cli:'perrin',ty:'ac',dv:'0036',L:[['Acompte de 30 % sur le devis 0036',654.06]],tva:5.5,st:'payee',env:'mer. 7/10',paye:'jeu. 8/10'},
 {id:'f6',cli:'perrin',ty:'fin',dv:'0036',L:[['Isolation des combles, selon le devis 0036',2180]],ac:654.06,tva:5.5,st:'payee',env:'mar. 13/10',paye:'mar. 13/10'},
 {id:'f7',cli:'rey',ty:'ac',dv:'0034',L:[['Acompte de 30 % sur le devis 0034',861]],tva:20,st:'payee',env:'lun. 28/09',paye:'mar. 29/09'},
 {id:'f8',cli:'rey',ty:'fin',dv:'0034',L:[['Faux plafond du fournil, selon le devis 0034',2870]],ac:861,tva:20,st:'payee',env:'mer. 7/10',paye:'ven. 9/10'}];
var FA=X.lsGet('pc-fa1',null)||FA0;
var NEW=X.lsGet('pc-cl1',{});Object.keys(NEW).forEach(function(k){if(!DOS[k])DOS[k]=NEW[k]});
var DVN=X.lsGet('pc-dvn1',[]);
X.cf={FA:function(){return FA},RC:function(){return RC},ftot:function(f){return ftot(f)},nouveauClient:function(r){formClient(r)},ficheClient:function(k){fseg=null;if(DOS[k]&&!DOS[k].vrai)ficheClient(k);else ficheVraie(k)},DVX:DVX,DVN:DVN,ficheDv:function(id){ficheDv(id)},ajoutFacture:function(k,L,t){var f={id:'m'+Date.now().toString(36),cli:k,ty:'main',L:L,tva:t,st:'pret',cree:'à l\'instant'};FA.unshift(f);save();seg='fa';vueFactures();vueClients();}};
function save(){X.lsSet('pc-fa1',FA);X.lsSet('pc-cl1',NEW);X.lsSet('pc-dvn1',DVN);}
function fa(id){return FA.filter(function(f){return f.id===id})[0]}
function ftot(f){var t=0;f.L.forEach(function(l){t+=l[1]});t=r2(t);var ht=r2(t-(f.ac||0)),tv=r2(ht*f.tva/100);return{total:t,ht:ht,tv:tv,ttc:r2(ht+tv)}}
var TY={ac:'Facture d\'acompte',fin:'Facture finale',main:'Facture'};
var ST={pret:['À envoyer','todo'],attente:['Envoyée','warn'],payee:['Payée','ok']};
var tva=function(n){return String(n).replace('.',',')+' %'};

/* ---------- icônes (même trait que le menu) ---------- */
var I=function(p){return '<svg viewBox="0 0 24 24" aria-hidden="true">'+p+'</svg>'};
var IC={fact:I('<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/>'),
 env:I('<path d="M3 11l18-8-8 18-2-8z"/><path d="M11 13l10-10"/>'),
 plus:I('<path d="M12 5v14M5 12h14"/>'),
 tel:I('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>'),
 sms:I('<path d="M4 5h16v11H9l-5 4z"/>'),
 route:I('<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h6a4 4 0 0 0 0-8h-4a4 4 0 0 1 0-8h6"/>'),
 cherche:I('<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>'),
 perso:I('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/><path d="M19 3v4M17 5h4"/>'),
 acompte:I('<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5V12h8.5"/>'),
 recue:I('<path d="M3 13h5l2 3h4l2-3h5"/><path d="M3 13l3-8h12l3 8v6H3z"/>'),
 poub:I('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/><path d="M10 11v6M14 11v6"/>')};
/* Écusson au trait laiton, coche et petit ruban tricolore (même dessin que le site) */
var ECU='<svg class="ecu" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8l7 2.8v5.2c0 4.6-3 8.1-7 10.4-4-2.3-7-5.8-7-10.4V5.6z"/><path d="M8.8 11.6l2.3 2.3 4.3-4.6"/><g stroke="none"><rect x="8.9" y="16.9" width="2.1" height="1.3" rx=".3" fill="#2B4C9B"/><rect x="11" y="16.9" width="2" height="1.3" fill="#E9ECF2"/><rect x="13" y="16.9" width="2.1" height="1.3" rx=".3" fill="#C8463C"/></g></svg>';

/* ---------- clients ----------
   Demande de Cyril (2/11) : plus de grandes listes. Un menu à icônes comme les Factures (Tous · À suivre · Pros),
   une ligne par client ; la fiche montre ses coordonnées, les boutons Appeler / SMS / Mail / Itinéraire,
   puis un menu Pré-devis · Devis validés · Factures (acomptes compris). */
var ORDRE=['durand','martin','lopez','fabre','garcia','bernard','alpes','tilleuls','perrin','rey'];
function cles(){var sup=X.lsGet('pc-cl-sup',[])||[],k=ORDRE.filter(function(x){return DOS[x]});Object.keys(NEW).forEach(function(x){if(k.indexOf(x)<0)k.unshift(x)});return k.filter(function(x){return sup.indexOf(x)<0})}
function init(n){var w=String(n).replace(/^(M\.|Mme|Mlle|SCI|SARL|SAS)\s+/i,'').split(/\s+/).filter(function(x){return x&&!/^(les?|la|des|de|du)$/i.test(x)});return ((w[0]||'?').charAt(0)+(w[1]?w[1].charAt(0):'')).toUpperCase()}
var RXPRO=/^(SCI|SARL|SAS|SASU|EURL|SA|Cabinet|Boulangerie|Société|Entreprise|Garage|Restaurant|Mairie|Copropriété)\b/i;
function estPro(o){return o.type?o.type==='pro':RXPRO.test(o.n||'')}
function avc(c){var s=0;c.ouv.forEach(function(o){s+=o[1]*o[2]/100});return Math.round(s)}
function faDe(k){return FA.filter(function(f){return f.cli===k})}
function dvDe(k){var L=[];D.forEach(function(d){if(DOS[k]&&DOS[k].dv===d.id)L.push({id:d.id,ht:X.tot(d).ht,st:d.statut==='signed'?'signe':d.statut==='sent'?'envoye':'avalider',d:d.signedAt||d.sentAt||d.recu,live:true})});
 DVX.forEach(function(v){if(v.cli===k)L.push(v)});DVN.forEach(function(v){if(v.cli===k)L.push(v)});return L}
function reste(k){var r=0;faDe(k).forEach(function(f){if(f.st==='attente')r+=ftot(f).ht});return r2(r)}
/* Où on en est, en une ligne, et ce qu'il y a à faire */
function etat(k){var o=DOS[k],d=o.dv&&X.find(o.dv),p=faDe(k).filter(function(f){return f.st==='pret'})[0],r=reste(k),c=o.ch&&CH[o.ch];
 if(p)return [TY[p.ty]+' à envoyer',1];
 if(d&&d.statut==='todo')return ['Pré-devis à valider · '+eur(X.tot(d).ht)+' HT',1];
 if(d&&d.statut==='warn')return ['Pré-devis à revoir : un prix fournisseur a changé',1];
 if(d&&d.statut==='sent')return ['Devis '+d.id+' envoyé'+(d.expire?' · expire mercredi':''),1];
 if(r)return [eur(r)+' HT à encaisser',1];
 if(o.k==='visite')return [k==='bernard'?'Visite aujourd\'hui à 14 h':'Visite proposée',1];
 if(c&&c.st==='run')return ['Chantier en cours · '+avc(c)+' %',0];
 if(c&&c.st==='start')return ['Chantier prévu le '+c.dates.split('→')[0].trim(),0];
 if(o.nouveau)return ['Nouveau client',0];
 return ['Terminé · tout est payé',0];}
var ICP={tous:I('<circle cx="9" cy="8" r="3.5"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.6a6 6 0 0 1 3 5.4"/>'),
 suivre:I('<path d="M6 21V4"/><path d="M6 4h11l-2 4 2 4H6"/>'),
 pro:I('<path d="M4 21V6l8-3v18M12 9h8v12"/><path d="M7 9h2M7 13h2M7 17h2M15 13h2M15 17h2"/>'),
 mail:I('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5l8.5 6.5 8.5-6.5"/>'),
 ok:I('<path d="M5 12l5 5 9-10"/>'),
 kbis:I('<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4"/><path d="M12 11v6M9 14l3-3 3 3"/>')};
function avatar(o){return '<span class="cf-av'+(estPro(o)?' cf-doc':'')+'">'+(estPro(o)?ICP.pro:esc(init(o.n)))+'</span>'}
function ligneCli(k){var o=DOS[k],e=etat(k);
 return '<button class="cf-li" type="button" data-cli="'+k+'">'+avatar(o)+'<span class="tx"><b>'+esc(o.n)+'</b><small>'+esc(o.v||'')+(o.t?' · '+esc(o.t):'')+'</small><small class="cf-et'+(e[1]?' on':'')+'">'+esc(e[0])+'</small></span><span class="go">›</span></button>'}
var filtre='',cseg='tous';
function menuClients(n){return '<div class="seg cf-seg dv-seg cl-seg" role="tablist" aria-label="Clients">'+[['tous','Tous'],['suivre','À suivre'],['pro','Pros']].map(function(x){
  return '<button role="tab" data-clseg="'+x[0]+'" aria-selected="'+(cseg===x[0])+'">'+ICP[x[0]]+'<span>'+x[1]+'</span>'+(n[x[0]]?'<i class="cl-nb'+(x[0]==='suivre'?' on':'')+'">'+n[x[0]]+'</i>':'')+'</button>'}).join('')+'</div>'}
function enTete(n,txt){return '<div class="row cf-top"><h2>Clients</h2><span class="cf-n">'+txt+'</span></div>'+
 '<button class="btn go cf-go" type="button" data-cadd><span class="lab"><span class="ic">'+IC.perso+'</span><span>Ajouter un client</span></span></button>'+
 menuClients(n)+'<label class="cf-cherche">'+IC.cherche+'<input type="search" id="cf-q" placeholder="Nom, ville ou travaux" autocomplete="off" value="'+esc(filtre)+'" aria-label="Chercher un client"></label>'}
var AIDE={tous:'Tous vos clients, de A à Z. Chaque demande du site, du chatbot ou du téléphone crée la fiche toute seule.',suivre:'Les clients pour qui il y a quelque chose à faire : un pré-devis, une facture, une réponse à attendre.',pro:'Entreprises, commerces, syndics : les clients professionnels.'};
function vueClients(){var vrai=document.documentElement.classList.contains('pcvrai');
 if(vrai)return clientsVrais();
 var tous=cles(),nom=function(x){return DOS[x].n.replace(/^(M\.|Mme)\s+/,'')};
 var n={tous:tous.length,suivre:tous.filter(function(k){return etat(k)[1]}).length,pro:tous.filter(function(k){return estPro(DOS[k])}).length};
 var K=tous.filter(function(k){return cseg==='suivre'?etat(k)[1]:cseg==='pro'?estPro(DOS[k]):1}).filter(function(k){var o=DOS[k];return !filtre||(o.n+' '+(o.v||'')+' '+(o.t||'')).toLowerCase().indexOf(filtre)>=0});
 if(cseg!=='suivre')K.sort(function(x,y){return nom(x).localeCompare(nom(y),'fr')});
 var h='<div class="cl">'+enTete(n,tous.length+' clients')+
  (K.length?'<div class="card lst cf-l">'+K.map(ligneCli).join('')+'</div>':'<p class="hint">'+(filtre?'Personne ne s\'appelle comme ça… pour l\'instant.':cseg==='suivre'?'Rien à suivre : tout le monde est servi.':'Aucun client ici pour l\'instant.')+'</p>')+
  '<p class="hint">'+AIDE[cseg]+'</p><span class="exemple">Clients fictifs de démonstration</span></div>';
 poser('#v-clients',h);ecoute();}
function ecoute(){var q=$('#cf-q');if(q)q.addEventListener('input',function(){filtre=q.value.trim().toLowerCase();var p=q.selectionStart;vueClients();var n=$('#cf-q');n.focus();try{n.setSelectionRange(p,p)}catch(e){}});}

/* Vraies demandes : un client par contact (demandes GHL + clients VosFactures + clients ajoutés ici) ; toucher un client ouvre SA FICHE, plus la page du pré-devis */
var KVC='pc-vrai-clients';
function lsJ(k){try{return JSON.parse(localStorage.getItem(k)||'null')}catch(e){return null}}
function lsW(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
var VC={},vcCharge=0;
function vraisClients(){var L=lsJ('pc-vrai-liste'),M={},out=[],sup=lsJ('pc-cl-supv')||[];
 (lsJ(KVC)||[]).forEach(function(c){if(c.contact)M[c.contact]=Object.assign({},c)});
 ((L&&L.demandes)||[]).forEach(function(d){var k=d.contact;if(!k)return;var c=M[k]||(M[k]={contact:k,nom:d.client});c.nom=c.nom||d.client;
  if(!c.demande){c.demande=d.resume||d.titre||'';c.etape=d.etape||'';c.suivre=1}});
 Object.keys(M).forEach(function(k){if(sup.indexOf(k)<0)out.push(M[k])});VC=M;return {liste:out,charge:!!L};}
function chargerVC(){var V=window.PCV;if(!V||!V.api||Date.now()-vcCharge<60000)return;vcCharge=Date.now();
 V.api('/espace/clients').then(function(x){var loc=(lsJ(KVC)||[]).filter(function(c){return c.ici}),M={};
  (x.clients||[]).forEach(function(c){if(c.contact)M[c.contact]=c});loc.forEach(function(c){if(!M[c.contact])M[c.contact]=c});
  lsW(KVC,Object.keys(M).map(function(k){return M[k]}));if($('#v-clients .cl'))clientsVrais()},function(){});}
function ligneVC(c){var o={n:c.nom,type:c.type};
 return '<button class="cf-li" type="button" data-cvf="'+esc(c.contact)+'">'+avatar(o)+'<span class="tx"><b>'+esc(c.nom)+'</b><small>'+esc([c.ville,c.demande].filter(Boolean).join(' · '))+'</small>'+(c.etape?'<small class="cf-et on">'+esc(c.etape)+'</small>':'')+'</span><span class="go">›</span></button>'}
function clientsVrais(){chargerVC();var R=vraisClients(),C=R.liste;
 var n={tous:C.length,suivre:C.filter(function(c){return c.suivre}).length,pro:C.filter(function(c){return c.type==='pro'}).length};
 var K=C.filter(function(c){return cseg==='suivre'?c.suivre:cseg==='pro'?c.type==='pro':1}).filter(function(c){return !filtre||((c.nom||'')+' '+(c.ville||'')+' '+(c.demande||'')).toLowerCase().indexOf(filtre)>=0})
  .sort(function(x,y){return String(x.nom||'').replace(/^(M\.|Mme)\s+/,'').localeCompare(String(y.nom||'').replace(/^(M\.|Mme)\s+/,''),'fr')});
 var h='<div class="cl">'+enTete(n,R.charge?C.length+' client'+(C.length>1?'s':''):'Chargement…')+
  (K.length?'<div class="card lst cf-l">'+K.map(ligneVC).join('')+'</div>':(R.charge?'<p class="hint">'+(filtre?'Personne ne s\'appelle comme ça… pour l\'instant.':'Aucun client ici pour l\'instant.')+'</p>':''))+
  '<p class="hint">'+AIDE[cseg]+' Les clients ajoutés ici sont créés aussi dans VosFactures.</p></div>';
 poser('#v-clients',h);ecoute();}
function poser(sel,h){var v=$(sel);if(!v)return;var c=v.querySelector(':scope>.cf');if(!c){c=document.createElement('div');c.className='cf';v.appendChild(c)}c.innerHTML=h}

/* ---------- la fiche d'un client ---------- */
var fseg=null;
function telLien(t){var s=String(t||'').replace(/[^\d+]/g,'');return s.length>=6?s:''}
function actions(o){var t=telLien(o.tel),m=o.mail,adr=o.adr||[o.rue,o.cp,o.v].filter(Boolean).join(' '),demo=!o.vrai&&o.tel&&!t;
 var b=function(on,href,ic,txt,attr){if(demo&&/^(tel|sms):/.test(href))return '<button type="button" class="btn sm" data-'+(href.charAt(0)==='t'?'call':'sms')+'>'+ic+'<span>'+txt+'</span></button>';return on?'<a class="btn sm" href="'+href+'"'+(attr||'')+'>'+ic+'<span>'+txt+'</span></a>':'<button type="button" class="btn sm" disabled>'+ic+'<span>'+txt+'</span></button>'};
 return '<div class="cf-act cl-act">'+b(t,'tel:'+t,IC.tel,'Appeler')+b(t,'sms:'+t,IC.sms,'SMS')+b(m,'mailto:'+encodeURIComponent(m||''),ICP.mail,'Mail')+
  /* Itinéraire : le choix du GPS (Google Maps, Waze, Plans) s'ouvre, gps.js */
  (adr?'<button type="button" class="btn sm" data-gps="'+esc(adr+(o.cp?'':', Isère'))+'">'+IC.route+'<span>Itinéraire</span></button>':'<button type="button" class="btn sm" disabled>'+IC.route+'<span>Itinéraire</span></button>')+'</div>'}
function coord(o){var adr=o.adr||[o.rue,[o.cp,o.v].filter(Boolean).join(' ')].filter(Boolean).join(', ');
 return '<div class="card cl-fiche">'+avatar(o)+'<div class="cl-id"><b>'+esc(o.n)+'</b><span class="pill grey">'+(estPro(o)?'Professionnel':'Particulier')+'</span></div>'+
  '<div class="kv">'+(o.entreprise&&o.entreprise!==o.n?'<span>Entreprise</span><b>'+esc(o.entreprise)+'</b>':'')+(estPro(o)&&(o.prenom||o.nom)?'<span>Contact</span><b>'+esc([o.prenom,o.nom].filter(Boolean).join(' '))+'</b>':'')+
  '<span>Adresse</span><b>'+esc(adr||'—')+'</b><span>Téléphone</span><b>'+esc(o.tel||'—')+'</b><span>E-mail</span><b>'+esc(o.mail||'—')+'</b>'+
  (o.siret?'<span>SIRET</span><b>'+esc(o.siret)+'</b>':'')+(o.kbis?'<span>Kbis</span><b>'+(/^https:/.test(o.kbis)?'<a href="'+esc(o.kbis)+'" target="_blank" rel="noopener">Voir le Kbis</a>':esc(o.kbis))+'</b>':'')+'</div></div>'+actions(o)}
function menuFiche(n,sel){sel=sel||fseg;return '<div class="seg cf-seg dv-seg cl-seg" role="tablist" aria-label="Documents du client">'+[['pre','Pré-devis',I('<path d="M13 21H6V3h8l4 4v4"/><path d="M14 3v4h4M9 9h4M9 13h3"/><path d="M19.5 13.5l-5.5 5.5-.6 2.6 2.6-.6 5.5-5.5z"/>')],['dv','Devis validés',ICP.ok],['fa','Factures',IC.fact]].map(function(x){
  return '<button role="tab" data-cfseg="'+x[0]+'" aria-selected="'+(sel===x[0])+'">'+x[2]+'<span>'+x[1]+'</span>'+(n[x[0]]?'<i class="cl-nb">'+n[x[0]]+'</i>':'')+'</button>'}).join('')+'</div>'}
var FK=null;
function ficheClient(k,keep){var o=DOS[k];if(!o)return;FK=k;var F=faDe(k),V=dvDe(k),e=etat(k);
 var P=V.filter(function(v){return v.st==='avalider'||v.st==='brouillon'}),S=V.filter(function(v){return v.st==='signe'||v.st==='envoye'});
 if(!fseg)fseg=P.length?'pre':S.length?'dv':F.length?'fa':'pre';
 var corps;
 if(fseg==='pre')corps=P.length?'<div class="card lst cf-l">'+P.map(function(v){return ligneDv(v,1)}).join('')+'</div>':'<div class="card cf-rien"><b>Aucun pré-devis en cours</b><span>Quand le client remplit le formulaire, Cliky prépare son pré-devis ici. Vous pouvez aussi faire un devis à la main.</span></div>';
 else if(fseg==='dv')corps=S.length?'<div class="card lst cf-l">'+S.map(function(v){return ligneDv(v,1)}).join('')+'</div>':'<div class="card cf-rien"><b>Aucun devis validé</b><span>Un pré-devis validé devient un devis, il arrive ici.</span></div>';
 else corps=F.length?'<div class="card lst cf-l">'+F.map(function(f){return ligneFa(f,1)}).join('')+'</div><p class="hint">Les factures d\'acompte sont rangées ici aussi.</p>':'<div class="card cf-rien"><b>Aucune facture</b><span>La facture d\'acompte se crée toute seule quand le client signe le devis.</span></div>';
 var p=F.filter(function(f){return f.st==='pret'})[0],d=o.dv&&X.find(o.dv),r=reste(k),go;
 if(p)go='<button class="btn go" data-cfa="'+p.id+'">Vérifier la facture</button>';
 else if(d&&d.statut!=='signed')go='<button class="btn go" data-opendv="'+d.id+'">Ouvrir le pré-devis</button>';
 else if(r)go='<button class="btn go" data-cfa="'+F.filter(function(f){return f.st==='attente'})[0].id+'">Voir la facture</button>';
 else if(o.ch&&CH[o.ch])go='<button class="btn go" data-ch="'+o.ch+'">Voir le chantier</button>';
 else if(o.k==='visite')go='<button class="btn go" data-dos="'+k+'">Préparer la visite</button>';
 else go='<button class="btn go" data-cnew="devis|'+k+'">Faire un devis</button>';
 var h='<div class="cf cl-f">'+coord(o)+'<div class="card cf-ou"><small>Où on en est</small><b>'+esc(e[0])+'</b>'+go.replace('class="btn go"','class="btn go cf-in"')+'</div>'+menuFiche({pre:P.length,dv:S.length,fa:F.length})+'<div class="cl-docs">'+corps+'</div>';
 if(o.hist&&o.hist.length)h+='<details class="xsec cl-hist"><summary>Historique</summary><div class="card"><ul class="tl">'+o.hist.map(function(x,i,a){return '<li class="'+(i===a.length-1?'last':'')+'"><small>'+esc(x[0])+'</small>'+esc(x[1])+'</li>'}).join('')+'</ul></div></details>';
 if(o.chat&&(o.chat.length||o.ph.length))h+='<button type="button" class="btn sm cf-tout" data-dos="'+k+'">Sa demande complète : conversation, photos ›</button>';
 h+=supBouton('data-csup="'+k+'"')+'</div>';
 X.xopen(o.n,(o.t?o.t+' · ':'')+(o.v||''),h,'<button class="btn" data-xclose>Fermer</button>',null,keep);}

/* Fiche d'un vrai client : coordonnées (GHL), pré-devis (notes Cliky), devis et factures (VosFactures) */
var VF={c:null,dem:null,docs:null,err:''};
var TYPV={devis:'Devis',facture:'Facture',acompte:'Facture d\'acompte',solde:'Facture finale',avoir:'Avoir'};
function jour(s){var m=/^(\d{4})-(\d\d)-(\d\d)/.exec(s||'');return m?m[3]+'/'+m[2]+'/'+m[1]:''}
function ligneVdoc(d){var ok=d.statut==='paid'||d.statut==='accepted';
 return '<button class="cf-li" type="button" data-cpdf="'+esc(d.id)+'"><span class="cf-av cf-doc">'+(d.type==='devis'?ICP.ok:IC.fact)+'</span><span class="tx"><b>'+esc(TYPV[d.type]||d.type)+' n° '+esc(d.numero||'')+'</b><small>'+esc(jour(d.date))+' · Voir le PDF</small></span><span class="cf-m"><b>'+eur(+d.ht||0)+'</b><span class="pill '+(ok?'ok':'warn')+'">'+esc(d.statut_libelle||d.statut||'')+'</span></span></button>'}
function ficheVraie(c){var V=window.PCV;if(!V||!V.api)return;
 if(VF.c!==c){VF={c:c,dem:null,docs:null,err:''};fseg=null;
  V.api('/espace/demande?c='+encodeURIComponent(c)).then(function(x){if(VF.c!==c)return;VF.dem=x.demande;rendreVraie(1)},function(e){if(VF.c!==c)return;VF.err=e.message;rendreVraie(1)});
  V.api('/espace/documents?c='+encodeURIComponent(c)).then(function(x){if(VF.c!==c)return;VF.docs=x.documents||[];rendreVraie(1)},function(e){if(VF.c!==c)return;VF.docs=[];VF.err=VF.err||e.message;rendreVraie(1)});}
 rendreVraie(0);}
function rendreVraie(maj){var c=VF.c,base=VC[c]||{nom:'Client'},d=VF.dem,k=(d&&d.contact)||{};
 if(maj&&!document.querySelector('#xsheet.on .cl-f[data-c="'+c+'"]'))return;
 var o={vrai:1,n:base.nom||k.nom,type:base.type,prenom:k.prenom||base.prenom,tel:k.telephone||base.telephone,mail:k.email||base.email,rue:k.adresse||base.adresse,cp:k.cp||base.cp,v:k.ville||base.ville,siret:base.siret,entreprise:base.entreprise,kbis:base.kbis};
 var P=d?d.pre_devis||[]:null,Dv=VF.docs?VF.docs.filter(function(x){return x.type==='devis'}):null,Fa=VF.docs?VF.docs.filter(function(x){return x.type!=='devis'&&x.type!=='avoir'}):null;
 if(!fseg&&P&&VF.docs)fseg=P.length?'pre':Dv.length?'dv':Fa.length?'fa':'pre';
 var att='<div class="card cf-rien"><span>Chargement…</span></div>',corps,fs=fseg||'pre';
 if(fs==='pre')corps=!P?att:P.length?'<div class="card lst cf-l">'+P.slice(0,4).map(function(p,i){return '<button class="cf-li" type="button" data-vc="'+esc(c)+'"><span class="cf-av cf-doc">'+I('<path d="M13 21H6V3h8l4 4v4"/><path d="M14 3v4h4M9 9h4M9 13h3"/>')+'</span><span class="tx"><b>'+(i?'Pré-devis plus ancien':'Pré-devis')+'</b><small>'+esc(jour(p.le)||'')+(p.resume?' · '+esc(p.resume):'')+'</small></span><span class="cf-m"><b>'+(p.totaux&&p.totaux.total_ht!=null?eur(+p.totaux.total_ht):'')+'</b><span class="pill '+(i?'grey':'todo')+'">'+(i?'Ancien':'Ouvrir')+'</span></span></button>'}).join('')+'</div>':'<div class="card cf-rien"><b>Aucun pré-devis</b><span>Quand ce client remplit le formulaire, Cliky prépare son pré-devis ici.</span></div>';
 else if(fs==='dv')corps=!Dv?att:Dv.length?'<div class="card lst cf-l">'+Dv.map(ligneVdoc).join('')+'</div>':'<div class="card cf-rien"><b>Aucun devis</b><span>Un pré-devis validé devient un devis VosFactures, il arrive ici.</span></div>';
 else corps=!Fa?att:Fa.length?'<div class="card lst cf-l">'+Fa.map(ligneVdoc).join('')+'</div><p class="hint">Les factures d\'acompte sont rangées ici aussi.</p>':'<div class="card cf-rien"><b>Aucune facture</b><span>La facture d\'acompte se crée à l\'acceptation du devis.</span></div>';
 var h='<div class="cf cl-f" data-c="'+esc(c)+'">'+coord(o)+(VF.err?'<p class="hint cl-err">'+esc(VF.err)+'</p>':'')+menuFiche({pre:P?P.length&&1:0,dv:Dv?Dv.length:0,fa:Fa?Fa.length:0},fs)+'<div class="cl-docs">'+corps+'</div>'+supBouton('data-csupv="'+esc(c)+'"')+'</div>';
 X.xopen(o.n||'Client',[o.v,base.demande].filter(Boolean).join(' · '),h,'<button class="btn" data-xclose>Fermer</button>'+(P&&P.length?'<button class="btn go" data-vc="'+esc(c)+'">Ouvrir le pré-devis</button>':''),null,false);}

/* ---------- supprimer un client (demande de Cyril, 3/11) ----------
   Un petit bouton discret tout en bas de la fiche, puis une page qui dit exactement ce qui va se passer, avant le bouton rouge.
   Le service (Worker) vérifie ses devis et factures : sans document, le client disparaît partout (Espace, GHL, VosFactures) ;
   avec des documents, ils restent dans VosFactures (factures gardées 10 ans, numéros sans trou) ; facture pas payée : on attend. */
function supBouton(attr){return '<button type="button" class="cl-sup" '+attr+'>'+IC.poub+'<span>Supprimer ce client</span></button>'}
var pl=function(n,un,plus){return n+' '+(n>1?plus:un)};
function supTexte(nom,b){var docs=[b.devis?pl(b.devis,'devis','devis'):'',b.factures?pl(b.factures,'facture','factures'):'',b.avoirs?pl(b.avoirs,'avoir','avoirs'):''].filter(Boolean).join(' et ').replace(/ et (?=.* et )/,', ');
 if(b.impayees&&b.impayees.length)return {ok:0,h:'<div class="card cl-sup-c"><b>Pas tout de suite</b><p>'+esc(nom)+' a '+(b.impayees.length>1?b.impayees.length+' factures pas encore payées':'une facture pas encore payée')+'\u00a0: '+
  b.impayees.map(function(f){return esc((f.numero?'n° '+f.numero:'facture')+(f.ttc!=null?', '+eur(+f.ttc)+' TTC':''))}).join(' ; ')+'.</p><p>Une fois payée, ou annulée par un avoir, vous pourrez supprimer ce client. Comme ça, aucun argent dû ne se perd de vue.</p></div>'};
 var h='<div class="card cl-sup-c"><b>Ce qui part</b><p>'+esc(nom)+' disparaît de votre Espace et de vos contacts (GHL), avec sa demande, ses photos et ses messages. Plus de SMS ni de rappel à son nom.</p></div>';
 if(b.garde)h+='<div class="card cl-sup-c"><b>Ce qui reste : '+esc(docs)+'</b><p>La loi oblige à garder les factures pendant 10 ans, et leurs numéros doivent se suivre sans trou. '+'Tout reste donc rangé dans VosFactures et dans votre onglet Factures, avec la fiche VosFactures qui les porte. Ce client n\'apparaît simplement plus dans votre liste.</p></div>';
 else h+='<div class="card cl-sup-c"><b>Dans VosFactures aussi</b><p>Sa fiche VosFactures est supprimée aussi : aucun devis ni facture n\'est à son nom.</p></div>';
 return {ok:1,h:h+'<p class="cl-sup-def">C\'est définitif : impossible de revenir en arrière.</p>'};}
function supPied(ok,attr){return '<button class="btn" type="button" data-csupnon>'+(ok?'Annuler':'Retour')+'</button>'+(ok?'<button class="btn cl-sup-go" type="button" '+attr+'>'+IC.poub+'<span>Supprimer définitivement</span></button>':'')}
function supPoser(t,pied){var i=$('#x-in .cl-sup-p');if(!i)return;i.innerHTML=t;$('#x-foot').innerHTML=pied;$('#x-foot').hidden=false;}
/* démonstration : rien n'est supprimé pour de vrai, le client est seulement caché de la liste sur cet appareil */
function supDemo(k){var o=DOS[k];if(!o)return;var F=faDe(k),V=dvDe(k);
 var b={devis:V.length,factures:F.length,avoirs:0,garde:F.length+V.length>0,impayees:F.filter(function(f){return f.st!=='payee'}).map(function(f){return {numero:f.id,ttc:ftot(f).ttc}})};
 var t=supTexte(o.n,b);X.xopen('Supprimer '+o.n+' ?','Client fictif de démonstration','<div class="cl-sup-p">'+t.h+'</div>',supPied(t.ok,'data-csupok="'+k+'"'),null,true);}
function supVrai(c){var V=window.PCV,nom=(VC[c]&&VC[c].nom)||'ce client';if(!V||!V.api)return;
 X.xopen('Supprimer '+nom+' ?','Je regarde ses devis et factures…','<div class="cl-sup-p"><div class="card cf-rien"><span>Vérification dans VosFactures…</span></div></div>',supPied(0),null,true);
 V.api('/espace/client/supprimer',{method:'POST',body:{contact:c,verifier:true}}).then(function(x){var t=supTexte(nom,x.bilan||{});$('#x-s').textContent='';supPoser(t.h,supPied(t.ok,'data-csupvok="'+esc(c)+'"'))},
  function(e){supPoser('<div class="card cl-sup-c"><b>Vérification impossible</b><p>'+esc(e.message)+'</p></div>',supPied(0))});}
function supFait(c,b){var nom=(VC[c]&&VC[c].nom)||'Le client',sup=(lsJ('pc-cl-supv')||[]).concat([c]).slice(-50);lsW('pc-cl-supv',sup);
 lsW(KVC,(lsJ(KVC)||[]).filter(function(x){return x.contact!==c}));
 var L=lsJ('pc-vrai-liste');if(L&&L.demandes){L.demandes=L.demandes.filter(function(d){return d.contact!==c});lsW('pc-vrai-liste',L)}
 delete VC[c];vcCharge=0;VF={c:null,dem:null,docs:null,err:''};X.xclose();vueClients();
 X.toast('Client supprimé',nom+(b&&b.garde?' : ses devis et factures restent dans VosFactures, comme la loi le demande.':' n\'est plus ni dans GHL ni dans VosFactures.'));}

/* ---------- devis et factures ---------- */
function ligneFa(f,ici){var t=ftot(f),s=ST[f.st];
 return '<button class="cf-li" type="button" data-cfa="'+f.id+'"><span class="cf-av cf-doc">'+IC.fact+'</span><span class="tx"><b>'+TY[f.ty]+(ici?'':' · '+esc(DOS[f.cli]?DOS[f.cli].n:''))+'</b><small>'+(f.st==='pret'?'créée '+esc(f.cree||'à l\'instant'):f.st==='attente'?'envoyée '+esc(f.env)+(f.rel?' · relance auto '+esc(f.rel):''):'payée '+esc(f.paye||''))+'</small></span><span class="cf-m"><b>'+eur(t.ht)+'</b><span class="pill '+s[1]+'">'+s[0]+'</span></span></button>'}
var DST={avalider:['À valider','todo'],envoye:['Envoyé','warn'],signe:['Signé','ok'],brouillon:['Brouillon','grey']};
function ligneDv(v,ici){var s=DST[v.st]||DST.brouillon,c=DOS[v.cli];
 return '<button class="cf-li" type="button" '+(v.live?'data-opendv="'+v.id+'"':'data-cdv="'+esc(v.id)+'"')+'><span class="cf-av cf-doc">'+I('<path d="M13 21H6V3h8l4 4v4"/><path d="M14 3v4h4M9 9h4M9 13h3"/><path d="M19.5 13.5l-5.5 5.5-.6 2.6 2.6-.6 5.5-5.5z"/>')+'</span><span class="tx"><b>Devis '+esc(v.id)+(ici?'':' · '+esc(c?c.n:''))+'</b><small>'+esc(c&&c.t||v.titre||'')+(v.d?' · '+esc(v.d):'')+'</small></span><span class="cf-m"><b>'+eur(v.ht)+'</b><span class="pill '+s[1]+'">'+s[0]+'</span></span></button>'}
function tousDevis(){var L=[];D.forEach(function(d){L.push({id:d.id,cli:Object.keys(DOS).filter(function(k){return DOS[k].dv===d.id})[0],ht:X.tot(d).ht,st:d.statut==='signed'?'signe':d.statut==='sent'?'envoye':'avalider',d:d.signedAt?'signé '+d.signedAt:d.sentAt?'envoyé '+d.sentAt:d.recu,live:true})});
 return DVN.slice().reverse().concat(L,DVX)}
var RC=[{id:'r1',ch:'alpes',four:'Négoce Isère Matériaux',d:'mar. 13/10',ht:463.2,st:'apayer',note:'Rangée dans le chantier Alpes Kiné · 3 suspentes manquent par rapport à la livraison'},
 {id:'r2',ch:'perrin',four:'Négoce Isère Matériaux',d:'jeu. 8/10',ht:618,st:'payee',note:'Rangée dans le chantier de Mme Perrin'}];
var RCs=X.lsGet('pc-rc1',{});RC.forEach(function(r){if(RCs[r.id])r.st=RCs[r.id]});
function ligneRc(r){return '<button class="cf-li" type="button" data-crc="'+r.id+'"><span class="cf-av cf-doc">'+I('<path d="M3 13h5l2 3h4l2-3h5"/><path d="M3 13l3-8h12l3 8v6H3z"/>')+'</span><span class="tx"><b>'+esc(r.four)+'</b><small>reçue '+esc(r.d)+' · '+esc(CH[r.ch]?CH[r.ch].n:'')+'</small></span><span class="cf-m"><b>'+eur(r.ht)+'</b><span class="pill '+(r.st==='payee'?'ok':'warn')+'">'+(r.st==='payee'?'Payée':'À payer')+'</span></span></button>'}
var seg='fa',segChoisi=false;
/* Factures (Cyril, 2/11) : plus de bloc « À encaisser » (il est sur l'accueil). Dans chaque menu, trois groupes :
   À envoyer (en avant, avec la pastille rouge du menu), En attente de paiement, Payées. */
function vueFactures(){
 var K=function(t){return t==='ac'?function(f){return f.ty==='ac'}:function(f){return f.ty!=='ac'}},nEnv=function(t){return FA.filter(K(t)).filter(function(f){return f.st==='pret'}).length};
 /* tant que l'artisan n'a pas choisi, on ouvre le menu qui a une facture à envoyer */
 if(!segChoisi&&seg==='fa'&&!nEnv('fa')&&nEnv('ac'))seg='ac';
 var h='<div class="row cf-top"><h2>Factures</h2><button type="button" class="cf-badge" data-cconf>'+ECU+'<span>Conformes à la loi française</span></button></div>'+
  '<div class="grid2"><div class="col">'+
  '<button class="btn go cf-go" type="button" data-cnew="facture"><span class="lab"><span class="ic">'+IC.plus+'</span><span>Nouvelle facture</span></span></button>'+
  '<p class="hint fa-aide">Les factures se préparent aussi toutes seules : l\'acompte quand le client signe, la facture finale à la fin du chantier. Vous vérifiez, puis vous envoyez.</p>'+
  '</div><div class="col">'+
  '<div class="seg cf-seg dv-seg" role="tablist" aria-label="Factures">'+[['fa','Factures',IC.fact],['ac','Acomptes',IC.acompte],['rc','Reçues',IC.recue]].map(function(x){var n=x[0]==='rc'?0:nEnv(x[0]);return '<button role="tab" data-cseg="'+x[0]+'" aria-selected="'+(seg===x[0])+'">'+x[2]+'<span>'+x[1]+'</span>'+(n?'<i class="rouge">'+n+'</i>':'')+'</button>'}).join('')+'</div>';
 if(seg==='fa'||seg==='ac'){var L=FA.filter(K(seg)),P=L.filter(function(f){return f.st==='pret'}),A=L.filter(function(f){return f.st==='attente'}),Y=L.filter(function(f){return f.st==='payee'});
  h+=(P.length?'<div class="card fa-env"><div class="fa-env-h"><h2>À envoyer <i class="rouge">'+P.length+'</i></h2><span>vérifiez, puis envoyez</span></div><div class="cf-l fa-l">'+P.map(function(f){return ligneFa(f)}).join('')+'</div></div>':'<div class="card fa-env vide"><div class="fa-env-h"><h2>À envoyer</h2><span>rien en attente</span></div><p class="hint">Tout est parti. '+(seg==='ac'?'Une facture d\'acompte se crée toute seule quand le client signe le devis.':'La prochaine se préparera toute seule.')+'</p></div>')+
   (A.length?'<div class="sec-h"><h2>En attente de paiement</h2><span>relances automatiques</span></div><div class="card lst cf-l">'+A.map(function(f){return ligneFa(f)}).join('')+'</div>':'')+
   (Y.length?'<div class="sec-h"><h2>Payées</h2><span>les plus récentes</span></div><div class="card lst cf-l">'+Y.map(function(f){return ligneFa(f)}).join('')+'</div>':'');}
 else h+='<div class="sec-h"><h2>Reçues des fournisseurs</h2><span>arrivées toutes seules</span></div><div class="card lst cf-l">'+RC.map(ligneRc).join('')+'</div><p class="hint">Depuis le 1<sup>er</sup> septembre 2026, vos fournisseurs peuvent vous envoyer des factures électroniques. Elles arrivent ici et se rangent dans le bon chantier.</p>';
 h+='<span class="exemple">Exemples de démonstration · rien n\'est envoyé</span></div></div>';
 poser('#v-factures',h);
 if(!document.documentElement.classList.contains('pcvrai')){var b=$('#badge-f'),n=nEnv('fa')+nEnv('ac');if(b){b.textContent=n;b.hidden=!n}}}

/* Aperçu de la facture, tel que le client la recevra (le vrai PDF viendra de VosFactures) */
function pdfFa(f){var t=ftot(f),c=DOS[f.cli],st=f.st==='payee'?['Payée','ok']:f.st==='attente'?['Envoyée','sent']:['À vérifier','draft'];
 return '<div class="pdf" role="document"><span class="stamp s-'+st[1]+'">'+st[0]+'</span><div class="pdf-h"><div><b>Dupont Rénovation</b><span>[Adresse] · [Téléphone]</span><span>SIRET [numéro] · TVA [numéro]</span></div><div class="r"><span class="pdf-t">'+(f.ty==='ac'?'FACTURE D\'ACOMPTE':'FACTURE')+'</span><span>N° '+(f.st==='pret'?'donné à l\'envoi':'[numéro VosFactures]')+'</span><span>'+esc(f.env||'Date d\'envoi')+'</span></div></div>'+
 '<div class="pdf-c"><span class="pdf-k">Client</span><b>'+esc(c.n)+'</b><span>'+esc(c.adr||c.v||'')+'</span>'+(f.dv?'<span class="pdf-k" style="margin-top:6px">Devis</span><span>N° '+esc(f.dv)+' · '+esc(c.t||'')+'</span>':'')+'</div>'+
 '<table><thead><tr><th>Désignation</th><th class="r">Montant HT</th></tr></thead><tbody>'+f.L.map(function(l){return '<tr><td>'+esc(l[0])+'</td><td class="r">'+eur(l[1])+'</td></tr>'}).join('')+(f.ac?'<tr><td>Acompte déjà facturé</td><td class="r">− '+eur(f.ac)+'</td></tr>':'')+'</tbody></table>'+
 '<div class="pdf-tot"><div><span>Total HT</span><b>'+eur(t.ht)+'</b></div><div><span>TVA '+tva(f.tva)+'</span><span>'+eur(t.tv)+'</span></div><div class="ttc"><span>'+(f.ty==='fin'?'Reste à payer TTC':'Total TTC')+'</span><b>'+eur(t.ttc)+'</b></div></div>'+
 '<div class="pdf-s">'+(f.tva<20?'<p>[Mention TVA à taux réduit, selon l\'attestation du client.]</p>':'')+'<p>[Échéance et moyens de paiement] · [Pénalités de retard et indemnité forfaitaire de recouvrement] · [Assurance décennale]</p></div></div>'}
function ficheFa(id){var f=fa(id);if(!f)return;var c=DOS[f.cli],t=ftot(f),s=['Créée','Vérifiée','Envoyée','Payée'],i=f.st==='payee'?3:f.st==='attente'?2:0;
 var h='<div class="card"><div class="colis">'+s.map(function(x,k){return '<div class="'+(k<=i?'on':'')+'">'+x+'</div>'}).join('')+'</div></div>'+
  (f.st==='pret'?'<p class="cf-aide">Rien ne part sans vous. Si tout est juste, un appui sur <b>Envoyer au client</b> : il la reçoit par e-mail, avec le lien pour payer.</p>':'')+
  (f.st==='attente'?'<p class="cf-aide">Envoyée '+esc(f.env)+'. '+(f.rel?'Relance automatique '+esc(f.rel)+', elle s\'arrête dès que le client paie.':'')+'</p>':'')+
  pdfFa(f)+'<p class="note-demo" style="margin-top:12px">Démo : dans la vraie appli, c\'est le PDF produit par VosFactures qui s\'affiche ici. Les mentions entre crochets sont à valider avec votre expert-comptable.</p>';
 var foot=f.st==='pret'?'<button class="btn" data-cfedit="'+f.id+'">Modifier</button><button class="btn go" data-cfsend="'+f.id+'">Envoyer au client</button>':
  f.st==='attente'?'<button class="btn" data-cfrel="'+f.id+'">Relancer</button><button class="btn go" data-cfpay="'+f.id+'">Marquer payée</button>':
  '<button class="btn" data-xclose>Fermer</button><button class="btn go" data-share>Partager le PDF</button>';
 X.xopen(TY[f.ty]+' · '+eur(t.ttc)+' TTC',c.n+(f.dv?' · devis '+f.dv:''),h,foot,null,$('#xsheet').classList.contains('on'));}
function ficheDv(id){var v=tousDevis().filter(function(x){return x.id===id})[0];if(!v)return;var c=DOS[v.cli]||{n:v.cli,v:''},chx=c.ch&&CH[c.ch];
 var d={client:c.n,ville:c.v||'',titre:v.titre||c.t||'',tva:v.tva||20,statut:v.st==='brouillon'?'draft':'signed',signed:v.st==='signe',L:v.L||(chx&&chx.L)||[{d:'[Lignes du devis signé]',u:'',q:1,p:v.ht}]};
 X.xopen('Devis '+v.id,c.n+' · '+(DST[v.st]||DST.brouillon)[0],X.pdfDevis(d)+'<p class="note-demo" style="margin-top:12px">Démo : dans la vraie appli, c\'est le PDF produit par VosFactures qui s\'affiche ici.</p>',
  v.st==='brouillon'?'<button class="btn" data-xclose>Plus tard</button><button class="btn go" data-cdvsend="'+esc(v.id)+'">Envoyer au client</button>':'<button class="btn" data-xclose>Fermer</button><button class="btn go" data-share>Partager le PDF</button>',null,$('#xsheet').classList.contains('on'));}
function ficheRc(id){var r=RC.filter(function(x){return x.id===id})[0];if(!r)return;var c=CH[r.ch],f=c&&c.fact&&c.fact[0];
 var h='<div class="card cf-ou"><small>Rangement</small><b>'+esc(r.note)+'</b></div>'+
  (f?'<div class="xsec"><h3>Ce qu\'elle contient</h3><div class="card lst">'+f.L.map(function(l){return '<div class="it"><span class="tx"><b style="font-size:14px">'+esc(l[0])+'</b><small>commandé '+esc(l[1])+' · facturé '+esc(l[2])+'</small></span><span class="pill '+(l[3]==='ok'?'ok':'warn')+'">'+(l[3]==='ok'?'OK':esc(l[3]))+'</span></div>'}).join('')+'</div></div>':'')+
  '<p class="note-demo">Une facture électronique arrive avec ses données : rien à recopier. Elle reste archivée avec le chantier.</p>';
 X.xopen('Facture '+r.four,'reçue '+r.d+' · '+eur(r.ht)+' HT',h,(r.st==='payee'?'<button class="btn" data-xclose>Fermer</button>':'<button class="btn" data-xclose>Plus tard</button><button class="btn go" data-crcpay="'+r.id+'">Marquer payée</button>')+(c?'':''),null,$('#xsheet').classList.contains('on'));}

/* ---------- à la main : un client, une facture, un devis ---------- */
/* Nouveau client : particulier (en premier) ou professionnel ; le formulaire change selon la case cochée.
   Pro : nom de l'entreprise, SIRET et Kbis (photo ou PDF). En mode direct, le client est créé dans GHL et dans VosFactures. */
var ctype='part',rappelClient=null;
function champ(id,lab,ph,attr,opt){return '<label><span>'+lab+(opt?' <small>facultatif</small>':'')+'</span><input id="'+id+'" autocomplete="off" placeholder="'+ph+'"'+(attr||'')+'></label>'}
function formHTML(){var pro=ctype==='pro';
 return '<div class="cf-form cl-form">'+
  '<div class="cl-type" role="radiogroup" aria-label="Type de client">'+[['part','Particulier','Une personne, une famille'],['pro','Professionnel','Entreprise, commerce, syndic']].map(function(x){
   return '<button type="button" role="radio" data-ctype="'+x[0]+'" aria-checked="'+(ctype===x[0])+'"><span class="cl-case">'+ICP.ok+'</span><span><b>'+x[1]+'</b><small>'+x[2]+'</small></span></button>'}).join('')+'</div>'+
  (pro?champ('cf-e','Nom de l\'entreprise','Ex. : Boulangerie Rey')+champ('cf-siret','SIRET','14 chiffres',' inputmode="numeric"',1)+
   '<label class="cl-kbis"><span>Kbis <small>facultatif · photo ou PDF</small></span><span class="cl-file">'+ICP.kbis+'<span id="cf-kbis-n">Ajouter le Kbis</span><input id="cf-kbis" type="file" accept="image/*,application/pdf"></span></label>'+
   '<p class="cl-sous">La personne à contacter</p>':
   '<div class="cl-civ" role="radiogroup" aria-label="Civilité">'+['M.','Mme'].map(function(c){return '<button type="button" role="radio" data-cciv="'+c+'" aria-checked="false">'+c+'</button>'}).join('')+'</div>')+
  '<div class="cl-2">'+champ('cf-p','Prénom','Ex. : Julie','',pro)+champ('cf-n','Nom','Ex. : Roux','',pro)+'</div>'+
  '<div class="cl-2">'+champ('cf-t','Téléphone','06…',' type="tel" inputmode="tel"')+champ('cf-m','E-mail','pour envoyer devis et factures',' type="email" inputmode="email"',1)+'</div>'+
  champ('cf-a',pro?'Adresse du siège':'Adresse','N° et rue','')+
  '<div class="cl-2 cl-cp">'+champ('cf-cp','Code postal','38000',' inputmode="numeric"')+champ('cf-v','Ville','Ex. : Meylan')+'</div>'+
  '<p class="hint">Vous pouvez aussi dicter : touchez le micro.</p><p class="cl-err" id="cf-err" hidden></p></div>'}
function garder(){var g={};['cf-e','cf-siret','cf-p','cf-n','cf-t','cf-m','cf-a','cf-cp','cf-v'].forEach(function(i){var x=$('#'+i);if(x)g[i]=x.value});return g}
function remettre(g){Object.keys(g).forEach(function(i){var x=$('#'+i);if(x)x.value=g[i]})}
function formClient(rappel){rappelClient=typeof rappel==='function'?rappel:null;ctype='part';
 X.xopen('Nouveau client','Particulier ou professionnel',formHTML(),
 '<button class="btn" data-xclose>Annuler</button><button class="btn go" data-caddok>Enregistrer</button>',function(){var n=$('#cf-p');if(n)setTimeout(function(){n.focus()},250)});}
function val(i){var x=$('#'+i);return x?x.value.trim():''}
function erreur(t){var e=$('#cf-err');if(e){e.textContent=t;e.hidden=!t;if(t)e.scrollIntoView({block:'nearest',behavior:'smooth'})}}
function addClient(){var pro=ctype==='pro',cv=$('[data-cciv][aria-checked="true"]'),civ=!pro&&cv?cv.getAttribute('data-cciv'):'';
 var c={type:pro?'pro':'particulier',civilite:civ,prenom:val('cf-p'),nom:val('cf-n'),entreprise:val('cf-e'),siret:val('cf-siret').replace(/\s/g,''),telephone:val('cf-t'),email:val('cf-m'),adresse:val('cf-a'),cp:val('cf-cp'),ville:val('cf-v')};
 if(pro&&!c.entreprise){$('#cf-e').focus();return erreur('Il manque le nom de l\'entreprise.')}
 if(!pro&&!c.nom){$('#cf-n').focus();return erreur('Il manque le nom du client.')}
 if(c.siret&&!/^\d{14}$/.test(c.siret)){$('#cf-siret').focus();return erreur('Le SIRET a 14 chiffres.')}
 if(!c.telephone&&!c.email){$('#cf-t').focus();return erreur('Il faut au moins un téléphone ou un e-mail pour joindre le client.')}
 erreur('');var nom=pro?c.entreprise:[c.civilite,c.prenom,c.nom].filter(Boolean).join(' ');
 var fic=$('#cf-kbis')&&$('#cf-kbis').files[0];
 if(document.documentElement.classList.contains('pcvrai')&&window.PCV&&window.PCV.api)return addVrai(c,nom,fic);
 var k='c'+Date.now().toString(36);
 NEW[k]={n:nom,type:pro?'pro':'part',prenom:c.prenom,nom:c.nom,entreprise:c.entreprise,siret:c.siret,kbis:fic?fic.name:'',rue:c.adresse,cp:c.cp,v:c.ville,adr:[c.adresse,[c.cp,c.ville].filter(Boolean).join(' ')].filter(Boolean).join(', '),tel:c.telephone,mail:c.email,t:'',k:'nouveau',nouveau:1,src:'Ajouté par vous',chat:[],ph:[],docs:[],hist:[['à l\'instant','Fiche créée par vous']]};
 DOS[k]=NEW[k];save();vueClients();var r=rappelClient;rappelClient=null;
 if(r){X.xclose();r(k)}else{fseg=null;ficheClient(k)}
 X.toast('Client ajouté','Démo : dans la vraie appli, il est créé aussi dans VosFactures.');}
function addVrai(c,nom,fic){var b=$('[data-caddok]');if(b){b.disabled=true;b.textContent='Enregistrement…'}
 var fin=function(){if(b){b.disabled=false;b.textContent='Enregistrer'}};
 var kb=fic?envoyerKbis(fic,nom):Promise.resolve('');
 kb.then(function(u){c.kbis=u||'';return window.PCV.api('/espace/client',{method:'POST',body:c})}).then(function(x){fin();var cl=x.client||{},k=cl.contact;
   var e={contact:k,vf:cl.vf,nom:cl.nom_affiche||nom,type:c.type,prenom:c.prenom,telephone:c.telephone,email:c.email,adresse:c.adresse,cp:c.cp,ville:c.ville,siret:c.siret,entreprise:c.entreprise,kbis:c.kbis,ici:1};
   var L=(lsJ(KVC)||[]).filter(function(y){return y.contact!==k});L.unshift(e);lsW(KVC,L);
   DOS[k]={n:e.nom,type:c.type==='pro'?'pro':'part',prenom:c.prenom,nom:c.nom,entreprise:c.entreprise,siret:c.siret,rue:c.adresse,cp:c.cp,v:c.ville,tel:c.telephone,mail:c.email,t:'',k:'nouveau',nouveau:1,src:'Ajouté par vous',chat:[],ph:[],docs:[],hist:[],vrai:1};
   vueClients();var r=rappelClient;rappelClient=null;
   if(r){X.xclose();r(k)}else ficheVraie(k);
   X.toast('Client ajouté',cl.nouveau===false?'Il existait déjà dans vos contacts : sa fiche est complétée, dans VosFactures aussi.':'Créé dans vos contacts et dans VosFactures.')},
  function(err){fin();erreur('Pas enregistré : '+err.message)});}
function envoyerKbis(f,nom){if(f.size>3.5*1024*1024)return Promise.reject(new Error('le Kbis est trop lourd (3,5 Mo au plus). Prenez une photo plutôt.'));
 var art=lsJ('pc-vrai-artisan')||{},fd=new FormData();fd.append('artisan',art.code||'');fd.append('nom','kbis '+nom);fd.append('plan_1',f,f.name);
 return fetch(String(window.PC_SERVICE||'').replace(/\/+$/,'')+'/photos',{method:'POST',body:fd}).then(function(r){return r.json()}).then(function(x){var u=x&&x.plans&&x.plans[0]&&x.plans[0].url;if(!u)throw new Error('le Kbis n\'a pas pu être déposé'+(x&&x.erreur?' ('+x.erreur+')':''));return u});}
var nTva=10;
function formDoc(type,k){var K=cles();nTva=10;var dv=type==='devis';
 X.xopen(dv?'Devis à la main':'Facture à la main',dv?'Pour un petit travail, sans pré-devis':'Pour un travail hors devis',
 '<div class="cf-form"><label>Pour qui<select id="cf-c">'+K.map(function(x){return '<option value="'+x+'"'+(x===k?' selected':'')+'>'+esc(DOS[x].n)+'</option>'}).join('')+'</select></label>'+
 '<label>'+(dv?'Les travaux':'Ce que vous avez fait')+'<textarea id="cf-d" rows="3" placeholder="'+(dv?'Ex. : pose d\'une porte intérieure 73 cm, fournie':'Ex. : reprise d\'une fissure au plafond du couloir')+'"></textarea></label>'+
 '<label>Montant HT<input id="cf-ht" inputmode="decimal" placeholder="0,00" autocomplete="off"></label>'+
 '<div class="cf-tva"><span>TVA</span><div class="seg" role="tablist">'+[5.5,10,20].map(function(t){return '<button type="button" role="tab" data-ctva="'+t+'" aria-selected="'+(t===10)+'">'+tva(t)+'</button>'}).join('')+'</div></div>'+
 '<div class="card cf-ttc"><span>Total TTC</span><b id="cf-ttc">0,00 €</b></div><p class="hint">Vous pouvez aussi dicter : touchez le micro. Le numéro est donné par VosFactures à l\'envoi.</p></div>',
 '<button class="btn" data-xclose>Annuler</button><button class="btn go" data-cdocok="'+type+'">'+(dv?'Préparer le devis':'Préparer la facture')+'</button>',function(){var i=$('#cf-ht');if(i)i.addEventListener('input',ttc)});}
function num(s){var n=parseFloat(String(s||'').replace(/\s/g,'').replace(',','.'));return isFinite(n)?r2(n):0}
function ttc(){var e=$('#cf-ttc');if(e)e.textContent=eur(r2(num($('#cf-ht').value)*(1+nTva/100)))}
function addDoc(type){var k=$('#cf-c').value,d=$('#cf-d').value.trim(),ht=num($('#cf-ht').value);
 if(!d){$('#cf-d').focus();X.toast('Il manque la description','Une ligne suffit : le client doit comprendre ce qu\'il paie.');return}
 if(!(ht>0)){$('#cf-ht').focus();X.toast('Il manque le montant','Le montant hors taxes, en euros.');return}
 if(type==='devis'){var id='M'+(DVN.length+1);DVN.push({id:id,cli:k,ht:ht,tva:nTva,st:'brouillon',d:'à l\'instant',titre:d,L:[{d:d,u:'forfait',q:1,p:ht}]});save();seg='dv';vueFactures();ficheDv(id);}
 else{var f={id:'m'+Date.now().toString(36),cli:k,ty:'main',L:[[d,ht]],tva:nTva,st:'pret',cree:'à l\'instant'};FA.unshift(f);save();vueFactures();ficheFa(f.id);}
 vueClients();}

/* ---------- conformité ---------- */
function conf(){X.xopen('Devis et factures conformes','Ce que ProClik fait pour vous',
 '<div class="card cf-conf">'+ECU+'<div><b>Conformes à la loi française</b><span>VosFactures, plateforme agréée par l\'administration</span></div></div>'+
 '<div class="card lst"><div class="it"><span class="tx"><b style="font-size:14px">Depuis le 1<sup>er</sup> septembre 2026</b><small>Toutes les entreprises doivent pouvoir recevoir des factures électroniques. Les vôtres arrivent dans l\'onglet « Reçues ».</small></span></div>'+
 '<div class="it"><span class="tx"><b style="font-size:14px">À partir du 1<sup>er</sup> septembre 2027</b><small>Les petites entreprises devront aussi les envoyer sous cette forme. Vos factures partent déjà par VosFactures.</small></span></div>'+
 '<div class="it"><span class="tx"><b style="font-size:14px">Numéros qui se suivent, mentions, archivage</b><small>C\'est VosFactures qui s\'en charge. Vous, vous vérifiez et vous envoyez.</small></span></div></div>'+
 '<p class="hint">Les mentions de vos documents (TVA, assurance, conditions de paiement) sont réglées avec vous et votre expert-comptable à la mise en service.</p>'+
 '<a class="hint" href="https://www.impots.gouv.fr/facturation-electronique-et-plateformes-agreees" target="_blank" rel="noopener">La liste officielle des plateformes agréées (impots.gouv.fr) ›</a>',
 '<button class="btn" data-xclose>Fermer</button>');}

/* ---------- clics ---------- */
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-clseg],[data-cfseg],[data-ctype],[data-cciv],[data-cvf],[data-cpdf],[data-cli],[data-cadd],[data-caddok],[data-cfa],[data-cdv],[data-crc],[data-cseg],[data-cnew],[data-cdocok],[data-ctva],[data-cfsend],[data-cfpay],[data-cfrel],[data-cfedit],[data-crcpay],[data-cdvsend],[data-cconf],[data-csup],[data-csupv],[data-csupok],[data-csupvok],[data-csupnon]');if(!b)return;
 var a=function(n){return b.getAttribute(n)};
 if(b.hasAttribute('data-clseg')){cseg=a('data-clseg');vueClients();}
 else if(b.hasAttribute('data-cfseg')){fseg=a('data-cfseg');if(VF.c&&document.querySelector('#xsheet .cl-f[data-c]'))rendreVraie(1);else if(FK)ficheClient(FK);}
 else if(b.hasAttribute('data-ctype')){if(ctype!==a('data-ctype')){var g=garder();ctype=a('data-ctype');$('#x-in').innerHTML=formHTML();remettre(g);}}
 else if(b.hasAttribute('data-cciv')){var on=a('data-cciv');$$('[data-cciv]').forEach(function(x){x.setAttribute('aria-checked',String(x===b&&x.getAttribute('aria-checked')!=='true'))});}
 else if(b.hasAttribute('data-cvf')){fseg=null;ficheVraie(a('data-cvf'));}
 else if(b.hasAttribute('data-cpdf')){if(window.PCV&&window.PCV.pdf)window.PCV.pdf(a('data-cpdf'));}
 else if(b.hasAttribute('data-cli')){fseg=null;ficheClient(a('data-cli'));}
 else if(b.hasAttribute('data-cadd'))formClient();
 else if(b.hasAttribute('data-caddok'))addClient();
 else if(b.hasAttribute('data-cfa'))ficheFa(a('data-cfa'));
 else if(b.hasAttribute('data-cdv'))ficheDv(a('data-cdv'));
 else if(b.hasAttribute('data-crc'))ficheRc(a('data-crc'));
 else if(b.hasAttribute('data-cseg')){seg=a('data-cseg');segChoisi=true;vueFactures();}
 else if(b.hasAttribute('data-cnew')){var p=a('data-cnew').split('|');if(X.nouveauDoc)X.nouveauDoc(p[0],p[1]);else formDoc(p[0],p[1]);}
 else if(b.hasAttribute('data-cdocok'))addDoc(a('data-cdocok'));
 else if(b.hasAttribute('data-ctva')){nTva=+a('data-ctva');$$('[data-ctva]').forEach(function(x){x.setAttribute('aria-selected',String(x===b))});ttc();}
 else if(b.hasAttribute('data-cfsend')){var f=fa(a('data-cfsend'));f.st='attente';f.env='aujourd\'hui';f.rel='dans 7 jours si besoin';save();X.xclose();vueFactures();vueClients();X.toast('Facture envoyée à '+DOS[f.cli].n,'Démo : rien n\'est parti. En vrai, par e-mail via VosFactures, avec le lien pour payer.');}
 else if(b.hasAttribute('data-cfpay')){var g=fa(a('data-cfpay'));g.st='payee';g.paye='aujourd\'hui';save();X.xclose();vueFactures();vueClients();X.toast('Facture payée','Bien joué. Le chiffre d\'affaires de l\'accueil suivra quand l\'argent viendra de VosFactures.');}
 else if(b.hasAttribute('data-cfrel')){X.toast('Relance prête','Démo : un message poli, envoyé seulement si vous le validez.');}
 else if(b.hasAttribute('data-cfedit')){X.toast('Modifier la facture','Touchez une ligne pour la changer : cette retouche arrive avec le branchement de VosFactures.');}
 else if(b.hasAttribute('data-crcpay')){RCs[a('data-crcpay')]='payee';X.lsSet('pc-rc1',RCs);RC.forEach(function(r){if(RCs[r.id])r.st=RCs[r.id]});X.xclose();vueFactures();X.toast('Facture fournisseur payée','Elle reste rangée avec le chantier.');}
 else if(b.hasAttribute('data-cdvsend')){var v=DVN.filter(function(x){return x.id===a('data-cdvsend')})[0];if(v){v.st='envoye';v.d='envoyé à l\'instant';save();}X.xclose();vueFactures();X.toast('Devis envoyé','Démo : rien n\'est parti. En vrai, le client le reçoit et le signe en ligne.');}
 else if(b.hasAttribute('data-cconf'))conf();
 else if(b.hasAttribute('data-csupnon')){var xb=$('#x-back');if(xb&&!xb.hidden)xb.click();else X.xclose();}
 else if(b.hasAttribute('data-csup'))supDemo(a('data-csup'));
 else if(b.hasAttribute('data-csupv'))supVrai(a('data-csupv'));
 else if(b.hasAttribute('data-csupok')){var k=a('data-csupok'),n=DOS[k]?DOS[k].n:'';var L=X.lsGet('pc-cl-sup',[])||[];if(L.indexOf(k)<0)L.push(k);X.lsSet('pc-cl-sup',L);X.xclose();vueClients();X.toast('Client supprimé (démo)',n+' est caché de la liste sur cet appareil. Dans votre Espace, il part aussi de GHL et de VosFactures.');}
 else if(b.hasAttribute('data-csupvok')){if(b.disabled)return;b.disabled=true;b.lastChild.textContent='Suppression…';var c=a('data-csupvok');
  window.PCV.api('/espace/client/supprimer',{method:'POST',body:{contact:c}}).then(function(x){supFait(c,x.bilan)},function(e){b.disabled=false;b.lastChild.textContent='Réessayer';var p=$('#x-in .cl-sup-p'),v=p&&p.querySelector('.cl-sup-err');if(v)v.remove();if(p)p.insertAdjacentHTML('afterbegin','<div class="card cl-sup-c cl-sup-err"><b>Pas supprimé</b><p>'+esc(e.message)+'</p></div>')});}
});
/* Kbis choisi : son nom s'affiche à la place de « Ajouter le Kbis » */
document.addEventListener('change',function(e){if(e.target&&e.target.id==='cf-kbis'){var f=e.target.files[0],n=$('#cf-kbis-n');if(n)n.textContent=f?f.name:'Ajouter le Kbis'}});
/* À chaque ouverture d'onglet, l'écran est à jour (les vraies demandes peuvent avoir changé) */
document.addEventListener('click',function(e){var t=e.target.closest&&e.target.closest('[role=tab][data-v]');if(!t)return;if(t.dataset.v==='clients')vueClients();if(t.dataset.v==='factures')vueFactures();});
new MutationObserver(function(){vueClients()}).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
vueClients();vueFactures();
})();
