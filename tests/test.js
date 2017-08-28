"use strict";

const bot = require("../bots/common")();
const apiai = require("../utils/apiai");
const ApiaiModel = require("../models/apiai.model");
const config = require("../config/config-loader").load();
const mongo = require("../providers/orm/nosql/mongo");
const assert = require("chai").assert;
const _ = require("lodash");
const nock = require("nock");
const messenger = require("../platforms/messenger/messenger");
const web = require("../platforms/web/web");
const { TextMessage, ButtonsMessage, ButtonsListMessage, Button, BUTTON_TYPE } = require("../platforms/generics");
const logger = require("../providers/logging/logger");
logger.remove(logger.transports.Console); // To disbale logging messages

const APIAI_LANGS = ["fr_FR", "en_US"];
const NLP_TEST = [
  {
    message: "qui suis je ?",
    intent: "who_am_i"
  },
  {
    message: "est-ce que je suis connecté ?",
    intent: "who_am_i"
  },
  {
    message: "mon site est cassé",
    intent: "website_break"
  },
  {
    message: "mon site ne marche plus",
    intent: "website_break"
  },
  {
    message: "mon téléphone est cassé",
    intent: "telephony_break"
  },
  {
    message: "ma ligne adsl est cassé",
    intent: "xdsl_break"
  },
  {
    message: "se connecter",
    intent: "connection"
  },
  {
    message: "salut",
    intent: "welcome"
  }
];
const INTENT_TEST = [
  "dns_server_config", "domain_to_hosting", "telephony_break", "thanks", "website_break", "who_am_i", "xdsl_break"
];
const POSTBACK_TEST = [
  "FEEDBACK_GOOD_testIntent_testMessage", "FEEDBACK_BAD_testIntent_testMessage", "FEEDBACK_MISUNDERSTOOD_testIntent_testMessage",
  "HOSTING_SELECTED_testHosting", "ATTACHED_DOMAIN_SELECTED_testDomain_testSite", "MORE_ATTACHED_DOMAIN_testDomain_0", "MORE_HOSTING_0",
  "TELEPHONY_SELECTED_testPhony", "MORE_TELEPHONY_0", "XDSL_SELECTED_testXDSL", "XDSL_DIAG_testXDSL", "MORE_XDSL_0"
];
const GENERIC_TEXT_MSG = new TextMessage("TEST MESSAGE");
const GENERIC_BTNS_MSG = new ButtonsMessage("TEST MESSAGE",
  [
    new Button(BUTTON_TYPE.POSTBACK, "btn", "btn")
  ]);
const GENERIC_BTNS_LIST_MSG = new ButtonsListMessage("TEST MESSAGE",
  [
    new Button(BUTTON_TYPE.ACCOUNT_LINKING, "account_link", "btn"),
    new Button(BUTTON_TYPE.URL, "url", "btn"),
    new Button(BUTTON_TYPE.POSTBACK, "POSTBACK", "btn"),
    new Button(BUTTON_TYPE.MORE, "MORE", "btn")
  ]);

describe("chatbot", () => {
  before(() => {
    mongo.connect(config.mongo);
  });
  after(() => {
    mongo.close("SIGTERM");
  });

  describe("apiai", function () {
    this.slow(500);
    describe("NLP", () => NLP_TEST.forEach((test) => {
      it(`should get intent ${test.intent}`, () =>
        apiai.textRequestAsync(test.message, { sessionId: "test" }, "fr_FR")
          .then((apiaiResponse) => assert.equal(apiaiResponse.result.action, test.intent)));
    }));
  });

  describe("bot", function () {
    this.slow(500);
    describe("intent processing", () => INTENT_TEST.forEach((test) =>
        it(`should handle intent: ${test}`, () =>
          bot.ask("message", null, test, test, {}, null, "fr_FR")
            .then(({ responses }) => assert.isAtLeast(responses.length, 1)))));

    describe("postback processing", () => POSTBACK_TEST.forEach((postback) =>
       it(`should handle postback: ${postback}`, () =>
        bot.ask("postback", null, postback, postback, {}, null, "fr_FR")
          .then(({ responses }) => assert.isAtLeast(responses.length, 1)))));
  });

  describe("i18n", () => {
    let translation = require("../translations/translation_en_US.json");
    describe("Translation files", () => APIAI_LANGS.forEach((locale) =>
        it(`translation file should exist for ${locale}`, () => {
          let localeTranlation = require(`../translations/translation_${locale}.json`);
          assert.containsAllKeys(localeTranlation, _.keys(translation));
        })));

    describe("APIAI Tokens", () =>
      APIAI_LANGS.forEach((locale) =>
        it(`should have a token for ${locale}`, () =>
          ApiaiModel.findOne({ locale }).then((token) => assert.isNotNull(token.token)))));
  });

  describe("platforms", () => {
    describe("messenger", () => {
      beforeEach(() => {
        nock("https://graph.facebook.com")
        .post("/v2.6/me/messages")
        .query(true)
        .reply(200, {});

        nock("https://graph.facebook.com")
        .get("/v2.6/testuser")
        .query(true)
        .reply(200, {});
      });

      it("should get the user info", () => messenger.getUserProfile("testuser").then(() => assert.isOk(true)));
      it("should send a generic text message", () => messenger.send("testuser", GENERIC_TEXT_MSG).then(() => assert.isOk(true)));
      it("should send a generic Buttons message", () => messenger.send("testuser", GENERIC_BTNS_MSG).then(() => assert.isOk(true)));
      it("should send a generic ButtonsList message", () => messenger.send("testuser", GENERIC_BTNS_LIST_MSG).then(() => assert.isOk(true)));
    });
  });

  describe("web", () => {
    it("should send a generic text message", () => web.send(null, "testuser", GENERIC_TEXT_MSG).then(() => assert.isOk(true)));
    it("should send a generic Buttons message", () => web.send(null, "testuser", GENERIC_BTNS_MSG).then(() => assert.isOk(true)));
    it("should send a generic ButtonsList message", () => web.send(null, "testuser", GENERIC_BTNS_LIST_MSG).then(() => assert.isOk(true)));
  });

  describe("slack", () => {
    it("should execute (no test for now)", () => assert.isOk(true));
  });

});
