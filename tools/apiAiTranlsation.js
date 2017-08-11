"use strict";

const fs = require("fs-extra");
const path = require("path");
const _ = require("lodash");

module.exports = function (grunt) {
  grunt.registerMultiTask("apiai2json", "converts API AI file into JSON key:value", function () {
    let outputJSON = {};
    let templateJSON = {
      entities: {},
      intents: {}
    };

    const parseEntities = (match, group1, group2) => `<@${_.findKey(outputJSON, (value) => value === group1) || group1}|${_.findKey(outputJSON, (value) => value === group2) || group2}|`;

    let dest = this.file.dest;
    this.files.forEach((file) => {
      file.src.forEach((src) => {
        let i = 0;
        let lang = path.basename(src, ".json");
        let inputJSON = JSON.parse(fs.readFileSync(src));
        let entities = inputJSON.entities;
        let intents = inputJSON.intents;
        Object.keys(entities).forEach((key) => {
          outputJSON[++i] = key;
          templateJSON.entities[i] = entities[key].map((value) => {
            outputJSON[++i] = value;
            return i;
          });
        });

        Object.keys(intents).forEach((key) => {
          outputJSON[++i] = key;
          templateJSON.intents[i] = {};
          Object.assign(templateJSON.intents[i], intents[key], {
            userSays: intents[key].userSays.map((value) => {
              outputJSON[++i] = value.replace(/\<\@(.+?)\|(.+?)\|/g, parseEntities);
              return i;
            }),
            responses: intents[key].responses.map((value) => {
              outputJSON[++i] = value;
              return i;
            })
          });
        });

        fs.ensureDirSync(dest);
        fs.ensureDirSync(path.join(dest, "translations"));

        fs.writeJsonSync(path.join(dest, "translations", `apiai_${lang}.json`), outputJSON);
        console.log(lang, "done:", src, ">>>", path.join(dest, "translations", `translate_${lang}.json`));
      });
    });
    fs.writeJsonSync(path.join(dest, "template.json"), templateJSON);
    console.log("> Template created at:", path.join(dest, "template.json"));

  });

  grunt.registerMultiTask("json2apiai", "Converts json trad to apiai", function () {
    if (!this.options().template) {
      throw new Error("Template path not specified!");
    }
    let templateString = fs.readFileSync(this.options().template, "utf8");
    console.log("> Using template from:", this.options().template);


    this.files.forEach((file) => {
      let dest = file.dest;
      file.src.forEach((src) => {
        let lang = path.basename(src, ".json").replace(/^.*?_/, "");
        let translationJSON = JSON.parse(fs.readFileSync(src));

        const parseEntities = (match, p1) => JSON.stringify(translationJSON[p1].replace(/\<\@(\d+)\|(\d+)\|/g, (match2, find1, find2) => `<@${translationJSON[find1]}|${translationJSON[find2]}|`));

        let copy = templateString.replace(/\"(\d+)\"/g, "$1").replace(/\s+(\d+)/g, (match, p1) => ` ${parseEntities(match, p1)}`);

        fs.ensureDirSync(dest);
        fs.writeJsonSync(path.join(dest, `${lang}.json`), JSON.parse(copy));
        console.log(lang, "done:", src, ">>>", path.join(dest, `${lang}.json`));
      });
    });
  });
};
