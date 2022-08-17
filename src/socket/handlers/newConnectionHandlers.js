const { setActiveUsers } = require("../storage/socketStorage");

const newConnectionHandler = (socket) => {
  const userDetails = socket.user;
  setActiveUsers({ socketId: socket.id, userId: userDetails?._id });
};

module.exports = {
  newConnectionHandler,
};
