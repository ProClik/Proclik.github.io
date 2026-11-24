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
function nomCase(v){if(!v)return 'Rien de prévu';if(v==='bureau')return 'Au bureau';if(v==='repos')return 'Repos ou congé';var c=(X.CH||{})[v];return c?c.n:v}
/* ce qu'on a envoyé à l'équipe pour un chantier : signature des affectations, pour voir s'il y a eu des changements depuis */
function sig(id){return jours(id).map(function(k){return k+':'+qui(id,k).map(function(p){return p.n+'='+taches(k,p.n).join(',')}).join('+')}).join('|')}
function prevenir(id){var Q={};jours(id).forEach(function(k){qui(id,k).forEach(function(p){Q[p.n]=1})});var N=Object.keys(Q);
  S.prev[id]={d:iso(auj()),sig:sig(id),qui:N,vu:N.slice(0,Math.max(0,N.length-1))};ecrit();bouge();return N}
function prevenu(id){var P=S.prev[id];if(!P)return null;return {d:P.d,qui:P.qui||[],vu:P.vu||[],change:P.sig!==sig(id)}}
var ecoute=[];function bouge(){ecoute.forEach(function(f){try{f()}catch(e){}})}
function jourLong(k){var x=dte(k);return JL[x.getDay()]+' '+x.getDate()+' '+MOIS[x.getMonth()]}
function jourCourt(k){var x=dte(k);return JC[x.getDay()]+' '+x.getDate()}
function relatif(k){var T=iso(auj()),D=iso(plus(auj(),1));return k===T?'Aujourd\'hui':k===D?'Demain':jourCourt(k)}
window.PCEQ={EQ:EQ,iso:iso,get:get,set:set,taches:taches,togTache:togTache,qui:qui,besoin:besoin,setBesoin:setBesoin,jours:jours,nomCase:nomCase,prevenir:prevenir,prevenu:prevenu,
  jourLong:jourLong,jourCourt:jourCourt,relatif:relatif,ecoute:function(f){ecoute.push(f)}};

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
var SEL=null,VUE='sem',MO=0,QUI=EQ[0].n,BY='p',ANNUL=null,CONTRAT=39;
function court(v){if(!v)return '';if(v==='bureau')return 'Bureau';if(v==='repos')return 'Repos';var c=(X.CH||{})[v];if(!c)return v;
  var w=(c.n||'').replace(/^(M\.|Mme|Cabinet|SCI|Maison)\s+/,'').split(/[\s·,]+/)[0];return w.length>8?w.slice(0,7)+'.':w}
function evDe(id,k){var c=(X.CH||{})[id];return (X.EV||[]).filter(function(e){var x=e.x||{};return e.k==='run'&&e.d===k&&(x.ch===id||(id==='alpes'&&x.ch===1)||(c&&String(e.t||'').indexOf(c.n)>-1))})[0]}
function heures(id,k){var e=evDe(id,k);return e?e.s.replace(':','h')+' – '+e.e.replace(':','h'):'8h00 – 17h00'}
/* heures travaillées d'un jour : horaires du chantier moins 1 h de pause, sinon 8 h ; bureau 8 h ; rien / repos 0 */
function hJour(v,k){if(!v||v==='repos')return 0;var e=v==='bureau'?null:evDe(v,k);if(!e)return 8;
  function m(s){var a=s.split(':');return +a[0]*60+(+a[1]||0)}var n=(m(e.e)-m(e.s))/60;return n>6?n-1:n}
function hTxt(n){return (Math.round(n*2)/2).toString().replace('.',',')+' h'}

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

