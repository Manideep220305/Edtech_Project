const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: String,
  text: String,
  createdAt: { type: Date, default: Date.now },
});

// Fix: only define the model if it doesn't already exist
const Message = mongoose.models.Message || mongoose.model("Message", messageSchema);

module.exports = Message;
