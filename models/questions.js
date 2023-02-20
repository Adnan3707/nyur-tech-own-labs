const mongoose = require("mongoose");
const { Schema } = mongoose;

const questionSchema = new Schema({
  question_no: { type: Number, unique: true, required: true },
  question: { type: String, required: true },
});

const questions = mongoose.model("questions", questionSchema);

module.exports = questions;
