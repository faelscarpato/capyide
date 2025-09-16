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

const PRESERVE_TAGS = ['pre', 'code', 'textarea', 'script', 'style'];

export function isFullHtml(doc) {
  if (!doc) return false;
  return /<!doctype/i.test(doc) || /<\s*html[\s>]/i.test(doc);
}

function preserveBlocks(code) {
  const preserved = new Map();
  let index = 0;

  const pattern = new RegExp(
    `<(${PRESERVE_TAGS.join('|')})(?:[^>]*)>[\\s\\S]*?<\\/\\1>`,
    'gi'
  );

  const working = code.replace(pattern, (match) => {
    const key = `__PRESERVE_${index++}__`;
    preserved.set(key, match.trim());
    return `\n${key}\n`;
  });

  return { working, preserved };
}

function restoreBlocks(formatted, preserved) {
  let result = formatted;

  preserved.forEach((block, key) => {
    const regex = new RegExp(`^([ \t]*)${key}$`, 'gm');
    result = result.replace(regex, (_, indent) => {
      return block
        .split('\n')
        .map((line) => `${indent}${line}`)
        .join('\n');
    });
  });

  return result;
}

function normalizeHtmlInput(code) {
  return code
    .replace(/>\s*(?=<)/g, '>\n')
    .replace(/<!--/g, '\n<!--')
    .replace(/-->/g, '-->\n')
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter((line, idx, arr) => line.length > 0 || arr[idx - 1]?.length > 0);
}

function shouldDecreaseIndent(line) {
  return /^<\//.test(line) || /^-->/i.test(line);
}

function isStandaloneTag(line, tagName) {
  if (/\/>$/.test(line)) return true;
  if (!tagName) return false;
  if (VOID_TAGS.has(tagName)) return true;
  if (/^<!/.test(line) || /^<\?/.test(line)) return true;
  if (/^<!--/.test(line)) return true;
  if (/-->$/.test(line)) return true;
  if (/^<\s*\w[^>]*\sdata-inline/.test(line)) return true;
  return false;
}

export function formatHtml(code) {
  if (!code) return '';

  const { working, preserved } = preserveBlocks(code);
  const tokens = normalizeHtmlInput(working);

  let indentLevel = 0;
  const formatted = tokens.map((token) => {
    if (!token) return '';

    const placeholderMatch = token.match(/^__PRESERVE_\d+__$/);
    const tagMatch = token.match(/^<\/?([a-zA-Z0-9-]+)/);
    const tagName = tagMatch ? tagMatch[1].toLowerCase() : null;
    const decreaseBefore = shouldDecreaseIndent(token) && !isStandaloneTag(token, tagName);

    if (decreaseBefore) {
      indentLevel = Math.max(indentLevel - 1, 0);
    }

    const indent = '  '.repeat(indentLevel);
    let line = `${indent}${token}`;

    if (placeholderMatch) {
      // keep indent, real content will be restored later
      return line;
    }

    const isOpening = /^<[^/!][^>]*>/.test(token);
    const isBalanced = isOpening && /<\/[^>]+>\s*$/.test(token);
    const standalone = isStandaloneTag(token, tagName);

    if (isOpening && !standalone && !isBalanced) {
      indentLevel += 1;
    }

    if (shouldDecreaseIndent(token) && standalone) {
      indentLevel = Math.max(indentLevel, 0);
    }

    if (!isOpening && !shouldDecreaseIndent(token) && !placeholderMatch && !standalone && tagName && !VOID_TAGS.has(tagName)) {
      indentLevel = Math.max(indentLevel, 0);
    }

    if (isBalanced && !standalone) {
      // keep indent level stable for inline paired tags
    }

    return line;
  });

  const joined = formatted
    .filter((line, idx, arr) => line.trim().length > 0 || arr[idx - 1]?.trim().length > 0)
    .join('\n')
    .replace(/\n{3,}/g, '\n\n');

  const restored = restoreBlocks(joined, preserved);
  return restored.trim();
}
