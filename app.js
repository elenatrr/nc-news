const express = require('express');
const app = express();
const {
  getTopics,
  getEndpoints,
  handleNonExist
} = require('./controllers/controllers')

app.use(express.json());

app.get('/api/topics', getTopics)

app.get('/api', getEndpoints)

app.all('/*', handleNonExist)

app.use((err, req, res, next) => {
})

module.exports = { app }