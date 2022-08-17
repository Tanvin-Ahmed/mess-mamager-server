const bcrypt = require("bcryptjs");

module.exports.criptoPasswordChecker = async (password, hash) => {
  try {
    const matched = await bcrypt.compare(password, hash);
    return matched;
  } catch (error) {
    console.log(error);
  }
};
