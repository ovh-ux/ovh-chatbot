"use strict";

const { emojify } = require("node-emoji");
const { BUTTON_TYPE } = require("../generics");
const responsesCst = require("../../constants/responses").FR;

function textMessageAdapter (channel, message, ts = "") {
  return {
    channel,
    ts,
    attachments: JSON.stringify([{
      author_name: responsesCst.slackAuthor,
      author_icon: responsesCst.slackImg,
      author_link: responsesCst.slackLink,
      fallback: responsesCst.slackFallback,
      color: responsesCst.slackColor,
      text: emojify(message.text || message)
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
      text: emojify(button.text),
      value: button.value,
      name: button.value
    };
  default:
    return button;
  }
}

function buttonsMessageAdapter (channel, buttonList, ts = "") {
  let text = emojify(`${buttonList.text}\n`);
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
        author_name: responsesCst.slackAuthor,
        author_icon: responsesCst.slackImg,
        author_link: responsesCst.slackLink,
        fallback: responsesCst.slackFallback,
        color: responsesCst.slackColor,
        text,
        callback_id: "button_list",
        attachment_type: "default",
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
