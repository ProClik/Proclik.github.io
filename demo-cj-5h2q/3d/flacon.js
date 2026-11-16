/* Flacon Chez Julie en 3D (three.js) : verre prune brillant, bouchon laiton brossé, étiquette papier.
   Il tourne doucement sur lui-même et monte un peu au scroll. Si la 3D n'est pas disponible, le dessin SVG reste. */
import * as T from './three.module.min.js';
import {RoomEnvironment} from './room.js';
const box=document.getElementById('objet');
if(box){try{init()}catch(e){/* garde le SVG */}}
function init(){
 const W=()=>box.clientWidth, H=()=>Math.round(box.clientWidth*1.45);
 const r=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
 r.setPixelRatio(Math.min(2,devicePixelRatio||1));r.setSize(W(),H());r.outputColorSpace=T.SRGBColorSpace;
 r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=1.05;
 const sc=new T.Scene(),pm=new T.PMREMGenerator(r);sc.environment=pm.fromScene(new RoomEnvironment(),.035).texture;
 const cam=new T.PerspectiveCamera(24,W()/H(),.1,50);cam.position.set(0,1.95,12.4);cam.lookAt(0,1.8,0);
 const key=new T.DirectionalLight(0xfff3e6,1.4);key.position.set(-4,6,5);sc.add(key);
 const rim=new T.DirectionalLight(0xffe7d0,1.1);rim.position.set(5,3,-4);sc.add(rim);
 const g=new T.Group();g.scale.set(.82,1,.82);sc.add(g);
 // verre : profil tourné
 const P=[[0,0],[.78,0],[.9,.015],[.97,.06],[1,.16],[1,1.9],[.99,1.98],[.95,2.07],[.86,2.17],[.72,2.27],[.56,2.35],[.43,2.41],[.35,2.46],[.33,2.52],[.33,2.66],[0,2.66]].map(p=>new T.Vector2(p[0],p[1]));
 const verre=new T.Mesh(new T.LatheGeometry(P,128),new T.MeshPhysicalMaterial({color:0x3b1f33,roughness:.14,metalness:0,clearcoat:1,clearcoatRoughness:.09,ior:1.5,reflectivity:.55,sheen:.0,envMapIntensity:1.25}));
 g.add(verre);
 // laiton brossé : bague + bouchon arrondi
 const L=[[0,2.6],[.37,2.6],[.385,2.62],[.385,2.74],[.43,2.75],[.445,2.77],[.445,3.36],[.43,3.41],[.39,3.445],[.3,3.46],[0,3.46]].map(p=>new T.Vector2(p[0],p[1]));
 const laiton=new T.MeshPhysicalMaterial({color:0xc9a35f,metalness:1,roughness:.32,clearcoat:.3,clearcoatRoughness:.3,envMapIntensity:1.1});
 g.add(new T.Mesh(new T.LatheGeometry(L,96),laiton));
 // fines stries du bouchon
 for(let i=0;i<3;i++){const t=new T.Mesh(new T.TorusGeometry(.447,.006,8,96),laiton);t.rotation.x=Math.PI/2;t.position.y=2.86+i*.05;g.add(t)}
 // étiquette papier
 const cv=document.createElement('canvas');cv.width=1024;cv.height=600;const x=cv.getContext('2d');
 x.fillStyle='#F4EEE6';x.fillRect(0,0,1024,600);
 const gr=x.createLinearGradient(0,0,0,600);gr.addColorStop(0,'rgba(0,0,0,.03)');gr.addColorStop(1,'rgba(0,0,0,.06)');x.fillStyle=gr;x.fillRect(0,0,1024,600);
 x.textAlign='center';x.fillStyle='#2A1C26';x.font='500 112px Georgia, "Times New Roman", serif';x.fillText('Chez Julie',512,250);
 x.fillStyle='#A8823F';x.fillRect(452,292,120,3);
 x.fillStyle='#6E6168';x.font='600 34px Inter, system-ui, sans-serif';
 const sp=(t,y)=>{x.save();x.letterSpacing='9px';x.fillText(t,512,y);x.restore()};sp('HUILE DE SOIN',372);
 x.font='500 28px Inter, system-ui, sans-serif';sp('LE VERSOUD · 100 ml',430);
 const tx=new T.CanvasTexture(cv);tx.colorSpace=T.SRGBColorSpace;tx.anisotropy=8;
 const lab=new T.Mesh(new T.CylinderGeometry(1.004,1.004,1.08,96,1,true,-1.05,2.1),new T.MeshStandardMaterial({map:tx,roughness:.9,metalness:0}));
 lab.position.y=1.0;g.add(lab);
 // ombre de contact
 const sh=document.createElement('canvas');sh.width=sh.height=256;const s=sh.getContext('2d'),rg=s.createRadialGradient(128,128,0,128,128,128);
 rg.addColorStop(0,'rgba(42,28,38,.55)');rg.addColorStop(.45,'rgba(42,28,38,.22)');rg.addColorStop(1,'rgba(42,28,38,0)');s.fillStyle=rg;s.fillRect(0,0,256,256);
 const ombre=new T.Mesh(new T.PlaneGeometry(3.4,3.4),new T.MeshBasicMaterial({map:new T.CanvasTexture(sh),transparent:true,depthWrite:false}));
 ombre.rotation.x=-Math.PI/2;ombre.position.y=-.01;sc.add(ombre);
 // mise en place
 r.domElement.className='ob-3d';box.appendChild(r.domElement);box.classList.add('en3d');
 const R=matchMedia('(prefers-reduced-motion: reduce)').matches;let p=0,cible=0,ent=R?1:0,t0=performance.now(),run=false,vis=true;
 function pose(){const e=1-Math.pow(1-ent,3);
  g.rotation.y=-.55+p*1.9;g.rotation.z=-.05*p;g.position.y=.35*p+(1-e)*-.5;
  ombre.scale.setScalar(1-.28*p);ombre.material.opacity=(1-.5*p)*e;verre.material.opacity=1;r.domElement.style.opacity=e;
  r.render(sc,cam)}
 function boucle(t){run=false;if(ent<1){ent=Math.min(1,(t-t0)/1100)}p+=(cible-p)*(R?1:.14);pose();
  if(vis&&(ent<1||Math.abs(cible-p)>.0008)){run=true;requestAnimationFrame(boucle)}}
 function go(){if(!run){run=true;requestAnimationFrame(boucle)}}
 function lit(){cible=Math.max(0,Math.min(1,scrollY/(innerHeight*.8)));go()}
 addEventListener('scroll',lit,{passive:true});
 addEventListener('resize',()=>{r.setSize(W(),H());cam.aspect=W()/H();cam.updateProjectionMatrix();pose()});
 if('IntersectionObserver' in window)new IntersectionObserver(e=>{vis=e[0].isIntersecting;if(vis)go()},{rootMargin:'120px'}).observe(box);
 lit();
}
