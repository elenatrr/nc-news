const {
  selectArticleById,
  selectArticles,
  updateArticle,
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
  const body = req.body;
  const articleId = req.params.article_id;

  if (typeof body.inc_votes !== "number") {
    return res.status(400).send({ msg: "Bad request" });
  }

  Promise.all([
    checkExists("articles", "article_id", articleId),
    updateArticle(body, articleId),
  ])
    .then((resolutions) => {
      res.status(200).send({ article: resolutions[1] });
    })
    .catch(next);
};
