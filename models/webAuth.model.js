"use strict";

const Bluebird = require("bluebird");
const mongoose = require("mongoose");

mongoose.Promise = Bluebird;

/**
 * WebAuth Schema
 */
const WebAuthSchema = new mongoose.Schema({
  _nichandle: {
    type: String,
    ref: "Web"
  },
  cookie: {
    type: String,
    required: true
  },
  userAgent: {
    type: String
  },
  createdAt: {
    type: Date,
    expires: "15s",
    "default": Date.now()
  }
});

/**
 * Methods
 */
WebAuthSchema.method({});

/**
 * Statics
 */
WebAuthSchema.statics = {
  get (senderId) {
    return this.findOne({ senderId }).exec().then((user) => {
      if (user) {
        return user;
      }
      const err = { message: "Web User not found", statusCode: 404 };
      return Bluebird.reject(err);
    });
  }
};

module.exports = mongoose.model("WebAuth", WebAuthSchema);
