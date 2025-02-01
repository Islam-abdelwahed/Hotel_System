const mongoose = require("mongoose");
const randomID = require("../util/randomId");
const Schema = mongoose.Schema;

const employee = new Schema({
  staff_ID: {
    type: String,
    trim: true,
  },
  firstname: {
    type: String,
    required: true,
    trim: true,
  },
  lastname: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  national_Id: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  gender: {
    type: String,
    enum: ["male", "female"],
    required: true,
  },
  birth_date: {
    type: Date,
    required: true,
  },
});

employee.pre("save", function (next) {
  if (!this.staff_ID) {
    this.staff_ID = randomID();
  }
  next();
});

module.exports = mongoose.model("employee", employee);
