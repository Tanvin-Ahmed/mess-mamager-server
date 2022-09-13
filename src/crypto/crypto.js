const crypto = require("crypto");
const { config } = require("../config/config");
const algorithm = "aes-256-cbc"; //Using AES encryption
const key = new Buffer.from(config.crypto_secret_key, "utf8");
const iv = crypto.randomBytes(16);

//Encrypting text
const encrypt = (data) => {
  const text = JSON.stringify(data);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
};

// Decrypting text
const decrypt = (text = "") => {
  const textParts = text.split(":");
  const iv = Buffer.from(textParts.shift(), "hex");
  const encryptedText = Buffer.from(textParts.join(":"), "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);

  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return JSON.parse(decrypted.toString());
};

module.exports = {
  encrypt,
  decrypt,
};
