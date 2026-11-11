import * as THREE from 'three';

const host = document.querySelector('#scene');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#132b32');
scene.fog = new THREE.FogExp2('#132b32', 0.014);
const camera = new THREE.PerspectiveCamera(43, 1, 0.1, 120);
camera.position.set(0, 7.5, 14.5);
camera.lookAt(0, 0.2, -13);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
host.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xc9e3df, 0x182122, 1.35));
const keyLight = new THREE.DirectionalLight(0xffe6c6, 3.4);
keyLight.position.set(-5, 12, 4); keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.left = -12; keyLight.shadow.camera.right = 12;
keyLight.shadow.camera.top = 10; keyLight.shadow.camera.bottom = -42;
keyLight.shadow.bias = -0.00025; keyLight.shadow.radius = 3;
scene.add(keyLight);
const fill = new THREE.PointLight(0x33b8b2, 18, 30, 2); fill.position.set(6, 5, -12); scene.add(fill);
const warm = new THREE.PointLight(0xff8e52, 22, 26, 2); warm.position.set(-6, 4, -26); scene.add(warm);

const mat = (color, roughness=.5, metalness=0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
const floorMat = mat('#11262d', .88);
const darkMat = mat('#08171d', .62);
function box(name, x, y, z, sx, sy, sz, material, cast=false, receive=true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), material);
  mesh.name = name; mesh.position.set(x,y,z); mesh.castShadow=cast; mesh.receiveShadow=receive; scene.add(mesh); return mesh;
}

// The timber approach, oil-patterned lane boards, gutters, and the softly lit alley.
box('Bowling hall floor', 0, -.54, -13, 30, .34, 58, floorMat);
const laneCanvas = document.createElement('canvas'); laneCanvas.width=1024; laneCanvas.height=2048;
const ctx=laneCanvas.getContext('2d');
const wood=ctx.createLinearGradient(0,0,1024,0); wood.addColorStop(0,'#80533b');wood.addColorStop(.18,'#c28b61');wood.addColorStop(.5,'#d7aa7a');wood.addColorStop(.82,'#bc825a');wood.addColorStop(1,'#704932');ctx.fillStyle=wood;ctx.fillRect(0,0,1024,2048);
let seed=21; const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
for(let i=0;i<42;i++){let x=i*25+rand()*12;ctx.fillStyle=`rgba(${rand()>.5?'255,221,167':'73,39,24'},${.025+rand()*.05})`;ctx.fillRect(x,0,1+rand()*5,2048);}
for(let i=0;i<1400;i++){const x=rand()*1024,y=rand()*2048;ctx.fillStyle=`rgba(54,28,19,${rand()*.085})`;ctx.fillRect(x,y,rand()*35,1);}
// Soft, realistic oil sheen toward the pin deck.
const sheen=ctx.createLinearGradient(0,0,0,2048);sheen.addColorStop(0,'rgba(226,237,226,.10)');sheen.addColorStop(.25,'rgba(255,244,217,.22)');sheen.addColorStop(.72,'rgba(242,236,215,.15)');sheen.addColorStop(1,'rgba(255,255,255,.025)');ctx.fillStyle=sheen;ctx.fillRect(0,0,1024,2048);
const laneTex=new THREE.CanvasTexture(laneCanvas);laneTex.colorSpace=THREE.SRGBColorSpace;laneTex.anisotropy=renderer.capabilities.getMaxAnisotropy();laneTex.wrapS=THREE.ClampToEdgeWrapping;laneTex.wrapT=THREE.ClampToEdgeWrapping;
const lane=new THREE.Mesh(new THREE.BoxGeometry(3.35,.25,39),new THREE.MeshStandardMaterial({map:laneTex,roughness:.27,metalness:.04}));lane.position.set(0,-.25,-13);lane.receiveShadow=true;lane.castShadow=true;scene.add(lane);
// lane board joints and subtle approach markers
const boardLineMat=new THREE.MeshBasicMaterial({color:'#4c3025',transparent:true,opacity:.2});
for(let x=-1.52;x<=1.53;x+=.19){const line=new THREE.Mesh(new THREE.BoxGeometry(.008,.003,38.6),boardLineMat);line.position.set(x,-.122,-13);scene.add(line);}
const markerMat=new THREE.MeshStandardMaterial({color:'#472b20',roughness:.6});
for(const z of [-8,-11,-14,-17]) for(let i=-3;i<=3;i++){
  const triangle=new THREE.Mesh(new THREE.ConeGeometry(.045,.13,3),markerMat);triangle.rotation.x=-Math.PI/2;triangle.position.set(i*.3,-.115,z);scene.add(triangle);
}
// Ball return, gutters, rails and pin deck.
const gutterMat=mat('#202d2e',.31,.48), railMat=mat('#39291f',.36,.32);
for(const side of [-1,1]){
  const gutter=new THREE.Mesh(new THREE.BoxGeometry(.47,.18,39),gutterMat);gutter.position.set(side*1.91,-.39,-13);gutter.receiveShadow=true;gutter.castShadow=true;scene.add(gutter);
  const rail=new THREE.Mesh(new THREE.BoxGeometry(.105,.44,39.6),railMat);rail.position.set(side*2.22,-.15,-13);rail.castShadow=true;scene.add(rail);
  box('Alley side wall',side*4.6,1.3,-13,4.6,2.5,58,mat(side<0?'#142b30':'#18282a',.91));
  const neon=new THREE.Mesh(new THREE.BoxGeometry(.06,.035,28),new THREE.MeshBasicMaterial({color:side<0?'#e58d56':'#4bbdb2'}));neon.position.set(side*2.31,.1,-13);scene.add(neon);
}
box('Pin deck',0,-.22,-31.6,3.55,.18,3.6,mat('#c8956a',.32));
box('Far wall',0,4,-35.7,16,8,.35,mat('#16272a',.78));
for(let i=-3;i<=3;i++){
  const panel=new THREE.Mesh(new THREE.BoxGeometry(1.6,1.3,.09),mat(i%2?'#172d30':'#1d3031',.55));
  panel.position.set(i*2.2,3.1,-35.45);scene.add(panel);
}
// Glowing vintage overhead score/sign panels and ceiling fixtures.
for(let i=-2;i<=2;i++){
  const fixture=new THREE.Mesh(new THREE.BoxGeometry(2.4,.09,.38),new THREE.MeshBasicMaterial({color:i===0?'#ffbf79':'#d99d69'}));fixture.position.set(i*3.1,6.3,-15);scene.add(fixture);
  const glow=new THREE.PointLight(0xffbd81,12,10,2);glow.position.set(i*3.1,5.7,-14);scene.add(glow);
}
const sign=new THREE.Mesh(new THREE.PlaneGeometry(5.2,1.1),new THREE.MeshBasicMaterial({color:'#102326'}));sign.position.set(0,4.75,-35.48);scene.add(sign);

