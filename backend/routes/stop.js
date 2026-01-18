import express from "express";
import { getSession } from "../services/interviewSession.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { session_id } = req.body;

    if (!session_id) {
      return res.status(400).json({ error: "session_id is required" });
    }

    const session = getSession(session_id);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // In a production app, you might want to save the session data to a database here
    // For now, we'll just confirm the stop
    
    res.json({
      message: "Interview session stopped successfully",
      session_id: session_id,
      status: "stopped"
    });

  } catch (error) {
    console.error("Stop Error:", error);
    res.status(500).json({ error: "Failed to stop interview" });
  }
});

export default router;