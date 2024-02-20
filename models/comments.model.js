const db = require("../db/connection");
const { selectTopics, selectArticleById } = require("./articles.model");
const { selectUser } = require("./users.model");

exports.selectCommentsByArticleId = (articleId) => {
  return selectArticleById(articleId)
    .then(() => {
      return db.query(
        "SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC;",
        [articleId]
      );
    })
    .then((response) => {
      return response.rows;
    });
};

exports.addComment = (comment, articleId) => {
  return selectUser(comment.username)
    .then(() => {
      return db.query(
        `INSERT INTO comments (author, body, article_id) VALUES ($1, $2, $3) RETURNING *`,
        [comment.username, comment.body, articleId]
      );
    })
    .then((response) => {
      return response.rows[0];
    });
};
