import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const ELEVEN_API_KEY = process.env.ELEVENLABS_API_KEY;

app.get("/", (_req, res) => {
  res.send("🚀 Servidor TTS rodando com ElevenLabs");
});

app.post("/tts", async (req, res) => {
  try {
    const { text, voice = "UZ8QqWVrz7tMdxiglcLh" } = req.body;
    if (!text) return res.status(400).json({ error: "O campo 'text' é obrigatório" });

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
        responseType: "arraybuffer"
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
