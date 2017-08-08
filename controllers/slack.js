"use strict";

const Bluebird = require("bluebird");
const slackSDK = require("../platforms/slack/slack");
const SlackModel = require("../models/slack.model");
const config = require("../config/config-loader").load();
const bot = require("../bots/common")();
const request = require("request-promise");
const apiai = require("../utils/apiai");
const { TextMessage, ButtonsListMessage, Button, createFeedback, BUTTON_TYPE } = require("../platforms/generics");
const ovh = require("../utils/ovh");
const translator = require("../utils/translator");
const logger = require("../providers/logging/logger");

function getUserLocale (senderId) {
  return ovh.getOvhClient(senderId)
    .then((ovhClient) => ovhClient.requestPromised("GET", "/me"))
    .then((meInfos) => meInfos.language)
    .catch(() => "en_US");
}


module.exports = () => ({
  receiveMessage (req, res) {
    let message;
    let channel;

    if (req.body.token && req.body.challenge && req.body.type === "url_verification") {
      return res.json({ challenge: req.body.challenge });
    }

    if (!req.body.event.user || req.body.event.subtype === "bot_message") {
      return res.status(200).end();
    }

    message = req.body.event.text;
    channel = req.body.event.channel;

    getUserLocale(channel)
      .then((locale) =>
        Bluebird.props({
          apiaiResponse: apiai.textRequestAsync(message, { sessionId: channel }, locale),
          slack: slackSDK(req.body.team_id),
          locale
        }))
      .then(({ apiaiResponse, slack, locale }) => {
        let needFeedback = false;

        if (apiaiResponse.status && apiaiResponse.status.code === 200 && apiaiResponse.result) {
          if (apiaiResponse.result.action === "connection" || apiaiResponse.result.action === "welcome") {
            const accountLinkButton = new Button(BUTTON_TYPE.URL, `${config.server.url}${config.server.basePath}/authorize?state=${channel}-slack-${req.body.team_id}`, translator("signIn", locale));
            return sendResponse(res, channel, new TextMessage(translator("welcome", locale)), slack)
              .then(() => sendResponse(res, channel, new ButtonsListMessage("", [accountLinkButton]), slack));
          }

          if (apiaiResponse.result.fulfillment && apiaiResponse.result.fulfillment.speech && Array.isArray(apiaiResponse.result.fulfillment.messages) && apiaiResponse.result.fulfillment.messages.length) {
            const smalltalk = apiaiResponse.result.action && apiaiResponse.result.action.indexOf("smalltalk") !== -1;
            let quickResponses = apiaiResponse.result.fulfillment.messages;

            if (smalltalk && Math.floor(Math.random() * 2)) {
              // random to change response from original smalltalk to our custom sentence
              quickResponses = [{ speech: apiaiResponse.result.fulfillment.speech, type: 0 }];
            }

            return sendQuickResponses(res, channel, quickResponses, slack).then(() => sendFeedback(res, channel, apiaiResponse.result.action, message, slack));
          }

          return bot
            .ask("message", channel, message, apiaiResponse.result.action, apiaiResponse.result.parameters, res)
            .then((answer) => {
              needFeedback = answer.feedback || needFeedback;

              return sendResponses(res, channel, answer.responses, slack);
            })
            .then(() => {
              if (needFeedback) {
                return sendFeedback(res, channel, apiaiResponse.result.action, message, slack);
              }
              return null;
            })
            .catch((err) => {
              res.logger.error(err);
              slack.send(channel, `Oups ! ${err.message}`);
            });
        }

        return slack.send(channel, translator("noIntent", locale));
      })
      .catch(res.logger.error);

    return res.status(200).end();
  },

  receiveActions (req, res) {
    const payload = JSON.parse(req.body.payload);
    const channel = payload.channel.id;
    const value = payload.actions[0].value;
    const message_ts = payload.message_ts;
    let slackClient;
    let needFeedback = false;

    // We have to respond with a 200 within 3000ms
    Bluebird.delay(2000).then(() => res.headersSent ? null : res.status(200).end());

    return getUserLocale(channel)
      .then((locale) =>
        Bluebird.props({
          botResut: bot.ask(BUTTON_TYPE.POSTBACK, channel, value, "", {}, res, locale),
          slackClient: slackSDK(payload.team.id)
        }))
      .then(({ botResut, slackClientLocal }) => {
        slackClient = slackClientLocal;
        needFeedback = botResut.feedback || needFeedback;

        return sendResponses(res, channel, botResut.responses, slackClient, message_ts);
      })
      .then(() => res.headersSent ? null : res.status(200).end())
      .then(() => {
        if (needFeedback) {
          return sendFeedback(res, channel, value, "message", slackClient);
        }

        return null;
      })
      .catch((err) => {
        res.logger.error(err);
        slackSDK(payload.team.id).then((uSlackClient) => uSlackClient.send(channel, `Oups ! ${err.message}`));
        return res.headersSent ? null : res.status(200).end();
      });

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

        return SlackModel.where({ team_id: resp.team_id })
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

function sendFeedback (res, senderId, intent, messageRaw, slack, locale) {
  return sendResponse(res, senderId, createFeedback(intent, messageRaw, locale), slack);
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

function sendResponses (res, channel, responses, slack, message_ts) {
  return Bluebird.mapSeries(responses, (response, index) =>
    Bluebird.resolve(response)
      .then((resp) => Array.isArray(resp) ? sendResponses(res, channel, resp, slack, message_ts) : sendResponse(res, channel, resp, slack, index === 0 ? message_ts : null)));
}

function sendResponse (res, channel, response, slack, message_ts) {
  return slack.send(channel, response, message_ts)
    .then((result) => !result.ok ? logger.error(result.error) : logger.debug(`Sucessfully sent ${result.ts} to ${result.channel}`));
}
