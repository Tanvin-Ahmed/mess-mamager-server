const { encrypt, decrypt } = require("../../crypto/crypto");
const {
  createSubscription,
  subscriptionAlreadyExists,
  subscriptionsByUserIds,
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
          subscriptionInfo.subscription.endpoint &&
        subscriptionData.userId === subscriptionInfo.userId
      ) {
        return res.status(409).json({});
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
    return res.status(500).json({ message: error.message });
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

module.exports = {
  addSubscription,
  getUserSubscription,
};
