// Init Icons & Smooth Scroll
lucide.createIcons();
const lenis = new Lenis({ duration: 1.2, smooth: true });
function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);

// Custom Cursor
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');
const hoverTriggers = document.querySelectorAll('.hover-trigger');

window.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;
    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;
    gsap.to(cursorOutline, { x: posX, y: posY, duration: 0.15, ease: "power2.out" });
});

// Add hover triggers dynamically for injected elements
function attachHoverEffects() {
    const triggers = document.querySelectorAll('.hover-trigger');
    triggers.forEach(trigger => {
        trigger.removeEventListener('mouseenter', handleMouseEnter);
        trigger.removeEventListener('mouseleave', handleMouseLeave);
        trigger.addEventListener('mouseenter', handleMouseEnter);
        trigger.addEventListener('mouseleave', handleMouseLeave);
    });
}

function handleMouseEnter() {
    document.body.classList.add('hovering');
    cursorOutline.style.borderColor = 'transparent';
    cursorOutline.style.backgroundColor = 'rgba(255,255,255,0.2)';
}

function handleMouseLeave() {
    document.body.classList.remove('hovering');
    cursorOutline.style.borderColor = 'rgba(255, 255, 255, 0.5)';
    cursorOutline.style.backgroundColor = 'transparent';
}

attachHoverEffects();

// ----------------------------------------------------
// ORIGINAL LOGIC ADAPTED
// ----------------------------------------------------
const API_KEY = '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';
const MODEL = 'x-ai/grok-4.1-fast'; // Using fast model for demo

const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const imagePreview = document.getElementById('imagePreview');
const dropContent = document.getElementById('dropContent');
const generateBtn = document.getElementById('generateBtn');
const outputArea = document.getElementById('outputArea');
const copyBtn = document.getElementById('copyBtn');
const statusTag = document.getElementById('statusTag');
const ratioBtns = document.querySelectorAll('.ratio-btn');
const styleSelect = document.getElementById('styleSelect');
const filterSelect = document.getElementById('filterSelect');
const secondarySlotsContainer = document.getElementById('secondarySlotsContainer');
const secondarySlotsArea = document.getElementById('secondarySlotsArea');
const regenerateBtn = document.getElementById('regenerateBtn');

let currentImageBase64 = null;
let selectedRatio = '1:1';
let secondaryInputs = {};

// Ratio Selection UI
ratioBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        ratioBtns.forEach(b => {
            b.classList.remove('active', 'border-white', 'bg-white', 'text-black');
            b.classList.add('border-white/20', 'text-gray-400');
        });
        btn.classList.add('active', 'border-white', 'bg-white', 'text-black');
        btn.classList.remove('border-white/20', 'text-gray-400');
        selectedRatio = btn.dataset.ratio;
    });
});

// Drag and Drop
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('border-white', 'bg-white/10');
});
dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('border-white', 'bg-white/10');
});
dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('border-white', 'bg-white/10');
    handleFile(e.dataTransfer.files[0]);
});
dropZone.addEventListener('click', (e) => {
    if (e.target.closest('button')) return; // Ignore clear btn
    fileInput.click();
});
fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));

function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        currentImageBase64 = e.target.result;
        imagePreview.src = currentImageBase64;
        imagePreview.classList.remove('hidden');
        dropContent.classList.add('hidden');
        generateBtn.disabled = false;
        outputArea.innerText = 'Image loaded. Ready to generate.';
        statusTag.innerText = 'Image Loaded';
    };
    reader.readAsDataURL(file);
}

window.clearImage = function () {
    currentImageBase64 = null;
    imagePreview.classList.add('hidden');
    imagePreview.src = '';
    dropContent.classList.remove('hidden');
    fileInput.value = '';
    generateBtn.disabled = true;
    outputArea.innerText = 'Select an image to start...';
    statusTag.innerText = 'Ready';
    // Hide secondary
    secondarySlotsArea.classList.add('hidden');
    secondarySlotsContainer.innerHTML = '';
}

