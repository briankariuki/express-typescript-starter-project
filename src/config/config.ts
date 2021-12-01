require('dotenv').config();

const config = {
  port: process.env.PORT || 8089,

  mongoURI: process.env.mongoURI,

  authentication: {
    jwtSecret: process.env.JWT_SECRET || 'awesomeApp',
    jwtExpiry: process.env.JWT_EXPIRY || '1d',
    apiKey: process.env.API_KEY || 'apiKey',
    sessionId: process.env.SESSION_ID,
    csrfToken: process.env.CSRF_TOKEN,
    userId: process.env.USER_ID,
  },
  LOG_LEVEL: process.env.LOG_LEVEL,
  ADMIN_ID: process.env.ADMIN_ID,
  NODE_ENV: process.env.NODE_ENV,
  FILE_PATH: process.env.FILE_PATH,
  BODY_PARSER_LIMIT: process.env.BODY_PARSER_LIMIT,
  MORGAN_BODY_MAX_BODY_LENGTH: process.env.MORGAN_BODY_MAX_BODY_LENGTH as any as number,
  ELASTICSEARCH_STATUS: process.env.ELASTICSEARCH_STATUS as 'enabled' | 'disabled',
  
};

export default config;
