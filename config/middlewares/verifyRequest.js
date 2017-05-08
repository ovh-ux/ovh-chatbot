"use strict";

const crypto = require("crypto");
//  * Verify that the callback came from Facebook. Using the App Secret from
//  * the App Dashboard, we can verify the signature that is sent with each
//  * callback in the x-hub-signature field, located in the header.
//  *
//  * https://developers.facebook.com/docs/graph-api/webhooks#setup
//  *
module.exports = (config) => {
  return function verifyRequestSignature(req, res, buf) {
    let signature = req.headers["x-hub-signature"];

    if (!signature) {
      // For testing, let's log an error. In production, you should throw an
      // error.
      console.error("Couldn't validate the signature.");
    } else {
      let elements = signature.split("=");
      let signatureHash = elements[1];

      let expectedHash = crypto.createHmac("sha1", config.facebook.appSecret)
        .update(buf)
        .digest("hex");

      if (signatureHash !== expectedHash) {
        throw new Error("Couldn't validate the request signature.");
      }
    }
  };
};
