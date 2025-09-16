import { elements } from '../view/domElements.js';
import { getEditorValue, updatePreview } from '../view/editorView.js';
import { addAssistantMessage } from './chatController.js';
import { state } from '../model/appState.js';

export async function runTests() {
  const results = [];
  results.push({ name: 'Editor disponível', pass: (!!window.monaco && !!state.editor) || state.usingFallback });

  try {
    const wasHidden = elements.previewContainer.classList.contains('hidden');
    elements.previewContainer.classList.remove('hidden');
    updatePreview();
    if (wasHidden) {
      elements.previewContainer.classList.add('hidden');
    }
    results.push({ name: 'Preview alterna', pass: true });
  } catch (error) {
    results.push({ name: 'Preview alterna', pass: false, info: error.message });
  }

  try {
    const html = getEditorValue() || '';
    const ok = /<!doctype|<\s*html[\s>]/i.test(html);
    results.push({ name: 'Editor contém HTML gerado', pass: ok });
  } catch (error) {
    results.push({ name: 'Editor contém HTML gerado', pass: false, info: error.message });
  }

  const summary = results
    .map((result) => `${result.pass ? '✅' : '❌'} ${result.name}${result.info ? ` — ${result.info}` : ''}`)
    .join('\n');

  addAssistantMessage(`Testes automáticos:\n${summary}`);
}
