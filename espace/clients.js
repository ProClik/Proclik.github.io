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
 perso:I('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/><path d="M19 3v4M17 5h4"/>')};
/* Écusson au trait laiton, coche et petit ruban tricolore (même dessin que le site) */
var ECU='<svg class="ecu" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8l7 2.8v5.2c0 4.6-3 8.1-7 10.4-4-2.3-7-5.8-7-10.4V5.6z"/><path d="M8.8 11.6l2.3 2.3 4.3-4.6"/><g stroke="none"><rect x="8.9" y="16.9" width="2.1" height="1.3" rx=".3" fill="#2B4C9B"/><rect x="11" y="16.9" width="2" height="1.3" fill="#E9ECF2"/><rect x="13" y="16.9" width="2.1" height="1.3" rx=".3" fill="#C8463C"/></g></svg>';

/* ---------- clients ---------- */
var ORDRE=['durand','martin','lopez','fabre','garcia','bernard','alpes','tilleuls','perrin','rey'];
function cles(){var k=ORDRE.filter(function(x){return DOS[x]});Object.keys(NEW).forEach(function(x){if(k.indexOf(x)<0)k.unshift(x)});return k}
function init(n){var w=String(n).replace(/^(M\.|Mme|Mlle|SCI|SARL|SAS)\s+/i,'').split(/\s+/).filter(function(x){return x&&!/^(les?|la|des|de|du)$/i.test(x)});return ((w[0]||'?').charAt(0)+(w[1]?w[1].charAt(0):'')).toUpperCase()}
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
function ligneCli(k){var o=DOS[k],e=etat(k);
 return '<button class="cf-li" type="button" data-cli="'+k+'"><span class="cf-av">'+esc(init(o.n))+'</span><span class="tx"><b>'+esc(o.n)+'</b><small>'+esc(o.v||'')+(o.t?' · '+esc(o.t):'')+'</small><small class="cf-et'+(e[1]?' on':'')+'">'+esc(e[0])+'</small></span><span class="go">›</span></button>'}
var filtre='';
function vueClients(){var h,vrai=document.documentElement.classList.contains('pcvrai');
 if(vrai)return clientsVrais();
 var K=cles().filter(function(k){var o=DOS[k];return !filtre||(o.n+' '+(o.v||'')+' '+(o.t||'')).toLowerCase().indexOf(filtre)>=0});
 var a=K.filter(function(k){return etat(k)[1]}),b=K.filter(function(k){return !etat(k)[1]}).sort(function(x,y){return DOS[x].n.replace(/^(M\.|Mme)\s+/,'').localeCompare(DOS[y].n.replace(/^(M\.|Mme)\s+/,''),'fr')});
 h='<div class="row cf-top"><h2>Clients</h2><span class="cf-n">'+cles().length+' clients</span></div>'+
  '<div class="grid2"><div class="col">'+
  '<label class="cf-cherche">'+IC.cherche+'<input type="search" id="cf-q" placeholder="Nom, ville ou travaux" autocomplete="off" value="'+esc(filtre)+'" aria-label="Chercher un client"></label>'+
  '<button class="btn go cf-go" type="button" data-cadd><span class="lab"><span class="ic">'+IC.perso+'</span><span>Ajouter un client</span></span></button>'+
  (a.length?'<div class="sec-h"><h2>À suivre</h2><span>il y a quelque chose à faire</span></div><div class="card lst cf-l">'+a.map(ligneCli).join('')+'</div>':'')+
  '</div><div class="col">'+
  (b.length?'<div class="sec-h"><h2>'+(a.length?'Les autres':'Vos clients')+'</h2><span>de A à Z</span></div><div class="card lst cf-l">'+b.map(ligneCli).join('')+'</div>':'')+
  (!K.length?'<p class="hint">Personne ne s\'appelle comme ça… pour l\'instant.</p>':'')+
  '<p class="hint">Chaque demande du site, du chatbot ou du téléphone crée la fiche toute seule.</p><span class="exemple">Clients fictifs de démonstration</span>'+
  '</div></div>';
 poser('#v-clients',h);
 var q=$('#cf-q');if(q)q.addEventListener('input',function(){filtre=q.value.trim().toLowerCase();var p=q.selectionStart;vueClients();var n=$('#cf-q');n.focus();try{n.setSelectionRange(p,p)}catch(e){}});}
