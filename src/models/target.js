const db = require('../db');

/**
 * Save multiple targets for a user
 * 
 * @param {string} email - The email of the owner
 * @param {Array} targets - Array of target objects
 * @returns {boolean} - Success indicator
 */
const saveMany = async (email, targets) => {
  try {
    let lastResult;
    
    for (const target of targets) {
      const query = `
        INSERT INTO targets 
          (name, address, city, state, postal_code, phone, owner_email) 
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
        email
      ];
      
      lastResult = await db.query(query, ...values);
    }
    
    return lastResult && lastResult.rowCount > 0;
  } catch (error) {
    console.error('Error saving targets:', error);
    try {
      const errorDetails = `
        Failed to save targets for client: ${userData.email}
        
        Error: ${error.message}
        Stack: ${error.stack}
        
        Number of targets that failed to save: ${targets.length}
      `;
      
      await mailService.sendErrorNotification(
        "Error Saving Client Targets",
        errorDetails
      );
    } catch (emailError) {
      console.error("Failed to send error notification email:", emailError);
    }
    throw error;
  }
};

/**
 * Get all stored target addresses
 * Used for filtering out existing targets in search results
 * 
 * @returns {Array} - Array of target addresses or []
 */
const getAllAddresses = async () => {
  try {
    const query = 'SELECT address FROM targets';
    const result = await db.query(query);
    
    return result.rows ? result.rows.map(row => row.address) : [];
  } catch (error) {
    console.error('Error getting target addresses:', error);
    // Return empty array on error instead of throwing
    return [];
  }
};

const findTargetsByEmail = async (owner_email) => {
  try { 
    const targets = await db.query(
      'SELECT * FROM targets WHERE LOWER(owner_email) = LOWER($1) ORDER BY name ASC',
      owner_email
    );
    
    console.log(`findTargetsByEmail Query returned ${targets.rows.length} targets`);
    
    return {
      success: true,
      targets: targets.rows
    };
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
    return {
      success: false,
      error: 'Failed to retrieve targets'
    };
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
      JOIN clients c ON t.owner_email = c.email
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
  findTargetsByEmail,
  isAddressClaimed,
  findAll
};