"use strict";

const Bluebird = require("Bluebird");
const utils = require("../utils");

// const responsesCst = require("../../constants/responses").FR;


class StatusUpdate {
  static action (senderId) {
    return utils.getOvhClient(senderId)
      .then((ovhClient) => Bluebird.props({
        clouddStatus: ovhClient.requestPromised("GET", "/status/incident").filter((incident) => incident.status !== "finished"),
        xdslStatus: getXdslStatus(ovhClient),
        hostingStatus: ovhClient.requestPromised("GET", "/hosting/web/incident")
      }))
      .then(({ cloudStatus, xdslStatus, hostingStatus }) => {
        console.log(cloudStatus, xdslStatus, hostingStatus);
      });
  }
}

function getXdslStatus (ovhClient) {
  return ovhClient.requestPromised("GET", "/xdsl")
    .map((id) => ovhClient.requestPromised("GET", `/xdsl/${id}/incident`).catch((err) => {
      if (err.error === 404 || err.statusCode === 404) {
        return null;
      }

      return Bluebird.reject(err);
    }))
    .filter((incident) => incident != null);
}

module.exports = { status_update: StatusUpdate };
