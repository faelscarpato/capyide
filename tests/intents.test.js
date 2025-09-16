import { isEditIntent, isGenerateIntent } from '../js/shared/intents.js';

describe('intent heuristics', () => {
  test('detects generation intent keywords', () => {
    expect(isGenerateIntent('Quero gerar um site moderno em HTML.')).toBe(true);
    expect(isGenerateIntent('build a dashboard')).toBe(true);
    expect(isGenerateIntent('Preciso de ajuda')).toBe(false);
  });

  test('detects edit intent keywords', () => {
    expect(isEditIntent('adicione um botão de contato')).toBe(true);
    expect(isEditIntent('remova a seção de preços')).toBe(true);
    expect(isEditIntent('explique como funciona')).toBe(false);
  });
});
