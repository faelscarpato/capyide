import { state, setThemePreference } from '../model/appState.js';

export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  setThemePreference(theme);
}

export function toggleTheme() {
  const newTheme = state.currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme);
  return newTheme;
}

export function initTheme() {
  applyTheme(state.currentTheme || 'dark');
  return state.currentTheme;
}
