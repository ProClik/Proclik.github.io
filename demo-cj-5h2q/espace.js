/* Démo « Espace salon » pour Chez Julie (Le Versoud).
   Julie travaille seule : un seul accès, pas de rôles. Clientes, rendez-vous et chiffres = exemples fictifs.
   Prix des 3 prestations repris de sa page Booksy (16/11/2026). Acompte de 30 % (choix de Cyril pour la présentation).
   Les réservations faites sur le site de démo (index.html) arrivent ici (localStorage 'pcd-cj-resa'). */
var $=function(i){return document.getElementById(i)},ic=PCD.ic,S;
var PR=[['Coupe cheveux longs',60,70,'ciseaux'],['Coloration racines',105,85,'goutte'],['Coupe homme',30,30,'ciseaux']];
var AUTRES=[['La consultation',1],['Balayage / éclaircissement',5],['Coloration & gloss',8],['Soin botox',1],['Coupes femmes & brushing',8],['Hommes',1],['Mariages & événements',2],['Prestations à la carte',2]];
var H=['9:00','9:30','10:15','11:00','11:45','13:30','14:15','15:00','15:30'];
var J=['dim.','lun.','mar.','mer.','jeu.','ven.','sam.'],JL=['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'],M=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
var CL=[
 {id:'camille',n:'Camille Roux',t:'06 •• •• •• 21',f:'Racines : 6.0 + oxydant 20 vol., pose 35 min',no:'Aime le volume sur le dessus.',v:7},
 {id:'sarah',n:'Sarah Martin',t:'06 •• •• •• 48',f:'Balayage babylight, patine beige clair',no:'Consultation faite en septembre.',v:4},
 {id:'lea',n:'Léa Bonnet',t:'07 •• •• •• 05',f:'',no:'Cheveux très longs, pas de dégradé.',v:3},
 {id:'ines',n:'Inès Faure',t:'06 •• •• •• 77',f:'Racines : 5.3 + 20 vol., pose 30 min',no:'',v:9},
 {id:'chloe',n:'Chloé Garnier',t:'06 •• •• •• 62',f:'',no:'Mariage le 12 juin : essai coiffure à prévoir.',v:2},
 {id:'marion',n:'Marion Blanc',t:'07 •• •• •• 39',f:'Racines : 7.1 + 20 vol., pose 35 min',no:'Allergie à vérifier avant toute nouvelle couleur.',v:5},
 {id:'thomas',n:'Thomas Petit',t:'06 •• •• •• 14',f:'',no:'Tous les mois, toujours le samedi si possible.',v:11},
 {id:'emma',n:'Emma Girard',t:'06 •• •• •• 90',f:'',no:'',v:1}];
