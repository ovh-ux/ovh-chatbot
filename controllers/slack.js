"use strict";

const Bluebird = require("bluebird");
const slackSDK = require("../platforms/slack/slack");
const SlackModel = require("../models/slack.models");
const config = require("../config/config-loader").load();
const bot = require("../bots/common")();
const request = require("request-promise");
const responsesCst = require("../constants/responses").FR;
const apiai = require("../utils/apiai");
const { camelCase } = require("lodash");
const { TextMessage, ButtonsListMessage, Button, BUTTON_TYPE } = require("../platforms/generics");

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

    Bluebird.props({
      apiai: apiai.textRequestAsync(message, { sessionId: channel }),
      slack: slackSDK(req.body.team_id)
    })
      .then((resp) => {
        let needFeedback = false;

        if (resp.apiai.status && resp.apiai.status.code === 200 && resp.apiai.result) {
          if (resp.apiai.result.action === "connection" || resp.apiai.result.action === "welcome") {
            const accountLinkButton = new Button(BUTTON_TYPE.URL, `${config.server.url}${config.server.basePath}/authorize?state=${channel}-slack-${req.body.team_id}`, responsesCst.signIn);
            return sendResponse(res, channel, new TextMessage(responsesCst.welcome), resp.slack)
              .then(() => sendResponse(res, channel, new ButtonsListMessage("", [accountLinkButton]), resp.slack));
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

          return bot
            .ask("message", channel, message, resp.apiai.result.action, resp.apiai.result.parameters, res)
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
              resp.slack.send(channel, `Oups ! ${err.message}`);
            });
        }

        return resp.slack.send(channel, responsesCst.noIntent);
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

    return Bluebird.props({
      bot: bot.ask(BUTTON_TYPE.POSTBACK, channel, value, "", {}, res),
      slack: slackSDK(payload.team.id)
    })
      .then((responses) => {
        slackClient = responses.slack;
        needFeedback = responses.bot.feedback || needFeedback;

        return sendResponses(res, channel, responses.bot.responses, slackClient, message_ts);
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

function sendFeedback (res, senderId, intent, messageRaw, slack) {
  const message = messageRaw.length >= config.maxMessageLength ? config.maxMessageLengthString : messageRaw;

  if (intent === "unknown") {
    return null;
  }

  const buttons = [
    new Button(BUTTON_TYPE.POSTBACK, `FEEDBACK_MISUNDERSTOOD_${camelCase(intent)}_${message}`, responsesCst.feedbackBadUnderstanding),
    new Button(BUTTON_TYPE.POSTBACK, `FEEDBACK_BAD_${camelCase(intent)}_${message}`, responsesCst.feedbackNo),
    new Button(BUTTON_TYPE.POSTBACK, `FEEDBACK_GOOD_${camelCase(intent)}_${message}`, responsesCst.feedbackYes)
  ];
  const buttonsList = new ButtonsListMessage(responsesCst.feedbackHelp, buttons);
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

function sendResponses (res, channel, responses, slack, message_ts) {
  return Bluebird.mapSeries(responses, (response, index) =>
    Bluebird.resolve(response)
      .then((resp) => Array.isArray(resp) ? sendResponses(res, channel, resp, slack, message_ts) : sendResponse(res, channel, resp, slack, index === 0 ? message_ts : null)));
}

function sendResponse (res, channel, response, slack, message_ts) {
  return slack.send(channel, response, message_ts)
    .then((result) => !result.ok ? console.error(result.error) : console.log(`Sucessfully sent ${result.ts} to ${result.channel}`));
}