// Generate Prompt
generateBtn.addEventListener('click', async () => {
    if (!currentImageBase64) return;
    setLoading(true);
    secondarySlotsArea.classList.add('hidden');
    secondarySlotsContainer.innerHTML = '';
    secondaryInputs = {};

    const base64Data = currentImageBase64.split(',')[1];
    const mimeType = currentImageBase64.split(';')[0].split(':')[1];

    let systemPrompt = "Analyze this image and provide a JSON response.\n";
    systemPrompt += "Return a valid JSON object with two keys:\n";
    systemPrompt += "1. 'prompt': A SUPER HIGHLY DETAILED JSON-style text description. Keys: 'Subject', 'Physical_Appearance' (Face, Hair, Body), 'Outfit_Details', 'Pose_&_Action', 'Environment_&_Background', 'Lighting_&_Atmosphere', 'Camera_Settings_&_Angle', 'Art_Style_&_Aesthetic', 'Color_Palette'.\n";
    systemPrompt += "2. 'detected_elements': An array of strings identifying distinctive subjects or props (e.g. 'Person on left', 'Product'). Limit to 1-4 items.\n\n";
    systemPrompt += `REQUIRED ASPECT RATIO: ${selectedRatio}\n`;
    if (styleSelect.value) systemPrompt += `REQUIRED STYLE: ${styleSelect.value}\n`;
    if (filterSelect.value) systemPrompt += `REQUIRED FILTER: ${filterSelect.value}\n`;

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.href,
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: systemPrompt },
                            { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Data}` } }
                        ]
                    }
                ],
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) throw new Error(`API Error: ${response.statusText}`);

        const data = await response.json();
        let contentStr = data.choices[0].message.content;
        // Parse JSON
        let result = {};
        try {
            result = JSON.parse(contentStr);
        } catch (e) {
            // Clean markdown code blocks if any
            contentStr = contentStr.replace(/```json/g, '').replace(/```/g, '').trim();
            try { result = JSON.parse(contentStr); } catch (e2) { result = { prompt: contentStr, detected_elements: [] }; }
        }

        // Display
        if (typeof result.prompt === 'object') {
            outputArea.innerText = JSON.stringify(result.prompt, null, 2);
        } else {
            outputArea.innerText = result.prompt;
        }

        statusTag.innerText = 'Completed';
        statusTag.className = 'text-xs font-mono px-2 py-1 rounded bg-green-500/20 text-green-400';

        // Slots
        if (result.detected_elements && result.detected_elements.length > 0) {
            createSecondarySlots(result.detected_elements);
        }

    } catch (error) {
        console.error(error);
        outputArea.innerText = `Error: ${error.message}`;
        statusTag.innerText = 'Error';
        statusTag.className = 'text-xs font-mono px-2 py-1 rounded bg-red-500/20 text-red-400';
    } finally {
        setLoading(false);
    }
});

function createSecondarySlots(elements) {
    secondarySlotsContainer.innerHTML = '';
    secondarySlotsArea.classList.remove('hidden');
    regenerateBtn.disabled = true;

    elements.forEach((label, index) => {
        const slotId = `slot-${index}`;

        const card = document.createElement('div');
        card.className = 'bg-black/40 border border-white/10 rounded-xl p-3 flex flex-col gap-3';

        card.innerHTML = `
            <div class="text-[10px] uppercase font-bold text-gray-400">${label}</div>
            
            <div class="flex gap-2 p-1 bg-black/40 rounded-lg">
                <button class="toggle-btn w-full py-1 text-[10px] rounded bg-white text-black font-bold" data-type="image" data-id="${slotId}">Img</button>
                <button class="toggle-btn w-full py-1 text-[10px] rounded text-gray-400 hover:text-white" data-type="text" data-id="${slotId}">Txt</button>
            </div>

            <div id="content-image-${slotId}" class="relative w-full h-20 border border-dashed border-white/20 rounded-lg flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors group">
                <input type="file" id="input-${slotId}" accept="image/*" class="hidden">
                <i data-lucide="image" class="w-4 h-4 text-gray-500 group-hover:text-white"></i>
                <img id="img-${slotId}" class="absolute inset-0 w-full h-full object-cover rounded-lg hidden">
            </div>

            <div id="content-text-${slotId}" class="hidden w-full h-20">
                <textarea id="text-${slotId}" placeholder="Enter details..." class="w-full h-full bg-transparent text-xs p-2 focus:outline-none resize-none"></textarea>
            </div>
        `;

        secondarySlotsContainer.appendChild(card);

        // Re-init lucide for this card
        lucide.createIcons();

        // Logic for this slot
        const imgBtn = card.querySelector(`[data-type="image"]`);
        const txtBtn = card.querySelector(`[data-type="text"]`);
        const imgContainer = card.querySelector(`#content-image-${slotId}`);
        const txtContainer = card.querySelector(`#content-text-${slotId}`);
        const fileInput = card.querySelector(`#input-${slotId}`);
        const imgEl = card.querySelector(`#img-${slotId}`);
        const textArea = card.querySelector(`#text-${slotId}`);

        const setType = (type) => {
            if (type === 'image') {
                imgBtn.className = 'toggle-btn w-full py-1 text-[10px] rounded bg-white text-black font-bold';
                txtBtn.className = 'toggle-btn w-full py-1 text-[10px] rounded text-gray-400 hover:text-white';
                imgContainer.classList.remove('hidden');
                txtContainer.classList.add('hidden');

                if (imgEl.classList.contains('hidden')) {
                    delete secondaryInputs[label];
                } else {
                    secondaryInputs[label] = { type: 'image', data: imgEl.src };
                }
            } else {
                txtBtn.className = 'toggle-btn w-full py-1 text-[10px] rounded bg-white text-black font-bold';
                imgBtn.className = 'toggle-btn w-full py-1 text-[10px] rounded text-gray-400 hover:text-white';
                txtContainer.classList.remove('hidden');
                imgContainer.classList.add('hidden');

                if (textArea.value.trim()) {
                    secondaryInputs[label] = { type: 'text', data: textArea.value.trim() };
                } else {
                    delete secondaryInputs[label];
                }
            }
            updateRegenBtn();
        };

        imgBtn.onclick = () => setType('image');
        txtBtn.onclick = () => setType('text');

        // Drag and Drop for secondary slots
        imgContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            imgContainer.classList.add('border-white', 'bg-white/10');
        });
        imgContainer.addEventListener('dragleave', () => {
            imgContainer.classList.remove('border-white', 'bg-white/10');
        });
        imgContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            imgContainer.classList.remove('border-white', 'bg-white/10');
            const file = e.dataTransfer.files[0];
            if (!file || !file.type.startsWith('image/')) return;

            const r = new FileReader();
            r.onload = (evt) => {
                imgEl.src = evt.target.result;
                imgEl.classList.remove('hidden');
                secondaryInputs[label] = { type: 'image', data: evt.target.result };
                updateRegenBtn();
            };
            r.readAsDataURL(file);
        });

        // Image Upload
        imgContainer.onclick = () => fileInput.click();
        fileInput.onchange = (e) => {
            const f = e.target.files[0];
            if (!f) return;
            const r = new FileReader();
            r.onload = (evt) => {
                imgEl.src = evt.target.result;
                imgEl.classList.remove('hidden');
                secondaryInputs[label] = { type: 'image', data: evt.target.result };
                updateRegenBtn();
            };
            r.readAsDataURL(f);
        };

        // Text Input
        textArea.oninput = (e) => {
            const v = e.target.value.trim();
            if (v) secondaryInputs[label] = { type: 'text', data: v };
            else delete secondaryInputs[label];
            updateRegenBtn();
        }
    });
}

