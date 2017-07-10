"use strict";

const error = require("../../../providers/errors/apiError");
const { ButtonsListMessage, Button, createPostBackList, TextMessage, BUTTON_TYPE } = require("../../../platforms/generics");
const utils = require("../../utils");
const Bluebird = require("bluebird").config({
  warnings: false
});
const guides = require("../../../constants/guides").FR;
const responsesCst = require("../../../constants/responses").FR;
const hostingDiagnostics = require("../../../diagnostics/hosting");

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
        .then((attachedDomains) => ({ responses: [new TextMessage(responsesCst.hostingSelectSite), createWebsiteList(hosting, attachedDomains, 0, 4)], feedback: false }))
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
          if (err.error === 404) {
            return Bluebird.reject(error(404, responsesCst.hostingWrongSite));
          }

          if (err.error === 460) {
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
      let hosting;

      return utils
        .getOvhClient(senderId)
        .then((ovhClient) => {
          hosting = postback.match(new RegExp(regx))[1];

          return ovhClient.requestPromised("GET", `/hosting/web/${hosting}/attachedDomain`);
        })
        .then((domains) => ({ responses: [createWebsiteList(hosting, domains, parseInt(postback.match(new RegExp(regx))[2], 10), 4)], feedback: false }))
        .catch((err) => {
          res.logger.error(err);
          return Bluebird.reject(error(err.error || err.statusCode || 400, err));
        });
    }
  },
  {
    regx: "MORE_HOSTING_([0-9]+)",
    action (senderId, postback, regx, entities, res) {
      return utils
        .getOvhClient(senderId)
        .then((ovhClient) => ovhClient.requestPromised("GET", "/hosting/web"))
        .then((hostings) => {
          const eltInfos = hostings.map((hosting) => new Button(BUTTON_TYPE.POSTBACK, `HOSTING_SELECTED_${hosting}`, hosting));

          return { responses: [createPostBackList(responsesCst.hostingSelectHost, eltInfos, "MORE_HOSTING", parseInt(postback.match(new RegExp(regx))[1], 10), 4)], feedback: false };
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
    infos: ovhClient.requestPromised("GET", `/hosting/web/${hosting}/ssl`).catch((err) => err.error === 404 ? Bluebird.resolve(null) : Bluebird.reject(err)),
    domains: ovhClient.requestPromised("GET", `/hosting/web/${hosting}/ssl/domains`).catch((err) => err.error === 404 ? Bluebird.resolve([]) : Bluebird.reject(err))
  });
}

function createWebsiteList (hosting, domains, offset, limit) {
  const elements = [];

  for (let i = offset; i < limit + offset && i < domains.length; i++) {
    elements.push(new Button(BUTTON_TYPE.POSTBACK, `ATTACHED_DOMAIN_SELECTED_${hosting}_${domains[i]}`, domains[i]));
  }

  const moreButton = offset + limit >= domains.length ? null : new Button(BUTTON_TYPE.MORE, `MORE_ATTACHED_DOMAIN_${hosting}_${offset + limit}`, responsesCst.moreButton);

  if (moreButton) {
    elements.push(moreButton);
  }

  return new ButtonsListMessage("", elements);
}
