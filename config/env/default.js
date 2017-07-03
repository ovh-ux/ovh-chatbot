"use strict";

module.exports = {
  name: "ovh-chatbot",
  mongo: {
    url: process.env.MONGO || "mongodb://mongo:27017",
    debug: false
  },
  ovh: {
    appKey: process.env.OVH_KEY,
    appSecret: process.env.OVH_SECRET
  },
  apiai: {
    token: process.env.APIAI_TOKEN
  },
  graylog: {
    host: "discover.logs.ovh.com",
    port: 12202,
    token: process.env.GRAYLOG_TOKEN
  },
  ndhURL: process.env.NDH_URL,
  ndhTOKEN: process.env.NDH_TOKEN
};
