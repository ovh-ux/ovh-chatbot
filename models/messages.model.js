"use strict";

const Bluebird = require("bluebird");
const mongoose = require("mongoose");

mongoose.Promise = Bluebird;

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
MessageSchema.method({

});

/**
 * Statics
 */
MessageSchema.statics = {

};

module.exports = mongoose.model("Message", MessageSchema);
