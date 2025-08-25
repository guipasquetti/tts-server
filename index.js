import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const ELEVEN_API_KEY = process.env.ELEVENLABS_API_KEY;

function currentTs() {
  return new Date().toISOString();
}

app.get("/", (_req, res) => {
  res.send("🚀 Servidor TTS rodando com ElevenLabs (/tts via POST, /selftest via GET)");
});

// GET de auto-teste para facilitar debug no browser/cURL:
// /selftest?text=olá&voice=UZ8QqWVrz7tMdxiglcLh
app.get("/selftest", async (req, res) => {
  try {
    const text = req.query.text || "Teste de voz do servidor.";
    const voice = req.query.voice || "UZ8QqWVrz7tMdxiglcLh";

    console.log(`[${currentTs()}] /selftest -> text="${text}", voice="${voice}"`);

    const r = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice}`,
      {
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.4, similarity_boost: 0.85 }
      },
      {
        headers: {
          "xi-api-key": ELEVEN_API_KEY,
          "Content-Type": "application/json",
          "Accept": "audio/mpeg"
        },
        responseType: "arraybuffer",
        timeout: 30000
      }
    );

    res.setHeader("Content-Type", "audio/mpeg");
    res.send(r.data);
  } catch (e) {
    const status = e?.response?.status;
    const data = e?.response?.data;
    console.error(`[${currentTs()}] /selftest ERROR`, status, data || e.message);
    res.status(500).json({ error: "Erro ao gerar voz", status, detail: data || e.message });
  }
});

// POST normal usado pelo iOS
app.post("/tts", async (req, res) => {
  try {
    const { text, voice = "UZ8QqWVrz7tMdxiglcLh", format = "mp3" } = req.body || {};
    if (!text) return res.status(400).json({ error: "O campo 'text' é obrigatório" });

    console.log(
      `[${currentTs()}] /tts -> textLen=${text.length}, voice=${voice}, fmt=${format}`
    );

    const r = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice}`,
      {
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.4, similarity_boost: 0.85 }
      },
      {
        headers: {
          "xi-api-key": ELEVEN_API_KEY,
          "Content-Type": "application/json",
          "Accept": "audio/mpeg"
        },
        responseType: "arraybuffer",
        timeout: 30000
      }
    );

    res.setHeader("Content-Type", "audio/mpeg");
    res.send(r.data);
  } catch (e) {
    const status = e?.response?.status;
    const data = e?.response?.data;
    console.error(`[${currentTs()}] /tts ERROR`, status, data || e.message);
    res.status(500).json({ error: "Erro ao gerar voz", status, detail: data || e.message });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});
