const mongoose = require("mongoose");
const { config } = require("../config/config");

const url = config.db_url;

if (!url) console.log("Environment variable not found");
else
  mongoose.connect(url, (err) => {
    if (err) console.error(err);
    else console.log("connect to database");
  });

module.exports = mongoose;
