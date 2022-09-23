const { dataSendToClient } = require("../../socket/handlers/dataSendToClient");
const { getOffLineUsers } = require("../../socket/hooks/getOfflineUsers");
const {
  createMessage,
  findChatCount,
  findOlderMessages,
  storeReactInDB,
  updateReactInDB,
  deleteUserReactFromDB,
  deleteMessageFromDB,
  updateMessageTextInDB,
  updateSeenStatusInDB,
} = require("./messages.service");
const { v4: uuidv4 } = require("uuid");
const { pushNotification } = require("../../pushNotification/pushNotification");
const {
  subscriptionsByUserIds,
} = require("../subscription/subscription.service");

const sendMessage = async (req, res) => {
  try {
    const { message, membersId } = req.body;

    const newMessage = await createMessage(message);

    dataSendToClient("new-message", newMessage, [...membersId]);

    const offlineUsers = getOffLineUsers([...membersId]);
    const membersSubscriptionData = await subscriptionsByUserIds(offlineUsers);

    if (membersSubscriptionData.length > 0) {
      const notificationData = {
        id: uuidv4(),
        body: `Message from ${newMessage.sender.username}: ${newMessage.message}`,
        data: {
          url: "/chat",
        },
        createdAt: new Date().toUTCString(),
        seen: false,
      };

      // push notification to client
      membersSubscriptionData.forEach(async ({ subscription }) => {
        await pushNotification(subscription, notificationData);
      });
    }

    return res.status(200).json({});
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getMessageCount = async (req, res) => {
  try {
    const messId = req.params.messId;
    const count = await findChatCount(messId);
    return res.status(200).json({ count });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getOlderMessages = async (req, res) => {
  try {
    const { messId, limit, page } = req.body;

    const messages = await findOlderMessages(messId, limit, page);

    return res.status(200).json(messages);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const sendReact = async (req, res) => {
  try {
    const info = req.body;

    const reactInfo = await storeReactInDB(info);

    dataSendToClient("give-react", reactInfo, [...info.membersId]);

    return res
      .status(200)
      .json({ message: "React set successfully!", status: "info" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "React not set, please try again!", status: "error" });
  }
};

const updateReact = async (req, res) => {
  try {
    const info = req.body;

    const updatedMessage = await updateReactInDB(info);

    dataSendToClient("give-react", updatedMessage, [...info.membersId]);

    return res
      .status(200)
      .json({ message: "React updated successfully!", status: "info" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "React not update, please try again!",
      status: "error",
    });
  }
};

const deleteUserReact = async (req, res) => {
  try {
    const info = req.body;

    await deleteUserReactFromDB(info);

    const data = {
      messageId: info.messageId,
      userId: info.userId,
    };

    dataSendToClient("delete-react", data, [...info.membersId]);

    return res
      .status(200)
      .json({ message: "React deleted successfully!", status: "info" });
  } catch (error) {
    return res.status(500).json({
      message: "React not deleted, please try again!",
      status: "error",
    });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const messageId = req.params.messageId;

    const membersId = req.body.membersId;

    await deleteMessageFromDB(messageId);

    dataSendToClient("delete-message", { messageId }, [...membersId]);

    return res
      .status(200)
      .json({ message: "Message deleted successfully!", status: "info" });
  } catch (error) {
    return res.status(500).json({
      message: "Message not deleted, please try again!",
      status: "error",
    });
  }
};

const updateMessage = async (req, res) => {
  try {
    const message = req.body;

    const updatedMsg = await updateMessageTextInDB(message);

    dataSendToClient("update-message", updatedMsg, [...message.membersId]);

    return res
      .status(200)
      .json({ message: "Message updated successfully!", status: "info" });
  } catch (error) {
    return res.status(500).json({
      message: "Message not updated, please try again!",
      status: "error",
    });
  }
};

const updateSeenStatus = async (req, res) => {
  try {
    const info = req.body;

    const data = await updateSeenStatusInDB(info);

    dataSendToClient("update-seen-status-of-messages", data, [
      ...info.membersId,
    ]);

    return res
      .status(200)
      .json({ message: "seen updated successfully!", status: "info" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Seen not updated, please try again!",
      status: "error",
    });
  }
};

module.exports = {
  sendMessage,
  getMessageCount,
  getOlderMessages,
  sendReact,
  updateReact,
  deleteUserReact,
  deleteMessage,
  updateMessage,
  updateSeenStatus,
};