function choix(){return '<div class="seg eqv" role="tablist" aria-label="Vue de l\'équipe">'+[['sem','Semaine'],['mois','Mois'],['sal','Ce que voit un salarié']].map(function(x){return '<button type="button" role="tab" data-vue="'+x[0]+'" aria-selected="'+(VUE===x[0])+'">'+x[1]+'</button>'}).join('')+'</div>'}
function parQui(){return '<div class="eqby" role="group" aria-label="Lire le tableau"><span>Lire par</span>'+[['p','Personne'],['c','Chantier']].map(function(x){return '<button type="button" data-by="'+x[0]+'" aria-pressed="'+(BY===x[0])+'">'+x[1]+'</button>'}).join('')+'</div>'}
function nav(titre,cle){return '<div class="cal-top"><h3>'+titre+'</h3><div class="cal-nav"><button class="nb" data-'+cle+'="-1" aria-label="Avant">‹</button><button data-'+cle+'="0">Aujourd\'hui</button><button class="nb" data-'+cle+'="1" aria-label="Après">›</button></div></div>'}
function cap(t){return t.replace(/^./,function(x){return x.toUpperCase()})}
function tete(K,T,fin){return '<thead><tr><th class="eqt-n"></th>'+K.map(function(k){var x=dte(k),we=!(x.getDay()%6);
    return '<th class="'+(k===T?'tdy':'')+(we?' we':'')+'"><small>'+JC[x.getDay()].replace('.','')+'</small><b>'+x.getDate()+'</b></th>'}).join('')+(fin?'<th class="eqt-h"><small>Heures</small></th>':'')+'</tr></thead>'}
function legende(CHs,br){return '<div class="eqw-leg">'+CHs.map(function(c){return '<span><i style="background:'+couleur(c.id)+'"></i>'+esc(c.n)+'</span>'}).join('')+'<span><i class="vd"></i>Rien de prévu</span>'+(br?'<span><i class="hb"></i>Pas encore publié</span>':'')+'</div>'}
/* le tableau par personne : K = liste de dates ; large = case avec la tâche + heures au bout */
function tableau(K,large){var CHs=chantiers(),T=iso(auj()),br=0;
  var h='<div class="eqt'+(large?' large':' serre')+'"><table>'+tete(K,T,large)+'<tbody>';
  h+=EQ.map(function(p){var tot=0;return '<tr><th class="eqt-n"><b>'+p.n+'</b><small>'+p.r+'</small></th>'+K.map(function(k){var v=get(k,p.n),c=(X.CH||{})[v],we=!(dte(k).getDay()%6),t=c?taches(k,p.n):[],b=brouillon(k,p.n);
      tot+=hJour(v,k);if(b)br++;
      if(we&&!v&&!b)return '<td class="we"></td>';
      return '<td><button type="button" class="eqc'+(c?' ch':v?' gris':' vide')+(k===T?' tdy':'')+(b?' br':'')+'" data-eqp="'+p.n+'" data-k="'+k+'" style="'+(c?'--cc:'+couleur(v):'')+'" aria-label="'+p.n+', '+jourLong(k)+' : '+esc(nomCase(v))+(b?' (pas encore publié)':'')+'">'+
        (v?'<b>'+esc(court(v))+'</b>'+(large&&t.length?'<small>'+esc(t[0].toLowerCase())+(t.length>1?' +'+(t.length-1):'')+'</small>':''):'<b>+</b>'+(large?'<small>à placer</small>':''))+'</button></td>'}).join('')+
      (large?'<td class="eqt-h'+(tot>CONTRAT?' sup':tot<CONTRAT?' moins':'')+'"><b>'+hTxt(tot)+'</b><small>'+(tot>CONTRAT?'+'+hTxt(tot-CONTRAT)+' sup.':'sur '+CONTRAT+' h')+'</small></td>':'')+'</tr>'}).join('');
  /* ligne « il manque » */
  var lm=K.map(function(k){var L=CHs.filter(function(c){return qui(c.id,k).length<besoin(c.id,k)});
    return '<td>'+L.map(function(c){var m=besoin(c.id,k)-qui(c.id,k).length;return '<button type="button" class="eqm" data-eqc="'+c.id+'" data-k="'+k+'" style="--cc:'+couleur(c.id)+'">'+esc(court(c.id))+' +'+m+'</button>'}).join('')+'</td>'});
  if(lm.join('').indexOf('eqm')>-1)h+='<tr class="eqt-m"><th class="eqt-n"><b>Il manque</b></th>'+lm.join('')+(large?'<td></td>':'')+'</tr>';
  h+='</tbody></table></div>'+legende(CHs,br);
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
function rendSem(){var K=[0,1,2,3,4].map(kj),C=changes(K),h='';
  h+=nav(titreSem(),'wk')+parQui();
  h+='<p class="hint eqt-hint">'+(BY==='c'?'Touchez une case pour choisir qui va sur ce chantier ce jour-là.':'Touchez une case pour changer où va la personne et ce qu\'elle fait.')+'</p>';
  h+=BY==='c'?tableauCh(K,true):tableau(K,true);
  h+='<div class="eq-act"><button type="button" class="btn" id="eq-copie"><span class="lab"><span>Copier la semaine d\'avant</span></span></button>'+(ANNUL&&ANNUL.wk===WK?'<button type="button" class="btn" id="eq-annul"><span class="lab"><span>Annuler la copie</span></span></button>':'')+'</div>';
  if(C.length){var N={};C.forEach(function(x){N[x[1]]=1});N=Object.keys(N);
    h+='<button type="button" class="btn go eq-env" id="eq-pub"><span class="lab"><span>Publier et prévenir ('+C.length+' changement'+(C.length>1?'s':'')+')</span></span></button>';
    h+='<p class="hint" style="text-align:center">Les cases hachurées ne sont pas encore publiées : '+N.join(', ')+(N.length>1?' ne voient':' ne voit')+' pas encore ces changements. Seuls '+(N.length>1?'eux seront prévenus':'lui sera prévenu')+'.</p>'}
  else h+='<p class="eq-ok">✓ Tout est publié : chacun voit sa semaine sur son téléphone.</p>';
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
    return '<div class="cheq-pw'+(ici?' on':'')+'"><button type="button" class="eq-o'+(ici?' on':'')+'" data-pp="'+p.n+'"><span class="eq-av"><i>'+p.n.charAt(0)+'</i></span><span class="tx"><b>'+p.n+'</b><small>'+(ici?'Sur ce chantier':esc(nomCase(v)))+'</small></span><span class="eq-ck">'+(ici?'✓':'+')+'</span></button>'+hT+'</div>'}).join('')+'</div>'}
  X.xopen(c.n,sous(),corps(),'<button class="btn go" id="eq-ok" style="width:100%">C\'est bon</button>',lie);
  function lie(){$$('#x-in [data-pp]').forEach(function(b){b.onclick=function(){var p=b.dataset.pp;set(k,p,get(k,p)===id?'':id);$('#x-in').innerHTML=corps();$('#x-s').textContent=sous();lie()}});
    $$('#x-in [data-ta]').forEach(function(b){b.onclick=function(){togTache(k,b.dataset.tp,b.dataset.ta);$('#x-in').innerHTML=corps();lie()}});
    var ok=$('#eq-ok');if(ok)ok.onclick=function(){X.xclose()}}}
