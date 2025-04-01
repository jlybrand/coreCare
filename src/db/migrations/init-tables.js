const db = require('../index');

/**
 * Initialize database tables
 */
const initTables = async () => {
  try {
    console.log('Initializing database tables...');
    
    // Create prospects table
    await db.query(`
      CREATE TABLE IF NOT EXISTS prospects (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT NOT NULL UNIQUE,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        postal_code TEXT NOT NULL,
        phone TEXT,
        date_created DATE DEFAULT CURRENT_DATE
      )
    `);
    
    // Create clients table without username
    await db.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE CHECK (email = LOWER(email)),
        password TEXT NOT NULL,
        date_created DATE DEFAULT CURRENT_DATE,
        isAdmin BOOLEAN NOT NULL DEFAULT FALSE
      )
    `);
    
    // Create targets table with owner_email
    await db.query(`
      CREATE TABLE IF NOT EXISTS targets (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        postal_code TEXT NOT NULL,
        phone TEXT,
        owner_email TEXT NOT NULL CHECK (owner_email = LOWER(owner_email)) REFERENCES clients (email) ON DELETE CASCADE
      )
    `);
    
    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database tables:', error);
    throw error;
  }
};

module.exports = { initTables };