/* Vraies demandes : un client par contact (même s'il a plusieurs demandes), on ouvre sa demande */
function clientsVrais(){var L=null;try{L=JSON.parse(localStorage.getItem('pc-vrai-liste')||'null')}catch(e){}
 var vu={},C=[];((L&&L.demandes)||[]).forEach(function(d){var k=d.contact||d.client;if(!k||vu[k])return;vu[k]=1;C.push(d)});
 var h='<div class="vexemple"><b>Vos vrais clients</b>, tirés de vos demandes. Leurs devis, factures et l\'historique complet arriveront avec le branchement de VosFactures.</div>'+
  '<div class="row cf-top"><h2>Clients</h2><span class="cf-n">'+(L?C.length+' client'+(C.length>1?'s':''):'Chargement…')+'</span></div>'+
  (C.length?'<div class="card lst cf-l">'+C.map(function(d){return '<button class="cf-li" type="button" data-vc="'+esc(d.contact||'')+'"><span class="cf-av">'+esc(init(d.client))+'</span><span class="tx"><b>'+esc(d.client)+'</b><small>'+esc(d.resume||d.titre||'')+'</small><small class="cf-et">'+esc(d.etape||'')+'</small></span><span class="go">›</span></button>'}).join('')+'</div>':(L?'<p class="hint">Pas encore de client. Le premier arrivera avec la première demande.</p>':''));
 poser('#v-clients',h);}
function poser(sel,h){var v=$(sel);if(!v)return;var c=v.querySelector(':scope>.cf');if(!c){c=document.createElement('div');c.className='cf';v.appendChild(c)}c.innerHTML=h}

