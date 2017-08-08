const { TextMessage, Button, ButtonsMessage } = require("../platforms/generics");
const translator = require("../utils/translator");

const checkxDSLDiagAdvanced = (diag, locale) => {
  let responses = "";
  let linePb = false;

  responses = translator("xdsl.diagnosticTime", locale, new Date(diag.diagnosticTime).toUTCString());

  if (diag.isModemConnected != null) {
    if (!diag.isModemConnected) {
      responses += translator("xdsl.diagnosticModemUnplug", locale);
      linePb = true;
    } else {
      responses += translator("xdsl.diagnosticModemPlug", locale);
    }
  }

  if (diag.lineDetails != null && Array.isArray(diag.lineDetails)) {
    responses += translator("xdsl.diagnosticLineStatus", locale);
    for (let i = 0; i < diag.lineDetails.length; i++) {
      // detect sync
      const lineDiag = diag.lineDetails[i];
      responses += translator("xdsl.diagnosticLineSync", locale, lineDiag.number, lineDiag.sync ? translator("xdsl.sync", locale) : translator("xdsl.unsync", locale));
      if (lineDiag.lineTest != null) {
        switch (lineDiag.lineTest) {
        case "customerSideProblem":
          responses += translator("xdsl.diagnosticCustomerSideProblem", locale);
          break;
        case "ovhSideProblem":
          responses += translator("xdsl.diagnosticOvhSideProblem", locale);
          break;
        case "error":
          responses += translator("xdsl.diagnosticError", locale);
          break;
        default:break;
        }
      }
      if (!lineDiag.sync) {
        linePb = true;
      }
    }
  }

  if (diag.ping != null) {
    if (!diag.ping) {
      responses += translator("xdsl.diagnosticPing", locale);
      linePb = true;
    } else {
      responses += translator("xdsl.diagnosticNoPing", locale);
    }
  }

  if (!linePb) {
    responses += translator("xdsl.diagnosticResultOk", locale);
  } else {
    responses += translator("xdsl.diagnosticResultNOk", locale);
  }

  responses += translator("xdsl.diagnosticResultMore", locale);

  return [new TextMessage(responses)];
};

const checkxDSLDiag = (xdslOffer, serviceInfos, orderFollowUp, incident, diag, managerLink, locale) => {
  let responses = [];
  let orderOk = false;
  let orderString = "";

  if (incident != null) {
    responses = [new TextMessage(translator("xdsl.incident", locale, incident.comment || "N/A", incident.endDate || "N/A", `http://travaux.ovh.net/?do=details&id=${incident.taskId}`))];
  }

  for (let i = 0; i < orderFollowUp.length; i++) {
    const orderStep = orderFollowUp[i];
    if (orderStep.name === "accessIsOperational") {
      if (orderStep.status === "done") {
        orderOk = true;
      }
    } else {
      switch (orderStep.status) {
      case "doing":
      case "todo":
      case "error":
        orderString += translator("xdsl.orderStepStatus", locale, translator(`xdsl.${orderStep.name}`, locale), translator(`xdsl.${orderStep.status}`, locale), orderStep.expectedDuration, translator(`xdsl.${orderStep.durationUnit}`, locale));
        break;
      case "done":
      default:
        break;
      }
    }
  }

  if (!orderOk) {
    return [...responses, new TextMessage(translator("xdsl.orderNotReady", locale, orderString, `${managerLink}/order`))];
  }

  if (xdslOffer.status === "slamming") {
    const button = new Button("web_url", "tel:1007", translator("xdsl.callSupport", locale));
    responses = [...responses, new ButtonsMessage(translator("xdsl.lineSlamming", locale), [button])];
  }

  if (serviceInfos.status === "unPaid") {
    responses = [...responses, new TextMessage(translator("xdsl.lineUnPaid", locale))];
  }

  if (responses.length === 0) {
    const button = new Button("postback", `XDSL_DIAG_${xdslOffer.accessName}`, translator("xdsl.launchDiag", locale));
    let resultOk = translator("xdsl.resultOk", locale, managerLink);
    let diagRemaing = translator("xdsl.resultDiagRemaining", locale, diag ? diag.remaining : 5);
    let advanceDiag = translator("xdsl.resultAdvancedDiag", locale);
    responses = [new ButtonsMessage(`${resultOk}\n${diagRemaing}\n${advanceDiag}`, [button])];
  }

  if (diag) {
    responses = [...responses, new TextMessage(translator("xdsl.resultLastDiag", locale)), ...checkxDSLDiagAdvanced(diag, locale)];
  }
  return responses;
};


module.exports = {
  checkxDSLDiag,
  checkxDSLDiagAdvanced
};
