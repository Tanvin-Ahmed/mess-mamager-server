const jwt = require("jsonwebtoken");
const { config } = require("../config/config");

module.exports.tokenGenerator = (data, exp) => {
  try {
    const token = jwt.sign({ data }, config.jwt_secret, { expiresIn: exp });
    return token;
  } catch (error) {
    console.log(error);
  }
};
