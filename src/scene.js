import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const acid = 0xc9ff2f;
const cardInk = '#0b1110';
const cardIvory = '#f4f1e8';
const isEnglish = document.documentElement.lang.toLowerCase().startsWith('en');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const stages = [...document.querySelectorAll('[data-scene]')];
const animationStart = performance.now();
const activeStages = new Set();

function textureFromCanvas(draw) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 704;
  draw(canvas.getContext('2d'), canvas.width, canvas.height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function drawBack(ctx, width, height) {
  ctx.fillStyle = cardInk;
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = '#a9e129';
  ctx.lineWidth = 7;
  ctx.strokeRect(24, 24, width - 48, height - 48);
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 40, width - 80, height - 80);
  ctx.strokeRect(57, 57, width - 114, height - 114);
  ctx.save();
  ctx.translate(width / 2, height / 2);
  for (let i = 0; i < 18; i += 1) {
    ctx.rotate(Math.PI / 9);
    ctx.beginPath();
    ctx.ellipse(0, 0, 83, 265, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(166, 230, 48, .32)';
    ctx.stroke();
  }
  for (const radius of [86, 116, 146]) {
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(194, 255, 47, .58)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.fillStyle = '#f4f2eb';
  ctx.textAlign = 'center';
  ctx.font = '900 52px Arial, sans-serif';
  ctx.fillText('DECK', 0, -8);
  ctx.fillStyle = '#c9ff2f';
  ctx.fillText('BURN', 0, 49);
  ctx.restore();
}

function drawFace(ctx, width, height, suit, rank, label) {
  ctx.fillStyle = cardInk;
  ctx.fillRect(0, 0, width, height);
  const sheen = ctx.createLinearGradient(0, 0, width, height);
  sheen.addColorStop(0, 'rgba(255,255,255,.065)');
  sheen.addColorStop(0.46, 'rgba(255,255,255,0)');
  sheen.addColorStop(1, 'rgba(0,0,0,.12)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, width, height);
  ctx.strokeStyle = 'rgba(201, 255, 47, .62)';
  ctx.lineWidth = 5;
  ctx.strokeRect(17, 17, width - 34, height - 34);
  ctx.lineWidth = 2;
  ctx.strokeRect(34, 34, width - 68, height - 68);
  const color = suit === '♥' || suit === '♦' ? '#f44350' : cardIvory;
  ctx.fillStyle = color;
  ctx.textAlign = 'left';
  ctx.font = '900 68px Arial, sans-serif';
  ctx.fillText(rank, 52, 105);
  ctx.font = '78px Georgia, serif';
  ctx.fillText(suit, 50, 180);
  ctx.textAlign = 'center';
  ctx.font = '330px Georgia, serif';
  ctx.fillText(suit, width / 2, 470);
  ctx.font = '900 39px Arial, sans-serif';
  ctx.fillText(label, width / 2, 585);
  ctx.save();
  ctx.translate(width, height);
  ctx.rotate(Math.PI);
  ctx.textAlign = 'left';
  ctx.font = '900 52px Arial, sans-serif';
  ctx.fillText(rank, 52, 86);
  ctx.font = '61px Georgia, serif';
  ctx.fillText(suit, 53, 143);
  ctx.restore();
}

const textures = {
  back: textureFromCanvas(drawBack),
  heart: textureFromCanvas((ctx, w, h) => drawFace(ctx, w, h, '♥', 'A', 'BURPEES')),
  diamond: textureFromCanvas((ctx, w, h) => drawFace(ctx, w, h, '♦', 'A', 'SQUATS')),
  club: textureFromCanvas((ctx, w, h) => drawFace(ctx, w, h, '♣', 'A', isEnglish ? 'PUSH-UPS' : 'POMPES')),
  spade: textureFromCanvas((ctx, w, h) => drawFace(ctx, w, h, '♠', 'A', isEnglish ? 'ABS' : 'ABDOS')),
  king: textureFromCanvas((ctx, w, h) => drawFace(ctx, w, h, '♣', 'K', isEnglish ? 'PUSH-UPS' : 'POMPES'))
};

const cardBody = new RoundedBoxGeometry(1.93, 2.78, 0.12, 3, 0.07);
const cardFace = new THREE.PlaneGeometry(1.89, 2.74);
const cardEdge = new THREE.MeshPhysicalMaterial({ color: 0x202924, metalness: 0.22, roughness: 0.32, clearcoat: 0.68 });
const faceMaterials = Object.fromEntries(Object.entries(textures).map(([name, map]) => [name, new THREE.MeshBasicMaterial({ map, toneMapped: false, side: THREE.FrontSide })]));

function card(type = 'back') {
  const group = new THREE.Group();
  const body = new THREE.Mesh(cardBody, cardEdge);
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);
  const front = new THREE.Mesh(cardFace, faceMaterials[type]);
  front.position.z = 0.062;
  front.castShadow = true;
  group.add(front);
  const rear = new THREE.Mesh(cardFace, faceMaterials.back);
  rear.rotation.y = Math.PI;
  rear.position.z = -0.062;
  group.add(rear);
  return group;
}

function radialTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(64, 64, 3, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(190,255,47,.74)');
  gradient.addColorStop(0.28, 'rgba(146,255,34,.23)');
  gradient.addColorStop(1, 'rgba(111,255,31,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}

const glowMap = radialTexture();

function glow(scene, x, y, z, width, height, opacity) {
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowMap, color: acid, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending }));
  sprite.position.set(x, y, z);
  sprite.scale.set(width, height, 1);
  scene.add(sprite);
  return sprite;
}

function rockGeometry(seed, subdivisions = 5) {
  const geometry = new THREE.IcosahedronGeometry(1, subdivisions);
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i += 1) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    const surfaceNoise = Math.sin(x * 11.3 + seed * 3.1) * Math.sin(y * 8.7 - z * 7.4) + Math.cos(z * 9.5 + seed);
    const facet = Math.sin(x * 3.7 + y * 5.8 + seed) * Math.cos(z * 4.9 - seed);
    const radius = 1 + surfaceNoise * 0.085 + facet * 0.11;
    positions.setXYZ(i, x * radius, y * radius, z * radius);
  }
  geometry.computeVertexNormals();
  return geometry;
}

