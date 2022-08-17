const { dataSendToClient } = require("../../socket/handlers/dataSendToClient");
const {
  createMess,
  getMessInfoById,
  addMember,
  removeMemberFromMess,
} = require("./mess.service");

const makeMess = async (req, res) => {
  try {
    const data = req.body;
    const info = await createMess(data);

    // send to every active memebers
    dataSendToClient("create-new-mess", info, data.data.members);

    return res.status(201).json(data);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: true, message: "Something went wrong" });
  }
};

const getMessDetails = async (req, res) => {
  try {
    const id = req.params.id;
    const mess = await getMessInfoById(id);
    return res.status(200).json(mess);
  } catch (error) {
    console.log(error);
    return res
      .status(404)
      .json({ error: true, message: "Something went wrong" });
  }
};

const addMemberInMess = async (req, res) => {
  try {
    const { messId, newMembers } = req.body;
    const { newMessInfo, oldMembers } = await addMember(newMembers, messId);

    // send to every active memebers
    dataSendToClient("add-new-members", newMessInfo.members, oldMembers);
    dataSendToClient(
      "add-new-members",
      { memberOfMess: newMessInfo._id },
      newMembers
    );

    return res.status(200).json(newMessInfo.members);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: true, message: "Opps! members not added" });
  }
};

const removeMember = async (req, res) => {
  try {
    const { selectedId, membersId, messId } = req.body;

    const info = await removeMemberFromMess(selectedId, messId);

    dataSendToClient("remove-member-from-mess", info, [...membersId]);

    return res.status(200).json({ messages: "remove member successfully" });
  } catch (error) {
    return res.status(500).json({ messages: "Member not removed!" });
  }
};

module.exports = {
  makeMess,
  getMessDetails,
  addMemberInMess,
  removeMember,
};
