"use strict";

const dns = require("dns");
const URL = require("url");
const Bluebird = require("bluebird");

module.export = {
  dig (hostnameRaw) {
    const hostname = hostnameRaw.match(/https?:\/\//) ? URL.parse(hostnameRaw).hostname : hostnameRaw;

    return new Bluebird((resolve, reject) => {
      dns.lookup(hostname, (err, address) => {
        if (err) {
          return reject(err);
        }

        return resolve(address);
      });
    });
  }
};
