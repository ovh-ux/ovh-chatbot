"use strict";

let authorizeCtrl = require("../controllers/authorize");

module.exports = function (app) {
  authorizeCtrl = authorizeCtrl();

  /*
  * This path is used for account linking. The account linking call-to-action
  * (sendAccountLinking) is pointed to this URL.
  *
  */
  app.get("/authorize", authorizeCtrl.getAuthorize);
};
