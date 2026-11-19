/* Chantiers de l'Espace (demandes de Cyril du 2/11).
   Liste : « Créer un chantier » en premier, la vue d'ensemble, puis un menu « En cours » / « Tous les chantiers ».
   Dans un chantier : le résumé seul à l'ouverture, puis un menu à icônes qui ouvre une partie à la fois
   (Travaux, Finances, Fournitures, Plan, Notes, Photos, Client, Documents).
   Les factures (acompte, situation, solde) passent d'abord par une pré-facture qu'on vérifie, puis partent dans VosFactures :
   une facture ne se modifie plus une fois créée. Ici tout est en démonstration : rien n'est envoyé. */
(function(){
"use strict";
var X=window.PCX;if(!X)return;
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
var esc=X.esc,r2=X.r2,CH=X.CH,DOS=X.DOS;
var eur=function(n){n=r2(n||0);var s=Math.abs(n).toFixed(2).split('.');return (n<0?'− ':'')+s[0].replace(/\B(?=(\d{3})+(?!\d))/g,' ')+','+s[1]+' €'};
var num=function(s){var n=parseFloat(String(s==null?'':s).replace(/\s/g,'').replace(',','.'));return isFinite(n)?n:0};
var fr=function(n){return String(r2(n)).replace('.',',')};
var norm=function(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/\s+/g,'')};
var jour=function(){return new Date().toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'numeric'})};
var maint=function(){var d=new Date();return jour()+' · '+d.getHours()+' h '+('0'+d.getMinutes()).slice(-2)};
var cliky=function(){return window.PCOPT&&PCOPT.cliky!=null?!!PCOPT.cliky:X.lsGet('pc-cliky',true)};
var en=function(){return X.online?X.online():true};
var attente=function(t){if(!en()&&X.attente)X.attente(t)};

