"use strict";

const crypto = require("crypto");
const logger = require("../../providers/logging/logger");

function validatePayloadSignature (hmacType, secret, buf, signatureHeader, payloadEncoding, req) {
  if (!signatureHeader) {
    if (process.env.NODE_ENV !== "development") {
      logger.error("Request Invalid:", req.method, req.originalUrl, "From:", req.ip);
      throw new Error("Couldn't validate the request signature.", req);
    }
    logger.error("Couldn't validate the signature.");
  } else {
    const signatureHash = signatureHeader.split("=")[1];
    const calculatedHash = crypto.createHmac(hmacType, secret).update(buf).digest(payloadEncoding);
    if (signatureHash !== calculatedHash) {
      throw new Error("Couldn't validate the request signature. Hash are not the same");
    }
  }
}

module.exports = (config) => function verifyRequestSignature (req, res, buf) {
  switch (req.path) {
  case `${config.server.basePath}/webhook`: {

    //  * Verify that the callback came from Facebook. Using the App Secret from
    //  * the App Dashboard, we can verify the signature that is sent with each
    //  * callback in the x-hub-signature field, located in the header.
    //  *
    //  * https://developers.facebook.com/docs/graph-api/webhooks#setup
    //  *
    return validatePayloadSignature("sha1", config.facebook.appSecret, buf, req.headers["x-hub-signature"], "hex", req);
  }
  case `${config.server.basePath}/twitter`: {

    //  * Verify that the callback came from Twitter.
    //  * See https://dev.twitter.com/webhooks/securing
    //  *
    return validatePayloadSignature("sha256", config.twitter.apiSecret, buf, req.headers["x-twitter-webhooks-signature"], "base64", req);
  }
  default: {
    return null;
  }
  }
};
