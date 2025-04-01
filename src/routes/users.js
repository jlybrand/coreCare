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

router.get('/signout', (req, res) => {
  // Clear the user from session
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    // Redirect to home page or sign-in page
    res.redirect('/');
  });
});


module.exports = router;
