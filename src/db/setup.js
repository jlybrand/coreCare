const { initTables } = require('./migrations/init-tables');

const setupDatabase = async () => {
  try {
    await initTables();
    
    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Database setup failed:', error);
    process.exit(1);
  }
};

// Allow running setup directly
if (require.main === module) {
  setupDatabase().then(() => {
    process.exit(0);
  });
}

module.exports = { setupDatabase };