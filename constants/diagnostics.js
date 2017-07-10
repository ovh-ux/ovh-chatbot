"use strict";

module.exports = {
  hosting: {
    FR: {
      dns: "Ton site ne pointe pas sur la bonne ip (actuellement %1s), ton domaine \"%2s\" devrait pointer sur l'ip %3s",
      errorConnRefused: "Il semblerait que ce soit un problème de pointage sur ton site, je te conseille de vérifier ta configuration DNS pour que ton nom de domaine pointe sur l'ip %s",
      errorNotFound: "Il semblerait que ta zone dns soit mal configurée",
      errorEaiAgain: "Il semblerait que ta zone dns soit mal configurée. Ton site n'est relié à aucun serveur d'hébergement web.",
      goToManager: "Accéder au manager",
      hostingActive: "Ton site semble fonctionner correctement",
      hostingButActive: "Par contre ton site semble fonctionner correctement",
      hostingBloqued: "Il semblerait qu'il y ai un prolème sur ton serveur mutualisé, il est bloqué pour l'instant",
      hostingMaintenance: "Il semblerait qu'il y ai un problème sur ton serveur mutualisé, il est actuellement en maintenance",
      hostingUnknown: "Ton serveur est dans un état inconnu, veuillez contacter le support pour plus d'informations",
      mailBounce: "Il semblerait que tes envois d'e-mails soient bloqués car ils ont dépassés 50% de retour en erreur",
      mailKo: "Il semblerait que tes envois d'e-mails soient bloqués car ils ont dépassés 5% de retour en erreur",
      mailSpam: "Il semblerait que tes envois d'e-mails soient bloqués car ils ont envoyés des spams",
      sslRegenerate: "Tu as activé le SSL sur ton site mais ton certificat SSL ne contient pas ton domaine. Tu dois regénérer ton certificat via le manager",
      sslHttpsToHttpWarning: "Attention, ton site est compris dans le certificat SSL actuel et fonctionne actuellement en https. Cependant ta configuration indique que lors de la regénération automatique du certificat SSL," +
        " ton site ne sera plus accessible en https." +
        " Si c'est le comportement voulu ou que tu n'utilises pas https sur ce site ne prend pas en compte cet avertissement.",
      web404: "Il semblerait que la page à laquelle tu souhaites accéder n'existe pas, le fichier correspondant à cette page semble introuvable. Vérifie aussi si ton site pointe sur le bon dossier de destination dans le manager onglet 'multisites'.",
      web401: "Il semblerait que ton site essaie d'accéder à un fichier ou à un espace auquel il n'a pas les droits",
      web403: "Il semblerait que ton site possède des problèmes de droits. Vérifie si ton site pointe sur le bon dossier de destination dans le manager onglet 'multisites'.",
      web500db: "Ton site n'arrive pas à se connecter à la base de données, je te conseille de vérifier le login et mot de passe de la base de données.",
      web500dev: "Il semblerait que tu aies fait une erreur de programmation sur ton site web. Dans ce genre de situation le support OVH n'intervient pas.",
      unknown: "Problème non diagnostiquable. "
    }
  },
  telephony: {
    FR: {
      accountClosed: "Votre compte est cloturé",
      accountDeleted: "Votre compte a été supprimé",
      accountExpired: "Votre compte est expiré",
      lineInCreation: "Votre ligne est en cours de création",
      lineUnPaid: "Il semblerait que vous avez oublié de payer, rendez vous dans votre manager pour gérer la facturation : %s",
      overOutplan: "Vous avez dépassé le montant maximal en hors-forfait, rendez vous dans votre manager pour modifier votre limite : %s",
      portabilityProgress: "Vous avez %s lignes en cours de portabilité",
      portabilityLineOperator: "%1s chez %2s:\n",
      portabilityStep: "\t -%1s, Etat: %2s, Description: %3s, ETA: %4s\n",
      portabilityExecutionDate: "Date d'éxécution prévu: %s",
      portabilityManager: "`Pour modifer votre portabilité, rendez vous dans votre manager: %s",
      noIssue: "Nous n'avons pas trouver de probleme",
      seeManager: "Pour tout autres renseignements, rendez vous dans votre manager: %s"
    }
  },
  xdsl: {
    FR: {
      sync: "synchronisé",
      unsync: "non synchronisé",
      doing: "en cours",
      todo: "à faire",
      error: "erreur",
      diagnosticTime: "Diagnostique réalisé à %s\n",
      callSupport: "Appeler le service client",
      launchDiag: "Effectuer un diagnostique avancé",
      diagnosticModemUnplug: "\t- Votre modem n'est pas branché, vérifier la prise electrique ainsi que la prise xdsl\n",
      diagnosticModemPlug: "\t- Votre modem est connecté\n",
      diagnosticLineStatus: "\t- Etat de vos lignes:\n",
      diagnosticLineSync: "\t\t• %1s: %2s\n",
      diagnosticCustomerSideProblem: "\t\t\tIl s'agit d'un probleme avec votre installation\n",
      diagnosticOvhSideProblem: "\t\t\tIl s'agit d'un probleme de notre part\n",
      diagnosticError: "\t\t\tIl y a eu une erreur lors du diagnostique\n",
      diagnosticPing: "\t- Votre modem ne répond pas aux pings\n",
      diagnosticNoPing: "\t- Votre modem répond aux pings\n",
      diagnosticResultOk: "Nous n'avons pas detecter de probleme. Votre soucis provient probablement de votre installation\n",
      diagnosticResultNOk: "Il y a effectivement un soucis, sur votre installation\n",
      diagnosticResultMore: "Si votre ligne ne fonctionne toujours pas, rendez-vous sur : https://docs.ovh.com/display/public/CRXDSL/Interruption+de+service\n",
      incident: "il y a un incident, sur la ligne : %1s, la résolution est prévue pour : %2s, Plus de Details : %3s",
      orderStepStatus: "l'étape %1s n'est pas encore finie, elle est actuellement dans l'état : %2s. Cette étape sera finie dans %3s.\n",
      orderNotReady: "Votre commande n'est pas encore finalisée: %s",
      lineSlamming: "Il semblerait qu'un autre opérateur ait ouvert une ligne par dessus votre ligne actuel",
      lineUnPaid: "Il semblerait que vous avez oublié de payer, accéder au manage : https://www.ovhtelecom.fr/manager/index.html#/",
      resultOk: "Nous n'avons pas detecter de probleme sur votre facturation et sur la ligne.",
      resultAdvancedDiag: "Souhaitez vous faire un diagnostique plus precis de votre équipement ?\n\n Assurez vous d'avoir bien brancher votre box",
      resultLastDiag: "Voici le résultat du dernier diagnostique réalisé. ",
      resultDiagRemaining: "Vous pouvez encore effectuer %s diagnostique(s) aujourd'hui."
    }
  }
};
