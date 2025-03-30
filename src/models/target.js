const db = require('../db');

/**
 * Save multiple targets for a client
 * 
 * @param {string} username - The username of the client
 * @param {Array} targets - Array of target objects
 * @returns {boolean} - True if targets were saved successfully
 */
const saveMany = async (username, targets) => {
  try {
    if (!targets || !Array.isArray(targets) || targets.length === 0) {
      return false;
    }
    
    // For better performance, we could use a bulk insert here
    let lastResult;
    
    for (const target of targets) {
      const query = `
        INSERT INTO targets 
          (name, address, city, state, postal_code, phone, owner) 
        VALUES 
          ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      
      const values = [
        target.name,
        target.address,
        target.city,
        target.state,
        target.postal_code,
        target.phone,
        username
      ];
      
      lastResult = await db.query(query, ...values);
    }
    
    // Return true if at least one target was saved
    return lastResult && lastResult.rowCount > 0;
  } catch (error) {
    console.error('Error saving targets:', error);
    throw error;
  }
};

/**
 * Get all stored target addresses
 * Used for filtering out existing targets in search results
 * 
 * @returns {Array} - Array of target addresses
 */
const getAllAddresses = async () => {
  try {
    const query = 'SELECT address FROM targets';
    const result = await db.query(query);
    return result.rows.map(row => row.address);
  } catch (error) {
    console.error('Error getting all target addresses:', error);
    throw error;
  }
};

/**
 * Get targets owned by a specific client
 * 
 * @param {string} username - The username of the client
 * @returns {Array} - Array of target objects
 */
const findByOwner = async (username) => {
  try {
    const query = 'SELECT * FROM targets WHERE owner = $1';
    const result = await db.query(query, username);
    return result.rows;
  } catch (error) {
    console.error('Error finding targets by owner:', error);
    throw error;
  }
};

/**
 * Check if an address is already claimed as a target
 * 
 * @param {string} address - The address to check
 * @returns {boolean} - True if the address is already a target
 */
const isAddressClaimed = async (address) => {
  try {
    const query = 'SELECT 1 FROM targets WHERE address = $1';
    const result = await db.query(query, address);
    return result.rowCount > 0;
  } catch (error) {
    console.error('Error checking if address is claimed:', error);
    throw error;
  }
};

/**
 * Get all targets (admin function)
 * 
 * @returns {Array} - Array of all target objects
 */
const findAll = async () => {
  try {
    const query = `
      SELECT t.*, c.first_name, c.last_name, c.email 
      FROM targets t
      JOIN clients c ON t.owner = c.username
      ORDER BY t.id DESC
    `;
    const result = await db.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error finding all targets:', error);
    throw error;
  }
};

module.exports = {
  saveMany,
  getAllAddresses,
  findByOwner,
  isAddressClaimed,
  findAll
};