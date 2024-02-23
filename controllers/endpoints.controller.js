const endpoints = require("../endpoints.json");

exports.getEndpoints = (_req, res, _next) => {
  res.status(200).send({ endpoints });
};
