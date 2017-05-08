"use strict";

const Bluebird = require("bluebird");
const slack = require("../platforms/slack/slack");
const SlackModel = require("../models/slack.models");
const config = require("../config/config-loader").load();
const wit = require("../utils/wit");
const bot = require("../bots/hosting")();
const request = require("request-promise");
const responsesCst = require("../constants/responses").FR;

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
        wit: wit.message(message, {}),
        slack: slack(req.body.team_id)
      }).then((resp) => {
        if (resp.wit.entities && Array.isArray(resp.wit.entities.intent) && resp.wit.entities.intent.length > 0) {
          if (resp.wit.entities.intent[0].value === "connection") {
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

          return bot.ask("message", channel, message, resp.wit.entities.intent[0].value, resp.wit.entities, res)
            .then((responses) => sendResponses(res, channel, responses, resp.slack))
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

      Bluebird.props({
        bot: bot.ask("postback", channel, value, "", {}, res),
        slack: slack(payload.team.id)
      })
      .then((responses) => sendResponses(res, channel, responses.bot, responses.slack))
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

function sendResponses(res, channel, responses, slack) {
  return Bluebird.mapSeries(responses, (response) => sendResponse(res, channel, response, slack));
}

function sendResponse(res, channel, response, slack) {
  return slack.send(channel, response);
}
