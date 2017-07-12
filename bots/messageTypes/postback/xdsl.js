"use strict";

const error = require("../../../providers/errors/apiError");
const { Button, createPostBackList, TextMessage, BUTTON_TYPE, MAX_LIMIT } = require("../../../platforms/generics");
const utils = require("../../utils");
const Bluebird = require("bluebird");
const xDSLDiag = require("../../../diagnostics/xdsl");
const responsesCst = require("../../../constants/responses").FR;
const v = require("voca");

Bluebird.config({
  warnings: false
});

module.exports = [
  {
    regx: "XDSL_SELECTED_(.*)",
    action (senderId, postback, regx, entites, res) {
      const xdslOffer = postback.match(new RegExp(regx))[1];

      return utils
        .getOvhClient(senderId)
        .then((ovhClient) =>
          Bluebird.props({
            xdsl: ovhClient.requestPromised("GET", `/xdsl/${xdslOffer}`),
            serviceInfos: ovhClient.requestPromised("GET", `/xdsl/${xdslOffer}/serviceInfos`),
            orderFollowUp: ovhClient.requestPromised("GET", `/xdsl/${xdslOffer}/orderFollowup`),
            incident: ovhClient.requestPromised("GET", `/xdsl/${xdslOffer}/incident`)
              .catch((err) => {
                if (err.error === 404) {
                  return Bluebird.resolve(null);
                }
                return Bluebird.reject(err);
              }),
            diag: ovhClient.requestPromised("GET", `/xdsl/${xdslOffer}/diagnostic`)
              .catch((err) => {
                if (err.error === 404) {
                  return Bluebird.resolve(null);
                }
                return Bluebird.reject(err);
              })
          })
        )
        .then(({ xdsl, serviceInfos, orderFollowUp, incident, diag }) => xDSLDiag.checkxDSLDiag(xdsl, serviceInfos, orderFollowUp, incident, diag))
        .then((responses) => Bluebird.resolve({ responses, feedback: true }))
        .catch((err) => {
          res.logger.error(err);
          return Bluebird.reject(error(err));
        });
    }
  },

  {
    regx: "XDSL_DIAG_(.*)",
    action (senderId, postback, regx, entites, res) {
      const xdslOffer = postback.match(new RegExp(regx))[1];

      let ovhClient;
      return utils.getOvhClient(senderId)
      .then((lUser) => {
        ovhClient = lUser;
        return ovhClient.requestPromised("POST", `/xdsl/${xdslOffer}/diagnostic`);
      })
      .then(() => {
        const promise = new Bluebird((resolve, reject) => {
          const interval = setInterval(() => {
            ovhClient.requestPromised("GET", `/xdsl/${xdslOffer}/diagnostic`)
            .then((diag) => {
              if (diag.isActiveOnLns != null && diag.incident != null && diag.ping != null &&
                diag.isModemConnected != null && diag.lineDetails != null) {
                clearInterval(interval);
                return resolve(diag);
              }
              return null;
            })
            .catch((err) => {
              clearInterval(interval);
              return reject(err);
            });
          }, 1000);
        }).then((diag) => xDSLDiag.checkxDSLDiagAdvanced(diag));
        return Bluebird.resolve({ responses: [new TextMessage(responsesCst.xdslDiagInProgress), promise], feedback: false });
      })
      .catch((err) => {
        if (err.statusCode === 401 || err.errorCode === 401) {
          return Bluebird.resolve({ responses: [new TextMessage(responsesCst.xdslQuotaReached)] });
        }
        res.logger.error(err);
        return Bluebird.reject(error(err));
      });
    }
  },

  {
    regx: "MORE_XDSL_([0-9]+)",
    action (senderId, postback, regx, entites, res) {
      let currentIndex = parseInt(postback.match(new RegExp(regx))[1], 10);
      let ovhClient;
      return utils
        .getOvhClient(senderId)
        .then((lUser) => {
          ovhClient = lUser;
          return ovhClient.requestPromised("GET", "/xdsl");
        })
        .map((offer) => ovhClient.requestPromised("GET", `/xdsl/${offer}`)
          .then((xdslInfo) => new Button(BUTTON_TYPE.POSTBACK, `XDSL_SELECTED_${xdslInfo.accessName}`, xdslInfo.description))
        )
        .then((buttons) => ({ responses: [createPostBackList(v.sprintf(responsesCst.xdslSelect, Math.floor(1 + (currentIndex / MAX_LIMIT)), Math.ceil(buttons.length / MAX_LIMIT)), buttons, "MORE_XDSL", currentIndex, MAX_LIMIT)], feedback: false }))
        .catch((err) => {
          res.logger.error(err);
          return Bluebird.reject(error(err));
        });
    }
  }
];
