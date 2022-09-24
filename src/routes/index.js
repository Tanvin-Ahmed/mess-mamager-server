const express = require("express");
const { tokenVerification } = require("../auth/tokenVerification");
const {
  addSubscription,
  getUserSubscription,
  deleteUserSubscription,
} = require("../post/subscription/subscription.controller");

const router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  return res.send(`<h1>Welcome to Express Server</h1>`);
});

router.post("/subscription", tokenVerification, addSubscription);
router.post("/find-subscriptions", getUserSubscription);
router.put("/subscription/delete", deleteUserSubscription);

module.exports = router;
