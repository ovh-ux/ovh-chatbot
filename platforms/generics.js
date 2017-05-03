"use strict";

const BUTTON_TYPE = {
  URL: "web_url",
  POSTBACK: "postback",
  MORE: "postback_more"
};

class TextMessage {
  constructor(text) {
    this.text = text;
  }
}

class Button {
  constructor(type, value, text) {
    this.type = type;
    this.value = value;
    this.text = text;
  }
}

class ButtonsMessage {
  constructor(text, buttons) {
    this.text = text;

    if (!Array.isArray(buttons) || buttons.length <= 0 || !(buttons[0] instanceof Button)) {
      throw new Error("Buttons isn't correctly formated");
    }

    this.attachments = {
      buttons
    };
  }
}

class ButtonsListMessage {
  constructor(text, buttons) {
    this.text = text;

    if (!Array.isArray(buttons) || buttons.length <= 0 || !(buttons[0] instanceof Button)) {
      throw new Error("Buttons isn't correctly formated");
    }

    this.attachments = {
      buttons
    };
  }
}

function createPostBackList(text, listInfos, morePayload, offset, limit) {
  let buttons = listInfos.slice(offset, limit + offset);
  let moreButton = offset + limit >= listInfos.length ? null : new Button(BUTTON_TYPE.MORE, morePayload + "_" + (offset + limit), "Voir plus");
  
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
  createPostBackList,
  BUTTON_TYPE
};