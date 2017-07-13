const { TextMessage, Button, ButtonsMessage, CardMessage, ListItem } = require("../platforms/generics");
const diagCst = require("../constants/diagnostics").xdsl.FR;
const v = require("voca");


const checkxDSLDiagAdvanced = (diag) => {
  let linePb = false;
  let items = [];
  let modemStatus = "";
  let lineStatus = "";

  items.push(new ListItem(diagCst.resultLastDiag, v.sprintf(diagCst.diagnosticTime, new Date(diag.diagnosticTime).toUTCString())));

  if (diag.isModemConnected != null) {
    if (!diag.isModemConnected) {
      modemStatus += diagCst.diagnosticModemUnplug;
      linePb = true;
    } else {
      modemStatus += diagCst.diagnosticModemPlug;
    }
  }

  if (diag.ping != null) {
    if (!diag.ping) {
      modemStatus += diagCst.diagnosticPing;
      linePb = true;
    } else {
      modemStatus += diagCst.diagnosticNoPing;
    }
  }
  items.push(new ListItem(diagCst.diagnosticModemStatus, modemStatus));


  if (diag.lineDetails != null && Array.isArray(diag.lineDetails)) {
    for (let i = 0; i < diag.lineDetails.length; i++) {
      // detect sync
      const lineDiag = diag.lineDetails[i];
      lineStatus += v.sprintf(diagCst.diagnosticLineSync, lineDiag.number, lineDiag.sync ? diagCst.sync : diagCst.unsync);
      if (lineDiag.lineTest != null) {
        switch (lineDiag.lineTest) {
        case "customerSideProblem":
          lineStatus += diagCst.diagnosticCustomerSideProblem;
          break;
        case "ovhSideProblem":
          lineStatus += diagCst.diagnosticOvhSideProblem;
          break;
        case "error":
          lineStatus += diagCst.diagnosticError;
          break;
        default:break;
        }
      }
      if (!lineDiag.sync) {
        linePb = true;
      }
    }
  }
  items.push(new ListItem(diagCst.diagnosticLineStatus, lineStatus));

  if (!linePb) {
    items.push(new ListItem(diagCst.diagnosticResultOk, diagCst.diagnosticResultMore));
  } else {
    items.push(new ListItem(diagCst.diagnosticResultNOk, diagCst.diagnosticResultMore));
  }


  return [new CardMessage(items)];
};

const checkxDSLDiag = (xdslOffer, serviceInfos, orderFollowUp, incident, diag) => {
  let responses = [];
  let orderOk = false;
  let orderString = "";

  if (incident != null) {
    responses = [new TextMessage(v.sprintf(diagCst.incident, incident.comment || "N/A", incident.endDate || "N/A", `http://travaux.ovh.net/?do=details&id=${incident.taskId}`))];
  }

  for (let i = 0; i < orderFollowUp.length; i++) {
    const orderStep = orderFollowUp[i];
    switch (orderStep.status) {
    case "doing":
    case "todo":
    case "error":
      orderString += v.sprintf(diagCst.orderStepStatus, orderStep.name, diagCst[orderStep.status], `${orderStep.expectedDuration} ${orderStep.durationUnit}`);
      break;
    case "done":
      if (orderStep.name === "accessIsOperational") {
        orderOk = true;
      }
      break;
    default:
      break;
    }
  }

  if (!orderOk) {
    return [...responses, new CardMessage([new ListItem(v.sprintf(diagCst.orderNotReady, orderString))])];
  }

  if (xdslOffer.status === "slamming") {
    const button = new Button("web_url", "tel:1007", diagCst.callSupport);
    responses = [...responses, new ButtonsMessage(diagCst.lineSlamming, [button])];
  }

  if (serviceInfos.status === "unPaid") {
    responses = [...responses, new TextMessage(diagCst.lineUnPaid)];
  }

  if (responses.length === 0) {
    const button = new Button("postback", `XDSL_DIAG_${xdslOffer.accessName}`, diagCst.launchDiag);
    responses = [new ButtonsMessage(`${diagCst.resultOk}\n${v.sprintf(diagCst.resultDiagRemaining, diag ? diag.remaining : 5)}\n${diagCst.resultAdvancedDiag}`, [button])];
  }

  if (diag) {
    responses = [...responses, ...checkxDSLDiagAdvanced(diag)];
  }
  return responses;
};


module.exports = {
  checkxDSLDiag,
  checkxDSLDiagAdvanced
};
