"use strict";


const error = require("../../../providers/errors/apiError");
const { Button, createPostBackList, TextMessage, BUTTON_TYPE, MAX_LIMIT } = require("../../../platforms/generics");
const utils = require("../../utils");
const Bluebird = require("bluebird").config({
  warnings: false
});
const telephonyDiag = require("../../../diagnostics/telephony");
const responsesCst = require("../../../constants/responses").FR;
const v = require("voca");


const parsePortability = (ovhClient, service) =>
  ovhClient.requestPromised("GET", `/telephony/${service}/portability`)
    .then((arr) => arr.map((id) => {
      let portability;

      return ovhClient.requestPromised("GET", `/telephony/${service}/portability/${id}`)
      .then((dataPortability) => {
        portability = dataPortability;

        return ovhClient.requestPromised("GET", `/telephony/${service}/portability/${id}/status`);
      })
      .then((status) => {
        portability.status = status;

        return portability;
      });
    }));

module.exports = [
  {
    regx: "TELEPHONY_SELECTED_(.*)",
    action (senderId, postback, regx, entites, res) {
      let service = postback.match(new RegExp(regx))[1];

      return utils.getOvhClient(senderId)
      .then((ovhClient) => Bluebird.props({
        billing: ovhClient.requestPromised("GET", `/telephony/${service}/`),
        portability: parsePortability(ovhClient, service),
        serviceInfos: ovhClient.requestPromised("GET", `/telephony/${service}/serviceInfos`)
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
      let currentIndex = parseInt(postback.match(new RegExp(regx))[1], 10);
      let ovhClient;

      return utils.getOvhClient(senderId)
      .then((lOvhClient) => {
        ovhClient = lOvhClient;
        return ovhClient.requestPromised("GET", "/telephony");
      })
      .map((service) => ovhClient.requestPromised("GET", `/telephony/${service}`)
          .then((info) => new Button(BUTTON_TYPE.POSTBACK, `TELEPHONY_SELECTED_${info.billingAccount}`, info.description))
      )
      .then((buttons) => ({
        responses: buttons.length > 0 ? [createPostBackList(v.sprintf(responsesCst.telephonySelectAccount, Math.floor(1 + (currentIndex / MAX_LIMIT)), Math.ceil(buttons.length / MAX_LIMIT)), buttons, "MORE_TELEPHONY", currentIndex, MAX_LIMIT)] :
          [new TextMessage(responsesCst.telephonyNoAccount)],
        feedback: false
      }));
    }
  }

];
