import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido. Use POST." });
  }

  try {
    const { text, voice = "UZ8QqWVrz7tMdxiglcLh" } = req.body; // Livia como padrão
    if (!text) {
      return res.status(400).json({ error: "O campo 'text' é obrigatório." });
    }

    const ELEVEN_API_KEY = process.env.ELEVENLABS_API_KEY;

    const response = await axios.post(
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
    return res.send(response.data);

  } catch (error) {
    console.error(error?.response?.data || error.message);
    return res.status(500).json({ error: "Erro ao gerar voz com ElevenLabs." });
  }
}
