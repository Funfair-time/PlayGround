import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const canvas = document.querySelector('#game');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.18;
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x090913, .006);
const camera = new THREE.PerspectiveCamera(37, 1, .1, 100);
camera.up.set(0, 1, 0);
camera.position.set(0, -9.5, 28.5);
camera.lookAt(0, 0, 0);
const clock = new THREE.Clock();

const C = { cyan: 0x62efff, pink: 0xff4fab, gold: 0xffc766, violet: 0x9571ff, blue: 0x4c79ff };
const mat = (color, emissive = color, power = .15, metalness = .42, roughness = .32) => new THREE.MeshStandardMaterial({ color, emissive, emissiveIntensity: power, metalness, roughness });
const M = {
  frame: mat(0x202236, 0x29233f, .22, .72, .24),
  edge: mat(0xe5a951, 0x7d4b1f, .42, .78, .2),
  field: mat(0x101725, 0x11182c, .35, .28, .4),
  dark: mat(0x080c17, 0x111b30, .35, .45, .29),
  cyan: mat(C.cyan, C.cyan, 1.5, .45, .2),
  pink: mat(C.pink, C.pink, 1.3, .4, .22),
  gold: mat(C.gold, C.gold, 1.05, .65, .2),
  white: mat(0xe8f7ff, 0x74cfff, .75, .6, .16),
};
scene.add(new THREE.HemisphereLight(0x9caaff, 0x151020, 2.25));
const keyLight = new THREE.DirectionalLight(0xffffff, 3.2); keyLight.position.set(-5, 7, 16); keyLight.castShadow = true; keyLight.shadow.mapSize.set(1024, 1024); scene.add(keyLight);
const pinkLight = new THREE.PointLight(C.pink, 75, 12); pinkLight.position.set(-3, 5, 3); scene.add(pinkLight);
const cyanLight = new THREE.PointLight(C.cyan, 55, 11); cyanLight.position.set(3, -4, 3); scene.add(cyanLight);
const table = new THREE.Group(); scene.add(table);

