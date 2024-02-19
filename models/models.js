const db = require('../db/connection')

exports.selectTopics = () => {
  return db.query('SELECT * FROM topics;')
  .then((result) => {
    return result.rows;
  });
}

exports.selectArticleById = (articleId) => {
  return db.query('SELECT * FROM articles WHERE article_id = $1;', [articleId])
  .then((result) => {
    if (result.rows.length === 0) {
      return Promise.reject({ status: 404, msg: 'Not Found'})
    }

    return result.rows[0];
  })
}
