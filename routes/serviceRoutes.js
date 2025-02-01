const express = require("express");
const ServiceController = require("../controllers/serviceController");
const { body } = require("express-validator");
const validateID = require("../middleware/validateObjectId");
const verifyRoles = require("../middleware/verifyRoles");
const router = express.Router();

router
  .route("/")
  .get(verifyRoles(["manager", "reciption"]), ServiceController.getServices)
  .post(
    verifyRoles(["manager"]),
    [
      body("name", "Enter a valid name").isAlpha(),
      body("price", "Enter a valid price").isNumeric(),
    ],
    ServiceController.addService
  );

router
  .route("/:id")
  .all(validateID)
  .get(verifyRoles(["manager", "reciption"]), ServiceController.getServiceById)
  .put(
    verifyRoles(["manager"]),
    [
      body("name", "Enter a valid name").isAlpha(),
      body("price", "Enter a valid price").isNumeric(),
    ],
    ServiceController.updateService
  )
  .delete(verifyRoles(["manager"]), ServiceController.deleteService);

module.exports = router;
