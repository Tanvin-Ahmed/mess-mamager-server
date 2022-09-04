const { dataSendToClient } = require("../../socket/handlers/dataSendToClient");
const {
  createMess,
  getMessInfoById,
  addMember,
  removeMemberFromMess,
  AddOthersCost,
  addMarketCost,
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

    return res.status(200).json({ message: "remove member successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Member not removed!" });
  }
};

const addCost = async (req, res) => {
  try {
    const { messId, cost, membersId, date } = req.body;

    let updatedInfo;

    if (Object.keys(cost)[0] === "market") {
      const marketCost = cost.market;
      updatedInfo = await addMarketCost({ messId, marketCost, date });
    } else {
      updatedInfo = await AddOthersCost({ messId, cost, date });
    }

    dataSendToClient("add-cost", updatedInfo, [...membersId]);

    return res
      .status(200)
      .json({ message: `Add ${Object.keys(cost)[0]} cost successfully` });
  } catch (error) {
    return res.status(500).json({ message: "Error to add cost!" });
  }
};

module.exports = {
  makeMess,
  getMessDetails,
  addMemberInMess,
  removeMember,
  addCost,
};
