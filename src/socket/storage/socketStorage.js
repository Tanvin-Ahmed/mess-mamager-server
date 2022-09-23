let activeUsers = [];

const setActiveUsers = (data) => {
  const index = activeUsers.findIndex((u) => u.userId === data.userId);

  if (index !== -1) {
    activeUsers.splice(index, 1, data);
  } else {
    activeUsers.push(data);
  }
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
