const mongoose = require("mongoose");

const billSchema = new mongoose.Schema({
  reservationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "reservations",
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  breakDown: [
    {
      serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "services",
        required: true,
      },
      quantity: { type: Number, required: true },
    },
  ],
});

module.exports = mongoose.model("bills", billSchema);
