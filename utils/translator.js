"use strict";

const { vprintf } = require("voca");
const _ = require("lodash");

module.exports = function translator (key, locale, ...replacements) {
  let translation;

  if (!locale) {
    throw new Error("No locale specified");
  }

  try {
    translation = _.get(require(`../translations/translation_${locale}.json`), key);
  } catch (err) {
    // The file doesnt exist
    console.error(`err: ${err},\n failed translating to ${locale}, resolving to default: "en_US"`);
  }

  if (!translation) {
    // if no translation is provided, we resolved to the default.
    translation = _.get(require("../translations/translation_en_US.json"), key);
  }
  return vprintf(translation, replacements);
};
