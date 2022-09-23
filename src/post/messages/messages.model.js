const mongoose = require("mongoose");
const { config } = require("../../config/config");

const Schema = mongoose.Schema;

const messageSchema = new Schema(
  {
    messId: {
      type: Schema.Types.ObjectId,
      require: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      require: true,
      ref: config.user_info_collection,
    },
    message: {
      type: String,
      require: true,
    },
    seen: [
      {
        type: Schema.Types.ObjectId,
        ref: config.user_info_collection,
      },
    ],
    react: [
      {
        sender: {
          type: Schema.Types.ObjectId,
          ref: config.user_info_collection,
        },
        react: String,
      },
    ],
    createdAt: {
      type: Date,
      require: true,
    },
    updatedAt: {
      type: Date,
      require: true,
    },
  },
  {
    versionKey: false,
  }
);

module.exports.postMessage = mongoose.model(
  config.messages_collection,
  messageSchema
);
