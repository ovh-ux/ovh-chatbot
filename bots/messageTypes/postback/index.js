"use strict";

const hosting = require("./hosting");
const feedback = require("./feedback");
const xdslBreak = require("./xdsl");

module.exports = [...hosting, ...feedback, ...xdslBreak];
