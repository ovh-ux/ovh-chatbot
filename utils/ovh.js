"use strict";

const User = require("../models/users.model");
const WebAuth = require("../models/webAuth.model");
const config = require("../config/config-loader").load();
const ovh = require("ovh");
const Bluebird = require("bluebird");
const request = require("request");
const translator = require("./translator");

// custom OvhClient for the web users;
class OvhWebClient {
  constructor (cookie, userAgent) {
    this.options = {
      json: true,
      encoding: "utf8",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Cookie: `cookieAccepted=true; SESSION=${cookie}`,
        "User-Agent": userAgent,
        Referer: "https://www.ovh.com/manager/web/",
        Pragma: "no-cache",
        "Cache-Control": "no-cache"
      }
    };
  }

  requestPromised (method, path, data) {
    return new Bluebird((resolve, reject) => {
      const opt = {
        method,
        uri: config.ovh.urlBasePath + path,
        qs: method === "GET" ? data : {},
        body: method !== "GET" ? data : {}
      };
      return request(Object.assign(opt, this.options), (err, resp, body) => {
        if (err || resp.statusCode >= 400) {
          return reject({ statusCode: resp.statusCode, data: body });
        }
        return resolve(body);
      });
    });
  }
}

module.exports = {
  getOvhClient: (senderId, locale = "en_US") =>
    User.findOne({ senderId }).exec().then((userInfos) => {
      if (!userInfos) {
        // check if web user and if so return the custom "ovhClientModule";
        return WebAuth.findOne({ _nichandle: senderId }).exec().then((webAuth) => {
          if (!webAuth) {
            return Bluebird.reject({ statusCode: 403, message: translator("signInFirst", locale) });
          }

          return new OvhWebClient(webAuth.cookie, webAuth.userAgent);
        });
      }

      return ovh({
        appKey: config.ovh.appKey,
        appSecret: config.ovh.appSecret,
        consumerKey: userInfos.consumerKey
      });
    })
};
