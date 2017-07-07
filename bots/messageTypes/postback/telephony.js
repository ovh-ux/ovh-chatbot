"use strict";


const error = require("../../../providers/errors/apiError");
const { Button, createPostBackList, TextMessage } = require("../../../platforms/generics");
const utils = require("../../utils");
const Bluebird = require("bluebird").config({
  warnings: false
});
const telephonyDiag = require("../../../diagnostics/telephony");

module.exports = [
  {
    regx: "TELEPHONY_SELECTED_(.*)",
    action (senderId, postback, regx, entites, res) {
      let service = postback.match(new RegExp(regx))[1];

      return utils.getOvhClient(senderId)
      .then((user) => Bluebird.props({
        billing: user.requestPromised("GET", `/telephony/${service}/`),
        portability: user.requestPromised("GET", `/telephony/${service}/portability`)
          .then((arr) => arr.map((id) => {
            let portability;

            return user.requestPromised("GET", `/telephony/${service}/portability/${id}`)
            .then((dataPortability) => {
              portability = dataPortability;

              return user.requestPromised("GET", `/telephony/${service}/portability/${id}/status`);
            })
            .then((status) => {
              portability.status = status;

              return portability;
            });
          })),
        serviceInfos: user.requestPromised("GET", `/telephony/${service}/serviceInfos`)
      }))
      .then(({ billing, portability, serviceInfos }) => ({ responses: telephonyDiag.telephonyDiag(billing, portability, serviceInfos), feedback: true }))
      .catch((err) => {
        res.logger.error(err);
        return Bluebird.reject(error(err));
      });
    }
  },
  {
    regx: "MORE_TELEPHONY_([0-9]+)",
    action (senderId, postback, regx) {
      let user;

      return utils.getOvhClient(senderId)
      .then((lUser) => {
        user = lUser;
        return user.requestPromised("GET", "/telephony");
      })
      .map((service) => user.requestPromised("GET", `/telephony/${service}`)
          .then((info) => new Button("postback", `TELEPHONY_SELECTED_${info.billingAccount}`, info.description))
      )
      .then((buttons) => ({
        responses: [buttons.length > 0 ? createPostBackList("Selectionnez votre compte", buttons, "MORE_TELEPHONY", parseInt(postback.match(new RegExp(regx))[1], 10), 10) : new TextMessage("Vous n'avez pas d'offre telephonie")],
        feedback: false
      }));
    }
  }

];
