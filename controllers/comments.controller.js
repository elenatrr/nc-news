const {
  selectCommentsByArticleId
} = require("../models/comments.model");

exports.getCommentsByArticleId = (req, res, next) => {
  const articleId = req.params.article_id;
  selectCommentsByArticleId(articleId)
  .then((comments) => {
    res.status(200).send({ comments });
  })
  .catch(next);
}