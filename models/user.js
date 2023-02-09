const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  device: { type: String, required: true },
  last_activity: { type: Date, default: Date.now },
  user_status: { type: Boolean, required: true, default: true },
});

setPassword = function (salt, password) {
  // Username is supplied as Salt to create unique hash
  let hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return hash;
};

validatePassword = function (salt, password, old_hash) {
  // Username is supplied as Salt to create unique hash
  var hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return old_hash === hash; // Compare and return true or false based on the user data
};

const users = mongoose.model("users", userSchema);

module.exports = users;
