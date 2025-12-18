
// State
let currentTemplateId = 'futuristic';

// --- API Key Management ---
function getApiKey() {
    return localStorage.getItem('openrouter_api_key');
}

function saveApiKey() {
    const key = document.getElementById('api-key-input').value.trim();
    if (key) {
        localStorage.setItem('openrouter_api_key', key);
        toggleSettingsModal();
        alert('API Key Saved!');
    }
}

function toggleSettingsModal() {
    const modal = document.getElementById('settings-modal');
    if (modal.classList.contains('hidden')) {
        modal.classList.remove('hidden');
        document.getElementById('api-key-input').value = getApiKey() || '';
    } else {
        modal.classList.add('hidden');
    }
}

// --- Template Management ---

function loadTemplateSelector() {
    const selectorContainer = document.getElementById('template-selector');
    if (!selectorContainer) return;

    selectorContainer.innerHTML = resumeTemplates.map(t => `
        <button 
            onclick="switchTemplate('${t.id}')"
            class="template-btn w-full text-left p-3 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-between group ${t.id === currentTemplateId ? 'active ring-1 ring-blue-500 bg-blue-500/10' : ''}"
        >
            <div>
                <span class="block text-sm font-bold text-gray-200">${t.name}</span>
                <span class="block text-[10px] text-gray-500 group-hover:text-gray-400">${t.description}</span>
            </div>
            ${t.id === currentTemplateId ? '<i data-lucide="check" class="w-4 h-4 text-blue-400"></i>' : ''}
        </button>
    `).join('');

    // Refresh icons
    if (window.lucide) lucide.createIcons();
}

function switchTemplate(id) {
    currentTemplateId = id;
    loadTemplateSelector(); // Re-render to update active state
    updatePreview();
}

function changeFont() {
    const font = document.getElementById('font-selector').value;
    const preview = document.getElementById('resume-preview');
    if (preview) {
        // Use !important to override Tailwind utility classes if necessary
        preview.style.setProperty('font-family', font, 'important');
    }
}


// --- Real-time Preview Updates ---

function getFormData() {
    // Helper to get array of experience items
    const expItems = [];
    document.querySelectorAll('#experience-section .glass-panel').forEach(panel => {
        expItems.push({
            role: panel.querySelector('.exp-role').value || 'Role Title',
            company: panel.querySelector('.exp-company').value || 'Company Name',
            date: panel.querySelector('.exp-date').value || '2020 - Present',
            desc: panel.querySelector('.exp-desc').value || 'Description of achievements...'
        });
    });

    return {
        name: document.getElementById('input-name').value,
        role: document.getElementById('input-role').value,
        email: document.getElementById('input-email').value,
        phone: document.getElementById('input-phone').value,
        location: document.getElementById('input-location').value,
        summary: document.getElementById('input-summary').value,
        skills: document.getElementById('input-skills').value,
        experience: expItems.length > 0 ? expItems : [{ role: 'Senior VA', company: 'Tech Corp', date: '2020-Present', desc: 'Managed calendar and events.' }],
        education: {
            school: document.getElementById('input-school').value,
            degree: document.getElementById('input-degree').value,
            year: document.getElementById('input-grad-year').value
        }
    };
}

function updatePreview() {
    const data = getFormData();
    const template = resumeTemplates.find(t => t.id === currentTemplateId) || resumeTemplates[0];

    // Render the HTML string from the template function
    const previewContainer = document.getElementById('resume-preview');

    // We update innerHTML of the wrapper. 
    const scaler = document.getElementById('preview-container');
    if (scaler) {
        // Render format: <div id="resume-preview" class="a4-preview ..."> ...content... </div>
        scaler.innerHTML = template.render(data);

        // Ensure the new element has the ID needed for PDF/Print logic if template didn't provide it
        if (scaler.firstElementChild && scaler.firstElementChild.id !== 'resume-preview') {
            scaler.firstElementChild.id = 'resume-preview';
        }

        // Re-apply selected font
        changeFont();

        // Render visual page breaks
        renderPageBreaks();
    }
}