/* ---------- toucher le jour d'une personne : où elle va ---------- */
function caseP(p,k){var CHs=chantiers(),L=CHs.map(function(c){return [c.id,c.n]}).concat([['bureau','Au bureau'],['repos','Repos ou congé'],['','Rien de prévu']]);
  X.xopen(p,jourLong(k),'<div class="eq-choix">'+L.map(function(o){var on=get(k,p)===o[0];return '<button type="button" class="eq-o'+(on?' on':'')+'" data-v="'+o[0]+'"><span class="tx"><b>'+esc(o[1])+'</b></span><span class="eq-ck">'+(on?'✓':'')+'</span></button>'}).join('')+'</div>','',function(){
    $$('#x-in [data-v]').forEach(function(b){b.onclick=function(){set(k,p,b.dataset.v);X.xclose();X.toast(p+' : '+nomCase(b.dataset.v),jourLong(k))}})})}

pv.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;
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
 '#p-equipe .eqt thead th.tdy{background:var(--n1-nuit,#1B2440);color:#fff}#p-equipe .eqt thead th.tdy small{color:rgba(255,255,255,.75)}'+
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
 '#p-equipe .eqs-qui button{min-height:38px;padding:0 14px;border-radius:99px;background:var(--bg);box-shadow:var(--n1-pk);color:var(--fg);font:700 14px var(--f,inherit)}#p-equipe .eqs-qui button[aria-pressed="true"]{background:var(--n1-nuit,#1B2440);color:#fff;box-shadow:none}'+
 '#p-equipe .eqs-tel{max-width:420px;margin:0 auto 10px;padding:18px 16px 20px;border-radius:32px;background:var(--bg);box-shadow:0 0 0 8px var(--z-tile,var(--card)),0 10px 30px rgba(0,0,0,.12)}'+
 '#p-equipe .eqs-top small{display:block;font-size:12px;color:var(--muted)}#p-equipe .eqs-top b{display:block;font-size:24px;margin-bottom:6px}'+
 '#p-equipe .eqs-j{margin:16px 2px 6px;font-size:14px;color:var(--muted)}#p-equipe .eqs-j b{color:var(--fg);font-size:15px}'+
 '#p-equipe .eqs-c{padding:14px 16px;border-radius:20px;background:var(--z-tile,var(--card));box-shadow:inset 4px 0 0 var(--cc),var(--z-ombre-s,0 1px 3px rgba(0,0,0,.08))}#p-equipe .eqs-c.gris{box-shadow:var(--z-ombre-s,none)}#p-equipe .eqs-c.gris b{font-size:15px}#p-equipe .eqs-c.gris small{display:block;color:var(--muted);font-size:13px;margin-top:2px}'+
 '#p-equipe .eqs-h{display:flex;align-items:flex-start;gap:10px}#p-equipe .eqs-h i{flex:none;width:12px;height:12px;margin-top:6px;border-radius:50%;background:var(--cc)}#p-equipe .eqs-h span{display:flex;flex-direction:column}#p-equipe .eqs-h b{font-size:18px}#p-equipe .eqs-h small{font-size:13.5px;color:var(--muted)}'+
 '#p-equipe .eqs-l{display:flex;gap:10px;padding:8px 0 0 22px;font-size:14.5px}#p-equipe .eqs-l span{flex:none;width:52px;color:var(--muted);font-size:13px;padding-top:1px}'+
 '#p-equipe .eqs-b{display:flex;gap:8px;margin:12px 0 0 22px}#p-equipe .eqs-b button{min-height:42px;padding:0 18px;border-radius:99px;font:700 14px var(--f,inherit)}#p-equipe .eqs-it{background:var(--n1-nuit,#1B2440);color:#fff;border:0}#p-equipe .eqs-ok{background:none;border:1.5px solid var(--line);color:var(--fg)}'+
 '#p-equipe .eqby{display:flex;align-items:center;gap:6px;margin:0 0 10px}#p-equipe .eqby span{font-size:13px;color:var(--muted);margin-right:2px}'+
 '#p-equipe .eqby button{min-height:36px;padding:0 14px;border-radius:99px;background:var(--bg);box-shadow:var(--n1-pk);color:var(--fg);font:700 13.5px var(--f,inherit)}#p-equipe .eqby button[aria-pressed="true"]{background:var(--n1-nuit,#1B2440);color:#fff;box-shadow:none}'+
 '#p-equipe .eqc.br{background-image:repeating-linear-gradient(135deg,rgba(255,255,255,.42) 0 4px,transparent 4px 9px)}#p-equipe .eqc.gris.br,#p-equipe .eqc.vide.br{background-image:repeating-linear-gradient(135deg,var(--line) 0 3px,transparent 3px 8px)}'+
 '#p-equipe .eqc.br::after{content:"";position:absolute;top:4px;right:4px;width:7px;height:7px;border-radius:50%;background:var(--n1-laiton,#B8925A);box-shadow:0 0 0 1.5px #fff}#p-equipe .eqc{position:relative}'+
 '#p-equipe .eqw-leg i.hb{width:12px;height:10px;border-radius:3px;background:var(--k-run,#888) repeating-linear-gradient(135deg,rgba(255,255,255,.5) 0 3px,transparent 3px 6px)}'+
 '#p-equipe .eqt th.eqt-h{background:none;box-shadow:none;width:58px}#p-equipe .eqt td.eqt-h{text-align:center;width:58px}#p-equipe td.eqt-h b{display:block;font-size:15px}#p-equipe td.eqt-h small{display:block;font-size:10.5px;color:var(--muted);white-space:nowrap}'+
 '#p-equipe td.eqt-h.sup b,#p-equipe td.eqt-h.sup small{color:var(--n1-laiton,#A8823F)}#p-equipe td.eqt-h.moins small{color:var(--muted)}@media (max-width:699px){#p-equipe .eqc em span{display:none}}'+
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
