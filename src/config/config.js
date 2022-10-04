module.exports.config = {
  db_url: process.env.DB_URL,
  user_info_collection: process.env.USER_INFO_COLLECTION,
  mess_info_collection: process.env.MESS_INFO_COLLECTION,
  messages_collection: process.env.MESSAGES_COLLECTION,

  jwt_secret: process.env.JWT_SECRET,
  vAPIDPublicKey: process.env.vAPIDPublicKey,
  vAPIDPrivateKey: process.env.vAPIDPrivateKey,
  subscription_collection: process.env.SUBSCRIPTION_COLLECTION,
  crypto_secret_key: process.env.CRYPTO_SECRET_KEY,

  email_service: process.env.EMAIL_SERVICE,
  email_from: process.env.EMAIL_FROM,
  email_password: process.env.EMAIL_PASSWORD,
  email_authorization: process.env.AUTHORIZATION,

  // firebase
  type: process.env.TYPE,
  project_id: process.env.PROJECT_ID,
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key: process.env.PRIVATE_KEY,
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
  auth_uri: process.env.AUTH_URI,
  token_uri: process.env.TOKEN_URI,
  auth_provier_url: process.env.AUTH_PROVIDER_URL,
  client_cert_url: process.env.CLIENT_CERT_URL,
};
