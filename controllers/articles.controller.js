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

exports.getArticles = (req, res, next) => {
  selectArticles()
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch(next);
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
