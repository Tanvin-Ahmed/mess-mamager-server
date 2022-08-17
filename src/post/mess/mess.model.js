const mongoose = require("mongoose");
const { config } = require("../../config/config");

const Schema = mongoose.Schema;

const messSchema = new Schema(
  {
    messName: {
      type: String,
      require: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: config.user_info_collection,
      },
    ],
    managerId: {
      type: Schema.Types.ObjectId,
      ref: config.user_info_collection,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: false,
  }
);

module.exports.postMess = mongoose.model(
  config.mess_info_collection,
  messSchema
);
