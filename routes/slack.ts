"use strict";

import slackCtrl from "../controllers/slack";

export default function (app) {
  const ctrl = slackCtrl();

  app.post("/slack", ctrl.receiveMessage);
  app.post("/slack/actions", ctrl.receiveActions);
  app.get("/slack/authorize", ctrl.authorize);
};
