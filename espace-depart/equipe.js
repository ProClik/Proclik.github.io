/* Module « Équipe » de l'Espace ProClik (Cyril, 15/11 : « garder le même style que le planning de BRS, mais ajouter une partie
   comme celle de RT2O »). Une vue de plus dans le Planning : qui est sur quel chantier chaque jour, combien de personnes,
   s'il en manque, et la semaine de chaque personne. Même dessin que le reste du Planning de BRS (cartes, segments, feuille du bas).
   Module activable par entreprise (Mes options › Équipe). Personnes et affectations d'exemple tant que l'équipe n'est pas branchée.
   24/11 (Cyril : « la gestion des employés sur le chantier ») : affectations rangées par DATE (plus par n° de jour de la semaine),
   semaines qui défilent (‹ ›), et window.PCEQ partagé avec la fiche du chantier (bloc « Votre équipe sur ce chantier »). */
(function(){
'use strict';
var d=document,X=window.PCX,O=window.PCOPT;if(!X)return;
function $(s,r){return (r||d).querySelector(s)}
function $$(s,r){return [].slice.call((r||d).querySelectorAll(s))}
var esc=X.esc||function(s){return String(s)};

/* ---------- données (partagées avec la fiche chantier) ---------- */
var JOURS=['Lun.','Mar.','Mer.','Jeu.','Ven.'],JL=['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'],JC=['dim.','lun.','mar.','mer.','jeu.','ven.','sam.'],
 MOIS=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
var EQ=[{n:'Thomas',r:'Chef'},{n:'Kevin',r:'Plaquiste'},{n:'Mathieu',r:'Plaquiste'},{n:'Lucas',r:'Apprenti'}];
var COUL=['var(--k-run)','var(--k-visit)','var(--k-liv)','var(--k-autre)','var(--k-devis)','var(--k-plan)'];
function p2(n){return (n<10?'0':'')+n}
function iso(x){return x.getFullYear()+'-'+p2(x.getMonth()+1)+'-'+p2(x.getDate())}
function dte(s){return new Date(s+'T12:00:00')}
function plus(x,n){var y=new Date(x);y.setDate(y.getDate()+n);return y}
function lundiDe(x){var y=new Date(x);y.setHours(12,0,0,0);y.setDate(y.getDate()-((y.getDay()+6)%7));return y}
function auj(){return window.PCDEMO?PCDEMO.today():new Date()}
var LUN0=lundiDe(auj());
function chantiers(){var C=X.CH||{};return Object.keys(C).map(function(k){return C[k]}).filter(function(c){return c&&c.st!=='done'})}
function couleur(id){var L=chantiers().map(function(c){return c.id});var i=L.indexOf(id);return COUL[(i<0?0:i)%COUL.length]}
function lettre(c){return (c.n||'?').replace(/^(M\.|Mme|Cabinet|SCI)\s+/,'').charAt(0).toUpperCase()}
/* jours de travail d'un chantier = ses jours « Chantier » du planning */
function evJours(id){var c=(X.CH||{})[id],o={};(X.EV||[]).forEach(function(e){if(e.k!=='run')return;var x=e.x||{};
  if(x.ch===id||(id==='alpes'&&x.ch===1)||(c&&c.n&&String(e.t||'').indexOf(c.n)>-1))o[e.d]=1});return Object.keys(o).sort()}
var K='pc-eq2';
function lit(){try{return JSON.parse(localStorage.getItem(K)||'null')}catch(e){return null}}
function ecrit(){try{localStorage.setItem(K,JSON.stringify(S))}catch(e){}}
var S=lit();
if(!S||!S.jr){S={jr:{},bes:{},env:{},prev:{}};
  var L=chantiers().map(function(c){return c.id}),a=L[0],b=L[1]||L[0],Ja=evJours(a);
  var M={Thomas:[a,a,b,b,'bureau'],Kevin:[a,a,a,b,b],Mathieu:[b,b,a,a,a],Lucas:[a,a,'',b,b]};
  [0,7].forEach(function(w){for(var i=0;i<5;i++){var k=iso(plus(LUN0,w+i)),o=S.jr[k]={};
    EQ.forEach(function(p,j){var v=M[p.n][i];if(v===a&&Ja.length&&Ja.indexOf(k)<0)v=(j%2&&L[2])?L[2]:b;o[p.n]=v});
    L.forEach(function(id){if(!evJours(id).length)(S.bes[id]=S.bes[id]||{})[k]=2})}});
  ecrit()}
['jr','bes','env','prev'].forEach(function(k){if(!S[k])S[k]={}});
/* tâches par personne et par jour (Cyril 24/11) : lignes de travaux du chantier ; exemple : travaux pas finis répartis sur les jours */
if(!S.ta){S.ta={};chantiers().forEach(function(c){var R=(c.ouv||[]).filter(function(o){return o[2]<100}).map(function(o){return o[0]}),i=0;if(!R.length)return;
  Object.keys(S.jr).sort().forEach(function(k){EQ.forEach(function(p){if(get(k,p.n)===c.id){(S.ta[k]=S.ta[k]||{})[p.n]=[R[i%R.length]];i++}})})});ecrit()}
function taches(k,n){return ((S.ta[k]||{})[n]||[]).slice()}
function togTache(k,n,t){var o=S.ta[k]=S.ta[k]||{},L=o[n]=o[n]||[],i=L.indexOf(t);if(i>-1)L.splice(i,1);else L.push(t);ecrit();bouge()}
function get(k,n){return (S.jr[k]||{})[n]||''}
function set(k,n,v){(S.jr[k]=S.jr[k]||{})[n]=v;ecrit();bouge()}
function qui(id,k){return EQ.filter(function(p){return get(k,p.n)===id})}
function besoin(id,k){var B=S.bes[id];if(B&&B[k]!=null)return B[k];var J=evJours(id);return J.indexOf(k)>-1?2:0}
function setBesoin(id,k,n){(S.bes[id]=S.bes[id]||{})[k]=Math.max(0,n);ecrit();bouge()}
/* jours à venir d'un chantier (aujourd'hui compris) : ceux du planning, sinon les 5 prochains jours ouvrés */
function jours(id){var T=iso(auj()),J=evJours(id).filter(function(k){return k>=T});if(J.length)return J;
  var c=(X.CH||{})[id];if(c&&c.st==='done')return [];var R=[],x=auj();while(R.length<5){if(x.getDay()%6)R.push(iso(x));x=plus(x,1)}return R}
function nomCase(v){if(!v)return 'Rien de prévu';if(v==='bureau')return 'Au bureau';if(v==='repos')return 'Repos ou congé';if(ABS[v])return ABS[v];var c=(X.CH||{})[v];return c?c.n:v}
/* ce qu'on a envoyé à l'équipe pour un chantier : signature des affectations, pour voir s'il y a eu des changements depuis */
function sig(id){return jours(id).map(function(k){return k+':'+qui(id,k).map(function(p){return p.n+'='+taches(k,p.n).join(',')}).join('+')}).join('|')}
function prevenir(id){var Q={};jours(id).forEach(function(k){qui(id,k).forEach(function(p){Q[p.n]=1})});var N=Object.keys(Q);
  S.prev[id]={d:iso(auj()),sig:sig(id),qui:N,vu:N.slice(0,Math.max(0,N.length-1))};ecrit();bouge();return N}
function prevenu(id){var P=S.prev[id];if(!P)return null;return {d:P.d,qui:P.qui||[],vu:P.vu||[],change:P.sig!==sig(id)}}
/* même équipe que la journée de chantier (pc-eq, heures en plus) : on y ajoute les personnes du planning */
(function(){try{var E=JSON.parse(localStorage.getItem('pc-eq')||'null')||[],ch=false;EQ.forEach(function(p,i){if(!E.some(function(x){return x.p===p.n})){E.push({id:'e'+(i+1),p:p.n,h:35});ch=true}});
  if(ch)localStorage.setItem('pc-eq',JSON.stringify(E))}catch(e){}})();
var ecoute=[];function bouge(){ecoute.forEach(function(f){try{f()}catch(e){}})}
function jourLong(k){var x=dte(k);return JL[x.getDay()]+' '+x.getDate()+' '+MOIS[x.getMonth()]}
function jourCourt(k){var x=dte(k);return JC[x.getDay()]+' '+x.getDate()}
function relatif(k){var T=iso(auj()),D=iso(plus(auj(),1));return k===T?'Aujourd\'hui':k===D?'Demain':jourCourt(k)}
/* ---------- brouillon / publié ---------- */
function val(k,n){var v=get(k,n);return v?v+'|'+taches(k,n).join(','):''}
if(!S.pub){S.pub={};Object.keys(S.jr).forEach(function(k){var o=S.pub[k]={};EQ.forEach(function(p){o[p.n]=val(k,p.n)})});ecrit()}
function pubVal(k,n){var o=S.pub[k];return o&&o[n]!=null?o[n]:''}
function brouillon(k,n){return val(k,n)!==pubVal(k,n)}
/* ce que voit le salarié = la version publiée */
function pGet(k,n){return pubVal(k,n).split('|')[0]}
function pTaches(k,n){var t=pubVal(k,n).split('|')[1];return t?t.split(','):[]}
function pQui(id,k){return EQ.filter(function(p){return pGet(k,p.n)===id})}
function changes(K){var R=[];K.forEach(function(k){EQ.forEach(function(p){if(brouillon(k,p.n))R.push([k,p.n])})});return R}
function publier(K){var C=changes(K),N={};C.forEach(function(x){(S.pub[x[0]]=S.pub[x[0]]||{})[x[1]]=val(x[0],x[1]);N[x[1]]=1});ecrit();return Object.keys(N)}
/* ---------- absences et congés (Cyril 24/11 : un Espace pour chaque personne) ----------
   le salarié demande depuis son Espace (Terrain), la Direction accepte ou refuse dans Planning › Équipe ;
   acceptée = ses jours deviennent « Congé » ou « Malade », publiés tout de suite, et les chantiers où il manquait du monde le montrent */
if(!S.abs){S.abs=[{id:'a1',qui:'Mathieu',ty:'conge',du:iso(plus(LUN0,14)),au:iso(plus(LUN0,16)),mo:'Mariage de ma sœur',st:'att',le:iso(auj())}];ecrit()}
if(!S.ou)S.ou={};
var ABS={conge:'Congé',malade:'Malade',rdv:'Rendez-vous',autre:'Absent'};
function absences(){return S.abs.slice()}
function demanderAbs(o){o.id='a'+Date.now();o.st='att';o.le=iso(auj());S.abs.push(o);ecrit();bouge();return o}
function joursAbs(o){var R=[],x=dte(o.du),f=dte(o.au);while(x<=f){if(x.getDay()%6)R.push(iso(x));x=plus(x,1)}return R}
function repondreAbs(id,ok){var o=S.abs.filter(function(a){return a.id===id})[0];if(!o)return null;o.st=ok?'ok':'non';
  if(ok)joursAbs(o).forEach(function(k){(S.jr[k]=S.jr[k]||{})[o.qui]=o.ty;if(S.ta[k])delete S.ta[k][o.qui];(S.pub[k]=S.pub[k]||{})[o.qui]=val(k,o.qui)});
  ecrit();bouge();return o}
/* « Où je suis » : présence seulement (pas de pointage, salariés payés au mois, règle de Cyril du 14/11) */
var OU={chantier:'Sur le chantier',route:'En route',depot:'Au dépôt',client:'Chez un client (devis)',four:'Chez un fournisseur',bureau:'Au bureau'};
function ouSuis(n){var o=S.ou[n];return o&&o.d===iso(auj())?o:null}
function setOu(n,v){var x=new Date();S.ou[n]={v:v,d:iso(auj()),h:x.getHours()+'h'+p2(x.getMinutes())};ecrit();bouge()}
/* ---------- photo de chaque personne (Cyril 24/11 21h42) : à la place des initiales, partout ----------
   Mise par la personne elle-même (son Espace) ou par le patron (sa fiche). Recadrée en carré, 256 px, JPEG léger.
   Rangée dans pc-eq2 (ph[prénom]) : le service la sort vers le coffre photos et la remplace par un lien. */
if(!S.ph||typeof S.ph!=='object')S.ph={};
function photo(n){var u=S.ph&&S.ph[n];return typeof u==='string'&&/^(data:image\/|https:\/\/)/.test(u)?u:''}
function setPhoto(n,u){S.ph[n]=u||'';ecrit();bouge()}
function ini(n){var u=photo(n);return u?'<img src="'+esc(u)+'" alt="" loading="lazy">':esc(String(n||'?').charAt(0))}
/* sous-traitant : l'icône de SON MÉTIER (électricien, plombier, carreleur…) à la place d'une photo (Cyril 24/11 21h53) ;
   même jeu d'icônes que le chantier partagé (chantiers.js MET), sinon un petit immeuble */
function stIc(t){var m=window.PCCH&&PCCH.metPath?PCCH.metPath(t):null;if(!m)return STI;
  return '<svg viewBox="0 0 24 24" width="60%" height="60%" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+m.p+'</svg>'}
function stTit(t){var m=window.PCCH&&PCCH.metPath?PCCH.metPath(t):null;return esc((t&&t.m)||(m&&m.t)||'Sous-traitant')}
var STI='<svg viewBox="0 0 24 24" width="60%" height="60%" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 21h18M5 21V8l6-4v17M11 9h8v12M14 12.5h2M14 16h2M7.5 10.5h1M7.5 14h1M7.5 17.5h1"/></svg>';
function couleurP(n){var A=['#56607A','#8A6D4B','#4E7C86','#7A6491','#5E7A5A','#8A5A64'],i=EQ.map(function(p){return p.n}).indexOf(n);return A[(i<0?0:i)%A.length]}
function lirePhoto(f,cb){var r=new FileReader();r.onload=function(){var im=new Image();im.onload=function(){var c=d.createElement('canvas'),z=256,w=im.naturalWidth,h=im.naturalHeight,m=Math.min(w,h);
    c.width=c.height=z;var g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,z,z);g.drawImage(im,(w-m)/2,(h-m)/2,m,m,0,0,z,z);cb(c.toDataURL('image/jpeg',.85))};
  im.onerror=function(){X.toast('Image illisible','Essayez une autre photo.')};im.src=r.result};r.readAsDataURL(f)}
function prendrePhoto(n,cam,fin){var i=d.createElement('input');i.type='file';i.accept='image/*';if(cam)i.setAttribute('capture','user');i.style.display='none';d.body.appendChild(i);
  i.onchange=function(){var f=i.files&&i.files[0];if(i.parentNode)i.parentNode.removeChild(i);if(!f)return;lirePhoto(f,function(u){setPhoto(n,u);X.toast('Photo enregistrée','Elle remplace les initiales de '+n+' partout.');if(fin)fin()})};i.click()}
function fenPhoto(n,moiMeme){function corps(){var u=photo(n);return '<div class="eqph"><span class="eqa xl" style="background:'+couleurP(n)+'">'+ini(n)+'</span><p class="hint">'+(moiMeme?'Votre photo s\'affiche à la place de vos initiales, partout dans l\'Espace de l\'équipe.':'Elle s\'affiche à la place des initiales de '+esc(n)+', partout dans l\'Espace.')+'</p></div>'+
    '<div class="eqph-b"><button type="button" class="btn go" data-phc="1">Prendre une photo</button><button type="button" class="btn" data-phc="0">Choisir une image</button>'+(u?'<button type="button" class="btn" data-phx>Retirer la photo</button>':'')+'</div>'}
  X.xopen(moiMeme?'Ma photo':'Photo de '+n,'',corps(),'',lie);
  function lie(){$$('#x-in [data-phc]').forEach(function(b){b.onclick=function(){prendrePhoto(n,b.dataset.phc==='1',function(){$('#x-in').innerHTML=corps();lie()})}});
    var x=$('#x-in [data-phx]');if(x)x.onclick=function(){setPhoto(n,'');$('#x-in').innerHTML=corps();lie();X.toast('Photo retirée','Les initiales reviennent.')}}}
window.PCEQ={EQ:EQ,STI:STI,stIc:stIc,photo:photo,setPhoto:setPhoto,ini:ini,fenPhoto:fenPhoto,iso:iso,get:get,set:set,taches:taches,togTache:togTache,qui:qui,besoin:besoin,setBesoin:setBesoin,jours:jours,nomCase:nomCase,prevenir:prevenir,prevenu:prevenu,
  jourLong:jourLong,jourCourt:jourCourt,relatif:relatif,ecoute:function(f){ecoute.push(f)},
  pGet:pGet,pTaches:pTaches,pQui:pQui,brouillon:brouillon,ABS:ABS,absences:absences,demanderAbs:demanderAbs,repondreAbs:repondreAbs,joursAbs:joursAbs,OU:OU,ouSuis:ouSuis,setOu:setOu,dte:dte,plus:plus,auj:auj,couleur:couleur};

if(!$('#v-planning'))return;
if(O&&O.actif('equipe')===false)return;
var WK=0;
function kj(j){return iso(plus(LUN0,7*WK+j))}
function date(j){return plus(LUN0,7*WK+j).getDate()}
function titreSem(){var a=plus(LUN0,7*WK),b=plus(a,4);return 'Semaine du '+a.getDate()+(a.getMonth()!==b.getMonth()?' '+MOIS[a.getMonth()]:'')+' au '+b.getDate()+' '+MOIS[b.getMonth()]}

/* ---------- la vue ---------- */
var seg=$('#v-planning .seg'),pv=d.createElement('div');pv.id='p-equipe';pv.className='pv';pv.hidden=true;pv.style.marginTop='12px';
$('#v-planning').appendChild(pv);
var bt=d.createElement('button');bt.setAttribute('role','tab');bt.id='seg-equipe';bt.dataset.seg='equipe';bt.setAttribute('aria-selected','false');bt.textContent='Équipe';
if(seg)seg.appendChild(bt);
bt.addEventListener('click',function(){$$('button',seg).forEach(function(x){x.setAttribute('aria-selected',String(x===bt))});$$('#v-planning .pv').forEach(function(p){p.hidden=p!==pv});rend()});
ecoute.push(function(){if(!pv.hidden)rend()});

/* 24/11 12h (Cyril : « pas assez clair, un peu brouillon, surtout pour les salariés ») : deux écrans, deux besoins.
   PATRON = le planning d'équipe classique : une ligne par salarié, une colonne par jour, le chantier écrit en couleur dans la case
   (+ ce qu'il fait), case rouge = rien de prévu, ligne « Il manque » en bas ; le Mois = le même tableau qui glisse.
   SALARIÉ = « Ma semaine » : une carte par jour (où, adresse + Itinéraire, heures, ce que je fais, avec qui).
   24/11 14h (Cyril : « inspire-toi des grandes entreprises ») : comme Skello, Connecteam, When I Work, Obat :
   1) bascule « Par personne / Par chantier » ; 2) BROUILLON : ce qui a changé depuis la dernière publication est hachuré,
   le salarié ne voit que la version publiée, « Publier et prévenir » n'envoie que les changements ;
   3) « Copier la semaine d'avant » ; 4) heures de chacun au bout de sa ligne (8 h par jour, contrat 39 h, courant dans le bâtiment : exemple à régler). */
var SEL=null,VUE='sem',MO=0,QUI=EQ[0].n,BY='p',ANNUL=null;
function court(v){if(!v)return '';if(v==='bureau')return 'Bureau';if(v==='repos')return 'Repos';if(ABS[v])return ABS[v];var c=(X.CH||{})[v];if(!c)return v;
  var w=(c.n||'').replace(/^(M\.|Mme|Cabinet|SCI|Maison)\s+/,'').split(/[\s·,]+/)[0];return w.length>8?w.slice(0,7)+'.':w}
function evDe(id,k){var c=(X.CH||{})[id];return (X.EV||[]).filter(function(e){var x=e.x||{};return e.k==='run'&&e.d===k&&(x.ch===id||(id==='alpes'&&x.ch===1)||(c&&String(e.t||'').indexOf(c.n)>-1))})[0]}
function heures(id,k){var e=evDe(id,k);return e?e.s.replace(':','h')+' – '+e.e.replace(':','h'):'8h00 – 17h00'}
/* heures travaillées d'un jour : horaires du chantier moins 1 h de pause, sinon 8 h ; bureau 8 h ; rien / repos 0 */
function hJour(v,k){if(!v||v==='repos'||ABS[v])return 0;var e=v==='bureau'?null:evDe(v,k);if(!e)return 8;
  function m(s){var a=s.split(':');return +a[0]*60+(+a[1]||0)}var n=(m(e.e)-m(e.s))/60;return n>6?n-1:n}
/* heures EN PLUS (règle de Cyril, 17/11) : jamais calculées, c'est le patron qui les ajoute (Cliky lui pose la question le soir, journee.js, clé pc-hs) */
function lsj(k){try{return JSON.parse(localStorage.getItem(k)||'null')}catch(e){return null}}
function hsSem(n,K){var E=lsj('pc-eq')||[],s=E.filter(function(x){return x.p===n})[0];if(!s)return 0;
  return (lsj('pc-hs')||[]).filter(function(x){return x.s===s.id&&K.indexOf(x.d)>-1}).reduce(function(a,x){return a+(+x.h||0)},0)}
function hTxt(n){return (Math.round(n*2)/2).toString().replace('.',',')+' h'}


function choix(){return '<div class="seg eqv" role="tablist" aria-label="Vue de l\'équipe">'+[['sem','Semaine'],['mois','Mois'],['sal','Ce que voit un salarié']].map(function(x){return '<button type="button" role="tab" data-vue="'+x[0]+'" aria-selected="'+(VUE===x[0])+'">'+x[1]+'</button>'}).join('')+'</div>'}
function parQui(){return '<div class="eqby" role="group" aria-label="Lire le tableau"><span>Lire par</span>'+[['p','Personne'],['c','Chantier']].map(function(x){return '<button type="button" data-by="'+x[0]+'" aria-pressed="'+(BY===x[0])+'">'+x[1]+'</button>'}).join('')+'</div>'}
function nav(titre,cle){return '<div class="cal-top"><h3>'+titre+'</h3><div class="cal-nav"><button class="nb" data-'+cle+'="-1" aria-label="Avant">‹</button><button data-'+cle+'="0">Aujourd\'hui</button><button class="nb" data-'+cle+'="1" aria-label="Après">›</button></div></div>'}
function cap(t){return t.replace(/^./,function(x){return x.toUpperCase()})}
function tete(K,T,fin){return '<thead><tr><th class="eqt-n"></th>'+K.map(function(k){var x=dte(k),we=!(x.getDay()%6);
    return '<th class="'+(k===T?'tdy':'')+(we?' we':'')+'"><small>'+JC[x.getDay()].replace('.','')+'</small><b>'+x.getDate()+'</b></th>'}).join('')+(fin?'<th class="eqt-h"><small>En plus</small></th>':'')+'</tr></thead>'}
function legende(CHs,br){return '<div class="eqw-leg">'+CHs.map(function(c){return '<span><i style="background:'+couleur(c.id)+'"></i>'+esc(c.n)+'</span>'}).join('')+'<span><i class="vd"></i>Rien de prévu</span>'+(br?'<span><i class="hb"></i>Pas encore publié</span>':'')+'</div>'}
/* le tableau par personne : K = liste de dates ; large = case avec la tâche + heures au bout */
function tableau(K,large){var CHs=chantiers(),T=iso(auj()),br=0;
  var h='<div class="eqt'+(large?' large':' serre')+'"><table>'+tete(K,T,large)+'<tbody>';
  h+=EQ.map(function(p){var tot=0;return '<tr><th class="eqt-n"><button type="button" class="eq-nm" data-pers="'+p.n+'"><b>'+p.n+'</b>'+(function(){var o=K.indexOf(T)>-1?ouSuis(p.n):null;return o?'<small class="eq-ou1"><i></i>'+OU[o.v]+'</small>':'<small>'+p.r+'</small>'})()+'</button></th>'+K.map(function(k){var v=get(k,p.n),c=(X.CH||{})[v],we=!(dte(k).getDay()%6),t=c?taches(k,p.n):[],b=brouillon(k,p.n);
      tot+=hJour(v,k);if(b)br++;
      if(we&&!v&&!b)return '<td class="we"></td>';
      return '<td><button type="button" class="eqc'+(c?' ch':v?' gris':' vide')+(k===T?' tdy':'')+(b?' br':'')+'" data-eqp="'+p.n+'" data-k="'+k+'" style="'+(c?'--cc:'+couleur(v):'')+'" aria-label="'+p.n+', '+jourLong(k)+' : '+esc(nomCase(v))+(b?' (pas encore publié)':'')+'">'+
        (v?'<b>'+esc(court(v))+'</b>'+(large&&t.length?'<small>'+esc(t[0].toLowerCase())+(t.length>1?' +'+(t.length-1):'')+'</small>':''):'<b>+</b>'+(large?'<small>à placer</small>':''))+'</button></td>'}).join('')+
      (large?(function(){var hs=hsSem(p.n,K);return '<td class="eqt-h'+(hs?' sup':' moins')+'"><button type="button" data-hs="1" aria-label="Heures en plus de '+p.n+' : '+(hs?hTxt(hs):'aucune')+'"><b>'+(hs?'+'+hTxt(hs):'–')+'</b><small>'+(hs?'en plus':'ajouter')+'</small></button></td>'})():'')+'</tr>'}).join('');
  /* ligne « il manque » */
  var lm=K.map(function(k){var L=CHs.filter(function(c){return qui(c.id,k).length<besoin(c.id,k)});
    return '<td>'+L.map(function(c){var m=besoin(c.id,k)-qui(c.id,k).length;return '<button type="button" class="eqm" data-eqc="'+c.id+'" data-k="'+k+'" style="--cc:'+couleur(c.id)+'">'+esc(court(c.id))+' +'+m+'</button>'}).join('')+'</td>'});
  if(lm.join('').indexOf('eqm')>-1)h+='<tr class="eqt-m"><th class="eqt-n"><b>Il manque</b></th>'+lm.join('')+(large?'<td></td>':'')+'</tr>';
  h+=stLignes(K,large);
  h+='</tbody></table></div>'+legende(CHs,br)+bureauOu(K);
  return h}
/* le même tableau par chantier : une ligne par chantier, les prénoms dans la case, rouge s'il manque du monde */
function tableauCh(K,large){var CHs=chantiers(),T=iso(auj());
  var h='<div class="eqt bych'+(large?' large':' serre')+'"><table>'+tete(K,T,false)+'<tbody>';
  h+=CHs.map(function(c){return '<tr><th class="eqt-n"><b><i style="background:'+couleur(c.id)+'"></i>'+esc(court(c.id))+'</b><small>'+esc(c.v||'')+'</small></th>'+K.map(function(k){var Q=qui(c.id,k),B=besoin(c.id,k),m=B-Q.length,we=!(dte(k).getDay()%6),b=Q.some(function(p){return brouillon(k,p.n)});
      if(!Q.length&&B<=0)return we?'<td class="we"></td>':'<td><button type="button" class="eqc rien" data-eqc="'+c.id+'" data-k="'+k+'" aria-label="'+esc(c.n)+', '+jourLong(k)+' : rien de prévu"></button></td>';
      return '<td><button type="button" class="eqc ch'+(m>0?' man':'')+(k===T?' tdy':'')+(b?' br':'')+'" data-eqc="'+c.id+'" data-k="'+k+'" style="--cc:'+couleur(c.id)+'" aria-label="'+esc(c.n)+', '+jourLong(k)+' : '+(Q.map(function(p){return p.n}).join(', ')||'personne')+(m>0?', il manque '+m:'')+'">'+
        (large?Q.map(function(p){return '<small class="nm">'+p.n+'</small>'}).join(''):'<b>'+Q.length+'</b>')+(m>0?'<em>+'+m+(large?'<span> à trouver</span>':'')+'</em>':'')+'</button></td>'}).join('')+'</tr>'}).join('');
  /* personne de libre ce jour-là */
  h+='<tr class="eqt-m"><th class="eqt-n"><b>Pas placé</b></th>'+K.map(function(k){var we=!(dte(k).getDay()%6),P=we?[]:EQ.filter(function(p){return !get(k,p.n)});
    if(!large)return '<td>'+(P.length?'<button type="button" class="eqm" data-eqp="'+P[0].n+'" data-k="'+k+'" aria-label="'+P.length+' pas placé'+(P.length>1?'s':'')+'">'+P.length+'</button>':'')+'</td>';
    return '<td>'+P.map(function(p){return '<button type="button" class="eqm" data-eqp="'+p.n+'" data-k="'+k+'">'+p.n+'</button>'}).join('')+'</td>'}).join('')+'</tr>';
  h+='</tbody></table></div>'+legende(CHs,0).replace('Rien de prévu','Contour rouge : il manque du monde');
  return h}
/* sous-traitants du planning (Planning › + › sous-traitant) : une ligne laiton par entreprise, ses jours sur nos chantiers */
function stLignes(K,large){var P=window.PCPLAN&&PCPLAN.st,ids=[];(X.EV||[]).forEach(function(e){if(e.k==='st'&&e.x&&e.x.st&&K.indexOf(e.d)>-1&&ids.indexOf(e.x.st)<0)ids.push(e.x.st)});
  return ids.map(function(id){var t=P&&P.de?P.de(id):null;if(!t)return '';
    return '<tr class="eqt-st"><th class="eqt-n"><b>'+esc(t.n.split(' ')[0])+'</b><small>'+esc(t.m||'Sous-traitant')+'</small></th>'+K.map(function(k){var e=(X.EV||[]).filter(function(e){return e.k==='st'&&e.d===k&&e.x&&e.x.st===id})[0];
      if(!e)return '<td></td>';var ch=e.x.ch;return '<td><span class="eqc st" title="'+esc(e.t)+'"><b>'+esc(court(ch))+'</b>'+(large?'<small>sous-traitant</small>':'')+'</span></td>'}).join('')+(large?'<td></td>':'')+'</tr>'}).join('')}
/* patrons et bureau : où ils sont aujourd'hui (« Où je suis » est pour toute l'entreprise) */
function bureauOu(K){var T=iso(auj());if(K.indexOf(T)<0||!window.PCPERS)return '';var L=[(window.PCID&&PCID.prenom)||'Julien','Claire'];
  var h=L.map(function(n){var o=ouSuis(n);return '<button type="button" class="eq-bo" data-pers="'+n+'"><b>'+n+'</b> '+(o?OU[o.v]:'pas encore dit')+'</button>'}).join('');
  return '<div class="eq-bou"><span>Patrons et bureau aujourd\'hui :</span>'+h+'</div>'}
/* demandes d'absence en attente (envoyées depuis l'Espace Terrain du salarié) */
function demandes(){var A=S.abs.filter(function(a){return a.st==='att'});if(!A.length)return '';
  return '<div class="eq-dem"><h4>Demande'+(A.length>1?'s':'')+' d\'absence</h4>'+A.map(function(a){var J=joursAbs(a);
    var autres=S.abs.filter(function(b){return b!==a&&b.st==='ok'&&joursAbs(b).some(function(k){return J.indexOf(k)>-1})}).map(function(b){return b.qui}),
      ch=[];J.forEach(function(k){var v=get(k,a.qui);if((X.CH||{})[v]&&ch.indexOf(v)<0)ch.push(v)});
    var verif='Cliky a vérifié : '+(autres.length?'<b>'+autres.join(', ')+' '+(autres.length>1?'sont':'est')+' déjà absent'+(autres.length>1?'s':'')+'</b> ces jours-là':'personne d\'autre n\'est absent')+
      (ch.length?' ; '+a.qui+' était prévu sur '+ch.map(function(c){return esc(court(c))}).join(', ')+', il faudra le remplacer.':' ; le planning reste tenable.');
    return '<div class="eq-dm"><div class="tx"><b>'+a.qui+' · '+ABS[a.ty]+'</b><small>'+(a.du===a.au?jourLong(a.du):'du '+jourLong(a.du)+' au '+jourLong(a.au))+' · '+J.length+' jour'+(J.length>1?'s':'')+'</small>'+(a.mo?'<small>« '+esc(a.mo)+' »</small>':'')+'<small class="eq-vf">'+verif+'</small></div>'+
      '<div class="eq-db"><button type="button" class="btn sm" data-absn="'+a.id+'">Refuser</button><button type="button" class="btn sm go" data-abso="'+a.id+'">Accepter</button></div></div>'}).join('')+'</div>'}
function rendSem(){var K=[0,1,2,3,4].map(kj),C=changes(K),h='',W=largeEcran(),barres=W&&BY==='p';
  h+=nav(titreSem(),'wk')+demandes();
  if(!W)h+=rendJour(K);
  else{h+=parQui();
    if(barres)h+='<p class="hint eqt-hint">Touchez une case pour la changer, ou faites glisser une barre vers un autre jour ou une autre personne. Tirez le bout d\'une barre pour l\'allonger.</p><div class="eqw-l"><div>'+semaineGrille(K)+'</div><aside class="eqw-s">'+aRegler(K)+ouChacun(K)+'</aside></div>';
    else h+='<p class="hint eqt-hint">Touchez une case pour choisir qui va sur ce chantier ce jour-là.</p>'+tableauCh(K,true)}
  h+='<div class="eq-act"><button type="button" class="btn" id="eq-copie"><span class="lab"><span>Copier la semaine d\'avant</span></span></button>'+(ANNUL&&ANNUL.wk===WK?'<button type="button" class="btn" id="eq-annul"><span class="lab"><span>Annuler la copie</span></span></button>':'')+'</div>';
  if(C.length){var N={};C.forEach(function(x){N[x[1]]=1});N=Object.keys(N);
    h+='<p class="hint" style="text-align:center">Les cases hachurées ne sont pas encore publiées : '+N.join(', ')+(N.length>1?' ne voient':' ne voit')+' pas encore ces changements. Seul'+(N.length>1?'s eux seront prévenus':' lui sera prévenu')+'.</p>'}
  else h+='<p class="eq-ok">✓ Tout est publié : chacun voit sa semaine sur son téléphone.</p>';
  h+=dock(C,barres);
  return h}
function rendMois(){var b=new Date(auj());b.setDate(1);b.setMonth(b.getMonth()+MO);var mm=b.getMonth(),K=[],x=new Date(b);
  while(x.getMonth()===mm){K.push(iso(x));x=plus(x,1)}
  return nav(cap(MOIS[mm])+' <span>'+b.getFullYear()+'</span>','mo')+parQui()+'<p class="hint eqt-hint">Faites glisser le tableau pour voir tout le mois.</p>'+(BY==='c'?tableauCh(K,false):tableau(K,false))}
/* ---------- ce que voit un salarié (version publiée seulement) ---------- */
function rendSal(){var T=iso(auj()),J=[],x=auj(),h='';while(J.length<5){if(x.getDay()%6)J.push(iso(x));x=plus(x,1)}
  h+='<div class="eqs-qui"><span>Voir comme</span>'+EQ.map(function(p){return '<button type="button" data-qui="'+p.n+'" aria-pressed="'+(QUI===p.n)+'">'+p.n+'</button>'}).join('')+'</div>';
  h+='<div class="eqs-tel"><div class="eqs-top"><small>Espace de '+QUI+'</small><b>Ma semaine</b></div>';
  h+=J.map(function(k){var v=pGet(k,QUI),c=(X.CH||{})[v],t=pTaches(k,QUI),avec=c?pQui(v,k).filter(function(p){return p.n!==QUI}).map(function(p){return p.n}):[],jt=k===T?'Aujourd\'hui':k===iso(plus(auj(),1))?'Demain':cap(jourLong(k).split(' ')[0]);
    var hd='<div class="eqs-j">'+(k===T||k===iso(plus(auj(),1))?'<b>'+jt+'</b> · '+jourLong(k):'<b>'+cap(jourLong(k))+'</b>')+'</div>';
    if(!c)return hd+'<div class="eqs-c gris"><b>'+(v==='bureau'?'Au bureau':v==='repos'?'Repos':'Rien de prévu pour l\'instant')+'</b>'+(v?'':'<small>Votre patron vous préviendra.</small>')+'</div>';
    return hd+'<div class="eqs-c" style="--cc:'+couleur(v)+'"><div class="eqs-h"><i></i><span><b>'+esc(c.n)+'</b><small>'+esc(c.v||'')+' · '+heures(v,k)+'</small></span></div>'+
      '<div class="eqs-l"><span>À faire</span><b>'+(t.length?esc(t.join(', ')):'Voir avec le chef')+'</b></div>'+
      '<div class="eqs-l"><span>Avec</span><b>'+(avec.length?avec.join(', '):'Seul')+'</b></div>'+
      '<div class="eqs-b"><button type="button" class="eqs-it" data-itin="'+esc(c.v||'')+'">Itinéraire</button>'+(k===T?'<button type="button" class="eqs-ok">J\'ai vu ✓</button>':'')+'</div></div>'}).join('');
  var br=changes(J).filter(function(x){return x[1]===QUI}).length;
  h+='</div><p class="hint" style="text-align:center">C\'est l\'écran que reçoit '+QUI+' sur son téléphone : pas le planning de toute l\'équipe, seulement ses jours'+(br?', et seulement ce qui est publié ('+br+' changement'+(br>1?'s':'')+' en brouillon pour '+QUI+')':'')+'.</p>';
  return h}
function rend(){var h=(window.PCTAG?window.PCTAG('equipe'):'')+choix();
  h+=VUE==='mois'?rendMois():VUE==='sal'?rendSal():rendSem();
  if(UNDO)h+='<button type="button" class="eq-undo" id="eq-undo">↶ Annuler</button>';
  pv.innerHTML=h;
  var td=pv.querySelector('.eqt.serre th.tdy');if(td){var sc=td.closest('.eqt');sc.scrollLeft=Math.max(0,td.offsetLeft-sc.clientWidth/2)}}
/* copier la semaine d'avant (affectations + tâches), avec « Annuler la copie » */
function copier(){var K=[0,1,2,3,4].map(kj),A=K.map(function(k){return iso(plus(dte(k),-7))});
  if(!A.some(function(a){return EQ.some(function(p){return get(a,p.n)})}))return X.toast('Rien à copier','La semaine d\'avant est vide.');
  ANNUL={wk:WK,jr:{},ta:{}};K.forEach(function(k,i){ANNUL.jr[k]=JSON.parse(JSON.stringify(S.jr[k]||{}));ANNUL.ta[k]=JSON.parse(JSON.stringify(S.ta[k]||{}));
    var o=S.jr[k]={},t=S.ta[k]={};EQ.forEach(function(p){o[p.n]=get(A[i],p.n);var x=(S.ta[A[i]]||{})[p.n];if(x)t[p.n]=x.slice()})});
  ecrit();bouge();rend();X.toast('Semaine d\'avant copiée','Rien n\'est envoyé tant que vous n\'avez pas publié.')}
function annuler(){if(!ANNUL)return;Object.keys(ANNUL.jr).forEach(function(k){S.jr[k]=ANNUL.jr[k];S.ta[k]=ANNUL.ta[k]});ANNUL=null;ecrit();bouge();rend();X.toast('Copie annulée','')}

/* ---------- toucher un jour d'un chantier : qui vient ---------- */
function caseCh(id,k){var c=(X.CH||{})[id];
  function sous(){return jourLong(k)+' · '+qui(id,k).length+' sur '+besoin(id,k)+' prévus'}
  function corps(){return '<p class="hint" style="margin:0 0 10px">Touchez une personne pour la mettre sur ce chantier, ou l\'enlever. Puis touchez ce qu\'elle fait.</p><div class="eq-choix">'+EQ.map(function(p){var v=get(k,p.n),ici=v===id;
    var T=taches(k,p.n),O=(c.ouv||[]).map(function(o){return o[0]});T.forEach(function(t){if(O.indexOf(t)<0)O.push(t)});
    var hT=ici&&O.length?'<div class="cheq-ta"><small>Ce qu\'il fait :</small>'+O.map(function(t){var on=T.indexOf(t)>-1;return '<button type="button" class="cheq-tc'+(on?' on':'')+'" data-ta="'+esc(t)+'" data-tp="'+p.n+'" aria-pressed="'+on+'">'+esc(t)+'</button>'}).join('')+'</div>':'';
    return '<div class="cheq-pw'+(ici?' on':'')+'"><button type="button" class="eq-o'+(ici?' on':'')+'" data-pp="'+p.n+'"><span class="eq-av"><i>'+ini(p.n)+'</i></span><span class="tx"><b>'+p.n+'</b><small>'+(ici?'Sur ce chantier':esc(nomCase(v)))+'</small></span><span class="eq-ck">'+(ici?'✓':'+')+'</span></button>'+hT+'</div>'}).join('')+'</div>'}
  X.xopen(c.n,sous(),corps(),'<button class="btn go" id="eq-ok" style="width:100%">C\'est bon</button>',lie);
  function lie(){$$('#x-in [data-pp]').forEach(function(b){b.onclick=function(){var p=b.dataset.pp;set(k,p,get(k,p)===id?'':id);$('#x-in').innerHTML=corps();$('#x-s').textContent=sous();lie()}});
    $$('#x-in [data-ta]').forEach(function(b){b.onclick=function(){togTache(k,b.dataset.tp,b.dataset.ta);$('#x-in').innerHTML=corps();lie()}});
    var ok=$('#eq-ok');if(ok)ok.onclick=function(){X.xclose()}}}
/* ---------- toucher le jour d'une personne : où elle va ---------- */
function caseP(p,k){var CHs=chantiers(),L=CHs.map(function(c){return [c.id,c.n]}).concat([['bureau','Au bureau'],['repos','Repos ou congé'],['','Rien de prévu']]);
  X.xopen(p,jourLong(k),'<div class="eq-choix">'+L.map(function(o){var on=get(k,p)===o[0];return '<button type="button" class="eq-o'+(on?' on':'')+'" data-v="'+o[0]+'"><span class="tx"><b>'+esc(o[1])+'</b></span><span class="eq-ck">'+(on?'✓':'')+'</span></button>'}).join('')+'</div>','',function(){
    $$('#x-in [data-v]').forEach(function(b){b.onclick=function(){set(k,p,b.dataset.v);X.xclose();X.toast(p+' : '+nomCase(b.dataset.v),jourLong(k))}})})}

/* ===================== 24/11 soir : planning d'équipe « joli et incroyable à utiliser » (Cyril : « go » sur la maquette adoucie) =====================
   Inspiré de ce qui marche chez Skello, Connecteam, Deputy, Obat :
   - iPad/PC : les jours d'un même chantier = UNE barre (fond doux de la couleur du chantier + trait à gauche), ce qu'il fait chaque jour écrit dessous ;
     petite jauge sous chaque jour (verte = tout le monde est placé, rose = il manque du monde) ; heures PRÉVUES au bout (jamais de pointage, règle 14/11).
   - « À régler » : Cliky propose LA solution en un bouton (« Placer Mathieu »), « Où est chacun maintenant » (Où je suis, présence seulement).
   - « Placer vite » : on choisit un chantier puis on touche les cases.
   - GLISSER-DÉPOSER (Cyril 24/11 21h13) : attraper une barre et la lâcher sur un autre jour ou une autre personne, tirer le bout d'une barre pour l'allonger,
     glisser un chantier de « Placer vite » sur une case ; sur téléphone, appui long sur une personne puis on la glisse d'un chantier à l'autre.
     La case visée s'éclaire, refus si la personne est absente, « Annuler » juste après, rien n'est envoyé avant « Publier ».
   - Téléphone : un jour à la fois, une carte par chantier (« 2 sur 3 »), « Qui va chez… ? » avec la personne conseillée. */
var PINC=null,JSEL=null,UNDO=null,UNDOT=null,DRG=0,DR=null;
var AVC=['#56607A','#8A6D4B','#4E7C86','#7A6491','#5E7A5A','#8A5A64'];
function avC(n){var i=EQ.map(function(p){return p.n}).indexOf(n);return AVC[(i<0?0:i)%AVC.length]}
function av(n,sm){return '<span class="eqa'+(sm?' sm':'')+'" style="background:'+avC(n)+'" aria-hidden="true">'+ini(n)+'</span>'}
function estAbs(v){return !!ABS[v]||v==='repos'}
function largeEcran(){return window.innerWidth>=700}
function semK(){return [0,1,2,3,4].map(kj)}
function tacheDef(v){var c=(X.CH||{})[v];if(!c)return [];var o=(c.ouv||[]).filter(function(x){return x[2]<100})[0];return o?[o[0]]:[]}
/* écrire une case sans tout redessiner à chaque fois (on appelle ecrit()+bouge() à la fin du geste) */
function put(k,p,v,ta){(S.jr[k]=S.jr[k]||{})[p]=v;var o=S.ta[k]=S.ta[k]||{};if(ta&&ta.length&&(X.CH||{})[v])o[p]=ta.slice();else delete o[p]}
function memo(){UNDO={jr:JSON.parse(JSON.stringify(S.jr)),ta:JSON.parse(JSON.stringify(S.ta))};clearTimeout(UNDOT);
  UNDOT=setTimeout(function(){UNDO=null;var u=$('#eq-undo');if(u)u.remove()},9000)}
function defaire(){if(!UNDO)return;S.jr=UNDO.jr;S.ta=UNDO.ta;UNDO=null;ecrit();bouge();X.toast('C\'est annulé','Le planning est revenu comme avant.')}
/* qui peut aller sur un chantier ce jour-là, du plus conseillé au moins */
function options(id,k){var K5=semK();return EQ.map(function(p){var v=get(k,p.n),o={n:p.n,v:v};
  var venu=K5.some(function(x){return x!==k&&get(x,p.n)===id});
  if(v===id){o.st='ici';o.t='Déjà sur ce chantier';o.s=-1}
  else if(estAbs(v)){o.st='abs';o.t=nomCase(v).replace('Repos ou congé','Repos')+' ce jour-là';o.s=-2}
  else if(!v){o.st='libre';o.t='Libre ce jour-là'+(venu?' · connaît déjà le chantier':'');o.s=venu?4:3}
  else if((X.CH||{})[v]&&qui(v,k).length>besoin(v,k)){o.st='plus';o.t='En plus chez '+court(v)+' · on le déplace';o.s=2}
  else if(v==='bureau'){o.st='bur';o.t='Au bureau · on le déplace';o.s=1}
  else{o.st='pris';o.t='Chez '+court(v)+' · on le déplace';o.s=0}
  o.venu=venu;return o}).sort(function(a,b){return b.s-a.s})}
function conseil(id,k){var o=options(id,k)[0];return o&&o.s>=2?o:null}
function stListe(){try{return (window.PCPLAN&&PCPLAN.st&&PCPLAN.st.tous)?PCPLAN.st.tous():[]}catch(e){return []}}
function trous(K){var R=[];K.forEach(function(k){chantiers().forEach(function(c){var m=besoin(c.id,k)-qui(c.id,k).length;if(m>0)R.push({id:c.id,k:k,m:m,c:conseil(c.id,k)})})});return R}
function couv(k){var a=0,b=0;chantiers().forEach(function(c){var B=besoin(c.id,k);b+=B;a+=Math.min(B,qui(c.id,k).length)});return b?a/b:1}

/* ---------- iPad / PC : la semaine en barres ---------- */
function runs(p,K){var R=[],cur=null;K.forEach(function(k,i){var v=get(k,p),b=brouillon(k,p),key=v+(b?'#b':'');
  if(v&&cur&&cur.key===key){cur.n++;cur.K.push(k)}else{cur={key:key,v:v,b:b,i:i,n:1,K:[k]};R.push(cur)}});return R}
function bloc(p,r,row){var v=r.v,c=(X.CH||{})[v],pos='grid-row:'+row+';grid-column:'+(r.i+2)+' / span '+r.n,dk=' data-bp="'+esc(p)+'" data-bk="'+r.K.join(',')+'"';
  var lab=p+', '+(r.n>1?'du '+jourLong(r.K[0])+' au '+jourLong(r.K[r.n-1]):jourLong(r.K[0]))+' : '+nomCase(v)+(r.b?' (pas encore publié)':'');
  if(!v)return '<button type="button" class="eqb vide'+(r.b?' br':'')+'"'+dk+' style="'+pos+'" aria-label="'+esc(lab)+', à placer">+</button>';
  var cls=c?'ch':estAbs(v)?'abs':'gris',h='<div class="eqb '+cls+(r.b?' br':'')+'"'+dk+' style="'+pos+(c?';--cc:'+couleur(v):'')+'" role="button" tabindex="0" aria-label="'+esc(lab)+'">';
  if(c){h+='<b>'+esc(r.n>1?c.n:court(v))+'</b><small>'+esc(r.b&&r.n===1?'à publier':(c.v||'')+(r.n>1?' · '+heures(v,r.K[0]):''))+'</small>';
    h+='<span class="ds">'+r.K.map(function(k){var t=taches(k,p);return '<span>'+esc(t.length?t[0].toLowerCase():'')+'</span>'}).join('')+'</span><i class="eqb-h" title="Tirer pour allonger"></i>'}
  else h+='<b>'+esc(nomCase(v).replace('Repos ou congé','Repos').replace('Au bureau','Bureau'))+'</b>'+(r.b?'<small>à publier</small>':'');
  return h+'</div>'}
function ligneP(p,K,T,row){var tot=0;K.forEach(function(k){tot+=hJour(get(k,p.n),k)});var hs=hsSem(p.n,K),o=K.indexOf(T)>-1?ouSuis(p.n):null;
  return '<button type="button" class="eqw-who" data-pers="'+esc(p.n)+'" style="grid-row:'+row+';grid-column:1">'+av(p.n)+'<span><b>'+esc(p.n)+'</b><small>'+(o?'<i class="eq-okp"></i>'+OU[o.v]:esc(p.r))+'</small></span></button>'+
    runs(p.n,K).map(function(r){return bloc(p.n,r,row)}).join('')+
    '<button type="button" class="eqw-h" data-hs="1" style="grid-row:'+row+';grid-column:7" aria-label="Heures prévues de '+esc(p.n)+' : '+hTxt(tot)+'"><b>'+hTxt(tot)+'</b><small'+(hs?' class="sup"':'')+'>'+(hs?'+'+hTxt(hs)+' en plus':'sur 39 h')+'</small><span class="hb"><i style="width:'+Math.min(100,Math.round(tot/39*100))+'%"></i></span></button>'}
function stRangs(K,row){var ids=[];(X.EV||[]).forEach(function(e){if(e.k==='st'&&e.x&&e.x.st&&K.indexOf(e.d)>-1&&ids.indexOf(e.x.st)<0)ids.push(e.x.st)});
  var P=window.PCPLAN&&PCPLAN.st,h='';ids.forEach(function(id){var t=P&&P.de?P.de(id):null;if(!t)return;row++;
    h+='<div class="eqw-who st" style="grid-row:'+row+';grid-column:1"><span class="eqa st" title="'+stTit(t)+'">'+stIc(t)+'</span><span><b>'+esc(t.n.split(' ').slice(0,2).join(' '))+'</b><small>'+esc(t.m||'Sous-traitant')+'</small></span></div>';
    var R=[],cur=null;K.forEach(function(k,i){var e=(X.EV||[]).filter(function(e){return e.k==='st'&&e.d===k&&e.x&&e.x.st===id})[0],ch=e?e.x.ch:'';
      if(ch&&cur&&cur.ch===ch)cur.n++;else if(ch){cur={ch:ch,i:i,n:1};R.push(cur)}else cur=null});
    h+=R.map(function(r){return '<div class="eqb st" style="grid-row:'+row+';grid-column:'+(r.i+2)+' / span '+r.n+'"><b>'+esc(r.n>1?((X.CH||{})[r.ch]||{}).n||court(r.ch):court(r.ch))+'</b><small>'+esc(t.m||'sous-traitant')+'</small></div>'}).join('')});
  return {h:h,row:row}}
function semaineGrille(K){var T=iso(auj()),row=1,h='<div class="eqk eqw"><div class="eqw-g">';
  h+=K.map(function(k,i){var x=dte(k),cv=couv(k);return '<div class="eqw-dh'+(k===T?' tdy':'')+'" style="grid-row:1;grid-column:'+(i+2)+'"><small>'+JC[x.getDay()].replace('.','')+'</small><b>'+x.getDate()+'</b><span class="cv'+(cv<1?' m':'')+'" title="'+(cv<1?'Il manque du monde':'Tout le monde est placé')+'"><i style="width:'+Math.round(cv*100)+'%"></i></span></div>'}).join('')+
    '<div class="eqw-hh" style="grid-row:1;grid-column:7">Heures</div>';
  EQ.forEach(function(p){row++;h+=ligneP(p,K,T,row)});
  var s=stRangs(K,row+1);if(s.h)h+='<div class="eqw-sep" style="grid-row:'+(row+1)+'"></div>'+s.h;
  h+='</div><div class="eqw-leg">'+chantiers().map(function(c){return '<span><i style="background:'+couleur(c.id)+'"></i>'+esc(c.n)+'</span>'}).join('')+
    '<span><i class="vd"></i>À placer</span><span><i class="lt"></i>Pas encore publié</span><span class="eq-ex">Équipe d\'exemple</span></div></div>';
  return h}
function aRegler(K){var R=trous(K),s0=stListe()[0];
  if(!R.length)return '<div class="eqk eqr"><h4>À régler</h4><p class="eqr-ok">✓ Tout le monde est placé cette semaine.</p></div>';
  return '<div class="eqk eqr"><h4>À régler <span class="eqn">'+R.length+'</span></h4>'+R.slice(0,4).map(function(t){var c=(X.CH||{})[t.id];
    return '<div class="eqr-i"><span class="k">'+cap(jourCourt(t.k))+' · '+esc(c.n)+'</span><p>Il manque '+t.m+' personne'+(t.m>1?'s':'')+'. '+
      (t.c?'<b>'+esc(t.c.n)+'</b> '+(t.c.st==='libre'?'n\'a rien ce jour-là.':'est en plus chez '+esc(court(t.c.v))+'.'):'Personne de l\'équipe n\'est libre.')+'</p><div class="btns">'+
      (t.c?'<button type="button" class="btn sm go" data-pl="'+esc(t.c.n)+'" data-plc="'+t.id+'" data-k="'+t.k+'">Placer '+esc(t.c.n)+'</button><button type="button" class="btn sm" data-qv="'+t.id+'" data-k="'+t.k+'">Autre…</button>'
        :(s0?'<button type="button" class="btn sm" data-dst="'+esc(s0.n)+'" data-dk="'+t.k+'" data-dc="'+t.id+'">Demander à '+esc(s0.n.split(' ').slice(0,2).join(' '))+'</button>':'')+'<button type="button" class="btn sm" data-qv="'+t.id+'" data-k="'+t.k+'">Choisir…</button>')+
      '</div></div>'}).join('')+(R.length>4?'<p class="hint" style="margin:8px 0 0">Et '+(R.length-4)+' autre'+(R.length>5?'s':'')+' plus loin dans la semaine.</p>':'')+'</div>'}
function ouChacun(K){var T=iso(auj());if(K.indexOf(T)<0)return '';
  var L=EQ.map(function(p){var o=ouSuis(p.n),v=get(T,p.n);return [p.n,o?OU[o.v]:v?'Prévu : '+court(v):'Rien de prévu',avC(p.n)]});
  [(window.PCID&&PCID.prenom)||'Julien','Claire'].forEach(function(n){var o=ouSuis(n);L.push([n,o?OU[o.v]:'Pas encore dit','var(--n1-nuit)'])});
  return '<div class="eqk eqr"><h4>Où est chacun maintenant</h4>'+L.map(function(x){return '<button type="button" class="eqo-l" data-pers="'+esc(x[0])+'"><span class="eqa sm" style="background:'+x[2]+'">'+ini(x[0])+'</span><b>'+esc(x[0])+'</b><span>'+esc(x[1])+'</span></button>'}).join('')+'</div>'}
function puce(v,t,cc){return '<button type="button" class="eqd-c'+(PINC===v?' on':'')+'" data-pinc="'+v+'" data-drag="'+v+'">'+(cc?'<i style="background:'+cc+'"></i>':'')+esc(t)+'</button>'}
function dock(C,pal){var h='<div class="eqd">';
  if(pal)h+='<div class="eqd-p" role="toolbar" aria-label="Placer vite"><span class="lb">'+(PINC!=null?'Touchez les cases à remplir':'Placer vite : choisissez, puis touchez les cases')+'</span>'+
    chantiers().map(function(c){return puce(c.id,court(c.id),couleur(c.id))}).join('')+puce('bureau','Bureau')+puce('conge','Congé')+puce('','Vider')+
    (PINC!=null?'<button type="button" class="eqd-x" data-pinc="x">Terminé</button>':'')+'</div>';
  if(C.length)h+='<button type="button" class="btn go eqd-pub" id="eq-pub"><span class="lab"><span>Publier et prévenir ('+C.length+')</span></span></button>';
  return h+'</div>'}

/* ---------- téléphone : un jour à la fois ---------- */
function carteCh(c,k){var Q=qui(c.id,k),B=besoin(c.id,k),m=B-Q.length,co=m>0?conseil(c.id,k):null;
  return '<div class="eqk eqj-c" data-dz="'+c.id+'" data-k="'+k+'" style="--cc:'+couleur(c.id)+'"><div class="eqj-h"><span class="tx"><b>'+esc(c.n)+'</b><small>'+esc((c.v?c.v+' · ':'')+heures(c.id,k))+'</small></span><span class="eqt2 '+(m>0?'al':'ok')+'">'+(m>0?'':'✓ ')+Q.length+' sur '+B+(m<0?' · '+(-m)+' en plus':'')+'</span></div>'+
    Q.map(function(p){var t=taches(k,p.n),b=brouillon(k,p.n);return '<div class="eqj-p'+(b?' br':'')+'" data-mp="'+esc(p.n)+'" data-k="'+k+'" role="button" tabindex="0">'+av(p.n,1)+'<span class="tx"><b>'+esc(p.n)+'</b><small>'+(b?'pas encore publié · ':'')+esc(t.length?t.join(', ').toLowerCase():'tâche à choisir')+'</small></span><span class="eqj-g" aria-hidden="true">⠿</span></div>'}).join('')+
    '<button type="button" class="eqj-add'+(m>0?' m':'')+'" data-qv="'+c.id+'" data-k="'+k+'">+ Ajouter quelqu\'un</button>'+
    (co?'<div class="eqj-sug"><span class="cly"><i></i></span><span class="tx"><b>'+esc(co.n)+(co.st==='libre'?' n\'a rien ce jour-là':' est en plus chez '+esc(court(co.v)))+'</b><small>'+(co.venu?'Il connaît déjà le chantier':'Cliky vous le conseille')+'</small></span><button type="button" class="btn sm go" data-pl="'+esc(co.n)+'" data-plc="'+c.id+'" data-k="'+k+'">Placer</button></div>':'')+'</div>'}
function rendJour(K){var T=iso(auj());if(!JSEL||K.indexOf(JSEL)<0)JSEL=K.indexOf(T)>-1?T:K[0];var k=JSEL,h='';
  h+='<div class="eqj-days" role="tablist">'+K.map(function(x){var d=dte(x);return '<button type="button" role="tab" aria-selected="'+(x===k)+'" class="eqj-d'+(x===T?' tdy':'')+'" data-jsel="'+x+'"><small>'+JC[d.getDay()].replace('.','')+'</small><b>'+d.getDate()+'</b><em class="'+(couv(x)<1?'m':'')+'"></em></button>'}).join('')+'</div>';
  var CH=chantiers(),A=CH.filter(function(c){return besoin(c.id,k)>0||qui(c.id,k).length}),man=0;A.forEach(function(c){man+=Math.max(0,besoin(c.id,k)-qui(c.id,k).length)});
  h+='<div class="eqj-sum"><b>'+cap(jourLong(k))+'</b>'+(man?'<span class="eqt2 al">Il manque '+man+'</span>':'<span class="eqt2 ok">✓ Complet</span>')+'</div>';
  h+=A.map(function(c){return carteCh(c,k)}).join('');
  var O=CH.filter(function(c){return A.indexOf(c)<0});
  if(O.length)h+='<div class="eqj-autres"><span>Rien ce jour-là :</span>'+O.map(function(c){return '<button type="button" data-qv="'+c.id+'" data-k="'+k+'"><i style="background:'+couleur(c.id)+'"></i>'+esc(court(c.id))+' +</button>'}).join('')+'</div>';
  var H=EQ.filter(function(p){return !(X.CH||{})[get(k,p.n)]});
  if(H.length)h+='<div class="eqk eqj-hors" data-dz="hors" data-k="'+k+'"><h4>Pas sur un chantier</h4>'+H.map(function(p){var v=get(k,p.n);
    return '<div class="eqj-p'+(brouillon(k,p.n)?' br':'')+'" data-mp="'+esc(p.n)+'" data-k="'+k+'" role="button" tabindex="0">'+av(p.n,1)+'<span class="tx"><b>'+esc(p.n)+'</b></span>'+(v?'<span class="eqj-v">'+esc(nomCase(v).replace('Repos ou congé','Repos'))+'</span>':'<span class="eqt2 al">Rien de prévu</span>')+'<span class="eqj-g" aria-hidden="true">⠿</span></div>'}).join('')+'</div>';
  h+='<p class="hint" style="text-align:center;margin:4px 0 12px">Gardez le doigt sur une personne pour la glisser vers un autre chantier.</p>';
  return h}

/* ---------- « Qui va chez… ? » ---------- */
function quiVa(id,k){var c=(X.CH||{})[id];if(!c)return;var O=options(id,k),best=conseil(id,k),sel=best?best.n:null,ta=tacheDef(id)[0]||null,
    T=(c.ouv||[]).map(function(o){return o[0]}),m=besoin(id,k)-qui(id,k).length;
  function corps(){return '<div class="eq-choix">'+O.map(function(o){var off=o.st==='ici'||o.st==='abs';
      return '<button type="button" class="eq-o eqq'+(sel===o.n?' on':'')+(off?' off':'')+'" data-qq="'+esc(o.n)+'"'+(off?' disabled':'')+'>'+av(o.n)+'<span class="tx"><b>'+esc(o.n)+'</b><small>'+esc(o.t)+'</small></span>'+(best&&best.n===o.n?'<span class="eqt2 nv">Conseillé</span>':'')+'</button>'}).join('')+
    stListe().slice(0,2).map(function(s){return '<button type="button" class="eq-o eqq" data-qs="'+esc(s.n)+'"><span class="eqa st" title="'+stTit(s)+'">'+stIc(s)+'</span><span class="tx"><b>'+esc(s.n)+'</b><small>'+esc(s.m||'Sous-traitant')+' · lui envoyer une demande</small></span></button>'}).join('')+'</div>'+
    (T.length?'<p class="eqq-t">Ce qu\'il fera</p><div class="eqq-tk">'+T.map(function(t){return '<button type="button" class="'+(ta===t?'on':'')+'" data-qt="'+esc(t)+'">'+esc(t)+'</button>'}).join('')+'</div>':'')}
  function pied(){return '<button type="button" class="btn go" id="eqq-ok" style="width:100%"'+(sel?'':' disabled')+'>'+(sel?'Placer '+esc(sel):'Choisissez une personne')+'</button>'}
  X.xopen('Qui va chez '+c.n+' ?',jourLong(k)+(m>0?' · il manque '+m+' personne'+(m>1?'s':''):''),corps(),pied(),lie);
  function lie(){$$('#x-in [data-qq]').forEach(function(b){b.onclick=function(){sel=b.dataset.qq;re()}});
    $$('#x-in [data-qt]').forEach(function(b){b.onclick=function(){ta=ta===b.dataset.qt?null:b.dataset.qt;re()}});
    $$('#x-in [data-qs]').forEach(function(b){b.onclick=function(){X.xclose();X.toast('Demande envoyée à '+b.dataset.qs,jourLong(k)+', '+c.n+' (démo).')}});
    var ok=$('#eqq-ok');if(ok)ok.onclick=function(){if(!sel)return;memo();put(k,sel,id,ta?[ta]:tacheDef(id));ecrit();bouge();X.xclose();X.toast(sel+' va chez '+court(id),jourLong(k)+' · pas encore publié.')}}
  function re(){$('#x-in').innerHTML=corps();$('#x-foot').innerHTML=pied();lie()}}
function pinceau(p,k){var v=PINC,cur=get(k,p);
  if((X.CH||{})[v]&&estAbs(cur))return X.toast(p+' est absent ce jour-là',nomCase(cur)+'. Touchez « Terminé » puis la case pour changer.');
  if(cur===v)return;memo();put(k,p,v,tacheDef(v));ecrit();bouge()}

/* ---------- glisser-déposer ---------- */
function dayAt(el,x){var K=el.dataset.bk.split(','),r=el.getBoundingClientRect(),i=Math.floor((x-r.left)/r.width*K.length);return K[Math.max(0,Math.min(K.length-1,i))]}
function cible(x,y){var el=d.elementFromPoint(x,y);if(!el)return null;var s=DR.src;
  if(s.ty==='pers'){var z=el.closest('[data-dz]');return z&&pv.contains(z)?{z:z,id:z.dataset.dz,k:z.dataset.k}:null}
  var b=el.closest('[data-bp]');if(!b||!pv.contains(b))return null;var p=b.dataset.bp,k=dayAt(b,x),K5=semK();
  if(s.ty==='tire'&&p!==s.p)return null;
  var days=[];if(s.ty==='bloc'){var off=K5.indexOf(k)-K5.indexOf(s.k0);s.K.forEach(function(sd){var j=K5.indexOf(sd)+off;if(j>=0&&j<5)days.push(K5[j])})}
  else if(s.ty==='tire'){var f=K5.indexOf(s.K[0]),j=Math.max(f,K5.indexOf(k));for(var i=f;i<=j;i++)days.push(K5[i])}
  else days=[k];
  var v=s.ty==='chip'?s.v:s.v,non='';
  if((X.CH||{})[v])days.forEach(function(x){var cur=get(x,p);if(estAbs(cur)&&!(s.ty==='bloc'&&p===s.p&&s.K.indexOf(x)>-1))non=p+' : '+nomCase(cur).replace('Repos ou congé','Repos').toLowerCase()+' le '+jourCourt(x)});
  return {p:p,k:k,days:days,non:non,row:b}}
function zone(t){var z=$('#eq-zone');if(!t){if(z)z.hidden=true;$$('.eq-dz-on',pv).forEach(function(e){e.classList.remove('eq-dz-on')});return}
  if(!z){z=d.createElement('div');z.id='eq-zone';d.body.appendChild(z)}z.hidden=false;
  if(t.z){z.hidden=true;$$('.eq-dz-on',pv).forEach(function(e){if(e!==t.z)e.classList.remove('eq-dz-on')});t.z.classList.add('eq-dz-on');return}
  var H=$$('.eqw-dh',pv),K5=semK(),a=H[K5.indexOf(t.days[0])],b=H[K5.indexOf(t.days[t.days.length-1])],r=t.row.getBoundingClientRect();if(!a||!b){z.hidden=true;return}
  var ra=a.getBoundingClientRect(),rb=b.getBoundingClientRect();z.style.cssText='left:'+ra.left+'px;top:'+r.top+'px;width:'+(rb.right-ra.left)+'px;height:'+r.height+'px';
  z.className=t.non?'non':'';z.innerHTML=t.non?'<span>'+esc(t.non)+'</span>':''}
function demarre(){if(!DR)return;DR.on=true;var s=DR.src,g=d.createElement('div');g.id='eq-gh';
  g.textContent=s.ty==='pers'?s.p:s.ty==='tire'?'Allonger jusqu\'à…':s.v?(nomCase(s.v).replace('Repos ou congé','Repos')):'Vider';d.body.appendChild(g);
  if(s.el)s.el.classList.add('eq-src');d.body.classList.add('eq-drag');try{navigator.vibrate&&navigator.vibrate(12)}catch(e){}bougeDr(DR.x,DR.y)}
function bougeDr(x,y){var g=$('#eq-gh');if(g){g.style.left=x+'px';g.style.top=y+'px'}DR.t2=cible(x,y);zone(DR.t2)}
function finDr(){var g=$('#eq-gh');if(g)g.remove();zone(null);d.body.classList.remove('eq-drag');if(DR&&DR.src.el)DR.src.el.classList.remove('eq-src');DR=null}
function lache(){var s=DR.src,t=DR.t2;DRG=Date.now();if(!t)return;
  if(t.non)return X.toast('Pas possible ici',t.non+'.');
  var K5=semK(),msg='';memo();
  if(s.ty==='pers'){var v=t.id==='hors'?'':t.id;if(get(s.k,s.p)===v){UNDO=null;return}put(s.k,s.p,v,tacheDef(v));msg=s.p+(v?' va chez '+court(v):' n\'est plus sur un chantier')}
  else if(s.ty==='chip'){if(get(t.k,t.p)===s.v){UNDO=null;return}put(t.k,t.p,s.v,tacheDef(s.v));msg=t.p+' : '+(s.v?nomCase(s.v):'case vidée')}
  else if(s.ty==='bloc'){var off=K5.indexOf(t.k)-K5.indexOf(s.k0);if(!off&&t.p===s.p){UNDO=null;return}
    var M=s.K.map(function(sd){return [sd,get(sd,s.p),taches(sd,s.p)]});M.forEach(function(m){put(m[0],s.p,'')});
    M.forEach(function(m){var j=K5.indexOf(m[0])+off;if(j>=0&&j<5)put(K5[j],t.p,m[1],m[2])});
    msg=(t.p!==s.p?nomCase(s.v)+' passe à '+t.p:nomCase(s.v)+' déplacé')+(off?' ('+(off>0?'+':'')+off+' jour'+(Math.abs(off)>1?'s':'')+')':'')}
  else if(s.ty==='tire'){var f=K5.indexOf(s.K[0]),l=K5.indexOf(s.K[s.K.length-1]),j=Math.max(f,K5.indexOf(t.k)),last=taches(s.K[s.K.length-1],s.p);
    if(j===l){UNDO=null;return}for(var i=f;i<=Math.max(j,l);i++){if(i<=j){if(i>l)put(K5[i],s.p,s.v,last)}else put(K5[i],s.p,'')}
    msg=nomCase(s.v)+(j>l?' allongé jusqu\'au '+jourCourt(K5[j]):' raccourci au '+jourCourt(K5[j]))}
  ecrit();bouge();X.toast(msg,'Pas encore publié : rien n\'est envoyé avant « Publier ».')}
pv.addEventListener('pointerdown',function(e){if(e.button>0||DR)return;var h=e.target.closest('.eqb-h'),b=e.target.closest('.eqb[data-bp]:not(.vide)'),c=e.target.closest('.eqd-c[data-drag]'),m=e.target.closest('.eqj-p[data-mp]'),s=null;
  if(h&&b)s={ty:'tire',p:b.dataset.bp,K:b.dataset.bk.split(','),v:get(b.dataset.bk.split(',')[0],b.dataset.bp),el:b};
  else if(b){var K=b.dataset.bk.split(',');s={ty:'bloc',p:b.dataset.bp,K:K,k0:dayAt(b,e.clientX),v:get(K[0],b.dataset.bp),el:b}}
  else if(c)s={ty:'chip',v:c.dataset.drag,el:c};
  else if(m)s={ty:'pers',p:m.dataset.mp,k:m.dataset.k,el:m};
  if(!s)return;DR={src:s,x:e.clientX,y:e.clientY,on:false,touch:e.pointerType!=='mouse'};
  if(s.ty==='tire'){e.preventDefault();demarre()}
  else if(DR.touch)DR.t=setTimeout(function(){if(DR&&!DR.on)demarre()},380)});
addEventListener('pointermove',function(e){if(!DR)return;var dx=e.clientX-DR.x,dy=e.clientY-DR.y;
  if(!DR.on){if(DR.touch){if(dx*dx+dy*dy>80){clearTimeout(DR.t);DR=null}return}if(dx*dx+dy*dy>36)demarre();else return}
  e.preventDefault();bougeDr(e.clientX,e.clientY)},{passive:false});
addEventListener('pointerup',function(){if(!DR)return;clearTimeout(DR.t);if(DR.on){lache()}if(DR&&DR.on)DRG=Date.now();finDr()});
addEventListener('pointercancel',function(){if(!DR)return;clearTimeout(DR.t);finDr()});
d.addEventListener('touchmove',function(e){if(DR&&DR.on)e.preventDefault()},{passive:false});
pv.addEventListener('contextmenu',function(e){if(e.target.closest('.eqb,.eqj-p,.eqd-c'))e.preventDefault()});
var LRG=largeEcran();addEventListener('resize',function(){var l=largeEcran();if(l!==LRG){LRG=l;if(!pv.hidden)rend()}});
var st2=d.createElement('style');
st2.textContent=[
'#p-equipe .eqk{background:var(--z-tile,var(--card));box-shadow:var(--z-ombre-s,0 1px 2px rgba(14,19,34,.06),0 10px 28px rgba(14,19,34,.07));border-radius:22px}',
'#p-equipe .eqw-l{display:grid;gap:14px;margin-bottom:12px}',
'@media (min-width:1180px){#p-equipe .eqw-l{grid-template-columns:minmax(0,1fr) 270px;align-items:start}}',
'@media (max-width:1179px){#p-equipe .eqw-s{display:grid;grid-template-columns:1fr 1fr;gap:14px;align-items:start}}',
'#p-equipe .eqw-s .eqk+.eqk{margin-top:14px}@media (max-width:1179px){#p-equipe .eqw-s .eqk+.eqk{margin-top:0}}',
'#p-equipe .eqw{padding:12px 12px 10px}',
'#p-equipe .eqw-g{display:grid;grid-template-columns:128px repeat(5,minmax(0,1fr)) 66px;column-gap:6px;row-gap:8px;align-items:stretch}',
'#p-equipe .eqw-dh{text-align:center;padding:8px 0 10px;border-radius:14px}',
'#p-equipe .eqw-dh small{display:block;font-size:12px;color:var(--muted);font-weight:600}#p-equipe .eqw-dh b{display:block;font-size:21px;font-weight:800;line-height:1.15}',
'#p-equipe .eqw-dh.tdy{background:var(--n1-nuit,#1B2440);color:var(--n1-nuit-fg,#fff)}#p-equipe .eqw-dh.tdy small{color:inherit;opacity:.75}',
'#p-equipe .cv{display:block;height:5px;width:58%;margin:6px auto 0;border-radius:3px;background:var(--line);overflow:hidden}#p-equipe .cv i{display:block;height:100%;background:var(--ok,#3E8E6A)}#p-equipe .cv.m i{background:var(--cor,#B9577A)}',
'#p-equipe .eqw-dh.tdy .cv{background:rgba(127,127,127,.35)}',
'#p-equipe .eqw-hh{align-self:end;text-align:right;font-size:12px;color:var(--muted);padding:0 2px 12px}',
'#p-equipe .eqw-who{display:flex;align-items:center;gap:9px;min-width:0;padding:4px 2px;border:0;background:none;box-shadow:none;text-align:left;color:var(--fg);min-height:0}',
'#p-equipe .eqw-who>span:last-child{min-width:0;display:flex;flex-direction:column}#p-equipe .eqw-who b{font-size:14.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#p-equipe .eqw-who small{font-size:11.5px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:flex;align-items:center;gap:4px}',
'#p-equipe .eq-okp{flex:none;width:7px;height:7px;border-radius:50%;background:var(--ok,#3E8E6A)}',
'.eqa{flex:none;width:32px;height:32px;border-radius:50%;display:inline-grid;place-items:center;color:#fff;font:800 13px/1 Manrope,system-ui,sans-serif}.eqa.sm{width:28px;height:28px;font-size:12px}',
'.eqa{overflow:hidden}.eqa img,.eq-av i img,.cheq-av i img{width:100%;height:100%;object-fit:cover;border-radius:50%;display:block}.eq-av i,.cheq-av i{overflow:hidden}',
'.eqa.xl{width:96px;height:96px;font-size:36px}.eqph{display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center;padding:6px 0 4px}.eqph-b{display:grid;gap:8px;margin-top:12px}.eqph-b .btn{width:100%;justify-content:center}',
'.eqa.st{display:inline-grid;place-items:center;background:none!important;color:var(--muted);box-shadow:inset 0 0 0 1.5px var(--muted)}',
'#p-equipe .eqb{position:relative;min-height:60px;border-radius:14px;padding:9px 11px;display:flex;flex-direction:column;justify-content:center;min-width:0;text-align:left;color:var(--fg);cursor:pointer;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;border:0;background:var(--teinte);box-shadow:none;font:inherit;transition:transform .12s,opacity .12s}',
'#p-equipe .eqb b{font-size:14px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#p-equipe .eqb small{font-size:12px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
'#p-equipe .eqb .ds{display:flex;margin-top:5px}#p-equipe .eqb .ds span{flex:1;min-width:0;font-size:11px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-right:8px}',
'#p-equipe .eqb.ch{background:color-mix(in srgb,var(--cc) 14%,var(--z-tile,var(--card)));box-shadow:inset 4px 0 0 var(--cc),var(--n1-pk);padding-left:14px}',
'#p-equipe .eqb.abs{background:repeating-linear-gradient(135deg,var(--line) 0 5px,transparent 5px 11px);box-shadow:inset 0 0 0 1.5px var(--line);color:var(--muted)}#p-equipe .eqb.abs b{color:var(--muted)}',
'#p-equipe .eqb.vide{background:none;outline:1.5px dashed color-mix(in srgb,var(--cor,#B9577A) 55%,transparent);outline-offset:-1.5px;color:var(--cor,#B9577A);font-size:18px;font-weight:800;align-items:center}',
'#p-equipe .eqb.br{background-image:repeating-linear-gradient(135deg,color-mix(in srgb,var(--n1-laiton,#A8823F) 20%,transparent) 0 6px,transparent 6px 12px)}',
'#p-equipe .eqb.br::after{content:"";position:absolute;top:7px;right:7px;width:8px;height:8px;border-radius:50%;background:var(--n1-laiton,#A8823F);box-shadow:0 0 0 2px var(--z-tile,var(--card))}',
'#p-equipe .eqb.st{background:none;outline:1.5px dashed var(--muted);outline-offset:-1.5px;cursor:default}',
'#p-equipe .eqb-h{position:absolute;right:0;top:0;bottom:0;width:16px;cursor:ew-resize;touch-action:none}#p-equipe .eqb-h::before{content:"";position:absolute;right:5px;top:50%;width:3px;height:22px;margin-top:-11px;border-radius:2px;background:var(--cc);opacity:.45}',
'#p-equipe .eqb.br .eqb-h::before{top:62%}#p-equipe .eqb:hover .eqb-h::before{opacity:.9}',
'#p-equipe .eqw-h{display:flex;flex-direction:column;align-items:flex-end;justify-content:center;padding:0 2px;border:0;background:none;box-shadow:none;color:var(--fg);min-height:0}',
'#p-equipe .eqw-h b{font-size:15px}#p-equipe .eqw-h small{font-size:11px;color:var(--muted);white-space:nowrap}#p-equipe .eqw-h small.sup{color:var(--n1-laiton,#A8823F);font-weight:700}',
'#p-equipe .eqw-h .hb{width:50px;height:4px;border-radius:2px;background:var(--line);margin-top:5px;overflow:hidden}#p-equipe .eqw-h .hb i{display:block;height:100%;background:var(--n1-nuit,#1B2440)}',
'#p-equipe .eqw-sep{grid-column:1/-1;height:1px;background:var(--line)}',
'#p-equipe .eqw-leg{display:flex;flex-wrap:wrap;align-items:center;gap:6px 14px;padding:12px 4px 2px;font-size:12.5px;color:var(--muted)}#p-equipe .eqw-leg span{display:inline-flex;align-items:center;gap:6px}',
'#p-equipe .eqw-leg i{width:9px;height:9px;border-radius:50%}#p-equipe .eqw-leg i.vd{border-radius:3px;outline:1.5px dashed var(--cor,#B9577A);outline-offset:-1.5px}#p-equipe .eqw-leg i.lt{background:var(--n1-laiton,#A8823F)}',
'#p-equipe .eqr{padding:15px 16px 13px}#p-equipe .eqr h4{margin:0 0 4px;font-size:16px;display:flex;align-items:center;gap:8px}',
'#p-equipe .eqn{font-size:12px;font-weight:800;color:var(--cor,#B9577A);background:color-mix(in srgb,var(--cor,#B9577A) 14%,transparent);padding:2px 9px;border-radius:99px}',
'#p-equipe .eqr-i{border-top:1px solid var(--line);padding:11px 0 4px}#p-equipe .eqr-i:first-of-type{border-top:0}#p-equipe .eqr-i .k{font-size:12px;font-weight:800;color:var(--cor,#B9577A)}',
'#p-equipe .eqr-i p{margin:4px 0 10px;font-size:13.5px}#p-equipe .eqr-i .btns{display:flex;flex-wrap:wrap;gap:8px}#p-equipe .eqr-ok{margin:6px 0 2px;color:var(--ok,#3E8E6A);font-weight:700;font-size:14px}',
'#p-equipe .eqo-l{display:flex;align-items:center;gap:10px;width:100%;padding:6px 0;border:0;background:none;box-shadow:none;color:var(--fg);font-size:13.5px;text-align:left;min-height:0}#p-equipe .eqo-l b{flex:1}#p-equipe .eqo-l>span:last-child{color:var(--muted);text-align:right}',
'#p-equipe .eqd{position:sticky;bottom:16px;z-index:6;display:flex;align-items:center;gap:10px;margin:6px 0 10px}',
'@media (max-width:899px){#p-equipe .eqd{bottom:calc(84px + env(safe-area-inset-bottom,0px))}}',
'#p-equipe .eqd-p{flex:1;min-width:0;display:flex;align-items:center;gap:7px;padding:7px 10px 7px 16px;border-radius:99px;overflow-x:auto;scrollbar-width:none;background:var(--z-tile,var(--card));box-shadow:0 1px 2px rgba(14,19,34,.08),0 12px 30px -8px rgba(14,19,34,.25)}',
'#p-equipe .eqd-p::-webkit-scrollbar{display:none}#p-equipe .eqd-p .lb{font-size:12.5px;color:var(--muted);font-weight:600;white-space:nowrap;margin-right:4px}',
'#p-equipe .eqd-c,#p-equipe .eqd-x{flex:none;display:inline-flex;align-items:center;gap:6px;min-height:36px;padding:0 13px;border-radius:99px;background:var(--bg);box-shadow:var(--n1-pk);color:var(--fg);font:700 13.5px var(--f,inherit);-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}',
'#p-equipe .eqd-c i{width:9px;height:9px;border-radius:50%}#p-equipe .eqd-c.on{background:var(--n1-nuit,#1B2440);color:var(--n1-nuit-fg,#fff);box-shadow:none}#p-equipe .eqd-c.on i{box-shadow:0 0 0 2px var(--n1-nuit-fg,#fff)}',
'#p-equipe .eqd-x{background:none;box-shadow:inset 0 0 0 1.5px var(--line)}#p-equipe .eqd-pub{flex:none;white-space:nowrap}#p-equipe .eqd .eqd-pub:only-child{flex:1;justify-content:center}',
'#p-equipe .eqj-days{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:7px;margin:0 0 14px}',
'#p-equipe .eqj-d{display:flex;flex-direction:column;align-items:center;padding:8px 0 9px;border-radius:16px;background:var(--z-tile,var(--card));box-shadow:var(--n1-pk);color:var(--fg);min-width:0;min-height:0}',
'#p-equipe .eqj-d small{font-size:11.5px;color:var(--muted);font-weight:600}#p-equipe .eqj-d b{font-size:19px;line-height:1.2}#p-equipe .eqj-d em{width:6px;height:6px;border-radius:50%;margin-top:4px;background:var(--ok,#3E8E6A)}#p-equipe .eqj-d em.m{background:var(--cor,#B9577A)}',
'#p-equipe .eqj-d[aria-selected="true"]{background:var(--n1-nuit,#1B2440);color:var(--n1-nuit-fg,#fff);box-shadow:none}#p-equipe .eqj-d[aria-selected="true"] small{color:inherit;opacity:.75}',
'#p-equipe .eqj-d.tdy:not([aria-selected="true"]){box-shadow:var(--n1-pk),inset 0 0 0 1.5px var(--n1-nuit,#1B2440)}',
'#p-equipe .eqj-sum{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:0 2px 12px}#p-equipe .eqj-sum b{font-size:17px}',
'.eqt2{flex:none;display:inline-flex;align-items:center;gap:4px;font-size:12px;font-weight:800;padding:4px 10px;border-radius:99px;white-space:nowrap}',
'.eqt2.ok{color:var(--ok,#3E8E6A);background:color-mix(in srgb,var(--ok,#3E8E6A) 13%,transparent)}.eqt2.al{color:var(--cor,#B9577A);background:color-mix(in srgb,var(--cor,#B9577A) 13%,transparent)}.eqt2.nv{color:var(--n1-nuit,#1B2440);background:var(--teinte)}',
'#p-equipe .eqj-c{position:relative;padding:14px 14px 12px 18px;margin-bottom:12px;box-shadow:inset 5px 0 0 var(--cc),var(--z-ombre-s,0 1px 2px rgba(14,19,34,.06),0 10px 28px rgba(14,19,34,.07));transition:box-shadow .12s}',
'#p-equipe .eqj-h{display:flex;align-items:flex-start;gap:10px}#p-equipe .eqj-h .tx{flex:1;min-width:0;display:flex;flex-direction:column}#p-equipe .eqj-h b{font-size:16.5px}#p-equipe .eqj-h small{font-size:12.5px;color:var(--muted)}',
'#p-equipe .eqj-p{display:flex;align-items:center;gap:10px;margin-top:8px;padding:7px 10px 7px 7px;border-radius:14px;background:var(--bg);cursor:pointer;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;transition:transform .12s,opacity .12s}',
'#p-equipe .eqj-p .tx{flex:1;min-width:0;display:flex;flex-direction:column}#p-equipe .eqj-p b{font-size:14.5px}#p-equipe .eqj-p small{font-size:12px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
'#p-equipe .eqj-p.br{background-image:repeating-linear-gradient(135deg,color-mix(in srgb,var(--n1-laiton,#A8823F) 16%,transparent) 0 6px,transparent 6px 12px)}',
'#p-equipe .eqj-g{color:var(--muted);font-size:16px;opacity:.6}#p-equipe .eqj-v{font-size:13px;color:var(--muted)}',
'#p-equipe .eqj-add{width:100%;margin-top:8px;min-height:44px;border-radius:14px;background:none;box-shadow:none;border:1.5px dashed var(--line);color:var(--muted);font:700 14px var(--f,inherit)}',
'#p-equipe .eqj-add.m{border-color:color-mix(in srgb,var(--cor,#B9577A) 55%,transparent);color:var(--cor,#B9577A)}',
'#p-equipe .eqj-sug{display:flex;align-items:center;gap:10px;margin-top:10px;padding:10px 10px 10px 12px;border-radius:14px;background:color-mix(in srgb,var(--n1-laiton,#A8823F) 10%,var(--z-tile,var(--card)));font-size:13.5px}',
'#p-equipe .eqj-sug .tx{flex:1;min-width:0;display:flex;flex-direction:column}#p-equipe .eqj-sug small{font-size:12px;color:var(--muted)}',
'.cly{flex:none;width:26px;height:26px;border-radius:50%;display:grid;place-items:center;box-shadow:inset 0 0 0 1.5px var(--n1-laiton,#A8823F)}.cly i{width:7px;height:7px;border-radius:50%;background:var(--n1-laiton,#A8823F)}',
'#p-equipe .eqj-autres{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:0 2px 12px;font-size:13px;color:var(--muted)}',
'#p-equipe .eqj-autres button{display:inline-flex;align-items:center;gap:6px;min-height:34px;padding:0 12px;border-radius:99px;background:var(--z-tile,var(--card));box-shadow:var(--n1-pk);color:var(--fg);font:700 13px var(--f,inherit)}#p-equipe .eqj-autres i{width:8px;height:8px;border-radius:50%}',
'#p-equipe .eqj-hors{padding:12px 14px 14px;margin-bottom:12px}#p-equipe .eqj-hors h4{margin:0;font-size:13px;color:var(--muted)}',
'#p-equipe .eq-dz-on{box-shadow:inset 5px 0 0 var(--cc,var(--muted)),0 0 0 2.5px var(--n1-nuit,#1B2440)!important}',
'.eq-src{opacity:.4;transform:scale(.97)}body.eq-drag,body.eq-drag *{cursor:grabbing!important;-webkit-user-select:none!important;user-select:none!important}',
'#eq-gh{position:fixed;z-index:300;pointer-events:none;transform:translate(-50%,-140%);padding:8px 14px;border-radius:99px;background:var(--n1-nuit,#1B2440);color:var(--n1-nuit-fg,#fff);font:800 13.5px Manrope,system-ui,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.25);white-space:nowrap}',
'#eq-zone{position:fixed;z-index:250;pointer-events:none;border-radius:14px;outline:2.5px solid var(--n1-nuit,#1B2440);background:color-mix(in srgb,var(--n1-nuit,#1B2440) 9%,transparent);display:flex;align-items:flex-end;justify-content:center}',
'#eq-zone[hidden]{display:none!important}#eq-zone.non{outline-color:var(--cor,#B9577A);background:color-mix(in srgb,var(--cor,#B9577A) 12%,transparent)}#eq-zone span{margin-bottom:-30px;padding:4px 10px;border-radius:99px;background:var(--cor,#B9577A);color:#fff;font:800 12px Manrope,system-ui,sans-serif;white-space:nowrap}',
'.eq-undo{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(150px + env(safe-area-inset-bottom,0px));z-index:40;min-height:44px;padding:0 20px;border-radius:99px;border:0;background:var(--n1-nuit,#1B2440);color:var(--n1-nuit-fg,#fff);font:800 14px Manrope,system-ui,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.25)}',
'@media (min-width:900px){.eq-undo{bottom:90px}}',
'.eqq.on{box-shadow:var(--n1-pk),0 0 0 2px var(--n1-nuit,#1B2440)!important}.eqq.off{opacity:.45;box-shadow:none!important;background:none!important}.eqq .tx small{display:block}',
'#p-equipe .eqt .eqc.ch{background:color-mix(in srgb,var(--cc) 14%,var(--z-tile,var(--card)));color:var(--fg);box-shadow:inset 3px 0 0 var(--cc)}#p-equipe .eqt .eqc.ch.man{box-shadow:inset 3px 0 0 var(--cc),inset 0 0 0 1.5px var(--cor,#B9577A)}',
'#p-equipe .eqt .eqc.ch.br{background-image:repeating-linear-gradient(135deg,color-mix(in srgb,var(--n1-laiton,#A8823F) 20%,transparent) 0 5px,transparent 5px 10px)}#p-equipe .eqt .eqc em{background:color-mix(in srgb,var(--cor,#B9577A) 13%,transparent)}',
'.eqq-t{margin:16px 2px 8px;font-weight:700;font-size:14px}.eqq-tk{display:flex;flex-wrap:wrap;gap:7px}',
'.eqq-tk button{min-height:36px;padding:0 13px;border-radius:99px;border:0;background:var(--bg);box-shadow:var(--n1-pk);color:var(--fg);font:600 13.5px var(--f,inherit)}.eqq-tk button.on{background:var(--n1-nuit,#1B2440);color:var(--n1-nuit-fg,#fff);box-shadow:none}'
].join('');
d.head.appendChild(st2);

pv.addEventListener('click',function(e){
  if(Date.now()-DRG<450){e.preventDefault();e.stopPropagation();return}
  var bp=e.target.closest('[data-bp]');if(bp&&!e.target.closest('.eqb-h')){var kk=dayAt(bp,e.clientX);if(PINC!=null)return pinceau(bp.dataset.bp,kk);return caseP(bp.dataset.bp,kk)}
  var mp=e.target.closest('[data-mp]');if(mp)return caseP(mp.dataset.mp,mp.dataset.k);
  var b=e.target.closest('button');if(!b)return;
  if('pinc' in b.dataset){var pv2=b.dataset.pinc;PINC=pv2==='x'?null:(PINC===pv2?null:pv2);return rend()}
  if(b.dataset.jsel){JSEL=b.dataset.jsel;return rend()}
  if(b.dataset.pl){var n=b.dataset.pl,id=b.dataset.plc,k=b.dataset.k;memo();put(k,n,id,tacheDef(id));ecrit();bouge();X.toast(n+' va chez '+court(id),jourLong(k)+' · pas encore publié.');return}
  if(b.dataset.dst){X.toast('Demande envoyée à '+b.dataset.dst,jourLong(b.dataset.dk)+', '+(((X.CH||{})[b.dataset.dc]||{}).n||'')+' (démo).');return}
  if(b.dataset.qv)return quiVa(b.dataset.qv,b.dataset.k);
  if(b.id==='eq-undo')return defaire();

  if(b.dataset.wk){WK=b.dataset.wk==='0'?0:WK+(+b.dataset.wk);return rend()}
  if(b.dataset.sel){SEL=b.dataset.sel;return rend()}
  if(b.dataset.vue){VUE=b.dataset.vue;SEL=null;return rend()}
  if(b.dataset.mo!=null){MO=b.dataset.mo==='0'?0:MO+(+b.dataset.mo);SEL=null;return rend()}
  if(b.dataset.qui){QUI=b.dataset.qui;return rend()}
  if(b.dataset.itin!=null){X.toast('Itinéraire','Ouvre Waze ou Plans vers '+(b.dataset.itin||'le chantier')+' (démo).');return}
  if(b.classList.contains('eqs-ok')){b.textContent='Vu ✓';b.disabled=true;X.toast('Le patron voit que c\'est lu','« ✓ vu » à côté du prénom (démo).');return}
  if(b.dataset.eqc)return caseCh(b.dataset.eqc,b.dataset.k);
  if(b.dataset.eqp)return caseP(b.dataset.eqp,b.dataset.k);
  if(b.dataset.by){BY=b.dataset.by;return rend()}
  if(b.dataset.abso||b.dataset.absn){var ok=!!b.dataset.abso,a=repondreAbs(b.dataset.abso||b.dataset.absn,ok);rend();if(a)X.toast(ok?'Absence acceptée':'Absence refusée',ok?a.qui+' le voit sur son téléphone. Ses jours passent en « '+ABS[a.ty]+' ».':a.qui+' est prévenu.');return}
  if(b.dataset.hs){if(window.PCJR&&PCJR.heuresSup){PCJR.heuresSup(iso(auj()))}else X.toast('Heures en plus','Cliky vous pose la question le soir.');return}
  if(b.id==='eq-copie')return copier();
  if(b.id==='eq-annul')return annuler();
  if(b.id==='eq-pub'){var N=publier([0,1,2,3,4].map(kj));ANNUL=null;rend();X.toast('Planning publié','Prévenu'+(N.length>1?'s':'')+' : '+N.join(', ')+'. Seulement les changements, pas toute la semaine (exemple).')}});

var st=d.createElement('style');
st.textContent=
 '#p-equipe .cal-top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:0 0 10px}'+
 '#p-equipe .eq-ex{font-size:11.5px;font-weight:700;color:var(--muted);background:var(--teinte);padding:4px 10px;border-radius:99px}'+
 '#p-equipe .eq-regl p{margin:4px 0;font-size:13.5px;color:var(--fg)}#p-equipe .eq-regl{margin-bottom:14px;box-shadow:inset 3px 0 0 var(--cor),var(--up)}'+
 '#p-equipe .eq-ch{display:grid;gap:12px;margin-bottom:16px}@media (min-width:900px){#p-equipe .eq-ch{grid-template-columns:repeat(2,minmax(0,1fr))}}'+
 '#p-equipe .eq-c{margin:0;padding:14px}#p-equipe .eq-h{display:flex;align-items:center;gap:10px;margin-bottom:10px}'+
 '#p-equipe .eq-h .tx{display:flex;flex-direction:column;min-width:0}#p-equipe .eq-h small{color:var(--muted);font-size:12.5px}'+
 '#p-equipe .eq-l,#p-equipe .eq-leg i{flex:none;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:var(--cc,var(--muted));color:#fff;font:800 13px/1 Manrope,system-ui,sans-serif;font-style:normal}'+
 '#p-equipe .eq-j{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px}'+
 '#p-equipe .eq-d{display:flex;flex-direction:column;align-items:center;gap:3px;padding:8px 2px;border-radius:14px;background:var(--bg);box-shadow:var(--n1-pk);color:var(--fg);min-width:0}'+
 '#p-equipe .eq-d small{font-size:11px;color:var(--muted);font-weight:600;white-space:nowrap}#p-equipe .eq-d b{font-size:20px;line-height:1}'+
 '#p-equipe .eq-d em{font-style:normal;font-size:10.5px;font-weight:700;color:var(--cor);white-space:nowrap}#p-equipe .eq-d.manque{box-shadow:var(--n1-pk),inset 0 0 0 1.5px var(--cor)}'+
 '#p-equipe .eq-av{display:flex;justify-content:center;flex-wrap:wrap;gap:2px;min-height:18px}#p-equipe .eq-av i,.eq-choix .eq-av i{width:18px;height:18px;border-radius:50%;display:grid;place-items:center;font:800 10px/1 Manrope,system-ui,sans-serif;font-style:normal;background:var(--teinte);color:var(--fg)}'+
 '#p-equipe .eq-p{margin:0 0 14px;padding:10px 14px}#p-equipe .eq-pl{display:flex;align-items:center;gap:10px;padding:8px 0;border-top:1px solid var(--line)}#p-equipe .eq-pl:first-child{border-top:0}'+
 '#p-equipe .eq-n{flex:1;min-width:0;display:flex;flex-direction:column}#p-equipe .eq-n small{color:var(--muted);font-size:12px}'+
 '#p-equipe .eq-sem{display:flex;gap:5px}#p-equipe .eq-k{width:34px;height:34px;border-radius:12px;display:grid;place-items:center;font:800 13px/1 Manrope,system-ui,sans-serif;color:#fff;background:var(--cc,var(--muted))}'+
 '#p-equipe .eq-k.vide{background:var(--bg);color:var(--cor);box-shadow:var(--n1-pk),inset 0 0 0 1.5px var(--cor)}'+
 '#p-equipe .eq-leg{display:flex;flex-wrap:wrap;gap:8px 14px;padding-top:10px;border-top:1px solid var(--line);font-size:12.5px;color:var(--muted)}#p-equipe .eq-leg span{display:flex;align-items:center;gap:6px}#p-equipe .eq-leg i{width:20px;height:20px;font-size:10.5px}#p-equipe .eq-leg i.b{background:var(--muted)}'+
 '#p-equipe .eq-env{width:100%;justify-content:center}'+
 '.eq-choix{display:grid;gap:8px}.eq-o{display:flex;align-items:center;gap:10px;padding:12px;border-radius:16px;background:var(--bg);box-shadow:var(--n1-pk);text-align:left;color:var(--fg)}'+
 '.eq-o .tx{flex:1;display:flex;flex-direction:column}.eq-o small{color:var(--muted);font-size:12.5px}.eq-o.on{box-shadow:var(--n1-pk),0 0 0 2px var(--n1-laiton)}.eq-o .eq-ck{font-weight:800;color:var(--n1-nuit)}'+
 '.eq-choix .eq-av i{width:30px;height:30px;font-size:13px}'+
 '#p-equipe .eq-top{justify-content:flex-start}#p-equipe .eq-top h3{flex:1;text-align:center;margin:0}#p-equipe .eq-fl{flex:none;width:40px;height:40px;border-radius:50%;display:grid;place-items:center;font-size:22px;line-height:1;background:var(--bg);box-shadow:var(--n1-pk);color:var(--fg)}'+
 '#p-equipe .eq-d.off{opacity:.45;box-shadow:none}'+
 'html body #v-planning #p-equipe .wkc-b{display:grid;gap:4px;height:auto!important}'+
 'html body #v-planning #p-equipe .wkc-col{position:relative;display:flex;flex-direction:column;gap:6px;padding:4px;min-height:220px}'+
 'html body #v-planning #p-equipe .wkc-col .ev{position:relative!important;left:auto!important;right:auto!important;top:auto!important;height:auto!important;display:flex!important;flex-direction:column;align-items:stretch;text-align:left;min-width:0;width:100%;cursor:pointer}'+
 'html body #v-planning #p-equipe .wkc-col .ev b{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:2px}'+
 'html body #v-planning #p-equipe .wkc-col .ev small{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:10.5px!important;line-height:1.35;color:var(--fg)!important;font-weight:600}'+
 'html body #v-planning #p-equipe .wkc-col .ev.free small{color:var(--cor,#B4472F)!important}'+
 'html body #v-planning #p-equipe .wkc-col .ev em{display:block;font-style:normal;font-size:10px;font-weight:800;color:var(--cor,#B4472F);margin-top:2px;line-height:1.2}'+
 'html body #v-planning #p-equipe .wkc-col .ev.eqw-man{box-shadow:inset 0 0 0 1.5px var(--cor,#B4472F),var(--z-ombre-s,0 1px 3px rgba(0,0,0,.1))!important}'+
 'html body #v-planning #p-equipe .wkc-h small.eqw-m{color:var(--cor,#B4472F)!important;font-weight:800}'+
 '@media (min-width:700px){html body #v-planning #p-equipe .wkc-col .ev b{font-size:13px!important}html body #v-planning #p-equipe .wkc-col .ev small{font-size:12.5px!important}html body #v-planning #p-equipe .wkc-col .ev em{font-size:12px}html body #v-planning #p-equipe .wkc-col .ev{padding:8px 10px 8px!important}html body #v-planning #p-equipe .wkc-col .ev::before{left:10px!important;top:12px!important}html body #v-planning #p-equipe .wkc-col .ev b{padding-top:0!important;padding-left:14px}}'+
 '#p-equipe .eqw-leg{display:flex;flex-wrap:wrap;gap:6px 14px;margin:10px 2px 16px;font-size:12.5px;color:var(--muted)}#p-equipe .eqw-leg span{display:flex;align-items:center;gap:6px}#p-equipe .eqw-leg i{width:8px;height:8px;border-radius:50%}#p-equipe .eqw-leg i.free{border:1.5px dashed var(--muted);width:10px;height:10px;box-sizing:border-box}'+
 '#p-equipe .eqv{display:inline-grid;grid-template-columns:1fr 1fr;margin:0 0 12px}'+
 'html body #v-planning #p-equipe .mo{background:transparent!important;box-shadow:none!important;border:0!important}'+
 '#p-equipe .mo-d{display:flex;justify-content:center;gap:3px;min-height:6px}#p-equipe .mo-d i{width:6px;height:6px;border-radius:50%}'+
 '#p-equipe .mo-g button.eqm-man .n{box-shadow:inset 0 0 0 2px var(--cor,#B4472F)!important}'+
 '#p-equipe .mo-g button.sel:not(.tdy) .n{outline:2px solid var(--n1-laiton,#B8925A);outline-offset:2px}'+
 '#p-equipe .eqw-leg i.rg{width:10px;height:10px;border-radius:50%;box-shadow:inset 0 0 0 2px var(--cor,#B4472F)}'+
 '#p-equipe .eqm-t{margin:14px 2px 8px;font-size:17px}@media (min-width:900px){#p-equipe .eqm-t{margin-top:0}}'+
 '#p-equipe .eqm-jl{display:grid;gap:8px}'+
 '#p-equipe .eqm-l{display:flex;align-items:center;gap:12px;width:100%;padding:12px 14px;border-radius:16px;background:var(--z-tile,var(--card));box-shadow:var(--z-ombre-s,var(--n1-pk));text-align:left;color:var(--fg)}'+
 '#p-equipe .eqm-l>i{flex:none;width:10px;height:10px;border-radius:50%;background:var(--c,var(--muted))}#p-equipe .eqm-l.libre>i{background:none;border:1.5px dashed var(--muted)}'+
 '#p-equipe .eqm-l .tx{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}#p-equipe .eqm-l b{font-size:15px}#p-equipe .eqm-l small{font-size:13px;color:var(--muted)}#p-equipe .eqm-l em{font-style:normal;font-size:12.5px;font-weight:700;color:var(--cor,#B4472F)}'+
 '#p-equipe .eqm-l.manque{box-shadow:inset 0 0 0 1.5px var(--cor,#B4472F),var(--z-ombre-s,var(--n1-pk))}#p-equipe .eqm-l.libre{background:none;box-shadow:none;border:1.5px dashed var(--line)}#p-equipe .eqm-l.libre small{color:var(--cor,#B4472F)}'+
 '#p-equipe .eqv{display:grid;grid-template-columns:1fr 1fr 1.6fr;margin:0 0 12px;max-width:560px}#p-equipe .eqv button{white-space:nowrap;font-size:13.5px}'+
 '#p-equipe .eqt-hint{margin:-4px 2px 10px}'+
 '#p-equipe .eqt{overflow-x:auto;margin:0 -16px;padding:0 16px 4px;-webkit-overflow-scrolling:touch;scrollbar-width:thin}'+
 '#p-equipe .eqt table{border-collapse:separate;border-spacing:4px;width:100%;table-layout:fixed}#p-equipe .eqt.serre table{width:auto}'+
 '#p-equipe .eqt th,#p-equipe .eqt td{padding:0;vertical-align:middle}'+
 '#p-equipe .eqt thead th{font-weight:600;text-align:center;padding:6px 0;border-radius:14px;background:var(--z-tile,var(--card));box-shadow:var(--z-ombre-s,none)}'+
 '#p-equipe .eqt thead th small{display:block;font-size:11px;color:var(--muted)}#p-equipe .eqt thead th b{display:block;font-size:17px;line-height:1.2}'+
 '#p-equipe .eqt thead th.tdy{background:var(--n1-nuit,#1B2440);color:var(--n1-nuit-fg,#fff)}#p-equipe .eqt thead th.tdy small{color:inherit;opacity:.75}'+
 '#p-equipe .eqt thead th.eqt-n{background:none;box-shadow:none}#p-equipe .eqt th.we{opacity:.55}'+
 '#p-equipe .eqt .eqt-n{width:84px;text-align:left;position:sticky;left:0;z-index:1;background:var(--bg);box-shadow:-20px 0 0 var(--bg)}#p-equipe .eqt.serre .eqt-m .eqt-n b{font-size:11px;white-space:nowrap}#p-equipe .eqt tbody .eqt-n b{display:block;font-size:14.5px}#p-equipe .eqt tbody .eqt-n small{display:block;font-size:11.5px;color:var(--muted);font-weight:500}'+
 '#p-equipe .eqc{width:100%;min-height:52px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;padding:4px 3px;border-radius:12px;border:0;box-shadow:none;background:var(--z-tile,var(--card));color:var(--fg);min-width:0;overflow:hidden}'+
 '#p-equipe .eqc b{font-size:12px;font-weight:800;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#p-equipe .eqc small{font-size:10px;line-height:1.15;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;opacity:.9}'+
 '#p-equipe .eqc.ch{background:var(--cc);color:#fff}#p-equipe .eqc.gris{background:var(--teinte,rgba(0,0,0,.06));color:var(--fg)}'+
 '#p-equipe .eqc.vide{background:none;border:1.5px dashed var(--cor,#B4472F);color:var(--cor,#B4472F)}#p-equipe .eqc.vide b{font-size:16px}'+
 '#p-equipe .eqc.passe{background:none;border:0;color:var(--muted)}'+
 '#p-equipe .eqt td.we{background:repeating-linear-gradient(45deg,transparent 0 6px,var(--line) 6px 7px);border-radius:12px;opacity:.5}'+
 '#p-equipe .eqt.serre .eqt-n{width:76px}#p-equipe .eqt.serre thead th:not(.eqt-n),#p-equipe .eqt.serre td{width:46px;min-width:46px}#p-equipe .eqt.serre .eqc{min-height:40px}#p-equipe .eqt.serre .eqc b{font-size:10px}'+
 '#p-equipe .eqt-m td{vertical-align:top}#p-equipe .eqm{display:block;width:100%;margin:0 0 3px;padding:4px 2px;border-radius:10px;border:1.5px solid var(--cor,#B4472F);background:none;box-shadow:none;color:var(--cor,#B4472F);font:800 10.5px var(--f,inherit);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
 '#p-equipe .eqt-m .eqt-n b{font-size:12.5px;color:var(--cor,#B4472F)}'+
 '#p-equipe .eqw-leg i.vd{width:10px;height:10px;border-radius:3px;border:1.5px dashed var(--cor,#B4472F);box-sizing:border-box}'+
 '@media (min-width:700px){#p-equipe .eqt.large .eqt-n{width:130px}#p-equipe .eqt.large .eqc{min-height:62px}#p-equipe .eqt.large .eqc b{font-size:14px}#p-equipe .eqt.large .eqc small{font-size:12px}#p-equipe .eqm{font-size:12px}}'+
 '#p-equipe .eqs-qui{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:0 0 14px}#p-equipe .eqs-qui span{font-size:13px;color:var(--muted);margin-right:4px}'+
 '#p-equipe .eqs-qui button{min-height:38px;padding:0 14px;border-radius:99px;background:var(--bg);box-shadow:var(--n1-pk);color:var(--fg);font:700 14px var(--f,inherit)}#p-equipe .eqs-qui button[aria-pressed="true"]{background:var(--n1-nuit,#1B2440);color:var(--n1-nuit-fg,#fff);box-shadow:none}'+
 '#p-equipe .eqs-tel{max-width:420px;margin:0 auto 10px;padding:18px 16px 20px;border-radius:32px;background:var(--bg);box-shadow:0 0 0 8px var(--z-tile,var(--card)),0 10px 30px rgba(0,0,0,.12)}'+
 '#p-equipe .eqs-top small{display:block;font-size:12px;color:var(--muted)}#p-equipe .eqs-top b{display:block;font-size:24px;margin-bottom:6px}'+
 '#p-equipe .eqs-j{margin:16px 2px 6px;font-size:14px;color:var(--muted)}#p-equipe .eqs-j b{color:var(--fg);font-size:15px}'+
 '#p-equipe .eqs-c{padding:14px 16px;border-radius:20px;background:var(--z-tile,var(--card));box-shadow:inset 4px 0 0 var(--cc),var(--z-ombre-s,0 1px 3px rgba(0,0,0,.08))}#p-equipe .eqs-c.gris{box-shadow:var(--z-ombre-s,none)}#p-equipe .eqs-c.gris b{font-size:15px}#p-equipe .eqs-c.gris small{display:block;color:var(--muted);font-size:13px;margin-top:2px}'+
 '#p-equipe .eqs-h{display:flex;align-items:flex-start;gap:10px}#p-equipe .eqs-h i{flex:none;width:12px;height:12px;margin-top:6px;border-radius:50%;background:var(--cc)}#p-equipe .eqs-h span{display:flex;flex-direction:column}#p-equipe .eqs-h b{font-size:18px}#p-equipe .eqs-h small{font-size:13.5px;color:var(--muted)}'+
 '#p-equipe .eqs-l{display:flex;gap:10px;padding:8px 0 0 22px;font-size:14.5px}#p-equipe .eqs-l span{flex:none;width:52px;color:var(--muted);font-size:13px;padding-top:1px}'+
 '#p-equipe .eqs-b{display:flex;gap:8px;margin:12px 0 0 22px}#p-equipe .eqs-b button{min-height:42px;padding:0 18px;border-radius:99px;font:700 14px var(--f,inherit)}#p-equipe .eqs-it{background:var(--n1-nuit,#1B2440);color:#fff;border:0}#p-equipe .eqs-ok{background:none;border:1.5px solid var(--line);color:var(--fg)}'+
 '#p-equipe .eq-dem{margin:0 0 14px;padding:12px 14px;border-radius:18px;background:var(--z-tile,var(--card));box-shadow:inset 0 0 0 1.5px var(--n1-laiton,#A8823F),var(--z-ombre-s,none)}#p-equipe .eq-dem h4{margin:0 0 6px;font-size:15px}'+
 '#p-equipe .eq-dm{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;padding:8px 0;border-top:1px solid var(--line)}#p-equipe .eq-dm:first-of-type{border-top:0}#p-equipe .eq-dm .tx{flex:1 1 200px;display:flex;flex-direction:column;gap:2px}#p-equipe .eq-dm small{color:var(--muted);font-size:13px}#p-equipe .eq-db{display:flex;gap:8px}'+
 '#p-equipe .eq-ou1{display:flex!important;align-items:center;gap:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#p-equipe .eq-ou1 i{flex:none;width:7px;height:7px;border-radius:50%;background:var(--ok,#3E8E6A)}'+
 '#p-equipe .eq-nm{display:block;width:100%;padding:0;border:0;background:none;box-shadow:none;text-align:left;color:inherit;min-height:0}#p-equipe .eq-nm b{display:block;font-size:14.5px;text-decoration:underline;text-decoration-color:var(--n1-laiton,#A8823F);text-decoration-thickness:2px;text-underline-offset:3px}#p-equipe .eq-nm small{display:block;font-size:11.5px;color:var(--muted);font-weight:500}'+
 '#p-equipe .eqc.st{background:color-mix(in srgb,var(--n1-laiton,#A8823F) 22%,var(--z-tile,var(--card)));color:var(--fg);box-shadow:inset 0 0 0 1.5px var(--n1-laiton,#A8823F)}#p-equipe .eqt-st .eqt-n b{color:var(--n1-laiton,#A8823F)}'+
 '#p-equipe .eq-bou{display:flex;flex-wrap:wrap;align-items:center;gap:6px 10px;margin:0 2px 14px;font-size:13px;color:var(--muted)}#p-equipe .eq-bo{min-height:34px;padding:0 12px;border-radius:99px;background:var(--z-tile,var(--card));box-shadow:var(--z-ombre-s,none);color:var(--muted);font:600 13px var(--f,inherit)}#p-equipe .eq-bo b{color:var(--fg)}'+
 '#p-equipe .eq-vf{color:var(--fg)!important;font-size:12.5px!important;margin-top:4px;padding:6px 10px;border-radius:10px;background:var(--teinte,rgba(0,0,0,.05))}'+
 '#p-equipe .eqby{display:flex;align-items:center;gap:6px;margin:0 0 10px}#p-equipe .eqby span{font-size:13px;color:var(--muted);margin-right:2px}'+
 '#p-equipe .eqby button{min-height:36px;padding:0 14px;border-radius:99px;background:var(--bg);box-shadow:var(--n1-pk);color:var(--fg);font:700 13.5px var(--f,inherit)}#p-equipe .eqby button[aria-pressed="true"]{background:var(--n1-nuit,#1B2440);color:var(--n1-nuit-fg,#fff);box-shadow:none}'+
 '#p-equipe .eqc.br{background-image:repeating-linear-gradient(135deg,rgba(255,255,255,.42) 0 4px,transparent 4px 9px)}#p-equipe .eqc.gris.br,#p-equipe .eqc.vide.br{background-image:repeating-linear-gradient(135deg,var(--line) 0 3px,transparent 3px 8px)}'+
 '#p-equipe .eqc.br::after{content:"";position:absolute;top:4px;right:4px;width:7px;height:7px;border-radius:50%;background:var(--n1-laiton,#B8925A);box-shadow:0 0 0 1.5px #fff}#p-equipe .eqc{position:relative}'+
 '#p-equipe .eqw-leg i.hb{width:12px;height:10px;border-radius:3px;background:var(--k-run,#888) repeating-linear-gradient(135deg,rgba(255,255,255,.5) 0 3px,transparent 3px 6px)}'+
 '#p-equipe .eqt th.eqt-h{background:none;box-shadow:none;width:58px}#p-equipe .eqt td.eqt-h{text-align:center;width:58px}#p-equipe td.eqt-h b{display:block;font-size:15px}#p-equipe td.eqt-h small{display:block;font-size:10.5px;color:var(--muted);white-space:nowrap}'+
 '#p-equipe td.eqt-h button{width:100%;min-height:52px;border:0;background:none;box-shadow:none;color:var(--fg);padding:0}#p-equipe td.eqt-h.moins b{color:var(--muted)}#p-equipe td.eqt-h.sup b,#p-equipe td.eqt-h.sup small{color:var(--n1-laiton,#A8823F)}#p-equipe td.eqt-h.moins small{color:var(--muted)}@media (max-width:699px){#p-equipe .eqc em span{display:none}}'+
 '#p-equipe .bych .eqt-n b{display:flex!important;align-items:center;gap:6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#p-equipe .bych .eqt-n b i{flex:none;width:9px;height:9px;border-radius:50%}#p-equipe .bych tbody .eqt-n small{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
 '#p-equipe .eqc .nm{font-size:11.5px;font-weight:700;opacity:1}#p-equipe .eqc em{font-style:normal;font-size:10.5px;font-weight:800;padding:1px 6px;border-radius:99px;background:#fff;color:var(--cor,#B4472F);margin-top:2px;white-space:nowrap}'+
 '#p-equipe .eqc.man{box-shadow:0 0 0 2px var(--cor,#B4472F)}#p-equipe .eqc.rien{background:none;border:1.5px dashed var(--line);min-height:40px}'+
 '#p-equipe .eqt-m .eqm:not([style]){border-color:var(--line);color:var(--fg)}'+
 '#p-equipe .eq-act{display:flex;flex-wrap:wrap;gap:8px;margin:4px 0 12px}#p-equipe .eq-act .btn{flex:1 1 200px;justify-content:center}'+
 '#p-equipe .eq-ok{text-align:center;font-weight:700;color:var(--ok,#2E7D4F);margin:8px 0 14px}'+
 '@media (min-width:700px){#p-equipe .eqc .nm{font-size:13px}#p-equipe .eqc em{font-size:11.5px}}'+
 '#p-equipe .eq-jours{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;margin:0 0 16px}'+
 '#p-equipe .eq-jours button{position:relative;display:flex;flex-direction:column;align-items:center;gap:1px;padding:8px 2px;border-radius:16px;background:var(--bg);box-shadow:var(--n1-pk);color:var(--fg);min-width:0}'+
 '#p-equipe .eq-jours small{font-size:11.5px;color:var(--muted);font-weight:600}#p-equipe .eq-jours b{font-size:19px;line-height:1.15}#p-equipe .eq-jours em{font-style:normal;font-size:10px;font-weight:700;color:var(--n1-laiton)}'+
 '#p-equipe .eq-jours button[aria-selected="true"]{background:var(--n1-nuit,#1B2440);color:#fff;box-shadow:none}#p-equipe .eq-jours button[aria-selected="true"] small,#p-equipe .eq-jours button[aria-selected="true"] em{color:rgba(255,255,255,.8)}'+
 '#p-equipe .eq-pt{position:absolute;top:6px;right:8px;width:8px;height:8px;border-radius:50%;background:var(--cor,#B4472F)}'+
 '#p-equipe .eq-sh h2::first-letter{text-transform:uppercase}'+
 '#p-equipe .eq-ou{display:grid;gap:12px;margin-bottom:16px}@media (min-width:900px){#p-equipe .eq-ou{grid-template-columns:repeat(2,minmax(0,1fr))}#p-equipe .eq-hors{grid-column:1/-1}}'+
 '#p-equipe .eq-cc{margin:0;padding:14px 16px;box-shadow:inset 4px 0 0 var(--cc),var(--up)}#p-equipe .eq-cc.manque{box-shadow:inset 4px 0 0 var(--cc),inset 0 0 0 1.5px var(--cor),var(--up)}'+
 '#p-equipe .eq-cch{display:flex;align-items:flex-start;gap:10px}#p-equipe .eq-cch .tx{flex:1;min-width:0;display:flex;flex-direction:column}#p-equipe .eq-cch .tx b{font-size:16px}#p-equipe .eq-cch small{color:var(--muted);font-size:12.5px}'+
 '#p-equipe .eq-nb{font-size:14px;color:var(--muted);font-weight:700;white-space:nowrap}#p-equipe .eq-nb b{font-size:24px;color:var(--fg)}#p-equipe .eq-nb.manque b,#p-equipe .eq-nb.manque{color:var(--cor)}'+
 '#p-equipe .eq-gens{display:grid;gap:8px;margin-top:10px}#p-equipe .eq-g{display:flex;align-items:center;gap:10px}#p-equipe .eq-g>i{flex:none;width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:var(--cc);color:#fff;font:800 13px/1 Manrope,system-ui,sans-serif;font-style:normal}'+
 '#p-equipe .eq-g>span{display:flex;flex-direction:column;min-width:0}#p-equipe .eq-g b{font-size:15px}#p-equipe .eq-g small{font-size:12.5px;color:var(--muted)}'+
 '#p-equipe .eq-man{margin:10px 0 0;font-size:13.5px;font-weight:700;color:var(--cor)}'+
 '#p-equipe .eq-ch2{margin-top:12px;min-height:40px;padding:0 16px;border-radius:99px;border:1.5px solid var(--line);background:none;box-shadow:none;color:var(--fg);font:700 14px var(--f,inherit)}#p-equipe .eq-ch2.fort{background:var(--n1-nuit,#1B2440);border-color:var(--n1-nuit,#1B2440);color:#fff}'+
 '#p-equipe .eq-hors{margin:0;padding:6px 16px}#p-equipe .eq-hl{display:flex;align-items:center;gap:10px;padding:8px 0;border-top:1px solid var(--line)}#p-equipe .eq-hl:first-child{border-top:0}'+
 '#p-equipe .eq-ht{flex:none;width:120px;font-size:13px;color:var(--muted);font-weight:600}#p-equipe .eq-hl.manque .eq-ht{color:var(--cor)}#p-equipe .eq-hn{display:flex;flex-wrap:wrap;gap:6px}'+
 '#p-equipe .eq-hp{min-height:34px;padding:0 12px;border-radius:99px;background:var(--bg);box-shadow:var(--n1-pk);color:var(--fg);font:700 13.5px var(--f,inherit)}#p-equipe .eq-hl.manque .eq-hp{box-shadow:var(--n1-pk),inset 0 0 0 1.5px var(--cor);color:var(--cor)}'+
 '#p-equipe .eq-regl{padding:12px 16px}#p-equipe .eq-rg{display:flex;align-items:center;gap:10px;width:100%;padding:9px 0;border:0;border-top:1px solid var(--line);background:none;box-shadow:none;text-align:left;color:var(--fg);font-size:14px;border-radius:0}#p-equipe .eq-rg span:first-child{flex:1}'+
 '#p-equipe .eq-regl .sec-h+.eq-rg{border-top:0}'+
 '#p-equipe .eq-p .eq-pl{padding-left:10px;padding-right:6px}#p-equipe .eq-ph{padding:4px 0 6px}#p-equipe .eq-ph .eq-sem span{width:56px;text-align:center;font-size:11px;color:var(--muted);font-weight:600}#p-equipe .eq-ph .eq-sem span.on{color:var(--fg);font-weight:800}'+
 '#p-equipe .eq-k{width:56px;height:36px;border-radius:12px;font:700 11.5px/1 Manrope,system-ui,sans-serif;padding:0 2px;overflow:hidden;white-space:nowrap;background:var(--teinte);color:var(--fg)}'+
 '#p-equipe .eq-k.ch{background:var(--cc);color:#fff}#p-equipe .eq-k.sel{outline:2px solid var(--n1-laiton);outline-offset:1px}'+
 '@media (max-width:460px){#p-equipe .eq-k,#p-equipe .eq-ph .eq-sem span{width:44px}#p-equipe .eq-k{font-size:10.5px;height:34px;border-radius:10px}#p-equipe .eq-sem{gap:3px}#p-equipe .eq-n{min-width:0;overflow:hidden}#p-equipe .eq-n b{font-size:14px;overflow:hidden;text-overflow:ellipsis}#p-equipe .eq-n small{display:none}}';
d.head.appendChild(st);
rend();
})();
