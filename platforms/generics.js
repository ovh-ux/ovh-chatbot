"use strict";

const responsesCst = require("../constants/responses").FR;
const v = require("voca");

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

    if (typeof text !== "string" || text === "") {
      throw new Error("Text should be a non-empty string");
    }
  }
}

class Button {
  constructor (type, value, text) {
    this.type = type;
    this.value = value;
    this.text = text || value;

    if (typeof type !== "string") {
      throw new Error("Type should be a value of BUTTON_TYPE");
    }
    if (typeof value !== "string" || value === "") {
      throw new Error("Value should be a non-empty string");
    }
  }
}

class ButtonsMessage {
  constructor (text, buttons) {
    this.text = text;

    if (typeof text !== "string") {
      throw new Error("Text should be a string");
    }

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

// used for navigating in a menu
class ButtonsListMessage {
  constructor (text, buttons) {
    this.text = text;

    if (typeof text !== "string") {
      throw new Error("Text should be a string");
    }

    if (!Array.isArray(buttons) || buttons.length <= 0 || !(buttons[0] instanceof Button)) {
      throw new Error("Buttons isn't correctly formated");
    }


    if (buttons.length > MAX_LIMIT + 1) {
      throw new Error("Buttons.length cant be greater than %d", MAX_LIMIT);
    }

    this.attachments = {
      buttons
    };
  }
}

class ListItem {
  constructor (title, text) {
    this.title = title;
    this.text = text;

    if (typeof text !== "string") {
      throw new Error("Text should be a string");
    }

    if (typeof title !== "string") {
      throw new Error("title should be a string");
    }
  }
}

class CardMessage {
  constructor (items, header = false, footerButton = null) {
    this.header = !!header; // is the first item an header ?

    if (!Array.isArray(items) || items.length <= 0 || !(items[0] instanceof ListItem)) {
      throw new Error("items isn't correctly formated");
    }

    // We dont support fb for now
    // if (items.length > 4) {
    //   throw new Error("Items shouldn't be longer than 4");
    // }

    this.attachments = {
      items,
      buttons: footerButton ? [footerButton] : []
    };
  }
}

function createPostBackList (text, listInfos, morePayload, offset, limit) {
  const buttons = listInfos.slice(offset, limit + offset);
  const moreButton = offset + limit >= listInfos.length ? null : new Button(BUTTON_TYPE.MORE, `${morePayload}_${offset + limit}`, v.sprintf(responsesCst.moreButton, listInfos.length - (offset + limit)));

  if (moreButton) {
    buttons.push(moreButton);
  }

  return new ButtonsListMessage(text, buttons);
}

module.exports = {
  TextMessage,
  Button,
  ButtonsMessage,
  ButtonsListMessage,
  ListItem,
  CardMessage,
  createPostBackList,
  BUTTON_TYPE,
  MAX_LIMIT
};
