const mongoose = require("mongoose");
const crypto = require("crypto");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["USER", "ADMINISTRATOR"],
      default: "USER",
    },
    device_id: { type: String, required: true },
    last_activity: { type: Date, default: Date.now },
    user_status: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

function setPassword(salt, password) {
  let hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return hash;
}

function validatePassword(salt, password, old_hash) {
  // Username is supplied as Salt to create unique hash
  var hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return old_hash === hash; // Compare and return true or false based on the user data
}

const users = mongoose.model("users", userSchema);

module.exports = users;
module.exports.setPassword = setPassword;
module.exports.validatePassword = validatePassword;
