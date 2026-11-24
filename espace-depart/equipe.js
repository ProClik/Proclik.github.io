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
    EQ.forEach(function(p){var v=M[p.n][i];if(v===a&&Ja.length&&Ja.indexOf(k)<0)v=b;o[p.n]=v})}});
  ecrit()}
['jr','bes','env','prev'].forEach(function(k){if(!S[k])S[k]={}});
/* tâches par personne et par jour (Cyril 24/11) : lignes de travaux du chantier ; exemple : travaux pas finis répartis sur les jours */
if(!S.ta){S.ta={};chantiers().forEach(function(c){var R=(c.ouv||[]).filter(function(o){return o[2]<100}).map(function(o){return o[0]}),i=0;if(!R.length)return;
  evJours(c.id).forEach(function(k){EQ.forEach(function(p){if(get(k,p.n)===c.id){(S.ta[k]=S.ta[k]||{})[p.n]=[R[i%R.length]];i++}})})});ecrit()}
function taches(k,n){return ((S.ta[k]||{})[n]||[]).slice()}
function togTache(k,n,t){var o=S.ta[k]=S.ta[k]||{},L=o[n]=o[n]||[],i=L.indexOf(t);if(i>-1)L.splice(i,1);else L.push(t);ecrit();bouge()}
function get(k,n){return (S.jr[k]||{})[n]||''}
function set(k,n,v){(S.jr[k]=S.jr[k]||{})[n]=v;ecrit();bouge()}
function qui(id,k){return EQ.filter(function(p){return get(k,p.n)===id})}
function besoin(id,k){var B=S.bes[id];if(B&&B[k]!=null)return B[k];var J=evJours(id);return J.length?(J.indexOf(k)>-1?2:0):(dte(k).getDay()%6?2:0)}
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

function manques(){var A=[];chantiers().forEach(function(c){var j=[];for(var i=0;i<5;i++)if(qui(c.id,kj(i)).length<besoin(c.id,kj(i)))j.push(JOURS[i].replace('.',''));if(j.length)A.push(c.n+' : il manque du monde '+j.join(', '))});
  EQ.forEach(function(p){var v=[0,1,2,3,4].map(function(i){return get(kj(i),p.n)?'':JOURS[i].replace('.','')}).filter(Boolean);if(v.length)A.push(p.n+' : rien de prévu '+v.join(', '))});return A}
function rend(){
  var CHs=chantiers(),A=manques(),h='',env=S.env[kj(0)];
  h+=(window.PCTAG?window.PCTAG('equipe'):'');
  h+='<div class="cal-top eq-top"><button type="button" class="eq-fl" data-wk="-1" aria-label="Semaine d\'avant">‹</button><h3>'+titreSem()+'</h3><button type="button" class="eq-fl" data-wk="1" aria-label="Semaine d\'après">›</button><span class="pill eq-ex">Exemple</span></div>';
  if(A.length)h+='<div class="card eq-regl"><div class="sec-h" style="margin-bottom:6px"><h2>À régler</h2><span>'+A.length+'</span></div>'+A.slice(0,4).map(function(a){return '<p>'+esc(a)+'</p>'}).join('')+'</div>';
  h+='<div class="sec-h"><h2>Par chantier</h2><span>personnes par jour</span></div>';
  h+='<div class="eq-ch">'+CHs.map(function(c){
    return '<div class="card eq-c" style="--cc:'+couleur(c.id)+'"><div class="eq-h"><span class="eq-l">'+lettre(c)+'</span><span class="tx"><b>'+esc(c.n)+'</b><small>'+esc(c.v||'')+'</small></span></div>'+
      '<div class="eq-j">'+JOURS.map(function(J,i){var k=kj(i),Q=qui(c.id,k),b=besoin(c.id,k),m=b-Q.length;
        return '<button type="button" class="eq-d'+(m>0?' manque':'')+(b||Q.length?'':' off')+'" data-eqc="'+c.id+'" data-k="'+k+'"><small>'+J+' '+date(i)+'</small><b>'+(b||Q.length?Q.length:'–')+'</b><span class="eq-av">'+Q.map(function(p){return '<i>'+p.n.charAt(0)+'</i>'}).join('')+'</span>'+(m>0?'<em>il manque '+m+'</em>':'')+'</button>'}).join('')+'</div></div>'}).join('')+'</div>';
  h+='<div class="sec-h"><h2>Par personne</h2><span>touchez pour changer</span></div><div class="card eq-p">'+EQ.map(function(p){
    return '<div class="eq-pl"><span class="eq-n"><b>'+p.n+'</b><small>'+p.r+'</small></span><span class="eq-sem">'+[0,1,2,3,4].map(function(i){var k=kj(i),v=get(k,p.n),c=(X.CH||{})[v];
      return '<button type="button" class="eq-k'+(v?'':' vide')+'" data-eqp="'+p.n+'" data-k="'+k+'" style="'+(c?'--cc:'+couleur(v):'')+'" aria-label="'+jourCourt(k)+' : '+esc(nomCase(v))+'">'+(c?lettre(c):v==='bureau'?'B':v==='repos'?'–':'+')+'</button>'}).join('')+'</span></div>'}).join('')+
    '<div class="eq-leg">'+CHs.map(function(c){return '<span><i style="background:'+couleur(c.id)+'">'+lettre(c)+'</i>'+esc(c.n)+'</span>'}).join('')+'<span><i class="b">B</i>Bureau</span></div></div>';
  h+='<button type="button" class="btn go eq-env" id="eq-env"><span class="lab"><span>'+(env?'Renvoyer le planning à l\'équipe':'Envoyer le planning à l\'équipe')+'</span></span></button>';
  if(env)h+='<p class="hint" style="text-align:center">Envoyé : chacun voit sa semaine dans son Espace.</p>';
  pv.innerHTML=h}

