import { state } from '../model/appState.js';
import { isFullHtml } from '../shared/html.js';

export async function callGemini(prompt, isCodeGeneration = false) {
  if (!state.apiKey) {
    return 'ERRO::API_KEY_NAO_CONFIGURADA';
  }

  const systemInstruction = isCodeGeneration
    ? 'Você gera APENAS código. Não use markdown. Não explique. Entregue um documento único HTML completo quando possível.'
    : 'Você é um assistente técnico. Responda em texto simples. Sem HTML.';

  const userText = isCodeGeneration
    ? `Crie um código SOMENTE em HTML completo e funcional para: ${prompt}\n\nRequisitos:\n- Sem markdown\n- CSS no <style> e JS em <script>\n- Layout responsivo e dark\n- Evite comentários longos\n- Use a fonte Inter (Google Fonts)\n- Nenhum texto fora do HTML`
    : `Contexto: Estou trabalhando em um projeto web (HTML/CSS/JS).\nPergunta: ${prompt}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${state.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: {
            temperature: isCodeGeneration ? 0.4 : 0.6,
            topK: 40,
            topP: 0.9,
            candidateCount: 1,
            maxOutputTokens: 4096,
            responseMimeType: 'text/plain',
          },
          contents: [{ parts: [{ text: userText }] }],
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || 'Erro desconhecido');
    }

    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } catch (error) {
    console.error('Erro na API:', error);
    return `ERRO::${error.message}`;
  }
}

export function extractCode(response) {
  if (!response) return '';
  if (typeof response === 'string' && response.startsWith('ERRO::')) return response;

  let code = response.replace(/```[a-zA-Z]*\n?|```/g, '');
  if (isFullHtml(code)) {
    return code.trim();
  }

  return (
    `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/>` +
    `<meta name="viewport" content="width=device-width, initial-scale=1.0"/>` +
    `<title>Projeto CapyIDE</title>` +
    `<style>body{font-family:Inter,system-ui,Arial;margin:0;padding:24px;background:#0b0b0b;color:#e5e7eb}</style>` +
    `</head><body>${code}</body></html>`
  ).trim();
}
