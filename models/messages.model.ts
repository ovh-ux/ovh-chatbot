"use strict";

import * as Bluebird from "bluebird";
import * as mongoose from "mongoose";

(<any>mongoose).Promise = Bluebird;

/**
 * User Schema
 */
const MessageSchema = new mongoose.Schema({
  intent: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  feedback: {
    type: String,
    required: true
  }
});

/**
 * Methods
 */
MessageSchema.method({});

/**
 * Statics
 */
MessageSchema.statics = {};

export default mongoose.model("Message", MessageSchema);
