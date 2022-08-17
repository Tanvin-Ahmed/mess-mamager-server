const jwt = require("jsonwebtoken");
const { config } = require("../../config/config");

module.exports.verifySocketToken = (socket, next) => {
  const token = socket.handshake.auth?.token;
  try {
    const decoded = jwt.verify(token, config.jwt_secret);
    socket.user = decoded.data;
  } catch (error) {
    const socketError = new Error("NOT_AUTHORIZED");
    next(socketError);
  }

  next();
};
