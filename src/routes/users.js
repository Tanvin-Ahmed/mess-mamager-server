var express = require("express");
const { refreshTokenGenerator } = require("../auth/refreshTokenGenerator");
const { tokenVerification } = require("../auth/tokenVerification");
const {
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
  signInWithFirebase,
} = require("../post/user/user.controller");
var router = express.Router();

router.post("/register", register);
router.post("/create-account-with-firebase", signInWithFirebase);
router.post("/login", login);
router.post("/refresh-token", refreshTokenGenerator);
router.get("/get-user-info-by-id/:id", tokenVerification, getUserInfo);
router.get("/search/:name", tokenVerification, searchPeople);
router.put("/update-manager-of-month", tokenVerification, updateUser);
router.put("/make-admin", tokenVerification, makeAdmin);
router.put("/add-meal", tokenVerification, addMeals);
router.put("/update-meal", tokenVerification, updateUserMeals);
router.put("/add-deposit", tokenVerification, addDeposit);
router.put("/delete-user-account", tokenVerification, deleteUserAccount);
router.put("/update-payment-status", tokenVerification, updatePaymentStatus);
router.get("/verify-user/:token", verifyUser);
router.post("/request-for-reset-password", requestToResetPassword);
router.put("/reset-password/:token", resetPassword);
router.put(
  "/update-notification-seen",
  tokenVerification,
  updateNotifications
);

module.exports = router;
