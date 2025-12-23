const API_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
const STORAGE_KEY = 'nanoBananaStaticKey';
const STORAGE_REMEMBER = 'nanoBananaStaticRemember';
const ANALYSIS_MODEL = 'openai/gpt-5.2';
const DEFAULT_API_KEY = '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';

const form = document.getElementById('generator-form');
const apiKeyInput = document.getElementById('api-key');
const rememberCheckbox = document.getElementById('remember-key');
const toggleKeyButton = document.getElementById('toggle-key');
const promptInput = document.getElementById('prompt');
const aspectSelect = document.getElementById('aspect');
const countRange = document.getElementById('count');
const countValue = document.getElementById('count-value');
const seedInput = document.getElementById('seed');
const paletteSelect = document.getElementById('palette');
const moodSelect = document.getElementById('mood');
const styleTags = document.getElementById('style-tags');
const modelSelect = document.getElementById('model-select');
const featureTabs = document.querySelectorAll('[data-feature-tab]');
const featurePanels = document.querySelectorAll('[data-feature-panel]');
const generateBar = document.getElementById('generate-bar');
const recreateEditor = document.getElementById('recreate-editor');
const galleryTitle = document.getElementById('gallery-title');
const galleryEmptyText = document.getElementById('gallery-empty-text');

// Drop Zones & Inputs
const dropReference = document.getElementById('drop-reference');
const referenceInput = document.getElementById('reference-images');
const referencePreview = document.getElementById('reference-preview');

const dropCharacter = document.getElementById('drop-character');
const characterInput = document.getElementById('character-images');
const characterPreview = document.getElementById('character-preview');

const dropScene = document.getElementById('drop-scene');
const sceneInput = document.getElementById('scene-image');
const scenePreview = document.getElementById('scene-preview');

const dropStyle = document.getElementById('drop-style');
const styleInput = document.getElementById('style-image');
const stylePreview = document.getElementById('style-preview');

const dropRecreateReference = document.getElementById('drop-recreate-reference');
const recreateReferenceInput = document.getElementById('recreate-reference');
const recreateReferencePreview = document.getElementById('recreate-reference-preview');
const recreateAnalyzeBtn = document.getElementById('recreate-analyze');
const recreateStatus = document.getElementById('recreate-status');
const recreateModelSelect = document.getElementById('recreate-model-select');
const recreateNotes = document.getElementById('recreate-notes');
const recreateSummary = document.getElementById('recreate-summary');
const recreateElements = document.getElementById('recreate-elements');
const recreateElementsCount = document.getElementById('recreate-elements-count');
const recreateRunBtn = document.getElementById('recreate-run');

// Image Editor Elements
const editorModal = document.getElementById('editor-modal');
const editorCanvas = document.getElementById('editor-canvas');
const editorLoading = document.getElementById('editor-loading');
const editorTextInput = document.getElementById('editor-text-input');
const editorSave = document.getElementById('editor-save');
const editorCancel = document.getElementById('editor-cancel');
const editorReset = document.getElementById('editor-reset');
const editorColorButtons = document.querySelectorAll('.editor-color-btn');
const toolDraw = document.getElementById('tool-draw');
const toolText = document.getElementById('tool-text');
const editorBrushSize = document.getElementById('editor-brush-size');
const editorBrushLabel = document.getElementById('editor-brush-label');


const galleryGrid = document.getElementById('gallery-grid');
const galleryEmpty = document.getElementById('gallery-empty');
// const loadingOverlay = document.getElementById('loading-overlay'); // Removed global loader
const imageCount = document.getElementById('image-count');
const statusEl = document.getElementById('status');
const errorEl = document.getElementById('error');
const surpriseBtn = document.getElementById('surprise-btn');
const clearBtn = document.getElementById('clear');
const generateBtn = document.getElementById('generate');

const aspectHints = {
  '1:1': 'Aspect ratio 1:1 (square).',
  '16:9': 'Aspect ratio 16:9 (landscape).',
  '9:16': 'Aspect ratio 9:16 (portrait).'
};

const surprisePrompts = [
  'A candlelit watchmaker studio, warm glow, macro lens, ultra detailed',
  'A futuristic botanical lab, teal and ember palette, cinematic lighting',
  'A misty cliffside cafe, soft grain, moody and atmospheric',
  'A vintage bicycle shop in golden hour, high contrast, close up',
  'Cyberpunk street food stall, neon rain, isometric view'
];

const state = {
  referenceImages: [],
  characterImages: [],
  sceneImage: null,
  styleImage: null,
  activeRequests: 0,
  queueLimit: 3
};

let activeFeature = 'generate';

const recreateState = {
  referenceImage: null,
  analysis: null,
  elements: [],
  overrides: {},
  isAnalyzing: false,
  isRecreating: false
};

const editorCtx = editorCanvas ? editorCanvas.getContext('2d') : null;

const editorState = {
  isOpen: false,
  tool: 'draw',
  color: '#ff4d4d',
  brushSize: 6,
  isDrawing: false,
  baseDataUrl: null,
  onSave: null
};

let lastPrompt = '';

const setStatus = (text) => {
  if (statusEl) statusEl.textContent = text;
};

const setError = (text) => {
  if (errorEl) errorEl.textContent = text || '';
};

const setLoading = (isLoading) => {
  if (!generateBtn) return;
  generateBtn.setAttribute('aria-busy', isLoading ? 'true' : 'false');
  generateBtn.classList.toggle('opacity-70', isLoading);
};

const setActiveFeature = (feature) => {
  activeFeature = feature;
  featureTabs.forEach((tab) => {
    const isActive = tab.dataset.featureTab === feature;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
  featurePanels.forEach((panel) => {
    const isActive = panel.dataset.featurePanel === feature;
    panel.classList.toggle('hidden', !isActive);
  });
  if (generateBar) generateBar.classList.toggle('hidden', feature !== 'generate');
  if (recreateEditor) recreateEditor.classList.toggle('hidden', feature !== 'recreate');
  if (galleryTitle) {
    galleryTitle.textContent = feature === 'recreate' ? 'Recreate Results' : 'Gallery';
  }
  if (galleryEmptyText) {
    galleryEmptyText.textContent = feature === 'recreate'
      ? 'Recreated images will appear here. Analyze a reference image to begin.'
      : 'Results will appear here. Try a sample prompt to get started.';
  }
};

const setRecreateStatus = (text) => {
  if (recreateStatus) recreateStatus.textContent = text || '';
};

const setRecreateAnalyzing = (isLoading) => {
  recreateState.isAnalyzing = isLoading;
  if (!recreateAnalyzeBtn) return;
  recreateAnalyzeBtn.disabled = isLoading;
  recreateAnalyzeBtn.classList.toggle('opacity-60', isLoading);
  recreateAnalyzeBtn.textContent = isLoading ? 'Analyzing...' : 'Analyze Image';
};

const setRecreateRunning = (isLoading) => {
  recreateState.isRecreating = isLoading;
  if (!recreateRunBtn) return;
  recreateRunBtn.disabled = isLoading;
  recreateRunBtn.classList.toggle('opacity-60', isLoading);
  recreateRunBtn.textContent = isLoading ? 'Recreating...' : 'Recreate Image';
};

const getElementOverride = (elementId) => {
  if (!recreateState.overrides[elementId]) {
    recreateState.overrides[elementId] = { text: '', image: null };
  }
  return recreateState.overrides[elementId];
};

// --- Image Editor Logic ---
const setEditorLoading = (isLoading) => {
  if (!editorLoading) return;
  editorLoading.classList.toggle('hidden', !isLoading);
};

const setEditorTool = (tool) => {
  editorState.tool = tool;
  if (toolDraw) toolDraw.classList.toggle('active', tool === 'draw');
  if (toolText) toolText.classList.toggle('active', tool === 'text');
  if (editorCanvas) {
    editorCanvas.style.cursor = tool === 'text' ? 'text' : 'crosshair';
  }
  if (editorTextInput && !editorTextInput.classList.contains('hidden')) {
    commitTextInput();
  }
};

const setEditorColor = (color) => {
  editorState.color = color;
  editorColorButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.color === color);
  });
};

