"use strict";

import * as cfg from "./config/config-loader";
import * as http from "http";
import expressCfg from "./config/express";
const config = cfg.load();
const app = exports.app = expressCfg(config);
const port = config.server.port;
let httpserver;

if (require.main === module) {
  console.log(`Serveur listening on port ${port}`);
  http.createServer(app).listen(port);
}

process.on("SIGTERM", () => {
  console.log("SIGTERM Signal received, trying to close connections...");

  process.env.NODE_IS_CLOSING = "true";

  httpserver.close(() => {
    console.log("Connections are closing");
    process.exit();
  });

  return setTimeout(() => {
    console.error("Forced closure");
    process.exit(1);
  }, 30 * 1000);
});
