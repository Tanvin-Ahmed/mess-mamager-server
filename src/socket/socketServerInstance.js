let io = null;

const setSocketServerInstance = (ioInstance) => {
  io = ioInstance;
};

const getSocketServerInstance = () => io;

module.exports = {
  setSocketServerInstance,
  getSocketServerInstance,
};
