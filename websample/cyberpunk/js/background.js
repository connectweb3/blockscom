const container = document.getElementById('canvas-container');

// Scene Setup
const scene = new THREE.Scene();
// No fog for now, or very light to blend with image
// scene.fog = new THREE.FogExp2(0x050510, 0.002);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 50;

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// --- RAIN EFFECT ---
const rainGeometry = new THREE.BufferGeometry();
const rainCount = 15000;
const rainPositions = new Float32Array(rainCount * 3);
const rainVelocities = [];

for (let i = 0; i < rainCount; i++) {
    rainPositions[i * 3] = (Math.random() - 0.5) * 400; // x
    rainPositions[i * 3 + 1] = (Math.random() - 0.5) * 400; // y
    rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 100 + 20; // z
    rainVelocities.push(0.5 + Math.random() * 0.5); // speed
}

rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));

const rainMaterial = new THREE.PointsMaterial({
    color: 0xaaaaaa,
    size: 0.2,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
});

const rain = new THREE.Points(rainGeometry, rainMaterial);
scene.add(rain);

// --- NEON PARTICLES (Floating Glitch/Dust) ---
const neonGeo = new THREE.BufferGeometry();
const neonCount = 500;
const neonPos = new Float32Array(neonCount * 3);
const neonColors = new Float32Array(neonCount * 3);

const color1 = new THREE.Color(0x00ffea); // Cyan
const color2 = new THREE.Color(0xff00ff); // Magenta

for (let i = 0; i < neonCount; i++) {
    neonPos[i * 3] = (Math.random() - 0.5) * 200;
    neonPos[i * 3 + 1] = (Math.random() - 0.5) * 200;
    neonPos[i * 3 + 2] = (Math.random() - 0.5) * 100 + 30;

    const mixedColor = color1.clone().lerp(color2, Math.random());
    neonColors[i * 3] = mixedColor.r;
    neonColors[i * 3 + 1] = mixedColor.g;
    neonColors[i * 3 + 2] = mixedColor.b;
}

neonGeo.setAttribute('position', new THREE.BufferAttribute(neonPos, 3));
neonGeo.setAttribute('color', new THREE.BufferAttribute(neonColors, 3));

const neonMat = new THREE.PointsMaterial({
    size: 0.5,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
});

const neonParticles = new THREE.Points(neonGeo, neonMat);
scene.add(neonParticles);

// --- HOLOGRAM EFFECT (Simple Grid Floor/Ceiling) ---
const gridHelper = new THREE.GridHelper(200, 50, 0x00ffea, 0xff00ff);
gridHelper.position.y = -30;
gridHelper.rotation.x = 0.1;
gridHelper.material.opacity = 0.2;
gridHelper.material.transparent = true;
scene.add(gridHelper);


// Animation Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    // Animate Rain
    const rainPos = rain.geometry.attributes.position.array;
    for (let i = 0; i < rainCount; i++) {
        const i3 = i * 3;
        rainPos[i3 + 1] -= rainVelocities[i]; // Move down

        // Reset if too low
        if (rainPos[i3 + 1] < -100) {
            rainPos[i3 + 1] = 100;
        }
    }
    rain.geometry.attributes.position.needsUpdate = true;

    // Simulate wind/movement for rain
    rain.rotation.z = 0.05;

    // Animate Neon Particles
    neonParticles.rotation.y += 0.002;
    const nPos = neonParticles.geometry.attributes.position.array;
    for (let i = 0; i < neonCount; i++) {
        const i3 = i * 3;
        // Jitter effect (glitchy movement)
        if (Math.random() > 0.95) {
            nPos[i3] += (Math.random() - 0.5) * 0.5;
            nPos[i3 + 1] += (Math.random() - 0.5) * 0.5;
        }
    }
    neonParticles.geometry.attributes.position.needsUpdate = true;

    // Grid Animation
    gridHelper.position.z = (Date.now() * 0.005) % 10;

    renderer.render(scene, camera);
}

animate();

// Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
