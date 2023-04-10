const mongoose = require("mongoose");
const { Schema } = mongoose;

const newQuestionSchema = new Schema({
  question_no: { type: Number, required: true },
  question: { type: String, required: true },
});

const subpathSchema = new Schema(
  {
    primary_path_id: { type: mongoose.ObjectId, required: true },
    primary_path_name: { type: String, required: true },
    sub_path_name: { type: String, unique: true, required: true },
    sub_path_id: { type: Number, required: true },
    questions: [newQuestionSchema],
  },
  { timestamps: true }
);

const paths = mongoose.model("sub_paths", subpathSchema);

module.exports = paths;
