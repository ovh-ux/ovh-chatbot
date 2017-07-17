"use strict";

const { BUTTON_TYPE } = require("../generics");
const responsesCst = require("../../constants/responses").FR;

function textMessageAdapter (channel, message, ts = "") {
  return {
    channel,
    ts,
    attachments: JSON.stringify([{
      author_name: "Assistant personnel OVH",
      author_icon: "https://www.ovh.com/fr/images/support/livechat/chatbot_20px.png",
      author_link: "https://www.ovh.com/manager/sunrise/uxlabs/#!/chatbot",
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

function listItemAdapter (item) {
  return {
    title: item.title,
    value: item.text,
    "short": item.text.length <= 27 // slack limit, tested empirically
  };
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
        author_icon: "https://www.ovh.com/fr/images/support/livechat/chatbot_20px.png",
        author_link: "https://www.ovh.com/manager/sunrise/uxlabs/#!/chatbot",
        text,
        callback_id: "button_list",
        attachment_type: "default",
        color: "#59d2ef",
        actions
      }
    ])
  };
}

function cardMessageAdapter (channel, card, ts = "") {
  let fields = card.attachments.items.map(listItemAdapter).filter((_, index) => !(card.header && index === 0));
  let actions = card.attachments.buttons.map(buttonAdapter).filter((button) => {
    if (typeof button === "string") {
      fields.push({ title: "", text: button, "short": true });
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
        author_icon: "https://www.ovh.com/fr/images/support/livechat/chatbot_20px.png",
        author_link: "https://www.ovh.com/manager/sunrise/uxlabs/#!/chatbot",
        title: card.header ? "" : card.attachments.items[0].title,
        text: card.header ? "" : card.attachments.items[0].text,
        attachment_type: "default",
        color: "#59d2ef",
        actions,
        fields
      }
    ])
  };
}

module.exports = {
  textMessageAdapter,
  buttonAdapter,
  buttonsMessageAdapter,
  cardMessageAdapter
};
