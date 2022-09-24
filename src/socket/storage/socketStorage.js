let activeUsers = [];

const setActiveUsers = (data) => {
  activeUsers.push(data);

  console.log(activeUsers);
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
