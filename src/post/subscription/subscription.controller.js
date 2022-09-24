const { encrypt, decrypt } = require("../../crypto/crypto");
const {
  createSubscription,
  subscriptionAlreadyExists,
  subscriptionsByUserIds,
  deleteSubscription,
  subscriptionsByUserId,
} = require("./subscription.service");

const addSubscription = async (req, res) => {
  try {
    const subscriptionInfo = req.body;

    const subscriptionData = await subscriptionAlreadyExists(
      subscriptionInfo.userId
    );

    if (subscriptionData) {
      const decryptedSubscriptionInfo = decrypt(subscriptionData.subscription);

      if (
        decryptedSubscriptionInfo.endpoint ===
        subscriptionInfo.subscription.endpoint
      ) {
        return res.status(200).json({});
      }
    }

    const cryptoText = encrypt(subscriptionInfo.subscription);

    const newSubscriptionInfo = {
      ...subscriptionInfo,
      subscription: cryptoText,
    };

    await createSubscription(newSubscriptionInfo);

    return res.status(201).json({});
  } catch (error) {
    return res.status(500).json({ message: "Already registered!" });
  }
};

// no need this function in production
const getUserSubscription = async (req, res) => {
  try {
    const userIds = req.body.userIds;

    const data = await subscriptionsByUserIds(userIds);

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json(error);
  }
};

const deleteUserSubscription = async (req, res) => {
  try {
    const subscription = req.body;

    const subscriptionInfo = await subscriptionsByUserId(subscription.userId);

    const sub = subscriptionInfo.map((sub) => {
      const subscript = JSON.parse(JSON.stringify(sub));
      const subscription = decrypt(subscript.subscription);
      delete subscript.subscription;
      return { ...subscript, subscription };
    });

    let requiredSubscription = sub.find(
      (sub) => sub.subscription.endpoint === subscription.subscription.endpoint
    );

    if (requiredSubscription) {
      await deleteSubscription(requiredSubscription._id);
    }

    return res.status(200).json({
      message: "Delete subscription successfully",
      status: "error",
    });
  } catch (error) {
    return res.status(500).json({
      message: "something went wrong, please try again!",
      status: "error",
    });
  }
};

module.exports = {
  addSubscription,
  getUserSubscription,
  deleteUserSubscription,
};
