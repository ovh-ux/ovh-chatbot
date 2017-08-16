"use strict";

const request = require("request");
const Bluebird = require("bluebird");
Bluebird.config({
  warnings: false
});
const fs = require("fs");
const path = require("path");

const cookie = process.env.APIAI_COOKIE;
const XSRF_TOKEN = cookie.match(/XSRF-TOKEN=(.*?);/g)[1];

const checkConnection = () => new Bluebird((resolve, reject) => request({
  uri: "https://console.api.ai/api-client/user/",
  headers: {
    cookie,
    "x-xsrf-token": XSRF_TOKEN
  },
  json: true
}, (err, res, body) => {
  if (err || res.statusCode !== 200) {
    console.log("APIAI: Auth failed!");
    console.log("\tMake sure you have the correct cookie in env");
    console.log("\tThis url: https://console.api.ai/api-client/user/ will provide the correct cookie");
    return reject(err || res.body);
  }
  console.log("APIAI: authentification is good!");
  console.log("\tYou are connected as", body.username);
  return resolve();
}));


const listAgents = () => new Bluebird((resolve, reject) => request({
  uri: "https://console.api.ai/api-client/agents/",
  headers: {
    cookie,
    "x-xsrf-token": XSRF_TOKEN
  },
  json: true
}, (err, res, body) => {
  if (err || res.statusCode !== 200) {
    return reject(err || res.body);
  }
  console.log("APIAI: got agent list");
  return resolve(body);
}));

const getDetails = (agentId) => new Bluebird((resolve, reject) => request({
  uri: `https://console.api.ai/api-client/agents/${agentId}`,
  headers: {
    cookie,
    "x-xsrf-token": XSRF_TOKEN
  },
  json: true
}, (err, res, body) => {
  if (err || res.statusCode !== 200) {
    return reject(err || res.body);
  }
  console.log("APIAI: got details for agentID:", agentId, "name:", body.agent.name, "language:", body.agent.language);
  return resolve(body);
}));

const uploadFile = (agentName, agentId, file, reset) => new Bluebird((resolve, reject) => request({
  uri: `https://console.api.ai/api/agent/?name=${agentName}${reset ? "&clear=true" : ""}`,
  method: "POST",
  headers: {
    cookie,
    authorization: `Bearer ${agentId}`
  },
  formData: {
    file: fs.createReadStream(file)
  }
}, (err, res, body) => {
  if (err || res.statusCode !== 200) {
    return reject(err || res.body);
  }
  console.log("APIAI: updated agent:", agentName, "with zip:", file);
  return resolve(body);
}));

module.exports = function (grunt) {
  grunt.registerMultiTask("upload", "upload to OVH agents", function () {
    let done = this.async();
    let srcDir = this.file.src;
    let filterFn = this.options().filter;
    let resetBot = this.options().reset;

    checkConnection()
      .then(() => listAgents())
      .then((json) => {
        let agentList = json.agents.filter(filterFn);
        return Bluebird.mapSeries(agentList, (agent) => getDetails(agent.id));
      })
      .then((agentArray) => Bluebird.mapSeries(agentArray, (agent) =>
          uploadFile(agent.agent.name, agent.agent.id, path.join(srcDir, `${agent.agent.language}.zip`), resetBot)))
      .then(() => done(true))
      .catch((err) => {
        console.error("APIAI ERROR:", err);
        done(false);
      });
  });
};
