const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function askAI(question, context) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY não está definida no arquivo .env");
  }

  const prompt = `Você é um assistente que responde perguntas com base exclusivamente no texto fornecido abaixo.

Regras:
- Responda SOMENTE com base no texto abaixo.
- Se a resposta não estiver no texto, diga exatamente: "Não encontrei essa informação no texto fornecido."
- Seja objetivo e claro.
- Responda em português.

TEXTO DE REFERÊNCIA:
${context}

PERGUNTA DO USUÁRIO:
${question}

RESPOSTA:`;

  try {
    const response = await openai.responses.create({
      model: "gpt-5-nano",
      input: prompt,
      max_output_tokens: 1000,
    });

    return response.output_text; // ✅ forma correta e segura
  } catch (error) {
    if (error.status === 401) {
      throw new Error("Chave da API inválida. Verifique o OPENAI_API_KEY no .env");
    }
    if (error.status === 429) {
      throw new Error("Limite de requisições atingido. Aguarde um momento.");
    }
    if (error.status === 404) {
      throw new Error("Modelo não encontrado.");
    }

    throw new Error(`Erro da OpenAI: ${error.message}`);
  }
}

module.exports = { askAI };