const setBrushSize = (value) => {
  const size = Number(value) || editorState.brushSize;
  editorState.brushSize = size;
  if (editorBrushSize) editorBrushSize.value = size;
  if (editorBrushLabel) editorBrushLabel.textContent = `${size}`;
};

const closeEditor = () => {
  if (!editorModal) return;
  editorState.isOpen = false;
  editorState.isDrawing = false;
  editorState.baseDataUrl = null;
  editorState.onSave = null;
  if (editorTextInput) {
    editorTextInput.classList.add('hidden');
    editorTextInput.value = '';
  }
  editorModal.classList.add('hidden');
  editorModal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('editor-open');
};

const loadImageForEditor = async (source) => {
  if (!source) throw new Error('Missing image source.');
  if (source.startsWith('data:') || source.startsWith('blob:')) return source;

  const response = await fetch(source, { mode: 'cors' });
  if (!response.ok) throw new Error('Image fetch failed.');
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Image read failed.'));
    reader.readAsDataURL(blob);
  });
};

const drawImageToCanvas = (dataUrl) => {
  if (!editorCanvas || !editorCtx) return Promise.reject(new Error('Canvas not ready.'));

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      editorCanvas.width = img.naturalWidth || img.width;
      editorCanvas.height = img.naturalHeight || img.height;
      editorCtx.clearRect(0, 0, editorCanvas.width, editorCanvas.height);
      editorCtx.drawImage(img, 0, 0, editorCanvas.width, editorCanvas.height);
      resolve();
    };
    img.onerror = () => reject(new Error('Image load failed.'));
    img.src = dataUrl;
  });
};

const openEditor = async (sourceUrl, onSave) => {
  if (!editorModal || !editorCanvas || !editorCtx) return;
  editorState.isOpen = true;
  editorState.onSave = onSave;
  setError('');
  editorModal.classList.remove('hidden');
  editorModal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('editor-open');
  if (editorTextInput) editorTextInput.classList.add('hidden');

  setEditorTool('draw');
  setEditorColor(editorState.color);
  setBrushSize(editorState.brushSize);
  setEditorLoading(true);

  try {
    const dataUrl = await loadImageForEditor(sourceUrl);
    editorState.baseDataUrl = dataUrl;
    await drawImageToCanvas(dataUrl);
  } catch (error) {
    console.error(error);
    setError('Unable to load image for editing.');
    closeEditor();
  } finally {
    setEditorLoading(false);
  }
};

const getCanvasPoint = (event) => {
  const rect = editorCanvas.getBoundingClientRect();
  const wrapRect = editorCanvas.parentElement
    ? editorCanvas.parentElement.getBoundingClientRect()
    : rect;
  const scaleX = editorCanvas.width / rect.width;
  const scaleY = editorCanvas.height / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
    offsetX: event.clientX - rect.left,
    offsetY: event.clientY - rect.top,
    wrapOffsetX: event.clientX - wrapRect.left,
    wrapOffsetY: event.clientY - wrapRect.top,
    canvasOffsetX: rect.left - wrapRect.left,
    canvasOffsetY: rect.top - wrapRect.top,
    rect,
    wrapRect
  };
};

const beginDrawing = (event) => {
  if (!editorCtx || editorState.tool !== 'draw') return;
  const { x, y } = getCanvasPoint(event);
  editorState.isDrawing = true;
  editorCtx.strokeStyle = editorState.color;
  editorCtx.lineWidth = editorState.brushSize;
  editorCtx.lineJoin = 'round';
  editorCtx.lineCap = 'round';
  editorCtx.beginPath();
  editorCtx.moveTo(x, y);
};

const continueDrawing = (event) => {
  if (!editorCtx || !editorState.isDrawing) return;
  const { x, y } = getCanvasPoint(event);
  editorCtx.lineTo(x, y);
  editorCtx.stroke();
};

const stopDrawing = () => {
  if (!editorCtx) return;
  if (editorState.isDrawing) {
    editorState.isDrawing = false;
    editorCtx.closePath();
  }
};

const showTextInput = (event) => {
  if (!editorTextInput || editorState.tool !== 'text') return;
  if (!editorTextInput.classList.contains('hidden')) {
    commitTextInput();
  }
  const { x, y, wrapOffsetX, wrapOffsetY, rect, canvasOffsetX, canvasOffsetY } = getCanvasPoint(event);
  const minLeft = canvasOffsetX + 10;
  const minTop = canvasOffsetY + 10;
  const maxLeft = canvasOffsetX + rect.width - 180;
  const maxTop = canvasOffsetY + rect.height - 40;
  editorTextInput.style.left = `${Math.min(Math.max(wrapOffsetX, minLeft), Math.max(minLeft, maxLeft))}px`;
  editorTextInput.style.top = `${Math.min(Math.max(wrapOffsetY, minTop), Math.max(minTop, maxTop))}px`;
  editorTextInput.dataset.canvasX = x.toString();
  editorTextInput.dataset.canvasY = y.toString();
  editorTextInput.value = '';
  editorTextInput.classList.remove('hidden');
  requestAnimationFrame(() => editorTextInput.focus());
};

const commitTextInput = () => {
  if (!editorTextInput || editorTextInput.classList.contains('hidden')) return;
  const value = editorTextInput.value.trim();
  const x = Number(editorTextInput.dataset.canvasX || 0);
  const y = Number(editorTextInput.dataset.canvasY || 0);
  editorTextInput.classList.add('hidden');
  if (!value || !editorCtx) return;
  editorCtx.fillStyle = editorState.color;
  editorCtx.font = "600 28px 'Space Grotesk', sans-serif";
  editorCtx.textBaseline = 'top';
  editorCtx.fillText(value, x, y);
};

// Queue Limiter Logic
const updateQueueStatus = () => {
  const remaining = state.queueLimit - state.activeRequests;
  if (remaining <= 0) {
    generateBtn.disabled = true;
    generateBtn.textContent = 'Queue Full (3/3)';
    setStatus('Max 3 concurrent requests');
  } else {
    generateBtn.disabled = false;
    generateBtn.textContent = 'Generate';
    setStatus(state.activeRequests > 0 ? `Generating (${state.activeRequests} active)...` : 'Ready');
  }
};

const updateCount = () => {
  countValue.textContent = countRange.value;
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('File read failed.'));
    reader.readAsDataURL(file);
  });