/* Fiche d'un client */
function ficheClient(k,keep){var o=DOS[k];if(!o)return;var F=faDe(k),V=dvDe(k),e=etat(k),r=reste(k);
 var sig=0,fac=0,pay=0;V.forEach(function(v){if(v.st==='signe')sig+=v.ht});F.forEach(function(f){if(f.st!=='pret'){var t=ftot(f).ht;fac+=t;if(f.st==='payee')pay+=t}});
 var h='<div class="cf-act"><button type="button" class="btn sm" data-call>'+IC.tel+'Appeler</button><button type="button" class="btn sm" data-sms>'+IC.sms+'SMS</button>'+
  (o.v?'<a class="btn sm" href="https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(o.v+', Isère')+'" target="_blank" rel="noopener">'+IC.route+'Itinéraire</a>':'')+'</div>'+
  '<div class="card cf-ou"><small>Où on en est</small><b>'+esc(e[0])+'</b></div>';
 if(sig||fac)h+='<div class="xsec"><h3>L\'argent <small>HT</small></h3><div class="card cf-arg"><div><span>Devis signés</span><b>'+eur(r2(sig))+'</b></div><div><span>Facturé</span><b>'+eur(r2(fac))+'</b></div><div><span>Payé</span><b>'+eur(r2(pay))+'</b></div><div class="'+(r?'cor':'')+'"><span>Reste à payer</span><b>'+eur(r)+'</b></div></div></div>';
 if(V.length||F.length)h+='<div class="xsec"><h3>Ses devis et factures</h3><div class="card lst cf-l">'+V.map(function(v){return ligneDv(v,1)}).join('')+F.map(function(f){return ligneFa(f,1)}).join('')+'</div></div>';
 h+='<div class="xsec"><h3>Coordonnées</h3><div class="card"><div class="kv">'+(o.adr?'<span>Adresse</span><b>'+esc(o.adr)+'</b>':'')+'<span>Téléphone</span><b>'+esc(o.tel||'—')+'</b>'+(o.mail?'<span>E-mail</span><b>'+esc(o.mail)+'</b>':'')+(o.contact?'<span>Contact</span><b>'+esc(o.contact)+'</b>':'')+'<span>Origine</span><b>'+esc(o.src||'—')+'</b></div></div></div>';
 if(o.hist&&o.hist.length)h+='<div class="xsec"><h3>Historique</h3><div class="card"><ul class="tl">'+o.hist.map(function(x,i,a){return '<li class="'+(i===a.length-1?'last':'')+'"><small>'+esc(x[0])+'</small>'+esc(x[1])+'</li>'}).join('')+'</ul></div></div>';
 if(o.chat&&(o.chat.length||o.ph.length))h+='<button type="button" class="btn sm cf-tout" data-dos="'+k+'">Sa demande complète : conversation, photos ›</button>';
 var p=F.filter(function(f){return f.st==='pret'})[0],d=o.dv&&X.find(o.dv),go;
 if(p)go='<button class="btn go" data-cfa="'+p.id+'">Vérifier la facture</button>';
 else if(d&&d.statut!=='signed')go='<button class="btn go" data-opendv="'+d.id+'">Ouvrir le devis '+d.id+'</button>';
 else if(r)go='<button class="btn go" data-cfa="'+F.filter(function(f){return f.st==='attente'})[0].id+'">Voir la facture</button>';
 else if(o.ch&&CH[o.ch])go='<button class="btn go" data-ch="'+o.ch+'">Voir le chantier</button>';
 else if(o.k==='visite')go='<button class="btn go" data-dos="'+k+'">Préparer la visite</button>';
 else go='<button class="btn go" data-cnew="devis|'+k+'">Faire un devis</button>';
 X.xopen(o.n,(o.t?o.t+' · ':'')+(o.v||''),h,'<button class="btn" data-xclose>Fermer</button>'+go,null,keep);}

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
var seg='fa';
function vueFactures(){
 var P=FA.filter(function(f){return f.st==='pret'}),A=FA.filter(function(f){return f.st==='attente'}),Y=FA.filter(function(f){return f.st==='payee'});
 var enc=0;A.forEach(function(f){enc+=ftot(f).ht});enc=r2(enc);
 var h='<div class="row cf-top"><h2>Devis et factures</h2><button type="button" class="cf-badge" data-cconf>'+ECU+'<span>Conformes à la loi française</span></button></div>'+
  '<div class="grid2"><div class="col">'+
  '<div class="card cf-hero"><small>À encaisser</small><b>'+eur(enc)+' <em>HT</em></b><span>'+(A.length?A.length+' facture'+(A.length>1?'s':'')+' envoyée'+(A.length>1?'s':'')+(A[0]&&A[0].rel&&A.length===1?' · relance automatique '+esc(A[0].rel):''):'Tout est payé. Rare, savourez.')+'</span></div>';
 if(P.length){var f=P[0],t=ftot(f);
  h+='<div class="sec-h"><h2>À envoyer</h2><span>'+(P.length>1?P.length+' factures prêtes':'préparée pour vous')+'</span></div>'+
   '<div class="card cf-pret"><div class="dem-h"><div><b>'+TY[f.ty]+' · '+esc(DOS[f.cli].n)+'</b><small>'+(f.ty==='ac'?'Créée toute seule à la signature du devis '+f.dv+'. Vérifiez, puis envoyez.':f.ty==='fin'?'Créée toute seule à la fin du chantier, acompte déduit. Vérifiez, puis envoyez.':'Préparée par vous. Vérifiez, puis envoyez.')+'</small></div><div class="prix">'+eur(t.ttc)+' <small>TTC</small></div></div></div>'+
   '<button class="btn go cf-go" type="button" data-cfa="'+f.id+'"><span class="lab"><span class="ic">'+IC.env+'</span><span>Vérifier et envoyer</span></span></button>';
 }else h+='<div class="card cf-rien"><b>Rien à envoyer</b><span>Les factures se préparent toutes seules : l\'acompte à la signature du devis, la facture finale à la fin du chantier. Vous n\'avez plus qu\'à vérifier.</span></div>';
 h+='<div class="cf-main"><button type="button" class="btn sm" data-cnew="facture">'+IC.plus+'Facture à la main</button><button type="button" class="btn sm" data-cnew="devis">'+IC.plus+'Devis à la main</button></div>'+
  '</div><div class="col">'+
  '<div class="seg cf-seg" role="tablist" aria-label="Documents"><button role="tab" data-cseg="fa" aria-selected="'+(seg==='fa')+'">Factures</button><button role="tab" data-cseg="dv" aria-selected="'+(seg==='dv')+'">Devis</button><button role="tab" data-cseg="rc" aria-selected="'+(seg==='rc')+'">Reçues</button></div>';
 if(seg==='fa')h+=(A.length?'<div class="sec-h"><h2>En attente de paiement</h2><span>relances automatiques</span></div><div class="card lst cf-l">'+A.map(function(f){return ligneFa(f)}).join('')+'</div>':'')+
  (P.length>1?'<div class="sec-h"><h2>À envoyer</h2></div><div class="card lst cf-l">'+P.map(function(f){return ligneFa(f)}).join('')+'</div>':'')+
  (Y.length?'<div class="sec-h"><h2>Payées</h2><span>les plus récentes</span></div><div class="card lst cf-l">'+Y.map(function(f){return ligneFa(f)}).join('')+'</div>':'');
 else if(seg==='dv')h+='<div class="sec-h"><h2>Vos devis</h2><span>du plus récent au plus ancien</span></div><div class="card lst cf-l">'+tousDevis().map(function(v){return ligneDv(v)}).join('')+'</div><p class="hint">Un devis signé crée tout seul sa facture d\'acompte.</p>';
 else h+='<div class="sec-h"><h2>Reçues des fournisseurs</h2><span>arrivées toutes seules</span></div><div class="card lst cf-l">'+RC.map(ligneRc).join('')+'</div><p class="hint">Depuis le 1<sup>er</sup> septembre 2026, vos fournisseurs peuvent vous envoyer des factures électroniques. Elles arrivent ici et se rangent dans le bon chantier.</p>';
 h+='<span class="exemple">Exemples de démonstration · rien n\'est envoyé</span></div></div>';
 poser('#v-factures',h);
 var b=$('#badge-f');if(b){b.textContent=P.length;b.hidden=!P.length}}

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
function formClient(){
 X.xopen('Nouveau client','Il suffit du nom et du téléphone',
 '<div class="cf-form"><label>Nom<input id="cf-n" autocomplete="off" placeholder="Ex. : Mme Roux"></label><label>Téléphone<input id="cf-t" type="tel" inputmode="tel" placeholder="06…"></label><label>Ville<input id="cf-v" autocomplete="off" placeholder="Ex. : Meylan"></label><label>E-mail <small>facultatif</small><input id="cf-m" type="email" inputmode="email" placeholder="pour envoyer devis et factures"></label><p class="hint">Vous pouvez aussi dicter : touchez le micro.</p></div>',
 '<button class="btn" data-xclose>Annuler</button><button class="btn go" data-caddok>Enregistrer</button>',function(){var n=$('#cf-n');if(n)setTimeout(function(){n.focus()},250)});}
function addClient(){var n=$('#cf-n').value.trim();if(!n){$('#cf-n').focus();X.toast('Il manque le nom','Juste le nom, le reste peut attendre.');return}
 var k='c'+Date.now().toString(36);NEW[k]={n:n,v:$('#cf-v').value.trim(),tel:$('#cf-t').value.trim(),mail:$('#cf-m').value.trim(),t:'',k:'nouveau',nouveau:1,src:'Ajouté par vous',chat:[],ph:[],docs:[],hist:[['à l\'instant','Fiche créée par vous']]};
 DOS[k]=NEW[k];save();vueClients();ficheClient(k);X.toast('Client ajouté','Démo : dans la vraie appli, il rejoint vos contacts.');}
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
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-cli],[data-cadd],[data-caddok],[data-cfa],[data-cdv],[data-crc],[data-cseg],[data-cnew],[data-cdocok],[data-ctva],[data-cfsend],[data-cfpay],[data-cfrel],[data-cfedit],[data-crcpay],[data-cdvsend],[data-cconf]');if(!b)return;
 var a=function(n){return b.getAttribute(n)};
 if(b.hasAttribute('data-cli'))ficheClient(a('data-cli'));
 else if(b.hasAttribute('data-cadd'))formClient();
 else if(b.hasAttribute('data-caddok'))addClient();
 else if(b.hasAttribute('data-cfa'))ficheFa(a('data-cfa'));
 else if(b.hasAttribute('data-cdv'))ficheDv(a('data-cdv'));
 else if(b.hasAttribute('data-crc'))ficheRc(a('data-crc'));
 else if(b.hasAttribute('data-cseg')){seg=a('data-cseg');vueFactures();}
 else if(b.hasAttribute('data-cnew')){var p=a('data-cnew').split('|');formDoc(p[0],p[1]);}
 else if(b.hasAttribute('data-cdocok'))addDoc(a('data-cdocok'));
 else if(b.hasAttribute('data-ctva')){nTva=+a('data-ctva');$$('[data-ctva]').forEach(function(x){x.setAttribute('aria-selected',String(x===b))});ttc();}
 else if(b.hasAttribute('data-cfsend')){var f=fa(a('data-cfsend'));f.st='attente';f.env='aujourd\'hui';f.rel='dans 7 jours si besoin';save();X.xclose();vueFactures();vueClients();X.toast('Facture envoyée à '+DOS[f.cli].n,'Démo : rien n\'est parti. En vrai, par e-mail via VosFactures, avec le lien pour payer.');}
 else if(b.hasAttribute('data-cfpay')){var g=fa(a('data-cfpay'));g.st='payee';g.paye='aujourd\'hui';save();X.xclose();vueFactures();vueClients();X.toast('Facture payée','Bien joué. Le chiffre d\'affaires de l\'accueil suivra quand l\'argent viendra de VosFactures.');}
 else if(b.hasAttribute('data-cfrel')){X.toast('Relance prête','Démo : un message poli, envoyé seulement si vous le validez.');}
 else if(b.hasAttribute('data-cfedit')){X.toast('Modifier la facture','Touchez une ligne pour la changer : cette retouche arrive avec le branchement de VosFactures.');}
 else if(b.hasAttribute('data-crcpay')){RCs[a('data-crcpay')]='payee';X.lsSet('pc-rc1',RCs);RC.forEach(function(r){if(RCs[r.id])r.st=RCs[r.id]});X.xclose();vueFactures();X.toast('Facture fournisseur payée','Elle reste rangée avec le chantier.');}
 else if(b.hasAttribute('data-cdvsend')){var v=DVN.filter(function(x){return x.id===a('data-cdvsend')})[0];if(v){v.st='envoye';v.d='envoyé à l\'instant';save();}X.xclose();vueFactures();X.toast('Devis envoyé','Démo : rien n\'est parti. En vrai, le client le reçoit et le signe en ligne.');}
 else if(b.hasAttribute('data-cconf'))conf();
});
/* À chaque ouverture d'onglet, l'écran est à jour (les vraies demandes peuvent avoir changé) */
document.addEventListener('click',function(e){var t=e.target.closest&&e.target.closest('[role=tab][data-v]');if(!t)return;if(t.dataset.v==='clients')vueClients();if(t.dataset.v==='factures')vueFactures();});
new MutationObserver(function(){vueClients()}).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
vueClients();vueFactures();
})();
