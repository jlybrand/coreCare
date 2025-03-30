const clientModel = require('../models/client');
const targetModel = require('../models/target');
const utils = require('../utils');

 
const registerUser = async (userData, targets) => {
  try {
    // Check if user already exists
    const userExists = await clientModel.exists(userData.email);
    
    if (userExists) {
      return {
        success: false,
        error: 'An account with this email already exists'
      };
    }
    
    const newUser = await clientModel.create(userData);
    
    if (!newUser) {
      return {
        success: false,
        error: 'Failed to create user account'
      };
    }
    
    // If we have targets to save
    if (targets && Array.isArray(targets) && targets.length > 0) {
      const formattedTargets = targets.map(target => ({
        ...target,
        phone: utils.formatPhoneNumber(target.phone || '')
      }));
      
      try {
        await targetModel.saveMany(userData.email, formattedTargets);
        console.log(`Saved ${formattedTargets.length} targets for user ${userData.email}`);
      } catch (error) {
        console.error('Error saving targets:', error);
        // Continue even if saving targets fails
      }
    }
    
    return {
      success: true,
      user: {
        id: newUser.id,
        firstname: newUser.first_name,
        lastname: newUser.last_name,
        email: newUser.email
      }
    };
  } catch (error) {
    console.error('User registration error:', error);
    return {
      success: false,
      error: 'An error occurred during registration'
    };
  }
};

module.exports = {
  registerUser
};