const getImageSize = (dataUrl) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height
      });
    };
    img.onerror = () => reject(new Error('Image load failed.'));
    img.src = dataUrl;
  });

const readFileWithMeta = async (file) => {
  const dataUrl = await readFileAsDataUrl(file);
  let size = null;
  try {
    size = await getImageSize(dataUrl);
  } catch (error) {
    console.warn('Unable to read image size.', error);
  }

  return {
    dataUrl,
    name: file.name,
    width: size?.width || null,
    height: size?.height || null
  };
};

const updateImageMeta = async (target, dataUrl) => {
  if (!target) return;
  target.dataUrl = dataUrl;
  try {
    const size = await getImageSize(dataUrl);
    target.width = size.width;
    target.height = size.height;
  } catch (error) {
    target.width = null;
    target.height = null;
  }
};

const gcd = (a, b) => (b ? gcd(b, a % b) : a);

const simplifyAspectRatio = (width, height) => {
  const safeWidth = Math.max(1, Math.round(width));
  const safeHeight = Math.max(1, Math.round(height));
  const divisor = gcd(safeWidth, safeHeight) || 1;
  return `${Math.round(safeWidth / divisor)}:${Math.round(safeHeight / divisor)}`;
};

const getReferenceImageForAspect = () => {
  if (activeFeature === 'recreate' && recreateState.referenceImage) {
    return recreateState.referenceImage;
  }
  if (state.referenceImages.length) return state.referenceImages[0];
  if (state.characterImages.length) return state.characterImages[0];
  if (state.sceneImage) return state.sceneImage;
  if (state.styleImage) return state.styleImage;
  return null;
};

const getAspectHint = () => {
  if (aspectSelect.value === 'reference') {
    const ref = getReferenceImageForAspect();
    if (!ref?.width || !ref?.height) return '';
    const ratio = simplifyAspectRatio(ref.width, ref.height);
    return `Use the same size as the reference image (${ref.width}x${ref.height}). Aspect ratio ${ratio}.`;
  }
  return aspectHints[aspectSelect.value];
};

// --- Preview Rendering ---

const renderReferencePreview = () => {
  if (state.referenceImages.length === 0) {
    referencePreview.innerHTML = '';
    referencePreview.classList.add('hidden');
    return;
  }

  referencePreview.classList.remove('hidden');
  referencePreview.innerHTML = '';

  state.referenceImages.forEach((item, index) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'preview-item aspect-square rounded overflow-hidden relative border border-white/20';

    const img = document.createElement('img');
    img.src = item.dataUrl;
    img.className = 'w-full h-full object-cover';
    img.title = 'Click to edit';
    img.addEventListener('click', (e) => {
      e.stopPropagation();
      openEditor(item.dataUrl, (updatedUrl) => {
        updateImageMeta(state.referenceImages[index], updatedUrl).then(renderReferencePreview);
      });
    });

    const removeBtn = document.createElement('button');
    removeBtn.className = 'absolute top-1 right-1 bg-black/50 hover:bg-black/80 text-white rounded-full p-0.5 transition-colors pointer-events-auto';
    removeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    removeBtn.type = 'button';
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      state.referenceImages.splice(index, 1);
      renderReferencePreview();
    });

    const downloadBtn = document.createElement('a');
    downloadBtn.className = 'absolute top-1 left-1 bg-black/50 hover:bg-black/80 text-white rounded-full p-0.5 transition-colors pointer-events-auto';
    downloadBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
    downloadBtn.href = item.dataUrl;
    downloadBtn.download = item.name || `reference-${index + 1}.png`;
    downloadBtn.title = 'Download';
    downloadBtn.setAttribute('aria-label', 'Download');
    downloadBtn.addEventListener('click', (e) => e.stopPropagation());

    wrapper.appendChild(img);
    wrapper.appendChild(downloadBtn);
    wrapper.appendChild(removeBtn);
    referencePreview.appendChild(wrapper);
  });
};

const renderCharacterPreview = () => {
  if (state.characterImages.length === 0) {
    characterPreview.innerHTML = '';
    characterPreview.classList.add('hidden');
    return;
  }

  characterPreview.classList.remove('hidden');
  characterPreview.innerHTML = '';

  state.characterImages.forEach((item, index) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'flex flex-col gap-1';

    const imageWrap = document.createElement('div');
    imageWrap.className = 'preview-item aspect-square rounded overflow-hidden relative border border-white/20';

    const img = document.createElement('img');
    img.src = item.dataUrl;
    img.className = 'w-full h-full object-cover';
    img.title = 'Click to edit';
    img.addEventListener('click', (e) => {
      e.stopPropagation();
      openEditor(item.dataUrl, (updatedUrl) => {
        updateImageMeta(state.characterImages[index], updatedUrl).then(renderCharacterPreview);
      });
    });

    const removeBtn = document.createElement('button');
    removeBtn.className = 'absolute top-1 right-1 bg-black/50 hover:bg-black/80 text-white rounded-full p-0.5 transition-colors pointer-events-auto';
    removeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    removeBtn.type = 'button';
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      state.characterImages.splice(index, 1);
      renderCharacterPreview();
    });

    const downloadBtn = document.createElement('a');
    downloadBtn.className = 'absolute top-1 left-1 bg-black/50 hover:bg-black/80 text-white rounded-full p-0.5 transition-colors pointer-events-auto';
    downloadBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
    downloadBtn.href = item.dataUrl;
    downloadBtn.download = item.name || `character-${index + 1}.png`;
    downloadBtn.title = 'Download';
    downloadBtn.setAttribute('aria-label', 'Download');
    downloadBtn.addEventListener('click', (e) => e.stopPropagation());

    const specInput = document.createElement('textarea');
    specInput.rows = 2;
    specInput.placeholder = 'Character details...';
    specInput.value = item.spec || '';
    specInput.className =
      'w-full bg-black/30 border border-white/10 rounded-md px-2 py-1 text-[10px] focus:outline-none text-gray-300 placeholder-gray-600 resize-none text-left';
    specInput.addEventListener('input', (event) => {
      state.characterImages[index].spec = event.target.value;
    });

    imageWrap.appendChild(img);
    imageWrap.appendChild(downloadBtn);
    imageWrap.appendChild(removeBtn);
    wrapper.appendChild(imageWrap);
    wrapper.appendChild(specInput);
    characterPreview.appendChild(wrapper);
  });
};

const renderSinglePreview = (container, item, onRemove, onEdit) => {
  if (!item) {
    container.innerHTML = '';
    container.classList.add('hidden');
    return;
  }

  container.classList.remove('hidden');
  container.innerHTML = '';

  const img = document.createElement('img');
  img.src = item.dataUrl;
  img.className = 'w-full h-full object-cover';
  img.title = 'Click to edit';
  if (onEdit) {
    img.addEventListener('click', (e) => {
      e.stopPropagation();
      onEdit();
    });
  }

  const removeBtn = document.createElement('button');
  removeBtn.className = 'absolute top-2 right-2 bg-black/50 hover:bg-black/80 text-white rounded-full p-1 transition-colors z-20 pointer-events-auto';
  removeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
  removeBtn.type = 'button';
  removeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    onRemove();
  });

  const downloadBtn = document.createElement('a');
  downloadBtn.className = 'absolute top-2 left-2 bg-black/50 hover:bg-black/80 text-white rounded-full p-1 transition-colors z-20 pointer-events-auto';
  downloadBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
  downloadBtn.href = item.dataUrl;
  downloadBtn.download = item.name || 'input-image.png';
  downloadBtn.title = 'Download';
  downloadBtn.setAttribute('aria-label', 'Download');
  downloadBtn.addEventListener('click', (e) => e.stopPropagation());

  container.appendChild(img);
  container.appendChild(downloadBtn);
  container.appendChild(removeBtn);
};

