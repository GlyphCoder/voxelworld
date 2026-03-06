import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Sky } from 'three/addons/objects/Sky.js';

// --- Configuration ---
const CONFIG = {
    blockSize: 40,
    islandSize: 150,
    waterLevel: -50,
    maxWorlds: 10,
    enableParticles: true,
    enableGridSnap: true,
    enableShadows: true,
    enableFog: true,
    enableSounds: true,
    soundVolume: 0.3
};

// --- Audio System (Minecraft-Like) ---
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.enabled = CONFIG.enableSounds;
        this.masterVolume = CONFIG.soundVolume;
        this.oscillators = [];
        this.gainNodes = [];
        this.initAudioContext();
    }

    initAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    playSound(type, frequency = 440, duration = 0.1, volume = 1) {
        if (!this.enabled || !this.audioContext) return;

        switch(type) {
            case 'place':
                this.playMCPlace(volume);
                break;
            case 'delete':
                this.playMCBreak(volume);
                break;
            case 'paint':
                this.playMCHit(volume);
                break;
            case 'tool':
                this.playMCDing(volume);
                break;
            case 'ui':
                this.playMCClick(volume);
                break;
            case 'error':
                this.playMCError(volume);
                break;
        }
    }

    // Minecraft-like block place sound (crisp pop)
    playMCPlace(volume) {
        const now = this.audioContext.currentTime;
        const dur = 0.08;
        
        const osc = this.audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(900, now);
        osc.frequency.exponentialRampToValueAtTime(700, now + dur);
        
        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(volume * this.masterVolume * 0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        osc.start(now);
        osc.stop(now + dur);
    }

    // Minecraft-like block break sound (snap + noise)
    playMCBreak(volume) {
        const now = this.audioContext.currentTime;
        
        // Main snap sound
        const osc1 = this.audioContext.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(150, now);
        osc1.frequency.exponentialRampToValueAtTime(100, now + 0.1);
        
        // High-end crack
        const osc2 = this.audioContext.createOscillator();
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(300, now);
        osc2.frequency.exponentialRampToValueAtTime(150, now + 0.08);
        
        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(volume * this.masterVolume * 0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.1);
        osc2.stop(now + 0.08);
    }

    // Minecraft-like hit sound
    playMCHit(volume) {
        const now = this.audioContext.currentTime;
        const dur = 0.05;
        
        const osc = this.audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + dur);
        
        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(volume * this.masterVolume * 0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        osc.start(now);
        osc.stop(now + dur);
    }

    // Minecraft-like ding sound (UI)
    playMCDing(volume) {
        const now = this.audioContext.currentTime;
        const dur = 0.12;
        
        const osc = this.audioContext.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1000, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + dur);
        
        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(volume * this.masterVolume * 0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        osc.start(now);
        osc.stop(now + dur);
    }

    // Minecraft-like click sound
    playMCClick(volume) {
        const now = this.audioContext.currentTime;
        const dur = 0.04;
        
        const osc = this.audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(900, now + dur);
        
        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(volume * this.masterVolume * 0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        osc.start(now);
        osc.stop(now + dur);
    }

    // Minecraft-like error sound
    playMCError(volume) {
        const now = this.audioContext.currentTime;
        
        const osc1 = this.audioContext.createOscillator();
        osc1.frequency.setValueAtTime(200, now);
        
        const osc2 = this.audioContext.createOscillator();
        osc2.frequency.setValueAtTime(160, now);
        
        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(volume * this.masterVolume * 0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.15);
        osc2.stop(now + 0.15);
    }

    setVolume(vol) {
        this.masterVolume = Math.max(0, Math.min(1, vol));
        CONFIG.soundVolume = this.masterVolume;
    }

    toggle() {
        this.enabled = !this.enabled;
        CONFIG.enableSounds = this.enabled;
        return this.enabled;
    }
}

let audioManager = null;

const BLOCK_TYPES = [
    { id: 'grass', label: 'Grass', color: '#58a04c', noise: true },
    { id: 'stone', label: 'Stone', color: '#7d7d7d', noise: true },
    { id: 'wood', label: 'Log', color: '#8b5a2b', noise: true },
    { id: 'brick', label: 'Brick', color: '#a04c4c', noise: true },
    { id: 'plank_cube', label: 'Wood', color: '#d2a679', noise: false }, 
    { id: 'glass', label: 'Glass', color: '#aed9e0', noise: false, opacity: 0.5 },
    { id: 'waterBlock', label: 'Water', color: '#27688c', noise: false, opacity: 0.8 },
    { id: 'light', label: 'Lamp', color: '#fff3bb', noise: false, emissive: true }
];

// Shape definitions for different block types
const SHAPES = {
    cube: { name: 'Cube', geometry: (s) => new THREE.BoxGeometry(s, s, s, 2, 2, 2) },
    sphere: { name: 'Sphere', geometry: (s) => new THREE.SphereGeometry(s/2, 32, 32) },
    cylinder: { name: 'Cylinder', geometry: (s) => new THREE.CylinderGeometry(s/2, s/2, s, 32, 8) },
    pyramid: { name: 'Pyramid', geometry: (s) => new THREE.ConeGeometry(s/2, s, 32, 8) },
    wedge: { name: 'Wedge', geometry: (s) => createWedgeGeometry(s) },
    torus: { name: 'Torus', geometry: (s) => new THREE.TorusGeometry(s/3, s/8, 32, 100) }
};

function createWedgeGeometry(size) {
    const geometry = new THREE.BufferGeometry();
    const s = size / 2;
    
    const vertices = new Float32Array([
        -s, -s, -s,  s, -s, -s,  s,  s, -s, -s,  s, -s,
        -s, -s,  s,  s, -s,  s,  s,  s,  s, -s,  s,  s,
        -s, -s, -s, -s,  s, -s, -s,  s,  s, -s, -s,  s,
         s, -s, -s,  s,  s, -s,  s,  s,  s,  s, -s,  s,
        -s, -s, -s,  s, -s, -s,  s, -s,  s, -s, -s,  s,
        -s,  s, -s,  s,  s, -s,  s,  s,  s, -s,  s,  s
    ]);
    
    const indices = new Uint32Array(36);
    for (let i = 0; i < 36; i++) indices[i] = i;
    
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    geometry.computeVertexNormals();
    return geometry;
}

let camera, scene, renderer, controls;
let groundPlane, waterMesh;
let sky, sunSphere, dirLight, ambientLight;
let raycaster, pointer;

let worlds = [];
let currentWorldId = null;
let worldCounter = 1;

let interactableObjects = []; 
let obstacleObjects = []; 

let sunMesh;
let carriedBlock = null; 
let placementGhost = null; 
const materials = {};
let customColors = {};

let particles = [];
let clouds = [];

let mouseDownTime = 0;
let mouseDownPos = new THREE.Vector2();
const CLICK_THRESHOLD_PX = 5; 

const keysPressed = {};

// UI State
let currentTool = 'build';
let currentShape = 'cube';
let currentColor = '#ffffff';
let undoStack = [];
let redoStack = [];
let maxUndoSteps = 50;

// --- Particle System ---
function createParticle(pos, color = '#ffffff') {
    if (!CONFIG.enableParticles) return;
    
    // Create Minecraft-like cubic particle
    const size = 12 + Math.random() * 8;
    const particleGeo = new THREE.BoxGeometry(size, size, size);
    
    // Create textured material for the particle
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    
    // Parse color and add texture
    const rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
    const r = parseInt(rgb[1], 16);
    const g = parseInt(rgb[2], 16);
    const b = parseInt(rgb[3], 16);
    
    // Draw block texture
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = `rgba(0,0,0,0.2)`;
    for(let i=0; i<100; i++) {
        ctx.fillRect(Math.random()*32, Math.random()*32, 2, 2);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    
    const particleMat = new THREE.MeshLambertMaterial({
        map: texture,
        transparent: true,
        opacity: 0.9
    });
    
    const particle = new THREE.Mesh(particleGeo, particleMat);
    particle.position.copy(pos);
    particle.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 3,
        Math.random() * 2.5 + 1,
        (Math.random() - 0.5) * 3
    );
    particle.life = 50;
    particle.maxLife = 50;
    particle.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
    );
    particle.angularVelocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2
    );
    
    scene.add(particle);
    particles.push(particle);
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.position.add(p.velocity);
        p.velocity.y -= 0.08; // gravity
        p.velocity.multiplyScalar(0.98); // air resistance
        
        // Rotate the particle
        if (p.angularVelocity) {
            p.rotation.x += p.angularVelocity.x;
            p.rotation.y += p.angularVelocity.y;
            p.rotation.z += p.angularVelocity.z;
        }
        
        p.life--;
        if (p.maxLife && p.material.opacity !== undefined) {
            p.material.opacity = (p.life / p.maxLife) * 0.9;
        }
        
        if (p.life <= 0) {
            scene.remove(p);
            particles.splice(i, 1);
        }
    }
}

