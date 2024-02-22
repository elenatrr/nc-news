const db = require("../db/connection");

exports.selectTopics = () => {
  return db.query("SELECT * FROM topics;").then((result) => {
    return result.rows;
  });
};

exports.selectArticleById = (articleId) => {
  return db
    .query(
      `SELECT articles.*,
      CAST(COUNT(comments.comment_id) AS INTEGER) AS comment_count
      FROM articles LEFT JOIN comments
      ON articles.article_id = comments.article_id
      WHERE articles.article_id = $1
      GROUP BY articles.article_id;`,
      [articleId]
    )
    .then((result) => {
      if (result.rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Not found" });
      }

      return result.rows[0];
    });
};

exports.selectArticles = (topic, sortedBy, order) => {
  let queryString = `SELECT articles.article_id, title, topic, articles.author, articles.created_at, articles.votes, article_img_url,
  CAST(COUNT(comments.comment_id) AS INTEGER) AS comment_count
  FROM articles LEFT JOIN comments
  ON articles.article_id = comments.article_id`;
  const queryParams = [];

  if (topic) {
    queryString += " WHERE articles.topic = $1";
    queryParams.push(topic);
  }

  queryString += ` GROUP BY articles.article_id ORDER BY ${sortedBy} ${order}`;

  return db.query(queryString, queryParams).then((response) => {
    return response.rows;
  });
};

exports.updateArticle = (votes, articleId) => {
  return db
    .query(
      `UPDATE articles
      SET votes = votes + $1
      WHERE article_id = $2
      RETURNING *;`,
      [votes.inc_votes, articleId]
    )
    .then((response) => {
      return response.rows[0];
    });
};
