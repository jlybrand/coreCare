const express = require("express");
const userController = require("../controllers/user");
const router = express.Router();

router.get("/register", userController.renderRegistrationForm);
router.post("/register", userController.handleRegistration);

router.get("/signin", userController.renderSignInForm);

router.post(
  "/signin",
  userController.handleSignIn
);

module.exports = router;
