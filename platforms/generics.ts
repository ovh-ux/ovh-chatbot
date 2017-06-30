"use strict";

export const BUTTON_TYPE = {
  URL: "web_url",
  POSTBACK: "postback",
  MORE: "postback_more"
};

export class TextMessage {
  text: string;

  constructor (text) {
    this.text = text;
  }
}

export class Button {
  type: string;
  value: string;
  text: string;

  constructor (type, value, text) {
    this.type = type;
    this.value = value;
    this.text = text;
  }
}

export class ButtonsMessage {
  text: string;
  attachments: { buttons: Array<Button> };

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

export class ButtonsListMessage {
  text: string;
  delete_original: boolean;
  attachments: { buttons: Array<Button> };

  constructor (text, buttons) {
    this.text = text;
    this.delete_original = false;

    if (!Array.isArray(buttons) || buttons.length <= 0 || !(buttons[0] instanceof Button)) {
      throw new Error("Buttons isn't correctly formated");
    }

    this.attachments = {
      buttons
    };
  }
}

export function createPostBackList (text, listInfos, morePayload, offset, limit) {
  const buttons = listInfos.slice(offset, limit + offset);
  const moreButton = offset + limit >= listInfos.length ? null : new Button(BUTTON_TYPE.MORE, `${morePayload}_${offset + limit}`, "Voir plus");

  if (moreButton) {
    buttons.push(moreButton);
  }

  return new ButtonsListMessage(text, buttons);
}
