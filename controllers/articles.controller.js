const {
  selectArticleById,
  selectArticles,
  updateArticle,
  selectCommentsByArticleId,
  addCommentByArticleId,
  addArticle
} = require("../models/articles.model");
const { checkExists } = require("../db/seeds/utils");

exports.getArticleById = (req, res, next) => {
  const articleId = req.params.article_id;

  selectArticleById(articleId)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

exports.getArticles = async (req, res, next) => {
  try {
    const validOrders = ["ASC", "DESC"];
    const validSortColumns = [
      "article_id",
      "title",
      "topic",
      "author",
      "created_at",
      "votes",
      "comment_count",
    ];
    const topic = req.query.topic;
    const sortedBy = req.query.sort_by || "created_at";
    const order = req.query.order ? req.query.order.toUpperCase() : "DESC";

    if (!validSortColumns.includes(sortedBy)) {
      return res.status(404).send({ msg: "Not found" });
    }

    if (!validOrders.includes(order)) {
      return res.status(400).send({ msg: "Bad request" });
    }

    if (topic) {
      await checkExists("topics", "slug", topic);
    }

    const articles = await selectArticles(topic, sortedBy, order);
    res.status(200).send({ articles });
  } catch (err) {
    next(err);
  }
};

exports.patchArticle = (req, res, next) => {
  const votes = req.body.inc_votes;
  const articleId = req.params.article_id;

  if (typeof votes !== "number") {
    return res.status(400).send({ msg: "Bad request" });
  }

  Promise.all([
    checkExists("articles", "article_id", articleId),
    updateArticle(votes, articleId),
  ])
    .then((resolutions) => {
      res.status(200).send({ article: resolutions[1] });
    })
    .catch(next);
};

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

exports.postCommentByArticleId = async (req, res, next) => {
  try {
    const body = req.body;
    const articleId = req.params.article_id;

    if (!body.username || !body.body) {
      return res.status(400).send({ msg: "Bad request" });
    }

    await Promise.all([
      checkExists("users", "username", body.username, true),
      checkExists("articles", "article_id", articleId),
    ]);

    const comment = await addCommentByArticleId(body, articleId);
    res.status(201).send({ comment });
  } catch (err) {
    next(err);
  }
};

exports.postArticle = (req, res, next) => {
  const body = req.body;

  if (!body.title || !body.topic || !body.author || !body.body || !body.article_img_url) {
    return res.status(400).send({ msg: "Bad request" });
  }

  Promise.all([checkExists("users", "username", body.author, true), checkExists("topics", "slug", body.topic, true), addArticle(body)])
    .then((resolutions) => {
      res.status(201).send({ article: resolutions[2] });
    })
    .catch(next);
};
