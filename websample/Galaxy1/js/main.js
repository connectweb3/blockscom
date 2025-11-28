// Main UI Logic

document.addEventListener('DOMContentLoaded', () => {

    // Loading Screen
    const loadingScreen = document.getElementById('loading-screen');
    setTimeout(() => {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }, 1500); // Fake load time to show off the loader

    // Glitch Text Effect for Hero
    const glitchText = document.querySelector('.glitch-text');
    if (glitchText) {
        anime({
            targets: glitchText,
            opacity: [0, 1],
            scale: [0.8, 1],
            duration: 1000,
            easing: 'easeOutExpo',
            delay: 1600
        });
    }

    // NFT Slider Logic
    const sliderWrapper = document.querySelector('.slider-wrapper');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const cards = document.querySelectorAll('.nft-card');

    let currentIndex = 0;

    function getCardWidth() {
        if (cards.length > 0) {
            const style = window.getComputedStyle(sliderWrapper);
            const gap = parseFloat(style.gap) || 32;
            return cards[0].offsetWidth + gap;
        }
        return 332;
    }

    function updateSlider() {
        const cardWidth = getCardWidth();
        const offset = -(currentIndex * cardWidth);
        anime({
            targets: sliderWrapper,
            translateX: offset,
            duration: 600,
            easing: 'cubicBezier(0.25, 1, 0.5, 1)'
        });
    }

    if (nextBtn && prevBtn && cards.length > 0) {
        nextBtn.addEventListener('click', () => {
            const containerWidth = document.querySelector('.slider-container').offsetWidth;
            const cardWidth = getCardWidth();
            // Ensure we don't scroll past the end
            // If cards don't fill the screen, visibleCards might be > cards.length, so maxIndex should be at least 0
            const visibleCards = Math.floor(containerWidth / cardWidth);
            const maxIndex = Math.max(0, cards.length - visibleCards);

            if (currentIndex < maxIndex) {
                currentIndex++;
                updateSlider();
            }
        });

        prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateSlider();
            }
        });
    }

    // Scroll Animations (Intersection Observer)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');

                // Animate children if needed
                anime({
                    targets: entry.target,
                    translateY: [50, 0],
                    opacity: [0, 1],
                    duration: 800,
                    easing: 'easeOutQuad',
                    delay: anime.stagger(100)
                });

                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe sections and cards
    // Removed .nft-card from observer to avoid visibility issues in the slider
    document.querySelectorAll('.section-title, .roadmap-item, .token-card').forEach(el => {
        el.style.opacity = '0'; // Initial state
        observer.observe(el);
    });

    // Roadmap Line Animation
    const roadmapLine = document.querySelector('.roadmap-line');
    if (roadmapLine) {
        window.addEventListener('scroll', () => {
            const scrollPercent = (window.scrollY - roadmapLine.offsetTop + window.innerHeight / 2) / roadmapLine.offsetHeight;
            // Could use this to animate the gradient or height
        });
    }
});
