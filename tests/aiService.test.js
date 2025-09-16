import { extractCode, callGemini } from '../js/services/aiService.js';
import { state } from '../js/model/appState.js';

describe('AI service helpers', () => {
  test('returns original HTML when response already contains full document', () => {
    const response = '<!DOCTYPE html><html><body><h1>Olá</h1></body></html>';
    expect(extractCode(response)).toBe(response);
  });

  test('wraps partial snippets into full HTML skeleton', () => {
    const snippet = '<div class="card">Oi</div>';
    const result = extractCode(snippet);
    expect(result).toContain('<!DOCTYPE html>');
    expect(result).toContain('<body>');
    expect(result).toContain(snippet);
  });

  test('strips markdown fences before returning code', () => {
    const fenced = '```html\n<div>Oi</div>\n```';
    expect(extractCode(fenced)).toContain('<div>Oi</div>');
  });

  test('callGemini signals missing api key without calling network', async () => {
    const previousKey = state.apiKey;
    state.apiKey = null;
    const result = await callGemini('qualquer coisa', true);
    expect(result).toBe('ERRO::API_KEY_NAO_CONFIGURADA');
    state.apiKey = previousKey;
  });
});
