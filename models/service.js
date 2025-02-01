const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const serviceSchema = new Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

module.exports = mongoose.model("services", serviceSchema);
