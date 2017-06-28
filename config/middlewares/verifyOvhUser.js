"use strict";

const Bluebird = require("bluebird");
const request = require("request");
const WebUser = require("../../models/web.model");

module.exports = () =>
  function (req, res, next) {
    const options = {
      uri: "https://www.ovh.com/engine/apiv6/me",
      json: true,
      encoding: "utf8",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Cookie: `cookieAccepted=true; SESSION=${req.cookies.SESSION}`,
        "User-Agent": req.headers["user-agent"],
        Referer: "https://www.ovh.com/manager/web/",
        Pragma: "no-cache",
        "Cache-Control": "no-cache"
      }
    };

    return new Bluebird((resolve, reject) => {
      request(options, (err, resp, body) => {
        if (err || resp.statusCode >= 400) {
          return reject(resp && resp.statusCode ? { statusCode: resp.statusCode, data: body } : { statusCode: 500, data: err});
        }
        return resolve(body);
      });
    })
      .then((resp) => {
        req.user = resp;
        return WebUser.findOne({ nichandle: req.user.nichandle });
      })
      .then((user) => {
        if (!user) {
          user = new WebUser({ nichandle: req.user.nichandle, cookie: req.cookies.SESSION, userAgent: req.headers["user-agent"] });
        } else {
          user.cookie = req.cookies.SESSION;
          user.userAgent = req.headers["user-agent"];
        }
        return user.save();
      })
      .then(() => next())
      .catch((err) => {
        console.log(err);
        const errorApi = res.error(err.statusCode, err.data ? err.data.message : err);
        return res.status(errorApi.statusCode).json(errorApi);
      });
  };
