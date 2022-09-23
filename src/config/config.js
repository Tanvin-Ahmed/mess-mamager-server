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
};
