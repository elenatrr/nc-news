const articleRouter = require("express").Router();
const {
  getArticleById,
  getArticles,
  patchArticle,
  getCommentsByArticleId,
  postCommentByArticleId,
} = require("../controllers/articles.controller");

articleRouter
  .route("/")
  .get(getArticles)
  .all((req, res) => {
    res.setHeader("Allow", "GET");
    res.status(405).send("Method Not Allowed");
  });

articleRouter
  .route("/:article_id")
  .get(getArticleById)
  .patch(patchArticle)
  .all((req, res) => {
    res.setHeader("Allow", "GET", "PATCH");
    res.status(405).send("Method Not Allowed");
  });

articleRouter
  .route("/:article_id/comments")
  .get(getCommentsByArticleId)
  .post(postCommentByArticleId)
  .all((req, res) => {
    res.setHeader("Allow", "GET", "POST");
    res.status(405).send("Method Not Allowed");
  });

module.exports = articleRouter;
