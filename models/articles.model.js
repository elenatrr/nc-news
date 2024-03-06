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

exports.selectArticles = (topic, sortedBy, order, limit, page) => {
  const offset = (page - 1) * limit;
  let queryString = `SELECT articles.article_id, title, topic, articles.author, articles.created_at, articles.votes, article_img_url,
  CAST(COUNT(comments.comment_id) AS INTEGER) AS comment_count
  FROM articles LEFT JOIN comments
  ON articles.article_id = comments.article_id`;
  const queryParams = [limit, offset];

  if (topic) {
    queryString += " WHERE articles.topic = $3";
    queryParams.push(topic);
  }

  queryString += ` GROUP BY articles.article_id ORDER BY ${sortedBy} ${order} LIMIT $1 OFFSET $2`;
  return db.query(queryString, queryParams).then((result) => {
    return result.rows;
  });
};

exports.getTotalArticleCount = (topic) => {
  let queryString = "SELECT COUNT(*) AS total_count FROM articles";
  const queryParams = [];

  if (topic) {
    queryString += " WHERE articles.topic = $1;";
    queryParams.push(topic);
  }

  return db.query(queryString, queryParams).then((result) => {
    return result.rows[0].total_count;
  });
};

exports.updateArticle = (votes, articleId) => {
  return db
    .query(
      `UPDATE articles
      SET votes = votes + $1
      WHERE article_id = $2
      RETURNING *;`,
      [votes, articleId]
    )
    .then((result) => {
      return result.rows[0];
    });
};

exports.selectCommentsByArticleId = (articleId) => {
  return db
    .query(
      "SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC;",
      [articleId]
    )
    .then((result) => {
      return result.rows;
    });
};

exports.addCommentByArticleId = (comment, articleId) => {
  return db
    .query(
      "INSERT INTO comments (author, body, article_id) VALUES ($1, $2, $3) RETURNING *",
      [comment.username, comment.body, articleId]
    )
    .then((result) => {
      return result.rows[0];
    });
};

exports.addArticle = (article) => {
  return db
    .query(
      "INSERT INTO articles (title, topic, author, body, article_img_url) VALUES ($1, $2, $3, $4, $5) RETURNING *;",
      [
        article.title,
        article.topic,
        article.author,
        article.body,
        article.article_img_url,
      ]
    )
    .then((result) => {
      const articleId = result.rows[0].article_id;
      return db.query(
        `SELECT articles.*,
        CAST(COUNT(comments.comment_id) AS INTEGER) AS comment_count
        FROM articles LEFT JOIN comments
        ON articles.article_id = comments.article_id
        WHERE articles.article_id = $1
        GROUP BY articles.article_id;`,
        [articleId]
      );
    })
    .then((result) => {
      return result.rows[0];
    });
};
