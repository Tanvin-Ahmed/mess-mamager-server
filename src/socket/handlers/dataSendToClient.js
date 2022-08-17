const { getSocketServerInstance } = require("../socketServerInstance");
const { getAllActiveUser } = require("../storage/socketStorage");

module.exports.dataSendToClient = (url = "", data, to = []) => {
  const io = getSocketServerInstance();
  const activeUsers = getAllActiveUser();

  if (to.length) {
    let receivers = [];

    to.forEach((t) => {
      const arr = activeUsers.filter((user) => user.userId === t);
      receivers = [...receivers, ...arr];
    });

    receivers.forEach((receiver) => io.to(receiver.socketId).emit(url, data));
  } else {
    io.emit(url, data);
  }
};
