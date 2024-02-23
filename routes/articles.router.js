const articleRouter = require("express").Router();
const {
  getArticleById,
  getArticles,
  patchArticle,
  getCommentsByArticleId,
  postCommentByArticleId,
} = require("../controllers/articles.controller");

articleRouter.route("/").get(getArticles);

articleRouter.route("/:article_id").get(getArticleById).patch(patchArticle);

articleRouter
  .route("/:article_id/comments")
  .get(getCommentsByArticleId)
  .post(postCommentByArticleId);

module.exports = articleRouter;
