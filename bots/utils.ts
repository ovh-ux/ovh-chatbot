"use strict";

import User from "../models/users.model";
import * as cfg from "../config/config-loader";
import * as ovh from "ovh";
import * as Bluebird from "bluebird";
import * as dns from "dns";
import * as URL from "url";
const config = cfg.load();

export function getOvhClient (senderId): Promise<any> {
  return User.findOne({ senderId }).exec().then((userInfos: any) => {
    if (!userInfos) {
      return Bluebird.reject({ statusCode: 403, message: "Tu dois d'abord te connecter. Pour ce faire tu peux me le demander" });
    }

    return ovh({
      appKey: config.ovh.appKey,
      appSecret: config.ovh.appSecret,
      consumerKey: userInfos.consumerKey
    });
  });
}

export function dig (hostnameRaw) {
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

