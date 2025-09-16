const VOID_TAGS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

export function sanitizeText(text) {
  const div = document.createElement('div');
  div.textContent = text ?? '';
  return div.innerHTML;
}

export function toast(message) {
  const el = document.createElement('div');
  el.className =
    'fixed bottom-16 right-4 bg-zinc-800 text-white text-sm px-4 py-2 rounded shadow-lg border border-zinc-700 z-[70]';
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2200);
}

export function isFullHtml(doc) {
  if (!doc) return false;
  return /<!doctype/i.test(doc) || /<\s*html[\s>]/i.test(doc);
}

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

export function formatHtml(code) {
  if (!code) return '';

  const preserved = {};
  let index = 0;
  const placeholder = (match) => {
    const key = `__PRESERVE_${index++}__`;
    preserved[key] = match;
    return `\n${key}\n`;
  };

  let working = code.replace(/<(pre|code)[^>]*>[\s\S]*?<\/\1>/gi, placeholder);

  const lines = working
    .replace(/>\s*</g, '>\n<')
    .replace(/-->\s*/g, '-->\n')
    .replace(/\s*\n\s*/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter((line, idx, arr) => line.length > 0 || arr[idx - 1]?.length > 0);

  let indentLevel = 0;
  const formattedLines = lines.map((line) => {
    if (!line) return '';

    const isClosingTag = /^<\//.test(line) || /^-->/i.test(line);
    const isSelfClosing = /\/>$/.test(line);
    const tagMatch = line.match(/^<\/?([a-zA-Z0-9-]+)/);
    const tagName = tagMatch ? tagMatch[1].toLowerCase() : null;
    const isVoidTag = tagName ? VOID_TAGS.has(tagName) : false;
    const isStandalone =
      isSelfClosing ||
      isVoidTag ||
      /^<!/.test(line) ||
      /^<\?/.test(line) ||
      /^<!--/.test(line) ||
      /-->$/.test(line);

    if (isClosingTag && !isStandalone) {
      indentLevel = Math.max(indentLevel - 1, 0);
    }

    const currentIndent = '  '.repeat(Math.max(indentLevel, 0));
    let output = `${currentIndent}${line}`;

    const isOpeningTag = /^<[^/!][^>]*>/.test(line);
    const isBalancedTag = isOpeningTag && /<\/[^>]+>\s*$/.test(line);

    if (isOpeningTag && !isStandalone && !isBalancedTag) {
      indentLevel += 1;
    }

    if (isClosingTag && isStandalone) {
      indentLevel = Math.max(indentLevel, 0);
    }

    return output;
  });

  let result = formattedLines
    .filter((line, idx, arr) => line.length > 0 || arr[idx - 1]?.length > 0)
    .join('\n');

  Object.entries(preserved).forEach(([key, block]) => {
    result = result.replace(key, block);
  });

  return result.trim();
}
