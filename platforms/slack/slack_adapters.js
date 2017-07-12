"use strict";

const { BUTTON_TYPE } = require("../generics");
const responsesCst = require("../../constants/responses").FR;

function textMessageAdapter (channel, message, ts = "") {
  return {
    channel,
    ts,
    attachments: JSON.stringify([{
      author_name: "Assistant personnel OVH",
      author_icon: "https://www.ovh.com/manager/web/images/logos/OVH-logo.png",
      author_link: "https://www.ovh.com",
      fallback: responsesCst.slackFallback,
      color: "#59d2ef",
      text: message.text || message
    }])
  };
}

function buttonAdapter (button) {
  switch (button.type) {
  case BUTTON_TYPE.ACCOUNT_LINKING:
  case BUTTON_TYPE.URL:
    return `<${button.value}|${button.text}>\t`;
  case BUTTON_TYPE.POSTBACK:
  case BUTTON_TYPE.MORE:
    return {
      type: "button",
      text: button.text,
      value: button.value,
      name: button.value
    };
  default:
    return button;
  }
}

function buttonsMessageAdapter (channel, buttonList, ts = "") {
  let text = `${buttonList.text}\n`;
  const actions = buttonList.attachments.buttons.map(buttonAdapter).filter((button) => {
    if (typeof button === "string") {
      text += button;
      return false;
    }

    return true;
  });

  return {
    channel,
    ts,
    attachments: JSON.stringify([
      {
        fallback: responsesCst.slackFallback,
        author_name: "Assistant personnel OVH",
        author_icon: "https://www.ovh.com/manager/web/images/logos/OVH-logo.png",
        author_link: "https://www.ovh.com",
        text,
        callback_id: "button_list",
        attachment_type: "default",
        color: "#59d2ef",
        actions
      }
    ])
  };
}

module.exports = {
  textMessageAdapter,
  buttonAdapter,
  buttonsMessageAdapter
};
