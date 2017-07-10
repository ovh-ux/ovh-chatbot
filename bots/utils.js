"use strict";

const User = require("../models/users.model");
const config = require("../config/config-loader").load();
const ovh = require("ovh");
const Bluebird = require("bluebird");
const dns = require("dns");
const URL = require("url");
const responsesCst = require("../constants/responses").FR;

module.exports = {
  getOvhClient (senderId) {
    return User.findOne({ senderId }).exec().then((userInfos) => {
      if (!userInfos) {
        return Bluebird.reject({ statusCode: 403, message: responsesCst.signInFirst });
      }

      const ovhClient = ovh({
        appKey: config.ovh.appKey,
        appSecret: config.ovh.appSecret,
        consumerKey: userInfos.consumerKey
      });

      return ovhClient;
    });
  },
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
