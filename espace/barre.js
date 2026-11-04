/* Menu du bas sur téléphone (demande de Cyril, 31/10) : barre en relief avec une encoche au centre.
   À gauche Accueil puis Clients, à droite Planning puis Devis. Le gros galet du milieu ouvre le menu :
   l'encoche se bombe, le galet monte, le micro sort au centre et le reste de l'Espace s'ouvre en éventail.
   Les boutons de la barre appuient sur les vrais onglets (#nb-…) : tout le fonctionnement existant est gardé.
   Tablette et ordinateur : rien ne change (menu sur le côté). */
(function(){
  "use strict";
  var d=document,$=function(s,r){return (r||d).querySelector(s)},$$=function(s,r){return [].slice.call((r||d).querySelectorAll(s))};
  if($("#pb")||!$("#nb-accueil"))return;
  var mq=matchMedia("(max-width:899px)"),reduit=matchMedia("(prefers-reduced-motion: reduce)");
  /* disposition choisie dans les Réglages (2/11) : 4 boutons dans la barre, le reste dans l'éventail */
  var TOUS=["accueil","clients","devis","factures","planning","chantiers","depenses","prix","produits","reseaux","reglages"];
  var DEFAUT=["accueil","clients","planning","devis"];
  function lit(k,d){try{var v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(_){return d}}
  function choisis(){
    var b=lit("pc-barre",null);
    if(!b||b.length!==4||b.some(function(v){return TOUS.indexOf(v)<0||v==="reglages"||(v!=="reglages"&&!$("#nb-"+v))})||b.some(function(v,i){return b.indexOf(v)!==i}))b=DEFAUT.slice();
    return b;
  }
  var BAS=choisis(),EVENTAIL=TOUS.filter(function(v){return BAS.indexOf(v)<0});
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
      (v==="devis"?'<span class="badge pb-b" data-src="#badge" hidden></span>':v==="factures"?'<span class="badge pb-b" data-src="#badge-f" hidden></span>':v==="depenses"?'<span class="badge pb-b" data-src="#badge-d" hidden></span>':"")+'</button>';
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
  var menu=d.createElement("div");menu.className="pb-menu";menu.id="pb-menu";menu.setAttribute("aria-hidden","true");
  function remplit(){
    $(".pb-l",pb).innerHTML=bouton(BAS[0],"pb-i")+bouton(BAS[1],"pb-i")+'<span class="pb-trou"></span>'+bouton(BAS[2],"pb-i")+bouton(BAS[3],"pb-i");
    menu.innerHTML='<button type="button" class="pb-mic" data-pb="micro" aria-label="Parler à ProClik (dictée)" tabindex="-1"><span class="pb-g" aria-hidden="true">'+ICO_MIC+'</span></button>'+
      EVENTAIL.map(function(v,i){return bouton(v,"pb-e").replace('class="pb-e"','class="pb-e" tabindex="-1" style="--i:'+i+'"')}).join("");
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
    W=pb.getBoundingClientRect().width;if(!W)return;
    svg.setAttribute("width",W);svg.setAttribute("height",H);svg.setAttribute("viewBox","0 0 "+W+" "+H);dessine();
    /* éventail : demi-cercle autour du galet central, adapté à la largeur du téléphone */
    var rx=Math.min(168,(innerWidth-60)/2),ry=160,n=EVENTAIL.length;
    $$(".pb-e",menu).forEach(function(b,i){
      var a=(165-i*(150/(n-1)))*Math.PI/180;
      b.style.setProperty("--x",(Math.cos(a)*rx).toFixed(1)+"px");
      b.style.setProperty("--y",(-Math.sin(a)*ry).toFixed(1)+"px");
    });
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
    if(v==="micro"){var m=$("#speak");if(m)m.click();return}
    if(v==="reglages"){var r=$("#menu");if(r)r.click();return}
    var b=$("#nb-"+v);if(b)b.click();
  }
  pb.addEventListener("click",function(e){var b=e.target.closest("[data-pb]");if(!b)return;ferme();agit(b.dataset.pb)});
  menu.addEventListener("click",function(e){var b=e.target.closest("[data-pb]");if(!b)return;ferme();setTimeout(function(){agit(b.dataset.pb)},b.dataset.pb==="micro"?0:180)});

  /* ---------- onglet en cours et pastilles, recopiés des vrais boutons ---------- */
  var dernier=null;
  function suit(){
    var cur=($("nav.nav [aria-selected=true]")||{dataset:{}}).dataset.v;
    $$("[data-pb]").forEach(function(b){var on=b.dataset.pb===cur;b.classList.toggle("on",on);if(on)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current")});
    centre.classList.toggle("on",EVENTAIL.indexOf(cur)>=0);
    /* iPhone (Cyril, 4/11) : Safari ne redessinait pas toujours la barre au changement d'onglet (« Clients » restait allumé sur le Planning).
       On l'oblige à repeindre la barre et l'éventail dès que l'onglet change. */
    if(cur!==dernier){dernier=cur;[pb,menu].forEach(function(e){e.style.opacity=".999"});requestAnimationFrame(function(){requestAnimationFrame(function(){pb.style.opacity="";menu.style.opacity=""})})}
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
  if(mq.addEventListener)mq.addEventListener("change",function(){ferme();mesure()});
  if(d.fonts&&d.fonts.ready)d.fonts.ready.then(mesure);

  /* ---------- pour les Réglages (reglages.js) : changer la disposition ou le style sans recharger ---------- */
  window.PCBarre={
    TOUS:TOUS,DEFAUT:DEFAUT,info:info,
    bas:function(){return BAS.slice()},style:function(){return STYLE},
    applique:function(){
      ferme();BAS=choisis();EVENTAIL=TOUS.filter(function(v){return BAS.indexOf(v)<0});
      pb.classList.toggle("pb-ronde",STYLE==="ronde");
      remplit();suit();mesure();
    }
  };
})();