// Bowling ball with a polished two-tone reactive resin swirl and three finger holes.
const ballGroup=new THREE.Group(); scene.add(ballGroup);
const ballCanvas=document.createElement('canvas');ballCanvas.width=512;ballCanvas.height=256;const bc=ballCanvas.getContext('2d');
const bg=bc.createLinearGradient(0,0,512,256);bg.addColorStop(0,'#14a4ae');bg.addColorStop(.38,'#07556b');bg.addColorStop(.68,'#06a0a5');bg.addColorStop(1,'#092c4c');bc.fillStyle=bg;bc.fillRect(0,0,512,256);
for(let i=0;i<36;i++){bc.beginPath();bc.strokeStyle=`rgba(${i%2?'91,231,211':'16,34,81'},${.12+rand()*.24})`;bc.lineWidth=7+rand()*25;bc.ellipse(rand()*512,rand()*256,20+rand()*120,6+rand()*48,rand()*3.14,0,Math.PI*2);bc.stroke();}
const ballTex=new THREE.CanvasTexture(ballCanvas);ballTex.colorSpace=THREE.SRGBColorSpace;
const ballMesh=new THREE.Mesh(new THREE.SphereGeometry(.61,48,36),new THREE.MeshPhysicalMaterial({map:ballTex,roughness:.17,metalness:.12,clearcoat:.8,clearcoatRoughness:.12}));ballMesh.castShadow=true;ballMesh.receiveShadow=true;ballGroup.add(ballMesh);
const holeMat=new THREE.MeshStandardMaterial({color:'#031821',roughness:.3});
for(const p of [[-.17,.2,.55],[.17,.2,.55],[0,-.13,.59]]){
  const hole=new THREE.Mesh(new THREE.SphereGeometry(.067,16,12),holeMat);hole.position.set(...p);ballGroup.add(hole);
}
const ballGlow=new THREE.PointLight(0x29b9c5,1.4,2.3);ballGroup.add(ballGlow);
const ballState={x:0,z:3.3,vx:0,vz:0,rolling:false,spin:0};ballGroup.position.set(0,.39,ballState.z);

