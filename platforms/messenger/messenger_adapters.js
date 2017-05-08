"use strict";

const { BUTTON_TYPE } = require("../generics");

function textMessageAdapter(message) {
  return message.text;
}

function buttonAdapter(button) {
  switch (button.type) {
  case BUTTON_TYPE.POSTBACK:
  case BUTTON_TYPE.MORE:
    return {
      type: button.type,
      title: button.text,
      payload: button.value
    };
  case BUTTON_TYPE.URL:
    return {
      type: button.type,
      url: button.value,
      title: button.text
    };
  default:
    return button;
  }
}

function buttonsMessageAdapter(message) {
  return {
    template_type: "button",
    text: message.text,
    buttons: message.attachments.buttons.map(buttonAdapter)
  };
}

function elementAdapter(button) {
  return {
    title: button.title,
    buttons: [button]
  };
}

function buttonsListMessageAdapter(message) {
  let moreButtons = [];
  let eltButtons = message.attachments.buttons.filter((button) => {
    if (button.type !== BUTTON_TYPE.MORE) {
      return true;
    }

    button.type = BUTTON_TYPE.POSTBACK;
    moreButtons.push(button);
    return false;
  });

  return {
    template_type: "list",
    top_element_style: "compact",
    elements: eltButtons.map((button) => elementAdapter(buttonAdapter(button))),
    buttons: moreButtons
  };
}

module.exports = {
  textMessageAdapter,
  buttonAdapter,
  buttonsMessageAdapter,
  elementAdapter,
  buttonsListMessageAdapter
};
