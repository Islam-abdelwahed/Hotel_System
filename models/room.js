const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roomSchema = new Schema(
  {
    number: { type: Number, required: true },
    img: [{ type: String, required: true }],
    type: {
      type: String,
      enum: ["single", "double", "triple", "quad"],
      required: true,
    },
    price: { type: Number, required: true },
    floor: { type: Number, required: true },
    status: {
      type: String,
      enum: ["available", "reserved", "occupied", "maintenance"],
      required: true,
      default: "available",
    },
    description: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

roomSchema.pre(["findOne", "findById", "findByIdAndDelete"], function (next) {
  const id = this.getQuery()._id;

  if (id && !mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error("Invalid ID");
    error.statusCode = 422;
    return next(error);
  }

  next();
});

const model = mongoose.model("rooms", roomSchema);

module.exports = model;
