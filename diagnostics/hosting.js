"use strict";

const utils = require("../bots/utils");
const { Button, ButtonsMessage, TextMessage, BUTTON_TYPE } = require("../platforms/generics");
const Bluebird = require("bluebird").config({
  warnings: false
});
const _ = require("lodash");
const request = require("request-promise");

// const mathjs = require("mathjs");
const guides = require("../constants/guides").FR;
const diagCst = require("../constants/diagnostics").hosting.FR;
const v = require("voca");

module.exports = {
  checkWebsite (res, hosting, domain, hostingEmails, ssl /* , statistics*/) {
    res.logger.info(domain);
    const protocol = domain.ssl ? "https://" : "http://";
    let responses = this.checkEmailsState(hosting, hostingEmails);
    const sslState = this.checkSSL(hosting, domain, ssl);

    responses = responses.concat(sslState);

    // if (statistics) {
    //   this.monitore(hosting, statistics);
    // }

    return utils
      .dig(domain.domain)
      .then((ip) => {
        res.logger.info(hosting);
        res.logger.info(ip);
        const isDNSInvalid = this.checkDNS(ip, hosting, domain);

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
            responses.push(new TextMessage(diagCst.hostingButActive));
          } else {
            responses.push(new TextMessage(diagCst.hostingActive));
          }
          break;
        case "bloqued":
          responses = [
            ...responses,
            new TextMessage(diagCst.hostingBloqued),
            new TextMessage(guides.help(guides.websiteHack))
          ];
          break;
        case "maintenance":
          responses = [
            ...responses,
            new TextMessage(diagCst.hostingMaintenance),
            new TextMessage(guides.help(guides.websiteHack))
          ];
          break;
        default:
          responses.push(new TextMessage(diagCst.hostingUnknown));
        }

        return responses;
      })
      .catch((err) => {
        let managerButton;

        res.logger.info(err);
        if (Array.isArray(err) && err.length && typeof err[0] === "string") {
          return err;
        }

        switch (err.status || err.statusCode) {
        case 500:
          return responses.concat(this.error500(err, hosting));
        case 404:
          managerButton = new Button(BUTTON_TYPE.URL, `https://www.ovh.com/manager/web/#/configuration/hosting/${hosting.serviceName}?tab=DOMAINS`, diagCst.goToManager);
          return [...responses, new ButtonsMessage(diagCst.web404, [managerButton])];
        case 401:
          return [...responses, new TextMessage(diagCst.web401)];
        case 403:
          managerButton = new Button(BUTTON_TYPE.URL, `https://www.ovh.com/manager/web/#/configuration/hosting/${hosting.serviceName}?tab=DOMAINS`, diagCst.goToManager);
          return [...responses, new ButtonsMessage(diagCst.web403, [managerButton])];
        case 429:
          return [...responses, new TextMessage(guides.help(guides.blankPage))];
        default:
          if (err.code) {
            return responses.concat(this.explainError(err, hosting));
          }

          if (!sslState.length) {
            return [...responses, new TextMessage(diagCst.unknown), new TextMessage(guides.help(guides.errorApache))];
          }

          return responses;
        }
      });
  },

  // monitore(hosting, statistics) {
  //   let responses = [];
  //   let { dynamicStats, staticStats } = getStatsArray(statistics);
  //   let dynamicMean = mathjs.mean(dynamicStats);
  //   // let staticMean;

  //   // if (staticStats) {
  //   //   staticMean = mathjs.mean(staticStats);
  //   // }

  //   console.log("dynamicStats", dynamicStats);
  //   console.log("staticStats", staticStats);

  //   if (dynamicMean >= 2000) {
  //     responses.push("Votre site semble assez lent pour les contenus dynamiques, je te conseille de consulter ce guide afin d'optimiser votre site : " + guides.perfImprovements);
  //   }

  //   console.log("mean dynamic", mathjs.mean(dynamicStats));
  //   console.log("mode dynamic", mathjs.mode(dynamicStats));
  //   console.log("median dynamic", mathjs.median(dynamicStats));
  // },

  checkSSL (hosting, domain, ssl) {
    const responses = [];
    const managerButton = new Button(BUTTON_TYPE.URL, `https://www.ovh.com/manager/web/#/configuration/hosting/${hosting.serviceName}?tab=DOMAINS`, diagCst.goToManager);

    if ((domain.ssl && !ssl.infos) || (domain.ssl && ssl.infos && ssl.domains.indexOf(domain.domain) === -1)) {
      responses.push(new ButtonsMessage(diagCst.sslRegenerate, [managerButton]));
    } else if (!domain.ssl && ssl.infos && ssl.infos.provider === "LETSENCRYPT" && ssl.domains.indexOf(domain.domain) !== -1) {
      responses.push(new ButtonsMessage(diagCst.sslHttpsToHttpWarning, [managerButton]));
    }

    if (responses.length) {
      responses.push(new TextMessage(guides.help(guides.leError)));
    }

    return responses;
  },

  checkEmailsState (hosting, hostingEmails) {
    const responses = [];
    const managerButton = new Button(BUTTON_TYPE.URL, `https://www.ovh.com/manager/web/#/configuration/hosting/${hosting.serviceName}?tab=AUTOMATED_EMAILS`, diagCst.goToManager);

    switch (hostingEmails.state) {
    case "bounce":
      responses.push(new ButtonsMessage(diagCst.mailBounce, [managerButton]));
      break;
    case "force":
      break;
    case "ko":
      responses.push(new ButtonsMessage(diagCst.mailKo, [managerButton]));
      break;
    case "ok":
      break;
    case "purging":
      break;
    case "spam":
      responses.push(new ButtonsMessage(diagCst.mailSpam, [managerButton]));
      break;
    default:
      break;
    }

    if (responses.length) {
      responses.push(new TextMessage(guides.help(guides.mailBlock)));
    }

    return responses;
  },

  explainError (error, hosting) {
    switch (error.code) {
    case "ECONNREFUSED":
      return [
        new TextMessage(v.sprintf(diagCst.errorConnRefused, hosting.hostingIp)),
        new TextMessage(guides.help(guides.pointingError))
      ];
    case "ENOTFOUND":
      return [new TextMessage(diagCst.errorNotFound)];
    case "EAI_AGAIN":
      return [new TextMessage(diagCst.errorEaiAgain)];
    default:
      return [new TextMessage(diagCst.unknown)];
    }
  },

  checkDNS (ip, hostingInfos, domain) {
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

    if (goodIp) {
      return [
        new TextMessage(v.sprintf(diagCst.dns, ip, domain.domain, goodIp)),
        new TextMessage(guides.help(guides.dnsConfig))
      ];
    }

    return [];
  },

  error500 (err, hosting) {
    const rxDatababse = /(database.*connection)|(base.*donn[ée])/gi;

    if ((err.body && err.body.match(rxDatababse)) || (err.message && err.message.match(rxDatababse))) {
      const managerButton = new Button(BUTTON_TYPE.URL, `https://www.ovh.com/manager/web/#/configuration/hosting/${hosting.serviceName}?tab=DATABASES`, diagCst.goToManager);

      return [
        new ButtonsMessage(diagCst.web500db, [managerButton]),
        new TextMessage(guides.help(guides.dbError))
      ];
    }
    return [
      new TextMessage(diagCst.web500dev),
      new TextMessage(guides.help(guides.error500))
    ];
  }
};

// function getStatsArray(statistics) {
//   let globalStats = {};

//   statistics.forEach((stats) => {
//     globalStats[stats.serieName + "Stats"] = [];
//     stats.values.forEach((value) => value.value != null ? globalStats[stats.serieName + "Stats"].push(value.value) : null);
//   });

//   return globalStats;
// }
