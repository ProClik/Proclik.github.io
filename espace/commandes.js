/* Commandes fournisseur (demande de Cyril, 31/10) : dans Achats, à côté des demandes de prix et de « Mes prix ».
   Ce qui reste « à prévoir » dans les fournitures d'un chantier devient une commande en un appui :
   on coche, on choisit le fournisseur et la livraison, puis « Envoyer la commande » en deux appuis.
   Aussi depuis la fiche du chantier (bouton « Commander »). Démo : rien n'est envoyé. */
(function(){
"use strict";
var X=window.PCX;if(!X||!X.SUP)return;
var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
var esc=X.esc,CH=X.CH,SUP=X.SUP;
var I=function(p){return '<svg viewBox="0 0 24 24" aria-hidden="true">'+p+'</svg>'};
var IC={cmd:I('<path d="M3 7h11v9H3z"/><path d="M14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/>'),
 env:I('<path d="M3 11l18-8-8 18-2-8z"/><path d="M11 13l10-10"/>'),plus:I('<path d="M12 5v14M5 12h14"/>')};
var CMD0=[{id:'C-0012',sup:'pd',ch:'alpes',d:'jeu. 15/10',st:'livree',liv:'Sur le chantier',L:[['Plaques BA13 · 1,20 × 2,50 m','12 u'],['Fourrures F530 · 3,00 m','26 u']]},
 {id:'C-0013',sup:'nim',ch:'lopez',d:'mer. 28/10',st:'conf',liv:'Au dépôt',quand:'jeu. 5/11',L:[['Plaques BA13 hydro','8 u'],['Rail R48','4 u']]}];
var CMD=X.lsGet('pc-cmd1',null)||CMD0;
function save(){X.lsSet('pc-cmd1',CMD)}
var ST={envoyee:['Envoyée','todo'],conf:['Confirmée','warn'],livree:['Livrée','ok']};
/* Ce qui reste à commander, chantier par chantier */
function aPrevoir(k){var c=CH[k];return ((c.four||[]).concat(c.extra||[])).filter(function(x){return x[2]==='à prévoir'})}
function chantiersA(){return Object.keys(CH).filter(function(k){return CH[k].st!=='done'&&aPrevoir(k).length})}

function vue(){var z=$('#a-cmd');if(!z)return;var K=chantiersA();
 var h='<div class="cf"><div class="grid2"><div class="col">'+
  '<button class="btn go cf-go" type="button" data-cmdnew="'+(K[0]||'')+'"><span class="lab"><span class="ic">'+IC.cmd+'</span><span>Nouvelle commande</span></span></button>'+
  (K.length?'<div class="sec-h"><h2>À commander</h2><span>pris dans vos chantiers</span></div><div class="card lst cf-l">'+K.map(function(k){var n=aPrevoir(k).length;return '<button class="cf-li" type="button" data-cmdnew="'+k+'"><span class="cf-av cf-doc">'+IC.plus+'</span><span class="tx"><b>'+esc(CH[k].n)+'</b><small>'+n+' article'+(n>1?'s':'')+' à prévoir</small></span><span class="go">›</span></button>'}).join('')+'</div>':'<div class="card cf-rien"><b>Rien à commander</b><span>Ce que vous ajoutez aux fournitures d\'un chantier arrive ici.</span></div>')+
  '</div><div class="col"><div class="sec-h"><h2>Vos commandes</h2><span>de la plus récente</span></div><div class="card lst cf-l">'+CMD.map(function(c){var s=ST[c.st];return '<button class="cf-li" type="button" data-cmd="'+c.id+'"><span class="cf-av cf-doc">'+IC.cmd+'</span><span class="tx"><b>'+esc(SUP[c.sup].n)+'</b><small>'+esc(CH[c.ch]?CH[c.ch].n:'')+' · '+esc(c.d)+(c.quand?' · livraison '+esc(c.quand):'')+'</small></span><span class="cf-m"><span class="pill '+s[1]+'">'+s[0]+'</span></span></button>'}).join('')+'</div>'+
  '<p class="hint">Les confirmations et bons de livraison du fournisseur se rangent tout seuls avec la commande.</p><span class="exemple">Exemples de démonstration · rien n\'est envoyé</span></div></div></div>';
 z.innerHTML=h;}

/* Préparer une commande : cocher, choisir le fournisseur, la livraison, puis deux appuis */
var F=null;
function form(k){var K=Object.keys(CH).filter(function(x){return CH[x].st!=='done'});k=k||chantiersA()[0]||K[0];
 F={ch:k,sup:F&&F.sup||'pd',liv:'Sur le chantier',arme:0,plus:[]};rendre();}
function rendre(){var L=aPrevoir(F.ch);
 var h='<div class="cf-form"><label>Pour quel chantier<select id="cm-ch">'+Object.keys(CH).filter(function(x){return CH[x].st!=='done'}).map(function(x){return '<option value="'+x+'"'+(x===F.ch?' selected':'')+'>'+esc(CH[x].n)+'</option>'}).join('')+'</select></label>'+
  '<div><b style="font-size:13.5px">Les articles</b><div class="card lst cf-l" style="margin-top:6px">'+(L.length||F.plus.length?L.map(function(x,i){return '<label class="cm-it"><input type="checkbox" data-cmi="'+i+'" checked><span class="tx"><b>'+esc(x[0])+'</b><small>'+esc(x[1])+'</small></span></label>'}).join('')+F.plus.map(function(x){return '<label class="cm-it"><input type="checkbox" checked disabled><span class="tx"><b>'+esc(x[0])+'</b><small>'+esc(x[1])+' · ajouté</small></span></label>'}).join(''):'<p class="hint" style="padding:10px 0">Rien à prévoir sur ce chantier : ajoutez un article ci-dessous.</p>')+'</div></div>'+
  '<div class="cm-add"><input id="cm-a" autocomplete="off" placeholder="Ajouter un article"><input id="cm-q" autocomplete="off" placeholder="Qté" class="cm-q"><button type="button" class="btn sm" data-cmadd aria-label="Ajouter">'+IC.plus+'</button></div>'+
  '<label>Chez quel fournisseur<select id="cm-s">'+Object.keys(SUP).map(function(s){return '<option value="'+s+'"'+(s===F.sup?' selected':'')+'>'+esc(SUP[s].n)+'</option>'}).join('')+'</select></label>'+
  '<div class="cf-tva"><span>Livraison</span><div class="seg" role="tablist">'+['Sur le chantier','Au dépôt'].map(function(t){return '<button type="button" role="tab" data-cmliv="'+t+'" aria-selected="'+(t===F.liv)+'">'+t+'</button>'}).join('')+'</div></div>'+
  '<p class="hint">Le fournisseur reçoit la commande par e-mail, depuis votre adresse, sans vos prix de vente.</p></div>';
 X.xopen('Commande fournisseur',CH[F.ch]?CH[F.ch].n:'',h,pied(),function(){$('#cm-ch').addEventListener('change',function(){F.ch=this.value;F.plus=[];rendre()});$('#cm-s').addEventListener('change',function(){F.sup=this.value;F.arme=0;$('#x-foot').innerHTML=pied()})});}
function pied(){return F.arme?'<button class="btn" data-cmarm="0">Annuler</button><button class="btn go dv-arm" data-cmgo>Oui, envoyer</button>':'<button class="btn" data-xclose>Fermer</button><button class="btn go" data-cmarm="1">Envoyer la commande</button>'}
function envoyer(){var L=aPrevoir(F.ch),coche=$$('[data-cmi]').filter(function(b){return b.checked}).map(function(b){return L[+b.dataset.cmi]}),art=coche.map(function(x){return [x[0],x[1]]}).concat(F.plus);
 if(!art.length){F.arme=0;$('#x-foot').innerHTML=pied();X.toast('Rien à commander','Cochez au moins un article.');return}
 coche.forEach(function(x){x[2]='commandé'});X.saveCH();
 var id='C-'+String(14+CMD.filter(function(c){return !/^C-001[23]$/.test(c.id)}).length).padStart(4,'0');
 CMD.unshift({id:id,sup:F.sup,ch:F.ch,d:'aujourd\'hui',st:'envoyee',liv:F.liv,L:art});save();X.xclose();vue();
 X.toast('Commande envoyée à '+SUP[F.sup].n,'Démo : rien n\'est parti. '+art.length+' article'+(art.length>1?'s':'')+', livraison '+F.liv.toLowerCase()+'.');}
function fiche(id){var c=CMD.filter(function(x){return x.id===id})[0];if(!c)return;var s=ST[c.st];
 X.xopen('Commande '+c.id,SUP[c.sup].n+' · '+s[0].toLowerCase(),'<div class="card"><div class="kv"><span>Chantier</span><b>'+esc(CH[c.ch]?CH[c.ch].n:'')+'</b><span>Envoyée</span><b>'+esc(c.d)+'</b><span>Livraison</span><b>'+esc(c.liv)+(c.quand?' · '+esc(c.quand):'')+'</b></div></div>'+
  '<div class="xsec"><h3>Les articles</h3><div class="card lst cf-l">'+c.L.map(function(x){return '<div class="cf-li"><span class="tx"><b>'+esc(x[0])+'</b></span><span class="cf-m"><b>'+esc(x[1])+'</b></span></div>'}).join('')+'</div></div>',
  c.st==='livree'?'<button class="btn" data-xclose>Fermer</button>':'<button class="btn" data-xclose>Fermer</button><button class="btn go" data-cmliv2="'+c.id+'">Marquer livrée</button>');}

/* Achats : un troisième choix « Commandes », et son panneau */
(function(){var seg=$('#achseg'),four=$('#a-four');if(!seg||!four||$('#a-cmd'))return;
 seg.insertAdjacentHTML('beforeend','<button role="tab" data-a="cmd" aria-selected="false">Commandes</button>');
 var p=document.createElement('div');p.id='a-cmd';p.className='pv2';p.hidden=true;four.parentNode.appendChild(p);
 seg.lastElementChild.addEventListener('click',function(){$$('#v-prix .pv2').forEach(function(x){x.hidden=x.id!=='a-cmd'});$$('#achseg button').forEach(function(b){b.setAttribute('aria-selected',String(b.dataset.a==='cmd'))});vue()});
 vue();})();
/* Fiche du chantier : « Commander » sous les fournitures */
var chx=$('#chx');if(chx)new MutationObserver(function(){var f=$('#ch-four'),k=X.curCh&&X.curCh();if(!f||!k||f.querySelector('[data-cmnew2]')||!CH[k]||CH[k].st==='done')return;
 f.insertAdjacentHTML('beforeend','<button type="button" class="btn sm cm-ch" data-cmnew2="'+k+'">'+IC.cmd+'Commander les fournitures</button>')}).observe(chx,{childList:true,subtree:true});

document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-cmdnew],[data-cmnew2],[data-cmd],[data-cmadd],[data-cmliv],[data-cmarm],[data-cmgo],[data-cmliv2]');if(!b)return;var a=function(n){return b.getAttribute(n)};
 if(b.hasAttribute('data-cmdnew'))form(a('data-cmdnew'));
 else if(b.hasAttribute('data-cmnew2'))form(a('data-cmnew2'));
 else if(b.hasAttribute('data-cmd'))fiche(a('data-cmd'));
 else if(b.hasAttribute('data-cmadd')){var t=$('#cm-a').value.trim();if(!t){$('#cm-a').focus();return}F.plus.push([t,$('#cm-q').value.trim()||'1 u']);rendre();}
 else if(b.hasAttribute('data-cmliv')){F.liv=a('data-cmliv');$$('[data-cmliv]').forEach(function(x){x.setAttribute('aria-selected',String(x===b))});}
 else if(b.hasAttribute('data-cmarm')){F.arme=a('data-cmarm')==='1';$('#x-foot').innerHTML=pied();}
 else if(b.hasAttribute('data-cmgo'))envoyer();
 else if(b.hasAttribute('data-cmliv2')){var c=CMD.filter(function(x){return x.id===a('data-cmliv2')})[0];if(c){c.st='livree';save();}X.xclose();vue();X.toast('Commande livrée','Le bon de livraison se range avec le chantier.');}
});
})();
