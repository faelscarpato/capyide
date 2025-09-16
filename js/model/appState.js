const storage = typeof localStorage !== 'undefined'
  ? localStorage
  : {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };

export const state = {
  editor: null,
  usingFallback: false,
  apiKey: storage.getItem('gemini_api_key'),
  currentCode: storage.getItem('current_code') || '',
  previewTimer: null,
  pendingCodeQueue: [],
  lastGen: { prompt: '', code: '' },
  autoSaveTimer: null,
  currentTheme: storage.getItem('theme') || 'dark',
  codeSizeWarningShown: false,
};

export function setApiKey(key) {
  state.apiKey = key;
  if (key) {
    storage.setItem('gemini_api_key', key);
  } else {
    storage.removeItem('gemini_api_key');
  }
}

export function setCurrentCode(code) {
  state.currentCode = code;
  if (code) {
    storage.setItem('current_code', code);
  } else {
    storage.removeItem('current_code');
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
  storage.setItem('theme', theme);
}
