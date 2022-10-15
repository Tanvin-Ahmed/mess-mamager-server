const mongoose = require("mongoose");
const { config } = require("../../config/config");
const { postMessage } = require("./messages.model");

const createMessage = async (message) => {
  return await (
    await postMessage.create(message)
  ).populate({
    path: "sender",
    model: config.user_info_collection,
    select: "_id username",
  });
};

const findChatCount = async (messId) => {
  const _id = mongoose.Types.ObjectId(messId);
  return await postMessage.countDocuments({ messId: _id });
};

const findOlderMessages = async (messId, limit, page) => {
  const _id = mongoose.Types.ObjectId(messId);

  return await postMessage
    .find({ messId: _id })
    .sort({ _id: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate({
      path: "sender",
      model: config.user_info_collection,
      select: "_id username",
    })
    .populate({
      path: "react.sender",
      model: config.user_info_collection,
      select: "_id username photoUrl",
    })
    .populate({
      path: "seen",
      model: config.user_info_collection,
      select: "_id username photoUrl",
    });
};

const storeReactInDB = async (info) => {
  const _id = mongoose.Types.ObjectId(info.messageId);

  return await postMessage
    .findByIdAndUpdate(
      _id,
      {
        $addToSet: { react: info.react },
      },
      { new: true }
    )
    .select("_id react")
    .populate({
      path: "react.sender",
      model: config.user_info_collection,
      select: "_id username photoUrl",
    });
};

const updateReactInDB = async (info) => {
  const _id = mongoose.Types.ObjectId(info.messageId);
  const _userId = mongoose.Types.ObjectId(info.userId);

  await postMessage.updateOne(
    { _id, "react.sender": _userId },
    {
      $set: { "react.$.react": info.react },
    }
  );

  return await postMessage.findById(_id).select("_id react").populate({
    path: "react.sender",
    model: config.user_info_collection,
    select: "_id username photoUrl",
  });
};

const deleteUserReactFromDB = async (info) => {
  const _id = mongoose.Types.ObjectId(info.messageId);
  const _userId = mongoose.Types.ObjectId(info.userId);

  return await postMessage
    .findByIdAndUpdate(
      _id,
      {
        $pull: { react: { sender: _userId } },
      },
      { new: true }
    )
    .select("_id");
};

const deleteMessageFromDB = async (messageId) => {
  const _id = mongoose.Types.ObjectId(messageId);

  return await postMessage.findByIdAndDelete(_id);
};

const updateMessageTextInDB = async (message) => {
  const _id = mongoose.Types.ObjectId(message._id);

  return await postMessage
    .findByIdAndUpdate(
      _id,
      {
        message: message.message,
        updatedAt: message.updatedAt,
      },
      { new: true }
    )
    .select("_id message updatedAt");
};

const updateSeenStatusInDB = async (info) => {
  const _ids = info.messagesId.map((id) => mongoose.Types.ObjectId(id));
  const _userId = mongoose.Types.ObjectId(info.userId);

  await postMessage.updateMany(
    { _id: _ids },
    {
      $addToSet: { seen: _userId },
    }
  );

  return await postMessage.find({ _id: _ids }).select("_id seen").populate({
    path: "seen",
    model: config.user_info_collection,
    select: "_id username photoUrl",
  });
};

const removeChatsBySenderId = async (senderId) => {
  const _senderId = mongoose.Types.ObjectId(senderId);

  return await postMessage.deleteMany({ sender: _senderId });
};

module.exports = {
  createMessage,
  findChatCount,
  findOlderMessages,
  storeReactInDB,
  updateReactInDB,
  deleteUserReactFromDB,
  deleteMessageFromDB,
  updateMessageTextInDB,
  updateSeenStatusInDB,
  removeChatsBySenderId,
};
