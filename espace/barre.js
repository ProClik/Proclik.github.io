/* Menu du bas sur téléphone (demande de Cyril, 31/10) : barre en relief avec une encoche au centre.
   À gauche Accueil puis Clients, à droite Planning puis Devis. Le gros galet du milieu ouvre le menu :
   l'encoche se bombe, le galet monte, le micro sort au centre et le reste de l'Espace s'ouvre en éventail.
   Les boutons de la barre appuient sur les vrais onglets (#nb-…) : tout le fonctionnement existant est gardé.
   Tablette et ordinateur : rien ne change (menu sur le côté). */
(function(){
  "use strict";
  var d=document,$=function(s,r){return (r||d).querySelector(s)},$$=function(s,r){return [].slice.call((r||d).querySelectorAll(s))};
  /* Même menu dans tous les Espaces (Cyril, 15/11 : « la marque de fabrique de ProClik ») : BRS garde ses valeurs,
     les autres Espaces (démos RT2O, ERAL…) donnent leurs onglets par window.PC_MENU avant de charger ce fichier :
     tous (liste ou fonction), defaut (4 de la barre), familles (titres du panneau), cle (préfixe des réglages, false = aucun),
     reglages (true/false/fonction), micro() et ouvreReglages() (sinon : boutons #speak et #menu de la page). */
  var C=window.PC_MENU||{};
  function val(x){return typeof x==="function"?x():x}
  if($("#pb")||!$("nav.nav [id^='nb-']"))return;
  var mq=matchMedia("(max-width:899px)"),reduit=matchMedia("(prefers-reduced-motion: reduce)");
  /* disposition choisie dans les Réglages (2/11) : 4 boutons dans la barre, le reste dans l'éventail */
  function tous0(){var t=val(C.tous)||["accueil","clients","devis","factures","planning","chantiers","depenses","prix","produits","cotes","reseaux"];return t.concat(["reglages"])}
  var TOUS0=tous0();
  /* un onglet caché (ex. Réseaux sans l'option, Cyril 15/11) ne va ni dans la barre ni dans l'éventail */
  function dispo(v){if(v==="reglages")return C.reglages===undefined?true:!!val(C.reglages);var b=$("#nb-"+v);return !!b&&!b.hidden}
  var TOUS=TOUS0.filter(dispo);
  function defaut(){return (val(C.defaut)||["accueil","clients","planning","devis"]).filter(dispo).slice(0,4)}
  var DEFAUT=defaut();
  function lit(k,d){if(C.cle===false)return d;k=(C.cle||"")+k;try{var v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(_){return d}}
  function choisis(){
    var b=lit("pc-barre",null);
    if(!b||b.length!==Math.min(4,TOUS.filter(function(v){return v!=="reglages"}).length)||b.some(function(v){return TOUS.indexOf(v)<0||v==="reglages"||(v!=="reglages"&&!$("#nb-"+v))})||b.some(function(v,i){return b.indexOf(v)!==i}))b=defaut();
    return b;
  }
  /* menu de côté (iPad, ordinateur) : son propre choix, 1 à 6 boutons, sans toucher à celui du téléphone (Cyril, 15/11) */
  var COTE_MAX=6;
  function choisisCote(){
    var b=lit("pc-cote",null);
    if(!b||!b.length||b.length>COTE_MAX||b.some(function(v){return TOUS.indexOf(v)<0||v==="reglages"||!$("#nb-"+v)})||b.some(function(v,i){return b.indexOf(v)!==i}))b=defaut();
    return b;
  }
  var large=matchMedia("(min-width:900px)");
  function horsPanneau(){return large.matches?COTE:BAS}
  function calcule(){EVENTAIL=TOUS.filter(function(v){return horsPanneau().indexOf(v)<0})}
  var BAS=choisis(),COTE=choisisCote(),EVENTAIL;calcule();
  var STYLE="encoche";
  /* côtés (Cyril, 2/11) : bord du haut droit avec petits arrondis, bas arrondi comme les coins de l'écran du téléphone */
  var COINS=lit("pc-barre-coins","telephone")==="pilule"?"pilule":"telephone",RH=8,RB=42;
  var ICO_REGL='<svg viewBox="0 0 24 24"><path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/></svg>';
  var ICO_MIC='<svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>';
  function info(v){
    if(v==="reglages")return {ico:ICO_REGL,nom:"Réglages"};
    var b=$("#nb-"+v);if(!b)return null;
    var ico=$(".ico",b),nom="";
    [].forEach.call(b.childNodes,function(n){if(n.nodeType===3)nom+=n.nodeValue});
    return {ico:ico?ico.innerHTML:"",nom:nom.trim()||v};
  }
  function bouton(v,cls){
    var i=info(v);if(!i)return "";
    return '<button type="button" class="'+cls+'" data-pb="'+v+'"><span class="pb-g" aria-hidden="true">'+i.ico+'</span><span class="pb-n">'+i.nom+'</span>'+
      ($("#nb-"+v+" .badge")?'<span class="badge pb-b" data-src="#nb-'+v+' .badge" hidden></span>':"")+'</button>';
  }

  /* ---------- construction ---------- */
  var pb=d.createElement("div");pb.className="pb"+(STYLE==="ronde"?" pb-ronde":"");pb.id="pb";
  /* ombre de la barre dessinée DANS le svg (filtre SVG à grande zone) : le filtre CSS drop-shadow sur un svg
     laissait un rectangle autour du galet central sur iPhone (Cyril, 3/11) */
  pb.innerHTML='<svg class="pb-fond" aria-hidden="true"><defs><filter id="pb-ombre" filterUnits="userSpaceOnUse" x="-40" y="-60" width="2000" height="400" color-interpolation-filters="sRGB">'+
    '<feGaussianBlur in="SourceAlpha" stdDeviation="3.5"/><feOffset dy="-2" result="o1"/><feFlood class="pb-of"/><feComposite in2="o1" operator="in" result="s1"/>'+
    '<feGaussianBlur in="SourceAlpha" stdDeviation="5"/><feOffset dx="4" dy="6" result="o2"/><feFlood class="pb-of"/><feComposite in2="o2" operator="in" result="s2"/>'+
    '<feMerge><feMergeNode in="s1"/><feMergeNode in="s2"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><path filter="url(#pb-ombre)"/></svg>'+
    '<nav class="pb-l" aria-label="Menu principal"></nav>'+
    '<button type="button" class="pb-c" id="pb-c" aria-expanded="false" aria-controls="pb-menu" aria-label="Ouvrir le menu">'+
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="l1" d="M5 7h14"/><path class="l2" d="M5 12h14"/><path class="l3" d="M5 17h14"/></svg>'+
      '<span class="badge pb-bc" hidden></span></button>';
  var scrim=d.createElement("div");scrim.className="pb-scrim";scrim.id="pb-scrim";
  var menu=d.createElement("div");menu.className="pb-menu pan-c";menu.id="pb-menu";menu.setAttribute("aria-hidden","true");
  /* le panneau range ses bulles par famille, avec un petit titre (Cyril, 15/11) ; une famille vide ne s'affiche pas */
  var FAMILLES=val(C.familles)||[
    {t:"Devis et factures",v:["devis","factures"]},
    {t:"Chantiers",v:["chantiers","planning","cotes"]},
    {t:"Achats",v:["prix","produits","depenses"]},
    {t:"Et aussi",v:["accueil","clients","reseaux","reglages"]}
  ];
  var GROUPES=[];
  function range(){
    GROUPES=FAMILLES.map(function(f){return {t:f.t,v:f.v.filter(function(v){return EVENTAIL.indexOf(v)>=0})}}).filter(function(g){return g.v.length});
    var vus=[].concat.apply([],GROUPES.map(function(g){return g.v})),reste=EVENTAIL.filter(function(v){return vus.indexOf(v)<0});
    if(reste.length){var a=GROUPES.filter(function(g){return g.t==="Et aussi"})[0];if(a)a.v=a.v.concat(reste);else GROUPES.push({t:"Et aussi",v:reste})}
  }
  function remplit(){
    $(".pb-l",pb).innerHTML=bouton(BAS[0],"pb-i")+bouton(BAS[1],"pb-i")+'<span class="pb-trou"></span>'+bouton(BAS[2],"pb-i")+bouton(BAS[3],"pb-i");
    range();var i=0,h="";
    GROUPES.forEach(function(g,k){
      h+='<span class="pb-gt" aria-hidden="true" style="--i:'+i+'">'+g.t+'</span>';
      g.v.forEach(function(v){h+=bouton(v,"pb-e").replace('class="pb-e"','class="pb-e" tabindex="-1" style="--i:'+(i++)+'"')});
    });
    menu.innerHTML='<button type="button" class="pb-mic" data-pb="micro" aria-label="Parler à ProClik (dictée)" tabindex="-1"><span class="pb-g" aria-hidden="true">'+ICO_MIC+'</span></button>'+
      h+'<div class="pb-pan" aria-hidden="true"></div>';
  }
  remplit();
  d.body.appendChild(scrim);d.body.appendChild(menu);d.body.appendChild(pb);
  var path=$(".pb-fond path",pb),svg=$(".pb-fond",pb),centre=$("#pb-c");

  /* ---------- forme de la barre : encoche (t=0) qui se bombe (t=1) ---------- */
  var H=68,R=34,W=0,t=0,anim=0;
  function forme(t){
    var c=W/2,s=1-2.2*t,y=function(v){return (v*s).toFixed(2)};
    return debut()+" L"+(c-55)+",0 C"+(c-43)+",0 "+(c-37)+","+y(4)+" "+(c-35)+","+y(14)+
      " C"+(c-29.9)+","+y(28.9)+" "+(c-15.8)+","+y(39)+" "+c+","+y(39)+
      " C"+(c+15.8)+","+y(39)+" "+(c+29.9)+","+y(28.9)+" "+(c+35)+","+y(14)+
      " C"+(c+37)+","+y(4)+" "+(c+43)+",0 "+(c+55)+",0"+
      cotes();
  }
  function debut(){return COINS==="pilule"?"M"+R+",0":"M"+RH+",0"}
  function cotes(){
    if(COINS==="pilule")return " L"+(W-R)+",0 A"+R+" "+R+" 0 0 1 "+(W-R)+","+H+" L"+R+","+H+" A"+R+" "+R+" 0 0 1 "+R+",0 Z";
    return " L"+(W-RH)+",0 A"+RH+" "+RH+" 0 0 1 "+W+","+RH+" L"+W+","+(H-RB)+" A"+RB+" "+RB+" 0 0 1 "+(W-RB)+","+H+
      " L"+RB+","+H+" A"+RB+" "+RB+" 0 0 1 0,"+(H-RB)+" L0,"+RH+" A"+RH+" "+RH+" 0 0 1 "+RH+",0 Z";
  }
  /* variante « ronde » (test du 2/11, image de Cyril) : le galet est posé DANS une encoche ronde, avec un anneau de vide autour */
  var RON=null,EC={cy:10,r:40,f:20}; /* galet centré 10 px sous le bord, anneau de vide de 8 px, arrondis larges comme l'image */
  function ronde(t){
    var c=W/2,s=1-2.2*t;
    if(!RON){RON=[];var i,a,cy=EC.cy,r=EC.r,f=EC.f,dd=r+f,dx=Math.sqrt(dd*dd-(f-cy)*(f-cy)),a0=Math.atan2(cy-f,dx);
      var tx=dx-f*dx/dd,ty=f+f*(cy-f)/dd,A0=Math.atan2(ty-cy,-tx),A1=Math.atan2(ty-cy,tx);if(A0<0)A0+=2*Math.PI;
      for(i=0;i<=10;i++){a=-Math.PI/2+(Math.PI/2+a0)*i/10;RON.push([-dx+f*Math.cos(a),f+f*Math.sin(a)])}
      for(i=1;i<48;i++){a=A0-(A0-A1)*i/48;RON.push([r*Math.cos(a),cy+r*Math.sin(a)])}
      for(i=10;i>=0;i--){a=-Math.PI/2-(Math.PI/2+a0)*i/10;RON.push([dx+f*Math.cos(a),f+f*Math.sin(a)])}
    }
    return "M"+R+",0 "+RON.map(function(q){return "L"+(c+q[0]).toFixed(2)+","+(q[1]*s).toFixed(2)}).join(" ")+
      " L"+(W-R)+",0 A"+R+" "+R+" 0 0 1 "+(W-R)+","+H+" L"+R+","+H+" A"+R+" "+R+" 0 0 1 "+R+",0 Z";
  }
  function dessine(){path.setAttribute("d",STYLE==="ronde"?ronde(t):forme(t))}
  function mesure(){
    W=pb.getBoundingClientRect().width;
    if(W){svg.setAttribute("width",W);svg.setAttribute("height",H);svg.setAttribute("viewBox","0 0 "+W+" "+H);dessine()}
    /* menu du galet = PANNEAU (choix de Cyril, 15/11) : les bulles rangées dans une carte en relief au-dessus du micro,
       4 par ligne, une ligne de plus si l'artisan a plus d'options. L'ancien éventail en arc se chevauchait à partir de 8 boutons. */
    var bs=$$(".pb-e",menu),ts=$$(".pb-gt",menu),P=panneau(GROUPES);
    /* rien d'autre à ranger (ex. démo, accès client) : le galet n'ouvre que le micro, sans carte vide */
    menu.classList.toggle("pb-vide",!bs.length);
    bs.forEach(function(b,i){
      b.style.setProperty("--x",P[i][0].toFixed(1)+"px");
      b.style.setProperty("--y",P[i][1].toFixed(1)+"px");
    });
    ts.forEach(function(t,k){var q=P.titres[k];if(!q)return;t.style.setProperty("--x",q[0].toFixed(1)+"px");t.style.setProperty("--y",q[1].toFixed(1)+"px")});
    $$(".pb-tr,.pb-fc",menu).forEach(function(x){x.remove()});
    (P.cartes||[]).forEach(function(r){var e=d.createElement("i");e.className="pb-fc";e.setAttribute("aria-hidden","true");
      e.style.cssText="left:"+r[0].toFixed(1)+"px;top:"+r[1].toFixed(1)+"px;width:"+(r[2]-r[0]).toFixed(1)+"px;height:"+(r[3]-r[1]).toFixed(1)+"px";menu.appendChild(e)});
    P.traits.forEach(function(x){var e=d.createElement("i");e.className="pb-tr";e.setAttribute("aria-hidden","true");
      e.style.cssText="left:"+x.toFixed(1)+"px;top:"+(P.haut[0]+4).toFixed(1)+"px;height:"+(P.haut[1]-P.haut[0]-8).toFixed(1)+"px";menu.appendChild(e)});
    var pan=$(".pb-pan",menu),q=P.pan;
    if(pan)pan.style.cssText="left:"+q[0]+"px;top:"+q[1]+"px;width:"+(q[2]-q[0])+"px;height:"+(q[3]-q[1])+"px";
  }
  /* bulle 46 px (centre = x,y), nom dessous ; le micro (58 px + son anneau) est centré 68 px au-dessus du galet */
  var GR=23,LH=15;
  /* une COLONNE par famille (Cyril, 15/11 : « sur la hauteur ») : le titre en haut, ses bulles les unes sous les autres ;
     un fin trait sépare les colonnes. Plus de 4 bulles dans une famille : deuxième colonne pour la suite. */
  var DERNIER=null;
  function panneau(G){
    var lim=innerWidth/2-8,per=4,cols=[];
    G.forEach(function(g,k){for(var i=0;i<g.v.length;i+=per)cols.push({k:k,n:Math.min(per,g.v.length-i),t:i===0})});
    var nc=Math.max(1,cols.length),lw=Math.min(96,(2*lim-24)/nc),rh=GR*2+5+LH+14,TH=40,
      rows=Math.max.apply(null,cols.map(function(c){return c.n}).concat([1])),
      bas=-104-8-14,h=TH+rows*rh,x0=-(nc*lw)/2,y0=bas-10-h,P=[],T=[],S=[];
    cols.forEach(function(c,ci){
      var cx=x0+(ci+.5)*lw;
      if(c.t)T.push([cx,y0]);
      if(ci>0&&cols[ci-1].k!==c.k)S.push(x0+ci*lw);
      for(var r=0;r<c.n;r++)P.push([cx,y0+TH+r*rh+GR+4]);
    });
    P.titres=T;P.traits=[];P.haut=[y0,y0+h];P.pan=[x0-8,y0-14,x0+nc*lw+8,bas+6];
    /* style « bandes teintées » choisi par Cyril (15/11) : chaque famille posée sur une bande de fond teinté */
    {var C=[];cols.forEach(function(c,ci){var l=x0+ci*lw+3,r=x0+(ci+1)*lw-3;
      if(c.t)C.push([l,y0-8,r,y0+h-2]);else C[C.length-1][2]=r});P.cartes=C}
    DERNIER=P;return P;
  }
  function vers(cible,duree){
    cancelAnimationFrame(anim);
    if(reduit.matches||!duree){t=cible;dessine();return}
    var t0=t,debut=performance.now();
    (function pas(now){
      var k=Math.min(1,(now-debut)/duree),e=cible>t0?1-Math.pow(1-k,4):k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
      t=t0+(cible-t0)*e;dessine();if(k<1)anim=requestAnimationFrame(pas);
    })(performance.now());
  }

  /* ---------- ouvrir / fermer ---------- */
  var ouvert=false;
  function ouvre(){
    if(ouvert)return;ouvert=true;
    d.documentElement.classList.add("pb-ouvert");centre.setAttribute("aria-expanded","true");centre.setAttribute("aria-label","Fermer le menu");
    menu.setAttribute("aria-hidden","false");$$("button",menu).forEach(function(b){b.tabIndex=0});
    vers(1,520);try{if(navigator.vibrate)navigator.vibrate(10)}catch(_){}
  }
  function ferme(){
    if(!ouvert)return;ouvert=false;
    d.documentElement.classList.remove("pb-ouvert");centre.setAttribute("aria-expanded","false");centre.setAttribute("aria-label","Ouvrir le menu");
    menu.setAttribute("aria-hidden","true");$$("button",menu).forEach(function(b){b.tabIndex=-1});
    vers(0,380);
  }
  centre.addEventListener("click",function(){ouvert?ferme():ouvre()});
  scrim.addEventListener("click",ferme);
  d.addEventListener("keydown",function(e){if(e.key==="Escape"&&ouvert){ferme();centre.focus()}});
  function agit(v){
    if(v==="micro"){if(C.micro)return C.micro();var m=$("#speak");if(m)m.click();return}
    if(v==="reglages"){if(C.ouvreReglages)return C.ouvreReglages();var r=$("#menu");if(r)r.click();return}
    var b=$("#nb-"+v);if(b)b.click();
  }
  pb.addEventListener("click",function(e){var b=e.target.closest("[data-pb]");if(!b)return;ferme();agit(b.dataset.pb)});
  menu.addEventListener("click",function(e){var b=e.target.closest("[data-pb]");if(!b)return;ferme();setTimeout(function(){agit(b.dataset.pb)},b.dataset.pb==="micro"?0:180)});

  /* ---------- onglet en cours et pastilles, recopiés des vrais boutons ---------- */
  function suit(){
    var cur=($("nav.nav [aria-selected=true]")||{dataset:{}}).dataset.v;
    $$("[data-pb]").forEach(function(b){var on=b.dataset.pb===cur;b.classList.toggle("on",on);if(on)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current")});
    centre.classList.toggle("on",EVENTAIL.indexOf(cur)>=0);
    var tot=0;
    $$(".pb-b").forEach(function(x){var s=$(x.dataset.src),n=s&&!s.hidden?+(s.textContent||0)||0:0;x.textContent=n;x.hidden=!n;if(x.closest(".pb-menu"))tot+=n});
    var bc=$(".pb-bc",pb);bc.textContent=tot;bc.hidden=!tot;
  }
  var nav=$("nav.nav");
  if(nav)new MutationObserver(suit).observe(nav,{subtree:true,attributes:true,attributeFilter:["aria-selected","hidden"],childList:true,characterData:true});
  suit();

  /* iPad (fenêtres, Split View) : la largeur change sans toujours prévenir, on remesure dès que la barre change de taille */
  function remesure(){mesure();requestAnimationFrame(mesure);setTimeout(mesure,250)}
  mesure();addEventListener("resize",remesure);addEventListener("orientationchange",remesure);
  if(window.visualViewport)visualViewport.addEventListener("resize",remesure);
  if(window.ResizeObserver)new ResizeObserver(function(){mesure()}).observe(pb);
  if(mq.addEventListener)mq.addEventListener("change",function(){ferme();calcule();remplit();suit();mesure()});
  if(d.fonts&&d.fonts.ready)d.fonts.ready.then(mesure);

  /* ---------- pour les Réglages (reglages.js) : changer la disposition ou le style sans recharger ---------- */
  window.PCBarre={
    TOUS:TOUS,DEFAUT:DEFAUT,info:info,
    bas:function(){return BAS.slice()},style:function(){return STYLE},
    cote:function(){return COTE.slice()},COTE_MAX:COTE_MAX,
    cote:function(){return COTE.slice()},COTE_MAX:COTE_MAX,
    /* galet du menu de côté (familles.js) : ouvre le même panneau */
    ouvre:ouvre,ferme:ferme,ouvert:function(){return ouvert},remesure:mesure,panneau:function(){return DERNIER&&DERNIER.pan},
    applique:function(){
      ferme();TOUS0=tous0();TOUS=TOUS0.filter(dispo);this.TOUS=TOUS;DEFAUT=defaut();this.DEFAUT=DEFAUT;FAMILLES=val(C.familles)||FAMILLES;BAS=choisis();COTE=choisisCote();calcule();
      pb.classList.toggle("pb-ronde",STYLE==="ronde");
      remplit();suit();mesure();
    }
  };
})();
