const socket = require("socket.io");
const { verifySocketToken } = require("./auth/verifySocketToken");
const { disconnectHandler } = require("./handlers/disconnectHandler");
const { newConnectionHandler } = require("./handlers/newConnectionHandlers");
const { setSocketServerInstance } = require("./socketServerInstance");

module.exports.socketServerConnetion = (server) => {
  const io = socket(server, {
    cors: {
      origin: "*",
      method: ["GET", "POST"],
    },
  });

  setSocketServerInstance(io);

  io.use((socket, next) => {
    verifySocketToken(socket, next);
  });

  io.on("connect", (socket) => {
    newConnectionHandler(socket);

    socket.on("fource-to-disconnect", () => {
      socket.disconnect();
    });

    socket.on("disconnect", () => {
      disconnectHandler(socket);
    });
  });
};
