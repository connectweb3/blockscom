// Three.js Cherry Blossom Background
const canvas = document.getElementById('bg-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Create Petal Texture
function createPetalTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext('2d');
    
    const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255, 183, 197, 1)');
    gradient.addColorStop(1, 'rgba(255, 183, 197, 0)');
    
    context.fillStyle = gradient;
    context.beginPath();
    context.ellipse(16, 16, 8, 14, Math.PI / 4, 0, 2 * Math.PI);
    context.fill();
    
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
}

// Particles
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 1500; // Number of petals
const posArray = new Float32Array(particlesCount * 3);
const rotationArray = new Float32Array(particlesCount * 3); // Random rotation

for(let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 20; // Spread
    rotationArray[i] = Math.random() * Math.PI;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
particlesGeometry.setAttribute('rotation', new THREE.BufferAttribute(rotationArray, 3));

const material = new THREE.PointsMaterial({
    size: 0.15,
    map: createPetalTexture(),
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
    blending: THREE.AdditiveBlending
});

const particlesMesh = new THREE.Points(particlesGeometry, material);
scene.add(particlesMesh);

camera.position.z = 5;

// Mouse Interaction
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (event) => {
    mouseX = event.clientX / window.innerWidth - 0.5;
    mouseY = event.clientY / window.innerHeight - 0.5;
});

// Animation Loop
const clock = new THREE.Clock();

function animate() {
    const elapsedTime = clock.getElapsedTime();

    // Rotate entire system slightly
    particlesMesh.rotation.y = mouseY * 0.1;
    particlesMesh.rotation.x = mouseX * 0.1;

    // Animate individual particles (simulate falling)
    // Accessing the position attribute directly is expensive if done every frame for all particles in this way
    // Instead, we'll move the whole mesh and wrap around, or use a shader.
    // For simplicity in this script, let's just rotate the mesh and add some wave motion
    
    particlesMesh.rotation.y += 0.001;
    particlesMesh.position.y = -elapsedTime * 0.2 % 20; // Fall down
    
    // Reset position to create infinite loop effect
    if (particlesMesh.position.y < -5) {
       // particlesMesh.position.y = 5; 
       // This simple reset is visible. 
       // Better approach: Update positions in the buffer.
    }

    // Let's actually update positions for a better effect
    const positions = particlesGeometry.attributes.position.array;
    for(let i = 0; i < particlesCount; i++) {
        const i3 = i * 3;
        
        // Fall down
        positions[i3 + 1] -= 0.01 + Math.random() * 0.01;
        
        // Sway
        positions[i3] += Math.sin(elapsedTime + positions[i3+1]) * 0.002;
        
        // Reset if below view
        if(positions[i3 + 1] < -10) {
            positions[i3 + 1] = 10;
            positions[i3] = (Math.random() - 0.5) * 20;
            positions[i3 + 2] = (Math.random() - 0.5) * 10;
        }
    }
    particlesGeometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();

// Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


// Scroll Animations (Intersection Observer)
const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Optional: Stop observing once visible
            // observer.unobserve(entry.target);
        }
    });
}, observerOptions);

const animatedElements = document.querySelectorAll('.fade-in, .fade-in-up, .fade-in-left, .fade-in-right');
animatedElements.forEach(el => observer.observe(el));

// 3D Tilt Effect for Cards
const cards = document.querySelectorAll('.nft-card');

cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    });
});

// Gallery Navigation
const galleryContainer = document.querySelector('.gallery-container');
const arrowLeft = document.querySelector('.arrow-left');
const arrowRight = document.querySelector('.arrow-right');

if (galleryContainer && arrowLeft && arrowRight) {
    arrowLeft.addEventListener('click', () => {
        galleryContainer.scrollBy({
            left: -350, // Card width + gap
            behavior: 'smooth'
        });
    });

    arrowRight.addEventListener('click', () => {
        galleryContainer.scrollBy({
            left: 350,
            behavior: 'smooth'
        });
    });
}
