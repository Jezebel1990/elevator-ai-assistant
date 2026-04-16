const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const { askAI } = require("./ai");

const app = express();

// CORS (simples e funcional para local + produção)
app.use(cors({ origin: "*" }));

app.use(express.json({ limit: "2mb" }));

// Servir frontend (funciona local e no Render)
app.use(express.static(path.join(__dirname, "../frontend")));

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
  res.json({
    message: "Texto armazenado com sucesso!",
    length: storedText.length,
  });
});

// Fazer pergunta
app.post("/ask", async (req, res) => {
  const { question } = req.body;

  if (!question || !question.trim()) {
    return res.status(400).json({ error: "Pergunta é obrigatória" });
  }

  if (!storedText) {
    return res.status(400).json({
      error: "Nenhum texto foi enviado ainda. Volte e envie o texto primeiro.",
    });
  }

  try {
    console.log(`Pergunta recebida: "${question}"`);
    const answer = await askAI(question.trim(), storedText);
    console.log("Resposta gerada com sucesso.");
    res.json({ answer });
  } catch (error) {
    console.error("Erro ao consultar IA:", error.message);
    res.status(500).json({
      error: error.message || "Erro ao consultar a IA",
    });
  }
});

// Rota principal (abre o frontend)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

const PORT = process.env.PORT || 3000;

// Detecta automaticamente ambiente (Render ou local)
const BASE_URL =
  process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;

app.listen(PORT, () => {
  console.log(`\n✅ Servidor rodando em ${BASE_URL}`);
  console.log(`🔑 API Key configurada: ${!!process.env.OPENAI_API_KEY}`);
  console.log(`📋 Health check: ${BASE_URL}/health\n`);
});