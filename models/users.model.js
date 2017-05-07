"use strict";

const Bluebird = require("bluebird");
const mongoose = require("mongoose");

mongoose.Promise = Bluebird;

/**
 * User Schema
 */
const UserSchema = new mongoose.Schema({
  senderId: {
    type: String,
    required: true
  },
  consumerKey: {
    type: String,
    required: true,
    default: ""
  },
  consumerKeyTmp: {
    type: String,
    required: true,
    default: ""
  },
  connected: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  platform: {
    type: String
  },
  messageNumber: {
    type: Number,
    default: 0
  }
});

/**
 * Methods
 */
UserSchema.method({

});

/**
 * Statics
 */
UserSchema.statics = {
  get(senderId) {
    return this.findOne({ senderId })
      .exec()
      .then((user) => {
        if (user) {
          return user;
        }
        const err = { message: "User not found", statusCode: 404 };
        return Bluebird.reject(err);
      });
  }
};

module.exports = mongoose.model("User", UserSchema);
