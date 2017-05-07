"use strict";

const utils = require("../bots/utils");
const { Button, ButtonsMessage, TextMessage } = require("../platforms/generics");
const Bluebird = require("bluebird").config({
  warnings: false
});
const _ = require("lodash");
const request = require("request-promise");
// const mathjs = require("mathjs");
const guides = require("../constants/guides").FR;

module.exports = {

  checkWebsite(res, hosting, domain, hostingEmails, ssl/*, statistics*/) {
    res.logger.info(domain);
    let protocol = domain.ssl ? "https://" : "http://";
    let responses = this.checkEmailsState(hosting, hostingEmails);
    let sslState = this.checkSSL(hosting, domain, ssl);

    responses = responses.concat(sslState);

    // if (statistics) {
    //   this.monitore(hosting, statistics);
    // }

    return utils.dig(domain.domain)
      .then((ip) => {
        res.logger.info(hosting);
        res.logger.info(ip);
        let isDNSInvalid = this.checkDNS(ip, hosting, domain);

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
            responses.push(new TextMessage("Par contre ton site semble fonctionner correctement"));
          } else {
            responses.push(new TextMessage("Ton site semble fonctionner correctement"));
          }
          break;
        case "bloqued":
          responses = [...responses, new TextMessage("Il semblerait qu'il y ai un problème sur ton serveur mutualisé, il est bloqué pour l'instant"), new TextMessage(`Je te conseille de consulter ce guide pour essayer de te débloquer ${guides.websiteHack}`)];
          break;
        case "maintenance":
          responses = [...responses, new TextMessage("Il semblerait qu'il y ai un problème sur ton serveur mutualisé, il est actuellement en maintenance"), new TextMessage(`Je te conseille de consulter ce guide pour essayer de te débloquer ${guides.websiteHack}`)];
          break;
        default:
          responses.push(new TextMessage("Ton serveur est dans un état inconnu, veuillez contacter le support pour plus d'informations"));
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
          managerButton = new Button("web_url", `https://www.ovh.com/manager/web/#/configuration/hosting/${hosting.serviceName}?tab=DOMAINS`, "Vérifier la configuration");
          return [...responses, new ButtonsMessage("Il semblerait que la page à laquelle tu souhaites accéder n'existe pas, le fichier correspondant à cette page semble introuvable. Vérifie aussi si ton site pointe sur le bon dossier de destination dans le manager onglet 'multisites'.", [managerButton])];
        case 401:
          return [...responses, new TextMessage("Il semblerait que ton site essaie d'accéder à un fichier ou à un espace auquel il n'a pas les droits")];
        case 403:
          managerButton = new Button("web_url", `https://www.ovh.com/manager/web/#/configuration/hosting/${hosting.serviceName}?tab=DOMAINS`, "Vérifier la configuration");
          return [...responses, new ButtonsMessage("Il semblerait que ton site possède des problèmes de droits. Vérifie si ton site pointe sur le bon dossier de destination dans le manager onglet 'multisites'.", [managerButton])];
        case 429:
          return [...responses, new TextMessage("Ce guide pourrait peut être t'aider à résoudre ton problème : " + guides.blankPage)];
        default:
          if (err.code) {
            return responses.concat(this.explainError(err, hosting));
          }

          if (!sslState.length) {
            return [...responses, new TextMessage("Problème non diagnostiquable, ce guide pourrait néanmoins t'aider : " + guides.errorApache)];
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

  checkSSL(hosting, domain, ssl) {
    let responses = [];
    let managerButton = new Button("web_url", `https://www.ovh.com/manager/web/#/configuration/hosting/${hosting.serviceName}?tab=DOMAINS`, "Corriger le problème");

    if ((domain.ssl && !ssl.infos) || (domain.ssl && ssl.infos && ssl.domains.indexOf(domain.domain) === -1)) {
      responses.push(new ButtonsMessage("Tu as activé le SSL sur ton site mais ton certificat SSL ne contient pas ton domaine. Tu dois regénérer ton certificat via le manager", [managerButton]));
    } else if (!domain.ssl && ssl.infos && ssl.infos.provider === "LETSENCRYPT" && ssl.domains.indexOf(domain.domain) !== -1) {
      responses.push(new ButtonsMessage("Attention, ton site est compris dans le certificat SSL actuel et fonctionne actuellement en https. Cependant ta configuration indique que lors de la regénération automatique du certificat SSL ton site ne sera plus accessible en https. Si c'est le comportement voulu ou que tu n'utilises pas https sur ce site ne prend pas en compte cet avertissement.", [managerButton]));
    }

    if (responses.length) {
      responses.push(new TextMessage("Ce guide va pouvoir te rendre service pour configurer https sur ton site : " + guides.leError));
    }

    return responses;
  },

  checkEmailsState(hosting, hostingEmails) {
    let responses = [];
    let managerButton = new Button("web_url", `https://www.ovh.com/manager/web/#/configuration/hosting/${hosting.serviceName}?tab=AUTOMATED_EMAILS`, "Corriger le problème");

    switch (hostingEmails.state) {
    case "bounce":
      responses.push(new ButtonsMessage("Il semblerait que tes envois d'e-mails soient bloqués car ils ont dépassés 50% de retour en erreur", [managerButton]));
      break;
    case "force":
      break;
    case "ko":
      responses.push(new ButtonsMessage("Il semblerait que tes envois d'e-mails soient bloqués car ils ont dépassés 5% de retour en erreur", [managerButton]));
      break;
    case "ok":
      break;
    case "purging":
      break;
    case "spam":
      responses.push(new ButtonsMessage("Il semblerait que tes envois d'e-mails soient bloqués car ils ont envoyés des spams", [managerButton]));
      break;
    default:
      break;
    }

    if (responses.length) {
      responses.push(new TextMessage("Ce guide va pouvoir t'aider à débloquer tes e-mails : " + guides.mailBlock));
    }

    return responses;
  },

  explainError(error, hosting) {
    switch(error.code) {
    case "ECONNREFUSED":
      return [new TextMessage(`Il semblerait que ce soit un problème de pointage sur ton site, je te conseille de vérifier ta configuration DNS pour que ton nom de domaine pointe sur l'ip ${hosting.hostingIp}`), new TextMessage("Voici un guide qui pourra t'aider " + guides.pointingError)];
    case "ENOTFOUND":
      return [new TextMessage("Il semblerait que ta zone dns soit mal configurée")];
    case "EAI_AGAIN":
      return [new TextMessage("Il semblerait que ta zone dns soit mal configurée. Ton site n'est relié à aucun serveur d'hébergement web.")];
    default:
      return [new TextMessage("Problème non diagnostiquable")];
    }
  },

  checkDNS(ip, hostingInfos, domain) {
    let goodIp;

    if (domain.cdn === "active") { //ONLY CDN
      if (ip !== hostingInfos.hostingIp) {
        goodIp = hostingInfos.hostingIp;
      }
    } else if (domain.ssl) {
      let countryIp = _.find(hostingInfos.countriesIp, { country: domain.ipLocation }) || {};

      if (ip !== countryIp.ip) {
        goodIp = countryIp.ip;
      }
    } else if (ip !== hostingInfos.clusterIp){
      goodIp = hostingInfos.clusterIp;
    }

    if (goodIp) {
      return [new TextMessage(`Ton site ne pointe pas sur la bonne ip (actuellement ${ip}), ton domaine "${domain.domain}" devrait pointer sur l'ip ${goodIp}`), new TextMessage("Ce guide pourrait t'aider si tu ne sais pas comment faire ces modifications : " + guides.dnsConfig)];
    }
  },

  error500(err, hosting) {
    let rxDatababse = /(database.*connection)|(base.*donn[ée])/gi;

    if ((err.body && err.body.match(rxDatababse)) || (err.message && err.message.match(rxDatababse))) {
      let managerButton = new Button("web_url", `https://www.ovh.com/manager/web/#/configuration/hosting/${hosting.serviceName}?tab=DATABASES`, "Corriger le problème");

      return [new ButtonsMessage("Ton site n'arrive pas à se connecter à la base de données, je te conseille de vérifier le login et mot de passe de la base de données.", [managerButton]), new TextMessage("Voici un guide pour essayer de résoudre ce soucis : " + guides.dbError)];
    } else {
      return [new TextMessage("Il semblerait que tu aies fait une erreur de programmation sur ton site web. Dans ce genre de situation le support OVH n'intervient pas."), new TextMessage(`Voici un guide qui pourrait éventuellement t'aider : ${guides.error500}`)];
    }
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
