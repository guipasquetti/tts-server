import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const ELEVEN_API_KEY = process.env.ELEVENLABS_API_KEY;

// rota principal
app.get("/", (req, res) => {
  res.send("🚀 Servidor TTS rodando com ElevenLabs");
});

// rota de TTS
app.post("/tts", async (req, res) => {
  try {
    const { text, voice } = req.body;

    if (!text) {
      return res.status(400).json({ error: "O campo 'text' é obrigatório" });
    }

    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice || "UZ8QqWVrz7tMdxiglcLh"}`,
      {
        text,
        model_id: "eleven_monolingual_v1"
      },
      {
        headers: {
          "xi-api-key": ELEVEN_API_KEY,
          "Content-Type": "application/json"
        },
        responseType: "arraybuffer"
      }
    );

    res.setHeader("Content-Type", "audio/mpeg");
    res.send(response.data);

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Erro ao gerar voz" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});
