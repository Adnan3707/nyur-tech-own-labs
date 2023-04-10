const mongoose = require("mongoose");
const { Schema } = mongoose;

const pathSchema = new Schema(
  {
    path_name: { type: String, unique: true, required: true },
    path_tags: { type: Array, required: true, index: true, text: true },
  },
  { timestamps: true }
);

const paths = mongoose.model("paths", pathSchema);

module.exports = paths;
