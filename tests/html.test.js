import { formatHtml, isFullHtml } from '../js/shared/html.js';

describe('HTML helpers', () => {
  test('detects complete HTML documents', () => {
    expect(isFullHtml('<!DOCTYPE html><html></html>')).toBe(true);
    expect(isFullHtml('<div></div>')).toBe(false);
  });

  test('formats nested tags with consistent indentation', () => {
    const raw = '<div><section>\n<p>Olá</p><ul><li>Item</li></ul></section></div>';
    const formatted = formatHtml(raw);
    expect(formatted).toBe(
      ['<div>', '  <section>', '    <p>Olá</p>', '    <ul>', '      <li>Item</li>', '    </ul>', '  </section>', '</div>'].join('\n')
    );
  });

  test('preserves pre and script blocks without altering inner whitespace', () => {
    const raw = '<div><pre> linha 1\n   linha 2</pre><script>const x=1;\nconsole.log(x);</script></div>';
    const formatted = formatHtml(raw);
    expect(formatted).toMatch(/<pre> linha 1\n\s+linha 2<\/pre>/);
    expect(formatted).toMatch(/<script>const x=1;\n\s+console.log\(x\);<\/script>/);
  });
});
