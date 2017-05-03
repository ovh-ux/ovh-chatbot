"use strict";
let slackCtrl = require("../controllers/slack");

module.exports = function (app) {
  slackCtrl = slackCtrl();
  
  app.post("/slack", slackCtrl.receiveMessage);
  app.post("/slack/actions", slackCtrl.receiveActions);
  app.get("/slack/authorize", slackCtrl.authorize);
};