// --- Cloud System ---
function createClouds() {
    const cloudGroup = new THREE.Group();
    const cloudCount = 15;
    
    for (let i = 0; i < cloudCount; i++) {
        const cloudGeo = new THREE.BoxGeometry(
            Math.random() * 300 + 200,
            Math.random() * 100 + 50,
            Math.random() * 100 + 50
        );
        
        const cloudMat = new THREE.MeshLambertMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.8
        });
        
        const cloud = new THREE.Mesh(cloudGeo, cloudMat);
        cloud.position.set(
            Math.random() * 5000 - 2500,
            3000 + Math.random() * 1000,
            Math.random() * 5000 - 2500
        );
        cloud.castShadow = false;
        cloud.receiveShadow = false;
        
        cloud.userData.speed = Math.random() * 0.5 + 0.2;
        cloud.userData.baseX = cloud.position.x;
        
        cloudGroup.add(cloud);
        clouds.push(cloud);
    }
    
    scene.add(cloudGroup);
}

function updateClouds(time) {
    clouds.forEach(cloud => {
        cloud.position.x = cloud.userData.baseX + Math.sin(time * 0.0001 * cloud.userData.speed) * 1000;
    });
}
function splitmix32(a) {
    return function() {
      a |= 0; a = a + 0x9e3779b9 | 0;
      let t = a ^ a >>> 16; t = Math.imul(t, 0x21f0aaad);
      t = t ^ t >>> 15; t = Math.imul(t, 0x735a2d97);
      return ((t = t ^ t >>> 15) >>> 0) / 4294967296;
    }
}

const mlWeights = {};
const structTypes = ['Tower', 'House', 'Castle', 'Temple', 'Bridge', 'Pyramid', 'Skyscraper', 'Ruin', 'Abstract'];

structTypes.forEach((type, idx) => {
    const rng = splitmix32(1000 + idx * 55); 
    mlWeights[type] = {
        w1: Array.from({length: 16}, () => Array.from({length: 24}, () => rng() * 2 - 1)),
        b1: Array.from({length: 24}, () => rng() * 2 - 1),
        w2: Array.from({length: 24}, () => Array.from({length: 48}, () => rng() * 2 - 1)),
        b2: Array.from({length: 48}, () => rng() * 2 - 1)
    };
});

function relu(x) { return Math.max(0, x); }

function runForwardPass(latent, type) {
    const w = mlWeights[type];
    let h1 = new Array(24).fill(0);
    for(let i=0; i<24; i++) {
        let sum = w.b1[i];
        for(let j=0; j<16; j++) sum += latent[j] * w.w1[j][i];
        h1[i] = relu(sum);
    }
    let h2 = new Array(48).fill(0);
    for(let i=0; i<48; i++) {
        let sum = w.b2[i];
        for(let j=0; j<24; j++) sum += h1[j] * w.w2[j][i];
        h2[i] = relu(sum); 
    }
    return h2;
}

// --- Undo/Redo System ---
function saveUndoState() {
    const state = interactableObjects.map(b => ({
        type: b.userData.type, 
        x: b.position.x, 
        y: b.position.y, 
        z: b.position.z,
        color: b.userData.color || '#ffffff',
        shape: b.userData.shape || 'cube'
    }));
    undoStack.push(state);
    redoStack = [];
    if (undoStack.length > maxUndoSteps) undoStack.shift();
    updateUndoUI();
}

function undoAction() {
    if (undoStack.length === 0) return;
    const state = undoStack.pop();
    redoStack.push(interactableObjects.map(b => ({
        type: b.userData.type, 
        x: b.position.x, 
        y: b.position.y, 
        z: b.position.z,
        color: b.userData.color || '#ffffff',
        shape: b.userData.shape || 'cube'
    })));
    
    clearInteractableObjects();
    loadState(undoStack[undoStack.length - 1] || []);
    updateUndoUI();
}

function updateUndoUI() {
    document.getElementById('undo-count').innerText = undoStack.length;
}

// --- Tool System ---
function switchTool(tool) {
    currentTool = tool;
    document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(tool + '-tool').classList.add('active');
    
    // Show/hide shape panel for build mode
    document.getElementById('shape-panel').classList.toggle('active', tool === 'build');
    document.getElementById('color-panel').classList.toggle('active', tool === 'paint');
    
    // Play tool switch sound
    if (audioManager) {
        audioManager.playSound('tool', 600, 0.15);
    }
}

// --- Settings ---
function setupSettingsPanel() {
    document.getElementById('grid-snap-toggle').addEventListener('click', (e) => {
        CONFIG.enableGridSnap = !CONFIG.enableGridSnap;
        e.target.closest('.toggle-switch').classList.toggle('active');
    });
    
    document.getElementById('shadow-toggle').addEventListener('click', (e) => {
        CONFIG.enableShadows = !CONFIG.enableShadows;
        renderer.shadowMap.enabled = CONFIG.enableShadows;
        e.target.closest('.toggle-switch').classList.toggle('active');
    });
    
    document.getElementById('particle-toggle').addEventListener('click', (e) => {
        CONFIG.enableParticles = !CONFIG.enableParticles;
        e.target.closest('.toggle-switch').classList.toggle('active');
    });
    
    document.getElementById('fog-toggle').addEventListener('click', (e) => {
        CONFIG.enableFog = !CONFIG.enableFog;
        scene.fog.far = CONFIG.enableFog ? 8000 : 40000;
        e.target.closest('.toggle-switch').classList.toggle('active');
    });

    const soundToggle = document.getElementById('sound-toggle');
    if (soundToggle) {
        soundToggle.addEventListener('click', (e) => {
            const isEnabled = audioManager.toggle();
            e.target.closest('.toggle-switch').classList.toggle('active', isEnabled);
            audioManager.playSound('ui', 550, 0.1);
        });
    }

    const soundVolume = document.getElementById('sound-volume');
    if (soundVolume) {
        soundVolume.addEventListener('input', (e) => {
            audioManager.setVolume(parseFloat(e.target.value) / 100);
        });
    }
    
    document.getElementById('settings-btn').addEventListener('click', () => {
        document.getElementById('settings-panel').style.display = 
            document.getElementById('settings-panel').style.display === 'none' ? 'block' : 'none';
    });
}

function setupShapeSelector() {
    document.querySelectorAll('.shape-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.shape-option').forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            currentShape = option.dataset.shape;
            if (audioManager) {
                audioManager.playSound('ui', 600, 0.1);
            }
        });
    });
}

