"use strict";

const User = require("../models/users.model");
const config = require("../config/config-loader").load();
const ovh = require("ovh");
const Bluebird = require("bluebird");
const dns = require("dns");
const URL = require("url");


module.exports = {
  getOvhClient(senderId) {
    return User
      .findOne({ senderId })
      .exec()
      .then((userInfos) => {
        if (!userInfos) {
          return Bluebird.reject({statusCode: 403, message: "Tu dois d'abord te connecter. Pour ce faire tu peux me le demander"});
        }

        let ovhClient = ovh({
          appKey: config.ovh.appKey,
          appSecret: config.ovh.appSecret,
          consumerKey: userInfos.consumerKey
        });

        return ovhClient;
      });
  },
  dig(hostname) {
    if (hostname.match(/https?:\/\//)) {
      hostname = URL.parse(hostname).hostname;
    }

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