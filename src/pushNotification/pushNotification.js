const webpush = require("web-push");
const { config } = require("../config/config");
const { decrypt } = require("../crypto/crypto");

module.exports.pushNotification = async (subscription, payload = {}) => {
  webpush.setVapidDetails(
    "mailto:test@test.com",
    config.vAPIDPublicKey,
    config.vAPIDPrivateKey
  );

  const options = {
    TTL: 60,
    vapidDetails: {
      subject: "mailto:tanvin@gmail.com",
      publicKey: config.vAPIDPublicKey,
      privateKey: config.vAPIDPrivateKey,
    },
  };

  const decryptedSubscription = decrypt(subscription);

  // pass payload in send notification function
  await webpush.sendNotification(
    decryptedSubscription,
    JSON.stringify(payload),
    options
  );
};
