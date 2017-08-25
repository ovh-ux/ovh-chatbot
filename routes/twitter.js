"use strict";

let twitterCtrl = require("../controllers/twitter");

module.exports = function (app) {
  twitterCtrl = twitterCtrl();

  app.get("/twitter", twitterCtrl.webhookCRC);
  app.post("/twitter", twitterCtrl.webhookEvent);
};
