const express = require("express");
const { tokenVerification } = require("../auth/tokenVerification");
const {
  makeMess,
  getMessDetails,
  addMemberInMess,
  removeMember,
  addCost,
} = require("../post/mess/mess.controller");

const router = express.Router();

router.post("/create-mess", tokenVerification, makeMess);
router.get("/get-mess-info-by-id/:id", tokenVerification, getMessDetails);
router.put("/add-new-members", tokenVerification, addMemberInMess);
router.put("/remove-member-from-mess", tokenVerification, removeMember);
router.put("/add-cost", tokenVerification, addCost);

module.exports = router;
