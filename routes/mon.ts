"use strict";
export default function (app) {
  app.get("/mon/ping", (req, res) => res.status(200).end(null));
};
