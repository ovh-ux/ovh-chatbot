"use strict";

const dnsServerConfig = require("./dns_server_config");
const domainToHosting = require("./domain_to_hosting");
const thanks = require("./thanks");
const websiteBreak = require("./website_break");
const goodAnswer = require("./good_answer");

module.exports = Object.assign({}, dnsServerConfig, domainToHosting, thanks, websiteBreak, goodAnswer);
