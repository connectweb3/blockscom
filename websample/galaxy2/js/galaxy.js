// Three.js Galaxy Background - Enhanced Realism

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true; // Enable shadows for depth
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Fog for depth - Deep Space Blue/Black
scene.fog = new THREE.FogExp2(0x050510, 0.0015);

// --- Lighting ---
const ambientLight = new THREE.AmbientLight(0x404040, 0.5); // Soft white light
scene.add(ambientLight);

const pointLight1 = new THREE.PointLight(0xb026ff, 1, 100); // Purple
pointLight1.position.set(10, 10, 10);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0x00d4ff, 1, 100); // Blue
pointLight2.position.set(-10, -10, 10);
scene.add(pointLight2);

// --- Stars (Background) ---
const starGeometry = new THREE.BufferGeometry();
const starCount = 8000;
const posArray = new Float32Array(starCount * 3);
const starColors = new Float32Array(starCount * 3);

for (let i = 0; i < starCount * 3; i += 3) {
    posArray[i] = (Math.random() - 0.5) * 200;
    posArray[i + 1] = (Math.random() - 0.5) * 200;
    posArray[i + 2] = (Math.random() - 0.5) * 200;

    // Random star colors (White, Blueish, reddish)
    const colorType = Math.random();
    if (colorType > 0.9) { // Blueish
        starColors[i] = 0.8; starColors[i + 1] = 0.8; starColors[i + 2] = 1;
    } else if (colorType > 0.8) { // Reddish
        starColors[i] = 1; starColors[i + 1] = 0.8; starColors[i + 2] = 0.8;
    } else { // White
        starColors[i] = 1; starColors[i + 1] = 1; starColors[i + 2] = 1;
    }
}

starGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

const starMaterial = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending
});

const starMesh = new THREE.Points(starGeometry, starMaterial);
scene.add(starMesh);

// --- Cosmic Dust (Foreground Particles) ---
const dustGeometry = new THREE.BufferGeometry();
const dustCount = 2000;
const dustPos = new Float32Array(dustCount * 3);

for (let i = 0; i < dustCount * 3; i++) {
    dustPos[i] = (Math.random() - 0.5) * 50; // Closer range
}

dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));

const dustMaterial = new THREE.PointsMaterial({
    size: 0.03,
    color: 0xb026ff, // Purple dust
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
});

const dustMesh = new THREE.Points(dustGeometry, dustMaterial);
scene.add(dustMesh);


// --- Nebula (Procedural Cloud Textures) ---
// Create a more complex cloud texture
function createCloudTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext('2d');

    // Radial gradient for soft puff
    const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.4, 'rgba(220, 220, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(canvas);
}

const cloudTexture = createCloudTexture();
const nebulaGroup = new THREE.Group();

// Layer 1: Purple Nebula
const nebulaGeo = new THREE.PlaneGeometry(20, 20);
const nebulaMat1 = new THREE.MeshLambertMaterial({
    map: cloudTexture,
    transparent: true,
    opacity: 0.15,
    color: 0x8a2be2, // BlueViolet
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide
});

// Layer 2: Blue Nebula
const nebulaMat2 = new THREE.MeshLambertMaterial({
    map: cloudTexture,
    transparent: true,
    opacity: 0.1,
    color: 0x00bfff, // DeepSkyBlue
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide
});

for (let i = 0; i < 30; i++) {
    const mat = Math.random() > 0.5 ? nebulaMat1 : nebulaMat2;
    const cloud = new THREE.Mesh(nebulaGeo, mat);
    cloud.position.set(
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 40 - 10 // Push back slightly
    );
    cloud.rotation.z = Math.random() * Math.PI * 2;
    cloud.scale.setScalar(Math.random() * 1.5 + 1);
    nebulaGroup.add(cloud);
}
scene.add(nebulaGroup);

// --- Realistic Meteors ---
const meteorGroup = new THREE.Group();
// Use Icosahedron for more rock-like shape
const meteorGeometry = new THREE.IcosahedronGeometry(0.3, 0);
const meteorMaterial = new THREE.MeshStandardMaterial({
    color: 0x8888aa,
    roughness: 0.7,
    metalness: 0.3,
    flatShading: true
});

for (let i = 0; i < 15; i++) {
    const meteor = new THREE.Mesh(meteorGeometry, meteorMaterial);
    meteor.position.set(
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 40
    );

    // Random scale for variety
    const s = Math.random() * 0.5 + 0.5;
    meteor.scale.set(s, s, s);

    meteor.userData = {
        velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 0.05,
            (Math.random() - 0.5) * 0.05,
            (Math.random() - 0.5) * 0.05
        ),
        rotSpeed: new THREE.Vector3(
            (Math.random() - 0.5) * 0.02,
            (Math.random() - 0.5) * 0.02,
            (Math.random() - 0.5) * 0.02
        )
    };
    meteorGroup.add(meteor);
}
scene.add(meteorGroup);

camera.position.z = 5;

// --- Animation Loop ---
let scrollY = 0;
let mouseX = 0;
let mouseY = 0;

// Parallax mouse effect
document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - window.innerWidth / 2) * 0.001;
    mouseY = (e.clientY - window.innerHeight / 2) * 0.001;
});

function animate() {
    requestAnimationFrame(animate);

    const time = Date.now() * 0.0005;

    // Rotate stars slowly
    starMesh.rotation.y = time * 0.02;
    starMesh.rotation.x = scrollY * 0.0002;

    // Move dust (Parallax)
    dustMesh.rotation.y = time * 0.04 + mouseX;
    dustMesh.rotation.x = scrollY * 0.0005 + mouseY;

    // Rotate nebula layers
    nebulaGroup.children.forEach((cloud, idx) => {
        cloud.rotation.z += 0.001 * (idx % 2 === 0 ? 1 : -1);
        cloud.lookAt(camera.position); // Billboarding effect
    });

    // Move meteors
    meteorGroup.children.forEach(meteor => {
        meteor.position.add(meteor.userData.velocity);
        meteor.rotation.x += meteor.userData.rotSpeed.x;
        meteor.rotation.y += meteor.userData.rotSpeed.y;
        meteor.rotation.z += meteor.userData.rotSpeed.z;

        // Reset if too far
        if (meteor.position.distanceTo(new THREE.Vector3(0, 0, 0)) > 60) {
            meteor.position.set(
                (Math.random() - 0.5) * 30,
                (Math.random() - 0.5) * 30,
                (Math.random() - 0.5) * 30
            );
        }
    });

    // Camera movement based on scroll + slight mouse parallax
    camera.position.y = -scrollY * 0.01;
    camera.position.x += (mouseX - camera.position.x) * 0.05;

    // Dynamic light movement
    pointLight1.position.x = Math.sin(time) * 15;
    pointLight1.position.z = Math.cos(time) * 15;

    pointLight2.position.x = Math.sin(time + Math.PI) * 15;
    pointLight2.position.z = Math.cos(time + Math.PI) * 15;

    renderer.render(scene, camera);
}

animate();

// --- Resize Handler ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Scroll Handler ---
window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
});
