"use strict";

import SlackModel from "../models/slack.models";
import slackSDK from "../platforms/slack/slack";
import { ask } from "../bots/hosting";
import * as cfg from "../config/config-loader";
import { apiaiSdk as apiai } from "../utils/apiai";
import * as Bluebird from "bluebird";
import { FR as responsesCst } from "../constants/responses";
import { ButtonsListMessage, Button } from "../platforms/generics";
import { camelCase } from "lodash";
import * as request from "request-promise";
const config = cfg.load();

export default () => ({
  receiveMessage (req, res) {
    let message;
    let channel;

    if (req.body.token && req.body.challenge && req.body.type === "url_verification") {
      return res.json({ challenge: req.body.challenge });
    }

    if (!req.body.event.user || req.body.event.subtype === "bot_message") {
      return null;
    }

    message = req.body.event.text;
    channel = req.body.event.channel;

    Bluebird.props({
      apiai: apiai.textRequestAsync(message, { sessionId: channel }),
      slack: slackSDK(req.body.team_id)
    })
      .then((resp) => {
        let needFeedback = false;

        if (resp.apiai.status && resp.apiai.status.code === 200 && resp.apiai.result) {
          if (resp.apiai.result.action === "connection" || resp.apiai.result.action === "welcome") {
            return resp.slack
              .sendTextMessage(
                channel,
                `Pour te connecter il te suffit de <${config.server.url}${config.server.basePath}/authorize?state=${channel}-slack|cliquer ici.>
Pour l'instant je ne peux te répondre que sur des informations concernant un dysfonctionnement sur ton site web.
  Voici des exemples de questions que tu peux me poser :
    • Mon site ne fonctionne plus
    • J'ai un problème sur mon site ovh.com
    • Peux-tu m'aider à réparer mon site ?
    • Comment je fais pour changer mes serveurs dns de ma zone exemple.ovh ?
    • Comment je peux faire pointer mon domaine exemple.ovh sur mon hébergement web ?`
              )
              .then(() => resp.slack.sendTextMessage(channel, responsesCst.welcome_task))
              .then(res.logger.info)
              .catch(res.logger.error);
          }

          if (resp.apiai.result.fulfillment && resp.apiai.result.fulfillment.speech && Array.isArray(resp.apiai.result.fulfillment.messages) && resp.apiai.result.fulfillment.messages.length) {
            const smalltalk = resp.apiai.result.action && resp.apiai.result.action.indexOf("smalltalk") !== -1;
            let quickResponses = resp.apiai.result.fulfillment.messages;

            if (smalltalk && Math.floor(Math.random() * 2)) {
              // random to change response from original smalltalk to our custom sentence
              quickResponses = [{ speech: resp.apiai.result.fulfillment.speech, type: 0 }];
            }

            return sendQuickResponses(res, channel, quickResponses, resp.slack).then(() => sendFeedback(res, channel, resp.apiai.result.action, message, resp.slack));
          }

          return ask("message", channel, message, resp.apiai.result.action, resp.apiai.result.parameters, res)
            .then((answer) => {
              needFeedback = answer.feedback || needFeedback;

              return sendResponses(res, channel, answer.responses, resp.slack);
            })
            .then(() => {
              if (needFeedback) {
                return sendFeedback(res, channel, resp.apiai.result.action, message, resp.slack);
              }
              return null;
            })
            .catch((err) => {
              res.logger.error(err);
              resp.slack.sendTextMessage(channel, `Oups ! ${err.message}`);
            });
        }

        return resp.slack.sendTextMessage(channel, responsesCst.noIntent);
      })
      .catch(res.logger.error);

    return res.sendStatus(200);
  },

  receiveActions (req, res) {
    const payload = JSON.parse(req.body.payload);
    const channel = payload.channel.id;
    const value = payload.actions[0].value;
    let slackClient;
    let needFeedback = false;

    Bluebird.props({
      bot: ask("postback", channel, value, "", {}, res),
      slack: slackSDK(payload.team.id)
    })
      .then((responses) => {
        slackClient = responses.slack;
        needFeedback = responses.bot.feedback || needFeedback;

        return sendResponses(res, channel, responses.bot.responses, slackClient);
      })
      .then(() => {
        if (needFeedback) {
          return sendFeedback(res, channel, value, "message", slackClient);
        }

        return null;
      })
      .catch((err) => {
        res.logger.error(err);
        slackSDK(payload.team.id).then((uSlackClient) => uSlackClient.sendTextMessage(channel, `Oups ! ${err.message}`));
      });

    return res.status(200).end();
  },

  authorize (req, res) {
    let infos;

    return request({
      method: "GET",
      uri: "https://slack.com/api/oauth.access",
      qs: {
        client_id: config.slack.clientId,
        client_secret: config.slack.clientSecret,
        code: req.query.code
      },
      headers: {
        "content-type": "application/json;charset=utf-8"
      },
      json: true
    })
      .then((resp) => {
        infos = resp;

        res.logger.info(resp);

        return SlackModel.where("team_id").equals(resp.team_id)
          .setOptions({ upsert: true })
          .update({
            $set: resp
          })
          .exec();
      })
      .then(() => res.redirect(`https://${infos.team_name}.slack.com`))
      .catch((err) => {
        res.logger.error(err);
        res.status(403).json(err);
      });
  }
});

function sendFeedback (res, senderId, intent, messageRaw, slack) {
  const message = messageRaw.length >= 1000 ? "TOOLONG" : messageRaw;

  if (intent === "unknown") {
    return null;
  }

  const buttons = [
    new Button("postback", `FEEDBACK_MISUNDERSTOOD_${camelCase(intent)}_${message}`, "Mauvaise compréhension"),
    new Button("postback", `FEEDBACK_BAD_${camelCase(intent)}_${message}`, "Non"),
    new Button("postback", `FEEDBACK_GOOD_${camelCase(intent)}_${message}`, "Oui")
  ];
  const buttonsList = new ButtonsListMessage("Est-ce que cette réponse vous a aidé ?", buttons);
  buttonsList.delete_original = true;

  return sendResponse(res, senderId, buttonsList, slack);
}

function sendQuickResponses (res, senderId, responses, slack) {
  return Bluebird.mapSeries(responses, (response) => {
    switch (response.type) {
    case 0:
      return sendResponse(res, senderId, response.speech, slack);
    default:
      return sendResponse(res, senderId, response.speech, slack);
    }
  });
}

function sendResponses (res, channel, responses, slack) {
  return Bluebird.mapSeries(responses, (response) => sendResponse(res, channel, response, slack));
}

function sendResponse (_, channel, response, slack) {
  return slack.send(channel, response);
}
