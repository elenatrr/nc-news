const express = require('express');
const app = express();
const {
  getTopics,
  getEndpoints,
  getArticleById,
  handleNonExist
} = require('./controllers/controllers')

app.get('/api/topics', getTopics)

app.get('/api', getEndpoints)

app.get('/api/articles/:article_id', getArticleById)

app.all('/*', handleNonExist)

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg })
  }

  if (err.code === '22P02') {
    res.status(400).send({ msg: 'Bad request' })
  }
})

module.exports = { app }