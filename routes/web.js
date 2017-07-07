"use strict";

let webCtrl = require("../controllers/web");

module.exports = function (app) {
  webCtrl = webCtrl();

  app.get("/web", webCtrl.onGet);
  app.post("/web", webCtrl.onPost);
};
