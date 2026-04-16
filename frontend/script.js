const API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000"
    : window.location.origin;

// ──────────────────────────────────────────
// ENVIAR TEXTO (index.html)
// ──────────────────────────────────────────
async function sendText() {
  const text = document.getElementById("text")?.value;
  const statusEl = document.getElementById("status");
  const btn = document.getElementById("sendBtn");

  if (!text || !text.trim()) {
    showStatus(statusEl, "error", "⚠️ Por favor, cole um texto antes de enviar.");
    return;
  }

  setLoading(btn, true, "Enviando...");
  statusEl.classList.add("hidden");

  try {
    const res = await fetch(`${API_URL}/upload-text`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text.trim() }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Erro ao enviar texto");
    }

    showStatus(statusEl, "success", `✅ ${data.message} (${data.length?.toLocaleString("pt-BR")} caracteres)`);
  } catch (error) {
    if (error.message.includes("Failed to fetch")) {
      showStatus(statusEl, "error", "❌ Servidor não encontrado. Certifique-se que o backend está rodando em http://localhost:3000");
    } else {
      showStatus(statusEl, "error", `❌ ${error.message}`);
    }
  } finally {
    setLoading(btn, false, "📤 Enviar texto para IA");
  }
}

// ──────────────────────────────────────────
// FAZER PERGUNTA (ask.html)
// ──────────────────────────────────────────
async function ask() {
  const questionEl = document.getElementById("question");
  const question = questionEl?.value;
  const loadingBox = document.getElementById("loadingBox");
  const answerBox = document.getElementById("answerBox");
  const errorBox = document.getElementById("errorBox");
  const answerEl = document.getElementById("answer");
  const errorMsg = document.getElementById("errorMsg");
  const btn = document.getElementById("askBtn");

  if (!question || !question.trim()) {
    questionEl.focus();
    return;
  }

  // Limpa estado anterior
  answerBox.classList.add("hidden");
  errorBox.classList.add("hidden");
  loadingBox.classList.remove("hidden");
  setLoading(btn, true, "Consultando...");

  try {
    const res = await fetch(`${API_URL}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: question.trim() }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Erro ao consultar a IA");
    }

    answerEl.textContent = data.answer;
    answerBox.classList.remove("hidden");
  } catch (error) {
    let msg = error.message;
    if (msg.includes("Failed to fetch")) {
      msg = "Servidor não encontrado. Certifique-se que o backend está rodando em http://localhost:3000";
    }
    errorMsg.textContent = msg;
    errorBox.classList.remove("hidden");
  } finally {
    loadingBox.classList.add("hidden");
    setLoading(btn, false, "Perguntar");
  }
}

// ──────────────────────────────────────────
// VOLTAR
// ──────────────────────────────────────────
function goBack() {
  window.location.href = "./index.html";
}

// ──────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────
function setLoading(btn, isLoading, label) {
  if (!btn) return;
  btn.disabled = isLoading;
  btn.textContent = label;
}

function showStatus(el, type, message) {
  if (!el) return;
  el.className = `status ${type}`;
  el.textContent = message;
  el.classList.remove("hidden");
}