const rockMaterial = new THREE.MeshStandardMaterial({ color: 0x222b26, roughness: 1, metalness: 0.03 });
new THREE.TextureLoader().load('/assets/stone-albedo.webp', texture => {
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.anisotropy = 4;
  rockMaterial.bumpMap = texture;
  rockMaterial.bumpScale = 0.08;
  rockMaterial.needsUpdate = true;
  activeStages.forEach(state => state.renderer.render(state.scene, state.camera));
});
const crackMaterial = new THREE.MeshBasicMaterial({ color: acid, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending });

function addGround(scene, variant) {
  const ground = new THREE.Group();
  for (let i = 0; i < 15; i += 1) {
    const rock = new THREE.Mesh(rockGeometry(i + variant * 4), rockMaterial);
    const x = (i % 5 - 2) * 1.8 + Math.sin(i * 4.1 + variant) * 0.28;
    const z = -1.5 + Math.floor(i / 5) * 1.75;
    rock.position.set(x, -3.33 + Math.sin(i * 2.2) * 0.15, z);
    rock.scale.set(1.6 + (i % 3) * 0.24, 0.48 + (i % 4) * 0.09, 1.12 + (i % 2) * 0.2);
    rock.rotation.set(i * 0.31, i * 0.79, i * 0.27);
    rock.castShadow = true;
    rock.receiveShadow = true;
    ground.add(rock);
  }
  for (let i = 0; i < 24; i += 1) {
    const stone = new THREE.Mesh(rockGeometry(i + 90 + variant, 2), rockMaterial);
    stone.position.set(Math.sin(i * 8.2) * 4.3, -2.86 + Math.cos(i * 2.9) * 0.1, -0.2 + (i % 5) * 0.55);
    const size = 0.14 + (i % 5) * 0.06;
    stone.scale.set(size * 1.55, size * 0.62, size);
    stone.rotation.set(i * 0.38, i * 0.7, i * 0.19);
    stone.receiveShadow = true;
    ground.add(stone);
  }
  for (let i = 0; i < 9; i += 1) {
    const crack = new THREE.Mesh(new THREE.BoxGeometry(0.6 + (i % 3) * 0.4, 0.012, 0.018), crackMaterial);
    crack.position.set((i - 4) * 1.1, -2.86 + Math.sin(i * 1.9) * 0.05, 0.1 + (i % 3) * 0.35);
    crack.rotation.z = Math.sin(i * 3.4) * 0.4;
    ground.add(crack);
  }
  scene.add(ground);
  glow(scene, 0, -2.75, -1.5, 11, 3.2, 0.42);
}