// Ten detailed, individually animated pins, with red neck bands and subtle specular finish.
const profile=[[0,0],[.13,.04],[.18,.15],[.19,.28],[.15,.42],[.105,.56],[.082,.72],[.093,.87],[.14,1.02],[.13,1.09],[.09,1.14],[0,1.15]];
const pinGeo=new THREE.LatheGeometry(profile.map(([r,y])=>new THREE.Vector2(r,y)),24);
const pinMat=new THREE.MeshPhysicalMaterial({color:'#f1eee1',roughness:.24,clearcoat:.7,clearcoatRoughness:.16});
const stripeMat=new THREE.MeshStandardMaterial({color:'#bf3e37',roughness:.25,metalness:.05});
const pinCoords=[];
for(let row=0;row<4;row++)for(let col=0;col<=row;col++)pinCoords.push([(col-row/2)*.49,-30.25-row*.48]);
const pins=[];
function makePin(x,z,index){
  const root=new THREE.Group();root.position.set(x,-.12,z);scene.add(root);
  const body=new THREE.Mesh(pinGeo,pinMat);body.castShadow=true;body.receiveShadow=true;root.add(body);
  for(const yy of [.82,.91]){const stripe=new THREE.Mesh(new THREE.TorusGeometry(.09,.018,8,24),stripeMat);stripe.position.y=yy;stripe.rotation.x=Math.PI/2;root.add(stripe);}
  const pin={root,x,z,index,rx:0,rz:0,vrx:0,vrz:0,vx:0,vz:0,hit:false,fallen:false,impactCooldown:0};pins.push(pin);
}
pinCoords.forEach(([x,z],i)=>makePin(x,z,i));

// A discreet lounge backdrop: tables, round stools, plants and warm pendant lights.
for(const side of [-1,1]){
  for(let i=0;i<3;i++){
    const z=-4-i*9, x=side*5.4;
    const table=new THREE.Mesh(new THREE.CylinderGeometry(.8,.86,.12,32),mat('#60412d',.29,.15));table.position.set(x,.85,z);table.castShadow=true;scene.add(table);
    const stem=new THREE.Mesh(new THREE.CylinderGeometry(.075,.12,.78,12),mat('#332b25',.3,.45));stem.position.set(x,.4,z);scene.add(stem);
    for(const j of [-1,1]){const stool=new THREE.Mesh(new THREE.CylinderGeometry(.34,.34,.12,24),mat('#9a5940',.33));stool.position.set(x+j*.98,.48,z+.3);stool.castShadow=true;scene.add(stool);}
    const lamp=new THREE.PointLight(side<0?0xffaa70:0x65bcb2,8,7,2);lamp.position.set(x,3.4,z);scene.add(lamp);
  }
}

