const { criptoPasswordChecker } = require("../../auth/criptoPasswordChecker");
const {
  criptoPasswordGenerator,
} = require("../../auth/criptoPasswordGenerator");
const { tokenGenerator } = require("../../auth/tokenGenerator");
const { dataSendToClient } = require("../../socket/handlers/dataSendToClient");
const {
  registerUser,
  userLogin,
  getUserInfoById,
  checkEmailDuplication,
  searchUser,
  updateUserById,
  updateAdminData,
} = require("./user.service");

const register = async (req, res) => {
  try {
    const data = req.body;
    const isEmailExit = await checkEmailDuplication(data.email);

    if (isEmailExit) {
      return res
        .status(409)
        .json({ message: "Email already exists!", error: true });
    }

    const hashedPassword = await criptoPasswordGenerator(data.password);
    const registerInfo = await registerUser({
      ...data,
      password: hashedPassword,
    });
    const info = JSON.parse(JSON.stringify(registerInfo));
    delete info.password;
    const tokenData = {
      _id: info._id,
      username: info.username,
      email: info.email,
    };
    const token = tokenGenerator(tokenData);
    return res.status(200).json({ token, info });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "Registration failed!" });
  }
};

const login = async (req, res) => {
  try {
    const data = req.body;
    const userInfo = await userLogin(data.email);
    const info = JSON.parse(JSON.stringify(userInfo));

    const checkPassword = await criptoPasswordChecker(
      data.password,
      info.password
    );

    if (!checkPassword) {
      return res
        .status(403)
        .json({ message: "Authentication failed!", error: true });
    }
    delete info.password;
    const tokenData = {
      _id: info._id,
      username: info.username,
      email: info.email,
    };
    const token = tokenGenerator(tokenData);
    return res.status(200).json({ token, info });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: true, message: "Authentication failed!" });
  }
};

const getUserInfo = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await getUserInfoById(id);
    const info = JSON.parse(JSON.stringify(user));
    delete info.password;
    return res.status(200).json(info);
  } catch (error) {
    console.log(error);
    return res
      .status(404)
      .json({ error: true, message: "Can't get user information!" });
  }
};

const searchPeople = async (req, res) => {
  try {
    const name = req.params.name;
    const accounts = await searchUser(name);
    return res.status(200).json(accounts);
  } catch (error) {
    console.log(error);
    return res
      .status(404)
      .json({ error: true, message: "Can't get user informations!" });
  }
};

const updateUser = async (req, res) => {
  try {
    const { month, memberId, membersId } = req.body;
    const updatedUser = await updateUserById(memberId, month);
    dataSendToClient("update-mamager-info-of-user", updatedUser, [
      ...membersId,
    ]);

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: true, message: "Can't update month!" });
  }
};

const makeAdmin = async (req, res) => {
  try {
    const { id, admin, membersId } = req.body;
    const updatedUser = await updateAdminData(id, admin);
    dataSendToClient("make-admin", updatedUser, [...membersId]);
    return res.status(200).json({
      updatedUser,
      message: updatedUser.admin
        ? "Added new admin successfully!"
        : "Remove admin successfully!",
    });
  } catch (error) {
    return res.status(500).json({ error: true, message: "Admin not created!" });
  }
};

module.exports = {
  register,
  login,
  getUserInfo,
  searchPeople,
  updateUser,
  makeAdmin,
};
