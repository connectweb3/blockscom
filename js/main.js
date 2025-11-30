// Initialize Lenis for smooth scrolling
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// GSAP Registration
gsap.registerPlugin(ScrollTrigger);

// Custom Cursor Logic
const cursor = document.querySelector('.cursor');
const follower = document.querySelector('.cursor-follower');

document.addEventListener('mousemove', (e) => {
    gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1 });
    gsap.to(follower, { x: e.clientX, y: e.clientY, duration: 0.3 });
});

document.querySelectorAll('a, button, input').forEach(el => {
    el.addEventListener('mouseenter', () => {
        gsap.to(follower, { scale: 2, borderColor: '#D4AF37', duration: 0.3 });
    });
    el.addEventListener('mouseleave', () => {
        gsap.to(follower, { scale: 1, borderColor: '#F0F0F0', duration: 0.3 });
    });
});

// Animations
document.addEventListener('DOMContentLoaded', () => {

    // Hero Text Reveal
    gsap.from('.split-text', {
        y: 100,
        opacity: 0,
        duration: 1.5,
        ease: 'power4.out',
        delay: 0.5
    });

    gsap.from('.fade-in', {
        y: 50,
        opacity: 0,
        duration: 1.5,
        ease: 'power4.out',
        delay: 0.8
    });

    // Section Titles
    gsap.utils.toArray('.section-title').forEach(title => {
        gsap.from(title, {
            scrollTrigger: {
                trigger: title,
                start: 'top 80%',
            },
            y: 50,
            opacity: 0,
            duration: 1.2,
            ease: 'power3.out'
        });
    });

    // NFT Slider Population & Animation
    const sliderWrapper = document.querySelector('#nft-slider .slider-wrapper');
    const nftData = [
        { title: "humanime #001", price: "125$ USD", traits: "50-200", supply: "1000 - 9999", image: "nft1/humanime.jpg", gif: "nft1/humanime.gif" },
        { title: "ceat #042", price: "125$ USD", traits: "150-200", supply: "1000 - 9999", image: "nft1/ceat.png", gif: "nft1/ceat.gif" },
        { title: "freedom #999", price: "125$ USD", traits: "50-200", supply: "1000 - 9999", image: "nft1/freedom.png", gif: "nft1/freedom.gif" },
        { title: "apin #123", price: "125$ USD", traits: "50-200", supply: "1000 - 9999", image: "nft1/apin.png", gif: "nft1/apin.gif" },
        { title: "hooman #777", price: "125$ USD", traits: "50-200", supply: "1000 - 9999", image: "nft1/hooman.png", gif: "nft1/hooman.gif" },
        { title: "pipi #000", price: "125$ USD", traits: "50-200", supply: "1000 - 9999", image: "nft1/pipi.png", gif: "nft1/pipi.gif" },
        { title: "pixelhooman #123", price: "125$ USD", traits: "50-200", supply: "1000 - 9999", image: "nft1/pixelhooman.png", gif: "nft1/pixelhooman.gif" },
        { title: "tigerr #123", price: "125$ USD", traits: "50-200", supply: "1000 - 9999", image: "nft1/tigerr.png", gif: "nft1/tigerr.gif" },
    ];

    if (sliderWrapper) {
        sliderWrapper.innerHTML = '';
        nftData.forEach((nft) => {
            const slide = document.createElement('div');
            slide.className = 'slide-item';
            slide.innerHTML = `
                <img src="${nft.image}" data-static="${nft.image}" data-gif="${nft.gif}" class="slide-image nft-hover-img" style="height: 55%;">
                <div class="slide-info">
                    <h3>${nft.title}</h3>
                    <p>${nft.price}</p>
                    <p style="font-size: 0.8rem; color:#aaa; margin: 2px 0;">Trait Count: ${nft.traits}</p>
                    <p style="font-size: 0.8rem; color:#aaa; margin: 2px 0;">Supply: ${nft.supply}</p>
                    <div style="display: flex; gap: 10px; justify-content: center; align-items: center; margin-top: 10px;">
                        <a href="#contact" class="btn-primary" style="font-size:0.6rem; padding:5px 10px; margin-top: 0;">Inquire</a>
                         <a href="https://x.com/blocksmedia_" target="_blank" class="btn-primary" style="font-size:0.6rem; padding:5px; margin-top: 0; display: flex; align-items: center; justify-content: center; width: 30px; height: 30px;">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        </a>
                    </div>
                </div>
            `;
            sliderWrapper.appendChild(slide);
        });

        // Horizontal Scroll Animation
        const sliderSection = document.getElementById('nft-marketplace');
        const getScrollAmount = () => {
            let sliderWidth = sliderWrapper.scrollWidth;
            return -(sliderWidth - window.innerWidth);
        };

        const tween = gsap.to(sliderWrapper, {
            x: getScrollAmount,
            ease: "none",
            scrollTrigger: {
                trigger: sliderSection,
                start: "top top",
                end: () => `+=${getScrollAmount() * -1}`,
                pin: true,
                scrub: 1,
                invalidateOnRefresh: true
            }
        });
    }

    // Memecoin Slider Population & Animation
    const memecoinSliderWrapper = document.querySelector('#memecoin-slider .slider-wrapper');

    // Dedicated data for Memecoin Collection
    const memecoinData = [
        { title: "Axolie", price: "125$ USD", traits: "50-200", supply: "1000 - 9999", image: "nft1/meme/axolie.png", gif: "nft1/meme/axolie.png" },
        { title: "Bonie", price: "125$ USD", traits: "50-200", supply: "1000 - 9999", image: "nft1/meme/bonie.png", gif: "nft1/meme/bonie.png" },
        { title: "Cappie", price: "125$ USD", traits: "50-200", supply: "1000 - 9999", image: "nft1/meme/cappie.png", gif: "nft1/meme/cappie.png" },
        { title: "Dogii", price: "125$ USD", traits: "50-200", supply: "1000 - 9999", image: "nft1/meme/dogii.png", gif: "nft1/meme/dogii.png" },
        { title: "Duckie", price: "125$ USD", traits: "50-200", supply: "1000 - 9999", image: "nft1/meme/duckie.png", gif: "nft1/meme/duckie.png" },
        { title: "Foxie", price: "125$ USD", traits: "50-200", supply: "1000 - 9999", image: "nft1/meme/foxie.png", gif: "nft1/meme/foxie.png" },
        { title: "Germie", price: "125$ USD", traits: "50-200", supply: "1000 - 9999", image: "nft1/meme/germie.png", gif: "nft1/meme/germie.png" },
        { title: "Gori", price: "125$ USD", traits: "50-200", supply: "31000 - 999900", image: "nft1/meme/gori.png", gif: "nft1/meme/gori.png" },
        { title: "Penie", price: "125$ USD", traits: "50-200", supply: "1000 - 9999", image: "nft1/meme/penie.png", gif: "nft1/meme/penie.png" },
        { title: "Sharkie", price: "125$ USD", traits: "50-200", supply: "1000 - 9999", image: "nft1/meme/sharkie.png", gif: "nft1/meme/sharkie.png" },
        { title: "Slothie", price: "125$ USD", traits: "50-200", supply: "1000 - 9999", image: "nft1/meme/slothie.png", gif: "nft1/meme/slothie.png" },
        { title: "Tedted", price: "125$ USD", traits: "50-200", supply: "1000 - 9999", image: "nft1/meme/tedted.png", gif: "nft1/meme/tedted.png" },
        { title: "Whalie", price: "125$ USD", traits: "50-200", supply: "1000 - 9999", image: "nft1/meme/whalie.png", gif: "nft1/meme/whalie.png" },
        { title: "Wopie", price: "125$ USD", traits: "50-200", supply: "1000 - 9999", image: "nft1/meme/wopie.png", gif: "nft1/meme/wopie.png" },
    ];

    if (memecoinSliderWrapper) {
        memecoinSliderWrapper.innerHTML = '';
        memecoinData.forEach((nft) => {
            const slide = document.createElement('div');
            slide.className = 'slide-item';
            slide.innerHTML = `
                <img src="${nft.image}" data-static="${nft.image}" data-gif="${nft.gif}" class="slide-image nft-hover-img" style="height: 55%;">
                <div class="slide-info">
                    <h3>${nft.title}</h3>
                    <p>${nft.price}</p>
                    <p style="font-size: 0.8rem; color:#aaa; margin: 2px 0;">Trait Count: ${nft.traits}</p>
                    <p style="font-size: 0.8rem; color:#aaa; margin: 2px 0;">Supply: ${nft.supply}</p>
                    <div style="display: flex; gap: 10px; justify-content: center; align-items: center; margin-top: 10px;">
                        <a href="#contact" class="btn-primary" style="font-size:0.6rem; padding:5px 10px; margin-top: 0;">Inquire</a>
                         <a href="https://x.com/blocksmedia_" target="_blank" class="btn-primary" style="font-size:0.6rem; padding:5px; margin-top: 0; display: flex; align-items: center; justify-content: center; width: 30px; height: 30px;">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        </a>
                    </div>
                </div>
            `;
            memecoinSliderWrapper.appendChild(slide);
        });

        // Horizontal Scroll Animation for Memecoin
        const memecoinSliderSection = document.getElementById('memecoin-collections');
        const getMemecoinScrollAmount = () => {
            let sliderWidth = memecoinSliderWrapper.scrollWidth;
            return -(sliderWidth - window.innerWidth);
        };

        gsap.to(memecoinSliderWrapper, {
            x: getMemecoinScrollAmount,
            ease: "none",
            scrollTrigger: {
                trigger: memecoinSliderSection,
                start: "top top",
                end: () => `+=${getMemecoinScrollAmount() * -1}`,
                pin: true,
                scrub: 1,
                invalidateOnRefresh: true
            }
        });
    }

    // Games Grid Population
    const gamesGrid = document.getElementById('games-grid');
    const gamesData = [
        { title: "Mafia Survivor", description: "Survive the mafia world in this intense game.", image: "images/blockscommafia.jpg", url: "games/mafia-survivor" },
    ];

    if (gamesGrid) {
        gamesGrid.innerHTML = '';
        gamesData.forEach((game, index) => {
            const card = document.createElement('div');
            card.className = 'game-card';
            card.innerHTML = `
                <img src="${game.image}" style="width:100%; opacity:0.8; margin-bottom:20px;">
                <h3>${game.title}</h3>
                <p style="font-family:'Montserrat'; color:#aaa; margin-bottom:15px;">${game.description}</p>
                <a href="${game.url}" class="btn-primary" style="font-size:0.7rem; padding:10px 20px; text-decoration: none; display: inline-block;">Play Now</a>
            `;
            gamesGrid.appendChild(card);

            // Staggered Animation
            gsap.from(card, {
                scrollTrigger: {
                    trigger: gamesGrid,
                    start: 'top 75%',
                },
                y: 100,
                opacity: 0,
                duration: 1,
                delay: index * 0.2,
                ease: 'power3.out'
            });
        });
    }

    // Website Slider Population & Animation
    const webSliderWrapper = document.querySelector('#web-slider .slider-wrapper');
    const webData = [
        { title: "Galaxy 1", price: "View Sample", image: "images/galaxy1.jpg", url: "websample/Galaxy1/index.html" },
        { title: "Atlantis 1", price: "View Sample", image: "images/atlantis1.jpg", url: "websample/atlantis1/index.html" },
        { title: "Cyberpunk", price: "View Sample", image: "images/cyberpunk.jpg", url: "websample/cyberpunk/index.html" },
        { title: "Cyberpunk 2", price: "View Sample", image: "images/cyberpunk2.jpg", url: "websample/cyberpunk2/index.html" },
        { title: "Galaxy 2", price: "View Sample", image: "images/galaxy2.jpg", url: "websample/galaxy2/index.html" },
        { title: "Japan 1", price: "View Sample", image: "images/japan1.jpg", url: "websample/japan1/index.html" },
        { title: "Japan 2", price: "View Sample", image: "images/japan2.jpg", url: "websample/japan2/index.html" },
    ];

    const websiteModal = document.getElementById('website-modal');
    const websiteIframe = document.getElementById('website-iframe');

    if (webSliderWrapper) {
        webSliderWrapper.innerHTML = '';
        webData.forEach((web) => {
            const slide = document.createElement('div');
            slide.className = 'slide-item';
            slide.style.cursor = 'pointer';
            slide.innerHTML = `
                <img src="${web.image}" class="slide-image">
                <div class="slide-info">
                    <h3>${web.title}</h3>
                    <p>${web.price}</p>
                </div>
            `;

            slide.addEventListener('click', () => {
                if (websiteIframe && websiteModal) {
                    websiteIframe.src = web.url;
                    openModal(websiteModal);
                }
            });

            webSliderWrapper.appendChild(slide);
        });

        // Horizontal Scroll Animation for Websites
        const webSliderSection = document.getElementById('web-design');
        const getWebScrollAmount = () => {
            let sliderWidth = webSliderWrapper.scrollWidth;
            return -(sliderWidth - window.innerWidth);
        };

        gsap.to(webSliderWrapper, {
            x: getWebScrollAmount,
            ease: "none",
            scrollTrigger: {
                trigger: webSliderSection,
                start: "top top",
                end: () => `+=${getWebScrollAmount() * -1}`,
                pin: true,
                scrub: 1,
                invalidateOnRefresh: true
            }
        });
    }
    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        item.querySelector('.faq-question').addEventListener('click', () => {
            // Close other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            // Toggle current item
            item.classList.toggle('active');
        });
    });

    // Modals Logic
    const tosLink = document.getElementById('tos-link');
    const privacyLink = document.getElementById('privacy-link');
    const tosModal = document.getElementById('tos-modal');
    const privacyModal = document.getElementById('privacy-modal');
    const closeButtons = document.querySelectorAll('.close-modal');

    function openModal(modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    function closeModal(modal) {
        modal.classList.remove('show');
        document.body.style.overflow = ''; // Restore scrolling

        // Stop iframe video/content when closing
        if (modal.id === 'website-modal') {
            const iframe = modal.querySelector('iframe');
            if (iframe) {
                iframe.src = '';
            }
        }
    }

    if (tosLink) {
        tosLink.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(tosModal);
        });
    }

    if (privacyLink) {
        privacyLink.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(privacyModal);
        });
    }

    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal');
            closeModal(modal);
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });

    // NFT Hover Effect Logic (Global)
    function initNftHoverEffects() {
        const nftImages = document.querySelectorAll('.nft-hover-img');

        nftImages.forEach(img => {
            // Store original src if data-static is not set (fallback)
            if (!img.dataset.static) {
                img.dataset.static = img.src;
            }

            img.addEventListener('mouseenter', () => {
                if (img.dataset.gif) {
                    img.src = img.dataset.gif;
                }
            });

            img.addEventListener('mouseleave', () => {
                if (img.dataset.static) {
                    img.src = img.dataset.static;
                }
            });
        });
    }

    // Initialize immediately for existing elements
    initNftHoverEffects();

    // Re-initialize if content is dynamically added (optional, but good for safety if we add more later)
    // For now, since we populate the slider *before* calling this (because this is at the end of DOMContentLoaded), it should work.
    // However, the slider population code is above, so we are good.

});
