const {
  selectArticleById,
  selectArticles,
  editArticle,
} = require("../models/articles.model");

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

  selectArticleById(articleId)
    .then(() => {
      return editArticle(body, articleId);
    })
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};
