"use strict";

const config = require("./config/config-loader").load();
const http = require("http");
const app = exports.app = require("./config/express")(config);
const port = config.server.port;
const logger = require("./providers/logging/logger");
const task = require("./diagnostics/cron");

let httpserver;

if (require.main === module) {
  logger.info(`Serveur listening on port ${port}`);
  http.createServer(app).listen(port);
}

process.on("SIGTERM", () => {
  logger.info("SIGTERM Signal received, trying to close connections...");
  task.destroy();
  process.env.NODE_IS_CLOSING = "true";

  httpserver.close(() => {
    logger.info("Connections are closing");
    process.exit();
  });

  return setTimeout(() => {
    logger.error("Forced closure");
    process.exit(1);
  }, 30 * 1000);
});
