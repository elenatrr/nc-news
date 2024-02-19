const {
  selectTopics,
} = require('../models/models')
const endpoints = require('../endpoints.json')

exports.getTopics = (req, res, next) => {
  selectTopics()
  .then((topics) => {
    res.status(200).send({ topics })
  })
  .catch(next)
}

exports.getEndpoints = (req, res, next) => {
  res.status(200).send( {endpoints} )
}

exports.handleNonExist = (req, res, next) => {
  res.status(404).send({ msg: 'Route not found' })
}