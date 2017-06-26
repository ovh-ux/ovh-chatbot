"use strict";

import ovhCtrl from "../controllers/ovh";

export default function (app) {
  app.get("/ovh", ovhCtrl().getAuth);
};