const refreshScenePreview = () => {
  renderSinglePreview(scenePreview, state.sceneImage, () => {
    state.sceneImage = null;
    refreshScenePreview();
  }, () => {
    if (!state.sceneImage) return;
    openEditor(state.sceneImage.dataUrl, (updatedUrl) => {
      updateImageMeta(state.sceneImage, updatedUrl).then(refreshScenePreview);
    });
  });
};

const refreshStylePreview = () => {
  renderSinglePreview(stylePreview, state.styleImage, () => {
    state.styleImage = null;
    refreshStylePreview();
  }, () => {
    if (!state.styleImage) return;
    openEditor(state.styleImage.dataUrl, (updatedUrl) => {
      updateImageMeta(state.styleImage, updatedUrl).then(refreshStylePreview);
    });
  });
};

const refreshRecreateReferencePreview = () => {
  renderSinglePreview(recreateReferencePreview, recreateState.referenceImage, () => {
    recreateState.referenceImage = null;
    refreshRecreateReferencePreview();
    setRecreateStatus('');
  }, () => {
    if (!recreateState.referenceImage) return;
    openEditor(recreateState.referenceImage.dataUrl, (updatedUrl) => {
      updateImageMeta(recreateState.referenceImage, updatedUrl).then(refreshRecreateReferencePreview);
    });
  });
};

const normalizeElementId = (value, index) => {
  const base = value || `element_${index + 1}`;
  return String(base).toLowerCase().replace(/[^a-z0-9_-]+/g, '_');
};

const renderElementPreview = (elementId) => {
  if (!recreateElements) return;
  const container = recreateElements.querySelector(`[data-element-preview="${elementId}"]`);
  if (!container) return;
  const override = getElementOverride(elementId);
  renderSinglePreview(container, override.image, () => {
    override.image = null;
    renderElementPreview(elementId);
  }, () => {
    if (!override.image) return;
    openEditor(override.image.dataUrl, (updatedUrl) => {
      updateImageMeta(override.image, updatedUrl).then(() => renderElementPreview(elementId));
    });
  });
};

const renderRecreateEditor = () => {
  if (!recreateElements || !recreateSummary || !recreateElementsCount) return;
  recreateElements.innerHTML = '';
  const analysis = recreateState.analysis;
  const summaryParts = [];
  if (analysis?.summary) summaryParts.push(analysis.summary);
  if (analysis?.style) summaryParts.push(`Style: ${analysis.style}`);
  if (analysis?.background) summaryParts.push(`Background: ${analysis.background}`);
  if (analysis?.composition) summaryParts.push(`Composition: ${analysis.composition}`);
  recreateSummary.textContent =
    summaryParts.length ? summaryParts.join(' • ') : 'Analyze a reference image to list every element.';

  const items = recreateState.elements;
  recreateElementsCount.textContent = `${items.length}`;

  if (!items.length) {
    const empty = document.createElement('div');
    empty.className = 'text-xs font-mono text-gray-500';
    empty.textContent = 'No elements detected yet.';
    recreateElements.appendChild(empty);
    if (recreateRunBtn) {
      recreateRunBtn.disabled = true;
      recreateRunBtn.classList.add('opacity-60');
    }
    return;
  }

  if (recreateRunBtn) {
    recreateRunBtn.disabled = false;
    recreateRunBtn.classList.remove('opacity-60');
  }

  items.forEach((item) => {
    const override = getElementOverride(item.id);

    const card = document.createElement('div');
    card.className = 'recreate-card border border-white/10 rounded-2xl p-4 bg-white/5 flex flex-col gap-3';

    const header = document.createElement('div');
    header.className = 'flex items-start justify-between gap-3';

    const titleWrap = document.createElement('div');
    const title = document.createElement('h4');
    title.className = 'text-sm font-semibold';
    title.textContent = item.label;

    const type = document.createElement('p');
    type.className = 'text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-1';
    type.textContent = item.type || 'Element';

    titleWrap.append(title, type);

    const description = document.createElement('p');
    description.className = 'text-xs text-gray-400';
    description.textContent = item.description || 'No description provided.';

    header.append(titleWrap);
    card.append(header, description);

    if (item.details && item.details.length) {
      const detailWrap = document.createElement('div');
      detailWrap.className = 'flex flex-wrap gap-2';
      item.details.forEach((detail) => {
        const pill = document.createElement('span');
        pill.className = 'px-2 py-0.5 rounded-full border border-white/10 text-[9px] font-mono text-gray-500';
        pill.textContent = detail;
        detailWrap.appendChild(pill);
      });
      card.appendChild(detailWrap);
    }

    const textArea = document.createElement('textarea');
    textArea.rows = 2;
    textArea.placeholder = 'Describe the change or replacement...';
    textArea.value = override.text;
    textArea.className =
      'w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-[11px] focus:outline-none text-gray-300 resize-none';
    textArea.addEventListener('input', (event) => {
      override.text = event.target.value;
    });
    card.appendChild(textArea);

    const dropZone = document.createElement('div');
    dropZone.className =
      'drop-zone relative border border-dashed border-white/10 rounded-xl bg-white/5 hover:bg-white/10 transition-colors p-3 min-h-[110px] flex flex-col items-center justify-center gap-1.5 text-center group cursor-pointer';

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.className = 'absolute inset-0 opacity-0 cursor-pointer z-10';

    const label = document.createElement('span');
    label.className = 'text-[10px] text-gray-500 group-hover:text-gray-300';
    label.textContent = 'Drop replacement image';

    const preview = document.createElement('div');
    preview.className = 'preview-single absolute inset-0 rounded-xl overflow-hidden hidden z-20';
    preview.dataset.elementPreview = item.id;

    dropZone.append(input, label, preview);
    card.appendChild(dropZone);

    recreateElements.appendChild(card);

    setupDragDrop(dropZone, input, 'recreate-element', { elementId: item.id });
    renderElementPreview(item.id);
  });
};


// --- File Handling Logic ---