function putCard(root, type, x, y, z, rz, ry = 0, scale = 1) {
  const item = card(type);
  item.position.set(reducedMotion.matches ? x : x * 0.7, reducedMotion.matches ? y : y - 0.5, z);
  item.rotation.set(-0.08, ry, rz);
  item.scale.setScalar(scale);
  root.add(item);
  item.userData.baseY = y;
  item.userData.baseX = x;
  item.userData.baseRz = rz;
  return item;
}

function buildModel(scene, kind) {
  const root = new THREE.Group();
  scene.add(root);
  addGround(scene, kind.length);
  const animated = [];
  const selectable = [];
  if (kind === 'concept') {
    const cardTypes = ['heart', 'diamond', 'club', 'spade'];
    const xs = [-3.35, -1.13, 1.13, 3.35];
    cardTypes.forEach((type, index) => {
      const item = putCard(root, type, xs[index], 0.22 + (index % 2) * 0.1, index * 0.12, [0.13, 0.035, -0.035, -0.13][index], (index - 1.5) * -0.05, 1.07);
      item.userData.index = index;
      item.traverse(child => { child.userData.index = index; });
      animated.push(item);
      selectable.push(item);
    });
    glow(scene, 0, 0, -2.5, 10, 5, 0.25);
  } else if (kind === 'deck') {
    const stack = new THREE.Group();
    stack.position.set(0, -0.85, 0.9);
    stack.rotation.set(-1.05, 0.28, -0.36);
    root.add(stack);
    for (let i = 0; i < 15; i += 1) {
      const item = card('back');
      item.position.set(Math.sin(i * 1.8) * 0.045, -i * 0.025, i * 0.042);
      item.rotation.z = Math.sin(i * 2.1) * 0.016;
      item.scale.setScalar(1.58);
      stack.add(item);
    }
    animated.push(stack);
    glow(scene, -0.1, -0.5, -1.1, 8, 5, 0.32);
  } else {
    const isHero = kind === 'hero';
    const isResult = kind === 'results';
    const leftSpread = isHero || isResult ? 2.15 : 2.65;
    const rightSpread = kind === 'friends' ? 2.05 : 2.65;
    for (let i = 0; i < 7; i += 1) {
      const side = i % 2 ? 1 : -1;
      const item = putCard(root, 'back', side * (1.7 + (i % 3) * 0.36), -0.76 + (i % 3) * 0.16, -1.1 + i * 0.035, side * (0.26 + i * 0.035), side * 0.12, 0.92);
      animated.push(item);
    }
    animated.push(putCard(root, isResult ? 'heart' : 'spade', -leftSpread, 1.08, 0.25, 0.22, -0.17, kind === 'friends' ? 0.86 : 1.02));
    animated.push(putCard(root, kind === 'friends' ? 'back' : isResult ? 'spade' : 'king', rightSpread, 0.78, 0.3, -0.23, 0.19, 1.02));
    glow(scene, 0, 0.2, -2.2, 9, 8, 0.2);
  }
  const points = new Float32Array(48 * 3);
  for (let i = 0; i < 48; i += 1) {
    points[i * 3] = Math.sin(i * 78.2) * 4.4;
    points[i * 3 + 1] = -1.9 + ((i * 37) % 100) / 100 * 4.4;
    points[i * 3 + 2] = -1.2 + Math.cos(i * 25.5) * 0.8;
  }
  const particles = new THREE.BufferGeometry();
  particles.setAttribute('position', new THREE.BufferAttribute(points, 3));
  scene.add(new THREE.Points(particles, new THREE.PointsMaterial({ color: acid, size: 0.035, transparent: true, opacity: 0.64, sizeAttenuation: true })));
  return { root, animated, selectable };
}

