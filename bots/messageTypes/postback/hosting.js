"use strict";

const error = require("../../../providers/errors/apiError");
const { Button, createPostBackList, TextMessage, BUTTON_TYPE, MAX_LIMIT } = require("../../../platforms/generics");
const utils = require("../../../utils/ovh");
const Bluebird = require("bluebird").config({
  warnings: false
});
const translator = require("../../../utils/translator");
const hostingDiagnostics = require("../../../diagnostics/hosting");

module.exports = [
  {
    regx: "HOSTING_SELECTED_(.*)",
    action (senderId, postback, regx, entities, res, locale) {
      let hosting;

      return utils
        .getOvhClient(senderId)
        .then((ovhClient) => {
          hosting = postback.match(new RegExp(regx))[1];

          return ovhClient.requestPromised("GET", `/hosting/web/${hosting}/attachedDomain`);
        })
        .then((attachedDomains) => {
          let buttons = attachedDomains.map((domain) => new Button(BUTTON_TYPE.POSTBACK, `ATTACHED_DOMAIN_SELECTED_${hosting}_${domain}`, domain));
          return { responses: [createPostBackList(translator("hostingSelectSite", locale, 1, Math.ceil(buttons.length / MAX_LIMIT)), buttons, `MORE_ATTACHED_DOMAIN_${hosting}`, 0, MAX_LIMIT, locale)], feedback: false };
        })
        .catch((err) => {
          res.logger.error(err);

          return Bluebird.reject(error(err.error || err.statusCode || 400, err));
        });
    }
  },
  {
    regx: "ATTACHED_DOMAIN_SELECTED_(.*)_(.*)",
    action (senderId, postback, regx, entities, res, locale) {
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
            dns: getDNSState(ovhClient, domain)
          });
        })
        .then(({ hosting, attachedDomain, hostingEmails, ssl, dns }) => hostingDiagnostics.checkWebsite(res, hosting, attachedDomain, hostingEmails, ssl, dns, locale))
        .then((responses) => ({ responses, feedback: true }))
        .catch((err) => {
          res.logger.error(err);
          if (err.error === 404 || err.statusCode === 404) {
            return Bluebird.reject(error(404, translator("hostingWrongSite", locale)));
          }

          if (err.error === 460 || err.statusCode === 460) {
            return Bluebird.resolve({ responses: [
              new TextMessage(translator("hostingSuspended", locale)),
              new TextMessage(translator("guides-help", locale, translator("guides-renewOvh", locale)))
            ],
              feedback: false });
          }

          return Bluebird.reject(error(err.error || err.statusCode || 400, err));
        });
    }
  },
  {
    regx: "MORE_ATTACHED_DOMAIN_(.*)_([0-9]+)",
    action (senderId, postback, regx, entities, res, locale) {
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
            responses: [createPostBackList(translator("hostingSelectSite", locale, Math.floor(1 + (currentIndex / MAX_LIMIT)), Math.ceil(buttons.length / MAX_LIMIT)), buttons, `MORE_ATTACHED_DOMAIN_${hosting}`, currentIndex, MAX_LIMIT, locale)],
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
    action (senderId, postback, regx, entities, res, locale) {
      let currentIndex = parseInt(postback.match(new RegExp(regx))[1], 10);
      return utils
        .getOvhClient(senderId)
        .then((ovhClient) => ovhClient.requestPromised("GET", "/hosting/web"))
        .then((hostings) => {
          const eltInfos = hostings.map((hosting) => new Button(BUTTON_TYPE.POSTBACK, `HOSTING_SELECTED_${hosting}`, hosting));

          return { responses: [createPostBackList(translator("hostingSelectHost", locale, Math.floor(1 + (currentIndex / MAX_LIMIT)), Math.ceil(eltInfos.length / 4)), eltInfos, "MORE_HOSTING", currentIndex, MAX_LIMIT, locale)], feedback: false };
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

function getDNSState (ovhClient, domain) {
  return Bluebird.props({
    target: ovhClient.requestPromised("GET", `/domain/zone/${domain}/record`, { fieldType: "NS" })
      .then((ids) => Bluebird.mapSeries(ids, (id) => ovhClient.requestPromised("GET", `/domain/zone/${domain}/record/${id}`))),
    real: ovhClient.requestPromised("GET", `/domain/zone/${domain}`)
  });
}
