const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");
const { body } = require("express-validator");
const isLoggedIn = require("../middleware/authGuard");
const verifyRoles = require("../middleware/verifyRoles");

router
  .route("/:checkInDate/:checkOutDate")
  .get(
    isLoggedIn,
    verifyRoles(["manager", "reciption","guest"]),
    roomController.getRooms
  )

router
  .route("/")
  .get(
    isLoggedIn,
    verifyRoles(["manager", "reciption","guest"]),
    roomController.getRooms
  )
  .post(
    [
      body("type", "Room type should either single or double and so on")
        .isString()
        .isIn(["single", "double", "triple", "quad"]),
      body("number", "Room Number should be a number").isAlphanumeric(),
      body("price", "Invalid room price").isNumeric(),
      body("floor", "Floor should be a number").isNumeric(),
      body(
        "status",
        "Status should be one of [available, reserved, occupied, maintenance]"
      ).isIn(["available", "reserved", "occupied", "maintenance"]),
      body("description", "Invalid Description")
        .isString()
        .isLength({ min: 10 }),
      body("img", "Image should be one or more URLs").isArray(),
    ],
    isLoggedIn,
    verifyRoles(["manager"]),
    roomController.addRoom
  );

router
  .route("/:id")
  .get(roomController.getRoomById)
  .delete(isLoggedIn, verifyRoles(["manager"]), roomController.deleteRoom)
  .patch(
    isLoggedIn,
    verifyRoles(["manager"]),
    [
      body("type", "Room type should either single or double and so on")
        .isString()
        .isIn(["single", "double", "triple", "quad"]),
      body("number", "Room Number should be a number").isAlphanumeric(),
      body("price", "Invalid room price").isNumeric(),
      body("floor", "Floor should be a number").isNumeric(),
      body(
        "status",
        "Status should be one of [available, reserved, occupied, maintenance]"
      ).isIn(["available", "reserved", "occupied", "maintenance"]),
      body("description", "Invalid Description")
        .isString()
        .isLength({ min: 10 }),
      body("img", "Image should be one or more URLs").isArray(),
    ],
    roomController.updateRoom
  );

module.exports = router;
