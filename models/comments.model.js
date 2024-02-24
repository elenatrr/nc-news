const db = require("../db/connection");

exports.removeComment = (commentId) => {
  return db.query("DELETE FROM comments WHERE comment_id = $1", [commentId]);
};

exports.updateComment = (votes, commentId) => {
  return db
    .query(
      `UPDATE comments
    SET votes = votes + $1
    WHERE comment_id = $2
    RETURNING *;`,
      [votes, commentId]
    )
    .then((result) => {
      return result.rows[0];
    });
};
