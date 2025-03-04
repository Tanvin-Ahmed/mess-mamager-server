const { criptoPasswordChecker } = require("../../auth/criptoPasswordChecker");
const {
  criptoPasswordGenerator,
} = require("../../auth/criptoPasswordGenerator");
const { tokenGenerator } = require("../../auth/tokenGenerator");
const { checkUserTokenExpiration } = require("../../auth/tokenVerification");
const { pushNotification } = require("../../pushNotification/pushNotification");
const { sendEmail } = require("../../sendMail/sendMail");
const { dataSendToClient } = require("../../socket/handlers/dataSendToClient");
const { v4: uuidv4 } = require("uuid");
const {
  getUserInfoFromServerStorage,
  addUserInfoInServerStorage,
  removeUserInfoFromServerStorage,
} = require("../../storage/userStorage");
const { getMonthWithYear } = require("../../utils/monthsName");
const {
  removeMemberFromMessWhenAccountDelete,
} = require("../mess/mess.service");
const {
  subscriptionsByUserIds,
  deleteUserAllSubscriptions,
} = require("../subscription/subscription.service");
const {
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
  updateNotificationByUsersId,
  updateNotificationBySingleUserId,
  updateUserNotificationsView,
} = require("./user.service");
const { firebaseAdminAuth } = require("../../firebase/admin/firebaseAdmin");
const { getOffLineUsers } = require("../../socket/hooks/getOfflineUsers");
const { decrypt } = require("../../crypto/crypto");

const signInWithFirebase = async (req, res) => {
  try {
    const data = req.body;

    const isEmailExit = await checkEmailDuplication(data.email);

    let registerInfo;

    if (isEmailExit) {
      registerInfo = await userLogin(data.email);
    } else {
      registerInfo = await registerUser(data);
    }

    const info = JSON.parse(JSON.stringify(registerInfo));

    if (info.password) {
      delete info.password;
    }

    const tokenData = {
      _id: info._id,
      username: info.username,
      email: info.email,
    };
    const token = tokenGenerator(tokenData, "5d");

    return res.status(200).json({ token, info });
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
};

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

    const userInfo = { ...data, password: hashedPassword };
    delete userInfo.requestId;
    addUserInfoInServerStorage(data.requestId, userInfo);

    const token = tokenGenerator(
      { email: data.email, requestId: data.requestId },
      "180000ms"
    );

    const resetUrl = `http://localhost:3000/verify-user/${token}`;
    const message = `
                <div
                  style="
                    width: 100%;
                    height: 100%;
                    text-align: center;
                    padding: 2rem 0;
                  "
                >
                  <img style="width: 40%" src="https://drive.google.com/uc?export=view&id=1kO0j3xh_MyCLpiL3Uz0m-JYpHYtIM9Zs" alt="logo" />
                  <div style="text-align: center">
                    <h1>Verify user</h1>
                    <p>
                      You just want to register
                      <span style="color: dodgerblue">Mess Manager</span> app. We just check
                      your email is valid and you are a valied user.
                    </p>
                    <p>You need to verify userself by click button below.</p>
                    <h5 style="color: red">
                      Expired this validation process after 3 minutes
                    </h5>
                    <a
                      href=${resetUrl}
                      clicktracking="off"
                      style="
                        text-decoration: none;
                        background-color: dodgerblue;
                        color: white;
                        padding: 1rem 2rem;
                        border-radius: 5px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                      "
                      >Verify userself</a
                    >
                  </div>
                </div>
        `;
    const options = {
      to: data.email,
      subject: "Verify user",
      html: message,
    };
    sendEmail(options, res);
  } catch (error) {
    return res
      .status(500)
      .json({ status: "error", message: "Registration failed!" });
  }
};

const verifyUser = async (req, res) => {
  try {
    const token = req.params.token;
    const data = checkUserTokenExpiration(token, res);

    const isEmailExit = await checkEmailDuplication(data.email);

    if (isEmailExit) {
      removeUserInfoFromServerStorage(data.requestId);
      return res
        .status(409)
        .json({ message: "Email already exists!", error: true });
    }

    const userInfo = getUserInfoFromServerStorage(data.requestId);

    const registerInfo = await registerUser(userInfo);

    const info = JSON.parse(JSON.stringify(registerInfo));

    delete info.password;

    const tokenData = {
      _id: info._id,
      username: info.username,
      email: info.email,
    };
    const newToken = tokenGenerator(tokenData, "5d");

    return res.status(200).json({ newToken, info });
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const loginData = req.body;
    // console.log(data);
    // const loginData = decrypt(data);

    const userInfo = await userLogin(loginData.email);
    const info = JSON.parse(JSON.stringify(userInfo));

    const checkPassword = await criptoPasswordChecker(
      loginData.password,
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
    const token = tokenGenerator(tokenData, "5d");
    return res.status(200).json({ token, info });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "Authentication failed!" });
  }
};

