"use strict";

const error = require("../../../providers/errors/apiError");
const { Button, createPostBackList, TextMessage, BUTTON_TYPE, MAX_LIMIT } = require("../../../platforms/generics");
const utils = require("../../utils");
const Bluebird = require("bluebird").config({
  warnings: false
});
const guides = require("../../../constants/guides").FR;
const responsesCst = require("../../../constants/responses").FR;
const hostingDiagnostics = require("../../../diagnostics/hosting");
const { sprintf } = require("voca");

module.exports = [
  {
    regx: "HOSTING_SELECTED_(.*)",
    action (senderId, postback, regx, entities, res) {
      let hosting;

      return utils
        .getOvhClient(senderId)
        .then((ovhClient) => {
          hosting = postback.match(new RegExp(regx))[1];

          return ovhClient.requestPromised("GET", `/hosting/web/${hosting}/attachedDomain`);
        })
        .then((attachedDomains) => {
          let buttons = attachedDomains.map((domain) => new Button(BUTTON_TYPE.POSTBACK, `ATTACHED_DOMAIN_SELECTED_${hosting}_${domain}`, domain));
          return { responses: [createPostBackList(sprintf(responsesCst.hostingSelectSite, 1, Math.ceil(buttons.length / MAX_LIMIT)), buttons, `MORE_ATTACHED_DOMAIN_${hosting}`, 0, MAX_LIMIT)], feedback: false };
        })
        .catch((err) => {
          res.logger.error(err);

          return Bluebird.reject(error(err.error || err.statusCode || 400, err));
        });
    }
  },
  {
    regx: "ATTACHED_DOMAIN_SELECTED_(.*)_(.*)",
    action (senderId, postback, regx, entities, res) {
      let domain;

      return utils
        .getOvhClient(senderId)
        .then((ovhClient) => {
          const hosting = postback.match(new RegExp(regx))[1];
          domain = postback.match(new RegExp(regx))[2];

          return Bluebird.props({
            hosting: ovhClient.requestPromised("GET", `/hosting/web/${hosting}`),
            attachedDomain: ovhClient.requestPromised("GET", `/hosting/web/${hosting}/attachedDomain/${domain}`),
            hostingEmails: ovhClient.requestPromised("GET", `/hosting/web/${hosting}/email`),
            ssl: getSSLState(ovhClient, hosting),
            statistics: ovhClient.requestPromised("GET", `/hosting/web/${hosting}/statistics`, { period: "daily", type: "in.httpMeanResponseTime" }).catch((err) => err.error === 404 ? Bluebird.resolve(null) : null)
          });
        })
        .then(({ hosting, attachedDomain, hostingEmails, ssl, statistics }) => hostingDiagnostics.checkWebsite(res, hosting, attachedDomain, hostingEmails, ssl, statistics))
        .then((responses) => ({ responses, feedback: true }))
        .catch((err) => {
          res.logger.error(err);
          if (err.error === 404 || err.statusCode === 404) {
            return Bluebird.reject(error(404, responsesCst.hostingWrongSite));
          }

          if (err.error === 460 || err.statusCode === 460) {
            return Bluebird.resolve({ responses: [
              new TextMessage(responsesCst.hostingSuspended),
              new TextMessage(guides.help(guides.renewOvh))
            ],
              feedback: false });
          }

          return Bluebird.reject(error(err.error || err.statusCode || 400, err));
        });
    }
  },
  {
    regx: "MORE_ATTACHED_DOMAIN_(.*)_([0-9]+)",
    action (senderId, postback, regx, entities, res) {
      let currentIndex = parseInt(postback.match(new RegExp(regx))[2], 10);
      let hosting;

      return utils
        .getOvhClient(senderId)
        .then((ovhClient) => {
          hosting = postback.match(new RegExp(regx))[1];

          return ovhClient.requestPromised("GET", `/hosting/web/${hosting}/attachedDomain`);
        })
        .then((domains) => {
          let buttons = domains.map((domain) => new Button(BUTTON_TYPE.POSTBACK, `ATTACHED_DOMAIN_SELECTED_${hosting}_${domain}`, domain));
          return {
            responses: [createPostBackList(sprintf(responsesCst.hostingSelectSite, Math.floor(1 + (currentIndex / MAX_LIMIT)), Math.ceil(buttons.length / MAX_LIMIT)), buttons, `MORE_ATTACHED_DOMAIN_${hosting}`, currentIndex, MAX_LIMIT)],
            feedback: false
          };
        })
        .catch((err) => {
          res.logger.error(err);
          return Bluebird.reject(error(err.error || err.statusCode || 400, err));
        });
    }
  },
  {
    regx: "MORE_HOSTING_([0-9]+)",
    action (senderId, postback, regx, entities, res) {
      let currentIndex = parseInt(postback.match(new RegExp(regx))[1], 10);
      return utils
        .getOvhClient(senderId)
        .then((ovhClient) => ovhClient.requestPromised("GET", "/hosting/web"))
        .then((hostings) => {
          const eltInfos = hostings.map((hosting) => new Button(BUTTON_TYPE.POSTBACK, `HOSTING_SELECTED_${hosting}`, hosting));

          return { responses: [createPostBackList(sprintf(responsesCst.hostingSelectHost, Math.floor(1 + (currentIndex / MAX_LIMIT)), Math.ceil(eltInfos.length / 4)), eltInfos, "MORE_HOSTING", currentIndex, MAX_LIMIT)], feedback: false };
        })
        .catch((err) => {
          res.logger.error(err);
          return Bluebird.reject(error(err.error || err.statusCode || 400, err));
        });
    }
  }
];

function getSSLState (ovhClient, hosting) {
  return Bluebird.props({
    infos: ovhClient.requestPromised("GET", `/hosting/web/${hosting}/ssl`).catch((err) => err.error === 404 || err.statusCode === 404 ? Bluebird.resolve(null) : Bluebird.reject(err)),
    domains: ovhClient.requestPromised("GET", `/hosting/web/${hosting}/ssl/domains`).catch((err) => err.error === 404 || err.statusCode === 404 ? Bluebird.resolve([]) : Bluebird.reject(err))
  });
}
