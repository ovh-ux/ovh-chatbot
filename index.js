"use strict";

const config = require("./config/config-loader").load();
const http = require("http");
const app = exports.app = require("./config/express")(config);
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
