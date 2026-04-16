const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { askAI } = require("./ai");

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

let storedText = "";

// Health check — útil para debugar
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    hasText: storedText.length > 0,
    textLength: storedText.length,
    apiKeyConfigured: !!process.env.OPENAI_API_KEY,
  });
});

// Upload do texto copiado
app.post("/upload-text", (req, res) => {
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: "Texto é obrigatório" });
  }

  storedText = text.trim();
  console.log(`Texto armazenado: ${storedText.length} caracteres`);
  res.json({ message: "Texto armazenado com sucesso!", length: storedText.length });
});

// Fazer pergunta
app.post("/ask", async (req, res) => {
  const { question } = req.body;

  if (!question || !question.trim()) {
    return res.status(400).json({ error: "Pergunta é obrigatória" });
  }

  if (!storedText) {
    return res.status(400).json({ error: "Nenhum texto foi enviado ainda. Volte e envie o texto primeiro." });
  }

  try {
    console.log(`Pergunta recebida: "${question}"`);
    const answer = await askAI(question.trim(), storedText);
    console.log("Resposta gerada com sucesso.");
    res.json({ answer });
  } catch (error) {
    console.error("Erro ao consultar IA:", error.message);
    // Retorna o erro real para o frontend, facilitando diagnóstico
    res.status(500).json({ error: error.message || "Erro ao consultar a IA" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n✅ Servidor rodando em http://localhost:${PORT}`);
  console.log(`🔑 API Key configurada: ${!!process.env.OPENAI_API_KEY}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health\n`);
});
