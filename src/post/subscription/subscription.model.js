const mongoose = require("mongoose");
const { config } = require("../../config/config");

const Schema = mongoose.Schema;

const postSubscription = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      require: true,
      unique: true,
      ref: config.user_info_collection,
    },
    subscription: {
      type: Object,
      require: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports.postSubscription = mongoose.model(
  config.subscription_collection,
  postSubscription
);
