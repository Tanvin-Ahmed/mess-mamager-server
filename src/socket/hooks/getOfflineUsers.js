const { getAllActiveUser } = require("../storage/socketStorage");

module.exports.getOffLineUsers = (membersId = []) => {
  const activeUsers = getAllActiveUser();

  const offlineUsers = [];

  membersId.forEach((memberId) => {
    const user = activeUsers.find((user) => user.userId === memberId);

    if (!user) {
      offlineUsers.push(memberId);
    }
  });

  return offlineUsers;
};
