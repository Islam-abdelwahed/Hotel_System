const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const _Schema = mongoose.Schema;
const emailvalidtor = require("email-validator");

const userSchema = new _Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: emailvalidtor.validate,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  role: { type: String, enum: ["guest", "reciption","manager"], required: true ,default:"guest"},
  refreshtoken: String,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const hashedPass = await bcrypt.hash(this.password, 10);

    this.password = hashedPass;
    next();
  } catch (error) {
    console.error(error);
  }
});

userSchema.methods.comparePassword = async function (plainPassword) {
  try {
    // Compare the plain password with the hashed password
    const isMatch = await bcrypt.compare(plainPassword, this.password);
    return isMatch;
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = new mongoose.model("users", userSchema);
