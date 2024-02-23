const topicRouter = require("express").Router();
const { getTopics } = require("../controllers/topics.controller");

topicRouter
  .route("/")
  .get(getTopics)
  .all((req, res) => {
    res.setHeader("Allow", "GET");
    res.status(405).send("Method Not Allowed");
  });

module.exports = topicRouter;
