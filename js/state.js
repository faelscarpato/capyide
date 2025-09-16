export const state = {
  editor: null,
  usingFallback: false,
  apiKey: localStorage.getItem('gemini_api_key'),
  currentCode: localStorage.getItem('current_code') || '',
  previewTimer: null,
  pendingCodeQueue: [],
  lastGen: { prompt: '', code: '' },
  autoSaveTimer: null,
  currentTheme: localStorage.getItem('theme') || 'dark',
};

export function setApiKey(key) {
  state.apiKey = key;
  if (key) {
    localStorage.setItem('gemini_api_key', key);
  } else {
    localStorage.removeItem('gemini_api_key');
  }
}

export function setCurrentCode(code) {
  state.currentCode = code;
  if (code) {
    localStorage.setItem('current_code', code);
  } else {
    localStorage.removeItem('current_code');
  }
}

export function setLastGen(data) {
  state.lastGen = data;
}

export function resetLastGen() {
  state.lastGen = { prompt: '', code: '' };
}

export function setThemePreference(theme) {
  state.currentTheme = theme;
  localStorage.setItem('theme', theme);
}
