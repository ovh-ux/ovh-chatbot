"use strict";

const Bluebird = require("bluebird");
const config = require("../config/config-loader").load();
const apiai = require("apiai")(config.apiai.token);

apiai.textRequestAsync = (message, opts, lang) =>
  new Bluebird((resolve, reject) => {
    console.log("using apiai:", lang);
    const request = apiai.textRequest(message, opts);

    request.on("response", (response) => resolve(response));

    request.on("error", (error) => reject(error));

    request.end();
  });

module.exports = apiai;
