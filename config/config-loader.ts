"use strict";

import { join } from "path";

process.env.NODE_ENV = process.env.NODE_ENV || "development";

export function load (env?: string) {
  const nodeEnv = env || process.env.NODE_ENV;

  const configFiles = [join(__dirname, "env/default"), join(__dirname, "env", nodeEnv)];

  const configs = configFiles.map((file) => require(file).default);
  return Object.assign({}, configs[0], configs[1]);
};
