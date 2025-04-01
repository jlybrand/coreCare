const { Pool } = require('pg');
const config = require('../../config');

const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, 
  idleTimeoutMillis: 30000, // How long a client can remain idle
  connectionTimeoutMillis: 2000 
});

pool.on('connect', () => {
  console.log('Database connection established');
});

pool.on('error', (err, client) => {
  console.error('Unexpected database error:', err);
});

const query = async (statement, ...parameters) => {
  const start = Date.now();
  
  try {
    // console.log('Executing query:', statement, parameters);
    
    const result = await pool.query(statement, parameters);
    
    const duration = Date.now() - start;
    // console.log(`Query completed in ${duration}ms, rows: ${result.rowCount}`);
    
    return result;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};

const close = async () => {
  await pool.end();
  console.log('Database connection pool closed');
};

module.exports = {
  query,
  close
};