const db = require('./index');

const clearTable = async (tableName) => {
  try {
    console.log(`Clearing data from table: ${tableName}`);
    const result = await db.query(`DELETE FROM ${tableName}`);
    console.log(`Deleted ${result.rowCount} rows from ${tableName}`);
    return result;
  } catch (error) {
    console.error(`Error clearing table ${tableName}:`, error);
    throw error;
  }
};

const clearAllTables = async () => {
  try {
    console.log('Clearing all tables...');
    
    await clearTable('targets');
    await clearTable('clients');
    await clearTable('prospects');
    
    console.log('All tables cleared successfully');
  } catch (error) {
    console.error('Error clearing all tables:', error);
    throw error;
  }
};

const resetDatabase = async () => {
  try {
    console.log('Resetting database...');
    
    await clearAllTables();
    
    await db.query("ALTER SEQUENCE prospects_id_seq RESTART WITH 1");
    await db.query("ALTER SEQUENCE clients_id_seq RESTART WITH 1");
    await db.query("ALTER SEQUENCE targets_id_seq RESTART WITH 1");
    
    console.log('Database reset completed');
  } catch (error) {
    console.error('Error resetting database:', error);
    throw error;
  }
};

module.exports = {
  clearTable,
  clearAllTables,
  resetDatabase
};