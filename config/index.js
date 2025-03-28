require('dotenv').config();

const config = {
  port: process.env.PORT,
  nodeEnv: process.env.NODE_ENV,
  databaseUrl: process.env.DATABASE_URL,
  secret: process.env.SECRET,
  
  mapquest: {
    apiUrl: process.env.API_URL,
    apiKeyName: process.env.API_KEY_NAME,
    apiKeyValue: process.env.API_KEY_VALUE
  }
};


module.exports = config;