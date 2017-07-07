"use strict";

const path = require("path");

process.env.NODE_ENV = process.env.NODE_ENV || "development";

module.exports = {
  load (env) {
    const nodeEnv = env || process.env.NODE_ENV;

    const configFiles = [path.join(__dirname, "env/default"), path.join(__dirname, "env", nodeEnv)];

    const configs = configFiles.map((file) => require(file));
    return Object.assign({}, configs[0], configs[1]);
  }
};
