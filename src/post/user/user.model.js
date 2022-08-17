const mongoose = require("mongoose");
const { config } = require("../../config/config");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: {
      type: String,
      require: true,
      unique: true,
    },
    password: {
      type: String,
      require: true,
    },
    username: {
      type: String,
      require: true,
    },
    managerOfTheMonths: {
      type: Array,
      default: [],
    },
    memberOfMess: {
      type: Schema.Types.ObjectId,
      ref: config.mess_info_collection,
    },
    admin: {
      type: Boolean,
      default: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    strict: false,
  }
);

module.exports.postUser = mongoose.model(
  config.user_info_collection,
  userSchema
);
