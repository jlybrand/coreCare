const express = require("express");
const userController = require("../controllers/user");
const passwordResetController = require('../controllers/passwordReset');
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

router.get('/request-reset', passwordResetController.renderRequestForm);

router.post('/request-reset', 
  passwordResetController.validateRequestReset,
  passwordResetController.requestReset
);

router.get('/reset-password', passwordResetController.renderResetForm);
router.post('/reset-password',
  passwordResetController.validateCompleteReset,
  passwordResetController.completeReset
);


module.exports = router;
