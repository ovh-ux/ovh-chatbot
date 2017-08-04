"use strict";

module.exports = {
  hosting: {
    FR: {
      dns: "Ton site ne pointe pas sur la bonne IP (actuellement %1$s), ton domaine \"%2$s\" devrait pointer sur l'IP %3$s",
      dnsWrongConfig: "Tu utilises actuellement les serveurs DNS: %1$s, mais tu dois utiliser les serveurs DNS suivants : %2$s.",
      errorConnRefused: "Il semblerait que ce soit un problème de pointage sur ton site, je te conseille de vérifier ta configuration DNS pour que ton nom de domaine pointe sur l'ip %s",
      errorNotFound: "Il semblerait que ta zone DNS soit mal configurée",
      errorEaiAgain: "Il semblerait que ta zone DNS soit mal configurée. Ton site n'est relié à aucun serveur d'hébergement web.",
      goToManager: "Accéder à l'espace client :point_right:",
      hostingActive: "Ton site semble fonctionner correctement :v:",
      hostingButActive: "Par contre ton site semble fonctionner correctement :v:",
      hostingBloqued: "Il semblerait qu'il y ait un problème sur ton serveur mutualisé, il est bloqué pour l'instant :skull:",
      hostingMaintenance: "Il semblerait qu'il y ait un problème sur ton serveur mutualisé, il est actuellement en maintenance :wrench:",
      hostingUnknown: "Ton serveur est dans un état inconnu, contacte le support pour plus d'informations",
      mailBounce: "Il semblerait que tes envois d'e-mails soient bloqués car ils ont dépassé 50% de retour en erreur",
      mailKo: "Il semblerait que tes envois d'e-mails soient bloqués car ils ont dépassé 5% de retour en erreur",
      mailSpam: ":no_entry_sign: Il semblerait que tes envois d'e-mails soient bloqués car ils ont envoyé des spams",
      sslRegenerate: "Tu as activé le SSL sur ton site mais ton certificat SSL ne contient pas ton domaine. Tu dois regénérer ton certificat via l'espace client",
      sslHttpsToHttpWarning: ":warning: Attention, ton site est compris dans le certificat SSL actuel et fonctionne actuellement en https. Cependant ta configuration indique que lors de la regénération automatique du certificat SSL," +
        " ton site ne sera plus accessible en https." +
        " Si c'est le comportement voulu ou que tu n'utilises pas https sur ce site, ne prends pas en compte cet avertissement.",
      web404: "Il semble que la page à laquelle tu souhaites accéder n'existe pas, le fichier correspondant à celle-ci est introuvable.",
      web401: ":no_entry: Il semblerait que ton site essaie d'accéder à un fichier ou à un espace auquel il n'a pas les droits",
      web403: ":no_entry: Il semblerait que ton site ait des problèmes de droits. Vérifie si ton site pointe sur le bon dossier de destination dans l'espace client (onglet 'multisites').",
      web500db: "Ton site n'arrive pas à se connecter à la base de données, je te conseille de vérifier le login et mot de passe de la base de données.",
      web500dev: "Il semblerait que tu aies fait une erreur de programmation sur ton site web. Dans ce genre de situation le support OVH n'intervient pas.",
      unknown: "Problème non diagnostiquable. :thinking_face:"
    }
  },
  telephony: {
    FR: {
      accountClosed: "Ton compte est clôturé :cry:",
      accountDeleted: "Ton compte a été supprimé :cry:",
      accountExpired: "Ton compte est expiré :cry:",
      lineInCreation: "Ta ligne est en cours de création",
      lineUnPaid: "Il semblerait que tu as oublié de payer, rends-toi dans ton espace client pour gérer la facturation :point_right: %s",
      overOutplan: "Tu as dépassé le montant maximal en hors-forfait, rends-toi dans ton espace client pour modifier ta limite :point_right: %s",
      portabilityProgress: "Tu as %s ligne(s) en cours de portabilité",
      portabilityLineOperator: "%1$s chez %2$s :\n",
      portabilityStep: "\t -%1$s, État: %2$s, description : %3$s, ETA: %4$s\n",
      portabilityExecutionDate: "Date d'exécution prévue : %s",
      portabilityManager: "`Pour modifier ta portabilité, rends-toi dans ton espace client :point_right: %s",
      noIssue: "Nous n'avons pas trouvé de problème :v:",
      seeManager: "Pour tout autre renseignement, rends-toi dans ton espace client :point_right: %s"
    }
  },
  xdsl: {
    FR: {
      day: "jour(s)",
      hour: "heure(s)",
      minute: "minute(s)",
      checkInfrastructure: "Validation de la construction de votre accès",
      configureAccessOnOVH: "Configuration de l'accès sur les équipements OVH",
      orderPayed: "Paiement de la commande",
      orderReceived: "Commande reçue",
      orderTreatment: "Traitement de la commande",
      sendModem: "Envoi du modem",
      sendOrderToProvider: "Transmission de la commande auprès du fournisseur d'accès",
      setupCustomerPremisesEquipment: "Envoi de l'équipement",
      waitingForProviderInstallReport: "Attente du rapport du fournisseur d'accès",
      waitingForWithdrawalPeriodToBeOver: "Attente de la fin de la période de rétractation",
      sync: "synchronisé",
      unsync: "non synchronisé",
      doing: "en cours",
      todo: "à faire",
      error: "erreur",
      diagnosticTime: "Diagnostic réalisé à %s\n",
      callSupport: "Appeler le service client :phone:",
      launchDiag: "Effectuer un diagnostic avancé",
      diagnosticModemUnplug: ":x: Ton modem n'est pas branché, vérifier la prise électrique ainsi que la prise xDSL :electric_plug:\n",
      diagnosticModemPlug: ":heavy_check_mark: Ton modem est connecté\n",
      diagnosticLineStatus: "- État de tes lignes :\n",
      diagnosticLineSync: "\t• %1$s : %2$s\n",
      diagnosticCustomerSideProblem: "\t  Il s'agit d'un problème avec ton installation\n",
      diagnosticOvhSideProblem: "\t  Il s'agit d'un problème de notre part\n",
      diagnosticError: "\t  Il y a eu une erreur lors du diagnostic\n",
      diagnosticPing: ":x: Ton modem ne répond pas aux pings\n",
      diagnosticNoPing: ":heavy_check_mark: Ton modem répond aux pings\n",
      diagnosticResultOk: ":heavy_check_mark: Nous n'avons pas détecté de problème. Ton souci provient probablement de ton installation :thinking_face:\n",
      diagnosticResultNOk: ":x: Il y a effectivement un souci sur ton installation\n",
      diagnosticResultMore: "Si ta ligne ne fonctionne toujours pas, rends-toi sur :point_right: https://docs.ovh.com/display/public/CRXDSL/Interruption+de+service\n",
      incident: ":construction: Il y a un incident sur la ligne : %1$s, la résolution est prévue pour : %2$s. Plus de détails :point_right: %3$s",
      orderStepStatus: "\t- l'étape %1$s n'est pas encore finie, elle est %2$s. Cette étape durera environ %3$s.\n",
      orderNotReady: "Ta commande n'est pas encore finalisée :\n%1$s\nRends-toi dans ton espace client pour plus de détails :point_right: %2$s",
      lineSlamming: "Il semblerait qu'un autre opérateur ait ouvert une ligne par dessus ta ligne actuelle",
      lineUnPaid: "Il semblerait que tu as oublié de payer, accéder à l'espace client :point_right: https://www.ovhtelecom.fr/manager/index.html#/",
      resultOk: "Nous n'avons détecté de problème ni sur ta facturation, ni sur ta ligne. :v:\nTu peux te rendre dans ton espace client :point_right: %s",
      resultAdvancedDiag: "Souhaites-tu faire un diagnostic plus précis de ton équipement :mag: ?\n\n :zap: Assure-toi d'avoir bien branché ta box :zap:",
      resultLastDiag: "Voici le résultat du dernier diagnostic réalisé.",
      resultDiagRemaining: "Tu peux encore effectuer %s diagnostic(s) aujourd'hui."
    }
  }
};