function createStage(element) {
  const kind = element.dataset.scene;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(37, 1, 0.1, 100);
  camera.position.set(0, 0.15, kind === 'concept' ? 10.4 : 10.9);
  camera.lookAt(0, -0.12, 0);
  scene.add(new THREE.AmbientLight(0xb3c7b7, 0.62));
  const key = new THREE.DirectionalLight(0xf5f3e8, 2.15);
  key.position.set(-4, 6, 6);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -9;
  key.shadow.camera.right = 9;
  key.shadow.camera.top = 9;
  key.shadow.camera.bottom = -9;
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 25;
  key.shadow.bias = -0.0006;
  scene.add(key);
  const rim = new THREE.PointLight(acid, 20, 14, 2);
  rim.position.set(2, -1.4, 2.6);
  scene.add(rim);
  const side = new THREE.PointLight(0x9add38, 10, 12, 2);
  side.position.set(-4, 0, -1);
  scene.add(side);
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
  } catch (error) {
    element.classList.add('webgl-unavailable');
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 700 ? 1.5 : 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  element.prepend(renderer.domElement);
  element.classList.add('webgl-ready');
  const model = buildModel(scene, kind);
  const state = { element, kind, scene, camera, renderer, model, pointerX: 0, pointerY: 0, currentX: 0, currentY: 0, selected: -1, active: false };
  const resize = () => {
    const width = element.clientWidth;
    const height = element.clientHeight;
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.fov = width < 540 ? 42 : 37;
    camera.position.z = kind === 'concept' ? (width < 540 ? 10.8 : 10.4) : width < 540 ? 11.8 : 10.9;
    model.root.scale.setScalar(width < 540 ? (kind === 'concept' ? 0.94 : 0.83) : 1);
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  };
  new ResizeObserver(resize).observe(element);
  resize();
  element.addEventListener('pointermove', event => {
    const rect = element.getBoundingClientRect();
    state.pointerX = (event.clientX - rect.left) / rect.width * 2 - 1;
    state.pointerY = (event.clientY - rect.top) / rect.height * 2 - 1;
  }, { passive: true });
  element.addEventListener('pointerleave', () => { state.pointerX = 0; state.pointerY = 0; });
  if (kind === 'concept') {
    const raycaster = new THREE.Raycaster();
    const controls = [...document.querySelectorAll('.exercise-card[data-card]')];
    const selectCard = index => {
      state.selected = index;
      controls.forEach((item, controlIndex) => {
        const selected = controlIndex === index;
        item.classList.toggle('is-selected', selected);
        item.setAttribute('aria-pressed', String(selected));
      });
      if (reducedMotion.matches) renderer.render(scene, camera);
    };
    controls.forEach((item, index) => item.addEventListener('click', () => selectCard(index)));
    element.addEventListener('click', event => {
      const rect = element.getBoundingClientRect();
      const pointer = new THREE.Vector2((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(model.selectable, true)[0];
      if (hit && Number.isInteger(hit.object.userData.index)) {
        selectCard(hit.object.userData.index);
      }
    });
  }
  return state;
}

const registry = new Map();
const observer = new IntersectionObserver(entries => {
  for (const entry of entries) {
    let state = registry.get(entry.target);
    if (entry.isIntersecting && !state && !entry.target.classList.contains('webgl-unavailable')) {
      state = createStage(entry.target);
      if (state) registry.set(entry.target, state);
    }
    if (state) {
      state.active = entry.isIntersecting;
      if (entry.isIntersecting) activeStages.add(state);
      else activeStages.delete(state);
    }
  }
}, { rootMargin: '250px 0px', threshold: 0 });
stages.forEach(stage => observer.observe(stage));

function frame() {
  requestAnimationFrame(frame);
  if (document.hidden) return;
  const time = (performance.now() - animationStart) / 1000;
  for (const state of activeStages) {
    const { model, renderer, scene, camera } = state;
    if (reducedMotion.matches) continue;
    state.currentX += (state.pointerX - state.currentX) * 0.045;
    state.currentY += (state.pointerY - state.currentY) * 0.045;
    model.root.rotation.y = state.currentX * 0.13;
    model.root.rotation.x = -state.currentY * 0.07;
    model.animated.forEach((item, index) => {
      if (state.kind === 'deck') {
        item.rotation.z = -0.36 + Math.sin(time * 0.42) * 0.022;
        item.position.y = -0.85 + Math.sin(time * 0.66) * 0.035;
      } else {
        const lift = state.kind === 'concept' && state.selected === index ? 0.4 : 0;
        item.position.x += (item.userData.baseX - item.position.x) * 0.065;
        item.position.y += ((item.userData.baseY + lift + Math.sin(time * 0.78 + index * 0.85) * 0.045) - item.position.y) * 0.08;
        item.rotation.z = item.userData.baseRz + Math.sin(time * 0.6 + index * 0.8) * 0.012;
      }
    });
    renderer.render(scene, camera);
  }
}
requestAnimationFrame(frame);

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
document.querySelectorAll('.section-heading, .how-copy, .friends-copy, .results-copy, .faq-heading, .faq-list, .download').forEach(element => {
  element.classList.add('motion-ready');
  revealObserver.observe(element);
});
