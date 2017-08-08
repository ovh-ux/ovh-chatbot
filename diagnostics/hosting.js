"use strict";

const utils = require("../utils/hosting");
const { Button, ButtonsMessage, TextMessage, BUTTON_TYPE } = require("../platforms/generics");
const Bluebird = require("bluebird").config({
  warnings: false
});
const _ = require("lodash");
const request = require("request-promise");

const translator = require("../utils/translator");

module.exports = {
  checkWebsite (res, hosting, domain, hostingEmails, ssl, dns, locale) {
    res.logger.info(domain);
    const protocol = domain.ssl ? "https://" : "http://";
    let responses = this.checkEmailsState(hosting, hostingEmails);
    const sslState = this.checkSSL(hosting, domain, ssl);

    responses = responses.concat(sslState);

    return utils
      .dig(domain.domain)
      .then((ip) => {
        res.logger.info(hosting);
        res.logger.info(ip);
        const isDNSInvalid = this.checkDNS(ip, hosting, domain, dns);

        res.logger.info(isDNSInvalid);
        if (isDNSInvalid) {
          return Bluebird.reject(isDNSInvalid);
        }

        return request(protocol + domain.domain);
      })
      .then(() => {
        switch (hosting.state) {
        case "active":
          if (responses.length) {
            responses.push(new TextMessage(translator("hosting.hostingButActive", locale)));
          } else {
            responses.push(new TextMessage(translator("hosting.hostingActive", locale)));
          }
          break;
        case "bloqued":
          responses = [
            ...responses,
            new TextMessage(translator("hosting.hostingBloqued", locale)),
            new TextMessage(translator("guides.help", locale, translator("guides.websiteHack", locale)))
          ];
          break;
        case "maintenance":
          responses = [
            ...responses,
            new TextMessage(translator("hosting.hostingMaintenance", locale)),
            new TextMessage(translator("guides.help", locale, translator("guides.websiteHack", locale)))
          ];
          break;
        default:
          responses.push(new TextMessage(translator("hosting.hostingUnknown", locale)));
        }

        return responses;
      })
      .catch((err) => {
        let managerButton;

        res.logger.info(err);
        if (Array.isArray(err) && err.length && (typeof err[0] === "string" || err[0] instanceof TextMessage)) {
          return err;
        }

        switch (err.status || err.statusCode) {
        case 500:
          return responses.concat(this.error500(err, hosting));
        case 404:
          managerButton = new Button(BUTTON_TYPE.URL, `https://www.ovh.com/manager/web/#/configuration/hosting/${hosting.serviceName}?tab=DOMAINS`, translator("hosting.goToManager", locale));
          return [...responses, new ButtonsMessage(translator("hosting.web404", locale), [managerButton])];
        case 401:
          return [...responses, new TextMessage(translator("hosting.web401", locale))];
        case 403:
          managerButton = new Button(BUTTON_TYPE.URL, `https://www.ovh.com/manager/web/#/configuration/hosting/${hosting.serviceName}?tab=DOMAINS`, translator("hosting.goToManager", locale));
          return [...responses, new ButtonsMessage(translator("hosting.web403", locale), [managerButton])];
        case 429:
          return [...responses, new TextMessage(translator("guides.help", locale, translator("guides.blankPage", locale)))];
        default:
          if (err.code) {
            return responses.concat(this.explainError(err, hosting, locale));
          }

          if (!sslState.length) {
            return [...responses, new TextMessage(translator("hosting.unknown", locale)), new TextMessage(translator("guides.help", locale, translator("guides.errorApache", locale)))];
          }

          return responses;
        }
      });
  },

  checkSSL (hosting, domain, ssl, locale) {
    const responses = [];
    const managerButton = new Button(BUTTON_TYPE.URL, `https://www.ovh.com/manager/web/#/configuration/hosting/${hosting.serviceName}?tab=DOMAINS`, translator("hosting.goToManager", locale));

    if ((domain.ssl && !ssl.infos) || (domain.ssl && ssl.infos && ssl.domains.indexOf(domain.domain) === -1)) {
      responses.push(new ButtonsMessage(translator("hosting.sslRegenerate", locale), [managerButton]));
    } else if (!domain.ssl && ssl.infos && ssl.infos.provider === "LETSENCRYPT" && ssl.domains.indexOf(domain.domain) !== -1) {
      responses.push(new ButtonsMessage(translator("hosting.sslHttpsToHttpWarning", locale), [managerButton]));
    }

    if (responses.length) {
      responses.push(new TextMessage(translator("guides.help", locale, translator("guides.leError", locale))));
    }

    return responses;
  },

  checkEmailsState (hosting, hostingEmails, locale) {
    const responses = [];
    const managerButton = new Button(BUTTON_TYPE.URL, `https://www.ovh.com/manager/web/#/configuration/hosting/${hosting.serviceName}?tab=AUTOMATED_EMAILS`, translator("hosting.goToManager", locale));

    switch (hostingEmails.state) {
    case "bounce":
      responses.push(new ButtonsMessage(translator("hosting.mailBounce", locale), [managerButton]));
      break;
    case "force":
      break;
    case "ko":
      responses.push(new ButtonsMessage(translator("hosting.mailKo", locale), [managerButton]));
      break;
    case "ok":
      break;
    case "purging":
      break;
    case "spam":
      responses.push(new ButtonsMessage(translator("hosting.mailSpam", locale), [managerButton]));
      break;
    default:
      break;
    }

    if (responses.length) {
      responses.push(new TextMessage(translator("guides.help", locale, translator("guides.mailBlock", locale))));
    }

    return responses;
  },

  explainError (error, hosting, locale) {
    switch (error.code) {
    case "ECONNREFUSED":
      return [
        new TextMessage(translator("hosting.errorConnRefused", locale, hosting.hostingIp)),
        new TextMessage(translator("guides.help", locale, translator("guides.pointingError", locale)))
      ];
    case "ENOTFOUND":
      return [new TextMessage(translator("hosting.errorNotFound", locale))];
    case "EAI_AGAIN":
      return [new TextMessage(translator("hosting.errorEaiAgain", locale))];
    default:
      return [new TextMessage(translator("hosting.unknown", locale))];
    }
  },

  checkDNS (ip, hostingInfos, domain, dnsInfo, locale) {
    let responses = [];
    let goodIp;

    if (domain.cdn === "active") {
      // ONLY CDN
      if (ip !== hostingInfos.hostingIp) {
        goodIp = hostingInfos.hostingIp;
      }
    } else if (domain.ssl) {
      const countryIp = _.find(hostingInfos.countriesIp, { country: domain.ipLocation }) || {};

      if (ip !== countryIp.ip) {
        goodIp = countryIp.ip;
      }
    } else if (ip !== hostingInfos.clusterIp) {
      goodIp = hostingInfos.clusterIp;
    }

    if (dnsInfo.real.nameServers.length !== dnsInfo.target.length) {
      let targets = dnsInfo.target.map((trgt) => trgt.target.slice(0, -1));
      let wrongs = _.difference(dnsInfo.real.nameServers, targets);

      responses = [new TextMessage(translator("hosting.dnsWrongConfig", locale, wrongs.join(", "), targets.join(", ")))];
    }

    if (goodIp) {
      responses = [
        ...responses,
        new TextMessage(translator("hosting.dns", locale, ip, domain.domain, goodIp)),
        new TextMessage(translator("guides.help", locale, translator("guides.dnsConfig", locale)))
      ];
    }

    return responses;
  },

  error500 (err, hosting, locale) {
    const rxDatababse = /(database.*connection)|(base.*donn[ée])/gi;

    if ((err.body && err.body.match(rxDatababse)) || (err.message && err.message.match(rxDatababse))) {
      const managerButton = new Button(BUTTON_TYPE.URL, `https://www.ovh.com/manager/web/#/configuration/hosting/${hosting.serviceName}?tab=DATABASES`, translator("hosting.goToManager", locale));

      return [
        new ButtonsMessage(translator("hosting.web500db", locale), [managerButton]),
        new TextMessage(translator("guides.help", locale, translator("guides.dbError", locale)))
      ];
    }
    return [
      new TextMessage(translator("hosting.web500dev", locale)),
      new TextMessage(translator("guides.help", locale, translator("guides.error500", locale)))
    ];
  }
};