const requestToResetPassword = async (req, res) => {
  try {
    const email = req.body.email;
    const isEmailExit = await checkEmailDuplication(email);

    if (!isEmailExit) {
      return res
        .status(404)
        .json({ message: "No user found!", status: "error" });
    }

    const token = tokenGenerator({ email: email }, "180000ms");

    const resetUrl = `http://localhost:3000/reset-password/${token}`;
    const message = `
                <div style="text-align: center">
                    <h1>Reset Password</h1>
                    <p>
                      You just request to reset your password of
                      <span style="color: dodgerblue">Mess Manager</span> app.
                    </p>
                    <p>You can rest your password by clicking button below.</p>
                    <h5 style="color: red">
                      Expired this validation process after 3 minutes
                    </h5>
                    <a
                      href=${resetUrl}
                      clicktracking="off"
                      style="
                        text-decoration: none;
                        background-color: dodgerblue;
                        color: white;
                        padding: 1rem 2rem;
                        border-radius: 5px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                      "
                      >Reset Password</a
                    >
                  </div>
        `;
    const options = {
      to: email,
      subject: "Reset Password",
      html: message,
    };
    sendEmail(options, res);
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong, please try again",
      status: "error",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const token = req.params.token;
    const password = req.body.password;

    const data = checkUserTokenExpiration(token, res);

    const hashedPassword = await criptoPasswordGenerator(password);

    await updatePassword(data.email, hashedPassword);

    return res
      .status(200)
      .json({ message: "reset password successfully!", status: "success" });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong, please try again",
      status: "error",
    });
  }
};

const getUserInfo = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await getUserInfoById(id);
    return res.status(200).json(user);
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
    const { date, memberId, membersId } = req.body;
    const updatedUser = await updateUserManagerDate(memberId, date);
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

    const memebersSubscriptionData = await subscriptionsByUserIds([
      ...membersId,
    ]);

    if (memebersSubscriptionData.length) {
      const messName = memebersSubscriptionData[0].userId.memberOfMess.messName;

      const notificationData = {
        id: uuidv4(),
        body: admin
          ? `Congratulations! ${updatedUser.username} select as new admin of ${messName} mess😍`
          : `${updatedUser.username} remove from the admin of ${messName} mess!`,
        data: {
          url: "/admin-dashboard",
        },
        createdAt: new Date().toUTCString(),
        seen: false,
      };

      // store notification in DB
      await updateNotificationByUsersId(membersId, notificationData);

      // push notification to client
      memebersSubscriptionData.forEach(async ({ subscription }) => {
        await pushNotification(subscription, notificationData);
      });

      dataSendToClient("user-notification", notificationData, [...membersId]);
    }

    return res.status(200).json({
      updatedUser,
      message: updatedUser.admin
        ? "Added new admin successfully!"
        : "Remove admin successfully!",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "Something went worng!" });
  }
};

const addMeals = async (req, res) => {
  const { username } = req.body;
  try {
    const { id, messId, meals, date, membersId, totalMeal } = req.body;

    const updatedData = await AddMeal({
      id,
      messId,
      meals,
      date,
      totalMeal,
    });

    dataSendToClient("add-meals", updatedData, [...membersId]);

    const userSubscription = await subscriptionsByUserIds([id]);

    if (userSubscription.length) {
      const notificationData = {
        id: uuidv4(),
        body: `${
          userSubscription[0].userId.username
        }📢📢!!! manager add your meals. Now your total meals of ${getMonthWithYear(
          date
        )} is ${totalMeal}.`,
        data: {
          url: "/profile",
        },
        createdAt: new Date().toUTCString(),
        seen: false,
      };

      // store notification in DB
      await updateNotificationBySingleUserId(id, notificationData);
      dataSendToClient("user-notification", notificationData, [id]);

      const isUserInactive = getOffLineUsers([id]);

      if (isUserInactive.length) {
        // push notification to client
        userSubscription.forEach(async ({ subscription }) => {
          await pushNotification(subscription, notificationData);
        });
      }
    }

    return res.status(201).json({
      message: `Added ${username}'s meals successfully!`,
      success: true,
    });
  } catch (error) {
    return res
      .status(500)
      .send({ message: `${username}'s meal not added!`, error: true });
  }
};

const updateUserMeals = async (req, res) => {
  const { username } = req.body;
  try {
    const { id, messId, meals, date, membersId, totalMeal } = req.body;
    const updatedData = await updateMeal({
      id,
      messId,
      meals,
      date,
      totalMeal,
    });

    dataSendToClient("update-meals", updatedData, [...membersId]);

    const userSubscription = await subscriptionsByUserIds([id]);

    if (userSubscription.length) {
      const notificationData = {
        id: uuidv4(),
        body: `${userSubscription[0].userId.username}📢! Your meal update by manager! Now your total meal is ${totalMeal}`,
        data: {
          url: "/profile",
        },
        createdAt: new Date().toUTCString(),
        seen: false,
      };

      // store notification in DB
      await updateNotificationBySingleUserId(id, notificationData);
      dataSendToClient("user-notification", notificationData, [id]);

      const isUserInactive = getOffLineUsers([id]);

      if (isUserInactive.length) {
        // push notification to client
        userSubscription.forEach(async ({ subscription }) => {
          await pushNotification(subscription, notificationData);
        });
      }
    }

    return res.status(201).json({
      message: `Updated ${username}'s meals successfully!`,
      success: true,
    });
  } catch (error) {
    return res
      .status(500)
      .send({ message: `${username}'s meal not updated!`, error: true });
  }
};

