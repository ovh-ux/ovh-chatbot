"use strict";

const hosting = require("./hosting");
const feedback = require("./feedback");
const xdslBreak = require("./xdsl");
const telephony = require("./telephony");

module.exports = [...hosting, ...feedback, ...xdslBreak, ...telephony];
