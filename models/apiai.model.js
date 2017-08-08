"use strict";

const Bluebird = require("bluebird");
const mongoose = require("mongoose");

mongoose.Promise = Bluebird;

/**
 * WebAuth Schema
 */
const ApiAiSchema = new mongoose.Schema({
  locale: {
    type: String,
    unique: true,
    required: true
  },
  token: {
    type: String,
    required: true
  }
});

/**
 * Methods
 */
ApiAiSchema.method({});

/**
 * Statics
 */
ApiAiSchema.statics = {};

module.exports = mongoose.model("ApiAi", ApiAiSchema);
