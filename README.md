# CapyIDE

CapyIDE é um editor de código online assistido por IA focado na prototipação rápida de páginas web. A aplicação utiliza o Monaco Editor (com fallback para um `<textarea>` simples) para edição, oferece pré-visualização em tempo real do HTML e integra-se ao modelo Google Gemini para gerar ou editar código a partir de descrições em linguagem natural.

## Principais recursos

- **Geração guiada por IA** – descreva o projeto desejado em português e receba um HTML completo com CSS/JS embutidos.
- **Edição iterativa** – utilize o chat para solicitar ajustes no código atual. O CapyIDE decide automaticamente quando deve gerar uma nova versão ou editar a existente.
- **Pré-visualização instantânea** – o iframe de preview é atualizado a cada alteração no código, permitindo validar rapidamente o resultado.
- **Fallback resiliente** – caso o Monaco Editor não esteja disponível, um editor básico é ativado automaticamente para garantir continuidade.
- **Atalhos e utilidades** – suporte a copiar, baixar, formatar código e alternar o tema (claro/escuro) diretamente da interface.

## Como executar

1. Faça o download do repositório e abra a pasta `capyide` em um servidor estático (por exemplo, utilizando a extensão Live Server do VSCode ou `python -m http.server`).
2. Acesse `index.html` pelo navegador moderno de sua preferência.
3. Na primeira execução a aplicação solicitará a chave da API do Google AI Studio:
   - Crie uma chave em [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey).
   - Informe a chave no modal exibido e clique em **Salvar**. O token é validado antes de ser armazenado no `localStorage`.
4. Com a chave configurada, descreva o projeto desejado no campo principal da tela inicial e clique em **Gerar código**.

> **Dica:** para uso contínuo, a chave da API e o último código gerado são salvos automaticamente no navegador.

## Estrutura do código

A refatoração atual dividiu a lógica JavaScript em módulos ES6 localizados na pasta `js/`:

- `app.js` – ponto de entrada que inicializa tema, editor, eventos e integra os demais módulos.
- `apiKey.js` – gerenciamento do modal de configuração e validação da chave da API.
- `ai.js` – chamadas à API do Gemini e pós-processamento das respostas.
- `chat.js` – renderização das mensagens e orquestração das interações com a IA.
- `editor.js` – inicialização do Monaco Editor, fallback, auto-save e atualização da pré-visualização.
- `elements.js` – referências centralizadas aos elementos da interface.
- `state.js` – estado compartilhado e utilitários de persistência em `localStorage`.
- `theme.js` – aplicação e alternância do tema visual.
- `tests.js` – verificações rápidas executadas após a geração de código.
- `utils.js` – funções auxiliares (sanitização de texto, toasts, heurísticas de intenção e formatação HTML).

Essa separação reduz o acoplamento, facilita testes futuros e torna mais simples identificar responsabilidades dentro do projeto.

## Formatação de código

O botão **Formatar** utiliza a função `formatHtml` (em `utils.js`) para identar o HTML em uma única passada, preservando blocos críticos como `<pre>` e `<code>`. A nova implementação evita a duplicação que existia anteriormente e melhora o desempenho em documentos longos.

## Fluxo geral

1. O usuário descreve uma página e solicita a geração.
2. O módulo `ai.js` envia o prompt ao Gemini e a resposta é convertida em HTML com `extractCode`.
3. `editor.js` insere o código no Monaco (ou fallback), aciona o auto-save e atualiza o preview.
4. O chat (`chat.js`) mantém o histórico e permite novas interações para edições ou explicações.

## Desenvolvimento e contribuições

- Para alterar estilos ou o layout, edite diretamente o `index.html` (Tailwind é carregado via CDN).
- Ajustes na lógica devem ser feitos nos módulos correspondentes descritos acima.
- Sugestões e melhorias são bem-vindas! Abra uma issue ou envie um pull request descrevendo claramente a alteração proposta.

## Licença

Este projeto é distribuído sob a licença MIT. Consulte o arquivo `LICENSE` (caso presente) ou adicione a licença de sua preferência antes de redistribuir.