const addDeposit = async (req, res) => {
  try {
    const { userId, amount, date, membersId } = req.body;

    const updatedInfo = await AddDeposit({ userId, amount, date });

    const userSubscription = await subscriptionsByUserIds([userId]);

    dataSendToClient("add-deposit", updatedInfo, [...membersId]);

    if (userSubscription.length) {
      const notificationData = {
        id: uuidv4(),
        body: `📢 ${userSubscription[0].userId.username} your total deposit amount is ${amount}.`,
        data: {
          url: "/profile",
        },
        createdAt: new Date().toUTCString(),
        seen: false,
      };

      // store notification in DB
      await updateNotificationBySingleUserId(userId, notificationData);
      dataSendToClient("user-notification", notificationData, [userId]);

      const isUserInactive = getOffLineUsers([userId]);

      if (isUserInactive.length) {
        // push notification to client
        userSubscription.forEach(async ({ subscription }) => {
          await pushNotification(subscription, notificationData);
        });
      }
    }

    return res
      .status(200)
      .json({ message: "Deposit added successfully!", success: true });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error adding deposit!", error: true });
  }
};

const updateAllMembersManagerDate = async (dates, index) => {
  try {
    if (dates.length === index) {
      return "update all members manager date!";
    }
    await updateManagerDateWhenAccountDelete(
      dates[index]._id,
      dates[index].nextManagerDate
    );
    return await updateAllMembersManagerDate(dates, ++index);
  } catch (error) {
    return error;
  }
};

const deleteUserAccount = async (req, res) => {
  try {
    const { userId, membersId, updatedManagerOfTheMonth, messId, firebaseUID } =
      req.body;

    if (firebaseUID) {
      await firebaseAdminAuth.deleteUser(firebaseUID);
    }

    await deleteAccount(userId);
    await deleteUserAllSubscriptions(userId);

    if (messId) {
      await removeMemberFromMessWhenAccountDelete(userId, messId);
      await updateAllMembersManagerDate(updatedManagerOfTheMonth, 0);
    }

    dataSendToClient(
      "delete-user-account",
      { updatedManagerOfTheMonth, userId, messId },
      [...membersId]
    );

    return res.status(200).json({
      message: "Wish you come back to me very soon..😔!!",
      status: "success",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong, please try again!",
      error: true,
    });
  }
};

const updatePaymentStatus = async (req, res) => {
  try {
    const { userId, paymentStatus, membersId, date } = req.body;

    const updatedUserInfo = await updateUserPaymentStatus(
      userId,
      paymentStatus,
      date
    );

    dataSendToClient("update-user-payment-status", updatedUserInfo, [
      ...membersId,
    ]);

    const userSubscription = await subscriptionsByUserIds([userId]);

    if (userSubscription.length) {
      const notificationData = {
        id: uuidv4(),
        body: paymentStatus
          ? `📢📢 ${
              userSubscription[0].userId.username
            }, you completed the transaction of month ${getMonthWithYear(
              date
            )}!`
          : `📢📢 ${
              userSubscription[0].userId.username
            }, you not complete the transaction of month ${getMonthWithYear(
              date
            )}! Please do that as soon as possible!`,

        data: {
          url: "/profile",
        },
        createdAt: new Date().toUTCString(),
        seen: false,
      };

      // store notification in DB
      await updateNotificationBySingleUserId(userId, notificationData);
      dataSendToClient("user-notification", notificationData, [userId]);

      const isUserInactive = getOffLineUsers([userId]);

      if (isUserInactive.length) {
        userSubscription.forEach(async ({ subscription }) => {
          await pushNotification(subscription, notificationData);
        });
      }
    }

    return res.status(200).json({ status: "success" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Payment status not updated, please try again!",
      error: true,
    });
  }
};

const updateNotifications = async (req, res) => {
  try {
    const userId = req.body.userId;
    const needToUpdateNumber = req.body.count;

    [...new Array(needToUpdateNumber)].forEach(async () => {
      await updateUserNotificationsView(userId);
    });

    return res.status(200).json({
      message: "successfully updated notification seen status!",
      status: "success",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message, status: "error" });
  }
};

module.exports = {
  signInWithFirebase,
  register,
  login,
  getUserInfo,
  searchPeople,
  updateUser,
  makeAdmin,
  addMeals,
  updateUserMeals,
  addDeposit,
  deleteUserAccount,
  updatePaymentStatus,
  verifyUser,
  requestToResetPassword,
  resetPassword,
  updateNotifications,
};
