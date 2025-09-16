import { elements } from './elements.js';
import { state, setApiKey } from './state.js';
import { toast } from './utils.js';

export function openApiDialog() {
  if (!elements.apiModal) return;
  elements.apiKeyInput.value = state.apiKey || '';
  elements.apiModal.classList.remove('hidden');
  setTimeout(() => elements.apiKeyInput.focus(), 50);
}

export function closeApiDialog() {
  elements.apiModal?.classList.add('hidden');
}

export function updateApiStatus() {
  if (!elements.apiStatus) return;
  elements.apiStatus.className = state.apiKey
    ? 'inline-block w-2.5 h-2.5 bg-green-500 rounded-full'
    : 'inline-block w-2.5 h-2.5 bg-red-500 rounded-full';
}

export async function validateApiKey(key) {
  const keyPattern = /^[A-Za-z0-9-_]+$/;
  if (!keyPattern.test(key) || key.length < 20) {
    return { valid: false, error: 'Formato inválido da API key' };
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Test' }] }],
          generationConfig: { maxOutputTokens: 1 },
        }),
      }
    );

    if (!response.ok) {
      const data = await response.json();
      return { valid: false, error: data.error?.message || 'Erro ao validar a chave' };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Erro ao conectar com a API' };
  }
}

async function handleSaveClick() {
  const key = elements.apiKeyInput.value.trim();
  if (!key) {
    toast('Informe uma chave válida');
    return;
  }

  elements.apiModalSave.disabled = true;
  elements.apiModalSave.textContent = 'Validando...';

  const validation = await validateApiKey(key);

  elements.apiModalSave.disabled = false;
  elements.apiModalSave.textContent = 'Salvar';

  if (!validation.valid) {
    toast(validation.error);
    return;
  }

  setApiKey(key);
  updateApiStatus();
  toast('Chave salva com sucesso');
  closeApiDialog();
}

export function setupApiKeyModal() {
  updateApiStatus();
  if (!state.apiKey) {
    openApiDialog();
  }

  elements.openApiModal?.addEventListener('click', openApiDialog);
  elements.openApiModalEditor?.addEventListener('click', openApiDialog);
  elements.apiModalBackdrop?.addEventListener('click', closeApiDialog);
  elements.apiModalClose?.addEventListener('click', closeApiDialog);
  elements.apiModalCancel?.addEventListener('click', closeApiDialog);
  elements.apiModalSave?.addEventListener('click', handleSaveClick);
}
