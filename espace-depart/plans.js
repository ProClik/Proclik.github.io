/* Menu « Plans » (Cyril, 17/11) : tous les plans dessinés par l'artisan, au même endroit.
   « Nouveau plan » → on dit pour quel client : un client déjà dans l'Espace, un nouveau client, ou « Plus tard »
   quand on n'a pas le temps (le plan est quand même gardé, avec la mention de ce qui manque : le client, l'adresse).
   Le plan s'ouvre vide et débloqué. Pour un vrai client, il est aussi repris par son pré-devis (« Recalculer »).
   Rangé sur cet appareil (clé pc-plans), comme les retouches de plan. */
(function(){
"use strict";
var X=window.PCX;if(!X)return;
var d=document,$=function(s){return d.querySelector(s)},$$=function(s){return [].slice.call(d.querySelectorAll(s))};
var esc=X.esc||function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var K='pc-plans';
function lire(){try{var v=JSON.parse(localStorage.getItem(K)||'[]');return Array.isArray(v)?v:[]}catch(e){return []}}
function ecrire(L){try{localStorage.setItem(K,JSON.stringify(L))}catch(e){X.toast&&X.toast('Plan pas gardé','La mémoire de l\'appareil est pleine.')}majBadge()}
function un(id){return lire().filter(function(p){return p.id===id})[0]}
function garder(p){var L=lire().filter(function(x){return x.id!==p.id});L.unshift(p);ecrire(L.slice(0,200))}
var ICO='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v16H4z"/><path d="M4 12h7v8M11 4v5M15 12h5"/></svg>';
var ICPLUS='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>';

/* les clients de l'Espace : les vrais dans l'Espace réel, ceux de démonstration sinon */
function enVrai(){return d.documentElement.classList.contains('pcvrai')&&window.PCV&&PCV.api}
function clients(){var R=[];
 if(enVrai()){try{(X.cf&&X.cf.vrais?X.cf.vrais():[]).forEach(function(c){if(c.contact)R.push({k:c.contact,n:c.nom||'Client',adr:[c.adresse,[c.cp,c.ville].filter(Boolean).join(' ')].filter(Boolean).join(', '),v:c.ville||'',vrai:1})})}catch(e){}}
 else Object.keys(X.DOS||{}).forEach(function(k){var o=X.DOS[k];if(o&&o.n)R.push({k:k,n:o.n,adr:o.adr&&!/\[/.test(o.adr)?o.adr:(o.v||''),v:o.v||''})});
 return R.sort(function(a,b){return a.n.replace(/^(M\.|Mme)\s+/,'').localeCompare(b.n.replace(/^(M\.|Mme)\s+/,''),'fr')})}
function client(k){return k?clients().filter(function(c){return c.k===k})[0]||null:null}
function dessine(p){return !!(p&&p.plan&&(p.plan.floors||[]).some(function(f){return (f.pieces||[]).length}))}
function manque(p){var c=client(p.cli),M=[];if(!p.cli)M.push('le client');else if(!c||!c.adr)M.push('l\'adresse');if(!dessine(p))M.push('le dessin');return M}
function quand(t){var x=new Date(t);return isNaN(x)?'':x.toLocaleDateString('fr-FR',{day:'numeric',month:'long'})+' à '+x.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}

/* la liste */
function liste(){var L=lire();
 var h='<button type="button" class="btn go pl-new" data-plnew>'+ICPLUS+'<span>Nouveau plan</span></button>'+
  (L.length?'<div class="card lst cf-l">'+L.map(function(p){var c=client(p.cli),M=manque(p);
   return '<button class="cf-li" type="button" data-plo="'+esc(p.id)+'"><span class="cf-av cf-doc">'+ICO+'</span><span class="tx"><b>'+esc(c?c.n:(p.nom||'Plan sans client'))+'</b><small>'+esc([c&&c.v,p.maj?'modifié le '+quand(p.maj):'créé le '+quand(p.cree)].filter(Boolean).join(' · '))+'</small>'+
    (M.length?'<small class="pl-manque">Manque '+esc(M.join(', '))+'</small>':'')+'</span><span class="go">›</span></button>'}).join('')+'</div>':
   '<div class="card cf-rien"><b>Pas encore de plan</b><span>Pendant une visite : « Nouveau plan », vous dites pour quel client (ou plus tard), et vous dessinez.</span></div>')+
  '<p class="hint">Les plans dessinés par vos clients avec leur demande sont dans la demande, bouton « Plan ».</p>';
 X.xopen('Mes plans','Dessinés par vous',h,'',null);}

/* « Pour quel client ? » juste après « Nouveau plan » (ou pour compléter un plan « plus tard ») */
function choisir(id){var C=clients(),filtre='';
 var corps=function(){var F=C.filter(function(c){return !filtre||(c.n+' '+c.v).toLowerCase().indexOf(filtre)>=0});
  return '<div class="cf-form"><label class="pl-q"><span>Chercher</span><input id="pl-q" autocomplete="off" placeholder="Nom ou commune" value="'+esc(filtre)+'"></label></div>'+
   '<button type="button" class="btn pl-nc" data-plnc="'+esc(id||'')+'">'+ICPLUS+'<span>Nouveau client</span></button>'+
   (F.length?'<div class="card lst cf-l pl-cl">'+F.slice(0,40).map(function(c){return '<button class="cf-li" type="button" data-plcli="'+esc(c.k)+'" data-plid="'+esc(id||'')+'"><span class="tx"><b>'+esc(c.n)+'</b><small>'+esc(c.adr||'adresse à compléter')+'</small></span><span class="go">›</span></button>'}).join('')+'</div>':'<p class="hint">'+(filtre?'Personne à ce nom pour l\'instant.':'Pas encore de client dans l\'Espace.')+'</p>')};
 X.xopen('Pour quel client ?','Déjà dans l\'Espace, nouveau, ou plus tard',corps(),
  '<button class="btn" type="button" data-pllater="'+esc(id||'')+'">Plus tard</button>',lier);
 function lier(){var q=$('#pl-q');if(!q)return;q.addEventListener('input',function(){filtre=q.value.trim().toLowerCase();var pos=q.selectionStart;$('#x-in').innerHTML=corps();lier();var n=$('#pl-q');n.focus();try{n.setSelectionRange(pos,pos)}catch(e){}})}}
function pour(id,cli){var p=id&&un(id);if(!p){p={id:'pl'+Date.now().toString(36),cree:Date.now(),plan:null};}
 p.cli=cli||null;var c=client(cli);if(c)p.nom=c.n;garder(p);if(c&&c.vrai&&p.plan)versPreDevis(p);ouvrirPlan(p.id)}

/* le plan lui-même */
var COUR=null;
function ouvrirPlan(id){var p=un(id);if(!p)return;COUR=id;var c=client(p.cli),M=manque(p).filter(function(x){return x!=='le dessin'});
 X.xopen('📐 '+(c?c.n:'Plan sans client'),M.length?'Manque '+M.join(', ')+' : vous pourrez compléter plus tard':(c&&c.adr)||'',
  '<iframe id="pl-frame" title="Plan" allow="microphone" style="display:block;width:100%;height:calc(100vh - 210px);min-height:420px;border:0;border-radius:14px;background:var(--card)" src="plan.html?embed=1&attendre=1&v=60&chantier='+encodeURIComponent(p.id)+'"></iframe>',
  '<button class="btn" type="button" data-pllist>← Mes plans</button>'+(p.cli?'':'<button class="btn go" type="button" data-plcomp="'+esc(p.id)+'">Choisir le client</button>'),null);}
addEventListener('message',function(e){var f=d.getElementById('pl-frame');if(!f||e.source!==f.contentWindow||!COUR)return;var m=e.data||{},p=un(COUR);if(!p)return;
 if(m.type==='proclik-plan-ready'){var c=client(p.cli);f.contentWindow.postMessage({type:'proclik-plan-load',plan:p.plan||null,nouveau:true,prenom:''},'*')}
 if(m.type==='proclik-plan-modifie'&&m.plan){p.plan=m.plan;p.maj=Date.now();garder(p);versPreDevis(p)}});
/* vrai client : le pré-devis de sa demande reprend ce plan au prochain « Recalculer » (même clé que vrai.js) */
function versPreDevis(p){var c=client(p.cli);if(!c||!c.vrai||!p.plan)return;try{localStorage.setItem('pc-planmod-'+c.k,JSON.stringify({t:Date.now(),plan:p.plan}))}catch(e){}}

/* nouveau client : le même formulaire que l'onglet Clients, puis retour au plan */
function nouveauClient(id){if(!(X.cf&&X.cf.nouveauClient)){X.toast('Ajoutez le client dans Clients','Puis revenez choisir son nom ici.');return}
 X.cf.nouveauClient(function(k){if(k){if(X.cf.chargerVrais)X.cf.chargerVrais();setTimeout(function(){pour(id,k)},50)}else choisir(id)})}

d.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-plnew],[data-plo],[data-plcli],[data-plnc],[data-pllater],[data-pllist],[data-plcomp]');if(!b)return;e.preventDefault();
 var a=function(n){return b.getAttribute(n)};
 if(b.hasAttribute('data-plnew'))choisir('');
 else if(b.hasAttribute('data-plo'))ouvrirPlan(a('data-plo'));
 else if(b.hasAttribute('data-plcli'))pour(a('data-plid'),a('data-plcli'));
 else if(b.hasAttribute('data-plnc'))nouveauClient(a('data-plnc'));
 else if(b.hasAttribute('data-pllater')){pour(a('data-pllater'),null);X.toast&&X.toast('Plan gardé sans client','Il est dans Mes plans, avec la mention « Manque le client ».')}
 else if(b.hasAttribute('data-pllist'))liste();
 else if(b.hasAttribute('data-plcomp'))choisir(a('data-plcomp'));});

