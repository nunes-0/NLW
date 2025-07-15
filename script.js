let key = document.getElementById('chave');
let games = document.getElementById('gameselect');
let perg = document.getElementById('questao');
let btt = document.getElementById('bperguntar');
let res = document.getElementById('res');

//  AIzaSyCyuJgRy60NT_ukruwfF6aclsyEOdGuyUA
// Corrigido: definição de função faltava parênteses
function converter(text) {
  res.innerHTML = text;
  let converter = new showdown.Converter();
  let html = converter.makeHtml(text);
  res.innerHTML = html;
}

// Função principal com correção de chaves e estrutura
async function perguntarAI(question, game, apikey) {
  try {
    let model = "gemini-2.5-flash";
    let geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apikey}`;

    let pergunta = ` 
    ## ESpecialidade
    Voce é um especialista assistente de meta para o jogo ${game}

    ## Tarefa 
    voce deve responder as perguntas do usuario com base no seu conhecimento do jogo , estratégias , build e dicas 

    ## Regras
    - Se voce não sabe a resposta , responda com 'Não sei ' e não tente inventar uma resposta
    - Se a pergunta não esta relacionada ao jogo , responda com 'Essa pergunta não esta relacionada ao jogo' 
    - considere  a data atual ${new Date().toLocaleDateString()}
    - faça pesquisas atualizadas sobre o patch atual , baseado na data , para dar uma resposta coerente 
    - não responda itens que voce não tenha certeza de que existe no patch atual.
    - quero que o modelo de resposta esteja de acordo com os exemplos em modelo de lista , ul e li 

    ## Resposta 
    - Economize na resposta , seja direto e responda no maximo 500 caracteres
    - Responda em markdown
    - Não precisa fazer nenhuma saudação ou despedida , apenas responda o que o usuário está querendo

    ## Exemplo de resposta
    pergunta do usuário: Melhor build rengar jungle
    resposta: A build mais atual é: \n\n **Itens:**\n\ coloque os itens aqui.\n\exemplos de runas\n\n

    ----

    aqui esta a pergunta ${question}
    `;

    let contents = [{
      role: "user",
      parts: [{
        text: pergunta
      }]
    }];

    let tools = [
      { google_search: {} }
    ];

    // chamada API 
    let response = await fetch(geminiURL, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        contents,
        tools
      })
    });

    let data = await response.json();

    // Extrair resposta em Markdown
    let markdown = data.candidates?.[0]?.content?.parts?.[0]?.text || "Não consegui responder.";

    // Converter markdown para HTML com showdown
    let converter = new showdown.Converter();
    let html = converter.makeHtml(markdown);

    return html;
  } catch (error) {
    console.error("Erro na API:", error);
    return "<p><strong>Erro ao gerar resposta.</strong></p>";
  }
}

async function perguntar(event) {
  event.preventDefault();

  let apikey = key.value.trim();
  let game = games.value.trim();
  let question = perg.value.trim();

  if (apikey == '' || game == '' || question == '') {
    return window.alert('[ERRO] Campo em branco, reveja as informações');
  } else {
    btt.disabled = true;
    btt.textContent = 'Perguntando...';
    btt.classList.add('loading');

    try {
      // perguntar para IA
      let text = await perguntarAI(question, game, apikey);
      res.innerHTML = text;
      res.classList.remove('hidden'); 
    } catch (error) {
      console.log('Erro:', error);
      res.innerHTML = "Erro ao responder à pergunta";
    } finally {
      btt.disabled = false;
      btt.textContent = "Perguntar";
      btt.classList.remove('loading');
    }
  }
}
