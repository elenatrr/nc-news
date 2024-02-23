const { selectUsers, selectUser } = require("../models/users.model");
const { checkExists } = require("../db/seeds/utils");

exports.getUsers = (req, res, next) => {
  selectUsers()
    .then((users) => {
      res.status(200).send({ users });
    })
    .catch(next);
};

exports.getUser = (req, res, next) => {
  const username = req.params.username;
  Promise.all([
    checkExists("users", "username", username),
    selectUser(username),
  ])
    .then((resolutions) => {
      res.status(200).send({ user: resolutions[1] });
    })
    .catch(next);
};
