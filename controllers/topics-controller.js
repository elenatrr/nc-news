const {
  selectTopics,
} = require('../models/topics-models')

exports.getTopics = (req, res, next) => {
  selectTopics()
  .then((topics) => {
    res.status(200).send({ topics })
  })
  .catch(next)
}

exports.handleNonExist = (req, res, next) => {
  res.status(404).send({ msg: 'Route not found' })
}