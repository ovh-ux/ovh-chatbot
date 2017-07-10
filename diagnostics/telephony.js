"use strict";

const { TextMessage } = require("../platforms/generics");
const MANAGER_TELECOM = "https://www.ovhtelecom.fr/manager/index.html#/telephony";
const diagCst = require("../constants/diagnostics").telephony.FR;

const telephonyDiag = (billing, portability, serviceInfos) => {
  let responses = [];

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
    responses = [...responses, new TextMessage(diagCst.lineUnPaid.replace("%s", `${MANAGER_TELECOM}/${billing.billingAccount}/billing`))];
    break;
  case "expired":
  case "ok":
  default :
    break;
  }

  if (billing.currentOutplan.value >= billing.allowedOutplan.value) {
    responses = [...responses, new TextMessage(diagCst.overOutplan.replace("%s", `${MANAGER_TELECOM}/${billing.billingAccount}/creditThreshold`))];
  }

  if (portability.length > 0) {
    responses = [...responses, new TextMessage(diagCst.portabilityProgress.replace("%s", portability.length))];
    for (let i = 0; i < portability.length; i++) {
      let porta = portability[i];
      let portabilityString = diagCst.portabilityLineOperator.replace("%1s", porta.numbersList.join(", ")).replace("%2s", porta.operator);
      for (let j = 0; j < porta.status.length; j++) {
        let step = porta.status[i];
        portabilityString += diagCst.portabilityStep.replace("%1s", step.name).replace("%2s", step.status).replace("%3s", step.description || "N/A").replace("%4s", `${step.duration.quantity} ${step.duration.unit}`);
      }
      portabilityString += diagCst.portabilityExecutionDate.replace("%s", portability.desiredExecutionDate);
      responses = [...responses, new TextMessage(portabilityString)];
    }
    responses = [...responses, new TextMessage(diagCst.portabilityManager.replace("%s", `${MANAGER_TELECOM}/${billing.billingAccount}/alias/default/portabilities`))];
  }

  if (!responses.length) {
    responses = [...responses, new TextMessage(diagCst.noIssue)];
  }
  responses = [...responses, new TextMessage(diagCst.seeManager.replace("%s", `${MANAGER_TELECOM}/${billing.billingAccount}`))];

  return responses;
};


module.exports = {
  telephonyDiag
};
