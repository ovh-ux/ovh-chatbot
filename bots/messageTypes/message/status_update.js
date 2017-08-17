"use strict";

const Bluebird = require("bluebird");
const utils = require("../../../utils/ovh");
const { TextMessage } = require("../../../platforms/generics");
const translator = require("../../../utils/translator");


class StatusUpdate {
  static action (senderId, message, entities, res, locale) {
    return utils.getOvhClient(senderId)
      .then((ovhClient) => Bluebird.props({
        cloudStatus: ovhClient.requestPromised("GET", "/status/task").filter((incident) => incident.status !== "finished"),
        xdslStatus: getXdslStatus(ovhClient)
      }))
      .then(({ cloudStatus, xdslStatus }) => {
        let responses = [
          ...cloudStatus.map((cloudIncident) => new TextMessage(translator("cloud-incident", locale, cloudIncident.title, translator(`cloud-${cloudIncident.status}`, locale), cloudIncident.progress, cloudIncident.details))),
          ...xdslStatus.map((xdslIncident) => new TextMessage(translator("xdsl-incident", locale, xdslIncident.comment, xdslIncident.endDate, `http://travaux.ovh.net/?do=details&id=${xdslIncident.taskId}`)))
        ];

        if (!responses.length) {
          responses = [new TextMessage(translator("allOk", locale))];
        }

        return { responses, feedback: false };
      });
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

module.exports = { status_update: StatusUpdate };