const scoreRow=document.querySelector('#scoreRow');
const frames=Array.from({length:10},()=>({rolls:[],complete:false}));
let frameIndex=0, rollIndex=0, totalPins=0, shotCount=0, phase='ready', pointer=null, toastTimer, settleTimer=0, finishWait=0, soundOn=false, audioCtx=null;
const powerFill=document.querySelector('#powerFill'),powerText=document.querySelector('#powerText');
const status=document.querySelector('#gameStatus'),hint=document.querySelector('#dragHint'),aim=document.querySelector('#aimIndicator');
function drawScore(){
  scoreRow.innerHTML='';
  const allRolls=frames.flatMap(f=>f.rolls);let cursor=0,cumulative=0;const totals=[];
  for(let i=0;i<9;i++){
    const f=frames[i];let value=null;
    if(f.rolls.length){
      if(f.rolls[0]===10){if(allRolls.length>=cursor+3)value=10+allRolls[cursor+1]+allRolls[cursor+2];cursor+=1;}
      else if(f.rolls.length>=2){if(f.rolls[0]+f.rolls[1]===10&&allRolls.length>cursor+2)value=10+allRolls[cursor+2];else if(f.rolls[0]+f.rolls[1]<10)value=f.rolls[0]+f.rolls[1];cursor+=2;}
    }
    if(value!==null)cumulative+=value;totals.push(value===null?null:cumulative);
  }
  const tenth=frames[9];if(tenth.rolls.length>=2&&((tenth.rolls[0]===10)||(tenth.rolls[0]+tenth.rolls[1]===10)||tenth.rolls.length>=3)){cumulative+=tenth.rolls.reduce((a,b)=>a+b,0);totals.push(cumulative);}else totals.push(null);
  frames.forEach((f,i)=>{
    const el=document.createElement('div');el.className='frame'+(i===frameIndex?' current':'');
    const head=document.createElement('div');head.className='frame-head';head.textContent=String(i+1).padStart(2,'0');el.appendChild(head);
    const rolls=document.createElement('div');rolls.className='frame-rolls';
    const max=i===9?3:2;
    for(let n=0;n<max;n++){const cell=document.createElement('div');cell.className='roll-box';cell.textContent=f.rolls[n]===undefined?'':f.rolls[n]===10?'X':f.rolls[n]===0?'-':String(f.rolls[n]);rolls.appendChild(cell);}
    el.appendChild(rolls);const sum=document.createElement('div');sum.className='frame-total';sum.textContent=totals[i]===null?'':String(totals[i]);el.appendChild(sum);scoreRow.appendChild(el);
  });
  document.querySelector('#totalScore').textContent=cumulative?String(cumulative):'—';
  status.innerHTML=`<i></i> ${phase==='rolling'?'KUGEL ROLLT':phase==='settling'?'PINDECK':'BEREIT'}`;
}
function showToast(text){const el=document.querySelector('#toast');el.textContent=text;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2100);}
function audio(type='hit'){
  if(!soundOn)return;
  try{audioCtx ||= new AudioContext();if(audioCtx.state==='suspended')audioCtx.resume();const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=type==='hit'?'triangle':'sine';o.frequency.setValueAtTime(type==='hit'?180:440,audioCtx.currentTime);o.frequency.exponentialRampToValueAtTime(type==='hit'?65:220,audioCtx.currentTime+.16);g.gain.setValueAtTime(type==='hit'?.16:.06,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+.2);o.connect(g).connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+.21);}catch{}
}
function resetPins(){
  for(const p of pins){p.x=pinCoords[p.index][0];p.z=pinCoords[p.index][1];p.root.visible=true;p.root.position.set(p.x,-.12,p.z);p.root.rotation.set(0,0,0);p.rx=p.rz=p.vrx=p.vrz=p.vx=p.vz=0;p.hit=p.fallen=false;p.impactCooldown=0;}
}
function nextFrame(){
  if(frameIndex>=9){phase='done';status.innerHTML='<i></i> SPIEL BEENDET';showToast(`SPIEL BEENDET · ${totalPins} PUNKTE`);document.querySelector('#dragHint').classList.add('hidden');drawScore();return;}
  frameIndex++;rollIndex=0;resetPins();ballState.x=0;ballState.z=2.4;ballGroup.position.set(0,.39,ballState.z);ballState.vx=ballState.vz=0;ballState.rolling=false;phase='ready';drawScore();
}
function rollFinished(){
  const knocked=pins.filter(p=>p.fallen||Math.hypot(p.rx,p.rz)>.82).length;
  const standingBefore=10-frames[frameIndex].rolls.reduce((a,b)=>a+b,0);
  const scored=Math.min(standingBefore,knocked);frames[frameIndex].rolls.push(scored);totalPins+=scored;shotCount++;
  const strike=rollIndex===0&&scored===standingBefore;
  let done=false;
  if(frameIndex<9){done=strike||rollIndex===1;}
  else{done=frames[9].rolls.length>=2&&frames[9].rolls[0]+frames[9].rolls[1]<10||frames[9].rolls.length>=3;}
  if(frameIndex===9&&frames[9].rolls.length===2&&frames[9].rolls[0]+frames[9].rolls[1]>=10)done=false;
  if(frameIndex===9&&frames[9].rolls.length===1&&strike)done=false;
  if(done){frames[frameIndex].complete=true;drawScore();showToast(strike?'STRIKE! · ALLE ZEHN':'WURF ERFASST');setTimeout(nextFrame,1550);}
  else{
    rollIndex++;drawScore();showToast(scored===0?'KEIN TREFFER':strike?'STRIKE! · ALLE ZEHN':scored>=standingBefore?'SPARE! · SAUBER GERÄUMT':`${scored} ${scored===1?'PIN':'PINS'} GEFALLEN`);
    if(strike&&frameIndex===9){resetPins();}
    else for(const p of pins)if(p.fallen){p.root.visible=false;}
    ballState.x=0;ballState.z=2.4;ballGroup.position.set(0,.39,ballState.z);ballState.vx=ballState.vz=0;ballState.rolling=false;phase='ready';drawScore();document.querySelector('#dragHint').classList.remove('hidden');
  }
}
function fireShot(dx,dy){
  const power=Math.max(.15,Math.min(1,(-dy-22)/210));
  if(dy>-20){showToast('ZIEH NACH VORNE UND LASS LOS');return;}
  const steer=Math.max(-1,Math.min(1,dx/(host.clientWidth*.3)));
  ballState.x=Math.max(-.9,Math.min(.9,steer*.68));ballState.z=3.3;
  ballState.vx=steer*(1.35+power*2.35);ballState.vz=-(12+power*16);ballState.spin=steer*9+power*5;ballState.rolling=true;
  ballGroup.position.set(ballState.x,.39,ballState.z);phase='rolling';hint.classList.add('hidden');document.querySelector('#powerText').textContent=`${Math.round(power*100)}%`;powerFill.style.width=`${Math.round(power*100)}%`;aim.style.opacity='.8';aim.style.transform=`translateX(${steer*85}px)`;drawScore();audio('release');
}
function pointerDown(e){
  if(phase!=='ready'||e.button!==undefined&&e.button!==0)return;
  const rect=host.getBoundingClientRect();if(e.clientY<rect.top+rect.height*.42)return;
  pointer={id:e.pointerId,x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,moved:false};renderer.domElement.setPointerCapture?.(e.pointerId);hint.classList.add('hidden');
}
function pointerMove(e){
  if(!pointer||e.pointerId!==pointer.id)return;
  const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;pointer.lastX=e.clientX;pointer.lastY=e.clientY;pointer.moved=true;
  const strength=Math.max(0,Math.min(100,Math.round((-dy-22)/2.1)));powerFill.style.width=`${strength}%`;powerText.textContent=strength?`${strength}%`:'—';aim.style.opacity='.75';aim.style.transform=`translateX(${Math.max(-95,Math.min(95,dx*.32))}px)`;
}
function pointerUp(e){if(!pointer||e.pointerId!==pointer.id)return;const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;pointer=null;aim.style.opacity='.35';fireShot(dx,dy);}
renderer.domElement.addEventListener('pointerdown',pointerDown);renderer.domElement.addEventListener('pointermove',pointerMove);renderer.domElement.addEventListener('pointerup',pointerUp);renderer.domElement.addEventListener('pointercancel',()=>{pointer=null;});

