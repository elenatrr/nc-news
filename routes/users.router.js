const userRouter = require("express").Router();
const { getUsers, getUser } = require("../controllers/users.controller");

userRouter
  .route("/")
  .get(getUsers)
  .all((req, res) => {
    res.setHeader("Allow", "GET");
    res.status(405).send("Method Not Allowed");
  });

userRouter
  .route("/:username")
  .get(getUser)
  .all((req, res) => {
    res.setHeader("Allow", "GET");
    res.status(405).send("Method Not Allowed");
  });

module.exports = userRouter;
