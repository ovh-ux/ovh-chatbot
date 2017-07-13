"use strict";

module.exports = {
  hosting: {
    FR: {
      dns: "Ton site ne pointe pas sur la bonne ip (actuellement %1$s), ton domaine \"%2$s\" devrait pointer sur l'ip %3$s",
      errorConnRefused: "Il semblerait que ce soit un problème de pointage sur ton site, je te conseille de vérifier ta configuration DNS pour que ton nom de domaine pointe sur l'ip %s",
      errorNotFound: "Il semblerait que ta zone DNS soit mal configurée",
      errorEaiAgain: "Il semblerait que ta zone DNS soit mal configurée. Ton site n'est relié à aucun serveur d'hébergement web.",
      goToManager: "Accéder à l'espace client",
      hostingActive: "Ton site semble fonctionner correctement",
      hostingButActive: "Par contre ton site semble fonctionner correctement",
      hostingBloqued: "Il semblerait qu'il y ai un problème sur ton serveur mutualisé, il est bloqué pour l'instant",
      hostingMaintenance: "Il semblerait qu'il y ai un problème sur ton serveur mutualisé, il est actuellement en maintenance",
      hostingUnknown: "Ton serveur est dans un état inconnu, contacte le support pour plus d'informations",
      mailBounce: "Il semblerait que tes envois d'e-mails soient bloqués car ils ont dépassés 50% de retour en erreur",
      mailKo: "Il semblerait que tes envois d'e-mails soient bloqués car ils ont dépassés 5% de retour en erreur",
      mailSpam: "Il semblerait que tes envois d'e-mails soient bloqués car ils ont envoyés des spams",
      sslRegenerate: "Tu as activé le SSL sur ton site mais ton certificat SSL ne contient pas ton domaine. Tu dois regénérer ton certificat via l'espace client",
      sslHttpsToHttpWarning: "Attention, ton site est compris dans le certificat SSL actuel et fonctionne actuellement en https. Cependant ta configuration indique que lors de la regénération automatique du certificat SSL," +
        " ton site ne sera plus accessible en https." +
        " Si c'est le comportement voulu ou que tu n'utilises pas https sur ce site ne prend pas en compte cet avertissement.",
      web404: "Il semblerait que la page à laquelle tu souhaites accéder n'existe pas, le fichier correspondant à cette page semble introuvable. " +
        "Vérifie aussi si ton site pointe sur le bon dossier de destination dans l'espace client onglet 'multisites'.",
      web401: "Il semblerait que ton site essaie d'accéder à un fichier ou à un espace auquel il n'a pas les droits",
      web403: "Il semblerait que ton site possède des problèmes de droits. Vérifie si ton site pointe sur le bon dossier de destination dans l'espace client onglet 'multisites'.",
      web500db: "Ton site n'arrive pas à se connecter à la base de données, je te conseille de vérifier le login et mot de passe de la base de données.",
      web500dev: "Il semblerait que tu aies fait une erreur de programmation sur ton site web. Dans ce genre de situation le support OVH n'intervient pas.",
      unknown: "Problème non diagnostiquable. "
    }
  },
  telephony: {
    FR: {
      accountClosed: "Ton compte est cloturé",
      accountDeleted: "Ton compte a été supprimé",
      accountExpired: "Ton compte est expiré",
      lineInCreation: "Ta ligne est en cours de création",
      lineUnPaid: "Il semblerait que tu as oublié de payer, rends-toi dans ton espace client pour gérer la facturation : %s",
      overOutplan: "Tu as dépassé le montant maximal en hors-forfait, rends-toi dans ton espace client pour modifier ta limite : %s",
      portabilityProgress: "Tu as %s lignes en cours de portabilité",
      portabilityLineOperator: "%1$s chez %2$s :\n",
      portabilityStep: "\t -%1$s, État: %2$s, description : %3$s, ETA: %4$s\n",
      portabilityExecutionDate: "Date d'éxécution prévu : %s",
      portabilityManager: "`Pour modifer ta portabilité, rends-toi dans ton espace client : %s",
      noIssue: "Nous n'avons pas trouver de problème",
      seeManager: "Pour tout autres renseignements, rends-toi dans ton espace client : %s"
    }
  },
  xdsl: {
    FR: {
      sync: "synchronisé",
      unsync: "non synchronisé",
      doing: "en cours",
      todo: "à faire",
      error: "erreur",
      diagnosticTime: "Diagnostique réalisé à %s",
      callSupport: "Appeler le service client",
      launchDiag: "Effectuer un diagnostique avancé",
      diagnosticModemStatus: "Etat du modem :",
      diagnosticModemUnplug: "- Ton modem n'est pas branché, vérifier la prise électrique ainsi que la prise xdsl",
      diagnosticModemPlug: "- Ton modem est connecté",
      diagnosticPing: "- Ton modem ne répond pas aux pings",
      diagnosticNoPing: "- Ton modem répond aux pings",
      diagnosticLineStatus: "Etat de tes lignes :",
      diagnosticLineSync: "• %1$s : %2$s\n",
      diagnosticCustomerSideProblem: "\t  Il s'agit d'un problème avec ton installation",
      diagnosticOvhSideProblem: "\t  Il s'agit d'un problème de notre part",
      diagnosticError: "\t  Il y a eu une erreur lors du diagnostique",
      diagnosticResultOk: "Nous n'avons pas détecté de problème. Ton soucis provient probablement de ton installation",
      diagnosticResultNOk: "Il y a effectivement un soucis sur ton installation",
      diagnosticResultMore: "Si ta ligne ne fonctionne toujours pas, rends-toi sur : https://docs.ovh.com/display/public/CRXDSL/Interruption+de+service\n",
      incident: "Il y a un incident sur la ligne : %1$s, la résolution est prévue pour : %2$s. Plus de détails : %3$s",
      orderStepStatus: "l'étape %1$s n'est pas encore finie, elle est actuellement dans l'état : %2$s. Cette étape sera finie dans %3$s.",
      orderNotReady: "Ta commande n'est pas encore finalisée : %s",
      lineSlamming: "Il semblerait qu'un autre opérateur ait ouvert une ligne par dessus ta ligne actuel",
      lineUnPaid: "Il semblerait que tu as oublié de payer, accéder à l'espace client : https://www.ovhtelecom.fr/manager/index.html#/",
      resultOk: "Nous n'avons pas detecter de problème sur ta facturation et sur la ligne.",
      resultAdvancedDiag: "Souhaites-tu faire un diagnostique plus precis de ton équipement ?\nAssures-toi d'avoir bien branché ta box",
      resultLastDiag: "Voici le résultat du dernier diagnostique réalisé.",
      resultDiagRemaining: "Tu peux encore effectuer %s diagnostique(s) aujourd'hui."
    }
  }
};
