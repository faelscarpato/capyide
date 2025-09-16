import { elements } from './domElements.js';
import { state, setCurrentCode } from '../model/appState.js';
import { isFullHtml } from '../shared/html.js';
import { showToast } from './notificationView.js';

const AUTO_SAVE_DELAY = 1000;
const LARGE_CODE_LINES = 500;
const LARGE_CODE_CHARS = 24000;

function updateMonacoStatus(isAvailable) {
  if (!elements.monacoStatus) return;
  elements.monacoStatus.className = isAvailable
    ? 'inline-block w-2.5 h-2.5 bg-green-500 rounded-full'
    : 'inline-block w-2.5 h-2.5 bg-red-500 rounded-full';
}

function setMonacoWorkers(baseUrl) {
  window.MonacoEnvironment = {
    getWorkerUrl() {
      const code = `self.MonacoEnvironment={baseUrl:'${baseUrl}/'};importScripts('${baseUrl}/vs/base/worker/workerMain.js');`;
      return URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
    },
  };
}

function applyMonacoTheme() {
  if (!window.monaco || !monaco.editor) return;
  monaco.editor.defineTheme('capyuniverse', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'comment', foreground: '7f8ea3' },
      { token: 'string', foreground: 'eab308' },
      { token: 'number', foreground: '67e8f9' },
      { token: 'keyword', foreground: 'a78bfa', fontStyle: 'bold' },
      { token: 'type', foreground: 'f472d0' },
      { token: 'function', foreground: '22d3ee' },
    ],
    colors: {
      'editor.foreground': '#e6e6f0',
      'editor.background': '#0f1024',
      'editorLineNumber.foreground': '#596080',
      'editorLineNumber.activeForeground': '#d1d5ff',
      'editorCursor.foreground': '#22d3ee',
      'editor.selectionBackground': '#3b3f73',
      'editor.inactiveSelectionBackground': '#2a2e63',
      'editorIndentGuide.background': '#252a4f',
      'editorIndentGuide.activeBackground': '#3c4278',
      'editor.lineHighlightBackground': '#1a1e3d',
      'scrollbarSlider.background': '#5ee7f766',
      'scrollbarSlider.hoverBackground': '#f472d066',
      'scrollbarSlider.activeBackground': '#22d3eeaa',
      'editorGutter.background': '#0f1024',
      'editorWidget.background': '#0b0b14',
      'editorSuggestWidget.background': '#12142b',
      'editorSuggestWidget.selectedBackground': '#2a2e63',
    },
  });
  try {
    monaco.editor.setTheme('capyuniverse');
  } catch (error) {
    console.error('Erro aplicando tema do Monaco:', error);
  }
}

function loadMonaco(cdnBase) {
  return new Promise((resolve, reject) => {
    try {
      require.config({ paths: { vs: `${cdnBase}/vs` } });
      const css = document.getElementById('monaco-css');
      if (css) css.href = `${cdnBase}/vs/editor/editor.main.css`;
      setMonacoWorkers(cdnBase);
      require(
        ['vs/editor/editor.main'],
        () => {
          updateMonacoStatus(true);
          resolve();
        },
        (err) => reject(err)
      );
    } catch (error) {
      reject(error);
    }
  });
}

function updateCodeMetrics() {
  if (!elements.codeMetrics) return;
  const code = state.currentCode || '';
  const lines = code ? code.split(/\r?\n/).length : 0;
  const chars = code.length;
  const kb = chars / 1024;

  const warning = lines > LARGE_CODE_LINES || chars > LARGE_CODE_CHARS;
  elements.codeMetrics.textContent = `${lines} linha${lines === 1 ? '' : 's'} • ${kb.toFixed(kb >= 10 ? 0 : 1)} KB`;
  elements.codeMetrics.classList.toggle('text-amber-300', warning);
  elements.codeMetrics.classList.toggle('text-rose-300', chars > LARGE_CODE_CHARS * 1.5);

  if (warning && !state.codeSizeWarningShown) {
    showToast('O código está ficando grande. O preview pode ficar mais lento.');
    state.codeSizeWarningShown = true;
  } else if (!warning && state.codeSizeWarningShown) {
    state.codeSizeWarningShown = false;
  }
}

