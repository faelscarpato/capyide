import { callGemini, extractCode } from '../services/aiService.js';
import { getEditorValue, setEditorValue } from '../view/editorView.js';
import { elements } from '../view/domElements.js';
import { renderChatMessage, openChatDrawerView, closeChatDrawerView, clearChatInput } from '../view/chatView.js';
import { state, setLastGen } from '../model/appState.js';
import { isEditIntent, isGenerateIntent } from '../shared/intents.js';
import { showToast } from '../view/notificationView.js';
import { openApiDialog } from './apiKeyController.js';

function handleMissingApiKey() {
  renderChatMessage('assistant', 'Configure a chave de API para continuar. Vá em "Configurar API".', { tone: 'error' });
  showToast('Configure a chave da API para usar a IA');
  openApiDialog();
}

export async function handleChatMessage(message) {
  if (!state.apiKey) {
    handleMissingApiKey();
    return;
  }

  if (state.lastGen.code && isEditIntent(message)) {
    const editInstruction =
      `Você vai EDITAR um HTML completo existente. Gere APENAS o HTML COMPLETO atualizado (sem markdown). --- HTML ATUAL: ${getEditorValue()} --- INSTRUÇÕES DO USUÁRIO: ${message} --- Regras: mantenha estrutura válida (<html>...), preserve o que não foi citado, tema dark e responsivo.`;

    const response = await callGemini(editInstruction, true);
    if (typeof response === 'string' && response.startsWith('ERRO::')) {
      renderChatMessage('assistant', `Falhou ao editar: ${response.replace('ERRO::', '')}`, { tone: 'error' });
      return;
    }

    const newCode = extractCode(response);
    setEditorValue(newCode);
    setLastGen({ prompt: `${state.lastGen.prompt}\n[edição] ${message}`, code: newCode });
    renderChatMessage('assistant', 'Edição aplicada ao código no editor.', { tone: 'success' });
    elements.codeTab?.click();
    return;
  }

  if (isGenerateIntent(message)) {
    const response = await callGemini(message, true);
    if (typeof response === 'string' && response.startsWith('ERRO::')) {
      renderChatMessage('assistant', `Falhou ao gerar código: ${response.replace('ERRO::', '')}`, { tone: 'error' });
      return;
    }

    const code = extractCode(response);
    setEditorValue(code);
    setLastGen({ prompt: message, code });
    renderChatMessage('assistant', 'Código gerado e enviado ao editor.', { tone: 'success' });
    elements.codeTab?.click();
    return;
  }

  const contextPrompt = `Contexto: Projeto web HTML/CSS/JS. Pergunta: ${message}  Responda objetivo, focando em melhorias. Não gere código inteiro salvo pedido.`;
  const response = await callGemini(contextPrompt, false);
  renderChatMessage('assistant', response);
}

export function submitChatMessage(rawMessage) {
  const message = rawMessage.trim();
  if (!message) return;
  renderChatMessage('user', message);
  clearChatInput();
  return handleChatMessage(message);
}

export function openChatDrawer() {
  openChatDrawerView();
}

export function closeChatDrawer() {
  closeChatDrawerView();
}

export function addSystemMessage(content) {
  renderChatMessage('system', content, { tone: 'info' });
}

export function addAssistantMessage(content, tone) {
  renderChatMessage('assistant', content, tone ? { tone } : undefined);
}
