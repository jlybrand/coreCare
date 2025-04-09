const passwordResetService = require("../services/passwordReset");
const { body, validationResult } = require("express-validator");

const validateRequestReset = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please enter a valid email address"),
];

const validateCompleteReset = [
  body("token").notEmpty().withMessage("Reset token is required"),
  body("password")
    .isLength({ min: 3 })
    .withMessage("Password must be at least 3 characters long"),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Password confirmation does not match password");
    }
    return true;
  }),
];

/**
 * Handle password reset request
 */
const requestReset = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;
    await passwordResetService.initiateReset(email);

    return res.render("request-reset", {
      title: "Reset Your Password",
      success: "Check your email",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle password reset completion
 */
const completeReset = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("reset-password", {
        title: "Reset Your Password",
        token: req.body.token,
        error: errors.array()[0].msg,
      });
    }

    const { token, password } = req.body;
    console.log(`Processing password reset for token: ${token}`);

    const result = await passwordResetService.completeReset(token, password);

    if (!result.success) {
      console.log(`Password reset failed: ${result.error}`);
      return res.render("reset-password", {
        title: "Reset Your Password",
        token,
        error: result.error,
      });
    }

    console.log("Password reset successful");
    res.redirect(
      "/users/signin?message=Your password has been reset successfully"
    );
  } catch (error) {
    console.error("Error in password reset completion:", error);
    res.render("reset-password", {
      title: "Reset Your Password",
      token: req.body.token,
      error: "An unexpected error occurred. Please try again later.",
    });
  }
};

/**
 * Render password reset request form
 */
const renderRequestForm = (req, res) => {
  res.render("request-reset", {
    title: "Reset Your Password",
  });
};

/**
 * Render password reset completion form
 */
const renderResetForm = (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.redirect("/request-reset");
  }

  res.render("reset-password", {
    title: "Set New Password",
    token,
  });
};

module.exports = {
  validateRequestReset,
  validateCompleteReset,
  requestReset,
  completeReset,
  renderRequestForm,
  renderResetForm,
};
