
// State
let currentTemplateId = 'futuristic';

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

    // We need to preserve the "a4-preview" wrapper mostly for the PDF size, 
    // but the template itself renders the inner content.
    // Actually the template renders the WHOLE .a4-preview div to allow full customizability of padding/bg.
    // So we replace the content of the PARENT wrapper.

    // However, for the transform/scale logic in CSS to work, we need a stable container.
    // Let's assume the template function returns the `.a4-preview` div itself.

    // We replace the InnerHTML of the scaler
    const outputHtml = template.render(data);
    previewContainer.outerHTML = `<div id="resume-preview" class="shadow-2xl">${outputHtml}</div>`;

    // Re-bind the reference because outerHTML destroyed the old one
    // Actually replacing outerHTML of 'resume-preview' means we need to target the parent to replace child, or just updating innerHTML of the parent if it was just a wrapper.
    // Let's look at index.html: <div id="resume-preview" class="a4-preview ...">
    // So we should replace the element with id "resume-preview" entirely.

    // NOTE: The template.render() returns a string starting with <div ...>.
    // It's cleaner to just update the innerHTML of a wrapper.
    const container = document.getElementById('preview-container'); // Need to add this ID in index.html
    if (container) {
        container.innerHTML = template.render(data);
        // The rendered template MUST have id="resume-preview" for PDF generation to target it? 
        // Or we just pass the child of container to html2pdf.
        // Let's make sure template.render returns a root element.
        // And we can attach id='resume-preview' to it dynamically or ensure templates have it.
        // Better: let the template just be inner content, but that restricts layout (e.g. sidebar colors).
        // Let's let template handle the root div, but we inject the ID for convenience.
        container.firstElementChild.id = 'resume-preview';

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
    // However, since we might have scale transforms or different DPI, using 'mm' is safer if possible, 
    // but offsetHeight returns pixels. 
    // 1mm = 3.7795px approx. 297mm = 1122.5px.
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


// --- AI Generation & PDF (Unchanged logic, just ensure selectors work) ---

async function generateAI(type, element = null) {
    const btn = element ? element : event.target.closest('button');
    const originalIcon = btn.innerHTML;
    btn.innerHTML = `<div class="loader"></div>`;
    btn.disabled = true;

    let context = {};
    const jobTitle = document.getElementById('input-role').value;
    const jobDescription = document.getElementById('input-job-desc').value;

    if (type === 'summary') {
        context = {
            jobTitle: jobTitle,
            jobDescription: jobDescription
        };
    } else if (type === 'skills') {
        context = {
            jobTitle: jobTitle,
            jobDescription: jobDescription
        };
    } else if (type === 'experience') {
        const container = element.closest('.glass-panel');
        context = {
            role: container.querySelector('.exp-role').value,
            company: container.querySelector('.exp-company').value,
            achievements: "General duties",
            jobDescription: jobDescription
        };
    }

    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, context })
        });

        const data = await response.json();

        if (data.result) {
            if (type === 'summary') {
                document.getElementById('input-summary').value = data.result;
            } else if (type === 'skills') {
                document.getElementById('input-skills').value = data.result;
            } else if (type === 'experience') {
                const container = element.closest('.glass-panel');
                container.querySelector('.exp-desc').value = data.result;
            }
            updatePreview();
        }

    } catch (error) {
        console.error('Error:', error);
        alert('AI Error');
    } finally {
        btn.innerHTML = originalIcon;
        btn.disabled = false;
    }
}

function downloadPDF() {
    // Determine if we should show a specific area or just print the page
    // The CSS @media print handles the visibility of the "resume-preview" 
    // and hides everything else.

    // We just need to trigger the browser print dialog.
    window.print();
}

// Initial update
document.addEventListener('DOMContentLoaded', () => {
    loadTemplateSelector();
    updatePreview();
});

// Add Experience Button Logic (Optional but good)
function addExperience() {
    const section = document.getElementById('experience-section');
    const template = section.querySelector('.glass-panel').cloneNode(true);
    // Clear values
    template.querySelectorAll('input').forEach(i => i.value = '');
    template.querySelector('textarea').value = '';
    section.appendChild(template);
    updatePreview();
}
