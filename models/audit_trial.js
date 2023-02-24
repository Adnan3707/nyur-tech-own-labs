const mongoose = require("mongoose");
const { Schema } = mongoose;

const auditSchema = new Schema(
  {
    email: { type: String, required: true },
    action: { type: String, required: true },
    url: { type: String, required: true },
    request: { type: String, required: true },
    request_header: { type: String, required: false },
    axios_request: { type: String, required: false },
    axios_response: { type: String, required: false },
    response: { type: String, required: true },
    status: { type: String, required: true },
  },
  { timestamps: true }
);

const audit_trail = mongoose.model("audit_trail", auditSchema);

module.exports = audit_trail;
