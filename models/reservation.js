const mongoose = require("mongoose");
const { schema } = require("./employeeMD");
const Schema = mongoose.Schema;

const reservationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
    roomId: { type: Schema.Types.ObjectId, ref: "rooms", required: true },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed","checked_in" , "checked_out", "canceled"],
      default:"pending",
      required: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

module.exports = mongoose.model("reservations", reservationSchema);
