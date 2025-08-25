import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

// (opcional) CORS simples p/ testes
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

const PORT = process.env.PORT || 3000;
const ELEVEN_API_KEY = process.env.ELEVENLABS_API_KEY;

// IDs que você me passou
const VOICES = {
  female: "UZ8QqWVrz7tMdxiglcLh",
  male:   "7i7dgyCkKt4c16dLtwT3",
};

app.get("/", (_req, res) => {
  res.send("🚀 Servidor TTS rodando com ElevenLabs");
});

// handler único para /tts e /api/tts
async function ttsHandler(req, res) {
  try {
    const { text, voice, gender = "female", format = "mp3" } = req.body || {};
    if (!text) return res.status(400).json({ error: "O campo 'text' é obrigatório" });

    // escolhe a voz: se veio 'voice' usa, senão mapeia 'gender'
    const voiceId = voice || VOICES[(gender || "female").toLowerCase()] || VOICES.female;

    const r = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.4, similarity_boost: 0.85 }
      },
      {
        headers: {
          "xi-api-key": ELEVEN_API_KEY,
          "Content-Type": "application/json",
          "Accept": `audio/${format === "wav" ? "wav" : "mpeg"}`
        },
        responseType: "arraybuffer"
      }
    );

    // devolve o binário de áudio
    res.setHeader("Content-Type", format === "wav" ? "audio/wav" : "audio/mpeg");
    res.send(r.data);
  } catch (e) {
    const msg = e?.response?.data?.toString?.() || e?.message || "Erro desconhecido";
    console.error("TTS error:", msg);
    res.status(500).json({ error: "Erro ao gerar voz", detail: msg });
  }
}

app.post("/tts", ttsHandler);
app.post("/api/tts", ttsHandler); // compatível com o iOS

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});
