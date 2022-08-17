const { deleteActiveUsers } = require("../storage/socketStorage");

const disconnectHandler = (socket) => {
  deleteActiveUsers(socket.id);
};

module.exports = {
  disconnectHandler,
};
