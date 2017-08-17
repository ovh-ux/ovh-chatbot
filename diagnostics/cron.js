"use strict";

const Users = require("../models/users.model");
const utils = require("../utils/ovh");
const Bluebird = require("bluebird");
const { TextMessage } = require("../platform/generics");
const translator = require("../utils/translator");

/** entry point **/
function performUpdate () {
  return Users.find({}).then((users) => {
    users.forEach((user) => getServicesStatus(user.senderId, user.platform));
  });
}

function getServicesStatus (senderId, platform) {
  let ovhClient;
  let locale;

  return utils.getOvhClient(senderId)
    .then((localOvhClient) => { ovhClient = localOvhClient; })
    .then(() => ovhClient.requestPromised("GET", "/me/preference/manager/CHATBOT_PREF"))
    .then(({ value }) => {
      // check if user wants update
      if (value.update) {
        return ovhClient.requestPromised("GET", "/me");
      }
      return Bluebird.reject();
    })
    .then((meInfos) => { locale = meInfos.language; })
    .then(() => Bluebird.props({
      cloudStatus: ovhClient.requestPromised("GET", "/status/task").filter((incident) => incident.status !== "finished"),
      xdslStatus: getXdslStatus(ovhClient)
    }))
    .then(({ cloudStatus, xdslStatus }) => [
      ...cloudStatus.map((cloudIncident) => new TextMessage(translator("cloud-incident", locale, cloudIncident.title, translator(`cloud-${cloudIncident.status}`, locale), cloudIncident.progress, cloudIncident.details))),
      ...xdslStatus.map((xdslIncident) => new TextMessage(translator("xdsl-incident", locale, xdslIncident.comment, xdslIncident.endDate, `http://travaux.ovh.net/?do=details&id=${xdslIncident.taskId}`)))
    ])
    .catch(() => [])
    .then((responses) => responses ? sendStatus(senderId, platform, responses) : null);
}

function sendStatus (senderId, platform, responses) {
  switch (platform) {
  case "slack":
    console.log("slack!", responses);
    return;
  case "facebook_messenger":
    console.log("messenger!", responses);
    break;
  default:
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

module.exports = {
  performUpdate
};
