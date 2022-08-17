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
} = require("../post/user/user.controller");
var router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshTokenGenerator);
router.get("/get-user-info-by-id/:id", tokenVerification, getUserInfo);
router.get("/search/:name", tokenVerification, searchPeople);
router.put("/update-manager-of-month", tokenVerification, updateUser);
router.put("/make-admin", tokenVerification, makeAdmin);

module.exports = router;
