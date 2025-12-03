const assets = {
    background: [
        { src: 'images/Background/Bright Violet.png', name: 'Bright Violet' },
        { src: 'images/Background/Royal Blue.png', name: 'Royal Blue' },
        { src: 'images/Background/Saffron.png', name: 'Saffron' }
    ],
    body: [
        { src: 'images/body/basebody1.png', name: 'White' },
        { src: 'images/body/basebody2.png', name: 'Diamond' },
        { src: 'images/body/basebody3.png', name: 'Gold' }
    ],
    outfit: [
        { src: 'images/outfit/Ice Camo.png', name: 'Ice Camo' },
        { src: 'images/outfit/Superman Suit.png', name: 'Superman Suit' }
    ],
    headwear: [
        { src: 'images/headwear/NY CAP.png', name: 'NY Cap' },
        { src: 'images/headwear/A Cap.png', name: 'A Cap' }
    ],
    beak: [
        { src: 'images/beak/Diamond Beak.png', name: 'Diamond Beak' },
        { src: 'images/beak/Beak.png', name: 'Standard Beak' }
    ],
    eyes: [
        { src: 'images/eyes/teary.png', name: 'Teary Eyes' },
        { src: 'images/eyes/angry.png', name: 'Angry Eyes' }
    ]
};

// Layer order: Bottom to Top
// Note: This array controls the Z-Index stacking order
const layerOrder = ['background', 'body', 'outfit', 'beak', 'eyes', 'headwear'];

function calculateCombinations() {
    let total = 1;
    for (const layer in assets) {
        total *= assets[layer].length;
    }
    return total;
}

function calculateTotalTraits() {
    let total = 0;
    for (const layer in assets) {
        total += assets[layer].length;
    }
    return total;
}

function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function updateBreakdown(layerName, asset) {
    const imgElement = document.getElementById(`breakdown-${layerName}`);
    const nameElement = document.getElementById(`name-${layerName}`);

    if (imgElement && nameElement) {
        imgElement.src = asset.src;
        nameElement.textContent = asset.name;
    }
}

function generateNFT() {
    const previewContainer = document.getElementById('nft-preview');
    previewContainer.innerHTML = ''; // Clear previous

    layerOrder.forEach((layerName, index) => {
        const layerAssets = assets[layerName];
        const selectedAsset = getRandomItem(layerAssets);

        // 1. Create Layer Image for Main Preview
        const img = document.createElement('img');
        img.src = selectedAsset.src;
        img.classList.add('nft-layer');
        img.style.zIndex = index + 1; // 1 to 5
        img.alt = `${layerName} layer`;
        previewContainer.appendChild(img);

        // 2. Update Visual Breakdown
        updateBreakdown(layerName, selectedAsset);
    });
}

function initPricingCalculators() {
    const cards = document.querySelectorAll('.pricing-card');

    cards.forEach(card => {
        const priceTag = card.querySelector('.price-tag');
        const basePrice = parseInt(priceTag.dataset.basePrice);
        const traitInput = card.querySelector('.trait-input');
        const rushCheckbox = card.querySelector('.rush-checkbox');
        const totalDisplay = card.querySelector('.total-amount');
        const rushFee = parseInt(rushCheckbox.dataset.rushFee);

        // Delivery time element
        const deliveryTimeEl = card.querySelector('.delivery-time strong');
        const deliveryListItem = card.querySelector('.delivery-time');
        const standardTime = deliveryListItem ? deliveryListItem.dataset.standard : '';
        const rushTime = deliveryListItem ? deliveryListItem.dataset.rush : '';

        function calculateTotal() {
            let total = basePrice;

            // Add traits cost
            const traits = parseInt(traitInput.value) || 0;
            // Ensure non-negative
            const safeTraits = Math.max(0, traits);
            total += safeTraits * 10;

            // Add rush fee and update delivery text
            if (rushCheckbox.checked) {
                total += rushFee;
                if (deliveryTimeEl && rushTime) {
                    deliveryTimeEl.textContent = rushTime;
                }
            } else {
                if (deliveryTimeEl && standardTime) {
                    deliveryTimeEl.textContent = standardTime;
                }
            }

            totalDisplay.textContent = total;
        }

        traitInput.addEventListener('input', calculateTotal);
        rushCheckbox.addEventListener('change', calculateTotal);
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const totalCombinations = calculateCombinations();
    document.getElementById('total-combinations').textContent = totalCombinations;

    const totalTraits = calculateTotalTraits();
    document.getElementById('total-traits').textContent = totalTraits;

    const generateBtn = document.getElementById('generate-btn');
    generateBtn.addEventListener('click', generateNFT);

    // Generate one on load
    generateNFT();

    // Initialize Pricing Calculators
    initPricingCalculators();

    // Hamburger Menu Toggle
    const hamburgerBtn = document.querySelector('.hamburger-menu');
    const sidebar = document.querySelector('.sidebar');

    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', () => {
            sidebar.classList.toggle('mobile-menu-open');
        });
    }
});