function renderPageBreaks() {
    const preview = document.getElementById('resume-preview');
    if (!preview) return;

    // Remove existing markers
    const existingMarkers = preview.querySelectorAll('.page-break-marker');
    existingMarkers.forEach(el => el.remove());

    const totalHeight = preview.scrollHeight;
    // A4 height in pixels at 96 DPI is approx 1123px (297mm)
    const pageHeightPx = 1122.5;

    // Render markers every pageHeightPx
    let y = pageHeightPx;
    let pageNum = 1;

    while (y < totalHeight) {
        const marker = document.createElement('div');
        marker.className = 'page-break-marker';
        // Center the 20px gap on the break line
        marker.style.top = `${y - 10}px`;
        marker.innerHTML = `<span class="page-break-label">Page Break</span>`;
        preview.appendChild(marker);

        y += pageHeightPx;
        pageNum++;
    }
}


// --- AI Generation (Client-Side) ---

async function generateAI(type, element = null) {
    const apiKey = "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";

    const btn = element ? element : event.target.closest('button');
    const originalIcon = btn.innerHTML;
    const loadingHtml = `<div class="loader"></div>`;

    // Prevent double clicking
    if (btn.innerHTML === loadingHtml) return;

    btn.innerHTML = loadingHtml;
    btn.disabled = true;

    let context = {};
    const jobTitle = document.getElementById('input-role').value;
    const jobDescription = document.getElementById('input-job-desc').value;

    // Construct prompts locally (Moved from Python)
    let systemPrompt = "You are a professional resume writer for a high-end Virtual Assistant (VA). Write concise, impactful, and professional content.";
    let userPrompt = "";
    let jdContext = "";

    if (jobDescription) {
        jdContext = `\n\nIMPORTANT REFERENCE - Target Job Description:\n${jobDescription}\n\nTailor the content to align with this job description.`;
    }

    if (type === 'summary') {
        userPrompt = `Write a professional summary for a ${jobTitle || 'Virtual Assistant'}. Keep it under 50 words.${jdContext}`;
    } else if (type === 'skills') {
        userPrompt = `Generate a list of 5 key hard and soft skills for a ${jobTitle || 'Virtual Assistant'}. Return as a comma-separated list.${jdContext}`;
    } else if (type === 'experience') {
        const container = element.closest('.glass-panel');
        const role = container.querySelector('.exp-role').value;
        const company = container.querySelector('.exp-company').value;
        const achievements = "General duties"; // could allow user input for this too
        userPrompt = `Write a bullet point description for a job role: ${role} at ${company}. Key achievements: ${achievements}. Format as HTML <li> tags.${jdContext}`;
    }

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://blockscom.xyz", // Site URL (Spoofed for local testing)
                "X-Title": "Blockscom Resume Generator"
            },
            body: JSON.stringify({
                "model": "google/gemini-2.0-flash-exp:free",
                "messages": [
                    { "role": "system", "content": systemPrompt },
                    { "role": "user", "content": userPrompt }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        const data = await response.json();
        let generatedText = data.choices[0].message.content.trim();

        // Cleanup markdown
        if (generatedText.startsWith("```html")) generatedText = generatedText.substring(7);
        if (generatedText.startsWith("```")) generatedText = generatedText.substring(3);
        if (generatedText.endsWith("```")) generatedText = generatedText.substring(0, generatedText.length - 3);

        generatedText = generatedText.trim();

        if (type === 'summary') {
            document.getElementById('input-summary').value = generatedText;
        } else if (type === 'skills') {
            // Basic formatting cleanup for skills if they come as a list
            generatedText = generatedText.replace(/\n/g, ', ').replace(/^- /gm, '');
            document.getElementById('input-skills').value = generatedText;
        } else if (type === 'experience') {
            const container = element.closest('.glass-panel');
            container.querySelector('.exp-desc').value = generatedText;
        }
        updatePreview();

    } catch (error) {
        console.error('Error:', error);
        alert('AI Error: ' + error.message);
    } finally {
        btn.innerHTML = originalIcon;
        btn.disabled = false;
    }
}

function downloadPDF() {
    window.print();
}

// Initial update
document.addEventListener('DOMContentLoaded', () => {
    loadTemplateSelector();
    updatePreview();
});

// Add Experience Button Logic
function addExperience() {
    const section = document.getElementById('experience-section');
    const template = section.querySelector('.glass-panel').cloneNode(true);
    // Clear values
    template.querySelectorAll('input').forEach(i => i.value = '');
    template.querySelector('textarea').value = '';

    // Ensure button has event listener if needed (onclick in HTML handles it)
    section.appendChild(template);
    updatePreview();
}
