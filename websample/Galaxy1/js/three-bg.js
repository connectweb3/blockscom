// Three.js Cosmic Background

const container = document.getElementById('canvas-container');

// Scene Setup
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050505, 0.001);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 50;

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// Particles (Stars)
const starGeometry = new THREE.BufferGeometry();
const starCount = 5000;
const posArray = new Float32Array(starCount * 3);

for (let i = 0; i < starCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 200; // Spread stars
}

starGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

// Create a circular texture for stars
const sprite = new THREE.TextureLoader().load('https://threejs.org/examples/textures/sprites/disc.png');

const starMaterial = new THREE.PointsMaterial({
    size: 0.15,
    color: 0xffffff,
    transparent: true,
    map: sprite,
});

const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// Nebula (Cloud particles)
const cloudParticles = [];
const loader = new THREE.TextureLoader();
// Using a smoke texture from a CDN
loader.load('https://raw.githubusercontent.com/navin-navi/codepen-assets/master/images/smoke.png', function (texture) {
    const cloudGeo = new THREE.PlaneBufferGeometry(50, 50);
    const cloudMaterial = new THREE.MeshLambertMaterial({
        map: texture,
        transparent: true,
        opacity: 0.3,
        depthWrite: false,
    });

    for (let p = 0; p < 15; p++) {
        const cloud = new THREE.Mesh(cloudGeo, cloudMaterial);
        cloud.position.set(
            Math.random() * 80 - 40,
            Math.random() * 40 - 20,
            Math.random() * 50 - 60 // Position them behind
        );
        cloud.rotation.z = Math.random() * 360;
        cloud.material.color.setHex(0xa855f7); // Purple base
        if (Math.random() > 0.5) cloud.material.color.setHex(0x3b82f6); // Blue accents

        scene.add(cloud);
        cloudParticles.push(cloud);
    }
});

// Lighting for Nebula
const ambientLight = new THREE.AmbientLight(0x555555);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xff8c19);
directionalLight.position.set(0, 0, 1);
scene.add(directionalLight);

const purpleLight = new THREE.PointLight(0xd8547e, 50, 450, 1.7);
purpleLight.position.set(200, 300, 100);
scene.add(purpleLight);

const blueLight = new THREE.PointLight(0x3677ac, 50, 450, 1.7);
blueLight.position.set(100, 300, 100);
scene.add(blueLight);


// Animation Loop
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (event) => {
    mouseX = event.clientX / window.innerWidth - 0.5;
    mouseY = event.clientY / window.innerHeight - 0.5;
});

// Scroll Effect
let scrollY = 0;
window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
});

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Rotate Stars
    stars.rotation.y += 0.0005;
    stars.rotation.x += 0.0002;

    // Move Stars based on mouse
    stars.rotation.x += mouseY * 0.001;
    stars.rotation.y += mouseX * 0.001;

    // Nebula Animation
    cloudParticles.forEach(p => {
        p.rotation.z -= 0.001;
    });

    // Camera Movement on Scroll
    // Move camera forward/backward or rotate based on scroll
    camera.position.z = 50 - (scrollY * 0.01);
    camera.position.y = -(scrollY * 0.01);

    renderer.render(scene, camera);
}

animate();

// Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
