// Initialize Lucide Icons
lucide.createIcons();

// Custom Cursor Logic
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');
const hoverTriggers = document.querySelectorAll('.hover-trigger');

window.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;

    if (cursorDot && cursorOutline) {
        cursorDot.style.left = `${posX}px`;
        cursorDot.style.top = `${posY}px`;

        gsap.to(cursorOutline, {
            x: posX,
            y: posY,
            duration: 0.15,
            ease: "power2.out"
        });
    }
});

// Hover effects
hoverTriggers.forEach(trigger => {
    trigger.addEventListener('mouseenter', () => {
        document.body.classList.add('hovering');
        if (trigger.getAttribute('data-cursor') === 'link') {
            cursorOutline.style.borderColor = 'transparent';
            cursorOutline.style.backgroundColor = 'rgba(255,255,255,0.2)';
        }
    });
    trigger.addEventListener('mouseleave', () => {
        document.body.classList.remove('hovering');
        cursorOutline.style.borderColor = 'rgba(255, 255, 255, 0.5)';
        cursorOutline.style.backgroundColor = 'transparent';
    });
});

// --- Script Generator Logic ---

// Configuration
// Configuration
const API_KEY = "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";
const MODELS = [
    "google/gemini-3-flash-preview"
];

// Elements
// Elements
const generateBtn = document.getElementById('generate-btn');
const inputUrl = document.getElementById('target-url');
const inputDesc = document.getElementById('target-desc');
const selectService = document.getElementById('service-category');
const selectLanguage = document.getElementById('script-language');
const selectLength = document.getElementById('script-length');
const selectType = document.getElementById('script-type');
const loadingState = document.getElementById('loading-state');
const emptyState = document.getElementById('empty-state');
const resultContainer = document.getElementById('result-container');
const scriptOutput = document.getElementById('script-output');
const aiInsightText = document.getElementById('ai-insight-text');
const copyBtn = document.getElementById('copy-btn');

async function callOpenRouter(prompt) {
    let lastError;

    for (const model of MODELS) {
        try {
            console.log(`Trying model: ${model}`);
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${API_KEY}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://blockscom.xyz",
                    "X-Title": "Blockscom ScriptGen"
                },
                body: JSON.stringify({
                    "model": model,
                    "messages": [
                        {
                            "role": "system",
                            "content": `You are a world-class copywriter for Blockscom Media.
                            Your tone is professional, futuristic, concise, and high-converting.

                            SERVICE KNOWLEDGE BASE:
                            - Facebook AI Automation: Sell "AUTOMATION" on Messenger/posts. Key Benefit: Saves time (50% of time goes to messaging), allowing them to focus on product/marketing.
                            - Professional Product Photo: High-quality AI generation that retains the "soul" of the product. Key Benefit: High-quality marketing images without traditional costs.

                            You will be given a CLIENT info and a SERVICE they need.
                            If the input is a URL, use it to analyze or infer the brand.
                            Use the provided Description/Context if available to make it highly relevant.
                            
                            Instructions:
                            - LANGUAGE, LENGTH, and TONE must be valid.
                            - Return ONLY valid JSON.
                            
                            Return the response in strictly valid JSON format:
                            {
                                "script": "The cold outreach email/DM content here...",
                                "insight": "The brief 1-sentence insight here..."
                            }`
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ]
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                // If 429, throw special error to continue loop
                if (response.status === 429) {
                    throw new Error(`Rate Limit (429) on ${model}`);
                }
                throw new Error(`API Error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();

            // Safety check for content
            if (!data.choices || !data.choices.length || !data.choices[0].message) {
                throw new Error("Invalid API Response format");
            }

            let content = data.choices[0].message.content;
            // Parse JSON from content (handle potential markdown ticks)
            let cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanContent);

        } catch (error) {
            console.warn(`Model ${model} failed:`, error);
            lastError = error;
            // If it's a rate limit, continue to next model. 
            // If it's another error (like auth), we might want to stop, but for now we try all.
            if (!error.message.includes("Rate Limit")) {
                // Optional: break here if we don't want to fallback on non-429 errors
            }
        }
    }

    // If we get here, all models failed
    console.error("All models failed:", lastError);
    return {
        script: "Error generating script. System is currently at capacity. Please try again in 1 minute.\n\n" + (lastError ? lastError.message : "Unknown Error"),
        insight: "System Overload"
    };
}

// Generate Function
generateBtn.addEventListener('click', async () => {
    // Gather Inputs
    const urlOrBrand = inputUrl.value.trim();
    const service = selectService.options[selectService.selectedIndex].text;
    const desc = inputDesc.value.trim();
    const language = selectLanguage.value;
    const length = selectLength.value;
    const type = selectType.value;

    if (!urlOrBrand) {
        inputUrl.style.borderColor = 'red';
        setTimeout(() => inputUrl.style.borderColor = 'rgba(255,255,255,0.1)', 1000);
        return;
    }

    // UI Loading
    emptyState.classList.add('hidden');
    resultContainer.classList.add('hidden');
    copyBtn.classList.add('hidden', 'opacity-0');
    loadingState.classList.remove('hidden');

    // Construct Detailed Prompt
    let prompt = `Write a personalized cold outreach script.
    
    TARGET CLIENT: "${urlOrBrand}"
    SELLING SERVICE: "${service}"
    CONTEXT/DESC: "${desc || "N/A"}"
    
    INSTRUCTIONS:
    - LANGUAGE: ${language} ${language === 'Taglish' ? '(Mix of English and Tagalog)' : ''}
    - LENGTH: ${length}
    - TONE/TYPE: ${type}
    
    Make it sound like we analyzed their brand.`;

    // Call AI
    const result = await callOpenRouter(prompt);

    // Update UI
    loadingState.classList.add('hidden');
    resultContainer.classList.remove('hidden');
    copyBtn.classList.remove('hidden');

    // Animate copy button in
    setTimeout(() => copyBtn.classList.remove('opacity-0'), 100);

    scriptOutput.value = result.script;
    aiInsightText.textContent = `"${result.insight}"`;

    // Resize textarea
    scriptOutput.style.height = 'auto';
    scriptOutput.style.height = scriptOutput.scrollHeight + 'px';
});

// Copy Function
copyBtn.addEventListener('click', () => {
    scriptOutput.select();
    document.execCommand('copy');

    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = `<i data-lucide="check" class="w-3 h-3"></i> Copied!`;
    copyBtn.classList.add('text-green-400');

    setTimeout(() => {
        copyBtn.innerHTML = originalText;
        copyBtn.classList.remove('text-green-400');
        lucide.createIcons();
    }, 2000);
});

// Magnetic Button Effect
const magnets = document.querySelectorAll('.magnetic-btn');
magnets.forEach((magnet) => {
    magnet.addEventListener('mousemove', (e) => {
        const rect = magnet.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(magnet, {
            x: x * 0.2,
            y: y * 0.2,
            duration: 0.3,
            ease: "power2.out"
        });
    });

    magnet.addEventListener('mouseleave', () => {
        gsap.to(magnet, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: "elastic.out(1, 0.3)"
        });
    });
});
