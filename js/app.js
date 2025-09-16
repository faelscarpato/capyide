import { elements, suggestionButtons } from './elements.js';
import { setupApiKeyModal } from './apiKey.js';
import { callGemini, extractCode } from './ai.js';
import { addChatMessage, handleChatMessage, openChatDrawer, closeChatDrawer } from './chat.js';
import { initEditor, setEditorValue, getEditorValue, updatePreview } from './editor.js';
import { initTheme, toggleTheme } from './theme.js';
import { formatHtml, toast } from './utils.js';
import { runTests } from './tests.js';
import { setLastGen, state } from './state.js';

function showEditorScreen(prompt) {
  elements.homeScreen.classList.add('slide-out-left');
  setTimeout(() => {
    elements.homeScreen.classList.add('hidden');
    elements.editorScreen.classList.remove('hidden');
    elements.editorScreen.classList.add('slide-in-right');
    addChatMessage('user', prompt);
    addChatMessage('assistant', 'Código gerado e enviado ao editor.');
    setTimeout(runTests, 800);
  }, 220);
}

function showHomeScreen() {
  elements.chatOverlay?.classList.add('hidden');
  elements.chatPanel?.classList.add('-translate-x-full');
  elements.homeScreen.classList.remove('slide-in-left', 'slide-out-left', 'hidden');
  elements.editorScreen.classList.remove('slide-in-right', 'slide-out-left');
  elements.homeScreen.classList.remove('hidden');
  elements.editorScreen.classList.add('hidden');
  elements.codeTab?.click();
}

async function handleGenerateClick() {
  const prompt = elements.promptInput.value.trim();
  if (!prompt) {
    toast('Descreva o que quer criar :)');
    return;
  }

  elements.loadingOverlay.classList.remove('hidden');

  try {
    const response = await callGemini(prompt, true);
    if (typeof response === 'string' && response.startsWith('ERRO::')) {
      addChatMessage('assistant', `Falhou ao gerar código: ${response.replace('ERRO::', '')}`);
      return;
    }

    const code = extractCode(response);
    setEditorValue(code);
    setLastGen({ prompt, code });
    showEditorScreen(prompt);
  } catch (error) {
    addChatMessage('assistant', `Falhou ao gerar código: ${error?.message || 'desconhecido'}`);
  } finally {
    elements.loadingOverlay.classList.add('hidden');
  }
}

function handleFormatClick() {
  try {
    const code = getEditorValue() || '';
    const formatted = formatHtml(code);
    setEditorValue(formatted);
    toast('Código formatado');
  } catch (error) {
    toast('Erro ao formatar código');
    console.error('Erro formatação:', error);
  }
}

function handleThemeToggle() {
  const theme = toggleTheme();
  if (elements.themeToggle) {
    elements.themeToggle.textContent = theme === 'dark' ? '🌙' : '☀️';
  }
}

async function handleChatSubmit() {
  const message = elements.chatInput.value.trim();
  if (!message) return;
  addChatMessage('user', message);
  elements.chatInput.value = '';
  await handleChatMessage(message);
}

function handleCopyClick() {
  navigator.clipboard
    .writeText(getEditorValue() || '')
    .then(() => toast('Código copiado!'))
    .catch(() => toast('Não foi possível copiar.'));
}

function handleDownloadClick() {
  const blob = new Blob([getEditorValue() || ''], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'codigo_gerado.html';
  a.click();
  URL.revokeObjectURL(url);
  toast('Download iniciado');
}

function handleShortcuts(event) {

  if (!event || !event.key) return;
  
 const key = event.key.toLowerCase();
  const accel = event.ctrlKey || event.metaKey;

  if (accel && key === 's') {
    event.preventDefault();
    handleDownloadClick();
  }

  if (accel && key === 'p') {
    event.preventDefault();
    elements.previewTab?.click();
  }

  if (event.key === 'Escape') {
    closeChatDrawer();
  }
}

function bindEvents() {
  elements.generateBtn?.addEventListener('click', handleGenerateClick);
  elements.backBtn?.addEventListener('click', showHomeScreen);

  elements.sendChatBtn?.addEventListener('click', handleChatSubmit);
  elements.chatInput?.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleChatSubmit();
    }
  });

  elements.codeTab?.addEventListener('click', () => {
    elements.codeTab.classList.add('active');
    elements.previewTab?.classList.remove('active');
    elements.monacoEditor?.classList.remove('hidden');
    if (state.usingFallback && elements.fallbackEditor) {
      elements.fallbackEditor.style.display = 'block';
    }
    elements.previewContainer?.classList.add('hidden');
  });

  elements.previewTab?.addEventListener('click', () => {
    elements.previewTab.classList.add('active');
    elements.codeTab?.classList.remove('active');
    elements.monacoEditor?.classList.add('hidden');
    if (elements.fallbackEditor) {
      elements.fallbackEditor.style.display = 'none';
    }
    elements.previewContainer?.classList.remove('hidden');
    updatePreview();
  });

  elements.formatBtn?.addEventListener('click', handleFormatClick);
  elements.themeToggle?.addEventListener('click', handleThemeToggle);

  elements.copyBtn?.addEventListener('click', handleCopyClick);
  elements.downloadBtn?.addEventListener('click', handleDownloadClick);

  suggestionButtons
    .filter((btn) => ['Website', 'App React', 'Python'].includes(btn.textContent.trim()))
    .forEach((btn) => {
      btn.addEventListener('click', () => {
        const presets = {
          Website: 'Uma landing page moderna para uma empresa de tecnologia com seções hero, serviços e contato',
          'App React': 'Um dashboard administrativo com gráficos, tabelas e formulários',
          Python: 'Uma página web que simula um terminal Python interativo com exemplos de código',
        };
        elements.promptInput.value = presets[btn.textContent.trim()] || btn.textContent.trim();
        elements.promptInput.focus();
      });
    });

  elements.mobileCode?.addEventListener('click', () => elements.codeTab?.click());
  elements.mobilePreview?.addEventListener('click', () => elements.previewTab?.click());
  elements.mobileChat?.addEventListener('click', openChatDrawer);

  elements.toggleChatMobile?.addEventListener('click', openChatDrawer);
  elements.closeChatMobile?.addEventListener('click', closeChatDrawer);
  elements.chatOverlay?.addEventListener('click', closeChatDrawer);

  window.addEventListener('keydown', handleShortcuts);
}

function initialize() {
  initTheme();
  if (elements.themeToggle) {
    elements.themeToggle.textContent = state.currentTheme === 'dark' ? '🌙' : '☀️';
  }
  setupApiKeyModal();
  initEditor().catch((error) => console.error('Erro ao iniciar editor', error));
  bindEvents();

  elements.promptInput.placeholder =
    'Ex.: Landing page de startup com hero, grid de features e formulário';
  setTimeout(() => elements.promptInput.focus(), 0);
}

initialize();
