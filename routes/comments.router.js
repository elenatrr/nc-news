const commentRouter = require("express").Router();

const { deleteComment, patchComment } = require("../controllers/comments.controller");

commentRouter
  .route("/:comment_id")
  .delete(deleteComment)
  .patch(patchComment)
  .all((req, res) => {
    res.setHeader("Allow", "DELETE", "PATCH");
    res.status(405).send("Method Not Allowed");
  });

module.exports = commentRouter;
