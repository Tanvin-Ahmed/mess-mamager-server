const { config } = require("../config/config");
const jwt = require("jsonwebtoken");

module.exports.tokenVerification = async (req, res, next) => {
  try {
    let token =
      req.body.token || req.query.token || req.headers["authorization"];
    token = token.split(" ")[1];
    const decoded = jwt.verify(token, config.jwt_secret);
    req.user = decoded.data;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token!" });
  }
};

module.exports.checkUserTokenExpiration = (token, res) => {
  try {
    const { data } = jwt.verify(token, config.jwt_secret);
    return data;
  } catch (error) {
    return res.status(401).json({ message: "Time limit exist!" });
  }
};