/* ---------- icônes (même trait que le menu) ---------- */
var I=function(p){return '<svg viewBox="0 0 24 24" aria-hidden="true">'+p+'</svg>'};
var IC={
 trav:I('<path d="M3 20h18M6 20V10l6-4 6 4v10"/><path d="M9 14l2 2 4-4"/>'),
 fin:I('<circle cx="12" cy="12" r="8.5"/><path d="M14.8 9.2a3 3 0 0 0-5.1 1.3M9 13.5a3 3 0 0 0 5.4 1.2M7.5 11h5M7.5 13h4.5"/>'),
 four:I('<path d="M3 8l9-4 9 4-9 4z"/><path d="M3 8v8l9 4 9-4V8"/><path d="M12 12v8"/>'),
 plan:I('<path d="M4 4h16v16H4z"/><path d="M4 12h7v8M11 4v5M15 12h5"/>'),
 notes:I('<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 12h7M9 16h5"/>'),
 photo:I('<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>'),
 cli:I('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
 agenda:I('<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="M7.5 14h2M11 14h2M14.5 14h2M7.5 17h2M11 17h2"/>'),
 docs:I('<path d="M8 3h8l4 4v14H8z"/><path d="M16 3v4h4"/><path d="M4 7v14h12"/>'),
 tel:I('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>'),
 sms:I('<path d="M4 5h16v11H9l-5 4z"/>'),
 mail:I('<path d="M3 6h18v12H3z"/><path d="M3 7l9 6 9-6"/>'),
 route:I('<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h6a4 4 0 0 0 0-8h-4a4 4 0 0 1 0-8h6"/>'),
 plus:I('<path d="M12 5v14M5 12h14"/>'),
 crayon:I('<path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 6l3 3"/>'),
 cadenas:I('<rect x="5" y="11" width="14" height="9" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
 micro:I('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>'),
 fact:I('<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/>'),
 devis:I('<path d="M13 21H6V3h8l4 4v4"/><path d="M14 3v4h4M9 9h4M9 13h3"/><path d="M19.5 13.5l-5.5 5.5-.6 2.6 2.6-.6 5.5-5.5z"/>'),
 acompte:I('<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5V12h8.5"/>'),
 prod:I('<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>'),
 chantier:I('<path d="M3 20h18M6 20V10l6-4 6 4v10"/><path d="M10 20v-5h4v5"/>'),
 equipe:I('<circle cx="9" cy="8" r="3.2"/><path d="M3 20a6 6 0 0 1 12 0"/><circle cx="17" cy="9" r="2.6"/><path d="M15.5 14.2A5 5 0 0 1 21 19"/>'),
 epingle:I('<path d="M9 4h6l-1 6 3 3H7l3-3z"/><path d="M12 13v8"/>'),
 oeil:I('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>')};
var ONG=[['trav','Travaux'],['agenda','Planning'],['fin','Finances'],['four','Fournitures'],['plan','Plan'],['notes','Notes'],['photo','Photos'],['cli','Client'],['docs','Documents'],['equipe','Entreprises']];

/* ---------- état ---------- */
var vue=X.lsGet('pc-chv','cours');
var cur=null,ong=null,edit=null,prevenir=null;
var saveCH=function(){X.saveCH()};
function avc(c){return X.avc?X.avc(c):0}
function cfin(c){return X.cfin(c)}
function etat(c){return c.st==='run'?['En cours','ok']:c.st==='start'?['À démarrer','todo']:['Terminé','grey']}
function dos(c){var o=c.dos&&(DOS[c.dos]||vraiDos(c.dos));if((o&&o.vrai)||!monCh(c)||!enVrai())return o;
 /* Chantier créé avant le 17/11 dans l'Espace réel : relié à un client de démonstration ou à rien.
    On le rattache au vrai client du même nom s'il n'y en a qu'un (Cyril : « la partie plan de Virginie ne montre toujours pas son vrai plan »). */
 var nm=function(s){return norm(String(s||'').replace(/^(m\.|mme|mlle|monsieur|madame)\s+/i,''))},n=nm(c.n);if(!n)return o;
 var V=vrais().filter(function(x){var a=nm(x.nom);return a&&(a===n||n.indexOf(a)>=0||a.indexOf(n)>=0)});
 if(V.length===1){c.dos=V[0].contact;saveCH();return vraiDos(c.dos)}
 return o}
/* pas de vrai client trouvé : on le choisit (Espace réel) */
function monCh(c){return !!(c&&/^c[0-9a-z]{7,}$/.test(c.id||""))}
function relierHTML(c){var C=clientsChoix();return '<div class="card"><b>Ce chantier n\'est relié à aucun client de votre Espace</b><p class="hint" style="margin:6px 0 10px">Choisissez le client : son plan, sa demande, son pré-devis et ses devis s\'afficheront ici.</p>'+
 '<label class="ch-f" style="display:grid;gap:6px">Le client<select id="ch-rel">'+C.map(function(x){return '<option value="'+esc(x.k)+'">'+esc(x.n)+(x.v?' · '+esc(x.v):'')+'</option>'}).join('')+'</select></label>'+
 '<button class="btn go" style="width:100%;margin-top:10px" type="button" data-chrel="'+esc(c.id)+'">Relier ce chantier</button></div>'}
/* Vrais clients (Cyril 17/11 : « je dois retrouver tout de A à Z ») : ceux du formulaire et ceux créés dans l'Espace.
   Dans l'Espace réel, le chantier se crée pour eux, et retrouve leur demande, leur pré-devis, leurs devis et factures. */
function enVrai(){return document.documentElement.classList.contains('pcvrai')&&window.PCV&&PCV.api}
function vrais(){try{return X.cf&&X.cf.vrais?X.cf.vrais()||[]:[]}catch(e){return []}}
function vraiDos(k){var c=vrais().filter(function(x){return x.contact===k})[0];if(!c)return null;
 var o={n:c.nom||'Client',prenom:c.prenom||'',nom:c.nom||'',type:c.type==='pro'?'pro':'part',entreprise:c.entreprise||'',rue:c.adresse||'',cp:c.cp||'',v:c.ville||'',
  adr:[c.adresse,[c.cp,c.ville].filter(Boolean).join(' ')].filter(Boolean).join(', '),tel:c.telephone||'',mail:c.email||'',t:c.demande||'',k:'nouveau',chat:[],ph:[],docs:[],hist:[],vrai:1};
 DOS[k]=o;return o}
function clientsChoix(){var R={},out=[];
 if(enVrai()){vrais().forEach(function(c){if(c.contact)R[c.contact]={k:c.contact,n:c.nom||'Client',v:c.ville||''}});
  Object.keys(DOS).forEach(function(k){var o=DOS[k];if(o&&o.vrai&&o.n&&!R[k])R[k]={k:k,n:o.n,v:o.v||''}})}
 else Object.keys(DOS).forEach(function(k){if(DOS[k]&&DOS[k].n)R[k]={k:k,n:DOS[k].n,v:DOS[k].v||''}});
 Object.keys(R).forEach(function(k){out.push(R[k])});
 return out.sort(function(a,b){return a.n.replace(/^(M\.|Mme)\s+/,'').localeCompare(b.n.replace(/^(M\.|Mme)\s+/,''),'fr')})}
var VD={};
function dossierVrai(c){var o=dos(c);if(!o||!o.vrai||!enVrai())return '';
 return '<div id="ch-vdos" data-c="'+esc(c.dos)+'">'+dossierHTML(c.dos)+'</div>'}
function dossierHTML(k){var x=VD[k];
 if(!x)return '<div class="sec-h"><h2>Dossier du client</h2><span>formulaire, pré-devis, devis, factures</span></div><div class="card"><p class="hint" style="margin:0">Chargement du dossier…</p></div>';
 var d=x.dem,P=(d&&d.pre_devis)||[],D=x.docs||[],Dv=D.filter(function(y){return y.type==='devis'}),Fa=D.filter(function(y){return y.type!=='devis'&&y.type!=='avoir'});
 var jr=function(s){var t=new Date(s);return s&&!isNaN(t)?t.toLocaleDateString('fr-FR',{day:'numeric',month:'long'}):''};
 var lv=X.cf&&X.cf.ligneVdoc?X.cf.ligneVdoc:function(){return ''};
 var pre=P.slice(0,4).map(function(p,i){var nv=(p.a_verifier||[]).length,tot=p.totaux&&p.totaux.total_ht!=null?eur(+p.totaux.total_ht):'';
  return '<button class="cf-li" type="button" data-vc="'+esc(k)+'"><span class="cf-av cf-doc">'+IC.devis+'</span><span class="tx"><b>'+(i?'Pré-devis plus ancien':'Pré-devis de la demande')+'</b><small>'+esc([jr(p.le),p.resume].filter(Boolean).join(' · '))+'</small></span><span class="cf-m"><b>'+tot+'</b><span class="pill '+(i?'grey':nv?'warn':'todo')+'">'+(i?'Ancien':nv?'À vérifier ('+nv+')':'Ouvrir')+'</span></span></button>'}).join('');
 var vide=!P.length&&!D.length&&!d;
 return '<div class="sec-h"><h2>Dossier du client</h2><span>formulaire, pré-devis, devis, factures</span></div>'+
  (vide?'<div class="card"><p class="hint" style="margin:0">'+(x.err?'Dossier pas chargé : '+esc(x.err):'Pas encore de demande du formulaire ni de devis pour ce client.')+'</p></div>':
  '<div class="card lst cf-l ch-docs">'+
   (d?'<button class="cf-li" type="button" data-vc="'+esc(k)+'"><span class="cf-av cf-doc">'+IC.docs+'</span><span class="tx"><b>Sa demande du formulaire</b><small>réponses, photos'+(planDemande(d)?', plan dessiné':'')+'</small></span><span class="go">›</span></button>':'')+
   pre+Dv.map(lv).join('')+Fa.map(lv).join('')+'</div>')+
  (x.err&&!vide?'<p class="hint">'+esc(x.err)+'</p>':'')}
/* Espace réel : les boutons « Créer » du chantier passent par les vrais documents (VosFactures), pas par des brouillons d'exemple */
function creerVrai(c){return '<div class="card"><b style="font-size:14px">Créer</b><div class="ch-new" style="margin-top:10px">'+[['pre','Pré-devis',IC.devis],['devis','Devis',IC.devis],['ac','Facture d\'acompte',IC.acompte],['fact','Facture',IC.fact]].map(function(x){return '<button type="button" class="btn" data-chvrai="'+x[0]+'">'+x[2]+x[1]+'</button>'}).join('')+'</div>'+
 '<p class="hint" style="margin-top:8px">Le devis part dans VosFactures. Les factures d\'acompte et de fin se créent depuis le devis, dans le dossier du client.</p></div>'}
function actionVrai(c,t){var k=c.dos,x=VD[k],P=x&&x.dem&&x.dem.pre_devis||[],Dv=(x&&x.docs||[]).filter(function(y){return y.type==='devis'});
 if(t==='devis'){if(PCV.nouveauDevis)PCV.nouveauDevis(k,c.t);return}
 if(t==='pre'){if(P.length){PCV.ouvrirDemande(k);return}X.toast('Pas de pré-devis pour ce client','Il arrive quand le client remplit le formulaire. Sinon : bouton Devis, fait à la main.');return}
 if(!Dv.length){X.toast('Créez d\'abord le devis','La facture reprend les lignes du devis.');return}
 PCV.ouvrirDemande(k);X.toast(t==='ac'?'Facture d\'acompte':'Facture de fin','Dans « Devis et factures », touchez le devis puis '+(t==='ac'?'« Acompte ».':'« Facture finale ».'));}
/* Plan d'un vrai client (Cyril 17/11 : « la capture du plan dans chantier ne correspond pas au vrai plan ») :
   la miniature est dessinée à partir du VRAI plan, dans cet ordre : celui retouché ou dessiné par vous sur cet appareil,
   sinon celui du client avec sa demande. Pas de plan : on propose de le créer. */
function planDemande(d){var D=d&&d.demande,P=D&&D.details&&D.details.plan;return P&&(P.floors||[]).some(function(f){return (f.pieces||[]).length})?P:null}
function lsJ(k){try{return JSON.parse(localStorage.getItem(k)||'null')}catch(e){return null}}
function planDe(k){var pm=lsJ('pc-planmod-'+k);if(pm&&pm.plan&&(pm.plan.floors||[]).some(function(f){return (f.pieces||[]).length}))return {plan:pm.plan,src:'modifié par vous',t:pm.t};
 var x=VD[k],P=x&&planDemande(x.dem);return P?{plan:P,src:'dessiné par le client',t:x.dem.demande&&x.dem.demande.recue}:null}
function planSVG(P){var F=(P.floors||[]).filter(function(f){return (f.pieces||[]).length}),f=F[0];if(!f)return '';
 var R=[];f.pieces.forEach(function(p){if(p.zones&&p.zones.length)p.zones.forEach(function(z){R.push({n:z.nom,pts:z.points,l:z.label})});else R.push({n:p.nom,pts:p.points})});
 R=R.filter(function(r){return r.pts&&r.pts.length>2});if(!R.length)return '';
 var xs=[],ys=[];R.forEach(function(r){r.pts.forEach(function(q){xs.push(+q[0]);ys.push(+q[1])})});
 var x0=Math.min.apply(null,xs),y0=Math.min.apply(null,ys),w=Math.max.apply(null,xs)-x0||1,h=Math.max.apply(null,ys)-y0||1,m=Math.max(w,h)*.06,fs=Math.max(w,h)*.045;
 var cen=function(r){if(r.l&&r.l.length===2)return r.l;var a=0,cx=0,cy=0,P=r.pts;for(var i=0;i<P.length;i++){var p=P[i],q=P[(i+1)%P.length],c=p[0]*q[1]-q[0]*p[1];a+=c;cx+=(p[0]+q[0])*c;cy+=(p[1]+q[1])*c}a/=2;return a?[cx/(6*a),cy/(6*a)]:P[0]};
 return '<svg class="ch-pmini" viewBox="'+(x0-m)+' '+(y0-m)+' '+(w+2*m)+' '+(h+2*m)+'" role="img" aria-label="Plan '+esc(f.nom||'')+'">'+
  R.map(function(r){return '<polygon points="'+r.pts.map(function(q){return (+q[0])+','+(+q[1])}).join(' ')+'" fill="var(--soft,#EEF1F6)" stroke="var(--n1-nuit,#1B2440)" stroke-width="'+(Math.max(w,h)*.012)+'" stroke-linejoin="round"/>'}).join('')+
  R.map(function(r){var c=cen(r);return '<text x="'+c[0]+'" y="'+c[1]+'" font-size="'+fs+'" font-weight="700" text-anchor="middle" dominant-baseline="middle" fill="var(--fg,#0E1322)">'+esc(r.n||'')+'</text>'}).join('')+'</svg>'}
function planVraiHTML(k){var x=VD[k];if(!x&&!lsJ('pc-planmod-'+k))return '<div class="card"><p class="hint" style="margin:0">Chargement du plan…</p></div>';
 var p=planDe(k);
 if(!p)return '<div class="card"><b>📐 Pas encore de plan</b><p class="hint" style="margin:6px 0 12px">Le client n\'a pas dessiné de plan avec sa demande. Vous pouvez le dessiner, par exemple pendant la visite : le pré-devis le reprend quand vous recalculez.</p><button class="btn go" style="width:100%" type="button" data-chplan="'+esc(k)+'">📐 Créer le plan</button></div>';
 var F=(p.plan.floors||[]).filter(function(f){return (f.pieces||[]).length}),n=0,s=0;F.forEach(function(f){f.pieces.forEach(function(q){n+=(q.zones&&q.zones.length)||1;s+=+q.surface_m2||0})});
 return '<div class="card pcplan"><div class="row"><b>📐 Plan</b><span class="pill ok">'+esc(p.src)+'</span></div>'+planSVG(p.plan)+
  '<div class="pcstats"><div><b>'+n+'</b><span>pièce'+(n>1?'s':'')+'</span></div><div><b>'+String(Math.round(s*10)/10).replace('.',',')+' m²</b><span>au sol</span></div><div><b>'+F.length+'</b><span>niveau'+(F.length>1?'x':'')+'</span></div></div>'+
  (F.length>1?'<p class="hint" style="margin:0 0 8px">Aperçu : '+esc(F[0].nom||'1er niveau')+'. Les autres niveaux sont dans le plan.</p>':'')+
  '<button class="btn go" style="width:100%" type="button" data-chplan="'+esc(k)+'">Ouvrir le plan</button></div>'}
function chargerDossier(c){var o=dos(c);if(!o||!o.vrai||!enVrai())return;var k=c.dos,fini=0,x={dem:null,docs:[],err:''};
 var maj=function(){if(++fini<2)return;VD[k]=x;var b=document.getElementById('ch-vdos');if(b&&b.getAttribute('data-c')===k)b.innerHTML=dossierHTML(k);var v=document.getElementById('ch-vplan');if(v&&v.getAttribute('data-c')===k)v.innerHTML=planVraiHTML(k)};
 PCV.api('/espace/demande?c='+encodeURIComponent(k)).then(function(r){x.dem=r.demande||null;maj()},function(e){if(!/introuvable|aucune|404/i.test(e.message))x.err=e.message;maj()});
 PCV.api('/espace/documents?c='+encodeURIComponent(k)).then(function(r){x.docs=r.documents||[];maj()},function(e){x.err=x.err||e.message;maj()});}
function lignesDevis(c){if(c.L&&c.L.length)return c.L;var d=c.dv&&X.find(c.dv);if(d&&d.L)return d.L;return c.fin.ht?[{d:c.t,u:'forfait',q:1,p:c.fin.ht}]:[]}
var PIECES={alpes:['Salle d\'attente','Accueil','Couloir'],lopez:['Salle de bain','Couloir'],perrin:['Combles'],rey:['Fournil']};
function pieces(c){var L=[];(PIECES[c.id]||[]).concat(c.pieces||[]).forEach(function(p){if(p&&L.indexOf(p)<0)L.push(p)});
 lignesDevis(c).forEach(function(l){if(l.pc&&L.indexOf(l.pc)<0)L.push(l.pc)});return L}
function aPrevoir(c){return ((c.four||[]).concat(c.extra||[])).filter(function(x){return x[2]==='à prévoir'}).length}
function liv(c){return window.PCPLAN&&PCPLAN.livraisons?PCPLAN.livraisons(c.id):[]}

/* ---------- la liste ---------- */
function liste(){cur=null;ong=null;if(X.setCurCh)X.setCurCh(null);
 var L=Object.keys(CH).map(function(k){return CH[k]}),act=L.filter(function(c){return c.st!=='done'});
 var sumT=0,sumR=0,sumA=0;act.forEach(function(c){var f=cfin(c);sumT+=f.ttc;sumR+=f.rest;sumA+=avc(c)});
 var V=vue==='tous'?L:act;
 var h='<div class="cf ch-top">'+
  '<button type="button" class="btn go cf-go ch-go" id="ch-new"><span class="lab"><span class="ic">'+IC.plus+'</span><span>Créer un chantier</span></span></button>'+
  '<div class="sec-h" style="margin:0"><h2>Vue d\'ensemble</h2><button class="hint" style="font-weight:700;color:var(--accx)" id="ch-map">Voir sur la carte ›</button></div>'+
  '<div class="kpis"><div class="kpi"><small>Chantiers en cours</small><b>'+act.length+'</b></div><div class="kpi"><small>Avancement moyen</small><b>'+(act.length?Math.round(sumA/act.length):0)+' %</b></div><div class="kpi"><small>Signé TTC</small><b>'+eur(sumT)+'</b></div><div class="kpi"><small>Reste à encaisser</small><b>'+eur(sumR)+'</b></div></div>'+
  '<div class="seg cf-seg dv-seg ch-seg" role="tablist" aria-label="Quels chantiers">'+[['cours','En cours',IC.chantier,act.length],['tous','Tous les chantiers',IC.docs,0]].map(function(x){return '<button role="tab" data-chv="'+x[0]+'" aria-selected="'+(vue===x[0])+'">'+x[2]+'<span>'+x[1]+'</span>'+(x[3]?'<i>'+x[3]+'</i>':'')+'</button>'}).join('')+'</div>'+
  '<div class="col" style="gap:10px">'+(V.length?V.map(function(c){var a=avc(c),e=etat(c);return '<button class="chrow" data-showch="'+c.id+'"><span class="ring" style="--p:'+a+'"><span>'+a+'%</span></span><span class="tx"><b>'+esc(c.n)+' · '+esc(c.v)+'</b><small>'+esc(c.t)+'</small><small>'+esc(c.dates||'dates à fixer')+'</small></span><span class="pill '+e[1]+'">'+e[0]+'</span></button>'}).join(''):'<p class="hint">Aucun chantier en cours. Touchez « Créer un chantier » pour en ajouter un.</p>')+'</div></div>';
 $('#chx').innerHTML=h;
 $('#ch-map').addEventListener('click',function(){X.go('planning');var s=$('#seg-carte');if(s)s.click();});
 $('#ch-new').addEventListener('click',function(){nouveau()});
 $$('#chx [data-chv]').forEach(function(b){b.addEventListener('click',function(){vue=b.dataset.chv;X.lsSet('pc-chv',vue);liste();})});
 $$('#chx [data-showch]').forEach(function(b){b.addEventListener('click',function(){ouvrir(b.dataset.showch)})});}

/* ---------- un chantier ---------- */
function ouvrir(id,o){var c=CH[id];if(!c)return;if(cur!==id){edit=null;prevenir=null;}cur=id;ong=o||null;if(X.setCurCh)X.setCurCh(id);
 var e=etat(c),bad={four:aPrevoir(c),trav:c.st==='run'&&!c.pointSent?1:0,equipe:ong==='equipe'?0:nonLus(c)};
 var h='<div class="cf"><button class="xback" id="ch-back">‹ Tous les chantiers</button><div class="sec-h"><h2 style="font-size:20px">'+esc(c.n)+' · '+esc(c.v)+'</h2><span class="pill '+e[1]+'">'+e[0]+'</span></div><p class="lead" style="font-size:13.5px;margin-bottom:12px">'+esc(c.t)+' · '+esc(c.dates||'dates à fixer')+'</p>'+
  '<div class="seg ch-menu" role="tablist" aria-label="Parties du chantier">'+ONG.map(function(x){return '<button role="tab" data-ong="'+x[0]+'" aria-selected="'+(ong===x[0])+'">'+IC[x[0]]+'<span>'+x[1]+'</span>'+(bad[x[0]]?'<i>'+bad[x[0]]+'</i>':'')+'</button>'}).join('')+'</div>'+
  '<div class="ch-pane" id="ch-pane">'+(ong?'<button class="ch-back2" id="ch-res">‹ Résumé du chantier</button>'+partie(c,ong):resume(c))+'</div></div>';
 $('#chx').innerHTML=h;window.scrollTo(0,0);
 $('#ch-back').addEventListener('click',function(){liste()});
 var rb=$('#ch-res');if(rb)rb.addEventListener('click',function(){ouvrir(id)});
 $$('#chx [data-ong]').forEach(function(b){b.addEventListener('click',function(){ouvrir(id,ong===b.dataset.ong?null:b.dataset.ong)})});
 lier(c);if(!ong||ong==='docs'||ong==='plan')chargerDossier(c);}
function recharger(o,sel){ouvrir(cur,o===undefined?ong:o);if(sel){var t=$(sel);if(t)t.scrollIntoView({block:'center'})}}

/* Le résumé : l'essentiel, ce qu'il reste à faire, le client */
function resume(c){var a=avc(c),f=cfin(c),o=dos(c),reel=(c.reel||[]).reduce(function(s,r){return s+num(r[1])},0);
 var T=[];var n=aPrevoir(c);if(n)T.push(['four',n,'Fourniture'+(n>1?'s':'')+' à prévoir']);
 if(c.st==='run'&&!c.pointSent)T.push(['trav','1','Point du jour à envoyer au client']);
 if(!c.fin.ht)T.push(['docs','+','Créer le devis de ce chantier']);
 else if(!c.fin.ac&&!(c.docs||[]).some(function(d){return d.ty==='ac'}))T.push(['fin','€','Facture d\'acompte à préparer']);
 if(a>=100&&f.rest&&!c.soldeCree)T.push(['fin','€','Facture de solde à préparer']);
 var P0=c.part;if(P0&&!P0.termine&&P0.ent.some(function(e){return !e.coupe})){var jf=joursAvant(accesFin(c));if(jf<=3)T.push(['equipe','!',jf<0?'Accès des entreprises dépassé : prolonger ou terminer':'Accès des entreprises jusqu\'au '+dt(accesFin(c))+' : on prolonge ?'])}
 var nl=nonLus(c);if(nl)T.push(['equipe',nl,nl>1?'Nouveaux messages des entreprises':'Nouveau message d\'une entreprise']);
 var sd=sitDu(c);if(sd)T.push(['fin','€','Facture de situation à préparer ('+sd+')']);
 var rc=resL(c).filter(function(r){return r.st==='corr'}).length;if(rc)T.push(['equipe',rc,rc>1?rc+' réserves corrigées à valider':'Une réserve corrigée à valider']);
 var Lv=liv(c).filter(function(x){return !x.passe});if(Lv.length)T.push(['four',Lv.length,'Livraison'+(Lv.length>1?'s':'')+' prévue'+(Lv.length>1?'s':'')+' · '+Lv[0].quand]);
 var suite=c.st==='done'?'Chantier terminé.':a>=100?'Travaux finis : la facture de solde peut partir.':c.ouv.filter(function(x){return x[2]<100})[0];
 return '<div class="card ch-res"><span class="ring" style="--p:'+a+'"><span>'+a+'%</span></span><span class="tx"><b>Avancement</b><small>'+(typeof suite==='string'?suite:'En ce moment : '+esc(suite[0]).toLowerCase()+' ('+suite[2]+'\u00a0%)')+'</small></span></div>'+
  (c.fin.ht?'<div class="card"><div class="bar2"><span>Encaissé</span><div class="prog f"><i style="width:'+(f.ttc?Math.round((f.ttc-f.rest)/f.ttc*100):0)+'%"></i></div><b>'+eur(f.ttc-f.rest)+'</b><span>Achats</span><div class="prog f"><i style="width:'+(c.prev?Math.min(100,Math.round(reel/c.prev*100)):0)+'%"></i></div><b>'+eur(reel)+(c.prev?' / '+eur(c.prev):'')+'</b></div></div>':'')+
  (T.length?'<div><div class="sec-h"><h2>À faire</h2><span>touchez pour y aller</span></div><div class="ch-afaire">'+T.map(function(t){return '<button type="button" data-aller="'+t[0]+'"><span class="n">'+t[1]+'</span><span class="tx">'+esc(t[2])+'</span><span class="go">›</span></button>'}).join('')+'</div></div>':'')+
  dossierVrai(c)+(enVrai()&&monCh(c)&&!(o&&o.vrai)?relierHTML(c):cliCard(c,o,true));}
function cliCard(c,o,court){if(!o)return '<div class="card"><b>Client</b><p class="hint" style="margin-top:6px">Chantier importé avant ProClik : pas de fiche client.</p></div>';
 var adr=o.adr||o.v||'';
 return '<div class="card"><div class="ch-cli"><b>'+esc(o.prenom?o.prenom+' '+(o.nom||o.n):o.contact||o.n)+'</b>'+(o.contact&&!o.prenom?'<span>'+esc(o.n)+'</span>':'')+'<span>'+esc(adr)+'</span>'+(court?'':'<span>'+esc(o.tel||'')+(o.mail?' · '+esc(o.mail):'')+'</span>')+'</div>'+
  '<div class="ch-acts">'+[['tel','Appeler',IC.tel],['sms','SMS',IC.sms],['mail','E-mail',IC.mail],['route','Itinéraire',IC.route]].map(function(x){return '<button type="button" data-cact="'+x[0]+'"><span class="r">'+x[2]+'</span>'+x[1]+'</button>'}).join('')+'</div>'+
  (court?'':'<button class="btn" style="width:100%;margin-top:14px" data-chdos="'+c.dos+'">Ouvrir le dossier complet</button>')+'</div>';}

function partie(c,o){
 if(o==='trav')return travaux(c);
 if(o==='fin')return finances(c);
 if(o==='four')return (X.fourHTML?X.fourHTML(c)+achats(c)+'</div>':'')+(window.PCPLAN&&PCPLAN.livHTML?PCPLAN.livHTML(c):'');
 if((o==='plan'||o==='cli'||o==='docs')&&enVrai()&&monCh(c)&&!(dos(c)&&dos(c).vrai))return relierHTML(c);
 if(o==='plan'&&dos(c)&&dos(c).vrai&&enVrai())return '<div id="ch-vplan" data-c="'+esc(c.dos)+'">'+planVraiHTML(c.dos)+'</div>';
 if(o==='plan')return window.pcPlanCard?window.pcPlanCard(c):'<div class="card"><p class="hint">Pas de plan pour ce chantier.</p></div>';
 if(o==='agenda')return agenda(c);
 if(o==='notes')return notes(c);
 if(o==='photo')return photos(c);
 if(o==='cli')return cliCard(c,dos(c),false);
 if(o==='docs')return documents(c);
 if(o==='equipe')return equipe(c);
 return '';}

/* ---------- Travaux : avancement, avancement par ouvrage modifiable, point client, avis Google ---------- */
function travaux(c){var a=avc(c),run=c.st!=='done';
 var h='<div class="card" id="ch-trav"><div class="row"><b>Avancement</b><b>'+a+' %</b></div><div class="prog" style="margin-top:10px"><i style="width:'+a+'%"></i></div></div>'+
 '<div class="card"><div class="row" style="margin-bottom:4px"><b>Avancement par ouvrage</b><small style="color:var(--muted)">pondéré</small></div><div class="ch-ouv">'+c.ouv.map(function(x,i){
  var ed=edit&&edit.i===i;
  return '<div class="ch-o"><span class="nm">'+esc(x[0])+' <small>'+x[1]+' % du chantier</small></span><span class="pc">'+(ed?edit.v:x[2])+' %</span>'+(!ed&&run?'<span class="bt">'+(x[3]?'<button type="button" class="ch-lock" data-odeb="'+i+'" title="Ligne validée" aria-label="Ligne validée, toucher deux fois pour débloquer">'+IC.cadenas+'<span>Validée</span></button>':'<button type="button" class="btn sm" data-omod="'+i+'">'+IC.crayon+'Modifier</button>')+'</span>':'<span></span>')+'<div class="prog"><i style="width:'+(ed?edit.v:x[2])+'%"></i></div>'+
   (ed?'<div class="ch-ed"><div class="v"><button type="button" class="btn" data-ev="-5" aria-label="Moins 5 %">−</button><b>'+edit.v+' %</b><button type="button" class="btn" data-ev="5" aria-label="Plus 5 %">+</button></div>'+
     '<input type="range" min="0" max="100" step="5" value="'+edit.v+'" id="ch-rg" aria-label="Avancement de la ligne">'+
     '<div class="q">'+[0,25,50,75,100].map(function(v){return '<button type="button" class="btn" data-eq="'+v+'" aria-pressed="'+(edit.v===v)+'">'+v+' %</button>'}).join('')+'</div>'+
     '<div class="ok"><button type="button" class="btn" id="ch-eno">Annuler</button><button type="button" class="btn go" id="ch-eok">Valider</button></div></div>':
    '')+'</div>'}).join('')+'</div>'+
  (run?'<p class="hint" style="margin-top:8px">Touchez « Modifier », réglez le pourcentage, puis « Valider » : la ligne se bloque pour ne pas la changer par erreur. Pour la rouvrir, touchez deux fois « Validée ».</p>':'')+'</div>';
 if(prevenir!=null)h+='<div class="card ch-prev" id="ch-prev"><b>Prévenir le client ?</b><span class="hint">Avancement passé à '+a+' %. Un point du jour est prêt avec ce changement.</span><div class="ok"><button type="button" class="btn" id="ch-pno">Non, pas cette fois</button><button type="button" class="btn go" id="ch-poui">Oui, préparer le message</button></div></div>';
 if(run)h+=pointCard(c);
 h+=avisCard(c);
 return h;}
function salut(o){if(!o)return 'Bonjour,';var n=o.prenom?(o.civ?o.civ+' ':'')+o.nom:(o.contact||o.n||'').split(',')[0];return 'Bonjour '+n.replace(/^(SCI|SARL|SAS|Cabinet|Boulangerie)\s.*/,'').trim()+','}
function pointTexte(c){var o=dos(c),fait=c.ouv.filter(function(x){return x[2]>=100}).map(function(x){return x[0].toLowerCase()}),enc=c.ouv.filter(function(x){return x[2]>0&&x[2]<100}),apres=c.ouv.filter(function(x){return x[2]===0})[0];
 var t=salut(o).replace(/ ,$/,',')+'\n\nPoint du jour sur votre chantier : '+avc(c)+' % des travaux sont faits.';
 if(fait.length)t+='\nTerminé : '+fait.join(', ')+'.';
 if(enc.length)t+='\nEn cours : '+enc.map(function(x){return x[0].toLowerCase()+' ('+x[2]+' %)'}).join(', ')+'.';
 if(apres)t+='\nEnsuite : '+apres[0].toLowerCase()+'.';
 return t+'\n\nBonne soirée,\nJulien · Dupont Rénovation';}
function pointCard(c){var txt=c.pointTxt||pointTexte(c);
 return '<div class="card" id="ch-pt"><div class="row" style="margin-bottom:8px"><b>Point du jour pour le client</b>'+(c.pointSent?'<span class="pill ok">Envoyé</span>':'<span class="pill todo">À valider</span>')+'</div>'+
  '<textarea class="ch-sms" id="ch-ptt" aria-label="Message au client">'+esc(txt)+'</textarea>'+
  '<p class="hint" style="margin:8px 0">Écrit à partir de l\'avancement. Vous le relisez et le changez avant l\'envoi.</p>'+
  '<div class="row" style="gap:8px"><button class="btn" style="flex:1" id="ch-ptr">Refaire</button><button class="btn go" style="flex:1" id="ch-pts">'+(c.pointSent?'Renvoyer':'Envoyer le SMS')+'</button></div></div>';}
var QUAND=[['jour','Le jour de la facture finale'],['lendemain','Le lendemain (conseillé)'],['3j','3 jours après']];
function avisCard(c){var a=c.avis||(c.avis={on:true,quand:'lendemain'});
 return '<div class="card" id="ch-avis">'+(window.PCTAG?PCTAG('avis'):'')+'<div class="ch-sw"><span>Demander un avis Google<small>Part tout seul quand la facture finale est envoyée.</small></span><button type="button" class="ch-tg" role="switch" aria-checked="'+!!a.on+'" id="ch-avt" aria-label="Demander un avis Google"></button></div>'+
  (a.on?'<div class="ch-quand">'+QUAND.map(function(q){return '<button type="button" class="btn" data-avq="'+q[0]+'" aria-pressed="'+(a.quand===q[0])+'">'+q[1]+'</button>'}).join('')+'</div>':'')+
  (c.st==='done'?'<p class="hint" style="margin-top:8px">'+(a.on?'Chantier terminé : demande d\'avis envoyée après la facture finale.':'Pas de demande d\'avis pour ce chantier.')+'</p>':'')+'</div>';}

/* ---------- Rappel automatique de facture de situation (Cyril 19/11 : gros chantiers ou chantiers longs), réglable ---------- */
var SITR=[['mois','Chaque fin de mois'],['quinz','Toutes les 2 semaines'],['palier','À chaque palier de 25 %'],['non','Jamais']];
var SITS=[['15j','Chantiers de plus de 15 jours'],['5000','Chantiers de plus de 5 000 € HT'],['tous','Tous les chantiers']];
function sitReg(){var r=X.lsGet('pc-sit-reg',null)||{};return {ry:r.ry||'mois',se:r.se||'15j'}}
function sitDur(c){var a=c.d1||'',b=c.d2||'';if(c.id==='alpes'){a='2026-10-14';b='2026-10-19'}if(!a||!b)return 0;return Math.round((new Date(b+'T12:00:00')-new Date(a+'T12:00:00'))/864e5)+1}
function sitPour(c){var R=sitReg();if(R.ry==='non'||c.sitOff||c.st==='done'||!c.fin||!c.fin.ht)return false;return R.se==='tous'||(R.se==='5000'&&c.fin.ht>=5000)||(R.se==='15j'&&sitDur(c)>=15)}
function finMois(d){return new Date(d.getFullYear(),d.getMonth()+1,0)}
function sitProchain(c){var R=sitReg(),t=X.TODAY||new Date(),a=avc(c);
 if(R.ry==='palier'){var p=(Math.floor(a/25)+1)*25;return p>=100?'':'à '+p+' % d\'avancement'}
 var f=finMois(t);if(R.ry==='quinz'&&t.getDate()<15)f=new Date(t.getFullYear(),t.getMonth(),15);return 'le '+dt(X.iso(f))}
function sitDu(c){if(!sitPour(c))return '';var R=sitReg(),a=avc(c),t=X.TODAY||new Date();if(a<=0||a>=100)return '';var der=c.sitPct||0;
 if(R.ry==='palier'){var p=Math.floor(a/25)*25;return p>der&&p>0?'palier de '+p+' % atteint':''}
 var fm=finMois(t).getDate()-t.getDate();if(fm<=3)return 'fin du mois';if(R.ry==='quinz'&&t.getDate()>=13&&t.getDate()<=15)return 'mi-mois';return ''}
function sitLigne(c){var R=sitReg(),ok=sitPour(c),lab=SITR.filter(function(x){return x[0]===R.ry})[0][1];
 var sub=c.sitOff?'Désactivé pour ce chantier':R.ry==='non'?'Aucun rappel':!ok?'Pas pour ce chantier ('+SITS.filter(function(x){return x[0]===R.se})[0][1].toLowerCase()+')':sitDu(c)?'À préparer maintenant : '+sitDu(c):(sitProchain(c)?'Prochain rappel '+sitProchain(c):'Plus de rappel : chantier presque fini');
 return '<button type="button" class="cp-l" id="sit-reg" style="width:100%;text-align:left"><span class="r">'+IC.agenda+'</span><span class="tx"><b>Rappel de situation : '+esc(lab.toLowerCase())+'</b><small>'+esc(sub)+' · Modifier</small></span></button>'}
function sitReglages(c){var R=sitReg();
 var h='<p class="hint" style="margin:0 0 6px">Quand vous rappeler de préparer une facture de situation ?</p><div class="cp-chs">'+SITR.map(function(x){return '<button type="button" class="cp-chp" data-sry="'+x[0]+'" aria-pressed="'+(R.ry===x[0])+'">'+esc(x[1])+'</button>'}).join('')+'</div>'+
  '<p class="hint" style="margin:14px 0 6px">Pour quels chantiers ?</p><div class="cp-chs">'+SITS.map(function(x){return '<button type="button" class="cp-chp" data-sse="'+x[0]+'" aria-pressed="'+(R.se===x[0])+'">'+esc(x[1])+'</button>'}).join('')+'</div>'+
  '<p class="hint" style="margin:14px 0 6px">Ce chantier</p><div class="cp-chs"><button type="button" class="cp-chp" id="sit-off" aria-pressed="'+!!c.sitOff+'">Pas de rappel pour ce chantier</button></div>'+
  '<p class="hint" style="margin:14px 0 0">Le rappel arrive dans « À faire » du chantier. La pré-facture reprend l\'avancement ; vous vérifiez avant tout envoi. Ces réglages valent pour tous vos chantiers.</p>';
 X.xopen('Rappel de situation',c.n,h,'<button class="btn go" data-xclose>C\'est bon</button>',function(){
  var maj=function(k,v){var r=sitReg();r[k]=v;X.lsSet('pc-sit-reg',r);sitReglages(c);recharger(ong)};
  $$('[data-sry]').forEach(function(b){b.addEventListener('click',function(){maj('ry',b.dataset.sry)})});
  $$('[data-sse]').forEach(function(b){b.addEventListener('click',function(){maj('se',b.dataset.sse)})});
  $('#sit-off').addEventListener('click',function(){c.sitOff=!c.sitOff;saveCH();sitReglages(c);recharger(ong)})})}
/* ---------- Finances : pré-factures à vérifier avant VosFactures ---------- */
function finances(c){var f=cfin(c),a=avc(c),D2=c.docs||[];
 var acF=D2.some(function(d){return d.ty==='ac'}),soF=c.soldeCree||D2.some(function(d){return d.ty==='solde'});
 var h='<div class="card" id="ch-fin"><div class="row" style="margin-bottom:8px"><b>Finances</b><span class="pill '+(c.fin.ac?'ok':'warn')+'">'+(!c.fin.ht?'Pas encore de devis':!c.fin.ac?'Acompte à recevoir':f.rest?'Acompte reçu':'Payé')+'</span></div><div class="fin"><span>Devis signé (HT)</span><b>'+eur(c.fin.ht)+'</b><span>TVA '+fr(c.fin.tva)+' %</span><b>'+eur(f.tv)+'</b><span>Total TTC</span><b>'+eur(f.ttc)+'</b><span>Acompte reçu</span><b>− '+eur(c.fin.ac)+'</b>'+(c.fin.paid?'<span>Solde réglé</span><b>− '+eur(f.ttc-c.fin.ac)+'</b>':'')+'<span>Reste à encaisser</span><b>'+eur(f.rest)+'</b></div>';
 if(c.fin.ht&&f.rest)h+='<div class="col cf-in" style="gap:10px">'+
  (!c.fin.ac&&!acF?'<button class="btn go" style="width:100%" data-pf="ac">Préparer la facture d\'acompte</button>':'')+
  (a>0&&a<100&&!soF?'<button class="btn'+(sitDu(c)?' go':'')+'" style="width:100%" data-pf="sit">Préparer une facture de situation ('+a+' %)</button>':'')+(a<100&&!soF?sitLigne(c):'')+
  (!soF?'<button class="btn'+(a>=100?' go':'')+'" style="width:100%" data-pf="solde">Préparer la facture de solde</button>':'<p class="hint">Facture de solde créée : elle est dans Documents et dans Factures.</p>')+
  '<p class="hint">Vous voyez d\'abord une pré-facture : vous enlevez ou ajoutez des lignes, vous vérifiez, puis vous validez. Une facture ne se modifie plus une fois créée.</p></div>';
 h+='</div>';
 if(c.fact&&X.coutHTML)h+='<div class="card" id="ch-cout"><div class="row" style="margin-bottom:8px"><b>Coût réel du chantier</b><span class="pill '+(c.closed?'ok':'warn')+'">'+(c.closed?'Définitif':'En cours')+'</span></div>'+X.coutHTML(c)+'</div>';
 return h;}
function achats(c){if(!c.prev)return '';var reel=(c.reel||[]).reduce(function(s,r){return s+num(r[1])},0);
 return '<div style="margin-top:14px"><b style="font-size:14px">Achats réels face au prévu</b><div class="cmp" style="margin-top:6px">'+(c.reel||[]).map(function(r){return '<span>'+esc(r[0])+'</span><b>'+esc(r[1])+' €</b><span></span>'}).join('')+'<span><b style="color:var(--fg)">Total réel</b></span><b>'+eur(reel)+'</b><span class="delta '+(reel<=c.prev?'ok':'')+'">'+(reel<=c.prev?'−':'+')+eur(Math.abs(reel-c.prev))+'</span><span>Prévu au devis</span><b>'+eur(c.prev)+'</b><span></span></div></div>';}

var TYD={pre:'Pré-devis',devis:'Devis',ac:'Facture d\'acompte',sit:'Facture de situation',solde:'Facture de solde',fact:'Facture'};
var PF=null;
function preFacture(c,ty,doc){var a=avc(c),L0=lignesDevis(c),tva=c.fin.tva||10,acHT=r2((c.fin.ac||0)/(1+tva/100)),L=[],ded=[];
 if(doc){L=doc.L.map(function(l){return Object.assign({},l)});ded=(doc.ded||[]).slice();tva=doc.tva}
 else if(ty==='ac')L=[{d:'Acompte de 30 % sur le devis '+(c.dv||'')+' · '+c.t,u:'forfait',q:1,p:r2(c.fin.ht*.3)}];
 else if(ty==='sit'){var deja=(c.docs||[]).filter(function(d){return d.ty==='sit'}).reduce(function(s,d){return s+d.ht},0);
  L=L0.map(function(l){return {d:l.d+' · '+a+' % réalisé',u:l.u,q:r2(l.q*a/100),p:l.p}});if(deja)ded.push(['Situations déjà facturées',-deja]);}
 else if(ty==='solde'){L=L0.map(function(l){return {d:l.d,u:l.u,q:l.q,p:l.p}});if(acHT)ded.push(['Acompte déjà versé (HT)',-acHT]);
  var sits=(c.docs||[]).filter(function(d){return d.ty==='sit'}).reduce(function(s,d){return s+d.ht},0);if(sits)ded.push(['Situations déjà facturées',-sits]);}
 else if(ty==='devis'||ty==='pre')L=L0.length?L0.map(function(l){return {d:l.d,u:l.u,q:l.q,p:l.p}}):[];
 PF={c:c.id,ty:ty,L:L,ded:ded,tva:tva,doc:doc?doc.id:null,arm:false};pfOuvrir();}
function pfTot(){var ht=0;PF.L.forEach(function(l){ht+=r2(num(l.q)*num(l.p))});PF.ded.forEach(function(d){ht+=d[1]});ht=r2(ht);var tv=r2(ht*PF.tva/100);return{ht:ht,tv:tv,ttc:r2(ht+tv)}}
function pfHTML(){var t=pfTot(),fac=PF.ty!=='pre'&&PF.ty!=='devis';
 return '<div class="pf-warn">'+(fac?'Pré-facture à vérifier. Une fois validée, elle part dans VosFactures et ne se modifie plus.':PF.ty==='pre'?'Brouillon : vous pouvez y revenir quand vous voulez.':'Le devis part dans VosFactures une fois validé.')+'</div>'+
  '<div class="card"><div class="pf-l">'+(PF.L.length?PF.L.map(function(l,i){return '<div class="pf-li"><textarea data-pfd="'+i+'" aria-label="Désignation">'+esc(l.d)+'</textarea><div class="pf-nb"><label>Quantité ('+esc(l.u||'u')+')<input inputmode="decimal" data-pfq="'+i+'" value="'+fr(l.q)+'"></label><label>Prix HT<input inputmode="decimal" data-pfp="'+i+'" value="'+fr(l.p)+'"></label><div class="tt"><small>Total HT</small>'+eur(num(l.q)*num(l.p))+'</div></div><button type="button" class="x" data-pfx="'+i+'">Enlever la ligne</button></div>'}).join(''):'<p class="hint">Aucune ligne. Ajoutez-en une ci-dessous.</p>')+
  PF.ded.map(function(d,i){return '<div class="pf-li ded"><span>'+esc(d[0])+'</span><span class="tt">'+eur(d[1])+'</span><button type="button" class="x" data-pfdx="'+i+'">Enlever</button></div>'}).join('')+'</div>'+
  '<div class="chs-wrap" style="margin-top:10px"><form class="addline" id="pf-add"><input id="pf-a" autocomplete="off" placeholder="+ Ajouter une ligne" aria-label="Ajouter une ligne"><button class="btn sm go">Ajouter</button></form><div class="chs-sug" id="pf-sug" hidden></div></div></div>'+
  '<div class="card pf-tot"><span>Total HT</span><b>'+eur(t.ht)+'</b><span>TVA '+fr(PF.tva)+' %</span><b>'+eur(t.tv)+'</b><span class="ttc">Total TTC</span><b class="ttc">'+eur(t.ttc)+'</b></div>';}
function pfOuvrir(){var c=CH[PF.c],titre={pre:'Pré-devis',devis:'Devis',ac:'Pré-facture d\'acompte',sit:'Pré-facture de situation',solde:'Pré-facture de solde'}[PF.ty]+' · à vérifier';
 X.xopen(titre,c.n+' · '+c.t,'<div class="col" style="gap:12px" id="pf">'+pfHTML()+'</div>',
  '<button class="btn" data-xclose>Annuler</button><button class="btn go" id="pf-ok">'+(PF.ty==='pre'?'Enregistrer le brouillon':PF.ty==='devis'?'Valider le devis':'Valider et créer la facture')+'</button>',function(){pfLier();$('#pf-ok').addEventListener('click',pfValider)});}
function pfMaj(){var p=$('#pf');if(!p)return;var y=p.closest('.sheet-in');var s=y?y.scrollTop:0;p.innerHTML=pfHTML();pfLier();if(y)y.scrollTop=s;}
function pfLier(){
 $$('#pf [data-pfd]').forEach(function(x){x.addEventListener('input',function(){PF.L[+x.dataset.pfd].d=x.value})});
 $$('#pf [data-pfq],#pf [data-pfp]').forEach(function(x){x.addEventListener('change',function(){var i=+(x.dataset.pfq||x.dataset.pfp);PF.L[i][x.dataset.pfq!=null?'q':'p']=num(x.value);pfMaj()})});
 $$('#pf [data-pfx]').forEach(function(x){x.addEventListener('click',function(){PF.L.splice(+x.dataset.pfx,1);pfMaj()})});
 $$('#pf [data-pfdx]').forEach(function(x){x.addEventListener('click',function(){PF.ded.splice(+x.dataset.pfdx,1);pfMaj()})});
 var f=$('#pf-add');f.addEventListener('submit',function(e){e.preventDefault();var v=$('#pf-a').value.trim();if(!v)return;PF.L.push({d:v,u:'u',q:1,p:0});pfMaj();var q=$$('#pf [data-pfp]');if(q.length)q[q.length-1].focus();});
 suggerer($('#pf-a'),$('#pf-sug'),function(p){PF.L.push({d:p.d,u:p.u||'u',q:1,p:p.p||0});pfMaj();var q=$$('#pf [data-pfq]');if(q.length)q[q.length-1].focus();},true);}
function pfValider(){var b=$('#pf-ok'),c=CH[PF.c],t=pfTot();
 if(!PF.L.length){X.toast('Ajoutez au moins une ligne','Une facture vide ne peut pas partir.');return}
 if(PF.ty!=='pre'&&!PF.arm){PF.arm=true;b.classList.add('ch-arm');b.textContent='Touchez encore pour confirmer';setTimeout(function(){if(PF&&PF.arm&&b.isConnected){PF.arm=false;b.classList.remove('ch-arm');b.textContent=PF.ty==='devis'?'Valider le devis':'Valider et créer la facture'}},4000);return}
 if(PF.ty==='sit')c.sitPct=avc(c);c.docs=c.docs||[];var d={id:'d'+Date.now().toString(36),ty:PF.ty,n:TYD[PF.ty],d:jour(),L:PF.L,ded:PF.ded,tva:PF.tva,ht:t.ht,ttc:t.ttc,st:PF.ty==='pre'?'brouillon':'cree'};
 if(PF.doc){c.docs=c.docs.filter(function(x){return x.id!==PF.doc})}
 c.docs.unshift(d);
 if(PF.ty==='devis'){c.L=PF.L.map(function(l){return {d:l.d,u:l.u,q:num(l.q),p:num(l.p)}});c.fin.ht=r2(PF.L.reduce(function(s,l){return s+num(l.q)*num(l.p)},0));c.fin.tva=PF.tva;c.dv=c.dv||'(nouveau)';
  if(c.ouv.length<=1&&!c.ouv.some(function(x){return x[2]})){var tot=c.fin.ht||1,acc=0;c.ouv=c.L.map(function(l,i){var w=i===c.L.length-1?100-acc:Math.round(num(l.q)*num(l.p)/tot*100);acc+=w;return [l.d.split(/[,·(]/)[0].trim().slice(0,40),w,0]})}}
 if(PF.ty==='solde')c.soldeCree=true;
 if(PF.ty!=='pre'&&PF.ty!=='devis'&&X.cf&&X.cf.ajoutFacture&&c.dos){try{X.cf.ajoutFacture(c.dos,PF.L.map(function(l){return [l.d,r2(num(l.q)*num(l.p))]}).concat(PF.ded.map(function(x){return [x[0],x[1]]})),PF.tva)}catch(e){}}
 saveCH();attente('facture');var ty=PF.ty;PF=null;X.xclose();ouvrir(c.id,'docs');
 X.toast(ty==='pre'?'Brouillon enregistré':TYD[ty]+' créé'+(ty==='devis'?'':'e')+' : '+eur(t.ttc)+' TTC',ty==='pre'?'Retrouvez-le dans Documents.':en()?'Démo : dans votre Espace, VosFactures renvoie le PDF, rangé ici et dans Factures.':'Elle partira au retour du réseau.');}

/* ---------- Notes : un bouton, on écrit ou on dicte, rangées par pièce ---------- */
function notes(c){var P={},ord=[];(c.notes||[]).forEach(function(n){var p=n[2]||'Tout le chantier';if(!P[p]){P[p]=[];ord.push(p)}P[p].push(n)});
 return '<button type="button" class="btn go cf-go" id="ch-nadd"><span class="lab"><span class="ic">'+IC.plus+'</span><span>Ajouter une note</span></span></button>'+
  '<div class="card ch-nt" id="ch-notes">'+(ord.length?ord.map(function(p){return '<h3>'+esc(p)+'</h3>'+P[p].slice().reverse().map(function(n){return '<div class="n">'+esc(n[1])+'<small>'+esc(n[0])+'</small></div>'}).join('')}).join(''):'<p class="hint">Aucune note pour l\'instant.</p>')+'</div>';}
var NP=null;
function choixPieces(c,sel,id){var P=pieces(c);return '<div class="ch-pcs" id="'+id+'">'+['Tout le chantier'].concat(P).map(function(p){return '<button type="button" class="btn" data-pc="'+esc(p)+'" aria-pressed="'+(sel===p)+'">'+esc(p)+'</button>'}).join('')+'<button type="button" class="btn" data-pcnew>+ Autre pièce</button></div>'}
function lierPieces(c,id,cb){$$('#'+id+' [data-pc]').forEach(function(b){b.addEventListener('click',function(){$$('#'+id+' [data-pc]').forEach(function(x){x.setAttribute('aria-pressed',String(x===b))});cb(b.dataset.pc)})});
 var n=$('#'+id+' [data-pcnew]');if(n)n.addEventListener('click',function(){var w=$('#'+id);if(w.querySelector('input'))return;n.insertAdjacentHTML('afterend','<input placeholder="Nom de la pièce" aria-label="Nom de la pièce" style="flex:1 1 160px;min-height:40px;border-radius:999px;padding:8px 14px">');var i=w.querySelector('input');i.focus();i.addEventListener('change',function(){var v=i.value.trim();if(!v)return;c.pieces=c.pieces||[];if(c.pieces.indexOf(v)<0)c.pieces.push(v);saveCH();cb(v);$$('#'+id+' [data-pc]').forEach(function(x){x.setAttribute('aria-pressed','false')});i.style.boxShadow='0 0 0 2px var(--acc)'})});}
function noteSheet(c){NP=pieces(c)[0]||'Tout le chantier';
 X.xopen('Nouvelle note',c.n,'<div class="col" style="gap:12px"><b style="font-size:14px">Où ?</b>'+choixPieces(c,NP,'np')+
  '<p class="hint" style="margin:0">Pièces reprises du devis et du plan.</p>'+
  '<textarea class="ch-txt" id="nt-t" placeholder="Écrivez la note, ou touchez « Dicter »" aria-label="Note"></textarea>'+
  '<button type="button" class="btn ch-dic" id="nt-d">'+IC.micro+'<span>Dicter la note</span></button></div>',
  '<button class="btn" data-xclose>Annuler</button><button class="btn go" id="nt-ok">Ajouter la note</button>',function(){
  lierPieces(c,'np',function(p){NP=p});
  dictee($('#nt-d'),$('#nt-t'));
  $('#nt-ok').addEventListener('click',function(){var v=$('#nt-t').value.trim();if(!v){$('#nt-t').focus();return}c.notes=c.notes||[];c.notes.push([maint(),v,NP]);saveCH();attente('note');X.xclose();recharger('notes');X.toast('Note ajoutée',NP+(en()?'':' · gardée sur le téléphone'));});});}
var REC=null;
function dictee(btn,ta){var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
 btn.addEventListener('click',function(){
  if(!SR){ta.focus();X.toast('Touchez le micro du clavier','Votre téléphone écrit ce que vous dites.');return}
  if(REC){REC.stop();return}
  try{REC=new SR();REC.lang='fr-FR';REC.interimResults=true;REC.continuous=true;}catch(e){ta.focus();return}
  var base=ta.value?ta.value.replace(/\s*$/,' '):'';
  REC.onresult=function(e){var t='';for(var i=0;i<e.results.length;i++)t+=e.results[i][0].transcript;ta.value=base+t;};
  REC.onend=function(){REC=null;btn.classList.remove('on');btn.querySelector('span').textContent='Dicter la note'};
  REC.onerror=function(){X.toast('Dictée indisponible','Touchez le micro du clavier à la place.')};
  btn.classList.add('on');btn.querySelector('span').textContent='J\'écoute… touchez pour arrêter';REC.start();});}

/* ---------- Photos : prises ou choisies ici, rangées par pièce, avec une note ---------- */
function photos(c){var ck=cliky();
 return '<button type="button" class="btn go cf-go" id="ch-padd"><span class="lab"><span class="ic">'+IC.photo+'</span><span>Ajouter une photo</span></span></button>'+
  '<div class="card" id="ch-ph"><div class="row" style="margin-bottom:10px"><b>Photos</b><span style="font-size:12px;color:var(--muted)">'+(c.ph||[]).length+' photo'+((c.ph||[]).length>1?'s':'')+'</span></div>'+
  ((c.ph||[]).length?'<div class="ch-ph">'+c.ph.map(function(p){var mine=p.length>2;return '<figure><span class="im"'+(p[2]?' style="background-image:url('+p[2]+')"':'')+'></span><figcaption><b>'+esc(p[0])+'</b>'+(mine?(p[1]?'<small>'+esc(p[1])+'</small>':'')+'<small>'+esc(p[3]||'')+'</small>':ck?'<span class="ck">Cliky : '+esc(p[1])+'</span>':'')+'</figcaption></figure>'}).join('')+'</div>':'<p class="hint">Aucune photo pour l\'instant.</p>')+
  (ck?'<p class="hint" style="margin-top:10px">Avec Cliky, les photos sont aussi analysées (hauteur estimée, défauts repérés).</p>':'')+'</div>';}
var PH=null;
function photoSheet(c){PH={img:null,pc:pieces(c)[0]||'Tout le chantier'};
 X.xopen('Nouvelle photo',c.n,'<div class="col" style="gap:12px">'+
  '<div class="ch-pick"><label>'+IC.photo+'Prendre une photo<input type="file" accept="image/*" capture="environment" id="ph-cam"></label><label>'+IC.docs+'Choisir une photo<input type="file" accept="image/*" id="ph-gal"></label></div>'+
  '<div id="ph-ap"></div><b style="font-size:14px">Quelle pièce ?</b>'+choixPieces(c,PH.pc,'pp')+
  '<textarea class="ch-txt" id="ph-n" style="min-height:70px" placeholder="Une note sous la photo (facultatif)" aria-label="Note sous la photo"></textarea></div>',
  '<button class="btn" data-xclose>Annuler</button><button class="btn go" id="ph-ok">Ajouter la photo</button>',function(){
  lierPieces(c,'pp',function(p){PH.pc=p});
  ['#ph-cam','#ph-gal'].forEach(function(s){$(s).addEventListener('change',function(){var f=this.files&&this.files[0];if(f)reduire(f,function(u){PH.img=u;$('#ph-ap').innerHTML='<img class="ch-apercu" alt="Aperçu de la photo" src="'+u+'">'})})});
  $('#ph-ok').addEventListener('click',function(){if(!PH.img){X.toast('Prenez ou choisissez une photo d\'abord','');return}
   c.ph=c.ph||[];c.ph.push([PH.pc,$('#ph-n').value.trim(),PH.img,maint()]);saveCH();attente('photo');X.xclose();recharger('photo');X.toast('Photo ajoutée',PH.pc+(cliky()?' · Cliky l\'analyse.':''));});});}
function reduire(f,cb){var r=new FileReader();r.onload=function(){var im=new Image();im.onload=function(){var m=640,s=Math.min(1,m/Math.max(im.width,im.height)),cv=document.createElement('canvas');cv.width=Math.round(im.width*s);cv.height=Math.round(im.height*s);cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);try{cb(cv.toDataURL('image/jpeg',.72))}catch(e){cb(r.result)}};im.onerror=function(){X.toast('Photo illisible','Essayez avec une autre.')};im.src=r.result};r.readAsDataURL(f);}

/* ---------- Documents : pré-devis, devis, factures d'acompte, factures ---------- */
function documents(c){var o=dos(c),L=[],vd=dossierVrai(c);
 (c.docs||[]).forEach(function(d){L.push({ic:d.ty==='pre'||d.ty==='devis'?IC.devis:d.ty==='ac'?IC.acompte:IC.fact,t:TYD[d.ty],s:(d.st==='brouillon'?'brouillon, à finir · ':'créé'+(d.ty==='devis'?'':'e')+' '+d.d+' · ')+eur(d.ttc)+' TTC',a:'data-cdoc="'+d.id+'"'})});
 if(o)(o.docs||[]).forEach(function(x){if(X.DOCS&&X.DOCS[x])L.push({ic:x==='devis'?IC.devis:x==='acompte'?IC.acompte:x==='plan'?IC.plan:IC.docs,t:X.DOCS[x][0]+(x==='devis'&&c.dv?' '+c.dv:''),s:X.DOCS[x][1],a:'data-odoc="'+c.dos+'|'+x+'"'})});
 var G={devis:[],fact:[],autre:[]};L.forEach(function(x){(/Devis|Pré-devis/.test(x.t)?G.devis:/Facture|acompte/i.test(x.t)?G.fact:G.autre).push(x)});
 var li=function(x){return '<button class="cf-li" type="button" '+x.a+'><span class="cf-av cf-doc">'+x.ic+'</span><span class="tx"><b>'+esc(x.t)+'</b><small>'+esc(x.s)+'</small></span><span class="go">›</span></button>'};
 if(vd)return vd+creerVrai(c);
 return vd+'<div class="card"><b style="font-size:14px">Créer</b><div class="ch-new" style="margin-top:10px">'+[['pre','Pré-devis',IC.devis],['devis','Devis',IC.devis],['ac','Facture d\'acompte',IC.acompte],['fact','Facture',IC.fact]].map(function(x){return '<button type="button" class="btn" data-chnew="'+x[0]+'">'+x[2]+x[1]+'</button>'}).join('')+'</div>'+
  '<p class="hint" style="margin-top:8px">Tout passe d\'abord par un brouillon que vous vérifiez. Factures et devis partent ensuite dans VosFactures.</p></div>'+
  [['Devis',G.devis],['Factures',G.fact],['Autres documents',G.autre]].map(function(g){return g[1].length?'<div><div class="sec-h"><h2>'+g[0]+'</h2><span>'+g[1].length+'</span></div><div class="card lst cf-l ch-docs">'+g[1].map(li).join('')+'</div></div>':''}).join('')+
  (L.length||vd?'':'<p class="hint">Aucun document pour ce chantier.</p>');}
function pdf(c,d){var o=dos(c),t={ht:d.ht,ttc:d.ttc,tv:r2(d.ttc-d.ht)};
 return '<div class="pdf" role="document"><span class="stamp s-'+(d.st==='brouillon'?'draft':'sent')+'">'+(d.st==='brouillon'?'Brouillon':'Créé'+(d.ty==='devis'?'':'e'))+'</span><div class="pdf-h"><div><b>Dupont Rénovation</b><span>[Adresse] · SIRET [numéro]</span></div><div class="r"><span class="pdf-t">'+esc(TYD[d.ty].toUpperCase())+'</span><span>N° '+(d.st==='brouillon'?'non numéroté':'[numéro VosFactures]')+'</span><span>'+esc(d.d)+'</span></div></div>'+
  '<div class="pdf-c"><span class="pdf-k">Client</span><b>'+esc(o?o.n:c.n)+'</b><span>'+esc(o?o.adr:c.v)+'</span><span class="pdf-k" style="margin-top:6px">Chantier</span><span>'+esc(c.t)+'</span></div>'+
  '<table><thead><tr><th>Désignation</th><th class="r">Qté</th><th class="r">PU HT</th><th class="r">Total HT</th></tr></thead><tbody>'+d.L.map(function(l){return '<tr><td>'+esc(l.d)+'</td><td class="r">'+fr(num(l.q))+' '+esc(l.u||'')+'</td><td class="r">'+eur(num(l.p))+'</td><td class="r">'+eur(num(l.q)*num(l.p))+'</td></tr>'}).join('')+(d.ded||[]).map(function(x){return '<tr><td>'+esc(x[0])+'</td><td></td><td></td><td class="r">'+eur(x[1])+'</td></tr>'}).join('')+'</tbody></table>'+
  '<div class="pdf-tot"><div><span>Total HT</span><b>'+eur(t.ht)+'</b></div><div><span>TVA '+fr(d.tva)+' %</span><span>'+eur(t.tv)+'</span></div><div class="ttc"><span>Total TTC</span><b>'+eur(t.ttc)+'</b></div></div></div>';}
function voirDoc(c,id){var d=(c.docs||[]).filter(function(x){return x.id===id})[0];if(!d)return;
 if(d.st==='brouillon')return preFacture(c,d.ty,d);
 X.xopen(TYD[d.ty],c.n+' · '+d.d,pdf(c,d)+'<p class="note-demo" style="margin-top:12px">Démo : dans votre Espace, c\'est le PDF renvoyé par VosFactures qui s\'affiche ici.</p>','<button class="btn" data-xclose>Fermer</button>',null);}

/* ---------- suggestions de produits (remplace la liste du navigateur) ---------- */
function produits(q){var R=[];
 if(window.PCPROD&&PCPROD.chercher){try{R=(PCPROD.chercher(q)||[]).map(function(p){return {d:p.d,u:p.u,p:p.p,ic:p.i&&PCPROD.icone?PCPROD.icone(p.i):''}})}catch(e){R=[]}}
 if(!R.length){var vu={},use={};
  Object.keys(CH).forEach(function(k){((CH[k].four||[]).concat(CH[k].extra||[])).forEach(function(x){var n=norm(x[0]);use[n]=(use[n]||0)+1})});
  var base=(X.lsGet('pc-base1',null)||[]).map(function(p){return {d:p.d,u:p.u,p:p.p}}).concat((X.CATA||[]).map(function(a){return {d:a}}));
  var w=String(q||'').split(/\s+/).map(norm).filter(Boolean);
  base.forEach(function(p){var n=norm(p.d);if(!p.d||vu[n])return;if(w.length&&!w.every(function(x){return n.indexOf(x)>=0}))return;vu[n]=1;p.n=use[n]||0;R.push(p)});
  R.sort(function(a,b){return b.n-a.n});}
 return R.slice(0,8);}
function surligne(t,q){var w=String(q||'').trim();if(!w)return esc(t);var i=norm(t).indexOf(norm(w.split(/\s+/)[0]));if(i<0)return esc(t);
 var a=0,j=0,s=String(t);var m=[];for(var k=0;k<s.length;k++){var n=norm(s.charAt(k));m.push(j);j+=n.length}
 var st=m.indexOf(i),L=norm(w.split(/\s+/)[0]).length,en2=st;while(en2<s.length&&m[en2]<i+L)en2++;if(st<0)return esc(t);
 return esc(s.slice(0,st))+'<mark>'+esc(s.slice(st,en2))+'</mark>'+esc(s.slice(en2));}
function suggerer(inp,box,pick,prix){if(!inp||!box)return;var tm;
 function montrer(){var q=inp.value.trim(),R=produits(q);
  if(!R.length){box.hidden=true;return}
  box.innerHTML='<div class="chs-h">'+(q?'Dans vos produits':'Les plus utilisés')+'</div>'+R.map(function(p,i){return '<button type="button" data-sg="'+i+'"><span class="pi">'+(p.ic||IC.prod)+'</span><span>'+surligne(p.d,q)+'</span>'+(prix&&p.p?'<small>'+eur(p.p)+(p.u?' / '+esc(p.u):'')+'</small>':p.u?'<small>'+esc(p.u)+'</small>':'')+'</button>'}).join('');
  box.hidden=false;
  $$('[data-sg]',box).forEach(function(b){b.addEventListener('mousedown',function(e){e.preventDefault()});b.addEventListener('click',function(){var p=R[+b.dataset.sg];box.hidden=true;pick(p)})});}
 inp.addEventListener('input',montrer);inp.addEventListener('focus',montrer);
 inp.addEventListener('keydown',function(e){if(e.key==='Escape')box.hidden=true});
 inp.addEventListener('blur',function(){clearTimeout(tm);tm=setTimeout(function(){box.hidden=true},180)});}

/* ---------- client : appeler, SMS, e-mail, itinéraire ---------- */
function action(c,a){var o=dos(c);if(!o)return;var tel=String(o.tel||'').replace(/[^\d+]/g,''),fake=/•/.test(o.tel||'')||tel.length<10;
 if(a==='tel'||a==='sms'){if(fake)return X.toast('Numéro d\'exemple','Dans votre Espace, '+(a==='tel'?'l\'appel part':'le SMS s\'ouvre')+' directement vers '+o.n+'.');location.href=(a==='tel'?'tel:':'sms:')+tel;return}
 if(a==='mail'){if(!o.mail)return X.toast('Pas d\'e-mail pour ce client','Ajoutez-le dans sa fiche.');location.href='mailto:'+o.mail;return}
 var adr=/\[/.test(o.adr||'')?(o.v||c.v)+', Isère':(o.adr||o.v||c.v),q=encodeURIComponent(adr);
 if(X.itineraire)X.itineraire(adr);else location.href='https://www.google.com/maps/dir/?api=1&destination='+q;}

/* ---------- les gestes de la page ---------- */
/* ---------- Planning du chantier (Cyril 12/11) : ses jours, visites et livraisons, et un bouton pour en ajouter ---------- */
var JC=['dim.','lun.','mar.','mer.','jeu.','ven.','sam.'],MC=['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
var TYC={run:'Chantier',plan:'Chantier prévu',done:'Chantier fait',visit:'Visite',liv:'Livraison',autre:'Rendez-vous',pc:'Point ProClik',st:'Sous-traitant'};
function evsCh(c){var L=(X.EV||[]).filter(function(e){if(e.k==='free'||e.k==='pc')return false;var x=e.x||{};
  return x.ch===c.id||(c.id==='alpes'&&x.ch===1)||(c.n&&String(e.t||'').indexOf(c.n)>-1)});
 return L.sort(function(a,b){return (a.d+a.s)<(b.d+b.s)?-1:1})}
function agenda(c){var T=X.iso?X.iso(X.TODAY||new Date()):'',L=evsCh(c),av=L.filter(function(e){return e.d>=T}),pa=L.filter(function(e){return e.d<T});
 function ligne(e){var d=new Date(e.d+'T12:00:00'),col=(window.PCCOUL&&PCCOUL.ev(e))||'var(--k-'+e.k+')',jour=e.x&&e.x.jour;
  return '<button type="button" class="cf-li ch-ag" data-agd="'+e.d+'" style="--c:'+col+'"><span class="ch-agd"><small>'+JC[d.getDay()]+'</small><b>'+d.getDate()+'</b><small>'+MC[d.getMonth()]+'</small></span>'+
   '<span class="tx"><b>'+esc(e.t)+'</b><small>'+(jour?'Toute la journée':e.s.replace(':','h')+' – '+e.e.replace(':','h'))+(e.w?' · '+esc(e.w):'')+'</small></span><span class="pill">'+(TYC[e.k]||'')+'</span></button>'}
 var h='<div class="card" id="ch-agenda"><div class="row" style="margin-bottom:8px"><b>À venir</b><span style="font-size:12px;color:var(--muted)">'+(av.length?av.length+' dans le planning':'rien de prévu')+'</span></div>'+
  (av.length?'<div class="lst cf-l" style="padding:0!important">'+av.map(ligne).join('')+'</div>':'<p class="hint" style="margin:4px 0 0">Aucun jour ni rendez-vous prévu pour ce chantier.</p>')+
  (c.st!=='done'?'<button type="button" class="btn go cf-go" id="ch-agadd" style="width:100%;margin-top:12px"><span class="lab"><span class="ic">'+IC.plus+'</span><span>Ajouter au planning</span></span></button>':'')+
  '<button type="button" class="btn" id="ch-agvoir" style="width:100%;margin-top:10px">Voir dans le planning</button></div>';
 h+=sousTraitants(c,av);
 if(pa.length)h+='<div class="card"><details><summary style="cursor:pointer;font-weight:700">Déjà passés ('+pa.length+')</summary><div class="lst cf-l" style="padding:0!important;margin-top:8px">'+pa.slice().reverse().map(ligne).join('')+'</div></details></div>';
 return h}
/* Les sous-traitants qui viennent sur ce chantier (15/11) : leurs jours, et un bouton pour les leur envoyer par SMS */
function sousTraitants(c,av){var P=window.PCPLAN&&PCPLAN.st;if(!P)return '';var ids=[];
 av.forEach(function(e){if(e.k==='st'&&e.x&&e.x.st&&ids.indexOf(e.x.st)<0)ids.push(e.x.st)});
 var h='<div class="card" id="ch-st"><div class="row" style="margin-bottom:8px"><b>Sous-traitants</b><span style="font-size:12px;color:var(--muted)">'+(ids.length?ids.length+(ids.length>1?' viennent':' vient'):'personne de prévu')+'</span></div>';
 if(!ids.length)h+='<p class="hint" style="margin:4px 0 0">Un électricien, un plombier qui vient ? Ajoutez ses jours : il les reçoit par SMS, sans appli.</p>';
 ids.forEach(function(id){var t=P.de(id),J=P.jours(id,c.id);if(!t)return;
  h+='<div style="padding:10px 0;border-bottom:1px solid var(--line,rgba(127,127,127,.18))"><div style="display:flex;gap:10px;align-items:flex-start"><span class="cp-mi" title="'+esc(t.m)+'">'+metSvg(metDe(t.m))+'</span><span style="min-width:0"><b>'+esc(t.n)+'</b><br><small style="color:var(--muted)">'+esc(t.m)+' · '+J.map(function(e){var d=new Date(e.d+'T12:00:00');return JC[d.getDay()]+' '+d.getDate()+' '+MC[d.getMonth()]}).join(', ')+'</small></span></div>'+
   '<button type="button" class="btn" data-stsms="'+esc(id)+'" style="width:100%;margin-top:8px">Lui envoyer ses jours par SMS</button></div>'});
 if(c.st!=='done')h+='<button type="button" class="btn" id="ch-stadd" style="width:100%;margin-top:12px">Faire venir un sous-traitant</button>';
 return h+'</div>'}
function voirPlanning(d){X.go('planning');try{if(X.calWeek)X.calWeek(new Date((d||X.iso(X.TODAY))+'T12:00:00'));var s=document.getElementById('seg-semaine');if(s)s.click();if(X.renderCalWeek)X.renderCalWeek()}catch(_){}}

function lier(c){var id=c.id;
 /* planning du chantier */
 var aga=$('#ch-agadd');if(aga)aga.addEventListener('click',function(){if(window.PCPLAN&&PCPLAN.fiche)PCPLAN.fiche({ty:'chantier',ch:id,d:X.iso(X.TODAY)})});
 var sta=$('#ch-stadd');if(sta)sta.addEventListener('click',function(){if(window.PCPLAN&&PCPLAN.fiche)PCPLAN.fiche({ty:'st',ch:id,d:X.iso(X.TODAY)})});
 $$('#chx [data-stsms]').forEach(function(b){b.addEventListener('click',function(){PCPLAN.st.sms(b.dataset.stsms,id)})});
 var agv=$('#ch-agvoir');if(agv)agv.addEventListener('click',function(){var L=evsCh(c),T=X.iso(X.TODAY),n=L.filter(function(e){return e.d>=T})[0];voirPlanning(n?n.d:null)});
 $$('#chx [data-agd]').forEach(function(b){b.addEventListener('click',function(){voirPlanning(b.dataset.agd)})});
 $$('#chx [data-aller]').forEach(function(b){b.addEventListener('click',function(){ouvrir(id,b.dataset.aller)})});
 $$('#chx [data-cact]').forEach(function(b){b.addEventListener('click',function(){action(c,b.dataset.cact)})});
 $$('#chx [data-chdos]').forEach(function(b){b.addEventListener('click',function(){var k=b.dataset.chdos;if(X.cf&&X.cf.ficheClient)X.cf.ficheClient(k);else X.openDossier(k)})});
 /* travaux */
 $$('#chx [data-omod]').forEach(function(b){b.addEventListener('click',function(){var i=+b.dataset.omod;edit={i:i,v:c.ouv[i][2]};recharger('trav')})});
 $$('#chx [data-odeb]').forEach(function(b){b.addEventListener('click',function(){var i=+b.dataset.odeb;if(b.dataset.arm){c.ouv[i][3]=false;saveCH();edit={i:i,v:c.ouv[i][2]};recharger('trav');return}b.dataset.arm='1';b.lastChild.textContent='Encore pour débloquer';setTimeout(function(){if(b.isConnected){delete b.dataset.arm;b.lastChild.textContent='Validée'}},3500)})});
 var setV=function(v){edit.v=Math.max(0,Math.min(100,v));var o=$('#chx .ch-ed');if(!o)return;o.querySelector('.v b').textContent=edit.v+' %';var row=o.closest('.ch-o');row.querySelector('.pc').textContent=edit.v+' %';row.querySelector('.prog i').style.width=edit.v+'%';$('#ch-rg').value=edit.v;$$('#chx [data-eq]').forEach(function(x){x.setAttribute('aria-pressed',String(+x.dataset.eq===edit.v))})};
 $$('#chx [data-ev]').forEach(function(b){b.addEventListener('click',function(){setV(edit.v+(+b.dataset.ev))})});
 $$('#chx [data-eq]').forEach(function(b){b.addEventListener('click',function(){setV(+b.dataset.eq)})});
 var rg=$('#ch-rg');if(rg)rg.addEventListener('input',function(){setV(+rg.value)});
 var en1=$('#ch-eno');if(en1)en1.addEventListener('click',function(){edit=null;recharger('trav')});
 var ok=$('#ch-eok');if(ok)ok.addEventListener('click',function(){var o2=c.ouv[edit.i],av=o2[2];o2[2]=edit.v;o2[3]=true;edit=null;c.pointTxt=null;if(o2[2]!==av){c.pointSent=false;prevenir=1}saveCH();attente('av');var na=avc(c);if(X.updPin)X.updPin(c,na);if(c.st==='start'&&na>0){c.st='run';saveCH()}recharger('trav',prevenir!=null?'#ch-prev':null);X.toast('Avancement : '+na+' %','Ligne validée et bloquée.');});
 var pn=$('#ch-pno');if(pn)pn.addEventListener('click',function(){prevenir=null;c.pointSent=true;saveCH();recharger('trav');X.toast('Client non prévenu','Vous pourrez lui envoyer un point plus tard.');});
 var po=$('#ch-poui');if(po)po.addEventListener('click',function(){prevenir=null;c.pointTxt=null;recharger('trav','#ch-pt');var t=$('#ch-ptt');if(t)t.focus();});
 var pt=$('#ch-ptt');if(pt)pt.addEventListener('input',function(){c.pointTxt=pt.value;saveCH()});
 var pr=$('#ch-ptr');if(pr)pr.addEventListener('click',function(){c.pointTxt=null;saveCH();recharger('trav','#ch-pt')});
 var ps=$('#ch-pts');if(ps)ps.addEventListener('click',function(){c.pointSent=true;c.pointTxt=$('#ch-ptt').value;saveCH();attente('sms');if(X.renderTodo)X.renderTodo();recharger('trav','#ch-pt');X.toast('Point du jour envoyé',en()?'SMS parti depuis le numéro de votre entreprise (démo).':'Il partira au retour du réseau.');});
 var at=$('#ch-avt');if(at)at.addEventListener('click',function(){c.avis.on=!c.avis.on;saveCH();recharger('trav','#ch-avis')});
 $$('#chx [data-avq]').forEach(function(b){b.addEventListener('click',function(){c.avis.quand=b.dataset.avq;saveCH();recharger('trav','#ch-avis');X.toast('Demande d\'avis Google',QUAND.filter(function(q){return q[0]===c.avis.quand})[0][1].replace(' (conseillé)','')+'.')})});
 /* finances */
 $$('#chx [data-pf]').forEach(function(b){b.addEventListener('click',function(){preFacture(c,b.dataset.pf)})});
 var sr=$('#sit-reg');if(sr)sr.addEventListener('click',function(){sitReglages(c)});
 $$('#chx [data-fact]').forEach(function(b){b.addEventListener('click',function(){X.openFact(c,+b.dataset.fact)})});
 $$('#chx [data-mo]').forEach(function(b){b.addEventListener('click',function(){c.mo.reel=Math.max(0,c.mo.reel+(+b.dataset.mo));saveCH();recharger('fin','#ch-cout')})});
 $$('#chx [data-addfact]').forEach(function(b){b.addEventListener('click',function(){var card=$('#ch-cout');card.insertAdjacentHTML('beforeend','<div class="airead" style="margin-top:10px"><span class="spin"></span>Lecture du bon de livraison…</div>');setTimeout(function(){c.fact.push({n:'Placo Dauphiné',ty:'Bon de livraison',ref:'[n° de BL]',d:'à l\'instant',tot:31.30,L:[['Enduit à joint · sac de 25 kg','1 u','1 u','ok'],['Bande armée d\'angle','1 rouleau','1 rouleau','ok']]});c.reel.push(['Placo Dauphiné · bon de livraison','31,30']);c.four.forEach(function(x){if(/Bande armée|Enduit/.test(x[0]))x[2]='livré'});saveCH();attente('fact');recharger('fin','#ch-cout');X.toast('Bon de livraison lu et rapproché','2 lignes livrées · coût du chantier mis à jour.');},1500)})});
 /* fournitures */
 var FST=X.FST||['à prévoir','prix demandé','commandé','livré','pris au dépôt'];
 $$('#chx [data-fchk]').forEach(function(b){b.addEventListener('change',function(){var x=c.four[+b.dataset.fchk];x[2]=b.checked?(x[2]==='pris au dépôt'?x[2]:'livré'):'à prévoir';if(x[5])c.fst[x[5]]=x[2];saveCH();attente('four');recharger('four','#ch-four')})});
 $$('#chx [data-fst]').forEach(function(b){b.addEventListener('click',function(){var x=c.four[+b.dataset.fst];x[2]=FST[(FST.indexOf(x[2])+1)%FST.length];if(x[5])c.fst[x[5]]=x[2];saveCH();recharger('four','#ch-four')})});
 var ff=$('#ch-ff');if(ff){ff.addEventListener('submit',function(e){e.preventDefault();var a=$('#ch-fa').value.trim(),q=$('#ch-fq').value.trim();if(!a)return;(c.cote?(c.extra=c.extra||[]):c.four).push([a,q||'1 u','à prévoir','main']);saveCH();attente('four');recharger('four','#ch-ff');X.toast('Ajouté aux fournitures',a+(q?' · '+q:''));});
  suggerer($('#ch-fa'),$('#ch-fsug'),function(p){$('#ch-fa').value=p.d;var q=$('#ch-fq');if(q){if(p.u&&!q.value)q.placeholder='Qté ('+p.u+')';q.focus()}});}
 var fc=$('#ch-fcalc');if(fc)fc.addEventListener('click',function(){window.fcalcOn=!window.fcalcOn;recharger('four','#ch-four')});
 var fv=$('#ch-fv');if(fv&&X.dicter)fv.addEventListener('click',function(){X.dicter(3)});
 var fdp=$('#ch-fdp');if(fdp)fdp.addEventListener('click',function(){var L=c.four.filter(function(x){return x[2]==='à prévoir'});X.xopen('Demande de prix','Préparée à partir des fournitures de '+c.n,'<label class="field">Fournisseur<select id="fd-sup"><option value="pd">Placo Dauphiné</option><option value="nim">Négoce Isère Matériaux</option></select></label><div class="mail">'+L.map(function(x){return '• '+esc(x[0])+' · '+esc(x[1])}).join('\n')+'</div><p class="hint">Ni vos prix de vente ni votre marge. Vous relisez, puis elle part de votre adresse.</p>','<button class="btn" data-xclose>Annuler</button><button class="btn go" id="fd-go">Envoyer depuis ma messagerie</button>',function(){$('#fd-go').addEventListener('click',function(){var sp=$('#fd-sup').value,DP=X.DP;DP.unshift({id:'DP-0'+(14+DP.length-3),sup:sp,dos:c.dos||'alpes',st:'wait',sent:'à l\'instant',since:'0 h',items:L.map(function(x){return[x[0],x[1]]})});L.forEach(function(x){x[2]='prix demandé';if(x[5])c.fst[x[5]]='prix demandé'});X.saveDP();saveCH();if(X.renderFour)X.renderFour();X.xclose();recharger('four');X.toast('Demande de prix envoyée',X.SUP[sp].n+' · ProClik surveille la réponse.');attente('dp');})})});
 if(window.PCPLAN&&PCPLAN.lierLiv)PCPLAN.lierLiv(c);
 lierEquipe(c);
 /* notes, photos, documents */
 var na=$('#ch-nadd');if(na)na.addEventListener('click',function(){noteSheet(c)});
 var pa=$('#ch-padd');if(pa)pa.addEventListener('click',function(){photoSheet(c)});
 $$('#chx [data-chvrai]').forEach(function(b){b.addEventListener('click',function(){actionVrai(c,b.dataset.chvrai)})});
 $$('#chx [data-chnew]').forEach(function(b){b.addEventListener('click',function(){var t=b.dataset.chnew;if((t==='ac'||t==='fact')&&!c.fin.ht){X.toast('Créez d\'abord le devis','La facture reprend les lignes du devis.');return}preFacture(c,t==='fact'?'solde':t)})});
 $$('#chx [data-cdoc]').forEach(function(b){b.addEventListener('click',function(){voirDoc(c,b.dataset.cdoc)})});
 $$('#chx [data-odoc]').forEach(function(b){b.addEventListener('click',function(){var p=b.dataset.odoc.split('|');X.openDoc(p[0],p[1])})});}

/* ---------- Entreprises du chantier (idée de Cyril du 18/11) ----------
   Un architecte, ou une entreprise avec plusieurs salariés, invite les entreprises qui travaillent sur ce chantier.
   Elles reçoivent un lien par SMS, sans appli : elles voient leurs jours, le plan, les documents et la conversation, jamais les prix.
   Tout le monde lit la même conversation ; ce qui est décidé est épinglé en haut. Ici tout est en démonstration : rien n'est envoyé. */
function part(c){if(c.part)return c.part;
 c.part=c.id==='alpes'?{ent:[{id:'st-elec',n:'Élec Belledonne',m:'Électricien',ic:'elec',vu:'vu ce matin',code:'7K4M',par:'sms'},{id:'st-plomb',n:'Plomberie du Vercors',m:'Plombier',ic:'plomb',vu:'vu hier',code:'Q2P9',par:'mail'}],
  msgs:[{de:'moi',t:'Faux plafond : dalles 60 × 60 blanches, validé avec le client.',h:'lun. 12/10 · 9 h 05',epi:1,lu:2},
   {de:'st-elec',t:'Je passe jeudi pour les spots. Le plafond doit être fermé côté accueil avant.',h:'mer. 14/10 · 18 h 20',lu:2},
   {de:'st-plomb',t:'Rien au plafond pour moi, je viens seulement pour le lavabo de l\'accueil.',h:'jeu. 15/10 · 8 h 10',lu:2}],nl:2}
  :{ent:[],msgs:[],nl:0};
 return c.part}
/* Icône du métier (Cyril 19/11) : choisie toute seule d'après le métier tapé, modifiable ; la même partout (conversation, planning, chantier) */
var MET=[
 ['elec','Électricité',/elec|élec/i,'<path d="M13 3 6 13.5h5L10 21l7-10.5h-5z"/>'],
 ['plomb','Plomberie',/plomb|sanit/i,'<path d="M12 3.5s5.5 6.2 5.5 10.2A5.5 5.5 0 0 1 6.5 13.7C6.5 9.7 12 3.5 12 3.5z"/>'],
 ['placo','Plâtrerie',/pl[aâ]tr|placo|plaqu|isol|cloison/i,'<rect x="4" y="4" width="16" height="16" rx="1.5"/><path d="M10 4v16M14 4v16"/>'],
 ['peint','Peinture',/peint|d[ée]co/i,'<rect x="4" y="4" width="13" height="6" rx="1.5"/><path d="M17 7h2.5v5H11v3"/><rect x="9.5" y="15" width="3" height="6" rx="1"/>'],
 ['carre','Carrelage',/carrel|fa[iï]enc/i,'<rect x="4" y="4" width="16" height="16" rx="1.5"/><path d="M4 12h16M12 4v16"/>'],
 ['menu','Menuiserie',/menuis|fen[eê]tr|porte|bois/i,'<path d="M6 21V4h12v17M3.5 21h17"/><circle cx="14.8" cy="12.5" r=".9" fill="currentColor"/>'],
 ['maco','Maçonnerie',/ma[cç]on|gros/i,'<path d="M3 8h18M3 13h18M3 18h18M8 8v5M15 8v5M11 13v5M18 13v5M5 13v5"/><path d="M3 4h18v16H3z"/>'],
 ['clim','Chauffage, clim',/clim|chauff|pompe|ventil/i,'<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9"/><path d="M9.5 4.5 12 7l2.5-2.5M9.5 19.5 12 17l2.5 2.5"/>'],
 ['toit','Toiture',/toit|couvr|charpent|zing/i,'<path d="M3 13 12 5l9 8"/><path d="M6 11v8h12v-8"/>'],
 ['sol','Sols',/sol|parquet|moquet|lino/i,'<path d="M3 17 9 7h12l-6 10z"/><path d="M7 10.5h12M5 14h12"/>'],
 ['archi','Architecte',/archi|ma[iî]tre|bureau/i,'<path d="M4 20 12 4l8 16"/><path d="M7.5 13h9"/>'],
 ['autre','Autre',/./,'<path d="M14.5 5.5a4 4 0 0 0-5 5L4 16v4h4l5.5-5.5a4 4 0 0 0 5-5L16 12l-4-4z"/>']];
function metDe(m){for(var i=0;i<MET.length-1;i++)if(MET[i][2].test(m||''))return MET[i][0];return 'autre'}
function metSvg(k){var x=MET.filter(function(y){return y[0]===k})[0]||MET[MET.length-1];return I(x[3])}
function icEnt(e){return metSvg(e&&(e.ic||metDe(e.m)))}
/* Accès des entreprises : un code par entreprise, valable jusqu'à la date choisie (fin du chantier par défaut) */
function addJ(iso,n){var d=new Date(iso+'T12:00:00');d.setDate(d.getDate()+n);return X.iso(d)}
function auj(){return X.iso(X.TODAY||new Date())}
function finCh(c){return c.d2||(c.id==='alpes'?'2026-10-19':addJ(auj(),30))}
function accesFin(c){var P=part(c);if(!P.fin)P.fin=finCh(c);return P.fin}
function codeNeuf(){var A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',r='';for(var i=0;i<4;i++)r+=A[Math.floor(Math.random()*A.length)];return r}
function joursAvant(iso){return Math.round((new Date(iso+'T12:00:00')-new Date(auj()+'T12:00:00'))/864e5)}
function nonLus(c){return c.part?c.part.nl||0:(c.id==='alpes'?2:0)}
function qui(c,de){if(de==='moi')return {n:'Vous',m:''};if(de==='cli')return entDe(c,'cli');var e=part(c).ent.filter(function(x){return x.id===de})[0];return e||{n:'Entreprise',m:''}}
function ini(n){return String(n||'?').split(/\s+/).filter(function(w){return w&&!/^(du|de|des|la|le|les|et)$/i.test(w)}).map(function(w){return w[0]}).join('').slice(0,2).toUpperCase()}
function msgHTML(c,x,i){var q=qui(c,x.de),moi=x.de==='moi',hh=String(x.h||'').split(' · '),n=part(c).ent.length,tous=n&&(x.lu||0)>=n;
 return '<div class="cp-m'+(moi?' moi':'')+'">'+(moi?'':'<span class="cp-av" title="'+esc(q.m||'')+'">'+icQ(q)+'</span>')+'<div class="cp-c">'+(moi?'':'<span class="cp-n">'+esc(q.n)+(q.m?' <small>'+esc(q.m)+'</small>':'')+'</span>')+
  '<div class="cp-r"><p class="cp-bu">'+esc(x.t)+'</p>'+(x.epi||part(c).termine?'':'<button type="button" class="cp-pin" data-cpepi="'+i+'" aria-label="Épingler comme décision" title="Épingler comme décision">'+IC.epingle+'</button>')+'</div>'+
  '<span class="cp-h">'+esc(hh[1]||hh[0]||'')+' · <span class="'+(tous?'ok':'')+'">'+(tous?'✓✓ lu par tous':x.lu?'✓ lu par '+x.lu+' sur '+n:'✓ envoyé')+'</span>'+(x.epi?' · <span class="la">épinglé</span>':'')+'</span></div></div>'}
function jourDe(h){return String(h||'').split(' · ')[0]}
function equipe(c){var P=part(c),E=P.ent,M=P.msgs;P.nl=0;saveCH();
 var h='<div class="card" id="cp-ent"><div class="row" style="margin-bottom:8px"><b>Les entreprises sur ce chantier</b><span style="font-size:12px;color:var(--muted)">'+(E.length?E.length+' invitée'+(E.length>1?'s':''):'aucune')+'</span></div>';
 if(!E.length)h+='<p class="hint" style="margin:4px 0 0">Invitez les entreprises qui travaillent ici. Elles reçoivent un lien par SMS, sans appli, et retrouvent tout au même endroit.</p>';
 var fin=accesFin(c),jf=joursAvant(fin);
 if(E.length&&!P.termine&&jf<=3)h+='<div class="cp-rap"><b>'+(jf<0?'L\'accès des entreprises est dépassé':'Le chantier se termine '+(jf===0?'aujourd\'hui':jf===1?'demain':dt(fin)))+'</b><small>Les entreprises gardent l\'accès jusqu\'au '+dt(fin)+'.</small><div class="cp-rb"><button type="button" class="btn" id="cp-pro">Prolonger d\'une semaine</button><button type="button" class="btn" id="cp-fin1">Chantier terminé</button></div></div>';
 E.forEach(function(e,i){var off=offE(c,e),garde=P.termine&&!e.coupe&&!off;h+='<button type="button" class="cp-e'+(off?' off':'')+'" data-cpe="'+i+'"><span class="cp-mi">'+icEnt(e)+'</span><span class="tx"><b>'+esc(e.n)+'</b><small>'+esc(e.m)+' · '+(garde?'accès gardé : '+resOuv(c,e.id)+' réserve à lever':off?'accès terminé'+(moyNote(e)?' · <span class="cp-moy">★ '+String(moyNote(e)).replace('.',',')+'</span>':P.termine?' · <span class="cp-moy">à noter</span>':''):esc(e.vu||'invitation envoyée')+' · jusqu\'au '+dt(fin))+'</small></span><span class="cp-go">›</span></button>'});
 h+=cliRow(c);
 if(P.termine)h+='<p class="hint" style="margin:10px 0 0">Chantier terminé : les accès sont coupés (sauf pour qui a encore une réserve à lever), et chaque entreprise a reçu le récapitulatif par e-mail (décisions, plans, conversation). Touchez une entreprise pour lui donner votre note, que vous seul verrez.</p>';
 if(c.st!=='done'&&!P.termine)h+='<button type="button" class="btn go cf-go" id="cp-inv" style="width:100%;margin-top:12px"><span class="lab"><span class="ic">'+IC.plus+'</span><span>Inviter une entreprise</span></span></button>';
 if(E.length&&!P.termine)h+='<button type="button" class="btn" id="cp-voir" style="width:100%;margin-top:10px">'+IC.oeil+'<span>Voir ce qu\'elles voient</span></button>';
 if(E.length&&!P.termine&&jf>3)h+='<button type="button" class="btn cp-fin" id="cp-fin2" style="width:100%;margin-top:10px">Chantier terminé</button>';
 h+='</div>'+resCard(c);
 if(E.length){
  var ord=M.map(function(x,i){return [x,i]}),epi=ord.filter(function(y){return y[0].epi}),aut=ord.filter(function(y){return !y[0].epi});
  var dj='',fil=M.map(function(x,i){var j=jourDe(x.h),sep=j!==dj?'<div class="cp-j"><span>'+esc(j==='À l\'instant'||/\d+ h/.test(j)?'Aujourd\'hui':j)+'</span></div>':'';dj=j;return sep+msgHTML(c,x,i)}).join('');
  var dec=M.filter(function(x){return x.epi});
  if(window.PCOPT&&PCOPT.actif('conversation')===false)return h+'<div class="card">'+(window.PCTAG?PCTAG('conversation'):'')+'<p class="hint" style="margin:0">Une conversation par chantier avec toutes les entreprises invitées. Option gratuite à partir de 2 personnes : dites-le à Cyril.</p></div>'+cliCard(c);
  h+='<div class="card" id="cp-fil">'+(window.PCTAG?PCTAG('conversation'):'')+''+
   (dec.length?'<div class="cp-dec"><span class="cp-dk">Ce qui est décidé</span>'+dec.map(function(x){return '<p>'+esc(x.t)+'<small>'+esc(qui(c,x.de).n)+' · '+esc(jourDe(x.h))+'</small></p>'}).join('')+'</div>':'')+
   '<div class="cp-fil">'+fil+'</div>'+
   (P.termine?'<p class="hint" style="margin:0">Chantier terminé : la conversation est archivée, plus personne ne peut écrire.</p>':luPar(c)+'<div class="cp-w"><textarea id="cp-t" rows="1" placeholder="Écrire à tout le chantier…"></textarea><button type="button" class="cp-ro pk" id="cp-mic" aria-label="Dicter">'+IC.micro+'</button><button type="button" class="cp-ro go" id="cp-send" aria-label="Envoyer à tous">'+I('<path d="M5 12h13M13 6l6 6-6 6"/>')+'</button></div>')+
   (P.termine?'':'<p class="hint" style="margin:10px 2px 0">Touchez '+IC.epingle.replace('<svg','<svg class="cp-ih"')+' sur un message pour le garder dans « Ce qui est décidé ».</p>')+'</div>';}
 return h+cliCard(c)}
function icPicker(sel){return '<div class="cp-ics" role="radiogroup" aria-label="Icône du métier">'+MET.map(function(x){return '<button type="button" class="cp-ic" data-cpic="'+x[0]+'" aria-pressed="'+(x[0]===sel)+'" title="'+esc(x[1])+'">'+I(x[3])+'<small>'+esc(x[1].split(',')[0])+'</small></button>'}).join('')+'</div>'}
function lierPicker(cb){$$('[data-cpic]').forEach(function(b){b.addEventListener('click',function(){$$('[data-cpic]').forEach(function(x){x.setAttribute('aria-pressed',String(x===b))});cb(b.dataset.cpic)})})}
function inviter(c){var P=part(c),deja=P.ent.map(function(e){return e.id}),S=(window.PCPLAN&&PCPLAN.st?PCPLAN.st.tous():[]).filter(function(t){return deja.indexOf(t.id)<0}),sel=S[0]?S[0].id:'autre',ic='autre',par='sms',ic0=0,fin=accesFin(c);
 var h=(S.length?'<p class="hint" style="margin:0 0 8px">Vos sous-traitants</p><div class="cp-ch">'+S.map(function(t,i){return '<button type="button" class="btn" data-cpst="'+esc(t.id)+'" aria-pressed="'+(i===0)+'"><span class="cp-mi">'+metSvg(metDe(t.m))+'</span><span><b>'+esc(t.n)+'</b><small>'+esc(t.m)+'</small></span></button>'}).join('')+'<button type="button" class="btn" data-cpst="autre" aria-pressed="false"><span class="cp-mi">'+IC.plus+'</span><span><b>Une autre entreprise</b><small>Pas encore dans vos contacts</small></span></button></div>':'')+
  '<div id="cp-autre"'+(S.length?' hidden':'')+'><label class="field">Nom de l\'entreprise<input id="cp-n" placeholder="Ex. Carrelages du Guiers"></label><label class="field">Son métier<input id="cp-m" placeholder="Ex. Carreleur"></label>'+
  '<p class="hint" style="margin:2px 0 6px">Son icône : elle se choisit d\'après le métier, touchez pour changer</p>'+icPicker(ic)+
  '<label class="field" style="margin-top:12px">Téléphone portable<input id="cp-tel" inputmode="tel" placeholder="06 12 34 56 78"></label><label class="field">E-mail<input id="cp-mail" inputmode="email" placeholder="contact@entreprise.fr"></label></div>'+
  '<p class="hint" style="margin:14px 0 6px">Envoyer son lien par</p><div class="cp-seg"><button type="button" class="btn" data-cppar="sms" aria-pressed="true"><span>SMS</span><small>sur son portable</small></button><button type="button" class="btn" data-cppar="mail" aria-pressed="false"><span>E-mail</span><small>dans sa boîte mail</small></button></div>'+
  '<p class="hint" style="margin:14px 0 6px">Accès jusqu\'au</p><div class="cp-seg"><button type="button" class="btn" data-cpfin="ch" aria-pressed="true"><span>Fin du chantier</span><small>'+esc(dt(fin))+'</small></button><button type="button" class="btn" data-cpfin="autre" aria-pressed="false"><span>Autre date</span><small>à choisir</small></button></div>'+
  '<input type="date" id="cp-d" value="'+fin+'" hidden style="margin-top:8px">'+
  '<p class="hint" style="margin:14px 0 0">Le lien contient son code personnel : elle n\'a rien à taper. Elle voit ses jours, le plan, les documents et la conversation de ce chantier, jamais vos prix ni vos autres chantiers. À la fin, son accès se coupe tout seul.</p>';
 X.xopen('Inviter une entreprise',c.n+' · '+c.v,h,'<button class="btn" data-xclose>Annuler</button><button class="btn go" id="cp-ok">Envoyer l\'invitation</button>',function(){
  $$('[data-cpst]').forEach(function(b){b.addEventListener('click',function(){sel=b.dataset.cpst;$$('[data-cpst]').forEach(function(x){x.setAttribute('aria-pressed',String(x===b))});$('#cp-autre').hidden=sel!=='autre'})});
  lierPicker(function(k){ic=k;ic0=1});
  var m=$('#cp-m');m.addEventListener('input',function(){if(ic0)return;ic=metDe(m.value);$$('[data-cpic]').forEach(function(x){x.setAttribute('aria-pressed',String(x.dataset.cpic===ic))})});
  $$('[data-cppar]').forEach(function(b){b.addEventListener('click',function(){par=b.dataset.cppar;$$('[data-cppar]').forEach(function(x){x.setAttribute('aria-pressed',String(x===b))})})});
  $$('[data-cpfin]').forEach(function(b){b.addEventListener('click',function(){$$('[data-cpfin]').forEach(function(x){x.setAttribute('aria-pressed',String(x===b))});$('#cp-d').hidden=b.dataset.cpfin!=='autre'})});
  $('#cp-ok').addEventListener('click',function(){var e,d=$('#cp-d');
   if(sel==='autre'){var n=($('#cp-n').value||'').trim();if(!n){X.toast('Le nom de l\'entreprise','Il manque pour envoyer l\'invitation.');return}e={id:'cp'+Date.now().toString(36),n:n,m:($('#cp-m').value||'').trim()||'Entreprise',ic:ic}}
   else{var t=PCPLAN.st.de(sel);e={id:t.id,n:t.n,m:t.m,ic:metDe(t.m)}}
   e.code=codeNeuf();e.par=par;if(!d.hidden&&d.value)P.fin=d.value;
   P.ent.push(e);saveCH();attente('sms');X.xclose();
   recharger('equipe');X.toast('Invitation envoyée',e.n+' reçoit son lien par '+(par==='sms'?'SMS':'e-mail')+', valable jusqu\'au '+dt(accesFin(c))+' (démo).')})})}
/* Note privée de l'architecte sur chaque entreprise, à la fin du chantier (Cyril 19/11) : visible par lui seul, jamais par l'entreprise */
var CRIT=[['ponct','Ponctualité'],['propre','Propreté du chantier'],['trav','Qualité du travail']];
var ETO=I('<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>');
function moyNote(e){var N=e.note||{},v=CRIT.map(function(k){return N[k[0]]||0}).filter(Boolean);return v.length?Math.round(v.reduce(function(a,b){return a+b},0)/v.length*10)/10:0}
function noteHTML(e){var N=e.note||{};return '<div class="cp-nt"><p class="hint" style="margin:0 0 4px">Votre note, visible par vous seul. Elle vous aide à choisir pour le prochain chantier.</p>'+
 CRIT.map(function(k){return '<div class="cp-nl"><span>'+k[1]+'</span><span class="cp-st">'+[1,2,3,4,5].map(function(i){return '<button type="button" data-cpn="'+k[0]+'" data-v="'+i+'" aria-label="'+k[1]+' : '+i+' sur 5" aria-pressed="'+(i<=(N[k[0]]||0))+'">'+ETO+'</button>'}).join('')+'</span></div>'}).join('')+'</div>'}
/* La fiche d'une entreprise du chantier : son icône, renvoyer le lien, couper son accès */
function ficheEnt(c,i){var P=part(c),e=P.ent[i];if(!e)return;var arm=0,off=offE(c,e);
 var h='<div class="cp-tete"><span class="cp-mi gros">'+icEnt(e)+'</span><div><b>'+esc(e.n)+'</b><small>'+esc(e.m)+'</small></div></div>'+
  '<p class="hint" style="margin:14px 0 6px">Icône du métier</p>'+icPicker(e.ic||metDe(e.m))+
  '<div class="cp-l" style="margin-top:14px"><span class="r">'+IC.cadenas+'</span><span class="tx"><b>'+(off?'Accès terminé':'Accès jusqu\'au '+esc(dt(accesFin(c))))+'</b><small>Code personnel '+esc(e.code||'—')+' · lien envoyé par '+(e.par==='mail'?'e-mail':'SMS')+'</small></span></div>'+
  (P.termine?'<p class="hint" style="margin:16px 0 6px">Comment s\'est passé le chantier avec '+esc(e.n)+' ?</p>'+noteHTML(e):'')+
  (off?'':'<button type="button" class="btn" id="cp-ren" style="width:100%;margin-top:10px">Renvoyer son lien</button><button type="button" class="btn cp-cut" id="cp-cut" style="width:100%;margin-top:10px">Couper son accès</button>');
 X.xopen(e.n,'Sur le chantier '+c.n,h,'<button class="btn go" data-xclose>Fermer</button>',function(){
  lierPicker(function(k){e.ic=k;saveCH();var t=$('.cp-tete .cp-mi');if(t)t.innerHTML=metSvg(k);recharger('equipe')});
  $$('[data-cpn]').forEach(function(b){b.addEventListener('click',function(){e.note=e.note||{};e.note[b.dataset.cpn]=+b.dataset.v;saveCH();
   $$('[data-cpn="'+b.dataset.cpn+'"]').forEach(function(x){x.setAttribute('aria-pressed',String(+x.dataset.v<=+b.dataset.v))});recharger('equipe')})});
  var r=$('#cp-ren');if(r)r.addEventListener('click',function(){X.toast('Lien renvoyé',e.n+' le reçoit par '+(e.par==='mail'?'e-mail':'SMS')+' (démo).')});
  var k=$('#cp-cut');if(k)k.addEventListener('click',function(){if(!arm){arm=1;k.textContent='Touchez encore pour couper';setTimeout(function(){if(k.isConnected){arm=0;k.textContent='Couper son accès'}},3500);return}
   e.coupe=1;saveCH();X.xclose();recharger('equipe');X.toast('Accès coupé',e.n+' ne peut plus ouvrir ce chantier.')})})}
function apercu(c){var P=part(c),e=P.ent[0];if(!e)return;var J=window.PCPLAN&&PCPLAN.st&&PCPLAN.st.jours?PCPLAN.st.jours(e.id,c.id):[];
 var j=J.length?J.map(function(x){var d=new Date(x.d+'T12:00:00');return JC[d.getDay()]+' '+d.getDate()+' '+MC[d.getMonth()]}).join(', '):'à caler avec vous';
 var der=P.msgs[P.msgs.length-1];
 var h='<div class="cp-ap"><div class="cp-l"><span class="r">'+IC.agenda+'</span><span class="tx"><b>Ses jours sur ce chantier</b><small>'+esc(j)+'</small></span></div>'+
  '<div class="cp-l"><span class="r">'+IC.plan+'</span><span class="tx"><b>Le plan</b><small>La dernière version, toujours</small></span></div>'+
  '<div class="cp-l"><span class="r">'+IC.docs+'</span><span class="tx"><b>Les documents et les photos</b><small>Ceux que vous choisissez de partager</small></span></div>'+
  '<div class="cp-l"><span class="r">'+IC.sms+'</span><span class="tx"><b>La conversation</b><small>'+(der?esc(der.t):'Rien pour l\'instant')+'</small></span></div>'+
  '<div class="cp-l non"><span class="r">'+IC.cadenas+'</span><span class="tx"><b>Ne voit pas</b><small>Vos prix, vos devis, vos factures, vos autres chantiers</small></span></div></div>';
 X.xopen('Ce que voit '+e.n,'Son lien personnel, reçu par SMS ou e-mail',h,'<button class="btn" data-xclose>Fermer</button><a class="btn go" style="text-decoration:none;display:flex;align-items:center;justify-content:center" href="invite.html?e='+encodeURIComponent(e.id)+'&ch='+encodeURIComponent(c.id)+'" target="_blank" rel="noopener">Ouvrir sa page</a>')}
function lierEquipe(c){lierRes(c);
 var b=$('#cp-inv');if(b)b.addEventListener('click',function(){inviter(c)});
 var v=$('#cp-voir');if(v)v.addEventListener('click',function(){apercu(c)});
 $$('#chx [data-cpe]').forEach(function(b){b.addEventListener('click',function(){ficheEnt(c,+b.dataset.cpe)})});
 var pr=$('#cp-pro');if(pr)pr.addEventListener('click',function(){var P=part(c);P.fin=addJ(accesFin(c)<auj()?auj():accesFin(c),7);saveCH();recharger('equipe');X.toast('Accès prolongé','Jusqu\'au '+dt(P.fin)+'. Les entreprises sont prévenues (démo).')});
 $$('#chx #cp-fin1,#chx #cp-fin2').forEach(function(f){var arm=0;f.addEventListener('click',function(){if(!arm){arm=1;f.textContent='Touchez encore : couper tous les accès';setTimeout(function(){if(f.isConnected){arm=0;f.textContent='Chantier terminé'}},3500);return}
  part(c).termine=1;saveCH();recharger('equipe');X.toast('Chantier terminé',resOuv(c)?'Accès coupés, sauf pour qui a encore une réserve à lever. Récapitulatif envoyé par e-mail (démo).':'Accès coupés. Chaque entreprise reçoit le récapitulatif par e-mail (démo).')})});
 $$('#chx [data-cpepi]').forEach(function(x){x.addEventListener('click',function(){part(c).msgs[+x.dataset.cpepi].epi=1;saveCH();recharger('equipe','#cp-fil');X.toast('Épinglé','Le message reste en haut de la conversation.')})});
 var t=$('#cp-t'),m=$('#cp-mic');if(t&&m)dictee2(m,t);
 if(t)t.addEventListener('input',function(){t.style.height='auto';t.style.height=Math.min(140,t.scrollHeight)+'px'});
 var s=$('#cp-send');if(s)s.addEventListener('click',function(){var v=(t.value||'').trim();if(!v){t.focus();return}
  part(c).msgs.push({de:'moi',t:v,h:maint(),lu:0});saveCH();attente('sms');recharger('equipe','#cp-fil');X.toast('Envoyé à tous',part(c).ent.length+' entreprises le reçoivent (démo).')})}
function dictee2(btn,ta){var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
 btn.addEventListener('click',function(){if(!SR){ta.focus();X.toast('Touchez le micro du clavier','Votre téléphone écrit ce que vous dites.');return}
  var R;try{R=new SR();R.lang='fr-FR';R.interimResults=true}catch(e){ta.focus();return}
  var base=ta.value?ta.value.replace(/\s*$/,' '):'';R.onresult=function(e){var x='';for(var i=0;i<e.results.length;i++)x+=e.results[i][0].transcript;ta.value=base+x};
  R.onend=function(){btn.classList.remove('on')};btn.classList.add('on');R.start()})}

/* ================= RÉSERVES et CLIENT CONNECTÉ (Cyril 19/11) =================
   Une réserve = une photo + une phrase + la pièce (point sur le plan) + qui corrige : une entreprise invitée OU un salarié de l'équipe.
   À corriger → Corrigée (photo « après », par l'entreprise ou le salarié) → Validée (par vous).
   Réception de fin de chantier : tour pièce par pièce avec le client, signature à l'écran, procès-verbal.
   Le client a son lien + code SMS ; il parle avec vous, et vous pouvez lui ouvrir la conversation commune (choix de Cyril).
   Marche pareil pour une entreprise sans architecte (RT2O, ERAL) : « Vous » = l'entreprise qui pilote le chantier. */
var PIECES={alpes:[['Salle d\'attente',8,8,68,46],['Accueil',76,8,76,46],['Cabinet 1',8,54,44,38],['Couloir',52,54,60,38],['Cabinet 2',112,54,40,38]]};
var EQS=[['Thomas','Chef'],['Kevin','Plaquiste'],['Mathieu','Plaquiste'],['Lucas','Apprenti']];
var IC_CLI=I('<circle cx="12" cy="8" r="3.6"/><path d="M5 20c.8-3.8 3.6-5.6 7-5.6s6.2 1.8 7 5.6"/>');
function pieces(c){return PIECES[c.id]||[['Tout le chantier',8,8,144,84]]}
function resL(c){var P=part(c);if(!P.res)P.res=c.id==='alpes'?[
  {id:'r1',t:'Un spot de l\'accueil clignote',ent:'st-elec',pc:'Accueil',st:'ouv',par:'cli',d:'ven. 16/10',ph:1},
  {id:'r2',t:'Joint du lavabo à refaire : il fuit un peu',ent:'st-plomb',pc:'Accueil',st:'corr',par:'moi',d:'mer. 14/10',ph:1,dc:'ven. 16/10'},
  {id:'r3',t:'Bande de plafond qui se décolle au-dessus de la porte',ent:'sal:Kevin',pc:'Couloir',st:'ouv',par:'moi',d:'ven. 16/10',ph:1}]:[];return P.res}
function cliDe(c){var P=part(c);if(P.cli===undefined)P.cli=c.id==='alpes'?{n:'Mme Garnier',code:'H8R3',vu:'vu hier',commun:0,nl:1,msgs:[
  {de:'cli',t:'Bonjour, les patients demandent si l\'accueil sera ouvert lundi ?',h:'jeu. 15/10 · 12 h 40'},
  {de:'moi',t:'Oui, tout sera fini lundi midi. On fait la réception ensemble à 15 h 30.',h:'jeu. 15/10 · 13 h 05'},
  {de:'cli',t:'Parfait, merci ! Un des spots de l\'accueil clignote, je l\'ai signalé.',h:'ven. 16/10 · 8 h 02'}]}:null;return P.cli}
function resOuv(c,eid){return resL(c).filter(function(r){return r.st!=='val'&&(!eid||r.ent===eid)}).length}
function offE(c,e){var P=part(c);return e.coupe||(P.termine&&!resOuv(c,e.id))}
var RST={ouv:['À corriger','al'],corr:['Corrigée, à valider','wa'],val:['Validée','ok']};
function equipeOn(){return !(window.PCOPT&&PCOPT.actif('equipe')===false)&&!(window.PC_ENT&&PC_ENT.modules&&PC_ENT.modules.equipe===false)}
function entDe(c,id){if(id==='moi')return {n:'Vous',m:'',ic:'archi'};if(id==='cli'){var k=cliDe(c);return {n:k?k.n:'Le client',m:'Client',ic:'cli'}}
 if(String(id).indexOf('sal:')===0){var s=EQS.filter(function(x){return 'sal:'+x[0]===id})[0]||[id.slice(4),'Salarié'];return {n:s[0],m:s[1]+' · votre équipe',ic:metDe(s[1]),sal:1}}
 return part(c).ent.filter(function(x){return x.id===id})[0]||{n:'À attribuer',m:'',ic:'autre'}}
function icQ(e){return e&&e.ic==='cli'?IC_CLI:icEnt(e)}
function planRes(c,sel){if(!PIECES[c.id])return '';var Pz=pieces(c),R=resL(c);
 return '<svg class="cp-pl" viewBox="0 0 160 100" role="img" aria-label="Plan avec les réserves"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="8" y="8" width="144" height="84" rx="4"/><path d="M76 8v46M8 54h44M76 54h76M112 54v38"/></g>'+
  Pz.map(function(p){return (sel===p[0]?'<rect x="'+(p[1]+3)+'" y="'+(p[2]+3)+'" width="'+(p[3]-6)+'" height="'+(p[4]-6)+'" rx="3" class="cp-plz"/>':'')+'<text x="'+(p[1]+p[3]/2)+'" y="'+(p[2]+p[4]-6)+'" text-anchor="middle" class="cp-plt">'+esc(p[0])+'</text>'}).join('')+
  R.map(function(r,i){var p=Pz.filter(function(x){return x[0]===r.pc})[0];if(!p)return '';var k=R.filter(function(y,j){return j<i&&y.pc===r.pc}).length;var x=p[1]+p[3]/2-6+k*13,y=p[2]+p[4]/2-5;
   return '<g class="cp-pin2 '+RST[r.st][1]+'"><circle cx="'+x+'" cy="'+y+'" r="6"/><text x="'+x+'" y="'+(y+2.6)+'" text-anchor="middle">'+(i+1)+'</text></g>'}).join('')+'</svg>'}
function photoT(lab,on){return '<span class="cp-ph'+(on?' on':'')+'">'+(on?'<i></i>':IC.photo)+'<small>'+esc(lab)+'</small></span>'}
function resCard(c){var R=resL(c),P=part(c),n=resOuv(c),cli=cliDe(c);
 var h='<div class="card" id="cp-res"><div class="row" style="margin-bottom:8px"><b>Réserves</b><span style="font-size:12px;color:var(--muted)">'+(R.length?(n?n+' en cours':'toutes levées ✓'):'aucune')+'</span></div>'+planRes(c);
 if(!R.length)h+='<p class="hint" style="margin:4px 0 0">Un défaut à reprendre ? Une photo, une phrase, et celui qui doit corriger est prévenu par SMS.</p>';
 R.forEach(function(r,i){var e=entDe(c,r.ent),s=RST[r.st];h+='<button type="button" class="cp-rs" data-cprs="'+i+'"><span class="cp-rn '+s[1]+'">'+(i+1)+'</span><span class="tx"><b>'+esc(r.t)+'</b><small><span class="cp-mini">'+icQ(e)+'</span>'+esc(e.n)+' · '+esc(r.pc)+(r.par==='cli'?' · signalée par le client':'')+'</small><span class="cp-pill '+s[1]+'">'+s[0]+'</span></span><span class="cp-go">›</span></button>'});
 if(!P.termine||n)h+='<button type="button" class="btn go cf-go" id="cp-sig" style="width:100%;margin-top:12px"><span class="lab"><span class="ic">'+IC.plus+'</span><span>Signaler un problème</span></span></button>';
 if(P.recep)h+='<button type="button" class="cp-l cp-pvb" id="cp-pv" style="width:100%;margin-top:10px"><span class="r">'+IC.docs+'</span><span class="tx"><b>Réception signée le '+esc(dt(P.recep.d))+'</b><small>Par '+esc(P.recep.qui)+' · '+(P.recep.n?P.recep.n+' réserve'+(P.recep.n>1?'s':'')+' notée'+(P.recep.n>1?'s':''):'sans réserve')+' · voir le procès-verbal</small></span><span class="cp-go">›</span></button>';
 else if(!P.termine&&c.st!=='done')h+='<button type="button" class="btn" id="cp-rec" style="width:100%;margin-top:10px">'+I('<path d="M5 12.5l4.5 4.5L19 7.5"/>')+'<span>Réception avec '+esc(cli?cli.n:'le client')+'</span></button>';
 return h+'</div>'}
/* qui peut corriger : entreprises invitées, salariés (module Équipe), vous */
function quiChoix(c){var L=part(c).ent.map(function(e){return [e.id,e]});if(equipeOn())EQS.forEach(function(s){L.push(['sal:'+s[0],entDe(c,'sal:'+s[0])])});L.push(['moi',{n:'Vous',ic:'archi'}]);return L}
function signaler(c,pc0,retour){var F={pc:pc0||'',ent:'',ph:0},Pz=pieces(c);if(Pz.length===1)F.pc=Pz[0][0];
 var h='<div class="ch-f"><button type="button" class="cp-phb" id="rs-ph">'+photoT('Prendre une photo',0)+'</button>'+
  '<div class="cp-w" style="margin-top:4px"><textarea id="rs-t" rows="2" placeholder="Ce qui ne va pas, en une phrase…"></textarea><button type="button" class="cp-ro pk" id="rs-mic" aria-label="Dicter">'+IC.micro+'</button></div>'+
  (Pz.length>1?'<p class="hint" style="margin:12px 0 6px">Où ?</p><div class="cp-chs">'+Pz.map(function(p){return '<button type="button" class="cp-chp" data-rspc="'+esc(p[0])+'" aria-pressed="'+(F.pc===p[0])+'">'+esc(p[0])+'</button>'}).join('')+'</div>':'')+
  '<p class="hint" style="margin:12px 0 6px">Qui doit corriger ?</p><div class="cp-chs">'+quiChoix(c).map(function(q){return '<button type="button" class="cp-chp" data-rsent="'+esc(q[0])+'" aria-pressed="false"><span class="cp-mini">'+icQ(q[1])+'</span>'+esc(q[1].n)+'</button>'}).join('')+'</div></div>';
 X.xopen('Signaler un problème',c.n,h,'<button class="btn" data-xclose>Annuler</button><button class="btn go" id="rs-ok">Envoyer</button>',function(){
  var pb=$('#rs-ph');pb.addEventListener('click',function(){F.ph=1;pb.innerHTML=photoT('Photo prise',1)});
  dictee2($('#rs-mic'),$('#rs-t'));
  $$('[data-rspc]').forEach(function(b){b.addEventListener('click',function(){F.pc=b.dataset.rspc;$$('[data-rspc]').forEach(function(x){x.setAttribute('aria-pressed',String(x===b))})})});
  $$('[data-rsent]').forEach(function(b){b.addEventListener('click',function(){F.ent=b.dataset.rsent;$$('[data-rsent]').forEach(function(x){x.setAttribute('aria-pressed',String(x===b))})})});
  $('#rs-ok').addEventListener('click',function(){var t=($('#rs-t').value||'').trim();if(!t){$('#rs-t').focus();X.toast('Une phrase suffit','Par exemple : la porte frotte en bas.');return}
   if(!F.pc){X.toast('Où est-ce ?','Touchez la pièce.');return}if(!F.ent){X.toast('Qui doit corriger ?','Touchez une entreprise ou une personne.');return}
   resL(c).push({id:'r'+Date.now().toString(36),t:t,ent:F.ent,pc:F.pc,st:'ouv',par:'moi',d:jour(),ph:F.ph});saveCH();var e=entDe(c,F.ent);
   X.toast('Réserve envoyée',F.ent==='moi'?'Elle est dans votre liste.':e.n+' est prévenu'+(e.sal?'':'e')+' par SMS (démo).');if(retour)retour();else{X.xclose();recharger('equipe','#cp-res')}})},!!retour)}
function ficheRes(c,i){var r=resL(c)[i];if(!r)return;var e=entDe(c,r.ent),s=RST[r.st];
 var h=planRes(c,r.pc)+'<div class="cp-tete" style="margin-top:12px"><span class="cp-mi gros">'+icQ(e)+'</span><div><b>'+esc(r.t)+'</b><small>'+esc(e.n)+' · '+esc(r.pc)+'</small></div></div>'+
  '<p style="margin:10px 0"><span class="cp-pill '+s[1]+'">'+s[0]+'</span></p>'+
  '<div class="cp-phs">'+photoT('Avant · '+r.d,r.ph)+photoT(r.st==='ouv'?'Après : pas encore':'Après · '+(r.dc||jour()),r.st!=='ouv')+'</div>'+
  (!r.ent?'<p class="hint" style="margin:12px 0 6px">Signalée par le client : qui doit corriger ?</p><div class="cp-chs">'+quiChoix(c).map(function(q){return '<button type="button" class="cp-chp" data-rfent="'+esc(q[0])+'"><span class="cp-mini">'+icQ(q[1])+'</span>'+esc(q[1].n)+'</button>'}).join('')+'</div>':'')+
  (e.sal?'<a class="lnk" style="display:inline-block;margin-top:10px" href="invite.html?s='+encodeURIComponent(e.n)+'&ch='+encodeURIComponent(c.id)+'" target="_blank" rel="noopener">Voir la page de '+esc(e.n)+'</a>':'')+
  '<p class="hint" style="margin:10px 0 0">Signalée le '+esc(r.d)+' par '+(r.par==='cli'?esc(entDe(c,'cli').n):'vous')+'.'+(r.st==='corr'?' '+esc(e.n)+' dit que c\'est corrigé : regardez la photo, puis validez.':r.st==='val'?' Validée par vous.':'')+'</p>';
 var f=r.st==='corr'?'<button class="btn" id="rf-non">Pas encore</button><button class="btn go" id="rf-ok">Valider</button>':
  r.st==='ouv'?(!r.ent?'<button class="btn go" data-xclose>Plus tard</button>':r.ent==='moi'?'<button class="btn" data-xclose>Fermer</button><button class="btn go" id="rf-fait">C\'est corrigé</button>':'<button class="btn" data-xclose>Fermer</button><button class="btn go" id="rf-rel">Relancer '+esc(e.n)+'</button>'):'<button class="btn go" data-xclose>Fermer</button>';
 X.xopen('Réserve n° '+(i+1),c.n,h,f,function(){
  var ok=$('#rf-ok');if(ok)ok.addEventListener('click',function(){r.st='val';saveCH();X.xclose();recharger('equipe','#cp-res');X.toast('Réserve levée',resOuv(c)?'Encore '+resOuv(c)+' en cours.':'Toutes les réserves sont levées.')});
  var no=$('#rf-non');if(no)no.addEventListener('click',function(){r.st='ouv';saveCH();X.xclose();recharger('equipe','#cp-res');X.toast('Renvoyée à '+e.n,'Il est prévenu par SMS (démo).')});
  var fa=$('#rf-fait');if(fa)fa.addEventListener('click',function(){r.st='val';r.dc=jour();saveCH();X.xclose();recharger('equipe','#cp-res');X.toast('Réserve levée','')});
  $$('[data-rfent]').forEach(function(b){b.addEventListener('click',function(){r.ent=b.dataset.rfent;saveCH();var q=entDe(c,r.ent);X.xclose();recharger('equipe','#cp-res');X.toast('Réserve confiée à '+q.n,r.ent==='moi'?'':'Prévenu par SMS (démo).')})});
  var rl=$('#rf-rel');if(rl)rl.addEventListener('click',function(){X.toast('Relance envoyée',e.n+' reçoit un SMS (démo).')})})}
/* Réception : le tour du chantier avec le client, pièce par pièce, puis sa signature */
function reception(c){var P=part(c),cli=cliDe(c)||{n:'Le client'};P.rcok=P.rcok||{};
 var h='<p class="hint" style="margin:0 0 10px">Faites le tour avec '+esc(cli.n)+'. Pour chaque pièce : tout va bien, ou une réserve.</p>'+pieces(c).map(function(p){var n=resL(c).filter(function(r){return r.pc===p[0]&&r.st!=='val'}).length,ok=!n&&P.rcok[p[0]];
  return '<div class="cp-rc"><span class="tx"><b>'+esc(p[0])+'</b><small>'+(n?n+' réserve'+(n>1?'s':''):ok?'Tout va bien':'À regarder')+'</small></span>'+
   (n?'':'<button type="button" class="cp-chp" data-rcok="'+esc(p[0])+'" aria-pressed="'+!!ok+'">'+I('<path d="M5 12.5l4.5 4.5L19 7.5"/>')+'Tout va bien</button>')+
   '<button type="button" class="cp-chp" data-rcadd="'+esc(p[0])+'">'+IC.plus+'Réserve</button></div>'}).join('');
 X.xopen('Réception avec '+cli.n,c.n,h,'<button class="btn" data-xclose>Plus tard</button><button class="btn go" id="rc-sig">Faire signer '+esc(cli.n)+'</button>',function(){
  $$('[data-rcok]').forEach(function(b){b.addEventListener('click',function(){P.rcok[b.dataset.rcok]=!P.rcok[b.dataset.rcok];saveCH();reception(c)})});
  $$('[data-rcadd]').forEach(function(b){b.addEventListener('click',function(){signaler(c,b.dataset.rcadd,function(){reception(c)})})});
  $('#rc-sig').addEventListener('click',function(){signer(c)})})}
function signer(c){var P=part(c),cli=cliDe(c)||{n:'Le client'},R=resL(c).filter(function(r){return r.st!=='val'});
 var h='<p style="margin:0 0 8px"><b>'+esc(cli.n)+'</b> accepte les travaux de <b>'+esc(c.t)+'</b>, '+(R.length?'avec '+R.length+' réserve'+(R.length>1?'s':'')+' :':'sans réserve.')+'</p>'+
  (R.length?'<ul class="cp-rl">'+R.map(function(r){return '<li>'+esc(r.t)+' <small>('+esc(r.pc)+' · '+esc(entDe(c,r.ent).n)+')</small></li>'}).join('')+'</ul>':'')+
  '<div class="cp-sigz"><canvas id="rc-can" aria-label="Zone de signature"></canvas><span id="rc-hint">Signez ici avec le doigt</span></div><button type="button" class="lnk" id="rc-eff">Effacer</button>';
 X.xopen('Signature de '+cli.n,'Réception du chantier',h,'<button class="btn" data-xclose>Annuler</button><button class="btn go" id="rc-ok">Valider la réception</button>',function(){
  var cv=$('#rc-can'),z=cv.parentNode,dr=0,a=0,ctx;function taille(){var r=z.getBoundingClientRect(),k=window.devicePixelRatio||1;cv.width=r.width*k;cv.height=r.height*k;ctx=cv.getContext('2d');ctx.scale(k,k);ctx.lineWidth=2.4;ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=getComputedStyle(z).color}taille();
  function pt(e){var r=cv.getBoundingClientRect(),t=e.touches?e.touches[0]:e;return [t.clientX-r.left,t.clientY-r.top]}
  function go(e){dr=1;a=1;$('#rc-hint').hidden=true;var p=pt(e);ctx.beginPath();ctx.moveTo(p[0],p[1]);e.preventDefault()}
  function mv(e){if(!dr)return;var p=pt(e);ctx.lineTo(p[0],p[1]);ctx.stroke();e.preventDefault()}
  function up(){dr=0}
  cv.addEventListener('pointerdown',go);cv.addEventListener('pointermove',mv);window.addEventListener('pointerup',up);
  $('#rc-eff').addEventListener('click',function(){ctx.clearRect(0,0,cv.width,cv.height);a=0;$('#rc-hint').hidden=false});
  $('#rc-ok').addEventListener('click',function(){if(!a){X.toast('La signature manque',cli.n+' signe avec le doigt dans le cadre.');return}
   P.recep={d:auj(),qui:cli.n,n:R.length,sig:cv.toDataURL('image/png'),L:R.map(function(r){return [r.t,r.pc,entDe(c,r.ent).n]})};saveCH();pv(c);recharger('equipe','#cp-res')})})}
function pv(c){var P=part(c),R=P.recep;if(!R)return;
 var h='<div class="pdf" role="document"><div class="pdf-h"><div><b>Dupont Rénovation</b><span>[Adresse] · SIRET [numéro]</span></div><div class="r"><span class="pdf-t">PROCÈS-VERBAL</span><span>de réception des travaux</span><span>'+esc(dt(R.d))+'</span></div></div>'+
  '<div class="pdf-c"><span class="pdf-k">Chantier</span><b>'+esc(c.n)+' · '+esc(c.v||'')+'</b><span>'+esc(c.t)+'</span><span class="pdf-k" style="margin-top:6px">Décision</span><span>Réception prononcée '+(R.n?'avec '+R.n+' réserve'+(R.n>1?'s':''):'sans réserve')+'.</span></div>'+
  (R.n?'<table><thead><tr><th>Réserve</th><th>Pièce</th><th>À corriger par</th></tr></thead><tbody>'+R.L.map(function(l){return '<tr><td>'+esc(l[0])+'</td><td>'+esc(l[1])+'</td><td>'+esc(l[2])+'</td></tr>'}).join('')+'</tbody></table>':'')+
  '<div class="pdf-s"><p>Les réserves sont levées dans un délai convenu entre les parties. [Mentions légales de la réception]</p></div>'+
  '<div class="cp-pvsig"><span>Le client, '+esc(R.qui)+'</span><img alt="Signature" src="'+R.sig+'"></div></div>';
 X.xopen('Procès-verbal de réception',c.n,h,'<button class="btn" data-xclose>Fermer</button><button class="btn go" id="pv-env">Envoyer à tous</button>',function(){
  $('#pv-env').addEventListener('click',function(){X.xclose();X.toast('Procès-verbal envoyé','Au client et aux entreprises concernées, par e-mail (démo).')})})}
/* le client : son lien, ce qu'il voit, et sa conversation avec vous */
function cliRow(c){var k=cliDe(c),P=part(c);if(c.st==='done'&&!k)return '';
 if(!k)return P.termine?'':'<button type="button" class="cp-e" id="cp-clinv"><span class="cp-mi">'+IC_CLI+'</span><span class="tx"><b>Inviter le client</b><small>Il suit son chantier, signale un souci, parle avec vous</small></span><span class="cp-go">›</span></button>';
 return '<button type="button" class="cp-e" id="cp-cli"><span class="cp-mi">'+IC_CLI+'</span><span class="tx"><b>'+esc(k.n)+'</b><small>Client · '+esc(k.vu||'invitation envoyée')+' · '+(k.commun?'lit la conversation commune':'parle avec vous')+'</small></span><span class="cp-go">›</span></button>'}
function ficheCli(c){var k=cliDe(c);if(!k)return;
 var h='<div class="cp-tete"><span class="cp-mi gros">'+IC_CLI+'</span><div><b>'+esc(k.n)+'</b><small>Client du chantier</small></div></div>'+
  '<div class="cp-l" style="margin-top:14px"><span class="r">'+IC.cadenas+'</span><span class="tx"><b>Code personnel '+esc(k.code)+'</b><small>Lien envoyé par SMS · code SMS à la 1re ouverture</small></span></div>'+
  '<p class="hint" style="margin:16px 0 6px">Dans la conversation, '+esc(k.n)+' parle…</p><div class="cp-seg" role="radiogroup"><button type="button" class="btn" data-cpcom="0" aria-pressed="'+!k.commun+'">Avec vous seulement</button><button type="button" class="btn" data-cpcom="1" aria-pressed="'+!!k.commun+'">Avec tout le chantier</button></div>'+
  '<p class="hint" style="margin:8px 0 0">Avec vous seulement : les entreprises ne lisent pas ses messages, et il voit « Ce qui est décidé ».</p>'+
  '<button type="button" class="btn" id="cp-cren" style="width:100%;margin-top:14px">Renvoyer son lien</button>';
 X.xopen(k.n,'Sur le chantier '+c.n,h,'<button class="btn" data-xclose>Fermer</button><a class="btn go" style="text-decoration:none;display:flex;align-items:center;justify-content:center" href="invite.html?c=1&ch='+encodeURIComponent(c.id)+'" target="_blank" rel="noopener">Voir sa page</a>',function(){
  var arm=0;$$('[data-cpcom]').forEach(function(b){b.addEventListener('click',function(){
   if(b.dataset.cpcom==='1'&&!k.commun&&!arm){arm=1;b.innerHTML='Touchez encore pour confirmer<small>Les entreprises liront ses messages, et lui les leurs</small>';setTimeout(function(){if(b.isConnected&&!k.commun){arm=0;b.textContent='Avec tout le chantier'}},4000);return}
   k.commun=+b.dataset.cpcom;saveCH();$$('[data-cpcom]').forEach(function(x){x.setAttribute('aria-pressed',String(x===b))});recharger('equipe');
   X.toast(k.commun?'Conversation commune ouverte':'Conversation avec vous seulement',k.commun?k.n+' lit et écrit dans la conversation du chantier.':'Les entreprises ne lisent plus ses messages.')})});
  $('#cp-cren').addEventListener('click',function(){X.toast('Lien renvoyé',k.n+' le reçoit par SMS (démo).')})})}
/* TRÈS PRIVÉ (Cyril 19/11) : chaque conversation dit clairement qui la lit, juste au-dessus de la case où l'on écrit.
   Données séparées : la conversation du client (part.cli.msgs) n'est jamais envoyée aux entreprises ; à brancher côté service
   avec un filtre par lien (chaque code ne reçoit que SES conversations). */
var IC_LOCK=I('<rect x="5" y="11" width="14" height="9" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>');
function luPar(c){var P=part(c),k=cliDe(c),L=P.ent.filter(function(e){return !offE(c,e)}).map(function(e){return e.n});if(k&&k.commun)L.push(k.n+' (client)');
 return '<p class="cp-lu">'+IC_LOCK+'<span>Lu par : vous, '+esc(L.join(', '))+'</span></p>'}
function cliCard(c){var k=cliDe(c);if(!k)return '';k.nl=0;
 var dj='',fil=k.msgs.map(function(x){var j=jourDe(x.h),sep=j!==dj?'<div class="cp-j"><span>'+esc(j)+'</span></div>':'';dj=j;var moi=x.de==='moi',hh=String(x.h||'').split(' · ');
  return sep+'<div class="cp-m'+(moi?' moi':'')+'">'+(moi?'':'<span class="cp-av">'+IC_CLI+'</span>')+'<div class="cp-c">'+(moi?'':'<span class="cp-n">'+esc(k.n)+' <small>Client</small></span>')+'<div class="cp-r"><p class="cp-bu">'+esc(x.t)+'</p></div><span class="cp-h">'+esc(hh[1]||'')+'</span></div></div>'}).join('');
 return '<div class="card cp-priv" id="cp-cfil"><div class="row" style="margin-bottom:8px"><b>Avec '+esc(k.n)+'</b><span style="font-size:12px;color:var(--muted)">conversation privée</span></div>'+
  '<p class="cp-lu priv">'+IC_LOCK+'<span>Privé : vous et '+esc(k.n)+' seulement. Aucune entreprise ne lit ces messages.</span></p><div class="cp-fil">'+fil+'</div>'+
  (part(c).termine?'':'<div class="cp-w"><textarea id="cp-ct" rows="1" placeholder="Écrire à '+esc(k.n)+' seulement…"></textarea><button type="button" class="cp-ro go" id="cp-csend" aria-label="Envoyer">'+I('<path d="M5 12h13M13 6l6 6-6 6"/>')+'</button></div>')+'</div>'}
function lierRes(c){
 $$('#chx [data-cprs]').forEach(function(b){b.addEventListener('click',function(){ficheRes(c,+b.dataset.cprs)})});
 var s=$('#cp-sig');if(s)s.addEventListener('click',function(){signaler(c)});
 var r=$('#cp-rec');if(r)r.addEventListener('click',function(){reception(c)});
 var p=$('#cp-pv');if(p)p.addEventListener('click',function(){pv(c)});
 var k=$('#cp-cli');if(k)k.addEventListener('click',function(){ficheCli(c)});
 var ki=$('#cp-clinv');if(ki)ki.addEventListener('click',function(){var o=dos({dos:c.dos});part(c).cli={n:(o&&o.n)||c.n,code:codeNeuf(),vu:'',commun:0,nl:0,msgs:[]};saveCH();recharger('equipe');X.toast('Invitation envoyée',part(c).cli.n+' reçoit son lien par SMS (démo).')});
 var t=$('#cp-ct'),se=$('#cp-csend');if(t)t.addEventListener('input',function(){t.style.height='auto';t.style.height=Math.min(140,t.scrollHeight)+'px'});
 if(se)se.addEventListener('click',function(){var v=(t.value||'').trim();if(!v){t.focus();return}cliDe(c).msgs.push({de:'moi',t:v,h:maint()});saveCH();recharger('equipe','#cp-cfil');X.toast('Envoyé à '+cliDe(c).n+' seulement','Aucune entreprise ne le voit.')})}

/* ---------- créer un chantier ---------- */
var NC=null;
function nouveau(){var CC=clientsChoix(),K=CC.map(function(x){return x.k}),CI={};CC.forEach(function(x){CI[x.k]=x});NC=NC||{cli:K[0]||''};if(K.indexOf(NC.cli)<0)NC.cli=K[0]||'';
 var d0=new Date(),d1=new Date(d0.getTime()+86400000);var iso=function(d){return d.toISOString().slice(0,10)};
 X.xopen('Créer un chantier','Choisissez le client, puis les travaux','<div class="ch-f">'+
  '<label>Pour quel client<select id="nc-c">'+K.map(function(k){return '<option value="'+esc(k)+'"'+(NC.cli===k?' selected':'')+'>'+esc(CI[k].n)+(CI[k].v?' · '+esc(CI[k].v):'')+'</option>'}).join('')+'</select></label>'+
  '<button type="button" class="lnk" id="nc-nc">+ Nouveau client</button>'+
  '<label>Les travaux<input id="nc-t" placeholder="Par ex. cloison du séjour avec une porte" value="'+esc(NC.t||'')+'"></label>'+
  '<label>Ville du chantier<input id="nc-v" placeholder="Ville" value="'+esc(NC.v||(CI[NC.cli]&&CI[NC.cli].v)||'')+'"></label>'+
  '<div class="two"><label>Début<input type="date" id="nc-d1" value="'+(NC.d1||iso(d0))+'"></label><label>Fin<input type="date" id="nc-d2" value="'+(NC.d2||iso(d1))+'"></label></div>'+
  '<p class="hint" style="margin:0">Ensuite, dans le chantier : créez le pré-devis, le devis, les factures d\'acompte et les factures.</p></div>',
  '<button class="btn" data-xclose>Annuler</button><button class="btn go" id="nc-ok">Créer le chantier</button>',function(){
  var garder=function(){NC.cli=$('#nc-c').value;NC.t=$('#nc-t').value;NC.v=$('#nc-v').value;NC.d1=$('#nc-d1').value;NC.d2=$('#nc-d2').value};
  /* la liste complète des clients de l'Espace arrive du service : on la remet à jour si elle a bougé */
  if(enVrai()&&X.cf&&X.cf.chargerVrais)X.cf.chargerVrais(function(){var s=$('#nc-c');if(!s||!document.body.contains(s))return;garder();if(clientsChoix().length!==K.length)nouveau()});
  $('#nc-c').addEventListener('change',function(){var o=CI[this.value];if(o)$('#nc-v').value=o.v||''});
  $('#nc-nc').addEventListener('click',function(){garder();var retour=function(k){var o=k&&dos({dos:k});if(o){NC.cli=k;NC.v=o.v||NC.v}nouveau()};
   if(X.cf&&X.cf.nouveauClient)X.cf.nouveauClient(retour);else clientSecours(retour);});
  $('#nc-ok').addEventListener('click',function(){garder();if(!NC.t.trim()){$('#nc-t').focus();return}creer(NC);NC=null;});});}
function dt(s){var d=new Date(s+'T12:00:00');return isNaN(d)?'':d.toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'numeric'})}
function creer(n){var o=dos({dos:n.cli}),id='c'+Date.now().toString(36);
 CH[id]={id:id,dos:n.cli,n:o?o.n:'Client',v:n.v||(o&&o.v)||'',t:n.t.trim(),st:'start',dv:'',d1:n.d1||'',d2:n.d2||n.d1||'',dates:(n.d1?dt(n.d1)+(n.d2&&n.d2!==n.d1?' → '+dt(n.d2):''):'dates à fixer'),
  ouv:[['Travaux',100,0]],fin:{ht:0,tva:10,ac:0},four:[],fst:{},prev:0,reel:[],notes:[],ph:[],docs:[],avis:{on:true,quand:'lendemain'}};
 if(o){o.k='chantier';o.ch=id}saveCH();
 if(window.PCPLAN&&PCPLAN.chantier&&n.d1)PCPLAN.chantier(CH[id],n.d1,n.d2||n.d1);
 X.xclose();vue='cours';ouvrir(id);X.toast('Chantier créé',CH[id].n+' · prochaine étape : le devis.');}
/* Petit formulaire de secours, si l'onglet Clients n'en propose pas encore (même format que clients.js) */
function clientSecours(cb){var ty='part';
 var corps=function(){return '<div class="ch-f"><div class="seg2"><button type="button" class="btn" data-ty="part" aria-pressed="'+(ty==='part')+'">Particulier</button><button type="button" class="btn" data-ty="pro" aria-pressed="'+(ty==='pro')+'">Professionnel</button></div>'+
  (ty==='pro'?'<label>Entreprise<input id="cs-e"></label><label>SIRET<input id="cs-s" inputmode="numeric"></label>':'')+
  '<div class="two"><label>Prénom<input id="cs-p" autocomplete="given-name"></label><label>Nom<input id="cs-n" autocomplete="family-name"></label></div>'+
  '<label>Téléphone<input id="cs-t" type="tel" autocomplete="tel"></label><label>E-mail<input id="cs-m" type="email" autocomplete="email"></label>'+
  '<label>Adresse<input id="cs-a" autocomplete="street-address"></label><div class="two"><label>Code postal<input id="cs-cp" inputmode="numeric" autocomplete="postal-code"></label><label>Ville<input id="cs-v" autocomplete="address-level2"></label></div></div>'};
 X.xopen('Nouveau client','Particulier ou professionnel',corps(),'<button class="btn" id="cs-x">Retour</button><button class="btn go" id="cs-ok">Enregistrer le client</button>',function(){
  var lier2=function(){$$('[data-ty]').forEach(function(b){b.addEventListener('click',function(){ty=b.dataset.ty;$('#x-in').innerHTML=corps();lier2()})})};lier2();
  $('#cs-x').addEventListener('click',function(){cb(null)});
  $('#cs-ok').addEventListener('click',function(){var v=function(s){var e=$(s);return e?e.value.trim():''};var nom=v('#cs-n'),pre=v('#cs-p'),ent=v('#cs-e');
   if(!nom&&!ent){($('#cs-e')||$('#cs-n')).focus();return}
   var k='n'+Date.now().toString(36),o={n:ty==='pro'&&ent?ent:(pre?pre+' ':'')+nom,prenom:pre,nom:nom,type:ty,entreprise:ent,siret:v('#cs-s'),v:v('#cs-v'),cp:v('#cs-cp'),adr:[v('#cs-a'),[v('#cs-cp'),v('#cs-v')].filter(Boolean).join(' ')].filter(Boolean).join(', '),tel:v('#cs-t'),mail:v('#cs-m'),t:'',k:'visite',src:'Ajouté à la main',chat:[],ph:[],docs:[],hist:[[jour(),'Client ajouté par vous']]};
   if(ty==='pro'&&pre)o.contact=pre+' '+nom;
   DOS[k]=o;var N=X.lsGet('pc-cl1',{});N[k]=o;X.lsSet('pc-cl1',N);cb(k);});});}

(function(){var st=document.createElement('style');st.textContent='.ch-pmini{display:block;width:100%;max-height:260px;margin:10px 0}';document.head.appendChild(st)})();
/* « Ouvrir le plan » / « Créer le plan » : la carte se redessine quand le plan arrive, d'où l'écoute sur la page */
document.addEventListener('click',function(e){var r=e.target.closest&&e.target.closest('[data-chrel]');if(r){e.preventDefault();var c=CH[r.getAttribute('data-chrel')],s=document.getElementById('ch-rel');if(c&&s&&s.value){c.dos=s.value;var o=dos(c);if(o){c.n=o.n;if(!c.v&&o.v)c.v=o.v}saveCH();X.toast('Chantier relié',(o?o.n:'')+' · son dossier s\'affiche.');ouvrir(c.id,ong)}return}
 var b=e.target.closest&&e.target.closest('[data-chplan]');if(!b)return;e.preventDefault();var k=b.getAttribute('data-chplan'),p=planDe(k);if(window.PCPLANS&&PCPLANS.ouvrirPour)PCPLANS.ouvrirPour(k,p&&p.plan)});
window.PCCH={dos:function(k){return k?dos({dos:k}):null},liste:liste,ouvrir:function(id,o){ouvrir(id,o||null)},nouveau:nouveau,suggerer:suggerer};
if(X.setCurCh)liste();
})();
