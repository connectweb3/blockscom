const canvas = document.querySelector('#bg-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// --- Rain Effect ---
const rainCount = 1500;
const rainGeometry = new THREE.BufferGeometry();
const rainPositions = new Float32Array(rainCount * 3);
const rainVelocities = [];

for (let i = 0; i < rainCount; i++) {
    rainPositions[i * 3] = (Math.random() - 0.5) * 50; // x
    rainPositions[i * 3 + 1] = (Math.random() - 0.5) * 50; // y
    rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 30; // z
    rainVelocities.push(0.1 + Math.random() * 0.2); // Random fall speed
}

rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));

const rainMaterial = new THREE.PointsMaterial({
    color: 0xaaaaaa,
    size: 0.1,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending
});

const rainSystem = new THREE.Points(rainGeometry, rainMaterial);
scene.add(rainSystem);

// --- Glitch Lights ---
const lights = [];
const lightColors = [0xff0000, 0xff3333, 0xaa0000]; // Red theme colors

for (let i = 0; i < 3; i++) {
    const light = new THREE.PointLight(lightColors[i], 1, 50);
    light.position.set(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 20
    );
    scene.add(light);
    lights.push(light);
}

// Ambient light to ensure visibility
const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
scene.add(ambientLight);

camera.position.z = 15;

// --- Animation Loop ---
const clock = new THREE.Clock();

function animate() {
    const elapsedTime = clock.getElapsedTime();

    // Animate Rain
    const positions = rainSystem.geometry.attributes.position.array;
    for (let i = 0; i < rainCount; i++) {
        // Move down
        positions[i * 3 + 1] -= rainVelocities[i];

        // Reset if below view
        if (positions[i * 3 + 1] < -25) {
            positions[i * 3 + 1] = 25;
            positions[i * 3] = (Math.random() - 0.5) * 50; // Randomize X on reset
        }
    }
    rainSystem.geometry.attributes.position.needsUpdate = true;

    // Simulate Wind/Natural movement
    rainSystem.rotation.y += 0.002;

    // Glitch Lights Animation
    lights.forEach(light => {
        if (Math.random() > 0.9) { // 10% chance to flicker
            light.intensity = Math.random() * 2;
        }
        // Slowly move lights
        light.position.x += Math.sin(elapsedTime + light.position.y) * 0.02;
    });

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();

// Handle Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
