"use strict";

let messengerCtrl = require("../controllers/messenger");

module.exports = function (app) {
  messengerCtrl = messengerCtrl();
  /*
   * Use your own validation token. Check that the token used in the Webhook
   * setup is the same token used here.
   *
   */
  app.get("/webhook", messengerCtrl.getWebhook);

  /*
   * All callbacks for Messenger are POST-ed. They will be sent to the same
   * webhook. Be sure to subscribe your app to your page to receive callbacks
   * for your page.
   * https://developers.facebook.com/docs/messenger-platform/product-overview/setup#subscribe_app
   *
   */
  app.post("/webhook", messengerCtrl.postWebhook);
};
