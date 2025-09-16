import { elements } from '../view/domElements.js';
import { state, setApiKey } from '../model/appState.js';
import { showToast } from '../view/notificationView.js';
import { validateApiKey } from '../services/apiKeyService.js';

function highlightApiField() {
  if (!elements.apiKeyInput) return;
  elements.apiKeyInput.classList.add('ring', 'ring-2', 'ring-emerald-400', 'animate-pulse');
  setTimeout(() => elements.apiKeyInput.classList.remove('animate-pulse'), 2400);
}

export function openApiDialog() {
  if (!elements.apiModal) return;
  elements.apiKeyInput.value = state.apiKey || '';
  elements.apiModal.classList.remove('hidden');
  setTimeout(() => elements.apiKeyInput.focus(), 50);
  highlightApiField();
}

export function closeApiDialog() {
  elements.apiModal?.classList.add('hidden');
  if (elements.apiKeyInput) {
    elements.apiKeyInput.classList.remove('ring', 'ring-2', 'ring-emerald-400', 'animate-pulse');
  }
}

export function updateApiStatus() {
  if (!elements.apiStatus) return;
  elements.apiStatus.className = state.apiKey
    ? 'inline-block w-2.5 h-2.5 bg-green-500 rounded-full'
    : 'inline-block w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse';
}

async function handleSaveClick() {
  const key = elements.apiKeyInput.value.trim();
  if (!key) {
    showToast('Informe uma chave válida');
    highlightApiField();
    return;
  }

  elements.apiModalSave.disabled = true;
  elements.apiModalSave.textContent = 'Validando...';

  const validation = await validateApiKey(key);

  elements.apiModalSave.disabled = false;
  elements.apiModalSave.textContent = 'Salvar';

  if (!validation.valid) {
    showToast(validation.error);
    highlightApiField();
    return;
  }

  setApiKey(key);
  updateApiStatus();
  showToast('Chave salva com sucesso');
  elements.apiKeyInput.classList.remove('ring-emerald-400', 'animate-pulse');
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
