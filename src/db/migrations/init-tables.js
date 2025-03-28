const db = require('../index');

const initTables = async () => {
  try {
    console.log('Initializing database tables...');
    
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
    
    await db.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        date_created DATE DEFAULT CURRENT_DATE,
        isAdmin BOOLEAN NOT NULL DEFAULT FALSE
      )
    `);
    
    await db.query(`
      CREATE TABLE IF NOT EXISTS targets (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        postal_code TEXT NOT NULL,
        phone TEXT,
        owner TEXT NOT NULL REFERENCES clients (username) ON DELETE CASCADE
      )
    `);
    
    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database tables:', error);
    throw error;
  }
};

module.exports = { initTables };