document.addEventListener('DOMContentLoaded', () => {

    // --- State ---
    const state = {
        templateId: 1,
        color: '#000000', // Default black/dark for light bg emails
        data: {
            name: 'John Doe',
            position: 'Product Designer',
            company: 'Blockscom Media',
            email: 'john@example.com',
            phone: '+1 (555) 123-4567',
            office_phone: '',
            location: 'New York, NY',
            website: 'www.blockscom.xyz',
            avatar: 'https://blockscom.xyz/images/logo.jpg',
            social_linkedin: '',
            social_upwork: '',
            social_instagram: '',
            social_facebook: '',
            social_youtube: '',
            social_telegram: ''
        }
    };

    // --- Elements ---
    const form = document.getElementById('signature-form');
    const previewContainer = document.getElementById('preview-container');
    const templateSelector = document.getElementById('template-selector');
    const colorBtns = document.querySelectorAll('.color-btn');
    const customColorInput = document.getElementById('custom-color');
    const copyBtn = document.getElementById('copy-html-btn');

    // Modal Elements
    const helpBtn = document.getElementById('help-btn');
    const helpModal = document.getElementById('help-modal');
    const closeModal = document.getElementById('close-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');

    // --- Initialization ---
    initTemplateSelector();
    render();

    // --- Event Listeners ---

    // Modal
    const toggleModal = (show) => {
        if (show) {
            helpModal.classList.remove('opacity-0', 'pointer-events-none');
            helpModal.querySelector('div').classList.remove('scale-95');
            helpModal.querySelector('div').classList.add('scale-100');
        } else {
            helpModal.classList.add('opacity-0', 'pointer-events-none');
            helpModal.querySelector('div').classList.add('scale-95');
            helpModal.querySelector('div').classList.remove('scale-100');
        }
    };

    helpBtn.addEventListener('click', () => toggleModal(true));
    closeModal.addEventListener('click', () => toggleModal(false));
    closeModalBtn.addEventListener('click', () => toggleModal(false));
    helpModal.addEventListener('click', (e) => {
        if (e.target === helpModal) toggleModal(false);
    });

    // --- Event Listeners ---

    // Form Input
    form.addEventListener('input', (e) => {
        const { name, value } = e.target;
        state.data[name] = value;
        render();
    });

    // Color Selection
    colorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // UI Update
            colorBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // State Update
            state.color = btn.dataset.color;
            if (state.color === '#FFFFFF') state.color = '#000000'; // Logic flip for paper preview
            render();
        });
    });

    customColorInput.addEventListener('input', (e) => {
        state.color = e.target.value;
        colorBtns.forEach(b => b.classList.remove('active'));
        render();
    });

    // --- Functions ---

    function initTemplateSelector() {
        const templateCount = 10;
        for (let i = 1; i <= templateCount; i++) {
            const btn = document.createElement('button');
            btn.className = `template-btn ${i === 1 ? 'active' : ''}`;
            btn.textContent = `Design ${i}`;
            btn.onclick = () => {
                state.templateId = i;
                document.querySelectorAll('.template-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                render();
            };
            templateSelector.appendChild(btn);
        }
    }

    function render() {
        if (!typeof window.getTemplate === 'function') {
            console.error('Templates logic not loaded');
            return;
        }

        const html = window.getTemplate(state.templateId, state.data, state.color);
        previewContainer.innerHTML = html;
    }

    // --- Export ---
    copyBtn.addEventListener('click', () => {
        const signatureHtml = previewContainer.innerHTML;

        const showSuccess = () => {
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i data-lucide="check" class="w-4 h-4"></i> Copied!';
            copyBtn.classList.add('bg-green-500', 'text-white');
            copyBtn.classList.remove('bg-white', 'text-black');
            lucide.createIcons();

            setTimeout(() => {
                copyBtn.innerHTML = originalText;
                copyBtn.classList.remove('bg-green-500', 'text-white');
                copyBtn.classList.add('bg-white', 'text-black');
                lucide.createIcons();
            }, 2000);
        };

        try {
            const htmlBlob = new Blob([signatureHtml], { type: "text/html" });
            const textBlob = new Blob([signatureHtml], { type: "text/plain" });
            const item = new ClipboardItem({
                "text/html": htmlBlob,
                "text/plain": textBlob
            });

            navigator.clipboard.write([item]).then(showSuccess).catch(err => {
                console.warn('Clipboard write failed, falling back to text', err);
                navigator.clipboard.writeText(signatureHtml).then(showSuccess);
            });
        } catch (err) {
            console.warn('Clipboard API error, falling back to text', err);
            navigator.clipboard.writeText(signatureHtml).then(showSuccess);
        }
    });

});
