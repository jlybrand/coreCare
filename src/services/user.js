const clientModel = require("../models/client");
const targetModel = require("../models/target");
const mailService = require("./mail.js");
const utils = require("../utils");
const db = require("../db");

const registerUser = async (userData, targets) => {
  try {
    // Check if user already exists
    const userExists = await clientModel.exists(userData.email);

    if (userExists) {
      return {
        success: false,
        error: "An account with this email already exists",
      };
    }

    const newUser = await clientModel.create(userData);

    try {
      await mailService.sendNewClientNotification({
        firstname: userData.firstname,
        lastname: userData.lastname,
        email: userData.email,
      });
      console.log("New client notification email sent to admin");
    } catch (emailError) {
      console.error("Failed to send admin notification email:", emailError);
    }

    try {
      await mailService.sendClientWelcome({
        firstname: userData.firstname,
        lastname: userData.lastname,
        email: userData.email,
      });
      console.log("Welcome email sent to client");
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
    }

    if (!newUser) {
      return {
        success: false,
        error: "Failed to create user account",
      };
    }

    // If we have targets to save
    if (targets && Array.isArray(targets) && targets.length > 0) {
      const formattedTargets = targets.map((target) => ({
        ...target,
        phone: utils.formatPhoneNumber(target.phone || ""),
      }));

      try {
        await targetModel.saveMany(userData.email, formattedTargets);
        console.log(
          `Saved ${formattedTargets.length} targets for user ${userData.email}`
        );
      } catch (error) {
        console.error("Error saving targets:", error);
        // Continue even if saving targets fails
      }
    }

    return {
      success: true,
      user: {
        id: newUser.id,
        firstname: newUser.first_name,
        lastname: newUser.last_name,
        email: newUser.email,
      },
    };
  } catch (error) {
    console.error("User registration error:", error);
    return {
      success: false,
      error: "An error occurred during registration",
    };
  }
};

const getUserTargets = async (username) => {
  try {
    // Adjust the query based on your database schema
    const targets = await db.query(
      "SELECT * FROM targets WHERE username = $1 ORDER BY created_at DESC",
      [username]
    );

    return {
      success: true,
      targets: targets.rows,
    };
  } catch (error) {
    console.error("Error fetching user targets:", error);
    return {
      success: false,
      error: "Failed to retrieve targets",
    };
  }
};

module.exports = {
  registerUser,
  getUserTargets,
};
