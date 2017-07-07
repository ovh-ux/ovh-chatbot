"use strict";

const assert = require("assert");
const mongoose = require("mongoose");
const Bluebird = require("bluebird");
const util = require("util");
mongoose.Promise = Bluebird;

module.exports = {
  connect (config) {
    const self = this;
    const options = {};

    if (mongoose.connection.readyState) {
      return;
    }

    assert(config && config.url, "config.mongo.url is required");

    mongoose.connection.on("error", (err) => {
      console.error("MongoError:", err.message); // TODO Use logger
    });

    mongoose.connection.once("open", () => {
      console.log("Connected to MongoDB"); // TODO Use logger
    });

    process.once("SIGUSR2", self.close("SIGUSR2"));
    process.once("SIGINT", self.close("SIGINT"));
    process.once("SIGTERM", self.close("SIGTERM"));

    if (config.debug) {
      mongoose.set("debug", (collectionName, method, query, doc) => {
        console.log(`${collectionName}.${method}`, util.inspect(query, false, 20), doc);
      });
    }

    options.server = options.replset = {};
    options.server.socketOptions = options.replset.socketOptions = {
      keepAlive: 1
    };
    options.server.socketOptions.connectTimeoutMS = options.replset.socketOptions.connectTimeoutMS = 30000;

    mongoose.connect(config.url, options);
  },
  close (signal) {
    return () => {
      mongoose.connection.close(() => {
        console.log("Mongoose connection closed"); // TODO Use logger
        process.kill(process.pid, signal);
      });
    };
  }
};
