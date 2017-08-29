"use strict";

const assert = require("assert");
const mongoose = require("mongoose");
const Bluebird = require("bluebird");
const util = require("util");
const logger = require("../../logging/logger");
mongoose.Promise = Bluebird;

module.exports = {
  connect (config) {
    const self = this;
    const options = {
      keepAlive: 1,
      connectTimeoutMS: 30000,
      autoReconnect: true,
      useMongoClient: true
    };

    const connectWithRetry = (url, mongoOptions) => {
      if (self.isConnected()) {
        return null;
      }

      logger.info("Attempting to connect to mongo");
      return mongoose.connect(url, mongoOptions)
        .catch((err) => {
          logger.error("Failed to connect to mongo on startup - retrying in 5 sec\n", err.message);
          mongoose.connection.close();
          return Bluebird.resolve();
        })
        .delay(5000)
        .then(() => connectWithRetry(url, mongoOptions));
    };

    if (mongoose.connection.readyState) {
      return Bluebird.resolve();
    }

    assert(config && config.url, "config.mongo.url is required");

    mongoose.connection.on("error", (err) => {
      logger.error("MongoError:", err.message);
    });

    mongoose.connection.once("open", () => {
      logger.info("Connected to MongoDB");
    });

    process.once("SIGUSR2", self.close("SIGUSR2"));
    process.once("SIGINT", self.close("SIGINT"));
    process.once("SIGTERM", self.close("SIGTERM"));

    if (config.debug) {
      mongoose.set("debug", (collectionName, method, query, doc) => {
        logger.debug(`${collectionName}.${method}`, util.inspect(query, false, 20), doc);
      });
    }

    return connectWithRetry(config.url, options);
  },
  close (signal) {
    return () => {
      mongoose.connection.close(() => {
        Bluebird.resolve();
        logger.info("Mongoose connection closed");
        process.kill(process.pid, signal);
      });
    };
  },
  isConnected () {
    return mongoose.connection.readyState === 1;
  }
};