function impactPin(pin, strength, direction){
  pin.hit=true;pin.impactCooldown=.24;pin.vx+=direction*strength*.48;pin.vz+=strength*.35;
  pin.vrz+=direction*strength*1.3+(Math.random()-.5)*.8;pin.vrx+=(Math.random()-.5)*strength*1.1;
  audio('hit');
}
function updateBall(dt){
  if(!ballState.rolling)return;
  ballState.x+=ballState.vx*dt;ballState.z+=ballState.vz*dt;
  const friction=Math.pow(.991,dt*60);ballState.vx*=friction;ballState.vz*=Math.pow(.996,dt*60);
  ballState.spin+=dt*ballState.vz*2.1;
  if(Math.abs(ballState.x)>1.65){ballState.vx*=-.58;ballState.x=Math.sign(ballState.x)*1.62;audio('hit');}
  ballGroup.position.set(ballState.x,.39,ballState.z);ballMesh.rotation.x=ballState.spin;ballMesh.rotation.z=ballState.x*.55;
  // Ball-pin contact is evaluated in the lane plane; momentum tips and displaces the contacted pin.
  for(const p of pins){if(p.fallen||p.impactCooldown>0)continue;const dx=p.x-ballState.x,dz=p.z-ballState.z,dist=Math.hypot(dx,dz);if(dist<.69&&ballState.z<p.z+.15&&ballState.z>p.z-.7){const direction=dx===0?(ballState.vx>=0?1:-1):Math.sign(dx);impactPin(p,Math.min(12,Math.abs(ballState.vz)*.33),direction);ballState.vz*=.77;ballState.vx+=direction*.7;}}
  if(ballState.z < -32 || Math.abs(ballState.vz)<1.5){ballState.rolling=false;phase='settling';settleTimer=2.2;drawScore();}
}
function updatePins(dt){
  const moving=pins.filter(p=>p.hit&&!p.fallen);
  for(const p of pins){
    p.impactCooldown=Math.max(0,p.impactCooldown-dt);
    if(!p.hit)continue;
    // Gravity pulls a struck pin down while its base slides over the polished deck.
    const angle=Math.hypot(p.rx,p.rz);const tipping=Math.max(0,Math.sin(Math.min(angle,1.55)))*7.2;
    p.vrx+=Math.sign(p.rx||p.vrx||1)*tipping*dt*.36;p.vrz+=Math.sign(p.rz||p.vrz||1)*tipping*dt*.36;
    p.rx+=p.vrx*dt;p.rz+=p.vrz*dt;p.vrx*=Math.pow(.985,dt*60);p.vrz*=Math.pow(.985,dt*60);
    p.x+=p.vx*dt;p.z+=p.vz*dt;p.vx*=Math.pow(.965,dt*60);p.vz*=Math.pow(.965,dt*60);
    if(angle>1.18){p.fallen=true;p.vrx*=.2;p.vrz*=.2;}
    p.root.position.set(p.x,-.12,p.z);p.root.rotation.set(p.rx,0,p.rz,'XYZ');
  }
  // Secondary pin-to-pin collisions create believable chain reactions through the rack.
  for(const p of moving){for(const q of pins){if(p===q||q.fallen||q.hit)continue;const dx=q.x-p.x,dz=q.z-p.z,dist=Math.hypot(dx,dz);if(dist<.52&&Math.hypot(p.vx,p.vz)+Math.hypot(p.vrx,p.vrz)>.8){const d=dist||.01;impactPin(q,Math.min(8,.9+Math.hypot(p.vx,p.vz)*.8+Math.hypot(p.vrx,p.vrz)*.25),Math.sign(dx||1));q.vx+=p.vx*.45+dx/d*.5;q.vz+=p.vz*.45+dz/d*.5;}}
  }
}

