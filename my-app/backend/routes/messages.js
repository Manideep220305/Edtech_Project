// routes/messages.js
import express from "express";
import Message from "../models/Message.js";

const router = express.Router();

// GET all messages (chat history)
router.get("/", async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    console.error("❌ Error fetching messages:", error);
    res.status(500).json({ error: "Failed to load messages" });
  }
});

export default router;
