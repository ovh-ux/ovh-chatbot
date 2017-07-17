"use strict";

const { TextMessage, ListItem, CardMessage } = require("../platforms/generics");
const MANAGER_TELECOM = "https://www.ovhtelecom.fr/manager/index.html#/telephony";
const diagCst = require("../constants/diagnostics").telephony.FR;
const { sprintf } = require("voca");

const telephonyDiag = (billing, portability, serviceInfos) => {
  let responses = [];
  let items = [];

  switch (billing.status) {
  case "closed":
    responses = [...responses, new TextMessage(diagCst.accountClosed)];
    break;
  case "deleted":
    responses = [...responses, new TextMessage(diagCst.accountDeleted)];
    break;
  case "expired":
    responses = [...responses, new TextMessage(diagCst.accountExpired)];
    break;
  case "enabled":
  default:
    break;
  }

  switch (serviceInfos.status) {
  case "inCreation":
    responses = [...responses, new TextMessage(diagCst.lineInCreation)];
    break;
  case "unPaid":
    responses = [...responses, new TextMessage(sprintf(diagCst.lineUnPaid, `${MANAGER_TELECOM}/${billing.billingAccount}/billing`))];
    break;
  case "expired":
  case "ok":
  default :
    break;
  }

  if (billing.currentOutplan.value >= billing.allowedOutplan.value) {
    responses = [...responses, new TextMessage(sprintf(diagCst.overOutplan, `${MANAGER_TELECOM}/${billing.billingAccount}/creditThreshold`))];
  }

  if (portability.length > 0) {
    for (let i = 0; i < portability.length; i++) {
      let porta = portability[i];
      let portabilityString = "";
      for (let j = 0; j < porta.status.length; j++) {
        let step = porta.status[i];
        portabilityString += sprintf(diagCst.portabilityStep, step.name, step.status, step.description || "N/A", `${step.duration.quantity} ${step.duration.unit}`);
      }
      portabilityString += sprintf(diagCst.portabilityExecutionDate, portability.desiredExecutionDate);
      items.push(new ListItem(sprintf(diagCst.portabilityLineOperator, porta.numbersList.join(", "), porta.operator), portabilityString));
    }

    responses = [...responses, new CardMessage([
      ...items,
      new ListItem(sprintf(diagCst.portabilityManager, `${MANAGER_TELECOM}/${billing.billingAccount}/alias/default/portabilities`))
    ])];
  }

  if (!responses.length) {
    responses = [...responses, new TextMessage(diagCst.noIssue)];
  }
  responses = [...responses, new TextMessage(sprintf(diagCst.seeManager, `${MANAGER_TELECOM}/${billing.billingAccount}`))];

  return responses;
};


module.exports = {
  telephonyDiag
};