const handleFiles = async (files, type, meta = {}) => {
  if (!files.length) return;

  if (type === 'reference') {
    const remainingSlots = 4 - state.referenceImages.length;
    if (remainingSlots <= 0) {
      setError('Max 4 reference images allowed.');
      return;
    }

    const selected = Array.from(files).slice(0, remainingSlots);
    const items = await Promise.all(selected.map(readFileWithMeta));
    items.forEach((item) => state.referenceImages.push(item));
    renderReferencePreview();
  }
  else if (type === 'character') {
    const remainingSlots = 6 - state.characterImages.length;
    if (remainingSlots <= 0) {
      setError('Max 6 character images allowed.');
      return;
    }

    const selected = Array.from(files).slice(0, remainingSlots);
    const items = await Promise.all(selected.map(readFileWithMeta));
    items.forEach((item) => state.characterImages.push({ ...item, spec: '' }));
    renderCharacterPreview();
  }
  else if (type === 'scene') {
    const file = files[0];
    state.sceneImage = await readFileWithMeta(file);
    refreshScenePreview();
  }
  else if (type === 'style') {
    const file = files[0];
    state.styleImage = await readFileWithMeta(file);
    refreshStylePreview();
  }
  else if (type === 'recreate-reference') {
    const file = files[0];
    recreateState.referenceImage = await readFileWithMeta(file);
    recreateState.analysis = null;
    recreateState.elements = [];
    recreateState.overrides = {};
    refreshRecreateReferencePreview();
    renderRecreateEditor();
    setRecreateStatus('Reference loaded. Ready to analyze.');
  }
  else if (type === 'recreate-element') {
    const elementId = meta.elementId;
    if (!elementId) return;
    const file = files[0];
    const override = getElementOverride(elementId);
    override.image = await readFileWithMeta(file);
    renderElementPreview(elementId);
  }
};

// --- Drag and Drop Setup ---

const setupDragDrop = (zone, input, type, meta = {}) => {
  if (!zone || !input) return;
  // Basic Input Change
  input.addEventListener('change', (e) => {
    handleFiles(e.target.files, type, meta);
    input.value = ''; // Reset to allow same file selection
  });

  // Drag Events
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    zone.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  ['dragenter', 'dragover'].forEach(eventName => {
    zone.addEventListener(eventName, () => zone.classList.add('drag-over'), false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    zone.addEventListener(eventName, () => zone.classList.remove('drag-over'), false);
  });

  zone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files, type, meta);
  }, false);

  // Make wrapper click trigger input provided it wasn't a remove button click
  zone.addEventListener('click', (e) => {
    if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
      // Rely on layout for clicks
    }
  });
};

setupDragDrop(dropReference, referenceInput, 'reference');
setupDragDrop(dropCharacter, characterInput, 'character');
setupDragDrop(dropScene, sceneInput, 'scene');
setupDragDrop(dropStyle, styleInput, 'style');
setupDragDrop(dropRecreateReference, recreateReferenceInput, 'recreate-reference');

// --- Editor Events ---
if (editorCanvas) {
  editorCanvas.addEventListener('pointerdown', (event) => {
    if (!editorState.isOpen) return;
    if (editorState.tool === 'draw') {
      beginDrawing(event);
    }
  });

  editorCanvas.addEventListener('pointermove', (event) => {
    if (!editorState.isOpen) return;
    continueDrawing(event);
  });

  editorCanvas.addEventListener('click', (event) => {
    if (!editorState.isOpen) return;
    if (editorState.tool === 'text') {
      showTextInput(event);
    }
  });

  editorCanvas.addEventListener('pointerup', stopDrawing);
  editorCanvas.addEventListener('pointerleave', stopDrawing);
}

if (editorTextInput) {
  editorTextInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commitTextInput();
    }
    if (event.key === 'Escape') {
      editorTextInput.classList.add('hidden');
    }
  });

  editorTextInput.addEventListener('blur', commitTextInput);
}

if (editorSave) {
  editorSave.addEventListener('click', () => {
    if (!editorCanvas) return;
    try {
      commitTextInput();
      const merged = editorCanvas.toDataURL('image/png');
      if (editorState.onSave) editorState.onSave(merged);
      closeEditor();
    } catch (error) {
      console.error(error);
      setError('Unable to export edited image.');
    }
  });
}

if (editorCancel) {
  editorCancel.addEventListener('click', closeEditor);
}

if (editorReset) {
  editorReset.addEventListener('click', async () => {
    if (!editorState.baseDataUrl) return;
    setEditorLoading(true);
    try {
      await drawImageToCanvas(editorState.baseDataUrl);
    } catch (error) {
      console.error(error);
      setError('Unable to reset image.');
    } finally {
      setEditorLoading(false);
    }
  });
}

editorColorButtons.forEach((button) => {
  if (button.dataset.color) {
    button.style.backgroundColor = button.dataset.color;
  }
  button.addEventListener('click', () => {
    if (button.dataset.color) setEditorColor(button.dataset.color);
  });
});

if (editorBrushSize) {
  editorBrushSize.addEventListener('input', () => {
    setBrushSize(editorBrushSize.value);
  });
}

if (toolDraw) {
  toolDraw.addEventListener('click', () => setEditorTool('draw'));
}

if (toolText) {
  toolText.addEventListener('click', () => setEditorTool('text'));
}

if (editorModal) {
  editorModal.addEventListener('click', (event) => {
    if (event.target.matches('[data-editor-close]')) {
      closeEditor();
    }
  });
}

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && editorState.isOpen) {
    closeEditor();
  }
});


// --- Generation Logic ---

const buildPrompt = () => {
  const base = promptInput.value.trim();
  const tags = Array.from(styleTags.querySelectorAll('input:checked')).map(
    (input) => input.value
  );

  const selectedPalette = paletteSelect.options[paletteSelect.selectedIndex]?.text;
  const selectedMood = moodSelect.options[moodSelect.selectedIndex]?.text;

  const selectors = [];
  if (paletteSelect.value) selectors.push(selectedPalette);
  if (moodSelect.value) selectors.push(selectedMood);

  const extras = [...tags, ...selectors];
  let prompt = base;

  if (extras.length) {
    prompt = `${prompt}. ${extras.join(', ')}`;
  }

  const aspectHint = getAspectHint();
  if (aspectHint) {
    prompt = `${prompt}\n${aspectHint}`;
  }

  return prompt;
};

const buildContentParts = () => {
  const prompt = buildPrompt();
  const notes = [];

  if (state.referenceImages.length) {
    notes.push('Edit the reference images with the prompt.');
  }
  if (state.characterImages.length) {
    notes.push('Use the character images for subject identity, pose, and wardrobe.');
  }
  if (state.sceneImage) {
    notes.push('Use the scene image for location and environment.');
  }
  if (state.styleImage) {
    notes.push('Use the style image for art direction and material cues.');
  }

  const fullPrompt = notes.length ? `${prompt}\n${notes.join(' ')}` : prompt;
  const parts = [{ type: 'text', text: fullPrompt }];

  if (state.referenceImages.length) {
    parts.push({ type: 'text', text: 'Reference images:' });
    state.referenceImages.forEach((item) => {
      parts.push({ type: 'image_url', image_url: { url: item.dataUrl } });
    });
  }

  if (state.characterImages.length) {
    parts.push({ type: 'text', text: 'Character reference images:' });
    state.characterImages.forEach((item, index) => {
      const spec = item.spec ? `: ${item.spec}` : '';
      parts.push({ type: 'text', text: `Character reference ${index + 1}${spec}` });
      parts.push({ type: 'image_url', image_url: { url: item.dataUrl } });
    });
  }

  if (state.sceneImage) {
    parts.push({ type: 'text', text: 'Scene reference:' });
    parts.push({ type: 'image_url', image_url: { url: state.sceneImage.dataUrl } });
  }

  if (state.styleImage) {
    parts.push({ type: 'text', text: 'Style reference:' });
    parts.push({ type: 'image_url', image_url: { url: state.styleImage.dataUrl } });
  }

  return parts;
};

