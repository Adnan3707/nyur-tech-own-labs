const mongoose = require("mongoose");
const { Schema } = mongoose;

const responseSchema = new Schema({
  response: { type: Object, required: true },
});

const question_response = mongoose.model("question_response", responseSchema);

module.exports = question_response;
