const { postUser } = require("./user.model");
const mongoose = require("mongoose");

const checkEmailDuplication = async (email) => {
  return await postUser.exists({ email });
};

const registerUser = async (data) => {
  return await postUser.create(data);
};

const userLogin = async (email) => {
  return await postUser.findOne({ email });
};

const getUserInfoById = async (id) => {
  const _id = mongoose.Types.ObjectId(id);
  return await postUser.findById(_id);
};

const searchUser = async (name) => {
  return await postUser
    .find({
      username: new RegExp(name, "i"),
    })
    .limit(10)
    .select("_id username email");
};

const updateUserById = async (id, month) => {
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
        $addToSet: { managerOfTheMonths: month },
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

module.exports = {
  registerUser,
  userLogin,
  getUserInfoById,
  checkEmailDuplication,
  searchUser,
  updateUserById,
  updateAdminData,
};
