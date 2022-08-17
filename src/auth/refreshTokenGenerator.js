const { config } = require("../config/config");
const jwt = require("jsonwebtoken");

module.exports.refreshTokenGenerator = async (req, res) => {
  try {
    const { token } = req.body;
    const { data } = jwt.verify(token, config.jwt_secret);
    const updatedToken = await jwt.sign({ data }, config.jwt_secret, {
      expiresIn: "5d",
    });
    return res.status(200).json(updatedToken);
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "Token not negerated!" });
  }
};