const buildRecreatePrompt = () => {
  const analysis = recreateState.analysis || {};
  const globalNotes = recreateNotes ? recreateNotes.value.trim() : '';
  const replacements = [];

  recreateState.elements.forEach((element) => {
    const override = recreateState.overrides[element.id];
    const text = override?.text?.trim();
    const hasImage = Boolean(override?.image?.dataUrl);
    if (!text && !hasImage) return;

    const detailParts = [];
    if (text) detailParts.push(text);
    if (hasImage) detailParts.push('Use the provided replacement image for this element only.');
    if (element.description) detailParts.push(`Original: ${element.description}`);
    if (element.details && element.details.length) {
      detailParts.push(`Details: ${element.details.join(', ')}`);
    }
    replacements.push(`${element.label}: ${detailParts.join(' ')}`);
  });

  let prompt =
    'Recreate the provided reference image as faithfully as possible. Preserve composition, camera angle, lighting, color, and background elements. Only change the elements listed below.';

  if (analysis.summary) prompt += `\nReference summary: ${analysis.summary}`;
  if (analysis.style) prompt += `\nStyle: ${analysis.style}`;
  if (analysis.background) prompt += `\nBackground: ${analysis.background}`;
  if (analysis.composition) prompt += `\nComposition: ${analysis.composition}`;

  if (replacements.length) {
    prompt += `\nElement replacements:\n- ${replacements.join('\n- ')}`;
  } else {
    prompt += '\nNo element overrides were provided. Recreate the reference exactly.';
  }

  if (globalNotes) {
    prompt += `\nGlobal edits: ${globalNotes}`;
  }

  const aspectHint = getAspectHint();
  if (aspectHint) {
    prompt += `\n${aspectHint}`;
  }

  return prompt;
};

const buildRecreateContentParts = () => {
  const parts = [{ type: 'text', text: buildRecreatePrompt() }];

  if (recreateState.referenceImage) {
    parts.push({ type: 'text', text: 'Reference image:' });
    parts.push({ type: 'image_url', image_url: { url: recreateState.referenceImage.dataUrl } });
  }

  recreateState.elements.forEach((element) => {
    const override = recreateState.overrides[element.id];
    if (!override?.image?.dataUrl) return;
    const detail = override.text ? `: ${override.text}` : '';
    parts.push({ type: 'text', text: `Replacement reference for ${element.label}${detail}` });
    parts.push({ type: 'image_url', image_url: { url: override.image.dataUrl } });
  });

  return parts;
};

const extractImages = (data) => {
  const urls = [];

  const pushUrl = (value) => {
    if (value && !urls.includes(value)) {
      urls.push(value);
    }
  };

  const collect = (item) => {
    if (!item) return;
    if (item?.image_url?.url) {
      pushUrl(item.image_url.url);
    } else if (typeof item?.image_url === 'string') {
      pushUrl(item.image_url);
    } else if (item?.url) {
      pushUrl(item.url);
    } else if (item?.b64_json) {
      pushUrl(`data:image/png;base64,${item.b64_json}`);
    } else if (item?.type === 'image' && item?.source?.data) {
      pushUrl(`data:image/png;base64,${item.source.data}`);
    } else if (item?.source?.url) {
      pushUrl(item.source.url);
    }
  };

  const message = data?.choices?.[0]?.message;
  const images = Array.isArray(message?.images) ? message.images : [];
  images.forEach(collect);

  const content = message?.content;
  if (Array.isArray(content)) {
    content.forEach(collect);
  }

  if (Array.isArray(data?.data)) {
    data.data.forEach(collect);
  }

  if (Array.isArray(data?.output)) {
    data.output.forEach((item) => {
      if (Array.isArray(item?.content)) {
        item.content.forEach(collect);
      }
    });
  }

  if (!urls.length && typeof content === 'string') {
    const matches = content.match(/(https?:\/\/\S+|data:image\/\w+;base64,\S+)/g);
    if (matches) {
      matches.forEach(pushUrl);
    }
  }

  return urls;
};

const buildHeaders = () => {
  const apiKey = apiKeyInput.value.trim();
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  };
};

const extractTextContent = (content) => {
  if (!content) return '';
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') return part;
        if (part?.text) return part.text;
        return '';
      })
      .join('\n')
      .trim();
  }
  return '';
};

