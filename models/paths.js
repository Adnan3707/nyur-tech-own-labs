const mongoose = require("mongoose");
const { Schema } = mongoose;

const pathSchema = new Schema(
  {
    path_name: { type: String, required: true },
    path_tags: { type: String, required: true },
    questions: [newQuestionSchema],
  },
  { timestamps: true }
);

const newQuestionSchema = new Schema({
  question_no: { type: Number, unique: true, required: true },
  question: { type: String, required: true },
});

const paths = mongoose.model("paths", pathSchema);

module.exports = paths;
