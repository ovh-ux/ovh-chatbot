"use strict";
module.exports = function (app) {
  app.get("/mon/ping", function(req, res) {
    return res.status(200).end(null);
  });
};
