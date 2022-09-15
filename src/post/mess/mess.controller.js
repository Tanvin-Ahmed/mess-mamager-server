const { dataSendToClient } = require("../../socket/handlers/dataSendToClient");
const {
  createMess,
  getMessInfoById,
  addMember,
  removeMemberFromMess,
  AddOthersCost,
  addMarketCost,
} = require("./mess.service");

const {
  subscriptionsByUserIds,
} = require("../subscription/subscription.service");
const { pushNotification } = require("../../pushNotification/pushNotification");
const { v4: uuidv4 } = require("uuid");

const clientRootUlr = "http://localhost:3000";

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
    const { messId, newMembers, oldMembers } = req.body;
    const updatedMess = await addMember(newMembers, oldMembers, messId);

    // send to every active memebers
    dataSendToClient("add-new-members", updatedMess, [
      ...newMembers,
      ...oldMembers,
    ]);

    const newMembersSubscriptionData = await subscriptionsByUserIds(newMembers);
    const oldMembersSubscriptionData = await subscriptionsByUserIds(oldMembers);

    if (newMembersSubscriptionData.length) {
      newMembersSubscriptionData.forEach(async ({ subscription, userId }) => {
        await pushNotification(subscription, {
          id: uuidv4(),
          body: `Welcome to "${userId.memberOfMess.messName}" mess!`,
          data: {
            url: clientRootUlr + "/",
          },
        });
      });
    }

    if (oldMembersSubscriptionData.length) {
      oldMembersSubscriptionData.forEach(async ({ subscription, userId }) => {
        await pushNotification(subscription, {
          id: uuidv4(),
          body: `Added new members in mess!`,
        });
      });
    }

    return res.status(200).json("add members successfully!");
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
