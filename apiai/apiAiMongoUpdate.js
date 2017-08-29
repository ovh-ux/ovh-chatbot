"use strict";

const config = require("../config/config-loader").load();
const Apiai = require("../models/apiai.model.js");
const mongo = require("../providers/orm/nosql/mongo");

let args = process.argv.slice(2);
let replace = false;
let locale;
let token;

if (args.length < 2) {
  return console.error(`Usage:

    $ node this/file locale token [-f|--force]

    Only enable force mode when you want to replace an existing value`);
}

locale = args[0];
token = args[1];

if (args.length === 3 && (args[2] === "-f" || args[2] === "--force")) {
  replace = true;
  console.warn("Replace mode enable");
}

mongo.connect(config.mongo);

return Apiai.findOne({ locale }).then((apiaiRaw) => {
  let apiai = apiaiRaw;
  if (apiaiRaw) {
    if (!replace) {
      throw new Error(`already found a token for locale: ${locale}`);
    }
    console.log("[--force mode enable]: replacing the existing value");
    apiai.token = token;
  } else {
    console.log("No token found, creating a new entry for:", locale);
    apiai = new Apiai({ locale, token });
  }
  return apiai.save();
})
.then(() => console.log("Update done"))
.then(() => mongo.close("SIGTERM"))
.then(() => process.exit(0))
.catch((err) => {
  console.error(err);
  process.exit(1);
});
