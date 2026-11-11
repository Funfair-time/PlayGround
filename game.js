import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
const host=document.querySelector('#scene-host');
const scene=new THREE.Scene();scene.background=new THREE.Color('#11162a');scene.fog=new THREE.FogExp2('#11162a',.012);
const camera=new THREE.PerspectiveCamera(42,1,.1,220);
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.7));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.22;host.appendChild(renderer.domElement);
const clamp=THREE.MathUtils.clamp;
const mat=(color,roughness=.72,extra={})=>new THREE.MeshStandardMaterial({color,roughness,...extra});
const materials={ground:mat('#252b3b'),dark:mat('#11162a'),gold:mat('#efb951',.38,{metalness:.48}),cream:mat('#fff0cb',.44),red:mat('#e84e72',.5),pink:mat('#ff7b99',.48),blue:mat('#596bd0',.5),teal:mat('#55c4bd',.5),purple:mat('#9675d7',.48),wood:mat('#79524e'),black:mat('#161827',.38),skin:mat('#f3b99a'),white:mat('#f7f2eb'),green:mat('#4e8d6a')};
const sceneRoot=new THREE.Group();scene.add(sceneRoot);
scene.add(new THREE.HemisphereLight('#a9c5ff','#25202b',1.55));
const moonLight=new THREE.DirectionalLight('#c3d6ff',2);moonLight.position.set(-12,22,10);moonLight.castShadow=true;moonLight.shadow.mapSize.set(1024,1024);moonLight.shadow.camera.left=-22;moonLight.shadow.camera.right=22;moonLight.shadow.camera.top=24;moonLight.shadow.camera.bottom=-22;scene.add(moonLight);
const warmFill=new THREE.PointLight('#ff8e69',38,34,2);warmFill.position.set(1,7,1);scene.add(warmFill);
const coolFill=new THREE.PointLight('#607aff',28,26,2);coolFill.position.set(-7,6,-5);scene.add(coolFill);
const ground=new THREE.Mesh(new THREE.PlaneGeometry(180,180),materials.ground);ground.rotation.x=-Math.PI/2;ground.position.y=-.16;ground.receiveShadow=true;sceneRoot.add(ground);
const plaza=new THREE.Mesh(new THREE.CircleGeometry(15,80),mat('#343746'));plaza.rotation.x=-Math.PI/2;plaza.position.y=-.145;plaza.receiveShadow=true;sceneRoot.add(plaza);
const floorRing=new THREE.Mesh(new THREE.RingGeometry(7.7,8.1,72),mat('#a88764'));floorRing.rotation.x=-Math.PI/2;floorRing.position.y=-.13;sceneRoot.add(floorRing);
const tileRing=new THREE.Mesh(new THREE.RingGeometry(8.7,8.78,72),mat('#f1c36d',.56,{emissive:'#774a19',emissiveIntensity:.28}));tileRing.rotation.x=-Math.PI/2;tileRing.position.y=-.125;sceneRoot.add(tileRing);
const starPositions=[];for(let i=0;i<430;i++)starPositions.push((Math.random()-.5)*130,12+Math.random()*48,-45-Math.random()*95);
const starGeo=new THREE.BufferGeometry();starGeo.setAttribute('position',new THREE.Float32BufferAttribute(starPositions,3));scene.add(new THREE.Points(starGeo,new THREE.PointsMaterial({color:'#d9e1ff',size:.13,transparent:true,opacity:.8})));
function box(parent,size,material,pos,rotation=[0,0,0]){const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),material);mesh.position.set(...pos);mesh.rotation.set(...rotation);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh}
function cylinder(parent,rt,rb,h,material,pos,radial=16,open=false){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,radial,1,open),material);mesh.position.set(...pos);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh}
function sphere(parent,r,material,pos,scale=[1,1,1],w=12,h=8){const mesh=new THREE.Mesh(new THREE.SphereGeometry(r,w,h),material);mesh.position.set(...pos);mesh.scale.set(...scale);mesh.castShadow=true;parent.add(mesh);return mesh}
function lineBetween(parent,a,b,radius,material,radial=6){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),delta=end.clone().sub(start);const mesh=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,delta.length(),radial),material);mesh.position.copy(start.add(end).multiplyScalar(.5));mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());mesh.castShadow=true;parent.add(mesh);return mesh}
function emissiveMaterial(color,power=2.5){return new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:power,roughness:.32})}
// Loading deck and its warm ring of bulbs.
cylinder(sceneRoot,7.3,7.5,.42,mat('#4c3b46'),[0,.1,0],64);cylinder(sceneRoot,7.5,7.5,.12,materials.gold,[0,.32,0],64);cylinder(sceneRoot,7.24,7.24,.12,mat('#e7d2b7'),[0,.39,0],64);
const deck=new THREE.Mesh(new THREE.CylinderGeometry(5.35,5.35,.08,64),mat('#c5a995'));deck.position.y=.49;deck.receiveShadow=true;sceneRoot.add(deck);
for(let i=0;i<24;i++){const a=i*Math.PI*2/24,r=7.34;const bulb=sphere(sceneRoot,.105,emissiveMaterial(i%2?'#ffd06b':'#ff7593',2),[Math.cos(a)*r,.42,Math.sin(a)*r],[1,.7,1],8,6);bulb.userData.bulb=true}
// Mast, supports and striped big-top canopy.
cylinder(sceneRoot,.62,.83,.95,materials.black,[0,.86,0],24);cylinder(sceneRoot,.42,.48,7.35,mat('#e5dfd6',.32,{metalness:.24}),[0,4.95,0],24);cylinder(sceneRoot,.5,.64,.38,materials.gold,[0,1.27,0],24);cylinder(sceneRoot,.22,.38,.45,materials.red,[0,8.55,0],20);
for(let i=0;i<8;i++){const a=i*Math.PI/4;lineBetween(sceneRoot,[0,1.55,0],[Math.cos(a)*5.05,8.48,Math.sin(a)*5.05],.055,materials.gold,8)}
cylinder(sceneRoot,4.72,4.72,.24,materials.red,[0,8.55,0],48);cylinder(sceneRoot,4.8,4.8,.13,materials.gold,[0,8.44,0],48);
const roof=new THREE.Group();sceneRoot.add(roof);
for(let i=0;i<16;i++){const stripe=new THREE.Mesh(new THREE.ConeGeometry(4.62,1.32,1,1,false,i*Math.PI*2/16,Math.PI*2/16),i%2?materials.cream:materials.red);stripe.position.y=9.18;stripe.castShadow=true;stripe.receiveShadow=true;roof.add(stripe)}
cylinder(sceneRoot,4.65,4.65,.19,mat('#f0d7b6'),[0,8.64,0],48);cylinder(sceneRoot,1.04,1.04,.1,materials.gold,[0,9.89,0],24);const crown=sphere(sceneRoot,.34,emissiveMaterial('#ffd166',2),[0,10.1,0],[1,1.25,1],16,10);
// Rotating swing assembly with tiny guests in twelve hanging chairs.
const rotor=new THREE.Group();sceneRoot.add(rotor);cylinder(rotor,.66,.7,.28,materials.gold,[0,8.28,0],24);
const swingData=[],riderMats=[materials.blue,materials.teal,materials.purple,materials.red,materials.green,materials.cream],chainMat=mat('#e7d5ad',.32,{metalness:.55});
for(let i=0;i<12;i++){
 const a=i*Math.PI*2/12,anchor=new THREE.Vector3(Math.cos(a)*2.22,8.21,Math.sin(a)*2.22);lineBetween(rotor,[0,8.2,0],[anchor.x,anchor.y,anchor.z],.095,materials.gold,8);
 const chain=cylinder(rotor,.025,.025,1,chainMat,[0,0,0],6),chair=new THREE.Group();rotor.add(chair);
 box(chair,[.94,.13,.7],i%2?materials.blue:materials.red,[0,0,0]);box(chair,[.13,.56,.68],materials.gold,[0,.31,-.32]);box(chair,[.08,.1,.58],materials.cream,[.49,.05,0]);box(chair,[.08,.1,.58],materials.cream,[-.49,.05,0]);
 const rider=new THREE.Group();chair.add(rider);const clothes=riderMats[i%riderMats.length];sphere(rider,.23,clothes,[0,.48,.04],[.82,1.12,.78],10,8);sphere(rider,.16,materials.skin,[0,.82,.02],[1,1,1],10,8);sphere(rider,.165,mat(i%3?'#332a32':'#6a3b32'),[0,.88,-.015],[1.01,.58,1.02],10,6);
 for(const side of [-1,1]){const arm=sphere(rider,.075,clothes,[side*.23,.56,-.09],[1,1.45,1],8,6);arm.rotation.z=side*-.25;box(rider,[.16,.08,.28],mat('#f7edda'),[side*.16,-.09,.24],[-.42,0,0])}
 rider.visible=false;swingData.push({a,anchor,chain,chair,rider,phase:i*.29});
}
const canopyBulbs=[];for(let i=0;i<32;i++){const a=i*Math.PI*2/32;const bulb=sphere(sceneRoot,.11,emissiveMaterial(i%3?'#ffe08a':'#ff7193',2),[Math.cos(a)*4.48,8.53,Math.sin(a)*4.48],[1,1,1],8,6);canopyBulbs.push(bulb)}
// Decorative queue fence and entrance gate.
const fenceMat=mat('#f3d9ae',.45);
for(let i=0;i<28;i++){const a=i*Math.PI*2/28,r=7.72;if(Math.cos(a)>.84&&Math.abs(Math.sin(a))<.48)continue;const x=Math.cos(a)*r,z=Math.sin(a)*r;cylinder(sceneRoot,.08,.1,.9,fenceMat,[x,.55,z],8);sphere(sceneRoot,.1,materials.gold,[x,1.02,z],[1,.55,1],8,6)}
for(const side of [-1,1]){lineBetween(sceneRoot,[side*5.1,.64,5.85],[side*5.1,.64,8.1],.045,materials.red,6);for(let i=0;i<4;i++)cylinder(sceneRoot,.04,.04,.7,fenceMat,[side*5.1,.58,5.9+i*.66],6)}
for(const side of [-1,1])cylinder(sceneRoot,.13,.16,2.25,materials.gold,[side*1.5,1.25,7.3],12);
box(sceneRoot,[3.25,.48,.23],materials.red,[0,2.44,7.3]);box(sceneRoot,[2.95,.28,.25],materials.black,[0,2.46,7.15]);
// Two ticket and snack kiosks with illuminated hand-painted signs.
function makeBooth(x,z,title,tint){
 const g=new THREE.Group();g.position.set(x,0,z);sceneRoot.add(g);box(g,[3.2,2.25,2.15],mat('#453743'),[0,1.15,0]);box(g,[3.05,.86,.16],mat('#211d2b'),[0,1.45,1.1]);box(g,[3.55,.19,2.45],materials.gold,[0,2.33,0]);
 for(let j=0;j<7;j++)box(g,[.5,.33,2.42],j%2?materials.cream:tint,[-1.5+j*.5,2.58,0]);box(g,[1.7,.55,.12],mat('#151629'),[0,3.02,0]);
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const ctx=canvas.getContext('2d');ctx.fillStyle='#17172b';ctx.fillRect(0,0,512,128);ctx.font='bold 68px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=title==='TICKETS'?'#ffd16e':'#ff86a0';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=18;ctx.fillText(title,256,68);
 const sign=new THREE.Mesh(new THREE.PlaneGeometry(1.58,.38),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(canvas)}));sign.position.set(0,3.02,.071);g.add(sign);
 for(let i=0;i<6;i++)sphere(g,.07,emissiveMaterial('#ffe18a',1.7),[-1.25+i*.5,2.32,1.23],[1,1,1],8,6);return g
}
makeBooth(-11,-1.5,'TICKETS',materials.blue);makeBooth(11,-2.5,'SÜSSES',materials.red);
// Faraway midway silhouettes and festoon lights give the night scene depth.
for(let i=0;i<9;i++){const x=-17+i*4.25,z=-13-(i%2)*2;box(sceneRoot,[3.1,1.35,2],i%2?mat('#4b3643'):mat('#29374a'),[x,.68,z]);box(sceneRoot,[3.55,.24,2.45],i%2?materials.red:materials.blue,[x,1.48,z]);const glow=new THREE.PointLight(i%2?'#ff8b76':'#68bde7',9,7,2);glow.position.set(x,2,z+1.1);sceneRoot.add(glow)}
const festoon=new THREE.Group();sceneRoot.add(festoon);const strand=new THREE.CatmullRomCurve3([new THREE.Vector3(-15,7,-7),new THREE.Vector3(-8,5.5,-9),new THREE.Vector3(0,5.2,-8),new THREE.Vector3(8,5.5,-9),new THREE.Vector3(15,7,-7)]);festoon.add(new THREE.Mesh(new THREE.TubeGeometry(strand,40,.025,5,false),mat('#252738')));
for(let i=0;i<21;i++){const p=strand.getPoint(i/20),b=sphere(festoon,.095,emissiveMaterial(i%3?'#ffd170':'#ff83a0',2.1),[p.x,p.y-.12,p.z],[1,1,1],8,6);if(i%4===1){const light=new THREE.PointLight('#ffc876',2.4,5,2);light.position.copy(b.position);festoon.add(light)}}
const arrow=new THREE.Mesh(new THREE.ConeGeometry(.22,.42,4),emissiveMaterial('#ffd166',1.5));arrow.rotation.z=Math.PI;arrow.position.set(0,3.2,7.31);sceneRoot.add(arrow);
// Drag to orbit and scroll to zoom.
let azimuth=.63,elevation=.31,distance=25.8,dragging=false,prevX=0,prevY=0;const lookAt=new THREE.Vector3(0,4.45,0);
function updateCamera(){const horizontal=Math.cos(elevation)*distance;camera.position.set(Math.sin(azimuth)*horizontal,lookAt.y+Math.sin(elevation)*distance,Math.cos(azimuth)*horizontal);camera.lookAt(lookAt)}updateCamera();
renderer.domElement.addEventListener('pointerdown',e=>{dragging=true;prevX=e.clientX;prevY=e.clientY;renderer.domElement.setPointerCapture(e.pointerId);renderer.domElement.style.cursor='grabbing'});
renderer.domElement.addEventListener('pointermove',e=>{if(!dragging)return;azimuth-=(e.clientX-prevX)*.006;elevation=clamp(elevation+(e.clientY-prevY)*.004,.08,.78);prevX=e.clientX;prevY=e.clientY;updateCamera()});
renderer.domElement.addEventListener('pointerup',()=>{dragging=false;renderer.domElement.style.cursor='grab'});renderer.domElement.addEventListener('pointercancel',()=>{dragging=false;renderer.domElement.style.cursor='grab'});
renderer.domElement.addEventListener('wheel',e=>{distance=clamp(distance+e.deltaY*.018,17,36);updateCamera()},{passive:true});renderer.domElement.style.cursor='grab';
function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.fov=w<600?49:42;camera.updateProjectionMatrix();renderer.setSize(w,h,false)}window.addEventListener('resize',resize);resize();

