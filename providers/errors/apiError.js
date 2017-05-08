"use strict";

module.exports = (statusCode, message, data) => {
  if (typeof message === "object") {
    return { statusCode, message: message.data ? message.data.message || message.data : message.message || message };
  } else if (message instanceof Error) {
    return { statusCode, message: message.message };
  }

  return { statusCode, message, data };
};
