const {
  selectCommentsByArticleId,
  addComment,
  removeComment,
} = require("../models/comments.model");
const { checkExists } = require("../db/seeds/utils");

exports.getCommentsByArticleId = (req, res, next) => {
  const articleId = req.params.article_id;

  Promise.all([
    selectCommentsByArticleId(articleId),
    checkExists("articles", "article_id", articleId),
  ])
    .then((resolutions) => {
      res.status(200).send({ comments: resolutions[0] });
    })
    .catch(next);
};

exports.postComment = async (req, res, next) => {
  try {
    const body = req.body;
    const articleId = req.params.article_id;

    if (!body.username) {
      return res.status(400).send({ msg: "Bad request" });
    }

    await Promise.all([
      checkExists("users", "username", body.username),
      checkExists("articles", "article_id", articleId),
    ]);

    const comment = await addComment(body, articleId);
    res.status(201).send({ comment });
  } catch (err) {
    next(err);
  }
};

exports.deleteComment = (req, res, next) => {
  const commentId = req.params.comment_id;
  Promise.all([
    checkExists("comments", "comment_id", commentId),
    removeComment(commentId),
  ])
    .then(() => {
      res.status(204).end();
    })
    .catch(next);
};
