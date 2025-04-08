const db = require("../db");
const bcrypt = require("bcrypt");

/**
 * Check if a client with the given email exists
 */
const exists = async (email) => {
  try {
    const query = "SELECT 1 FROM clients WHERE LOWER(email) = LOWER($1)";
    const result = await db.query(query, email);
    return result.rowCount > 0;
  } catch (error) {
    console.error("Error checking client existence:", error);
    throw error;
  }
};

const findClientByEmail = async (email) => {
  try {
    const query = "SELECT * FROM clients WHERE LOWER(email) = LOWER($1)";
    const result = await db.query(query, email);
    return result.rows[0]; // Return the client or undefined
  } catch (error) {
    console.error("Error finding client by email:", error);
    throw error;
  }
};

/**
 * Authenticate a client with email and password
 *
 * @param {string} email - The email
 * @param {string} password - The plaintext password
 * @returns {Object|null} - The authenticated client or null if authentication failed
 */
const authenticate = async (email, password) => {
  try {
    const client = await findClientByEmail(email);

    if (!client) {
      return null;
    }

    const passwordMatches = await bcrypt.compare(password, client.password);

    if (!passwordMatches) {
      return null;
    }

    // Return client without password
    const { password: _, ...clientWithoutPassword } = client;
    return clientWithoutPassword;
  } catch (error) {
    console.error("Error authenticating client:", error);
    throw error;
  }
};

/**
 * Create a new client account
 */
const create = async (clientInfo) => {
  try {
    const clientExists = await exists(clientInfo.email);

    if (clientExists) {
      return false;
    }

    const hashedPassword = await bcrypt.hash(clientInfo.password, 10);

    const query = `
      INSERT INTO clients 
        (first_name, last_name, email, password) 
      VALUES 
        ($1, $2, $3, $4)
      RETURNING id, first_name, last_name, email, date_created, isAdmin
    `;

    const values = [
      clientInfo.firstname,
      clientInfo.lastname,
      clientInfo.email,
      hashedPassword,
    ];

    const result = await db.query(query, ...values);
    return result.rows[0]; // Return the created client (without password)
  } catch (error) {
    console.error("Error creating client:", error);
    throw error;
  }
};

/**
 * Get all clients (admin function)
 *
 * @returns {Array} - Array of all clients
 */
const findAll = async () => {
  try {
    const query = `
      SELECT id, first_name, last_name, email, date_created, isAdmin
      FROM clients
      ORDER BY date_created DESC
    `;
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error finding all clients:", error);
    throw error;
  }
};

const updatePassword = async (clientId, newPassword) => {
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const query = `
      UPDATE clients
      SET password = $1
      WHERE id = $2
      RETURNING id
    `;

    const result = await db.query(query, hashedPassword, clientId);
    console.log(`Password updated for client ID ${clientId}`);

    return result.rowCount > 0;
  } catch (error) {
    console.error("Error updating client password:", error);
    throw error;
  }
};

module.exports = {
  exists,
  findClientByEmail,
  authenticate,
  create,
  findAll,
  updatePassword,
};
