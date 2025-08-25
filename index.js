import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const ELEVEN_API_KEY = process.env.ELEVENLABS_API_KEY;

// >>> seus IDs
const VOICE_FEMALE = "UZ8QqWVrz7tMdxiglcLh"; // Livia
const VOICE_MALE   = "7i7dgyCkKt4c16dLtwT3"; // David

app.get("/", (_req, res) => {
  res.send("🚀 Servidor TTS rodando com ElevenLabs");
});

/**
 * GET /selftest?text=...&gender=female|male  (ou voice=ID)
 * Útil para testar no navegador.
 */
app.get("/selftest", async (req, res) => {
  try {
    const { text = "Teste de voz", gender, voice } = req.query;

    const voiceId =
      voice ||
      (gender === "male" ? VOICE_MALE : VOICE_FEMALE); // default: female

    const r = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.4, similarity_boost: 0.85 },
      },
      {
        headers: {
          "xi-api-key": ELEVEN_API_KEY,
          "Content-Type": "application/json",
          "Accept": "audio/mpeg",
        },
        responseType: "arraybuffer",
      }
    );

    res.setHeader("Content-Type", "audio/mpeg");
    res.send(r.data);
  } catch (e) {
    console.error(e?.response?.data || e.message);
    res.status(500).json({ error: "Erro ao gerar voz" });
  }
});

/**
 * POST /tts
 * body: { "text": "...", "voice": "VOICE_ID" (opcional), "gender": "female|male" (opcional) }
 */
app.post("/tts", async (req, res) => {
  try {
    const { text, voice, gender } = req.body;
    if (!text) return res.status(400).json({ error: "O campo 'text' é obrigatório" });

    const voiceId =
      voice ||
      (gender === "male" ? VOICE_MALE : VOICE_FEMALE); // default: female

    const r = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.4, similarity_boost: 0.85 },
      },
      {
        headers: {
          "xi-api-key": ELEVEN_API_KEY,
          "Content-Type": "application/json",
          "Accept": "audio/mpeg",
        },
        responseType: "arraybuffer",
      }
    );

    res.setHeader("Content-Type", "audio/mpeg");
    res.send(r.data);
  } catch (e) {
    console.error(e?.response?.data || e.message);
    res.status(500).json({ error: "Erro ao gerar voz" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});
