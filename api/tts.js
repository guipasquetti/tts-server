// api/tts.js
import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ELEVEN_API_KEY = process.env.ELEVENLABS_API_KEY;
  const { text, voice = "UZ8QqWVrz7tMdxiglcLh" } = req.body || {};

  if (!text) return res.status(400).json({ error: "O campo 'text' é obrigatório" });

  try {
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
    res.status(200).send(Buffer.from(r.data));
  } catch (e) {
    console.error(e?.response?.data || e.message);
    res.status(e?.response?.status || 500).json(e?.response?.data || { error: e.message });
  }
}
