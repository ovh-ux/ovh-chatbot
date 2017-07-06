"use strict";

const error = require("../../../providers/errors/apiError");
const { Button, createPostBackList, TextMessage } = require("../../../platforms/generics");
const utils = require("../../utils");
const Bluebird = require("bluebird");
const xDSLDiag = require("../../../diagnostics/xdsl");

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
        .then((user) =>
          Bluebird.props({
            xdsl: user.requestPromised("GET", `/xdsl/${xdslOffer}`),
            serviceInfos: user.requestPromised("GET", `/xdsl/${xdslOffer}/serviceInfos`),
            orderFollowUp: user.requestPromised("GET", `/xdsl/${xdslOffer}/orderFollowup`),
            incident: user.requestPromised("GET", `/xdsl/${xdslOffer}/incident`)
              .catch((err) => {
                if (err.error === 404 || err.errorCode === 404 || err.statusCode === 404) {
                  return Bluebird.resolve(null);
                }
                return Bluebird.reject(err);
              }),
            diag: user.requestPromised("GET", `/xdsl/${xdslOffer}/diagnostic`)
              .catch((err) => {
                if (err.error === 404 || err.errorCode === 404 || err.statusCode === 404) {
                  return Bluebird.resolve(null);
                }
                return Bluebird.reject(err);
              })
          })
        )
        .then(({ xdsl, serviceInfos, orderFollowUp, incident, diag }) => xDSLDiag.checkxDSLDiag(xdsl, serviceInfos, orderFollowUp, incident, diag))
        .then((responses) => Bluebird.resolve({ responses, feedback: false }))
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

      let user;
      return utils.getOvhClient(senderId)
      .then((lUser) => {
        user = lUser;
        return user.requestPromised("POST", `/xdsl/${xdslOffer}/diagnostic`);
      })
      .then(() => {
        const promise = new Bluebird((resolve, reject) => {
          const interval = setInterval(() => {
            user.requestPromised("GET", `/xdsl/${xdslOffer}/diagnostic`)
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
        return Bluebird.resolve({ responses: [new TextMessage("Diagnostique en cours... Veuillez patienter quelques instants, merci :)"), promise], feedback: false });
      })
      .catch((err) => {
        if (err.error === 401 || err.statusCode === 401 || err.errorCode === 401) {
          return Bluebird.resolve({ responses: [new TextMessage("Votre quota de diagnostiques a été atteint")] });
        }
        res.logger.error(err);
        return Bluebird.reject(error(err));
      });
    }
  },

  {
    regx: "MORE_XDSL_([0-9]+)",
    action (senderId, postback, regx, entites, res) {
      let user;
      return utils
        .getOvhClient(senderId)
        .then((lUser) => {
          user = lUser;
          return user.requestPromised("GET", "/xdsl");
        })
        .then((offers) => Bluebird.map(offers, (offer) =>
            user.requestPromised("GET", `/xdsl/${offer}`)
            .then((xdslInfo) => new Button("postback", `XDSL_SELECTED_${xdslInfo.accessName}`, xdslInfo.description)))
        )
        .then((buttons) => ({ responses: createPostBackList("Selectionne ta ligne", buttons, "MORE_XDSL", parseInt(new RegExp(regx)[1], 10), 10), feedback: false }))
        .catch((err) => {
          res.logger.error(err);
          return Bluebird.reject(error(err));
        });
    }
  }
];
