const Employee = require("../models/employeeMD");
const randomIDs = require("../util/randomId");
const QRCode = require("qrcode");
const { validationResult } = require("express-validator");

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.addEmployee = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error(
        errors
          .array()
          .map((err) => err.msg)
          .join(" , ")
      );
      error.statusCode = 422;
      throw error;
    }

    const existingEmployee = await Employee.findOne({
      $or: [{ phone: req.body.phone }, { national_Id: req.body.national_Id }],
    });

    if (existingEmployee) {
      const error = new Error("This employee is already exsits");
      error.statusCode = 409;
      throw error;
    }

    const employee = await Employee.create({
      ...req.body,
    });

    if (!employee) throw new Error("Some error occured");

    const qrBuffer = await QRCode.toDataURL(
      JSON.stringify({
        _id: employee.staff_ID,
      }),
      {
        width: 500,
      }
    );

    const mailOptions = {
      from: "your-email@gmail.com",
      to: employee.email,
      subject: "Welcome to the Hotel - Your Employee QR Code",
      html: `
        <h3>Welcome, ${employee.firstname}!</h3>
        <p>Here is your QR code:</p>
        <img src="${qrBuffer}" alt="QR Code" />
      `,
      attachments: [
        {
          filename: `employee-${employee.id}.png`,
          content: qrBuffer.split(",")[1],
          encoding: "base64",
        },
      ],
    };

    const info = await req.transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.response);

    res.status(201).json({ msg: "employee created successfully" });
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.updateEmployee = async (req, res, next) => {
  try {
    const {
      firstname,
      lastname,
      email,
      address,
      national_Id,
      phone,
      gender,
      birth_date,
    } = req.body;
    const employee = await Employee.findOne({ phone: req.body.phone });

    if (!employee) {
      const error = new Error("no such an employee");
      error.statusCode = 404;
      throw error;
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
      employee._id,
      {
        firstname,
        lastname,
        email,
        address,
        national_Id,
        phone,
        gender,
        birth_date,
      },
      { new: true }
    );

    if (!updatedEmployee) throw new Error("Some error occured");

    res.status(201).json(updatedEmployee);
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.deleteEmployee = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error(errors.array()[0].msg);
      error.statusCode = 400;
      throw error;
    }

    const ID = req.params.id;

    const employee = await Employee.findOne({ _id: ID });

    if (!employee) {
      const error = new Error("no such an employee");
      error.statusCode = 404;
      throw error;
    }

    const deleteted = await Employee.findByIdAndDelete(employee._id);

    if (!deleteted) throw new Error("Some error occured");

    res.status(200).json({ msg: "Employee deleted successfully" });
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.getEmployeeById = async (req, res, next) => {
  try {
    const ID = req.params.id;
    const employee = await Employee.findOne({ _id: ID });

    if (!employee) {
      const error = new Error("no such an employee");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json(employee);
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};

/**
 *
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.getEmployees = async (req, res, next) => {
  try {
    const employees = await Employee.find();

    if (!employees) {
      throw new Error("Some error occured");
    }

    res.status(200).json(employees);
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};