// Ride operator console and complete ride cycle.
const ui={
 earnings:document.querySelector('#earnings'),ridersToday:document.querySelector('#riders-today'),
 occupancy:document.querySelector('#occupancy-value'),occupancyLabel:document.querySelector('#occupancy-label'),
 status:document.querySelector('#ride-status'),statusDot:document.querySelector('#status-dot'),time:document.querySelector('#phase-time'),
 start:document.querySelector('#start-button'),startLabel:document.querySelector('#start-label'),startSub:document.querySelector('#start-sub'),
 stop:document.querySelector('#stop-button'),speed:document.querySelector('#speed-slider'),speedValue:document.querySelector('#speed-value'),
 lights:document.querySelector('#lights-button'),toast:document.querySelector('#toast')
};
const phases={ready:'BETRIEBSBEREIT',boarding:'GÄSTE STEIGEN EIN',running:'FAHRT LÄUFT',braking:'SICHERES ABBREMSEN',unloading:'GÄSTE STEIGEN AUS'};
let phase='ready',phaseElapsed=0,occupied=0,desiredSpeed=Number(ui.speed.value)/100,rotorSpeed=0,lightsOn=true,toastTimer=0,rideDuration=23;
const euroFormat=new Intl.NumberFormat('de-DE',{maximumFractionDigits:0});
const saveKey='neon-loop-save-v1';
let earnings=1240,ridersToday=186;
try{const saved=JSON.parse(localStorage.getItem(saveKey)||'null');if(saved&&Number.isFinite(saved.earnings)&&Number.isFinite(saved.ridersToday)){earnings=Math.max(1240,saved.earnings);ridersToday=Math.max(186,saved.ridersToday)}}catch{}
ui.earnings.textContent='€ '+euroFormat.format(earnings);ui.ridersToday.textContent=euroFormat.format(ridersToday);
function saveProgress(){try{localStorage.setItem(saveKey,JSON.stringify({earnings,ridersToday}))}catch{}}
function showToast(message){ui.toast.textContent=message;ui.toast.classList.add('show');toastTimer=2.8}
function setPhase(next){phase=next;phaseElapsed=0;ui.status.textContent=phases[next];ui.statusDot.classList.toggle('running',next==='running');ui.statusDot.classList.toggle('warning',next==='braking');ui.start.disabled=next!=='ready';ui.stop.disabled=next==='ready'||next==='unloading';ui.startLabel.textContent=next==='ready'?'Fahrt starten':next==='boarding'?'Einsteigen …':next==='running'?'Fahrt läuft …':next==='braking'?'Bremst …':'Aussteigen …';ui.startSub.textContent=next==='ready'?'12 Gäste warten':next==='boarding'?'Bitte alle Plätze einnehmen':next==='running'?'Viel Spaß auf der Fahrt!':next==='braking'?'Bremst sicher ab …':'Bitte sitzen bleiben';ui.time.textContent=next==='ready'?'—':'…';}
function setOccupancy(count){occupied=clamp(count,0,12);const percent=Math.round(occupied/12*100);ui.occupancy.textContent=String(percent);document.querySelector('.occupancy-ring').style.setProperty('--progress',`${percent*3.6}deg`);document.querySelector('.occupancy-ring').setAttribute('aria-label',`${occupied} von 12 Plätzen belegt`);ui.occupancyLabel.textContent=occupied===0?'Bereit zum Einsteigen':occupied===12?'12 von 12 Plätzen':`${occupied} Plätze belegt`;swingData.forEach((s,i)=>s.rider.visible=i<occupied)}
function beginRide(){if(phase!=='ready')return;setOccupancy(0);setPhase('boarding');showToast('Die Fahrt beginnt – Gäste steigen ein!')}
function stopRide(){if(phase==='running'){setPhase('braking');showToast('Bremsvorgang eingeleitet …')}else if(phase==='boarding'){setPhase('unloading');showToast('Einstieg gestoppt – Plätze werden geräumt.')}}
function completeRide(){const payout=occupied*4;earnings+=payout;ridersToday+=occupied;ui.earnings.textContent='€ '+euroFormat.format(earnings);ui.ridersToday.textContent=euroFormat.format(ridersToday);saveProgress();setPhase('unloading');showToast('Fahrt beendet! +€ '+euroFormat.format(payout))}
ui.start.addEventListener('click',beginRide);ui.stop.addEventListener('click',stopRide);
ui.speed.addEventListener('input',()=>{const value=Number(ui.speed.value),progress=(value-30)/70*100;desiredSpeed=value/100;ui.speedValue.textContent=String(value);ui.speed.setAttribute('aria-valuetext',`${value} Prozent`);ui.speed.style.setProperty('--speed-progress',`${progress}%`)});
function toggleLights(){lightsOn=!lightsOn;ui.lights.classList.toggle('active',lightsOn);ui.lights.setAttribute('aria-pressed',String(lightsOn));scene.traverse(o=>{if(o.isMesh&&(o.userData.bulb||canopyBulbs.includes(o))&&o.material?.emissive){if(o.userData.baseGlow===undefined)o.userData.baseGlow=o.material.emissiveIntensity;o.material.emissiveIntensity=lightsOn?o.userData.baseGlow:.06}});warmFill.intensity=lightsOn?38:4;coolFill.intensity=lightsOn?28:3;showToast(lightsOn?'Karussellbeleuchtung eingeschaltet':'Karussellbeleuchtung gedimmt')}
ui.lights.addEventListener('click',toggleLights);ui.lights.setAttribute('aria-pressed','true');
window.addEventListener('keydown',e=>{const target=e.target;if(e.code==='Space'&&!(target instanceof HTMLInputElement)&&!(target instanceof HTMLButtonElement)){e.preventDefault();if(phase==='ready')beginRide();else stopRide()}if(e.code==='Escape')stopRide();if(e.code==='KeyL'&&!(target instanceof HTMLInputElement)&&!(target instanceof HTMLButtonElement))toggleLights()});
const clock=new THREE.Clock();let elapsed=0;
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05);elapsed+=dt;if(toastTimer>0){toastTimer-=dt;if(toastTimer<=0)ui.toast.classList.remove('show')}
 if(phase==='boarding'){phaseElapsed+=dt;const count=Math.min(12,Math.floor(phaseElapsed/4.2*12));if(count!==occupied)setOccupancy(count);if(phaseElapsed>=4.2){setOccupancy(12);rideDuration=Math.round(32-14*desiredSpeed);setPhase('running');showToast('Alle Plätze belegt – gute Fahrt!')}}
 else if(phase==='running'){phaseElapsed+=dt;if(phaseElapsed>=rideDuration)completeRide()}
 else if(phase==='braking'){phaseElapsed+=dt;if(phaseElapsed>=3.2)completeRide()}
 else if(phase==='unloading'){phaseElapsed+=dt;const remaining=phaseElapsed<3.6?Math.ceil(occupied*(1-phaseElapsed/3.6)):0;if(remaining!==occupied)setOccupancy(remaining);if(phaseElapsed>=3.8){setOccupancy(0);setPhase('ready');showToast('Bereit für die nächste Runde – 12 Gäste warten.')}}
 const active=phase==='running'||phase==='braking';const target=active?desiredSpeed*(phase==='braking'?Math.max(0,1-phaseElapsed/3.2):1):0;rotorSpeed+=(target-rotorSpeed)*Math.min(1,dt*1.6);rotor.rotation.y+=rotorSpeed*dt;
 const swing=clamp(rotorSpeed/1.05,0,1);for(const s of swingData){const outward=1.1+swing*1.45+Math.sin(elapsed*2+s.phase)*.025;const x=Math.cos(s.a)*outward,z=Math.sin(s.a)*outward;const seatY=8.21-(1.2+swing*.45);s.chair.position.set(x,seatY,z);s.chair.rotation.y=-s.a+Math.PI/2;s.chain.position.set((s.anchor.x+x)/2,(s.anchor.y+seatY)/2,(s.anchor.z+z)/2);const delta=new THREE.Vector3(x-s.anchor.x,seatY-s.anchor.y,z-s.anchor.z);s.chain.scale.y=delta.length();s.chain.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());s.chair.rotation.z=Math.sin(elapsed*2+s.phase)*.018*swing}
 for(let i=0;i<canopyBulbs.length;i++){const bulb=canopyBulbs[i];if(lightsOn)bulb.material.emissiveIntensity=1.7+Math.sin(elapsed*4+i*.7)*.35}
 ui.time.textContent=phase==='ready'?'—':Math.ceil(Math.max(0,(phase==='boarding'?4.2:phase==='running'?rideDuration:phase==='braking'?3.2:3.8)-phaseElapsed))+'s';renderer.render(scene,camera)}
setPhase('ready');setOccupancy(0);animate();
