"use strict";

const dnsServerConfig = require("./dns_server_config");
const domainToHosting = require("./domain_to_hosting");
const thanks = require("./thanks");
const websiteBreak = require("./website_break");
const goodAnswer = require("./good_answer");
const ndhQuestion = require("./ndh_question");
const xdslBreak = require("./xdsl_break");
const whoami = require("./whoami");
const telephonyBreak = require("./telephony_break");
const statusUpdate = require("./status_update");
const serviceExpires = require("./service_expires");

module.exports = Object.assign({}, dnsServerConfig, domainToHosting, thanks, websiteBreak, goodAnswer, ndhQuestion, xdslBreak, whoami, telephonyBreak, statusUpdate, serviceExpires);
