// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Hero Animation
gsap.from(".hero-content > *", {
    y: 100,
    opacity: 0,
    duration: 1.5,
    stagger: 0.2,
    ease: "power4.out",
    delay: 0.5
});

// Glitch Effect for Title (Simple CSS class toggle or manual manipulation)
const glitchText = document.querySelector('.glitch-text');
setInterval(() => {
    glitchText.style.textShadow = `
        ${Math.random() * 10 - 5}px ${Math.random() * 10 - 5}px 0 #ff00cc,
        ${Math.random() * 10 - 5}px ${Math.random() * 10 - 5}px 0 #00d4ff
    `;
    setTimeout(() => {
        glitchText.style.textShadow = '0 0 30px rgba(106, 0, 255, 0.8)';
    }, 100);
}, 3000);

// Gallery Animation (Robust Seamless Loop)
// Gallery Animation (Robust Seamless Loop)
const galleryTrack = document.querySelector('.gallery-track');
const originalCards = document.querySelectorAll('.nft-card');

if (galleryTrack && originalCards.length > 0) {
    // Calculate dimensions dynamically
    const cardWidth = originalCards[0].offsetWidth;
    const trackStyle = window.getComputedStyle(galleryTrack);
    const gap = parseFloat(trackStyle.gap) || 32; // Default to 32px if 2rem

    const singleSetWidth = (cardWidth + gap) * originalCards.length;

    // Clone cards to fill the screen + buffer
    const screenWidth = window.innerWidth;
    const setsNeeded = Math.ceil(screenWidth / singleSetWidth) + 1;

    for (let i = 0; i < setsNeeded; i++) {
        originalCards.forEach(card => {
            const clone = card.cloneNode(true);
            galleryTrack.appendChild(clone);
        });
    }

    // Animate
    // Simply move left by the width of one set, then repeat.
    // Since the first clone set starts exactly where the original set ends,
    // snapping back to 0 (which repeat: -1 does) will be seamless.
    const loopTween = gsap.to(galleryTrack, {
        x: -singleSetWidth,
        duration: 20, // Adjust speed (seconds per cycle)
        ease: "none",
        repeat: -1
    });

    // Hover effect to pause
    galleryTrack.addEventListener('mouseenter', () => {
        loopTween.pause();
    });

    galleryTrack.addEventListener('mouseleave', () => {
        loopTween.play();
    });
}

// Animate cards in initially (Optional, might cause jumpiness if not careful, keeping it simple for now)
// Removed initial stagger to prevent conflict with the loop


// Roadmap Animation
const roadmapItems = document.querySelectorAll('.roadmap-item');
roadmapItems.forEach((item, index) => {
    gsap.to(item, {
        scrollTrigger: {
            trigger: item,
            start: "top 85%",
            toggleActions: "play none none reverse"
        },
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out"
    });
});

// Roadmap Line Animation
gsap.from(".roadmap-line", {
    scrollTrigger: {
        trigger: "#roadmap",
        start: "top 70%",
        end: "bottom 70%",
        scrub: 1
    },
    height: 0,
    ease: "none"
});

// Tokenomics Animation
gsap.from(".token-card", {
    scrollTrigger: {
        trigger: "#tokenomics",
        start: "top 80%",
    },
    scale: 0.8,
    opacity: 0,
    duration: 0.8,
    stagger: 0.2,
    ease: "back.out(1.7)"
});

gsap.from(".rarity-row", {
    scrollTrigger: {
        trigger: ".rarity-section",
        start: "top 85%",
    },
    x: -50,
    opacity: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: "power2.out"
});

// Animate Rarity Bars Width
const bars = document.querySelectorAll('.bar');
bars.forEach(bar => {
    const width = bar.style.width;
    bar.style.width = '0%';

    gsap.to(bar, {
        scrollTrigger: {
            trigger: bar,
            start: "top 90%",
        },
        width: width,
        duration: 1.5,
        ease: "power2.out"
    });
});

// Navbar Scroll Effect
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.glass-nav');
    if (window.scrollY > 50) {
        nav.style.padding = '1rem 5%';
        nav.style.background = 'rgba(5, 5, 16, 0.9)';
    } else {
        nav.style.padding = '1.5rem 5%';
        nav.style.background = 'rgba(5, 5, 16, 0.7)';
    }
});
