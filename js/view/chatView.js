import { elements } from './domElements.js';

const ROLE_LABEL = {
  user: 'Você',
  assistant: 'CapyIA',
  system: 'Sistema',
};

function sanitizeText(text) {
  const div = document.createElement('div');
  div.textContent = text ?? '';
  return div.innerHTML;
}

export function renderChatMessage(role, content, options = {}) {
  if (!elements.chatMessages) return;
  const tone = options.tone || 'default';
  const container = document.createElement('div');
  const toneClasses = {
    default: 'bg-white/5',
    success: 'bg-emerald-500/15 border border-emerald-400/40',
    error: 'bg-rose-500/10 border border-rose-400/40',
    info: 'bg-sky-500/10 border border-sky-400/40',
  };

  const baseClass = role === 'user' ? 'bg-white/10 border border-white/10' : toneClasses[tone] || toneClasses.default;

  container.className = `p-3 rounded-lg text-sm flex flex-col gap-1 ${baseClass}`;
  container.innerHTML = `
    <div class="font-semibold text-xs uppercase tracking-wide opacity-80">
      ${ROLE_LABEL[role] || 'CapyIDE'}
    </div>
    <div class="leading-relaxed">${sanitizeText(content)}</div>
  `;

  elements.chatMessages.appendChild(container);
  elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

export function openChatDrawerView() {
  elements.chatPanel?.classList.remove('-translate-x-full');
  elements.chatOverlay?.classList.remove('hidden');
  focusChatInput();
}

export function closeChatDrawerView() {
  elements.chatPanel?.classList.add('-translate-x-full');
  elements.chatOverlay?.classList.add('hidden');
}

export function focusChatInput() {
  if (elements.chatInput) {
    elements.chatInput.focus();
  }
}

export function clearChatInput() {
  if (elements.chatInput) {
    elements.chatInput.value = '';
  }
}
