export function isGenerateIntent(text) {
  const t = (text || '').toLowerCase();
  const keywords = [
    'gera',
    'gerar',
    'cria',
    'criar',
    'constroi',
    'constrói',
    'build',
    'generate',
    'faça um',
    'faça uma',
    'html',
    '<html',
    '<!doctype',
    '```html',
  ];
  return keywords.some((k) => t.includes(k));
}

export function isEditIntent(text) {
  const t = (text || '').toLowerCase();
  const keywords = [
    'altere',
    'mude',
    'modifique',
    'ajuste',
    'adicione',
    'remova',
    'troque',
    'refatore',
    'melhore',
    'continue',
    'implemente',
    'coloque',
    'tirar',
    'inserir',
  ];
  return keywords.some((k) => t.includes(k));
}
