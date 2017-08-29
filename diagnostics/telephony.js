"use strict";

const { TextMessage } = require("../platforms/generics");
const MANAGER_TELECOM = "https://www.ovhtelecom.fr/manager/index.html#/telephony";
const translator = require("../utils/translator");

const telephonyDiag = (billing, portability, serviceInfos, locale) => {
  let responses = [];

  switch (billing.status) {
  case "closed":
    responses = [...responses, new TextMessage(translator("telephony-accountClosed", locale))];
    break;
  case "deleted":
    responses = [...responses, new TextMessage(translator("telephony-accountDeleted", locale))];
    break;
  case "expired":
    responses = [...responses, new TextMessage(translator("telephony-accountExpired", locale))];
    break;
  case "enabled":
  default:
    break;
  }

  switch (serviceInfos.status) {
  case "inCreation":
    responses = [...responses, new TextMessage(translator("telephony-lineInCreation", locale))];
    break;
  case "unPaid":
    responses = [...responses, new TextMessage(translator("telephony-lineUnPaid", locale, `${MANAGER_TELECOM}/${billing.billingAccount}/billing`))];
    break;
  case "expired":
  case "ok":
  default :
    break;
  }

  if (billing.currentOutplan.value >= billing.allowedOutplan.value) {
    responses = [...responses, new TextMessage(translator("telephony-overOutplan", locale, `${MANAGER_TELECOM}/${billing.billingAccount}/creditThreshold`))];
  }

  if (portability.length > 0) {
    responses = [...responses, new TextMessage(translator("telephony-portabilityProgress", locale, portability.length))];
    for (let i = 0; i < portability.length; i++) {
      let porta = portability[i];
      let portabilityString = translator("telephony-portabilityLineOperator", locale, porta.numbersList.join(", "), porta.operator);
      for (let j = 0; j < porta.status.length; j++) {
        let step = porta.status[i];
        portabilityString += translator("telephony-portabilityStep", locale, step.name, step.status, step.description || "N/A", `${step.duration.quantity} ${step.duration.unit}`);
      }
      portabilityString += translator("telephony-portabilityExecutionDate", locale, portability.desiredExecutionDate);
      responses = [...responses, new TextMessage(portabilityString)];
    }
    responses = [...responses, new TextMessage(translator("telephony-portabilityManager", locale, `${MANAGER_TELECOM}/${billing.billingAccount}/alias/default/portabilities`))];
  }

  if (!responses.length) {
    responses = [...responses, new TextMessage(translator("telephony-noIssue", locale))];
  }
  responses = [...responses, new TextMessage(translator("telephony-seeManager", locale, `${MANAGER_TELECOM}/${billing.billingAccount}`))];

  return responses;
};


module.exports = {
  telephonyDiag
};
