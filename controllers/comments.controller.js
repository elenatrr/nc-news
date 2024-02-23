const { removeComment, updateComment } = require("../models/comments.model");
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

exports.patchComment = (req, res, next) => {
  const votes = req.body.inc_votes;
  const commentId = req.params.comment_id;
  
  if (typeof votes !== "number") {
    return res.status(400).send({ msg: "Bad request" });
  }
  
  Promise.all([
    checkExists("comments", "comment_id", commentId),
    updateComment(votes, commentId),
  ])
    .then((resolutions) => {
      res.status(200).send({ comment: resolutions[1] });
    })
    .catch(next);
}
