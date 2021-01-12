const necessaryEnvs = [
  'MONGODB_USER',
  'MONGODB_PASS',
  'MONGODB_URL',
  'MONGODB_DB',
  'PROD_CLIENT_URL',
  'JWT_TOKEN',
  'OCD_API_KEY',
  'PAYPAL_CLIENT_ID',
  'PAYPAL_CLIENT_SECRET',
  'MAILJET_SMTP_API',
  'MAILJET_SMTP_SECRET',
  'BITLY_ACCESS_TOKEN',
];

export const validateEnv = () => {
  necessaryEnvs.forEach((env) => {
    if (!process.env[env]) {
      console.log("Missing entry in .env '" + env + "'");
      process.exit(1);
    }
  });
};
