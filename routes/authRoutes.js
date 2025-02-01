const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

router.route("/login").post(authController.postLogin);

router.route("/logout").get(authController.getLogout);

router.route("/register").post(authController.postRegister);

router.route("/resetpassword").post(authController.postResetpassword);

router.route("/image").post(authController.postImage);

router.route("/image/delete").post(authController.postImage);

module.exports = router;
