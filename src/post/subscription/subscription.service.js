const { postSubscription } = require("./subscription.model");
const mongoose = require("mongoose");
const { config } = require("../../config/config");

const createSubscription = async (info) => {
  return await postSubscription.create(info);
};

const subscriptionAlreadyExists = async (userId) => {
  const _id = mongoose.Types.ObjectId(userId);
  return await postSubscription.findOne({ userId: _id });
};

const subscriptionsByUserIds = async (userIds) => {
  try {
    const ids = userIds.map((userId) => mongoose.Types.ObjectId(userId));
    return await postSubscription
      .find({
        userId: {
          $in: [...ids],
        },
      })
      .populate({
        path: "userId",
        model: config.user_info_collection,
        select: "_id username memberOfMess",
        populate: {
          path: "memberOfMess",
          model: config.mess_info_collection,
          select: "_id messName",
        },
      })
      .select("-createdAt -updatedAt")
      .exec();
  } catch (error) {
    return error;
  }
};

const subscriptionsByUserId = async (userId) => {
  const _userId = mongoose.Types.ObjectId(userId);

  return await postSubscription.find({ userId: _userId });
};

const deleteSubscription = async (subscriptionId) => {
  const _id = mongoose.Types.ObjectId(subscriptionId);

  return await postSubscription.findByIdAndDelete(_id);
};

const deleteUserAllSubscriptions = async (userId) => {
  const _userid = mongoose.Types.ObjectId(userId);
  return await postSubscription.deleteMany({ userId: _userid });
};

module.exports = {
  createSubscription,
  subscriptionAlreadyExists,
  subscriptionsByUserIds,
  subscriptionsByUserId,
  deleteSubscription,
  deleteUserAllSubscriptions,
};
