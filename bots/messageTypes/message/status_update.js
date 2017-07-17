"use strict";

const Bluebird = require("bluebird");
const utils = require("../../utils");
const { ListItem, CardMessage, TextMessage } = require("../../../platforms/generics");
const responsesCst = require("../../constants/responses").FR;


class StatusUpdate {
  static action (senderId) {
    return utils.getOvhClient(senderId)
      .then((ovhClient) => Bluebird.props({
        cloudStatus: ovhClient.requestPromised("GET", "/status/task").filter((incident) => incident.status !== "finished"),
        xdslStatus: getXdslStatus(ovhClient)
      }))
      .then(({ cloudStatus, xdslStatus }) => {
        let responses = [
          ...cloudStatus.map((cloudIncident) => new CardMessage([
            new ListItem(responsesCst.incident, cloudIncident.title),
            new ListItem(responsesCst.status, `${cloudIncident.status} (${cloudIncident.progress}%)`),
            new ListItem(responsesCst.details, cloudIncident.details)
          ], true)),
          ...xdslStatus.map((xdslIncident) => new CardMessage([
            new ListItem(responsesCst.incident, xdslIncident.comment),
            new ListItem(responsesCst.eta, xdslIncident.endDate),
            new ListItem(responsesCst.details, `http://travaux.ovh.net/?do=details&id=${xdslIncident.taskId}`)
          ], true))
        ];

        if (!responses.length) {
          responses = [new TextMessage(responsesCst.evrythingOk)];
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
