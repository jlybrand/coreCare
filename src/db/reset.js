const dbUtils = require('./utils');

const args = process.argv.slice(2);
const command = args[0];
const tableName = args[1];

const executeCommand = async () => {
  try {
    switch (command) {
      case 'clear':
        if (tableName) {
          await dbUtils.clearTable(tableName);
        } else {
          await dbUtils.clearAllTables();
        }
        break;
        
      case 'reset':
        await dbUtils.resetDatabase();
        break;
        
      default:
        console.log('Available commands:');
        console.log('  clear [tableName] - Clear a specific table or all tables if no table specified');
        console.log('  reset - Reset the entire database (clear all and reset sequences)');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Command execution failed:', error);
    process.exit(1);
  }
};

executeCommand();