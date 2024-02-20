const {
  selectCommentsByArticleId,
  addComment,
} = require("../models/comments.model");
const { selectArticleById } = require("../models/articles.model");

exports.getCommentsByArticleId = (req, res, next) => {
  const articleId = req.params.article_id;
  selectCommentsByArticleId(articleId)
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch(next);
};

exports.postComment = (req, res, next) => {
  const body = req.body;
  const articleId = req.params.article_id;
  return selectArticleById(articleId)
    .then(() => {
      return addComment(body, articleId);
    })
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
};
