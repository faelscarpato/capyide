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

A refatoração atual organiza a pasta `js/` em camadas inspiradas em MVC:

- `controller/` – orquestração da interface. Destaque para `appController.js` (entrada principal), `chatController.js` (detecção de intenção e envio de prompts), `apiKeyController.js` (modal da chave) e `systemTestController.js` (testes rápidos exibidos no chat).
- `model/` – estado reativo compartilhado (`appState.js`) com persistência segura em `localStorage` quando disponível.
- `services/` – integração com serviços externos e utilidades de domínio (`aiService.js`, `apiKeyService.js`, `themeService.js`).
- `view/` – componentes de interface (elementos DOM, editor Monaco, notificações, chat view) desacoplados da lógica.
- `shared/` – funções puramente utilitárias reutilizadas em múltiplas camadas (ex.: `html.js` com `formatHtml`, `intents.js` com heurísticas de intenção).

Essa separação reduz o acoplamento entre UI e negócio, facilita testes automatizados e deixa mais claro onde cada responsabilidade vive.

## Formatação de código

O botão **Formatar** utiliza a função `formatHtml` (em `js/shared/html.js`) para identar o HTML em uma única passada, preservando blocos críticos como `<pre>`, `<script>` e `<style>`. A nova implementação evita a duplicação que existia anteriormente e melhora o desempenho em documentos longos.

## Fluxo geral

1. O usuário descreve uma página e solicita a geração.
2. `aiService.js` envia o prompt ao Gemini e a resposta é convertida em HTML com `extractCode`.
3. `editorView.js` insere o código no Monaco (ou fallback), aciona o auto-save e atualiza o preview.
4. O chat (`chatController.js` + `chatView.js`) mantém o histórico e permite novas interações para edições ou explicações.

## Testes automatizados

Instale as dependências (`npm install`) e execute `npm test` para rodar os testes unitários (Jest). Eles validam as heurísticas de intenção, a formatação de HTML e o pós-processamento das respostas da IA.

## Desenvolvimento e contribuições

- Para alterar estilos ou o layout, edite diretamente o `index.html` (Tailwind é carregado via CDN).
- Ajustes na lógica devem ser feitos nos módulos correspondentes descritos acima.
- Sugestões e melhorias são bem-vindas! Abra uma issue ou envie um pull request descrevendo claramente a alteração proposta.

## Licença

Este projeto é distribuído sob a licença MIT. Consulte o arquivo `LICENSE` (caso presente) ou adicione a licença de sua preferência antes de redistribuir.
