const clientModel = require("../models/client");
const passwordResetModel = require("../models/passwordReset");
const mailService = require("./mail");
const config = require("../../config");

/**
 * Initiate password reset process
 *
 * @param {string} email - Client email
 * @returns {boolean} - True if reset process initiated
 */
const initiateReset = async (email) => {
  try {
    const client = await clientModel.findClientByEmail(email);
    if (!client) {
      console.log("Client not found for email:", email);
      return true; // Return success even if email not found
    }

    const token = await passwordResetModel.createToken(client.id);
    const appUrl = config.appUrl || "http://localhost:3000";
    const resetLink = `${appUrl}/users/reset-password?token=${token}`;

    await mailService.sendPasswordResetEmail(
      {
        email: client.email,
        firstname: client.first_name,
      },
      token
    );

    return true;
  } catch (error) {
    console.error("Error initiating password reset:", error);
    throw error;
  }
};

/**
 * Complete password reset
 *
 * @param {string} token - Reset token
 * @param {string} newPassword - New password
 * @returns {object} - Result object with success status
 */
const completeReset = async (token, newPassword) => {
  try {
    await passwordResetModel.cleanupExpiredTokens();

    const resetInfo = await passwordResetModel.validateToken(token);

    if (!resetInfo) {
      return {
        success: false,
        error: "Invalid or expired reset token",
      };
    }

    const updated = await clientModel.updatePassword(
      resetInfo.client_id,
      newPassword
    );

    if (!updated) {
      return {
        success: false,
        error: "Failed to update password",
      };
    }

    await passwordResetModel.markTokenUsed(token);

    return {
      success: true,
      message: "Password has been reset successfully",
    };
  } catch (error) {
    console.error("Error completing password reset:", error);
    throw error;
  }
};

module.exports = {
  initiateReset,
  completeReset,
};
