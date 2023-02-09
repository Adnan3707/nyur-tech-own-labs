const mongoose = require("mongoose");
const { Schema } = mongoose;

const TokenSchema = new Schema({
  email: { type: String, required: true },
  token_type: { type: String, required: true },
  token: { type: String, required: true },
  token_expiry: { type: String, required: true },
  token_status: { type: String, required: true },
  device_fingerprint: { type: String, required: false },
});

const tokens = mongoose.model("tokens", TokenSchema);

module.exports = tokens;
