const { TextMessage, Button, ButtonsListMessage } = require("../platforms/generics");


const checkxDSLDiagAdvanced = (diag) => {
  let responses = "";
  let linePb = false;

  responses = `Diagnostique réalisé à : ${diag.diagnosticTime}\n`;

  if (diag.isModemConnected != null) {
    if (!diag.isModemConnected) {
      responses += "\t- Votre modem n'est pas branché, vérifier la prise electrique ainsi que la prise xdsl\n";
      linePb = true;
    } else {
      responses += "\t- Votre modem est connecté\n";
    }
  }

  if (diag.lineDetails != null && Array.isArray(diag.lineDetails)) {
    responses += "\t- Etat de vos lignes :\n";
    for (let i = 0; i < diag.lineDetails.length; i++) {
      // detect sync
      const lineDiag = diag.lineDetails[i];
      responses += `\t\t• ${lineDiag.number}: ${lineDiag.sync ? "" : "non"} synchronisé\n`;
      if (lineDiag.lineTest != null) {
        switch (lineDiag.lineTest) {
        case "customerSideProblem":
          responses += "\t\t\tIl s'agit d'un probleme avec votre installation\n";
          break;
        case "ovhSideProblem":
          responses += "\t\t\tIl s'agit d'un probleme de notre part\n";
          break;
        case "error":
          responses += "\t\t\tIl y a eu une erreur lors du diagnostique\n";
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
      responses += "\t- Votre modem ne répond pas aux pings\n";
      linePb = true;
    } else {
      responses += "\t- Votre modem répond aux pings\n";
    }
  }

  if (!linePb) {
    responses += "Nous n'avons pas detecter de probleme. Votre soucis provient probablement de votre installation\n";
  } else {
    responses += "Il y a effectivement un soucis, sur votre installation\n";
  }

  responses += "Pour toutes informations complémentaires, rendez-vous sur : https://docs.ovh.com/display/public/CRXDSL/Accueil+xDSL\n";

  return [new TextMessage(responses)];
};

const checkxDSLDiag = (xdslOffer, serviceInfos, orderFollowUp, incident, diag) => {
  let responses = [];
  let orderOk = false;
  let orderString = "";

  if (incident != null) {
    let eta = "N/A";
    const button = new Button("web_url", `http://travaux.ovh.net/?do=details&id=${incident.taskId}`, "Plus de details");
    if (incident.endDate != null) {
      eta = incident.endDate;
    }
    responses = [new ButtonsListMessage(`il y a un incident, sur la ligne : ${incident.comment || "N/A"}, la résolution est prévue pour : ${eta}`, [button])];
  }

  for (let i = 0; i < orderFollowUp.length; i++) {
    const orderStep = orderFollowUp[i];
    switch (orderStep.status) {
    case "doing":
    case "todo":
    case "error":
      orderString += `l'étape ${orderStep.name} n'est pas encore finie, elle est actuellement dans l'état : ${orderStep.status}.
         Cette étape sera finie dans ${orderStep.expectedDuration} ${orderStep.durationUnit}.\n`;
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
    return [...responses, new TextMessage(`Votre commande n'est pas encore finalisée, ${orderString}`)];
  }

  if (xdslOffer.status === "slamming") {
    const button = new Button("web_url", "tel:1007", "contacter le service client");
    responses = [...responses, new ButtonsListMessage("Il semblerait qu'un autre opérateur ait ouvert une ligne par dessus la votre", [button])];
  }

  if (serviceInfos.status === "unPaid") {
    const button = new Button("web_url", "https://www.ovhtelecom.fr/manager/index.html", "Acceder au manager");
    responses = [...responses, new ButtonsListMessage("Il semblerait que vous avez oublié de payer", [button])];
  }

  if (responses.length === 0) {
    const button = new Button("postback", `XDSL_DIAG_${xdslOffer.accessName}`, "Effectuer un diagnostique avancé");
    responses = [
      new ButtonsListMessage(
        "Nous n'avons pas detecter de probleme sur votre facturation/ligne. Souhaitez vous faire un diagnostique plus precis de votre équipement ?\n\n Assurez vous d'avoir bien brancher votre box",
        [button]
      )
    ];
  }

  if (diag) {
    responses = [...responses, new TextMessage(`Voici le résultat du dernier diagnostique réalisé. Vous pouvez encore effectuer ${diag.remaining} diagnostique(s) aujourd'hui.`), ...checkxDSLDiagAdvanced(diag)];
  }
  return responses;
};


module.exports = {
  checkxDSLDiag,
  checkxDSLDiagAdvanced
};
