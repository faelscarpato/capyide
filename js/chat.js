import { elements } from './elements.js';
import { callGemini, extractCode } from './ai.js';
import { getEditorValue, setEditorValue } from './editor.js';
import { state, setLastGen } from './state.js';
import { isEditIntent, isGenerateIntent, sanitizeText } from './utils.js';

export function addChatMessage(role, content) {
  if (!elements.chatMessages) return;
  const container = document.createElement('div');
  container.className = `p-3 rounded-lg ${role === 'user' ? 'bg-white/10' : 'bg-white/5'}`;
  container.innerHTML = `
    <div class="font-semibold text-sm mb-1">${role === 'user' ? 'Você' : 'CapyIA'}</div>
    <div class="text-sm">${sanitizeText(content)}</div>
  `;
  elements.chatMessages.appendChild(container);
  elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

export async function handleChatMessage(message) {
  if (state.lastGen.code && isEditIntent(message)) {
   const editInstruction = `Você vai EDITAR um HTML completo existente.
Gere APENAS o HTML COMPLETO atualizado, sem nenhum texto explicativo ou instruções.
--- HTML ATUAL: ${getEditorValue()} ---
INSTRUÇÕES DO USUÁRIO: ${message} ---
Regras: mantenha a estrutura válida (<html>...), preserve o que não foi citado, tema dark e responsivo.`;


    const response = await callGemini(editInstruction, true);
    if (typeof response === 'string' && response.startsWith('ERRO::')) {
      addChatMessage('assistant', `Falhou ao editar: ${response.replace('ERRO::', '')}`);
      return;
    }

    const newCode = extractCode(response);
    setEditorValue(newCode);
    setLastGen({ prompt: `${state.lastGen.prompt}\n[edição] ${message}`, code: newCode });
    addChatMessage('assistant', 'Edição aplicada ao código no editor.');
    elements.codeTab?.click();
    return;
  }

  if (isGenerateIntent(message)) {
    const response = await callGemini(message, true);
    if (typeof response === 'string' && response.startsWith('ERRO::')) {
      addChatMessage('assistant', `Falhou ao gerar código: ${response.replace('ERRO::', '')}`);
      return;
    }

    const code = extractCode(response);
    setEditorValue(code);
    setLastGen({ prompt: message, code });
    addChatMessage('assistant', 'Código gerado e enviado ao editor.');
    elements.codeTab?.click();
    return;
  }

  const contextPrompt = `Contexto: Projeto web HTML/CSS/JS. Pergunta: ${message}  Responda objetivo, focando em melhorias. Não gere código inteiro salvo pedido.`;
  const response = await callGemini(contextPrompt, false);
  addChatMessage('assistant', response);
}

export function openChatDrawer() {
  elements.chatPanel?.classList.remove('-translate-x-full');
  elements.chatOverlay?.classList.remove('hidden');
  elements.chatInput?.focus();
}

export function closeChatDrawer() {
  elements.chatPanel?.classList.add('-translate-x-full');
  elements.chatOverlay?.classList.add('hidden');
}
