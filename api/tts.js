import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
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
}
