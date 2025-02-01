const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const paymentSchema = new Schema(
  {
    reservationId: { type: String, required: true },
    amount: { type: Number, required: true },
    method: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      required: true,
    },
    transactionId: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

module.exports = mongoose.model("payments", paymentSchema);
