require("dotenv").config();
const UserModel = require("../models/user");
const EmployeeModel = require("../models/employeeMD");
const JWT = require("jsonwebtoken");
const crypto = require("crypto");
const fs = require("fs");
const mongoose = require("mongoose");
const path = require("path");

exports.postRegister = async (req, res, next) => {
  try {
    let username, email, role, password;
    if (mongoose.Types.ObjectId.isValid(req.body.username)) {
      const employee = await EmployeeModel.findById(req.body.username);

      if (!employee) {
        const error = new Error("no such an employee");
        error.statusCode = 404;
        throw error;
      }
      username = employee.firstname + "_" + employee.lastname;
      email = employee.email;
      role = employee.role;
    } else {
      const findUser = await UserModel.findOne({ username: req.body.username });

      if (findUser) {
        const error = new Error("This user is already exsits");
        error.statusCode = 409;
        throw error;
      }
      username = req.body.username;
      email = req.body.email;
      role = "guest";
    }
    password = req.body.password;
    const user = await UserModel.create({
      username,
      email,
      role,
      password,
    });

    if (!user) throw new Error("Some error occured");
    const mailOptions = {
      from: "hiltonH0tel@gmail.com",
      to: email,
      subject: "Sending Email using Node.js",
      text: "Welcome to our hotel",
    };

    req.transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log("Error:", error);
      } else {
        console.log("Email sent: ", info.response);
      }
    });

    return res.status(201).json({ msg: "User Created successfully." });
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};

exports.postImage = async (req, res, next) => {
  console.log(req.file);
};

exports.postLogin = async (req, res, next) => {
  try {
    const findUser = await UserModel.findOne({ username: req.body.username });

    if (!findUser) {
      const error = new Error("no such a user");
      error.statusCode = 404;
      throw error;
    }

    const checkPass = findUser.comparePassword(req.body.password);

    if (!checkPass) {
      const error = new Error("Invalid Input");
      error.statusCode = 422;
      throw error;
    }

    const accessToken = JWT.sign(
      { id: findUser._id, role: findUser.role },
      process.env.ACCESS_TOKEN,
      {
        expiresIn: "1h",
      }
    );
    const refreshToken = JWT.sign(
      { id: findUser._id, role: findUser.role },
      process.env.REFRESH_TOKEN,
      {
        expiresIn: "1d",
      }
    );

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    });

    res.status(200).json({ msg: "logged in", accessToken });
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};

exports.postResetpassword = async (req, res, next) => {
  try {
    const Isuser = await UserModel.findOne({ email: req.body.email });

    if (!Isuser) return res.redirect(400, "/reset-password");

    const token = crypto.randomBytes(32).toString("hex");

    const templatePath = path.join("views", "resetPassword.html");

    const html = fs.readFileSync(
      templatePath,
      { encoding: "utf-8" },
      (err, html) => {
        if (err) {
          console.log("Error reading HTML file", err);
          return `<a href="localhost/reset-password/${token}">Reset Password</a>`;
        }
        return html;
      }
    );

    const mailOptions = {
      from: "hiltonH0tel@gmail.com",
      to: req.body.email,
      subject: "Sending Email using Node.js",
      html: html,
    };

    // Send the email
    req.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log("Error:", error);
      } else {
        console.log("Email sent: ", info.response);
      }
    });

    return res.redirect(200, "/resetpassword");
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};

exports.getLogout = async (req, res, next) => {
  try {
    if (!req.cookies?.jwt) {
      const error = new Error("You are not logged in");
      error.statusCode = 401;
      throw error;
    }

    res.clearCookie("jwt", { httpOnly: true });
    res.sendStatus(204);
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};
