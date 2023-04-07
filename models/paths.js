const mongoose = require("mongoose");
const { Schema } = mongoose;

const newQuestionSchema = new Schema({
  question_no: { type: Number, required: true },
  question: { type: String, required: true },
});

const pathSchema = new Schema(
  {
    path_name: { type: String, unique: true, required: true },
    path_tags: { type: Array, required: true, index: true, text: true },
    questions: [newQuestionSchema],
  },
  { timestamps: true }
);

const paths = mongoose.model("paths", pathSchema);

module.exports = paths;
