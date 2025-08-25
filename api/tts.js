// api/tts.js
// Next.js API route / Vercel serverless function
// Gera áudio via ElevenLabs a partir de texto

export const config = {
  api: {
    bodyParser: true, // aceita JSON no corpo do POST
  },
};

const REQUIRED_ENVS = ["ELEVENLABS_API_KEY", "Livia_ID", "David_ID"];

function assertEnv() {
  const missing = REQUIRED_ENVS.filter((k) => !process.env[k]);
  if (missing.length) {
    throw new Error(`Missing env vars: ${missing.join(", ")}`);
  }
}

function resolveVoiceId(voice) {
  // Se vier "male" / "female", converte para os IDs do ambiente.
  if (!voice) return process.env.Livia_ID; // default feminina
  const v = String(voice).toLowerCase();
  if (v === "female") return process.env.Livia_ID;
  if (v === "male") return process.env.David_ID;
  // Caso o usuário passe um ID direto, usamos como está
  return voice;
}

function contentTypeFor(fmt) {
  return fmt === "wav" ? "audio/wav" : "audio/mpeg";
}

export default async function handler(req, res) {
  try {
    assertEnv();
  } catch (e) {
    res.status(500).json({ error: e.message });
    return;
  }

  // CORS básico p/ facilitar consumo no app (ajuste se precisar)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Método não permitido. Use POST." });
    return;
  }

  try {
    const { text, voice, format = "mp3" } = req.body || {};

    if (!text || typeof text !== "string" || !text.trim()) {
      res.status(400).json({ error: "O campo 'text' é obrigatório." });
      return;
    }

    const voiceId = resolveVoiceId(voice);
    const ct = contentTypeFor(format);

    const payload = {
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: {
        stability: 0.4,
        similarity_boost: 0.85,
      },
    };

    // Use o endpoint "stream" para menor latência; se preferir, troque para o normal
    const endpoint = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`;

    const r = await fetch(endpoint, {
      method: "POST",
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        Accept: ct, // "audio/mpeg" ou "audio/wav"
      },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      // tenta ler erro detalhado
      let errMsg = `ElevenLabs error: ${r.status}`;
      try {
        const data = await r.json();
        errMsg = data?.detail?.message || JSON.stringify(data);
      } catch (_) {}
      res.status(502).json({ error: errMsg });
      return;
    }

    const arrayBuffer = await r.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader("Content-Type", ct);
    res.setHeader("Cache-Control", "no-store");
    res.status(200).send(buffer);
  } catch (error) {
    console.error("TTS error:", error);
    res.status(500).json({ error: "Erro ao gerar voz" });
  }
}
