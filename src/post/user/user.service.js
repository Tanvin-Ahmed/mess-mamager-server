const { postUser } = require("./user.model");
const mongoose = require("mongoose");
const { postMess } = require("../mess/mess.model");
const { config } = require("../../config/config");
const {
  checkIfMonthListLengthGraterThanThree,
} = require("../mess/mess.service");

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

const updatePassword = async (email, password) => {
  return await postUser.updateOne(
    { email },
    {
      password: password,
    }
  );
};

const getUserInfoById = async (id) => {
  const _id = mongoose.Types.ObjectId(id);
  return await postUser
    .findById(_id)
    .populate({
      path: "memberOfMess",
      model: config.mess_info_collection,
      select: "_id messName",
    })
    .select("-password");
};

const searchUser = async (name) => {
  return await postUser
    .find({
      username: new RegExp(name, "i"),
    })
    .limit(10)
    .select("_id username email memberOfMess");
};

const updateUserManagerDate = async (id, date) => {
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

const updateManagerDateWhenAccountDelete = async (id, date) => {
  const _id = mongoose.Types.ObjectId(id);
  const info = await postUser.findById(_id).select("_id managerOfTheMonths");

  if (info.managerOfTheMonths.length) {
    await postUser.findByIdAndUpdate(_id, {
      $pop: { managerOfTheMonths: 1 },
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

    await checkIfMonthListLengthGraterThanThree(_messId);

    return { updatedUser, updatedMess };
  } catch (error) {
    await session.commitTransaction();
    await session.endSession();
    return new Error(error);
  }
};

const updateMeal = async ({ id, meals, date, messId, totalMeal }) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const _id = mongoose.Types.ObjectId(id);
    const _messId = mongoose.Types.ObjectId(messId);

    await postUser.updateOne(
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
      }
    );

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

    const updatedUserInfo = await postUser
      .findById(_id)
      .select("_id monthList");

    return { updatedUserInfo, updatedMess };
  } catch (error) {
    await session.commitTransaction();
    await session.endSession();
    return new Error(error);
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

    await checkIfMonthListLengthGraterThanThree(messId);

    delete updatedUser.memberOfMess;

    return { updatedUser, updatedMess };
  } catch (error) {
    await session.commitTransaction();
    await session.endSession();
    return new Error(error);
  }
};

const deleteAccount = async (userId) => {
  const _id = mongoose.Types.ObjectId(userId);

  return await postUser.findByIdAndDelete(_id);
};

const updateUserPaymentStatus = async (userId, paymentStatus, date) => {
  const _id = mongoose.Types.ObjectId(userId);
  return await postUser
    .findByIdAndUpdate(
      _id,
      {
        ["monthList." + date + ".paymentStatus"]: paymentStatus,
      },
      { new: true }
    )
    .select("_id monthList");
};

const checkNotificationLimits = async (ids = [], session) => {
  try {
    const usersInfo = await postUser.find({ _id: [...ids] });

    if (usersInfo.length) {
      usersInfo.forEach(async (userInfo) => {
        if (userInfo.notifications) {
          if (userInfo.notifications.length >= 20) {
            const _id = mongoose.Types.ObjectId(userInfo._id);
            await postUser.findByIdAndUpdate(
              _id,
              {
                $pop: {
                  notifications: -1,
                },
              },
              { session: session }
            );
          }
        }
      });
    }
    return;
  } catch (error) {
    throw new Error(error);
  }
};

const updateNotificationBySingleUserId = async (id, notificationData) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const _id = mongoose.Types.ObjectId(id);

    await checkNotificationLimits([_id], session);

    const updatedUser = await postUser
      .findByIdAndUpdate(
        _id,
        {
          $addToSet: {
            notifications: notificationData,
          },
        },
        { session: session, new: true }
      )
      .select("_id notifications");
    await session.commitTransaction();
    await session.endSession();

    return updatedUser;
  } catch (error) {
    await session.commitTransaction();
    await session.endSession();

    return error;
  }
};

const updateNotificationByUsersId = async (usersId, notificationData) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await checkNotificationLimits(usersId, session);

    await postUser.updateMany(
      { _id: [...usersId] },
      { $addToSet: { notifications: notificationData } },
      { session: session }
    );
    await session.commitTransaction();
    await session.endSession();

    return { message: "successfully add notifications", status: "success" };
  } catch (error) {
    await session.commitTransaction();
    await session.endSession();
    throw new Error(error);
  }
};

const updateUserNotificationsView = async (userId, notifications) => {
  const _id = mongoose.Types.ObjectId(userId);

  return await postUser
    .findByIdAndUpdate(
      _id,
      {
        notifications: notifications,
      },
      { new: true }
    )
    .select("_id notifications");
};

module.exports = {
  registerUser,
  userLogin,
  getUserInfoById,
  checkEmailDuplication,
  searchUser,
  updateUserManagerDate,
  updateAdminData,
  AddMeal,
  updateMeal,
  AddDeposit,
  updateManagerDateWhenAccountDelete,
  deleteAccount,
  updateUserPaymentStatus,
  updatePassword,
  updateNotificationBySingleUserId,
  updateNotificationByUsersId,
  updateUserNotificationsView,
};
