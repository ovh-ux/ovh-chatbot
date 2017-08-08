"use strict";

const { camelCase } = require("lodash");
const translator = require("../utils/translator");
const config = require("../config/config-loader").load();

const BUTTON_TYPE = {
  URL: "web_url",
  POSTBACK: "postback",
  MORE: "postback_more",
  ACCOUNT_LINKING: "account_link"
};

// Slack allow 5 buttons max (ie: 4 buttons + 1 button "more"), Reference : https://api.slack.com/docs/interactive-message-field-guide#attachment_fields
// Facebook allow 11 quick replies max (ie: 10 quick replies + 1 reply "more")
const MAX_LIMIT = 4;

class TextMessage {
  constructor (text) {
    this.text = text;
  }
}

class Button {
  constructor (type, value, text) {
    this.type = type;
    this.value = value;
    this.text = text;
  }
}

class ButtonsMessage {
  constructor (text, buttons) {
    this.text = text;

    if (!Array.isArray(buttons) || buttons.length <= 0 || !(buttons[0] instanceof Button)) {
      throw new Error("Buttons isn't correctly formated");
    }

    // FB allow 3 buttons max, Reference: https://developers.facebook.com/docs/messenger-platform/send-api-reference/button-template
    if (buttons.length > 3) {
      throw new Error("Buttons cant be longer than 3");
    }

    this.attachments = {
      buttons
    };
  }
}

class ButtonsListMessage {
  constructor (text, buttons) {
    this.text = text;

    if (!Array.isArray(buttons) || buttons.length <= 0 || !(buttons[0] instanceof Button)) {
      throw new Error("Buttons isn't correctly formated");
    }

    this.attachments = {
      buttons
    };
  }
}

function createPostBackList (text, listInfos, morePayload, offset, limit, locale) {
  const buttons = listInfos.slice(offset, limit + offset);
  const moreButton = offset + limit >= listInfos.length ? null : new Button(BUTTON_TYPE.MORE, `${morePayload}_${offset + limit}`, translator("moreButton", locale, listInfos.length - (offset + limit)));


  if (limit > MAX_LIMIT) {
    throw new Error("Limit cant be greater than %d", MAX_LIMIT);
  }

  if (moreButton) {
    buttons.push(moreButton);
  }

  return new ButtonsListMessage(text, buttons);
}

function createFeedback (intent, messageRaw, locale) {
  const message = messageRaw.length >= config.maxMessageLength ? config.maxMessageLengthString : messageRaw;

  if (intent === "unknown") {
    return null;
  }

  const buttons = [
    new Button(BUTTON_TYPE.POSTBACK, `FEEDBACK_MISUNDERSTOOD_${camelCase(intent)}_${message}`, translator("feedbackBadUnderstanding", locale)),
    new Button(BUTTON_TYPE.POSTBACK, `FEEDBACK_BAD_${camelCase(intent)}_${message}`, translator("feedbackNo", locale)),
    new Button(BUTTON_TYPE.POSTBACK, `FEEDBACK_GOOD_${camelCase(intent)}_${message}`, translator("feedbackYes", locale))
  ];
  return new ButtonsListMessage(translator("feedbackHelp", locale), buttons);
}

module.exports = {
  TextMessage,
  Button,
  ButtonsMessage,
  ButtonsListMessage,
  createPostBackList,
  createFeedback,
  BUTTON_TYPE,
  MAX_LIMIT
};
