const express = require("express");
const router = express.Router();
const reservationController = require("../controllers/reservationController.js");
const checkController = require("../controllers/checkController.js");
const validateObjectId = require("../middleware/validateObjectId.js");
const isLoggedIn = require("../middleware/authGuard.js");
const verifyRoles = require("../middleware/verifyRoles.js");
const { body } = require("express-validator");

router
  .route("/")
  .all(isLoggedIn, verifyRoles(["manager", "reciption", "guest"]))
  .get(reservationController.getReservations)
  .post(
    [
      body("userId", "Invalid User Id").isMongoId(),
      body("roomId", "Invalid Room Id").isMongoId(),
      body("checkInDate", "please enter a valid checkIn Date")
        .isDate()
        .custom((checkInDate) => {
          if (new Date(checkInDate) < new Date().setHours(0, 0, 0, 0)) {
            throw new Error("Check-in date cannot be before today.");
          }
          return true;
        }),
      body("checkOutDate", "please enter a valid checkOut Date ")
        .isDate()
        .custom((value, { req }) => {
          if (new Date(value) <= new Date(req.body.checkInDate))
            throw new Error("the checkout date is invalid");
          return true;
        }),
    ],
    reservationController.createReservation
  );

router
  .route("/:id")
  .all(isLoggedIn, verifyRoles(["manager", "reciption", "guest"]))
  .get(validateObjectId, reservationController.getReservationById)
  .put(
    validateObjectId,
    [
      body("userId", "Invalid User Id").isMongoId(),
      body("roomId", "Invalid Room Id").isMongoId(),
      body(
        "status",
        "status must be one of [pending,confirmed,checked_in,checked_out,canceled]"
      ).isIn(["pending", "confirmed", "checked_in", "checked_out", "canceled"]),
      body("checkInDate", "please enter a valid checkIn Date")
        .isDate()
        .custom((checkInDate) => {
          if (new Date(checkInDate) < new Date().setHours(0, 0, 0, 0)) {
            throw new Error("Check-in date cannot be before today.");
          }
          return true;
        }),
      body("checkOutDate", "please enter a valid checkOut Date ")
        .isDate()
        .custom((value, { req }) => {
          if (new Date(value) <= new Date(req.body.checkInDate))
            throw new Error("the checkout date is invalid");
          return true;
        }),
    ],
    reservationController.updateReservation
  )
  .delete(validateObjectId, reservationController.deleteReservation);

router.route("/:id/checkin").post(validateObjectId, checkController.checkin);

router.route("/:id/checkout").post(validateObjectId, checkController.checkout);

router.route("/:id/pay").post(validateObjectId, reservationController.processPaymentAtCheckout);

router.route("/:id/services").post(validateObjectId, reservationController.addServiceToReservation);

module.exports = router;
