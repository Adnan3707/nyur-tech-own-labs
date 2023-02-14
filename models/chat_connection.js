const mongoose = require("mongoose");
const { Schema } = mongoose;

const connectionSchema = new Schema({
  chat_id: { type: String, required: true },
  remarks: { type: String, required: false },
  chat_status: {
    type: String,
    enum: ["INITIATED", "OPENED", "CLOSED"],
    default: "INITIATED",
  },
});

const chat_connection = mongoose.model("chat_connection", connectionSchema);

module.exports = chat_connection;
