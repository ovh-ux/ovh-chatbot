"use strict";

const Bluebird = require("bluebird");
const utils = require("../../utils");
const { ListItem, CardMessage, TextMessage } = require("../../../platforms/generics");

// const responsesCst = require("../../constants/responses").FR;


class StatusUpdate {
  static action (senderId) {
    return utils.getOvhClient(senderId)
      .then((ovhClient) => Bluebird.props({
        cloudStatus: ovhClient.requestPromised("GET", "/status/task"),
        xdslStatus: getXdslStatus(ovhClient)
      }))
      .then(({ cloudStatus, xdslStatus }) => {
        let responses = [
          ...cloudStatus.map((cloudIncident) => new CardMessage([
            new ListItem("Incident", cloudIncident.title),
            new ListItem("Etat", `${cloudIncident.status} (${cloudIncident.progress}%)`),
            new ListItem("Details", cloudIncident.details)
          ], true)),
          ...xdslStatus.map((xdslIncident) => new CardMessage([
            new ListItem("Incident", xdslIncident.comment),
            new ListItem("Résolution", xdslIncident.endDate),
            new ListItem("Details", `http://travaux.ovh.net/?do=details&id=${xdslIncident.taskId}`)
          ], true))
        ];

        if (!responses.length) {
          responses = [new TextMessage("Aucun probleme, tout est ok !")];
        }

        console.log(responses);

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
