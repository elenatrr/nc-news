const {
  selectCommentsByArticleId,
  addComment,
} = require("../models/comments.model");
const { selectArticleById } = require("../models/articles.model");
const { selectUser } = require("../models/users.model");

exports.getCommentsByArticleId = (req, res, next) => {
  const articleId = req.params.article_id;

  Promise.all([
    selectCommentsByArticleId(articleId),
    selectArticleById(articleId)
  ])
    .then((resolutions) => {
      res.status(200).send({ comments: resolutions[0] });
    })
    .catch(next);
};

exports.postComment = (req, res, next) => {
  const body = req.body;
  const articleId = req.params.article_id;

  Promise.all([
    selectUser(body.username),
    selectArticleById(articleId),
    addComment(body, articleId),
  ])
    .then((resolutions) => {
      res.status(201).send({ comment: resolutions[2] });
    })
    .catch(next);
};
