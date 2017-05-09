"use strict";

const path = require("path");

process.env.NODE_ENV = process.env.NODE_ENV || "development";

module.exports = {
  load(env) {
    let nodeEnv = env || process.env.NODE_ENV;

    let configFiles = [
      path.join(__dirname, "env/default"),
      path.join(__dirname, "env", nodeEnv)
    ];

    let configs = configFiles.map((file) => require(file));
    return Object.assign({}, configs[0], configs[1]);
  }
};
