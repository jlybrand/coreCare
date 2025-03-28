const db = require('../db');
const utils = require('../utils');

const findByAddress = async (address) => {
  try {
    const query = 'SELECT * FROM prospects WHERE address = $1';
    const result = await db.query(query, address);
    return result.rows[0]; // Return the prospect or undefined
  } catch (error) {
    console.error('Error finding prospect by address:', error);
    throw error;
  }
};

const create = async (prospect) => {
  try {
    const existingProspect = await findByAddress(prospect.address);
    
    if (existingProspect) {
      console.log('Prospect already exists:', existingProspect);
      return existingProspect;
    }
    
    let formattedPhone = prospect.phone;
    if (utils && utils.formatPhoneNumber) {
      formattedPhone = utils.formatPhoneNumber(prospect.phone);
    }
    
    const query = `
      INSERT INTO prospects 
        (name, address, city, state, postal_code, phone, date_created) 
      VALUES 
        ($1, $2, $3, $4, $5, $6, CURRENT_DATE)
      RETURNING *
    `;
    
    const values = [
      prospect.name,
      prospect.address,
      prospect.city,
      prospect.state,
      prospect.postal_code,
      formattedPhone
    ];
    
    const result = await db.query(query, ...values);
    console.log('Created new prospect:', result.rows[0]);
    return result.rows[0];
  } catch (error) {
    console.error('Error creating prospect:', error);
    throw error;
  }
};

module.exports = {
  findByAddress,
  create
};