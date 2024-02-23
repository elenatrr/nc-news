const userRouter = require("express").Router();
const { getUsers } = require("../controllers/users.controller");

userRouter.route("/").get(getUsers);

module.exports = userRouter;
