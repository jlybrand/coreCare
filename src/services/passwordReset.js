const clientModel = require('../models/client');
const passwordResetModel = require('../models/passwordReset');
const mailService = require('./mail');
const config = require('../../config');

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
      return true; // Return success even if email not found
    }
    
    // Create reset token
    const token = await passwordResetModel.createToken(client.id);
    
    // Send email
    await mailService.sendPasswordResetEmail({
      email: client.email,
      firstname: client.first_name,
    }, token);
    
    return true;
  } catch (error) {
    console.error('Error initiating password reset:', error);
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
    // Clean up expired tokens
    await passwordResetModel.cleanupExpiredTokens();
    
    // Validate token
    const resetInfo = await passwordResetModel.validateToken(token);
    
    if (!resetInfo) {
      return {
        success: false,
        error: 'Invalid or expired reset token'
      };
    }
    
    // Update password
    const updated = await clientModel.updatePassword(resetInfo.client_id, newPassword);
    
    if (!updated) {
      return {
        success: false,
        error: 'Failed to update password'
      };
    }
    
    // Mark token as used
    await passwordResetModel.markTokenUsed(token);
    
    return {
      success: true,
      message: 'Password has been reset successfully'
    };
  } catch (error) {
    console.error('Error completing password reset:', error);
    throw error;
  }
};

module.exports = {
  initiateReset,
  completeReset
};