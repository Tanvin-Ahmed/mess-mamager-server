const { postMess } = require("./mess.model");
const { postUser } = require("../user/user.model");
const mongoose = require("mongoose");
const { config } = require("../../config/config");

const createMess = async ({ data, creatorId }) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const [newPost] = await postMess.create([data], { session: session });

    await postUser.updateMany(
      { _id: [...newPost.members] },
      { memberOfMess: newPost._id },
      { session: session }
    );

    await postUser.findByIdAndUpdate(
      creatorId,
      { admin: true },
      { session: session }
    );

    await session.commitTransaction();
    await session.endSession();

    return { memberOfMess: newPost._id };
  } catch (error) {
    await session.commitTransaction();
    await session.endSession();
    return null;
  }
};

const getMessInfoById = async (id) => {
  const _id = mongoose.Types.ObjectId(id);
  return await postMess
    .findById(_id)
    .populate({
      path: "members",
      model: config.user_info_collection,
      select: "email _id username managerOfTheMonths admin monthList",
    })
    .select("-createdAt -updatedAt")
    .exec();
};

const addMember = async (members, id) => {
  const _id = mongoose.Types.ObjectId(id);
  const oldMembers = await postMess.findById(_id).select("members");
  const old = JSON.parse(JSON.stringify(oldMembers));
  // remove duplicates
  const newMembers = [...new Set([...old.members, ...members])];
  const updatedMess = await postMess
    .findByIdAndUpdate(_id, { members: newMembers }, { new: true })
    .populate({
      path: "members",
      model: config.user_info_collection,
      select: "email _id username admin managerOfTheMonths monthList",
    })
    .select("-createdAt -updatedAt")
    .exec();
  await postUser.updateMany(
    {
      _id: [...members],
    },
    { memberOfMess: _id }
  );

  const newMessInfo = JSON.parse(JSON.stringify(updatedMess));

  return { newMessInfo, oldMembers: [...old.members] };
};

const removeMemberFromMess = async (userId, messId) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const _userId = mongoose.Types.ObjectId(userId);
    const _messId = mongoose.Types.ObjectId(messId);

    await postMess.findByIdAndUpdate(
      _messId,
      {
        $pull: { members: _userId },
      },
      { session: session }
    );

    await postUser.findByIdAndUpdate(
      _userId,
      {
        memberOfMess: mongoose.Types.ObjectId(),
        managerOfTheMonths: [],
        admin: false,
      },
      { session: session }
    );

    await session.commitTransaction();
    await session.endSession();

    return {
      updatedUser: {
        _id: userId,
        memberOfMess: "",
        managerOfTheMonths: [],
        admin: false,
      },
      messId,
    };
  } catch (error) {
    await session.commitTransaction();
    await session.endSession();
    return null;
  }
};

const AddOthersCost = async ({ messId, cost, date }) => {
  const _id = mongoose.Types.ObjectId(messId);

  const key = Object.keys(cost)[0];

  return await postMess
    .findByIdAndUpdate(
      _id,
      {
        ["monthList." + date + ".othersCost." + key]: cost[key],
      },
      { new: true }
    )
    .select("_id monthList");
};

const addMarketCost = async ({ messId, marketCost, date }) => {
  const _id = mongoose.Types.ObjectId(messId);

  return await postMess
    .findByIdAndUpdate(
      _id,
      {
        ["monthList." + date + ".totalMarketCost"]: marketCost,
      },
      { new: true }
    )
    .select("_id monthList");
};

module.exports = {
  createMess,
  getMessInfoById,
  addMember,
  removeMemberFromMess,
  AddOthersCost,
  addMarketCost,
};