function cl(id){for(var i=0;i<CL.length;i++)if(CL[i].id===id)return CL[i];return null}
/* jours ouverts : mardi au samedi */
var JOURS=[];(function(){for(var n=0;JOURS.length<6&&n<14;n++){var x=new Date();x.setHours(0,0,0,0);x.setDate(x.getDate()+n);if(x.getDay()!==0&&x.getDay()!==1)JOURS.push(x)}})();
function cle(d){return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
function dk(k){var p=k.split('-');return new Date(+p[0],+p[1]-1,+p[2])}
function auj(d){return cle(d)===cle(new Date())}
function jNom(d,long){var dm=new Date();dm.setHours(0,0,0,0);dm.setDate(dm.getDate()+1);if(auj(d))return 'Aujourd’hui';if(cle(d)===cle(dm))return 'Demain';return long?JL[d.getDay()]+' '+d.getDate()+' '+M[d.getMonth()]:J[d.getDay()]+' '+d.getDate()}
function etat0(){var r=[],k=0,pl=[['camille',0,'10:15'],['ines',1,'9:00'],['thomas',2,'11:45'],['lea',0,'13:30'],['marion',1,'15:00'],
  ['sarah',0,'9:30'],['emma',2,'11:00'],['chloe',0,'14:15'],['camille',1,'15:30'],['thomas',2,'9:00'],['ines',0,'10:15'],['lea',0,'13:30'],['marion',1,'9:30'],['sarah',2,'14:15']];
  /* environ 3 rendez-vous par jour, répartis sur les jours ouverts */
  JOURS.forEach(function(d,j){for(var i=0;i<3;i++){var p=pl[(j*3+i)%pl.length];r.push({id:'r'+(k++),c:p[0],p:p[1],d:cle(d),h:H[(j*2+i*3)%H.length],ac:true,etat:'prevu',paye:false})}});
  return {v:1,rdv:r,acompte:30,web:[],abs:0,opts:{resa:true,sms:true,avis:true,reseaux:false}}}
function charger(){var s=PCD.load();S=s&&s.v===1?s:etat0();
  /* réservations faites sur le site de démo */
  var w=[];try{w=JSON.parse(localStorage.getItem('pcd-cj-resa')||'[]')}catch(e){}
  var neuf=0;w.forEach(function(x){if(S.web.indexOf(x.id)>=0)return;S.web.push(x.id);neuf++;
    var p=0;PR.forEach(function(q,i){if(q[0]===x.p)p=i});
    S.rdv.push({id:x.id,c:null,nom:'Nouvelle cliente',p:p,d:x.d,h:x.h,ac:true,etat:'prevu',paye:false,web:true,tot:x.tot,acm:x.ac})});
  save();return neuf}
function save(){PCD.save(S)}
function esc(t){return String(t==null?'':t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function toast(t,i){var e=$('toast');e.innerHTML=ic(i||'check')+'<span>'+t+'</span>';e.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(function(){e.classList.remove('on')},2600)}
function fen(h){$('fen').innerHTML='<button class="ferme pk" onclick="fermer()" aria-label="Fermer">'+ic('x')+'</button>'+h;$('voile').classList.add('on');$('fen').scrollTop=0}
function fermer(){$('voile').classList.remove('on')}
$('voile').addEventListener('click',function(e){if(e.target===this)fermer()});
function blk(t,i,h,x){return '<section class="blk"><h2>'+ic(i)+t+'<span class="sp"></span>'+(x||'')+'</h2>'+h+'</section>'}
function ln(i,b,s,on,fin,cls){return '<button class="ln pk '+(cls||'')+'" onclick="'+on+'"><span class="ico">'+ic(i)+'</span><span class="tx"><b>'+b+'</b>'+(s?'<small>'+s+'</small>':'')+'</span>'+(fin||'<span class="fl">'+ic('right')+'</span>')+'</button>'}
function etq(t,c){return '<span class="etq '+(c||'')+'">'+t+'</span>'}
function hi(t,s,x){return '<div class="hi"><div><h1>'+t+'</h1><p>'+s+'</p></div>'+(x||'')+'</div>'}
function opt(k){var O={resa:['cal','Option Réservation'],sms:['send','Option SMS'],avis:['etoile','Option Avis Google']}[k];return '<span class="etq la">'+ic(O[0])+O[1]+'</span>'}
/* montants */
function tot(r){return r.tot!=null?r.tot:PR[r.p][2]}
function acpt(r){return r.acm!=null?r.acm:Math.round(tot(r)*S.acompte/100)}
function reste(r){return tot(r)-(r.ac?acpt(r):0)}
function nom(r){return r.c?cl(r.c).n:(r.nom||'Cliente')}
function prenom(r){return nom(r).split(' ')[0]}
function duJour(k){return S.rdv.filter(function(r){return r.d===k}).sort(function(a,b){return mn(a.h)-mn(b.h)})}
function mn(h){var p=h.split(':');return +p[0]*60+ +p[1]}
function ligneRdv(r){var e=r.etat==='fait'?etq('Encaissé','ok'):r.etat==='absente'?etq('Absente · acompte gardé','warn'):r.ac?etq('Acompte '+acpt(r)+' € payé','ok'):etq('Sans acompte','alert');
  return ln(PR[r.p][3],r.h+' · '+esc(nom(r)),PR[r.p][0]+' · '+tot(r)+' €','rdv(\''+r.id+'\')','<span>'+e+'</span>',r.web?'web':'')}
var V={};
/* ---------- Aujourd'hui ---------- */
V.jour=function(){var d=JOURS[0],L=duJour(cle(d)),pro=L.filter(function(r){return r.etat==='prevu'})[0],
  sem=S.rdv.filter(function(r){return r.etat!=='absente'}),acs=S.rdv.filter(function(r){return r.ac}).reduce(function(a,r){return a+acpt(r)},0),web=S.rdv.filter(function(r){return r.web});
  var ferme=!auj(d);
  return hi('Bonjour Julie',ferme?'Aujourd’hui le salon est fermé. Voici '+jNom(d,true).toLowerCase()+'.':jNom(d,true))+'<div class="pile">'+
   (pro?'<div class="now"><span class="k">Prochain rendez-vous · '+jNom(d)+'</span><b class="t">'+pro.h+' · '+esc(nom(pro))+'</b><span>'+PR[pro.p][0]+' · acompte '+acpt(pro)+' € déjà payé, reste '+reste(pro)+' €</span>'+
     '<button class="go" style="background:var(--nuit-fg);color:var(--nuit)" onclick="encaisser(\''+pro.id+'\')">'+ic('euro')+'Encaisser '+reste(pro)+' €</button></div>'
    :'<div class="now"><span class="k">'+jNom(d)+'</span><b class="t">Tous les rendez-vous sont faits</b><span>Belle journée !</span></div>')+
   blk('La journée · '+jNom(d),'cal',L.length?L.map(ligneRdv).join(''):'<p class="mini">Aucun rendez-vous.</p>','<small>'+L.length+' rendez-vous</small>')+
   (web.length?blk('Réservé en ligne','cal',web.slice(-4).reverse().map(ligneRdv).join('')+'<p class="mini">Réservé et payé sur votre site, sans un appel.</p>',opt('resa')):
     blk('Réservé en ligne','cal','<p class="mini" style="margin-top:0">Réservez un créneau sur <a href="index.html#reserver">le site de Chez Julie</a> : il arrive ici tout seul, avec son acompte.</p>',opt('resa')))+
   blk('Cette semaine','chart','<div class="chif"><div><b>'+sem.length+'</b><small>rendez-vous</small></div><div><b>'+acs+' €</b><small>acomptes reçus</small></div><div><b>'+S.abs+'</b><small>absente'+(S.abs>1?'s':'')+'</small></div><div><b>'+S.rdv.filter(function(r){return r.etat==='fait'}).length+'</b><small>avis à demander</small></div></div>','<span class="etq">Exemple</span>')+
  '</div>'};
/* ---------- Agenda ---------- */
var jSel=0;
V.rdv=function(){var d=JOURS[jSel],L=duJour(cle(d));
  return hi('Agenda','Touchez un créneau libre pour ajouter un rendez-vous.')+
   '<div class="chips" style="margin-bottom:10px">'+JOURS.map(function(x,i){return '<button class="pk" aria-pressed="'+(i===jSel)+'" onclick="jSel='+i+';go(\'rdv\')">'+jNom(x)+'</button>'}).join('')+'</div>'+
   blk(jNom(d,true),'cal',H.map(function(h){var r=L.filter(function(x){return x.h===h})[0];
     return '<div class="slot"><b>'+h+'</b>'+(r?ligneRdv(r):'<button class="libre" onclick="ajout(\''+cle(d)+'\',\''+h+'\')">Libre · ajouter</button>')+'</div>'}).join(''),'<small>'+L.length+' rendez-vous</small>')+
   '<p class="mini">Synchronisé avec l’agenda de son téléphone (Google, iPhone ou Outlook).</p>'};
/* ---------- Clientes ---------- */
var qCl='';
V.cli=function(){var L=CL.filter(function(c){return !qCl||c.n.toLowerCase().indexOf(qCl.toLowerCase())>=0});
  return hi('Mes clientes',CL.length+' clientes · exemples')+
   '<input class="champ" placeholder="Chercher une cliente" value="'+esc(qCl)+'" oninput="qCl=this.value;var p=this.selectionStart;go(\'cli\');var c=document.querySelector(\'.champ\');c.focus();c.setSelectionRange(p,p)" style="margin-bottom:10px">'+
   '<div class="pile">'+blk('Clientes','users',L.map(function(c){var nx=S.rdv.filter(function(r){return r.c===c.id&&r.etat==='prevu'})[0];
     return ln('user',c.n,(nx?'Prochain : '+jNom(dk(nx.d))+' à '+nx.h:'Pas de rendez-vous prévu')+' · '+c.v+' visite'+(c.v>1?'s':''),'fiche(\''+c.id+'\')')}).join('')||'<p class="mini">Aucune cliente trouvée.</p>')+'</div>'};
function fiche(id){var c=cl(id),nx=S.rdv.filter(function(r){return r.c===id&&r.etat==='prevu'})[0];
  fen('<h3>'+c.n+'</h3><p class="sous">'+c.t+' · '+c.v+' visites</p>'+
   '<div class="tuiles" style="margin:10px 0"><div class="tu blk"><span class="tt">'+ic('cal')+'Prochain rendez-vous</span><b class="s">'+(nx?nx.h+' · '+PR[nx.p][0]:'Aucun')+'</b></div><div class="tu blk"><span class="tt">'+ic('clock')+'Dernière visite</span><b class="s">Il y a '+(3+c.v%5)+' semaines</b></div></div>'+
   '<h2>'+ic('goutte')+'Fiche couleur</h2><div class="formule">'+(c.f?esc(c.f):'Pas encore de couleur.')+'</div>'+
   '<h2 style="margin-top:12px">'+ic('doc')+'Notes</h2><div class="formule" style="font-weight:600">'+(c.no?esc(c.no):'Aucune note.')+'</div>'+
   '<div class="row" style="margin-top:14px"><button class="go" style="flex:1" onclick="fermer();jSel=0;go(\'rdv\')">'+ic('plus')+'Nouveau rendez-vous</button><button class="btn2 pk" onclick="sms(\''+id+'\')">'+ic('send')+'SMS</button></div>'+
   '<p class="mini">Exemple fictif. Vous dictez la formule au micro pendant la pose, elle se range ici.</p>')}
/* ---------- Encaissements ---------- */
V.arg=function(){var ac=S.rdv.filter(function(r){return r.ac&&r.etat!=='fait'}),fa=S.rdv.filter(function(r){return r.etat==='fait'}),ab=S.rdv.filter(function(r){return r.etat==='absente'});
  return hi('Paiements','Acomptes, restes à encaisser et factures.')+'<div class="pile">'+
   blk('Acomptes reçus','euro',ac.slice(0,6).map(function(r){return ln('euro',esc(nom(r))+' · '+acpt(r)+' €',jNom(dk(r.d))+' à '+r.h+' · reste '+reste(r)+' € au salon','rdv(\''+r.id+'\')')}).join('')+'<p class="mini">'+S.acompte+' % payés à la réservation, déduits le jour du rendez-vous.</p>',opt('resa'))+
   blk('Absentes','lapin',ab.length?ab.map(function(r){return ln('lapin',esc(nom(r)),'Acompte de '+acpt(r)+' € gardé','rdv(\''+r.id+'\')')}).join(''):'<p class="mini" style="margin-top:0">Aucune absence. Si une cliente ne vient pas, son acompte vous reste.</p>')+
   blk('Encaissé','check',fa.length?fa.map(function(r){return ln('doc',esc(nom(r))+' · '+tot(r)+' €',PR[r.p][0],'facture(\''+r.id+'\')','<span class="etq">Facture</span>')}).join(''):'<p class="mini" style="margin-top:0">Encaissez un rendez-vous : il arrive ici, avec sa facture en une touche.</p>')+
  '</div>'};
/* ---------- Chiffres ---------- */
V.chi=function(){var W=[1840,2110,1960,2380,2050,2260,2420,2190],mx=Math.max.apply(null,W),pp=[0,0,0];S.rdv.forEach(function(r){pp[r.p]++});
  return hi('Mes chiffres','Chiffre d’affaires et prestations','<span class="etq">Chiffres d’exemple</span>')+'<div class="pile">'+
   blk('Chiffre d’affaires · 8 dernières semaines','chart','<div class="barres">'+W.map(function(v,i){return '<div><i style="height:'+Math.round(v/mx*100)+'%"></i><small>S'+(i+1)+'</small></div>'}).join('')+'</div><p class="mini">Cette semaine : '+W[7].toLocaleString('fr-FR')+' € (exemple)</p>')+
   blk('Les plus demandées','ciseaux',PR.map(function(p,i){return ln(p[3],p[0],pp[i]+' rendez-vous à venir','go(\'reg\')','<span class="prix">'+p[2]+' €</span>')}).join(''))+
   blk('Rendez-vous honorés','check','<div class="chif" style="grid-template-columns:1fr 1fr"><div><b>'+Math.round(100*(S.rdv.length-S.abs)/S.rdv.length)+' %</b><small>venues</small></div><div><b>'+S.abs+'</b><small>absente'+(S.abs>1?'s':'')+' · acompte gardé</small></div></div>')+
  '</div>'};
/* ---------- Mon salon ---------- */
V.reg=function(){return hi('Mon salon','Prestations, acompte, horaires et options.')+'<div class="pile">'+
   blk('Mes prestations','ciseaux',PR.map(function(p){return ln(p[3],p[0],(p[1]>=60?Math.floor(p[1]/60)+' h'+(p[1]%60?' '+p[1]%60:''):p[1]+' min'),'toast(\'Prix et durée modifiables d’une touche (exemple)\',\'pinceau\')','<span class="prix">'+p[2]+' €</span>')}).join('')+
     AUTRES.map(function(a){return ln('list',a[0],a[1]+' prestation'+(a[1]>1?'s':''),'toast(\'Repris de Booksy à la mise en service\',\'list\')','<span class="etq">À reprendre</span>')}).join('')+'<p class="mini">Prix des 3 premières : sa page Booksy. Le reste de la carte est repris à la mise en service.</p>')+
   blk('Acompte à la réservation','euro','<div class="chips">'+[0,20,30,50].map(function(v){return '<button class="pk" aria-pressed="'+(S.acompte===v)+'" onclick="S.acompte='+v+';save();go(\'reg\');toast(\''+(v?'Acompte de '+v+' %':'Sans acompte')+'\',\'euro\')">'+(v?v+' %':'Aucun')+'</button>'}).join('')+'</div><p class="mini">Déduit le jour du rendez-vous. Gardé si la cliente ne vient pas.</p>',opt('resa'))+
   blk('Horaires','clock',ln('cal','Mardi au vendredi','Sur rendez-vous','toast(\'Horaires modifiables (exemple)\',\'clock\')')+ln('cal','Certains samedis','Ouverts un par un dans l’agenda','toast(\'Horaires modifiables (exemple)\',\'clock\')'))+
   blk('Mes options','sparks',
     ln('cal','Réservation','Créneaux en ligne + acompte · active','toast(\'Option Réservation active\',\'cal\')','<span class="etq ok">Active</span>')+
     ln('send','SMS','Rappel la veille, « Votre place est libérée » · active','toast(\'Option SMS active\',\'send\')','<span class="etq ok">Active</span>')+
     ln('etoile','Avis Google','Demande d’avis après la visite · active','toast(\'Option Avis Google active\',\'etoile\')','<span class="etq ok">Active</span>')+
     ln('insta','Réseaux sociaux','Publier sur Instagram depuis l’Espace','toast(\'Option non prise\',\'insta\')','<span class="etq">Non prise</span>'))+
  '</div>'};
/* ---------- actions ---------- */
function trouve(id){for(var i=0;i<S.rdv.length;i++)if(S.rdv[i].id===id)return S.rdv[i]}
function rdv(id){var r=trouve(id);
  var dd=dk(r.d);
  fen('<h3>'+esc(nom(r))+'</h3><p class="sous">'+jNom(dd,true)+' à '+r.h+' · '+PR[r.p][0]+'</p>'+
   (r.web?'<p>'+opt('resa')+' Réservé en ligne sur votre site</p>':'')+
   '<div class="chif" style="grid-template-columns:repeat(3,1fr);margin:10px 0"><div><b>'+tot(r)+' €</b><small>prix</small></div><div><b>'+(r.ac?acpt(r):0)+' €</b><small>acompte payé</small></div><div><b>'+(r.etat==='fait'?0:reste(r))+' €</b><small>reste</small></div></div>'+
   (r.etat==='prevu'?'<button class="go" style="width:100%" onclick="encaisser(\''+id+'\')">'+ic('euro')+'Encaisser '+reste(r)+' €</button>'+
     '<div class="row" style="margin-top:8px"><button class="btn2 pk" style="flex:1" onclick="'+(r.c?'sms(\''+r.c+'\')':'toast(\'SMS envoyé (exemple)\',\'send\')')+'">'+ic('send')+'SMS</button><button class="btn2 pk" style="flex:1" onclick="toast(\'Glissez le rendez-vous dans l’agenda (exemple)\',\'cal\')">'+ic('clock')+'Déplacer</button><button class="btn2 pk" style="flex:1" onclick="absente(\''+id+'\')">'+ic('lapin')+'Absente</button></div>'
    :r.etat==='fait'?'<button class="go" style="width:100%" onclick="facture(\''+id+'\')">'+ic('doc')+'Voir la facture</button>':'<p class="mini">Absente : l’acompte de '+acpt(r)+' € vous reste.</p>')+
   (r.c?'<button class="btn2 pk" style="width:100%;margin-top:8px" onclick="fiche(\''+r.c+'\')">'+ic('user')+'Fiche de '+prenom(r)+'</button>':''))}
function encaisser(id){var r=trouve(id);r.etat='fait';r.paye=true;save();fermer();go(cur);toast('Encaissé · '+reste(r)+' € · facture prête','euro');
  setTimeout(function(){toast('Demain, '+prenom(r)+' reçoit un SMS pour laisser un avis Google','etoile')},2800)}
function absente(id){var r=trouve(id);r.etat='absente';S.abs++;save();fermer();go(cur);toast('Acompte de '+acpt(r)+' € gardé · créneau libéré','lapin')}
function facture(id){var r=trouve(id);fen('<h3>Facture</h3><p class="sous">Chez Julie · 43 rue Pierre Mendès France, Le Versoud</p>'+
  '<div class="formule" style="font-weight:600">'+esc(nom(r))+'<br>'+PR[r.p][0]+' : <b>'+tot(r)+' €</b><br>Acompte en ligne : '+(r.ac?acpt(r):0)+' €<br>Payé au salon : '+(tot(r)-(r.ac?acpt(r):0))+' €</div>'+
  '<div class="row" style="margin-top:12px"><button class="go" style="flex:1" onclick="fermer();toast(\'Facture envoyée par e-mail (exemple)\',\'send\')">'+ic('send')+'Envoyer</button></div><p class="mini">Exemple : aucune facture réelle n’est créée.</p>')}
function sms(id){var c=cl(id);fen('<h3>SMS à '+c.n.split(' ')[0]+'</h3>'+opt('sms')+'<div class="formule" style="font-weight:600;margin-top:10px">Bonjour '+c.n.split(' ')[0]+', c’est Julie. Une place s’est libérée demain à 14 h 15, elle vous intéresse ? Répondez OUI pour la réserver.</div>'+
  '<button class="go" style="width:100%;margin-top:12px" onclick="fermer();toast(\'SMS envoyé (exemple)\',\'send\')">'+ic('send')+'Envoyer</button>')}
function ajout(d,h){fen('<h3>Nouveau rendez-vous</h3><p class="sous">'+h+' · touchez la cliente puis la prestation</p><div class="chips" id="aj-c">'+CL.map(function(c,i){return '<button class="pk" aria-pressed="'+(i===0)+'" data-c="'+c.id+'">'+c.n+'</button>'}).join('')+'</div>'+
  '<h2 style="margin-top:12px">'+ic('ciseaux')+'Prestation</h2><div class="chips" id="aj-p">'+PR.map(function(p,i){return '<button class="pk" aria-pressed="'+(i===0)+'" data-p="'+i+'">'+p[0]+' · '+p[2]+' €</button>'}).join('')+'</div>'+
  '<button class="go" style="width:100%;margin-top:14px" id="aj-ok">'+ic('check')+'Ajouter</button><p class="mini">Ajouté à la main : pas d’acompte, sauf si vous envoyez le lien de paiement par SMS.</p>');
  ['aj-c','aj-p'].forEach(function(g){$(g).onclick=function(e){var b=e.target.closest('button');if(!b)return;[].forEach.call(this.children,function(x){x.setAttribute('aria-pressed',x===b)})}});
  $('aj-ok').onclick=function(){var c=$('aj-c').querySelector('[aria-pressed="true"]').dataset.c,p=+$('aj-p').querySelector('[aria-pressed="true"]').dataset.p;
    S.rdv.push({id:'m'+Date.now(),c:c,p:p,d:d,h:h,ac:false,etat:'prevu',paye:false});save();fermer();go('rdv');toast('Rendez-vous ajouté · '+cl(c).n.split(' ')[0]+' prévenue par SMS','cal')}}
/* ---------- navigation (menu commun ProClik) ---------- */
var NAV=[['jour','home','Aujourd’hui'],['rdv','cal','Agenda'],['cli','users','Clientes'],['arg','euro','Paiements'],['chi','chart','Chiffres'],['reg','reglages','Mon salon']];
var cur='jour';
function nb(o){if(o==='jour')return S.rdv.filter(function(r){return r.web&&r.etat==='prevu'}).length;return 0}
function rNav(){$('nav').innerHTML=NAV.map(function(n){var c=nb(n[0]);return '<button role="tab" data-o="'+n[0]+'" data-v="'+n[0]+'" id="nb-'+n[0]+'" aria-selected="'+(cur===n[0])+'"><span class="ico" aria-hidden="true">'+ic(n[1])+'</span>'+n[2]+'<span class="badge"'+(c?'':' hidden')+'>'+(c||'')+'</span></button>'}).join('')}
$('nav').addEventListener('click',function(e){var b=e.target.closest('button[data-o]');if(b)go(b.dataset.o)});
function go(o){cur=o;rNav();$('m').innerHTML=V[o]();scrollTo(0,0);if(window.PCBarre&&go.k!==1){go.k=1;setTimeout(function(){PCBarre.applique()},0)}}
var DICT=['Ajoute Camille mardi à 10 h 15 pour une coupe','Note pour Inès : racines 5.3 + 20 volumes','Combien j’ai fait cette semaine ?','Envoie à Sarah que sa place de jeudi est libérée'];
function dictee(){fen('<div style="text-align:center;padding:6px 0 4px"><span class="dic-m">'+ic('mic')+'</span><h3 style="margin:12px 0 4px">Parlez à ProClik</h3><p class="sous" style="margin:0">Les mains prises ? Dites-le, ça se range tout seul.</p></div>'+
  DICT.map(function(t){return '<button class="ln pk" onclick="fermer();toast(\'C’est noté (exemple)\',\'mic\')"><span class="ico">'+ic('mic')+'</span><span class="tx"><b style="white-space:normal">« '+t+' »</b></span></button>'}).join('')+
  '<p class="mini" style="text-align:center;margin-top:10px">Exemples de démonstration : touchez une phrase</p>')}
window.PC_MENU={cle:false,familles:[],reglages:false,micro:dictee,
  tous:function(){return NAV.map(function(n){return n[0]})},
  defaut:function(){return ['jour','rdv','cli','arg']}};
$('logo').innerHTML=PCD.logo;$('b-site').innerHTML=ic('monitor');$('b-th').innerHTML=PCD.themeIc();$('b-th').onclick=PCD.toggleTheme;
var neuf=charger();
var q=new URLSearchParams(location.search);if(q.get('reset')){try{localStorage.removeItem('pcd-cj-v1');localStorage.removeItem('pcd-cj-resa')}catch(e){}S=etat0();save()}
if(q.get('o')&&V[q.get('o')])cur=q.get('o');
go(cur);
if(neuf)setTimeout(function(){toast(neuf>1?neuf+' nouvelles réservations en ligne':'Nouvelle réservation en ligne · acompte payé','cal')},500);
addEventListener('pageshow',function(e){if(e.persisted){var n=charger();go(cur);if(n)toast('Nouvelle réservation en ligne · acompte payé','cal')}});
