"use strict";

const fs = require("fs-extra");
const path = require("path");
const _ = require("lodash");

module.exports = function (grunt) {

  grunt.registerMultiTask("zip2json", "extract JSON from folder", function () {
    let outputJSON = {
      entities: {},
      intents: {}
    };

    let dest = this.file.dest;
    this.files.forEach((file) => {
      let agentPath = file.src.find((srcPath) => srcPath.indexOf("agent.json") !== -1);
      let agentJSON = JSON.parse(fs.readFileSync(agentPath));
      dest = path.join(dest, `${agentJSON.language}.json`);
      console.log("destination:", dest);

      file.src.filter((srcPath) => srcPath.indexOf("intents") !== -1).forEach((src) => {
        let json = JSON.parse(fs.readFileSync(src));
        let key = path.basename(src, ".json");
        let intent = outputJSON.intents[key] = {};
        intent.userSays = _.flattenDeep(json.userSays.map((say) => say.data.map((ele) => ele.meta ? `<${ele.meta}|${ele.alias}|${ele.text}>` : ele.text).join("")));
        intent.responses = _.flattenDeep(json.responses.map((response) => response.messages.map((ele) => ele.speech)));
        intent.action = json.responses[0].action;
        intent.contextAdd = _.fromPairs(json.responses[0].affectedContexts.map((context) => [context.name, context.lifespan]));
        intent.contextNeed = json.contexts;
        intent.auto = json.auto;
        intent.priority = json.priority;
        console.log("(intent) processed src:", src);
      });
      file.src.filter((srcPath) => srcPath.indexOf("entities") !== -1).forEach((src) => {
        let json = JSON.parse(fs.readFileSync(src));
        let key = path.basename(src, ".json");
        outputJSON.entities[key] = _.flattenDeep(json.entries.map((entry) => entry.synonyms));
        console.log("(entites) processed src:", src);
      });
    });

    fs.ensureFileSync(dest);
    fs.writeJsonSync(dest, outputJSON);
  });

  function parseUserSays (userSays) {
    let string = userSays;
    let regx = /\<(\@.*?)\|(.*?)\|(.*?)\>/;
    let result = regx.exec(userSays);

    if (!result) {
      // no regex found => no entites
      return {
        data: [
          {
            text: string
          }
        ],
        isTemplate: false,
        count: 0
      };
    }

    let obj = {
      data: [],
      isTemplate: false,
      count: 0
    };

    while (result) {
      let start = string.substring(0, result.index);
      string = string.replace(regx, "").substring(result.index, string.length);

      if (start.length) {
        obj.data.push({
          text: start
        });
      }

      obj.data.push({
        text: result[3],
        alias: result[2],
        meta: result[1],
        userDefined: true
      });

      result = regx.exec(string);
    }

    if (string.length) {
      // we add the reminder
      obj.data.push({
        text: string
      });
    }
    return obj;

  }

  grunt.registerMultiTask("json2zip", "recompile folder from JSON", function () {
    this.files.forEach((file) => {
      let dest = file.dest;
      file.src.forEach((src) => {
        let lang = path.basename(src, ".json");
        let inputJSON = JSON.parse(fs.readFileSync(src));
        let destfolder = path.join(dest, lang);
        let destIntentfolder = path.join(destfolder, "intents");
        let destEntitesfolder = path.join(destfolder, "entities");

        fs.ensureDirSync(destfolder);
        fs.ensureDirSync(destEntitesfolder);
        fs.ensureDirSync(destIntentfolder);

        Object.keys(inputJSON.entities).forEach((key) => {
          let outputFile = path.join(destEntitesfolder, `${key}.json`);
          let outputJSON = {
            name: key,
            entries: [{
              value: key,
              synonyms: inputJSON.entities[key]
            }]
          };

          fs.writeJsonSync(outputFile, outputJSON);
        });

        Object.keys(inputJSON.intents).forEach((key) => {
          let outputFile = path.join(destIntentfolder, `${key}.json`);
          let intent = inputJSON.intents[key];
          let outputJSON = {
            userSays: intent.userSays.map(parseUserSays),
            name: key,
            auto: intent.auto,
            contexts: intent.contextNeed,
            priority: intent.priority,
            responses: [{
              action: intent.action,
              affectedContexts: Object.keys(intent.contextAdd).map((context) => ({
                name: context,
                lifespan: intent.contextAdd[context]
              })),
              messages: [{
                type: 0,
                speech: intent.responses
              }]
            }]
          };


          fs.writeJsonSync(outputFile, outputJSON);
        });

        // agent.json
        let agent = {
          language: lang,
          activeAssistantAgents: [
            "smalltalk-domain-new"
          ],
          googleAssistant: {
            googleAssistantCompatible: false,
            project: `ovh-chatbot-${lang}`,
            welcomeIntentSignInRequired: false
          },
          defaultTimezone: "CET"
        };

        fs.writeJsonSync(path.join(destfolder, "agent.json"), agent);
        console.log("processed: ", src);
      });
    });
  });
};
