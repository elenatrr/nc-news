const express = require("express");
const app = express();
const { getArticleById, getArticles } = require("./controllers/articles.controller");
const { getCommentsByArticleId, postComment } = require("./controllers/comments.controller");
const { getTopics } = require("./controllers/topics.controller")
const { getEndpoints } = require("./controllers/endpoints.controller")
const { handleNonExist } = require('./controllers/non-exist-route.controller')

app.use(express.json());

app.get("/api/topics", getTopics);

app.get("/api", getEndpoints);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);

app.post("/api/articles/:article_id/comments", postComment);

app.all("/*", handleNonExist);

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  }

  if (err.code === "22P02" || err.code === "23502") {
    res.status(400).send({ msg: "Bad request" });
  }
});

module.exports = { app };
