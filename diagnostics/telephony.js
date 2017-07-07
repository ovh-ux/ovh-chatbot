"use strict";

const { TextMessage, Button, ButtonsListMessage } = require("../platforms/generics");
const MANAGER_TELECOM = "https://www.ovhtelecom.fr/manager/index.html#/telephony";

const telephonyDiag = (billing, portability, serviceInfos) => {
  let responses = [];

  switch (billing.status) {
  case "closed":
    responses = [...responses, new TextMessage("Votre compte est cloturé")];
    break;
  case "deleted":
    responses = [...responses, new TextMessage("Votre compte a été supprimé")];
    break;
  case "expired":
    responses = [...responses, new TextMessage("Votre compte est expiré")];
    break;
  case "enabled":
  default:
    break;
  }

  switch (serviceInfos.status) {
  case "inCreation":
    responses = [...responses, new TextMessage("Votre ligne est en cours de création")];
    break;
  case "unPaid":
    responses = [...responses, new ButtonsListMessage("Il semblerait que vous avez oublié de payer, rendez vous dans votre manager pour gérer la facturation",
      [new Button("web_url", `${MANAGER_TELECOM}/${billing.billingAccount}/billing`, "Acceder au manager")])];
    break;
  case "expired":
  case "ok":
  default :
    break;
  }

  if (billing.currentOutplan.value >= billing.allowedOutplan.value) {
    let button = new Button("web_url", `${MANAGER_TELECOM}/${billing.billingAccount}/creditThreshold`, "Acceder au manager");
    responses = [...responses, new ButtonsListMessage("Vous avez dépassé, le montant maximal en hors-forfait, rendez vous dans votre manager pour modifier votre limite", [button])];
  }

  if (portability.length > 0) {
    responses = [...responses, new TextMessage(`Vous avez ${portability.length} lignes en cours de portabilité`)];
    for (let i = 0; i < portability.length; i++) {
      let porta = portability[i];
      let portabilityString = `${porta.numbersList.join(", ")} chez ${porta.operator}:\n`;
      for (let j = 0; j < porta.status.length; j++) {
        let step = porta.status[i];
        portabilityString += `\t - ${step.name}, Etat : ${step.status}, Description : ${step.description || "N/A"}, ETA: ${step.duration.quantity} ${step.duration.unit}\n`;
      }
      portabilityString += `Date d'éxécution prévu : ${portability.desiredExecutionDate}`;
      responses = [...responses, new TextMessage(portabilityString)];
    }
    responses = [...responses, new ButtonsListMessage("Pour modifer votre portabilité, rendez vous dans votre manager.", [new Button("web_url", `${MANAGER_TELECOM}/${billing.billingAccount}/alias/default/portabilities`, "Acceder au manager")])];
  }

  if (!responses.length) {
    responses = [...responses, new TextMessage("Nous n'avons pas trouver de probleme")];
  }
  responses = [...responses, new ButtonsListMessage("Pour tout autres renseignements, rendez vous dans votre manager", [new Button("web_url", `${MANAGER_TELECOM}/${billing.billingAccount}`, "Acceder au manager")])];

  return responses;
};


module.exports = {
  telephonyDiag
};
