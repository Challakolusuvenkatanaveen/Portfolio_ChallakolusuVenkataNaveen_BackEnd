const mongoose = require("mongoose");
const { generateResponse } = require("../services/chatService");

const ChatSchema = new mongoose.Schema({
  user: { type: String, required: true, default: "guest" },
  message: { type: String, required: true },
  response: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  sessionId: { type: String, required: true },
});

const Chat = mongoose.models.Chat || mongoose.model("Chat", ChatSchema);

const chatController = {
  sendMessage: async (req, res) => {
    try {
      const { message, sessionId = "default", user = "guest" } = req.body;

      if (!message || message.trim() === "") {
        return res.status(400).json({ error: "Message is required" });
      }

      const response = await generateResponse(message);

      const chatRecord = new Chat({
        user,
        message,
        response,
        sessionId,
        timestamp: Date.now(),
      });

      await chatRecord.save();

      res.status(201).json({
        success: true,
        response,
        timestamp: chatRecord.timestamp,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to process message", details: error.message });
    }
  },

  getChatHistory: async (req, res) => {
    try {
      const { sessionId = "default", limit = 20 } = req.query;

      const chatHistory = await Chat.find({ sessionId })
        .sort({ timestamp: -1 })
        .limit(parseInt(limit));

      res.status(200).json({
        success: true,
        history: chatHistory.reverse(),
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve chat history", details: error.message });
    }
  },
};

module.exports = chatController;