function bindFallbackEditor() {
  if (!elements.fallbackEditor) return;
  if (elements.fallbackEditor.dataset.bound === 'true') return;
  elements.fallbackEditor.addEventListener('input', () => {
    state.currentCode = elements.fallbackEditor.value;
    schedulePreview();
    queueAutoSave();
    updateCodeMetrics();
  });
  elements.fallbackEditor.dataset.bound = 'true';
}

function enableFallbackEditor() {
  if (!elements.fallbackEditor) return;
  state.usingFallback = true;
  updateMonacoStatus(false);
  elements.fallbackEditor.style.display = 'block';
  elements.fallbackEditor.value = state.pendingCodeQueue.pop() ?? state.currentCode ?? '';
  state.currentCode = elements.fallbackEditor.value;
  bindFallbackEditor();
  state.pendingCodeQueue = [];
  updateCodeMetrics();
  showToast('Ativei o editor básico (fallback).');
}

function createMonacoInstance() {
  if (!window.monaco || !elements.monacoEditor) {
    enableFallbackEditor();
    return;
  }
  try {
    applyMonacoTheme();
    state.editor = monaco.editor.create(elements.monacoEditor, {
      value: state.currentCode,
      language: 'html',
      theme: 'capyuniverse',
      fontSize: 14,
      automaticLayout: true,
      minimap: { enabled: false },
    });
    state.editor.onDidChangeModelContent(() => {
      state.currentCode = state.editor.getValue();
      schedulePreview();
      queueAutoSave();
      updateCodeMetrics();
    });
    if (state.pendingCodeQueue.length) {
      const latest = state.pendingCodeQueue[state.pendingCodeQueue.length - 1];
      state.editor.setValue(latest);
      state.currentCode = latest;
      state.pendingCodeQueue = [];
      updateCodeMetrics();
    }
  } catch (error) {
    console.error('[Monaco] Erro instanciando editor', error);
    enableFallbackEditor();
  }
}

function queueAutoSave() {
  if (state.autoSaveTimer) clearTimeout(state.autoSaveTimer);
  state.autoSaveTimer = setTimeout(autoSaveCode, AUTO_SAVE_DELAY);
}

function autoSaveCode() {
  const code = getEditorValue();
  if (code != null) {
    setCurrentCode(code);
  }
}

export function setEditorValue(value) {
  if (state.usingFallback) {
    elements.fallbackEditor.value = value;
    state.currentCode = value;
  } else if (state.editor) {
    state.editor.setValue(value);
    state.currentCode = value;
  } else {
    state.pendingCodeQueue.push(value);
    state.currentCode = value;
  }
  updateCodeMetrics();
  schedulePreview();
  queueAutoSave();
}

export function getEditorValue() {
  if (state.usingFallback) {
    return elements.fallbackEditor.value;
  }
  if (state.editor) {
    return state.editor.getValue();
  }
  return state.currentCode;
}

export function schedulePreview() {
  if (state.previewTimer) cancelAnimationFrame(state.previewTimer);
  state.previewTimer = requestAnimationFrame(updatePreview);
}

export function updatePreview() {
  if (!elements.previewContainer || !elements.previewFrame) {
    return;
  }
  if (!state.currentCode || elements.previewContainer.classList.contains('hidden')) {
    return;
  }
  const doc = isFullHtml(state.currentCode)
    ? state.currentCode
    : `<!DOCTYPE html><html><head><base href="/"/></head><body>${state.currentCode}</body></html>`;
  elements.previewFrame.srcdoc = doc;
}

export async function initEditor() {
  if (state.editor || state.usingFallback) {
    if (state.currentCode) {
      setEditorValue(state.currentCode);
    }
    return;
  }

  const cdnBases = [
    `https://cdn.jsdelivr.net/npm/monaco-editor@${window.MONACO_VERSION}/min`,
    `https://unpkg.com/monaco-editor@${window.MONACO_VERSION}/min`,
    `https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/${window.MONACO_VERSION}/min`,
  ];

  for (const base of cdnBases) {
    try {
      await loadMonaco(base);
      createMonacoInstance();
      return;
    } catch (error) {
      console.error('[Monaco] Falha ao carregar', base, error);
    }
  }

  enableFallbackEditor();
}

export function refreshCodeMetrics() {
  updateCodeMetrics();
}
