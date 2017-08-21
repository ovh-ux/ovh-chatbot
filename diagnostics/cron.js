"use strict";

const Users = require("../models/users.model");

// const utils = require("../utils/ovh");
const Bluebird = require("bluebird");
const { TextMessage } = require("../platforms/generics");
const translator = require("../utils/translator");
const messenger = require("../platforms/messenger/messenger");
const slack = require("../platforms/slack/slack");
const request = require("request-promise");
const hostingDiagnostics = require("./hosting");
const cron = require("node-cron");
const _ = require("lodash");
const logger = require("../providers/logging/logger");

module.exports = {
  getServicesStatus,
  getServicesExpires
};

cron.schedule("0 */2 * * *", performUpdate, false);
function performUpdate () {
  logger.info("Status update:", new Date());
  Users.find({ updates: true }).then((users) => Bluebird.map(users, (user) => getServicesExpires(user.senderId, user.platform).then((resp) => send(user.senderId, user.platform, resp))))
  .then(() => logger.info("Status update done"));
}

// performUpdate();

/**
what is my service status ?
*/
function getServicesStatus (ovhClient, locale) {
  return Bluebird.props({
    cloudStatus: ovhClient.requestPromised("GET", "/status/task").filter((incident) => incident.status !== "finished"),
    xdslStatus: getXdslStatus(ovhClient),
    hostingStatus: getHostingStatus(ovhClient)
  })
  .then(({ cloudStatus, xdslStatus, hostingStatus }) => [
    ...cloudStatus.map((cloudIncident) => new TextMessage(translator("cloud-incident", locale, cloudIncident.title, translator(`cloud-${cloudIncident.status}`, locale), cloudIncident.progress, cloudIncident.details))),
    ...xdslStatus.map((xdslIncident) => new TextMessage(translator("xdsl-incident", locale, xdslIncident.comment, xdslIncident.endDate, `http://travaux.ovh.net/?do=details&id=${xdslIncident.taskId}`))),
    ...hostingStatus
  ])
  .catch(() => []);
}

function send (senderId, platform, responses) {
  switch (platform) {
  case "slack":
    return Users.findOne({ senderId })
    .then((user) => slack.getSlackApi(user.team_id))
    .then((slackTeam) => Bluebird.mapSeries(responses, (response) => slackTeam.send(senderId, response)));
  case "facebook_messenger":
    return Bluebird.mapSeries(responses, (response) => messenger.send(senderId, response));
  default:
    return Bluebird.resolve();
  }
}

function getXdslStatus (ovhClient) {
  return ovhClient.requestPromised("GET", "/xdsl")
  .map((service) => ovhClient.requestPromised("GET", `/xdsl/${service}/incidents`).catch((err) => {
    if (err.error === 404 || err.statusCode === 404) {
      return null;
    }

    return Bluebird.reject(err);
  }))
  .filter((incident) => incident != null)
  .map((incidentId) => ovhClient.requestPromised("GET", `/xdsl/incidents/${incidentId}`));
}


function getHostingStatus (ovhClient, locale) {
  return ovhClient.requestPromised("GET", "/hosting/web/")
  .then((websites) => Bluebird.map(websites, (site) => request(`http://${site}`)
  .then(() => [])
  .catch(() => ovhClient.requestPromised("GET", `/hosting/web/${site}/attachedDomain`) // sites has issue do advance check
  .then((domains) => Bluebird.map(domains, (domain) => hostingAdvanceCheck(ovhClient, site, domain, locale).catch(() => []))))
)).then((responses) => _.flattenDeep(responses));
}

function hostingAdvanceCheck (ovhClient, site, domain, locale) {
  return Bluebird.props({
    hosting: ovhClient.requestPromised("GET", `/hosting/web/${site}`),
    attachedDomain: ovhClient.requestPromised("GET", `/hosting/web/${site}/attachedDomain/${domain}`),
    hostingEmails: ovhClient.requestPromised("GET", `/hosting/web/${site}/email`),
    ssl: getSSLState(ovhClient, site),
    dns: getDNSState(ovhClient, domain)
  })
  .then(({ hosting, attachedDomain, hostingEmails, ssl, dns }) => hostingDiagnostics.checkWebsite(null, hosting, attachedDomain, hostingEmails, ssl, dns, locale));

}

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


/**
When will my service expires ?
*/
function getServicesExpires (ovhClient, locale, expiresPeriod) {
  let services = ["/allDom", "/caas/containers", "/caas/registry", "/cdn/dedicated", "/cdn/website",
    "/cdn/webstorage", "/cloud/project", "/cluster/hadoop", "/dbaas/logs", "/dbaas/queue", "/dbaas/timeseries",
    "/dedicated/ceph", "/dedicated/housing", "/dedicated/nas", "/dedicated/nasha", "/dedicated/server", "/dedicatedCloud",
    "/deskaas", "/domain", "/domain/zone", "/email/domain", "/email/pro", "/freefax", "/horizonView", "/hosting/privateDatabase",
    "/hosting/reseller", "/hosting/web", "/hpcspot", "/ip/loadBalancing", "/ipLoadbalancing", "/license/cloudLinux", "/license/cpanel",
    "/license/directadmin", "/license/office", "/license/plesk", "/license/sqlserver", "/license/virtuozzo", "/license/windows", "/license/worklight",
    "/metrics", "/msServices/sharepoint", "/overTheBox", "/paas/database/", "/paas/monitoring", "/pack/siptrunk", "/pack/xdsl", "/router", "/saas/csp2",
    "/sms", "/ssl", "/sslGateway", "/stack/mis", "/telephony", "/veeamCloudConnect", "/vps", "/xdsl", "/xdsl/spare"];

  // TODO email/exchange
  return Bluebird.all(services.map((service) => getServicesExpirationDate(ovhClient, service, expiresPeriod)))
  .then((infoArray) => infoArray.map((serviceInfosArray) => {
    if (serviceInfosArray.length) {

      let string = serviceInfosArray.map((info) =>
        translator(info.diff > 0 ? "serviceWillExpired" : "serviceHasExpired", locale, info.serviceName, info.status, Math.abs(info.diff), info.expireDate.toLocaleDateString(locale.replace("_", "-")))).join("\n");
      return new TextMessage(`${serviceInfosArray[0].baseUrl}:\n${string}`);
    }
    return null;
  }).filter((element) => !!element));
}


function getServicesExpirationDate (ovhClient, baseUrl, expiresPeriod) {
  return ovhClient.requestPromised("GET", baseUrl)
  .then((servicesNames) => Bluebird.mapSeries(servicesNames, (serviceName) => ovhClient.requestPromised("GET", `${baseUrl}/${serviceName}/serviceInfos`)
  .then((serviceInfos) => {
    let expireDate = new Date(serviceInfos.expiration);
    let diff = Math.ceil((expireDate - new Date()) / (1000 * 3600 * 24)); // conversion to diff in days
    if (diff <= expiresPeriod && serviceInfos.renewalType === "manual") {
      return {
        baseUrl,
        serviceName,
        diff,
        expireDate: new Date(serviceInfos.expiration),
        renewalType: serviceInfos.renewalType,
        status: serviceInfos.status
      };
    }
    return null;
  }).catch((err) => {
    console.error(err, baseUrl, serviceName);
    return null;
  }))).then((infos) => infos.filter((info) => !!info));
}
