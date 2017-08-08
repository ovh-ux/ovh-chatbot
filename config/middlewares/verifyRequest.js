"use strict";

const crypto = require("crypto");

//  * Verify that the callback came from Facebook. Using the App Secret from
//  * the App Dashboard, we can verify the signature that is sent with each
//  * callback in the x-hub-signature field, located in the header.
//  *
//  * https://developers.facebook.com/docs/graph-api/webhooks#setup
//  *
module.exports = (config) => function verifyRequestSignature (req, res, buf) {
  const signature = req.headers["x-hub-signature"];
  if (req.path === `${config.server.basePath}/webhook`) {
    if (!signature) {
        // For testing, let's log an error. In production, you should throw an
        // error.
      if (process.env.NODE_ENV !== "development") {
        console.error("Request Invalid:", req.method, req.originalUrl, "From:", req.ip);
        throw new Error("Couldn't validate the request signature.", req);
      }
      console.error("Couldn't validate the signature.");

    } else {
      const elements = signature.split("=");
      const signatureHash = elements[1];

      const expectedHash = crypto.createHmac("sha1", config.facebook.appSecret).update(buf).digest("hex");

      if (signatureHash !== expectedHash) {
        throw new Error("Couldn't validate the request signature.");
      }
    }
  }
};