function setupColorPicker() {
    document.getElementById('colorPicker').addEventListener('change', (e) => {
        currentColor = e.target.value;
        if (audioManager) {
            audioManager.playSound('paint', 400, 0.1);
        }
    });
}

window.selectColorPreset = (color) => {
    currentColor = color;
    document.getElementById('colorPicker').value = color;
    if (audioManager) {
        audioManager.playSound('paint', 450, 0.12);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    audioManager = new AudioManager();
    setupSettingsPanel();
    setupShapeSelector();
    setupColorPicker();
    
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tool = btn.id.replace('-tool', '');
            switchTool(tool);
        });
    });
    
    init();
    animate(0);
});

window.spawnBlock = spawnBlock;
window.downloadWorld = downloadWorld;
window.triggerLoad = () => {
    if (audioManager) audioManager.playSound('ui', 650, 0.1);
    document.getElementById('fileInput').click();
};
window.createNewWorld = createNewWorld;
window.switchWorld = switchWorld;
window.deleteWorld = deleteWorld;
window.dropCarried = dropCarried;

window.openGenModal = () => {
    document.getElementById('gen-modal').style.display = 'flex';
    if (audioManager) audioManager.playSound('ui', 700, 0.1);
};
window.closeGenModal = () => {
    document.getElementById('gen-modal').style.display = 'none';
    document.getElementById('gen-options').style.display = 'grid';
    document.getElementById('gen-progress-wrapper').style.display = 'none';
    if (audioManager) audioManager.playSound('ui', 600, 0.1);
};
window.startANN = (type) => {
    document.getElementById('gen-options').style.display = 'none';
    document.getElementById('gen-progress-wrapper').style.display = 'block';
    let bar = document.getElementById('gen-progress-bar');
    bar.style.width = '0%';
    let progress = 0;
    
    if (audioManager) audioManager.playSound('tool', 800, 0.2);
    
    let interval = setInterval(() => {
        progress += Math.random() * 20 + 10;
        bar.style.width = Math.min(progress, 100) + '%';
        if(progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                executeMLGeneration(type);
                window.closeGenModal();
            }, 300);
        }
    }, 100);
};

document.getElementById('fileInput').addEventListener('change', handleFileLoad, false);
document.getElementById('timeSlider').addEventListener('input', (e) => updateTimeOfDay(parseFloat(e.target.value)));
document.addEventListener('contextmenu', event => event.preventDefault());

function init() {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xe6ded1, 0.000075);
    scene.background = new THREE.Color(0xe6ded1);

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 50000);
    camera.position.set(2000, 1400, 2000);

    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true,
        precision: 'highp',
        powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = CONFIG.enableShadows;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.75;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    document.body.appendChild(renderer.domElement);

    setupLightingAndSky();
    generateMaterialsAndUI();
    createEnvironment();
    createClouds();

    const sunGeo = new THREE.SphereGeometry(250, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({color: 0xffff00, fog: false, toneMapped: false});
    sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.castShadow = false;
    sunMesh.receiveShadow = false;
    scene.add(sunMesh);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; 
    controls.minDistance = 300;
    controls.maxDistance = 8000;
    controls.mouseButtons = { 
        LEFT: THREE.MOUSE.ROTATE, 
        MIDDLE: THREE.MOUSE.DOLLY, 
        RIGHT: THREE.MOUSE.PAN 
    };

    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();

    window.addEventListener('resize', onWindowResize);
    
    document.addEventListener('pointerdown', (e) => {
        if(e.button === 2 && carriedBlock) { dropCarried(); return; }
        mouseDownTime = Date.now();
        mouseDownPos.set(e.clientX, e.clientY);
    });

    document.addEventListener('pointerup', onPointerUp);
    document.addEventListener('pointermove', onPointerMove);
    
    document.addEventListener('keydown', (e) => { 
        if(e.key==='Escape') dropCarried();
        keysPressed[e.key.toLowerCase()] = true;
        if(e.key.startsWith('Arrow')) keysPressed[e.key] = true;
    });
    document.addEventListener('keyup', (e) => {
        keysPressed[e.key.toLowerCase()] = false;
        if(e.key.startsWith('Arrow')) keysPressed[e.key] = false;
    });

    createNewWorld();
}

function setupLightingAndSky() {
    // Enhanced ambient light for better depth perception
    ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Improved directional light with better shadows
    dirLight = new THREE.DirectionalLight(0xfff0dd, 1.8);
    dirLight.name = 'sun';
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(4096, 4096);
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 10000;
    dirLight.shadow.camera.left = -3500;
    dirLight.shadow.camera.right = 3500;
    dirLight.shadow.camera.top = 3500;
    dirLight.shadow.camera.bottom = -3500;
    dirLight.shadow.bias = -0.0005;
    dirLight.shadow.radius = 3;
    scene.add(dirLight);

    // Add secondary fill light for more realistic lighting
    const fillLight = new THREE.DirectionalLight(0xaaccff, 0.4);
    fillLight.position.set(-1, 0.5, -1).normalize().multiplyScalar(4000);
    scene.add(fillLight);

    sky = new Sky();
    sky.scale.setScalar(50000);
    scene.add(sky);

    const skyUniforms = sky.material.uniforms;
    skyUniforms['turbidity'].value = 12;
    skyUniforms['rayleigh'].value = 2.5;
    skyUniforms['mieCoefficient'].value = 0.008;
    skyUniforms['mieDirectionalG'].value = 0.8;

    sunSphere = new THREE.Vector3();
    updateTimeOfDay(14);
}

