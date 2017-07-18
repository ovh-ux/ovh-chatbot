"use strict";

function textMessageAdapter (message) {
  return {
    message,
    buttons: []
  };
}

function buttonAdapter (button) {
  return {
    message: null,
    buttons: [button]
  };
}

function buttonListAdapter (buttonList) {
  return {
    message: buttonList.text,
    buttons: buttonList.attachments.buttons || []
  };
}

module.exports = {
  textMessageAdapter,
  buttonAdapter,
  buttonListAdapter
};
