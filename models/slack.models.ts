"use strict";

import * as Bluebird from "bluebird";
import * as mongoose from "mongoose";

(<any>mongoose).Promise = Bluebird;

/**
 * Slack Schema
 */
const SlackSchema = new mongoose.Schema({
  access_token: {
    type: String,
    required: true,
    "default": ""
  },
  scope: {
    type: String,
    required: true,
    "default": ""
  },
  team_id: {
    type: String,
    "default": ""
  },
  team_name: {
    type: String,
    "default": ""
  },
  bot: {
    bot_user_id: {
      type: String
    },
    bot_access_token: {
      type: String
    }
  },
  createdAt: {
    type: Date,
    "default": Date.now
  }
});

/**
 * Methods
 */
SlackSchema.method({});

/**
 * Statics
 */
SlackSchema.statics = {
  get (team_id) {
    return this.findOne({ team_id }).exec().then((user) => {
      if (user) {
        return user;
      }
      const err = { message: "Slack not found", statusCode: 404 };
      return Bluebird.reject(err);
    });
  }
};

export default mongoose.model("Slack", SlackSchema);
