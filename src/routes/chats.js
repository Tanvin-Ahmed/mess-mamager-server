const express = require("express");
const { tokenVerification } = require("../auth/tokenVerification");
const {
  sendMessage,
  getMessageCount,
  getOlderMessages,
  sendReact,
  updateReact,
  deleteUserReact,
  deleteMessage,
  updateMessage,
} = require("../post/messages/messages.controller");

const router = express.Router();

router.post("/send-message", tokenVerification, sendMessage);
router.get("/total-message-count/:messId", tokenVerification, getMessageCount);
router.post("/get-old-messages", tokenVerification, getOlderMessages);
router.put("/send-react", tokenVerification, sendReact);
router.put("/update-react", tokenVerification, updateReact);
router.put("/delete-react", tokenVerification, deleteUserReact);
router.put("/delete-message/:messageId", tokenVerification, deleteMessage);
router.put("/update-message", tokenVerification, updateMessage);

module.exports = router;
