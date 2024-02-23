const { removeComment } = require("../models/comments.model");
const { checkExists } = require("../db/seeds/utils");

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
