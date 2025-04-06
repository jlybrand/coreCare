require("dotenv").config();

const config = {
  port: process.env.PORT,
  nodeEnv: process.env.NODE_ENV,
  databaseUrl: process.env.DATABASE_URL,
  secret: process.env.SECRET,

  mapquest: {
    apiUrl: process.env.API_URL,
    apiKeyName: process.env.API_KEY_NAME,
    apiKeyValue: process.env.API_KEY_VALUE,
  },

  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE,
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    fromEmail: process.env.EMAIL_FROM_ADDRESS,
    fromName: process.env.EMAIL_FROM_NAME,
    adminEmail: process.env.ADMIN_EMAIL,
  },

  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY,
  },
};

module.exports = config;
