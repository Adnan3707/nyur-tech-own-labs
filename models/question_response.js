const mongoose = require("mongoose");
const { Schema } = mongoose;

const responseSchema = new Schema(
  {
    response: [{
              question:{ type: String, required: true },
              response: {type:String,required:true}
    }],
  },
  { timestamps: true }
);

const question_response = mongoose.model("question_response", responseSchema);

module.exports = question_response;
