/* Vraie carte de l'Espace ProClik (même fond que l'Espace : OpenFreeMap + MapLibre, recoloré jour/nuit, Isère et Drac marqués).
   Si le fond ne peut pas se charger (aperçu sans réseau), la carte dessinée reste affichée. */
(function(){
  var LIB="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl",STYLE="https://tiles.openfreemap.org/styles/positron",charge=null;
  function lib(){if(window.maplibregl)return Promise.resolve();if(charge)return charge;
    charge=new Promise(function(ok,ko){var l=document.createElement("link");l.rel="stylesheet";l.href=LIB+".css";document.head.appendChild(l);
      var s=document.createElement("script");s.crossOrigin="anonymous";s.src=LIB+".js";s.onload=function(){window.maplibregl?ok():ko()};s.onerror=ko;document.head.appendChild(s)});
    charge.catch(function(){charge=null});return charge}
  function teintes(){var d=document.documentElement,nuit=d.getAttribute("data-theme")==="dark"||(d.getAttribute("data-theme")!=="light"&&matchMedia("(prefers-color-scheme:dark)").matches);
    return nuit?{sol:"#1E2433",quart:"#232A3A",sol2:"#262E3F",bati:"#2E364A",route:"#3B4359",bord:"#343C51",eau:"#131824",eauT:"#2F405C",lis:"#3F5678",fortE:"#5A77A3",nomE:"#93A9CB",limite:"#5A647E",texte:"#AEB6CB",halo:"#1E2433",fort:"#E3E7F0"}
      :{sol:"#F2F3F6",quart:"#E4E7EC",sol2:"#DCE1E7",bati:"#D1D6DE",route:"#FFFFFF",bord:"#C4CAD4",eau:"#C2CCDA",eauT:"#A9B6CA",lis:"#97A9C3",fortE:"#7F95B7",nomE:"#566C8F",limite:"#8C94A6",texte:"#5D6578",halo:"#F2F3F6",fort:"#2A3142"}}
  function peindre(map){var t=teintes(),st=map.getStyle();if(!st)return;var set=function(i,k,v){try{map.setPaintProperty(i,k,v)}catch(e){}};
    st.layers.forEach(function(L){var id=L.id,sl=(L["source-layer"]||"")+" "+id.toLowerCase();if(/^pc-/.test(id))return;
      if(L.type==="background")set(id,"background-color",t.sol);
      else if(L.type==="fill"){set(id,"fill-color",/water|ocean|lake/.test(sl)?t.eau:/building/.test(sl)?t.bati:/park|wood|grass|forest|landcover|ice|sand|cemetery|pitch/.test(sl)?t.sol2:/landuse|residential|industrial/.test(sl)?t.quart:t.sol);set(id,"fill-opacity",1);set(id,"fill-outline-color",/building/.test(sl)?t.bord:"rgba(0,0,0,0)")}
      else if(L.type==="line"){set(id,"line-color",/water|river|stream|canal/.test(sl)?t.eauT:/boundary|admin/.test(sl)?t.limite:/casing|outline|rail/.test(sl)?t.bord:t.route)}
      else if(L.type==="symbol"){if(/poi|aerodrome|transit|housenumber/.test(sl)){try{map.setLayoutProperty(id,"visibility","none")}catch(e){}return}
        set(id,"text-color",/water/.test(sl)?t.eauT:/place|city|town/.test(sl)?t.fort:t.texte);set(id,"text-halo-color",t.halo);set(id,"text-halo-width",1.4);set(id,"icon-opacity",0)}});
    set("pc-eau-lis","line-color",t.lis);set("pc-riv-fort","line-color",t.fortE);set("pc-riv-nom","text-color",t.nomE);set("pc-riv-nom","text-halo-color",t.halo)}
  var GR=["any",["in","Isère",["concat",["to-string",["get","name"]],["to-string",["get","name:fr"]]]],["in","Drac",["concat",["to-string",["get","name"]],["to-string",["get","name:fr"]]]]];
  function rivieres(map){var st=map.getStyle(),src=null,av=null,pol=null;Object.keys(st.sources).forEach(function(k){if(!src&&st.sources[k].type==="vector")src=k});
    st.layers.forEach(function(L){if(!av&&L.type==="symbol")av=L.id;if(!pol&&L.type==="symbol"&&/water/.test((L["source-layer"]||"")+L.id)&&L.layout&&L.layout["text-font"])pol=L.layout["text-font"]});
    if(!src||map.getLayer("pc-eau-lis"))return;var z=function(a){return["interpolate",["linear"],["zoom"]].concat(a)};
    try{map.addLayer({id:"pc-eau-lis",type:"line",source:src,"source-layer":"water",paint:{"line-width":z([8,.5,13,1.2,16,2])}},av);
      map.addLayer({id:"pc-riv-fort",type:"line",source:src,"source-layer":"waterway",filter:GR,layout:{"line-cap":"round","line-join":"round"},paint:{"line-width":z([6,1.4,9,2.2,12,3.2,15,5])}},av);
      map.addLayer({id:"pc-riv-nom",type:"symbol",source:src,"source-layer":"waterway",filter:GR,minzoom:8,layout:{"symbol-placement":"line","text-field":["coalesce",["get","name:fr"],["get","name"]],"text-font":pol||["Noto Sans Italic"],"text-size":z([8,11,13,14]),"symbol-spacing":350},paint:{"text-halo-width":1.6}},av)}catch(e){}}
  /* opt.points : [{lat,lon,html,onClick,z}] ; opt.bornes : [[lon,lat],[lon,lat]] */
  window.VraieCarte=function(el,opt){var map=null,fini=false,delai=setTimeout(function(){fini=true},9000);
    lib().then(function(){if(fini)return;var fond=document.createElement("div");fond.className="vc-fond";el.appendChild(fond);
      map=new maplibregl.Map({container:fond,style:STYLE,bounds:opt.bornes,fitBoundsOptions:{padding:{top:56,bottom:20,left:24,right:24}},attributionControl:{compact:true},dragRotate:false,pitchWithRotate:false});
      map.touchZoomRotate.disableRotation();var ok=false;map.on("styledata",function(){ok=true});map.on("error",function(){if(!ok){fini=true;fond.remove()}});
      map.on("load",function(){clearTimeout(delai);if(fini){fond.remove();return}rivieres(map);peindre(map);
        opt.points.forEach(function(p){var d=document.createElement("button");d.type="button";d.className="vc-pin";d.innerHTML=p.html;if(p.z)d.style.zIndex=p.z;d.addEventListener("click",function(e){e.stopPropagation();p.onClick&&p.onClick()});
          new maplibregl.Marker({element:d,anchor:p.ancre||"bottom"}).setLngLat([p.lon,p.lat]).addTo(map)});
        el.classList.add("vc-ok");
        new MutationObserver(function(){if(map.isStyleLoaded())peindre(map)}).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]})})},function(){});
    return{map:function(){return map}}};
})();
