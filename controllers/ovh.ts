"use strict";

import * as ovh from "ovh";
import * as config from "../config/config-loader";
import * as messenger from "../platforms/messenger/messenger";
import User from "../models/users.model";

export default () => ({
  getAuth (req, res) {
    const senderId = req.query.state;
    let userInfos;

    return User.findOne({ senderId })
      .exec()
      .then((user: any) => {
        user.connected = true;
        user.consumerKey = user.consumerKeyTmp;
        userInfos = user;

        return user.save();
      })
      .then(() => {
        const cfg = config.load();
        const ovhClient = ovh({
          appKey: cfg.ovh.appKey,
          appSecret: cfg.ovh.appSecret,
          consumerKey: userInfos.consumerKey
        });

        return ovhClient.requestPromised("GET", "/me");
      })
      .then((meInfos) => {
        welcome(senderId, meInfos, userInfos.platform);
        return res.render("authorize", { user: meInfos });
      })
      .catch((err) => {
        const errorApi = res.error(403, err);
        User.remove({ senderId });

        return res.status(errorApi.statusCode).json(err);
      });
  }
});

function welcome (senderId, meInfos, platform) {
  switch (platform) {
  case "facebook_messenger":
    messenger
        .sendTextMessage(
          senderId,
          `Tu es bien connecté sous le nic ${meInfos.nichandle} :)
Pour l'instant je ne peux te répondre que sur des informations concernant un dysfonctionnement sur ton site web.
Voici des exemples de questions que tu peux me poser :
  • Mon site ne fonctionne plus
  • J'ai un problème sur mon site ovh.com
  • Peux-tu m'aider à réparer mon site ?
  • Comment je fais pour changer mes serveurs dns de ma zone exemple.ovh ?
  • Comment je peux faire pointer mon domaine exemple.ovh sur mon hébergement web ?
    `
        )
        .then(() => messenger.sendTextMessage(senderId, "Rassure toi je vais apprendre à t'aider sur d'autres sujets dans un avenir proche :)"))
        .catch(console.error);
    break;
  default:
  }
}
