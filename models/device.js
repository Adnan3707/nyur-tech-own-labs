const mongoose = require("mongoose");
const { Schema } = mongoose;

const deviceSchema = new Schema(
  {
    email: { type: String, required: true },
    device_id: { type: String, required: true },
  },
  { timestamps: true }
);

const devices = mongoose.model("devices", deviceSchema);

module.exports = devices;
