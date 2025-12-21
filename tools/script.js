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
});

document.addEventListener('contextmenu', event => event.preventDefault());
document.onkeydown = function (e) {
    if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) {
        return false;
    }
};
