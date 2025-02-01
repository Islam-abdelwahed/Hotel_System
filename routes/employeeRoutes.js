const express = require("express");
const employeeController = require("../controllers/employeeController");
const { param, body } = require("express-validator");
const router = express.Router();
const isLoggedIn = require("../middleware/authGuard");
const verifyRoles = require("../middleware/verifyRoles");

router
  .route("/")
  .all(isLoggedIn, verifyRoles(["admin", "guest"]))
  .get(employeeController.getEmployees)
  .post(
    [
      body("national_Id", "National ID must consist of 15 digits")
        .isAlphanumeric()
        .isLength({ min: 15, max: 15 }),
      body(
        "phone",
        "Phone number must consist of [6-15] digits"
      ).isMobilePhone(),
      // body("email", "Enter a valid email").isEmail(),
      body("firstname", "firstname must contain letters")
        .isAlpha()
        .isLength({ min: 3 }),
      body("lastname", "lastname must contain letters")
        .isAlpha()
        .isLength({ min: 3 }),
      body("gender", "gender must be either male or female").isIn([
        "male",
        "female",
      ]),
      body("birth_date", "please enter a valid birth date").isDate(),
    ],
    employeeController.addEmployee
  );

router
  .route("/employee/:id")
  .all(
    isLoggedIn,
    verifyRoles(["admin"]),
    param("id", "Invalid Id").isMongoId()
  )
  .get(employeeController.getEmployeeById)
  .patch(
    [
      body("national_Id", "National ID must consist of 15 digits")
        .isAlphanumeric()
        .isLength({ min: 15, max: 15 }),
      body(
        "phone",
        "Phone number must consist of [6-15] digits"
      ).isMobilePhone(),
      // body("email", "Enter a valid email").isEmail(),
      body("firstname", "firstname must contain letters")
        .isAlpha()
        .isLength({ min: 3 }),
      body("lastname", "lastname must contain letters")
        .isAlpha()
        .isLength({ min: 3 }),
      body("gender", "gender must be either male or female").isIn([
        "male",
        "female",
      ]),
      body("birth_date", "please enter a valid birth date").isDate(),
    ],
    employeeController.updateEmployee
  )
  .delete(employeeController.deleteEmployee);

module.exports = router;