function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
window.addEventListener('resize',resize);new ResizeObserver(resize).observe(host);resize();

document.querySelector('#resetButton').addEventListener('click',()=>{
  frames.forEach(f=>{f.rolls=[];f.complete=false});frameIndex=rollIndex=totalPins=shotCount=0;phase='ready';resetPins();ballState.x=0;ballState.z=3.3;ballState.vx=ballState.vz=0;ballState.rolling=false;ballGroup.position.set(0,.39,3.3);hint.classList.remove('hidden');powerFill.style.width='3%';powerText.textContent='—';drawScore();showToast('NEUES SPIEL · VIEL ERFOLG');
});
document.querySelector('#soundButton').addEventListener('click',e=>{soundOn=!soundOn;e.currentTarget.querySelector('span:last-child').textContent=soundOn?'TON AN':'TON AUS';e.currentTarget.querySelector('.sound-icon').textContent=soundOn?'♪':'♩';if(soundOn)audio('release');});
document.querySelector('#ballChoice').addEventListener('click',()=>showToast('STORM · 14 LB · REACTIVE RESIN'));

drawScore();
let last=performance.now();
function animate(now){requestAnimationFrame(animate);const dt=Math.min(.04,(now-last)/1000);last=now;updateBall(dt);updatePins(dt);
  if(phase==='settling'){settleTimer-=dt;if(settleTimer<=0){phase='ready';rollFinished();}}
  renderer.render(scene,camera);
}
requestAnimationFrame(animate);
