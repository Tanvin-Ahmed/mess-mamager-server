module.exports.config = {
  db_url: process.env.DB_URL,
  user_info_collection: process.env.USER_INFO_COLLECTION,
  mess_info_collection: process.env.MESS_INFO_COLLECTION,
  jwt_secret: process.env.JWT_SECRET,
};
