tailwind.config = {
    theme: {
        extend: {
            colors: {
                brand: {
                    black: '#050505',
                    dark: '#0A0A0A',
                    gray: '#1F1F1F',
                    accent: '#FFFFFF',
                    dim: '#888888'
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                mono: ['Space Grotesk', 'monospace'],
            },
            backgroundImage: {
                'grid-pattern': "linear-gradient(to right, #1f1f1f 1px, transparent 1px), linear-gradient(to bottom, #1f1f1f 1px, transparent 1px)",
            }
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();

    // Allow pressing Enter (moved inside DOMContentLoaded)
    const urlInput = document.getElementById('urlInput');
    if (urlInput) {
        urlInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                captureScreenshot();
            }
        });
    }
});

async function captureScreenshot() {
    const urlInput = document.getElementById('urlInput');
    const captureBtn = document.getElementById('captureBtn');
    const loadingState = document.getElementById('loadingState');
    const resultArea = document.getElementById('resultArea');
    const screenshotImg = document.getElementById('screenshotImg');
    const downloadLink = document.getElementById('downloadLink');
    const errorMessage = document.getElementById('errorMessage');

    let url = urlInput.value.trim();
    if (!url) {
        showError("Please enter a valid URL");
        return;
    }

    // Normalize URL
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }

    // Reset UI
    showError("");
    resultArea.classList.add('hidden');
    loadingState.classList.remove('hidden');
    loadingState.classList.add('flex');
    captureBtn.disabled = true;
    captureBtn.classList.add('opacity-50', 'cursor-not-allowed');

    try {
        // Use Microlink API
        const encodedUrl = encodeURIComponent(url);
        // Parameters:
        // screenshot=true : take a screenshot
        // fullPage=true : full page screenshot
        // meta=false : don't return metadata
        // embed=screenshot.url : return just the image bytes? No, we probably want JSON to get the URL
        // Actually if we want to display it, we can just fetch the image, but loading handling is better with fetch.
        // Microlink returns JSON by default.

        // Add force=true to bypass stale cache
        const apiUrl = `https://api.microlink.io/?url=${encodedUrl}&screenshot=true&meta=false&fullPage=true&force=true&waitFor=5000`;

        const response = await fetch(apiUrl);
        const data = await response.json();

        console.log('Microlink response:', data);

        if (data.status === 'fail') {
            // Use the actual error message from the API if available
            const apiError = data.data?.message || data.message || 'Unknown error from screenshot service';
            throw new Error(`Screenshot failed: ${apiError}`);
        }

        // Check for nested data structure (Microlink API standard)
        const screenshotData = data.data?.screenshot || data.screenshot;

        if (!screenshotData) {
            throw new Error('Screenshot data missing from response.');
        }

        const imageUrl = screenshotData.url;

        // Success
        screenshotImg.src = imageUrl;
        downloadLink.href = imageUrl;

        // Wait for image to load before showing
        screenshotImg.onload = () => {
            loadingState.classList.add('hidden');
            loadingState.classList.remove('flex');
            resultArea.classList.remove('hidden');
        };

        screenshotImg.onerror = () => {
            throw new Error("Failed to load the screenshot image.");
        }

    } catch (err) {
        console.error(err);
        loadingState.classList.add('hidden');
        loadingState.classList.remove('flex');
        showError(err.message);
    } finally {
        captureBtn.disabled = false;
        captureBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
}

function showError(msg) {
    const el = document.getElementById('errorMessage');
    if (msg) {
        el.innerText = msg;
        el.classList.remove('hidden');
    } else {
        el.classList.add('hidden');
    }
}

document.addEventListener('contextmenu', event => event.preventDefault());
document.onkeydown = function (e) {
    if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) {
        return false;
    }
};
