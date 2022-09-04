const { postUser } = require("./user.model");
const mongoose = require("mongoose");
const { postMess } = require("../mess/mess.model");
const { config } = require("../../config/config");

const checkEmailDuplication = async (email) => {
  return await postUser.exists({ email });
};

const registerUser = async (data) => {
  return await postUser.create(data);
};

const userLogin = async (email) => {
  return await postUser.findOne({ email }).populate({
    path: "memberOfMess",
    model: config.mess_info_collection,
    select: "_id messName",
  });
};

const getUserInfoById = async (id) => {
  const _id = mongoose.Types.ObjectId(id);
  return await postUser.findById(_id).populate({
    path: "memberOfMess",
    model: config.mess_info_collection,
    select: "_id messName",
  });
};

const searchUser = async (name) => {
  return await postUser
    .find({
      username: new RegExp(name, "i"),
    })
    .limit(10)
    .select("_id username email");
};

const updateUserById = async (id, date) => {
  const _id = mongoose.Types.ObjectId(id);
  const info = await postUser.findById(_id).select("_id managerOfTheMonths");

  if (info.managerOfTheMonths.length === 2) {
    await postUser.findByIdAndUpdate(_id, {
      $pop: { managerOfTheMonths: -1 },
    });
  }

  return await postUser
    .findByIdAndUpdate(
      _id,
      {
        $addToSet: { managerOfTheMonths: date },
      },
      { new: true }
    )
    .select("_id managerOfTheMonths");
};

const updateAdminData = async (id, adminData) => {
  const _id = mongoose.Types.ObjectId(id);
  return await postUser
    .findByIdAndUpdate(_id, { admin: adminData }, { new: true })
    .select("_id admin");
};

const AddMeal = async ({ id, meals, date, messId, totalMeal }) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const _id = mongoose.Types.ObjectId(id);
    const _messId = mongoose.Types.ObjectId(messId);

    const updatedUser = await postUser
      .findByIdAndUpdate(
        _id,
        {
          $addToSet: { ["monthList." + date + ".mealList"]: meals },
        },
        { session: session, new: true }
      )
      .select("_id monthList");

    const updatedMess = await postMess
      .findByIdAndUpdate(
        _messId,
        {
          ["monthList." + date + ".totalMeal." + id]: Number(totalMeal),
        },
        { session: session, new: true }
      )
      .select("_id monthList");

    await session.commitTransaction();
    await session.endSession();

    return { updatedUser, updatedMess };
  } catch (error) {
    await session.commitTransaction();
    await session.endSession();
    return null;
  }
};

const updateMeal = async ({ id, meals, date, messId, totalMeal }) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const _id = mongoose.Types.ObjectId(id);
    const _messId = mongoose.Types.ObjectId(messId);

    const updatedUserInfo = await postUser
      .updateOne(
        { _id: _id, ["monthList." + date + ".mealList.date"]: meals.date },
        {
          $set: {
            ["monthList." + date + ".mealList.$.breakfast"]: meals.breakfast,
            ["monthList." + date + ".mealList.$.lunch"]: meals.lunch,
            ["monthList." + date + ".mealList.$.dinner"]: meals.dinner,
          },
        },
        {
          session: session,
          new: true,
        }
      )
      .select("_id monthList");

    const updatedMess = await postMess
      .findByIdAndUpdate(
        _messId,
        {
          monthList: {
            [date]: {
              totalMeal: {
                [id]: totalMeal,
              },
            },
          },
        },
        { session: session, new: true }
      )
      .select("_id monthList");

    await session.commitTransaction();
    await session.endSession();
    return { updatedUserInfo, updatedMess };
  } catch (error) {
    await session.commitTransaction();
    await session.endSession();
    return null;
  }
};

const AddDeposit = async ({ userId, amount, date }) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const _id = mongoose.Types.ObjectId(userId);

    let updatedUser = await postUser
      .findByIdAndUpdate(
        _id,
        {
          ["monthList." + date + ".deposit"]: amount,
        },
        {
          session: session,
          new: true,
        }
      )
      .select("_id memberOfMess monthList");

    updatedUser = JSON.parse(JSON.stringify(updatedUser));

    const messId = mongoose.Types.ObjectId(updatedUser.memberOfMess);

    const updatedMess = await postMess
      .findByIdAndUpdate(
        messId,
        {
          ["monthList." + date + ".totalDeposit." + userId]: amount,
        },
        {
          session: session,
          new: true,
        }
      )
      .select("_id monthList");

    await session.commitTransaction();
    await session.endSession();

    delete updatedUser.memberOfMess;

    return { updatedUser, updatedMess };
  } catch (error) {
    await session.commitTransaction();
    await session.endSession();
    return null;
  }
};

module.exports = {
  registerUser,
  userLogin,
  getUserInfoById,
  checkEmailDuplication,
  searchUser,
  updateUserById,
  updateAdminData,
  AddMeal,
  updateMeal,
  AddDeposit,
};