/* l'entrée du menu (comme les autres : barre du bas, panneau du galet, menu de côté), avec une pastille quand un plan est à compléter */
function entree(){var nav=$('nav.nav');if(!nav||$('#nb-plans'))return;var b=d.createElement('button');b.type='button';b.id='nb-plans';b.setAttribute('data-pbx','');
 b.innerHTML='<span class="ico" aria-hidden="true">'+ICO+'</span>Plans<span class="badge" hidden></span>';b.addEventListener('click',function(){liste()});nav.appendChild(b);
 majBadge();if(window.PCBarre&&PCBarre.applique)PCBarre.applique()}
function majBadge(){var g=$('#nb-plans .badge');if(!g)return;var n=lire().filter(function(p){return !p.cli}).length;g.textContent=n;g.hidden=!n}
var css=d.createElement('style');css.textContent='.pl-new{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;margin:0 0 14px}.pl-new svg,.pl-nc svg{width:20px;height:20px}.pl-nc{display:flex;align-items:center;gap:8px;width:100%;margin:10px 0}.pl-q{display:grid;gap:6px}.pl-q span{font-weight:700;font-size:14px}.pl-q input{width:100%}.pl-manque{display:inline-block;margin-top:3px;color:var(--n1-laiton,#A8823F)!important;font-weight:700}';
d.head.appendChild(css);
entree();
/* depuis un chantier : le plan de ce client (le sien s'il existe, sinon une copie du plan de sa demande à retoucher) */
function ouvrirPour(k,planDepart){var L=lire().filter(function(p){return p.cli===k});var p=L[0];
 if(!p){p={id:'pl'+Date.now().toString(36),cree:Date.now(),cli:k,plan:planDepart||null};var c=client(k);if(c)p.nom=c.n;garder(p)}
 else if(!p.plan&&planDepart){p.plan=planDepart;garder(p)}
 ouvrirPlan(p.id)}
window.PCPLANS={liste:liste,nouveau:function(){choisir('')},ouvrirPour:ouvrirPour};
})();
