const jwt = require("jsonwebtoken");
const { config } = require("../config/config");

module.exports.tokenGenerator = (data) => {
  try {
    const token = jwt.sign({ data }, config.jwt_secret, { expiresIn: "5d" });
    return token;
  } catch (error) {
    console.log(error);
  }
};