function updateTimeOfDay(hours) {
    // Update UI
    const hrs = Math.floor(hours);
    const mins = Math.floor((hours - hrs) * 60);
    document.getElementById('timeDisplay').innerText = `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;

    // Calculate Sun Angle
    // 6AM = 0, 12PM = PI/2, 6PM = PI
    const angle = ((hours - 6) / 12) * Math.PI; 
    const distance = 4000;
    
    const sunX = Math.cos(angle) * distance;
    const sunY = Math.sin(angle) * distance;
    const sunZ = -1500;
    
    sunSphere.set(sunX, sunY, sunZ);
    sky.material.uniforms['sunPosition'].value.copy(sunSphere);

    // Normalized elevation (-1 midnight, 0 horizon, 1 noon)
    const elevation = Math.sin(angle); 
    
    // Define Key Colors for Gradient Interpolation
    const colorNoon = new THREE.Color(0xffffff);
    const colorSunset = new THREE.Color(0xffaa55);
    const colorNight = new THREE.Color(0xaaccff);
    
    const fogNoon = new THREE.Color(0xe6ded1);
    const fogSunset = new THREE.Color(0xff8844);
    const fogNight = new THREE.Color(0x0a0c16);
    
    const ambNoon = new THREE.Color(0xffffff);
    const ambSunset = new THREE.Color(0xaa8888);
    const ambNight = new THREE.Color(0x556688);

    let sunColor = new THREE.Color();
    let fogColor = new THREE.Color();
    let ambColor = new THREE.Color();
    
    let dirIntensity, ambientIntensity, exposure;

    if (elevation >= 0) {
        // Daytime (Horizon to Noon)
        let f = Math.min(1, elevation * 3); // Quick transition after sunrise
        
        sunColor.lerpColors(colorSunset, colorNoon, f);
        fogColor.lerpColors(fogSunset, fogNoon, f);
        ambColor.lerpColors(ambSunset, ambNoon, f);
        
        dirIntensity = 0.2 + 1.3 * f;
        ambientIntensity = 0.3 + 0.2 * f;
        exposure = 0.4 + 0.2 * f;
        
        dirLight.position.set(sunX, sunY, sunZ);
    } else {
        // Nighttime (Horizon to Midnight)
        let f = Math.min(1, -elevation * 3); 
        
        sunColor.lerpColors(colorSunset, colorNight, f);
        fogColor.lerpColors(fogSunset, fogNight, f);
        ambColor.lerpColors(ambSunset, ambNight, f);
        
        dirIntensity = 0.2 + 0.6 * f; // Moon is slightly dimmer than sun
        ambientIntensity = 0.3 + 0.2 * f;
        exposure = 0.4 + 0.3 * f;
        
        // Flip light to opposite side of world to act as moon casting shadows
        dirLight.position.set(-sunX, Math.max(100, -sunY), -sunZ);
    }

    // Apply Continuous Variables
    dirLight.color.copy(sunColor);
    scene.fog.color.copy(fogColor);
    ambientLight.color.copy(ambColor);
    
    dirLight.intensity = dirIntensity;
    ambientLight.intensity = ambientIntensity;
    renderer.toneMappingExposure = exposure;

    // Toggle UI theme
    document.body.className = elevation > 0 ? 'light-mode' : 'dark-mode';
}

function generateMaterialsAndUI() {
    const hotbar = document.getElementById('hotbar');
    
    BLOCK_TYPES.forEach(block => {
        const canvas = document.createElement('canvas');
        canvas.width = 128; canvas.height = 128;
        const ctx = canvas.getContext('2d');
        
        // Create more detailed textures
        ctx.fillStyle = block.color;
        ctx.fillRect(0,0,128,128);
        
        if(block.noise) {
            // Add more sophisticated noise pattern
            for(let i=0; i<600; i++) {
                ctx.fillStyle = Math.random()>0.5 ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)';
                ctx.fillRect(Math.random()*128, Math.random()*128, Math.random()*6+2, Math.random()*6+2);
            }
            // Add texture cracks
            for(let i=0; i<20; i++) {
                ctx.strokeStyle = `rgba(0,0,0,${0.05 + Math.random()*0.1})`;
                ctx.lineWidth = Math.random()*2;
                ctx.beginPath();
                ctx.moveTo(Math.random()*128, Math.random()*128);
                ctx.lineTo(Math.random()*128, Math.random()*128);
                ctx.stroke();
            }
            ctx.strokeStyle = "rgba(0,0,0,0.2)"; ctx.lineWidth = 3; ctx.strokeRect(1,1,126,126);
        } else if(block.id === 'glass') {
            // Glass reflection pattern
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.fillRect(0,0,128,128);
            ctx.strokeStyle = "rgba(255,255,255,0.6)"; ctx.lineWidth = 3; ctx.strokeRect(2,2,124,124);
            ctx.strokeStyle = "rgba(100,150,255,0.4)"; ctx.lineWidth = 2;
            for(let i=0; i<8; i++) {
                ctx.beginPath();
                ctx.moveTo(0, i*16);
                ctx.lineTo(128, i*16);
                ctx.stroke();
            }
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.magFilter = THREE.NearestFilter;
        tex.colorSpace = THREE.SRGBColorSpace;
        
        const matParams = { map: tex };
        if(block.opacity) { matParams.transparent = true; matParams.opacity = block.opacity; }
        if(block.emissive) { matParams.emissive = block.color; matParams.emissiveIntensity = 0.7; matParams.toneMapped = false; }

        if(block.id === 'grass') {
             const dirtC = document.createElement('canvas');
             dirtC.width = 128; dirtC.height = 128;
             const dCtx = dirtC.getContext('2d');
             dCtx.fillStyle = '#5d4037';
             dCtx.fillRect(0,0,128,128);
             // Add detailed dirt texture
             for(let i=0; i<400; i++) {
                 dCtx.fillStyle=`rgba(0,0,0,${0.05 + Math.random()*0.15})`;
                 dCtx.fillRect(Math.random()*128, Math.random()*128, Math.random()*4+1, Math.random()*4+1);
             }
             dCtx.strokeStyle = "rgba(0,0,0,0.15)";
             dCtx.lineWidth = 2;
             dCtx.strokeRect(1,1,126,126);
             const dirtTex = new THREE.CanvasTexture(dirtC);
             dirtTex.magFilter = THREE.NearestFilter;
             dirtTex.colorSpace = THREE.SRGBColorSpace;
             materials[block.id] = [
                 new THREE.MeshLambertMaterial({map: dirtTex}),
                 new THREE.MeshLambertMaterial({map: dirtTex}),
                 new THREE.MeshLambertMaterial(matParams),
                 new THREE.MeshLambertMaterial({map: dirtTex}),
                 new THREE.MeshLambertMaterial({map: dirtTex}),
                 new THREE.MeshLambertMaterial({map: dirtTex})
             ];
        } else {
            materials[block.id] = new THREE.MeshLambertMaterial(matParams);
        }

        const container = document.createElement('div');
        container.className = 'slot-container';
        container.onclick = () => spawnBlock(block.id);
        
        const slot = document.createElement('div');
        slot.className = 'slot';
        slot.style.backgroundImage = `url(${canvas.toDataURL()})`;
        
        const label = document.createElement('span');
        label.className = 'slot-label';
        label.innerText = block.label;

        container.appendChild(slot);
        container.appendChild(label);
        hotbar.appendChild(container);
    });

    // Enhanced water texture with wave pattern
    const waterCanvas = document.createElement('canvas');
    waterCanvas.width = 256;
    waterCanvas.height = 256;
    const waterCtx = waterCanvas.getContext('2d');
    
    // Create wavy pattern
    waterCtx.fillStyle='#1a5a7a';
    waterCtx.fillRect(0,0,256,256);
    
    for(let i=0; i<200; i++) {
        waterCtx.fillStyle=`rgba(255,255,255,${0.1 + Math.random()*0.15})`;
        waterCtx.fillRect(Math.random()*256, Math.random()*256, Math.random()*20+5, 2);
    }
    
    // Add wave lines
    waterCtx.strokeStyle='rgba(255,255,255,0.2)';
    waterCtx.lineWidth = 1;
    for(let i=0; i<256; i+=20) {
        waterCtx.beginPath();
        waterCtx.moveTo(0, i);
        for(let x=0; x<256; x+=10) {
            waterCtx.lineTo(x, i + Math.sin(x*0.05)*3);
        }
        waterCtx.lineTo(256, i);
        waterCtx.stroke();
    }
    
    const waterTex = new THREE.CanvasTexture(waterCanvas);
    waterTex.magFilter = THREE.LinearFilter;
    waterTex.colorSpace = THREE.SRGBColorSpace;
    materials['water'] = new THREE.MeshPhongMaterial({
        color: 0x1a7aaa,
        transparent: true,
        opacity: 0.75,
        map: waterTex,
        shininess: 120,
        specular: 0x444488,
        wireframe: false
    });
}

function createEnvironment() {
    // Enhanced water with better appearance
    const waterGeo = new THREE.PlaneGeometry(100000, 100000);
    waterGeo.rotateX(-Math.PI / 2);
    const waterTex = materials['water'].map;
    waterTex.wrapS = THREE.RepeatWrapping; 
    waterTex.wrapT = THREE.RepeatWrapping;
    waterTex.repeat.set(600, 600);
    waterMesh = new THREE.Mesh(waterGeo, materials['water']);
    waterMesh.position.y = -50;
    waterMesh.receiveShadow = true;
    scene.add(waterMesh);

    // Large island with better terrain
    const size = CONFIG.blockSize * CONFIG.islandSize;
    const islandGeo = new THREE.BoxGeometry(size, CONFIG.blockSize * 3, size, 4, 4, 4);
    groundPlane = new THREE.Mesh(islandGeo, materials['grass']);
    groundPlane.position.y = -CONFIG.blockSize * 1.5;
    groundPlane.castShadow = true;
    groundPlane.receiveShadow = true;
    scene.add(groundPlane);
    obstacleObjects.push(groundPlane);

    // Enhanced terrain features with more detail
    generateTerrainFeatures(size);
    generateRealisticMountains();
    generateComplexVegetation(size);
    generateDecorationElements(size);
}

function generateTerrainFeatures(islandWidth) {
    const textureSize = 256;
    const data = new Uint8Array(textureSize * textureSize * 4);
    
    // Perlin-like noise for terrain variation
    for (let i = 0; i < textureSize; i++) {
        for (let j = 0; j < textureSize; j++) {
            const idx = (i * textureSize + j) * 4;
            const noise = Math.sin(i * 0.05) * Math.cos(j * 0.05) * 
                         Math.sin(i * 0.02) * Math.cos(j * 0.03) +
                         Math.sin(i * 0.1) * Math.cos(j * 0.1) * 0.5;
            const val = Math.floor((noise + 1) * 127.5);
            data[idx] = data[idx + 1] = data[idx + 2] = val;
            data[idx + 3] = 255;
        }
    }
    
    // Add biome markers
    const biomeCount = 5;
    for (let b = 0; b < biomeCount; b++) {
        const bx = Math.random() * textureSize;
        const by = Math.random() * textureSize;
        const biomeRadius = textureSize / 6;
        
        for (let i = 0; i < textureSize; i++) {
            for (let j = 0; j < textureSize; j++) {
                const dist = Math.hypot(i - bx, j - by);
                if (dist < biomeRadius) {
                    const idx = (i * textureSize + j) * 4;
                    const influence = 1 - (dist / biomeRadius);
                    data[idx] = Math.min(255, data[idx] + influence * 50);
                }
            }
        }
    }
}

function generateComplexVegetation(islandWidth) {
    const count = 120; // More trees
    const minDist = islandWidth / 2 + 100;
    const maxDist = islandWidth / 2 + 1500;
    
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = minDist + Math.random() * (maxDist - minDist);
        const x = Math.cos(angle) * dist;
        const z = Math.sin(angle) * dist;
        
        const treeType = Math.random();
        if (treeType < 0.7) {
            createTree(x, 10, z, 'normal');
        } else if (treeType < 0.85) {
            createTree(x, 10, z, 'tall');
        } else {
            createBush(x, 10, z);
        }
    }
    
    // Add grass patches
    for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = minDist + Math.random() * (maxDist - minDist);
        const x = Math.cos(angle) * dist;
        const z = Math.sin(angle) * dist;
        
        createGrassPatch(x, z);
    }
}

function generateDecorationElements(islandWidth) {
    // Add scattered rocks for detail
    const rockCount = 80;
    const minDist = islandWidth / 2 + 50;
    const maxDist = islandWidth / 2 + 2000;
    
    for (let i = 0; i < rockCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = minDist + Math.random() * (maxDist - minDist);
        const x = Math.cos(angle) * dist;
        const z = Math.sin(angle) * dist;
        
        const rockSize = 15 + Math.random() * 40;
        const rockGeo = new THREE.IcosahedronGeometry(rockSize, 4);
        const rock = new THREE.Mesh(rockGeo, materials['stone']);
        rock.position.set(x, 20, z);
        rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        rock.castShadow = true;
        rock.receiveShadow = true;
        scene.add(rock);
    }
    
    // Add flower clusters
    const flowerCount = 40;
    for (let i = 0; i < flowerCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = minDist + Math.random() * (maxDist - minDist);
        const x = Math.cos(angle) * dist;
        const z = Math.sin(angle) * dist;
        
        createFlowerCluster(x, z);
    }
}

function createFlowerCluster(x, z) {
    const flowerColors = ['#ff6b9d', '#ffd93d', '#6bcf7f', '#4d96ff'];
    for (let i = 0; i < 3; i++) {
        const offsetX = x + (Math.random() - 0.5) * 60;
        const offsetZ = z + (Math.random() - 0.5) * 60;
        
        const flowerGeo = new THREE.SphereGeometry(8, 8, 8);
        const flowerMat = new THREE.MeshLambertMaterial({ color: flowerColors[Math.floor(Math.random() * flowerColors.length)], emissive: flowerColors[Math.floor(Math.random() * flowerColors.length)], emissiveIntensity: 0.2 });
        const flower = new THREE.Mesh(flowerGeo, flowerMat);
        flower.position.set(offsetX, 15, offsetZ);
        flower.castShadow = true;
        flower.name = "nature_asset";
        scene.add(flower);
    }
}

function createTree(x, y, z, type) {
    const trunkSize = type === 'tall' ? 25 : 20;
    const trunkHeight = type === 'tall' ? 100 : 70;
    const leavesSize = type === 'tall' ? 100 : 80;
    
    // Create more detailed trunk with segments
    const trunkGeo = new THREE.CylinderGeometry(trunkSize/2, trunkSize/2 * 1.3, trunkHeight, 16, 8);
    const trunk = new THREE.Mesh(trunkGeo, materials['wood']);
    trunk.position.set(x, y + trunkHeight/2, z);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    
    // Create more detailed foliage with multiple spheres
    const foliageGroup = new THREE.Group();
    foliageGroup.position.set(0, trunkHeight * 0.6, 0);
    
    // Main canopy
    const mainFoliage = new THREE.Mesh(new THREE.SphereGeometry(leavesSize/2, 16, 16), materials['grass'][2]);
    mainFoliage.castShadow = true;
    mainFoliage.receiveShadow = true;
    foliageGroup.add(mainFoliage);
    
    // Secondary foliage for detail
    const side1 = new THREE.Mesh(new THREE.SphereGeometry(leavesSize/3, 12, 12), materials['grass'][2]);
    side1.position.set(leavesSize/3, 0, 0);
    side1.castShadow = true;
    foliageGroup.add(side1);
    
    const side2 = new THREE.Mesh(new THREE.SphereGeometry(leavesSize/3, 12, 12), materials['grass'][2]);
    side2.position.set(-leavesSize/3, 0, 0);
    side2.castShadow = true;
    foliageGroup.add(side2);
    
    trunk.add(foliageGroup);
    trunk.userData = { bobOffset: Math.random()*100, baseY: y + trunkHeight/2 };
    trunk.name = "nature_asset";
    scene.add(trunk);
}

function createBush(x, y, z) {
    const bushGeo = new THREE.IcosahedronGeometry(35, 3);
    const bush = new THREE.Mesh(bushGeo, materials['grass'][2]);
    bush.position.set(x, y + 35, z);
    bush.castShadow = true;
    bush.receiveShadow = true;
    bush.userData = { bobOffset: Math.random()*100, baseY: y + 35 };
    bush.name = "nature_asset";
    scene.add(bush);
}

function createGrassPatch(x, z) {
    for (let i = 0; i < 8; i++) {
        const offsetX = x + (Math.random() - 0.5) * 120;
        const offsetZ = z + (Math.random() - 0.5) * 120;
        const grassGeo = new THREE.BoxGeometry(25, 8, 25);
        const grass = new THREE.Mesh(grassGeo, materials['grass']);
        grass.position.set(offsetX, 8, offsetZ);
        grass.castShadow = true;
        grass.receiveShadow = true;
        scene.add(grass);
    }
}

function generateCaverns(size) {
    const cavernCount = 5;
    for (let i = 0; i < cavernCount; i++) {
        const x = (Math.random() - 0.5) * size * 0.8;
        const y = -200 + Math.random() * 100;
        const z = (Math.random() - 0.5) * size * 0.8;
        
        const cavernGeo = new THREE.SphereGeometry(300 + Math.random() * 200, 8, 8);
        const cavern = new THREE.Mesh(cavernGeo, new THREE.MeshLambertMaterial({
            color: 0x333333,
            side: THREE.BackSide
        }));
        cavern.position.set(x, y, z);
        scene.add(cavern);
    }
}

function generateRealisticMountains() {
    const radius = 12000;
    const mountainGeo = new THREE.CylinderGeometry(radius, radius + 2000, 4000, 128, 1, true);
    
    const pos = mountainGeo.attributes.position;
    const v = new THREE.Vector3();
    
    for(let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i);
        if (v.y > 0) { 
            const angle = Math.atan2(v.z, v.x);
            const noise = Math.sin(angle * 12) * 500 + 
                          Math.sin(angle * 28) * 300 + 
                          Math.sin(angle * 55) * 150;
            v.y += noise - 800; 
        } else {
            v.y -= 1000; 
        }
        pos.setXYZ(i, v.x, v.y, v.z);
    }
    mountainGeo.computeVertexNormals();

    const mountainMat = new THREE.MeshLambertMaterial({
        color: 0x293d3d,
        flatShading: false, 
        fog: true
    });

    const mountainMesh = new THREE.Mesh(mountainGeo, mountainMat);
    mountainMesh.position.y = -500;
    scene.add(mountainMesh);
}

function generateNature(islandWidth) {
    const count = 50; 
    const minDist = islandWidth / 2 + 100;
    const maxDist = islandWidth / 2 + 1000;
    const trunkGeo = new THREE.BoxGeometry(30, 60, 30);
    const leaveGeo = new THREE.BoxGeometry(70, 70, 70);

    for(let i=0; i<count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = minDist + Math.random() * (maxDist - minDist);
        const x = Math.cos(angle) * dist;
        const z = Math.sin(angle) * dist;

        const trunk = new THREE.Mesh(trunkGeo, materials['wood']);
        trunk.position.set(x, 10, z);
        trunk.castShadow = true;
        
        const leaves = new THREE.Mesh(leaveGeo, materials['grass'][2]); 
        leaves.position.set(0, 50, 0);
        leaves.castShadow = true;
        trunk.add(leaves);

        trunk.userData = { bobOffset: Math.random()*100, baseY: 10 };
        trunk.name = "nature_asset";
        scene.add(trunk);
    }
}

function spawnBlock(type) {
    if(carriedBlock) dropCarried();
    const size = CONFIG.blockSize;
    
    // Create block with current shape
    let geo;
    if (SHAPES[currentShape]) {
        geo = SHAPES[currentShape].geometry(size);
    } else {
        geo = new THREE.BoxGeometry(size, size, size);
    }
    
    // Create custom material with current color for paint mode
    let mat;
    if (currentTool === 'paint') {
        const customColor = currentColor;
        const canvas = document.createElement('canvas');
        canvas.width = 64; canvas.height = 64;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = customColor;
        ctx.fillRect(0,0,64,64);
        
        const tex = new THREE.CanvasTexture(canvas);
        tex.magFilter = THREE.NearestFilter;
        mat = new THREE.MeshLambertMaterial({ map: tex });
        customColors[`${currentColor}`] = mat;
    } else {
        mat = materials[type] || materials['grass'];
    }
    
    carriedBlock = new THREE.Mesh(geo, mat);
    carriedBlock.castShadow = true;
    carriedBlock.receiveShadow = true;
    carriedBlock.userData = { 
        type: type,
        color: currentColor,
        shape: currentShape
    };
    
    if(type === 'light') carriedBlock.add(new THREE.PointLight(0xffaa00, 600, 400));

    scene.add(carriedBlock);
    
    placementGhost = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({color:0x00ff00, wireframe:true, opacity:0.5, transparent:true}));
    scene.add(placementGhost);
    
    updateCursor(true);
    saveUndoState();
    
    // Play block selected sound
    if (audioManager) {
        audioManager.playSound('ui', 500, 0.12);
    }
}

function onPointerUp(e) {
    if(e.button !== 0 || e.target.closest('#ui-layer button') || e.target.closest('.slot-container') || e.target.closest('#trash') || e.target.closest('#gen-modal') || e.target.closest('#time-control')) return;

    const dist = Math.hypot(e.clientX - mouseDownPos.x, e.clientY - mouseDownPos.y);
    if(dist > CLICK_THRESHOLD_PX) return;

    updatePointer(e);
    raycaster.setFromCamera(pointer, camera);

    if(carriedBlock) {
        const intersects = raycaster.intersectObjects(obstacleObjects, false);
        if(intersects.length > 0) {
            const newBlock = carriedBlock.clone(); 
            newBlock.position.copy(placementGhost.position);
            if(newBlock.userData.type === 'light') {
                 newBlock.clear();
                 newBlock.add(new THREE.PointLight(0xffaa00, 600, 400));
            }
            interactableObjects.push(newBlock);
            obstacleObjects.push(newBlock);
            scene.add(newBlock);
            
            // Add particle effect
            createParticle(newBlock.position, newBlock.userData.color || '#ffffff');
            
            // Play block placement sound
            if (audioManager) {
                audioManager.playSound('place', 450, 0.15);
            }
            
            saveUndoState();
        }
    } else {
        const intersects = raycaster.intersectObjects(interactableObjects, false);
        if(intersects.length > 0) {
            const target = intersects[0].object;
            carriedBlock = target;
            interactableObjects = interactableObjects.filter(o => o !== target);
            obstacleObjects = obstacleObjects.filter(o => o !== target);
            
            placementGhost = new THREE.Mesh(target.geometry, new THREE.MeshBasicMaterial({color:0x00ff00, wireframe:true}));
            scene.add(placementGhost);
            updateCursor(true);
            
            // Play block pickup sound
            if (audioManager) {
                audioManager.playSound('ui', 550, 0.12);
            }
            
            saveUndoState();
        }
    }
}

function onPointerMove(e) {
    if(!carriedBlock) return;
    updatePointer(e);
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(obstacleObjects, false);
    
    if(intersects.length > 0) {
        const hit = intersects[0];
        const size = CONFIG.blockSize;
        let pos = new THREE.Vector3().copy(hit.point).add(hit.face.normal.multiplyScalar(size/2));
        
        if (CONFIG.enableGridSnap) {
            pos.divideScalar(size).floor().multiplyScalar(size).addScalar(size/2);
        }
        
        placementGhost.position.copy(pos);
        carriedBlock.position.set(0, 8000, 0); 
    }
}

function dropCarried() {
    if(!carriedBlock) return;
    scene.remove(carriedBlock);
    if(placementGhost) scene.remove(placementGhost);
    carriedBlock = null; placementGhost = null;
    updateCursor(false);
    
    // Play block deletion sound
    if (audioManager) {
        audioManager.playSound('delete', 400, 0.15);
    }
}

function updatePointer(e) { pointer.set((e.clientX/window.innerWidth)*2-1, -(e.clientY/window.innerHeight)*2+1); }
function updateCursor(active) {
    const c = document.getElementById('carrying-cursor');
    c.style.display = active ? 'block' : 'none';
    document.body.style.cursor = active ? 'none' : 'default';
    if(active) {
        const track = (e) => { c.style.left = e.clientX+15+'px'; c.style.top = e.clientY+15+'px'; };
        document.addEventListener('pointermove', track, {once: !active});
    } else {
        document.body.style.cursor = 'default';
    }
}

// --- ML Gen Decoding Logic ---
function executeMLGeneration(type) {
    const latentVector = Array.from({length: 16}, () => Math.random() * 2 - 1);
    const outTensor = runForwardPass(latentVector, type);
    
    const s = CONFIG.blockSize;
    const cx = Math.floor(controls.target.x / s) * s + s/2;
    const cy = Math.floor(controls.target.y / s) * s + s/2;
    const cz = Math.floor(controls.target.z / s) * s + s/2;

    const addBlk = (lx, ly, lz, bType) => {
        const b = new THREE.Mesh(new THREE.BoxGeometry(s,s,s), materials[bType]);
        b.position.set(cx + lx*s, cy + ly*s, cz + lz*s);
        b.castShadow = true; b.receiveShadow = true; b.userData = {type: bType};
        if(bType === 'light') b.add(new THREE.PointLight(0xffaa00, 600, 400));
        scene.add(b); interactableObjects.push(b); obstacleObjects.push(b);
    };

    const getParam = (idx, min, max) => min + (Math.min(outTensor[idx], 10) / 10) * (max - min);

    if(type === 'Tower') {
        const h = Math.floor(getParam(0, 10, 25));
        const r = Math.floor(getParam(1, 3, 6));
        for(let y=0; y<h; y++) {
            for(let x=-r; x<=r; x++) {
                for(let z=-r; z<=r; z++) {
                    const dist = Math.sqrt(x*x + z*z);
                    if(Math.abs(dist - r) < 0.8) {
                        let bType = 'stone';
                        if(y % 4 === 0) bType = 'brick'; 
                        if(y > 2 && y < h-2 && (x===0 || z===0) && y%3!==0) bType = 'glass';
                        if(y === h-1 && (x+z)%2===0) bType = 'none'; 
                        if(bType !== 'none') addBlk(x, y, z, bType);
                    }
                    if(y===0 && dist < r) addBlk(x, y, z, 'wood'); 
                    if(y===h-2 && x===0 && z===0) addBlk(x, y, z, 'light'); 
                }
            }
        }
    }
    else if(type === 'House') {
        const w = Math.floor(getParam(0, 3, 6));
        const d = Math.floor(getParam(1, 3, 6));
        const h = Math.floor(getParam(2, 4, 7));
        for(let y=0; y<=h+w; y++) {
            for(let x=-w; x<=w; x++) {
                for(let z=-d; z<=d; z++) {
                    let bType = null;
                    if(y===0) bType = 'stone'; 
                    else if(y<h) {
                        if(x===-w || x===w || z===-d || z===d) {
                            bType = 'plank_cube'; 
                            if(y>1 && y<h-1 && (x===0 || z===0)) bType = 'glass'; 
                            if(y===1 && z===d && x===0) bType = 'none'; 
                        }
                    } else {
                        const roofH = y - h;
                        if(Math.abs(x) <= w - roofH + 1 && Math.abs(x) >= w - roofH) {
                            if(Math.abs(z) <= d + 1) bType = 'wood';
                        }
                    }
                    if(y===1 && x===0 && z===0) bType = 'light';
                    if(y===0 && (Math.abs(x)>w || Math.abs(z)>d) && Math.abs(x)<w+3 && Math.abs(z)<d+3) bType = 'grass'; 
                    
                    if(bType && bType !== 'none') addBlk(x, y, z, bType);
                }
            }
        }
    }
    else if(type === 'Castle') {
        const size = Math.floor(getParam(0, 6, 12));
        const h = Math.floor(getParam(1, 4, 8));
        for(let y=0; y<h+3; y++) {
            for(let x=-size-2; x<=size+2; x++) {
                for(let z=-size-2; z<=size+2; z++) {
                    let bType = null;
                    const isWall = (Math.abs(x) === size || Math.abs(z) === size) && Math.abs(x)<=size && Math.abs(z)<=size;
                    const isTower = Math.abs(x) >= size-1 && Math.abs(x) <= size+1 && Math.abs(z) >= size-1 && Math.abs(z) <= size+1;
                    const isMoat = (Math.abs(x) === size+2 || Math.abs(z) === size+2) && y===0;
                    
                    if(isMoat) bType = 'waterBlock';
                    else if(isTower) {
                        if(y < h+2) bType = 'stone';
                        else if((x+z)%2===0) bType = 'stone'; 
                    }
                    else if(isWall && y < h) {
                        bType = 'brick';
                        if(y===1 && z===size && Math.abs(x)<2) bType = 'none'; 
                    }
                    else if(y===0 && z===size+1 && Math.abs(x)<2) bType = 'wood'; 
                    else if(y===1 && isTower && Math.abs(x)===size && Math.abs(z)===size) bType = 'light';
                    
                    if(bType && bType !== 'none') addBlk(x, y, z, bType);
                }
            }
        }
    }
    else if(type === 'Temple') {
        const w = Math.floor(getParam(0, 5, 9));
        const d = Math.floor(getParam(1, 6, 11));
        const h = Math.floor(getParam(2, 5, 8));
        for(let y=0; y<=h+3; y++) {
            for(let x=-w; x<=w; x++) {
                for(let z=-d; z<=d; z++) {
                    let bType = null;
                    if(y===0) bType = 'stone'; 
                    else if(y===1) bType = 'plank_cube'; 
                    else if(y>1 && y<h) {
                        if((Math.abs(x)===w-1 || Math.abs(z)===d-1) && x%2===0 && z%2===0 && Math.abs(x)<w && Math.abs(z)<d) bType = 'stone'; 
                        if(x===0 && z===0 && y===2) bType = 'light'; 
                    }
                    else if(y===h) {
                        if(Math.abs(x)<w && Math.abs(z)<d) bType = 'stone'; 
                    }
                    else if(y>h) {
                        const roofLevel = y - h;
                        if(Math.abs(x) <= w - roofLevel && Math.abs(z) <= d) bType = 'brick'; 
                    }
                    if(bType) addBlk(x, y, z, bType);
                }
            }
        }
    }
    else if(type === 'Bridge') {
        const len = Math.floor(getParam(0, 8, 15));
        const width = Math.floor(getParam(1, 2, 4));
        for(let x=-len; x<=len; x++) {
            for(let y=0; y<6; y++) {
                for(let z=-width; z<=width; z++) {
                    let bType = null;
                    const archY = Math.floor(Math.cos((x/len) * Math.PI/2) * 4);
                    if(y < archY && Math.abs(x)<len-2) { } 
                    else if(y === archY) bType = 'stone'; 
                    else if(y === archY + 1) bType = 'wood'; 
                    else if(y === archY + 2 && Math.abs(z) === width) {
                        bType = 'brick'; 
                        if(x%3===0) addBlk(x, y+1, z, 'light'); 
                    } else if(y === 0 && Math.abs(x) < len) bType = 'waterBlock'; 
                    
                    if(bType) addBlk(x, y, z, bType);
                }
            }
        }
    }
    else if(type === 'Pyramid') {
        const size = Math.floor(getParam(0, 8, 14));
        for(let y=0; y<size; y++) {
            const currentSize = size - y;
            for(let x=-currentSize; x<=currentSize; x++) {
                for(let z=-currentSize; z<=currentSize; z++) {
                    let bType = 'stone';
                    if(Math.abs(x) === currentSize || Math.abs(z) === currentSize) {
                        bType = (y%2===0) ? 'stone' : 'brick';
                    } else if(y===0) bType = 'plank_cube'; 
                    else if(x===0 && z===0 && y===1) bType = 'light'; 
                    else if(Math.abs(x) < currentSize && Math.abs(z) < currentSize) bType = 'none'; 
                    
                    if(y === size - 1) bType = 'glass'; 
                    if(y === 0 && Math.abs(x) === currentSize && x%2===0) addBlk(x+1, y, z+1, 'grass'); 
                    
                    if(bType && bType !== 'none') addBlk(x, y, z, bType);
                }
            }
        }
    }
    else if(type === 'Skyscraper') {
        const w = Math.floor(getParam(0, 3, 5));
        const d = Math.floor(getParam(1, 3, 5));
        const floors = Math.floor(getParam(2, 6, 15));
        const floorHeight = 4;
        for(let f=0; f<floors; f++) {
            for(let y=0; y<floorHeight; y++) {
                for(let x=-w; x<=w; x++) {
                    for(let z=-d; z<=d; z++) {
                        let bType = null;
                        let gy = f*floorHeight + y;
                        if(y===0) bType = 'stone'; 
                        else if(x===-w || x===w || z===-d || z===d) {
                            if(Math.abs(x) === w && Math.abs(z) === d) bType = 'stone'; 
                            else bType = 'glass'; 
                        } else if (x===0 && z===0) bType = 'light'; 
                        
                        if(bType) addBlk(x, gy, z, bType);
                    }
                }
            }
        }
    }
    else if(type === 'Ruin') {
        const w = Math.floor(getParam(0, 5, 8));
        const d = Math.floor(getParam(1, 5, 8));
        const h = Math.floor(getParam(2, 4, 7));
        let idx = 0;
        for(let y=0; y<h+3; y++) {
            for(let x=-w; x<=w; x++) {
                for(let z=-d; z<=d; z++) {
                    const val = outTensor[idx % 48] + getParam((Math.abs(x)*Math.abs(z)+y)%16, 0, 2);
                    idx++;
                    if(val > 1.2) { 
                        let bType = 'stone';
                        if(y===0) bType = (val > 2.0) ? 'grass' : 'stone';
                        if(Math.abs(x)===w && Math.abs(z)===d) bType = 'brick';
                        if(val < 1.7 && bType === 'stone' && y > 0) continue; 
                        addBlk(x, y, z, bType);
                    }
                }
            }
        }
    }
    else if(type === 'Abstract') {
        let idx = 0;
        for(let x=0; x<4; x++) {
            for(let y=0; y<3; y++) {
                for(let z=0; z<4; z++) {
                    const val = outTensor[idx++];
                    if(val > 0.8) { 
                        const bTypes = ['glass', 'light', 'stone', 'waterBlock'];
                        const bType = bTypes[Math.floor((val * 10) % bTypes.length)];
                        addBlk(x, y*2, z, bType);
                        if(x !== 0) addBlk(-x, y*2, z, bType);
                        if(z !== 0) addBlk(x, y*2, -z, bType);
                        if(x !== 0 && z !== 0) addBlk(-x, y*2, -z, bType);
                        if(val > 1.2) {
                            addBlk(x, y*2+1, z, 'light');
                            if(x !== 0) addBlk(-x, y*2+1, -z, 'glass');
                        }
                    }
                }
            }
        }
    }
}

// --- System Logic ---
function createNewWorld() {
    if(worlds.length >= CONFIG.maxWorlds) return alert("Max 10 worlds!");
    const newWorld = { id: worldCounter++, data: [] };
    worlds.push(newWorld);
    renderTabs();
    switchWorld(newWorld.id);
}

function deleteWorld(id, e) {
    e.stopPropagation();
    if(worlds.length <= 1) return;
    if(!confirm("Delete world?")) return;
    const idx = worlds.findIndex(w => w.id === id);
    worlds.splice(idx, 1);
    if(currentWorldId === id) {
        clearScene();
        switchWorld(worlds[0].id);
    } else {
        renderTabs();
    }
}

function switchWorld(id) {
    if(currentWorldId === id) return;
    saveState();
    clearScene();
    currentWorldId = id;
    loadState(worlds.find(w => w.id === id).data);
    renderTabs();
}

function saveState() {
    if(!currentWorldId) return;
    const w = worlds.find(w => w.id === currentWorldId);
    w.data = interactableObjects.map(b => ({
        type: b.userData.type, x: b.position.x, y: b.position.y, z: b.position.z
    }));
}

function loadState(data) {
    data.forEach(d => {
        const s = CONFIG.blockSize;
        const shape = d.shape || 'cube';
        const geo = SHAPES[shape] ? SHAPES[shape].geometry(s) : new THREE.BoxGeometry(s, s, s);
        
        let mat;
        if (d.color && d.color !== '#ffffff') {
            if (!customColors[d.color]) {
                const canvas = document.createElement('canvas');
                canvas.width = 64; canvas.height = 64;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = d.color;
                ctx.fillRect(0,0,64,64);
                const tex = new THREE.CanvasTexture(canvas);
                tex.magFilter = THREE.NearestFilter;
                customColors[d.color] = new THREE.MeshLambertMaterial({ map: tex });
            }
            mat = customColors[d.color];
        } else {
            mat = materials[d.type] || materials['grass'];
        }
        
        const b = new THREE.Mesh(geo, mat);
        b.position.set(d.x, d.y, d.z);
        b.castShadow = true; 
        b.receiveShadow = true;
        b.userData = {type: d.type, color: d.color || '#ffffff', shape: shape};
        if(d.type==='light') b.add(new THREE.PointLight(0xffaa00, 600, 400));
        scene.add(b);
        interactableObjects.push(b);
        obstacleObjects.push(b);
    });
}

function clearScene() {
    dropCarried();
    interactableObjects.forEach(o => scene.remove(o));
    interactableObjects = [];
    obstacleObjects = [groundPlane];
}

function clearInteractableObjects() {
    interactableObjects.forEach(o => scene.remove(o));
    interactableObjects = [];
}

function renderTabs() {
    const container = document.getElementById('tab-container');
    const addBtn = container.lastElementChild;
    container.innerHTML = '';
    worlds.forEach(w => {
        const btn = document.createElement('div');
        btn.className = `world-tab ${w.id === currentWorldId ? 'active' : ''}`;
        btn.onclick = () => switchWorld(w.id);
        btn.innerHTML = `World ${w.id} <span class="del-tab" onclick="deleteWorld(${w.id}, event)">×</span>`;
        container.appendChild(btn);
    });
    container.appendChild(addBtn);
}

function downloadWorld() {
    saveState();
    const w = worlds.find(w => w.id === currentWorldId);
    const blob = new Blob([JSON.stringify(w.data)], {type: 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `voxel_world_${w.id}.json`;
    a.click();
    
    // Play download sound
    if (audioManager) audioManager.playSound('ui', 700, 0.15);
}

function handleFileLoad(e) {
    const f = e.target.files[0];
    if(!f) return;
    const r = new FileReader();
    r.onload = (evt) => {
        try {
            const data = JSON.parse(evt.target.result);
            clearScene();
            loadState(data);
            if (audioManager) audioManager.playSound('ui', 700, 0.15);
        } catch(err) { 
            alert("Invalid file");
            if (audioManager) audioManager.playSound('error', 300, 0.15);
        }
    };
    r.readAsText(f);
    e.target.value = '';
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function handleMovement() {
    const moveSpeed = 20;
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(camera.up, forward).normalize();

    const moveVec = new THREE.Vector3();
    if (keysPressed['w'] || keysPressed['arrowup']) moveVec.add(forward);
    if (keysPressed['s'] || keysPressed['arrowdown']) moveVec.sub(forward);
    if (keysPressed['d'] || keysPressed['arrowright']) moveVec.sub(right);
    if (keysPressed['a'] || keysPressed['arrowleft']) moveVec.add(right);

    if (moveVec.length() > 0) {
        moveVec.normalize().multiplyScalar(moveSpeed);
        camera.position.add(moveVec);
        controls.target.add(moveVec);
    }
}

function animate(time) {
    requestAnimationFrame(animate);
    handleMovement();
    controls.update();
    
    // Update particles
    updateParticles();
    
    // Update clouds
    updateClouds(time);
    
    
    if (sunMesh) {
        sunMesh.position.copy(sunSphere);
    }
    
    if(waterMesh) {
        waterMesh.material.map.offset.y += 0.001;
        waterMesh.material.map.offset.x += 0.0005;
    }
    scene.traverse((obj) => {
        if(obj.name === 'nature_asset') {
            obj.position.y = obj.userData.baseY + Math.sin(time * 0.002 + obj.userData.bobOffset) * 2;
        }
    });
    renderer.render(scene, camera);
}
