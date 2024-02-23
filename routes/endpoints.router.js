const endpointRouter = require("express").Router();
const { getEndpoints } = require("../controllers/endpoints.controller");

endpointRouter
  .route("/")
  .get(getEndpoints)
  .all((req, res) => {
    res.setHeader("Allow", "GET");
    res.status(405).send("Method Not Allowed");
  });

module.exports = endpointRouter;
