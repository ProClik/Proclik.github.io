/* Cliky suit le chantier (17/11, Cyril : « Ok pour les 6 »), dans le pré-devis d'une vraie demande :
   1. Achats du chantier : matériel prévu / payé, marge prévue / réelle (factures lues par Cliky, rangées par chantier).
   2. Vos prix ont bougé : le pré-devis refait avec les prix d'aujourd'hui (aperçu sans frais), tant que le client n'a pas signé.
   3. Trois gammes : Économique, la demande du client, Confort, chiffrées par le programme.
   4. « Je retiens ? » : un prix changé à la main dans une ligne devient, si l'artisan le veut, le prix de sa base.
   6. Questions au client : un lien de réponse (une question à la fois, avec des boutons) ; les réponses reviennent ici.
   Tout passe par le service (window.PCV.api). Rien n'est envoyé au client sans le geste de l'artisan. */
(function(){
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var eur=function(n){return n==null?'—':Number(n).toLocaleString('fr-FR',{minimumFractionDigits:2,maximumFractionDigits:2})+' €'};
var pct=function(n){return (n>0?'+':n<0?'−':'')+String(Math.abs(Math.round(n*10)/10)).replace('.',',')+' %'};
var V=function(){return window.PCV&&window.PCV.api?window.PCV:null};
var tag=function(){return window.PCTAG?PCTAG('cliky'):''};
var SIGNE=/accept|sign|chantier|termin|pay|perdu|refus|annul|factur/i;
var CUR=null;

var css=document.createElement('style');
css.textContent=[
'.vsu{display:grid;gap:12px;margin:0 0 12px}.vsu .card{margin:0}',
'.vsu-l{display:grid;grid-template-columns:1fr auto;gap:4px 12px;font-size:14px;margin:6px 0 0}.vsu-l span{color:var(--muted)}.vsu-l b{text-align:right}',
'.vsu-big{display:flex;justify-content:space-between;align-items:baseline;gap:10px;margin:8px 0 2px}.vsu-big span{font-size:13.5px;color:var(--muted);font-weight:700}.vsu-big b{font-size:22px}',
'.vsu-ok{color:var(--ok-ink,#2E6B4F)}.vsu-ko{color:var(--cor-ink,#A23B2A)}',
'.vsu-docs{margin:10px 0 0;padding:0;list-style:none;display:grid;gap:6px}.vsu-docs li{display:flex;gap:8px;align-items:center;justify-content:space-between;font-size:13.5px;border-top:1px solid var(--line);padding-top:6px}',
'.vsu-docs small{display:block;color:var(--muted)}.vsu-x{appearance:none;border:0;background:none;color:var(--muted);font:700 13px var(--f);cursor:pointer;padding:6px}',
'.vsu-h{border-left:4px solid var(--acc,#A8823F)}.vsu-h ul{margin:6px 0 10px;padding-left:18px;font-size:13.5px}',
'.vsu-g{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px;margin:8px 0 0}',
'.vsu-gc{border:1px solid var(--line);border-radius:14px;padding:10px 12px;display:grid;gap:6px;align-content:start;background:var(--card)}',
'.vsu-gc.dem{border-color:var(--nuit,#1B2440);box-shadow:0 0 0 1px var(--nuit,#1B2440) inset}',
'.vsu-gc b.n{font-size:13px;text-transform:uppercase;letter-spacing:.04em;color:var(--muted)}.vsu-gc b.t{font-size:19px}.vsu-gc ul{margin:0;padding-left:16px;font-size:12.5px;color:var(--muted)}',
'.vsu-q{margin:8px 0 0;padding:0;list-style:none;display:grid;gap:8px}.vsu-q li{font-size:13.5px}.vsu-q li b{display:block}.vsu-q li span{color:var(--muted)}',
'.vsu-btns{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}.vsu-btns .vbtn{flex:1 1 140px}',
'#vsu-ret{position:fixed;left:12px;right:12px;bottom:calc(16px + env(safe-area-inset-bottom));z-index:2147482000;max-width:520px;margin:0 auto;background:var(--card);color:var(--fg);border-radius:18px;padding:14px 16px;box-shadow:0 12px 40px rgba(11,18,38,.28);border:1px solid var(--line);display:grid;gap:8px;animation:vsuIn .25s ease-out}',
'#vsu-ret p{margin:0;font-size:14px}#vsu-ret small{color:var(--muted)}#vsu-ret .vsu-btns{margin:0}',
'html.vsu-dep #xsheet{z-index:10001}html.vsu-dep #xscrim{z-index:10000}',
'@keyframes vsuIn{from{transform:translateY(20px);opacity:0}to{transform:none;opacity:1}}'
].join('');
document.head.appendChild(css);

/* ---------- le bloc sous le contrôle du pré-devis ---------- */
document.addEventListener('pcv-afficher',function(e){var x=e.detail||{},z=$('#vsuivi'),P=V();if(!z||!P||!x.p||!x.d||!x.d.contact)return;
 CUR={id:x.d.contact.id,d:x.d,p:x.p,t:x.t,etape:x.etape||''};var id=CUR.id,ouvert=!SIGNE.test(CUR.etape);
 z.className='vsu';z.innerHTML='<div id="vsu-h"></div><div class="card vsec" id="vsu-a"><h3>Achats du chantier</h3><p class="vst" style="padding:0">Chargement…</p></div>'+
  (ouvert?'<div class="card vsec" id="vsu-g">'+tag()+'<h3>Proposer trois gammes</h3><p class="vst" style="padding:0 0 8px">Économique, la demande du client, Confort : chiffrées par le programme, sans frais.</p><button type="button" class="vbtn" data-vsgg style="width:100%">Préparer les 3 gammes</button></div>':'')+
  '<div id="vsu-q"></div>';
 chargerAchats(id);if(ouvert)hausse(id);questions(id);baseA()});

/* 1. Achats du chantier */
function chargerAchats(id){var P=V();P.api('/espace/achats?contact='+encodeURIComponent(id)).then(function(x){if(CUR&&CUR.id===id)rendreAchats(x)},function(e){var b=$('#vsu-a');if(b)b.innerHTML='<h3>Achats du chantier</h3><div class="verr">'+esc(e.message)+'</div>'})}
function rendreAchats(x){var b=$('#vsu-a');if(!b||!CUR)return;var t=CUR.t||{},L=x.achats||[],paye=x.total_ht||0,prevu=t.materiaux||0,vente=(t.materiaux||0)+(t.marge||0);
 var h=tag()+'<h3>Achats du chantier</h3>';
 if(!L.length)h+='<p class="vst" style="padding:0">Matériel prévu : <b>'+eur(prevu)+' HT</b>. Déposez les factures du fournisseur pour ce chantier : Cliky compare au prévu et vous montre votre vraie marge.</p>';
 else{var ec=paye-prevu,mp=t.marge||0,mr=vente-paye;
  h+='<div class="vsu-l"><span>Matériel prévu</span><b>'+eur(prevu)+'</b><span>Matériel payé ('+L.length+' document'+(L.length>1?'s':'')+')</span><b>'+eur(paye)+'</b>'+(paye<prevu*0.9?'</div>':'<span>Écart</span><b class="'+(ec>0.005?'vsu-ko':'vsu-ok')+'">'+(ec>0?'+ ':ec<0?'− ':'')+eur(Math.abs(ec))+(prevu>0?' ('+pct(ec/prevu*100)+')':'')+'</b></div>')+
   (paye<prevu*0.9?'<div class="vsu-big"><span>Payé à ce jour</span><b>'+Math.round(paye/prevu*100)+' % du prévu</b></div><p class="vst" style="padding:0">Marge prévue sur le matériel : '+eur(mp)+'. La marge réelle s\'affiche quand les factures couvrent le matériel prévu : déposez-les au fur et à mesure.</p>':
   '<div class="vsu-big"><span>Marge réelle sur le matériel</span><b class="'+(mr<mp-0.005?'vsu-ko':'vsu-ok')+'">'+eur(mr)+'</b></div><p class="vst" style="padding:0">Prévue : '+eur(mp)+'. '+(mr<mp-0.005?'Vous avez payé '+eur(paye-prevu)+' de plus que prévu : chutes, casse ou hausse de prix ?':'Le matériel a coûté moins que prévu.')+' Main-d\'œuvre non comprise.</p>')+
   '<ul class="vsu-docs">'+L.map(function(a){return '<li><span><b>'+esc([a.type?a.type.charAt(0).toUpperCase()+a.type.slice(1):'Document',a.fournisseur].filter(Boolean).join(' '))+'</b><small>'+esc([a.numero?'n° '+a.numero:'',a.date].filter(Boolean).join(' · '))+'</small></span><span><b>'+eur(a.montant_ht)+'</b><button type="button" class="vsu-x" data-vsux="'+esc(a.id)+'" aria-label="Retirer ce document">Retirer</button></span></li>'}).join('')+'</ul>'}
 h+='<div class="vsu-btns"><button type="button" class="vbtn" data-vsuf>📷 Déposer une facture de ce chantier</button></div>';b.innerHTML=h}
/* la fenêtre de lecture passe au-dessus du pré-devis, le temps du dépôt */
var xs=document.getElementById('xsheet');if(xs&&window.MutationObserver)new MutationObserver(function(){if(!xs.classList.contains('on'))document.documentElement.classList.remove('vsu-dep')}).observe(xs,{attributes:true,attributeFilter:['class']});
document.addEventListener('pc-achats',function(e){var x=e.detail||{};if(CUR&&x.contact===CUR.id&&x.achats)rendreAchats(x.achats)});

/* 2. Vos prix ont bougé depuis ce pré-devis (aperçu du recalcul, rien n'est écrit) */
function hausse(id){var P=V();P.api('/espace/recalcul',{method:'POST',body:{contact:id}}).then(function(x){if(!CUR||CUR.id!==id)return;var b=$('#vsu-h');if(!b)return;
 var a=x.avant&&x.avant.total_ht,n=x.apres&&x.apres.total_ht;if(!(a>0)||n==null)return;var d=n-a;if(Math.abs(d)<Math.max(1,a*0.005))return;
 var M=((x.changements||{}).modifiees||[]).filter(function(l){return l.avant.quantite===l.apres.quantite}).sort(function(p,q){return Math.abs(q.apres.total-q.avant.total)-Math.abs(p.apres.total-p.avant.total)}).slice(0,3);
 b.innerHTML='<div class="card vsec vsu-h" role="status">'+tag()+'<h3>'+(d>0?'Vos prix ont augmenté':'Vos prix ont baissé')+' depuis ce pré-devis</h3><p class="vst" style="padding:0">Avec vos prix d\'aujourd\'hui : '+eur(a)+' → <b>'+eur(n)+' HT</b> ('+pct(d/a*100)+'). Le client n\'a pas encore signé : c\'est le moment de le revoir.</p>'+
  (M.length?'<ul>'+M.map(function(l){return '<li>'+esc(l.libelle)+' : '+eur(l.avant.total)+' → '+eur(l.apres.total)+'</li>'}).join('')+'</ul>':'')+'<button type="button" class="vbtn go" data-vsurc style="width:100%">↻ Recalculer avec les prix d\'aujourd\'hui</button></div>'},function(){})}

/* 3. Trois gammes */
function gammes(btn){var P=V();if(!CUR)return;btn.disabled=true;btn.textContent='Cliky prépare les gammes…';var id=CUR.id;
 P.api('/espace/gammes',{method:'POST',body:{contact:id}}).then(function(x){if(!CUR||CUR.id!==id)return;var b=$('#vsu-g');if(!b)return;var G=x.gammes||[];CUR.G=G;
  if(!G.length){b.innerHTML=tag()+'<h3>Trois gammes</h3><p class="vst" style="padding:0">'+esc(x.raison||'Pas de gamme pour ces travaux.')+'</p>';return}
  b.innerHTML=tag()+'<h3>Trois gammes pour ce client</h3><p class="vst" style="padding:0">Montants HT, avec vos prix et vos réglages. Touchez une gamme pour la reprendre dans ce pré-devis.</p><div class="vsu-g">'+
   G.map(function(g,i){return '<div class="vsu-gc'+(g.id==='demande'?' dem':'')+'"><b class="n">'+esc(g.nom)+'</b><b class="t">'+eur(g.total_ht)+'</b><ul>'+(g.choix||[]).map(function(c){return '<li>'+esc(c)+'</li>'}).join('')+'</ul>'+(g.id==='demande'?'<small class="vst" style="padding:0">Le pré-devis actuel</small>':'<button type="button" class="vbtn sm" data-vsgp="'+i+'">Reprendre celle-ci</button>')+'</div>'}).join('')+'</div>'+
   '<div class="vsu-btns"><button type="button" class="vbtn sm" data-vsgc>Copier pour le client</button></div>'},
  function(e){btn.disabled=false;btn.textContent='Préparer les 3 gammes';P.toast('Gammes impossibles',e.message)})}
function texteGammes(){var a=V().artisan(),k=CUR.d.contact||{};return 'Bonjour'+(k.prenom?' '+k.prenom:'')+',\nVoici trois propositions pour vos travaux (montants HT) :\n'+CUR.G.map(function(g){return '- '+g.nom+' : '+eur(g.total_ht)+(g.id==='demande'?' (votre demande)':' ('+(g.choix||[]).join(' ; ')+')')}).join('\n')+'\nDites-moi celle qui vous convient, je prépare le devis.\n'+(a.prenom||'')+(a.entreprise?' · '+a.entreprise:'')}

/* 6. Questions au client : lien de réponse */
function questions(id){var P=V(),Q=P.questionsClient?P.questionsClient(CUR.p):[];
 P.api('/espace/questions?contact='+encodeURIComponent(id)).then(function(x){if(!CUR||CUR.id!==id)return;rendreQ(x,Q)},function(){rendreQ({},Q)})}
function rendreQ(x,Q){var b=$('#vsu-q');if(!b)return;var k=CUR.d.contact||{},h='';
 if(x.reponses){h='<div class="card vsec">'+tag()+'<h3>✓ Le client a répondu</h3><p class="vst" style="padding:0">Le '+esc(new Date(x.repondu_le).toLocaleString('fr-FR',{day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'}))+'. Corrigez les lignes concernées, puis cochez les points « À vérifier ».</p><ul class="vsu-q">'+
  x.questions.map(function(q,i){return '<li><b>'+esc(q.q)+'</b><span>→ '+esc(x.reponses[i]||'pas de réponse')+'</span></li>'}).join('')+'</ul></div>'}
 else if(Q.length&&(k.telephone||k.email)){h='<div class="card vsec" id="vsu-qc">'+tag()+'<h3>'+Q.length+' question'+(Q.length>1?'s':'')+' pour le client</h3><p class="vst" style="padding:0">'+(x.lien?'Lien préparé le '+esc(new Date(x.le).toLocaleDateString('fr-FR'))+', pas encore de réponse. ':'')+'Le client répond depuis son téléphone, une question à la fois, avec des boutons. Ses réponses arrivent ici.</p>'+
  '<div class="vsu-btns"><button type="button" class="vbtn go" data-vsuq>'+(x.lien?'Renvoyer le lien':'Préparer le lien de réponse')+'</button></div></div>'}
 b.innerHTML=h}
function lienQ(btn){var P=V(),Q=P.questionsClient(CUR.p),id=CUR.id;btn.disabled=true;btn.textContent='Préparation…';
 P.api('/espace/questions',{method:'POST',body:{contact:id,questions:Q}}).then(function(x){var b=$('#vsu-qc');if(!b)return;var k=CUR.d.contact||{},a=P.artisan();
  var t='Bonjour'+(k.prenom?' '+k.prenom:'')+',\nPour finaliser votre devis, j\'ai '+(Q.length>1?Q.length+' petites questions':'une petite question')+'. Vous pouvez répondre en une minute ici :\n'+x.lien+'\nMerci !\n'+(a.prenom||'')+(a.entreprise?' · '+a.entreprise:'');
  CUR.msg=t;b.querySelector('.vsu-btns').innerHTML=(k.telephone?'<a class="vbtn go" href="sms:'+esc(String(k.telephone).replace(/\s/g,''))+'?&body='+encodeURIComponent(t)+'" style="text-decoration:none;text-align:center">💬 Envoyer par SMS</a>':'')+
   (k.email?'<a class="vbtn" href="mailto:'+esc(k.email)+'?subject='+encodeURIComponent('Quelques questions pour votre devis')+'&body='+encodeURIComponent(t)+'" style="text-decoration:none;text-align:center">✉️ Par e-mail</a>':'')+'<button type="button" class="vbtn" data-vsuqc>Copier</button>';
  b.insertAdjacentHTML('beforeend','<p class="vst" style="padding:8px 0 0;font-size:12.5px">Le message s\'ouvre dans votre appli : vous le relisez avant de l\'envoyer. Lien valable 30 jours.</p>')},
  function(e){btn.disabled=false;btn.textContent='Préparer le lien de réponse';P.toast('Lien pas préparé',e.message)})}
function copier(t,msg){var P=V();(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(function(){P.toast('Copié',msg)},function(){P.toast('Copie impossible','Sélectionnez le texte à la main.')})}

/* 4. « Je retiens ? » : un prix changé à la main dans une ligne de matériau */
var mots=function(t){return String(t||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[×x]/g,' ').split(/[^a-z0-9,.]+/).filter(function(w){return w.length>=3||/\d/.test(w)}).filter(function(w){return ['les','des','pour','avec','une','nf'].indexOf(w)<0})};
/* L'article de la base qui correspond à la ligne : le plus de mots en commun (au moins 2, dont un nombre ou 3 mots) */
var BA=null,BAt=0;function baseA(force){var P=V();if(!P||(!force&&BA&&Date.now()-BAt<300000))return;BAt=Date.now();P.api('/espace/base').then(function(x){BA=x.articles||[]},function(){BAt=0})}
function article(lib){var A=BA||[],M=mots(lib),best=null,bs=0;
 A.forEach(function(a){if(a.k==='prestation'||!(a.pc>0))return;var W=mots(a.d),n=0,num=0;M.forEach(function(w){if(W.indexOf(w)>=0){n++;if(/\d/.test(w))num++}});if((n>=2&&num)||n>=3){var sc=n/Math.max(W.length,M.length);if(sc>bs){bs=sc;best=a}}});return best}
var sing=function(w){return String(w||'').toLowerCase().replace(/s$/,'')};
document.addEventListener('pcv-ligne',function(e){var x=e.detail||{},av=x.avant,ap=x.apres;if(x.cle!=='materiaux'||!av||!ap||!(av.pu>0)||!(ap.pu>0))return;if(Math.abs(ap.pu-av.pu)/av.pu<0.005)return;
 var a=article(av.libelle);if(!a)return;var r=null,cw=sing((String(a.cond||'').match(/^[^\s(]+/)||[''])[0]),uw=sing(ap.unite||av.unite);
 if(uw&&uw===cw)r=1;else if(uw&&a.pu>0&&uw===sing(a.u))r=a.pc/a.pu;else if(Math.abs(av.pu-a.pc)/a.pc<0.02)r=1;else if(a.pu>0&&Math.abs(av.pu-a.pu)/a.pu<0.02)r=a.pc/a.pu;if(!r)return;
 var pc=Math.round(ap.pu*r*100)/100,old=$('#vsu-ret');if(old)old.remove();
 var d=document.createElement('div');d.id='vsu-ret';d.setAttribute('role','dialog');d.setAttribute('aria-label','Je retiens ce prix ?');
 d.innerHTML='<p><b>Je retiens ce prix pour vos prochains devis ?</b></p><p>'+esc(a.d)+' : '+eur(a.pc)+' → <b>'+eur(pc)+'</b> <small>('+esc(a.cond||'unité')+')</small></p><small>Sinon, il ne sert que pour ce devis.</small><div class="vsu-btns"><button type="button" class="vbtn" data-vsurn>Juste ce devis</button><button type="button" class="vbtn go" data-vsuro>Oui, je retiens</button></div>';
 d._a={code:a.c,prix:pc,d:a.d};document.body.appendChild(d);clearTimeout(d._t);d._t=setTimeout(function(){if(d.parentNode)d.remove()},15000)});

/* ---------- les boutons ---------- */
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-vsuf],[data-vsux],[data-vsurc],[data-vsgg],[data-vsgp],[data-vsgc],[data-vsuq],[data-vsuqc],[data-vsuro],[data-vsurn]');if(!b)return;var P=V();if(!P)return;
 if(b.hasAttribute('data-vsuf')){if(window.PCPROD&&PCPROD.deposer){document.documentElement.classList.add('vsu-dep');PCPROD.deposer(CUR.id)}else P.toast('Pas encore prêt','Ouvrez une fois l\'onglet Produits.')}
 else if(b.hasAttribute('data-vsux')){if(!b.classList.contains('arme')){b.classList.add('arme');b.textContent='Oui, retirer';return}var id=CUR.id;
  P.api('/espace/achats',{method:'POST',body:{contact:id,supprimer:b.getAttribute('data-vsux')}}).then(function(x){if(CUR&&CUR.id===id)rendreAchats(x)},function(e){P.toast('Pas retiré',e.message)})}
 else if(b.hasAttribute('data-vsurc'))P.recalc();
 else if(b.hasAttribute('data-vsgg'))gammes(b);
 else if(b.hasAttribute('data-vsgp')){var g=CUR.G&&CUR.G[+b.getAttribute('data-vsgp')];if(g&&g.pre_devis){P.prendre(g.pre_devis);P.toast('Gamme '+g.nom+' reprise',eur(g.total_ht)+' HT · vous pouvez encore modifier chaque ligne')}}
 else if(b.hasAttribute('data-vsgc'))copier(texteGammes(),'Collez-le dans un SMS ou un e-mail.');
 else if(b.hasAttribute('data-vsuq'))lienQ(b);
 else if(b.hasAttribute('data-vsuqc'))copier(CUR.msg||'','Collez-le dans un SMS ou un e-mail.');
 else if(b.hasAttribute('data-vsurn')){var d=$('#vsu-ret');if(d)d.remove()}
 else if(b.hasAttribute('data-vsuro')){var d2=$('#vsu-ret'),a=d2&&d2._a;if(!a)return;b.disabled=true;
  P.api('/espace/base',{method:'POST',body:{code:a.code,prix:a.prix}}).then(function(){d2.remove();P.toast('Prix retenu','Cliky le prend dès le prochain pré-devis.');baseA(true)},function(e){b.disabled=false;P.toast('Pas enregistré',e.message)})}
});
})();
