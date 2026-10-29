/* Carte des chantiers sur un vrai fond OpenStreetMap (rues, rivières, noms des villes), recoloré aux teintes de l'Espace.
   Demande de Cyril (29/10) : la carte dessinée était trop épurée, « on peut se perdre » et il manquait les villes.
   Fond : OpenFreeMap (gratuit, sans clé, usage commercial permis), affiché par MapLibre.
   Sans réseau, ou si le fond ne se charge pas, la carte dessinée (ProClikMap) prend le relais : même boutons, mêmes repères.
   Même interface que ProClikMap : zone(), full(), reg(), redraw(), select(i), setPins(p). */
(function(){
  "use strict";
  var LIB="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl",STYLE="https://tiles.openfreemap.org/styles/positron";
  var esc=function(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})};
  var charge=null;
  function bibliotheque(){
    if(window.maplibregl)return Promise.resolve();
    if(charge)return charge;
    charge=new Promise(function(ok,ko){
      var l=document.createElement("link");l.rel="stylesheet";l.href=LIB+".css";document.head.appendChild(l);
      var s=document.createElement("script");s.src=LIB+".js";s.onload=function(){window.maplibregl?ok():ko()};s.onerror=ko;document.head.appendChild(s);
    });
    return charge;
  }
  // Teintes du fond, lues dans les couleurs de l'Espace pour suivre le jour et la nuit
  function teintes(){
    var nuit=document.documentElement.getAttribute("data-theme")==="dark"||
      (document.documentElement.getAttribute("data-theme")!=="light"&&matchMedia("(prefers-color-scheme:dark)").matches);
    return nuit?{sol:"#1E2433",quart:"#232A3A",sol2:"#262E3F",bati:"#2E364A",route:"#3B4359",bord:"#343C51",eau:"#131824",eauT:"#2F405C",lis:"#3F5678",fortE:"#5A77A3",nomE:"#93A9CB",limite:"#5A647E",texte:"#AEB6CB",halo:"#1E2433",fort:"#E3E7F0"}
      :{sol:"#F2F3F6",quart:"#E4E7EC",sol2:"#DCE1E7",bati:"#D1D6DE",route:"#FFFFFF",bord:"#C4CAD4",eau:"#C2CCDA",eauT:"#A9B6CA",lis:"#97A9C3",fortE:"#7F95B7",nomE:"#566C8F",limite:"#8C94A6",texte:"#5D6578",halo:"#F2F3F6",fort:"#2A3142"};
  }
  function peindre(map){
    var t=teintes(),st=map.getStyle();if(!st)return;
    var set=function(id,k,v){try{map.setPaintProperty(id,k,v)}catch(e){}};
    st.layers.forEach(function(L){
      var id=L.id,sl=(L["source-layer"]||"")+" "+id.toLowerCase();
      if(/^pc-/.test(id))return; // nos propres calques (zone, rivières) gardent leurs teintes
      if(L.type==="background")set(id,"background-color",t.sol);
      else if(L.type==="fill"){
        set(id,"fill-color",/water|ocean|lake/.test(sl)?t.eau:/building/.test(sl)?t.bati:/park|wood|grass|forest|landcover|ice|sand|cemetery|pitch/.test(sl)?t.sol2:/landuse|residential|industrial/.test(sl)?t.quart:t.sol);
        set(id,"fill-opacity",1);set(id,"fill-outline-color",/building/.test(sl)?t.bord:"rgba(0,0,0,0)");}
      else if(L.type==="fill-extrusion")set(id,"fill-extrusion-color",t.bati);
      else if(L.type==="line"){
        if(/water|river|stream|canal/.test(sl))set(id,"line-color",t.eauT);
        else if(/boundary|admin/.test(sl))set(id,"line-color",t.limite);
        else if(/casing|outline/.test(sl))set(id,"line-color",t.bord);
        else if(/rail/.test(sl))set(id,"line-color",t.bord);
        else set(id,"line-color",t.route);}
      else if(L.type==="symbol"){
        // Points d'intérêt (commerces, arrêts…) masqués : on garde les noms de villes, quartiers, rues et rivières
        if(/poi|aerodrome|transit|housenumber/.test(sl)){try{map.setLayoutProperty(id,"visibility","none")}catch(e){}return;}
        var ville=/place|city|town/.test(sl);
        set(id,"text-color",/water/.test(sl)?t.eauT:ville?t.fort:t.texte);
        set(id,"text-halo-color",t.halo);set(id,"text-halo-width",1.4);set(id,"icon-opacity",0);}
    });
    set("pc-eau-lis","line-color",t.lis);set("pc-riv-fort","line-color",t.fortE);
    set("pc-riv-nom","text-color",t.nomE);set("pc-riv-nom","text-halo-color",t.halo);
  }
  // Cours d'eau (demande de Cyril, 29/10) : liseré bleuté autour de l'eau, l'Isère et le Drac plus marqués car ce sont des repères
  var GRANDES=["any",["in","Isère",["concat",["to-string",["get","name"]],["to-string",["get","name:fr"]]]],
    ["in","Drac",["concat",["to-string",["get","name"]],["to-string",["get","name:fr"]]]]];
  function rivieres(map){
    var st=map.getStyle(),src=null,avant=null,police=null;
    Object.keys(st.sources).forEach(function(k){if(!src&&st.sources[k].type==="vector")src=k});
    st.layers.forEach(function(L){
      if(!avant&&L.type==="symbol")avant=L.id;
      if(!police&&L.type==="symbol"&&/water/.test((L["source-layer"]||"")+L.id)&&L.layout&&L.layout["text-font"])police=L.layout["text-font"];});
    if(!src||map.getLayer("pc-eau-lis"))return;
    var z=function(a){return["interpolate",["linear"],["zoom"]].concat(a)};
    try{
      map.addLayer({id:"pc-eau-lis",type:"line",source:src,"source-layer":"water",paint:{"line-width":z([8,.5,13,1.2,16,2])}},avant);
      map.addLayer({id:"pc-riv-fort",type:"line",source:src,"source-layer":"waterway",filter:GRANDES,
        layout:{"line-cap":"round","line-join":"round"},paint:{"line-width":z([6,1.4,9,2.2,12,3.2,15,5]),"line-opacity":z([12,1,15,.55])}},avant);
      map.addLayer({id:"pc-riv-nom",type:"symbol",source:src,"source-layer":"waterway",filter:GRANDES,minzoom:8,
        layout:{"symbol-placement":"line","text-field":["coalesce",["get","name:fr"],["get","name"]],"text-font":police||["Noto Sans Italic"],
          "text-size":z([8,11,13,14]),"symbol-spacing":350,"text-letter-spacing":.08},
        paint:{"text-halo-width":1.6}},avant);
    }catch(e){}
  }
  // Cercle de la zone d'intervention (en km), pour la source GeoJSON
  function cercle(lat,lon,km){var c=[],n=96;for(var i=0;i<=n;i++){var a=i/n*2*Math.PI;
    c.push([lon+km/(111.32*Math.cos(lat*Math.PI/180))*Math.cos(a),lat+km/110.57*Math.sin(a)])}
    return{type:"Feature",geometry:{type:"LineString",coordinates:c}}}

  window.ProClikCarte=function(el,opt){
    var base=opt.base,R=opt.radius||25,pins=opt.pins||[],onPin=opt.onPin||function(){},sel=-1,map=null,secours=null,marques=[],etiq=[],btn="zone";
    var ZONES={zone:null,full:[[4.73,44.69],[6.36,45.88]],reg:[[2.06,44.11],[7.19,46.81]]};
    // Interface commune : on la garde, et on la passe à la carte dessinée si besoin
    var api={zone:function(){aller("zone")},full:function(){aller("full")},reg:function(){aller("reg")},
      redraw:function(){if(secours)return secours.redraw();if(map){map.resize();poser()}},
      select:function(i){if(secours)return secours.select(i);sel=i;poser()},
      setPins:function(p){pins=p;if(secours)return secours.setPins(p);sel=-1;poser()}};
    function repli(){
      if(secours)return;try{if(map)map.remove()}catch(e){}map=null;el.innerHTML="";el.className="";
      secours=window.ProClikMap(el,opt);if(btn&&secours[btn])secours[btn]();}
    function aller(z){btn=z;if(secours)return secours[z]();if(!map)return;
      el.querySelectorAll(".pcm-b").forEach(function(b){b.setAttribute("aria-pressed",String(b.dataset.z===z))});
      var pad={top:64,bottom:24,left:24,right:24};
      if(z==="zone"){var dy=R/110.57,dx=R/(111.32*Math.cos(base.lat*Math.PI/180));map.fitBounds([[base.lon-dx,base.lat-dy],[base.lon+dx,base.lat+dy]],{padding:pad,duration:700})}
      else map.fitBounds(ZONES[z],{padding:pad,duration:700})}
    function couleur(k){return{run:"var(--k-run)",start:"var(--k-run)",devis:"var(--k-devis)",visit:"var(--k-visit)",done:"var(--k-done)"}[k]}
    function poser(){
      if(!map)return;marques.forEach(function(m){m.remove()});marques=[];
      pins.forEach(function(p,i){
        var r=p.kind==="devis"?7:10,pc=p.pc!=null?p.pc:100,C=2*Math.PI*r,c=couleur(p.kind),on=i===sel,lab=on||p.kind==="run";
        var d=document.createElement("button");d.type="button";d.className="pcx"+(on?" on":"")+(p.kind==="run"?" run":"");
        d.setAttribute("aria-label",(p.name||"")+", "+(p.sub||""));
        d.innerHTML='<svg width="'+(2*r+8)+'" height="'+(2*r+8)+'" viewBox="'+(-r-4)+" "+(-r-4)+" "+(2*r+8)+" "+(2*r+8)+'" aria-hidden="true">'+
          '<circle r="'+r+'" class="pcm-pb"/><circle r="'+r+'" fill="none" class="pcm-pt" stroke-width="3"/>'+
          '<circle r="'+r+'" fill="none" style="stroke:'+c+'" stroke-width="3" stroke-dasharray="'+(C*pc/100).toFixed(1)+" "+C.toFixed(1)+'" transform="rotate(-90)" stroke-linecap="round"/>'+
          (p.kind==="done"?'<path d="M-3.6 0.2 L-1 2.8 L3.8 -2.4" fill="none" style="stroke:'+c+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>':'<circle r="'+(r*.32)+'" style="fill:'+c+'"/>')+"</svg>"+
          (lab?'<span class="pcx-l"><i style="background:'+c+'"></i><b>'+esc(p.name)+"</b><small>"+esc(p.sub||"")+"</small></span>":"");
        d.addEventListener("click",function(e){e.stopPropagation();sel=i;poser();onPin(p)});
        var m=new maplibregl.Marker({element:d,anchor:"center"}).setLngLat([p.lon,p.lat]).addTo(map);
        if(lab)m.getElement().style.zIndex=on?3:2;marques.push(m)});
    }
    function zoneTrait(){
      var t=teintes();if(map.getSource("pc-zone"))return;
      map.addSource("pc-zone",{type:"geojson",data:cercle(base.lat,base.lon,R)});
      map.addLayer({id:"pc-zone",type:"line",source:"pc-zone",paint:{"line-color":getComputedStyle(document.documentElement).getPropertyValue("--acc").trim()||"#A8823F","line-width":1.4,"line-dasharray":[2,3],"line-opacity":.8}});
    }
    function depot(){var d=document.createElement("div");d.className="pcx-dep";d.title="Votre dépôt";
      d.innerHTML='<svg viewBox="-7 -7 14 14" width="18" height="18" aria-hidden="true"><rect x="-7" y="-7" width="14" height="14" rx="4" class="pcm-dep"/><path d="M-3.5 1 L0 -3 L3.5 1 V4 H-3.5Z" class="pcm-depi"/></svg>';
      new maplibregl.Marker({element:d}).setLngLat([base.lon,base.lat]).addTo(map)}

    el.classList.add("pcm","pcx-carte");
    el.innerHTML='<div class="pcx-fond"></div>'+
      '<div class="pcm-ui"><button class="pcm-b" data-z="zone" aria-pressed="true">Ma zone · '+R+' km</button><button class="pcm-b" data-z="full" aria-pressed="false">Isère</button><button class="pcm-b" data-z="reg" aria-pressed="false">Rhône-Alpes</button></div>'+
      '<div class="pcm-zoom"><button class="pcm-r" data-k="1" aria-label="Zoomer">+</button><button class="pcm-r" data-k="-1" aria-label="Dézoomer">−</button></div>';
    el.querySelectorAll(".pcm-b").forEach(function(b){b.addEventListener("click",function(){aller(b.dataset.z)})});
    el.querySelectorAll(".pcm-r").forEach(function(b){b.addEventListener("click",function(){if(secours)return;map&&(+b.dataset.k>0?map.zoomIn():map.zoomOut())})});

    if(navigator.onLine===false){repli();return api}
    var delai=setTimeout(repli,9000);
    bibliotheque().then(function(){
      if(secours)return;
      map=new maplibregl.Map({container:el.querySelector(".pcx-fond"),style:STYLE,center:[base.lon,base.lat],zoom:9,attributionControl:{compact:true},
        dragRotate:false,pitchWithRotate:false,cooperativeGestures:false});
      map.touchZoomRotate.disableRotation();
      var styleOk=false;map.on("styledata",function(){styleOk=true});
      map.on("error",function(){if(!styleOk)repli()});
      map.on("load",function(){clearTimeout(delai);if(secours)return;rivieres(map);peindre(map);zoneTrait();depot();poser();aller(btn)});
      map.on("click",function(){if(sel<0)return;sel=-1;poser()});
      // Le jour et la nuit suivent le bouton lune/soleil
      new MutationObserver(function(){if(map&&map.isStyleLoaded())peindre(map)}).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});
      matchMedia("(prefers-color-scheme:dark)").addEventListener("change",function(){if(map&&map.isStyleLoaded())peindre(map)});
    },repli);
    return api;
  };
})();
