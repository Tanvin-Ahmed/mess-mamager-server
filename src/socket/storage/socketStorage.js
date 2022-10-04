let activeUsers = [];

const setActiveUsers = (data) => {
  activeUsers.push(data);
};

const deleteActiveUsers = (socketId) => {
  activeUsers = activeUsers.filter((user) => user.socketId !== socketId);
};

const getAllActiveUser = () => [...activeUsers];

module.exports = {
  setActiveUsers,
  deleteActiveUsers,
  getAllActiveUser,
};
