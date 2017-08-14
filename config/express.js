"use strict";

const assert = require("assert");
const express = require("express");
const bodyParser = require("body-parser");
const compression = require("compression");
const http = require("http");
const requireDir = require("require-dir");
const routes = requireDir("../routes");
const mongo = require("../providers/orm/nosql/mongo");
const verifyRequestSignature = require("./middlewares/verifyRequest");
const requestLogger = require("../providers/logging/request");
const utilsMiddleware = require("./middlewares/utils");
const cookieParser = require("cookie-parser");
const verifyOvhUser = require("./middlewares/verifyOvhUser");

module.exports = function (config) {
  assert(config, "config for mongo is required");

  // it will try to reconnect evry 5s when it is not connected;
  mongo.connect(config.mongo);

  const port = config.server.port;
  const app = express();

  http.Server(app);
  app.disable("x-powered-by");
  app.set("json spaces", config.debug ? 2 : 0);
  app.all("/*", (req, res, next) => {
    // CORS headers
    // restrict it to the required domain
    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");

    // Set custom headers for CORS
    res.header("Access-Control-Allow-Headers", "Content-type,Accept");
    if (req.method === "OPTIONS") {
      res.status(200).end();
    } else {
      next();
    }
  });

  app.use(requestLogger(config.server.logType));

  app.get("/mon/ping", (req, res) => res.status(200).end(null));
  app.use((req, res, next) => {
    if (!mongo.isConnected()) {
      return res.status(503).json({ message: "database not available" });
    }
    return next();
  });

  app.use(utilsMiddleware());
  app.use(compression());
  app.use(bodyParser.urlencoded({ limit: "50mb", extended: false }));
  app.use(bodyParser.json({ limit: "50mb" }));
  app.use(bodyParser.json({ verify: verifyRequestSignature(config) }));
  app.use(cookieParser());
  app.use(`${config.server.basePath}/web`, verifyOvhUser());
  app.set("view engine", "ejs");
  app.use((req, res, next) => {
    if (process.env.NODE_IS_CLOSING !== "false") {
      return next();
    }
    res.setHeader("Connection", "close");
    const errorApi = res.error(503, "Server is reloading...");

    return res.status(errorApi.statusCode).json(errorApi);
  });

  const api = express.Router();

  app.use(config.server.basePath, api);

  app.use((req, res) => {
    const errorApi = res.error(404, `${req.originalUrl} doesn't exist`);
    return res.status(errorApi.statusCode).json(errorApi);
  });

  Object.keys(routes).forEach((key) => routes[key](api));

  // Start the server
  app.set("port", port);

  return app;
};
