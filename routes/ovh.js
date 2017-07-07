"use strict";

const ovhCtrl = require("../controllers/ovh")();

module.exports = function (app) {
  app.get("/ovh", ovhCtrl.getAuth);
};
