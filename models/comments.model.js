const db = require("../db/connection");
const { selectTopics, selectArticleById } = require('./models')

exports.selectCommentsByArticleId = (articleId) => {
  return selectArticleById(articleId)
    .then(() => {
      return db.query("SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC;", [articleId]);
    })
    .then((response) => {
      return response.rows;
    });
}
