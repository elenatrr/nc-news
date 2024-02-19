const express = require('express');
const app = express();
const {
  getTopics,
  handleNonExist
} = require('./controllers/topics-controller')

app.use(express.json());

app.get('/api/topics', getTopics)

app.all('/*', handleNonExist)

app.use((err, req, res, next) => {
})

module.exports = { app }