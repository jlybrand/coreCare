const db = require("../db");
const crypto = require("crypto");

/**
 * Create a password reset token for a client
 *
 * @param {number} clientId - The client ID
 * @returns {string} - The generated token
 */
const createToken = async (clientId) => {
  const clientIDNumber = parseInt(clientId, 10);

  try {
    const token = crypto.randomBytes(32).toString("hex");
    console.log("Generated new token:", token);

    // Expiration to 1 hour from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Delete any existing tokens for this client
    const deleteQuery = "DELETE FROM password_resets WHERE client_id = $1";
    await db.query(deleteQuery, clientIDNumber);

    // Insert new token
    const insertQuery = `
      INSERT INTO password_resets (client_id, token, expires_at)
      VALUES ($1, $2, $3)
      RETURNING token
    `;

    const result = await db.query(
      insertQuery,
      clientIDNumber,
      token,
      expiresAt
    );

    // Verify the token was stored
    const verifyQuery = "SELECT * FROM password_resets WHERE token = $1";
    const verification = await db.query(verifyQuery, token); // Pass as single parameter
    console.log("Verification result:", verification.rows);

    return result.rows[0].token;
  } catch (error) {
    console.error("Error creating password reset token:", error);
    throw error;
  }
};

/**
 * Validate a password reset token
 *
 * @param {string} token - The token to validate
 * @returns {object|null} - The client ID if valid, null otherwise
 */
const validateToken = async (token) => {
  try {
    const query = `
      SELECT pr.client_id, c.first_name, c.email
      FROM password_resets pr
      JOIN clients c ON pr.client_id = c.id
      WHERE pr.token = $1
        AND pr.expires_at > NOW()
        AND pr.used = FALSE
    `;

    const result = await db.query(query, token);
    console.log("Token validation result:", result.rows);

    if (result.rowCount === 0) {
      console.log("No valid token found");
      return null;
    }

    return result.rows[0];
  } catch (error) {
    console.error("Error validating password reset token:", error);
    throw error;
  }
};

/**
 * Mark a token as used
 *
 * @param {string} token - The token to mark as used
 */
const markTokenUsed = async (token) => {
  try {
    await db.query(
      "UPDATE password_resets SET used = TRUE WHERE token = $1",
      token
    );
  } catch (error) {
    console.error("Error marking token as used:", error);
    throw error;
  }
};

const cleanupExpiredTokens = async () => {
  try {
    await db.query("DELETE FROM password_resets WHERE expires_at < NOW()");
  } catch (error) {
    console.error("Error cleaning up expired tokens:", error);
    throw error;
  }
};

module.exports = {
  createToken,
  validateToken,
  markTokenUsed,
  cleanupExpiredTokens,
};
