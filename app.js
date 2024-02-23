const express = require("express");
const app = express();
const apiRouter = require("./routes/api.router");

app.use(express.json());

app.use("/api", apiRouter);

app.use((req, res, next) => {
  res.status(404).send({ msg: "Route not found" });
});

app.use((err, req, res, next) => {
  const knownErrors = ["22P02", "23502"];

  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else if (knownErrors.includes(err.code)) {
    res.status(400).send({ msg: "Bad request" });
  } else {
    console.error(err);
    res.status(500).send({ msg: "Internal server error" });
  }
});

module.exports = { app };
