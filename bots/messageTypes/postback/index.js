"use strict";

const hosting = require("./hosting");
const feedback = require("./feedback");

module.exports = [...hosting, ...feedback];
