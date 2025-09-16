export async function validateApiKey(key) {
  const keyPattern = /^[A-Za-z0-9-_]+$/;
  if (!keyPattern.test(key) || key.length < 20) {
    return { valid: false, error: 'Formato inválido da API key' };
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Test' }] }],
          generationConfig: { maxOutputTokens: 1 },
        }),
      }
    );

    if (!response.ok) {
      const data = await response.json();
      return { valid: false, error: data.error?.message || 'Erro ao validar a chave' };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: 'Erro ao conectar com a API' };
  }
}
