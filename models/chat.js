const mongoose = require("mongoose");
const { Schema } = mongoose;

const chatSchema = new Schema({
  chat_id: { type: String, required: true },
  from: { type: String, required: true },
  message: { type: String, required: true },
  to: { type: String, required: true },
});

const chat_conversations = mongoose.model("chat_conversations", chatSchema);

module.exports = chat_conversations;
