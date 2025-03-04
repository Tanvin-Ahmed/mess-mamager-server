const { dataSendToClient } = require("../../socket/handlers/dataSendToClient");
const {
  createMess,
  getMessInfoById,
  addMember,
  removeMemberFromMess,
  AddOthersCost,
  addMarketCost,
  getMembersCount,
  getMessMembersInfo,
} = require("./mess.service");

const {
  subscriptionsByUserIds,
} = require("../subscription/subscription.service");
const { pushNotification } = require("../../pushNotification/pushNotification");
const { v4: uuidv4 } = require("uuid");
const { updateNotificationByUsersId } = require("../user/user.service");

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
    const count = await getMembersCount(id);

    const membersCount = JSON.parse(JSON.stringify(count));

    return res
      .status(200)
      .json({ messInfo: mess, membersCount: membersCount[0].total });
  } catch (error) {
    return res
      .status(404)
      .json({ error: true, message: "Something went wrong" });
  }
};

const getMeembersInfo = async (req, res) => {
  try {
    const { limit, skip, id } = req.query;
    const info = await getMessMembersInfo(id, Number(skip), Number(limit));

    return res.status(200).json(info);
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong, please try again later!",
      status: "error",
    });
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
      const notificationData = {
        id: uuidv4(),
        body: `Welcome to "${newMembersSubscriptionData[0].userId.memberOfMess.messName}" mess!`,
        data: {
          url: "/",
        },
        createdAt: new Date().toUTCString(),
        seen: false,
      };

      // store notifications in DB
      await updateNotificationByUsersId(newMembers, notificationData);
      dataSendToClient("user-notification", notificationData, [...newMembers]);
      // push notification to client
      newMembersSubscriptionData.forEach(async ({ subscription }) => {
        await pushNotification(subscription, notificationData);
      });
    }

    if (oldMembersSubscriptionData.length) {
      const notificationData = {
        id: uuidv4(),
        body: `Added new members in mess!`,
        data: {
          url: "/",
        },
        createdAt: new Date().toUTCString(),
        seen: false,
      };

      // store notifications in DB
      await updateNotificationByUsersId(oldMembers, notificationData);
      dataSendToClient("user-notification", notificationData, [...oldMembers]);
      // push notification to client
      oldMembersSubscriptionData.forEach(async ({ subscription }) => {
        await pushNotification(subscription, notificationData);
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
  getMeembersInfo,
};
