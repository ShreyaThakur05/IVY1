import express from "express";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY
      }
    });
    const voices = await response.json();
    res.json(voices);
  } catch (error) {
    console.error("Voices Error:", error);
    res.status(500).json({ error: "Failed to fetch voices" });
  }
});

export default router;