/* ---------- toucher un jour d'un chantier : qui vient ---------- */
function caseCh(id,k){var c=(X.CH||{})[id];
  function sous(){return jourLong(k)+' · '+qui(id,k).length+' sur '+besoin(id,k)+' prévus'}
  function corps(){return '<p class="hint" style="margin:0 0 10px">Touchez une personne pour la mettre sur ce chantier, ou l\'enlever.</p><div class="eq-choix">'+EQ.map(function(p){var v=get(k,p.n),ici=v===id;
    return '<button type="button" class="eq-o'+(ici?' on':'')+'" data-pp="'+p.n+'"><span class="eq-av"><i>'+p.n.charAt(0)+'</i></span><span class="tx"><b>'+p.n+'</b><small>'+(ici?'Sur ce chantier':esc(nomCase(v)))+'</small></span><span class="eq-ck">'+(ici?'✓':'+')+'</span></button>'}).join('')+'</div>'}
  X.xopen(c.n,sous(),corps(),'<button class="btn go" id="eq-ok" style="width:100%">C\'est bon</button>',lie);
  function lie(){$$('#x-in [data-pp]').forEach(function(b){b.onclick=function(){var p=b.dataset.pp;set(k,p,get(k,p)===id?'':id);$('#x-in').innerHTML=corps();$('#x-s').textContent=sous();lie()}});
    var ok=$('#eq-ok');if(ok)ok.onclick=function(){X.xclose()}}}
/* ---------- toucher le jour d'une personne : où elle va ---------- */
function caseP(p,k){var CHs=chantiers(),L=CHs.map(function(c){return [c.id,c.n]}).concat([['bureau','Au bureau'],['repos','Repos ou congé'],['','Rien de prévu']]);
  X.xopen(p,jourLong(k),'<div class="eq-choix">'+L.map(function(o){var on=get(k,p)===o[0];return '<button type="button" class="eq-o'+(on?' on':'')+'" data-v="'+o[0]+'"><span class="tx"><b>'+esc(o[1])+'</b></span><span class="eq-ck">'+(on?'✓':'')+'</span></button>'}).join('')+'</div>','',function(){
    $$('#x-in [data-v]').forEach(function(b){b.onclick=function(){set(k,p,b.dataset.v);X.xclose();X.toast(p+' : '+nomCase(b.dataset.v),jourLong(k))}})})}

pv.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;
  if(b.dataset.wk){WK+=+b.dataset.wk;return rend()}
  if(b.dataset.eqc)return caseCh(b.dataset.eqc,b.dataset.k);
  if(b.dataset.eqp)return caseP(b.dataset.eqp,b.dataset.k);
  if(b.id==='eq-env'){S.env[kj(0)]=true;ecrit();rend();X.toast('Planning envoyé à l\'équipe','Chacun voit sa semaine sur son téléphone (exemple).')}});

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
 '#p-equipe .eq-d.off{opacity:.45;box-shadow:none}';
d.head.appendChild(st);
rend();
})();