function box(w, h, d, material, x, y, z, parent = table) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
function cylinder(r, depth, material, x, y, z, segments = 32) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, depth, segments), material);
  mesh.rotation.x = Math.PI / 2; mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; table.add(mesh); return mesh;
}
function ring(radius, tube, material, x, y, z, parent = table) {
  const mesh = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 10, 48), material);
  mesh.position.set(x, y, z); mesh.castShadow = true; parent.add(mesh); return mesh;
}
function line(points, material, width = .035, parent = table) {
  const curve = new THREE.CatmullRomCurve3(points.map(([x, y, z = .08]) => new THREE.Vector3(x, y, z)));
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, Math.max(12, points.length * 8), width / 2, 6, false), material);
  parent.add(mesh); return mesh;
}
function textSprite(text, color, size = 96) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 128;
  const ctx = c.getContext('2d'); ctx.font = `700 ${size}px Rajdhani, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.shadowColor = color; ctx.shadowBlur = 20; ctx.fillStyle = color; ctx.fillText(text, 256, 64);
  const texture = new THREE.CanvasTexture(c); texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }));
  sprite.scale.set(3.1, .78, 1); sprite.position.z = .24; table.add(sprite); return sprite;
}

// Deep, jewel-toned cabinet with illuminated trim.
box(11.45, 20.35, .72, M.frame, 0, 0, -.54);
box(10.82, 19.72, .12, M.field, 0, 0, -.09);
box(11.18, 20.07, .08, M.edge, 0, 0, -.15);
box(10.78, 19.68, .06, M.field, 0, 0, -.095);
// inner playfield inlay
for (let x = -4.7; x <= 4.71; x += .5) line([[x, -8.45, -.045], [x, 7.95, -.045]], mat(0x263552, 0x1e4165, .28, .25, .6), .012);
for (let y = -8.4; y <= 8.41; y += .5) line([[-4.7, y, -.044], [4.7, y, -.044]], mat(0x263552, 0x1e4165, .25, .25, .6), .012);
// luminous edge rails + outside cabinet accents
for (const x of [-5.23, 5.23]) {
  box(.25, 19.25, .56, M.edge, x, 0, .13);
  box(.11, 18.85, .12, x < 0 ? M.pink : M.cyan, x + (x < 0 ? .12 : -.12), 0, .34);
  for (let y = -8.5; y <= 8.5; y += 1.4) cylinder(.065, .085, (Math.round(y * 10) % 2 ? M.cyan : M.pink), x, y, .43, 16);
}
for (const y of [-9.55, 9.55]) box(10.65, .24, .48, M.edge, 0, y, .13);
// bolts / corner caps
for (const x of [-5.23, 5.23]) for (const y of [-9.3, 9.3]) { cylinder(.19, .08, M.dark, x, y, .45); ring(.12, .025, M.gold, x, y, .5); }

// Art-deco circuitry, scoring lanes and the neon title.
line([[-4.55, -4.6], [-3.9, -4.05], [-3.9, -1.6], [-4.6, -.95]], M.cyan, .045);
line([[4.55, -4.6], [3.9, -4.05], [3.9, -1.6], [4.6, -.95]], M.pink, .045);
line([[-4.6, 5.2], [-3.95, 6], [-3.95, 7.1], [-3.3, 7.65]], M.pink, .04);
line([[4.6, 5.2], [3.95, 6], [3.95, 7.1], [3.3, 7.65]], M.cyan, .04);
const title = textSprite('NEON FLUX', '#85f5ff', 94); title.position.set(0, 7.9, .18); title.scale.set(4.4, .84, 1);
const lowerLabel = textSprite('MULTIBALL  ·  10 000', '#ff6ab7', 58); lowerLabel.position.set(0, -4.1, .18); lowerLabel.scale.set(3.5, .58, 1);
// upper orbit and spinner graphics
for (const [x, color] of [[-2.7, M.pink], [2.7, M.cyan]]) {
  const loop = ring(1.05, .035, color, x, 5.45, .06); loop.scale.set(.85, 1.2, 1);
  ring(.76, .014, M.gold, x, 5.45, .04);
  cylinder(.14, .16, M.gold, x, 5.45, .26);
  box(.07, 1.25, .05, color, x, 5.45, .27).rotation.z = x < 0 ? -.38 : .38;
}
// standup target panels
const targets = [];
for (const [x, y, color, value] of [[-3.48, 2.4, M.pink, 2500], [-1.72, 3.6, M.cyan, 2500], [0, 2.75, M.gold, 5000], [1.72, 3.6, M.cyan, 2500], [3.48, 2.4, M.pink, 2500]]) {
  const target = new THREE.Group(); target.position.set(x, y, .15); table.add(target);
  const plate = new THREE.Mesh(new THREE.BoxGeometry(.78, .17, .18), M.dark); target.add(plate); plate.castShadow = true;
  const light = box(.57, .045, .045, color, x, y, .28); // individual glow tile
  ring(.1, .025, color, x, y, .3);
  targets.push({ x, y, r: .57, value, mesh: target, light, last: 0 });
}
// bank target underglow trims
line([[-4.12, 1.85], [-2.7, 4.15], [0, 3.2], [2.7, 4.15], [4.12, 1.85]], M.gold, .04);

const bumpers = [];
for (const [x, y, color, value] of [[-2.55, 1.1, M.pink, 1000], [0, .55, M.cyan, 1500], [2.55, 1.1, M.pink, 1000]]) {
  cylinder(.83, .3, M.edge, x, y, .13, 48);
  cylinder(.7, .27, M.dark, x, y, .3, 48);
  const halo = ring(.69, .105, color, x, y, .48);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(.48, 32, 20), mat(0x273b56, color.color, 1.6, .5, .16)); cap.position.set(x, y, .46); cap.scale.z = .55; cap.castShadow = true; table.add(cap);
  ring(.42, .035, M.white, x, y, .68);
  cylinder(.16, .08, M.white, x, y, .71, 24);
  for (let n = 0; n < 8; n++) { const a = n * Math.PI / 4; cylinder(.045, .04, color, x + Math.cos(a) * .79, y + Math.sin(a) * .79, .53, 12); }
  bumpers.push({ x, y, r: .89, value, halo, cap, phase: x + 3 });
}
// metal posts, triangular sling walls
const posts = [];
for (const [x, y] of [[-4.1, -3.5], [4.1, -3.5], [-3.5, -6.1], [3.5, -6.1], [-1.3, -6.25], [1.3, -6.25]]) {
  cylinder(.16, .24, M.edge, x, y, .28, 24); ring(.115, .035, M.white, x, y, .43); posts.push({ x, y, r: .22 });
}
line([[-4.2, -3.45], [-3.45, -5.3], [-2.8, -5.75]], M.pink, .12);
line([[4.2, -3.45], [3.45, -5.3], [2.8, -5.75]], M.cyan, .12);
line([[-4.2, -3.45], [-3.45, -5.3], [-2.8, -5.75]], M.edge, .035);
line([[4.2, -3.45], [3.45, -5.3], [2.8, -5.75]], M.edge, .035);
// Plunger lane with a moving, spring-loaded ball launcher.
box(.035, 12.2, .07, M.gold, 3.58, -2.9, .18);
line([[3.78, -8.9], [4.68, -8.9], [4.68, 3.9], [4.33, 5.0], [3.68, 5.6]], M.cyan, .075);
for (let y = -7.9; y <= -4.9; y += .7) line([[3.82, y, .06], [4.55, y, .06]], M.gold, .025);
const spring = new THREE.Group(); spring.position.set(4.23, -8.4, .2); table.add(spring);
for (let i = 0; i < 9; i++) ring(.15, .026, M.edge, 0, i * .12, 0, spring);
// sling light strips and playfield inserts
for (let i = 0; i < 7; i++) {
  cylinder(.055, .05, i % 2 ? M.pink : M.cyan, -4.25 + i * .14, -4.1 - i * .18, .2, 16);
  cylinder(.055, .05, i % 2 ? M.cyan : M.pink, 4.25 - i * .14, -4.1 - i * .18, .2, 16);
}
for (const [x, y, color] of [[-4.25, 7.2, M.gold], [4.25, 7.2, M.gold], [-4.5, 0, M.cyan], [4.5, 0, M.pink]]) { ring(.23, .04, color, x, y, .25); cylinder(.105, .06, color, x, y, .26, 20); }

// Responsive, slightly tilted top-down camera keeps the whole cabinet visible.
function resize() {
  const w = innerWidth, h = innerHeight, aspect = w / h;
  renderer.setSize(w, h, false); camera.aspect = aspect;
  const distance = aspect < .72 ? 30 : aspect < 1 ? 27 : 26;
  camera.position.set(0, -distance * .29, distance); camera.lookAt(0, 0, 0);
  camera.fov = aspect < .72 ? 39 : 37; camera.updateProjectionMatrix();
}
addEventListener('resize', resize); resize();

const ballGeo = new THREE.SphereGeometry(.24, 28, 20);
const ballMat = new THREE.MeshStandardMaterial({ color: 0xf6fbff, metalness: .88, roughness: .12, emissive: 0x426b94, emissiveIntensity: .28 });
const ball = new THREE.Mesh(ballGeo, ballMat); ball.castShadow = true; ball.visible = false; table.add(ball);
const ballGlow = new THREE.PointLight(0x69eaff, 4, 2.4); scene.add(ballGlow);
const flippers = [
  { side: 'left', pivot: [-1.22, -6.62], length: 2.35, rest: .05, active: .78, angle: .05, pressed: false, mesh: null },
  { side: 'right', pivot: [1.22, -6.62], length: 2.35, rest: 3.09, active: 2.36, angle: 3.09, pressed: false, mesh: null },
];
for (const f of flippers) {
  const group = new THREE.Group(); group.position.set(f.pivot[0], f.pivot[1], .45); table.add(group); f.mesh = group;
  const shaft = new THREE.Mesh(new THREE.CapsuleGeometry(.15, f.length - .3, 5, 14), M.gold); shaft.rotation.z = Math.PI / 2; shaft.position.x = f.length / 2; shaft.castShadow = true; group.add(shaft);
  const trim = new THREE.Mesh(new THREE.CapsuleGeometry(.09, f.length - .36, 5, 12), f.side === 'left' ? M.cyan : M.pink); trim.rotation.z = Math.PI / 2; trim.position.set(f.length / 2, 0, .13); group.add(trim);
  const pivot = new THREE.Mesh(new THREE.CylinderGeometry(.28, .28, .22, 32), M.edge); pivot.rotation.x = Math.PI / 2; group.add(pivot);
  ring(.2, .045, M.white, 0, 0, .16, group);
}

const $ = (id) => document.getElementById(id);
const statusLabel = $('statusLabel'), scoreEl = $('score'), ballsEl = $('balls'), ballCountEl = $('ballCount'), multiplierEl = $('multiplier'), comboMeter = $('comboMeter');
const callout = $('callout'), calloutText = $('calloutText'), toast = $('toast');
let score = 0, highScore = Number(localStorage.getItem('neonFluxHighScore') || 0), ballsLeft = 3, multiplier = 1, combo = 0, comboTimer = 0;
let gameState = 'menu', ballReady = false, inLane = false, ballPosition = new THREE.Vector3(), velocity = new THREE.Vector2(), elapsed = 0;
let toastTimeout, calloutTimeout, lastSound = 0, audioCtx = null, soundOn = true, nudgeCooldown = 0;
$('highScore').textContent = String(highScore).padStart(8, '0');

function updateHud() {
  scoreEl.textContent = String(score).padStart(8, '0');
  ballsEl.innerHTML = `${ballsLeft >= 1 ? '●' : '<i>●</i>'} ${ballsLeft >= 2 ? '●' : '<i>●</i>'} ${ballsLeft >= 3 ? '●' : '<i>●</i>'}`;
  ballCountEl.textContent = `${ballsLeft} ${ballsLeft === 1 ? 'VERSUCH' : 'VERSUCHE'}`;
  multiplierEl.textContent = `×${multiplier}`;
  comboMeter.style.width = `${Math.max(0, comboTimer / 5) * 100}%`;
}
function showCallout(text, duration = 800) {
  calloutText.textContent = text; callout.classList.add('show'); clearTimeout(calloutTimeout);
  calloutTimeout = setTimeout(() => callout.classList.remove('show'), duration);
}
function announcePoints(points, x, y) {
  toast.textContent = `+${points.toLocaleString('de-DE')}`;
  toast.style.left = `${Math.max(30, Math.min(innerWidth - 30, innerWidth / 2 + x * Math.min(innerWidth / 19, 38)))}px`;
  toast.style.top = `${Math.max(105, innerHeight / 2 - y * Math.min(innerHeight / 21, 34))}px`;
  toast.classList.add('show'); clearTimeout(toastTimeout); toastTimeout = setTimeout(() => toast.classList.remove('show'), 560);
}
function scoreHit(base, x, y, label = '') {
  const points = base * multiplier; score += points; combo = Math.min(5, combo + 1); comboTimer = 5;
  if (combo >= 3) multiplier = Math.min(5, 1 + Math.floor(combo / 2));
  announcePoints(points, x, y); if (label) showCallout(label, 650); updateHud();
}
function audio() {
  if (!soundOn) return null;
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume(); return audioCtx;
}
function blip(freq = 440, duration = .09, type = 'sine', volume = .055, endFreq = null) {
  const ctx = audio(); if (!ctx) return;
  const osc = ctx.createOscillator(), gain = ctx.createGain(); osc.type = type; osc.frequency.setValueAtTime(freq, ctx.currentTime);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(30, endFreq), ctx.currentTime + duration);
  gain.gain.setValueAtTime(volume, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + duration);
  osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + duration);
}
function playHit(kind = 'bumper') {
  const now = performance.now(); if (now - lastSound < 48) return; lastSound = now;
  if (kind === 'bumper') { blip(680 + Math.random() * 260, .15, 'triangle', .075, 1150); blip(1100, .07, 'sine', .035, 500); }
  else if (kind === 'flipper') blip(180, .07, 'square', .035, 90);
  else if (kind === 'target') blip(420, .18, 'triangle', .06, 1100);
  else blip(280, .06, 'sine', .025, 170);
}
function resetBall() {
  ballPosition.set(4.23, -8.34, .42); velocity.set(0, 0); ball.position.copy(ballPosition); ball.visible = true; ballReady = true; inLane = true;
  $('launchControl').classList.remove('active'); statusLabel.textContent = 'KUGEL GELADEN';
}
function startGame() {
  audio(); $('startOverlay').classList.add('hidden'); $('endOverlay').classList.add('hidden');
  score = 0; ballsLeft = 3; multiplier = 1; combo = 0; comboTimer = 0; gameState = 'ready'; resetBall(); updateHud();
  showCallout('DREI KUGELN. ZEIG WAS DU KANNST.', 1500);
}
function launchBall() {
  if (!['ready', 'playing'].includes(gameState) || !ballReady) return;
  audio(); ballReady = false; gameState = 'playing'; inLane = true;
  velocity.set((Math.random() - .5) * .65, 16.7); statusLabel.textContent = 'BALL IM SPIEL';
  spring.scale.y = .65; setTimeout(() => { spring.scale.y = 1; }, 120); blip(125, .22, 'sawtooth', .055, 700); blip(620, .1, 'triangle', .035, 980);
}
function drainBall() {
  if (!['playing', 'ready'].includes(gameState)) return;
  ball.visible = false; ballReady = false; ballsLeft = Math.max(0, ballsLeft - 1); combo = 0; comboTimer = 0; multiplier = 1; updateHud();
  blip(200, .3, 'triangle', .065, 60); showCallout(ballsLeft ? 'KUGEL VERLOREN' : 'GAME OVER', 1100);
  if (ballsLeft > 0) {
    gameState = 'ready'; statusLabel.textContent = 'NEUE KUGEL';
    setTimeout(() => { if (gameState === 'ready') { resetBall(); showCallout('NÄCHSTE KUGEL BEREIT', 1000); } }, 950);
  } else {
    gameState = 'over'; statusLabel.textContent = 'RUNDE BEENDET';
    if (score > highScore) { highScore = score; localStorage.setItem('neonFluxHighScore', highScore); $('highScore').textContent = String(highScore).padStart(8, '0'); }
    $('finalScore').textContent = String(score).padStart(8, '0');
    setTimeout(() => $('endOverlay').classList.remove('hidden'), 850);
  }
}

$('startButton').addEventListener('click', startGame);
$('restartButton').addEventListener('click', startGame);
$('launchControl').addEventListener('pointerdown', (event) => { event.preventDefault(); launchBall(); });
$('soundToggle').addEventListener('click', () => {
  soundOn = !soundOn; $('soundText').textContent = soundOn ? 'SOUND AN' : 'SOUND AUS'; $('soundToggle').setAttribute('aria-label', soundOn ? 'Sound ausschalten' : 'Sound einschalten');
  $('soundToggle').style.color = soundOn ? '' : '#77758d'; if (soundOn) { audio(); blip(660, .09, 'sine', .035); }
});
function setFlipper(side, down) {
  const f = flippers.find(item => item.side === side); if (!f || f.pressed === down) return;
  f.pressed = down; if (down && gameState === 'playing') playHit('flipper');
}
function keyDown(event) {
  if (['Space', 'ArrowLeft', 'ArrowRight'].includes(event.code)) event.preventDefault();
  if (event.repeat) return;
  if (event.code === 'Space' || event.code === 'ArrowDown') { if (gameState === 'menu') startGame(); else launchBall(); }
  if (event.code === 'ArrowLeft' || event.code === 'KeyA') setFlipper('left', true);
  if (event.code === 'ArrowRight' || event.code === 'KeyD') setFlipper('right', true);
  if (event.code === 'ShiftLeft' || event.code === 'ShiftRight' || event.code === 'ArrowUp') nudge();
}
function keyUp(event) {
  if (event.code === 'ArrowLeft' || event.code === 'KeyA') setFlipper('left', false);
  if (event.code === 'ArrowRight' || event.code === 'KeyD') setFlipper('right', false);
}
addEventListener('keydown', keyDown); addEventListener('keyup', keyUp); addEventListener('blur', () => flippers.forEach(f => f.pressed = false));
for (const [id, side] of [['leftControl', 'left'], ['rightControl', 'right']]) {
  const button = $(id); button.addEventListener('pointerdown', e => { e.preventDefault(); button.setPointerCapture(e.pointerId); setFlipper(side, true); button.classList.add('active'); });
  const release = () => { setFlipper(side, false); button.classList.remove('active'); };
  button.addEventListener('pointerup', release); button.addEventListener('pointercancel', release); button.addEventListener('lostpointercapture', release);
}
function nudge() {
  if (gameState !== 'playing' || nudgeCooldown > 0) return; nudgeCooldown = .42; velocity.x += Math.random() < .5 ? -2.6 : 2.6; velocity.y += 1.1; blip(90, .08, 'square', .035, 45);
}

function pointSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l2));
  return { x: ax + t * dx, y: ay + t * dy, t };
}
function collideCircle(obj, radius, restitution = .87) {
  const dx = ballPosition.x - obj.x, dy = ballPosition.y - obj.y, d = Math.hypot(dx, dy), min = radius + .24;
  if (d >= min || d < .0001) return false;
  const nx = dx / d, ny = dy / d, dot = velocity.x * nx + velocity.y * ny;
  ballPosition.x = obj.x + nx * min; ballPosition.y = obj.y + ny * min;
  if (dot < 0) { velocity.x -= (1 + restitution) * dot * nx; velocity.y -= (1 + restitution) * dot * ny; }
  return true;
}
function collideSegment(ax, ay, bx, by, strength = 1) {
  const near = pointSegment(ballPosition.x, ballPosition.y, ax, ay, bx, by), dx = ballPosition.x - near.x, dy = ballPosition.y - near.y, d = Math.hypot(dx, dy);
  if (d > .42 || d < .001) return false;
  let nx = dx / d, ny = dy / d;
  if (ny < .18) { const len = Math.hypot(nx, ny); nx /= len; ny /= len; if (ny < 0) { nx *= -1; ny *= -1; } }
  ballPosition.x = near.x + nx * .43; ballPosition.y = near.y + ny * .43;
  const dot = velocity.x * nx + velocity.y * ny;
  if (dot < 0) { velocity.x -= 1.8 * dot * nx; velocity.y -= 1.8 * dot * ny; }
  velocity.y = Math.max(velocity.y, 3.2 + strength * 2.6);
  velocity.x += (nx + (near.x - (ax + bx) / 2) * .22) * strength * 1.4;
  velocity.x = THREE.MathUtils.clamp(velocity.x, -13, 13); velocity.y = Math.min(velocity.y, 21);
  return true;
}
function bumperHit(item) {
  if (!collideCircle(item, item.r, 1.32)) return;
  const dx = ballPosition.x - item.x, dy = ballPosition.y - item.y, d = Math.hypot(dx, dy) || 1;
  ballPosition.x = item.x + dx / d * (item.r + .25); ballPosition.y = item.y + dy / d * (item.r + .25);
  velocity.x += dx / d * 3.2; velocity.y += dy / d * 3.2 + 1.4;
  item.cap.scale.setScalar(1.15); item.last = elapsed; scoreHit(item.value, item.x, item.y, 'B U M P E R !'); playHit('bumper');
  pinkLight.intensity = item.x < 0 ? 120 : 45; cyanLight.intensity = item.x > 0 ? 105 : 40;
}
function simulate(dt) {
  nudgeCooldown = Math.max(0, nudgeCooldown - dt);
  for (const f of flippers) {
    const target = f.pressed ? f.active : f.rest;
    f.angle = THREE.MathUtils.damp(f.angle, target, f.pressed ? 28 : 18, dt);
    f.mesh.rotation.z = f.angle;
  }
  if (comboTimer > 0) { comboTimer = Math.max(0, comboTimer - dt); if (comboTimer === 0) { combo = 0; multiplier = 1; } updateHud(); }
  if (gameState !== 'playing') return;
  velocity.y -= 12.6 * dt;
  velocity.x *= Math.pow(.999, dt * 60); velocity.y *= Math.pow(.998, dt * 60);
  const speed = Math.hypot(velocity.x, velocity.y); if (speed > 23) velocity.multiplyScalar(23 / speed);
  ballPosition.x += velocity.x * dt; ballPosition.y += velocity.y * dt;
  if (inLane && ballPosition.y > 5.25) { inLane = false; velocity.x = -Math.max(4.2, Math.abs(velocity.x)); velocity.y = Math.max(velocity.y, 5.5); showCallout('LET IT RIDE!', 700); }
  if (inLane && ballPosition.y < 5.25 && ballPosition.x < 3.78) { ballPosition.x = 3.82; velocity.x = Math.abs(velocity.x) * .65; }
  if (!inLane && ballPosition.x > 3.52 && ballPosition.y < 5.15) { ballPosition.x = 3.52; velocity.x = -Math.abs(velocity.x) * .87; }
  if (ballPosition.x < -4.78) { ballPosition.x = -4.78; velocity.x = Math.abs(velocity.x) * .82; }
  if (ballPosition.x > 4.78) { ballPosition.x = 4.78; velocity.x = -Math.abs(velocity.x) * .82; }
  if (ballPosition.y > 8.92) { ballPosition.y = 8.92; velocity.y = -Math.abs(velocity.y) * .82; }
  // Lit rollover switches at the top of the table.
  for (const t of targets) {
    const dx = ballPosition.x - t.x, dy = ballPosition.y - t.y;
    if (dx * dx + dy * dy < .7 * .7 && elapsed - t.last > .55) {
      t.last = elapsed; t.mesh.position.z = .35; setTimeout(() => { t.mesh.position.z = .15; }, 90);
      scoreHit(t.value, t.x, t.y, t.value === 5000 ? 'JACKPOT!' : 'TARGET!'); playHit('target');
      velocity.y = Math.max(velocity.y, 7); velocity.x += Math.sign(dx || (Math.random() - .5)) * 1.2;
    }
  }
  for (const item of bumpers) bumperHit(item);
  for (const p of posts) {
    if (collideCircle(p, p.r, .92)) { playHit('metal'); scoreHit(250, p.x, p.y); }
  }
  if (collideSegment(-4.2, -3.45, -2.8, -5.75, .45)) { scoreHit(500, -3.45, -4.65, 'SLINGSHOT!'); playHit('target'); }
  if (collideSegment(4.2, -3.45, 2.8, -5.75, .45)) { scoreHit(500, 3.45, -4.65, 'SLINGSHOT!'); playHit('target'); }
  for (const f of flippers) {
    const ax = f.pivot[0], ay = f.pivot[1], bx = ax + Math.cos(f.angle) * f.length, by = ay + Math.sin(f.angle) * f.length;
    if (collideSegment(ax, ay, bx, by, f.pressed ? 1.4 : .25)) playHit('flipper');
  }
  // Drain channel: only a moving ball below the flippers is lost.
  if (ballPosition.y < -9.05) { drainBall(); return; }
  ball.position.set(ballPosition.x, ballPosition.y, .46 + Math.sin(elapsed * 11) * .025);
  ball.rotation.x += velocity.y * dt * .55; ball.rotation.y -= velocity.x * dt * .55;
  ballGlow.position.set(ballPosition.x, ballPosition.y, 1.25);
}

function render() {
  requestAnimationFrame(render); const dt = Math.min(clock.getDelta(), .034); elapsed += dt;
  simulate(dt);
  for (const b of bumpers) {
    const pulse = 1 + .055 * Math.sin(elapsed * 4 + b.phase);
    b.halo.scale.setScalar(pulse); b.cap.scale.set(.98 + .035 * Math.sin(elapsed * 5 + b.phase), .98 + .035 * Math.sin(elapsed * 5 + b.phase), .55);
    if (elapsed - b.last > .1) b.cap.scale.multiplyScalar(.94);
  }
  pinkLight.intensity = THREE.MathUtils.damp(pinkLight.intensity, 65 + 18 * Math.sin(elapsed * 1.8), 3, dt);
  cyanLight.intensity = THREE.MathUtils.damp(cyanLight.intensity, 58 + 14 * Math.sin(elapsed * 1.45 + 1), 3, dt);
  for (const f of flippers) f.mesh.children[1].material.emissiveIntensity = f.pressed ? 2.3 : 1.2;
  renderer.render(scene, camera);
}
updateHud(); render();
