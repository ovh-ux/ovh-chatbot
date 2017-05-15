"use strict";

const Bluebird = require("bluebird");
const slack = require("../platforms/slack/slack");
const SlackModel = require("../models/slack.models");
const config = require("../config/config-loader").load();
const bot = require("../bots/hosting")();
const request = require("request-promise");
const responsesCst = require("../constants/responses").FR;
const apiai = require("../utils/apiai");
const { camelCase } = require("lodash");
const { ButtonsListMessage, Button } = require("../platforms/generics");

module.exports = () => {

  return {
    receiveMessage(req, res) {
      let message;
      let channel;

      if (req.body.token && req.body.challenge && req.body.type === "url_verification") {
        return res.json({ challenge: req.body.challenge });
      }

      if (!req.body.event.user || req.body.event.subtype === "bot_message") {
        return;
      }

      message = req.body.event.text;
      channel = req.body.event.channel;

      Bluebird.props({
        apiai: apiai.textRequestAsync(message, { sessionId: channel }),
        slack: slack(req.body.team_id)
      }).then((resp) => {
        let needFeedback = false;

        if (resp.apiai.status && resp.apiai.status.code === 200 && resp.apiai.result) {
          if (resp.apiai.result.action === "connection" || resp.apiai.result.action === "welcome" ) {
            return resp.slack.sendTextMessage(channel, `Pour te connecter il te suffit de <${config.server.url}${config.server.basePath}/authorize?state=${channel}-slack|cliquer ici.>
Pour l'instant je ne peux te répondre que sur des informations concernant un dysfonctionnement sur ton site web.
  Voici des exemples de questions que tu peux me poser :
    • Mon site ne fonctionne plus
    • J'ai un problème sur mon site ovh.com
    • Peux-tu m'aider à réparer mon site ?
    • Comment je fais pour changer mes serveurs dns de ma zone exemple.ovh ?
    • Comment je peux faire pointer mon domaine exemple.ovh sur mon hébergement web ?`)
              .then(res.logger.info)
              .catch(res.logger.error);
          }

          if (resp.apiai.result.fulfillment && resp.apiai.result.fulfillment.speech && Array.isArray(resp.apiai.result.fulfillment.messages) && resp.apiai.result.fulfillment.messages.length) {
            let smalltalk = resp.apiai.result.action && resp.apiai.result.action.indexOf("smalltalk") !== -1;
            let quickResponses = resp.apiai.result.fulfillment.messages;

            if (smalltalk && Math.floor((Math.random() * 2))) { //random to change response from original smalltalk to our custom sentence
              quickResponses = [{ speech: resp.apiai.result.fulfillment.speech }];
            }


            return sendQuickResponses(res, channel, quickResponses, resp.slack)
              .then(() => sendFeedback(res, channel, resp.apiai.result.action, message, resp.slack));
          }

          return bot.ask("message", channel, message, resp.apiai.result.action, resp.apiai.result.parameters, res)
            .then((answer) => {
              needFeedback = answer.feedback || needFeedback;

              return sendResponses(res, channel, answer.responses, resp.slack);
            })
            .then(() => {
              if (needFeedback) {
                return sendFeedback(res, channel, resp.apiai.result.action, message, resp.slack);
              }
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

    receiveActions(req, res) {
      const payload = JSON.parse(req.body.payload);
      const channel = payload.channel.id;
      const value = payload.actions[0].value;
      let slackClient;
      let needFeedback = false;

      Bluebird.props({
        bot: bot.ask("postback", channel, value, "", {}, res),
        slack: slack(payload.team.id)
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
      })
      .catch((err) => {
        res.logger.error(err);
        slack(payload.team.id)
          .then((slackClient) => slackClient.sendTextMessage(channel, `Oups ! ${err.message}`));
      });

      return res.status(200).end();
    },

    authorize(req, res) {
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
      }).then((resp) => {
        infos = resp;

        res.logger.info(resp);

        return SlackModel
          .where({ team_id: resp.team_id })
          .setOptions({ upsert: true })
          .update({
            "$set": resp
          })
          .exec();
      })
      .then(() => res.redirect(`https://${infos.team_name}.slack.com`))
      .catch((err) => {
        res.logger.error(err);
        res.status(403).json(err);
      });
    }
  };
};

function sendFeedback(res, senderId, intent, message, slack) {
  if (intent === "unknown") {
    return;
  }

  message = message.length >= 1000 ? "TOOLONG" : message;

  let buttons = [
    new Button("postback", `FEEDBACK_MISUNDERSTOOD_${camelCase(intent)}_${message}`, "Mauvaise compréhension"),
    new Button("postback", `FEEDBACK_BAD_${camelCase(intent)}_${message}`, "Non"),
    new Button("postback", `FEEDBACK_GOOD_${camelCase(intent)}_${message}`, "Oui")
  ];
  let buttonsList = new ButtonsListMessage("Est-ce que cette réponse vous a aidé ?", buttons);
  buttonsList.delete_original = true;

  return sendResponse(res, senderId, buttonsList, slack);
}

function sendQuickResponses(res, senderId, responses, slack) {
  return Bluebird.mapSeries(responses, (response) => {
    switch (response.type) {
    case 0:
      return sendResponse(res, senderId, response.speech, slack);
    default:
      return sendResponse(res, senderId, response.speech, slack);
    }
  });
}

function sendResponses(res, channel, responses, slack) {
  return Bluebird.mapSeries(responses, (response) => sendResponse(res, channel, response, slack));
}

function sendResponse(res, channel, response, slack) {
  return slack.send(channel, response);
}