const extractJsonBlock = (text) => {
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-z]*\n?/i, '').replace(/```$/i, '').trim();
  }
  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');
  if (firstBrace === -1 && firstBracket === -1) {
    return cleaned;
  }
  const startsWithArray = firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace);
  const start = startsWithArray ? firstBracket : firstBrace;
  const end = startsWithArray ? cleaned.lastIndexOf(']') : cleaned.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    cleaned = cleaned.slice(start, end + 1);
  }
  return cleaned.trim();
};

const repairJsonText = (text) => {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/[\u201c\u201d]/g, '"').replace(/[\u2018\u2019]/g, "'");
  cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');
  cleaned = cleaned.replace(/}\s*{/g, '},{');
  cleaned = cleaned.replace(/]\s*{/g, '],{');
  cleaned = cleaned.replace(/"\s+"/g, '","');
  cleaned = cleaned.replace(/"\s*{/g, '",{');
  cleaned = cleaned.replace(/}\s*"/g, '},"');
  return cleaned.trim();
};

const parseAnalysisJson = (text) => {
  if (!text) throw new Error('Analyzer returned an empty response.');
  const cleaned = extractJsonBlock(text);
  const parseValue = (value) => {
    if (value.startsWith('[')) {
      return { elements: JSON.parse(value) };
    }
    return JSON.parse(value);
  };
  try {
    return parseValue(cleaned);
  } catch (error) {
    const repaired = repairJsonText(cleaned);
    if (repaired !== cleaned) {
      try {
        return parseValue(repaired);
      } catch (repairError) {
        console.warn('Analysis JSON repair failed.', repairError);
      }
    }
    console.warn('Analysis JSON parse failed.', error, cleaned);
    const detail = error?.message ? ` (${error.message})` : '';
    throw new Error(`Analyzer returned invalid JSON${detail}. Try analyzing again or switch the analysis model.`);
  }
};

const normalizeAnalysis = (analysis) => {
  const rawElements = Array.isArray(analysis?.elements)
    ? analysis.elements
    : Array.isArray(analysis?.items)
      ? analysis.items
      : Array.isArray(analysis?.objects)
        ? analysis.objects
        : [];

  const usedIds = new Set();
  const elements = rawElements.map((item, index) => {
    const isTextItem = typeof item === 'string';
    const label = isTextItem ? item : item?.label || item?.name || item?.title || `Element ${index + 1}`;
    let id = normalizeElementId(item?.id || item?.key || label, index);
    if (usedIds.has(id)) {
      id = `${id}_${index + 1}`;
    }
    usedIds.add(id);
    const type = isTextItem ? 'object' : item?.type || item?.category || item?.kind || 'object';
    const description = isTextItem ? '' : item?.description || item?.summary || item?.notes || '';
    let details = isTextItem ? [] : item?.details || item?.attributes || item?.key_details || item?.features || [];
    if (!Array.isArray(details)) details = details ? [String(details)] : [];
    details = details.map((detail) => String(detail)).filter(Boolean);

    return {
      id,
      label,
      type,
      description,
      details
    };
  });

  return {
    summary: analysis?.summary || analysis?.scene || analysis?.overview || '',
    style: analysis?.style || analysis?.aesthetic || '',
    background: analysis?.background || analysis?.environment || '',
    composition: analysis?.composition || analysis?.layout || '',
    elements
  };
};

const requestAnalysis = async (imageUrl) => {
  const instructions =
    'Analyze the image and return ONLY valid JSON (no markdown, no commentary). ' +
    'Use double quotes for all keys/strings, escape newlines as \\n, and do not include trailing commas. ' +
    'Include every visible element, even minor details. ' +
    'Split people into individual entries. Capture clothing, accessories, text, signage, props, lighting, and background objects. ' +
    'Return this schema: {"summary": "...","style":"...","background":"...","composition":"...","elements":[{"id":"person_1","label":"Male 1","type":"person","description":"...","details":["...","..."]}]}';

  const payload = {
    model: ANALYSIS_MODEL,
    max_tokens: 2000,
    temperature: 0,
    messages: [
      {
        role: 'system',
        content: 'You are a meticulous visual analyst that outputs strict JSON only.'
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: instructions },
          { type: 'image_url', image_url: { url: imageUrl } }
        ]
      }
    ]
  };

  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.error?.message || data?.message || 'OpenRouter request failed.';
    throw new Error(message);
  }

  const text = extractTextContent(data?.choices?.[0]?.message?.content);
  const parsed = parseAnalysisJson(text);
  return normalizeAnalysis(parsed);
};

const requestImages = async (contentParts, seedValue, model) => {
  const payload = {
    model: model,
    messages: [{ role: 'user', content: contentParts }]
  };

  if (Number.isFinite(seedValue)) {
    payload.seed = seedValue;
  }

  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.error?.message || data?.message || 'OpenRouter request failed.';
    throw new Error(message);
  }

  return extractImages(data);
};

// Returns an array of skeleton DOM elements to be filled later
const createSkeletons = (count) => {
  const skeletons = [];
  for (let i = 0; i < count; i += 1) {
    const card = document.createElement('div');
    card.className = 'card skeleton animate-pulse bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3 min-h-[300px] mt-4 opacity-0 slide-in';
    card.innerHTML =
      '<div class="skeleton-block image bg-white/10 rounded-xl h-48 w-full mb-3"></div>' +
      '<div class="skeleton-block bg-white/10 h-3 w-3/4 rounded-full"></div>';

    // Add slightly delayed animation for entrance
    setTimeout(() => card.classList.remove('opacity-0'), 50);

    galleryGrid.prepend(card); // Add new items to TOP
    skeletons.push(card);
  }
  return skeletons;
};

const replaceSkeletonWithImage = (card, src, index) => {
  card.classList.remove('skeleton', 'animate-pulse');
  card.innerHTML = ''; // Clear skeleton structure

  // Build real card
  const img = document.createElement('img');
  img.src = src;
  img.alt = `Generated image`;
  img.loading = 'lazy';
  img.className = 'w-full rounded-xl fade-in';
  img.title = 'Click to edit';

  const actions = document.createElement('div');
  actions.className = 'flex gap-2 mt-auto';

  const open = document.createElement('a');
  open.href = src;
  open.target = '_blank';
  open.className = 'text-xs text-gray-400 hover:text-white px-3 py-2 border border-white/10 rounded-full hover:bg-white/10 transition-colors cursor-pointer';
  open.textContent = 'View';

  const download = document.createElement('a');
  download.href = src;
  download.textContent = 'Download';
  download.setAttribute('download', `nano-banana-${Date.now()}-${index}.png`);
  download.className = 'text-xs text-gray-400 hover:text-white px-3 py-2 border border-white/10 rounded-full hover:bg-white/10 transition-colors cursor-pointer';

  const copy = document.createElement('button');
  copy.type = 'button';
  copy.textContent = 'Copy Prompt';
  copy.className = 'text-xs text-gray-400 hover:text-white px-3 py-2 border border-white/10 rounded-full hover:bg-white/10 transition-colors ml-auto';
  copy.addEventListener('click', () => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(lastPrompt).then(() => {
      copy.textContent = 'Copied!';
      setTimeout(() => copy.textContent = 'Copy Prompt', 2000);
    });
  });

  actions.append(open, download, copy);
  card.append(img, actions);

  img.addEventListener('click', () => {
    openEditor(img.src, (updatedUrl) => {
      img.src = updatedUrl;
      open.href = updatedUrl;
      download.href = updatedUrl;
    });
  });
};

const analyzeRecreateReference = async () => {
  setError('');

  if (!recreateState.referenceImage) {
    setRecreateStatus('Add a reference image first.');
    return;
  }

  const apiKey = apiKeyInput.value.trim();
  if (!apiKey) {
    setError('API key required.');
    apiKeyInput.focus();
    return;
  }

  if (recreateState.isAnalyzing) return;

  setRecreateAnalyzing(true);
  setRecreateStatus('Analyzing image...');

  try {
    const analysis = await requestAnalysis(recreateState.referenceImage.dataUrl);
    recreateState.analysis = analysis;
    recreateState.elements = analysis.elements;
    recreateState.overrides = {};
    renderRecreateEditor();
    setRecreateStatus(`Detected ${analysis.elements.length} elements.`);
  } catch (error) {
    console.error(error);
    setRecreateStatus('Analysis failed.');
    setError(error.message || 'Analysis failed.');
  } finally {
    setRecreateAnalyzing(false);
  }
};

const handleRecreate = async () => {
  setError('');

  if (state.activeRequests >= state.queueLimit) {
    setRecreateStatus('Queue is full. Wait for a batch to finish.');
    return;
  }

  const apiKey = apiKeyInput.value.trim();
  if (!apiKey) {
    setError('API key required.');
    apiKeyInput.focus();
    return;
  }

  if (!recreateState.referenceImage) {
    setRecreateStatus('Add a reference image first.');
    return;
  }

  if (!recreateState.analysis) {
    setRecreateStatus('Analyze the reference image first.');
    return;
  }

  if (!recreateState.elements.length) {
    setRecreateStatus('No elements found to recreate.');
    return;
  }

  if (aspectSelect.value === 'reference') {
    const ref = getReferenceImageForAspect();
    if (!ref?.width || !ref?.height) {
      setRecreateStatus('Add a reference image to use Reference aspect ratio.');
      return;
    }
  }

  const desiredCount = Math.max(1, Math.min(Number(countRange.value) || 1, 4));
  const seedValue = seedInput && seedInput.value.trim() !== '' ? Number(seedInput.value) : null;
  const selectedModel = recreateModelSelect?.value || modelSelect.value || 'google/gemini-2.0-flash-exp';

  lastPrompt = buildRecreatePrompt();
  const contentParts = buildRecreateContentParts();

  setRecreateRunning(true);
  setRecreateStatus('Recreating image...');
  state.activeRequests++;
  updateQueueStatus();
  galleryEmpty.style.display = 'none';

  const skeletons = createSkeletons(desiredCount);

  try {
    const images = [];
    for (let i = 0; i < desiredCount; i += 1) {
      const batch = await requestImages(
        contentParts,
        Number.isFinite(seedValue) ? seedValue + i : undefined,
        selectedModel
      );
      images.push(...batch);
      if (images.length >= desiredCount) break;
    }

    const trimmed = images.slice(0, desiredCount);
    if (!trimmed.length) throw new Error('No images returned.');

    trimmed.forEach((src, idx) => {
      if (skeletons[idx]) {
        replaceSkeletonWithImage(skeletons[idx], src, idx);
      }
    });

    imageCount.textContent = galleryGrid.children.length;
    setRecreateStatus('Recreate completed.');
  } catch (error) {
    console.error(error);
    setError(error.message || 'Recreate failed.');
    setRecreateStatus('Recreate failed.');
    skeletons.forEach((skel) => skel.remove());

    if (galleryGrid.children.length === 0) {
      galleryEmpty.style.display = 'flex';
    }
  } finally {
    state.activeRequests--;
    updateQueueStatus();
    setLoading(state.activeRequests > 0);
    setRecreateRunning(false);
  }
};

const handleSubmit = async (event) => {
  event.preventDefault();
  setError('');

  // Check queue limit
  if (state.activeRequests >= state.queueLimit) {
    setError('Queue is full. Wait for a batch to finish.');
    return;
  }

  const apiKey = apiKeyInput.value.trim();
  if (!apiKey) {
    setError('API key required.');
    apiKeyInput.focus();
    return;
  }

  const basePrompt = promptInput.value.trim();
  if (!basePrompt) {
    setError('Enter a prompt.');
    promptInput.focus();
    return;
  }

  if (aspectSelect.value === 'reference') {
    const ref = getReferenceImageForAspect();
    if (!ref?.width || !ref?.height) {
      setError('Add a reference, character, scene, or style image to use Reference aspect ratio.');
      return;
    }
  }

  const desiredCount = Math.max(1, Math.min(Number(countRange.value) || 1, 4));
  const seedValue = seedInput && seedInput.value.trim() !== '' ? Number(seedInput.value) : null;
  const selectedModel = modelSelect.value || 'google/gemini-2.0-flash-exp';

  lastPrompt = buildPrompt();
  const contentParts = buildContentParts();

  // Clear prompt after capturing it
  promptInput.value = '';
  promptInput.style.height = 'auto';

  setLoading(true);
  state.activeRequests++;
  updateQueueStatus();
  galleryEmpty.style.display = 'none';

  // Create Local Skeletons
  const skeletons = createSkeletons(desiredCount);

  try {
    const images = [];

    // Batch Request
    for (let i = 0; i < desiredCount; i += 1) {
      const batch = await requestImages(
        contentParts,
        Number.isFinite(seedValue) ? seedValue + i : undefined,
        selectedModel
      );
      images.push(...batch);
      if (images.length >= desiredCount) break;
    }

    const trimmed = images.slice(0, desiredCount);
    if (!trimmed.length) throw new Error('No images returned.');

    // Replace skeletons with Real Images
    trimmed.forEach((src, idx) => {
      if (skeletons[idx]) {
        replaceSkeletonWithImage(skeletons[idx], src, idx);
      }
    });

    // Update count display based on real children
    imageCount.textContent = galleryGrid.children.length;

  } catch (error) {
    console.error(error);
    setError(error.message || 'Generation failed.');

    // Remove failed skeletons
    skeletons.forEach(skel => skel.remove());

    if (galleryGrid.children.length === 0) {
      galleryEmpty.style.display = 'flex';
    }
  } finally {
    state.activeRequests--;
    updateQueueStatus();
    setLoading(state.activeRequests > 0);
  }
};

const clearForm = () => {
  form.reset();
  state.referenceImages = [];
  state.characterImages = [];
  state.sceneImage = null;
  state.styleImage = null;
  recreateState.referenceImage = null;
  recreateState.analysis = null;
  recreateState.elements = [];
  recreateState.overrides = {};
  updateCount();
  renderReferencePreview();
  renderCharacterPreview();
  refreshScenePreview();
  refreshStylePreview();
  refreshRecreateReferencePreview();
  renderRecreateEditor();
  galleryGrid.innerHTML = '';
  galleryEmpty.style.display = 'flex';
  imageCount.textContent = '0';
  setError('');
  setStatus('Ready');
  setRecreateStatus('');
};

const applyPrompt = (value) => {
  promptInput.value = value;
  promptInput.focus();
};

const hydrateDefaults = () => {
  const remember = localStorage.getItem(STORAGE_REMEMBER) === 'true';
  rememberCheckbox.checked = remember;
  if (remember) {
    const savedKey = localStorage.getItem(STORAGE_KEY);
    if (savedKey) apiKeyInput.value = savedKey;
  }
  if (!apiKeyInput.value && DEFAULT_API_KEY) {
    apiKeyInput.value = DEFAULT_API_KEY;
  }
};

const updateStorage = () => {
  if (!rememberCheckbox.checked) {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(STORAGE_REMEMBER, 'false');
    return;
  }
  localStorage.setItem(STORAGE_KEY, apiKeyInput.value);
  localStorage.setItem(STORAGE_REMEMBER, 'true');
};

const syncModelSelects = () => {
  if (!modelSelect || !recreateModelSelect) return;
  recreateModelSelect.value = modelSelect.value;
  recreateModelSelect.addEventListener('change', () => {
    modelSelect.value = recreateModelSelect.value;
  });
  modelSelect.addEventListener('change', () => {
    recreateModelSelect.value = modelSelect.value;
  });
};

// Event Listeners
form.addEventListener('submit', handleSubmit);
countRange.addEventListener('input', updateCount);
clearBtn.addEventListener('click', clearForm);
apiKeyInput.addEventListener('input', updateStorage);
rememberCheckbox.addEventListener('change', updateStorage);
featureTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.featureTab;
    if (target) setActiveFeature(target);
  });
});
if (recreateAnalyzeBtn) recreateAnalyzeBtn.addEventListener('click', analyzeRecreateReference);
if (recreateRunBtn) recreateRunBtn.addEventListener('click', handleRecreate);

surpriseBtn.addEventListener('click', () => {
  const pick = surprisePrompts[Math.floor(Math.random() * surprisePrompts.length)];
  applyPrompt(pick);
});

promptInput.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter' || !event.ctrlKey) return;
  event.preventDefault();
  if (generateBtn && !generateBtn.disabled) {
    if (typeof form.requestSubmit === 'function') {
      form.requestSubmit(generateBtn);
    } else {
      generateBtn.click();
    }
  }
});

const attachSampleListeners = () => {
  document.querySelectorAll('.sample').forEach((button) => {
    button.addEventListener('click', () => applyPrompt(button.dataset.prompt || ''));
  });
}
attachSampleListeners();

toggleKeyButton.addEventListener('click', () => {
  const isPassword = apiKeyInput.type === 'password';
  apiKeyInput.type = isPassword ? 'text' : 'password';
  toggleKeyButton.textContent = isPassword ? 'Hide' : 'Show';
});

updateCount();
hydrateDefaults();
syncModelSelects();
updateQueueStatus();
renderRecreateEditor();
setActiveFeature(activeFeature);