function updateRegenBtn() {
    if (Object.keys(secondaryInputs).length > 0) {
        regenerateBtn.disabled = false;
        regenerateBtn.innerText = "Regenerate with Specific Details";
    } else {
        regenerateBtn.disabled = true;
    }
}

// Regenerate Logic
regenerateBtn.addEventListener('click', async () => {
    if (!currentImageBase64) return;
    setLoading(true);
    regenerateBtn.disabled = true;
    regenerateBtn.innerText = "Regenerating...";

    const base64Data = currentImageBase64.split(',')[1];
    const mimeType = currentImageBase64.split(';')[0].split(':')[1];

    // 1. Construct the System/Instruction Prompt
    let promptInstructions = "You are an expert prompt generator. Analyze the provided images and text constraints to generate a single, highly detailed JSON prompt.\n\n";
    promptInstructions += "TASK:\n";
    promptInstructions += "1. Analyze the 'MAIN REFERENCE IMAGE' to establish the core composition, environment, lighting, and style.\n";
    promptInstructions += "2. For each 'REPLACEMENT ELEMENT' provided below, you MUST IGNORE how that element appears in the Main Reference Image and instead describe it EXACTLY as shown in its specific reference input.\n";
    promptInstructions += "   - Example: If the Main Image shows a 'Dog' but the 'REPLACEMENT ELEMENT: Dog' input is an image of a 'Robot', the final prompt must describe a Robot in the Main Image's environment.\n";
    promptInstructions += "3. Merge these into a seamless, cohesive scene description.\n\n";

    promptInstructions += "OUTPUT FORMAT:\n";
    promptInstructions += "Return a valid JSON object with ONE key: 'prompt'. The value should be a detailed paragraph describing the final scene.\n";

    promptInstructions += `REQUIRED ASPECT RATIO: ${selectedRatio}\n`;
    if (styleSelect.value) promptInstructions += `REQUIRED STYLE: ${styleSelect.value}\n`;
    if (filterSelect.value) promptInstructions += `REQUIRED FILTER: ${filterSelect.value}\n`;

    const contentArray = [
        { type: "text", text: promptInstructions }
    ];

    // 2. Add Main Image
    contentArray.push({ type: "text", text: "--- MAIN REFERENCE IMAGE ---" });
    contentArray.push({ type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Data}` } });

    // 3. Add Secondary Inputs
    for (const [label, info] of Object.entries(secondaryInputs)) {
        contentArray.push({ type: "text", text: `--- REPLACEMENT ELEMENT: ${label} --- (This input REPLACES the appearance of '${label}' from the main image)` });

        if (info.type === 'image') {
            const d = info.data.split(',')[1];
            const m = info.data.split(';')[0].split(':')[1];
            contentArray.push({ type: "image_url", image_url: { url: `data:${m};base64,${d}` } });
        } else {
            contentArray.push({ type: "text", text: `DESCRIPTION TO USE: ${info.data}` });
        }
    }

    // Fetch...
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json', 'HTTP-Referer': window.location.href },
            body: JSON.stringify({
                model: MODEL,
                messages: [{ role: "user", content: contentArray }],
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();
        let contentStr = data.choices[0].message.content;
        let result = {};
        try {
            // Try parsing JSON
            contentStr = contentStr.replace(/```json/g, '').replace(/```/g, '').trim();
            result = JSON.parse(contentStr);
        } catch (e) {
            result = { prompt: contentStr };
        }

        // Display
        if (typeof result.prompt === 'object') {
            outputArea.innerText = JSON.stringify(result.prompt, null, 2);
        } else {
            outputArea.innerText = result.prompt;
        }

        statusTag.innerText = "Regenerated";
        statusTag.className = 'text-xs font-mono px-2 py-1 rounded bg-green-500/20 text-green-400';

    } catch (e) {
        console.error(e);
        outputArea.innerText = "Error: " + e.message;
        statusTag.innerText = "Error";
        statusTag.className = 'text-xs font-mono px-2 py-1 rounded bg-red-500/20 text-red-400';
    } finally {
        setLoading(false);
        regenerateBtn.disabled = false;
        regenerateBtn.innerText = "Regenerate with Details";
    }
});

function setLoading(isLoading) {
    generateBtn.disabled = isLoading;
    if (isLoading) {
        generateBtn.innerHTML = '<div class="loader mr-2"></div> Processing...';
        statusTag.innerText = "Generating...";
        statusTag.className = 'text-xs font-mono px-2 py-1 rounded bg-yellow-500/20 text-yellow-400';
    } else {
        generateBtn.innerHTML = '<span class="relative z-10 flex items-center justify-center gap-2">Generate Prompt <i data-lucide="sparkles" class="w-4 h-4"></i></span><div class="absolute inset-0 bg-gray-200 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out group-disabled:hidden"></div>';
        statusTag.className = 'text-xs font-mono px-2 py-1 rounded bg-white/10 text-gray-400';
    }
    // Re-init inner icons
    lucide.createIcons();
}

// Copy
copyBtn.addEventListener('click', () => {
    const text = outputArea.innerText;
    if (!text || text.includes('Select an image')) return;
    navigator.clipboard.writeText(text);
    const icon = copyBtn.querySelector('i');
    icon.setAttribute('data-lucide', 'check');
    lucide.createIcons();
    setTimeout(() => {
        icon.setAttribute('data-lucide', 'copy');
        lucide.createIcons();
    }, 2000);
});
