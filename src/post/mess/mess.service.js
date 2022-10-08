const { postMess } = require("./mess.model");
const { postUser } = require("../user/user.model");
const mongoose = require("mongoose");
const { config } = require("../../config/config");

const checkIfMonthListLengthGraterThanThree = async (id) => {
  try {
    const _id = mongoose.Types.ObjectId(id);
    const messInfo = await postMess.findById(_id).select("monthList");

    const monthList = Object.keys(messInfo.monthList);

    if (monthList.length > 3) {
      return await postMess.findByIdAndUpdate(_id, {
        $unset: { ["monthList." + monthList[0]]: 1 },
      });
    }
    return "all is ok";
  } catch (error) {
    return new Error(error.message);
  }
};

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
    return new Error(error);
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
    .slice({ members: [0, 10] })
    .select("-createdAt -updatedAt")
    .exec();
};

const addMember = async (newMembers, oldMembers, id) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const _id = mongoose.Types.ObjectId(id);
    const updatedMess = await postMess
      .findByIdAndUpdate(
        _id,
        { members: [...newMembers, ...oldMembers] },
        { session: session, new: true }
      )
      .populate({
        path: "members",
        model: config.user_info_collection,
        select: "email _id username admin managerOfTheMonths monthList",
      })
      .select("_id messName members")
      .exec();

    await postUser.updateMany(
      {
        _id: [...newMembers],
      },
      { memberOfMess: _id },
      { session: session }
    );

    await session.commitTransaction();
    await session.endSession();

    return updatedMess;
  } catch (error) {
    await session.commitTransaction();
    await session.endSession();
    return new Error(error);
  }
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

    const updatedUser = await postUser.findByIdAndUpdate(
      _userId,
      {
        $unset: { memberOfMess: 1 },
        managerOfTheMonths: [],
        admin: false,
        monthList: {},
        notifications: [],
      },
      { session: session, new: true }
    );

    await session.commitTransaction();
    await session.endSession();

    return {
      updatedUser,
      messId,
    };
  } catch (error) {
    await session.commitTransaction();
    await session.endSession();
    return new Error(error);
  }
};

const AddOthersCost = async ({ messId, cost, date }) => {
  const _id = mongoose.Types.ObjectId(messId);

  const key = Object.keys(cost)[0];

  const updatedMessInfo = await postMess
    .findByIdAndUpdate(
      _id,
      {
        ["monthList." + date + ".othersCost." + key]: cost[key],
      },
      { new: true }
    )
    .select("_id monthList");

  await checkIfMonthListLengthGraterThanThree(_id);

  return updatedMessInfo;
};

const addMarketCost = async ({ messId, marketCost, date }) => {
  const _id = mongoose.Types.ObjectId(messId);

  const updatedMessInfo = await postMess
    .findByIdAndUpdate(
      _id,
      {
        ["monthList." + date + ".totalMarketCost"]: marketCost,
      },
      { new: true }
    )
    .select("_id monthList");

  await checkIfMonthListLengthGraterThanThree(_id);

  return updatedMessInfo;
};

const removeMemberFromMessWhenAccountDelete = async (userId, messId) => {
  const _userId = mongoose.Types.ObjectId(userId);
  const _messId = mongoose.Types.ObjectId(messId);

  return await postMess.findByIdAndUpdate(_messId, {
    $pull: { members: _userId },
  });
};

module.exports = {
  createMess,
  getMessInfoById,
  addMember,
  removeMemberFromMess,
  AddOthersCost,
  addMarketCost,
  removeMemberFromMessWhenAccountDelete,
  checkIfMonthListLengthGraterThanThree,
};
